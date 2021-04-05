const server = require('express')
const { readFile, writeFile } = require('fs')
const { resolve } = require('path')

const PORT = 777
const storePath = resolve(__dirname, 'data.json')

const getStore = () => new Promise((res, rej) => {
    readFile(storePath, (err, data) => {
        if (err) rej(err)
        try {
            res(JSON.parse(data.toString()))
        } catch (parseError) {
            rej(parseError)
        }
    })
})

const write2store = data => new Promise((res, _) => {
    writeFile(storePath, JSON.stringify(data, null, 4), () => res())
})

const genWeekRewards = ({ rewards = {}, date }) => {
    const weekRewards = {}
    // set date to start of the week (Sunday)
    date.setDate(date.getDate() - date.getDay())
    // loop throught week
    for (let day = 0; day < 7; day++) {
        if (typeof rewards[date.toISOString()] === 'object') {
            weekRewards[date.toISOString()] = rewards[date.toISOString()]
            date.setDate(date.getDate() + 1)
        }
        else {
            weekRewards[date.toISOString()] = { 
                availableAt: date.toISOString(), 
                redeemedAt: null, 
                expiresAt: new Date(date.setDate(date.getDate() + 1)).toISOString()
            }
        }
    }
    return weekRewards
}

const runInstance = () => server()
    .get('/users/:id/rewards', async (req, res) => {
        try {
            const date = new Date(String(req.query.at))
            if (isNaN(date.getTime())) return res.status(400).json({
                error: 'You have to specify a valid date.'
            })
            
            const store = await getStore()
            const rewards = store[req.params.id] || {}
            const weekRewards = genWeekRewards({ rewards, date })
            
            // save data to the store
            store[req.params.id] = { ...rewards, ...weekRewards }
            await write2store(store)

            res.status(200).json({ data: Object.keys(weekRewards).map(key => weekRewards[key]) })
        } catch (error) {
            res.status(500).json({ error })
        }
    })
    .patch('/users/:id/rewards/:date/redeem', async (req, res) => {
        try {
            const date = new Date(String(req.params.date))
            if (isNaN(date.getTime())) return res.status(400).json({
                error: 'You have to specify a valid date.'
            })

            const store = await getStore()
            const rewards = { ...(store[req.params.id] || {}), ...genWeekRewards({ rewards: store[req.params.id], date: new Date(date) })}
        
            // let's check expire date
            if (new Date(rewards[date.toISOString()].expiresAt).getTime() < Date.now()) return res.status(403).json({
                error: 'This reward is already expired!'
            }) 
            // There is nothing about it in the actual task description 
            // but common sense suggest me that you cannot redeem reward before it's available date
            if (new Date(rewards[date.toISOString()].availableAt).getTime() > Date.now()) return res.status(403).json({
                error: 'This reward is not available yet!'
            }) 
            // and common sense suggest me that you cannot collect the same reward more than once.
            if (rewards[date.toISOString()].redeemedAt !== null) return res.status(403).json({
                error: 'You have already collected this reward!'
            })
            rewards[date.toISOString()].redeemedAt = new Date(Date.now()).toISOString()
            store[req.params.id] = rewards
            await write2store(store)

            res.status(200).json({ data: rewards[date.toISOString()] })

        } catch (error) {
            res.status(500).json({ error })
        }
    })
    .all('/*', (req, res) => {
        res.status(404).json({
            error: `Route [${req.method} ${req.path}] does not exist.`,
            allowedRoutes: [
                'GET /users/{id}/rewards?at={date}',
                'PATCH /users/{id}/rewards/{date}/redeem'
            ]
        })
    })
    .listen(PORT, () => console.log(`Server has started on port ${PORT}`))

module.exports = { runInstance, genWeekRewards }