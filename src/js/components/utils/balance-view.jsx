import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HelpIconView from './help-icon-view';
import * as format from '../../helper/format';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Button} from 'react-bootstrap';
import {withRouter} from 'react-router-dom';


class BalanceView extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className={'panel panel-filled'}>
                <div className={'panel-body'}>
                    <div className={'balance_container'}>
                        <div
                            className={'stable'}>
                            {format.millix(this.props.stable)}
                        </div>
                        <div
                            className={'pending'}>
                            {format.millix(this.props.pending)}
                            <HelpIconView
                                help_item_name={'pending_balance'}/>
                        </div>
                        <div
                            className={'primary_address'}>
                            {this.props.primary_address}
                            <HelpIconView
                                help_item_name={'primary_address'}/>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}


BalanceView.propTypes = {
    stable         : PropTypes.number,
    pending        : PropTypes.number,
    primary_address: PropTypes.string
};


export default withRouter(BalanceView);
