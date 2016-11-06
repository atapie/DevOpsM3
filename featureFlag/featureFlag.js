var redis = require('redis')
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var app = express()

var client = redis.createClient(6379, 'redis', {})

app.get('/', function (req, res) {
  res.send('This is a Feature Flag for set');
});

var featureFlag = "featureFlag";
app.get('/feature', function(req, res) {
	client.lpop(featureFlag, function(err, reply) {
		if ( reply == "true") {
			client.lpush(featureFlag, false)
			res.send("Feature for set disabled !")
		}
		else {
			client.lpush(featureFlag, true)
			res.send("Feature for set enabled !")
		}
	})
})

var server = app.listen(3000,"127.0.0.1", function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('FeatureFlag.js listening at http://%s:%s', host, port);
  
  client.del(featureFlag)
  client.lpush(featureFlag, true)

  // client.llen('featureFlag', function(err, res) {
  // 	console.log("Length: "+ res)
  // })

});