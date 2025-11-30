/**
 * 御风图书馆 - Apple Style Interactions
 * Features: Smooth Scrolling with Inertia, GSAP Animations, Mouse Tracking
 */

// ========================================
// 1. SMOOTH SCROLL WITH INERTIA & DAMPING
// ========================================

class SmoothScroll {
    constructor() {
        this.scrollTarget = 0;
        this.scrollCurrent = 0;
        this.ease = 0.075; // Damping factor (lower = smoother/heavier feel)
        this.isScrolling = false;
        this.init();
    }

    init() {
        // Set body height to enable scrolling
        document.body.style.height = `${document.documentElement.scrollHeight}px`;
        
        // Create smooth scroll container
        this.smoothContainer = document.querySelector('body');
        
        // Listen to mouse wheel
        window.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
        
        // Listen to scroll (for scrollbar dragging)
        window.addEventListener('scroll', () => this.onScroll());
        
        // Start animation loop
        this.render();
    }

    onWheel(e) {
        e.preventDefault();
        
        // Update target scroll position
        this.scrollTarget += e.deltaY;
        
        // Clamp to valid range
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        this.scrollTarget = Math.max(0, Math.min(this.scrollTarget, maxScroll));
        
        this.isScrolling = true;
    }

    onScroll() {
        // Sync with manually dragged scrollbar
        if (!this.isScrolling) {
            this.scrollTarget = window.pageYOffset;
            this.scrollCurrent = window.pageYOffset;
        }
    }

    render() {
        // Lerp (linear interpolation) for smooth easing
        this.scrollCurrent += (this.scrollTarget - this.scrollCurrent) * this.ease;
        
        // Round to avoid subpixel values
        this.scrollCurrent = Math.round(this.scrollCurrent * 100) / 100;
        
        // Apply transform
        this.smoothContainer.style.transform = `translateY(-${this.scrollCurrent}px)`;
        
        // Check if scroll animation has stopped
        if (Math.abs(this.scrollTarget - this.scrollCurrent) < 0.1) {
            this.isScrolling = false;
        }
        
        // Continue animation loop
        requestAnimationFrame(() => this.render());
    }
}

// Initialize smooth scroll
const smoothScroll = new SmoothScroll();

// ========================================
// 2. GSAP SCROLL ANIMATIONS (Power3.out)
// ========================================

gsap.registerPlugin(ScrollTrigger);

// Configure ScrollTrigger to work with our custom smooth scroll
ScrollTrigger.config({
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
});

// Animate all elements with .reveal-element class
const revealElements = document.querySelectorAll('.reveal-element');

revealElements.forEach((element, index) => {
    gsap.to(element, {
        scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            end: 'top 20%',
            toggleActions: 'play none none none',
            // Sync with our smooth scroll
            scroller: window,
            onUpdate: (self) => {
                // Update based on actual scroll position
                const progress = self.progress;
                element.style.opacity = progress;
                element.style.transform = `translateY(${60 * (1 - progress)}px)`;
            }
        },
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
        delay: index * 0.05 // Stagger effect
    });
});

// Update ScrollTrigger on our smooth scroll
function updateScrollTrigger() {
    ScrollTrigger.update();
    requestAnimationFrame(updateScrollTrigger);
}
updateScrollTrigger();

// ========================================
// 3. MOUSE TRACKING FOR BACKGROUND
// ========================================

let mouseX = 0.5;
let mouseY = 0.5;
let currentX = 0.5;
let currentY = 0.5;

// Track mouse position
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
});

// Smooth mouse tracking animation
function animateMouseTracking() {
    // Ease towards target position
    currentX += (mouseX - currentX) * 0.1;
    currentY += (mouseY - currentY) * 0.1;
    
    // Update CSS variables
    document.documentElement.style.setProperty('--mouse-x', `${currentX * 100}%`);
    document.documentElement.style.setProperty('--mouse-y', `${currentY * 100}%`);
    
    requestAnimationFrame(animateMouseTracking);
}

