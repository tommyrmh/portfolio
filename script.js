const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main section[id]");
const contactForm = document.getElementById("contactForm");
const configuredApiBaseUrl = window.PORTFOLIO_CONFIG?.apiBaseUrl?.replace(/\/+$/, "");

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

    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const button = contactForm.querySelector("button");
        const originalText = button.textContent;
        const apiUrl = getApiUrl();
        const formData = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            subject: document.getElementById("subject").value,
            message: document.getElementById("message").value
        };

        if (!apiUrl) {
            button.textContent = "Config API requise";
            window.setTimeout(() => {
                button.textContent = originalText;
            }, 2800);
            return;
        }

        button.disabled = true;
        button.textContent = "Envoi en cours...";

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
            button.textContent = "Message envoye";
        } catch (error) {
            console.error(error);
            button.textContent = error.message === "Configuration email manquante sur le serveur"
                || error.message === "Configuration Resend manquante sur le serveur"
                ? "Email non configure"
                : error.message === "Failed to fetch"
                    ? "Backend inaccessible"
                : "Erreur, reessayez";
        }

        window.setTimeout(() => {
            button.disabled = false;
            button.textContent = originalText;
        }, 2800);
    });
}
