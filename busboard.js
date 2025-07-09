const prompt = require("prompt-sync")();
const fetch = require("node-fetch");

const outputBusStopArrivals = async (busStopID) => {
    try {
        const busArrivalsResponse = await fetch("https://api.tfl.gov.uk/StopPoint/"+busStopID+"/Arrivals");
        const busArrivalsJSON = await busArrivalsResponse.json();
        if (busArrivalsResponse.status >= 300) {
            console.log("Bus stop with ID " + busStopID + " does not exist.");
        } else {
            outputPredictedArrivalsFromJSON(busArrivalsJSON);
        }
    } catch (error) {
        console.error(error);
    }
}

const fetchPostcodeLongitudeLatitude = async(postCode) => {
    try {
        const postCodeResponse = await fetch("https://api.postcodes.io/postcodes/"+postCode);
        const receivedPostCodeJSON = await postCodeResponse.json();
        if (receivedPostCodeJSON.status >= 300) {
            console.log("Post code not found");
            return null;
        } else {
            return [receivedPostCodeJSON.result.longitude, receivedPostCodeJSON.result.latitude];
        }
    } catch (error) {
        console.error(error);
    }
}

const fetchBusStopsByLongitudeLatitude = async(longitude, latitude) => {
    try {
        let nearbyStopResponse = await fetch("https://api.tfl.gov.uk/StopPoint/?lat="+latitude+"&lon="+longitude+"&stopTypes=NaptanPublicBusCoachTram&radius=200");
        let nearbyStopJSON = await nearbyStopResponse.json();
        if (nearbyStopJSON.status >= 300) {
            console.log("Post code not found");
            return null;
        } else {
            if (nearbyStopJSON.stopPoints.length < 2)
                console.log("Only found " + nearbyStopJSON.stopPoints.length + " stops within 200 metres.");
            return nearbyStopJSON.stopPoints;
        }
    } catch (e) {
        console.error(e);
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

let requestedBusStopPostCode = prompt("Input a postcode: ");
if (requestedBusStopPostCode.length === 0)
    requestedBusStopPostCode = "NW51TL";
fetchPostcodeLongitudeLatitude(requestedBusStopPostCode).then(
    postcodeLongitudeLatitude => fetchBusStopsByLongitudeLatitude(...postcodeLongitudeLatitude).then(
        nearbyStops => {
            for (let stopIndex = 0; stopIndex < Math.min(2, nearbyStops.length); stopIndex++) {
                outputBusStopArrivals(nearbyStops[stopIndex].id);
            }
        }
    )
);