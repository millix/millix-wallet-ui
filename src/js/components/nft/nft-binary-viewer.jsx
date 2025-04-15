import React, {Component} from 'react';
import binaryPlaceholder from '../../../image/nft/binary-placeholder.png'


class NftBinaryViewer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            type: undefined
        };
    }

    componentDidMount() {
        if (!this.state.type) {
            const img   = new Image();
            img.onload  = () => {
                this.setState({type: 'image'});
            };
            img.onerror = () => {
                const video   = document.createElement('video');
                video.preload = 'metadata';

                video.onloadedmetadata = () => {
                    this.setState({type: 'video'});
                };
                video.onerror          = () => {
                    this.setState({type: 'binary'});
                };
                video.src              = this.props.src;
            };
            img.src     = this.props.src;
        }
    }

    render() {
        if (!this.state.type) {
            return null;
        }

        if (this.state.type === 'image') {
            return <img src={this.props.src} alt={'nft'}/>;
        }

        if (this.state.type === 'video') {
            return <video src={this.props.src} controls={true} width={'100%'}/>;
        }

        return <img src={binaryPlaceholder} alt={'nft'}/>;
    }
}


export default NftBinaryViewer;
