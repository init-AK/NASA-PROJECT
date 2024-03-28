const express = require('express')

const {httpGetAllPlanets} = require('./planets.controller') // or {getAllPlanets} Deconstructor can be used

const planetsRouter = express.Router()

planetsRouter.get('/', httpGetAllPlanets)

module.exports = planetsRouter 