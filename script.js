const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main section[id]");
const contactForm = document.getElementById("contactForm");
const toastStack = document.getElementById("toastStack");
const configuredApiBaseUrl = window.PORTFOLIO_CONFIG?.apiBaseUrl?.replace(/\/+$/, "");

const showToast = (type, title, message) => {
    if (!toastStack) {
        return;
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-title">${title}</span>
        <span class="toast-message">${message}</span>
    `;

    toastStack.appendChild(toast);

    window.setTimeout(() => {
        toast.remove();
    }, 4500);
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("is-open");
        hamburger.setAttribute("aria-expanded", String(isOpen));
        document.body.classList.toggle("menu-open", isOpen);
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("is-open");
            hamburger.setAttribute("aria-expanded", "false");
            document.body.classList.remove("menu-open");
        });
    });
}

const setActiveLink = () => {
    const offset = window.scrollY + 140;

    sections.forEach((section) => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        const id = section.getAttribute("id");
        const link = document.querySelector(`.nav-link[href="#${id}"]`);

        if (!link) {
            return;
        }

        link.classList.toggle("active", offset >= top && offset < bottom);
    });
};

window.addEventListener("scroll", setActiveLink);
window.addEventListener("load", setActiveLink);

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.12
});

document.querySelectorAll(".trust-card, .fact-card, .skill-panel, .capability-card, .project-card, .timeline-item, .info-panel, .contact-form").forEach((element) => {
    element.classList.add("reveal");
    observer.observe(element);
});

if (contactForm) {
    const formNote = document.getElementById("formNote");

    const getApiUrl = () => {
        const isGitHubPages = window.location.hostname.endsWith("github.io");

        if (configuredApiBaseUrl && !configuredApiBaseUrl.includes("your-render-service")) {
            return `${configuredApiBaseUrl}/api/contact`;
        }

        if (isGitHubPages) {
            return null;
        }

        return "/api/contact";
    };

    const setFormNote = (message, tone = "") => {
        if (!formNote) {
            return;
        }

        formNote.textContent = message;
        formNote.classList.remove("is-error", "is-success");

        if (tone) {
            formNote.classList.add(`is-${tone}`);
        }
    };

    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const button = contactForm.querySelector("button");
        const originalText = button.textContent;
        const apiUrl = getApiUrl();
        const emailField = document.getElementById("email");
        const formData = {
            name: document.getElementById("name").value,
            email: emailField.value.trim(),
            subject: document.getElementById("subject").value,
            message: document.getElementById("message").value
        };

        if (!apiUrl) {
            setFormNote("Configuration API requise pour envoyer le formulaire.", "error");
            showToast("error", "Configuration requise", "Le backend de contact n'est pas encore configure pour cet environnement.");
            button.textContent = "Config API requise";
            window.setTimeout(() => {
                button.textContent = originalText;
            }, 2800);
            return;
        }

        if (!emailRegex.test(formData.email)) {
            setFormNote("Adresse email invalide. Verifiez le format avant d'envoyer.", "error");
            showToast("error", "Email invalide", "Le format de l'adresse email n'est pas valide.");
            emailField.focus();
            return;
        }

        button.disabled = true;
        button.textContent = "Envoi en cours...";
        setFormNote("Verification de l'adresse email et envoi du message...", "");

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Contact request failed");
            }

            contactForm.reset();
            setFormNote("Message envoye avec succes. Je vous repondrai des que possible.", "success");
            showToast("success", "Message envoye", "Votre message a bien ete transmis.");
            button.textContent = "Message envoye";
        } catch (error) {
            console.error(error);
            let buttonMessage = "Erreur, reessayez";
            let formMessage = "Une erreur est survenue pendant l'envoi du message.";

            if (
                error.message === "Configuration email manquante sur le serveur"
                || error.message === "Configuration Resend manquante sur le serveur"
            ) {
                buttonMessage = "Email non configure";
                formMessage = "Le service email n'est pas configure sur le serveur.";
            } else if (error.message === "Failed to fetch") {
                buttonMessage = "Backend inaccessible";
                formMessage = "Le backend de contact est inaccessible pour le moment.";
            } else if (error.message.includes("domaine email")) {
                buttonMessage = "Email invalide";
                formMessage = error.message;
            } else if (error.message.includes("adresse email")) {
                buttonMessage = "Email invalide";
                formMessage = error.message;
            }

            setFormNote(formMessage, "error");
            showToast("error", "Envoi impossible", formMessage);
            button.textContent = buttonMessage;
        }

        window.setTimeout(() => {
            button.disabled = false;
            button.textContent = originalText;
        }, 2800);
    });
}
