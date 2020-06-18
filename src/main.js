const BigNumber = require('bignumber.js')
const _ = require('lodash');

/**
 * Collect data from substrate-base blockchain and get election winners list
 * @number how many validators will take the lead
 * @api polkadot-api instance for connect to node
 */
async function getLeaderboard(number, api) {
    var nominators = await api.query.staking.nominators.entries()
    var voters = await Promise.all(nominators.map(async n => {
        var locks = await api.query.balances.locks(n[0].args.toString())
        var allLock = locks.find(l => l.reasons == 'All')
        return {
            address: n[0].args.toString(),
            targets: n[1].toJSON().targets,
            edges: {},
            bond: new BigNumber(allLock.amount.toString()),
            load: new BigNumber(0)
        }
    }))
    var validators = {}
    voters.forEach(v => {
        v.targets.forEach(t => {
            if (!validators[t]) {
                validators[t] = new BigNumber(0);
            }
        })
    })
    for (var t in validators) {
        var locks = await api.query.balances.locks(t)
        var allLock = locks.find(l => l.reasons == 'All')
        if (allLock) {
            voters.push({
                address: t,
                targets: [t],
                edges: {},
                bond: new BigNumber(allLock.amount.toString()),
                load: new BigNumber(0)
            })
        }
    }

    /*Test sample from
    https://wiki.polkadot.network/docs/en/learn-phragmen
    var voters = [
        {name:'V1', bond:new BigNumber(1), load: new BigNumber(0), edges: {}, targets:['A','B']},
        {name:'V2', bond:new BigNumber(2), load: new BigNumber(0), edges: {}, targets:['A','B']},
        {name:'V3', bond:new BigNumber(3), load: new BigNumber(0), edges: {}, targets:['A']},
        {name:'V4', bond:new BigNumber(4), load: new BigNumber(0), edges: {}, targets:['B','C','D']},
        {name:'V5', bond:new BigNumber(5), load: new BigNumber(0), edges: {}, targets:['A','D']}
    ]    
    var validators = {        
        "A":new BigNumber(0),
        "B":new BigNumber(0),
        "C":new BigNumber(0),
        "D":new BigNumber(0),
        "E":new BigNumber(0)
    }*/

    var winners = [];
    var candidates = {}
    voters.forEach(v => {
        _.uniq(v.targets).forEach(t => {
            if (!candidates[t]) {
                candidates[t] = {
                    totalVotes: new BigNumber(0),
                    stake: new BigNumber(0),
                    score: new BigNumber(0),
                    voters: []
                }
            }
            candidates[t].totalVotes = candidates[t].totalVotes.plus(v.bond);
            candidates[t].voters.push({ 
                address: v.address, 
                bond: v.bond.dividedBy(new BigNumber('1e12')) 
            });
        })
    })
    for (var i = 0; i < number; i++) {
        Object.keys(candidates).forEach(key => {
            candidates[key].score = new BigNumber(1).dividedBy(candidates[key].totalVotes)
        })

        voters.forEach(v => {
            _.uniq(v.targets).forEach(t => {
                candidates[t].score = candidates[t].score.plus(v.load.multipliedBy(v.bond)
                                                        .dividedBy(candidates[t].totalVotes))
            })
        })
        var winnerKey = _.minBy(Object.keys(candidates), (key) => {
            return candidates[key].score.toNumber();
        })
        var winner = candidates[winnerKey];
        voters.filter(v => v.targets.includes(winnerKey)).forEach(v => {
            v.edges[winnerKey] = winner.score.minus(v.load);
            v.load = winner.score;
            _.remove(v.targets, (t) => t == winnerKey);
        });
        var accountInfo = await api.derive.accounts.info(winnerKey);
        var name = ''
        if (accountInfo.identity.displayParent || accountInfo.identity.display) {
            var value = "";
            if (accountInfo.identity.displayParent) {
                value += accountInfo.identity.displayParent + ':'
            }
            if (accountInfo.identity.display) {
                value += accountInfo.identity.display
            }
            name = value;
        }
        winners.push({
            address: winnerKey,
            name: name,
            voters: winner.voters,
            totalVotes: winner.totalVotes.dividedBy(new BigNumber('1e12')),
            stake: winner.stake,
            //stakers: [],
            count: 0
        });
        delete candidates[winnerKey]
    }

    voters.forEach(v => {
        for (var edge in v.edges) {
            var winner = winners.find(w => w.address == edge);
            var voterStake = v.bond.multipliedBy(v.edges[edge]).dividedBy(v.load)
            winner.stake = winner.stake.plus(voterStake.dividedBy(new BigNumber('1e12')))
            //winner.stakers.push({address:v.address, stake: voterStake.dividedBy(new BigNumber('1e12'))});
            winner.count++;
        }
    })
    return winners;
}

module.exports = {
    getLeaderboard: getLeaderboard
}