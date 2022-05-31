import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Table} from 'react-bootstrap';
import API from '../api/index';
import DatatableView from './utils/datatable-view';
import * as format from '../helper/format';


class PeerInfoView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            result_attribute: [],
            node_about      : {},
            job_list        : [],
            shard_list      : []
        };
    }

    componentDidMount() {
        let nodeID = this.props.location.state.peer;
        this.getNodeAttribute(nodeID);
    }

    getNodeAttribute(nodeID) {
        API.getNodeAttributes(nodeID)
           .then(resultAttribute => {
               let nodeAbout = {};
               let jobList   = [];
               let shardList = [];

               resultAttribute.forEach(attribute => {
                   if (attribute.attribute_type === 'job_list') {
                       jobList = attribute.value.map((input) => ({
                           job_name: input.job_name,
                           status  : format.statusLabel(input.status)
                       }));
                   }

                   if (attribute.value instanceof Array) {
                       if (attribute.attribute_type === 'shard_protocol') {
                           attribute.value.forEach(entry => {
                               if (Number.isInteger(entry.update_date)) {
                                   entry.update_date = format.date(entry.update_date);
                               }
                               entry.is_required = format.boolLabel(entry.is_required);
                               shardList.push(entry);
                           });
                       }
                   }
                   else if (attribute.value instanceof Object) {
                       for (let [key, value] of Object.entries(attribute.value)) {
                           let attributeTypeLabel = key.replaceAll('_', ' ');

                           if (attributeTypeLabel.includes('date')) {
                               value = format.date(value);
                           }
                           if (attributeTypeLabel.includes('fee')) {
                               value = format.millix(value);
                           }
                           else if (Number.isInteger(value)) {
                               value = format.number(value);
                           }

                           nodeAbout[key] = {
                               label: attributeTypeLabel,
                               value: value
                           };
                       }
                   }
                   else {
                       let attribute_type_label = attribute.attribute_type.replaceAll('_', ' ');
                       let value                = attribute.value;
                       if (Number.isInteger(value)) {
                           value = format.number(value);
                       }

                       nodeAbout[attribute.attribute_type] = {
                           label: attribute_type_label,
                           value: value
                       };
                   }
               });

               this.setState({
                   result_attribute: resultAttribute,
                   node_about      : nodeAbout,
                   shard_list      : shardList,
                   job_list        : jobList
               });
           }).catch((e) => {
            console.error(e);
        });
    }

    render() {
        const nodeAboutOrder = [
            'address_default',
            'node_public_key',

            'node_version',
            'node_update_date',
            'node_create_date',

            'transaction_count',
            'transaction_fee_default',
            'transaction_fee_proxy',
            'transaction_fee_network',

            'peer_count',
            'peer_connection_count_day',
            'peer_connection_count_hour',
            'peer_connection_count_minute'
        ];

        return (
            <div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>
                        node
                    </div>
                    <div className={'panel-body'}>
                        <Table striped bordered hover className={'mb-0'}>
                            <tbody>
                            {nodeAboutOrder.map(type => {
                                if (typeof (this.state.node_about[type]) === 'undefined') {
                                    return false;
                                }

                                return <tr>
                                    <td className={'w-20'}>
                                        {this.state.node_about[type].label}
                                    </td>
                                    <td className={'text-break'}>
                                        {this.state.node_about[type].value}
                                    </td>
                                </tr>;
                            })}
                            </tbody>
                        </Table>
                    </div>
                </div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>
                        job list
                    </div>
                    <div className={'panel-body'}>
                        <DatatableView
                            value={this.state.job_list}
                            sortOrder={1}
                            showActionColumn={false}
                            resultColumn={[
                                {
                                    field: 'job_name'
                                },
                                {
                                    field: 'status'
                                }
                            ]}/>
                    </div>
                </div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>storage</div>
                    <div className={'panel-body'}>
                        <DatatableView
                            value={this.state.shard_list}
                            sortOrder={1}
                            resultColumn={[
                                {
                                    field: 'shard_id'
                                },
                                {
                                    field: 'transaction_count'
                                },
                                {
                                    field: 'update_date'
                                },
                                {
                                    field: 'is_required'
                                }
                            ]}/>
                    </div>
                </div>
            </div>
        );
    }
}


export default withRouter(PeerInfoView);
