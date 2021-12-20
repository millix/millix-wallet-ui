import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Container, Row} from 'react-bootstrap';
import {withRouter} from 'react-router-dom';
import API from '../api/index';
import {MDBDataTable as DataTable} from 'mdbreact';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';


class ListAdView extends Component {
    constructor(props) {
        super(props);
        this.adListUpdateHandler = undefined;
        this.state               = {
            categories: [],
            types     : [],
            fileKey   : new Date().getTime(),
            ad_list   : {
                columns: [
                    {
                        label: '#',
                        field: 'idx'
                    },
                    {
                        label: 'advertisement guid',
                        field: 'advertisement_guid'
                    },
                    {
                        label: 'category',
                        field: 'advertisement_category'
                    },
                    {
                        label: 'advertisement name',
                        field: 'advertisement_name'
                    },
                    {
                        label: 'advertisement url',
                        field: 'advertisement_url'
                    },
                    {
                        label: 'budget daily usd',
                        field: 'budget_daily_usd'
                    },
                    {
                        label: 'budget daily mlx',
                        field: 'budget_daily_mlx'
                    },
                    {
                        label: 'bid impression mlx',
                        field: 'bid_impression_mlx'
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="power-off" size="1x"/>,
                            ' ad status '
                        ],
                        field: 'status_button'
                    },
                ],
                rows   : []
            }
        };
    }

    getStatusLabel(status) {
        let label = 'inactive';
        if (status == '1') {
            label = 'active';
        }
        return label;
    }

    async toggleAdStatus(advertisement_guid) {
        API.toggleAdStatus(advertisement_guid).then(data => {
            if (typeof data.api_status != 'undefined' && data.api_status === 'ok') {
                let updated = data.advertisement;
                let rows    = this.state.ad_list.rows;
                rows.forEach((item, idx) => {
                    if (item.advertisement_guid === updated.advertisement_guid) {
                        updated.advertisement_type     = this.getAdType(updated);
                        updated.advertisement_category = this.getAdCategory(updated);
                        updated.status_button          = this.getStatusButton(updated);
                        updated.create_date            = this.getFormattedDate(updated);
                        rows[idx]                      = updated;
                    }
                });
                this.setState({
                    ad_list: {
                        columns: [...this.state.ad_list.columns],
                        rows
                    }
                });
            }
        });
    }

    getFormattedDate(item) {
        let date = new Date(item.create_date * 1000);
        return date.toLocaleString();
    }

    getStatusButton(item) {
        let active = item.status === 1 ? 'active' : '';
        return <button
            className={'btn btn-w-md btn-accent ' + active}
            id={item.advertisement_guid}
            onClick={() => this.toggleAdStatus(item.advertisement_guid)}>{this.getStatusLabel(item.status)}</button>;

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

    async getAdsList() {
        API.listAds().then(data => {
            let shouldUpdate = false;
            if (typeof data.api_status != 'undefined' && data.api_status === 'ok') {

                let ad_list    = [];
                let table_list = this.state.ad_list.rows;

                if (typeof data.advertisement_list != 'undefined') {
                    if (table_list.length == !data.advertisement_list.length) {
                        shouldUpdate = true;
                    }
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
                            budget_daily_usd           : item.budget_daily_usd,
                            budget_daily_mlx           : item.budget_daily_mlx,
                            bid_impression_usd         : item.bid_impression_usd,
                            bid_impression_mlx         : item.bid_impression_mlx,
                            expiration                 : item.expiration,
                            status                     : item.status,
                            status_button              : this.getStatusButton(item),
                            create_date                : this.getFormattedDate(item)
                        });
                    });
                }
                if (shouldUpdate) {
                    this.setState({
                        ad_list: {
                            columns: [...this.state.ad_list.columns],
                            rows   : ad_list
                        }
                    });
                }
            }
        });
    }

    componentDidMount() {
        this.getCategories();
        this.getTypes();
        this.adListUpdateHandler = setInterval(() => this.getAdsList(), 2000);
    }

    componentWillUnmount() {
        clearTimeout(this.adListUpdateHandler);
    }

    render() {
        return (
            <div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading'}>advertisements</div>
                    <hr className={'hrPal'}/>
                    <div className={'panel-body'}>
                        <Row id={'adlist'}>
                            <DataTable
                                hover
                                pagesAmount={4}
                                striped
                                bordered
                                responsive
                                autoWidth
                                info
                                noBottomColumns
                                entries={10}
                                entriesOptions={[
                                    10,
                                    30,
                                    50
                                ]}
                                data={this.state.ad_list}/>
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
