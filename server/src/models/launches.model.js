const launchesDB = require('./launches.mongo')
const planets = require('./planets.mongo')

const axios = require('axios')

const DEFAULT_FLIGHT_NUMBER = 100

const launch = {
    flightNumber: 100, //exists as flight_number in SPACEX_API
    mission: 'Kepler Exploration X', //exists as name in SPACEX_API
    rocket: 'Explorer IS1', //exists as rocket.name in SPACEX_API
    launchDate: new Date('December 27, 2030'), //exists as date_local in SPACEX_API
    target: 'Kepler-442 b', //does not exist in API
    customers: ['NASA', 'ZTM'], //comes from payload.customers for each payload
    upcoming: true, //exists as upcoming in SPACEX_API
    success: true //exists as success in SPACEX_API
}

saveLaunchToDB(launch)

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'

async function loadLaunchData() {
    await findLaunch({
        flightNumber:1,
        rocket:'Falcon1',
        mission: 'FalconSat'
    })
    console.log("Downloading Launch Data...")

    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination:false,
            populate: [
                {
                    path: "rocket",
                    select: {
                        name: 1
                    }
                }, 
                {
                    path:'payloads',
                    select: {
                        'customers':1
                    }
                }
            ]
        }
    })
    const launchDocs = response.data.docs
    for (const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads']
        const customers = payloads.flatMap((payload) => { //REVIEW FLATMAP AGAIN
            return payload['customers']
        })

        const launch = {
            flightNumber: launchDoc.flight_number,
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers: customers
        }

        console.log(`${launch.flightNumber} , ${launch.mission}`)
    }
}

async function findLaunch(filter) {
    return await launchesDB.findOne(filter)
}

async function existsLaunchWithId(launchId) {
    return await findLaunch({
        flightNumber: launchId
    })
}

async function getLatestFlightNumber() { // Doing this because there is no Increment in MONGODB 
    const latestLaunch = await launchesDB
        .findOne()
        .sort('-flightNumber') //Default Lowest to Highest, add "-" in front for reverse order

    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER
    }

    return latestLaunch.flightNumber
}

async function getAllLaunches() { // Gets all Launches
    return await launchesDB.find({}, {
        '_id': 0, '__v': 0
    })
}

async function saveLaunchToDB(launch) { //Saves the Launch to DB
    const planet = await planets.findOne({ //Finding the planet whose name matches with Launches Target Name
        keplerName: launch.target // Why? Because of Referential Integrity which is automatically handled in SQL
    })// 

    if (!planet) {
        throw new Error('No Matching Planet Found')
    }

    await launchesDB.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, {
        upsert: true
    })
}

async function scheduleNewLaunch(launch) { // For Scheduling a new launch

    const newFlightNumber = await getLatestFlightNumber() + 1 // Sets the new flight number

    const newLaunch = Object.assign(launch, {
        flightNumber: newFlightNumber,
        success: true,
        upcoming: true,
        customers: ['Zero to Mastery', 'NASA']
    }) //Creates the new launch 

    await saveLaunchToDB(newLaunch) //Saves the launch to DB
}


async function abortLaunchById(launchId) {

    const aborted = await launchesDB.updateOne({ flightNumber: launchId }, { upcoming: false, success: false })

    return aborted.modifiedCount === 1
}

module.exports = {
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchWithId,
    loadLaunchData
}