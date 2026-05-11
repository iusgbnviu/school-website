// Yufeng University - Shared Scripts
// Lenis smooth scroll + GSAP animations + data-expand + modal

(function () {
    'use strict';

    // ========================================
    // 1. LENIS SMOOTH SCROLL
    // ========================================
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.4,
            easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Sync ScrollTrigger with Lenis
        if (typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);

            if (typeof gsap !== 'undefined') {
                gsap.ticker.add(function (time) {
                    lenis.raf(time * 1000);
                });
                gsap.ticker.lagSmoothing(0);
            }
        }

        // Smooth anchor links
        document.addEventListener('click', function (e) {
            var anchor = e.target.closest('a[href^="#"]');
            if (!anchor) return;
            // Skip data-expand triggers
            if (anchor.hasAttribute('data-expand')) return;
            var href = anchor.getAttribute('href');
            if (href === '#') return;
            var target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                lenis.scrollTo(target, { offset: -80, duration: 1.8 });
            }
        });

        // Store for external use
        window.__lenis = lenis;
    }

    // ========================================
    // 2. GSAP SCROLLTRIGGER - REVEAL ANIMATIONS
    // ========================================
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Reveal elements on scroll (CSS transition approach)
        var revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
        if (revealEls.length > 0 && 'IntersectionObserver' in window) {
            var revealObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

            revealEls.forEach(function (el) { revealObserver.observe(el); });
        }

        // Counter animation
        var counters = document.querySelectorAll('.counter');
        counters.forEach(function (counter) {
            var target = parseInt(counter.getAttribute('data-target'));
            if (!target) return;

            ScrollTrigger.create({
                trigger: counter,
                start: 'top 85%',
                once: true,
                onEnter: function () {
                    gsap.to(counter, {
                        innerHTML: target,
                        duration: 2.5,
                        snap: { innerHTML: 1 },
                        ease: 'power2.out'
                    });
                }
            });
        });
    }

    // ========================================
    // 3. DATA-EXPAND HANDLER
    // ========================================
    document.addEventListener('click', function (e) {
        var trigger = e.target.closest('[data-expand]');
        if (!trigger) return;
        e.preventDefault();

        var targetId = trigger.getAttribute('data-expand');
        var target = document.getElementById('expand-' + targetId);
        if (!target) return;

        var isActive = target.classList.contains('active');

        // Close all other expands in same section first
        var section = target.closest('.section') || target.closest('.news-item') || target.parentElement;
        if (section) {
            var allExpands = section.querySelectorAll('.expand-content.active');
            allExpands.forEach(function (el) {
                if (el !== target) el.classList.remove('active');
            });
        }
        // Also close triggers
        if (section) {
            var allTriggers = section.querySelectorAll('.expand-trigger.active');
            allTriggers.forEach(function (el) {
                if (el !== trigger) el.classList.remove('active');
            });
        }

        // Toggle current
        if (isActive) {
            target.classList.remove('active');
            trigger.classList.remove('active');
        } else {
            target.classList.add('active');
            trigger.classList.add('active');
            // Scroll to content
            if (window.__lenis) {
                setTimeout(function () {
                    window.__lenis.scrollTo(target, { offset: -100, duration: 1 });
                }, 150);
            } else {
                setTimeout(function () {
                    target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 150);
            }
        }
    });

    // Close expand on clicking close button
    document.addEventListener('click', function (e) {
        var closeBtn = e.target.closest('.close-expand');
        if (!closeBtn) return;
        var expandContent = closeBtn.closest('.expand-content');
        if (!expandContent) return;

        var expandId = expandContent.id.replace('expand-', '');
        var trigger = document.querySelector('[data-expand="' + expandId + '"]');

        expandContent.classList.remove('active');
        if (trigger) trigger.classList.remove('active');
    });

    // ========================================
    // 4. MODAL HANDLER
    // ========================================
    function openModal(modalId) {
        var modal = document.getElementById(modalId);
        if (!modal) return;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modalId) {
        var modal = document.getElementById(modalId);
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Open modal via data-modal attribute
    document.addEventListener('click', function (e) {
        var trigger = e.target.closest('[data-modal]');
        if (!trigger) return;
        e.preventDefault();
        var modalId = trigger.getAttribute('data-modal');
        openModal(modalId);
    });

    // Close modal on overlay click
    document.addEventListener('click', function (e) {
        if (!e.target.classList.contains('modal-overlay')) return;
        closeModal(e.target.id);
    });

    // Close modal on close button
    document.addEventListener('click', function (e) {
        var closeBtn = e.target.closest('.modal-close');
        if (!closeBtn) return;
        var modal = closeBtn.closest('.modal-overlay');
        if (!modal) return;
        closeModal(modal.id);
    });

    // Close modal on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            var activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) closeModal(activeModal.id);
        }
    });

    // Form submit handler (static)
    document.addEventListener('submit', function (e) {
        var form = e.target.closest('.modal-form');
        if (!form) return;
        e.preventDefault();

        var submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = '提交成功！';
            submitBtn.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';
            submitBtn.disabled = true;
        }

        // Close modal after delay
        setTimeout(function () {
            var modal = form.closest('.modal-overlay');
            if (modal) closeModal(modal.id);
            // Reset button
            if (submitBtn) {
                setTimeout(function () {
                    submitBtn.textContent = '提交报名';
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 500);
            }
        }, 1500);
    });

    // ========================================
    // 5. NAVBAR SCROLL BEHAVIOR
    // ========================================
    if (typeof Lenis !== 'undefined') {
        if (window.__lenis) {
            window.__lenis.on('scroll', function (_a) {
                var scroll = _a.scroll;
                var header = document.querySelector('header');
                if (!header) return;
                if (scroll > 80) {
                    header.style.boxShadow = '0 4px 30px rgba(0,0,0,0.12)';
                } else {
                    header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.08)';
                }
            });
        }
    } else {
        // Fallback: simple scroll listener
        var lastScrollY = 0;
        window.addEventListener('scroll', function () {
            var header = document.querySelector('header');
            if (!header) return;
            var scrollY = window.scrollY;
            if (scrollY > 80) {
                header.style.boxShadow = '0 4px 30px rgba(0,0,0,0.12)';
            } else {
                header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.08)';
            }
            lastScrollY = scrollY;
        }, { passive: true });
    }

    // ========================================
    // 6. BACK TO TOP BUTTON
    // ========================================
    var backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        function toggleBackToTop() {
            var scrollY = window.__lenis ? window.__lenis.scroll : window.scrollY;
            if (scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }

        if (typeof Lenis !== 'undefined' && window.__lenis) {
            window.__lenis.on('scroll', toggleBackToTop);
        } else {
            window.addEventListener('scroll', toggleBackToTop, { passive: true });
        }

        backToTop.addEventListener('click', function () {
            if (window.__lenis) {
                window.__lenis.scrollTo(0, { duration: 1.5 });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    console.log('%c御风大学 %c交互系统已就绪', 'color: #A51C30; font-weight: bold; font-size: 14px;', 'color: #666; font-size: 12px;');

})();
