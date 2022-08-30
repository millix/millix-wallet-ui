import React from 'react';

const ErrorList = (props) => {
    let error_list = props.error_list;

    if (error_list.length > 0 && typeof (error_list[0]) === 'string') {
        let result_error = [];
        error_list.map(item => {
            result_error.push({
                message: item
            });
        });

        error_list = result_error;
    }

    if (Object.keys(error_list).length > 0) {
        const class_name = props.class_name ? props.class_name : '';

        return (
            <div className={'alert alert-danger ' + class_name} role="alert">
                <ul>
                    {error_list.map((error, idx) =>
                        <li key={'message_' + idx}>
                            {error.message}
                        </li>
                    )}
                </ul>
            </div>
        );
    }

    return '';
};

export default ErrorList;
