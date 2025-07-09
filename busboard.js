const prompt = require("prompt-sync")();
const fetch = require("node-fetch");

let requestedBusStopID = prompt("Input a bus stop ID to check the predicted arrivals for: ");
if (requestedBusStopID.length === 0)
    requestedBusStopID = "490008660N";

const fetchBusArrivals = async () => {
    try {
        const busArrivalsResponse = await fetch("https://api.tfl.gov.uk/StopPoint/"+requestedBusStopID+"/Arrivals");
        const busArrivalsJSON = await busArrivalsResponse.json();
        outputNextBusses(busArrivalsJSON);
    } catch (error) {
        console.error(error);
    } finally {
        console.log("Complete");
    }
}

fetchBusArrivals();

function outputNextBusses(parsedBodyObjects) {
    let chronologicalPredictedArrivalObjects = parsedBodyObjects.sort( (a,b) => {return a.timeToStation-b.timeToStation; });
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