var express = require('express'),
    app = module.exports.app = exports.app = express(),
    path = require('path'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    port = process.env.PORT || 3000,
    urlEncodedParser = bodyParser.urlencoded({ extended: true, type: function() { return true; } });

//Config server
app.use(urlEncodedParser);
app.use(bodyParser.json());
app.use(require('connect-livereload')());
app.use(express.static(path.join(__dirname, 'dist'), { setHeaders: function (res) {
    //Set Cross-Domain Ajax Requests
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}}));

app.listen(port);

console.info('Server started http://localhost:' + port);
console.info('LiveReload started on port 35729');

module.exports = app;