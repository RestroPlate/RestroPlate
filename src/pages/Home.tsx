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