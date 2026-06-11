/**
 * WINNIE'S ADVENTURES - INTERACTIVE COMPONENT SCRIPTS
 * Custom ScrollSpy, Tab Switchers, Form Handlers, and Mobile Layout Drawer
 */

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================================================
       1. MOBILE BURGER DRAWER MENU
       ========================================================== */
    const burgerBtn = document.querySelector('.burger-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-links a');

    // Toggle menu
    burgerBtn.addEventListener('click', () => {
        const isExpanded = burgerBtn.getAttribute('aria-expanded') === 'true';
        burgerBtn.setAttribute('aria-expanded', !isExpanded);
        burgerBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when navigation link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            burgerBtn.setAttribute('aria-expanded', 'false');
            burgerBtn.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside of it
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') &&
            !navMenu.contains(e.target) &&
            !burgerBtn.contains(e.target)) {
            burgerBtn.setAttribute('aria-expanded', 'false');
            burgerBtn.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // Close mobile menu automatically on page scroll
    window.addEventListener('scroll', () => {
        if (navMenu.classList.contains('active')) {
            burgerBtn.setAttribute('aria-expanded', 'false');
            burgerBtn.classList.remove('active');
            navMenu.classList.remove('active');
        }
    }, { passive: true });


    /* ==========================================================
       2. SMOOTH SCROLL WITH SECTION HEADER OFFSET
       ========================================================== */
    document.querySelectorAll('.nav-links a, .logo-wrapper a, .action-btn').forEach(link => {
        link.addEventListener('click', function (e) {
            const hrefAttr = this.getAttribute('href');

            // Only process on-page hashes
            if (hrefAttr && hrefAttr.startsWith('#')) {
                e.preventDefault();
                const targetId = hrefAttr.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    const headerHeight = document.querySelector('.main-header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Update URL hash without jumping
                    history.pushState(null, null, `#${targetId}`);
                }
            }
        });
    });


    /* ==========================================================
       3. SCROLLSPY (ACTIVE LINK STATE HIGHLIGHTING)
       ========================================================== */
    const sections = document.querySelectorAll('section');
    const headerElement = document.querySelector('.main-header');

    const scrollSpy = () => {
        const headerHeight = headerElement.offsetHeight + 40; // margin offset
        const currentScroll = window.scrollY;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (currentScroll >= sectionTop && currentScroll < sectionTop + sectionHeight) {
                // Find matching link
                document.querySelectorAll('.nav-links a').forEach(link => {
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });

        // Remove active class from all if scrolled to the absolute top (Home page)
        if (currentScroll < 100) {
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
            });
        }
    };

    window.addEventListener('scroll', scrollSpy);
    // Trigger on load
    scrollSpy();


    /* ==========================================================
       4. INTERACTIVE WEEKLY MENU TABS
       ========================================================== */
    const tabBtns = document.querySelectorAll('.menu-tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // Remove active from all buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            // Remove active from all panels
            tabPanels.forEach(p => p.classList.remove('active'));

            // Add active to current button
            this.classList.add('active');

            // Show corresponding panel
            const panelId = this.getAttribute('data-menu');
            const targetPanel = document.getElementById(panelId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });


    /* ==========================================================
       5. DIGITAL ENQUIRY FORM HANDLER
       ========================================================== */
    const enquiryForm = document.getElementById('enquiry-form');
    const successModal = document.getElementById('success-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const formDateInput = document.getElementById('form-date');

    // Auto-fill form date with current local date
    if (formDateInput) {
        const today = new Date().toISOString().split('T')[0];
        formDateInput.value = today;
    }

    if (enquiryForm) {
        enquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Validate checkboxes
            const selectedDays = document.querySelectorAll('input[name="days"]:checked');
            if (selectedDays.length === 0) {
                alert('Please select at least one day required.');
                return;
            }

            // Gather values for submission logging (can be adapted for real API endpoint)
            const formData = new FormData(enquiryForm);
            const dataObject = {};
            formData.forEach((value, key) => {
                if (key === 'days') {
                    if (!dataObject[key]) dataObject[key] = [];
                    dataObject[key].push(value);
                } else {
                    dataObject[key] = value;
                }
            });

            // Format days array to a comma-separated string for the email template
            if (dataObject.days && Array.isArray(dataObject.days)) {
                dataObject.days = dataObject.days.join(', ');
            }

            // Update button UI to show loading state
            const submitBtn = enquiryForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            // SEND VIA EMAILJS
            // REPLACE "YOUR_SERVICE_ID" and "YOUR_TEMPLATE_ID" with your actual IDs
            emailjs.send("service_xup59s7", "template_srbs3dr", dataObject)
                .then(function (response) {
                    console.log('SUCCESS!', response.status, response.text);

                    // Trigger Modal Pop up on success
                    if (successModal) {
                        successModal.classList.add('active');
                        successModal.setAttribute('aria-hidden', 'false');
                        document.body.style.overflow = 'hidden'; // Lock scrolling
                    }
                }, function (error) {
                    console.error('FAILED...', error);
                    alert("Sorry, there was an issue sending your enquiry. Please try again or email us directly.");
                })
                .finally(function () {
                    // Restore button state
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }

    // Modal Close Trigger
    if (closeModalBtn && successModal) {
        closeModalBtn.addEventListener('click', () => {
            successModal.classList.remove('active');
            successModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = ''; // Unlock scrolling

            // Reset enquiry form fields
            if (enquiryForm) {
                enquiryForm.reset();
                // Refill date field
                if (formDateInput) {
                    const today = new Date().toISOString().split('T')[0];
                    formDateInput.value = today;
                }
            }
        });

        // Close modal when clicking on background overlay
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                closeModalBtn.click();
            }
        });
    }

    /* ==========================================================
       6. SCROLL REVEAL ANIMATIONS
       ========================================================== */
    const revealOptions = {
        root: null,
        rootMargin: '0px 0px 50px 0px', /* Trigger slightly before element enters viewport */
        threshold: 0.05 /* Trigger almost immediately */
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, revealOptions);

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach(el => revealObserver.observe(el));
    /* ==========================================================
       7. FLATPICKR INITIALIZATION (CUSTOM DATE PICKER)
       ========================================================== */
    if (typeof flatpickr !== 'undefined') {
        flatpickr("input[type='date']", {
            dateFormat: "Y-m-d",
            disableMobile: true // Enforce custom compact UI on all devices
        });
    }

    /* ==========================================================
       8. HERO BACKGROUND OVERLAY SCROLL FADE
       ========================================================== */
    const heroOverlay = document.querySelector('.hero-overlay');
    const heroSection = document.querySelector('.hero-section');
    if (heroOverlay && heroSection) {
        // Trigger on scroll
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const heroHeight = heroSection.offsetHeight;
            
            // Fade out the overlay over the top 80% of the hero section
            let opacity = 1 - (scrollY / (heroHeight * 0.8));
            
            // Clamp opacity between 0 and 1
            if (opacity < 0) opacity = 0;
            if (opacity > 1) opacity = 1;
            
            heroOverlay.style.opacity = opacity;
        }, { passive: true });
        
        // Trigger immediately on load
        window.dispatchEvent(new Event('scroll'));
    }

    /* ==========================================================
       9. ANTI-INSPECT / RIGHT-CLICK PROTECTION
       ========================================================== */
    // Disable right-click context menu
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // Disable common keyboard shortcuts for developer tools
    document.addEventListener('keydown', (e) => {
        // F12 key
        if (e.key === 'F12') {
            e.preventDefault();
        }
        
        // Ctrl+Shift+I or Cmd+Option+I (Inspect)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
            e.preventDefault();
        }

        // Ctrl+Shift+C or Cmd+Option+C (Inspect Element)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
            e.preventDefault();
        }
        
        // Ctrl+Shift+J or Cmd+Option+J (Console)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
            e.preventDefault();
        }
        
        // Ctrl+U or Cmd+U (View Source)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
            e.preventDefault();
        }
    });
});