var express = require('express');
var app = express();
var redis = require('redis');
const nconf = require('nconf');
nconf.argv().env().file('keys.json');

const client = redis.createClient(
    nconf.get('redisPort') || '6379',
    nconf.get('redisHost') || '127.0.0.1', {
        'auth_pass': nconf.get('redisKey'),
        'return_buffers': true
    }
).on('error', (err) => console.error('ERR:REDIS:', err));
const projectId = 'redditcollaborativefiltering';

require('@google-cloud/debug-agent').start({
    allowExpressions: true,
    projectId: projectId,
});
// Imports the Google Cloud client library
const BigQuery = require('@google-cloud/bigquery');


// Instantiates a client
const bigquery = BigQuery({
    projectId: projectId
});
var query = 'SELECT * FROM [fh-bigquery:reddit_comments.2017_02] where author="ThatGuyWhoSucksAtLOL" LIMIT 10';
// SELECT subreddit, count(subreddit) as count
// FROM [fh-bigquery:reddit_comments.all] 
// where author="ThatGuyWhoSucksAtLOL" GROUP by subreddit ORDER BY count DESC;

// SELECT subreddit, count(subreddit) as count
// FROM [redditcollaborativefiltering:aggregate_comments.reddit_posts_all]
// where author="ThatGuyWhoSucksAtLOL" GROUP by subreddit ORDER BY count DESC;

// SELECT subreddit, COUNT(subreddit) as cnt
// FROM [fh-bigquery:reddit_comments.all],
//   [redditcollaborativefiltering:aggregate_comments.reddit_posts_all]
// WHERE author = 'ThatGuyWhoSucksAtLOL'
// GROUP BY subreddit 
// ORDER BY cnt DESC

// SELECT author, count(subreddit) as count
// FROM [fh-bigquery:reddit_comments.all] WHERE subreddit="swift" and author NOT LIKE "[deleted]"
// GROUP by author ORDER BY count DESC LIMIT 10;

// function getTopCommentedSubredditQuery(username) {
//     return `
//                 SELECT subreddit, COUNT(subreddit) as cnt
//                 FROM [fh-bigquery:reddit_comments.all],
//                   [redditcollaborativefiltering:aggregate_comments.reddit_posts_all]
//                 WHERE author = "${username}"
//                 GROUP BY subreddit 
//                 ORDER BY cnt DESC
//                 LIMIT 10
//                 `
// }
// function getTopCommentorsForSubredditQuery(subreddit) {
//   return `
//           SELECT author, count(subreddit) as count
//           FROM [fh-bigquery:reddit_comments.all] WHERE subreddit="${subreddit}" and author NOT LIKE "[deleted]"
//           GROUP by author ORDER BY count DESC LIMIT 10;`
// }

// function getTopCommentedSubreddit(username, callback) {
//   bigquery.createQueryStream(getTopCommentedSubredditQuery(username))
//     .on('error', console.error)
//     .on('data', function(row) {
//         console.log(row);
//         client.rpush(username, JSON.stringify(row));
//         callback(row);
//     })
//     .on('end', function() {
//         // All rows retrieved.
//     });    
// }

// function getTopCommentorsForSubreddit(subreddit) {
//   bigquery.createQueryStream(getTopCommentorsForSubredditQuery(subreddit))
//     .on('error', console.error)
//     .on('data', function(row) {
//           console.log(`Beginning new getTopCommentedSubreddit(${row.author})`)
//           getTopCommentedSubreddit(row.author, function(row){});
//     })
//     .on('end', function() {
//         // All rows retrieved.
//     });  
// }

// function getAllData(username){
//   getTopCommentedSubreddit(username, function(row){
//         console.log(`Beginning new getTopCommentorsForSubreddit(${row.subreddit})`)
//         getTopCommentorsForSubreddit(row.subreddit)
//   })
// }
// getAllData("ThatGuyWhoSucksAtLOL")


app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
    console.log(request.params)
    response.render('pages/index', {
        input: request.params
    });
});

app.get('/runQuery', function(request, response) {
    return bigquery.startQuery(request.query.query).then(function(data) {
        var job = data[0];
        var apiResponse = data[1];

        return job.getQueryResults();
    });
})

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
