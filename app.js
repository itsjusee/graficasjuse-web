document.querySelectorAll('video[data-playback-rate]').forEach(video => {
  const rate = Number(video.dataset.playbackRate);
  video.defaultPlaybackRate = rate;
  video.playbackRate = rate;
  video.addEventListener('loadedmetadata', () => { video.playbackRate = rate; });
});
document.querySelectorAll('.project-hover-video').forEach(video => {
  const link = video.closest('.project-open');
  let hovered = false;
  let focused = false;
  function updatePreview() {
    if (hovered || focused) {
      video.play().catch(() => {});
    } else {
      link.classList.remove('is-previewing');
      video.pause();
      if (video.readyState > 0) video.currentTime = 0;
    }
  }
  video.addEventListener('playing', () => {
    if (hovered || focused) link.classList.add('is-previewing');
    else video.pause();
  });
  link.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch') return;
    hovered = true;
    updatePreview();
  });
  link.addEventListener('pointerleave', () => { hovered = false; updatePreview(); });
  link.addEventListener('focus', () => { focused = true; updatePreview(); });
  link.addEventListener('blur', () => { focused = false; updatePreview(); });
});
const tabs = [...document.querySelectorAll('[role="tab"]')];
const galleryViewButton = document.querySelector('.gallery-view');
if (galleryViewButton) {
  const gallery = document.getElementById('projects-gallery');
  galleryViewButton.addEventListener('click', () => {
    const grid = gallery.dataset.view !== 'grid';
    gallery.dataset.view = grid ? 'grid' : 'individual';
    galleryViewButton.textContent = grid ? 'Grid view' : 'Individual view';
    galleryViewButton.setAttribute('aria-label', grid
      ? 'Grid view. Switch to individual view'
      : 'Individual view. Switch to grid view');
  });
}
document.querySelectorAll('.brut-video').forEach(container => {
  const video = container.querySelector('video');
  const button = container.querySelector('.brut-video-sound');
  function updateSoundControl() {
    const soundEnabled = !video.muted;
    button.setAttribute('aria-pressed', String(soundEnabled));
    button.setAttribute('aria-label', soundEnabled ? 'Desactivar sonido' : 'Activar sonido');
  }
  button.addEventListener('click', () => {
    video.muted = !video.muted;
    updateSoundControl();
    if (video.paused) video.play().catch(() => {});
  });
  video.addEventListener('volumechange', updateSoundControl);
  updateSoundControl();
});
document.querySelectorAll('.brut-frames-track').forEach(track => {
  let drag;
  track.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = { x: event.clientX, left: track.scrollLeft };
    track.setPointerCapture(event.pointerId);
    track.classList.add('is-dragging');
  });
  track.addEventListener('pointermove', event => {
    if (drag) track.scrollLeft = drag.left + drag.x - event.clientX;
  });
  function endDrag() {
    drag = null;
    track.classList.remove('is-dragging');
  }
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);
  track.addEventListener('lostpointercapture', endDrag);
});
document.querySelectorAll('.brut-identity-gallery').forEach(gallery => {
  const track = gallery.querySelector('.brut-identity-track');
  const buttons = [...gallery.querySelectorAll('.brut-identity-selector button')];
  let current = 0;
  function update() {
    current = Math.max(0, Math.min(buttons.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
    buttons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === current)));
  }
  function go(index) {
    const target = Math.max(0, Math.min(buttons.length - 1, index));
    track.scrollTo({ left: target * track.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  buttons.forEach((button, index) => button.addEventListener('click', () => go(index)));
  track.addEventListener('scroll', update, { passive: true });
  track.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    go(event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  window.addEventListener('resize', () => {
    track.scrollTo({ left: current * track.clientWidth, behavior: 'instant' });
  });
});
document.querySelectorAll('.brut-stories').forEach(carousel => {
  const track = carousel.querySelector('.brut-stories-track');
  const slides = [...track.children];
  const dots = [...carousel.querySelectorAll('.brut-stories-controls button')];
  let current = 0;
  function position(index) {
    return Math.min(slides[index].getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft, track.scrollWidth - track.clientWidth);
  }
  function update() {
    current = slides.reduce((closest, slide, index) => Math.abs(position(index) - track.scrollLeft) < Math.abs(position(closest) - track.scrollLeft) ? index : closest, 0);
    dots.forEach((dot, index) => dot.setAttribute('aria-pressed', String(index === current)));
  }
  function go(index) {
    track.scrollTo({ left: position(Math.max(0, Math.min(slides.length - 1, index))), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  dots.forEach((dot, index) => dot.addEventListener('click', () => go(index)));
  track.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    go(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
});
// Native range input supports dragging, touch and keyboard comparison.
document.querySelectorAll('.brut-comparison-range').forEach(input => {
  input.addEventListener('input', () => {
    input.parentElement.style.setProperty('--comparison-position', input.value + '%');
    input.setAttribute('aria-valuetext', `${input.value}% ${input.dataset.beforeLabel || 'azul'}, ${100 - Number(input.value)}% ${input.dataset.afterLabel || 'rosa'}`);
  });
});
const panels = [...document.querySelectorAll('[role="tabpanel"]')];
function selectTab(id, focus = false) {
  tabs.forEach(tab => {
    const selected = tab.getAttribute('aria-controls') === id;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && focus) tab.focus();
  });
  panels.forEach(panel => { panel.hidden = panel.id !== id; });
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => {
    const id = tab.getAttribute('aria-controls');
    if (document.body.dataset.projectPage) location.href = 'index.html#' + id;
    else location.hash = id;
  });
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') next = 1 - index;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    const id = tabs[next].getAttribute('aria-controls');
    if (document.body.dataset.projectPage) {
      location.href = 'index.html#' + id;
      return;
    }
    selectTab(id, true);
    location.hash = id;
  });
});
function syncHash() {
  const id = location.hash.slice(1);
  if (id === 'juse' || id === 'graficas') selectTab(id);
}
window.addEventListener('hashchange', syncHash);
if (!document.body.dataset.projectPage) syncHash();

// Track the section crossing the upper third of the viewport, including tall media.
const brutLinks = [...document.querySelectorAll('.brut-index a')];
if (brutLinks.length) {
  const brutSections = brutLinks.map(link => document.getElementById(link.hash.slice(1)));
  let brutFramePending = false;
  function updateBrutIndex() {
    const marker = window.innerHeight * .3;
    let active = brutSections[0];
    for (const section of brutSections) {
      if (section.getBoundingClientRect().top <= marker) active = section;
    }
    brutLinks.forEach(link => {
      if (link.hash === '#' + active.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    brutFramePending = false;
  }
  function scheduleBrutIndex() {
    if (!brutFramePending) {
      brutFramePending = true;
      requestAnimationFrame(updateBrutIndex);
    }
  }
  window.addEventListener('scroll', scheduleBrutIndex, { passive: true });
  window.addEventListener('resize', scheduleBrutIndex);
  window.addEventListener('load', scheduleBrutIndex);
  updateBrutIndex();
}

// Hide while scrolling down, show on upward scroll or after a pause.
const tabShell = document.querySelector('.tab-shell');

let lastScrollY = Math.max(0, window.scrollY);
let scrollIdleTimer;
function showNavigation() {
  tabShell.classList.remove('is-scroll-hidden');
}
window.addEventListener('scroll', () => {
  const scrollY = Math.max(0, window.scrollY);
  const delta = scrollY - lastScrollY;
  lastScrollY = scrollY;
  clearTimeout(scrollIdleTimer);
  if (scrollY < 20) {
    showNavigation();
    return;
  }
  if (delta > 0) tabShell.classList.add('is-scroll-hidden');
  else if (delta < 0) showNavigation();
  scrollIdleTimer = setTimeout(showNavigation, 950);
}, { passive: true });
window.addEventListener('resize', () => {
  clearTimeout(scrollIdleTimer);
  lastScrollY = Math.max(0, window.scrollY);
  showNavigation();
});
tabShell.addEventListener('focusin', showNavigation);
document.querySelector('#year').textContent = new Date().getFullYear();
const valenciaClocks = document.querySelectorAll('.valencia-clock');
const valenciaTimeFormat = new Intl.DateTimeFormat('es-ES', {
  timeZone: 'Europe/Madrid',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23'
});
function updateValenciaClock() {
  const now = new Date();
  valenciaClocks.forEach(valenciaClock => {
    valenciaClock.dateTime = now.toISOString();
    valenciaClock.textContent = `Valencia - ${valenciaTimeFormat.format(now)}`;
  });
}
updateValenciaClock();
setInterval(updateValenciaClock, 1000);
const projectCursor = document.createElement('span');
projectCursor.className = 'project-cursor';
projectCursor.setAttribute('aria-hidden', 'true');
document.body.append(projectCursor);
const projectCursorMedia = window.matchMedia('(hover: hover) and (pointer: fine)');
function hideProjectCursor() {
  projectCursor.classList.remove('is-visible');
}
document.querySelectorAll('.project-open').forEach(button => {
  if (button.classList.contains('project-building')) {
    button.addEventListener('click', event => {
      event.preventDefault();
      if (projectCursorMedia.matches && event.pointerType !== 'touch') return;
      const expanded = button.classList.toggle('is-building-visible');
      button.setAttribute('aria-expanded', String(expanded));
    });
  }
  function moveProjectCursor(event) {
    if (!projectCursorMedia.matches || event.pointerType === 'touch') return;
    projectCursor.textContent = button.dataset.project === '2' ? '🛠️ Currently building' : button.dataset.project === '3' ? 'View project' : 'View case study';
    projectCursor.classList.toggle('is-gallery', button.dataset.project === '3');
    projectCursor.classList.toggle('is-building', button.dataset.project === '2');
    const width = projectCursor.offsetWidth;
    const height = projectCursor.offsetHeight;
    const x = Math.max(8, event.clientX + 20 + width <= window.innerWidth - 8
      ? event.clientX + 20 : event.clientX - width - 20);
    const y = Math.max(8, Math.min(event.clientY + 16, window.innerHeight - height - 8));
    projectCursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    projectCursor.classList.add('is-visible');
  }
  button.addEventListener('pointerenter', moveProjectCursor);
  button.addEventListener('pointermove', moveProjectCursor);
  button.addEventListener('pointerleave', hideProjectCursor);
  button.addEventListener('pointercancel', hideProjectCursor);
  button.addEventListener('click', hideProjectCursor);
});
window.addEventListener('scroll', hideProjectCursor, { passive: true });
window.addEventListener('blur', hideProjectCursor);
projectCursorMedia.addEventListener('change', hideProjectCursor);
const jusePortrait = document.querySelector('.juse-portrait');
if (jusePortrait) {
  const portraitImage = jusePortrait.querySelector('img');
  const portraitPhotos = [1, 2, 3, 4, 5].map(number => `Recursos/Juse/yo%20${number}.png`);
  let portraitIndex = 0;
  jusePortrait.addEventListener('click', () => {
    portraitIndex = (portraitIndex + 1) % portraitPhotos.length;
    portraitImage.src = portraitPhotos[portraitIndex];
    portraitImage.alt = `Juse, foto ${portraitIndex + 1} de ${portraitPhotos.length}`;
  });
  function movePortraitCursor(event) {
    if (!projectCursorMedia.matches || event.pointerType === 'touch') return;
    projectCursor.textContent = "Hurry up, I'm aging!";
    projectCursor.classList.remove('is-gallery', 'is-building');
    const x = Math.max(8, Math.min(event.clientX + 20, window.innerWidth - projectCursor.offsetWidth - 8));
    const y = Math.max(8, Math.min(event.clientY + 16, window.innerHeight - projectCursor.offsetHeight - 8));
    projectCursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    projectCursor.classList.add('is-visible');
  }
  jusePortrait.addEventListener('pointerenter', movePortraitCursor);
  jusePortrait.addEventListener('pointermove', movePortraitCursor);
  jusePortrait.addEventListener('pointerleave', hideProjectCursor);
  jusePortrait.addEventListener('pointercancel', hideProjectCursor);
  jusePortrait.addEventListener('blur', hideProjectCursor);
}
const emailAddress = 'josemiguelvalenzuelaguirado@gmail.com';
// A single audio player prevents tracks from different clubs overlapping.
const moodButtons = document.querySelectorAll('.club-mood-button');
const clubAudio = new Audio();
clubAudio.preload = 'none';
clubAudio.addEventListener('loadedmetadata', () => {
  // Short tracks start at the beginning rather than seeking past their end.
  clubAudio.currentTime = clubAudio.duration > 60 ? 60 : 0;
});
let activeMoodButton = null;
const nextClubTrackIndexes = new Map();
const playIcon = 'M4 2.5v11L13 8z';
const stopIcon = 'M3 3h10v10H3z';
function setMoodState(button, playing) {
  const clubName = document.getElementById(`${button.dataset.club}-title`).textContent;
  button.setAttribute('aria-pressed', String(playing));
  button.setAttribute('aria-label', `${playing ? 'Cut the mood' : 'Get in the mood'}: ${clubName}`);
  button.querySelector('path').setAttribute('d', playing ? stopIcon : playIcon);
  button.querySelector('span').textContent = playing ? 'Cut the mood' : 'Get in the mood';
}
function stopClubMood() {
  clubAudio.pause();
  if (activeMoodButton) setMoodState(activeMoodButton, false);
  activeMoodButton = null;
  clubAudio.removeAttribute('src');
  clubAudio.load();
}
moodButtons.forEach(button => {
  const equalizer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  equalizer.classList.add('club-mood-equalizer');
  [2, 6.5, 11].forEach(x => {
    const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bar.setAttribute('x', x);
    bar.setAttribute('y', '2');
    bar.setAttribute('width', '3');
    bar.setAttribute('height', '12');
    equalizer.append(bar);
  });
  button.querySelector('svg').append(equalizer);
  button.addEventListener('click', () => {
    const wasActive = activeMoodButton === button;
    stopClubMood();
    if (wasActive) return;
    const tracks = JSON.parse(button.dataset.tracks);
    if (!tracks.length) return;
    const trackIndex = nextClubTrackIndexes.get(button.dataset.club) ?? 0;
    const track = tracks[trackIndex];
    activeMoodButton = button;
    setMoodState(button, true);
    clubAudio.src = track.split('/').map(encodeURIComponent).join('/');
    clubAudio.play().then(() => {
      if (activeMoodButton === button) {
        nextClubTrackIndexes.set(button.dataset.club, (trackIndex + 1) % tracks.length);
      }
    }).catch(error => {
      // Switching or stopping while loading cancels the old play request.
      if (error.name === 'AbortError' || activeMoodButton !== button) return;
      stopClubMood();
      document.querySelector('.copy-status').textContent = 'No se ha podido reproducir el audio. Inténtalo de nuevo.';
    });
  });
});
clubAudio.addEventListener('ended', stopClubMood);
clubAudio.addEventListener('error', () => {
  if (!activeMoodButton) return;
  stopClubMood();
  document.querySelector('.copy-status').textContent = 'No se ha podido cargar el audio. Inténtalo de nuevo.';
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') stopClubMood();
});
window.addEventListener('pagehide', stopClubMood);
const copyStatus = document.querySelector('.copy-status');
const copyFeedbackTimers = new WeakMap();
function showCopyFeedback(button) {
  const control = button.closest('.email-control');
  clearTimeout(copyFeedbackTimers.get(control));
  control.classList.add('is-copied');
  copyFeedbackTimers.set(control, setTimeout(() => {
    control.classList.remove('is-copied');
  }, 2000));
}
document.querySelectorAll('.copy-email').forEach(button => {
  button.addEventListener('click', async () => {
    copyStatus.textContent = '';
    try {
      await navigator.clipboard.writeText(emailAddress);
      copyStatus.textContent = 'Correo copiado';
      showCopyFeedback(button);
    } catch {
      const field = document.createElement('textarea');
      field.value = emailAddress;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.append(field);
      field.select();
      const copied = document.execCommand('copy');
      field.remove();
      button.focus({ preventScroll: true });
      copyStatus.textContent = copied ? 'Correo copiado' : 'No se ha podido copiar el correo';
      if (copied) showCopyFeedback(button);
    }
  });
});
