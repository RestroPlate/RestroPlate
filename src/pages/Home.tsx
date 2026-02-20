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
        html { scroll-behavior: smooth; background: #0B1A08; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0B1A08; }
        ::-webkit-scrollbar-thumb { background: #7DC542; border-radius: 3px; }
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
