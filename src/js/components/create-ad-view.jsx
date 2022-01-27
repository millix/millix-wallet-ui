import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Col, Container, Form, FormControl, FormGroup, Row, Modal} from 'react-bootstrap';
import API from '../api/index';
import ErrorList from './utils/error-list-view';
import {walletUpdateAddresses, walletUpdateBalance} from '../redux/actions/index';
import {withRouter} from 'react-router-dom';
import ModalView from './utils/modal-view';
import * as format from '../helper/format';


class CreateAdView extends Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state        = {
            submitData   : {},
            error_list   : [],
            fields       : {
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
            categories   : [],
            languages    : [],
            countries    : [
                //todo: replace me
                'united states',
                'antigua and barbuda',
                'barbados',
                'czech republic'
            ],
            regions      : [
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
            cities       : [
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
            searchphrases: [
                //todo: replace me
                'car insurance',
                'auto insurance',
                'honda insurance'
            ],
            modalShow    : false
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
        let error_list  = [];
        let formIsValid = true;

        if (!fields['creative_name']) {
            formIsValid = false;
            error_list.push('creative_name is required');
        }

        if (!fields['headline']) {
            formIsValid = false;
            error_list.push('headline is required');
        }

        if (!fields['deck']) {
            formIsValid = false;
            error_list.push('deck is required');
        }

        if (!fields['url']) {
            formIsValid = false;
            error_list.push('url is required');
        }


        if (!fields['daily_budget_mlx']) {
            formIsValid = false;
            error_list.push('daily budget is required');
        }

        if (typeof fields['daily_budget_mlx'] !== 'undefined' && (typeof fields['daily_budget_mlx']) == 'string') {
            if (!fields['daily_budget_mlx'].match(/^[0-9]+$/)) {
                formIsValid = false;
                error_list.push('daily budget must be a number');
            }
        }

        if (!fields['bid_per_impressions_mlx']) {
            formIsValid = false;
            error_list.push('bid per impression is required');
        }

        if (typeof fields['bid_per_impressions_mlx'] !== 'undefined' && (typeof fields['daily_budget_mlx']) == 'string') {
            if (!fields['bid_per_impressions_mlx'].match(/^[0-9]+$/)) {
                formIsValid = false;
                error_list.push('bid per impression must be a number');
            }
        }

        if (parseFloat(fields['bid_per_impressions_mlx']) > parseFloat(fields['daily_budget_mlx'])) {
            formIsValid = false;
            error_list.push('bid per impression cannot exceed the daily budget');
        }

        this.setState({error_list: error_list});
        return formIsValid;
    }

    handleSubmit(event) {
        event.preventDefault();
        if (this.handleValidation()) {
            API.submitAdForm(this.state.fields).then(data => {
                this.setState({submitData: data});

                if (typeof (data.api_status) !== 'undefined' && data.api_status === 'ok') {
                    // todo: redirect to list
                    this.flushForm();
                    this.props.history.push('/advertisement-list');
                }
                else {
                    let error_list = [];
                    error_list.push(data.api_message);
                    this.setState({error_list: error_list});
                }
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

    changeModalShow(value = true) {
        this.setState({
            modalShow: value
        });
    }

    render() {
        return (
            <div>
                <ModalView show={this.state.modalShow}
                           size={'lg'}
                           on_close={() => this.changeModalShow(false)}
                           heading={'add funds'}
                           body={<div>
                               <div>fund your campaign by sending millix to the
                                   address below
                               </div>
                               <span>{this.props.wallet.address}</span>
                           </div>}/>

                <div className="panel panel-filled">
                    <div className={'panel-heading bordered'}>create
                        advertisement
                    </div>
                    <div className="panel-body">
                        <div className="section_subtitle">creative</div>
                        <Form onSubmit={this.handleSubmit.bind(this)}>
                            <ErrorList
                                error_list={this.state.error_list}/>
                            <FormGroup controlId="creative_name"
                                       className={'form-group'}>
                                <Form.Label>
                                    name
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={this.state.fields['creative_name']}
                                    onChange={this.handleInputChange.bind(this, 'creative_name')}
                                    placeholder=""/>
                            </FormGroup>

                            <FormGroup controlId="category"
                                       className={'form-group'}>
                                <Form.Label>
                                    category
                                </Form.Label>
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
                            </FormGroup>

                            <FormGroup controlId="headline"
                                       className={'form-group'}>
                                <Form.Label>
                                    headline
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={this.state.fields['headline']}
                                    onChange={this.handleInputChange.bind(this, 'headline')}
                                    placeholder=""/>
                            </FormGroup>

                            <FormGroup controlId="deck"
                                       className={'form-group'}>
                                <Form.Label>
                                    deck
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={this.state.fields['deck']}
                                    onChange={this.handleInputChange.bind(this, 'deck')}
                                    placeholder=""/>
                            </FormGroup>

                            <FormGroup controlId="url" className={'form-group'}>
                                <Form.Label>
                                    url
                                </Form.Label>
                                <Form.Control type="text"
                                              value={this.state.fields['url']}
                                              onChange={this.handleInputChange.bind(this, 'url')}
                                              placeholder=""/>
                            </FormGroup>

                            <FormGroup className="ad-preview form-group"
                                       controlId="preview">
                                <Form.Label>
                                    preview
                                </Form.Label>
                                {(this.state.fields['url'] || this.state.fields['deck'] || this.state.fields['headline']) && (
                                    <div className="preview-holder"
                                         aria-readonly="true">
                                        <div
                                            className="ads-slider">
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
                                    </div>)}
                            </FormGroup>

                            <hr/>

                            {/*<Form.Group as={Row}
                             controlId="target_language">
                             <Col sm="2" className={'align-right'}>
                             <Form.Label
                             className="text-right col-sm-12">
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
                            {/*            className="text-right col-sm-12">*/}
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
                             className="text-right col-sm-12">
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
                            <div className="section_subtitle">funding</div>
                            <Form.Group controlId="funding"
                                        className={'form-group'}>
                                <Form.Label>
                                    balance
                                </Form.Label>
                                <div>
                                    <span>
                                        {format.millix(this.props.wallet.balance_stable)}
                                    </span>
                                    <Button
                                        variant="outline-primary"
                                        size={'sm'}
                                        className={'ms-3'}
                                        onClick={() => this.changeModalShow()}
                                    >add funds</Button>
                                </div>
                            </Form.Group>

                            <Form.Group controlId="daliy-budget"
                                        className={'form-group'}>
                                <Form.Label>
                                    daily budget
                                </Form.Label>
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
                                <Form.Control
                                    type="text"
                                    onChange={this.handleInputChange.bind(this, 'daily_budget_mlx')}
                                    ref={c => {
                                        this.budget = c;
                                        if (this.budget && this.state.fields['daily_budget_mlx'] !== undefined) {
                                            this.budget.value = format.millix(this.state.fields['daily_budget_mlx'], false);
                                        }
                                    }}
                                    placeholder=""
                                />
                            </Form.Group>

                            <Form.Group controlId="bid-per-impression"
                                        className={'form-group'}>
                                <Form.Label>
                                    bid per impression
                                </Form.Label>
                                <div>
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
                                    <Form.Control
                                        type="text"
                                        className="col-sm-12"
                                        onChange={this.handleInputChange.bind(this, 'bid_per_impressions_mlx')}
                                        ref={c => {
                                            this.impression = c;
                                            if (this.impression && this.state.fields['bid_per_impressions_mlx'] !== undefined) {
                                                this.impression.value = format.millix(this.state.fields['bid_per_impressions_mlx'], false);
                                            }
                                        }}
                                        placeholder=""
                                    />
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
                            </Form.Group>
                            <div
                                style={{
                                    display       : 'flex',
                                    justifyContent: 'center'
                                }}>
                                <Button
                                    variant="outline-primary"
                                    type="submit">continue</Button>
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
