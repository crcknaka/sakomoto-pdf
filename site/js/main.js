document.addEventListener('DOMContentLoaded', () => {
    const totalPages = 11;
    const navDots = document.getElementById('navDots');

    // Create navigation dots
    for (let i = 1; i <= totalPages; i++) {
        const dot = document.createElement('div');
        dot.className = 'nav-dot' + (i === 1 ? ' active' : '');
        dot.dataset.page = i;
        dot.addEventListener('click', () => {
            document.getElementById('page-' + i).scrollIntoView({ behavior: 'smooth' });
        });
        navDots.appendChild(dot);
    }

    // Track active page with IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const pageNum = entry.target.id.split('-')[1];
                document.querySelectorAll('.nav-dot').forEach(d => d.classList.remove('active'));
                document.querySelector(`.nav-dot[data-page="${pageNum}"]`).classList.add('active');
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.page').forEach(page => observer.observe(page));

    // Image load animation
    function initImageLoaders() {
        document.querySelectorAll('.page img').forEach(img => {
            if (img.complete && img.naturalWidth > 0) {
                img.classList.add('loaded');
            } else {
                img.onload = () => img.classList.add('loaded');
            }
        });
    }
    initImageLoaders();

    // Language switcher
    let currentLang = 'en';

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            if (lang === currentLang) return;

            currentLang = lang;
            document.documentElement.lang = lang;

            // Update active button
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Swap image sources
            document.querySelectorAll('.page picture').forEach(picture => {
                const source = picture.querySelector('source');
                const img = picture.querySelector('img');

                const webpSrc = source.getAttribute('srcset').replace(/images\/\w+\//, `images/${lang}/`);
                const jpgSrc = img.getAttribute('src').replace(/images\/\w+\//, `images/${lang}/`);

                // Fade out
                img.classList.remove('loaded');

                setTimeout(() => {
                    source.setAttribute('srcset', webpSrc);
                    img.setAttribute('src', jpgSrc);
                    img.onload = () => img.classList.add('loaded');
                }, 300);
            });
        });
    });
});
