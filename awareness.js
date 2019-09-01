const GraphQLClient = require('graphql-request').GraphQLClient;
const config = require("./config.json");
const fs = require('fs');
const Store = require('data-store');
const store = new Store({ path: 'crawled_stats.json' });

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
    console.log(data);
    return data;
}

next10();
