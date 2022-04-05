import React, {useEffect, useRef, useState} from 'react';

export default (props) => {

    const [maskProps, setMaskProps]                                 = useState({'scaleX': '0'});
    const [muteIndicatorProps, setMuteIndicatorProps]               = useState({
        'scaleX'    : '1',
        'scaleY'    : '1',
        'translateX': '38',
        'translateY': '29'
    });
    const [waveProps, setWaveProps]                                 = useState({
        'scaleX'    : '0',
        'scaleY'    : '0',
        'translateX': '45',
        'translateY': '11'
    });
    const [smallWaveStrokeDashArray, setSmallWaveStrokeDashArray]   = useState('27, 50');
    const [smallWaveStrokeDashOffset, setSmallWaveStrokeDashOffset] = useState();
    const [bigWaveStrokeDashArray, setBigWaveStrokeDashArray]       = useState();
    const [bigWaveStrokeDashOffset, setBigWaveStrokeDashOffset]     = useState();
    const [isMute, setIsMute]                                       = useState(true);
    const [isInitialized, setIsInitialized]                         = useState(false);

    const sliderRef     = useRef();
    const bottomPartRef = useRef();
    const thumbRef      = useRef();

    const updateVolumeWaves = (progress) => {
        const newOffset0    = (13 / 99) * (progress - 1) - 13,
              newDashArray0 = ((1 - 73 / 99) * progress + 73 / 99),
              newOffset1    = (27 / 99) * (progress - 1) - 27,
              newDashArray1 = (1 - 46 / 99) * progress + 46 / 99;
        setSmallWaveStrokeDashArray(newDashArray0 + ', 50');
        setSmallWaveStrokeDashOffset(newOffset0.toString());

        setBigWaveStrokeDashArray(newDashArray1 + ', 50');
        setBigWaveStrokeDashOffset(newOffset1.toString());
    };

    const updateSlider = (progress) => {
        bottomPartRef.current.style.width = progress + 'px';
        thumbRef.current.style.left       = Math.floor(progress) + 'px';
    };

    const toggleWaves         = () => {
        if (isMute) {
            setWaveProps({
                'scaleX'    : '0',
                'scaleY'    : '0',
                'translateX': '45',
                'translateY': '11'
            });
        }
        else {
            setWaveProps({
                'scaleX'    : '1',
                'scaleY'    : '1',
                'translateX': '48',
                'translateY': '11'
            });
        }
    };
    const toggleMuteIndicator = () => {
        if (isMute) {
            setMuteIndicatorProps({
                'scaleX'    : '1',
                'scaleY'    : '1',
                'translateX': '41',
                'translateY': '29'
            });
        }
        else {
            setMuteIndicatorProps({
                'scaleX'    : '0',
                'scaleY'    : '0',
                'translateX': '41',
                'translateY': '29'
            });
        }
    };
    const toggleSpeakerColor  = () => {
        if (isMute) {
            setMaskProps({'scaleX': '0'});
        }
        else {
            setMaskProps({'scaleX': '1'});
        }
    };

    const updateVolume = (volume) => {
        const sliderWidth = sliderRef.current.offsetWidth,
              progress    = (volume / 100) * sliderWidth;

        updateSlider(progress);
        updateVolumeWaves(volume);
        if ((volume === 0 && !isMute) || (volume !== 0 && isMute)) {
            setIsMute(!isMute);
        }

        if (props.onVolumeChange) {
            props.onVolumeChange(volume);
        }
    };

    useEffect(() => {
        toggleSpeakerColor();
        toggleMuteIndicator();
        toggleWaves();
    }, [isMute]);


    useEffect(() => {
        if (!isInitialized && props.initialVolume) {
            updateVolume(props.initialVolume);
            setIsInitialized(true);
        }
    }, [props.initialVolume]);

    return (
        <div className="volume-control">
            <div className="icon">
                <svg width="90px" height="1.3rem" viewBox="0 0 80 70" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                    <defs>
                        <clipPath id="speaker-mask" transform={`scale(${maskProps.scaleX})`}>
                            <rect fill="#36C9FF" x="-1" y="-1" width="51" height="71"/>
                        </clipPath>
                    </defs>
                    <g stroke="currentColor" strokeWidth="3" fill="none" fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round"
                       transform="translate(2, 2)">
                        <polyline
                            points="0.48828125 27.3515625 0.48828125 43.6308692 18.1067164 43.6308692 40.9793701 66.5035229 40.9793701 51.8978048"/>
                        <polyline transform="translate(20.733826, 19.927543) scale(1, -1) translate(-20.733826, -19.927543) "
                                  points="0.48828125 0.3515625 0.48828125 16.6308692 18.1067164 16.6308692 40.9793701 39.5035229 40.9793701 24.8978048"/>
                    </g>
                    <g stroke="#c741fc" strokeWidth="3" fill="none" fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round"
                       transform="translate(2, 2)" clipPath="url(#speaker-mask)">
                        <polyline
                            points="0.48828125 27.3515625 0.48828125 43.6308692 18.1067164 43.6308692 40.9793701 66.5035229 40.9793701 51.8978048"/>
                        <polyline transform="translate(20.733826, 19.927543) scale(1, -1) translate(-20.733826, -19.927543) "
                                  points="0.48828125 0.3515625 0.48828125 16.6308692 18.1067164 16.6308692 40.9793701 39.5035229 40.9793701 24.8978048"/>
                    </g>
                    <g id="mute-indicator"
                       transform={`scale(${muteIndicatorProps.scaleX}, ${muteIndicatorProps.scaleY}) translate(${muteIndicatorProps.translateX}, ${muteIndicatorProps.translateY})`}
                       stroke="#c741fc" strokeWidth="3" fill="none" fillRule="evenodd"
                       strokeLinecap="round" strokeLinejoin="round" style={{transformOrigin: '47px 35px'}}>
                        <path d="M0,0 L12.6189194,12.6189194"/>
                        <path d="M0,0 L12.6189194,12.6189194" transform="translate(6.309460, 6.309460) scale(-1, 1) translate(-6.309460, -6.309460) "/>
                    </g>
                    <g id="sound-waves"
                       transform={`scale(${waveProps.scaleX}, ${waveProps.scaleY}) translate(${waveProps.translateX}, ${waveProps.translateY})`}
                       stroke="currentColor" strokeWidth="3" fill="none" fillRule="evenodd" strokeLinecap="round"
                       strokeLinejoin="round" style={{transformOrigin: '47px 35px'}}>
                        <path
                            d="M0,36.7487373 C3.16687711,33.5818602 5.12563133,29.2068602 5.12563133,24.3743687 C5.12563133,19.5418771 3.16687711,15.1668771 0,12"/>
                        <path
                            d="M7.51471863,48.7487373 C13.7526635,42.5107924 17.6109127,33.8931517 17.6109127,24.3743687 C17.6109127,14.8555856 13.7526635,6.23794492 7.51471863,0"/>
                    </g>
                    <g id="volume-waves"
                       transform={`scale(${waveProps.scaleX}, ${waveProps.scaleY}) translate(${waveProps.translateX}, ${waveProps.translateY})`}
                       stroke="#c741fc" strokeWidth="3" fill="none" fillRule="evenodd" strokeLinecap="round"
                       strokeLinejoin="round" style={{transformOrigin: '47px 35px'}}>
                        <path id="small-wave"
                              d="M0,36.7487373 C3.16687711,33.5818602 5.12563133,29.2068602 5.12563133,24.3743687 C5.12563133,19.5418771 3.16687711,15.1668771 0,12"
                              strokeDasharray={smallWaveStrokeDashArray} strokeDashoffset={smallWaveStrokeDashOffset}/>
                        <path id="big-wave"
                              d="M7.51471863,48.7487373 C13.7526635,42.5107924 17.6109127,33.8931517 17.6109127,24.3743687 C17.6109127,14.8555856 13.7526635,6.23794492 7.51471863,0"
                              strokeDasharray={bigWaveStrokeDashArray} strokeDashoffset={bigWaveStrokeDashOffset}/>
                    </g>
                </svg>
            </div>
            <div className="slider">
                <div className="bar">
                    <div className="bottom-part" ref={bottomPartRef}/>
                </div>
                <div className="thumb" ref={thumbRef}/>
                <input onChange={(e) => updateVolume(parseInt(e.target.value))} ref={sliderRef} type="range" min="0" max="100"
                       defaultValue={props.initialVolume}/>
            </div>
        </div>);
}
