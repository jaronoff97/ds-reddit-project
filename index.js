var express = require('express');
var app = express();
var redis = require('redis');
const nconf = require('nconf');
nconf.argv().env().file('keys.json');
console.log(nconf.get("HOME"))
const client = redis.createClient(
  nconf.get('redisPort') || '6379',
  nconf.get('redisHost') || '127.0.0.1',
  {
    'auth_pass': nconf.get('redisKey'),
    'return_buffers': true
  }
).on('error', (err) => console.error('ERR:REDIS:', err));
const projectId = 'redditcollaborativefiltering';

require('@google-cloud/debug-agent').start({ 
  allowExpressions: true,
  projectId: projectId,});
// Imports the Google Cloud client library
const BigQuery = require('@google-cloud/bigquery');


// Instantiates a client
const bigquery = BigQuery({
  projectId: projectId
}); 
var query = 'SELECT * FROM [fh-bigquery:reddit_comments.2017_02] where author="ThatGuyWhoSucksAtLOL" LIMIT 10';

bigquery.createQueryStream(query)
  .on('error', console.error)
  .on('data', function(row) {
    //console.log(row);
  })
  .on('end', function() {
    // All rows retrieved.
  });

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

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


