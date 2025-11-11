document.addEventListener('DOMContentLoaded', () => {
  const slideshow = document.getElementById('slideshow');
  const images = Array.from(slideshow.querySelectorAll('img'));
  const projectName = document.getElementById('project-name');
  const cursor = document.getElementById('customCursor');
  const leftBox = document.querySelector('.Left');

  let current = 0;
  let autoPlay = true;
  let interval = null;
  const AUTO_DELAY = 2500; // ms

  // safe guard: if no images, stop
  if (!images.length) return;

  // initial: ensure exactly one active (first)
  images.forEach((img,i) => img.classList.toggle('active', i===0));
  projectName.textContent = images[0].alt || 'Nom du projet';

  function showImage(index){
    index = (index + images.length) % images.length;
    current = index;
    images.forEach((img,i) => img.classList.toggle('active', i===index));
    const name = images[index].alt || '';
    projectName.textContent = name;
    // update history (optional)
    const url = images[index].dataset.url;
    if (url) history.replaceState(null, '', '/'+url);
  }

  function startAuto(){
    autoPlay = true;
    document.body.dataset.mode = 'auto';
    clearInterval(interval);
    interval = setInterval(() => showImage(current+1), AUTO_DELAY);
  }

  function stopAuto(){
    autoPlay = false;
    document.body.dataset.mode = 'manual';
    clearInterval(interval);
  }

  // click to toggle/advance
  slideshow.addEventListener('click', (e)=>{
    if (window.innerWidth <= 768) return;
    if (autoPlay) stopAuto();
    else showImage(current+1);
  });

  // click outside slideshow to restart autoplay
  document.body.addEventListener('click', (e)=>{
    if (autoPlay || window.innerWidth <= 768) return;
    if (!slideshow.contains(e.target)) startAuto();
  });

  // keyboard controls
  window.addEventListener('keydown', (e)=>{
    if (e.code === 'Space'){ e.preventDefault(); autoPlay ? stopAuto() : startAuto(); }
    if (!autoPlay && e.code === 'ArrowRight') showImage(current+1);
    if (!autoPlay && e.code === 'ArrowLeft') showImage(current-1);
  });

  // custom cursor follow + show/hide logic
  window.addEventListener('mousemove', (e)=>{
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';

    // autoplay hides cursor
    if (document.body.dataset.mode === 'auto'){
      cursor.style.opacity = '0';
      document.body.style.cursor = 'default';
      return;
    }

    // check if pointer is over Left column
    const isOverLeft = leftBox && leftBox.contains(e.target);

    // element directly under pointer
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const isOverImage = !!(el && el.tagName === 'IMG' && slideshow.contains(el));

    if (isOverLeft || isOverImage){
      cursor.style.opacity = '0';
      document.body.style.cursor = 'auto';
    } else {
      cursor.style.opacity = '1';
      document.body.style.cursor = 'none';
    }
  });

  // init
  showImage(current);
  startAuto();
});
