'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Slide } from '@/lib/types';

interface Props {
  slides: Slide[];
}

export default function SlideViewer({ slides }: Props) {
  const [currentLang, setCurrentLang] = useState<'en' | 'fr'>('en');
  const [isMobile, setIsMobile] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const sectionRef = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return;
      if (!observerRef.current) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const idx = Number(entry.target.getAttribute('data-index'));
                setActivePage(idx);
              }
            });
          },
          { threshold: 0.5 }
        );
      }
      observerRef.current.observe(node);
    },
    []
  );

  function getImageUrl(slide: Slide): string {
    const langImages = slide.images[currentLang] || slide.images.en;
    if (isMobile && langImages.mobile) return langImages.mobile;
    return langImages.desktop;
  }

  function getFallbackUrl(url: string): string {
    return url.replace('.webp', '.jpg');
  }

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    e.currentTarget.classList.add('loaded');
  }

  function switchLang(lang: 'en' | 'fr') {
    if (lang === currentLang) return;
    setCurrentLang(lang);
    // Trigger fade by removing loaded class
    document.querySelectorAll('.page img').forEach((img) => {
      img.classList.remove('loaded');
    });
    // Re-add after src changes propagate
    setTimeout(() => {
      document.querySelectorAll('.page img').forEach((img) => {
        const el = img as HTMLImageElement;
        if (el.complete && el.naturalWidth > 0) el.classList.add('loaded');
      });
    }, 100);
  }

  return (
    <>
      {/* Language Switcher */}
      <div className="lang-switch">
        <button
          className={`lang-btn ${currentLang === 'en' ? 'active' : ''}`}
          onClick={() => switchLang('en')}
          title="English"
          aria-label="Switch to English"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30">
            <clipPath id="gb"><rect width="60" height="30" /></clipPath>
            <g clipPath="url(#gb)">
              <path d="M0 0v30h60V0z" fill="#012169" />
              <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" />
              <path d="M0 0l60 30m0-30L0 30" clipPath="url(#gb)" stroke="#C8102E" strokeWidth="4" />
              <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
              <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
            </g>
          </svg>
        </button>
        <button
          className={`lang-btn ${currentLang === 'fr' ? 'active' : ''}`}
          onClick={() => switchLang('fr')}
          title="Français"
          aria-label="Passer au Français"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2">
            <rect width="1" height="2" fill="#002395" />
            <rect width="1" height="2" x="1" fill="#fff" />
            <rect width="1" height="2" x="2" fill="#ED2939" />
          </svg>
        </button>
      </div>

      {/* Navigation Dots */}
      <nav className="nav-dots" aria-label="Slide navigation">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`nav-dot ${activePage === i ? 'active' : ''}`}
            onClick={() =>
              document.getElementById(`slide-${i}`)?.scrollIntoView({ behavior: 'smooth' })
            }
          />
        ))}
      </nav>

      {/* Slides */}
      <main>
        {slides.map((slide, i) => {
          const imgUrl = getImageUrl(slide);
          const altText = slide.alt[currentLang] || slide.alt.en;
          return (
            <section
              key={slide.id}
              id={`slide-${i}`}
              className="page"
              data-index={i}
              ref={sectionRef}
              aria-label={slide.label}
            >
              <picture>
                <source srcSet={imgUrl} type="image/webp" />
                <img
                  src={getFallbackUrl(imgUrl)}
                  alt={altText}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  onLoad={handleImageLoad}
                />
              </picture>
              <div className="sr-only">
                {i === 0 ? <h1>{slide.seo.heading}</h1> : <h2>{slide.seo.heading}</h2>}
                {slide.seo.textEn && <p lang="en">{slide.seo.textEn}</p>}
                {slide.seo.textIt && <p lang="it">{slide.seo.textIt}</p>}
                {slide.seo.textFr && <p lang="fr">{slide.seo.textFr}</p>}
              </div>
            </section>
          );
        })}
      </main>
    </>
  );
}
