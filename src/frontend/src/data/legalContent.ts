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

  'politique-de-confidentialite': {
    title: 'Politique de confidentialité',
    lastUpdated: '2025-01-01',
    sections: [
      {
        title: 'Responsable du traitement',
        content: `
          <p><strong>PixelVerse Studios SAS</strong> (société fictive)</p>
          <ul>
            <li>Siège social : 42 rue du Pixel, 75001 Paris, France</li>
            <li>Contact DPO : contact@pixelverse-studios.com</li>
          </ul>
          <p>PixelVerse Studios, en tant que responsable du traitement, s'engage à protéger la vie privée des utilisateurs de la plateforme FantasyRealm Character Manager, conformément au Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679) et à la loi Informatique et Libertés du 6 janvier 1978 modifiée.</p>
        `,
      },
      {
        title: 'Données collectées',
        content: `
          <p>Dans le cadre de l'utilisation du service, les données personnelles suivantes sont collectées :</p>
          <ul>
            <li><strong>Adresse email</strong> : utilisée pour l'inscription, la connexion, la réinitialisation de mot de passe et les notifications</li>
            <li><strong>Pseudo</strong> : identifiant public choisi lors de l'inscription</li>
            <li><strong>Mot de passe</strong> : stocké uniquement sous forme de hash sécurisé (algorithme Argon2id), jamais en clair</li>
            <li><strong>Personnages créés</strong> : données de personnalisation (nom, genre, traits faciaux, accessoires)</li>
            <li><strong>Commentaires</strong> : contenus textuels publiés sur les fiches de personnages</li>
            <li><strong>Journaux d'activité</strong> : actions de modération et d'administration (stockés dans MongoDB)</li>
          </ul>
          <p>Aucune donnée sensible au sens de l'article 9 du RGPD n'est collectée (origines, opinions politiques, données de santé, etc.).</p>
        `,
      },
      {
        title: 'Finalités du traitement',
        content: `
          <p>Les données personnelles sont traitées pour les finalités suivantes :</p>
          <ul>
            <li><strong>Gestion des comptes utilisateurs</strong> : inscription, authentification, gestion du profil</li>
            <li><strong>Fourniture du service</strong> : création et gestion de personnages, publication de commentaires</li>
            <li><strong>Modération</strong> : vérification des contenus créés par les utilisateurs (personnages, commentaires)</li>
            <li><strong>Sécurité</strong> : détection des comportements abusifs, traçabilité des actions d'administration</li>
            <li><strong>Communication</strong> : envoi d'emails transactionnels (confirmation, réinitialisation, notifications de modération)</li>
          </ul>
        `,
      },
      {
        title: 'Base légale des traitements',
        content: `
          <p>Les traitements de données reposent sur les bases légales suivantes :</p>
          <ul>
            <li><strong>Consentement</strong> (article 6.1.a du RGPD) : lors de l'inscription, l'utilisateur consent au traitement de ses données</li>
            <li><strong>Exécution du contrat</strong> (article 6.1.b) : les données sont nécessaires à la fourniture du service (création de personnages, commentaires)</li>
            <li><strong>Intérêt légitime</strong> (article 6.1.f) : la modération des contenus et la sécurité de la plateforme</li>
          </ul>
        `,
      },
      {
        title: 'Durée de conservation des données',
        content: `
          <p>Les données personnelles sont conservées selon les durées suivantes :</p>
          <ul>
            <li><strong>Comptes actifs</strong> : les données sont conservées tant que le compte utilisateur est actif</li>
            <li><strong>Suppression de compte</strong> : en cas de suppression du compte (par l'utilisateur ou par un modérateur), toutes les données personnelles sont supprimées immédiatement et définitivement (email, pseudo, mot de passe hashé, personnages, commentaires)</li>
            <li><strong>Journaux d'activité</strong> (MongoDB) : conservés 12 mois à des fins d'audit de sécurité, puis supprimés automatiquement</li>
            <li><strong>Messages de contact</strong> : les messages envoyés via le formulaire de contact sont conservés 6 mois</li>
            <li><strong>Comptes suspendus</strong> : les données sont conservées pendant la durée de la suspension. L'utilisateur peut demander la suppression de son compte à tout moment</li>
          </ul>
        `,
      },
      {
        title: 'Destinataires des données',
        content: `
          <p>Les données personnelles ne sont transmises à aucun tiers à des fins commerciales ou publicitaires.</p>
          <p>Les seuls destinataires sont les prestataires techniques nécessaires au fonctionnement du service :</p>
          <ul>
            <li><strong>Vercel Inc.</strong> (États-Unis) : hébergement du frontend</li>
            <li><strong>Railway Corp.</strong> (États-Unis) : hébergement du backend et de la base de données PostgreSQL</li>
            <li><strong>MongoDB, Inc.</strong> (États-Unis) : hébergement de la base de données des journaux d'activité</li>
            <li><strong>Brevo (Sendinblue)</strong> (France) : envoi d'emails transactionnels</li>
          </ul>
          <p>Ces prestataires agissent en qualité de sous-traitants au sens du RGPD et sont soumis à des obligations contractuelles de protection des données.</p>
        `,
      },
      {
        title: 'Vos droits',
        content: `
          <p>Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants sur vos données personnelles :</p>
          <ul>
            <li><strong>Droit d'accès</strong> (article 15) : obtenir la confirmation que vos données sont traitées et en recevoir une copie</li>
            <li><strong>Droit de rectification</strong> (article 16) : corriger vos données inexactes ou incomplètes</li>
            <li><strong>Droit à l'effacement</strong> (article 17) : demander la suppression de vos données. Vous pouvez supprimer votre compte directement depuis la page Paramètres</li>
            <li><strong>Droit à la portabilité</strong> (article 20) : recevoir vos données dans un format structuré et lisible par machine</li>
            <li><strong>Droit à la limitation</strong> (article 18) : demander la limitation du traitement de vos données</li>
            <li><strong>Droit d'opposition</strong> (article 21) : vous opposer au traitement de vos données</li>
          </ul>
          <p>Pour exercer ces droits, vous pouvez :</p>
          <ul>
            <li>Supprimer votre compte directement depuis la page <strong>Paramètres</strong> de votre espace personnel</li>
            <li>Nous contacter par email à <strong>contact@pixelverse-studios.com</strong></li>
            <li>Utiliser le <strong>formulaire de contact</strong> disponible sur le site</li>
          </ul>
          <p>Nous nous engageons à répondre à votre demande dans un délai d'un mois. En cas de réclamation, vous pouvez également contacter la CNIL (Commission Nationale de l'Informatique et des Libertés) : <strong>www.cnil.fr</strong>.</p>
        `,
      },
      {
        title: 'Mesures de sécurité',
        content: `
          <p>PixelVerse Studios met en œuvre les mesures techniques et organisationnelles suivantes pour protéger vos données :</p>
          <ul>
            <li><strong>Hachage des mots de passe</strong> : algorithme Argon2id avec paramètres conformes aux recommandations OWASP (sel de 16 octets, hash de 32 octets, 65 536 KiB de mémoire, 3 itérations)</li>
            <li><strong>Chiffrement des communications</strong> : toutes les communications sont chiffrées via HTTPS (TLS)</li>
            <li><strong>Authentification sécurisée</strong> : jetons JWT avec expiration, transmis uniquement via des connexions sécurisées</li>
            <li><strong>Contrôle d'accès</strong> : système de rôles (Utilisateur, Employé, Administrateur) avec autorisations granulaires</li>
            <li><strong>Politique de mots de passe</strong> : minimum 12 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial (conforme aux recommandations CNIL)</li>
          </ul>
        `,
      },
      {
        title: 'Cookies et traceurs',
        content: `
          <p>Ce site <strong>n'utilise aucun cookie</strong> de traçage, publicitaire ou analytique.</p>
          <p>Le seul mécanisme de stockage local utilisé est le <strong>localStorage</strong> du navigateur, qui contient :</p>
          <ul>
            <li>Un jeton d'authentification (JWT) pour maintenir la session de l'utilisateur connecté</li>
            <li>La préférence de fermeture du bandeau d'information cookies</li>
          </ul>
          <p>Ces données sont stockées uniquement sur votre appareil et ne sont jamais transmises à des tiers. Elles sont automatiquement supprimées lors de la déconnexion ou du nettoyage des données du navigateur.</p>
        `,
      },
      {
        title: 'Modification de cette politique',
        content: `
          <p>PixelVerse Studios se réserve le droit de modifier la présente politique de confidentialité à tout moment. En cas de modification substantielle, les utilisateurs seront informés par email.</p>
          <p>La date de dernière mise à jour est indiquée en haut de cette page.</p>
        `,
      },
    ],
  },
};
