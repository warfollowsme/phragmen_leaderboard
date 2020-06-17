const { connect, init } = require('./connect')
const { getLeaderboard } = require('./leaderboard')
const express = require('express')
const fs = require('fs')

var app = express()

app.get('/', function (req, res) {
    var winners = JSON.parse(fs.readFileSync(`./results/winners20.json`, 'utf8'))
    var result = JSON.stringify(winners);
    res.send(result);
})

app.get('/50', function (req, res) {
    var winners = JSON.parse(fs.readFileSync(`./results/winners50.json`, 'utf8'))
    var result = JSON.stringify(winners);
    res.send(result);
})

startScanning();
app.listen(3000)

async function startScanning() {
    await init()
    getLeaderboard(20)
    getLeaderboard(50)
    setInterval(getLeaderboard, 180000, 20);
    setInterval(getLeaderboard, 180000, 50);
}