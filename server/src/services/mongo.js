const mongoose = require('mongoose')

const MONGO_URL = `mongodb+srv://akshath1015:HmZFhRsT6dtMybA3@democluster.mbabkkk.mongodb.net/nasa?retryWrites=true&w=majority&appName=DemoCluster`

mongoose.connection.once('open', () => {
    console.log('MongoDB Connection ready!')
})

mongoose.connection.on('error', (err) => {
    console.error(err)
})

async function mongoConnect() {
    await mongoose.connect(MONGO_URL)
}

async function mongoDisconnect() {
    await mongoose.disconnect()
}

module.exports = {
    mongoConnect,
}