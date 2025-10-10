import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {updateNotificationVolume} from '../../redux/actions';
import VolumeControl from '../utils/volume-control-view';
import Translation from '../../common/translation';
import localforage from 'localforage';


class ConfigAudioView extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        localforage.getItem('notification_volume').catch(_ => 100).then((volume) => this.setState({initialVolume: volume}));
    }

    render() {
        return <div className={'panel panel-filled'}>
            <div className={'panel-heading bordered'}>{Translation.getPhrase('ea50eb5ca')}</div>
            <div className={'panel-body'}>
                <label>{Translation.getPhrase('683d96ac6')}</label>
                <VolumeControl initialVolume={this.state.initialVolume}
                               onVolumeChange={volume => this.props.updateNotificationVolume(volume)}/>
            </div>
        </div>;
    }
}


export default connect(
    () => ({}),
    {
        updateNotificationVolume
    })(withRouter(ConfigAudioView));
