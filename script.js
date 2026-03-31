// ==========================================
// INITIALIZATION & SETUP
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initializeAnimations();
  initializeNavigation();
  initializeTypingEffect();
  initializeContactForm();
  initializeSmoothScroll();
  initializeScrollAnimations();
});

// ==========================================
// ANIMATIONS ON SCROLL
// ==========================================

function initializeScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
      }
    });
  }, observerOptions);

  // Observe all elements with data-aos attribute
  document.querySelectorAll('[data-aos]').forEach(el => {
    observer.observe(el);
  });
}

// ==========================================
// NAVIGATION
// ==========================================

function initializeNavigation() {
  const mobileMenuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-panel');
  const mobileNavLinks = document.querySelectorAll('.mobile-panel__link');
  const navLinks = document.querySelectorAll('.nav__link');

  // Mobile menu toggle
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      
      // Animate hamburger icon
      const spans = mobileMenuToggle.querySelectorAll('span');
      if (mobileMenu.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translateY(10px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translateY(-10px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });
  }

  // Close mobile menu when clicking a link
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      const spans = mobileMenuToggle.querySelectorAll('span');
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    });
  });

  // Active nav link on scroll
  window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section[id]');
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.pageYOffset >= sectionTop - 200) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // Shrink nav on scroll
  const nav = document.querySelector('.masthead');
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
      nav.style.top = '10px';
      nav.querySelector('.masthead__inner').style.padding = '8px 18px';
    } else {
      nav.style.top = '18px';
      nav.querySelector('.masthead__inner').style.padding = '12px 20px';
    }
    
    lastScroll = currentScroll;
  });
}

// ==========================================
// TYPING EFFECT
// ==========================================

function initializeTypingEffect() {
  const roles = [
    "Software Developer",
    "Full Stack Engineer",
    "Software Tester",
    "Web Developer",
    "Problem Solver"
  ];
  
  const typingText = document.querySelector('.typing__text');
  if (!typingText) return;
  
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;
  
  function type() {
    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
      typingText.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      typingText.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 100;
    }
    
    if (!isDeleting && charIndex === currentRole.length) {
      // Pause at end
      typingSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 500;
    }
    
    setTimeout(type, typingSpeed);
  }
  
  // Start typing effect
  type();
}

// ==========================================
// SMOOTH SCROLL
// ==========================================

function initializeSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      
      if (targetId === '#' || !targetId) return;
      
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        e.preventDefault();
        
        const headerOffset = 100;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ==========================================
// CONTACT FORM
// ==========================================

function initializeContactForm() {
  const form = document.getElementById('contact-form');
  const result = document.getElementById('form-result');
  
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loading state
    result.innerHTML = 'Sending message...';
    result.style.color = 'var(--color-accent-primary)';
    result.style.background = 'var(--color-bg-tertiary)';
    result.style.border = '2px solid var(--color-border)';
    
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);
    
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: json
      });
      
      const data = await response.json();
      
      if (data.success) {
        result.innerHTML = '✓ Message sent successfully! I\'ll get back to you soon.';
        result.style.color = 'var(--color-accent-primary)';
        result.style.background = 'rgba(0, 255, 136, 0.1)';
        result.style.border = '2px solid var(--color-accent-primary)';
        form.reset();
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      result.innerHTML = '✗ Something went wrong. Please try again or email me directly.';
      result.style.color = '#ff3366';
      result.style.background = 'rgba(255, 51, 102, 0.1)';
      result.style.border = '2px solid #ff3366';
    }
    
    // Clear message after 5 seconds
    setTimeout(() => {
      result.innerHTML = '';
      result.style.background = 'transparent';
      result.style.border = 'none';
    }, 5000);
  });
}

// ==========================================
// GENERAL ANIMATIONS
// ==========================================

function initializeAnimations() {
  // Add hover effect to skill tags
  const skillTags = document.querySelectorAll('.pill-set span, .compact span');
  skillTags.forEach(tag => {
    tag.addEventListener('mouseenter', () => {
      tag.style.transform = 'translateY(-2px) rotate(2deg)';
    });
    
    tag.addEventListener('mouseleave', () => {
      tag.style.transform = 'translateY(0) rotate(0deg)';
    });
  });
  
  // Pause tech showcase on hover
  const techShowcase = document.querySelector('.marquee__track');
  if (techShowcase) {
    techShowcase.addEventListener('mouseenter', () => {
      techShowcase.style.animationPlayState = 'paused';
    });
    
    techShowcase.addEventListener('mouseleave', () => {
      techShowcase.style.animationPlayState = 'running';
    });
  }
  
  // Add magnetic effect to buttons
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('mousemove', (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translate(0, 0)';
    });
  });
  
  // Randomize floating animation delays
  const floatingElements = document.querySelectorAll('.stat-card');
  floatingElements.forEach((element, index) => {
    element.style.animationDelay = `${index * 0.2}s`;
  });
}

// ==========================================
// PERFORMANCE OPTIMIZATIONS
// ==========================================

// Debounce function for scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Optimize scroll events
const optimizedScroll = debounce(() => {
  // Any scroll-based logic here
}, 10);

window.addEventListener('scroll', optimizedScroll);

// ==========================================
// EASTER EGG - KONAMI CODE
// ==========================================

let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
  konamiCode.push(e.key);
  konamiCode = konamiCode.slice(-konamiSequence.length);
  
  if (konamiCode.join('') === konamiSequence.join('')) {
    // Easter egg activated!
    document.body.style.animation = 'rainbow 2s linear infinite';
    
    setTimeout(() => {
      document.body.style.animation = '';
    }, 5000);
  }
});

// Rainbow animation for easter egg
const style = document.createElement('style');
style.textContent = `
  @keyframes rainbow {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
  }
`;
document.head.appendChild(style);

// ==========================================
// CONSOLE MESSAGE
// ==========================================

console.log('%cHello, curious developer!', 'color: #ffd400; font-size: 22px; font-weight: bold;');
console.log('%cLike what you see? Let\'s connect!', 'color: #ffea70; font-size: 16px;');
console.log('%cEmail: adityarya207@gmail.com', 'color: #b9b9b9; font-size: 14px;');
console.log('%cTry the Konami Code for a surprise.', 'color: #ffd400; font-size: 12px; font-style: italic;');

