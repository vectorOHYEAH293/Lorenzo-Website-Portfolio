/*================== Back To Top =====================*/
const backToTopButton = document.getElementById('backToTop');

if (backToTopButton) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/*================== Dynamic Gallery Lightbox =====================*/

const galleryImages = document.querySelectorAll('.gallery-image');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

let currentIndex = 0;
let imageArray = [];

// Convert NodeList to array for easier manipulation
galleryImages.forEach((img, index) => {
    imageArray.push(img.src);

    img.addEventListener('click', () => {
        currentIndex = index;
        openLightbox();
    });
});

// Open Lightbox
function openLightbox() {
    if (!lightbox || imageArray.length === 0) return;

    lightboxImg.src = imageArray[currentIndex];
    lightbox.style.display = 'flex';
}

// Close Lightbox
function closeLightbox() {
    if (!lightbox) return;
    lightbox.style.display = 'none';
}

// Previous Image (Circular Navigation)
function prevImage() {
    if (imageArray.length === 0) return;

    currentIndex = (currentIndex - 1 + imageArray.length) % imageArray.length;
    lightboxImg.src = imageArray[currentIndex];
}

// Next Image (Circular Navigation)
function nextImage() {
    if (imageArray.length === 0) return;

    currentIndex = (currentIndex + 1) % imageArray.length;
    lightboxImg.src = imageArray[currentIndex];
}

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    if (!lightbox || lightbox.style.display !== 'flex') return;

    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'Escape') closeLightbox();
});

// Close lightbox when clicking outside image
if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
}

// Make functions globally accessible (if needed in HTML buttons)
globalThis.prevImage = prevImage;
globalThis.nextImage = nextImage;
globalThis.closeLightbox = closeLightbox;
