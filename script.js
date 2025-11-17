// 3D Library - dynamically load to avoid blocking render
(function() {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  script.onload = () => {
    try {
      init3DBackground();
    } catch (e) {
      console.error("Could not initialize 3D background.", e);
      const canvas = document.getElementById('background-canvas');
      if(canvas) canvas.style.display = 'none';
    }
  };
  script.onerror = () => {
    console.error("Failed to load three.js. 3D background disabled.");
    const canvas = document.getElementById('background-canvas');
    if(canvas) canvas.style.display = 'none';
  };
  document.head.appendChild(script);
})();

// --- 3D Background Management ---
let currentRenderer, currentScene, currentCamera, currentAnimationId;
let mouseX = 0, mouseY = 0;

// --- Dark Mode: Particle Background ---
function init3DBackground() {
  const canvas = document.getElementById('background-canvas');
  if (!canvas || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 50;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const particleCount = 5000;
  const particles = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 500;
  }
  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const particleMaterial = new THREE.PointsMaterial({
    color: 0x4ade80,
    size: 0.25,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending
  });
  const particleSystem = new THREE.Points(particles, particleMaterial);
  scene.add(particleSystem);

  function animate() {
    currentAnimationId = requestAnimationFrame(animate);
    particleSystem.rotation.y += 0.0002;
    camera.position.x += (mouseX - camera.position.x) * 0.02;
    camera.position.y += (-mouseY - camera.position.y) * 0.02;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }
  animate();
  return { renderer, scene, camera };
}

// --- Light Mode: Waving Mesh Background ---
function initLightModeBackground() {
  const canvas = document.getElementById('background-canvas');
  if (!canvas || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(0, 0, 120);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const planeGeometry = new THREE.PlaneGeometry(500, 500, 50, 50);
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0x22c55e,
    wireframe: true,
    transparent: true,
    opacity: 0.15
  });

  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(plane);

  const clock = new THREE.Clock();

  function animate() {
    currentAnimationId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    const positions = plane.geometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = Math.sin(x * 0.02 + t) * 5 + Math.sin(y * 0.03 + t) * 5;
      positions.setZ(i, z);
    }
    positions.needsUpdate = true;

    camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();
  return { renderer, scene, camera };
}

// --- Scene Cleanup and Switching Logic ---
function cleanupScene() {
  if (currentAnimationId) cancelAnimationFrame(currentAnimationId);
  if (currentScene) {
    currentScene.traverse(object => {
      if (object.isMesh || object.isPoints) {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
    });
  }
  if (currentRenderer) currentRenderer.dispose();
}

function switch3DBackground(theme) {
  cleanupScene();
  let sceneInfo;
  if (theme === 'dark') {
    sceneInfo = init3DBackground();
  } else {
    sceneInfo = initLightModeBackground();
  }
  if (sceneInfo) {
    currentRenderer = sceneInfo.renderer;
    currentScene = sceneInfo.scene;
    currentCamera = sceneInfo.camera;
  }
}

// Theme toggle
function setupThemeToggle(buttonId, iconSelector) {
  const themeToggleBtn = document.getElementById(buttonId);
  if (!themeToggleBtn) return;
  const body = document.body;

  themeToggleBtn.addEventListener('click', () => {
    const isDark = body.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    switch3DBackground(newTheme);
    document.querySelectorAll('#theme-toggle i, #theme-toggle-mobile i').forEach(icon => {
      icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    });
  });
}
setupThemeToggle('theme-toggle', 'i');
setupThemeToggle('theme-toggle-mobile', 'i');

// --- Initial Setup and Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
  const onWindowResize = () => {
    if (!currentCamera || !currentRenderer) return;
    currentCamera.aspect = window.innerWidth / window.innerHeight;
    currentCamera.updateProjectionMatrix();
    currentRenderer.setSize(window.innerWidth, window.innerHeight);
  };

  initLogoLoop();
  switch3DBackground(document.body.getAttribute('data-theme') || 'dark');
  onWindowResize(); // Initial resize to set canvas correctly

  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - window.innerWidth / 2) / 100;
    mouseY = (event.clientY - window.innerHeight / 2) / 100;
  });

  window.addEventListener('resize', onWindowResize);
});

// Mobile navigation toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navToggleIcon = navToggle.querySelector('i');

navToggle.addEventListener('click', () => {
  const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', !isExpanded);
  navLinks.classList.toggle('nav-open');
  navToggleIcon.className = !isExpanded ? 'fas fa-times' : 'fas fa-bars';
});

// Close menu when a link is clicked
navLinks.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    navToggle.click();
  }
});

