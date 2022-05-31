let ntp = {
    offset     : 0,
    initialized: false
};

let initialize = () => {
    const now = new Date();
    console.log('[millix-node] current system time', now);
    ntp.initialized = true;
};

initialize();

ntp.now = function() {
    let timeNow = new Date();
    timeNow.setUTCMilliseconds(timeNow.getUTCMilliseconds() + ntp.offset);
    return timeNow;
};

export default ntp;
