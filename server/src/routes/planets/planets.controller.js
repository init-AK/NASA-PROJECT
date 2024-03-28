const {getAllPlanets} = require('../../models/planets.model')

async function httpGetAllPlanets(req, res) {
    return res.status(200).json(await getAllPlanets()) // returning because status should not be sent multiple times.
}

module.exports = {
    httpGetAllPlanets,
}