const { ApiPromise, WsProvider } = require('@polkadot/api')
const fs = require('fs')

const connect = { }

async function init(){
    if (!fs.existsSync('./results')){
        fs.mkdirSync('./results');
    }
    const provider = new WsProvider(process.env.NODE_WS || 'wss://kusama-rpc.polkadot.io/');
    connect.api = await ApiPromise.create({ provider })
    const [chain, nodeName, nodeVersion] = await Promise.all([
        connect.api.rpc.system.chain(),
        connect.api.rpc.system.name(),
        connect.api.rpc.system.version()
    ])
    console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);
}

module.exports = {
    connect: connect,
    init:init
}