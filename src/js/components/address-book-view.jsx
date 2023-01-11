import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Col, Form, Row} from 'react-bootstrap';
import {removeWalletAddressVersion, walletUpdateConfig} from '../redux/actions';
import DatatableView from './utils/datatable-view';
import ModalView from './utils/modal-view';
import ErrorList from './utils/error-list-view';
import DatatableActionButtonView from './utils/datatable-action-button-view';
import Translation from '../common/translation';
import localforage from 'localforage';
import API from '../api';


class AddressBookView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal_show                : false,
            contact_list              : [],
            datatable_reload_timestamp: new Date(),
            datatable_loading         : false,
            error_list                : [],
            edited_contact_index      : '',
            error_list_upload         : [],
            image                     : undefined,
            importedData              : [],
            importedCols              : []
        };

        this.importCSV = this.importCSV.bind(this);
    }

    componentDidMount() {
        this.loadAddressBook();
    }

    changeModalAddContact = (value = true) => {
        this.setState({
            modal_show          : value,
            error_list          : [],
            edited_contact_index: value ? this.state.edited_contact_index : ''
        });
    };

    getContactList() {
        return localforage.getItem(this.props.wallet.address_key_identifier)
                          .then(encrypted_list => {
                              return API.decryptContactList(encrypted_list);
                          })
                          .then(decrypted_list => {
                              return JSON.parse(decrypted_list.result);
                          })
                          .catch(() => []);
    }

    setContactList(contact_list) {
        API.encryptContactList(contact_list)
           .then(encrypted_list => localforage.setItem(this.props.wallet.address_key_identifier, encrypted_list.result))
           .then(() => this.loadAddressBook());
    }

    addContact = () => {
        this.getContactList()
            .then((contact_list) => {
                if (this.state.importedData.length !== 0) {
                    contact_list = this.state.importedData.concat(contact_list.filter(({id}) => !this.state.importedData.find(f => f.id == id)));
                }
                else if (this.state.edited_contact_index !== '') {
                    contact_list.forEach((contact, index) => {
                        if (index === this.state.edited_contact_index) {
                            contact.name    = this.address_book_name.value;
                            contact.address = this.address_book_address.value;
                        }
                    });
                }
                else {
                    let new_contact = {
                        id     : Date.now().toString(),
                        name   : this.address_book_name?.value,
                        address: this.address_book_address?.value
                    };
                    contact_list.push(new_contact);
                }
                return contact_list;
            })
            .then(contact_list => this.setContactList(contact_list))
            .then(() => this.changeModalAddContact(false));
        this.setState({
            importedData: [],
            importedCols: []
        });
    };

    getSelectedContactIndex = (contact_selected) => {
        this.getContactList()
            .then((contact_list) => {
                contact_list.forEach((contact, index) => {
                    if (contact.id === contact_selected.id) {
                        this.setState({
                            edited_contact_index: index
                        });
                    }
                });
            });
    };

    removeAddressBookContact = (contact_selected) => {
        this.getSelectedContactIndex(contact_selected);
        this.getContactList()
            .then((contact_list) => {
                contact_list.splice(this.state.edited_contact_index, 1);
                this.setContactList(contact_list);
            })
            .then(() => this.setState({
                edited_contact_index: ''
            }))
            .then(() => this.loadAddressBook());
    };

    editAddressBookContact(contact_selected) {
        this.getSelectedContactIndex(contact_selected);
        this.changeModalAddContact();
    }

    loadAddressBook() {
        this.setState({
            datatable_loading: true
        });
        this.getContactList()
            .then(data => {
                this.fillContactsDatatable(data);
            });
    }

    fillContactsDatatable(data) {
        this.setState({
            datatable_reload_timestamp: new Date(),
            datatable_loading         : false,
            contact_list              : data?.map((input) => ({
                id     : input.id,
                address: input.address,
                name   : input.name,
                action :
                    <>
                        <DatatableActionButtonView
                            icon={'fa-solid fa-pencil'}
                            callback={() => this.editAddressBookContact(input)}
                            callback_args={input}
                        />
                        <DatatableActionButtonView
                            icon={'trash'}
                            callback={() => this.removeAddressBookContact(input)}
                            callback_args={input}
                        />
                    </>
            }))
        });
    }

    getAddressBookBody() {
        let name, address;
        if (this.state.edited_contact_index !== '') {
            this.state.contact_list.forEach((contact, index) => {
                if (index === this.state.edited_contact_index) {
                    name    = contact.name;
                    address = contact.address;
                }
            });
        }

        return <div>
            <Col>
                <ErrorList error_list={this.state.error_list}/>
            </Col>

            <Col>
                <Form.Group className="form-group">
                    <label>{'name'}</label>
                    <Form.Control
                        type="text"
                        ref={(c) => this.address_book_name = c}
                        defaultValue={name}
                    />
                </Form.Group>
            </Col>

            <Col>
                <Form.Group className="form-group">
                    <label>
                        {'address'}
                    </label>
                    <Row>
                        <Col>
                            <Form.Control
                                type="text"
                                ref={(c) => this.address_book_address = c}
                                defaultValue={address}
                            />
                        </Col>
                    </Row>
                </Form.Group>
            </Col>
        </div>;
    }

    toCapitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    importCSV(e) {
        const file    = e.target.files[0];
        const reader  = new FileReader();
        reader.onload = (e) => {
            const csv  = e.target.result;
            const data = csv.split(',\n');
            const cols = data[0].replace(/['"]+/g, '').split(',');
            data.shift();
            let importedCols = cols.map(col => ({
                field : col,
                header: this.toCapitalize(col.replace(/['"]+/g, ''))
            }));
            let importedData = data.map(d => {
                d = d.slice(1, -1).split(',');

                return cols.reduce((obj, c, i) => {
                    obj[c] = d[i]?.replace(/['"]+/g, '');
                    return obj;
                }, {});

            });
            this.setState({
                importedCols,
                importedData
            });
        };
        reader.readAsText(file, 'UTF-8');
        this.addContact();
        e.target.value = null;
    }

    render() {
        return <div>
            <ModalView
                show={this.state.modal_show}
                size={'lg'}
                prevent_close_after_accept={true}
                on_close={() => this.changeModalAddContact(false)}
                on_accept={() => this.addContact()}
                heading={'add contact'}
                body={this.getAddressBookBody()}/>
            <Form>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>
                        {'address book'}
                    </div>
                    <div className={'panel-body'}>
                        <div>

                            <DatatableView
                                datatable_reference={this.datatable_reference}
                                allow_export={true}
                                allow_import={true}
                                reload_datatable={() => this.loadAddressBook()}
                                datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                                loading={this.state.datatable_loading}
                                action_button_label={Translation.getPhrase('d0db52233')}
                                action_button={{
                                    label   : 'add contact',
                                    on_click: () => this.changeModalAddContact()
                                }}
                                value={this.state.contact_list}
                                sortField={'name'}
                                sortOrder={1}
                                selectionMode={this.props.selectionMode}
                                onRowClick={this.props.onRowClick}
                                onImportFile={(e) => this.importCSV(e)}
                                showActionColumn={this.props.showActionColumn != null ? this.props.showActionColumn : true}
                                resultColumn={[
                                    {
                                        field     : 'id',
                                        header    : 'id',
                                        exportable: true,
                                        hidden    : true
                                    },
                                    {
                                        field     : 'name',
                                        header    : 'name',
                                        exportable: true
                                    },
                                    {
                                        field     : 'address',
                                        header    : 'address',
                                        exportable: true
                                    }
                                ]}/>
                        </div>
                    </div>
                </div>
            </Form>
        </div>;
    }
}


export default connect(
    state => ({
        config: state.config,
        wallet: state.wallet
    }),
    {
        walletUpdateConfig,
        removeWalletAddressVersion
    })(withRouter(AddressBookView));
