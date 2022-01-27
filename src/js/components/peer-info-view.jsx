import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Button, Col, Row, Table} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import API from '../api/index';
import moment from 'moment';
import DatatableView from './utils/datatable-view';


class PeerInfoView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            attributes: []
        };
    }

    componentDidMount() {
        let nodeID = this.props.location.state.peer;
        this.getNodeAttribute(nodeID);
    }

    getNodeAttribute(nodeID) {
        API.getNodeAttributes(nodeID)
           .then(attributes => {
               this.setState({attributes});
           }).catch((e) => {
            console.error(e);
        });
    }

    render() {
        let attributes        = this.state.attributes;
        let simpleAttributes  = [];
        let jobList  = [];
        let tabularAttributes = [];
        attributes.forEach(ele => {
            if (ele.attribute_type === 'job_list') {
                jobList = ele.value.map((input, idx) => ({
                    job_name: input.job_name,
                    status: input.status
                }));
            }

            if (ele.value instanceof Array) {
                if (ele.attribute_type === 'shard_protocol') {
                    ele.value.forEach(entry => {
                        if (Number.isInteger(entry.update_date)){
                            entry.update_date = moment.utc(entry.update_date * 1000).format('YYYY-MM-DD HH:mm:ss');
                        }
                        entry.is_required = entry.is_required === true ? 1 : 0;
                        tabularAttributes.push(entry);
                    });
                }
            }
            else if (ele.value instanceof Object) {
                for (let [key, value] of Object.entries(ele.value)) {
                    let attributeType = key.replace(/_/g, ' ');
                    if (attributeType.includes('date') && (new Date(value)).getTime() > 0){
                        value = moment.utc(value * 1000).format('YYYY-MM-DD HH:mm:ss')
                    }
                    simpleAttributes.push(
                        <tr>
                            <td className={'w-20'}>
                                {attributeType}
                            </td>
                            <td className={'text-break'}>
                                {value?.toString()}
                            </td>
                        </tr>
                    );
                }
            }
            else {
                let attributeType = ele.attribute_type.replace(/_/g, ' ');
                simpleAttributes.push(
                    <tr>
                        <td className={'w-20'}>
                            {attributeType}
                        </td>
                        <td className={'text-break'}>
                            {ele.value?.toString()}
                        </td>
                    </tr>
                );
            }
        });

        return (
            <div>
                <Row className="mb-3 mt-3">
                    <Col className="pl-0" style={{
                        display       : 'flex',
                        justifyContent: 'flex-start',
                        marginLeft    : 10
                    }}>
                        <Button variant='outline-primary'
                                onClick={this.props.history.goBack}>
                            <FontAwesomeIcon icon="arrow-circle-left"
                                             size="2x"/>
                            <span style={{
                                position   : 'relative',
                                top        : -5,
                                marginRight: 10,
                                marginLeft : 10
                            }}> Back</span>
                        </Button>
                    </Col>
                </Row>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>
                        node attributes
                    </div>
                    <div className={'panel-body'}>
                        <div className={'panel-body'}>
                            <div className={'section_subtitle'}>
                                node
                            </div>
                            <Table striped bordered hover className={'mb-3'}>
                                <tbody>
                                {simpleAttributes}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>
                        job list
                    </div>
                    <div className={'panel-body'}>
                        <div className={'panel-body'}>
                            <DatatableView
                                value={jobList}
                                sortOrder={1}
                                showActionColumn={false}
                                resultColumn={[
                                    {
                                        'field': 'job_name'
                                    },
                                    {
                                        'field': 'status'
                                    },
                                ]}/>
                        </div>
                    </div>
                </div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>shard list</div>
                    <div className={'panel-body'}>
                        <DatatableView
                            value={tabularAttributes}
                            sortOrder={1}
                            showActionColumn={false}
                            resultColumn={[
                                {
                                    'field': 'shard_id'
                                },
                                {
                                    'field': 'transaction_count'
                                },
                                {
                                    'field': 'update_date'
                                },
                                {
                                    'field': 'is_required'
                                }
                            ]}/>
                    </div>
                </div>
            </div>
        );
    }
}


export default withRouter(PeerInfoView);
