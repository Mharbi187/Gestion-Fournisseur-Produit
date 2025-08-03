const Rapport = require('../models/Rapport');
const PDFDocument = require('pdfkit'); // Example PDF library
const fs = require('fs');

// ADMIN: Generate PDF report (from document)
exports.generatePDFReport = async (req, res) => {
  try {
    const { typeRapport, periode } = req.body;
    
    // 1. Create PDF
    const doc = new PDFDocument();
    let pdfPath = `./reports/${Date.now()}_report.pdf`;
    doc.pipe(fs.createWriteStream(pdfPath));
    
    // 2. Add content based on report type
    doc.fontSize(25).text(`${typeRapport} - ${periode}`, { align: 'center' });
    doc.moveDown();
    
    // Add dynamic content based on report type
    if (typeRapport === 'Rapport de Vente') {
      doc.fontSize(16).text('Détails des ventes...');
      // Add sales data here
    }
    // Add other report types...
    
    doc.end();
    
    // 3. Save report record
    const rapport = new Rapport({
      typeRapport,
      periode,
      contenuPDF: pdfPath,
      generePar: req.user.userId
    });
    
    await rapport.save();
    
    res.status(201).json({
      success: true,
      message: 'Rapport généré avec succès',
      data: {
        id: rapport._id,
        downloadLink: `/api/rapports/${rapport._id}/download`
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du rapport',
      error: error.message
    });
  }
};

// FOURNISSEUR: Get sales statistics (from document)
exports.getSalesStats = async (req, res) => {
  try {
    // Get fournisseur's sales data
    const stats = await Commande.aggregate([
      { 
        $match: { 
          'produits.produit.fournisseur': req.user.userId,
          statutCommande: { $ne: 'Annulée' }
        } 
      },
      {
        $group: {
          _id: null,
          totalVentes: { $sum: "$totalCommande" },
          nombreCommandes: { $sum: 1 },
          produitsVendus: { $sum: { $size: "$produits" } }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalVentes: 0,
        nombreCommandes: 0,
        produitsVendus: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Keep existing methods with improved responses
exports.getRapports = async (req, res) => {
  try {
    const rapports = await Rapport.find().sort({ dategeneration: -1 });
    res.status(200).json({
      success: true,
      count: rapports.length,
      data: rapports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

exports.getRapportById = async (req, res) => {
  try {
    const rapport = await Rapport.findById(req.params.id);
    if (!rapport) {
      return res.status(404).json({
        success: false,
        message: 'Rapport non trouvé'
      });
    }
    res.status(200).json({
      success: true,
      data: rapport
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

exports.updateRapport = async (req, res) => {
  try {
    const updatedRapport = await Rapport.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedRapport) {
      return res.status(404).json({
        success: false,
        message: 'Rapport non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedRapport
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur de mise à jour',
      error: error.message
    });
  }
};

exports.deleteRapport = async (req, res) => {
  try {
    const rapport = await Rapport.findByIdAndDelete(req.params.id);
    if (!rapport) {
      return res.status(404).json({
        success: false,
        message: 'Rapport non trouvé'
      });
    }
    
    // Delete the PDF file
    if (fs.existsSync(rapport.contenuPDF)) {
      fs.unlinkSync(rapport.contenuPDF);
    }
    
    res.status(200).json({
      success: true,
      message: 'Rapport supprimé'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};