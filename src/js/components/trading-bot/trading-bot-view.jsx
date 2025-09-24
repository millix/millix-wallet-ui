import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import BotApiConfigurationView from './bot-api-configuration-view';
import TradingExchangeSelectView from './trading-exchange-select-view';
import BotStrategyTabsView from './bot-strategy-tabs-view';
import {ProgressBar} from 'primereact/progressbar';
import Api from '../../api';


class TradingBotView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            apiKey         : undefined,
            loading        : false,
            configureApiKey: false,
            exchange       : undefined
        };
    }

    setExchange(exchange) {
        if (exchange) {
            this.setState({loading: true});
            Api.getTangledBotExchangeApiKey(exchange)
               .then(data => {
                   const apiKey = data?.exchange_api_key?.value;
                   this.setState({
                       apiKey,
                       loading        : false,
                       configureApiKey: !apiKey,
                       exchange
                   });
               });
        }
        else {
            this.setState({
                apiKey         : undefined,
                loading        : false,
                configureApiKey: false,
                exchange
            });
        }
    }

    setExchangeApiKey(newKey) {
        Api.setTangledBotExchangeApiKey(newKey, this.state.exchange)
           .then(() => {
               let noNewKey = !newKey;
               this.setState({
                       apiKey         : newKey,
                       configureApiKey: noNewKey,
                       exchange       : noNewKey ? undefined : this.state.exchange
                   }
               );
           });
    }

    render() {
        if (this.state.loading) {
            return <ProgressBar mode="indeterminate" style={{height: '6px'}}/>;
        }
        return (
            !this.state.exchange ? <TradingExchangeSelectView onExchangeSelect={this.setExchange.bind(this)}/> :
            this.state.configureApiKey ? <BotApiConfigurationView apiKey={this.state.apiKey}
                                                                  exchange={this.state.exchange}
                                                                  onCancel={() => {
                                                                      if (this.state.apiKey) {
                                                                          this.setState({configureApiKey: false});
                                                                      }
                                                                      else {
                                                                          this.setState({
                                                                              exchange       : undefined,
                                                                              configureApiKey: true
                                                                          });
                                                                      }
                                                                  }}
                                                                  onChange={this.setExchangeApiKey.bind(this)}/>
                                       : <BotStrategyTabsView apiKey={this.state.apiKey}
                                                              exchange={this.state.exchange}
                                                              onBack={() => this.setState({
                                                                  exchange: undefined,
                                                                  configureApiKey: false
                                                              })}
                                                              onConfigureKey={() => this.setState({configureApiKey: true})}/>
        );
    }
}


export default withRouter(TradingBotView);
