import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import BotApiConfigurationView from './bot-api-configuration-view';
import BotStrategyTabsView from './bot-strategy-tabs-view';
import {ProgressBar} from 'primereact/progressbar';
import Api from '../../api';


class TradingBotView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            apiKey         : undefined,
            loading        : true,
            configureApiKey: false
        };
    }

    componentDidMount() {
        Api.getTangledBotExchangeApiKey()
           .then(data => {
               const apiKey = data?.tangled_exchange_api_key?.value;
               this.setState({
                   apiKey,
                   loading        : false,
                   configureApiKey: !apiKey
               });
           });
    }

    render() {
        if (this.state.loading) {
            return <ProgressBar mode="indeterminate" style={{height: '6px'}}/>;
        }
        return (
            <>
                {this.state.configureApiKey && <BotApiConfigurationView apiKey={this.state.apiKey} onChange={(newKey) => this.setState({
                    apiKey         : newKey,
                    configureApiKey: false
                })}/>}
                {!this.state.configureApiKey && <BotStrategyTabsView apiKey={this.state.apiKey} onConfigureKey={() => this.setState({configureApiKey: true})}/>}
            </>
        );
    }
}


export default withRouter(TradingBotView);
