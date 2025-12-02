const Commande = require('../models/Commande');
const Livraison = require('../models/Livraison');
const LigneCommande = require('../models/LigneCommande');

// Helper to create livraison for an order
const createLivraisonForCommande = async (commande) => {
  try {
    // Check if livraison already exists for this commande
    const existingLivraison = await Livraison.findOne({ commande: commande._id });
    if (existingLivraison) {
      return existingLivraison;
    }
    
    // Create new livraison
    const livraison = new Livraison({
      commande: commande._id,
      client: commande.client,
      adresse: commande.adresseLivraison,
      dateExpedition: new Date(),
      dateLivraisonPrevue: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // +3 days
      statutLivraison: 'En Attente'
    });
    await livraison.save();
    return livraison;
  } catch (error) {
    console.error('Error creating livraison:', error);
    return null;
  }
};

// Helper to create lignes commande
const createLignesCommande = async (commande, produits) => {
  try {
    for (const item of produits) {
      const ligne = new LigneCommande({
        commande: commande._id,
        produit: item.produit,
        quantite: item.quantite,
        prixUnitaire: item.prixUnitaire,
        sousTotal: item.quantite * item.prixUnitaire
      });
      await ligne.save();
    }
  } catch (error) {
    console.error('Error creating lignes commande:', error);
  }
};

// ADMIN: Get all orders (from document)
exports.getAllCommandes = async (req, res) => {
  try {
    const commandes = await Commande.find().sort({ dateCommande: -1 });
    res.status(200).json({
      success: true,
      data: commandes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// CLIENT: Create order (from document)
exports.createCommande = async (req, res) => {
  try {
    const commandeData = req.body;
    commandeData.client = req.user.userId; // Add client ID from JWT
    
    const commande = new Commande(commandeData);
    await commande.save();
    
    // Create lignes commande if produits provided
    if (commandeData.produits && commandeData.produits.length > 0) {
      await createLignesCommande(commande, commandeData.produits);
    }
    
    // Create livraison record
    await createLivraisonForCommande(commande);
    
    res.status(201).json({
      success: true,
      data: commande
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur de création',
      error: error.message
    });
  }
};

// CLIENT: Get client's orders (from document)
exports.getClientCommandes = async (req, res) => {
  try {
    const commandes = await Commande.find({ client: req.user.userId })
      .sort({ dateCommande: -1 });
      
    res.status(200).json({
      success: true,
      data: commandes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// FOURNISSEUR: Get orders for fournisseur (from document)
exports.getFournisseurCommandes = async (req, res) => {
  try {
    // Assuming products in orders reference fournisseur
    const commandes = await Commande.find({
      'produits.produit.fournisseur': req.user.userId
    }).sort({ dateCommande: -1 });
    
    res.status(200).json({
      success: true,
      data: commandes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Keep your existing methods exactly as they were
exports.getCommandeById = async (req, res) => {
  try {
    const commande = await Commande.findOne({ numeroCommande: req.params.id });
    if (!commande) {
      return res.status(404).json({ 
        success: false,
        message: 'Commande non trouvée' 
      });
    }
    res.status(200).json({
      success: true,
      data: commande
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};

exports.updateStatutCommande = async (req, res) => {
  try {
    const { statutCommande } = req.body;
    const commande = await Commande.findOneAndUpdate(
      { numeroCommande: req.params.id },
      { statutCommande },
      { new: true, runValidators: true }
    );

    if (!commande) {
      return res.status(404).json({ 
        success: false,
        message: 'Commande non trouvée' 
      });
    }
    
    // Update livraison status based on order status
    const statusMap = {
      'en_attente': 'En Attente',
      'En attente': 'En Attente',
      'confirmee': 'En Attente',
      'Confirmé': 'En Attente',
      'en_preparation': 'En Attente',
      'En Préparation': 'En Attente',
      'expediee': 'En Transit',
      'Expédiée': 'En Transit',
      'livree': 'Livrée',
      'Livrée': 'Livrée',
      'annulee': 'En Attente',
      'Annulée': 'En Attente'
    };
    
    const livraisonStatus = statusMap[statutCommande] || 'En Attente';
    
    // Update or create livraison
    let livraison = await Livraison.findOne({ commande: commande._id });
    if (livraison) {
      livraison.statutLivraison = livraisonStatus;
      if (livraisonStatus === 'Livrée') {
        livraison.dateLivraisonEffective = new Date();
      }
      await livraison.save();
    } else {
      // Create livraison if it doesn't exist
      livraison = await createLivraisonForCommande(commande);
      if (livraison) {
        livraison.statutLivraison = livraisonStatus;
        await livraison.save();
      }
    }
    
    res.status(200).json({
      success: true,
      data: commande
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Erreur de mise à jour',
      error: error.message 
    });
  }
};

// ADMIN: Sync all existing commandes with livraisons
exports.syncLivraisons = async (req, res) => {
  try {
    const commandes = await Commande.find();
    let created = 0;
    let updated = 0;
    
    for (const commande of commandes) {
      let livraison = await Livraison.findOne({ commande: commande._id });
      
      // Determine livraison status based on commande status
      const statusMap = {
        'en_attente': 'En Attente',
        'En attente': 'En Attente',
        'confirmee': 'En Attente',
        'Confirmé': 'En Attente',
        'en_preparation': 'En Attente',
        'En Préparation': 'En Attente',
        'expediee': 'En Transit',
        'Expédiée': 'En Transit',
        'En Transit': 'En Transit',
        'livree': 'Livrée',
        'Livrée': 'Livrée',
        'annulee': 'En Attente',
        'Annulée': 'En Attente'
      };
      
      const livraisonStatus = statusMap[commande.statutCommande] || 'En Attente';
      
      if (!livraison) {
        // Create new livraison
        livraison = new Livraison({
          commande: commande._id,
          client: commande.client,
          adresse: commande.adresseLivraison,
          dateExpedition: commande.dateCommande || new Date(),
          dateLivraisonPrevue: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          statutLivraison: livraisonStatus
        });
        await livraison.save();
        created++;
      } else {
        // Update existing livraison
        livraison.statutLivraison = livraisonStatus;
        livraison.client = commande.client;
        livraison.adresse = commande.adresseLivraison;
        await livraison.save();
        updated++;
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Synchronisation terminée: ${created} livraisons créées, ${updated} mises à jour`,
      created,
      updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur de synchronisation',
      error: error.message
    });
  }
};