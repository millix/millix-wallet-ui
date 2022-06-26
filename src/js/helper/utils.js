export const getImageFromApi = (url) => {
    return new Promise((resolve) => {
        fetch(url)
            .then(result => result.ok ? result.blob() : undefined)
            .then(blob => {
                if (!blob) {
                    return resolve();
                }
                return resolve(URL.createObjectURL(blob));
            });
    });
};

export default {
    getImageFromApi
}
