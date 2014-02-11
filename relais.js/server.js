// npm install multipart path express ws
// https://gist.github.com/gildean/5778473                                                          great websocket example
// https://github.com/gildean/raspi-ledblinker
// http://stackoverflow.com/questions/18815734/how-to-call-java-program-from-nodejs                 calling command line programs
// http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options  calling command line programs
// http://stackoverflow.com/questions/5136353/node-js-https-secure-error#5140393                    https/wss
// https://github.com/rikiji/walrusdict/blob/master/service/service.js                              riccardo example for c/c++ usage
// http://stackoverflow.com/questions/10535007/how-to-integrate-websocket-with-emberjs              websockets with ember.js
// http://stackoverflow.com/questions/14609477/ember-js-html-5-websockets

'use strict';
var express = require('express');
var util = require('util');
var app = express();
var WebSocketServer = require('ws').Server;
var server = require('http').createServer(app).listen(8000);
 
app.use(express.static(__dirname + '/public'));
 
// set up the websocket server
var wss = new WebSocketServer( { server: server } );
wss.clientConnections = {};
 
wss.on('connection', function (connection) {
    var cid = connection.upgradeReq.headers['sec-websocket-key'];
    this.clientConnections[cid] = setConnectionListeners(connection);
    connection.id = cid;
});
 
// a function to set websocket connection eventlisteners and callbacks
function setConnectionListeners(connection) {
    connection.on('message', function (d) {
        var newArr = JSON.parse(d);
        var d2 = newArr.pop();
        var d1 = newArr.pop();
        var spawn = require('child_process').spawn;
        var child = spawn('/bin/relais-tool', [d1, d2]);
        //connection.send(relais, state);
    })
    .on('error', function (error) {
        connection.close();
    })
    .on('close', function () {
        delete wss.clientConnections[connection.id];
    });
    return connection;
}
