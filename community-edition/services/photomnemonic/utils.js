const dns = require("dns").promises;
const { BlockList } = require("net");

const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");


//////////////////////////////////////////////////
// url utils
//////////////////////////////////////////////////

async function urlAllowed(urlStr) {
  let url;
  try {
    url = new URL(urlStr);
  } catch (e) {
    return false;
  }

  const { hostname, protocol } = url;

  const allowedProtocols = ["http:", "https:"];
  if (!allowedProtocols.includes(protocol.toLowerCase())) {
    return false;
  }

  let ip;
  try {
    // Note we are only allowing IPv4 for now. IPv6 will require additional work.
    ip = (await dns.lookup(hostname, { family: 4 })).address;
  } catch (e) {
    return false;
  }

  if (!ip) return false;

  const blockList = new BlockList();
  blockList.addSubnet("0.0.0.0", 8);
  blockList.addSubnet("10.0.0.0", 8);
  blockList.addSubnet("127.0.0.0", 8);
  blockList.addSubnet("169.254.0.0", 16);
  blockList.addSubnet("172.16.0.0", 12);
  blockList.addSubnet("192.168.0.0", 16);

  return !blockList.check(ip);
}

//////////////////////////////////////////////////
// browser utils
//////////////////////////////////////////////////

let _browser=null
async function MakeBrowser(){
  const launch_browser=async()=>{
    t0 = new Date().getTime()
    console.log("MakeBrowser -- launching")
    _browser = null
    _browser = await puppeteer.launch({
      args: chromium.args.concat([
        "--remote-debugging-port=9222",
        "--window-size=1280x720",
        "--hide-scrollbars",
        "--single-process"
      ]),
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    console.log("MakeBrowser -- ready, took: ", new Date().getTime()-t0, "ms")
  }
  await launch_browser()
  _browser.on('disconnected', async () => {
    console.log("recovering!!!")
    if(_browser) await _browser.close();
    if (_browser.process() != null) _browser.process().kill('SIGINT');
    await launch_browser()
  });
}

async function WaitBrowser(){
  while (!_browser){
    console.log("GetBrowser -- waiting for browser, current: ", _browser)
    await new Promise(r => setTimeout(r, 100));
  }
  return
}

async function GetBrowser(){
  if (!_browser){
    await MakeBrowser()
    await WaitBrowser()
  }
  console.log("browser version: ", await _browser.version())
  return _browser
}

async function CloseBrowser(){
  _browser.removeAllListeners('disconnected')
  if(_browser) await _browser.close();
  if (_browser.process() != null) _browser.process().kill('SIGINT');
}

module.exports = { urlAllowed, MakeBrowser, WaitBrowser, GetBrowser,CloseBrowser };

//////////////////////////////////////////////////
// misc.
//////////////////////////////////////////////////

console.log = (function() {
  var console_log = console.log;
  var timeStart = new Date().getTime();
  
  return function() {
    var delta = new Date().getTime() - timeStart;
    var args = [];
    args.push((delta / 1000).toFixed(2) + ':');
    for(var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    console_log.apply(console, args);
  };
})();
