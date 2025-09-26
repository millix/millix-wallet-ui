import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import OutputAggregateView from './action/output-aggregate-view';
import ValidationResetView from './action/validation-reset-view';
import BackupView from './action/backup-view';
import PageTitle from './page-title';


class ActionView extends Component {
    render() {
        return (
            <>
                <PageTitle title={'actions'}/>
                <OutputAggregateView/>
                <BackupView/>
                <ValidationResetView/>
            </>
        );
    }
}


export default withRouter(ActionView);
