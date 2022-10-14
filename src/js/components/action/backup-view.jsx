import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import Translation from '../../common/translation';
import BackupBodyView from './backup-body-view';


class BackupView extends Component {
    render() {
        return <>
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>{Translation.getPhrase('d436cb960')}</div>
                <div className={'panel-body'}>
                    <BackupBodyView/>
                </div>
            </div>
        </>;
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    }))(withRouter(BackupView));
