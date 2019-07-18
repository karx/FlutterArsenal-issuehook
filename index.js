const request = require("./await-request");
// const grequest = require("./await-request");
const GraphQLClient = require('graphql-request').GraphQLClient;
const config = require("./config.json");
const fs = require('fs');
const moment = require('moment');
const http = require('http');
var slugify = require('slugify')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const handlers = require('./issue-handler');
const {
    checkNewIssueIsProjectRequest,
    checkNewIssueIsEventRequest,
    checkNewIssueIsApproved,
    parseIssueAndProcessProjectRequest,
    parseIssueAndProcessEventRequest,
    parseIssueAndCommit,
    parseEventAndCommit,
} = handlers;

const FLUTTER_ARSENAL_GITHUB_PATH = "flutterarsenal/FlutterArsenal";

let headers = {
    'Authorization': 'token ' + config.github_token,
    'User-Agent': 'flutterArsenal-cli'
}
//  console.log(JSON.parse(dataToFetch));
github_graph_url = "https://api.github.com/graphql";

const client = new GraphQLClient(github_graph_url, {
    headers: headers
})


// Tell express to use the body-parser middleware and to not parse extended bodies
app.use(bodyParser.urlencoded({ extended: false }))

// Route that receives a POST request to /sms
app.post('/issueNew', function (req, res) {
    const payload = req.body.payload
    const payloadJson = JSON.parse(payload);
    //   console.log(req);
    console.log(JSON.parse(payload)["action"]);
    if (payloadJson.action === "opened" || payloadJson.action === "edited") {
        if (checkNewIssueIsProjectRequest(payloadJson)) {
            console.log("This is an issue to trigger project addition");
            parseIssueAndProcessProjectRequest(payloadJson);
        } else if (checkNewIssueIsEventRequest(payloadJson)){
            console.log("Seems like a event issue");
            parseIssueAndProcessEventRequest(payloadJson);
        }
    } else if (payloadJson.action === "labeled") {
        if (checkNewIssueIsProjectRequest(payloadJson) && checkNewIssueIsApproved(payloadJson)) {
            console.log("This is going to merge now ");
            parseIssueAndCommit(payloadJson);
        } else if (checkNewIssueIsEventRequest(payloadJson) && checkNewIssueIsApproved(payloadJson)) {
            console.log('adding additional event');
            parseEventAndCommit(payloadJson);
        }
    }
    res.set('Content-Type', 'text/plain')
    res.send(`You sent: ${payload} to Express`)
})

// Tell our app to listen on port 3000
app.listen(3148, function (err) {
    if (err) {
        throw err
    }
    console.log('Server started on port 3148')
})

