const { connect, init } = require('./connect')
const { getLeaderboard } = require('./leaderboard')
const express = require('express')
const fs = require('fs')

var app = express()

app.get('/', function (req, res) {
    if (!fs.existsSync('./results/winners20.json')) {
        res.send('no data has been created');
    }
    else{
        var result = fs.readFileSync(`./results/winners20.json`, 'utf8');
        res.send(result);
    }
})

app.get('/:num', function (req, res) {
    if (!fs.existsSync(`./results/winners${req.params.num}.json`)) {
        res.send('no data has been created');
    }
    else {
        var result = fs.readFileSync(`./results/winners${req.params.num}.json`, 'utf8');
        res.send(result);
    }
})

startScanning();
app.listen(3000)

async function startScanning() {
    await init()
    getLeaderboard(20)
    getLeaderboard(25)
    getLeaderboard(50)
    setInterval(getLeaderboard, 180000, 20);
    setInterval(getLeaderboard, 180000, 25);
    setInterval(getLeaderboard, 180000, 50);
}