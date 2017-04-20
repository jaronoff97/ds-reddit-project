var express = require('express');
var app = express();
// Imports the Google Cloud client library
const BigQuery = require('@google-cloud/bigquery');

// Your Google Cloud Platform project ID
const projectId = 'redditcollaborativefiltering';

// Instantiates a client
const bigquery = BigQuery({
  projectId: projectId
});
var query = 'SELECT * FROM [fh-bigquery:reddit_comments.2017_02] where author="ThatGuyWhoSucksAtLOL" LIMIT 10';

bigquery.createQueryStream(query)
  .on('error', console.error)
  .on('data', function(row) {
    console.log(row);
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
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


