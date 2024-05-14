const test = require("ava");
const { urlAllowed } = require("./url-utils");

test("should disallow invalid and internal urls", async t => {
  t.false(await urlAllowed("invalid url"));
  t.false(await urlAllowed("http://0.0.0.0"));
  t.false(await urlAllowed("http://127.0.0.1"));
  t.false(await urlAllowed("http://127.0.0.2"));
  t.false(await urlAllowed("https://127-0-0-1.sslip.io"));
  t.false(await urlAllowed("http://192.168.1.1.sslip.io"));
  t.false(await urlAllowed("http://169.254.169.254.sslip.io/test"));
  t.false(await urlAllowed("file:///foo/bar"));
});

test("should allow valid and external urls", async t => {
  t.true(await urlAllowed("http://example.com"));
  t.true(await urlAllowed("https://example.com"));
  t.true(await urlAllowed("http://example.com:8900"));
  t.true(await urlAllowed("http://example.com:80"));
});
