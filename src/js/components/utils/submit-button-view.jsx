import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap';
import {withRouter} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import ModalView from './modal-view';
import Translation from '../../common/translation';


class SubmitButtonView extends Component {
    constructor(props) {
        super(props);

        let confirmation_modal_enabled = false;
        if (props.confirmation_modal_heading) {
            confirmation_modal_enabled = true;
        }

        this.state = {
            canceling                 : false,
            sending                   : false,
            disabled                  : !!props.force_disabled,
            modal_show                : false,
            confirmation_modal_enabled: confirmation_modal_enabled
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.force_disabled !== this.props.force_disabled) {
            this.setState({
                disabled: !!this.props.force_disabled
            });
        }
    }

    changeModalShow(value = true) {
        this.setState({
            modal_show: value
        });
    }

    handleOnClick() {
        if (!this.state.sending) {
            if (!this.state.modal_show && this.state.confirmation_modal_enabled) {
                this.changeModalShow();
            }
            else {
                this.submit();
            }
        }
        else if (!this.state.canceling) {
            this.cancel();
        }
    }

    isOnCancelDefined() {
        return typeof (this.props.on_cancel) === 'function';
    }

    cancel() {
        if (this.isOnCancelDefined()) {
            this.setState({
                canceling: true,
                disabled : true
            });

            this.props.on_cancel().then(_ => {
                this.resetState();
            });
        }
    }

    resetState() {
        this.setState({
            canceling : false,
            sending   : false,
            disabled  : !!this.props.force_disabled,
            modal_show: false
        });
    }

    submit() {
        let disabled = true;
        if (this.isOnCancelDefined()) {
            disabled = false;
        }

        this.setState({
            sending : true,
            disabled: disabled
        });

        if (typeof (this.props.on_submit) === 'function') {
            this.props.on_submit().then(_ => {
                this.resetState();
            });
        }
    }

    getLabel() {
        let label = this.props.label;
        let icon  = '';
        if (this.props.icon) {
            icon = <FontAwesomeIcon icon={this.props.icon}/>;
        }

        if (this.state.sending && this.isOnCancelDefined()) {
            icon = <div className="loader-spin"/>;
            if (this.state.canceling) {
                label = <>{Translation.getPhrase('1d7c45c87')}</>;
            }
            else {
                label = <>{Translation.getPhrase('1c5390bfe')}</>;
            }
        }

        return <>{icon}{label}</>;
    }

    render() {
        let confirmation_modal = '';
        if (this.state.confirmation_modal_enabled) {
            confirmation_modal = <ModalView
                show={this.state.modal_show}
                size={'lg'}
                heading={this.props.confirmation_modal_heading}
                on_accept={() => this.handleOnClick()}
                on_close={() => this.changeModalShow(false)}
                body={this.props.confirmation_modal_body}/>;
        }

        return (
            <>
                {confirmation_modal}
                <Button
                    variant="outline-primary"
                    className={'btn_loader'}
                    onClick={() => this.handleOnClick()}
                    disabled={this.state.disabled}>
                    {this.getLabel()}
                </Button>
            </>
        );
    }
}


SubmitButtonView.propTypes = {
    on_cancel     : PropTypes.any,
    on_submit     : PropTypes.any,
    force_disabled: PropTypes.bool,
    label         : PropTypes.string,
    icon          : PropTypes.any
};

export default withRouter(SubmitButtonView);
