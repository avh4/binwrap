var http = require("http");
var https = require("https");
var parseUrl = require("url").parse;

// Inspired by https://github.com/maxogden/request-stream

module.exports = function request(url, opts, callback) {
  var parsed = parseUrl(url);

  return requestHelp(
    parsed.protocol,
    Object.assign({
      host: parsed.hostname,
      path: parsed.path,
      port: parsed.port
    }, opts),
    (callback || function() {})
  );
}

function requestHelp(protocol, opts, callback) {
  var req =
    protocol === "https:"
      ? https.request(opts)
      : http.request(opts);

  req.on("response", function(response) {
    // Check for redirects
    var redirectPath = response.headers['location'];

    if (typeof redirectPath === 'string' && response.statusCode >= 300 && response.statusCode < 400) {
      if (opts.maxRedirects === 0) {
          return callback(new Error("Exceeded maxRedirects"), response);
      } else {
        var redirectsRemaining = (opts.maxRedirects || 10) - 1;
        var newOpts = {path: redirectPath, maxRedirects: redirectsRemaining};

        return requestHelp(
          protocol,
          Object.assign({}, opts, newOpts),
          callback
        );
      }
    } else {
      return callback(null, response);
    }
  });

  req.on("error", function(error) {
    callback(error, null);
  });

  req.end();
}

