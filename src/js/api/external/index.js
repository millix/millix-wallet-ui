class APIExternal {
    static FIATLEAK_API = 'https://fiatleak.com/api/';

    getCurrencyPairSummaryFiatleak(ticker = 'usd') {
        return fetch(APIExternal.FIATLEAK_API + '/currency/pair/price/mlx/' + ticker)
            .then((response) => response.json())
            .then(resultJson => {
                resultJson.ticker = ticker;

                let symbol = '';
                if (ticker === 'usd') {
                    symbol = '$';
                }
                resultJson.symbol = symbol;

                return resultJson;
            }).catch();
    }
}


const _APIExternal = new APIExternal();
export default _APIExternal;
