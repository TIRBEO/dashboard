import { useEffect, useRef, useState } from 'react';
import { CanvasBackground, preloadFrames } from './components/CanvasBackground';
import { BackgroundVideo } from './components/BackgroundVideo';
import { Navbar } from './components/features/navbar';
import { Hero } from './components/features/hero';
import { AppPreview } from './components/features/preview';
import { AboutSection } from './components/features/about';
import { ChatSection } from './components/features/chat';
import { Testimonials } from './components/features/testimonials';
import { ProductsSection } from './components/features/products';
import { FAQSection } from './components/features/faq';
import { Newsletter } from './components/features/newsletter';
import { Footer } from './components/features/footer';
import { MarqueeSection } from './components/others/MarqueeSection';
import { FeedbackWidget } from './components/FeedbackWidget';
import { initSmoothScroll, destroySmoothScroll } from './lib/smoothScroll';
import { I18nProvider } from './lib/i18n';
import { useSiteConfig } from './lib/useSiteConfig';

function App() {
  const cfg = useSiteConfig();
  const [frames, setFrames] = useState<HTMLImageElement[] | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initSmoothScroll();
    return () => destroySmoothScroll();
  }, []);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
      raf = 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (cfg.background.mode !== 'frames') return;
    let alive = true;
    preloadFrames(() => { }, cfg.background.frameDir, cfg.background.frameCount).then((imgs) => {
      if (!alive) return;
      setFrames(imgs);
      requestAnimationFrame(() => {
        document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-visible');
        });
      });
    });
    return () => { alive = false; };
  }, [cfg.background.mode, cfg.background.frameDir, cfg.background.frameCount]);

  return (
    <I18nProvider>
      <div className="relative min-h-screen overflow-x-hidden bg-[#0c0c0c] text-[#FFFFFF]">
        {/* Top scroll-progress bar */}
        <div
          ref={progressRef}
          className="fixed top-0 left-0 right-0 h-[2px] z-[60] pointer-events-none origin-left"
          style={{ transform: 'scaleX(0)', background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.15), #FFFFFF)' }}
        />
        {/* Living background — video or frame sequence (config-driven) */}
        {cfg.background.mode === 'video' ? (
          <BackgroundVideo src={cfg.background.videoSrc} />
        ) : (
          frames && <CanvasBackground images={frames} frameCount={cfg.background.frameCount} />
        )}

        {/* Fixed navbar that lives above everything until the hero scrolls away */}
        <div id="navbar-layer" className="fixed top-0 inset-x-0 z-50">
          <Navbar />
        </div>

        {/* Content */}
        <div id="smooth-content" className="relative z-10 w-full flex flex-col">
          {/* Hero */}
          <section className="relative h-[100svh] w-full">
            <Hero ready={!!frames} />
          </section>

          {/* Post-hero content */}
          <div className="relative z-30">
            <AppPreview />
            <AboutSection />
            <MarqueeSection />
            <ChatSection />
            <Testimonials />
            <ProductsSection />
            <FAQSection />
            <Newsletter />
            <Footer />
          </div>
        </div>

        {/* Floating, draggable feedback widget */}
        <FeedbackWidget />
      </div>
    </I18nProvider>
  );
}

export default App;
