const request = require('request')


function getGithubURLRx(body) {
    var github_re = /(git|ssh|http(s)?)(:\/\/)(github\.com)\/([\w,-]+)\/([\w,-]+)/gm;
    var github_resultArray = github_re.exec(body);
    return github_resultArray;
}
function getWebURLRx(body) {
    var web_re = /(?<=link:).*?(?=[<!--,\n])/gm;
    var web_resultArray = web_re.exec(body);
    return web_resultArray;
}

function getTagRx(body) {
    var tag_re = /(?<=tag:).*?(?=[<!--,\n])/s;
    var tag_resultArray = tag_re.exec(body);
    return tag_resultArray;
}

function getExcerptRx(body) {
    var excerpt_re = /(?<=excerpt:).*?(?=[<!--,\n])/s;
    var excerpt_resultArray = excerpt_re.exec(body);
    return excerpt_resultArray;
}

function getEmailRx(body) {
    var email_re = /(?<=email-id:).*?(?=[<!--,\n])/s;
    var email_resultArray = email_re.exec(body);
    return email_resultArray;
}

function getTeaserRx(body) {
    var teaser_re = /(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:\/?#[\]@!\$&'\(\)\*\+,;=.]+(?:png|jpg|jpeg|gif|svg)+/s;
    var teaser_resultArray = teaser_re.exec(body);
    return teaser_resultArray;
}


function getDateRx(body) {
    var date_re = /(?<=date:).*?(?=[<!--,\n])/s;
    var date_resultArray = date_re.exec(body);
    return date_resultArray;
}

function getLocationRx(body) {
    var location_re = /(?<=location:).*?(?=[<!--,\n])/s;
    var location_resultArray = location_re.exec(body);
    return location_resultArray;
}



function getTitleRx(title) {
    var title_re = /(?<=\[Request\]).*/gm;
    var title_resultArray = title_re.exec(title);
    return title_resultArray;
}

module.exports = async (value) =>
    new Promise((resolve, reject) => {
        request(value, (error, response, data) => {
            if (error) reject(error)
            else resolve(data)
        })
    })