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
  var textBody = " ";
  if(cpuUs > 80 ){
    textBody += "CPU overloaded, current CPU usage:" + cpuUs + "% \n";
  }
  if(memUs < 100 ){
    textBody += "Available memory is too low, current free memory:" + Math.round(memUs) + "MB \n"
  }
  if(textBody!=""){
    var cmdMail = 'echo "alert" | sendmail glingna@ncsu.edu';
    exec(cmdMail, {maxBuffer: 1024 * 5000}, function(error, stdout, stderr){
	if(error){
	   console.log(error);
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
