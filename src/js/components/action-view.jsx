import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import OutputAggregateView from './action/output-aggregate-view';
import ValidationResetView from './action/validation-reset-view';
import BackupView from './action/backup-view';


class ActionView extends Component {
    render() {
        return (
            <>
                <OutputAggregateView/>
                <BackupView/>
                <ValidationResetView/>
            </>
        );
    }
}


export default withRouter(ActionView);
