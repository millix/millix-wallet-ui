import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Table} from 'react-bootstrap';
import API from '../api/index';
import DatatableView from './utils/datatable-view';
import * as format from '../helper/format';
import Translation from '../common/translation';


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
           .then(result_attribute => {
               let node_about = {};
               let job_list   = [];
               let shard_list = [];

               result_attribute.forEach(attribute => {
                   if (attribute.attribute_type === 'job_list') {
                       job_list = attribute.value.map((input, idx) => ({
                           job_name: input.job_name,
                           status  : format.status_label(input.status)
                       }));
                   }

                   if (attribute.value instanceof Array) {
                       if (attribute.attribute_type === 'shard_protocol') {
                           attribute.value.forEach(entry => {
                               if (Number.isInteger(entry.update_date)) {
                                   entry.update_date = format.date(entry.update_date);
                               }
                               entry.is_required = format.bool_label(entry.is_required);
                               shard_list.push(entry);
                           });
                       }
                   }
                   else if (attribute.value instanceof Object) {
                       for (let [key, value] of Object.entries(attribute.value)) {
                           let attribute_type_label = key.replaceAll('_', ' ');

                           if (attribute_type_label.includes('date')) {
                               value = format.date(value);
                           }
                           if (attribute_type_label.includes('fee')) {
                               value = format.millix(value);
                           }
                           else if (Number.isInteger(value)) {
                               value = format.number(value);
                           }

                           node_about[key] = {
                               label: attribute_type_label,
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

                       node_about[attribute.attribute_type] = {
                           label: attribute_type_label,
                           value: value
                       };
                   }
               });

               this.setState({
                   result_attribute,
                   node_about,
                   shard_list,
                   job_list
               });
           }).catch((e) => {
            console.error(e);
        });
    }

    render() {
        const node_about_order = [
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
                        {Translation.getPhrase('79b9dd190')}
                    </div>
                    <div className={'panel-body'}>
                        <Table striped bordered hover className={'mb-0'}>
                            <tbody>
                            {node_about_order.map(type => {
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
                        {Translation.getPhrase('7dfe53682')}
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
                    <div className={'panel-heading bordered'}>{Translation.getPhrase('bdc12c879')}</div>
                    <div className={'panel-body'}>
                        <DatatableView
                            value={this.state.shard_list}
                            sortOrder={1}
                            resultColumn={[
                                {
                                    field: 'shard_id',
                                    header: Translation.getPhrase('1545cfa15')
                                },
                                {
                                    field: 'transaction_count',
                                    header: Translation.getPhrase('9818abb2f')
                                },
                                {
                                    field: 'update_date',
                                    header: Translation.getPhrase('94ba10ce4')
                                },
                                {
                                    field: 'is_required',
                                    header: Translation.getPhrase('e73335ea5')
                                }
                            ]}/>
                    </div>
                </div>
            </div>
        );
    }
}


export default withRouter(PeerInfoView);
