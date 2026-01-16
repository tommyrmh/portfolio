const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration Nodemailer avec Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Route pour envoyer un email
app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            message: 'Veuillez remplir tous les champs requis'
        });
    }

    // Configuration de l'email
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: subject || `Nouveau message de ${name} - Portfolio`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
                    Nouveau message depuis votre Portfolio
                </h2>
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Nom:</strong> ${name}</p>
                    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                    <p><strong>Sujet:</strong> ${subject || 'Non specifie'}</p>
                </div>
                <div style="background: #ffffff; padding: 20px; border-left: 4px solid #2563eb;">
                    <h3 style="margin-top: 0;">Message:</h3>
                    <p style="white-space: pre-wrap;">${message}</p>
                </div>
                <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
                    Ce message a ete envoye depuis votre portfolio.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email envoye de ${name} (${email})`);
        res.json({
            success: true,
            message: 'Message envoye avec succes!'
        });
    } catch (error) {
        console.error('Erreur envoi email:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'envoi du message'
        });
    }
});

// Route de test
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Le serveur fonctionne!' });
});

// Demarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur demarre sur http://localhost:${PORT}`);
    console.log(`Test: http://localhost:${PORT}/api/health`);
});
