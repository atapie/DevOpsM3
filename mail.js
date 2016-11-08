var exec = require('child_process').exec;
var express = require('express');
var app = express();

// Add hook to make it easier to get all visited URLS.
app.use(function(req, res, next)
{
	console.log(req.method, req.url);

	// ... INSERT HERE.

	next(); // Passing the request to the next handler in the stack.
});

app.get('/', function(req, res) {
	if(!req.query.text || !req.query.to) {
		res.end("OK");
		return;
	}
	var cmd = 'echo "'+req.query.text+'" | sendmail ' + req.query.to;
	console.log('Executing: ' + cmd);
	var child = exec(cmd, {maxBuffer: 1024 * 5000}, function(error, stdout, stderr)
	{
		console.log(stdout);
		res.end("OK");
	});
});

// HTTP SERVER
var server = app.listen(8082, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);
});
