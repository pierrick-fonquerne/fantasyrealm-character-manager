import { Header, Footer } from '../components/layout';
import {
  HeroSection,
  CompanySection,
  AdvantagesSection,
  GameSection,
} from '../components/home';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-gold-500 focus:text-dark-950 focus:rounded-lg focus:font-medium"
      >
        Aller au contenu principal
      </a>

      <Header />

      <main id="main-content" role="main" className="flex-1">
        <HeroSection />
        <CompanySection />
        <AdvantagesSection />
        <GameSection />
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
