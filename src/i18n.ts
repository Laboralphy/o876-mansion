import i18next from 'i18next';
import resources from '@/locales';

/**
 * The game language.
 * French is the reference language : it is complete, the other languages fall back to it.
 */
export const DEFAULT_LANGUAGE = 'fr';

i18next.init({
    resources,
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    ns: ['common', 'photos', 'items', 'notes'],
    defaultNS: 'common',
    interpolation: {
        // texts are displayed by Vue, which escapes them already (or deliberately rendered as html, see Description.vue)
        escapeValue: false
    },
    // resources are bundled : initialization is synchronous
    initAsync: false
});

export default i18next;
