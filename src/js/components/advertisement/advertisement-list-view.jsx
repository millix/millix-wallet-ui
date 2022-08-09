import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Row} from 'react-bootstrap';
import {withRouter} from 'react-router-dom';
import API from '../../api';
import DatatableView from '../utils/datatable-view';
import * as format from '../../helper/format';
import DatatableActionButtonView from '../utils/datatable-action-button-view';
import Translation from '../../common/translation';


class AdvertisementListView extends Component {
    constructor(props) {
        super(props);
        this.adListUpdateHandler = undefined;
        this.state               = {
            advertisement_category_list: [],
            advertisement_type_list    : [],
            fileKey                    : new Date().getTime(),
            advertisement_list         : [],
            datatable_reload_timestamp : '',
            datatable_loading          : false
        };
    }

    getStatusLabel(status) {
        let label = Translation.getPhrase('c45f9e95a');
        if (status === 1) {
            label = Translation.getPhrase('2bb3b7131');
        }

        return label;
    }

    toggleAdvertisementStatus(advertisement_guid) {
        API.toggleAdvertisementStatus(advertisement_guid).then(data => {
            if (typeof data.api_status != 'undefined' && data.api_status === 'success') {
                this.reloadDatatable();
            }
        });
    }

    resetAdvertisement(advertisement_guid) {
        API.resetAdvertisement(advertisement_guid).then(_ => _);
    }

    getActionButton(item) {
        let toggle_status_icon  = 'play';
        let toggle_status_title = Translation.getPhrase('ad7c48837');
        if (item.status === 1) {
            toggle_status_icon  = 'pause';
            toggle_status_title = Translation.getPhrase('b861f5d60');
        }

        return <>
            <DatatableActionButtonView
                icon={'pencil'}
                title={Translation.getPhrase('73ac52193')}
                callback={() => this.edit(item)}
                callback_args={item}
            />
            <DatatableActionButtonView
                icon={toggle_status_icon}
                title={toggle_status_title}
                callback={() => this.toggleAdvertisementStatus(item.advertisement_guid)}
                callback_args={item.advertisement_guid}
            />
            <DatatableActionButtonView
                icon={'redo'}
                title={Translation.getPhrase('615682a2d')}
                callback={() => this.resetAdvertisement(item.advertisement_guid)}
                callback_args={item.advertisement_guid}
            />
        </>;
    }

    loadAdvertisementTypeList() {
        if (this.state.advertisement_type_list.length === 0) {
            return API.getAdvertisementTypeList().then(data => {
                this.setState({
                    advertisement_type_list: data
                });
            });
        }

        return Promise.resolve();
    }

    loadAdvertisementCategoryList() {
        if (this.state.advertisement_category_list.length === 0) {
            return API.getAdvertisementCategoryList().then(data => {
                this.setState({
                    advertisement_category_list: data
                });
            });
        }

        return Promise.resolve();
    }

    getAdvertisementType(item) {
        let type = '';
        this.state.advertisement_type_list.forEach((ad_type) => {
            if (ad_type.advertisement_type_guid === item.advertisement_type_guid) {
                type = ad_type.advertisement_type;
            }
        });

        return type;
    }

    getAdvertisementCategory(item) {
        let category = '';
        this.state.advertisement_category_list.forEach((cat) => {
            if (cat.advertisement_category_guid === item.advertisement_category_guid) {
                category = cat.advertisement_category;
            }
        });
        return category;
    }

    edit(advertisement) {
        this.props.history.push('/advertisement-form/', [advertisement]);
    }

    async reloadDatatable() {
        this.setState({
            datatable_loading: true
        });

        this.loadAdvertisementCategoryList().then(() => {
            return this.loadAdvertisementTypeList();
        })
            .then(() => {
                API.getAdvertisementList().then(response => {
                    let advertisement_list = [];
                    response.advertisement_list?.forEach((item, idx) => {
                        advertisement_list.push({
                            idx                        : item.advertisement_id,
                            advertisement_guid         : item.advertisement_guid,
                            advertisement_type_guid    : item.advertisement_type_guid,
                            advertisement_type         : this.getAdvertisementType(item),
                            advertisement_category_guid: item.advertisement_category_guid,
                            advertisement_category     : this.getAdvertisementCategory(item),
                            advertisement_name         : item.advertisement_name,
                            advertisement_url          : item.advertisement_url,
                            protocol_address_funding   : item.protocol_address_funding,
                            budget_daily_usd           : format.fiat(item.budget_daily_usd),
                            budget_daily_mlx           : format.millix(item.budget_daily_mlx, false),
                            bid_impression_usd         : format.fiat(item.bid_impression_usd),
                            bid_impression_mlx         : format.millix(item.bid_impression_mlx, false),
                            expiration                 : item.expiration,
                            status                     : this.getStatusLabel(item.status),
                            action                     : this.getActionButton(item),
                            create_date                : format.date(item.create_date)
                        });
                    });
                    this.setState({
                        advertisement_list        : advertisement_list,
                        datatable_reload_timestamp: new Date(),
                        datatable_loading         : false
                    });
                });
            });
    }

    componentDidMount() {
        this.reloadDatatable();
        this.adListUpdateHandler = setInterval(() => this.reloadDatatable(), 60000);
    }

    componentWillUnmount() {
        clearTimeout(this.adListUpdateHandler);
    }

    render() {
        return (<div>
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>{Translation.getPhrase('3a1ef95ab')}</div>
                <div className={'panel-body'}>
                    <div className={'form-group'}>
                        {Translation.getPhrase('6ee8b7209')}
                    </div>
                    <Row id={'adlist'}>
                        <DatatableView
                            reload_datatable={() => this.reloadDatatable()}
                            datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                            action_button={{
                                label   : Translation.getPhrase('e7115e611'),
                                on_click: () => this.props.history.push('/advertisement-form/')
                            }}
                            value={this.state.advertisement_list}
                            sortField={'date'}
                            sortOrder={-1}
                            loading={this.state.datatable_loading}
                            showActionColumn={true}
                            resultColumn={[
                                {
                                    field : 'advertisement_name',
                                    header: Translation.getPhrase('99e582355')
                                },
                                {
                                    field : 'advertisement_category',
                                    header: Translation.getPhrase('b9c691d49')
                                },
                                {
                                    field : 'advertisement_url',
                                    header: Translation.getPhrase('7139645b0')
                                },
                                {
                                    field: 'expiration',
                                    header: Translation.getPhrase('1637cf139')
                                },
                                {
                                    field: 'status',
                                    header: Translation.getPhrase('d5afe8b7b')
                                    // filter_type: 'multi_select'
                                },
                                {
                                    field: 'create_date',
                                    header: Translation.getPhrase('e4cbe8fd8')
                                }
                            ]}/>
                    </Row>
                </div>
            </div>

        </div>);
    }
}


export default connect(state => ({
    ads: state.ads
}))(withRouter(AdvertisementListView));
