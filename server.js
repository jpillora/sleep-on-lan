
var exec = require('child_process').exec;
// var exec = function(cmd, cb) {
//   _exec(cmd, function(err, stdout, stderr) {
//     console.log('ran %s\nerr %s\nstdout %s\nstderr %s', cmd, err, stdout, stderr);
//     cb(err, stdout, stderr)
//   });
// };

var os = require('os');
var http = require('http');
var util = require('util');
var fs = require('fs');

var mac = false;
var disableWOL = 'systemsetup -setwakeonnetworkaccess off';
var enableWOL = disableWOL.replace('off','on');

var sleep;
switch(os.platform()) {
  case "win32":
    sleep = "rundll32.exe powrprof.dll,SetSuspendState 0,1,0";
    break;
  case "darwin":
    mac = true;
    sleep = "pmset sleepnow";
    break;
  default:
    console.error("Operating system not supported. "+
      "Please send a pull request to http://github.com/jpillora/sleep-on-lan");
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
  .option('-d, --daemonize', 'Daemonize the sleep server', false)
  .option('-l, --log <file>', 'Sends output to a logfile')
  .option('-n, --no-periodic-wake', 'Prevents the system from waking every 2 hours for WOL compatibility (Mac OSX)')
  .parse(process.argv);

//Read more about -n here http://hints.macworld.com/article.php?story=20100401103451497
if(!program.periodicWake) {
  if(!mac) {
    console.log("The -n option may only be used on Mac OSX systems");
    process.exit(1);
  }

  exec("ps -p "+process.pid+" -o ruser=", function(err, stdout) {
    if(!/^root/.test(stdout)) {
      console.log("The -n option requires you to run as root");
      process.exit(1);
    }
  });
}



//daemonize?
if(program.daemonize && program.args.indexOf('is-daemon') === -1) {
  var path = program.daemonize;
  var spawn = require('child_process').spawn;
  
  var prog = process.argv[1];
  var args = process.argv.slice(2);
  args.push('is-daemon');

  var output = program.log ? fs.openSync(program.log, 'a') : 'ignore';

  var child = spawn(prog, args, {
    detached: true,
    stdio: [ 'ignore', output, output ]
  });
  child.unref();
  process.exit(1);
  return;
}

//open logfile
var logfile = program.log && fs.createWriteStream(program.log, {flags:'a'});
// fs.createWriteStream
function log() {
  var output = util.format.apply(null, arguments);
  if(logfile)
    logfile.write(output+'\n');
  else
    console.log(output);
}

//add a slash
if(program.url.charAt(0) !== '/')
  program.url = '/'+program.url;

var msgId = 1;
http.createServer(function (request, response) {
  if(request.url.indexOf(program.url) !== 0)
    return response.end('not-ok\n');
  log("#%s:\n  Sleeping in %sms\n  Time: %s\n  IP address: %s",
              msgId++, program.wait, new Date(), request.connection.remoteAddress);

  //enable wol *just before sleep*
  if(!program.periodicWake)
    setTimeout(function() {
      exec(enableWOL);
    }, program.wait-500);

  //sleep wait
  setTimeout(function() {
    exec(sleep);
  }, program.wait);

  response.end('ok\n');
}).listen(program.port, function() {

  var msg = '';
  if(!program.periodicWake)
    msg = '(Disabled periodic wake)';

  log('Listening at http://%s:%s%s %s', program.host, program.port, program.url, msg);
});

//if interval is late by more than 2secs, assume has just awoken
var checkInterval = 5000;
var threshold = 2000;
var lastTime = Date.now();
setInterval(function() {
  var currentTime = Date.now();
  if (currentTime > (lastTime + checkInterval + threshold)) {
    //past threshold!
    log("#%s:\n  Woke\n  Time: %s", msgId++, new Date());
    if(!program.periodicWake)
      exec(disableWOL);
  }
  lastTime = currentTime;
}, checkInterval);

