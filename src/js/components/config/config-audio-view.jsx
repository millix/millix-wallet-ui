import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {updateNotificationVolume} from '../../redux/actions';
import VolumeControl from '../utils/volume-control-view';
import Translation from '../../common/translation';


class ConfigAudioView extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (this.state.initialVolume === undefined) {
            this.setState({initialVolume: nextProps.notification.volume});
        }
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
    state => ({
        notification: state.notification
    }),
    {
        updateNotificationVolume
    })(withRouter(ConfigAudioView));
