import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HelpIconView from './help-icon-view';
import * as format from '../../helper/format';
import * as convert from '../../helper/convert';
import {withRouter} from 'react-router-dom';
import * as svg from '../../helper/svg';
import store from '../../redux/store';


class BalanceView extends Component {
    constructor(props) {
        super(props);
        this.balanceStableFiatRef = React.createRef();
        this.toggleButtonRef      = React.createRef();
    }

    handleClick() {
        this.balanceStableFiatRef.current.classList.toggle('show');
        if (this.toggleButtonRef.current) {
            this.toggleButtonRef.current.classList.toggle('rotate');
        }
    }

    render() {
        let balanceStableMillix = this.props.stable;

        let stableFiat = '';
        if (convert.isCurrencyPairSummaryAvailable()) {
            stableFiat = <div ref={this.balanceStableFiatRef} className={'stable_fiat'}>
                <span className="text-primary symbol">{store.getState().currency_pair_summary.symbol}</span>
                <span>{convert.fiat(balanceStableMillix, false)}</span>
                <HelpIconView help_item_name={'buy_and_sell'}/>
            </div>;
        }

        return (
            <div className={'panel panel-filled'}>
                <div className={'panel-body balance_panel'}>
                    <div className={'balance_container'}>
                        {svg.millixLogo()}
                        <div className={'stable_millix'}>
                            <span>{format.millix(balanceStableMillix, false)}</span>
                        </div>
                    </div>
                    {stableFiat}
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

