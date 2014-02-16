// npm install express ws colors

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
var colors = require('colors');
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

// local state which is updated after server.js is started
var relaisStates = [ '0','0','0','0','0','0','0','0' ];
var spawn = require('child_process').spawn;
var child = spawn('/bin/relais-tool');
child.stdout.on('data', function (data) {
  updateRelaisStates('' + data);
  var messagestring = 'initial update of relaisStates using /bin/relais-tool: \n'.blue + data;
  console.log(messagestring);
});

function updateRelaisStates(query) {
    //var query = '{"data": [ {"value" : "0"},{"value" : "1"},{"value" : "0"},{"value" : "1"},{"value" : "0"},{"value" : "1"},{"value" : "0"},{"value" : "1"} ]}';
    //console.log(query);
    var obj = JSON.parse(query);
    for ( var i = 0; i < obj.data.length; i++ )  {
        var state = obj.data[i].value;
        relaisStates[i] = state;
        wss.emit('sendAll', JSON.stringify([i,state]));
        //console.log(obj.data[i].value);
    }
}
 
// websocket server eventlisteners and callbacks
wss.on('connection', function (connection) {
    var messagestring = 'wss.on.connection - new client connected';
    console.log(messagestring.yellow);
    var cid = connection.upgradeReq.headers['sec-websocket-key'];
    this.clientConnections[cid] = setConnectionListeners(connection);
    connection.id = cid;
    connIds.push(cid);

    // initialize the new client
    for ( var i = 0; i < relaisStates.length; i++) {
      var s = relaisStates[i];
      //console.log("relaiseStates[" + i + "] = " + s);
      connection.send(JSON.stringify([i,s]));
    }
})
.on('sendAll', function (message) {
    if (connIds.length > 0) {
      console.log("sending state-change to clients:".green);
      var self = this;
      connIds.forEach(function (id) {
          var messagestring = "   sendAll: " + id;
          console.log(messagestring.green);
          var conn = self.clientConnections[id];
          conn.send(message);
      });
    }
});
 
function setConnectionListeners(connection) {
    connection.on('message', function (d) {
        var newArr = JSON.parse(d);
        //need to make sure arguments to the relais-tool ran as root are indeed integers
        var state = parseInt(newArr.pop());
        var relais = parseInt(newArr.pop());
        if (state == 0 || state == 1 || relais >= 0 || relais < 8) {
          var spawn = require('child_process').spawn;
          //here i assume relais-tool just *works* ;-)
          var child = spawn('/bin/relais-tool', [relais, state]);
          var messagestring = "server.js received message: RELAIS=" + relais + ", changing to new STATE=" + state;
          relaisStates[relais] = state;
          console.log(messagestring.magenta);
          wss.emit('sendAll', d);
        } else {
          var messagestring = "server.js: out of bounds request: state=" + state + ", relais=" + relais + "; ignoring this request";
          console.log(messagestring.red);
        }
    })
    .on('error', function (error) {
        connection.close();
    })
    .on('close', function () {
        var messagestring = 'closing: ' + connection.id;
        console.log(messagestring.yellow);
        delete wss.clientConnections[connection.id];
        connIds = Object.keys(wss.clientConnections);
    });
    return connection;
}

// http://coenraets.org/blog/2012/10/creating-a-rest-api-using-node-js-express-and-mongodb/
// http://blog.modulus.io/nodejs-and-express-create-rest-api
// visit http://192.168.0.48/state
//    or http://192.168.0.48/state/1
// curl -i -X PUT -H 'Content-Type: application/json' -d '{"value": "1"}'  http://192.168.0.48/state/7
app.configure(function(){
  app.use(express.bodyParser());
  app.use(app.router);
});
app.get('/state', function(req, res) {
    res.send(JSON.stringify(relaisStates));
});
app.get('/state/:id', function(req, res) {
    var id = parseInt(req.params.id)-1;
    if (id >= 0 && id < 8) 
      res.send(JSON.stringify(relaisStates[id]));
    else
      res.send("request out of bounds, needs to be [1,8] but was: " + id);
});
app.put('/state/:id', function(req, res) {
    var id = parseInt(req.params.id)-1;
    var request = req.body;
    var state = parseInt(request.value);
    //console.log("/state/:id, request to change to state: " + state + " on relais: " + (id+1) + "; request was:\n" + JSON.stringify(req.body));
  
    //FIXME does not trigger the relais yet, need to refactor the code first

    if (id >= 0 && id < 8) {
          relaisStates[id] = state;
          var d = JSON.stringify([id,state]);
          wss.emit('sendAll', d);
          res.send("state change requested for relais: " + (id+1) + " with new state=" + state);
    } else
      res.send("request out of bounds, needs to be [1,8] but was: " + id + "\n");
});



