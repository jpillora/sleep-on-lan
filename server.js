
var exec = require('child_process').exec;
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
  .option('-w, --wait <ms>', 'Wait in milliseconds before sleeping (default: 3000)', 3000)
  .option('-d, --daemonize', 'Daemonize the sleep server and send output to a file (default: log.txt)', 'log.txt')
  .parse(process.argv);

//daemonize?
if(program.daemonize && program.args.indexOf('is-daemon') === -1) {
  var path = program.daemonize;
  var fs = require('fs');
  var spawn = require('child_process').spawn;
  var log = fs.openSync(path, 'a');

  var prog = process.argv[1];
  var args = process.argv.slice(2);
  args.push('is-daemon');

  var child = spawn(prog, args, {
    detached: true,
    stdio: [ 'ignore', log, log ]
  });
  child.unref();
  process.exit(1);
  return;
}

//add a slash
if(program.url.charAt(0) !== '/')
  program.url = '/'+program.url;

var msgId = 1;
http.createServer(function (request,response) {
  if(request.url.indexOf(program.url) !== 0)
    return response.end('not-ok');
  console.log("#%s:\n  Sleeping in %sms\n  Time: %s\n  IP address: %s",
              msgId++, program.wait, new Date(), request.connection.remoteAddress);
  setTimeout(function() {
    exec(command);
  }, program.wait);
  response.end('ok');
}).listen(program.port, function() {
  console.log('Listening for sleep requests at http://%s:%s%s', program.host, program.port, program.url);
});

//if interval is late by more than 2secs, assume has just awoken
var checkInterval = 5000;
var threshold = 2000;
var lastTime = Date.now();
setInterval(function() {
  var currentTime = Date.now();
  if (currentTime > (lastTime + checkInterval + threshold))
    console.log("#%s:\n  Woke\n  Time: %s", msgId++, new Date());
  lastTime = currentTime;
}, checkInterval);

