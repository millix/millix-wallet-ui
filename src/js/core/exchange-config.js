export default {
    'mlx_usdc': {
        base                       : 'millix',
        currency                   : 'usdc',
        order_price_min            : 0.000000001,
        order_price_max            : 100,
        order_price_float_precision: 9,
        order_size_float           : false,
        order_size_float_precision : 0,
        order_size_min             : 100000,
        order_size_max             : 100000000000
    },
    'btc_usdc': {
        base                       : 'bitcoin',
        currency                   : 'usdc',
        order_price_min            : 0.01,
        order_price_max            : 100,
        order_price_float_precision: 2,
        order_size_float           : true,
        order_size_float_precision : 7,
        order_size_min             : 0.000001,
        order_size_max             : 10
    },
    'eth_usdc': {
        base                       : 'ethereum',
        currency                   : 'usdc',
        order_price_min            : 0.001,
        order_price_max            : 100,
        order_price_float_precision: 3,
        order_size_float           : true,
        order_size_float_precision : 6,
        order_size_min             : 0.000025,
        order_size_max             : 1000
    },
    'pol_usdc': {
        base                       : 'polygon',
        currency                   : 'usdc',
        order_price_min            : 0.0000001,
        order_price_max            : 100,
        order_price_float_precision: 7,
        order_size_float           : true,
        order_size_float_precision : 2,
        order_size_min             : 0.5,
        order_size_max             : 10000000
    },
    'sol_usdc': {
        base                       : 'solana',
        currency                   : 'usdc',
        order_price_min            : 0.0001,
        order_price_max            : 100,
        order_price_float_precision: 4,
        order_size_float           : true,
        order_size_float_precision : 5,
        order_size_min             : 0.0005,
        order_size_max             : 10000
    },
    'xrp_usdc': {
        base                       : 'xrp',
        currency                   : 'usdc',
        order_price_min            : 0.000001,
        order_price_max            : 100,
        order_price_float_precision: 6,
        order_size_float           : true,
        order_size_float_precision : 3,
        order_size_min             : 0.05,
        order_size_max             : 1000000
    }
};
