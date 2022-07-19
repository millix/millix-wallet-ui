import API from '../api/index.js';

const getImageFromApi = (data) => {
    return new Promise((resolve) => {
        API.getNftImage(data)
           .then(result => {
               return result.ok ? result.blob() : undefined;
           })
           .then(blob => {
               if (!blob) {
                   return resolve();
               }

               const image_url = URL.createObjectURL(blob);

               return resolve(nftImageData(image_url, data));
           });
    });
};

function nftImageData(image_url, row) {
    return {
        src   : image_url,
        width : 4,
        height: 3,
        hash  : row.transaction_output_attribute[0].value.file_list[0].hash,
        amount: row.amount,
        txid  : row.transaction_id
    };
}


export default {
    getImageFromApi
};
