const lambda = require("./index");
var express = require('express');
const utils = require('./utils')


async function main() {
  console.log("hello")
  const browser= await utils.GetBrowser()
  
  // const test=async () => {
  //   await new Promise(r => setTimeout(r, 5555));
  //   browser.disconnect();
  // }
  // test()

  serve(5000)
}



function serve(port=5000){
  var app = express();
  app.get('/_healthz', function (req, res) {
    res.send('1');
  });
  app.get('/screenshot', function (req, res) {
    console.log(req.query)
  
    lambda.handler(
        {queryStringParameters: req.query}, 
        null,
        async function (something, callback){
            // console.log("callback.body.length: ", callback.body.length)
            if (callback.isBase64Encoded) {
                callback.body = Buffer.from(callback.body, 'base64')
            }
            res.status(callback.statusCode).header(callback.headers).send(callback.body)
        }
    )
  });
  app.listen(port, function () {
    console.log('listening on : ',port);
  });
}



main()