import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import API from '../../api';
import ModalView from '../utils/modal-view';
import Translation from '../../common/translation';
import moment from 'moment/moment';
import {Form} from 'react-bootstrap';


class BackupReminderView extends Component {
    modal_heading = Translation.getPhrase('wrkkWLvG7');

    constructor(props) {
        super(props);
        this.state = {
            modal_show_backup: false,
            mnemonic         : []
        };
    }

    componentDidMount() {
        const address_key_identifier = this.props.wallet.address_key_identifier;

        let backup_reminder = localStorage.getItem('backup_reminder');
        if (backup_reminder) {
            backup_reminder = JSON.parse(backup_reminder);

            if (backup_reminder[address_key_identifier]) {
                const last_display_counter   = backup_reminder[address_key_identifier].display_counter;
                const last_display_timestamp = backup_reminder[address_key_identifier].timestamp;
                const diff_minute            = (moment.now() - last_display_timestamp) / 1000 / 60;
                const diff_minute_min        = 60 * 24;
                const display_counter_max    = 2;

                if (diff_minute > diff_minute_min && display_counter_max > last_display_counter) {
                    if (last_display_counter > 0) {
                        this.modal_heading = Translation.getPhrase('NoDvkgD4Z');
                    }

                    this.showModalBackup();

                    backup_reminder[address_key_identifier] = {
                        display_counter: last_display_counter + 1,
                        timestamp      : moment.now()
                    };
                }

                if (display_counter_max === backup_reminder[address_key_identifier].display_counter) {
                    delete backup_reminder[address_key_identifier];
                }

                localStorage.setItem('backup_reminder', JSON.stringify(backup_reminder));
            }
        }
    }

    showModalBackup() {
        API.getMnemonicPhrase().then(phrase => {
            this.setState({
                mnemonic: phrase.mnemonic_phrase.split(' ')
            });
            this.changeModalShowBackup(true);
        });
    }

    changeModalShowBackup(value = true) {
        this.setState({
            modal_show_backup: value
        });
    }

    render() {
        return (
            <>
                <ModalView show={this.state.modal_show_backup}
                           size={'xl'}
                           heading={this.modal_heading}
                           on_close={() => this.changeModalShowBackup(false)}
                           body={<>
                               <div className="section_subtitle">
                                   {Translation.getPhrase('1c92a554a')}
                               </div>
                               <div className={'mb-3'}>
                                   {Translation.getPhrase('HAuW8C8V2')}
                               </div>
                               <div className={'mnemonic'}>
                                   <Form.Group className={'form-group'}>
                                       <label>{Translation.getPhrase('01f11055b')}</label>
                                       {/* second div wrapper prevents select of label on tripple click */}
                                       <div>
                                           <div className={'form-control'}>
                                               {this.state.mnemonic.join(' ')}
                                           </div>
                                       </div>
                                   </Form.Group>
                               </div>
                               <div>
                                   {Translation.getPhrase('KWC4XFv7i')}
                               </div>
                           </>}/>
            </>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    }))(withRouter(BackupReminderView));
