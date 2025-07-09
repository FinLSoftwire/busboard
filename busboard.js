const prompt = require("prompt-sync")();
const fetch = require("node-fetch");

const fetchBusArrivals = async (busStopID) => {
    try {
        const busArrivalsResponse = await fetch("https://api.tfl.gov.uk/StopPoint/"+busStopID+"/Arrivals");
        const busArrivalsJSON = await busArrivalsResponse.json();
        if (busArrivalsResponse.status === 404) {
            console.log("Bus stop with ID " + busStopID + " does not exist.");
        } else {
            outputPredictedArrivalsFromJSON(busArrivalsJSON);
        }
    } catch (error) {
        console.error(error);
    }
}

function outputPredictedArrivalsFromJSON(predictedArrivalsJSON) {
    let chronologicalPredictedArrivalObjects = predictedArrivalsJSON.sort( (a,b) => {return a.timeToStation-b.timeToStation; });
    for(let arrivalObjectIndex in chronologicalPredictedArrivalObjects) {
        if (arrivalObjectIndex === "5")
            break;
        let currentArrivalObject = chronologicalPredictedArrivalObjects[arrivalObjectIndex];
        if (arrivalObjectIndex === "0") {
            console.log("Next predicted arrivals for station " + currentArrivalObject.stationName + " are:");
        }
        console.log("Line " + currentArrivalObject.lineName + " arriving in " + Math.round(currentArrivalObject.timeToStation / 60).toString() + " minutes");
        console.log("\tHeading to destination " + currentArrivalObject.towards);
    }
}

let requestedBusStopID = prompt("Input a bus stop ID to check the predicted arrivals for: ");
if (requestedBusStopID.length === 0)
    requestedBusStopID = "490008660N";

fetchBusArrivals(requestedBusStopID);