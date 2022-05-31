import React from 'react';

const ErrorList = (props) => {
    let errorList = props.error_list;

    if (errorList.length > 0 && typeof (errorList[0]) === 'string') {
        let resultError = [];
        errorList.map(item => {
            resultError.push({
                message: item
            });
        });

        errorList = resultError;
    }

    if (Object.keys(errorList).length > 0) {
        return (
            <div className="alert alert-danger" role="alert">
                <ul>
                    {errorList.map((error, idx) =>
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
