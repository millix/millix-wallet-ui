import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Form, Table} from 'react-bootstrap';
import ModalView from '../utils/modal-view';
import ErrorList from '../utils/error-list-view';
import * as format from '../../helper/format';
import * as text from '../../helper/text';
import API from '../../api';
import HelpIconView from '../utils/help-icon-view';
import SubmitButtonView from '../utils/submit-button-view';
import UserInterfaceError from '../utils/user-interface-error';
import Translation from '../../common/translation';
import {Dropdown} from 'primereact/dropdown';
import * as validate from '../../helper/validate';
import {bool_label} from '../../helper/format';
import DatatableView from '../utils/datatable-view';
import Api from '../../api';


class BotApiConfigurationView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errorList      : [],
            modalShowResult: false,
            sending        : false,
            apiKey         : props.apiKey,
            modalBodyResult: ''
        };

    }

    componentDidMount() {
    }

    save() {
        Api.setTangledBotExchangeApiKey(this.state.apiKey)
           .then(this.props.onChange.bind(this, this.state.apiKey));
    }

    changeModalShowResult(value = true) {
        this.setState({
            modalShowResult: value
        });
    }

    render() {
        return <>
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>{`configure tangled.com exchange api`}
                </div>
                <div className={'panel-body'}>
                    <p>
                        {`please, go to tangled.com and generate an api key, then use this form to configure your tangled.com api key to activate the bot.`}
                    </p>

                    <Form>
                        <ErrorList
                            error_list={this.state.errorList}/>

                        <Form.Group className="form-group">
                            <label>{`api key`}</label>
                            <Form.Control
                                type="text"
                                value={this.state.apiKey}
                                onChange={(e) => this.setState({apiKey: e.target.value})}
                            />
                        </Form.Group>

                        <Form.Group
                            className={'d-flex justify-content-center'}>
                            <Button
                                variant="outline-primary"
                                onClick={() => this.save()}
                                disabled={this.state.sending}>
                                {this.state.sending ? <>{Translation.getPhrase('a23d9a84b')}</> : <>{Translation.getPhrase('0e3e60d83')}</>}
                            </Button>
                        </Form.Group>
                    </Form>
                </div>
            </div>
        </>;
    }
}


export default connect(
    state => ({
        bot: state.bot
    }))(withRouter(BotApiConfigurationView));
