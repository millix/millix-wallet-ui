import _ from 'lodash';
import store from '../redux/store';


class Translation {
    constructor() {
        this.language_name_list       = new Intl.DisplayNames(['en'], {
            type: 'language'
        });
        this.language_list            = require('../../ui_language.json');
        this.current_language_guid    = '';
        this.current_translation_data = [];
        this.new_language_list_loaded = false;
    }

    getPhrase(phrase_guid, replace_data = {}) {
        const phrase_data = this.getCurrentTranslationList().find(element => element.phrase_guid === phrase_guid && element.language_guid === this.getCurrentLanguageGuid());
        let phrase        = phrase_data?.phrase;
        phrase            = this.htmlSpecialCharsDecode(phrase);

        if (!_.isEmpty(replace_data)) {
            _.forOwn(replace_data, function(value, key) {
                let replace_key   = `[${key}]`;
                let result_phrase = phrase.split(replace_key);
                if (result_phrase.length > 1) {
                    phrase = <>{result_phrase.shift()}{value}{result_phrase.join('')}</>;
                }
            });
        }

        return phrase;
    }

    getCurrentTranslationList() {
        if (this.current_translation_data.length === 0 || !this.new_language_list_loaded) {
            this.new_language_list_loaded = true;
            let translation_list          = require('../../ui_phrase.json');
            this.current_translation_data = translation_list.filter(element => element.language_guid === this.getCurrentLanguageGuid());
        }

        return this.current_translation_data;
    }

    getCurrentLanguageGuid() {
        if (sessionStorage.getItem('current_language_guid')) {
            this.current_language_guid = sessionStorage.getItem('current_language_guid');
        }
        else if (this.current_language_guid === '') {
            if (store.getState().config.ACTIVE_LANGUAGE_GUID) {
                this.current_language_guid = store.getState().config.ACTIVE_LANGUAGE_GUID;
            }
            else {
                let language_short_code    = navigator.language.split('-')[0];
                this.current_language_guid = this.language_list.find(element => element.language_name === this.language_name_list.of(language_short_code).toLowerCase()).language_guid;
            }
        }

        return this.current_language_guid;
    }

    setCurrentLanguageGuid(language_guid) {
        this.new_language_list_loaded = false;
        this.current_language_guid    = language_guid;
        sessionStorage.setItem('current_language_guid', language_guid);
    }

    htmlSpecialCharsDecode(text) {
        text      = text.split('***').join('');
        const map = {
            '&amp;' : '&',
            '&lt;'  : '<',
            '&gt;'  : '>',
            '&quot;': '"',
            '&#039;': '\'',
            '&#39;' : '\''
        };

        return text.replace(/(&quot;)|(&#039;)|(&amp;)|(&gt;)|(&lt;)|(&#39;)/g, function(m) {
            return map[m];
        });
    }
}


const _Translation = new Translation();
export default _Translation;
