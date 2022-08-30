import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link, withRouter} from 'react-router-dom';
import {Button, Col, Form, Row} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import * as format from '../../helper/format';
import * as validate from '../../helper/validate';
import ModalView from './../utils/modal-view';
import * as text from '../../helper/text';
import API from '../../api';
import ErrorList from './../utils/error-list-view';
import Transaction from '../../common/transaction';
import HelpIconView from '../utils/help-icon-view';
import {changeLoaderState} from '../loader';
import {DEFAULT_NFT_CREATE_AMOUNT, TRANSACTION_DATA_TYPE_NFT, DEFAULT_NFT_CREATE_FEE} from '../../../config';
import FileUpload from '../utils/file-upload';
import ReactChipInput from 'react-chip-input';


class NftCreateForm extends Component {
    constructor(props) {
        super(props);
        const propsState = props.location.state || {};

        this.state = {
            sending                    : false,
            dns_valid                  : false,
            dns_validating             : false,
            error_list                 : [],
            modal_show_confirmation    : false,
            modal_show_send_result     : false,
            modal_body_send_result     : [],
            address_base               : '',
            address_version            : '',
            address_key_identifier     : '',
            image                      : undefined,
            destination_address_list   : [`${this.props.wallet.address_public_key}${this.props.wallet.address_key_identifier.startsWith('1') ? '0b0' : 'lb0l'}${this.props.wallet.address_key_identifier}`],
            txid                       : propsState.txid,
            nft_src                    : propsState.src,
            nft_hash                   : propsState.hash,
            name                       : propsState.name ?? '',
            description                : propsState.description ?? '',
            default_target_address_self: propsState.default_target_address_self ?? false,
            nft_transaction_type       : propsState.nft_transaction_type ?? this.props.nft_transaction_type ?? 'create'
        };

        this.send                    = this.send.bind(this);
        this.onChangeFileUpload      = this.onChangeFileUpload.bind(this);
        this.onFileCancelUpload      = this.onFileCancelUpload.bind(this);
        this.onChangeFileUploadError = this.onChangeFileUploadError.bind(this);
        this.resetNftForm            = this.resetNftForm.bind(this);

        this.fileUploaderRef = React.createRef();
        this.name            = {value: propsState.name ?? ''};
        this.description     = {value: propsState.description ?? ''};
        this.send            = this.send.bind(this);
    }

    componentWillUnmount() {
        clearTimeout(this.checkDNSHandler);
        if (this.state.sending) {
            API.interruptTransaction().then(_ => _);
        }
    }

    componentDidMount() {
        if (this.state.nft_transaction_type === 'transfer') {
            this.setState({
                destination_address_list: []
            });
        }
        if (this.state.nft_transaction_type === 'revoke') {
            this.setState({
                image: {
                    file: new File([this.state.nft_src], this.state.name)
                }
            });
        }
        this.name.value        = this.state.name;
        this.description.value = this.state.description;
        this.amount            = format.millix(DEFAULT_NFT_CREATE_AMOUNT, false);
        this.fee               = format.millix(DEFAULT_NFT_CREATE_FEE, false);
    }

    send() {
        let error_list = [];
        if (this.state.sending) {
            API.interruptTransaction().then(_ => _);
            this.setState({
                canceling: true
            });
            return;
        }

        const address_list = [validate.required('recipient', this.state.destination_address_list[0], error_list)];
        const transaction_param = {
            address_list: address_list,
            amount      : validate.amount('amount', this.amount, error_list),
            fee         : validate.amount('fee', this.fee, error_list),
            image: !!this.state.txid || validate.required('image', this.state.image, error_list),
            dns  : validate.domain_name('verified sender', this.dns.value, error_list)
        };

        if (error_list.length === 0) {
            validate.verified_sender_domain_name(transaction_param.dns, this.props.wallet.address_key_identifier).then(result => {
                if (result.valid) {
                    Transaction.verifyAddress(transaction_param).then((data) => {
                        this.setState(data);
                        this.changeModalShowConfirmation();
                    }).catch((error) => {
                        error_list.push(error);

                        this.setState({
                            error_list: error_list
                        });
                    });
                }
                else {
                    this.setState({
                        error_list: result.error_list
                    });
                }
            });
        }

        this.setState({
            error_list: error_list
        });
    }

    validateDns(e) {
        this.setState({
            dns_valid     : false,
            dns_validating: true
        });
        clearTimeout(this.checkDNSHandler);
        this.checkDNSHandler = setTimeout(() => {
            validate.verified_sender_domain_name(e.target.value, this.props.wallet.address_key_identifier).then(result => {//verified sender domain name
                this.setState({
                    error_list    : result.error_list,
                    dns_valid     : result.valid,
                    dns_validating: false
                });
            });
        }, 500);
    }

    sendTransaction() {
        changeLoaderState(true);
        this.setState({
            sending: true
        });
        const transaction_output_payload = this.prepareTransactionOutputPayload();
        Transaction.sendTransaction(transaction_output_payload, true, !this.state.txid).then((data) => {
            this.changeModalShowConfirmation(false);
            this.changeModalShowSendResult();
            delete data.destination_address_list;
            this.setState(data);
            changeLoaderState(false);
        }).catch((error) => {
            this.changeModalShowConfirmation(false);
            this.setState(error);
            changeLoaderState(false);
        });
    }

