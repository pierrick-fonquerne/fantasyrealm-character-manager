export interface LegalSection {
  title: string;
  content: string;
}

export interface LegalDocument {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export const legalDocuments: Record<string, LegalDocument> = {
  'mentions-legales': {
    title: 'Mentions légales',
    lastUpdated: '2025-01-01',
    sections: [
      {
        title: 'Éditeur du site',
        content: `
          <p><strong>PixelVerse Studios SAS</strong> (société fictive)</p>
          <p>Société par Actions Simplifiée au capital de 50 000 € (fictif)</p>
          <ul>
            <li>Siège social : 42 rue du Pixel, 75001 Paris, France</li>
            <li>SIRET : 000 000 000 00000 (fictif)</li>
            <li>RCS Paris B 000 000 000 (fictif)</li>
            <li>N° TVA intracommunautaire : FR 00 000000000 (fictif)</li>
            <li>Directeur de la publication : Pierrick FONQUERNE, Développeur Web et Web Mobile</li>
            <li>Contact : contact@pixelverse-studios.com</li>
          </ul>
          <p>Ce site a été réalisé dans le cadre de l'Évaluation en Cours de Formation (ECF) du Titre Professionnel Développeur Web et Web Mobile (Studi).</p>
        `,
      },
      {
        title: 'Hébergement',
        content: `
          <p>Le site est hébergé par :</p>
          <ul>
            <li><strong>Frontend</strong> : Vercel Inc. — 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</li>
            <li><strong>Backend</strong> : Railway Corp. — San Francisco, CA, États-Unis</li>
            <li><strong>Base de données NoSQL</strong> : MongoDB, Inc. — New York, NY, États-Unis</li>
          </ul>
        `,
      },
      {
        title: 'Propriété intellectuelle',
        content: `
          <p>L'ensemble du contenu de ce site (textes, images, logos, design) est la propriété exclusive de PixelVerse Studios ou de ses partenaires. Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie du site est interdite sans autorisation préalable.</p>
          <p>Le nom "FantasyRealm Online" et le logo associé sont des marques fictives créées à des fins académiques.</p>
        `,
      },
      {
        title: 'Responsabilité',
        content: `
          <p>PixelVerse Studios s'efforce de fournir des informations aussi précises que possible. Toutefois, la société ne pourra être tenue responsable des omissions, inexactitudes ou carences dans la mise à jour de ces informations.</p>
          <p>L'utilisateur est seul responsable de l'utilisation qu'il fait du contenu du site.</p>
        `,
      },
      {
        title: 'Données personnelles',
        content: `
          <p>Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données personnelles.</p>
          <p>Pour exercer ces droits, vous pouvez nous contacter à l'adresse : <strong>contact@pixelverse-studios.com</strong>.</p>
          <p>Les données collectées sont :</p>
          <ul>
            <li>Email (inscription, contact)</li>
            <li>Pseudo (inscription)</li>
            <li>Mot de passe (hashé avec Argon2id, jamais stocké en clair)</li>
          </ul>
          <p>Ces données ne sont pas transmises à des tiers et sont conservées uniquement pour le fonctionnement du service.</p>
        `,
      },
      {
        title: 'Cookies',
        content: `
          <p>Ce site n'utilise pas de cookies de traçage ou publicitaires. Seul un jeton d'authentification (JWT) est stocké dans le navigateur (localStorage) pour maintenir la session de l'utilisateur connecté.</p>
        `,
      },
    ],
  },

  cgu: {
    title: 'Conditions Générales d\'Utilisation',
    lastUpdated: '2025-01-01',
    sections: [
      {
        title: 'Article 1 — Objet',
        content: `
          <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation du service "FantasyRealm Character Manager" édité par PixelVerse Studios.</p>
          <p>En accédant au site et en créant un compte, l'utilisateur accepte les présentes CGU dans leur intégralité.</p>
        `,
      },
      {
        title: 'Article 2 — Accès au service',
        content: `
          <p>Le service est accessible gratuitement à tout utilisateur disposant d'un accès internet. L'inscription est nécessaire pour accéder aux fonctionnalités de création et de gestion de personnages.</p>
          <p>PixelVerse Studios se réserve le droit de suspendre ou d'interrompre l'accès au service pour des raisons de maintenance ou de mise à jour.</p>
        `,
      },
      {
        title: 'Article 3 — Inscription',
        content: `
          <p>Pour créer un compte, l'utilisateur doit fournir :</p>
          <ul>
            <li>Une adresse email valide et unique</li>
            <li>Un pseudo unique</li>
            <li>Un mot de passe conforme à la politique de sécurité (minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial)</li>
          </ul>
          <p>L'utilisateur est responsable de la confidentialité de ses identifiants de connexion.</p>
        `,
      },
      {
        title: 'Article 4 — Création de personnages',
        content: `
          <p>Les utilisateurs inscrits peuvent créer des personnages en définissant un nom, un genre et des traits de personnalisation (visage, couleurs). Chaque personnage est soumis à validation par un modérateur avant d'être pleinement utilisable.</p>
          <p>Les noms de personnages doivent respecter les règles de bienséance. Tout contenu inapproprié, offensant ou contraire aux bonnes mœurs pourra être rejeté ou supprimé sans préavis.</p>
        `,
      },
      {
        title: 'Article 5 — Modération',
        content: `
          <p>Les personnages créés et les commentaires déposés sont soumis à un processus de modération. Les modérateurs (employés) peuvent :</p>
          <ul>
            <li>Approuver ou rejeter les personnages et commentaires</li>
            <li>Suspendre ou supprimer les comptes utilisateurs en cas de non-respect des CGU</li>
          </ul>
          <p>En cas de rejet d'un personnage, le motif sera communiqué par email à l'utilisateur.</p>
        `,
      },
      {
        title: 'Article 6 — Propriété des contenus',
        content: `
          <p>Les personnages créés par les utilisateurs restent leur propriété intellectuelle. En partageant un personnage dans la galerie publique, l'utilisateur accorde à PixelVerse Studios un droit non exclusif d'affichage sur la plateforme.</p>
          <p>L'utilisateur peut retirer son personnage de la galerie à tout moment en désactivant le partage.</p>
        `,
      },
      {
        title: 'Article 7 — Responsabilité de l\'utilisateur',
        content: `
          <p>L'utilisateur s'engage à :</p>
          <ul>
            <li>Ne pas utiliser le service à des fins illicites</li>
            <li>Ne pas publier de contenu offensant, discriminatoire ou contraire à la loi</li>
            <li>Respecter les autres utilisateurs dans les commentaires</li>
            <li>Ne pas tenter de compromettre la sécurité du service</li>
          </ul>
        `,
      },
      {
        title: 'Article 8 — Suppression de compte',
        content: `
          <p>L'utilisateur peut demander la suppression de son compte à tout moment en contactant le support. La suppression entraîne la suppression définitive de tous les personnages et commentaires associés.</p>
          <p>PixelVerse Studios se réserve le droit de supprimer un compte en cas de violation des présentes CGU.</p>
        `,
      },
      {
        title: 'Article 9 — Modification des CGU',
        content: `
          <p>PixelVerse Studios se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle. La poursuite de l'utilisation du service après modification vaut acceptation des nouvelles conditions.</p>
        `,
      },
      {
        title: 'Article 10 — Droit applicable',
        content: `
          <p>Les présentes CGU sont régies par le droit français. En cas de litige, les tribunaux compétents de Paris seront seuls compétents.</p>
        `,
      },
    ],
  },
};
