const https = require("follow-redirects").https;
const prompt = require("prompt-sync")();

let requestedBusStopID = prompt("Input a bus stop ID to check the predicted arrivals for: ");
if (requestedBusStopID.length === 0)
    requestedBusStopID = "490008660N";
let arrivalRequestOptions = {
    'method': 'GET',
    'hostname': 'api.tfl.gov.uk',
    'path': '/StopPoint/'+requestedBusStopID+'/Arrivals',
    'headers': {
        'Cookie': '_cfuvid=8MTN5OkBQJr4.7p6MZvtAefJgJApXh9RfB.3TO228GU-1752052231634-0.0.1.1-604800000'
    },
    'maxRedirects': 20
};

let busArrivalsRequest = https.request(arrivalRequestOptions, function (receivedResponse) {
    let chunks = [];

    receivedResponse.on("data", function (chunk) {
        chunks.push(chunk);
    });

    receivedResponse.on("end", function (chunk) {
        let responseBody = Buffer.concat(chunks);
        let parsedBodyObjects = JSON.parse(responseBody.toString());
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
    });

    receivedResponse.on("error", function (error) {
        console.error(error);
    });
});

busArrivalsRequest.end();