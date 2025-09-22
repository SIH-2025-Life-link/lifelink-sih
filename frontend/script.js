// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:5000',
  HEADERS: {
    'Content-Type': 'application/json'
  }
};

// Utilities
function setAuthToken(token) {
  if (token) {
    localStorage.setItem('authToken', token);
    API_CONFIG.HEADERS.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem('authToken');
    delete API_CONFIG.HEADERS.Authorization;
  }
}

function getAuthToken() {
  return localStorage.getItem('authToken');
}

// API Functions
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      ...options,
      headers: { ...API_CONFIG.HEADERS, ...options.headers }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'API Error');
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Auth Functions
async function login(username, password) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  setAuthToken(data.token);
  return data;
}

async function register(username, password, role, adminCode = null) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, role, adminCode })
  });
}

// Relief Functions
async function addDonation(donationData) {
  return apiRequest('/donate', {
    method: 'POST',
    body: JSON.stringify(donationData)
  });
}

async function addDispatch(dispatchData) {
  return apiRequest('/dispatch', {
    method: 'POST',
    body: JSON.stringify(dispatchData)
  });
}

async function verifyRecord(id) {
  return apiRequest(`/verifyRecord/${id}`);
}

async function getAuditTrail() {
  return apiRequest('/auditTrail');
}

// Page Transitions and Initialization
document.addEventListener("DOMContentLoaded", () => {
  // Restore auth token if exists
  const token = getAuthToken();
  if (token) {
    setAuthToken(token);
  }

  document.body.classList.remove("fade-out");

  // Handle link transitions
  document.querySelectorAll("a").forEach(link => {
    if (link.hostname === window.location.hostname && link.getAttribute("href").endsWith(".html")) {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const href = link.getAttribute("href");
        document.body.classList.add("fade-out");
        setTimeout(() => {
          window.location.href = href;
        }, 600);
      });
    }
  });

  // Fade-up Scroll Animation
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(".fade-up").forEach(el => observer.observe(el));

  // Initialize Particle Background
  const canvas = document.getElementById("bgCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = document.querySelector(".hero").offsetHeight;

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.speedY = (Math.random() - 0.5) * 0.8;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 74, 173, ${this.opacity})`;
        ctx.fill();
      }
    }

    const particles = Array.from({ length: 45 }, () => new Particle());

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = document.querySelector(".hero").offsetHeight;
      particles.forEach(particle => particle.reset());
    });
  }

  // Export API functions for use in other files
  window.LifeLinkAPI = {
    login,
    register,
    addDonation,
    addDispatch,
    verifyRecord,
    getAuditTrail,
    setAuthToken,
    getAuthToken
  };
});
