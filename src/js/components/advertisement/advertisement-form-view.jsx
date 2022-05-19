import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Form, FormGroup} from 'react-bootstrap';
import API from '../../api';
import ErrorList from '../utils/error-list-view';
import {walletUpdateAddresses, walletUpdateBalance} from '../../redux/actions';
import {withRouter} from 'react-router-dom';
import ModalView from '../utils/modal-view';
import * as format from '../../helper/format';
import _ from 'lodash';
import * as validate from '../../helper/validate';


class AdvertisementFormView extends Component {
    result_field_reference = {};

    constructor(props) {
        super(props);

        this.state = {
            title                      : 'create advertisement',
            advertisement_guid         : '',
            advertisement              : {},
            error_list                 : [],
            advertisement_category_list: [],
            modalShow                  : false
        };
        this.save  = this.save.bind(this);
    }

    componentDidMount() {
        this.loadAdvertisementCategoryList();

        if (this.props.history.location.state) {
            const advertisement_guid = this.props.history.location.state[0].advertisement_guid;

            API.getAdvertisementById(advertisement_guid).then(data => {
                let fields = {
                    advertisement_name: data.advertisement.advertisement_name,
                    category          : data.advertisement.advertisement_category_guid,
                    headline          : data.advertisement.advertisement_headline.value,
                    deck              : data.advertisement.advertisement_deck.value,
                    url               : data.advertisement.advertisement_url,
                    budget_daily_mlx  : data.advertisement.budget_daily_mlx,
                    bid_impression_mlx: data.advertisement.bid_impression_mlx
                };

                this.setState({
                    advertisement_guid: advertisement_guid,
                    fields            : fields,
                    title             : 'edit advertisement',
                    advertisement     : data.advertisement
                });

                this.populateForm(data.advertisement);
            }).catch(err => {
                console.log(err);
            });
        }
    }

    populateForm(advertisement = {}) {
        this.result_field_reference.advertisement_name.value = advertisement?.advertisement_name;
        this.result_field_reference.category.value           = advertisement?.advertisement_category_guid;
        this.result_field_reference.headline.value           = advertisement?.advertisement_headline?.value;
        this.result_field_reference.deck.value               = advertisement?.advertisement_deck?.value;
        this.result_field_reference.advertisement_url.value  = advertisement?.advertisement_url;
        this.result_field_reference.budget_daily_mlx.value   = format.millix(advertisement?.budget_daily_mlx, false);
        this.result_field_reference.bid_impression_mlx.value = format.millix(advertisement?.bid_impression_mlx, false);
    }

    getFormData() {
        const error_list = [];
        let form_data    = {};
        if (Object.keys(this.result_field_reference).length > 0) {
            form_data = {
                advertisement_name         : validate.required('name', this.result_field_reference.advertisement_name.value, error_list),
                advertisement_category_guid: this.result_field_reference.category.value,
                headline                   : validate.required('headline', this.result_field_reference.headline.value, error_list),
                deck                       : validate.required('deck', this.result_field_reference.deck.value, error_list),
                url                        : validate.required('url', this.result_field_reference.advertisement_url.value, error_list),
                budget_daily_mlx           : validate.amount('daily budget', this.result_field_reference.budget_daily_mlx.value, error_list),
                bid_impression_mlx         : validate.amount('bid per impression', this.result_field_reference.bid_impression_mlx.value, error_list),
                advertisement_guid         : this.state.advertisement_guid,
                head_line_attribute_guid   : this.state.advertisement.advertisement_headline?.guid,
                deck_attribute_guid        : this.state.advertisement.advertisement_deck?.guid
            };

            if (form_data.bid_impression_mlx > form_data.budget_daily_mlx) {
                error_list.push('bid per impression cannot exceed the daily budget');
            }
        }

        return {
            form_data,
            error_list
        };
    }

    loadAdvertisementCategoryList() {
        API.getAdvertisementCategoryList().then(response => {
            let result_option = response.map(d => ({
                'value': d.advertisement_category_guid,
                'label': d.advertisement_category
            }));
            result_option     = _.orderBy(result_option, ['label'], ['asc']);
            if (this.result_field_reference.category) {
                this.result_field_reference.category.value = result_option[0].value;
            }

            this.setState({
                advertisement_category_list: result_option
            });
        });
    }

