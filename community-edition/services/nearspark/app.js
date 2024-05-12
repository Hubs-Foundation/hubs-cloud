const lambda = require("./index");
const express = require("express");

const app = express();

// app.get('/_healthz', function (req, res) {
//   res.send('1');
// });

app.get("/thumbnail/:b64url", function(req, res) {
  console.log("req.url",req.url);

  lambda.handler(
    {
      queryStringParameters: req.query,
      pathParameters: {
        url: req.url.replace("/thumbnail/", "")
      }
    },
    null,
    async function(something, callback) {
      console.log("callback: ", callback.statusCode, callback.headers);

      res
        .status(callback.statusCode)
        .header(callback.headers)
        .send(Buffer.from(callback.body, 'base64'))
    }
  );
});
// app.get("/thumbnail", function(req, res) {
//   console.log("req.url",req.url);

//   lambda.handler(
//     {
//       queryStringParameters: req.query,
//       pathParameters: {
//         url: req.url.replace("/thumbnail", "")
//       }
//     },
//     null,
//     async function(something, callback) {
//       console.log("callback: ", callback.statusCode, callback.headers);
//       res
//         .status(callback.statusCode)
//         .header(callback.headers)
//         .send(callback.body)
//     }
//   );
// });
app.listen(5000, function() {
  console.log("listening on :5000");
});
