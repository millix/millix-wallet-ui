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
    resultFieldReference = {};

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
            const advertisementGUID = this.props.history.location.state[0].advertisement_guid;

            API.getAdvertisementById(advertisementGUID).then(data => {
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
                    advertisement_guid: advertisementGUID,
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
        this.resultFieldReference.advertisement_name.value = advertisement?.advertisement_name;
        this.resultFieldReference.category.value           = advertisement?.advertisement_category_guid;
        this.resultFieldReference.headline.value           = advertisement?.advertisement_headline?.value;
        this.resultFieldReference.deck.value               = advertisement?.advertisement_deck?.value;
        this.resultFieldReference.advertisement_url.value  = advertisement?.advertisement_url;
        this.resultFieldReference.budget_daily_mlx.value   = format.millix(advertisement?.budget_daily_mlx, false);
        this.resultFieldReference.bid_impression_mlx.value = format.millix(advertisement?.bid_impression_mlx, false);
    }

    getFormData() {
        const errorList = [];
        let formData    = {};
        if (Object.keys(this.resultFieldReference).length > 0) {
            formData = {
                advertisement_name         : validate.required('name', this.resultFieldReference.advertisement_name.value, errorList),
                advertisement_category_guid: this.resultFieldReference.category.value,
                headline                   : validate.required('headline', this.resultFieldReference.headline.value, errorList),
                deck                       : validate.required('deck', this.resultFieldReference.deck.value, errorList),
                url                        : validate.required('url', this.resultFieldReference.advertisement_url.value, errorList),
                budget_daily_mlx           : validate.amount('daily budget', this.resultFieldReference.budget_daily_mlx.value, errorList),
                bid_impression_mlx         : validate.amount('bid per impression', this.resultFieldReference.bid_impression_mlx.value, errorList),
                advertisement_guid         : this.state.advertisement_guid,
                head_line_attribute_guid   : this.state.advertisement.advertisement_headline?.guid,
                deck_attribute_guid        : this.state.advertisement.advertisement_deck?.guid
            };

            if (formData.bid_impression_mlx > formData.budget_daily_mlx) {
                errorList.push('bid per impression cannot exceed the daily budget');
            }
        }

        return {
            form_data : formData,
            error_list: errorList
        };
    }

    loadAdvertisementCategoryList() {
        API.getAdvertisementCategoryList().then(response => {
            let resultOption = response.map(d => ({
                'value': d.advertisement_category_guid,
                'label': d.advertisement_category
            }));
            resultOption     = _.orderBy(resultOption, ['label'], ['asc']);
            if (this.resultFieldReference.category) {
                this.resultFieldReference.category.value = resultOption[0].value;
            }

            this.setState({
                advertisement_category_list: resultOption
            });
        });
    }

    save() {
        this.setState({
            error_list: []
        });
        const {
                  form_data : formData,
                  error_list: errorList
              } = this.getFormData();

        if (errorList.length === 0) {
            this.handleSaveResponse(API.upsertAdvertisement(formData));
        }

        this.setState({
            error_list: errorList
        });
    }

    handleSaveResponse(promise) {
        promise.then(data => {
            if (typeof (data.api_status) !== 'undefined' && data.api_status === 'success') {
                this.populateForm();
                this.props.history.push('/advertisement-list');
            }
            else {
                let errorList = [];
                errorList.push(data.api_message);

                this.setState({
                    error_list: errorList
                });
            }
        });
    }

    getAdvertisementPreview() {
        let result = '';
        const {
                  form_data: formData
              }    = this.getFormData();

        if (formData.url && formData.deck && formData.headline) {
            result = <div className="preview-holder" aria-readonly="true">
                <div className="advertisement-slider">
                        <span>
                            <a className="advertisement_headline"
                               href={formData.url}
                               title={formData.deck}>{formData.headline}</a>
                        </span>
                    <span>
                    {(formData.url || formData.deck) && (
                        <a className="advertisement_deck"
                           href={this.getDomain(formData.url)}
                           title={formData.deck}>{formData.deck} - {formData.url}</a>)}</span>
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
                                    ref={(c) => this.resultFieldReference.advertisement_name = c}/>
                            </FormGroup>

                            <FormGroup controlId="category"
                                       className={'form-group'}>
                                <Form.Label>
                                    category
                                </Form.Label>
                                <Form.Control
                                    as="select"
                                    ref={(c) => this.resultFieldReference.category = c}
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
                                    ref={(c) => this.resultFieldReference.headline = c}/>
                            </FormGroup>

                            <FormGroup controlId="deck"
                                       className={'form-group'}>
                                <Form.Label>
                                    deck
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    ref={(c) => this.resultFieldReference.deck = c}/>
                            </FormGroup>

                            <FormGroup controlId="url" className={'form-group'}>
                                <Form.Label>
                                    url
                                </Form.Label>
                                <Form.Control type="text"
                                              ref={(c) => this.resultFieldReference.advertisement_url = c}/>
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
                                    ref={(c) => this.resultFieldReference.budget_daily_mlx = c}
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
                                    ref={(c) => this.resultFieldReference.bid_impression_mlx = c}
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

