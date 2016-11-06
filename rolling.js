var exec = require('child_process').exec;
var http = require('http');
const PORT=8080;

function handleRequest(request, response)
{
        console.log("Request received");
        if (request.method == 'POST') {
                var body = '';

                request.on('data', function (data) {
                        body += data;
                });

                request.on('end', function () {
                        var post = JSON.parse(body);
                        var tag = post.push_data.tag;
                        var repo = post.repository.repo_name;
                        var image = repo + ':' + tag;
			                  var rc = 'm3';
			                  if(tag == 'canary') rc = 'm3-canary';
                        var cmd = 'kubectl rolling-update '+rc+' --image='+image+' --image-pull-policy=Always';
                        console.log('Executing: ' + cmd);
                        var child = exec(cmd, {maxBuffer: 1024 * 5000}, function(error, stdout, stderr)
                        {
                                console.log(stdout);
                        });

                        child.on('exit', function()
                        {
                            console.log('Done');
                            return true;
                        });
                });
                response.end('');
        } else {
                response.end('Deployment hook');
        }
}

var server = http.createServer(handleRequest);
server.listen(PORT, function() {
    console.log("Server listening on: http://localhost:%s", PORT);
});
