const { connect, init } = require('./connect')
const { getLeaderboard } = require('../../src/main')
const express = require('express')
const fs = require('fs')

var app = express()

app.get('/', function (req, res) {
    if (!fs.existsSync('./results/winners20.json')) {
        res.send('no data has been created');
    }
    else {
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
app.listen(process.env.SERVER_PORT || 3000)

async function startScanning() {
    await init()
    var tops = [20,25,50]
    tops.forEach(number => {        
        getLeaderboard(number, connect.api).then(result => {
            var winnersString = JSON.stringify(result, null, `\t`)
            fs.writeFileSync(`./results/winners${number}.json`, winnersString)
        })
        setInterval(function (number, api) {
            getLeaderboard(number, api).then(result => {
                var winnersString = JSON.stringify(result, null, `\t`)
                fs.writeFileSync(`./results/winners${number}.json`, winnersString)
            })
        }, 180000, number, connect.api);
    });
}