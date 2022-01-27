import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Col, Container, Row} from 'react-bootstrap';
import {withRouter} from 'react-router-dom';
import API from '../api/index';
import DatatableView from './utils/datatable-view';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Button} from 'react-bootstrap';
import moment from 'moment';
import DatatableHeaderView from './utils/datatable-header-view';
import * as format from '../helper/format';


class ListAdView extends Component {
    constructor(props) {
        super(props);
        this.adListUpdateHandler = undefined;
        this.state               = {
            categories                : [],
            types                     : [],
            fileKey                   : new Date().getTime(),
            ad_list                   : [],
            datatable_reload_timestamp: '',
            datatable_loading         : false
        };
    }

    getStatusLabel(status) {
        let label = 'inactive';
        if (status === 1) {
            label = 'active';
        }

        return label;
    }

    toggleAdStatus(advertisement_guid) {
        API.toggleAdStatus(advertisement_guid).then(data => {
            if (typeof data.api_status != 'undefined' && data.api_status === 'ok') {
                this.reloadDatatable();
            }
        });
    }

    resetAd(advertisement_guid) {
        API.resetAd(advertisement_guid).then(_ => _);
    }

    getStatusButton(item) {
        let icon = item.status === 1 ? 'pause' : 'play';
        return <Button
            id={item.advertisement_guid}
            variant="outline-default"
            className={'btn-xs icon_only ms-auto'}
            onClick={() => this.toggleAdStatus(item.advertisement_guid)}>
            <FontAwesomeIcon
                icon={icon}
                size="1x"/>
        </Button>;
    }

    getResetButton(item) {
        return <Button
            id={item.advertisement_guid}
            variant="outline-default"
            className={'btn-xs icon_only ms-auto'}
            onClick={() => this.resetAd(item.advertisement_guid)}>
            <FontAwesomeIcon
                icon={'redo'}
                size="1x"/>
        </Button>;
    }

    getActionButton(item) {
        return <div>
            {this.getStatusButton(item)}
            {this.getResetButton(item)}
        </div>;
    }

    async getTypes() {
        API.listAdTypes().then(data => {
            this.setState({
                types: data
            });
        });
    }

    async getCategories() {
        API.listCategories().then(data => {
            this.setState({
                categories: data
            });
        });
    }

    getAdType(item) {
        let type = '';
        this.state.types.forEach((ad_type) => {
            if (ad_type.advertisement_type_guid === item.advertisement_type_guid) {
                type = ad_type.advertisement_type;
            }
        });
        return type;
    }

    getAdCategory(item) {
        let category = '';
        this.state.categories.forEach((cat) => {
            if (cat.advertisement_category_guid === item.advertisement_category_guid) {
                category = cat.advertisement_category;
            }
        });
        return category;
    }

    async reloadDatatable() {
        this.setState({
            datatable_loading: true
        });

        API.listAds().then(data => {
            if (typeof data.api_status != 'undefined' && data.api_status === 'ok') {
                let ad_list = [];
                if (typeof data.advertisement_list != 'undefined') {
                    data.advertisement_list.forEach((item, idx) => {
                        ad_list.push({
                            idx                        : item.advertisement_id,
                            advertisement_guid         : item.advertisement_guid,
                            advertisement_type_guid    : item.advertisement_type_guid,
                            advertisement_type         : this.getAdType(item),
                            advertisement_category_guid: item.advertisement_category_guid,
                            advertisement_category     : this.getAdCategory(item),
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
                        ad_list                   : ad_list,
                        datatable_reload_timestamp: new Date(),
                        datatable_loading         : false
                    });
                }
            }
        });
    }

    componentDidMount() {
        this.getCategories();
        this.getTypes();
        this.reloadDatatable();
        this.adListUpdateHandler = setInterval(() => this.reloadDatatable(), 60000);
    }

    componentWillUnmount() {
        clearTimeout(this.adListUpdateHandler);
    }

    render() {
        return (
            <div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>advertisements
                    </div>
                    <div className={'panel-body'}>
                        <div>
                            the tangled ad platform allows anyone to create an
                            advertisement without approvals or permission. when
                            your ad is created it will appear to other tangled
                            browser users. the amount that you choose to pay for
                            the ad to appear is paid directly to the consumer
                            that views the ad.
                        </div>
                        <div className={'form-group'}>
                            at the moment you can not edit advertisements. you
                            can pause existing and create a new one instead.
                        </div>
                        <DatatableHeaderView
                            reload_datatable={() => this.reloadDatatable()}
                            datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                            action_button_on_click={() => this.props.history.push('/advertisement-create')}
                        />
                        <Row id={'adlist'}>
                            <DatatableView
                                value={this.state.ad_list}
                                sortField={'date'}
                                sortOrder={-1}
                                loading={this.state.datatable_loading}
                                showActionColumn={true}
                                resultColumn={[
                                    {
                                        field : 'advertisement_name',
                                        header: 'name'
                                    },
                                    {
                                        field : 'advertisement_category',
                                        header: 'category'
                                    },
                                    {
                                        field : 'advertisement_url',
                                        header: 'url'
                                    },
                                    {
                                        field: 'expiration'
                                    },
                                    {
                                        field: 'status'
                                    },
                                    {
                                        field: 'create_date'
                                    }
                                ]}/>
                        </Row>
                    </div>
                </div>

            </div>
        );
    }
}


export default connect(
    state => ({
        ads: state.ads
    })
)(withRouter(ListAdView));
