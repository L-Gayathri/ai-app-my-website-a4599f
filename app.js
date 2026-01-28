document.addEventListener('DOMContentLoaded', () => {
            const navLinks = document.querySelector('.nav-links');
            const hamburgerMenu = document.querySelector('.hamburger-menu');
            const navItems = document.querySelectorAll('.nav-item');
            const sections = document.querySelectorAll('section');
            const scrollLinks = document.querySelectorAll('a[href^="#"], button[data-target-scroll]');
            const revealElements = document.querySelectorAll('.reveal-item');
            const jewelCardsContainer = document.getElementById('jewel-cards-container');
            const contactForm = document.querySelector('.contact-form');

            // --- Hamburger Menu Toggle ---
            hamburgerMenu.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                hamburgerMenu.classList.toggle('active');
            });

            // Close mobile menu when a nav item is clicked
            navItems.forEach(item => {
                item.addEventListener('click', () => {
                    if (navLinks.classList.contains('active')) {
                        navLinks.classList.remove('active');
                        hamburgerMenu.classList.remove('active');
                    }
                });
            });

            // --- Smooth Scrolling for Navigation ---
            scrollLinks.forEach(link => {
                link.addEventListener('click', (event) => {
                    event.preventDefault(); // Prevent default anchor link behavior

                    let targetId;
                    if (link.tagName === 'A') {
                        targetId = link.getAttribute('href').substring(1); // Remove '#'
                    } else if (link.tagName === 'BUTTON') {
                        targetId = link.dataset.targetScroll;
                    }

                    const targetElement = document.getElementById(targetId);

                    if (targetElement) {
                        // Use scrollIntoView for smooth scrolling
                        targetElement.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                });
            });


            // --- Active Navigation Highlight on Scroll ---
            const observerOptions = {
                root: null, // viewport
                rootMargin: '-50% 0% -50% 0%', // Trigger when section is in the middle 50% of viewport
                threshold: 0 // Observe entry/exit
            };

            const sectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const navItem = document.querySelector(`.nav-item[data-target="${entry.target.id}"]`);
                    if (navItem) {
                        if (entry.isIntersecting) {
                            navItems.forEach(item => item.classList.remove('active')); // Remove active from all
                            navItem.classList.add('active'); // Add active to current
                        } else {
                            // Optional: remove active when scrolling out, or let the next section handle it.
                            // For a robust SPA, it's better to let the next intersection manage it.
                            // This ensures at least one item is active when there's an overlap or rapid scroll.
                        }
                    }
                });
            }, observerOptions);

            sections.forEach(section => {
                sectionObserver.observe(section);
            });

            // Set initial active state for the first section on load
            const initialSection = document.getElementById('home');
            if (initialSection) {
                const homeNavItem = document.querySelector('.nav-item[data-target="home"]');
                if (homeNavItem) {
                    homeNavItem.classList.add('active');
                }
            }


            // --- Reveal-on-Scroll Effect ---
            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target); // Stop observing once revealed
                    }
                });
            }, {
                root: null,
                rootMargin: '0px',
                threshold: 0.2 // Trigger when 20% of the item is visible
            });

            revealElements.forEach(element => {
                revealObserver.observe(element);
            });

            // --- API Data Fetch and Fallback ---
            const API_URL = 'https://jsonplaceholder.typicode.com/posts'; // Using posts for demonstration

            function createJewelCard(data) {
                const card = document.createElement('div');
                card.classList.add('jewel-card', 'reveal-item'); // Add reveal class for new items too

                const price = `$${(Math.random() * (5000 - 500) + 500).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
                const description = data.body.length > 120 ? data.body.substring(0, 117) + '...' : data.body;
                const title = data.title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');


                card.innerHTML = `
                    <div class="image-placeholder card-img">ADD IMAGE</div>
                    <h4>${title}</h4>
                    <p class="price">${price}</p>
                    <p class="description">${description}</p>
                    <button type="button" class="buy-button">View Details</button>
                `;
                return card;
            }

            async function fetchJewels() {
                try {
                    const response = await fetch(API_URL);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();

                    // Take a subset of data, e.g., 6 items for our cards
                    const limitedData = data.slice(0, 6);

                    // Clear existing placeholder cards only if data is successfully fetched
                    jewelCardsContainer.innerHTML = '';

                    limitedData.forEach(item => {
                        const newCard = createJewelCard(item);
                        jewelCardsContainer.appendChild(newCard);
                        // Observe newly created cards for reveal animation
                        revealObserver.observe(newCard);
                    });
                } catch (error) {
                    // Log the error internally, but display no error messages to the user.
                    // The pre-rendered placeholder cards will remain visible.
                    console.error('Failed to fetch jewel data:', error);
                }
            }

            fetchJewels(); // Call fetch on page load

            // --- Contact Form Submission ---
            if (contactForm) {
                contactForm.addEventListener('submit', (event) => {
                    event.preventDefault(); // Prevent page reload
                    // In a real application, you would send this data to a backend.
                    alert('Thank you for your message! We will get back to you shortly.');
                    contactForm.reset();
                });
            }
        });