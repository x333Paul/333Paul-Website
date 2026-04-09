const slideshow = document.getElementById('slideshow');
// Récupérer images ET vidéos
let imagesArray = Array.from(slideshow.querySelectorAll('img, video'));

// --- Mélange aléatoire des images ---
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

imagesArray = shuffle(imagesArray);
imagesArray.forEach(img => slideshow.appendChild(img));

const projectName = document.getElementById('project-name');
const cursor = document.getElementById('customCursor');
let current = 0;
let autoPlay = true;
let interval;

// --- Variables pour le comportement mobile ---
let isMobilePaused = false;

// --- Récupère l'image correspondant à l'URL si disponible ---
const path = window.location.pathname.replace('/', '');
const initialIndex = imagesArray.findIndex(img => img.dataset.url === path);
if (initialIndex >= 0) current = initialIndex;

// --- Affiche l'image courante et le nom du projet ---
function showImage(index) {
  imagesArray.forEach((img, i) => img.classList.toggle('active', i === index));
  const url = imagesArray[index].dataset.url;
  const name = imagesArray[index].alt;
  history.replaceState(null, '', '/' + url);
  projectName.textContent = name;
}

// --- Défilement automatique ---
function startAuto() {
  autoPlay = true;
  document.body.dataset.mode = 'auto';
  isMobilePaused = false;
  tapCount = 0;
  clearInterval(interval);
  
  // Enlever la classe mobile-paused de tous les éléments
  imagesArray.forEach(img => img.classList.remove('mobile-paused'));
  
  interval = setInterval(() => {
    current = (current + 1) % imagesArray.length;
    showImage(current);
  }, 150);
}

// --- Stoppe le défilement (mode manuel) ---
function stopAuto() {
  autoPlay = false;
  document.body.dataset.mode = 'manual';
  clearInterval(interval);
}

// --- Variables pour le comportement mobile ---
let isMobileDimmed = false;

// --- Clic sur les images ---
slideshow.addEventListener('click', (e) => {
  
  // MOBILE (≤768px) - tap pour dimmer/undimmer
  if (window.innerWidth <= 768) {
    e.preventDefault();
    
    if (!isMobileDimmed) {
      // 1er TAP : réduire l'opacité à 30% pour lire la description
      isMobileDimmed = true;
      // Réduire l'opacité de toutes les images (y compris les clones)
      slideshow.querySelectorAll('.slideshow-img').forEach(img => {
        img.classList.add('mobile-dimmed');
      });
    } else {
      // 2e TAP : revenir à 100% d'opacité
      isMobileDimmed = false;
      slideshow.querySelectorAll('.slideshow-img').forEach(img => {
        img.classList.remove('mobile-dimmed');
      });
    }
    return;
  }

  // DESKTOP (>768px) - comportement existant
  if (!autoPlay) {
    current = (current + 1) % imagesArray.length;
    showImage(current);
  } else {
    stopAuto();
  }
});

// --- Clic en dehors pour relancer (desktop uniquement) ---
document.body.addEventListener('click', (e) => {
  if (window.innerWidth <= 768) return; // Ne pas relancer le défilement sur mobile
  if (autoPlay || window.innerWidth <= 768) return;
  if (!slideshow.contains(e.target)) startAuto();
});

// --- Gestion du scroll infini sur mobile ---
if (window.innerWidth <= 768) {
  // Désactiver le défilement automatique sur mobile
  autoPlay = false;
  clearInterval(interval);
  document.body.dataset.mode = 'manual';
  
  // Variables pour le scroll infini
  let isCloning = false;
  
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    
    // Si on est à 70% du bas et pas déjà en train de cloner
    if (scrollPos > maxScroll * 0.7 && !isCloning) {
      isCloning = true;
      
      // Dupliquer les images et vidéos
      imagesArray.forEach(elem => {
        const clone = elem.cloneNode(true);
        clone.classList.remove('active', 'mobile-paused', 'mobile-dimmed');
        
        // Si mobile-dimmed est actif, l'ajouter au clone aussi
        if (isMobileDimmed) {
          clone.classList.add('mobile-dimmed');
        }
        
        // Pour les vidéos, relancer l'autoplay
        if (clone.tagName === 'VIDEO') {
          clone.currentTime = 0;
          clone.play();
        }
        
        slideshow.appendChild(clone);
      });
      
      // Reset le flag après un délai
      setTimeout(() => {
        isCloning = false;
      }, 500);
    }
  });
}

// --- CURSEUR PERSONNALISÉ ---
window.addEventListener('mousemove', (e) => {
  const leftBox = document.querySelector('.Left');
  
  // Position du curseur
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
  
  // Mode auto : pas de curseur
  if (document.body.dataset.mode === 'auto') {
    cursor.style.opacity = 0;
    document.body.style.cursor = 'default';
    return;
  }
  
  // Curseur au-dessus du texte
  const isOverLeft = leftBox.contains(e.target);
  
  // Curseur au-dessus d'une image
  const elUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
  const isOverImage = elUnderCursor && elUnderCursor.tagName === 'IMG' && elUnderCursor.parentElement.id === 'slideshow';
  
  if (isOverLeft || isOverImage) {
    cursor.style.opacity = 0;
    document.body.style.cursor = 'auto';
  } else {
    cursor.style.opacity = 1;
    document.body.style.cursor = 'none';
  }
});

// --- Contrôles clavier ---
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    autoPlay ? stopAuto() : startAuto();
  }
  if (!autoPlay && e.code === 'ArrowRight') {
    current = (current + 1) % imagesArray.length;
    showImage(current);
  }
  if (!autoPlay && e.code === 'ArrowLeft') {
    current = (current - 1 + imagesArray.length) % imagesArray.length;
    showImage(current);
  }
});

// --- Initialisation ---
showImage(current);
startAuto();
