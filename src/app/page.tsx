import Navbar from '@/presentation/components/landing/Navbar';
import Hero from '@/presentation/components/landing/Hero';
import ProblemSection from '@/presentation/components/landing/ProblemSection';
import HowItWorks from '@/presentation/components/landing/HowItWorks';
import AnalysisPreview from '@/presentation/components/landing/AnalysisPreview';
import Audience from '@/presentation/components/landing/Audience';
import Pricing from '@/presentation/components/landing/Pricing';
import Trust from '@/presentation/components/landing/Trust';
import FinalCTA from '@/presentation/components/landing/FinalCTA';
import Footer from '@/presentation/components/landing/Footer';

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background font-sans text-foreground">
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <AnalysisPreview />
        <Audience />
        <Pricing />
        <Trust />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

