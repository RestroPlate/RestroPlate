import { NavBar } from '../components/NavBar';
import { Hero } from '../components/Hero';
import { StatsBar } from '../components/StatsBar';
import { Mission } from '../components/Mission';
import { HowItWorks } from '../components/HowItWorks';
import { PhotoStrip } from '../components/PhotoStrip';
import { Testimonials } from '../components/Testimonials';
import { CtaSection } from '../components/CtaSection';
import { Footer } from '../components/Footer';

export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@700;900&family=Nunito:wght@400;600;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
          scroll-behavior: smooth;
          background: #0B1A08;
        }

        /* ── CRITICAL: stops content hiding under fixed navbar ── */
        body {
          padding-top: 0 !important;
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0B1A08; }
        ::-webkit-scrollbar-thumb { background: #7DC542; border-radius: 3px; }

        /* ── NAVBAR ── */
        .nav-links { display: flex; gap: 36px; align-items: center; }
        .nav-join-btn { display: block; }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .nav-join-btn { padding: 8px 16px !important; font-size: 0.78rem !important; }
        }

        /* ── STATS BAR ── */
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); }

        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .stats-grid > div {
            border-right: none !important;
            border-bottom: 1px solid rgba(15,40,10,0.2);
          }
        }

        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr 1fr; }
        }

        /* ── MISSION ── */
        .mission-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6vw; align-items: center; }

        @media (max-width: 900px) {
          .mission-grid { grid-template-columns: 1fr; gap: 40px; }
          .mission-image-col { order: -1; }
          .mission-image { height: 300px !important; }
          .mission-badge { bottom: -12px !important; right: -8px !important; }
        }

        @media (max-width: 768px) {
          .mission-image { height: 240px !important; }
        }

        /* ── HOW IT WORKS ── */
        .steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 28px; }

        @media (max-width: 1024px) {
          .steps-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 480px) {
          .steps-grid { grid-template-columns: 1fr; }
        }

        /* ── PHOTO STRIP ── */
        .photo-strip-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }

        @media (max-width: 900px) {
          .photo-strip-grid { grid-template-columns: 1fr; }
          .photo-card { height: 260px !important; }
        }

        @media (max-width: 768px) {
          .photo-card { height: 220px !important; }
        }

        /* ── TESTIMONIALS ── */
        .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }

        @media (max-width: 1024px) {
          .testimonials-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 640px) {
          .testimonials-grid { grid-template-columns: 1fr; }
        }

        /* ── CTA ── */
        .cta-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

        @media (max-width: 768px) {
          .cta-buttons { flex-direction: column; align-items: center; }
          .cta-buttons button { width: 100% !important; max-width: 360px; }
          .cta-heading { font-size: clamp(1.6rem, 6vw, 2.4rem) !important; }
        }

        /* ── FOOTER ── */
        .footer-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }

        @media (max-width: 640px) {
          .footer-inner { flex-direction: column; text-align: center; gap: 16px; }
        }

        /* ── SECTION PADDING ── */
        @media (max-width: 768px) {
          .section-pad { padding: 64px 6vw !important; }
          .section-heading { font-size: clamp(1.6rem, 5vw, 2.4rem) !important; }
        }

        /* ── MOBILE HAMBURGER MENU ── */
        .mobile-menu-btn {
          display: none;
          cursor: pointer;
          background: none;
          border: none;
          padding: 8px;
          flex-direction: column;
          gap: 5px;
        }

        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex; }
        }

        .mobile-menu-btn span {
          display: block;
          width: 24px;
          height: 2px;
          background: #F0EBE1;
          border-radius: 2px;
        }

        .mobile-nav-drawer {
          position: fixed;
          top: 68px; left: 0; right: 0;
          background: rgba(11,26,8,0.98);
          backdrop-filter: blur(20px);
          padding: 24px 5vw 32px;
          display: flex;
          flex-direction: column;
          gap: 0;
          border-bottom: 1px solid rgba(125,197,66,0.15);
          z-index: 99;
          transform: translateY(-150%);
          transition: transform 0.35s ease;
        }

        .mobile-nav-drawer.open { transform: translateY(0); }

        .mobile-nav-link {
          font-family: 'Nunito', sans-serif;
          font-size: 1.1rem;
          color: rgba(240,235,225,0.8);
          text-decoration: none;
          padding: 16px 0;
          border-bottom: 1px solid rgba(125,197,66,0.08);
          transition: color 0.2s;
        }

        .mobile-nav-link:last-of-type { border-bottom: none; }
        .mobile-nav-link:hover { color: #7DC542; }

        .mobile-join-btn {
          margin-top: 20px;
          background: #7DC542;
          color: #0B1A08;
          border: none;
          border-radius: 8px;
          padding: 14px;
          font-family: 'Nunito', sans-serif;
          font-weight: 800;
          font-size: 0.95rem;
          letter-spacing: 0.06em;
          cursor: pointer;
          width: 100%;
        }
      `}</style>
      <NavBar />
      <Hero />
      <StatsBar />
      <Mission />
      <HowItWorks />
      <PhotoStrip />
      <Testimonials />
      <CtaSection />
      <Footer />
    </>
  );
}