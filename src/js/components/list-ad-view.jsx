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
                        label: 'id',
                        field: 'advertisement_id'
                    },
                    {
                        label: 'advertisement guid',
                        field: 'advertisement_guid'
                    },
                    {
                        label: 'type guid',
                        field: 'advertisement_type_guid'
                    },
                    {
                        label: 'advertisement type',
                        field: 'advertisement_type'
                    },
                    {
                        label: 'category guid',
                        field: 'advertisement_category_guid'
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
                        label: 'protocol address funding',
                        field: 'protocol_address_funding'
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
                        label: 'bid impression usd',
                        field: 'bid_impression_usd'
                    },
                    {
                        label: 'bid impression mlx',
                        field: 'bid_impression_mlx'
                    },
                    {
                        label: 'expiration',
                        field: 'expiration'
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="power-off" size="1x"/>,
                            ' ad status '
                        ],
                        field: 'status'
                    },
                    {
                        label: 'create_date',
                        field: 'create_date'
                    }
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
            if (typeof data.api_status != 'undefined' && data.api_status == 'ok') {
                let updated = data.advertisement;
                let ad_list = this.state.ad_list;
                ad_list.rows.forEach((item, idx) => {
                    if (item.advertisement_guid == updated.advertisement_guid) {
                        ad_list.rows[idx] = updated;
                    }
                });
                this.setState({ad_list: ad_list});
            }
        });
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

    async getAdsList() {
        API.listAds().then(data => {
            let shouldUpdate = true;
            if (typeof data.api_status != 'undefined' && data.api_status == 'ok') {

                let ad_list = [];

                if (typeof data.advertisement_list != 'undefined') {
                    data.advertisement_list.forEach((item, idx) => {
                        //todo: should update processor


                        let category = '';
                        let type     = '';
                        this.state.categories.forEach((cat) => {
                            if (cat.advertisement_category_guid == item.advertisement_category_guid) {
                                category = cat.advertisement_category;
                            }
                        });
                        this.state.types.forEach((ad_type) => {
                            if (ad_type.advertisement_type_guid == item.advertisement_type_guid) {
                                type = ad_type.advertisement_type;
                            }
                        });
                        let date = new Date(item.create_date * 1000);
                        ad_list.push({
                            idx                        : item.advertisement_id,
                            advertisement_id           : item.advertisement_id,
                            advertisement_guid         : item.advertisement_guid,
                            advertisement_type_guid    : item.advertisement_type_guid,
                            advertisement_type         : type,
                            advertisement_category_guid: item.advertisement_category_guid,
                            advertisement_category     : category,
                            advertisement_name         : item.advertisement_name,
                            advertisement_url          : item.advertisement_url,
                            protocol_address_funding   : item.protocol_address_funding,
                            budget_daily_usd           : item.budget_daily_usd,
                            budget_daily_mlx           : item.budget_daily_mlx,
                            bid_impression_usd         : item.bid_impression_usd,
                            bid_impression_mlx         : item.bid_impression_mlx,
                            expiration                 : item.expiration,
                            status                     : <button
                                class="btn btn-w-md btn-accent"
                                onClick={() => this.toggleAdStatus(item.advertisement_guid)}>{this.getStatusLabel(item.status)}</button>,
                            create_date                : date.toLocaleString()
                        });
                    });
                }
                if (shouldUpdate) {
                    this.setState({
                        ad_list: {
                            columns: [...this.state.ad_list.columns],

                            rows: ad_list
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
            <Container style={{
                marginTop  : 50,
                paddingLeft: 25
            }}>
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
                                hover
                                responsive
                                autoWidth
                                info
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

            </Container>
        );
    }
}


export default connect(
    state => ({
        ads: state.ads
    })
)(withRouter(ListAdView));
