const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Initialize Stripe with secret key
const getStripe = () => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  return stripe;
};

// Create a payment intent
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { amount, currency = 'tnd', metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Montant invalide'
      });
    }

    const stripe = getStripe();

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 1000), // Stripe expects amount in millimes for TND
      currency: currency.toLowerCase(),
      metadata: {
        userId: req.user.userId || req.user.id,
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Stripe error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du paiement',
      error: error.message
    });
  }
});

// Confirm payment and create order
router.post('/confirm-payment', protect, async (req, res) => {
  try {
    const { paymentIntentId, orderData } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'PaymentIntent ID requis'
      });
    }

    const stripe = getStripe();

    // Retrieve payment intent to verify status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Le paiement n\'a pas été effectué',
        status: paymentIntent.status
      });
    }

    // Payment successful - create order in database
    const Commande = require('../models/Commande');
    const Notification = require('../models/Notification');

    const order = new Commande({
      client: req.user.userId || req.user.id,
      produits: orderData.items.map(item => ({
        produit: item.productId || item._id,
        quantite: item.quantity,
        prixUnitaire: item.prix || item.price
      })),
      montantTotal: paymentIntent.amount / 1000, // Convert back from millimes
      statutPaiement: 'paye',
      methodePaiement: 'carte',
      stripePaymentId: paymentIntentId,
      adresseLivraison: orderData.shippingAddress,
      statutCommande: 'confirmee'
    });

    await order.save();

    // Create notification for user
    await Notification.createForUser(req.user.userId || req.user.id, {
      type: 'order',
      title: '✅ Paiement réussi!',
      message: `Votre commande #${order._id.toString().slice(-8).toUpperCase()} a été confirmée. Montant: ${(paymentIntent.amount / 1000).toFixed(2)} TND`,
      link: `/orders/${order._id}`
    });

    res.json({
      success: true,
      message: 'Paiement confirmé et commande créée',
      order: {
        id: order._id,
        montant: order.montantTotal,
        statut: order.statutCommande
      }
    });
  } catch (error) {
    console.error('Confirm payment error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la confirmation',
      error: error.message
    });
  }
});

// Get payment history for user
router.get('/history', protect, async (req, res) => {
  try {
    const Commande = require('../models/Commande');
    
    const payments = await Commande.find({
      client: req.user.userId || req.user.id,
      stripePaymentId: { $exists: true }
    })
    .sort({ createdAt: -1 })
    .select('montantTotal statutPaiement methodePaiement createdAt stripePaymentId');

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération',
      error: error.message
    });
  }
});

// Webhook for Stripe events (payment updates)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripe = getStripe();
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (endpointSecret) {
      const sig = req.headers['stripe-signature'];
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      event = req.body;
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
