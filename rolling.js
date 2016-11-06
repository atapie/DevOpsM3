var http = require('http');
const PORT=8080;

function handleRequest(request, response) {
    var res = 'Deploying: ' + request.url;
    console.log(res);
    response.end(res);
}

var server = http.createServer(handleRequest);
var exec = require('child_process').exec;

server.listen(PORT, function() {
    console.log("Server listening on: http://localhost:%s", PORT);
});

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
                        console.log(post);
                        var branch = post.ref.split("/")[2];
                        var cmd = 'kubectl rolling-update m3 --image=atapie/devopsm3:stable --image-pull-policy=Always';
                        var child = exec(cmd, {maxBuffer: 1024 * 5000}, function(error, stdout, stderr)
                        {
                                console.log(stdout);
                        });

                        child.on('exit', function()
                        {
                            console.log('deployed');
                            return true;
                        });

                });
                response.end('');
        } else {
                response.end('Deployment hook');
        }
}
