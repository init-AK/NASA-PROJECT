const launchesDB = require('./launches.mongo')
const planets = require('./planets.mongo')

const axios = require('axios')

const DEFAULT_FLIGHT_NUMBER = 100

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'

async function populateLaunches() {
    const response = await axios.post(SPACEX_API_URL, { //GETTING RESPONSE FROM SPACEX API using Axios
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: "rocket",
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        'customers': 1
                    }
                }
            ]
        }
    })

    const launchDocs = response.data.docs //"docs" is what the response sends in 

    for (const launchDoc of launchDocs) { //launchDocs is an Array of JS Objects, launchDoc is an individual object
        const payloads = launchDoc['payloads'] // returns the payloads array
        const customers = payloads.flatMap((payload) => { //REVIEW FLATMAP AGAIN
            return payload['customers']
        }) // Getting the Payloads first and then getting customers from them by FlatMapping

        const launch = {
            flightNumber: launchDoc.flight_number,
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers: customers
        } // modelling the SPACEXAPI to fit into our launch object

        //TODO: Populate Launches collection:
        await saveLaunchToDB(launch)
    }
}

async function loadLaunchData() { //Reduces API Load by doing this and the above function
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon1',
        mission: 'FalconSat'
    }) // Checks for the first launch if it exists , if yes then data is already loaded

    if (firstLaunch) {
        console.log('Launch Data Loaded')
    } else {
        await populateLaunches() // only if that first launch is missing it populates the launches Collection and this will be the only time it does it
    }

}

async function findLaunch(filter) { //Can find any launch using this filter
    return await launchesDB.findOne(filter)
}

async function existsLaunchWithId(launchId) {
    return await findLaunch({
        flightNumber: launchId
    })
}

async function getLatestFlightNumber() { // TODO: Doing this because there is no Increment in MONGODB 
    const latestLaunch = await launchesDB
        .findOne()
        .sort('-flightNumber') //Default Lowest to Highest, add "-" in front for reverse order

    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER
    }

    return latestLaunch.flightNumber
}

async function getAllLaunches(skip, limit) { // Gets all Launches
    return await launchesDB.find({}, {
        '_id': 0, '__v': 0
    }).sort({ flightNumber: 1 }).skip(skip).limit(limit)
}

async function saveLaunchToDB(launch) { //Saves the Launch to DB

    await launchesDB.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, {
        upsert: true
    })
}

async function scheduleNewLaunch(launch) { // For Scheduling a new launch
    const planet = await planets.findOne({ //Finding the planet whose name matches with Launches Target Name
        keplerName: launch.target // Why? Because of Referential Integrity which is automatically handled in SQL
    })// 

    if (!planet) {
        throw new Error('No Matching Planet Found')
    }

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



//TODO: To Reduce Api calls what we did is , before loading launch data and populating everytime server starts , we check if the launch already exists in DB by checking if the first rocket in present , IF the firt rocket is present meaning the launches have loaded and hence you dont need to call it everytime . REDUCES LOAD.

//TODO: If that first launch is absent, we load all the Data to the DB once and then don't need to do it again since the next time this LoadLaunch() function triggers, we'd already have 1st rocket and mission so there is no need to load the API again