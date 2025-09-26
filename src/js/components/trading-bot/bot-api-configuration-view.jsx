import React, {Component, useEffect} from 'react';
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
import PageTitle from '../page-title';


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

    saveChanges() {
        this.props.onChange(this.state.apiKey);
    }

    componentDidMount() {
        window.gtag('event', 'page_view', {'page_title': `bot - ${this.props.exchange} apikey`});
    }

    render() {
        return <>
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>{`configure ${this.props.exchange} exchange api`}
                </div>
                <div className={'panel-body'}>
                    <p>
                        {`please, go to ${this.props.exchange} and generate an api key, then use this form to configure your ${this.props.exchange} api key to activate the bot.`}
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
                                onClick={this.saveChanges.bind(this)}
                                disabled={this.state.sending}>
                                {this.state.sending ? <>{Translation.getPhrase('a23d9a84b')}</> : <>{Translation.getPhrase('0e3e60d83')}</>}
                            </Button>
                            <Button
                                variant="outline-secondary"
                                onClick={this.props.onCancel}
                                disabled={this.state.sending}
                                style={{marginLeft: 16}}>
                                {Translation.getPhrase('1c5390bfe')}
                            </Button>
                        </Form.Group>
                    </Form>
                </div>
            </div>
        </>;
    }
}


export default withRouter(BotApiConfigurationView);
