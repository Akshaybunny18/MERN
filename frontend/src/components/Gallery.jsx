import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './Navbar';
import { Camera } from 'lucide-react';

// Lazy-loaded image component using IntersectionObserver
const LazyImage = ({ src, alt, className, style, onError }) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={className} style={{ ...style, overflow: 'hidden', position: 'relative' }}>
      {/* Placeholder shimmer */}
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, var(--bg-secondary) 25%, rgba(255,255,255,0.05) 50%, var(--bg-secondary) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }} />
      )}
      {inView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={onError}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
        />
      )}
    </div>
  );
};

const CATEGORIES = ['All', 'Hackathons', 'Cultural', 'Sports', 'Workshops', 'Tech Talks'];
const PAGE_SIZE = 12;

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);

  const getImageUrl = useCallback((index, cat) => {
    // Picsum gives deterministic random images by seed
    const seed = `${cat}-${index}`;
    const keywords = {
      'All': 'event', 'Hackathons': 'coding', 'Cultural': 'festival',
      'Sports': 'sports', 'Workshops': 'workshop', 'Tech Talks': 'technology',
    };
    return `https://picsum.photos/seed/${seed}/600/400`;
  }, []);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);
    setTimeout(() => {
      const newPhotos = Array.from({ length: PAGE_SIZE }, (_, i) => {
        const idx = (page - 1) * PAGE_SIZE + i;
        return {
          id: `${category}-${idx}`,
          src: getImageUrl(idx, category),
          alt: `${category} event photo ${idx + 1}`,
          caption: `${category === 'All' ? 'Infinium' : category}`,
        };
      });
      setPhotos(prev => page === 1 ? newPhotos : [...prev, ...newPhotos]);
      setPage(prev => prev + 1);
      setHasMore(page < 5); // limit to 5 pages (60 photos)
      setLoading(false);
    }, 600);
  }, [loading, hasMore, page, category, getImageUrl]);

  // Reset on category change
  useEffect(() => {
    setPhotos([]);
    setPage(1);
    setHasMore(true);
  }, [category]);

  // Trigger first load when page resets
  useEffect(() => {
    if (page === 1 && photos.length === 0 && hasMore) {
      loadMore();
    }
  }, [page, photos.length, hasMore, loadMore]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: '300px' }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  const [lightbox, setLightbox] = useState(null);

  return (
    <div className="min-h-screen flex flex-col">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      <Navbar />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gradient mb-2 flex items-center gap-3">
            <Camera className="w-8 h-8" /> Gallery
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Moments from Infinium — past events, workshops, and memories.
          </p>
        </header>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: '0.4rem 1.1rem',
                borderRadius: '9999px',
                border: '1px solid var(--glass-border)',
                background: category === cat ? 'var(--accent-primary)' : 'var(--glass-bg)',
                color: category === cat ? '#000' : 'var(--text-primary)',
                fontWeight: category === cat ? '700' : '500',
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'all 0.2s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry-style Grid */}
        <div style={{
          columns: 'auto 280px',
          columnGap: '1rem',
          gap: '1rem',
        }}>
          {photos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setLightbox(photo)}
              style={{
                breakInside: 'avoid',
                marginBottom: '1rem',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid var(--glass-border)',
                position: 'relative',
              }}
              className="glass-panel"
            >
              <LazyImage
                src={photo.src}
                alt={photo.alt}
                style={{ height: `${180 + (photo.id.charCodeAt(photo.id.length - 1) % 3) * 60}px` }}
              />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                padding: '1rem 0.75rem 0.5rem',
                fontSize: '0.75rem',
                color: '#fff',
              }}>
                {photo.caption}
              </div>
            </div>
          ))}
        </div>

        {/* Infinite scroll loader sentinel */}
        <div ref={loaderRef} style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {loading && (
            <div style={{
              width: '32px', height: '32px',
              border: '3px solid var(--glass-border)',
              borderTopColor: 'var(--accent-primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
          )}
          {!hasMore && !loading && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>— End of Gallery —</p>
          )}
        </div>
      </main>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem',
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
            <img src={lightbox.src} alt={lightbox.alt} style={{ maxWidth: '100%', maxHeight: '85vh', display: 'block' }} />
            <button
              onClick={() => setLightbox(null)}
              style={{
                position: 'absolute', top: '12px', right: '12px',
                width: '32px', height: '32px',
                background: 'rgba(0,0,0,0.6)',
                border: 'none', borderRadius: '50%',
                color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem',
              }}
            >✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
