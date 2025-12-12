import { Header, Footer } from '../components/layout';
import {
  HeroSection,
  FeaturesSection,
  PopularHeroesSection,
  AboutSection,
  CtaSection,
} from '../components/home';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <Header />

      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <PopularHeroesSection />
        <AboutSection />
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
