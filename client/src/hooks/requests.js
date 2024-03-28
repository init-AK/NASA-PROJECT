const API_URL = 'http://localhost:8080/v1'


async function httpGetPlanets() {
  const response = await fetch(`${API_URL}/planets`)
  return await response.json()
}

async function httpGetLaunches() {
  // TODO: Once API is ready.
  const response = await fetch(`${API_URL}/launches`)
  const fetchedLaunches =  await response.json()
  // Load launches, sort by flight number, and return as JSON.
  return fetchedLaunches.sort((a, b) => {
      return a.flightNumber - b.flightNumber
  })
}

async function httpSubmitLaunch(launch) {
  // Submit given launch data to launch system.
  try {
    return await fetch(`${API_URL}/launches`, {
      method:"post",
      headers: {
        "Content-Type":"application/json"
      },
      body:JSON.stringify(launch)
    })
  } catch(err) {
    return {
      ok:false
    }
  }
  
}

async function httpAbortLaunch(id) {
  try{
    return await fetch(`${API_URL}/launches/${id}`, {
      method:"delete"
    })
  } catch(err) {
    console.log(err)
    return {
      ok:false
    }
  }
    
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};