    prepareTransactionOutputPayload() {
        const transaction_output_attribute = {};
        const transaction_data_meta        = {
            name       : this.name.value,
            description: this.description.value
        };

        if (!!this.state.dns) {
            transaction_output_attribute['dns'] = this.state.dns;
        }
        if (!!this.state.txid) {
            transaction_output_attribute['parent_transaction_id'] = this.state.txid;
        }

        return {
            transaction_data_meta       : transaction_data_meta,
            transaction_output_attribute: transaction_output_attribute,
            transaction_data            : !this.state.txid ? this.state.image.file : {
                file_hash        : this.state.nft_hash,
                attribute_type_id: 'Adl87cz8kC190Nqc'
            },
            transaction_data_type       : TRANSACTION_DATA_TYPE_NFT,
            transaction_output_list     : this.state.address_list.map(address => ({
                address_base          : address.address_base,
                address_version       : address.address_version,
                address_key_identifier: address.address_key_identifier,
                amount                : this.state.amount
            })),
            transaction_output_fee      : {
                fee_type: 'transaction_fee_default',
                amount  : this.state.fee
            }
        };
    }

    getTransferNftModalBody() {
        return (<div>
            <div>you are about to transfer the nft with amount of {format.millix(this.amount)} to {this.state.destination_address_list[0]}</div>
            {text.get_confirmation_modal_question()}
        </div>);
    }

    getCreateNftModalBody() {
        return (<div>
            <div>you are about to create an nft locking {format.millix(this.amount)} to</div>
            <div>{this.state.destination_address_list[0]}</div>
            {text.get_confirmation_modal_question()}
        </div>);
    }

    cancelSendTransaction() {
        this.setState({
            canceling: false,
            sending  : false
        });
        this.changeModalShowConfirmation(false);
    }

    changeModalShowConfirmation(value = true) {
        this.setState({
            modal_show_confirmation: value
        });
    }

    changeModalShowSendResult(value = true) {
        this.setState({
            modal_show_send_result: value
        });
        if (this.props.nft_transaction_type !== 'create' && !value) {
            this.props.history.push('/nft-collection');
        }
        if (!value) {
            this.resetNftForm();
        }
    }

    resetNftForm() {
        if (this.fileUploaderRef.current) {
            this.fileUploaderRef.current.clearFileInput();
        }

        this.name.value        = '';
        this.description.value = '';
    }

    addDestinationAddress(value) {
        const result_chip = this.state.destination_address_list.slice();
        if (result_chip.length !== 0) {
            return;
        }
        const address = value.split(/[\n ]/)[0];
        result_chip.push(address.trim());
        this.setState({destination_address_list: result_chip});
        this.chipInputAddress.formControlRef.current.disabled    = true;
        this.chipInputAddress.formControlRef.current.placeholder = '';
    };

    removeDestinationAddress(index) {
        const result_chip = this.state.destination_address_list.slice();
        result_chip.splice(index, 1);
        this.setState({destination_address_list: result_chip});
        this.chipInputAddress.formControlRef.current.disabled    = false;
        this.chipInputAddress.formControlRef.current.placeholder = 'recipient';
    };

    getFieldClassname(field) {
        return this.props.hidden_field_list?.includes(field) ? 'd-none' : '';
    }

    onChangeFileUpload(file) {
        this.setState({
            image     : file,
            error_list: []
        });
    }

    onFileCancelUpload() {
        this.setState({
            image: undefined
        });
    }

    onChangeFileUploadError(error_list) {
        if (error_list.length !== 0) {
            this.setState({
                error_list: error_list
            });
        }
    }

