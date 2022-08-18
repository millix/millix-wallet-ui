class APIExternal {
    static FIATLEAK_API = 'https://fiatleak.com/api/';

    getCurrencyPairSummaryFiatleak(ticker = 'usd') {
        return fetch(APIExternal.FIATLEAK_API + '/currency/pair/price/mlx/' + ticker)
            .then((response) => response.json())
            .then(result_json => {
                result_json.ticker = ticker;

                let symbol = '';
                if (ticker === 'usd') {
                    symbol = '$';
                }
                result_json.symbol = symbol;

                return result_json;
            }).catch(error => error);
    }
}


const _APIExternal = new APIExternal();
export default _APIExternal;
