/**
 * Main Application Logic for Modern Flower Gift Experience
 */

document.addEventListener('DOMContentLoaded', () => {
    // Default Configuration
    const defaultConfig = {
        recipientName: "Flower For You",
        senderName: "Yours Forever ♥",
        anniversaryDate: "2024-02-14",
        letterBody: `From the moment you came into my life, everything turned brighter, warmer, and so much more meaningful.\n\nThese flowers are a reminder that just like them, my admiration, care, and love for you continue to grow every single day. No matter where life takes us, you will always be my favorite dream come true.\n\nThank you for being my peace, my smile, and my greatest blessing.`,
        polaroidCaption: "Forever with you ♥",
        photoType: "preset_romantic",
        customPhotoUrl: "",
        reasons: [
            "You are the sweetest part of every single day.",
            "Your smile brightens up my whole world instantly.",
            "You bring so much warmth, comfort, and joy into my life.",
            "Being with you feels like home and perfect peace.",
            "Every little moment with you is a cherished memory.",
            "I love your gentle heart, kindness, and beautiful laugh.",
            "I will choose you, love you, and treasure you always.",
            "Every single day with you is filled with light, laughter, and grace.",
            "Through every season of life, my heart belongs to you completely.",
            "You make ordinary moments feel like pure magic and poetry.",
            "Being with you gives me a peace that no one else ever could.",
            "You will always be my favorite hello and my sweetest thought.",
            "Thank you for being my peace, my smile, and my greatest blessing."
        ]
    };

    // Preset SVG Illustrations encoded as data URIs
    const photoPresets = {
        preset_romantic: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%232b1055"/><stop offset="50%" stop-color="%2375225b"/><stop offset="100%" stop-color="%23d46a6a"/></linearGradient><radialGradient id="sun" cx="50%" cy="60%" r="40%"><stop offset="0%" stop-color="%23ffdf9e"/><stop offset="50%" stop-color="%23f99f6b"/><stop offset="100%" stop-color="%23f99f6b" stop-opacity="0"/></radialGradient></defs><rect width="400" height="300" fill="url(%23g1)"/><circle cx="200" cy="180" r="100" fill="url(%23sun)"/><path d="M0 240 Q100 210 200 230 T400 240 L400 300 L0 300 Z" fill="%2312071f"/><circle cx="180" cy="180" r="18" fill="%2312071f"/><path d="M165 240 Q180 195 190 240 Z" fill="%2312071f"/><circle cx="215" cy="185" r="16" fill="%2312071f"/><path d="M205 240 Q215 200 230 240 Z" fill="%2312071f"/><path d="M190 205 Q200 210 205 205" stroke="%2312071f" stroke-width="4" stroke-linecap="round"/><circle cx="80" cy="60" r="1.5" fill="%23ffffff"/><circle cx="320" cy="40" r="2" fill="%23ffffff"/><circle cx="290" cy="90" r="1" fill="%23ffffff"/><path d="M195 140 Q200 132 205 140 Q200 150 195 140 Z" fill="%23ff5d8f"/></svg>`,
        
        preset_stargazing: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%"><defs><linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%230b091a"/><stop offset="60%" stop-color="%231a153a"/><stop offset="100%" stop-color="%23381a4d"/></linearGradient><radialGradient id="moon" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23ffffff"/><stop offset="80%" stop-color="%23fff1c5"/><stop offset="100%" stop-color="%23fff1c5" stop-opacity="0"/></radialGradient></defs><rect width="400" height="300" fill="url(%23sky)"/><circle cx="320" cy="70" r="35" fill="url(%23moon)"/><path d="M30 40 L35 45 M120 70 L125 75 M220 30 L225 35 M80 120 L83 123 M340 160 L343 163" stroke="%23fff" stroke-width="1.5"/><path d="M0 260 Q150 220 400 260 L400 300 L0 300 Z" fill="%23080512"/><circle cx="190" cy="210" r="16" fill="%23080512"/><circle cx="215" cy="214" r="14" fill="%23080512"/><path d="M175 270 Q190 225 205 270 Z" fill="%23080512"/><path d="M205 270 Q215 230 230 270 Z" fill="%23080512"/></svg>`,
        
        preset_bouquet: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%"><defs><radialGradient id="bg" cx="50%" cy="50%" r="60%"><stop offset="0%" stop-color="%233a1c28"/><stop offset="100%" stop-color="%23140910"/></radialGradient></defs><rect width="400" height="300" fill="url(%23bg)"/><circle cx="200" cy="140" r="55" fill="%23e6194b" opacity="0.9"/><circle cx="160" cy="130" r="45" fill="%23ff7597" opacity="0.85"/><circle cx="240" cy="135" r="48" fill="%23ff8da1" opacity="0.85"/><circle cx="200" cy="100" r="40" fill="%23ff4d6d" opacity="0.9"/><circle cx="190" cy="150" r="25" fill="%23ffd166" opacity="0.95"/><path d="M150 260 L200 170 L250 260 Z" fill="%232b1e1a"/><path d="M165 240 H235" stroke="%23f3c669" stroke-width="8"/></svg>`
    };

    // Load config from LocalStorage or URL Hash
    let currentConfig = loadConfiguration();

    // Elements
    const flowerCanvas = new FlowerCanvasEngine('flowerCanvas');
    const giftIntroStage = document.getElementById('giftIntroStage');
    const btnOpenGift = document.getElementById('btnOpenGift');
    const giftBoxWrapper = document.getElementById('giftBoxWrapper');
    const introRecipientHeading = document.getElementById('introRecipientHeading');
    const navRecipientName = document.getElementById('navRecipientName');

    const btnSoundToggle = document.getElementById('btnSoundToggle');
    const interactionHint = document.getElementById('interactionHint');

    const modalOverlay = document.getElementById('modalOverlay');
    const flowerPopupCard = document.getElementById('flowerPopupCard');
    const btnPopupClose = document.getElementById('btnPopupClose');
    const popupFlowerIcon = document.getElementById('popupFlowerIcon');
    const popupFlowerName = document.getElementById('popupFlowerName');
    const popupFlowerMeaning = document.getElementById('popupFlowerMeaning');
    const popupFlowerReason = document.getElementById('popupFlowerReason');

    const letterModal = document.getElementById('letterModal');
    const envelopeClosed = document.getElementById('envelopeClosed');
    const waxSeal = document.getElementById('waxSeal');
    const letterPaper = document.getElementById('letterPaper');
    const btnLetterClose = document.getElementById('btnLetterClose');
    const letterDisplaySalutation = document.getElementById('letterDisplaySalutation');
    const letterDisplayBody = document.getElementById('letterDisplayBody');
    const letterDisplaySignature = document.getElementById('letterDisplaySignature');

    const toastMsg = document.getElementById('toastMsg');

    // Flower Icon mappings
    const flowerIcons = {
        rose: '🌹',
        peony: '🌸',
        sunflower: '🌻',
        lavender: '🪻',
        sakura: '🌸',
        lotus: '🪷',
        tulip: '🌷'
    };

    // Apply config to UI
    applyConfiguration(currentConfig);

    // Flower Canvas Callback
    flowerCanvas.onFlowerClick = (flower) => {
        showFlowerDetail(flower);
    };

    // =========================================================================
    // EVENT LISTENERS
    // =========================================================================

    // 1. Open Gift Box
    function handleOpenGift() {
        if (giftIntroStage.classList.contains('opened')) return;

        window.romanticAudio.startBackgroundMusic();
        window.romanticAudio.playGiftUnwrapSound();
        btnSoundToggle.classList.add('playing');

        giftIntroStage.classList.add('opened');
        setTimeout(() => {
            flowerCanvas.startBlooming();
        }, 300);

        // Hide hint after 9 seconds
        setTimeout(() => {
            if (interactionHint) interactionHint.style.opacity = '0';
        }, 9000);
    }

    btnOpenGift.addEventListener('click', handleOpenGift);
    giftBoxWrapper.addEventListener('click', handleOpenGift);

    // 2. Sound Toggle
    btnSoundToggle.addEventListener('click', () => {
        window.romanticAudio.startBackgroundMusic();
        const isMuted = window.romanticAudio.toggleMute();
        if (isMuted) {
            btnSoundToggle.classList.remove('playing');
            showToast('Music muted');
        } else {
            btnSoundToggle.classList.add('playing');
            showToast('Music playing ♫');
        }
    });

    // 3. Flower Detail Popup
    function showFlowerDetail(flower) {
        window.romanticAudio.playPetalClickSound();
        popupFlowerIcon.textContent = flowerIcons[flower.type] || '🌸';
        popupFlowerName.textContent = flower.name;
        popupFlowerMeaning.textContent = `"${flower.meaning}"`;

        // Match reason from current config
        const reasonIdx = (flower.id - 1) % currentConfig.reasons.length;
        popupFlowerReason.textContent = currentConfig.reasons[reasonIdx] || flower.reason;

        modalOverlay.classList.add('active');
        flowerPopupCard.classList.add('active');
    }

    btnPopupClose.addEventListener('click', () => {
        closeAllModals();
    });

    // Backdrop overlay click to dismiss
    modalOverlay.addEventListener('click', () => {
        closeAllModals();
    });

    function closeAllModals() {
        modalOverlay.classList.remove('active');
        flowerPopupCard.classList.remove('active');
        letterModal.classList.remove('active');
    }

    // =========================================================================
    // CONFIGURATION & PERSISTENCE
    // =========================================================================

    function loadConfiguration() {
        // 1. Check URL hash first
        if (window.location.hash.startsWith('#data=')) {
            try {
                const encodedData = window.location.hash.substring(6);
                const decoded = JSON.parse(decodeURIComponent(escape(atob(encodedData))));
                return { ...defaultConfig, ...decoded };
            } catch (err) {
                console.error("Failed to parse URL config", err);
            }
        }

        // 2. Check LocalStorage
        const saved = localStorage.getItem('romantic_flower_gift_cfg');
        if (saved) {
            try {
                return { ...defaultConfig, ...JSON.parse(saved) };
            } catch (err) {
                console.error("Failed to parse local config", err);
            }
        }

        return { ...defaultConfig };
    }

    function applyConfiguration(cfg) {
        currentConfig = cfg;

        // Intro & Nav Names
        introRecipientHeading.textContent = cfg.recipientName || 'Flower For You';
        navRecipientName.textContent = cfg.recipientName || 'Flower For You';

        // Love Letter
        letterDisplaySalutation.textContent = 'My Dearest Love,';
        letterDisplayBody.textContent = cfg.letterBody;
        letterDisplaySignature.textContent = cfg.senderName || 'Yours Forever ♥';

        // Update flowers reasons in canvas engine
        if (flowerCanvas && flowerCanvas.flowers) {
            flowerCanvas.flowers.forEach((flower, idx) => {
                if (cfg.reasons[idx]) {
                    flower.reason = cfg.reasons[idx];
                }
            });
        }
    }

    // Toast Messenger
    let toastTimeout = null;
    function showToast(msg) {
        if (toastTimeout) clearTimeout(toastTimeout);
        toastMsg.textContent = msg;
        toastMsg.classList.add('show');
        toastTimeout = setTimeout(() => {
            toastMsg.classList.remove('show');
        }, 3200);
    }

    function escapeHtml(string) {
        return String(string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
});
