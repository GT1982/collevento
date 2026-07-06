Implement a dedicated tarot image preloading and caching system.

PROJECT CONTEXT

- Vite + React application.
- Tarot card browsing UI has already been refactored.
- Card metadata already exists.
- Each card contains an imagePath property.
- Session creation logic already exists.

GOAL

As soon as a tarot session is successfully created, start a background image preload process so that card images are already cached before the user opens a deck.

The preload process must never block rendering or user interaction.

====================================================
TASK 1 - CREATE TAROT IMAGE PRELOAD SERVICE
====================================================

Create a dedicated service:

src/services/tarotImagePreloader.ts

Expose:

startTarotImagePreload(cards)

The service must:

- Run completely asynchronously.
- Never block UI rendering.
- Be safe to call multiple times.
- Skip already cached images.
- Log preload status in development mode.

====================================================
TASK 2 - BATCH PRELOADING
====================================================

Do NOT preload all images simultaneously.

Implement batched loading.

Requirements:

- Batch size: 5 images.
- Wait for batch completion before starting the next.
- Continue in background until all images are processed.

Pseudo flow:

for each batch:
    preload images
    await completion
    continue

Benefits:

- Avoid network saturation.
- Reduce CPU spikes.
- Better mobile performance.

====================================================
TASK 3 - IMAGE PRELOADING
====================================================

Use browser Image objects.

Example approach:

const img = new Image();
img.src = imagePath;

Wait for:

- load
- error

Then continue.

Errors must never stop the preload process.

====================================================
TASK 4 - CACHE STORAGE API
====================================================

Implement persistent caching.

Create cache:

tarot-images-v1

Requirements:

- Before preloading, check if image already exists in cache.
- Skip cached images.
- Store successfully fetched images in cache.
- Reuse cache across sessions.

Preferred flow:

cache.match(imageUrl)

If exists:
    skip

Else:
    fetch
    cache.put(...)
    continue

====================================================
TASK 5 - FALLBACK SUPPORT
====================================================

If Cache Storage API is unavailable:

Fallback to standard browser image preloading.

Application must continue working normally.

====================================================
TASK 6 - REQUEST IDLE TIME
====================================================

Start preloading using requestIdleCallback when available.

Fallback:

setTimeout(...)

Goal:

Prioritize UI responsiveness over image downloads.

====================================================
TASK 7 - SESSION INTEGRATION
====================================================

Find the location where a tarot session is successfully created.

Immediately after successful session creation:

startTarotImagePreload(allTarotCards)

This must happen in the background.

Session creation flow must not wait for preload completion.

Example:

createSession()
  -> success
  -> trigger preload
  -> continue application normally

====================================================
TASK 8 - PREVENT DUPLICATE PRELOADS
====================================================

Implement internal protection:

If a preload process is already running:

- Do not start another one.
- Reuse existing preload state.

Avoid duplicate downloads.

====================================================
TASK 9 - PRIORITY LOADING
====================================================

Load images in this order:

1. Major Arcana
2. Minor Arcana

This ensures the most commonly used cards become available first.

====================================================
TASK 10 - VITE COMPATIBILITY
====================================================

Ensure compatibility with Vite asset handling.

Do not statically import all tarot images into the initial bundle.

Use existing imagePath values.

Avoid increasing bundle size.

====================================================
TASK 11 - DEVELOPMENT LOGGING
====================================================

In development mode only:

Log:

- preload started
- cache hit
- cache miss
- image loaded
- preload completed

Do not log in production.

====================================================
EXPECTED RESULT
====================================================

After session creation:

- Image preloading starts automatically.
- UI remains fully responsive.
- Images are downloaded progressively.
- Images are stored in browser cache.
- Opening a deck feels nearly instantaneous.
- Duplicate downloads are avoided.
- Existing tarot logic remains unchanged.
- No increase in initial page load time.