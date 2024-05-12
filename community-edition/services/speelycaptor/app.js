const lambda = require("./index");
var express = require('express');

var app = express();

app.get('/_healthz', function (req, res) {
  res.send('1');
});


app.get('/init', function (req, res) {
    console.log(req.query)

    lambda.init(
        {queryStringParameters: req.query}, 
        null,
        async function (something, callback){
            console.log("callback: ", callback)
            res.status(callback.statusCode).header(callback.headers).send(callback.body)
        }
    )
  });

  app.get('/convert', function (req, res) {
    console.log(req.query)

    lambda.convert(
        {queryStringParameters: req.query}, 
        null,
        async function (something, callback){
            console.log("callback: ", callback)
            res.status(callback.statusCode).header(callback.headers).send(callback.body)
        }
    )
  });

  app.listen(5000, function () {
    console.log('listening on :5000');
  });