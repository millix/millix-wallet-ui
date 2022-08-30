import React from 'react';

const WarningList = (props) => {
    let warning_list = props.warning_list;

    if (warning_list.length > 0 && typeof (warning_list[0]) === 'string') {
        let result_warning = [];
        warning_list.map(item => {
            result_warning.push({
                message: item
            });
        });

        warning_list = result_warning;
    }

    if (Object.keys(warning_list).length > 0) {
        const class_name = props.class_name ? props.class_name : '';

        return (
            <div className={'alert alert-warning ' + class_name} role="alert">
                <ul>
                    {warning_list.map((warning, idx) =>
                        <li key={'message_' + idx}>
                            {warning.message}
                        </li>
                    )}
                </ul>
            </div>
        );
    }

    return '';
};

export default WarningList;
