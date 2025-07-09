const express = require('express');
const router = express.Router();

router.use('/users', require('./users'));
router.use('/produits', require('./produits'));
router.use('/commandes', require('./commandes'));
router.use('/categories', require('./categories'));
router.use('/ligne_commandes', require('./ligne_commandes'));
router.use('/livraisons', require('./livraisons'));
router.use('/rapports', require('./rapports'));
router.use('/alerts_stock', require('./alertes_stock'));
module.exports = router;