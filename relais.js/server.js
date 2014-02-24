/*
 *   server.js uses node.js bridge websocket based browsers to the relais state
 *   of the tinkerforge dual relais bricklets.
 *
 *   Copyright (C) 2014 Joachim Schiele
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU Affero General Public License as
 *   published by the Free Software Foundation, version 3 of the License.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU Affero General Public License for more details.
 *
 *   You should have received a copy of the GNU Affero General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


// https://gist.github.com/gildean/5778473                                                          great websocket example
// https://github.com/gildean/raspi-ledblinker
// http://stackoverflow.com/questions/18815734/how-to-call-java-program-from-nodejs                 calling command line programs
// http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options  calling command line programs
// https://github.com/rikiji/walrusdict/blob/master/service/service.js                              riccardo example for c/c++ usage
// https://github.com/joyent/node/wiki/modules                                                      a comprehensive list about node.js frameworks

// ljharb#node.js@irc.freenode.net
//var converted = vectors.map(function (value) { var int = parseInt(value); if (String(int) !== String(value)) { throw new TypeError(); } return int; });


'use strict';
var colors = require('colors');
var express = require('express');
var util = require('util');
var app = express();
var WebSocketServer = require('ws').Server;
var connIds = [];

var server = require('http').createServer(app).listen(80);

//User validation
app.use(express.basicAuth('admin', 'admin'));

app.use(express.static(__dirname + '/public'));
 
// set up the websocket server
var wss = new WebSocketServer( { server: server } );
wss.clientConnections = {};

// local state which is updated after server.js is started
// the relais-tool is a part of this project - relais.js
var relaisStates = [ 0, 0, 0, 0, 0, 0, 0, 0 ];
var relaisInputTimes = [ 0, 0, 0, 0, 0, 0, 0, 0 ];
var spawn = require('child_process').spawn;
var child = spawn('/bin/relais-tool');
child.stdout.on('data', function (data) {
  updateRelaisStates('' + data);
  var messagestring = 'initial update of relaisStates using /bin/relais-tool: \n'.blue + data;
  console.log(messagestring);
});


function toggle(key) {
  var oldstate=relaisStates[key];
  var newstate = 0;
  if (oldstate === 0)
    newstate = 1;

  changeState(key, newstate);

  //var messagestring = "server.js received keypad-tool message: RELAIS=" + key + ", changing to new STATE=" + newstate;
  //console.log(messagestring.magenta);
}

// tinkerforge multi touch bricklet - keypad 3x4
// the keypad-tool is a part of this project - relais.js
var spawn2 = require('child_process').spawn;
var child2 = spawn2('/bin/keypad-tool');
child2.stdout.on('data', function (data) {
  // if one clicks several buttons on the 3x4 keypad at once
  // keypad-tool writes to stdout so fast, that sometimes node.js gets
  // two JSON messages (or more) per stdin line.
  // therefore we have to split all incoming lines and process
  // each individually (or we end up with a JSON parser reporting
  // about invalid JSON
  var lines = ('' + data).split('\n');
  lines.forEach(function(line) {
    if (line !== "") {
      //console.log('JSON='.yellow + line);
      try {
        var obj = JSON.parse(line);
        var key = parseInt(obj.data); 
        if (!isNaN(key)) {
          //console.log("success: parsing JSON: " + key + "\n");
          var date = new Date();
          var delta = date.getTime() - relaisInputTimes[key];
          // debounce each key pad key with ~ 200-800 ms
          if (delta > 200) {
            switch(key) {
              case 0:
                toggle(0);
                break;
              case 3:
                toggle(1);
                break;
              case 6:
                toggle(4);
                break;
              case 9:
                toggle(5);
                break;
              case 1:
                toggle(2);
                break;
              case 4:
                toggle(3);
                break;
            }
          }
          relaisInputTimes[key] = date;
        }
      } catch(e){
        console.log("error: processing input from keypad-tool\n".red);
        return;
      }
    }
  });
});
child2.stderr.on('data', function (data) {
  console.log('/bin/keypad stderr: ' + data);
});


function updateRelaisStates(query) {
    //replay from relais-tool should look like this:
    // var query = '{"data": [ {"value" : "0"},{"value" : "1"},{"value" : "0"},{"value" : "1"},{"value" : "0"},{"value" : "1"},{"value" : "0"},{"value" : "1"} ]}';
    //console.log(query);
    var obj = JSON.parse(query);

    for ( var i = 0; i < obj.data.length; i++ )  {
        var s = (obj.data[i].value === "1") ? 1 : 0;
        relaisStates[i] = s;
        changeState(i, s);
    }
}

function changeState(relais, state) {
   //SECURITY: need to make sure arguments to the relais-tool ran as root are indeed integers
   if (isNaN(state) || isNaN(relais)) {
     var messagestring = "error -> state: " + state + ", and relais: " + relais + " -> NaN detected! ignoring request";
     console.log(messagestring.red);
   } else {
     // convert strings to int
     var s = (state == "0") ? 0 : 1;
     var r = parseInt(relais);

     if (s == 0 || s == 1 || r >= 0 || r < 8) {
          // updateRelaisStates(query) should not use /bin/relais-tool as the state was 'just' read from there....
          if (relaisStates[r] !== s) {
              relaisStates[r] = s;
              var spawn = require('child_process').spawn;
              //here i assume relais-tool just *works* ;-)
              var child = spawn('/bin/relais-tool', [relais, state]);
              var messagestring = "server.js received message: RELAIS=" + relais + ", changing to new STATE=" + state;
              console.log(messagestring.magenta);
          } 
          wss.emit('sendAll', JSON.stringify([r,s]));
     } else {
       var messagestring = "server.js: out of bounds request: state=" + state + ", relais=" + relais + "; ignoring this request";
       console.log(messagestring.red);
     }
  }
}
 
// websocket server eventlisteners and callbacks
wss.on('connection', function (connection) {
    var messagestring = 'wss.on.connection - new client ' + connection.upgradeReq.connection.remoteAddress;
    console.log(messagestring.yellow);

    var cid = connection.upgradeReq.headers['sec-websocket-key'];
    this.clientConnections[cid] = setConnectionListeners(connection);
    connection.id = cid;
    connIds.push(cid);

    // initialize the new client
    for (var i = 0; i < relaisStates.length; i++) {
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
        var state = parseInt(newArr.pop());
        var relais = parseInt(newArr.pop());
        changeState(relais, state);
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

// code below might be stupid or not working 100% as expected but i don't care... for me it works
// http://coenraets.org/blog/2012/10/creating-a-rest-api-using-node-js-express-and-mongodb/
// http://blog.modulus.io/nodejs-and-express-create-rest-api
// visit http://192.168.0.48/state
//    or http://192.168.0.48/state/1
// curl -i -X PUT -H 'Content-Type: application/json' -d '{"value": "1"}'  http://192.168.0.48/state/7
// curl -i -X PUT -H 'Content-Type: application/json' -d '{"value": "$(touch /tmp/foo)"}'  http://192.168.0.48/state/7
app.configure(function(){
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(app.router);
});

app.get('/state', function(req, res) {
    res.send(JSON.stringify(relaisStates));
});
app.get('/state/:id', function(req, res) {
    var id = parseInt(req.params.id)-1;
    res.type('text/plain');
    if (id >= 0 && id < 6) {
      res.send(JSON.stringify(relaisStates[id]));
      res.statusCode = 200;
    } else {
      res.send("request out of bounds, needs to be [1,6] but was: " + (id+1));
      res.statusCode = 404;
    }
});
app.put('/state/:id', function(req, res) {
    var id = parseInt(req.params.id)-1;
    var request = req.body;
    var state = parseInt(request.value);
    //console.log("/state/:id, request to change to state: " + state + " on relais: " + (id+1) + "; request was:\n" + JSON.stringify(req.body));

    res.type('text/plain');
    if (id >= 0 && id < 6) {
      res.statusCode = 200;
      res.send("state change requested for relais: " + (id+1) + " with new state=" + state + " received");
      changeState(id, state);
    } else {
      res.send("request out of bounds, needs to be [1,6] but was: " + (id+1));
      res.statusCode = 404;
    }
});



