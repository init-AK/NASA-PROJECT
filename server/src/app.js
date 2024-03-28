const express = require('express')
const cors = require('cors')
const path = require('path')
const morgan = require('morgan')

const api = require('./routes/api') //API router from api.js


const app = express()

app.use(cors({
    origin: 'http://localhost:3000'
}))

app.use(morgan('combined'))

app.use(express.json())
//When a client sends a request to your server with a JSON payload, such as a POST or PUT request, express.json() middleware processes this incoming JSON data, parses it, and populates req.body with the result. This means that by the time your route handler function has access to the req object, req.body contains the parsed data, making it easy to work with the content of the request.

app.use(express.static(path.join(__dirname, '..', 'public'))) // REACT BEING SERVED FROM THE SERVER

app.use('/v1',api) //Good for version handling in nodejs. 

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
})

module.exports = app