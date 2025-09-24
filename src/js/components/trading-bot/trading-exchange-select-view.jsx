import React, {useEffect, useRef, useState} from 'react';
import {Row, Col} from 'react-bootstrap';
import fiatleakImage from '../../../image/trading-bot/fiatleak.png';
import tangledImage from '../../../image/trading-bot/tangled.png';


export default ({onExchangeSelect}) => {

    return <>
        <svg width="0" height="0" aria-hidden="true">
            <filter id="glow-0" x="-.25" y="-.25" width="1.5" height="1.5">
                <feComponentTransfer>
                    <feFuncA type="table" tableValues="0 2 0"></feFuncA>
                </feComponentTransfer>
                <feGaussianBlur stdDeviation="2"></feGaussianBlur>
                <feComponentTransfer result="rond">
                    <feFuncA type="table" tableValues="-2 3"></feFuncA>
                </feComponentTransfer>
                <feMorphology operator="dilate" radius="3"></feMorphology>
                <feGaussianBlur stdDeviation="6"></feGaussianBlur>
                <feBlend in="rond" result="glow"></feBlend>
                <feComponentTransfer in="SourceGraphic">
                    <feFuncA type="table" tableValues="0 0 1"></feFuncA>
                </feComponentTransfer>
                <feBlend in2="glow"></feBlend>
            </filter>
            <filter id="glow-1" x="-.25" y="-.25" width="1.5" height="1.5">
                <feComponentTransfer in="SourceGraphic" result="grad">
                    <feFuncA type="table" tableValues="0 2 0"></feFuncA>
                </feComponentTransfer>
                <feMorphology operator="dilate" radius="3"></feMorphology>
                <feGaussianBlur stdDeviation="6" result="glow"></feGaussianBlur>
                <feTurbulence type="fractalNoise" baseFrequency="7.13"></feTurbulence>
                <feDisplacementMap in="glow" scale="12" yChannelSelector="R"></feDisplacementMap>
                <feComponentTransfer>
                    <feFuncA type="linear" slope=".8"></feFuncA>
                </feComponentTransfer>
                <feBlend in="grad" result="out"></feBlend>
                <feComponentTransfer in="SourceGraphic">
                    <feFuncA type="table" tableValues="0 0 1"></feFuncA>
                </feComponentTransfer>
                <feBlend in2="out"></feBlend>
            </filter>
        </svg>
        <div className={'panel panel-filled'}>
            <div className={'panel-heading bordered'}>{`select the trading platform`}
            </div>
            <div className={'panel-body text-center'}>
                <p>
                    {`please, select the exchange where you want to trade`}
                </p>
                <Row style={{justifyContent: 'center'}}>
                    <Col style={{
                        maxWidth: 400,
                        cursor  : 'pointer'
                    }}>
                        <div className={'panel panel-filled border-animation'}
                             style={{'--l': '#0000 0% 25%, #f3b70019 0%, #faa30032, #e57c044b, #ff620164, #f63e027f 50%'}}
                             onClick={() => onExchangeSelect && onExchangeSelect('fiatleak.com')}>
                            <div className={'panel-heading bordered text-center'}>{`fiatleak.com`}
                            </div>
                            <div className={'panel-body'} style={{padding: 0}}>
                                <img alt={'fiatleak'} src={fiatleakImage} width={'100%'}/>
                            </div>
                        </div>
                    </Col>
                    <Col style={{
                        maxWidth: 400,
                        cursor  : 'pointer'
                    }}>
                        <div className={'panel panel-filled border-animation'} onClick={() => onExchangeSelect && onExchangeSelect('tangled.com')}>
                            <div className={'panel-heading bordered text-center'}>{`tangled.com`}
                            </div>
                            <div className={'panel-body'} style={{padding: 0}}>
                                <img alt={'fiatleak'} src={tangledImage} width={'100%'}/>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    </>;
}
