# Phragmen Leaderboard

Nodejs implementation of Phragmén Method for Substrate-base Networks (without edges reduce optimisations). 

Check wiki about method [here](https://wiki.polkadot.network/docs/en/learn-phragmen)

The example applications runs a simple web server on port 3000, on which you can get the top 20 winners of the election. 
Also create winners json files in results folder.

## Install
`npm i phragmen-substrate`

## To run example
`npm update`

`node ./examples/polkadot/main.js`

or

`node ./examples/kusama/main.js`

## To change network
You can set ws uri in env parameters

`export NODE_WS=ws://127.0.0.1:9944/`

## To change port
You can also set web server port in env parameters

`export SERVER_PORT=3000`

