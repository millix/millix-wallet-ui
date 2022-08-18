<h1 align="center">
  <br>
  <a href="#"><img src="https://github.com/millix/millix-wallet-ui/blob/master/icon.png?raw=true" alt="millix" width="200"></a>
  <br>
  millix wallet light
  <br>
</h1>


## Main Features

- DAG-backed cryptocurrency
- Multiple wallet creation and management in-app
- Easy to send and receive transactions
- [BIP32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki) Hierarchical deterministic (HD) address generation and wallet backups
- Device-based security: all private keys are stored locally, not in the cloud
- Support for testnet
- Mnemonic ([BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)) support for wallet backups
- Support [macOS](?#), [Linux](?#), [Windows](?#) devices

## About millix

### Principles

- Currencies should not be created with debt.
- Currencies should operate at infinite scale.
- Currencies should work the same throughout the entire spectrum of transaction values.
- Currencies should be exchanged with no fee.
- Currencies should be functional without carrying the weight of every previous transaction.
- Modern currencies should be at least as simple to use as primitive currencies.
- Implementing a digital currency into a process should be nearly the same effort as implementing paper cash into a process, where any additional difficulty implementing a digital currency is indisputably offset by benefits.
- Simplicity at the edge is the only possible with equal simplicity in the foundation.
- Currencies are a product chosen by customers and supported by professionals. Customers and professionals require services and support.
- The cost of securing value can't exceed the value it secures.
- Decreasing a currency's value with inflation should not dilute the value of savers.
- Increasing a currency's market value should be proportionate to increases in its' fundamental value.
- Participants that increase fundamental value should be algorithmically incentivized. 

## Installation


## Install nodejs 12
```
 sudo apt update
 sudo apt -y install curl dirmngr apt-transport-https lsb-release ca-certificates build-essential
 curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
 sudo apt-get -y install nodejs
 node --version (check version: should be 12.x.x)
 ```

## Download millix-node code
Outside of the millix-wallet-ui repository, please clone the node code.
```
git clone git://github.com/millix/millix-node.git -b develop
````
Check [here](https://github.com/millix/millix-node) how to run the node locally.


## Run millix-wallet-ui
```
cd millix-wallet-ui
npm install
npm start
```

## run in testnet
update the genesis information in src/environment.js. add the following before `export default environment;`
```
environment['GENESIS_TRANSACTION_ID'] = 'BbYAZLcxbx6adN3KwHZSTGjE6VpeDhiJ3ZPrXs6EMAGqDPfi5';
environment['GENESIS_SHARD_ID']       = 'AyAC3kjLtjM4vktAJ5Xq6mbXKjzEqXoSsmGhhgjnkXUvjtF2M';
```
