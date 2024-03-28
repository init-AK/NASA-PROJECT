const http = require('http')

const app = require('./app')
const { mongoConnect } = require('./services/mongo')

const { loadPlanetsData } = require('./models/planets.model')
const { loadLaunchData } = require('./models/launches.model')

const PORT = process.env.PORT || 8080

const server = http.createServer(app)


async function startServer() {
    await mongoConnect()
    await loadPlanetsData() // Need to do this before server starts listening for requests because the data needs to be populated or there wont be any data left for serving because we are using "Streams" as data. due to async behaviour of JS it's important to preload our server with data in such particular cases.
    await loadLaunchData()

    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}...`)
    })
}

startServer()
//StartServer - is a good node practise and it needs to be used whenever we need to do a particular task like loading data before actually serving the data or serving the user requests 