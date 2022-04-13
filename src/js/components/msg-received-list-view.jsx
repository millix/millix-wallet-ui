import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form, Row} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {MDBDataTable as DataTable} from 'mdbreact';
import {addNewAddress, walletUpdateAddresses, walletUpdateBalance} from '../redux/actions/index';

const styles = {
    centered: {
        display       : 'flex',
        justifyContent: 'center'
    },
    left    : {
        display       : 'flex',
        justifyContent: 'left'
    },
    right   : {
        display       : 'flex',
        justifyContent: 'flex-end'
    }
};


class MessageReceivedView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            files_list: {
                columns: [
                    {
                        label: [
                            <FontAwesomeIcon icon="file" size="1x"/>,
                            ' subject'
                        ],
                        field: 'subject',
                        width: 300
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="expand-arrows-alt"
                                             size="1x"/>,
                            ' address'
                        ],
                        field: 'address',
                        width: 500
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="info" size="1x"/>,
                            ' amount'
                        ],
                        field: 'amount',
                        width: 50
                    }
                ],
                rows   : []
            }
        };
    }

    render() {
        return (
            <div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading'}>received messages</div>
                    <hr className={'hrPanel'}/>
                    <div className={'panel-body'}>
                        <Row>
                            <DataTable striped bordered small hover
                                       info={false}
                                       entries={10}
                                       entriesOptions={[
                                           10,
                                           30,
                                           50
                                       ]}
                                       data={this.state.files_list}/>
                        </Row>
                    </div>
                </div>
            </div>
        );
    }
}


export default connect(
    state => ({
        network: state.network,
        wallet : state.wallet
    }),
    {
        walletUpdateAddresses,
        addNewAddress,
        walletUpdateBalance
    }
)(withRouter(MessageReceivedView));