    render() {
        return (
            <>
                <ErrorList error_list={this.state.error_list}/>
                <Row className={'message_compose'}>
                    <div>
                        <Col>
                            <Form.Group>
                                {this.state.nft_src ? (
                                    <div className={'nft-transfer-img-wrapper'}>
                                        <img src={this.state.nft_src} alt={'nft'}/>
                                    </div>) : (
                                     <FileUpload
                                         ref={this.fileUploaderRef}
                                         title={'upload image'}
                                         on_file_upload={this.onChangeFileUpload}
                                         on_file_cancel_upload={this.onFileCancelUpload}
                                         on_file_upload_error={this.onChangeFileUploadError}
                                         accept={'image/*'}
                                         file_type={'image'}
                                     />
                                 )}
                            </Form.Group>
                        </Col>
                        <Col>
                            {this.state.nft_transaction_type === 'create' || this.state.nft_transaction_type === 'revoke' ?
                             (<Form.Group className="form-group" as={Row}>
                                 <label>name</label>
                                 <Col>
                                     <Form.Control type="text"
                                                   maxLength={100}
                                                   placeholder="name"
                                                   pattern="^([a-z0-9])$"
                                                   aria-valuemax={10}
                                                   ref={c => this.name = c}/>
                                 </Col>
                             </Form.Group>) :
                             (<div><p className={'transfer-subtitle'}>name</p>
                                 <p>{this.name.value}</p></div>)}
                        </Col>
                        <Col>
                            {this.state.nft_transaction_type === 'create' || this.state.nft_transaction_type === 'revoke' ?
                             (<Form.Group className="form-group" as={Row}>
                                 <label>description</label>
                                 <Col>
                                     <Form.Control as="textarea" rows={5}
                                                   maxLength={1000}
                                                   placeholder="description"
                                                   pattern="^([a-z0-9])$"
                                                   ref={c => this.description = c}/>
                                 </Col>
                             </Form.Group>) :
                             (<div><p className={'transfer-subtitle'}>description</p>
                                 <p>{this.description.value}</p></div>)}
                        </Col>
                        {this.state.nft_transaction_type !== 'create' ?
                         <Col>
                             <div>
                                 <p className={'transfer-subtitle'}>amount</p>
                                 <p>{format.millix(this.amount)}</p>
                             </div>
                         </Col> : ''}
                        {this.state.nft_transaction_type !== 'create' && !this.state.default_target_address_self ?
                         <Col className={this.getFieldClassname('address')}>
                             <Form.Group className="form-group">
                                 <label>recipient</label>
                                 <ReactChipInput
                                     ref={ref => {
                                         if (ref && !ref.state.focused && ref.formControlRef.current.value !== '') {
                                             this.addDestinationAddress(ref.formControlRef.current.value);
                                             ref.formControlRef.current.value = '';
                                         }
                                         if (!this.chipInputAddress) {
                                             ref.formControlRef.current.placeholder = 'recipient';
                                             this.chipInputAddress                  = ref;
                                         }
                                     }}
                                     classes="chip_input form-control"
                                     chips={this.state.destination_address_list}
                                     onSubmit={value => this.addDestinationAddress(value)}
                                     onRemove={index => this.removeDestinationAddress(index)}
                                 />
                             </Form.Group>
                         </Col> : ''}
                        <Col className={this.getFieldClassname('verified_sender')}>
                            <Form.Group className="form-group" as={Row}>
                                <label>verified creator (optional)<HelpIconView help_item_name={'verified_sender'}/></label>
                                <Col className={'input-group'}>
                                    <Form.Control type="text"
                                                  placeholder="domain name"
                                                  pattern="^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$"
                                                  ref={c => this.dns = c}
                                                  onChange={e => {
                                                      validate.handleDomainNameInputChange(e);
                                                      this.validateDns(e);
                                                  }}/>
                                    {this.state.dns_validating ?
                                     <button
                                         className="btn btn-outline-input-group-addon loader icon_only"
                                         type="button"
                                         disabled={true}>
                                         <div className="loader-spin"/>
                                     </button>
                                                               : ''}
                                </Col>
                                {this.state.dns_valid && this.dns?.value !== '' ?
                                 <div className={'text-success labeled verified_sender_mark'}>
                                     <FontAwesomeIcon
                                         icon={'check-circle'}
                                         size="1x"/>
                                     <span>{this.dns.value}</span>
                                 </div>
                                                                                : ''}

                            </Form.Group>
                        </Col>
                        <Col
                            className={'d-flex justify-content-center'}>
                            <ModalView
                                show={this.state.modal_show_confirmation}
                                size={'lg'}
                                heading={this.state.nft_transaction_type === 'transfer' ? 'transfer nft' : 'create nft'}
                                on_accept={() => this.sendTransaction()}
                                on_close={() => this.cancelSendTransaction()}
                                body={this.state.nft_transaction_type === 'create' ? this.getCreateNftModalBody() : this.getTransferNftModalBody()}/>
                            <ModalView
                                show={this.state.modal_show_send_result}
                                size={'lg'}
                                on_close={() => this.changeModalShowSendResult(false)}
                                heading={this.state.nft_transaction_type === 'create' ? `nft created` : `transfer nft`}
                                body={this.state.nft_transaction_type === 'create' ? <div>
                                    <div className="mb-3">
                                        your nft was created successfully with transaction id: {this.state.transaction_id}
                                    </div>
                                    <div>
                                        click <Link to={'/nft-collection'}> here</Link> to view and manage your nft collection
                                    </div>
                                </div> : <div>
                                          <div className="mb-3">
                                              your nft was transferred successfully with transaction id: {this.state.transaction_id}
                                          </div>
                                      </div>}/>
                            <Form.Group as={Row}>
                                <Button
                                    variant="outline-primary"
                                    className={'btn_loader'}
                                    onClick={() => this.send()}
                                    disabled={this.state.canceling || this.state.dns_validating}>
                                    {this.state.sending ?
                                     <>
                                         <div className="loader-spin"/>
                                         {this.state.canceling ? 'canceling' : 'cancel transaction'}
                                     </> : <>{this.state.txid ? 'transfer' : 'create'}</>}
                                </Button>
                            </Form.Group>
                        </Col>
                    </div>
                </Row>
            </>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet,
        config: state.config
    })
)(withRouter(NftCreateForm));
