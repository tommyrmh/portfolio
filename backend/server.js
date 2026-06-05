const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const CONTACT_TO = process.env.CONTACT_TO || EMAIL_USER;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

// Middleware
app.use(cors({
    origin(origin, callback) {
        if (!origin || ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error('CORS non autorise'));
    }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const createTransporter = () => {
    if (!EMAIL_USER || !EMAIL_PASS) {
        return null;
    }

    if (SMTP_HOST) {
        return nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: SMTP_SECURE,
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS
            }
        });
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });
};

const transporter = createTransporter();

const escapeHtml = (value = '') => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

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

    if (!transporter || !CONTACT_TO) {
        return res.status(500).json({
            success: false,
            message: 'Configuration email manquante sur le serveur'
        });
    }

    const safeName = escapeHtml(name.trim());
    const safeEmail = escapeHtml(email.trim());
    const safeSubject = escapeHtml((subject || '').trim());
    const safeMessage = escapeHtml(message.trim());

    // Configuration de l'email
    const mailOptions = {
        from: `"Portfolio TR Labs" <${EMAIL_USER}>`,
        to: CONTACT_TO,
        replyTo: email,
        subject: subject || `Nouveau message de ${name} - Portfolio`,
        text: `
Nom: ${name}
Email: ${email}
Sujet: ${subject || 'Non specifie'}

Message:
${message}
        `.trim(),
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
                    Nouveau message depuis votre Portfolio
                </h2>
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Nom:</strong> ${safeName}</p>
                    <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
                    <p><strong>Sujet:</strong> ${safeSubject || 'Non specifie'}</p>
                </div>
                <div style="background: #ffffff; padding: 20px; border-left: 4px solid #2563eb;">
                    <h3 style="margin-top: 0;">Message:</h3>
                    <p style="white-space: pre-wrap;">${safeMessage}</p>
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
    res.json({
        status: 'OK',
        message: 'Le serveur fonctionne!',
        emailConfigured: Boolean(transporter && CONTACT_TO),
        allowedOrigins: ALLOWED_ORIGINS
    });
});

// Demarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur demarre sur http://localhost:${PORT}`);
    console.log(`Test: http://localhost:${PORT}/api/health`);
    if (!transporter || !CONTACT_TO) {
        console.warn('Configuration email manquante: definissez EMAIL_USER et EMAIL_PASS.');
        return;
    }

    transporter.verify((error) => {
        if (error) {
            console.error('Echec verification SMTP:', error.message);
            return;
        }

        console.log(`Email configure: les messages seront envoyes vers ${CONTACT_TO}`);
    });
});
