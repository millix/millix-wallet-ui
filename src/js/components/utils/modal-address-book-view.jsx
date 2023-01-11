import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import ModalView from './modal-view';
import AddressBookView from '../address-book-view';


class ModalAddressBookView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            contacts_list    : [],
            address_from_book: '',
            address_confirm  : '',
            show             : props.show
        };
    }

    changeModalShowAddressBook(value = true) {
        this.props.on_close();
        value || this.setState({address_from_book: ''});
    }

    setAddressFromBook(address_from_book) {
        this.setState({
            address_from_book: address_from_book
        });
    }

    onConfirmAddressFromBook() {
        this.setState({
            address_confirm: this.state.address_from_book
        });
        this.changeModalShowAddressBook(false);
        this.props.on_accept(this.state.address_from_book);
    }

    render() {
        return (
            <ModalView
                show={this.props.show}
                size={'lg'}
                on_accept={() => this.onConfirmAddressFromBook()}
                on_close={() => this.changeModalShowAddressBook(false)}
                disabled={this.state.address_from_book == '' ? true : false}
                body={
                    <AddressBookView
                        showActionColumn={false}
                        onRowClick={(Row) => this.setAddressFromBook(Row.data.address)}
                        selectionMode={'single'}
                    />
                }
            />
        );
    }
}


ModalAddressBookView.propTypes = {
    show     : PropTypes.bool,
    on_close : PropTypes.any,
    on_accept: PropTypes.any,
    heading  : PropTypes.string,
    body     : PropTypes.any,
    size     : PropTypes.string
};

export default withRouter(ModalAddressBookView);
