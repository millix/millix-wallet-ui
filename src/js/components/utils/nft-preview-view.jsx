import React from 'react';
import {validate_file_type_config} from '../../helper/validate';
import NftTextViewer from '../nft/nft-text-viewer';
import NftBinaryViewer from '../nft/nft-binary-viewer';

export const renderFilePreview = (source, mimeType, name, options = {
    width : '100%',
    height: '100%'
}) => {
    if (!mimeType) {
        return null;
    }

    if (mimeType === 'application/pdf') {
        return <object data={source} type="application/pdf" {...options}/>;
    }
    else if (mimeType.startsWith('video/')) {
        return <video src={source} controls={true} width={'100%'}/>;
    }
    else if (mimeType.startsWith('image/')) {
        return <img src={source} alt={name}/>;
    }
    else if (validate_file_type_config.text.allowed_mime_type_list.includes(mimeType)) {
        return <NftTextViewer src={source} type={'blob'}/>;
    }
    return <NftBinaryViewer src={source}/>;
};
