document.addEventListener("DOMContentLoaded", () => {

    // ===== 1. LOADING SCREEN =====
    const loadingScreen = document.getElementById("loading-screen");
    const loadingBar = document.getElementById("loading-bar");
    const loadingStars = document.getElementById("loading-stars");
    const siteWrapper = document.getElementById("site-wrapper");

    // Generate twinkling stars for loading screen
    for (let i = 0; i < 80; i++) {
        const star = document.createElement("div");
        star.className = "loading-star";
        star.style.left = Math.random() * 100 + "%";
        star.style.top = Math.random() * 100 + "%";
        star.style.width = (Math.random() * 2 + 1) + "px";
        star.style.height = star.style.width;
        star.style.animationDelay = (Math.random() * 3) + "s";
        star.style.animationDuration = (1.5 + Math.random() * 2) + "s";
        loadingStars.appendChild(star);
    }

    // Simulate loading progress
    let progress = 0;
    const loadInterval = setInterval(() => {
        progress += Math.random() * 12 + 3;
        if (progress >= 100) progress = 100;
        loadingBar.style.width = progress + "%";
        if (progress >= 100) {
            clearInterval(loadInterval);
            setTimeout(() => {
                loadingScreen.classList.add("fade-out");
                siteWrapper.classList.add("visible");
                // Trigger hero logo entrance
                setTimeout(() => {
                    const heroWrapper = document.getElementById('hero-logo-wrapper');
                    if (heroWrapper) heroWrapper.classList.add('active');
                }, 200);
                setTimeout(() => {
                    loadingScreen.style.display = "none";
                }, 900);
            }, 400);
        }
    }, 200);

    // ===== VIDEO FALLBACK LOGIC =====
    const videoElements = document.querySelectorAll('.loading-logo-video, .hero-logo-video');
    videoElements.forEach(video => {
        const fallbackImg = video.parentElement.querySelector('.loading-logo-fallback, .hero-logo-fallback');
        const sourceEl = video.querySelector('source');

        function showFallback() {
            video.style.display = 'none';
            if (fallbackImg) fallbackImg.style.display = 'block';
        }

        // Video can play — hide fallback
        video.addEventListener('canplay', () => {
            if (fallbackImg) fallbackImg.style.display = 'none';
            video.style.display = 'block';
        });

        // Video error
        video.addEventListener('error', showFallback);
        // Source error (doesn't bubble to video)
        if (sourceEl) sourceEl.addEventListener('error', showFallback);

        // If video is already ready (cached)
        if (video.readyState >= 3) {
            if (fallbackImg) fallbackImg.style.display = 'none';
        }

        // Timeout fallback: if video hasn't loaded in 3s, show GIF
        setTimeout(() => {
            if (video.readyState < 2) showFallback();
        }, 3000);
    });

    // ===== 2. STAR PARTICLE SYSTEM =====
    const canvas = document.getElementById("star-canvas");
    const ctx = canvas.getContext("2d");
    let stars = [];
    const STAR_COUNT = 180;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createStars() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 1.8 + 0.3,
                opacity: Math.random() * 0.6 + 0.2,
                speed: Math.random() * 0.3 + 0.05,
                drift: (Math.random() - 0.5) * 0.15
            });
        }
    }

    function drawStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const s of stars) {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
            ctx.fill();
            s.y += s.speed;
            s.x += s.drift;
            if (s.y > canvas.height + 5) { s.y = -5; s.x = Math.random() * canvas.width; }
            if (s.x > canvas.width + 5) s.x = -5;
            if (s.x < -5) s.x = canvas.width + 5;
        }
        requestAnimationFrame(drawStars);
    }

    resizeCanvas();
    createStars();
    drawStars();

    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { resizeCanvas(); createStars(); }, 200);
    });

    // ===== 3. SCROLL REVEAL =====
    const reveals = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
        reveals.forEach(el => observer.observe(el));
    } else {
        reveals.forEach(el => el.classList.add("active"));
    }

    // ===== 4. PARALLAX + SCROLL-REACTIVE LOGO =====
    const nebulas = document.querySelectorAll(".nebula");
    const heroLogo = document.getElementById('hero-logo');
    const heroSection = document.getElementById('hero');
    let ticking = false;
    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                nebulas.forEach((n, i) => {
                    n.style.transform = `translateY(${scrollY * (0.03 + i * 0.015)}px)`;
                });
                // Scroll-reactive hero logo: subtle rotation and scale based on scroll
                if (heroLogo && heroSection) {
                    const rect = heroSection.getBoundingClientRect();
                    const sectionHeight = heroSection.offsetHeight;
                    const scrollProgress = Math.max(0, Math.min(1, -rect.top / sectionHeight));
                    const rotation = scrollProgress * 15;
                    const scale = 1 - scrollProgress * 0.3;
                    const opacity = 1 - scrollProgress * 0.6;
                    heroLogo.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
                    heroLogo.style.opacity = opacity;
                }
                ticking = false;
            });
            ticking = true;
        }
    });

    // ===== 4b. MOUSE-TRACKING MAGNETIC LOGO =====
    const logoWrapper = document.getElementById('hero-logo-wrapper');
    if (logoWrapper && heroLogo) {
        logoWrapper.addEventListener('mousemove', (e) => {
            const rect = logoWrapper.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = (e.clientX - centerX) / rect.width;
            const deltaY = (e.clientY - centerY) / rect.height;
            const moveX = deltaX * 12;
            const moveY = deltaY * 12;
            const rotateX = -deltaY * 15;
            const rotateY = deltaX * 15;
            heroLogo.style.transform = `translate(${moveX}px, ${moveY}px) perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
            heroLogo.style.transition = 'transform 0.15s ease-out';
        });
        logoWrapper.addEventListener('mouseleave', () => {
            heroLogo.style.transform = 'translate(0,0) perspective(500px) rotateX(0deg) rotateY(0deg) scale(1)';
            heroLogo.style.transition = 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)';
        });
    }

    // ===== 5. NAVBAR SCROLL =====
    const navbar = document.getElementById("navbar");
    window.addEventListener("scroll", () => {
        navbar.style.background = window.scrollY > 50 ? "rgba(5,5,8,0.85)" : "rgba(5,5,8,0.6)";
    });

    // ===== 6. FILM CAROUSEL =====
    const track = document.getElementById("carousel-track");
    const prevBtn = document.getElementById("carousel-prev");
    const nextBtn = document.getElementById("carousel-next");
    const dotsWrap = document.getElementById("carousel-dots");
    const viewport = document.getElementById("carousel-viewport");

    if (track && prevBtn && nextBtn && dotsWrap && viewport) {
        const cards = Array.from(track.querySelectorAll(".film-card"));
        let idx = 0;
        let autoTimer;
        const GAP = 16;

        function getVisible() {
            return window.innerWidth <= 768 ? 1 : 2;
        }

        function getMaxIdx() {
            return Math.max(0, cards.length - getVisible());
        }

        function buildDots() {
            dotsWrap.innerHTML = "";
            const total = getMaxIdx() + 1;
            for (let i = 0; i < total; i++) {
                const d = document.createElement("button");
                d.className = "carousel-dot" + (i === idx ? " active" : "");
                d.setAttribute("aria-label", "Slide " + (i + 1));
                d.addEventListener("click", () => goTo(i));
                dotsWrap.appendChild(d);
            }
        }

        function update() {
            if (!cards.length) return;
            const cardW = cards[0].offsetWidth + GAP;
            track.style.transform = `translateX(${-idx * cardW}px)`;
            dotsWrap.querySelectorAll(".carousel-dot").forEach((d, i) => {
                d.classList.toggle("active", i === idx);
            });
        }

        function goTo(i) {
            idx = Math.max(0, Math.min(i, getMaxIdx()));
            update();
            resetAuto();
        }

        function next() { goTo(idx >= getMaxIdx() ? 0 : idx + 1); }
        function prev() { goTo(idx <= 0 ? getMaxIdx() : idx - 1); }

        prevBtn.addEventListener("click", prev);
        nextBtn.addEventListener("click", next);

        function resetAuto() {
            clearInterval(autoTimer);
            autoTimer = setInterval(next, 5000);
        }

        // Touch/swipe support
        let touchX = 0;
        viewport.addEventListener("touchstart", e => { touchX = e.touches[0].clientX; }, { passive: true });
        viewport.addEventListener("touchend", e => {
            const diff = touchX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
        }, { passive: true });

        buildDots();
        update();
        resetAuto();

        let cResizeTimer;
        window.addEventListener("resize", () => {
            clearTimeout(cResizeTimer);
            cResizeTimer = setTimeout(() => {
                if (idx > getMaxIdx()) idx = getMaxIdx();
                buildDots();
                update();
            }, 200);
        });
    }
});
