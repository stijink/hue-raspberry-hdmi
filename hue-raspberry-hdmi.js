var exec   = require('child_process').exec;
var HueApi = require("node-hue-api").HueApi;

var enanleLogging = true;

var HdmiOffCmd  = '/opt/vc/bin/tvservice -o';
var HdmiOnCmd   = '/opt/vc/bin/tvservice -p && chvt 1 && chvt 7';
var HdmiTimeout = 6000 * 5; // 5 Minutes
var HdmiTimeoutId = null;

var HueHostname = process.env.HUE_HOST;
var HueUsername = process.env.HUE_USER;
var HueLightId  = process.env.HUE_LIGHT_ID;

if (HueHostname.length == 0) {
  console.log('HUE_HOST not configured as environment variable');
  process.exit();
}

if (HueUsername.length == 0) {
  console.log('HUE_USER not configured as environment variable');
  process.exit();
}

var api = new HueApi(HueHostname, HueUsername);

console.log('Checking for Light Id #' + HueLightId);
console.log('HDMI Port will be turned off after ' + Math.floor(HdmiTimeout / 6000) + ' Minutes');

// Check for the Status of the Light every second
setInterval(turnHdmiOnIfLightIsOn, 1000);

function turnHdmiOnIfLightIsOn() {
  console.log('Check if the Hue Light Id #' + HueLightId + ' is turned on ...');
  api.lightStatus(HueLightId).then(turnHdmiOn).done();
}

function turnHdmiOff() {
  console.log('HDMI Port turned off');
  exec(HdmiOffCmd, function(error, stdout, stderr) {});
}

function turnHdmiOn()
{
  console.log('HDMI Port turned on');
  exec(HdmiOnCmd, function(error, stdout, stderr) {});

  // Turn off the HDMI Port after the time given in "HdmiTimeout"
  HdmiTimeoutId = setTimeout(turnHdmiOff, HdmiTimeout);
}
