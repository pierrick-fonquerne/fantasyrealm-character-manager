import { Link } from 'react-router-dom';
import { Header, Footer } from '../components/layout';
import { legalDocuments } from '../data/legalContent';

interface LegalPageProps {
  slug: string;
}

const LegalPage = ({ slug }: LegalPageProps) => {
  const document = legalDocuments[slug];

  if (!document) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-gold-500 focus:text-dark-950 focus:rounded-lg focus:font-medium"
        >
          Aller au contenu principal
        </a>
        <Header />
        <main id="main-content" role="main" className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-3xl text-cream-100 mb-4">Page introuvable</h1>
            <p className="text-cream-400 mb-6">Le document demandé n'existe pas.</p>
            <Link
              to="/"
              className="text-gold-400 hover:text-gold-300 underline transition-colors"
            >
              Retour à l'accueil
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDate = new Date(document.lastUpdated).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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
        <div className="max-w-3xl mx-auto px-4 lg:px-8 py-12">
          <nav aria-label="Fil d'Ariane" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-cream-400">
              <li>
                <Link to="/" className="hover:text-cream-200 transition-colors">
                  Accueil
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-cream-200">
                {document.title}
              </li>
            </ol>
          </nav>

          <header className="mb-10">
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-cream-100">
              {document.title}
            </h1>
            <p className="mt-2 text-sm text-cream-400">
              Dernière mise à jour : {formattedDate}
            </p>
          </header>

          <div className="space-y-8">
            {document.sections.map((section, index) => (
              <section key={index} aria-labelledby={`legal-section-${index}`}>
                <h2 id={`legal-section-${index}`} className="font-display text-xl font-semibold text-gold-400 mb-3">
                  {section.title}
                </h2>
                <div
                  className="prose-legal text-cream-300 leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_li]:mb-1 [&_strong]:text-cream-100"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LegalPage;
