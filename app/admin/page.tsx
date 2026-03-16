'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Slide, SlidesData } from '@/lib/types';
import { useRouter } from 'next/navigation';
import './admin.css';

type ImageVariant = 'en-desktop' | 'en-mobile' | 'fr-desktop' | 'fr-mobile';

export default function AdminPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [editSlide, setEditSlide] = useState<Slide | null>(null);
  const [activeTab, setActiveTab] = useState<ImageVariant>('en-desktop');
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchSlides();
  }, []);

  async function fetchSlides() {
    const res = await fetch('/api/slides');
    if (!res.ok) {
      router.push('/admin/login');
      return;
    }
    const data: SlidesData = await res.json();
    setSlides(data.slides.sort((a, b) => a.order - b.order));
    setLoading(false);
  }

  async function saveAll(updatedSlides?: Slide[]) {
    setSaving(true);
    const toSave = updatedSlides || slides;
    const res = await fetch('/api/slides', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slides: toSave }),
    });

    if (res.status === 401) {
      router.push('/admin/login');
      return;
    }

    setSaving(false);
    setStatus(res.ok ? 'Saved!' : 'Error saving');
    setTimeout(() => setStatus(''), 3000);
  }

  // Drag & Drop
  function handleDragStart(idx: number) {
    dragItem.current = idx;
  }

  function handleDragEnter(idx: number) {
    dragOver.current = idx;
  }

  function handleDragEnd() {
    if (dragItem.current === null || dragOver.current === null) return;
    const items = [...slides];
    const dragged = items.splice(dragItem.current, 1)[0];
    items.splice(dragOver.current, 0, dragged);
    const reordered = items.map((s, i) => ({ ...s, order: i + 1 }));
    setSlides(reordered);
    dragItem.current = null;
    dragOver.current = null;
    saveAll(reordered);
  }

  // Upload image
  const handleUpload = useCallback(async (file: File, slide: Slide, variant: ImageVariant) => {
    const [lang, device] = variant.split('-') as ['en' | 'fr', 'desktop' | 'mobile'];
    const ext = file.type.includes('webp') ? 'webp' : file.type.includes('png') ? 'png' : 'jpg';
    const filename = `${lang}/${device}/${slide.id}.${ext}`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', filename);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) return;

    const { url } = await res.json();

    setSlides((prev) => {
      const updated = prev.map((s) => {
        if (s.id !== slide.id) return s;
        const newSlide = { ...s, images: { ...s.images } };
        if (!newSlide.images[lang]) {
          newSlide.images[lang] = { desktop: '' };
        }
        newSlide.images[lang] = { ...newSlide.images[lang]!, [device]: url };
        return newSlide;
      });
      saveAll(updated);
      return updated;
    });
  }, []);

  // Update slide fields
  function updateSlide(id: string, updates: Partial<Slide>) {
    setSlides((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      return updated;
    });
  }

  function updateSeo(id: string, field: string, value: string) {
    setSlides((prev) => {
      const updated = prev.map((s) =>
        s.id === id ? { ...s, seo: { ...s.seo, [field]: value } } : s
      );
      return updated;
    });
  }

  function updateAlt(id: string, lang: 'en' | 'fr', value: string) {
    setSlides((prev) => {
      const updated = prev.map((s) =>
        s.id === id ? { ...s, alt: { ...s.alt, [lang]: value } } : s
      );
      return updated;
    });
  }

  // Add new slide
  function addSlide() {
    const id = `slide-${Date.now()}`;
    const newSlide: Slide = {
      id,
      order: slides.length + 1,
      label: 'New Slide',
      images: { en: { desktop: '' } },
      alt: { en: '' },
      seo: { heading: 'New Slide' },
    };
    const updated = [...slides, newSlide];
    setSlides(updated);
    setEditSlide(newSlide);
  }

  // Delete slide
  function deleteSlide(id: string) {
    if (!confirm('Delete this slide?')) return;
    const updated = slides
      .filter((s) => s.id !== id)
      .map((s, i) => ({ ...s, order: i + 1 }));
    setSlides(updated);
    saveAll(updated);
    if (editSlide?.id === id) setEditSlide(null);
  }

  function getThumbUrl(slide: Slide): string {
    return slide.images.en?.desktop || slide.images.fr?.desktop || '';
  }

  function getVariantUrl(slide: Slide, variant: ImageVariant): string {
    const [lang, device] = variant.split('-') as ['en' | 'fr', 'desktop' | 'mobile'];
    const langImages = slide.images[lang];
    if (!langImages) return '';
    return device === 'mobile' ? langImages.mobile || '' : langImages.desktop;
  }

  if (loading) {
    return (
      <div className="admin" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="admin">
      <h1>
        Slide Manager
        <div className="admin-actions">
          <button onClick={addSlide}>+ Add Slide</button>
          <button className="primary" onClick={() => saveAll()}>
            {saving ? 'Saving...' : 'Save All'}
          </button>
          <a href="/" target="_blank" rel="noopener noreferrer">
            <button>View Site →</button>
          </a>
        </div>
      </h1>

      {/* Slide Grid */}
      <div className="slide-grid">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className="slide-card"
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragEnter={() => handleDragEnter(idx)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="slide-card-header">
              <span>{slide.label}</span>
              <span className="order">#{slide.order}</span>
            </div>
            {getThumbUrl(slide) ? (
              <img className="slide-card-thumb" src={getThumbUrl(slide)} alt={slide.label} />
            ) : (
              <div className="slide-card-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                No image
              </div>
            )}
            <div className="slide-card-actions">
              <button onClick={() => { setEditSlide(slide); setActiveTab('en-desktop'); }}>
                Edit
              </button>
              <button className="danger" onClick={() => deleteSlide(slide.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editSlide && (
        <div className="modal-overlay" onClick={() => { setEditSlide(null); saveAll(); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { setEditSlide(null); saveAll(); }}>
              ✕
            </button>
            <h2>Edit: {editSlide.label}</h2>

            {/* Basic Info */}
            <div className="form-group">
              <label>Label</label>
              <input
                value={editSlide.label}
                onChange={(e) => {
                  const val = e.target.value;
                  updateSlide(editSlide.id, { label: val });
                  setEditSlide((prev) => prev ? { ...prev, label: val } : null);
                }}
              />
            </div>

            {/* Image Tabs */}
            <div className="tabs">
              {(['en-desktop', 'en-mobile', 'fr-desktop', 'fr-mobile'] as ImageVariant[]).map((v) => (
                <button
                  key={v}
                  className={`tab ${activeTab === v ? 'active' : ''}`}
                  onClick={() => setActiveTab(v)}
                >
                  {v.replace('-', ' ').toUpperCase()}
                </button>
              ))}
            </div>

            {/* Upload Zone */}
            <div className="upload-zone">
              {getVariantUrl(editSlide, activeTab) ? (
                <img src={getVariantUrl(editSlide, activeTab)} alt="Current" />
              ) : null}
              <p>{getVariantUrl(editSlide, activeTab) ? 'Click or drop to replace' : 'Click or drop image here'}</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file, editSlide, activeTab);
                }}
              />
            </div>

            {/* SEO Fields */}
            <h3 style={{ fontSize: '15px', margin: '20px 0 12px', color: '#aaa' }}>SEO Content</h3>

            <div className="form-group">
              <label>Heading</label>
              <input
                value={editSlide.seo.heading}
                onChange={(e) => {
                  const val = e.target.value;
                  updateSeo(editSlide.id, 'heading', val);
                  setEditSlide((prev) => prev ? { ...prev, seo: { ...prev.seo, heading: val } } : null);
                }}
              />
            </div>

            <div className="form-group">
              <label>Alt Text (EN)</label>
              <input
                value={editSlide.alt.en}
                onChange={(e) => {
                  const val = e.target.value;
                  updateAlt(editSlide.id, 'en', val);
                  setEditSlide((prev) => prev ? { ...prev, alt: { ...prev.alt, en: val } } : null);
                }}
              />
            </div>

            <div className="form-group">
              <label>Alt Text (FR)</label>
              <input
                value={editSlide.alt.fr || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateAlt(editSlide.id, 'fr', val);
                  setEditSlide((prev) => prev ? { ...prev, alt: { ...prev.alt, fr: val } } : null);
                }}
              />
            </div>

            <div className="form-group">
              <label>SEO Text (English)</label>
              <textarea
                value={editSlide.seo.textEn || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateSeo(editSlide.id, 'textEn', val);
                  setEditSlide((prev) => prev ? { ...prev, seo: { ...prev.seo, textEn: val } } : null);
                }}
              />
            </div>

            <div className="form-group">
              <label>SEO Text (Italiano)</label>
              <textarea
                value={editSlide.seo.textIt || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateSeo(editSlide.id, 'textIt', val);
                  setEditSlide((prev) => prev ? { ...prev, seo: { ...prev.seo, textIt: val } } : null);
                }}
              />
            </div>

            <div className="form-group">
              <label>SEO Text (Français)</label>
              <textarea
                value={editSlide.seo.textFr || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateSeo(editSlide.id, 'textFr', val);
                  setEditSlide((prev) => prev ? { ...prev, seo: { ...prev.seo, textFr: val } } : null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="status-bar">
        <span>{slides.length} slides</span>
        <span className={status === 'Saved!' ? 'saved' : ''}>{status || (saving ? 'Saving...' : 'Ready')}</span>
      </div>
    </div>
  );
}
