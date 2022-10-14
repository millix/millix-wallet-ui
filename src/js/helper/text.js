import React from 'react';
import Translation from '../common/translation';

export function get_confirmation_modal_question() {
    return <div>{Translation.getPhrase('7f91be78d')}</div>;
}

export function get_mnemonic_phrase_warning(backup = false) {
    let replace_warning_item = <></>;
    if (!backup) {
        replace_warning_item = <li>
            {Translation.getPhrase('FPiFRSi81')}
        </li>;
    }

    return <div className={'form-group'}>
        <div className="section_subtitle">
            {Translation.getPhrase('a1f1962b0')}
        </div>
        <ul>
            {replace_warning_item}
            <li>
                {Translation.getPhrase('SZyrUxXbe')}
            </li>
            <li>
                {Translation.getPhrase('ArPWt4dnI')}
            </li>
            <li>
                {Translation.getPhrase('7J5yTOcNk')}
            </li>
            <li>
                {Translation.getPhrase('3aPJ0Z8Wa')}
            </li>
        </ul>
    </div>;
}
