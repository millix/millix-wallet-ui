import React, {Component} from 'react';
import ErrorList from '../utils/error-list-view';
import {Form} from 'react-bootstrap';
import {Dropdown} from 'primereact/dropdown';
import * as validate from '../../helper/validate';
import Api from '../../api';
import {millix, number} from '../../helper/format';
import HelpIconView from '../utils/help-icon-view';


export default class BotNewPriceChangeStrategyModel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errorList: [],
            type     : this.props.strategyData?.order_type || 'buy'
        };
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
        data.strategy_amount      = validate.amount(`order amount`, this.strategy_amount.value, error_list);
        if (this.strategy_price_min.value) {
            data.strategy_price_min = validate.floatPositive(`minimum price`, this.strategy_price_min.value, error_list, true);
        }
        if (this.strategy_price_max.value) {
            data.strategy_price_max = validate.floatPositive(`maximum price`, this.strategy_price_max.value, error_list, true);
        }
        data.strategy_total_budget      = validate.amount(`total budget`, this.strategy_total_budget.value, error_list);
        data.strategy_change_percentage = validate.integer(`change percentage`, this.strategy_change_percentage.value, error_list, false);
        data.strategy_time_frame        = validate.integerPositive(`time frame`, this.strategy_time_frame.value, error_list, false);

        if (error_list.length === 0) {
            try {
                await Api.upsertStrategy(this.props.strategyData?.strategy_id, data.strategy_description, this.props.strategyType, data.strategy_order_type, data.strategy_order_ttl,
                    data.strategy_amount, data.strategy_price_min, data.strategy_price_max, data.strategy_total_budget, JSON.stringify({
                        time_frame             : data.strategy_time_frame * 60,
                        price_change_percentage: data.strategy_change_percentage
                    }));
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
                    'ask'
                ]}
                    ref={(c) => this.strategy_order_type = c}
                    onChange={(e) => this.setState({type: e.value})} className={'form-control p-0'}/>
            </Form.Group>

            <Form.Group className="form-group">
                <label>{`order time-to-live (seconds)`} <HelpIconView help_item_name={'bot_order_ttl'}/></label>
                <Form.Control type="text"
                              defaultValue={number(this.props.strategyData?.order_ttl || 60)}
                              placeholder={`order time-to-live (seconds)`}
                              pattern="[0-9]+([,][0-9]{1,2})?"
                              ref={c => this.strategy_order_ttl = c}
                              onChange={e => validate.handleInputChangeInteger(e, false)}/>
            </Form.Group>

            <Form.Group className="form-group">
                <label>{`order amount (millix)`} <HelpIconView help_item_name={'bot_order_amount'}/></label>
                <Form.Control type="text"
                              defaultValue={millix(this.props.strategyData?.amount, false)}
                              placeholder={`order amount (millix)`}
                              pattern="[0-9]+([,][0-9]{1,2})?"
                              ref={c => this.strategy_amount = c}
                              onChange={validate.handleAmountInputChange.bind(this)}/>
            </Form.Group>

            <Form.Group className="form-group">
                <label>{`minimum price (usdc)`} <HelpIconView help_item_name={'bot_order_price_min'}/></label>
                <Form.Control
                    type="text"
                    defaultValue={number(this.props.strategyData?.price_min)}
                    placeholder={`minimum price (optional)`}
                    pattern="[0-9]+([,][0-9]{1,2})?"
                    ref={c => this.strategy_price_min = c}
                    onChange={e => validate.handleInputChangeFloat(e, false)}
                />
            </Form.Group>

            <Form.Group className="form-group">
                <label>{`maximum price (usdc)`} <HelpIconView help_item_name={'bot_order_price_max'}/></label>
                <Form.Control
                    type="text"
                    defaultValue={number(this.props.strategyData?.price_max)}
                    placeholder={`maximum price (optional)`}
                    pattern="[0-9]+([,][0-9]{1,2})?"
                    ref={c => this.strategy_price_max = c}
                    onChange={e => validate.handleInputChangeFloat(e, false)}
                />
            </Form.Group>

            <Form.Group className="form-group">
                <label>{`total budget (millix)`} <HelpIconView help_item_name={'bot_order_total_budget'}/></label>
                <Form.Control type="text"
                              defaultValue={millix(this.props.strategyData?.total_budget, false)}
                              placeholder={`total budget (millix)`}
                              pattern="[0-9]+([,][0-9]{1,2})?"
                              ref={c => this.strategy_total_budget = c}
                              onChange={validate.handleAmountInputChange.bind(this)}/>
            </Form.Group>

            <Form.Group className="form-group">
                <label>{`price change %`} <HelpIconView help_item_name={'bot_order_price_change'}/></label>
                <Form.Control type="text"
                              defaultValue={number(this.props.strategyData?.price_change_percentage)}
                              placeholder={`price change %`}
                              pattern="[0-9]+([,][0-9]{1,2})?"
                              ref={c => this.strategy_change_percentage = c}
                              onChange={e => validate.handleInputChangeInteger(e, true)}/>
            </Form.Group>

            <Form.Group className="form-group">
                <label>{`price change % time frame (minutes)`} <HelpIconView help_item_name={'bot_order_price_change_time_frame'}/></label>
                <Form.Control type="text"
                              defaultValue={number(this.props.strategyData?.time_frame)}
                              placeholder={`price change % time frame (minutes)`}
                              pattern="[0-9]+([,][0-9]{1,2})?"
                              ref={c => this.strategy_time_frame = c}
                              onChange={e => validate.handleInputChangeInteger(e, false)}/>
            </Form.Group>
        </Form>;
    }
}
