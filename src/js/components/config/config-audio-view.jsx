import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {updateNotificationVolume} from '../../redux/actions';
import VolumeControl from '../utils/volume-control-view';


class ConfigAudioView extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.initialVolume === undefined) {
            this.setState({initialVolume: nextProps.notification.volume});
        }
    }

    render() {
        return <div className={'panel panel-filled'}>
            <div className={'panel-heading bordered'}>volume</div>
            <div className={'panel-body'}>
                <label>
                    transaction notification volume
                </label>
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
