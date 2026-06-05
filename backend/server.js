const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || 'TR Labs <onboarding@resend.dev>';
const CONTACT_TO = process.env.CONTACT_TO;
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

const createResendClient = () => {
    if (!RESEND_API_KEY) {
        return null;
    }

    return new Resend(RESEND_API_KEY);
};

const resend = createResendClient();

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

    if (!resend || !CONTACT_TO || !RESEND_FROM) {
        return res.status(500).json({
            success: false,
            message: 'Configuration Resend manquante sur le serveur'
        });
    }

    const safeName = escapeHtml(name.trim());
    const safeEmail = escapeHtml(email.trim());
    const safeSubject = escapeHtml((subject || '').trim());
    const safeMessage = escapeHtml(message.trim());

    const emailPayload = {
        from: RESEND_FROM,
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
        const { error } = await resend.emails.send(emailPayload);

        if (error) {
            console.error('Erreur envoi email Resend:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'envoi du message'
            });
        }

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
        emailConfigured: Boolean(resend && CONTACT_TO && RESEND_FROM),
        emailProvider: 'resend',
        allowedOrigins: ALLOWED_ORIGINS
    });
});

// Demarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur demarre sur http://localhost:${PORT}`);
    console.log(`Test: http://localhost:${PORT}/api/health`);
    if (!resend || !CONTACT_TO || !RESEND_FROM) {
        console.warn('Configuration email manquante: definissez RESEND_API_KEY, RESEND_FROM et CONTACT_TO.');
        return;
    }

    console.log(`Email configure via Resend: les messages seront envoyes vers ${CONTACT_TO}`);
});
