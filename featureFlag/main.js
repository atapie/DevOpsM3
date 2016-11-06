var redis = require('redis');
var express = require('express');
var fs      = require('fs');

var app = express();

// REDIS
var client = redis.createClient(6379, 'redis', {});

// Add hook to make it easier to get all visited URLS.
app.use(function(req, res, next)
{
	console.log(req.method, req.url);

	// ... INSERT HERE.

	next(); // Passing the request to the next handler in the stack.
});

var recentKey = "recentKey";
app.get('/get', function(req, res) {
  client.get(recentKey, function(err,value) { 
    res.send(value)
  });
})


var featureFlag = "featureFlag";
app.get('/set', function(req, res) {
  client.lrange(featureFlag, 0, 0, function(err, reply) {
    if (reply == "true") {
      client.set(recentKey, 'this message will self-destruct in 10 seconds');
      client.expire(recentKey, 10);
      res.send('key will expire in 10 seconds!')
    }
    else {
      res.send('Feature flag has been toggled, you cannot set a key !')
    }
  })
  
})

app.get('/recent', function(req, res) {
  client.lrange('recent', 0, 99, function(err, value) {
    res.send('<p>' + value.join('</p><p>') + '</p>');
  });
});

var currImg = 0;
app.get('/meow', function(req, res) {
	var imgs = ["hairypotter.jpg", "i-scream.jpg", "morning.jpg"];
	var value = imgs[currImg];
	currImg = (currImg + 1) % 3;

	fs.readFile(args[1]+'/img/'+value, function (err, data) {
			if (err) throw err;
			var img = new Buffer(data).toString('base64');
			res.writeHead(200, {'content-type':'text/html'});
			res.write("<h1/>\n<img src='data:my_pic.jpg;base64,"+img+"'/>");
			res.end();
	});

	client.lpush('recent', '/meow');
	client.ltrim('recent', 0, 99);
});

app.get('/', function(req, res) {
	res.send("This is the stable version... updated");
});

// HTTP SERVER
var args = process.argv.slice(2);
var PORT = args[0];
var server = app.listen(PORT, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);
});

