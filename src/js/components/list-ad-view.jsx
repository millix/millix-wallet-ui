import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Col, Container, Row} from 'react-bootstrap';
import {withRouter} from 'react-router-dom';
import API from '../api/index';
import DatatableView from './utils/datatable-view';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Button} from 'react-bootstrap';
import moment from 'moment';


class ListAdView extends Component {
    constructor(props) {
        super(props);
        this.adListUpdateHandler = undefined;
        this.state               = {
            categories                : [],
            types                     : [],
            fileKey                   : new Date().getTime(),
            ad_list                   : [],
            datatable_reload_timestamp: ''
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

    getFormattedDate(item) {
        return moment.utc(item.create_date * 1000).format('YYYY-MM-DD HH:mm:ss');
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
                            budget_daily_usd           : item.budget_daily_usd.toLocaleString('en-US'),
                            budget_daily_mlx           : item.budget_daily_mlx.toLocaleString('en-US'),
                            bid_impression_usd         : item.bid_impression_usd.toLocaleString('en-US'),
                            bid_impression_mlx         : item.bid_impression_mlx.toLocaleString('en-US'),
                            expiration                 : item.expiration,
                            status                     : this.getStatusLabel(item.status),
                            action                     : this.getActionButton(item),
                            create_date                : this.getFormattedDate(item)
                        });
                    });

                    this.setState({
                        ad_list                   : ad_list,
                        datatable_reload_timestamp: new Date()
                    });
                }
            }
        });
    }

    componentDidMount() {
        moment.relativeTimeThreshold('ss', -1); // required to get diff in
        // seconds instead of "a few
        // seconds ago"

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
                        <div className={'datatable_action_row'}>
                            <Col md={4}>
                                <Button variant="outline-primary"
                                        className={'btn-sm refresh_button'}
                                        onClick={() => this.reloadDatatable()}
                                >
                                    <FontAwesomeIcon
                                        icon={'sync'}
                                        size="1x"/>
                                    refresh
                                </Button>
                            </Col>
                            <Col md={4} className={'datatable_refresh_ago'}>
                            <span>
                                refreshed {this.state.datatable_reload_timestamp && moment(this.state.datatable_reload_timestamp).fromNow()}
                            </span>
                            </Col>
                            <Col md={4}>
                                <Button variant="outline-primary"
                                        className={'btn-sm create_button'}
                                        onClick={() => this.props.history.push('/advertisement-create')}>
                                    <FontAwesomeIcon
                                        icon={'plus-circle'}
                                        size="1x"/>
                                    create advertisement
                                </Button>
                            </Col>
                        </div>
                        <Row id={'adlist'}>
                            <DatatableView
                                value={this.state.ad_list}
                                sortField={'date'}
                                sortOrder={-1}
                                showActionColumn={true}
                                resultColumn={[
                                    {
                                        'field'   : 'advertisement_name',
                                        'header'  : 'name',
                                        'sortable': true
                                    },
                                    {
                                        'field'   : 'advertisement_category',
                                        'header'  : 'category',
                                        'sortable': true
                                    },
                                    {
                                        'field'   : 'advertisement_url',
                                        'header'  : 'url',
                                        'sortable': true
                                    },
                                    {
                                        'field'   : 'expiration',
                                        'header'  : 'expiration',
                                        'sortable': true
                                    },
                                    {
                                        'field'   : 'status',
                                        'header'  : 'status',
                                        'sortable': true
                                    },
                                    {
                                        'field'   : 'create_date',
                                        'header'  : 'create date',
                                        'sortable': true
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
