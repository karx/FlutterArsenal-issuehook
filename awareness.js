const GraphQLClient = require('graphql-request').GraphQLClient;
const config = require("./config.json");
const fs = require('fs');
const Store = require('data-store');
const store = new Store({ path: 'crawled_stats.json' });
const request = require("./await-request");

let headers = {
    'Authorization': 'token ' + config.github_token,
    'User-Agent': 'flutterArsenal-cli'
}
const client = new GraphQLClient(config.github_graph_url, {
    headers: headers
})
async function getNext10RepositoriesFromPointer(afterPointer = "Y3Vyc29yOjMw") {
    var dataToFetch =
        `query($queryString: String!,$afterPointer:String!){
            search(query:$queryString , type: REPOSITORY, first: 10, after: $afterPointer) {
              repositoryCount
              edges {
                node {
                  ... on Repository {
                    id
                    name
                    hasIssuesEnabled
                    homepageUrl
                    nameWithOwner
                    descriptionHTML
                    url
                    stargazers {
                      totalCount
                    }
                    forks {
                      totalCount
                    }
                    languages(first:5){
                      nodes{
                        name
                      }
                    }
                    updatedAt
                  }
                }
              }
              pageInfo{
                startCursor
                endCursor
                hasNextPage
                hasPreviousPage
              }
            }
          }`;
        
    var query_variables = `{
        "queryString":  "language:Dart stars:>50",
        "afterPointer": "${afterPointer}"
      }
    `;

    try {
        var data = await client.request(dataToFetch, query_variables);
        return data;

    } catch (error) {
        console.log(error);
        return null;
    }
}
async function getLastPointerFromLocalStore() {
    var value = store.get('last_pointer');
    console.log(`value from store = ${value}`);
    return value;
}
async function updateLocalStoreWithCrawlStatus(toStore) {
    store.set('last_pointer', toStore);
    console.log(`Storing to store = ${toStore}`);
}

async function next10() {
    store.load();
    var lastPointer = await getLastPointerFromLocalStore();
    var data = await getNext10RepositoriesFromPointer(lastPointer);
    await updateLocalStoreWithCrawlStatus(data.search.pageInfo.endCursor);
    // console.log(data);
    // console.log(data.search.edges[0]);
    // postIssueToGithub(data.search.edges[0].node);
    return data;
}

async function postIssueToGithub(nameWithOwner, name) {
    var headers = {
        'Authorization': 'token ' + config.github_token,
        "Accept": "application/vnd.github.symmetra-preview+json",
        'User-Agent': 'flutterArsenal-cli'
    };
    var params = {
        "title": `Add ${name} to Flutter Arsenal`,
        "body": `${name} can be added to FlutterArsenal to help with reach, accessibility and ease-of-use. [Flutter Arsenal](https://flutterarsenal.com) is a directory that is being curated for Flutter libraries and tool. The best way to do is by creating an issue on [github](https://github.com/flutterarsenal/FlutterArsenal/issues/new/choose).
        `
    };
    console.log(params);
    
    return await request({
        method: 'post',
        url: `https://api.github.com/repos/${nameWithOwner}/issues`,
        body: params,
        headers: headers,
        json: true
    });
}


function generateHTML(data) {
    console.log(data);
    if (!data || !data.search || !data.search.edges) {
        console.log('data seemed empty');
        return null;
    }
    var toShowHTML = '<ul>';
    data.search.edges.forEach((eachNode) => {
        var node = eachNode.node;
        toShowHTML += '<li>';
        toShowHTML += `<div class="name"> ${node.name} </div>`;
        toShowHTML += `<div class="hasIssueEnabled"> hasIssueEnabled:  ${node.hasIssuesEnabled} </div>`;
        toShowHTML += `<div class="homepageUrl"> <a href="${node.homepageUrl}"> ${node.homepageUrl} </a> </div>`;
        toShowHTML += `<div class="url"> <a href="${node.url}"> ${node.nameWithOwner} </a> </div>`;
        toShowHTML += `<div class="descriptionHTML"> ${node.descriptionHTML} </div>`;
        toShowHTML += `<div class="stars"> Stars: ${node.stargazers.totalCount} </div>`;
        toShowHTML += `<div class="forks"> Forks: ${node.forks.totalCount} </div>`;
        toShowHTML += `<div class="updatedAt"> lastUpdated: ${node.updatedAt} </div>`;
        toShowHTML += `<div class="button"> <a href="./awareness-post?name=${node.name}&nameWithOwner=${node.nameWithOwner}" target="_blank"> Submit Issue </a> </div>`;

        toShowHTML += '</li>';
    });
    toShowHTML += '</ul>';
    return toShowHTML;
}
// next10();

module.exports = {
    next10,
    postIssueToGithub,
    generateHTML
}

