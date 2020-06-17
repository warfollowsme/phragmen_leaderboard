# Phragmen Leaderboard

Nodejs implementation of Phragmén Method for Polkadot Network (without edges reduce optimisations). 

Check wiki about method [here](https://wiki.polkadot.network/docs/en/learn-phragmen)

The application runs a simple web server on port 3000, on which you can get the top 20 winners of the election. 
Also app create winners json files (top20 & top50) in results folder.

## To run
`node main.js`

## To change network
Change ws url in connect.js

`const provider = new WsProvider('wss://cc1-1.polkadot.network');`
