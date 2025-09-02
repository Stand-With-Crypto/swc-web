import { I18nMessages } from '@/utils/i18n/types'

export const i18nMessages: I18nMessages = {
  en: {
    // Basic interpolations
    welcome: 'Welcome {name}!',
    'user.profile': 'User {username} has {age} years old',

    // Number formatting
    'stats.users': 'We have {count:number} active users',
    'stats.revenue': 'Total revenue: {amount:currency:currency=USD}',
    'stats.growth': 'Growth rate: {rate:percent}',

    // Date and time formatting
    'last.login': 'Last login: {date:date:dateStyle=full}',
    'meeting.time': 'Meeting at {time:time:timeStyle=short}',
    'relative.time': 'Posted {date:relative}',

    // Text transformations
    'company.name': 'Company: {company:uppercase}',
    description: 'Description: {text:capitalize}',
    code: 'Code: {code:lowercase}',

    // Plural forms
    'items.count': {
      zero: 'No items available',
      one: '{count} item in your cart',
      other: '{count} items in your cart',
    },

    notifications: {
      zero: 'No new notifications',
      one: 'You have {count} new notification',
      other: 'You have {count} new notifications',
    },

    // Conditional translations
    'user.status': {
      online: 'User is currently online',
      offline: 'User is offline',
      away: 'User is away',
      default: 'User status unknown',
    },

    'subscription.type': {
      free: 'Free plan - Limited features',
      premium: 'Premium plan - All features unlocked',
      enterprise: 'Enterprise plan - Custom solutions',
      default: 'Unknown subscription type',
    },
  },

  de: {
    // Basic interpolations
    welcome: 'Willkommen {name}!',
    'user.profile': 'Benutzer {username} ist {age} Jahre alt',

    // Number formatting
    'stats.users': 'Wir haben {count:number} aktive Benutzer',
    'stats.revenue': 'Gesamtumsatz: {amount:currency:currency=EUR}',
    'stats.growth': 'Wachstumsrate: {rate:percent}',

    // Date and time formatting
    'last.login': 'Letzte Anmeldung: {date:date:dateStyle=full}',
    'meeting.time': 'Besprechung um {time:time:timeStyle=short}',
    'relative.time': 'Gepostet {date:relative}',

    // Text transformations
    'company.name': 'Unternehmen: {company:uppercase}',
    description: 'Beschreibung: {text:capitalize}',
    code: 'Code: {code:lowercase}',

    // Plural forms
    'items.count': {
      zero: 'Keine Artikel verfügbar',
      one: '{count} Artikel in Ihrem Warenkorb',
      other: '{count} Artikel in Ihrem Warenkorb',
    },

    notifications: {
      zero: 'Keine neuen Benachrichtigungen',
      one: 'Sie haben {count} neue Benachrichtigung',
      other: 'Sie haben {count} neue Benachrichtigungen',
    },

    // Conditional translations
    'user.status': {
      online: 'Benutzer ist derzeit online',
      offline: 'Benutzer ist offline',
      away: 'Benutzer ist abwesend',
      default: 'Benutzerstatus unbekannt',
    },

    'subscription.type': {
      free: 'Kostenloser Plan - Begrenzte Funktionen',
      premium: 'Premium-Plan - Alle Funktionen freigeschaltet',
      enterprise: 'Enterprise-Plan - Maßgeschneiderte Lösungen',
      default: 'Unbekannter Abonnement-Typ',
    },
  },

  fr: {
    // Basic interpolations
    welcome: 'Bienvenue {name}!',
    'user.profile': "L'utilisateur {username} a {age} ans",

    // Number formatting
    'stats.users': 'Nous avons {count:number} utilisateurs actifs',
    'stats.revenue': "Chiffre d'affaires total: {amount:currency:currency=EUR}",
    'stats.growth': 'Taux de croissance: {rate:percent}',

    // Date and time formatting
    'last.login': 'Dernière connexion: {date:date:dateStyle=full}',
    'meeting.time': 'Réunion à {time:time:timeStyle=short}',
    'relative.time': 'Publié {date:relative}',

    // Text transformations
    'company.name': 'Entreprise: {company:uppercase}',
    description: 'Description: {text:capitalize}',
    code: 'Code: {code:lowercase}',

    // Plural forms
    'items.count': {
      zero: 'Aucun article disponible',
      one: '{count} article dans votre panier',
      other: '{count} articles dans votre panier',
    },

    notifications: {
      zero: 'Aucune nouvelle notification',
      one: 'Vous avez {count} nouvelle notification',
      other: 'Vous avez {count} nouvelles notifications',
    },

    // Conditional translations
    'user.status': {
      online: "L'utilisateur est actuellement en ligne",
      offline: "L'utilisateur est hors ligne",
      away: "L'utilisateur est absent",
      default: 'Statut utilisateur inconnu',
    },

    'subscription.type': {
      free: 'Plan gratuit - Fonctionnalités limitées',
      premium: 'Plan premium - Toutes les fonctionnalités débloquées',
      enterprise: 'Plan entreprise - Solutions personnalisées',
      default: "Type d'abonnement inconnu",
    },
  },
}