    save() {
        this.setState({
            error_list: []
        });
        const {
                  form_data,
                  error_list
              } = this.getFormData();

        if (error_list.length === 0) {
            this.handleSaveResponse(API.upsertAdvertisement(form_data));
        }

        this.setState({
            error_list: error_list
        });
    }

    handleSaveResponse(promise) {
        promise.then(data => {
            if (typeof (data.api_status) !== 'undefined' && data.api_status === 'success') {
                this.populateForm();
                this.props.history.push('/advertisement-list');
            }
            else {
                let error_list = [];
                error_list.push(data.api_message);

                this.setState({
                    error_list: error_list
                });
            }
        });
    }

    getAdvertisementPreview() {
        let result = '';
        const {
                  form_data,
                  error_list
              }    = this.getFormData();

        if (form_data.url && form_data.deck && form_data.headline) {
            result = <div className="preview-holder" aria-readonly="true">
                <div className="advertisement-slider">
                        <span>
                            <a className="advertisement_headline"
                               href={form_data.url}
                               title={form_data.deck}>{form_data.headline}</a>
                        </span>
                    <span>
                    {(form_data.url || form_data.deck) && (
                        <a className="advertisement_deck"
                           href={this.getDomain(form_data.url)}
                           title={form_data.deck}>{form_data.deck} - {form_data.url}</a>)}</span>
                </div>
            </div>;
        }

        return result;
    }

    getDomain(url) {
        let domain;
        try {
            domain = new URL(url).host;

            if (domain.startsWith('www.')) {
                domain = domain.substring(4);
            }
        }
        catch (e) {
            domain = '';
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
            <>
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
                    <div className={'panel-heading bordered'}>
                        {this.state.title}
                    </div>
                    <div className="panel-body">
                        <div className="section_subtitle">creative</div>
                        <Form>
                            <ErrorList
                                error_list={this.state.error_list}/>
                            <FormGroup controlId="advertisement_name"
                                       className={'form-group'}>
                                <Form.Label>
                                    name
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    ref={(c) => this.result_field_reference.advertisement_name = c}/>
                            </FormGroup>

                            <FormGroup controlId="category"
                                       className={'form-group'}>
                                <Form.Label>
                                    category
                                </Form.Label>
                                <Form.Control
                                    as="select"
                                    ref={(c) => this.result_field_reference.category = c}
                                >
                                    {this.state.advertisement_category_list.map((res, i) => (
                                        <option key={i}
                                                value={res.value}>{res.label}</option>
                                    ))}
                                </Form.Control>
                            </FormGroup>

                            <FormGroup controlId="headline"
                                       className={'form-group'}>
                                <Form.Label>
                                    headline
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    ref={(c) => this.result_field_reference.headline = c}/>
                            </FormGroup>

                            <FormGroup controlId="deck"
                                       className={'form-group'}>
                                <Form.Label>
                                    deck
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    ref={(c) => this.result_field_reference.deck = c}/>
                            </FormGroup>

                            <FormGroup controlId="url" className={'form-group'}>
                                <Form.Label>
                                    url
                                </Form.Label>
                                <Form.Control type="text"
                                              ref={(c) => this.result_field_reference.advertisement_url = c}/>
                            </FormGroup>

                            <FormGroup className="advertisement-preview form-group"
                                       controlId="preview">
                                <Form.Label>
                                    preview
                                </Form.Label>
                                {this.getAdvertisementPreview()}
                            </FormGroup>

                            <hr/>

                            <div className="section_subtitle">
                                funding
                            </div>

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

                            <Form.Group controlId="daily-budget"
                                        className={'form-group'}>
                                <Form.Label>
                                    daily budget
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    onChange={validate.handleAmountInputChange.bind(this)}
                                    ref={(c) => this.result_field_reference.budget_daily_mlx = c}
                                />
                            </Form.Group>

                            <Form.Group controlId="bid-per-impression"
                                        className={'form-group'}>
                                <Form.Label>
                                    bid per impression
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    className="col-sm-12"
                                    onChange={validate.handleAmountInputChange.bind(this)}
                                    ref={(c) => this.result_field_reference.bid_impression_mlx = c}
                                />
                            </Form.Group>
                            <div className={'text-center'}>
                                <Button
                                    variant="outline-primary"
                                    onClick={() => this.save()}
                                >continue</Button>
                            </div>
                        </Form>
                    </div>
                </div>
            </>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    }),
    {
        walletUpdateAddresses,
        walletUpdateBalance
    }
)(withRouter(AdvertisementFormView));

