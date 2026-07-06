This project uses Vite + React and already contains working tarot reading logic, session management, card datasets, and backend integrations.

The goal is to completely redesign the tarot card selection UI to improve performance, reduce initial loading time, and create a much more immersive tarot experience.

IMPORTANT:
- Preserve all existing tarot reading logic.
- Preserve all existing session logic.
- Preserve all existing APIs and backend integrations.
- Preserve existing card data structures whenever possible.
- Focus only on refactoring the card selection experience and its performance.

====================================================
NEW USER EXPERIENCE
====================================================

Replace the current card selection grids with a deck-based experience.

Instead of displaying all cards immediately:

Display only two face-down deck cards:

1. Major Arcana
2. Minor Arcana

Each deck card should:
- Show a custom tarot card back design.
- Display the deck name.
- Display the number of cards in the deck.
- Have subtle hover animations.
- Have tap/click animations.
- Feel premium and mystical.

====================================================
DECK OPENING EXPERIENCE
====================================================

When the user clicks a deck:

- Open a fullscreen modal.
- Blur the background.
- Animate the modal entrance using fade + scale.
- Create the feeling that the deck is being opened on a tarot table.

Use Framer Motion for all animations.

====================================================
CARD BROWSING EXPERIENCE
====================================================

Inside the modal:

Replace the existing grid with an immersive tarot browsing interface.

Preferred layout:

A fan-shaped or curved card arrangement similar to how tarot readers spread cards on a table.

Requirements:

- Show approximately 7–9 cards simultaneously.
- Center card is larger and highlighted.
- Side cards are slightly smaller.
- Side cards partially overlap.
- Apply perspective/depth effects.
- Smooth transitions while browsing.

Navigation:

- Swipe on mobile.
- Mouse drag on desktop.
- Keyboard arrow navigation.
- Touch friendly.

Embla Carousel is preferred as the underlying carousel engine.

====================================================
CARD SELECTION EXPERIENCE
====================================================

When a user clicks a card:

1. Bring the card to the center.
2. Perform a smooth card flip animation.
3. Reveal the card face.
4. Slightly enlarge the selected card.
5. Show a confirmation button:

"Select this card"

Only after confirmation should the existing application logic continue.

====================================================
PERFORMANCE OPTIMIZATION
====================================================

Current problem:

All tarot cards are rendered immediately.

This must be removed.

Requirements:

- Never render the entire deck at once.
- Only render visible cards plus a small buffer.
- Target rendering window:
  - visible cards
  - 2–3 cards before
  - 2–3 cards after

Use virtualization techniques where appropriate.

====================================================
IMAGE LOADING OPTIMIZATION
====================================================

Do NOT preload all tarot card images.

The initial deck data should only contain metadata:

{
  id,
  name,
  deck,
  imagePath
}

Requirements:

- Images must be loaded only when needed.
- Use lazy loading.
- Use IntersectionObserver or equivalent.
- Preload only nearby cards:
  - 2–3 ahead
  - 2–3 behind
- Minimize initial network requests.
- Minimize bundle size.

If card images are currently imported statically, refactor them to load on demand.

====================================================
CODE SPLITTING
====================================================

The deck browsing system should not be included in the initial page bundle.

Use dynamic imports:

- DeckModal
- TarotCarousel
- TarotCardPreview
- Any heavy browsing components

Load them only when a user opens a deck.

Use React.lazy and Suspense.

====================================================
REACT OPTIMIZATION
====================================================

Apply React performance best practices:

- React.memo where beneficial.
- useMemo where appropriate.
- useCallback where appropriate.
- Prevent unnecessary re-renders.
- Avoid expensive calculations during render.

====================================================
ANIMATIONS
====================================================

Use Framer Motion.

Required animations:

Deck cards:
- hover
- tap
- subtle floating effect

Modal:
- fade in
- scale in

Cards:
- slide transitions
- depth effect
- flip reveal animation

Selection:
- smooth focus animation
- confirmation state animation

Animations should feel elegant, mystical, and premium.

====================================================
RESPONSIVE DESIGN
====================================================

Must work flawlessly on:

- mobile phones
- tablets
- desktop screens

Mobile experience is a priority.

The fan layout should adapt responsively while maintaining usability.

====================================================
ACCESSIBILITY
====================================================

Implement:

- keyboard navigation
- focus trapping inside modal
- ARIA labels
- accessible buttons
- screen-reader-friendly interactions

====================================================
EXPECTED RESULT
====================================================

The final experience should:

- Load significantly faster.
- Render dramatically fewer components.
- Avoid loading all tarot images initially.
- Reduce bundle size.
- Feel like browsing a real tarot deck.
- Provide a modern, immersive, magical tarot selection experience.
- Maintain full compatibility with the existing tarot reading and session workflow.