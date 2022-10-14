import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import API from '../../api';
import ModalView from '../utils/modal-view';
import Translation from '../../common/translation';
import BackupBodyView from '../action/backup-body-view';
import moment from 'moment/moment';


class BackupReminderView extends Component {
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
                const display_counter_max    = 10;

                if (diff_minute > diff_minute_min && display_counter_max > last_display_counter) {
                    this.showModalBackup();

                    backup_reminder[address_key_identifier] = {
                        display_counter: last_display_counter + 1,
                        timestamp      : moment.now()
                    };
                    localStorage.setItem('backup_reminder', JSON.stringify(backup_reminder));
                }
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
                           heading={Translation.getPhrase('d436cb960')}
                           on_close={() => this.changeModalShowBackup(false)}
                           body={
                               <BackupBodyView/>
                           }/>
            </>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    }))(withRouter(BackupReminderView));
