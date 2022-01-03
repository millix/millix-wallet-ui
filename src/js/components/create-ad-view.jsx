import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Col, Container, Form, FormControl, FormGroup, Row, Modal} from 'react-bootstrap';
import API from '../api/index';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {walletUpdateAddresses, walletUpdateBalance} from '../redux/actions/index';
import {withRouter} from 'react-router-dom';

var Typehead = require('react-bootstrap-typeahead').Typeahead;

const styles = {
    centered: {
        display       : 'flex',
        justifyContent: 'center'
    }
};


class CreateAdView extends Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state        = {

            submitData       : {},
            errors           : {},
            fields           : {
                creative_name          : '',
                category               : '',
                headline               : '',
                deck                   : '',
                url                    : '',
                target_language        : '',
                search_phrase          : 'no target phrase',
                daily_budget_mlx       : '',
                bid_per_impressions_mlx: ''
            },
            categories       : [],
            languages        : [],
            countries        : [
                //todo: replace me
                'united states',
                'antigua and barbuda',
                'barbados',
                'czech republic'
            ],
            regions          : [
                //todo: replace me
                'alaska',
                'california',
                'delaware',
                'florida',

                'st. john',
                'st. mary',
                'st. paul',
                'st. peter',

                'christ church',
                'saint andrew',
                'saint george',
                'saint james',

                'karlovy vary',
                'liberec',
                'moravian-silesia',
                'pardubice'
            ],
            cities           : [
                //todo: replace me
                'new york',
                'los angeles',
                'chicago',
                'houston',

                'saint john\'s',
                'all saints',
                'liberta',
                'potter\'s village',

                'bridgetown',
                'speightstown',
                'distins',
                'bathsheba',

                'prague',
                'brno',
                'ostrava',
                'plzeň'
            ],
            searchphrases    : [
                //todo: replace me
                'car insurance',
                'auto insurance',
                'honda insurance'
            ],
            addFundsModalShow: false
        };
    }

    componentDidMount() {
        this.getCategories();
        this.getLanguages();
    }

    async getCategories() {
        API.listCategories().then(data => {

            const options   = data.map(d => ({
                'value': d.advertisement_category_guid,
                'label': d.advertisement_category
            }));
            let fields      = this.state.fields;
            fields.category = options[0].value;

            this.setState({
                categories: options,
                fields    : fields
            });
        });
    }

    async getLanguages() {
        API.listLanguages().then(data => {

            const options          = data.map(d => ({
                'value': d.language_guid,
                'label': d.language_name + ' - ' + d.language_name_native
            }));
            let fields             = this.state.fields;
            fields.target_language = options[0].value;

            this.setState({
                languages: options,
                fields   : fields
            });
        });
    }

    handleValidation() {
        let fields      = this.state.fields;
        let errors      = {};
        let formIsValid = true;

        if (!fields['creative_name']) {
            formIsValid             = false;
            errors['creative_name'] = 'this field is required, please provide a value';
        }

        if (!fields['headline']) {
            formIsValid        = false;
            errors['headline'] = 'this field is required, please provide a value';
        }

        if (!fields['deck']) {
            formIsValid    = false;
            errors['deck'] = 'this field is required, please provide a value';
        }

        if (!fields['url']) {
            formIsValid   = false;
            errors['url'] = 'this field is required, please provide a value';
        }


        if (!fields['daily_budget_mlx']) {
            formIsValid                = false;
            errors['daily_budget_mlx'] = 'this field is required, please provide a value';
        }

        if (typeof fields['daily_budget_mlx'] !== 'undefined' && (typeof fields['daily_budget_mlx']) == 'string') {
            if (!fields['daily_budget_mlx'].match(/^[0-9]+$/)) {
                formIsValid                = false;
                errors['daily_budget_mlx'] = 'this field only accepts numbers';
            }
        }

        if (!fields['bid_per_impressions_mlx']) {
            formIsValid                       = false;
            errors['bid_per_impressions_mlx'] = 'this field is required, please provide a value';
        }

        if (typeof fields['bid_per_impressions_mlx'] !== 'undefined' && (typeof fields['daily_budget_mlx']) == 'string') {
            if (!fields['bid_per_impressions_mlx'].match(/^[0-9]+$/)) {
                formIsValid                       = false;
                errors['bid_per_impressions_mlx'] = 'this field only accepts numbers';
            }
        }

        if (parseFloat(fields['bid_per_impressions_mlx']) > parseFloat(fields['daily_budget_mlx'])) {
            formIsValid                       = false;
            errors['bid_per_impressions_mlx'] = 'the bid per impression cannot exceed the daily budget';
        }

        if (parseFloat(fields['daily_budget_mlx']) > parseFloat(this.props.wallet.balance_stable)) {
            formIsValid                = false;
            errors['daily_budget_mlx'] = 'please add funds to enable this ad campaign';
        }


        this.setState({errors: errors});
        return formIsValid;
    }

    handleSubmit(event) {
        event.preventDefault();
        if (this.handleValidation()) {
            API.submitAdForm(this.state.fields).then(data => {
                this.setState({submitData: data});
                this.flushForm();
            });
        }
    }

    flushForm() {
        let fields = {
            creative_name          : '',
            category               : this.state.categories[0].value,
            headline               : '',
            deck                   : '',
            url                    : '',
            target_language        : this.state.languages[0].value,
            search_phrase          : [],
            daily_budget_mlx       : '',
            bid_per_impressions_mlx: ''
        };
        // this.inputRef.current.clear();
        this.setState({fields: fields});
    }

    extractDomain(url) {
        let a  = document.createElement('a');
        a.href = url;
        return a.hostname;
    }

    handleInputChange(field, e) {
        let fields = this.state.fields;
        if (field === 'search_phrase') {
            fields[field] = e;
        }
        else if (field === 'daily_budget_mlx' || field === 'bid_per_impressions_mlx') {
            console.log('daily processor');

            let cursorStart = e.target.selectionStart,
                cursorEnd   = e.target.selectionEnd;
            let amount      = e.target.value.replace(/[,.]/g, '');
            let offset      = 0;
            if ((amount.length - 1) % 3 === 0) {
                offset = 1;
            }

            amount        = parseInt(amount);
            fields[field] = !isNaN(amount) ? amount : 0;

            e.target.setSelectionRange(cursorStart + offset, cursorEnd + offset);
        }
        else {
            fields[field] = e.target.value;
        }
        this.setState({fields});
    }

    setAddFundsModalShow(show) {
        this.setState({addFundsModalShow: show});
    }

    handleAddFundsModalClose = () => this.setAddFundsModalShow(false);
    handleAddFundsModalShow  = () => this.setAddFundsModalShow(true);

    getDomain(url) {
        let domain;
        try {
            domain = new URL(url).host;
        }
        catch (e) {
            return '';
        }

        if (domain.startsWith('www.')) {
            return domain.substring(4);
        }

        return domain;
    }

    render() {
        const renderErrorDock     = (name) => {
            return <span
                style={{color: 'red'}}>{this.state.errors[name]}</span>;
        };
        const renderSubmitMessage = () => {
            const data = this.state.submitData;
            if (typeof data.api_status != 'undefined') {
                return <div
                    className={data.api_status === 'ok' ? 'success' : 'error'}>{data.api_message}</div>;
            }
        };

        return (
            <div>
                <div>
                    <Modal show={this.state.addFundsModalShow}
                           onHide={this.handleAddFundsModalClose}
                           className="addFundsModal">
                        <Modal.Header closeButton>
                            <Modal.Title className="col-lg-10">add
                                funds</Modal.Title>
                        </Modal.Header>
                        <Modal.Body style={{
                            paddingBottom: '90px',
                            paddingLeft  : '0px',
                            paddingRight : '0px'
                        }}>
                            <div className="col-lg-12">
                                <span className="col-lg-12 center-text">fund your campaign by sending millix to the address below</span>
                                <span
                                    className="col-lg-12 center-text">{this.props.wallet.address}</span>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="primary"
                                    onClick={this.handleAddFundsModalClose}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>

                <div className="panel panel-filled">
                    <div className={'panel-heading'}>create advertisement</div>
                    <hr className={'hrPal'}/>
                    <div className="panel-body">
                        {renderSubmitMessage()}
                        <div>
                            the tangled ad platform allows anyone to create an
                            advertisement without approvals or permission. when
                            your ad is created it will appear to other tangled
                            browser users. the amount that you choose to pay for
                            the ad to appear is paid directly to the consumer
                            that views the ad.
                        </div>
                        <br/>
                        <Form onSubmit={this.handleSubmit.bind(this)}>
                            <FormGroup as={Row} controlId="creative_name">
                                <Col sm="2" className={'align-right'}>
                                    <Form.Label
                                        className="control-label text-right col-sm-14 ">
                                        creative name:
                                    </Form.Label>
                                </Col>
                                <Col sm="10">
                                    <Form.Control
                                        type="text"
                                        className="col-sm-12"
                                        value={this.state.fields['creative_name']}
                                        onChange={this.handleInputChange.bind(this, 'creative_name')}
                                        placeholder=""/>
                                    {renderErrorDock('creative_name')}
                                </Col>
                            </FormGroup>

                            <FormGroup as={Row} controlId="category">
                                <Col sm="2" className={'align-right'}>
                                    <Form.Label
                                        className="control-label text-right col-sm-12">
                                        category:
                                    </Form.Label>
                                </Col>
                                <Col sm="10">
                                    <Form.Control
                                        as="select"
                                        value={this.state.fields['category']}
                                        onChange={this.handleInputChange.bind(this, 'category')}
                                    >
                                        {
                                            this.state.categories ? this.state.categories.map((res, i) => (
                                                <option key={i}
                                                        value={res.value}>{res.label}</option>
                                            )) : ''
                                        }
                                    </Form.Control>
                                </Col>
                            </FormGroup>

                            <FormGroup as={Row} controlId="headline">
                                <Col sm="2" className={'align-right'}>
                                    <Form.Label
                                        className="control-label text-right col-sm-12">
                                        headline:
                                    </Form.Label>
                                </Col>
                                <Col sm="10">
                                    <Form.Control
                                        type="text"
                                        className="col-sm-12"
                                        value={this.state.fields['headline']}
                                        onChange={this.handleInputChange.bind(this, 'headline')}
                                        placeholder=""/>
                                    {renderErrorDock('headline')}
                                </Col>
                            </FormGroup>

                            <FormGroup as={Row} controlId="deck">
                                <Col sm="2" className={'align-right'}>
                                    <Form.Label
                                        className="control-label text-right col-sm-12">
                                        deck:
                                    </Form.Label>
                                </Col>
                                <Col sm="10">
                                    <Form.Control
                                        type="text"
                                        className="col-sm-12"
                                        value={this.state.fields['deck']}
                                        onChange={this.handleInputChange.bind(this, 'deck')}
                                        placeholder=""/>
                                    {renderErrorDock('deck')}
                                </Col>
                            </FormGroup>

                            <FormGroup as={Row} controlId="url">
                                <Col sm="2" className={'align-right'}>
                                    <Form.Label
                                        className="control-label text-right col-sm-12">
                                        url:
                                    </Form.Label>
                                </Col>
                                <Col sm="10">
                                    <Form.Control type="text"
                                                  className="col-sm-12"
                                                  value={this.state.fields['url']}
                                                  onChange={this.handleInputChange.bind(this, 'url')}
                                                  placeholder=""/>
                                    {renderErrorDock('url')}
                                </Col>
                            </FormGroup>

                            <FormGroup as={Row} className="ad-preview"
                                       controlId="preview">
                                <Col sm="2" className={'align-right'}>
                                    <Form.Label
                                        className="control-label text-right col-sm-12">
                                        preview:
                                    </Form.Label>
                                </Col>
                                <Col sm="10">
                                    {(this.state.fields['url'] || this.state.fields['deck'] || this.state.fields['headline']) && (
                                        <div className="preview-holder"
                                             aria-readonly="true">
                                            <div className="row h-50">
                                                <div
                                                    id="ads_holder h-50 pt-7"
                                                    className="col-8 m-0 ads-slider">
                                                    <span>
                                                        <a id="advertisement_headline"
                                                           href={this.state.fields['url'] ? this.state.fields['url'] : ''}
                                                           title={this.state.fields['deck'] ? this.state.fields['deck'] : ''}>{this.state.fields['headline'] ? this.state.fields['headline'] : ''}</a>
                                                    </span>
                                                    <span>
                                                        {(this.state.fields['url'] || this.state.fields['deck']) && (
                                                            <a id="advertisement_deck"
                                                               href={this.state.fields['url'] ? this.getDomain(this.state.fields['url']) : ''}
                                                               title={this.state.fields['deck'] ? this.state.fields['deck'] : ''}>{this.state.fields['deck'] ? this.state.fields['deck'] : ''} - {this.state.fields['url'] ? this.state.fields['url'] : ''}</a>)}</span>
                                                </div>
                                            </div>
                                        </div>)}
                                </Col>
                            </FormGroup>

                            <Col sm="2"></Col>
                            <Col sm="10">
                                <hr/>
                            </Col>

                            {/*<Form.Group as={Row}
                             controlId="target_language">
                             <Col sm="2" className={'align-right'}>
                             <Form.Label
                             className="control-label text-right col-sm-12">
                             target language:
                             </Form.Label>
                             </Col>
                             <Col sm="10">
                             <FormControl
                             as="select"
                             value={this.state.fields['target_language']}
                             onChange={this.handleInputChange.bind(this, 'target_language')}>
                             {
                             this.state.languages ? this.state.languages.map((res, i) => (
                             <option key={i}
                             value={res.value}>{res.label}</option>
                             )) : ''
                             }

                             </FormControl>
                             </Col>
                             </Form.Group>*/}

                            {/*temporarily omitted according to requirements from MILLIX-15*/}
                            {/*<Form.Group as={Row}*/}
                            {/*            controlId="target-geography">*/}
                            {/*    <Col sm="2">*/}
                            {/*        <Form.Label*/}
                            {/*            className="control-label text-right col-sm-12">*/}
                            {/*            target geography:*/}
                            {/*        </Form.Label>*/}
                            {/*    </Col>*/}

                            {/*    <Col sm="10">*/}
                            {/*        <div>*/}
                            {/*            <div className="row"*/}
                            {/*                 style={{padding: '0 0 10px 0'}}>*/}
                            {/*                <Col sm="10">*/}
                            {/*                    <Col sm="4"*/}
                            {/*                         className="no-padding-left no-padding-right">*/}
                            {/*                        <FormControl as="select">*/}
                            {/*                            {*/}
                            {/*                                this.state.countries ? this.state.countries.map((res, i) => (*/}
                            {/*                                    <option*/}
                            {/*                                        key={i}>{res}</option>*/}
                            {/*                                )) : ''*/}
                            {/*                            }*/}
                            {/*                        </FormControl>*/}
                            {/*                    </Col>*/}
                            {/*                    <Col sm="4">*/}
                            {/*                        <FormControl*/}
                            {/*                            as="select">*/}
                            {/*                            {*/}
                            {/*                                this.state.regions ? this.state.regions.map((res, i) => (*/}
                            {/*                                    <option*/}
                            {/*                                        key={i}>{res}</option>*/}
                            {/*                                )) : ''*/}
                            {/*                            }*/}
                            {/*                        </FormControl>*/}
                            {/*                    </Col>*/}
                            {/*                    <Col sm="4"*/}
                            {/*                         className="no-padding-left no-padding-right">*/}
                            {/*                        <FormControl*/}
                            {/*                            as="select">*/}
                            {/*                            {*/}
                            {/*                                this.state.cities ? this.state.cities.map((res, i) => (*/}
                            {/*                                    <option*/}
                            {/*                                        key={i}>{res}</option>*/}
                            {/*                                )) : ''*/}
                            {/*                            }*/}
                            {/*                        </FormControl>*/}
                            {/*                    </Col>*/}
                            {/*                </Col>*/}
                            {/*                <Col sm="2">*/}
                            {/*                    <Col sm="6">*/}
                            {/*                        <FontAwesomeIcon*/}
                            {/*                            icon="plus"*/}
                            {/*                            size="2x"*/}
                            {/*                            style={{*/}
                            {/*                                margin : '0 auto',*/}
                            {/*                                display: 'block'*/}
                            {/*                            }}/>*/}
                            {/*                    </Col>*/}
                            {/*                    <Col sm="6">*/}
                            {/*                        <FontAwesomeIcon*/}
                            {/*                            icon="times"*/}
                            {/*                            size="2x"*/}
                            {/*                            style={{*/}
                            {/*                                margin : '0 auto',*/}
                            {/*                                display: 'block'*/}
                            {/*                            }}*/}
                            {/*                        />*/}
                            {/*                    </Col>*/}
                            {/*                </Col>*/}
                            {/*            </div>*/}
                            {/*            {renderDummyGeo()}*/}
                            {/*            {renderDummyGeo()}*/}
                            {/*        </div>*/}
                            {/*    </Col>*/}
                            {/*</Form.Group>*/}

                            {/*<Form.Group as={Row}
                             controlId="target_search_phrase">
                             <Col sm="2">
                             <Form.Label
                             className="control-label text-right col-sm-12">
                             target search phrases:
                             </Form.Label>
                             </Col>
                             <Col sm="10">
                             <Typehead
                             as="select"
                             ref={this.inputRef}
                             id="search_phrase"
                             placeholder=""
                             options={this.state.searchphrases}
                             multiple
                             allowNew
                             selected={this.state.fields.selected}
                             onChange={this.handleInputChange.bind(this, 'search_phrase')}
                             />
                             </Col>
                             </Form.Group>*/}
                            <Form.Group as={Row} controlId="funding">
                                <Col sm="2">
                                    <Form.Label
                                        className="control-label text-right col-sm-12">
                                        funding:
                                    </Form.Label>
                                </Col>
                                <Col sm="10">
                                    <Col sm="9">
                                        balance: {this.props.wallet.balance_stable.toLocaleString('en-US')} millix
                                    </Col>
                                    <Col sm="3">
                                        <Button
                                            className="{btn btn-w-md btn-accent}"
                                            style={{
                                                width: '100%'
                                            }}
                                            onClick={this.handleAddFundsModalShow}
                                        >add funds</Button>
                                    </Col>
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} controlId="daliy-budget">
                                <Col sm="2" className={'align-right'}>
                                    <Form.Label
                                        className="control-label text-right col-sm-12">
                                        daily budget:
                                    </Form.Label>
                                </Col>
                                <Col sm="10">
                                    <Col sm="9" className="no-padding-left">
                                        {/*temporarily omitted according to requirements from MILLIX-15*/}
                                        {/*<Col sm="5"*/}
                                        {/*     className="no-padding-left">*/}
                                        {/*    <Form.Control*/}
                                        {/*        type="text"*/}
                                        {/*        className="col-sm-12"*/}
                                        {/*        placeholder="$5"*/}
                                        {/*    />*/}
                                        {/*</Col>*/}
                                        {/*<Col className="no-padding-right"*/}
                                        {/*     sm="1">*/}
                                        {/*    =*/}
                                        {/*</Col>*/}
                                        <Col sm="5"
                                             className="no-padding-left">
                                            <Form.Control
                                                type="text"
                                                className="col-sm-12"
                                                onChange={this.handleInputChange.bind(this, 'daily_budget_mlx')}
                                                ref={c => {
                                                    this.budget = c;
                                                    if (this.budget && this.state.fields['daily_budget_mlx'] !== undefined) {
                                                        this.budget.value = this.state.fields['daily_budget_mlx'].toLocaleString('en-US');
                                                    }
                                                }}
                                                placeholder=""
                                            />
                                            {renderErrorDock('daily_budget_mlx')}
                                        </Col>
                                    </Col>
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} controlId="daliy-budget">
                                <Col sm="2" className={'align-right'}>
                                    <Form.Label
                                        className="control-label text-right col-sm-12">
                                        bid per impression:
                                    </Form.Label>
                                </Col>
                                <Col sm="10">
                                    <div>
                                        <Col sm="9"
                                             className="no-padding-left">
                                            {/*temporarily omitted according to requirements from MILLIX-15*/}
                                            {/*<Col sm="5"*/}
                                            {/*     className="no-padding-left">*/}
                                            {/*    <Form.Control*/}
                                            {/*        type="text"*/}
                                            {/*        className="col-sm-12"*/}
                                            {/*        placeholder="$10"*/}
                                            {/*    />*/}
                                            {/*</Col>*/}
                                            {/*<Col*/}
                                            {/*    className="no-padding-right"*/}
                                            {/*    sm="1">*/}
                                            {/*    =*/}
                                            {/*</Col>*/}
                                            <Col sm="5"
                                                 className="no-padding-left">
                                                <Form.Control
                                                    type="text"
                                                    className="col-sm-12"
                                                    onChange={this.handleInputChange.bind(this, 'bid_per_impressions_mlx')}
                                                    ref={c => {
                                                        this.impression = c;
                                                        if (this.impression && this.state.fields['bid_per_impressions_mlx'] !== undefined) {
                                                            this.impression.value = this.state.fields['bid_per_impressions_mlx'].toLocaleString('en-US');
                                                        }
                                                    }}
                                                    placeholder=""
                                                />
                                                {renderErrorDock('bid_per_impressions_mlx')}
                                            </Col>
                                        </Col>
                                        {/*<Col sm="3">
                                         <Button
                                         className="{btn btn-w-md btn-accent}"
                                         style={{
                                         width: '100%'
                                         }}
                                         >market analysis</Button>
                                         </Col>*/}
                                    </div>
                                    {/*<div>
                                     <div className="hint">
                                     other advertisers with similar
                                     targeting are currently bidding
                                     between $8 and $14 per thousand
                                     impressions.
                                     </div>
                                     </div>*/}
                                </Col>
                            </Form.Group>
                            <div style={{
                                display       : 'flex',
                                justifyContent: 'center'
                            }}>
                                <Button variant="primary" type="submit"
                                        className="btn btn-w-md btn-accent center">submit</Button>
                            </div>

                        </Form>
                    </div>
                </div>
            </div>
        );
    }
};

export default connect(
    state => ({
        wallet: state.wallet
    }),
    {
        walletUpdateAddresses,
        walletUpdateBalance
    }
)(withRouter(CreateAdView));
