// npm install multipart path express ws
// https://gist.github.com/gildean/5778473                                                          great websocket example
// https://github.com/gildean/raspi-ledblinker
// http://stackoverflow.com/questions/18815734/how-to-call-java-program-from-nodejs                 calling command line programs
// http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options  calling command line programs
// http://stackoverflow.com/questions/5136353/node-js-https-secure-error#5140393                    https/wss
// https://github.com/rikiji/walrusdict/blob/master/service/service.js                              riccardo example for c/c++ usage
// http://stackoverflow.com/questions/10535007/how-to-integrate-websocket-with-emberjs              websockets with ember.js
// http://stackoverflow.com/questions/14609477/ember-js-html-5-websockets
// https://github.com/joyent/node/wiki/modules                                                      a comprehensive list about node.js frameworks

'use strict';
var express = require('express');
var util = require('util');
var app = express();
var WebSocketServer = require('ws').Server;
var connIds = [];
var server = require('http').createServer(app).listen(80);
 
app.use(express.static(__dirname + '/public'));
 
// set up the websocket server
var wss = new WebSocketServer( { server: server } );
wss.clientConnections = {};
 
//wss.on('connection', function (connection) {
//    var cid = connection.upgradeReq.headers['sec-websocket-key'];
//    this.clientConnections[cid] = setConnectionListeners(connection);
//    connection.id = cid;
//});

// websocket server eventlisteners and callbacks
wss.on('connection', function (connection) {
    console.log('wss.on.connection');
    var cid = connection.upgradeReq.headers['sec-websocket-key'];
    this.clientConnections[cid] = setConnectionListeners(connection);
    connection.id = cid;
    connIds.push(cid);
    // initiate the new client
    // FIXME read real values from /bin/relais-tool
    connection.send(JSON.stringify([1,0]));
    connection.send(JSON.stringify([2,1]));
})
.on('sendAll', function (message) {
    console.log("executing sendAll");
    var self = this;
    connIds.forEach(function (id) {
        console.log("sendAll: " + id);
        var conn = self.clientConnections[id];
        //if (conn.connected) {
            conn.send(message);
        //}
    });
});
 
function setConnectionListeners(connection) {
    connection.on('message', function (d) {
        var newArr = JSON.parse(d);
        //FIXME need to check arguments so that no code is executed!
        var state = newArr.pop();
        var relais = newArr.pop();
        var spawn = require('child_process').spawn;
        //FIXME check arguments, here it means arbitratry code 
        //FIXME check return value an act accordingly
        var child = spawn('/bin/relais-tool', [relais, state]);
        wss.emit('sendAll', d);
        //connection.send(d);
        console.log("received message: RELAIS=" + relais + ", changing to new STATE=" + state);
    })
    .on('error', function (error) {
        connection.close();
    })
    .on('close', function () {
        delete wss.clientConnections[connection.id];
        connIds = Object.keys(wss.clientConnections);
    });
    return connection;
}




