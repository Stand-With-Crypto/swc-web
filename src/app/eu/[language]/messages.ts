import { I18nMessages } from '@/utils/i18n/types'

export const i18nMessages: I18nMessages = {
  en: {
    // Basic interpolations
    welcome: 'Welcome {name}!',
    'user.profile': 'User {username} has {age} years old',

    // Number formatting - FormatJS syntax
    'stats.users': 'We have {count, number} active users',
    'stats.revenue': 'Total revenue: {amount, number, ::currency/USD}',
    'stats.growth': 'Growth rate: {rate, number, ::percent}',

    // Date and time formatting - simple placeholders, dates pre-formatted in components
    'last.login': 'Last login: {date}',
    'meeting.time': 'Meeting at {time}',
    'relative.time': 'Posted {date}',

    // Text transformations - using custom functions (will need special handling)
    'company.name': 'Company: {company}', // Note: FormatJS doesn't have built-in text transforms
    description: 'Description: {text}',
    code: 'Code: {code}',

    // Plural forms - ICU plural syntax
    'items.count':
      '{count, plural, =0 {No items available} one {# item in your cart} other {# items in your cart}}',

    notifications:
      '{count, plural, =0 {No new notifications} one {You have # new notification} other {You have # new notifications}}',

    // Conditional translations - ICU select syntax
    'user.status':
      '{status, select, online {User is currently online} offline {User is offline} away {User is away} other {User status unknown}}',

    'subscription.type':
      '{type, select, free {Free plan - Limited features} premium {Premium plan - All features unlocked} enterprise {Enterprise plan - Custom solutions} other {Unknown subscription type}}',
  },

  de: {
    // Basic interpolations
    welcome: 'Willkommen {name}!',
    'user.profile': 'Benutzer {username} ist {age} Jahre alt',

    // Number formatting
    'stats.users': 'Wir haben {count, number} aktive Benutzer',
    'stats.revenue': 'Gesamtumsatz: {amount, number, ::currency/EUR}',
    'stats.growth': 'Wachstumsrate: {rate, number, ::percent}',

    // Date and time formatting
    'last.login': 'Letzte Anmeldung: {date}',
    'meeting.time': 'Besprechung um {time}',
    'relative.time': 'Gepostet {date}',

    // Text transformations
    'company.name': 'Unternehmen: {company}',
    description: 'Beschreibung: {text}',
    code: 'Code: {code}',

    // Plural forms
    'items.count':
      '{count, plural, =0 {Keine Artikel verfügbar} one {# Artikel in Ihrem Warenkorb} other {# Artikel in Ihrem Warenkorb}}',

    notifications:
      '{count, plural, =0 {Keine neuen Benachrichtigungen} one {Sie haben # neue Benachrichtigung} other {Sie haben # neue Benachrichtigungen}}',

    // Conditional translations
    'user.status':
      '{status, select, online {Benutzer ist derzeit online} offline {Benutzer ist offline} away {Benutzer ist abwesend} other {Benutzerstatus unbekannt}}',

    'subscription.type':
      '{type, select, free {Kostenloser Plan - Begrenzte Funktionen} premium {Premium-Plan - Alle Funktionen freigeschaltet} enterprise {Enterprise-Plan - Maßgeschneiderte Lösungen} other {Unbekannter Abonnement-Typ}}',
  },

  fr: {
    // Basic interpolations
    welcome: 'Bienvenue {name}!',
    'user.profile': "L'utilisateur {username} a {age} ans",

    // Number formatting
    'stats.users': 'Nous avons {count, number} utilisateurs actifs',
    'stats.revenue': "Chiffre d'affaires total: {amount, number, ::currency/EUR}",
    'stats.growth': 'Taux de croissance: {rate, number, ::percent}',

    // Date and time formatting
    'last.login': 'Dernière connexion: {date}',
    'meeting.time': 'Réunion à {time}',
    'relative.time': 'Publié {date}',

    // Text transformations
    'company.name': 'Entreprise: {company}',
    description: 'Description: {text}',
    code: 'Code: {code}',

    // Plural forms
    'items.count':
      '{count, plural, =0 {Aucun article disponible} one {# article dans votre panier} other {# articles dans votre panier}}',

    notifications:
      '{count, plural, =0 {Aucune nouvelle notification} one {Vous avez # nouvelle notification} other {Vous avez # nouvelles notifications}}',

    // Conditional translations
    'user.status':
      "{status, select, online {L'utilisateur est actuellement en ligne} offline {L'utilisateur est hors ligne} away {L'utilisateur est absent} other {Statut utilisateur inconnu}}",

    'subscription.type':
      "{type, select, free {Plan gratuit - Fonctionnalités limitées} premium {Plan premium - Toutes les fonctionnalités débloquées} enterprise {Plan entreprise - Solutions personnalisées} other {Type d'abonnement inconnu}}",
  },
}
