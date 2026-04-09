const slideshow = document.getElementById('slideshow');
let imagesArray = Array.from(slideshow.querySelectorAll('img'));

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
let tapCount = 0;

// --- Clic sur les images ---
slideshow.addEventListener('click', (e) => {
  
  // MOBILE (≤768px)
  if (window.innerWidth <= 768) {
    e.preventDefault();
    
    if (!isMobilePaused) {
      // 1er TAP : pause le défilement et opacité 10%
      stopAuto();
      isMobilePaused = true;
      tapCount = 1;
      imagesArray[current].classList.add('mobile-paused');
    } else if (tapCount === 1) {
      // 2e TAP : opacité 100%
      tapCount = 2;
      imagesArray[current].classList.remove('mobile-paused');
    } else if (tapCount === 2) {
      // 3e TAP : image suivante et réappliquer l'opacité 10%
      tapCount = 1;
      current = (current + 1) % imagesArray.length;
      showImage(current);
      imagesArray[current].classList.add('mobile-paused');
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
