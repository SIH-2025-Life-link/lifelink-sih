  // Smooth Page Transitions
  document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.remove("fade-out");

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

  // Particle Background for Hero Section
  const canvas = document.getElementById("bgCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = document.querySelector(".hero").offsetHeight;

    const particles = [];
    const numParticles = 45;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 2 + 1;
        this.dx = (Math.random() - 0.5) * 0.8;
        this.dy = (Math.random() - 0.5) * 0.8;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = "#004aad";
        ctx.fill();
      }
      update() {
        if (this.x < 0 || this.x > canvas.width) this.dx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.dy *= -1;
        this.x += this.dx;
        this.y += this.dy;
        this.draw();
      }
    }

    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => p.update());
      requestAnimationFrame(animate);
    }
    animate();

    // Adjust canvas size on resize
    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = document.querySelector(".hero").offsetHeight;
    });
  }