// Rotating roles text effect
const roles = [
  "Software Developer",
  "Software Tester",
  "Software Engineer",
  "Web Developer",
  "Technology Enthusiast"
];
const rotatingRole = document.querySelector('.rotating-role');
let roleIndex = 0;
let charIndex = 0;
let deleting = false;
const typingSpeed = 120;
const deletingSpeed = 60;
const pauseDelay = 1800;

function typeRotate() {
  const currentRole = roles[roleIndex];
  if (!deleting) {
    rotatingRole.textContent = currentRole.substring(0, charIndex + 1);
    charIndex++;
    if (charIndex === currentRole.length) {
      deleting = true;
      setTimeout(typeRotate, pauseDelay);
    } else {
      setTimeout(typeRotate, typingSpeed);
    }
  } else {
    rotatingRole.textContent = currentRole.substring(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      setTimeout(typeRotate, typingSpeed);
    } else {
      setTimeout(typeRotate, deletingSpeed);
    }
  }
}

typeRotate();

// Smooth scroll for navigation
function smoothScroll(e) {
  e.preventDefault();
  const targetId = e.currentTarget.getAttribute('href');
  const targetElement = document.querySelector(targetId);
  if (targetElement) {
    targetElement.scrollIntoView({ behavior: 'smooth' });
  }
}
document.querySelectorAll('.nav-links a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', smoothScroll);
});
document.querySelectorAll('.cta-buttons a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', smoothScroll);
});

// Contact Form Submission
const form = document.getElementById('contact-form');
const result = document.getElementById('form-result');

form.addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(form);
  const object = Object.fromEntries(formData);
  const json = JSON.stringify(object);
  result.innerHTML = "Sending..."

  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: json
  })
    .then(async (response) => {
      let json = await response.json();
      result.innerHTML = json.success ? "Message sent successfully!" : "Something went wrong. Please try again.";
    })
    .catch(error => result.innerHTML = "Something went wrong. Please try again.")
    .then(() => form.reset());
});

// Logo Loop Implementation
const logoTrack = document.getElementById('logoTrack');
const logos = [
  { name: 'Python', icon: 'fab fa-python', color: '#3776AB' },
  { name: 'C', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="70" font-size="80" font-weight="bold" text-anchor="middle" fill="currentColor">C</text></svg>', color: '#A8B9CC' },
  { name: 'C++', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="70" font-size="70" font-weight="bold" text-anchor="middle" fill="currentColor">C++</text></svg>', color: '#00599C' },
  { name: 'JavaScript', icon: 'fab fa-js-square', color: '#F7DF1E' },
  { name: 'Kotlin', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M 10 10 L 50 50 L 10 90 Z" fill="currentColor"/><path d="M 50 10 L 90 50 L 50 90 Z" fill="currentColor"/></svg>', color: '#7F52FF' },
  { name: 'SQL', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="70" font-size="60" font-weight="bold" text-anchor="middle" fill="currentColor">SQL</text></svg>', color: '#CC2927' },
  { name: 'Git', icon: 'fab fa-git-alt', color: '#F1502F' },
  { name: 'GitHub', icon: 'fab fa-github', color: '#181717' },
  { name: 'MongoDB', icon: 'fas fa-leaf', color: '#13AA52' },
  { name: 'Java', icon: 'fab fa-java', color: '#007396' },
  { name: 'Node.js', icon: 'fab fa-node-js', color: '#339933' },
  { name: 'Express.js', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="70" font-size="45" font-weight="bold" text-anchor="middle" fill="currentColor">Express</text></svg>', color: '#000000' },
];

function initLogoLoop() {
  if (!logoTrack) return;

  // Increased to 6 cycles for better mobile coverage
  for (let cycle = 0; cycle < 6; cycle++) {
    logos.forEach(logo => {
      const logoItem = document.createElement('div');
      logoItem.className = 'logo-item';
      if (logo.name === 'GitHub' || logo.name === 'Express.js') {
        logoItem.classList.add('logo-inverted-bg');
      }
      let logoContent = '';

      if (logo.icon) {
        logoContent = `<i class="${logo.icon}" style="font-size: 3rem; color: ${logo.color}; margin-bottom: 8px;"></i>`;
      } else if (logo.svg) {
        logoContent = `<div style="width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; color: ${logo.color}; margin-bottom: 8px;">${logo.svg}</div>`;
      }

      logoItem.innerHTML = `
        <div style="text-align: center; flex-direction: column; display: flex; align-items: center;">
          ${logoContent}
          <span class="logo-label">${logo.name}</span>
        </div>
      `;
      logoTrack.appendChild(logoItem);
    });
  }
}