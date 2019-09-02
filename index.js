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

const awareness = require('./awareness');
const {
    next10,
    postIssueToGithub,
    generateHTML
} = awareness; 

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
});

app.get('/awareness-list', async function(request, response) {
    response.set('Content-Type', 'application/json');
    response.send(await next10());
});

app.get('/awareness-list-html', async function(request, response) {
    response.set('Content-Type', 'text/html');
    response.send(generateHTML(await next10()));
});
app.get('/awareness-post', async function(request, response) {
    console.log(request.body);
    console.log(request.params);
    console.log(request.query);
    if(request.query.name && request.query.nameWithOwner) {
        response.send(await postIssueToGithub(request.query.nameWithOwner, request.query.name));
    } else {
        response.send("name or repository with owner name invalid. Please contanct kaaro if you feel something is wrong");
    }
    
});

// Tell our app to listen on port 3000
app.listen(3148, function (err) {
    if (err) {
        throw err
    }
    console.log('Server started on port 3148')
})
