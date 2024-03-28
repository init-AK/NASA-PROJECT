const { parse } = require('csv-parse')
const fs = require('fs')
const path = require('path')

const planets = require('./planets.mongo')

function isHabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED'
        && planet['koi_insol'] > 0.36
        && planet['koi_insol'] < 1.11
        && planet['koi_prad'] < 1.6
}

function loadPlanetsData() { // Check if its calling multiple times and look for UPSERTS
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname,'..','..','data','kepler_data.csv'))
        .pipe(parse({ // piping : Readable stream[SOURCE] provides data to Writable stream[DESTINATION]. connects both 
            comment: '#', //considers lines starting with # as comments
            columns: true, // Conversts CSV data to JS objects with key-value pairs
        }))
        .on('data', async (data) => {
            if (isHabitablePlanet(data)) {
                //insert + update = upsert ( Basically an insert but inserts only if object already doesnt exist.)
                // await planets.create({ //.create() triggers .save() middlewear
                //     keplerName: data.kepler_name
                // })
                savePlanet(data)
            }
        })
        .on('error', (err) => {
            console.log(err)
            reject(err)
        })
        .on('end', async () => {
            const countPlanetsFound = (await getAllPlanets()).length
            console.log(`${countPlanetsFound} Habitable planets found.`)
            resolve()
        })
    }
    )
}

async function getAllPlanets() {
    return await planets.find({}, {
        '_id':0,'__v':0
    })
}

async function savePlanet(planet) {
    try {
        await planets.updateOne({
            keplerName:planet.kepler_name
        }, {
            keplerName:planet.kepler_name
        }, {
            upsert:true
        })
    } catch(err) {
        console.error(`Couldn't save planet - ${err}`)
    }
}


module.exports = {
    loadPlanetsData, //Loading functions
    getAllPlanets //Data Access functions 
}

//ALL MONGOOSE , MONGO , DB OPERATIONS ARE ASYNCHRONOUS