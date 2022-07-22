import React from 'react';
import {withRouter} from 'react-router-dom';
import Translation from '../../common/translation';
import moment from 'moment';


function ReloadTimeTickerView(props) {
    return <>{Translation.getPhrase('06d814962')} {props.last_update_time && moment(props.last_update_time).fromNow()}</>;
}


export default withRouter(ReloadTimeTickerView);

