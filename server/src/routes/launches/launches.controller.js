const { 
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchWithId, 
    abortLaunchById 
} = require('../../models/launches.model')

async function httpGetAllLaunches(req,res) {
    return res.status(200).json(await getAllLaunches()) 
    //Turns the values of the launches to an array using Array.from()
}

async function httpAddNewLaunch(req,res) {
    const launch = req.body
    
    if(!launch.mission || !launch.rocket || !launch.launchDate || !launch.target) {
        return res.status(400).json({
            error:'Missing required launch property'
        })
    }

    launch.launchDate = new Date(launch.launchDate) 
    // Because it was initialized as a new Date object and string was sent into it

    if(isNaN(launch.launchDate)) {
        return res.status(400).json({
            error:'Invalid launch date'
        })
    }
    await scheduleNewLaunch(launch)

    return res.status(201).json(launch) // Status should be set only once per controller function 
}

async function httpAbortLaunch(req,res) {
    const launchId = Number(req.params.id)
    const existsLaunch = await existsLaunchWithId(launchId)

    if(!existsLaunch) {
        return res.status(404).json({
            error: 'Launch not found'
        })
    }

    const aborted = await abortLaunchById(launchId)
    if(!aborted) {
        return res.status(400).json({
            error:'Launch not aborted'
        })
    }
    return res.status(200).json({
        ok:true
    })
}

module.exports = {
    httpAddNewLaunch,
    httpGetAllLaunches,
    httpAbortLaunch
}