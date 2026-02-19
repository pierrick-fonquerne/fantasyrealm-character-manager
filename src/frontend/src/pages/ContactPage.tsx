import { Header, Footer } from '../components/layout';
import { ContactForm } from '../components/contact';

const ContactPage = () => {
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
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto">
            <h1 className="text-3xl font-bold text-cream-100 text-center mb-2">
              Contactez-nous
            </h1>
            <p className="text-dark-200 text-center mb-10">
              Une question, une suggestion ou un problème ? Envoyez-nous un message.
            </p>
            <ContactForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