animateMouseTracking();

// ========================================
// 4. INTERACTIVE CARD TILT EFFECT
// ========================================

const interactiveCards = document.querySelectorAll('.interactive-card');

interactiveCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * 5; // Max 5 degrees
        const rotateY = ((centerX - x) / centerX) * 5;
        
        gsap.to(card, {
            duration: 0.3,
            rotateX: rotateX,
            rotateY: rotateY,
            transformPerspective: 1000,
            ease: 'power2.out'
        });
    });
    
    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            duration: 0.5,
            rotateX: 0,
            rotateY: 0,
            ease: 'power3.out'
        });
    });
});

// ========================================
// 5. NAVIGATION HIDE/SHOW ON SCROLL
// ========================================

let lastScrollY = 0;
const nav = document.querySelector('.lib-nav');

function checkScroll() {
    const currentScrollY = smoothScroll.scrollCurrent;
    
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        nav.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up
        nav.style.transform = 'translateY(0)';
    }
    
    lastScrollY = currentScrollY;
    requestAnimationFrame(checkScroll);
}

checkScroll();

// ========================================
// 6. PARALLAX EFFECT ON HERO STATS
// ========================================

const heroStats = document.querySelector('.hero-stats');

if (heroStats) {
    gsap.to(heroStats, {
        scrollTrigger: {
            trigger: '.lib-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
            scroller: window
        },
        y: 150,
        opacity: 0,
        ease: 'none'
    });
}

// ========================================
// 7. ENTRANCE ANIMATION FOR HERO
// ========================================

gsap.from('.hero-content-lib h1', {
    duration: 1.2,
    y: 80,
    opacity: 0,
    ease: 'power3.out',
    delay: 0.2
});

gsap.from('.hero-content-lib p', {
    duration: 1.2,
    y: 60,
    opacity: 0,
    ease: 'power3.out',
    delay: 0.4
});

gsap.from('.hero-stats .stat', {
    duration: 1,
    y: 40,
    opacity: 0,
    ease: 'power3.out',
    stagger: 0.1,
    delay: 0.6
});

// ========================================
// 8. NUMBERS COUNTING ANIMATION
// ========================================

const animateNumber = (element) => {
    const target = element.textContent;
    const isNumber = !isNaN(parseFloat(target));
    
    if (isNumber) {
        const finalValue = parseFloat(target.replace(/[^0-9.]/g, ''));
        const suffix = target.replace(/[0-9.]/g, '');
        
        gsap.to({ val: 0 }, {
            duration: 2,
            val: finalValue,
            ease: 'power2.out',
            onUpdate: function() {
                element.textContent = Math.floor(this.targets()[0].val).toLocaleString() + suffix;
            }
        });
    }
};

// Trigger number animation when stats enter viewport
ScrollTrigger.create({
    trigger: '.hero-stats',
    start: 'top 80%',
    once: true,
    onEnter: () => {
        document.querySelectorAll('.stat-number').forEach(animateNumber);
    }
});

// ========================================
// 9. SMOOTH ANCHOR LINKS
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            const targetPosition = targetElement.offsetTop - 80; // Account for fixed nav
            smoothScroll.scrollTarget = targetPosition;
        }
    });
});

// ========================================
// 10. ACCESSIBILITY: Respect reduced motion
// ========================================

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Disable smooth scroll
    smoothScroll.ease = 1;
    
    // Disable GSAP animations
    gsap.globalTimeline.timeScale(10);
    
    console.log('Reduced motion preference detected - animations simplified');
}

// ========================================
// INITIALIZATION COMPLETE
// ========================================

console.log('%c御风图书馆 %c已加载', 'color: #721817; font-weight: bold; font-size: 16px;', 'color: #86868b; font-size: 14px;');
console.log('✨ Smooth scroll active | 🎨 GSAP animations loaded | 🖱️ Mouse tracking enabled');
