import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button, Modal} from 'react-bootstrap';
import {Route, withRouter} from 'react-router-dom';


class ModalView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            show: props.show
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.show !== this.props.show) {
            this.setModalShow(this.props.show);
        }
    }

    setModalShow(show) {
        this.setState({
            show: show
        });
    }

    closeModal() {
        this.setModalShow(false);
    }

    cancel() {
        if (typeof (this.props.on_close) === 'function') {
            this.props.on_close();
        }
        this.closeModal();
    }

    isOnAcceptDefined() {
        return typeof (this.props.on_accept) === 'function';
    }

    accept() {
        if (this.isOnAcceptDefined()) {
            this.props.on_accept();
        }
        if (this.props.prevent_close_after_accept) {
            return;
        }
        this.closeModal();
    }

    render() {
        let accept_button = '';
        if (this.isOnAcceptDefined()) {
            accept_button = <Button variant="outline-primary"
                                    onClick={() => this.accept()}>
                continue
            </Button>;
        }

        return (
            <>
                <Modal show={this.state.show} onHide={() => this.cancel()}
                       size={this.props.size}
                       animation={false}>
                    <Modal.Header closeButton>
                        <span
                            className={'page_subtitle'}>{this.props.heading}</span>
                    </Modal.Header>
                    <Modal.Body>{this.props.body}</Modal.Body>
                    <Modal.Footer>
                        {accept_button}
                        <Button variant="outline-default"
                                onClick={() => this.cancel()}>
                            close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }
}


ModalView.propTypes = {
    show     : PropTypes.bool,
    on_close : PropTypes.any,
    on_accept: PropTypes.any,
    heading  : PropTypes.string,
    body     : PropTypes.any,
    size     : PropTypes.string
};

export default withRouter(ModalView);
