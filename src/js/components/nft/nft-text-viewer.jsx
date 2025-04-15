import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import a11yDark from 'react-syntax-highlighter/dist/cjs/styles/prism/a11y-dark';
import supportedLanguages from 'react-syntax-highlighter/dist/cjs/languages/prism/supported-languages';
import React, {Component} from 'react';
import {Dropdown} from 'primereact/dropdown';
import {Form} from 'react-bootstrap';


class NftTextViewer extends Component {
    constructor(props) {
        super(props);

        this.state              = {
            text    : undefined,
            language: 'javascript',
            type    : props.type || 'base64'
        };
        this.availableLanguages = [
            'plaintext',
            ...supportedLanguages
        ];
    }

    dataUrlToString(dataUrl) {
        const [, data]   = dataUrl.split(',');
        // Convert the base64 encoded data to a binary string.
        const byteString = Uint8Array.from(atob(data), (c) => c.charCodeAt(0)).buffer;

        return new TextDecoder().decode(byteString);
    }

    componentDidMount() {
        if (!this.state.text) {
            if (this.state.type === 'base64') {
                this.setState({text: this.dataUrlToString(this.props.src)});
            }
            else if (this.state.type === 'blob') {
                fetch(this.props.src)
                    .then(r => r.text())
                    .then(text => this.setState({text}));
            }
        }
    }

    render() {
        if (!this.state.text) {
            return null;
        }
        return <div style={{
            display      : 'flex',
            flexDirection: 'column',
            width        : '100%'
        }}>
            <SyntaxHighlighter language={this.state.language} style={a11yDark} wrapLines={true} wrapLongLines={true}>
                {this.state.text}
            </SyntaxHighlighter>
            <Form.Group className="form-group">
                <Dropdown
                    value={this.state.language} options={this.availableLanguages}
                    onChange={e => this.setState({language: e.target.value})} className={'form-control p-0 language-dropdown'}/>
            </Form.Group>
        </div>;
    }
}


export default NftTextViewer;
