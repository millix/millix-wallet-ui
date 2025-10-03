import React, {Component, useEffect} from 'react';
import {withRouter} from 'react-router-dom';
import {Badge, Button, Col, Form, Row, Tab, Tabs} from 'react-bootstrap';
import DatatableView from '../utils/datatable-view';
import ModalView from '../utils/modal-view';
import BotNewConstantStrategyModel from './bot-new-constant-strategy-model';
import BotNewPriceChangeStrategyModel from './bot-new-price-change-strategy-model';
import BotNewSpreadStrategyModel from './bot-new-spread-strategy-model';
import Api from '../../api';
import {get_fixed_value, number} from '../../helper/format';
import DatatableActionButtonView from '../utils/datatable-action-button-view';
import * as text from '../../helper/text';
import utils from '../../helper/utils';
import {ProgressBar} from 'primereact/progressbar';
import {Dropdown} from 'primereact/dropdown';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import moment from 'moment/moment';
import ExchangeConfig from '../../core/exchange-config';
import PageTitle from '../page-title';
import _ from 'lodash';
import EXCHANGE_CONFIG from '../../core/exchange-config';

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
            'strategy-price-change-data': [],
            'strategy-spread-data'      : [],
            symbol                      : 'mlx_usdc',
            balances                    : {
                portfolio: 0,
                asset    : 0,
                currency : 0
            },
            pair                        : ExchangeConfig['mlx_usdc']
        };

        this.updateTimeoutHandler = undefined;

        this.fetchSymbolTimeoutHandlers = {};
        this.symbols                    = _.keys(EXCHANGE_CONFIG).map(symbol => symbol.toUpperCase());

        this.fetchSymbolStats();

        this.exchangeTradingPairs = [
            {
                id   : 'mlx_usdc',
                value: 'mlx / usdc'
            },
            {
                id   : 'btc_usdc',
                value: 'btc / usdc'
            },
            {
                id   : 'eth_usdc',
                value: 'eth / usdc'
            },
            {
                id   : 'pol_usdc',
                value: 'pol / usdc'
            },
            {
                id   : 'sol_usdc',
                value: 'sol / usdc'
            },
            {
                id   : 'xrp_usdc',
                value: 'xrp / usdc'
            }
        ];

        this.commonFields = [
            {
                field : 'order_type',
                header: `type`,
                body  : (item) => <span
                    style={{color: item.order_type === 'ask' || item.order_type === 'sell' ? colorRed : colorGreen}}>{item.order_type === 'both' ? 'buy/sell' : item.order_type}</span>,
                parser: (data) => data
            },
            {
                field : 'amount',
                header: `amount`,
                body  : (item) => <span
                    style={{color: item.order_type === 'ask' || item.order_type === 'sell' ? colorRed : colorGreen}}>{get_fixed_value({
                    value            : item.amount,
                    float_part_length: this.state.pair.order_size_float_precision
                })}</span>,
                parser: (data) => parseFloat(data)
            },
            {
                field : 'amount_variation',
                header: `amount variation`,
                body  : (item) => <span
                    style={{color: item.order_type === 'ask' || item.order_type === 'sell' ? colorRed : colorGreen}}>{get_fixed_value({
                    value            : item.amount_variation,
                    float_part_length: this.state.pair.order_size_float_precision
                })}</span>,
                parser: (data) => parseFloat(data)
            },
            {
                field : 'amount_traded',
                header: `amount traded`,
                body  : (item) => <span
                    style={{color: item.order_type === 'ask' || item.order_type === 'sell' ? colorRed : colorGreen}}>{get_fixed_value({
                    value            : item.amount_traded,
                    float_part_length: this.state.pair.order_size_float_precision
                })}</span>,
                parser: (data) => parseFloat(data)
            },
            {
                field : 'total_budget',
                header: `total budget`,
                body  : (item) => <span
                    style={{color: item.total_budget <= item.amount_traded + item.amount ? 'gray' : item.order_type === 'ask' || item.order_type === 'sell' ? colorRed : colorGreen}}>{get_fixed_value({
                    value            : item.total_budget,
                    float_part_length: this.state.pair.order_size_float_precision
                })}</span>,
                parser: (data) => parseFloat(data)
            },
            {
                field : 'strategy_description',
                header: `description`,
                parser: (data) => data
            },
            {
                field : 'price_min',
                header: `minimum price`,
                body  : (item) => item?.price_min?.toFixed(this.state.pair.order_price_float_precision),
                parser: (data) => parseFloat(data)
            },
            {
                field : 'price_max',
                header: `maximum price`,
                body  : (item) => item?.price_max?.toFixed(this.state.pair.order_price_float_precision),
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

        this.spreadStrategyFields = [
            {
                field : 'time_frequency',
                header: `time frequency`,
                body  : (item) => number(item.time_frequency),
                parser: (data) => parseInt(data)
            },
            {
                field : 'spread_percentage_begin',
                header: `from spread percentage`,
                body  : (item) => number(item.spread_percentage_begin),
                parser: (data) => parseInt(data)
            },
            {
                field : 'spread_percentage_end',
                header: `to spread percentage`,
                body  : (item) => number(item.spread_percentage_end),
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

    fetchSymbolStats() {

        const fetchSymbolStatistics = (exchange, symbol) => {
            return Api.getTradingStatistics(symbol, 'D1', exchange)
                      .then((response) => {
                          if (response.data) {
                              response.data.close = response.data.close ?? 0;
                              response.data.open  = response.data.open ?? 0;
                              response.data.high  = response.data.high ?? 0;
                              response.data.low   = response.data.low ?? 0;
                          }
                          return response?.data;
                      }).catch(_ => _);
        };


        const scheduleSymbolStatisticsFetch = (exchange, symbol, timeout = 0) => {
            this.fetchSymbolTimeoutHandlers[symbol] = setTimeout(() => {
                if (!this.fetchSymbolTimeoutHandlers[symbol]) {
                    return;
                }

                fetchSymbolStatistics(exchange, symbol).then((data) => {
                    if (!this.fetchSymbolTimeoutHandlers[symbol]) {
                        return;
                    }
                    this.setState({[`${symbol}_price`]: data.close});
                    scheduleSymbolStatisticsFetch(exchange, symbol, 30000);
                });
            }, timeout);
        };

        this.symbols.forEach(symbol => {
            scheduleSymbolStatisticsFetch(this.props.exchange, symbol);
        });
    }

    getPortfolioBalance(userSate) {
        let portfolioBalance = 0;
        for (const symbol of this.symbols) {
            const [asset] = symbol.split('_');
            const price   = this.state[`${symbol}_price`];
            if (!price) {
                return 0;
            }
            const balance = userSate.accounts.find(i => i.currency === asset)?.balance;
            portfolioBalance += price * (balance || 0);
        }
        return portfolioBalance;
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

    getPageTitle() {
        return `bot - ${this.props.exchange} | ${this.state.symbol}`;
    };

    componentDidMount() {
        window.gtag('event', 'page_view', {
            'page_title': this.getPageTitle(),
            strategy    : this.state.selectedStrategyType.replace(/-/g, ' ')
        });
        this.update();
    }

    componentWillUnmount() {
        clearTimeout(this.updateTimeoutHandler);

        _.keys(this.fetchSymbolTimeoutHandlers).forEach(pair => {
            clearTimeout(this.fetchSymbolTimeoutHandlers[pair]);
        });
    }

    update() {
        clearTimeout(this.updateTimeoutHandler);
        Api.listStrategies(this.state.selectedStrategyType, this.props.exchange, this.state.symbol)
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
                       strategy.spread_percentage_begin = extraConfig.spread_percentage_begin;
                       strategy.spread_percentage_end   = extraConfig.spread_percentage_end;
                       strategy.amount_variation        = extraConfig.amount_variation;
                   }

                   if (strategy.order_type === 'ask' || strategy.order_type === 'sell') {
                       strategy.amount_traded = -strategy.amount_traded;
                   }

                   strategy.action = <>
                       <DatatableActionButtonView
                           icon={`fa-solid ${strategy.status === 1 ? 'fa-pause' : 'fa-play'}`}
                           callback={() => Api.upsertStrategy(strategy.strategy_id, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, this.props.exchange, this.state.symbol, strategy.status === 1 ? 2 : 1).then(() => this.update())}
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

               return Api.getTradingStatistics(this.state.symbol.toUpperCase(), 'D1', this.props.exchange)
                         .then(response => {
                             const lastPrice = !this.state.statistics ? undefined : this.state.statistics.close;
                             if (response.data) {
                                 response.data.close = response.data.close ?? 0;
                                 response.data.open  = response.data.open ?? 0;
                                 response.data.high  = response.data.high ?? 0;
                                 response.data.low   = response.data.low ?? 0;
                             }
                             this.setState({
                                 statistics: response.data,
                                 lastPrice
                             });
                         })
                         .then(() => Api.getState(this.props.exchange))
                         .then(({data: userState}) => {
                             this.setState({
                                 balances: {
                                     portfolio: this.getPortfolioBalance(userState),
                                     currency: userState.accounts.find(i => i.currency === this.state.pair.currency.toUpperCase())?.balance || 0,
                                     asset   : userState.accounts.find(i => i.currency === this.state.pair.base_ticker.toUpperCase())?.balance || 0
                                 }
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
        if (this.state.selectedStrategyType === 'strategy-spread') {
            this.spreadStrategyFields.forEach(field => fieldParsers[field.header] = field);
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
                     strategy['extra_config'] = {amount_variation: strategy.amount_variation || 0};

                     if (this.state.selectedStrategyType === 'strategy-constant') {
                         if (!!strategy.time_frequency) {
                             strategy['extra_config']['time_frequency'] = strategy.time_frequency;
                             delete strategy['time_frequency'];

                             strategy['extra_config'] = JSON.parse(strategy['extra_config']);
                             return true;
                         }
                         return false;
                     }
                     if (this.state.selectedStrategyType === 'strategy-price-change') {
                         if (!!strategy.price_change_percentage && !!strategy.time_frame) {
                             strategy['extra_config']['price_change_percentage'] = strategy.price_change_percentage;
                             strategy['extra_config']['time_frame']              = strategy.time_frame;
                             delete strategy['price_change_percentage'];
                             delete strategy['time_frame'];

                             strategy['extra_config'] = JSON.parse(strategy['extra_config']);
                             return true;
                         }
                         return false;
                     }

                     if (this.state.selectedStrategyType === 'strategy-spread') {
                         if (!!strategy.spread_percentage_begin && !!strategy.spread_percentage_end && !!strategy.time_frequency) {
                             strategy['extra_config']['spread_percentage_begin'] = strategy.spread_percentage_begin;
                             strategy['extra_config']['spread_percentage_end']   = strategy.spread_percentage_end;
                             strategy['extra_config']['time_frequency']          = strategy.time_frequency;
                             delete strategy['spread_percentage_begin'];
                             delete strategy['spread_percentage_end'];
                             delete strategy['time_frequency'];

                             strategy['extra_config'] = JSON.parse(strategy['extra_config']);
                             return true;
                         }
                         return false;
                     }
                 });

                 Api.importStrategies(data, this.props.exchange, this.state.symbol).then(_ => this.update()).catch(_ => _).then(_ => e.target.value = null);
             });
    }

    getPricePercentageChange(statistics) {
        if (!statistics) {
            return undefined;
        }

        if (statistics.open === 0) {
            return 0;
        }

        return Math.round((statistics.close - statistics.open) / statistics.open * 100);
    }

    changeSymbol(newSymbol) {
        if (this.state.symbol !== newSymbol) {
            this.setState({
                symbol    : newSymbol,
                pair      : ExchangeConfig[newSymbol],
                statistics: undefined
            }, () => {
                window.gtag('event', 'page_view', {
                    'page_title': this.getPageTitle(),
                    strategy    : this.state.selectedStrategyType.replace(/-/g, ' ')
                });
                this.update();
            });
        }
    }

    render() {
        if (!this.state.statistics) {
            return <div className={'panel panel-filled'}>
                <div className={'panel-body'}>
                    <ProgressBar mode={'indeterminate'} style={{height: '6px'}}/>
                </div>
            </div>;
        }
        const priceChange      = this.getPricePercentageChange(this.state.statistics);
        const priceChangeColor = priceChange >= 0 ? colorGreen : colorRed;
        return this.state.statistics && <>
            <PageTitle title={this.getPageTitle()}/>
            <div className={'panel panel-filled'}>
                <div className={'panel-body'}>
                    <Row>
                        <Col style={{margin: 'auto'}}><Button variant={'outline-secondary'} onClick={this.props.onBack}><FontAwesomeIcon
                            icon={'arrow-circle-left'}/> Back</Button></Col>
                        <Col>
                            <Row>{this.props.exchange}</Row>
                        </Col>
                    </Row>
                </div>
            </div>
            <div className={'panel panel-filled'}>
                <div className={'panel-body'}>
                    <Row>
                        {this.props.exchange === 'tangled.com' ? <Col style={{margin: 'auto'}}>{`mlx / usdc`}</Col> :
                         <Col style={{
                             margin  : 'auto',
                             maxWidth: 220
                         }}>
                             <Form.Group className="form-group">
                                 <Dropdown
                                     value={this.state.symbol} options={this.exchangeTradingPairs} optionLabel={'value'} optionValue={'id'}
                                     onChange={(e) => this.changeSymbol(e.value)} className={'form-control p-0'}/>
                             </Form.Group>
                         </Col>}
                        <Col>
                            <Row>last price:</Row>
                            <Row
                                style={{color: !this.state.lastPrice ? priceChangeColor : this.state.statistics.close >= this.state.lastPrice ? colorGreen : colorRed}}>{this.state.statistics.close.toFixed(this.state.pair.order_price_float_precision)}</Row>
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
                            <Row>{this.state.statistics.high.toFixed(this.state.pair.order_price_float_precision)}</Row>
                        </Col>
                        <Col>
                            <Row>24h low:</Row>
                            <Row>{this.state.statistics.low.toFixed(this.state.pair.order_price_float_precision)}</Row>
                        </Col>
                        <Col>
                            <Row>24h volume:</Row>
                            <Row>{this.state.statistics.volume.toLocaleString('en-US')}</Row>
                        </Col>
                    </Row>
                    <Row>
                        {this.props.exchange === 'tangled.com' ? <Col style={{margin: 'auto'}}></Col> :
                         <Col style={{
                             margin  : 'auto',
                             maxWidth: 220
                         }}>
                             <div>portfolio:</div>
                             <div>${get_fixed_value({
                                 value            : this.state.balances.portfolio,
                                 float_part_length: 2
                             })}</div>
                         </Col>}
                        <Col>
                            <Row>{this.state.pair.base_ticker}:</Row>
                            <Row>{get_fixed_value({
                                value            : this.state.balances.asset,
                                float_part_length: this.state.pair.order_size_float_precision
                            })}</Row>
                        </Col>
                        <Col>
                            <Row>{this.state.pair.currency}:</Row>
                            <Row>{get_fixed_value({
                                value            : this.state.balances.currency,
                                float_part_length: 2
                            })}</Row>
                        </Col>
                        <Col>
                        </Col>
                        <Col>
                        </Col>
                        <Col>
                        </Col>
                    </Row>
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
                        {`This trading bot is an experimental feature that allows you to trade on ${this.props.exchange}. Please use caution and use small limits to become comfortable with the trade bot. Tangled is not responsible for any unexpected behaviour or losses as a result of the trading bot.`}
                    </p>
                    <ModalView show={this.state.modalShowDeleteStrategy}
                               size={'lg'}
                               heading={`delete strategy`}
                               on_close={() => this.setState({
                                   modalShowDeleteStrategy: false,
                                   selectedStrategy       : undefined
                               })}
                               on_accept={() => {
                                   Api.upsertStrategy(this.state.selectedStrategy.strategy_id, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, this.props.exchange, this.state.symbol, 0)
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
                            else if (this.state.showModelType === 'strategy-price-change') {
                                success = await this.price_change_strategy_modal.save();
                            }
                            else if (this.state.showModelType === 'strategy-spread') {
                                success = await this.spread_strategy_modal.save();
                            }
                            if (success) {
                                this.setState({
                                    showModelType   : false,
                                    selectedStrategy: undefined
                                });
                                this.update();
                            }
                        }}
                        heading={`${this.state.showModelType === 'strategy-constant' ? 'constant strategy' : this.state.showModelType === 'strategy-price-change' ? 'price change strategy' : 'spread/market making strategy'}`}
                        body={
                            <>
                                {this.state.showModelType === 'strategy-constant' &&
                                 <BotNewConstantStrategyModel strategyType="strategy-constant" strategyData={this.state.selectedStrategy}
                                                              exchange={this.props.exchange}
                                                              symbol={this.state.symbol}
                                                              ref={c => this.constant_strategy_modal = c}/>}
                                {this.state.showModelType === 'strategy-price-change' &&
                                 <BotNewPriceChangeStrategyModel strategyType="strategy-price-change" strategyData={this.state.selectedStrategy}
                                                                 exchange={this.props.exchange}
                                                                 symbol={this.state.symbol}
                                                                 ref={c => this.price_change_strategy_modal = c}/>}
                                {this.state.showModelType === 'strategy-spread' &&
                                 <BotNewSpreadStrategyModel strategyType="strategy-spread" strategyData={this.state.selectedStrategy}
                                                            exchange={this.props.exchange}
                                                            symbol={this.state.symbol}
                                                            ref={c => this.spread_strategy_modal = c}/>}
                            </>
                        }/>
                    <Tabs
                        defaultActiveKey="strategy-constant"
                        transition={false}
                        id="bot-tab-strategies"
                        className="mb-3"
                        onSelect={(strategy) => {
                            this.setState({selectedStrategyType: strategy}, () => {
                                window.gtag('event', 'page_view', {
                                    page_title: this.getPageTitle(),
                                    strategy  : this.state.selectedStrategyType.replace(/-/g, ' ')
                                });
                                this.update();
                            });
                        }}
                    >
                        <Tab eventKey="strategy-constant" title={'constant strategy'}>
                            <DatatableView
                                reload_datatable={() => this.update()}
                                loading={this.state.dataLoading}
                                export_button_label={'export strategies'}
                                import_button_label={'import strategies'}
                                export_filename={`export_strategy_constant_${this.props.exchange}_${this.state.symbol}`}
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
                                export_filename={`export_strategy_price_change_${this.props.exchange}_${this.state.symbol}`}
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

                        <Tab eventKey="strategy-spread" title={'spread/market making strategy'}>
                            <DatatableView
                                reload_datatable={() => this.update()}
                                loading={this.state.dataLoading}
                                export_button_label={'export strategies'}
                                import_button_label={'import strategies'}
                                export_filename={`export_strategy_spread_${this.props.exchange}_${this.state.symbol}`}
                                allow_export={true}
                                allow_import={true}
                                onImportFile={this.importStrategies.bind(this)}
                                datatable_reload_timestamp={this.state.lastUpdateTime}
                                action_button={{
                                    label   : `new strategy`,
                                    on_click: () => this.setState({showModelType: 'strategy-spread'})
                                }}
                                value={this.state['strategy-spread-data']}
                                sortOrder={1}
                                showActionColumn={true}
                                resultColumn={[
                                    ...this.commonFields,
                                    ...this.spreadStrategyFields
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
