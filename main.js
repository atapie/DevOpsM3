var redis = require('redis');
var express = require('express');
var fs      = require('fs');
var os = require("os");
var exec = require('child_process').exec;

//Create function to get CPU information
function cpuAverage() {

  //Initialise sum of idle and time of cores and fetch CPU info
  var totalIdle = 0, totalTick = 0;
  var cpus = os.cpus();

  //Loop through CPU cores
  for(var i = 0, len = cpus.length; i < len; i++) {

    //Select CPU core
    var cpu = cpus[i];

    //Total up the time in the cores tick
    for(type in cpu.times) {
      totalTick += cpu.times[type];
   }     

    //Total up the idle time of the core
    totalIdle += cpu.times.idle;
  }

  //Return the average Idle and Tick times
  return {idle: totalIdle / cpus.length,  total: totalTick / cpus.length};
}

function memUsage(){
  return os.freemem()/1024/1024;
}


function sendEmail(cpuUs,memUs){
  var textBody = "";
  if(cpuUs > 80 ){
    textBody += "CPU overloaded, current CPU usage:" + cpuUs + "% \n";
  }
  if(memUs < 100 ){
    textBody += "Available memory is too low, current free memory:" + Math.round(memUs) + "MB \n"
  }
  if(textBody!=""){
    console.log("Sending the email");
    var cmdMail = 'echo "subject: Alert \n' + textBody +'"' +'| sendmail glingna@ncsu.edu';
    exec(cmdMail, {maxBuffer: 1024 * 5000}, function(error, stdout, stderr){
     if(error){
       console.log(error);
       console.log(stdout);
       console.log(stderr);
     }
    });
  }
}

//Grab first CPU Measure
var startMeasure = cpuAverage();
var config_mail = "sh /home/emailscript.sh"
exec(config_mail, {maxBuffer: 1024 * 5000}, function(error, stdout, stderr){
  console.log(error);
  console.log(stdout);
  console.log(stderr);
})
//Set delay for second Measure
setInterval(function() { 

  //Grab second Measure
  var endMeasure = cpuAverage(); 
  var freemem = memUsage();

  //Calculate the difference in idle and total time between the measures
  var idleDifference = endMeasure.idle - startMeasure.idle;
  var totalDifference = endMeasure.total - startMeasure.total;

  //Calculate the average percentage CPU usage
  var percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);
  sendEmail(percentageCPU,freemem);
  //Output result to console
  console.log(percentageCPU + "% CPU Usage.");
  console.log(Math.round(freemem) + "MB Free Memory.");
}, 10000);




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

