/**
 * Weight Tracker - Background Image Rotator
 * Fetches fitness/gym/muscle car images from Pexels and rotates them with crossfade effect
 */

const PEXELS_API_KEY = 'vTST9e7OjHJBkzipEIm5gFCofIiNeQ5XfRlPU8zk4yN7xLt5qRMv25Zu';
const SEARCH_TERM = 'muscle car';
const IMAGE_COUNT = 20;
const ROTATION_INTERVAL = 8000; // 8 seconds
const FADE_DURATION = 2000; // 2 seconds

let images = [];
let currentIndex = 0;
let bgLayer1, bgLayer2;
let isLayer1Active = true;

/**
 * Fetch images from Pexels API with random page
 */
async function fetchPexelsImages() {
    try {
        // Random page number (Pexels has many pages per search)
        const randomPage = Math.floor(Math.random() * 10) + 1;

        const response = await fetch(
            `https://api.pexels.com/v1/search?query=${SEARCH_TERM}&per_page=${IMAGE_COUNT}&page=${randomPage}&orientation=landscape`,
            {
                headers: {
                    Authorization: PEXELS_API_KEY
                }
            }
        );

        const data = await response.json();
        images = data.photos.map(photo => photo.src.large2x);

        // Shuffle the images array for extra randomness
        images = images.sort(() => Math.random() - 0.5);

        console.log(`✓ Loaded ${images.length} muscle car images from Pexels (page ${randomPage})`);

        // Start rotation
        if (images.length > 0) {
            initBackgroundLayers();
            startRotation();
        }
    } catch (error) {
        console.error('Failed to fetch Pexels images:', error);
    }
}

/**
 * Create two background layers for crossfade effect
 */
function initBackgroundLayers() {
    // Create layer 1
    bgLayer1 = document.createElement('div');
    bgLayer1.className = 'bg-layer bg-layer-1 active';
    bgLayer1.style.backgroundImage = `url(${images[0]})`;

    // Create layer 2
    bgLayer2 = document.createElement('div');
    bgLayer2.className = 'bg-layer bg-layer-2';

    // Add to body at the beginning
    document.body.insertBefore(bgLayer2, document.body.firstChild);
    document.body.insertBefore(bgLayer1, document.body.firstChild);
}

/**
 * Start the background rotation
 */
function startRotation() {
    setInterval(() => {
        // Move to next image
        currentIndex = (currentIndex + 1) % images.length;

        // Determine which layer to update
        const activeLayer = isLayer1Active ? bgLayer1 : bgLayer2;
        const inactiveLayer = isLayer1Active ? bgLayer2 : bgLayer1;

        // Set new image on inactive layer
        inactiveLayer.style.backgroundImage = `url(${images[currentIndex]})`;

        // Crossfade
        activeLayer.classList.remove('active');
        inactiveLayer.classList.add('active');

        // Toggle layer state
        isLayer1Active = !isLayer1Active;
    }, ROTATION_INTERVAL);
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchPexelsImages);
} else {
    fetchPexelsImages();
}
