var http = require("http");
var https = require("https");
var parseUrl = require("url").parse;

// Inspired by https://github.com/maxogden/request-stream

module.exports = function request(url, opts) {
  var parsed = parseUrl(url);

  var finalOpts = Object.assign({
    host: parsed.hostname,
    path: parsed.path,
    port: parsed.port
  }, opts);

  if (parsed.protocol === "https:") {
    return https.request(finalOpts);
  } else {
    return http.request(finalOpts);
  }
}

