import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Form} from 'react-bootstrap';
import {bool_label} from '../../helper/format';
import HelpIconView from '../utils/help-icon-view';


class ConfigTranslationView extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.show_phrase_guid.value = (sessionStorage.getItem('show_phrase_guid') === '1') ? 1 : 0;
    }

    setShowPhraseGuid() {
        sessionStorage.setItem('show_phrase_guid', this.show_phrase_guid.value);
    }

    render() {
        return <div className={'panel panel-filled'}>
            <div className={'panel-heading bordered'}>contribute to translation</div>
            <div className={'panel-body'}>
                <label>show phrase guid <HelpIconView help_item_name={'contribute_to_translation'}/></label>
                <Form.Select
                    as="select"
                    ref={(c) => this.show_phrase_guid = c}
                    onChange={() => this.setShowPhraseGuid()}
                >
                    <option value={1} key={1}>
                        {bool_label(1)}
                    </option>
                    <option value={0} key={0}>
                        {bool_label(0)}
                    </option>
                </Form.Select>
            </div>
        </div>;
    }
}


export default connect()(withRouter(ConfigTranslationView));
