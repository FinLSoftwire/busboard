var https = require('follow-redirects').https;

var options = {
    'method': 'GET',
    'hostname': 'api.tfl.gov.uk',
    'path': '/StopPoint/490008660N/Arrivals',
    'headers': {
        'Cookie': '_cfuvid=8MTN5OkBQJr4.7p6MZvtAefJgJApXh9RfB.3TO228GU-1752052231634-0.0.1.1-604800000'
    },
    'maxRedirects': 20
};

var req = https.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
        chunks.push(chunk);
    });

    res.on("end", function (chunk) {
        var body = Buffer.concat(chunks);
        var parsedObjects = JSON.parse(body.toString());
        for(var predictedArrivalObject in parsedObjects) {
            console.log(predictedArrivalObject);
        }
    });

    res.on("error", function (error) {
        console.error(error);
    });
});

req.end();