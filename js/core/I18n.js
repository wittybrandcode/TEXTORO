/**
 * TEXTORO I18n Module
 * Lightweight technical localization engine
 */
(function() {
    'use strict';
    window.TEXTORO = window.TEXTORO || {};

    var currentLocale = 'en';
    var dictionaries = {};

    var I18n = {
        init: function(locale, dict) {
            currentLocale = locale || 'en';
            if (dict) {
                dictionaries[currentLocale] = dict;
            }
        },
        loadDictionary: function(locale, dict) {
            dictionaries[locale] = dict;
        },
        t: function(key, fallback) {
            var dict = dictionaries[currentLocale];
            if (dict && dict[key] != null) {
                return dict[key];
            }
            return (fallback !== undefined) ? fallback : key;
        },
        getLocale: function() {
            return currentLocale;
        },
        setLocale: function(locale) {
            currentLocale = locale || 'en';
        }
    };

    TEXTORO.I18n = I18n;
    TEXTORO.t = I18n.t;
})();
