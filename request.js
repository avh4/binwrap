var http = require("http");
var https = require("https");
var parseUrl = require("url").parse;

// Inspired by https://github.com/maxogden/request-stream

module.exports = function request(url, opts, onSuccess, onError) {
  var parsed = parseUrl(url);

  var finalOpts = Object.assign({
    host: parsed.hostname,
    path: parsed.path,
    port: parsed.port
  }, opts);

  var req =
    parsed.protocol === "https:"
      ? https.request(finalOpts)
      : http.request(finalOpts);

  req.on("response", onSuccess);
  req.on("error", onError);

  return req.end();
}

