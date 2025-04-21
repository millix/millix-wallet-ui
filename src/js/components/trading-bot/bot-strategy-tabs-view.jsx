import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Badge, Button, Col, Row, Tab, Tabs} from 'react-bootstrap';
import DatatableView from '../utils/datatable-view';
import ModalView from '../utils/modal-view';
import BotNewConstantStrategyModel from './bot-new-constant-strategy-model';
import BotNewPriceChangeStrategyModel from './bot-new-price-change-strategy-model';
import Api from '../../api';
import {millix, number} from '../../helper/format';
import DatatableActionButtonView from '../utils/datatable-action-button-view';
import * as text from '../../helper/text';
import utils from '../../helper/utils';
import {ProgressBar} from 'primereact/progressbar';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import moment from 'moment/moment';

const colorGreen = '#55af55';
const colorRed   = '#f44336';


class BotStrategyTabsView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModelType               : undefined,
            dataLoading                 : true,
            selectedStrategyType        : 'strategy-constant',
            lastUpdateTime              : Date.now(),
            selectedStrategy            : undefined,
            statistics                  : undefined,
            lastPrice                   : undefined,
            'strategy-constant-data'    : [],
            'strategy-price-change-data': []
        };

        this.updateTimeoutHandler = undefined;

        this.commonFields = [
            {
                field : 'order_type',
                header: `type`,
                body  : (item) => <span
                    style={{color: item.order_type === 'ask' || item.order_type === 'sell' ? colorRed : colorGreen}}>{item.order_type}</span>,
                parser: (data) => data
            },
            {
                field : 'amount',
                header: `amount`,
                body  : (item) => <span
                    style={{color: item.order_type === 'ask' || item.order_type === 'sell' ? colorRed : colorGreen}}>{millix(item.amount, false)}</span>,
                parser: (data) => parseInt(data)
            },
            {
                field : 'amount_traded',
                header: `amount traded`,
                body  : (item) => <span
                    style={{color: item.order_type === 'ask' || item.order_type === 'sell' ? colorRed : colorGreen}}>{millix(item.amount_traded, false)}</span>,
                parser: (data) => parseInt(data)
            },
            {
                field : 'total_budget',
                header: `total budget`,
                body  : (item) => <span
                    style={{color: item.total_budget <= item.amount_traded + item.amount ? 'gray' : item.order_type === 'ask' || item.order_type === 'sell' ? colorRed : colorGreen}}>{millix(item.total_budget, false)}</span>,
                parser: (data) => parseInt(data)
            },
            {
                field : 'strategy_description',
                header: `description`,
                parser: (data) => data
            },
            {
                field : 'price_min',
                header: `minimum price`,
                body  : (item) => item?.price_min?.toFixed(9),
                parser: (data) => parseFloat(data)
            },
            {
                field : 'price_max',
                header: `maximum price`,
                body  : (item) => item?.price_max?.toFixed(9),
                parser: (data) => parseFloat(data)
            },
            {
                field : 'order_ttl',
                header: `time to live`,
                parser: (data) => parseInt(data)
            }
        ];

        this.constantStrategyFields = [
            {
                field : 'time_frequency',
                header: `time frequency`,
                body  : (item) => number(item.time_frequency),
                parser: (data) => parseInt(data)
            },
            {
                field : 'status',
                header: `status`,
                body  : (item) => item.status === 1 ? `running ${this.getRunningInTime(item)}` : 'paused',
                parser: (data) => parseInt(data)
            }
        ];

        this.priceChangeStrategyFields = [
            {
                field : 'price_change_percentage',
                header: `change percentage`,
                body  : (item) => number(item.price_change_percentage),
                parser: (data) => parseInt(data)
            },
            {
                field : 'time_frame',
                header: `time frame`,
                body  : (item) => number(item.time_frame),
                parser: (data) => parseInt(data)
            },
            {
                field : 'status',
                header: `status`,
                body  : (item) => item.status === 1 ? `running ${this.getRunningInTime(item)}` : 'paused',
                parser: (data) => parseInt(data)
            }
        ];
    }

    getRunningInTime(strategy) {
        const time = (strategy.time_frame || strategy.time_frequency) * 1000;
        if (strategy.last_run_status === 1) {
            let runningIn = Math.floor((time - (Date.now() - strategy.last_run_timestamp * 1000) % (time * 1000)) / 1000);
            if (runningIn > 0) {
                return moment(Date.now() + runningIn * 1000).fromNow();
            }
            runningIn = Math.floor((time - (Date.now() - this.state.lastUpdateTime) % (time * 1000)) / 1000);
            return moment(Date.now() + runningIn * 1000).fromNow();
        }

        return moment(Date.now() + 1000).fromNow();
    }

    componentDidMount() {
        this.update();
    }

    componentWillUnmount() {
        clearTimeout(this.updateTimeoutHandler);
    }

    update() {
        clearTimeout(this.updateTimeoutHandler);
        Api.listStrategies(this.state.selectedStrategyType)
           .then(data => {
               const strategyList = data.strategy_list;
               strategyList.forEach((strategy) => {
                   if (strategy.extra_config) {
                       const extraConfig       = JSON.parse(strategy.extra_config);
                       strategy.time_frequency = extraConfig.time_frequency;
                       strategy.time_frame     = extraConfig.time_frame;
                       if (!!strategy.time_frame && Number.isInteger(strategy.time_frame)) {
                           strategy.time_frame = Math.floor(strategy.time_frame / 60);
                       }
                       strategy.price_change_percentage = extraConfig.price_change_percentage;
                   }

                   if (strategy.order_type === 'ask' || strategy.order_type === 'sell') {
                       strategy.amount_traded = -strategy.amount_traded;
                   }

                   strategy.action = <>
                       <DatatableActionButtonView
                           icon={`fa-solid ${strategy.status === 1 ? 'fa-pause' : 'fa-play'}`}
                           callback={() => Api.upsertStrategy(strategy.strategy_id, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, strategy.status === 1 ? 2 : 1).then(() => this.update())}
                           callback_args={[]}
                       />
                       <DatatableActionButtonView
                           icon={'fa-solid fa-pencil'}
                           callback={() => this.setState({
                               showModelType   : strategy.strategy_type,
                               selectedStrategy: strategy
                           })}
                           callback_args={[]}
                       />
                       <DatatableActionButtonView
                           icon={'trash'}
                           callback={() => this.setState({
                               modalShowDeleteStrategy: true,
                               selectedStrategy       : strategy
                           })}
                           callback_args={[]}
                       />
                   </>;
               });

               this.setState({
                   dataLoading                                : false,
                   lastUpdateTime                             : Date.now(),
                   [`${this.state.selectedStrategyType}-data`]: strategyList
               });

               return Api.getTradingStatistics('MLX_USDC', 'D1')
                         .then(response => {
                             console.log(response.data);
                             const lastPrice = !this.state.statistics ? undefined : this.state.statistics.close;
                             this.setState({
                                 statistics: response.data,
                                 lastPrice
                             });
                             this.updateTimeoutHandler = setTimeout(() => this.update(), 10000);
                         });
           })
           .catch(() => {
               this.setState({dataLoading: false});
               this.updateTimeoutHandler = setTimeout(() => this.update(), 10000);
           });
    }

    getApiKeyMasked() {
        const apiKey = this.props.apiKey;
        return [
            apiKey.substring(0, 3),
            '*************************',
            apiKey.substring(apiKey.length - 4)
        ].join('');
    }

    importStrategies(e) {
        const file         = e.target.files[0];
        const fieldParsers = {};
        this.commonFields.forEach(field => fieldParsers[field.header] = field);
        if (this.state.selectedStrategyType === 'strategy-constant') {
            this.constantStrategyFields.forEach(field => fieldParsers[field.header] = field);
        }
        if (this.state.selectedStrategyType === 'strategy-price-change') {
            this.priceChangeStrategyFields.forEach(field => fieldParsers[field.header] = field);
        }
        utils.importCSV(file)
             .then(csv => {
                 for (const item of csv.data) {
                     for (const k of Object.keys(item)) {
                         const fieldParser = fieldParsers[k];
                         if (fieldParser && item[k]) {
                             item[fieldParser.field] = fieldParser.parser(item[k]);
                         }
                         if (!fieldParser || k !== fieldParser.field) {
                             delete item[k];
                         }
                     }
                     item['strategy_type'] = this.state.selectedStrategyType;
                 }
                 const data = csv.data.filter(strategy => {
                     if (this.state.selectedStrategyType === 'strategy-constant') {
                         if (!!strategy.time_frequency) {
                             strategy['extra_config'] = JSON.stringify({time_frequency: strategy.time_frequency});
                             delete strategy['time_frequency'];
                             return true;
                         }
                         return false;
                     }
                     if (this.state.selectedStrategyType === 'strategy-price-change') {
                         if (!!strategy.price_change_percentage && !!strategy.time_frame) {
                             strategy['extra_config'] = JSON.stringify({
                                 price_change_percentage: strategy.price_change_percentage,
                                 time_frame             : strategy.time_frame
                             });
                             delete strategy['price_change_percentage'];
                             delete strategy['time_frame'];
                             return true;
                         }
                         return false;
                     }
                 });

                 Api.importStrategies(data).then(_ => this.update()).catch(_ => _).then(_ => e.target.value = null);
             });
    }

    getPricePercentageChange(statistics) {
        if (!statistics) {
            return undefined;
        }

        return Math.round((statistics.close - statistics.open) / statistics.open * 100);
    }

    render() {
        const priceChange      = this.getPricePercentageChange(this.state.statistics);
        const priceChangeColor = priceChange >= 0 ? colorGreen : colorRed;
        return <>
            <div className={'panel panel-filled'}>
                <div className={'panel-body'}>
                    {!this.state.statistics && <ProgressBar mode={'indeterminate'} style={{height: '6px'}}/>}
                    {this.state.statistics && <Row>
                        <Col style={{margin: 'auto'}}>{`mlx / usdc`}</Col>
                        <Col>
                            <Row>last price:</Row>
                            <Row
                                style={{color: !this.state.lastPrice ? priceChangeColor : this.state.statistics.close >= this.state.lastPrice ? colorGreen : colorRed}}>{this.state.statistics.close.toFixed(9)}</Row>
                        </Col>
                        <Col>
                            <Row>24h change:</Row>
                            <Row style={{color: priceChange > 0 ? colorGreen : colorRed}}>
                                <Badge bg={''} style={{
                                    maxWidth: 60,
                                    color   : priceChangeColor,
                                    border  : `1px solid ${priceChangeColor}`
                                }}>
                                    <FontAwesomeIcon size={'1x'} icon={priceChange >= 0 ? 'caret-up' : 'caret-down'}/>
                                    {priceChange}%
                                </Badge>
                            </Row>
                        </Col>
                        <Col>
                            <Row>24h high:</Row>
                            <Row>{this.state.statistics.high.toFixed(9)}</Row>
                        </Col>
                        <Col>
                            <Row>24h low:</Row>
                            <Row>{this.state.statistics.low.toFixed(9)}</Row>
                        </Col>
                        <Col>
                            <Row>24h volume:</Row>
                            <Row>{this.state.statistics.volume.toLocaleString('en-US')}</Row>
                        </Col>
                    </Row>}
                </div>
            </div>
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>
                    <Row>
                        <Col>
                            {`bot strategies`}
                        </Col>
                        <Col style={{textAlign: 'right'}}>
                            <Button variant="outline-primary"
                                    size={'sm'}
                                    onClick={() => this.props.onConfigureKey()}>
                                <small style={{fontSize: '14px'}}>api key: <Badge>{this.getApiKeyMasked()}</Badge></small>
                            </Button>
                        </Col>
                    </Row>
                </div>
                <div className={'panel-body'}>
                    <p>
                        {`This trading bot is an experimental feature that allows you to trade on tangled.com/exchange. Please use caution and use small limits to become comfortable with the trade bot. Tangled is not responsible for any unexpected behaviour or losses as a result of the trading bot.`}
                    </p>
                    <ModalView show={this.state.modalShowDeleteStrategy}
                               size={'lg'}
                               heading={`delete strategy`}
                               on_close={() => this.setState({
                                   modalShowDeleteStrategy: false,
                                   selectedStrategy       : undefined
                               })}
                               on_accept={() => {
                                   Api.upsertStrategy(this.state.selectedStrategy.strategy_id, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 0)
                                      .then(() => {
                                          this.setState({
                                              modalShowDeleteStrategy: false,
                                              selectedStrategy       : undefined
                                          });
                                          this.update();
                                      });
                               }}
                               body={<div>
                                   <div>{`you are about to delete the strategy "${this.state.selectedStrategy?.strategy_description}"`}</div>
                                   {text.get_confirmation_modal_question()}
                               </div>}/>
                    <ModalView
                        show={!!this.state.showModelType}
                        size={'lg'}
                        prevent_close_after_accept={true}
                        on_close={() => {
                            this.setState({
                                showModelType   : false,
                                selectedStrategy: undefined
                            });
                        }}
                        on_accept={async() => {
                            let success = false;
                            if (this.state.showModelType === 'strategy-constant') {
                                success = await this.constant_strategy_modal.save();
                            }
                            else {
                                success = await this.price_change_strategy_modal.save();
                            }
                            if (success) {
                                this.setState({
                                    showModelType   : false,
                                    selectedStrategy: undefined
                                });
                                this.update();
                            }
                        }}
                        heading={`${this.state.showModelType === 'strategy-constant' ? 'constant strategy' : 'price change strategy'}`}
                        body={
                            <>
                                {this.state.showModelType === 'strategy-constant' &&
                                 <BotNewConstantStrategyModel strategyType="strategy-constant" strategyData={this.state.selectedStrategy}
                                                              ref={c => this.constant_strategy_modal = c}/>}
                                {this.state.showModelType === 'strategy-price-change' &&
                                 <BotNewPriceChangeStrategyModel strategyType="strategy-price-change" strategyData={this.state.selectedStrategy}
                                                                 ref={c => this.price_change_strategy_modal = c}/>}
                            </>
                        }/>
                    <Tabs
                        defaultActiveKey="strategy-constant"
                        transition={false}
                        id="bot-tab-strategies"
                        className="mb-3"
                        onSelect={(strategy) => {
                            this.setState({selectedStrategyType: strategy}, () => this.update());
                        }}
                    >
                        <Tab eventKey="strategy-constant" title={'constant strategy'}>
                            <DatatableView
                                reload_datatable={() => this.update()}
                                loading={this.state.dataLoading}
                                export_button_label={'export strategies'}
                                import_button_label={'import strategies'}
                                export_filename={`export_strategy_constant`}
                                allow_export={true}
                                allow_import={true}
                                onImportFile={this.importStrategies.bind(this)}
                                datatable_reload_timestamp={this.state.lastUpdateTime}
                                action_button={{
                                    label   : `new strategy`,
                                    on_click: () => this.setState({showModelType: 'strategy-constant'})
                                }}
                                value={this.state['strategy-constant-data']}
                                sortOrder={1}
                                showActionColumn={true}
                                resultColumn={[
                                    ...this.commonFields,
                                    ...this.constantStrategyFields
                                ]}
                            />
                        </Tab>

                        <Tab eventKey="strategy-price-change" title={'price change strategy'}>
                            <DatatableView
                                reload_datatable={() => this.update()}
                                loading={this.state.dataLoading}
                                export_button_label={'export strategies'}
                                import_button_label={'import strategies'}
                                export_filename={`export_strategy_price_change`}
                                allow_export={true}
                                allow_import={true}
                                onImportFile={this.importStrategies.bind(this)}
                                datatable_reload_timestamp={this.state.lastUpdateTime}
                                action_button={{
                                    label   : `new strategy`,
                                    on_click: () => this.setState({showModelType: 'strategy-price-change'})
                                }}
                                value={this.state['strategy-price-change-data']}
                                sortOrder={1}
                                showActionColumn={true}
                                resultColumn={[
                                    ...this.commonFields,
                                    ...this.priceChangeStrategyFields
                                ]}
                            />
                        </Tab>
                    </Tabs>
                </div>
            </div>
        </>;
    }
}


export default withRouter(BotStrategyTabsView);
