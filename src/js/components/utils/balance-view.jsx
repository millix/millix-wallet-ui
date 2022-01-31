import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HelpIconView from './help-icon-view';
import * as format from '../../helper/format';
import {withRouter} from 'react-router-dom';
import * as svg from '../../helper/svg';


class BalanceView extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className={'panel panel-filled'}>
                <div className={'panel-body balance_panel'}>
                    <div className={'balance_container'}>
                        {svg.millix_logo()}
                        <div>
                            <div
                                className={'stable'}>
                                <span>{format.millix(this.props.stable, false)}</span>
                            </div>
                            <div
                                className={'pending'}>
                                {/*<span>{format.millix(5, false)}</span>*/}
                                <span>{format.millix(this.props.pending, false)}</span>
                                <HelpIconView
                                    help_item_name={'pending_balance'}/>
                            </div>
                        </div>
                    </div>
                    <hr className={'w-100'}/>
                    <div
                        className={'primary_address'}>
                        {this.props.primary_address}
                        <HelpIconView
                            help_item_name={'primary_address'}/>
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
