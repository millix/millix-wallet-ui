import React, {Component} from 'react';
import ErrorList from '../utils/error-list-view';
import {Form} from 'react-bootstrap';
import {Dropdown} from 'primereact/dropdown';
import * as validate from '../../helper/validate';
import Api from '../../api';
import {get_fixed_value, millix, number} from '../../helper/format';
import ExchangeConfig from '../../core/exchange-config';
import HelpIconView from '../utils/help-icon-view';


export default class BotNewConstantStrategyModel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errorList: [],
            type     : this.getTypeFromProps(this.props.strategyData?.order_type)
        };
        this.pair  = ExchangeConfig[props.symbol];
    }

    getTypeFromProps(orderType) {
        if (!orderType) {
            return 'bid';
        }

        if (orderType === 'ba') {
            return 'bid/sell';
        }
        if (orderType === 'ab') {
            return 'ask/buy';
        }

        return orderType;
    }

    convertOrderTypeToCode(orderType) {
        if (orderType === 'bid/sell') {
            return 'ba';
        }
        if (orderType === 'ask/buy') {
            return 'ab';
        }

        return orderType;
    }

    async save() {
        this.setState({
            error_list: []
        });

        const error_list          = [];
        const data                = {};
        data.strategy_description = validate.required(`strategy description`, this.strategy_description.value, error_list);
        data.strategy_order_type  = validate.required(`order type`, this.strategy_order_type.props.value, error_list);
        data.strategy_order_ttl   = validate.integerPositive(`order time to live`, this.strategy_order_ttl.value, error_list, false);
        data.strategy_amount      = validate.floatPositiveInRange(`order amount`, this.strategy_amount.value, error_list, false, this.pair.order_size_min, this.pair.order_size_max, this.pair.order_size_float_precision);
        if (this.pair.order_size_float_precision === 0) {
            data.strategy_amount = parseInt(data.strategy_amount);
        }

        data.strategy_amount_variation = validate.floatPositiveInRange(`order amount variation`, this.strategy_amount_variation.value || '0', error_list, true, undefined, undefined, this.pair.order_size_float_precision);
        if (this.pair.order_size_float_precision === 0) {
            data.strategy_amount_variation = parseInt(data.strategy_amount_variation);
        }

        if (this.strategy_price_min.value) {
            data.strategy_price_min = validate.floatPositive(`minimum price`, this.strategy_price_min.value, error_list, true);
        }
        else {
            data.strategy_price_min = null;
        }
        if (this.strategy_price_max.value) {
            data.strategy_price_max = validate.floatPositive(`maximum price`, this.strategy_price_max.value, error_list, true);
        }
        else {
            data.strategy_price_max = null;
        }
        data.strategy_total_budget   = validate.floatPositiveInRange(`total budget`, this.strategy_total_budget.value, error_list, false, this.pair.order_size_min, undefined, this.pair.order_size_float_precision);
        data.strategy_time_frequency = validate.integerPositive(`frequency`, this.strategy_time_frequency.value, error_list, false);

        if (error_list.length === 0) {
            try {
                data.strategy_order_type = this.convertOrderTypeToCode(data.strategy_order_type);
                await Api.upsertStrategy(this.props.strategyData?.strategy_id, data.strategy_description, this.props.strategyType, data.strategy_order_type, data.strategy_order_ttl,
                    data.strategy_amount, data.strategy_price_min, data.strategy_price_max, data.strategy_total_budget, JSON.stringify({
                        time_frequency  : data.strategy_time_frequency,
                        amount_variation: data.strategy_amount_variation
                    }), this.props.exchange, this.props.symbol, 2);
                return true;
            }
            catch (e) {
                return false;
            }
        }
        else {
            this.setState({errorList: error_list});
            return false;
        }
    }

    render() {
        return <Form>
            <ErrorList
                error_list={this.state.errorList}/>
            <Form.Group className="form-group">
                <label>{`strategy description`}</label>
                <Form.Control
                    type="text"
                    defaultValue={this.props.strategyData?.strategy_description}
                    placeholder={`strategy description`}
                    ref={(c) => this.strategy_description = c}
                    onChange={(e) => {
                    }}
                />
            </Form.Group>

            <Form.Group className="form-group">
                <label>{`order type`}</label>
                <Dropdown
                    value={this.state.type} options={[
                    'buy',
                    'sell',
                    'bid',
                    'ask',
                    'bid/sell',
                    'ask/buy',
                ]}
                    ref={(c) => this.strategy_order_type = c}
                    onChange={(e) => this.setState({type: e.value})} className={'form-control p-0'}/>
            </Form.Group>

            <Form.Group className="form-group">
                <label>{`order time-to-live (seconds)`} <HelpIconView args={this.pair} help_item_name={'bot_order_ttl'}/></label>
                <Form.Control type="text"
                              defaultValue={Number(this.props.strategyData?.order_ttl || 60)}
                              placeholder={`order time-to-live (seconds)`}
                              pattern="[0-9]+([,][0-9]{1,2})?"
                              ref={c => this.strategy_order_ttl = c}
                              onChange={e => validate.handleInputChangeInteger(e, false)}/>
            </Form.Group>

            <Form.Group className="form-group">
                <label>{`order amount (${this.pair.base})`} <HelpIconView args={this.pair} help_item_name={'bot_order_amount'}/></label>
                <Form.Control type="text"
                              defaultValue={get_fixed_value({
                                  value            : this.props.strategyData?.amount,
                                  float_part_length: this.pair.order_size_float_precision
                              })}
                              placeholder={`order amount (${this.pair.base})`}
                              pattern="[0-9]+([,][0-9]{1,2})?"
                              ref={c => this.strategy_amount = c}
                              onFocus={(e) => (e.target.dataset.lastValue = e.target.value)}
                              onChange={(e) => validate.handleInputChangeFloat(e, false, 'number', this.pair.order_size_float_precision, false)}/>
            </Form.Group>

            <Form.Group className="form-group">
                <label>{`order amount variation (${this.pair.base})`} <HelpIconView args={this.pair} help_item_name={'bot_order_amount_variation'}/></label>
                <Form.Control type="text"
                              defaultValue={get_fixed_value({
                                  value            : this.props.strategyData?.amount_variation,
                                  float_part_length: this.pair.order_size_float_precision
                              })}
                              placeholder={`order amount variation (${this.pair.base})`}
                              pattern="[0-9]+([,][0-9]{1,2})?"
                              ref={c => this.strategy_amount_variation = c}
                              onFocus={(e) => (e.target.dataset.lastValue = e.target.value)}
                              onChange={(e) => validate.handleInputChangeFloat(e, false, 'number', this.pair.order_size_float_precision, false)}/>
            </Form.Group>

            <Form.Group className="form-group">
                <label>{`minimum price (usdc)`} <HelpIconView args={this.pair} help_item_name={'bot_order_price_min'}/></label>
                <Form.Control
                    type="text"
                    defaultValue={get_fixed_value({
                        value            : this.props.strategyData?.price_min,
                        zero_undefined   : true,
                        float_part_length: this.pair.order_price_float_precision
                    })}
                    placeholder={`minimum price (optional)`}
                    pattern="[0-9]+([,][0-9]{1,2})?"
                    ref={c => this.strategy_price_min = c}
                    onFocus={(e) => (e.target.dataset.lastValue = e.target.value)}
                    onChange={(e) => validate.handleInputChangeFloat(e, false, 'number', this.pair.order_price_float_precision, false)}/>
            </Form.Group>

            <Form.Group className="form-group">
                <label>{`maximum price (usdc)`} <HelpIconView args={this.pair} help_item_name={'bot_order_price_max'}/></label>
                <Form.Control
                    type="text"
                    defaultValue={get_fixed_value({
                        value            : this.props.strategyData?.price_max,
                        zero_undefined   : true,
                        float_part_length: this.pair.order_price_float_precision
                    })}
                    placeholder={`maximum price (optional)`}
                    pattern="[0-9]+([,][0-9]{1,2})?"
                    ref={c => this.strategy_price_max = c}
                    onFocus={(e) => (e.target.dataset.lastValue = e.target.value)}
                    onChange={(e) => validate.handleInputChangeFloat(e, false, 'number', this.pair.order_price_float_precision, false)}/>
            </Form.Group>

            <Form.Group className="form-group">
                <label>{`total budget (${this.pair.base})`} <HelpIconView args={this.pair} help_item_name={'bot_order_total_budget'}/></label>
                <Form.Control type="text"
                              defaultValue={get_fixed_value({
                                  value            : this.props.strategyData?.total_budget,
                                  float_part_length: this.pair.order_size_float_precision
                              })}
                              placeholder={`total budget (${this.pair.base})`}
                              pattern="[0-9]+([,][0-9]{1,2})?"
                              ref={c => this.strategy_total_budget = c}
                              onFocus={(e) => (e.target.dataset.lastValue = e.target.value)}
                              onChange={(e) => validate.handleInputChangeFloat(e, false, 'number', this.pair.order_size_float_precision, false)}/>
            </Form.Group>

            <Form.Group className="form-group">
                <label>{`frequency (seconds)`} <HelpIconView args={this.pair} help_item_name={'bot_order_frequency'}/></label>
                <Form.Control type="text"
                              defaultValue={number(this.props.strategyData?.time_frequency)}
                              placeholder={`frequency (seconds)`}
                              pattern="[0-9]+([,][0-9]{1,2})?"
                              ref={c => this.strategy_time_frequency = c}
                              onChange={e => validate.handleInputChangeInteger(e, false)}/>
            </Form.Group>
        </Form>;
    }
}
