
var exec = require('child_process').exec;
var wake = require('wake-event');
var os = require('os');
var http = require('http');

var command;
switch(os.platform()) {
  case "win32": 
    command = "rundll32.exe powrprof.dll,SetSuspendState 0,1,0";
    break;
  case "darwin":
    command = "pmset sleepnow";
    break;
  default:
    console.error("Operating system not supported. "+
      "Please send a pull request to http://github.com/jpillora/sleep-server");
    process.exit(1);
}

var pkg = require('./package.json');
var program = require('commander');

program
  .version(pkg.version)
  .option('-p, --port <port>', 'Port to run server on (default: 57339)', 57339)
  .option('-H, --host <host>', 'Interface to run server on (default: 0.0.0.0)', '0.0.0.0')
  .option('-u, --url <url>', 'URL to trigger sleep (default: sleep)', 'sleep')
  .option('-d, --delay <ms>', 'Delay in milliseconds (default: 1000)', 1000)
  .parse(process.argv);

//add a slash
if(program.url.charAt(0) !== '/')
  program.url = '/'+program.url;

var msgId = 1;

http.createServer(function (request,response) {
  if(request.url.indexOf(program.url) !== 0)
    return response.end();

  console.log("#%s:\n  Sleeping in %sms\n  Time: %s\n  IP address: %s",
              msgId++, program.delay, new Date(), request.connection.remoteAddress);

  setTimeout(function() {
    exec(command);
  }, program.delay);
  response.end('ok');
}).listen(program.port, function() {
  console.log('Listening for sleep requests at http://%s:%s%s', program.host, program.port, program.url);
});

wake(function() {
  console.log("#%s:\n  Woke\n  Time: %s", msgId++, new Date());
});

