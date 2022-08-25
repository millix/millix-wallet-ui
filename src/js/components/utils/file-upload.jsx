import React, {Component} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Button} from 'react-bootstrap';
import * as validate from '../../helper/validate';


class FileUpload extends Component {
    constructor(props) {
        super(props);

        this.state          = {
            image_data: null
        };
        this.input_file_ref = null;
        this.readFile       = this.readFile.bind(this);
    }

    handleFileChange(e) {
        this.readFile(e.target.files[0]).then(data => {
            let error_list = [];
            validate.file('image', data, error_list, this.props.file_type)
                    .then(_ => {
                        if (error_list.length !== 0) {
                            this.props.on_file_upload_error(error_list);
                        }
                        else {
                            this.setState({
                                image_data: data
                            });
                            this.props.on_file_upload(data);
                        }
                    })
                    .catch(error => {
                        error_list.push(error);
                        this.props.on_file_upload_error(error_list);
                    });
        });
    }

    clearFileInput() {
        this.input_file_ref.value = null;
        this.setState({
            image_data: null
        });
        this.props.on_file_cancel_upload();
    }

    triggerFileUpload(e) {
        e.preventDefault();
        this.input_file_ref.click();
    }

    readFile(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();

            reader.onload = function(e) {
                let dataURL = e.target.result;
                dataURL     = dataURL.replace(';base64', `;name=${file.name};base64`);
                resolve({
                    file,
                    dataURL
                });
            };

            if (file) {
                reader.readAsDataURL(file);
            }
        });
    }

    render() {
        return (
            <div className="file-uploader text-center">
                <FontAwesomeIcon
                    icon={'upload'}
                    size="5x"/>
                <div>
                    <Button
                        variant="outline-primary"
                        className={'btn_loader'}
                        type="file"
                        onClick={event => this.triggerFileUpload(event)}
                    >
                        {this.props.title}
                    </Button>
                    <input
                        className={'d-none'}
                        type="file"
                        ref={input => this.input_file_ref = input}
                        name={'file_upload'}
                        onChange={event => this.handleFileChange(event)}
                        accept={this.props.accept}
                    />
                </div>
                {this.state.image_data ?
                 <div className={'preview'}>
                     <img src={this.state.image_data.dataURL} alt={''}/>
                     <FontAwesomeIcon size={'2x'} icon={'minus-circle'} className={'clear-file-input-icon'} onClick={() => this.clearFileInput()}/>
                 </div>
                                       : ''}
            </div>
        );
    }
}


export default FileUpload;
