document.addEventListener('DOMContentLoaded', () => {
    // --- Mouse Click Ripple Effect ---
    const rippleEffect = document.getElementById('click-ripple');

    if (rippleEffect) {
        document.addEventListener('click', (e) => {
            // Check if the clicked element or its parent is a link
            let targetElement = e.target;
            let isLink = false;
            while (targetElement != null) {
                if (targetElement.tagName === 'A') {
                    isLink = true;
                    break;
                }
                targetElement = targetElement.parentElement;
            }

            if (isLink) {
                return; // Don't show ripple for link clicks
            }

            const rect = document.body.getBoundingClientRect(); // Use body for page-relative coords
            const x = e.clientX - rect.left; // x position within the element.
            const y = e.clientY - rect.top;  // y position within the element.

            rippleEffect.style.left = `${x}px`;
            rippleEffect.style.top = `${y}px`;

            // Create a new ripple element for each click to allow multiple ripples
            const newRipple = document.createElement('div');
            newRipple.id = 'click-ripple'; // Keep same ID for styling, but it's a new element
            newRipple.style.left = `${x - 15}px`; // Adjust for ripple size (15 is half of 30px)
            newRipple.style.top = `${y - 15}px`;  // Adjust for ripple size
            newRipple.style.width = '30px';
            newRipple.style.height = '30px';
            newRipple.style.animation = 'none'; // Reset animation
            newRipple.style.opacity = '1'; // Start visible before animation

            document.body.appendChild(newRipple);

            // Trigger reflow to restart animation
            void newRipple.offsetWidth;

            newRipple.style.animation = 'ripple-animation 0.6s linear';

            // Remove ripple after animation
            newRipple.addEventListener('animationend', () => {
                if (newRipple.parentNode) {
                    newRipple.parentNode.removeChild(newRipple);
                }
            });
        });
    }

    // --- Carousel Functionality ---
    if (document.querySelector('.carousel')) {
        const carousels = document.querySelectorAll('.carousel');

        // Define parameters for proportional styling
        const MAIN_CARD_SCALE = 1.0;
        const MIN_CARD_SCALE = 0.85;
        const MAIN_CARD_BRIGHTNESS = 1.0;
        const MIN_CARD_BRIGHTNESS = 0.85;
        // New: Parameters for dynamic margins
        const MAIN_CARD_HORIZONTAL_MARGIN = 7; // e.g., 15px on each side for "main" cards
        const MIN_CARD_HORIZONTAL_MARGIN = -50;   // e.g., 5px on each side for "far" cards
        // New: Max z-index for the base (non-hovered) main card
        const MAX_BASE_Z_INDEX = 10; // e.g., main card is 10, adjacent are 9, next are 8, etc.

        carousels.forEach(carousel => {
            const cards = Array.from(carousel.querySelectorAll('.card'));
            if (cards.length === 0) return;

            let targetAlignmentX = 0;
            const wrapper = carousel.closest('.carousel-section-wrapper');
            if (wrapper) {
                const wrapperStyle = window.getComputedStyle(wrapper);
                targetAlignmentX = parseFloat(wrapperStyle.paddingLeft);
            } else {
                targetAlignmentX = carousel.getBoundingClientRect().left - parseFloat(window.getComputedStyle(carousel).paddingLeft);
            }

            const maxInfluenceDistance = carousel.offsetWidth || window.innerWidth;
            let mainCardIndex = -1; // To store the array index of the mainSelectedCard

            function updateCardStyles() {
                let mainSelectedCard = null;
                let minDistanceToAlignmentGuide = Infinity;

                // Pass 1: Find the mainSelectedCard and its array index
                cards.forEach((card, index) => {
                    const cardRect = card.getBoundingClientRect();
                    const distance = Math.abs(cardRect.left - targetAlignmentX);
                    if (distance < minDistanceToAlignmentGuide) {
                        minDistanceToAlignmentGuide = distance;
                        mainSelectedCard = card;
                        mainCardIndex = index; // Store the index of the main card
                    }
                });

                // Pass 2: Apply styles to all cards
                if (mainSelectedCard) { // Proceed only if a main card is identified
                    cards.forEach((card, index) => {
                        const cardRect = card.getBoundingClientRect();
                        const distanceToGuide = Math.abs(cardRect.left - targetAlignmentX);

                        let currentScale, currentBrightness, currentMargin;
                        const normalizedDistance = Math.min(distanceToGuide / maxInfluenceDistance, 1);

                        // Calculate positional distance (0 for main, 1 for adjacent, etc.)
                        const positionalDistanceFromMain = Math.abs(index - mainCardIndex);
                        // Calculate z-index: main card gets MAX_BASE_Z_INDEX, others decrease
                        // Ensure z-index is at least 1
                        const currentZIndex = Math.max(1, MAX_BASE_Z_INDEX - positionalDistanceFromMain);
                        card.style.zIndex = currentZIndex;

                        if (card === mainSelectedCard) {
                            currentScale = MAIN_CARD_SCALE;
                            currentBrightness = MAIN_CARD_BRIGHTNESS;
                            currentMargin = MAIN_CARD_HORIZONTAL_MARGIN;
                            // z-index is already set to MAX_BASE_Z_INDEX via the formula above
                        } else {
                            currentScale = MAIN_CARD_SCALE - (normalizedDistance * (MAIN_CARD_SCALE - MIN_CARD_SCALE));
                            currentBrightness = MAIN_CARD_BRIGHTNESS - (normalizedDistance * (MAIN_CARD_BRIGHTNESS - MIN_CARD_BRIGHTNESS));
                            currentMargin = MAIN_CARD_HORIZONTAL_MARGIN - (normalizedDistance * (MAIN_CARD_HORIZONTAL_MARGIN - MIN_CARD_HORIZONTAL_MARGIN));

                            currentScale = Math.max(MIN_CARD_SCALE, currentScale);
                            currentBrightness = Math.max(MIN_CARD_BRIGHTNESS, currentBrightness);
                            currentMargin = Math.max(MIN_CARD_HORIZONTAL_MARGIN, currentMargin);
                        }

                        card.style.setProperty('--card-scale', currentScale);
                        card.style.setProperty('--card-brightness', currentBrightness);
                        card.style.marginLeft = `${currentMargin}px`;
                        card.style.marginRight = `${currentMargin}px`;

                        // The .is-main-active class is now less critical for z-index
                        // but can be kept for other specific non-proportional styles if needed.
                        if (card === mainSelectedCard) {
                            card.classList.add('is-main-active');
                        } else {
                            card.classList.remove('is-main-active');
                        }
                    });
                }
            }

            if (cards.length > 0) {
                requestAnimationFrame(updateCardStyles);
                carousel.addEventListener('scroll', () => requestAnimationFrame(updateCardStyles), { passive: true });
                window.addEventListener('resize', () => requestAnimationFrame(updateCardStyles));
            }
        });
    }
});