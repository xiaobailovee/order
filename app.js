var http = require('http');
var config = require('./config.js');
var router = require('./router.js');

http.createServer(function (request, response) {
    router(request,response);
}).listen(config.app.port, function () {
    console.log('http://127.0.0.1:' + config.app.port);
});