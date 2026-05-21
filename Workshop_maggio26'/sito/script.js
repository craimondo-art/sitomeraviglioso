const hero = document.getElementById('hero');
const gallery = document.getElementById('gallery');

/* ───── PROJECT DATA ───── */

const projects = [
  {
    title: 'Tipografia Cinetica',
    tags: ['cinetico', 'generativo', 'canvas'],
    url: 'tipografia cinetica /index.html',
    thumbnail: 'SPOTLIGHT.jpg'
  },
  {
    title: 'Texture',
    tags: ['generativo', 'texture', 'svg'],
    url: 'texture/index.html',
    thumbnail: 'texture.png'
  },
  {
    title: 'Marionetta',
    tags: ['interattivo', 'hand-tracking', 'AI'],
    url: 'marionetta/index.html',
    thumbnail: 'marionetta.png'
  },
  {
    title: 'Maschera Sonora',
    tags: ['audio', 'reattivo', 'svg'],
    url: 'maschera sonora/index.html',
    thumbnail: 'maschera sonora.png'
  },
  {
    title: 'Ricetta Pancakes',
    tags: ['utility', 'ricetta', 'interattivo'],
    url: 'ricetta/codebase/index.html',
    thumbnail: 'ricetta.png'
  }
];

/* ───── HERO ANIMATION ───── */

let heroCollapsed = false;

hero.addEventListener('click', () => {
  if (heroCollapsed) return;
  hero.classList.remove('full');
  hero.classList.add('collapsed');
  gallery.style.display = 'block';
  heroCollapsed = true;
});

/* ───── CAROUSEL ───── */

const track = document.getElementById('track');
const dotsContainer = document.getElementById('dots');
let currentIndex = 0;
let direction = 1;
let autoplayTimer = null;

function renderSlides() {
  track.innerHTML = '';
  dotsContainer.innerHTML = '';

  projects.forEach((project, i) => {
    const slide = document.createElement('div');
    slide.className = 'slide';
    slide.style.backgroundImage = `url(${project.thumbnail})`;

    const overlay = document.createElement('div');
    overlay.className = 'slide-overlay';

    const title = document.createElement('h3');
    title.textContent = project.title;

    const tags = document.createElement('div');
    tags.className = 'tags';
    tags.textContent = project.tags.join(' · ');

    overlay.appendChild(title);
    overlay.appendChild(tags);
    slide.appendChild(overlay);
    track.appendChild(slide);

    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });
}

function goToSlide(index) {
  currentIndex = index;
  track.style.transform = `translateX(-${currentIndex * 100}%)`;
  updateDots();
}

function updateDots() {
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentIndex);
  });
}

function nextSlide() {
  const max = projects.length - 1;
  if (direction === 1) {
    if (currentIndex < max) {
      goToSlide(currentIndex + 1);
    } else {
      direction = -1;
      goToSlide(currentIndex - 1);
    }
  } else {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    } else {
      direction = 1;
      goToSlide(currentIndex + 1);
    }
  }
}

function startAutoplay() {
  stopAutoplay();
  autoplayTimer = setInterval(nextSlide, 10000);
}

function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
}

/* ───── CAROUSEL NAV ZONES ───── */

document.getElementById('zone-prev').addEventListener('click', () => {
  const max = projects.length - 1;
  if (currentIndex > 0) {
    direction = -1;
    goToSlide(currentIndex - 1);
  }
});

document.getElementById('zone-next').addEventListener('click', () => {
  const max = projects.length - 1;
  if (currentIndex < max) {
    direction = 1;
    goToSlide(currentIndex + 1);
  }
});

const projectView = document.getElementById('project-view');
const projectIframe = document.getElementById('project-iframe');

document.getElementById('zone-open').addEventListener('click', () => {
  const project = projects[currentIndex];
  projectIframe.src = project.url;
  projectView.classList.add('active');
});

document.getElementById('btn-torna').addEventListener('click', (e) => {
  e.preventDefault();
  projectView.classList.remove('active');
  projectIframe.src = '';
});

/* ───── INIT ───── */

renderSlides();
startAutoplay();
