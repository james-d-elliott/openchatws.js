"use strict";

//Libs
var WebSocketServer = require('ws').Server;
var MongoClient = require('mongodb').MongoClient;
var bcrypt = require('bcrypt');


//Permission Flags
var WRITE_DELETE = 1;
var VIEW_DELETE = 2;
var WRITE_BAN = 4;
var VIEW_BAN = 8;
var WRITE_UNBAN = 16;
var VIEW_UNBAN = 32;
var WRITE_PERM = 64;
var VIEW_PERM = 128;

var VIEW_IP = 536870912;
var IS_MOD = 1073741824;
var IS_ADMIN = 2147483648;


//Config
var accounts = require('./accounts');
var wss = new WebSocketServer({ port: 8081 });
var db = 'mongodb://localhost:27017/chat';


//Functions
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};

wss.msg = function msg(now, ws, message) {
  wss.clients.forEach(function each(client) {
    if (client.user_flags & VIEW_IP) {
      client.send("msgb:" + now + ":" + ws.user + ":" + ws._socket._handle.fd + ":" + ws.upgradeReq.connection.remoteAddress + ":" + message);
    }
    else {
      client.send("msgb:" + now + ":" + ws.user + ":" + ws._socket._handle.fd + "::" + message);
    }
  });
};

function html_safe_entities(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

//Event Listeners
wss.on('connection', function connection(ws) {

  //Connection Setup
  ws.user = null;
  ws.session = null;
  ws.flags_perm = 0;
  ws.flags_user = 0;
  ws.user_flags = 0;

  wss.broadcast("c:" + wss._server._connections);
  ws.send("users:" + wss.clients.map(function(item){return item.user}).filter(function(n){return n != undefined}).join(';'));

  ws.on('close', function close() {
    wss.broadcast("useroff:" + ws.user);
    ws.user = null;
    wss.broadcast("c:" + wss._server._connections);
  });

  ws.on('message', function incoming(message) {
    var args = message.split(":");

    switch (args[0]) {
      case "msg":
        if (ws.user) {
          var msg = html_safe_entities(args.slice(1).join(":"));
          
          MongoClient.connect(db, function(err, dba) {
            var now = new Date() / 1000 * 1000;
            dba.collection('chatlog').insert({user: ws.user, time: now, message: msg, ip: ws.upgradeReq.connection.remoteAddress});
            wss.msg(now, ws, msg);
            //wss.broadcast("msgb:" + now + ":" + ws.user + ":" + msg);
            dba.close();
          });
        }
        break;

      case "logout":
        wss.broadcast("useroff:" + ws.user);
        ws.user = null;
        ws.send("unauth:Logout");
        break;

      case "login":
        if (args[1] in accounts) {
          bcrypt.compare(args[2], accounts[args[1]].password, function(err, res) {
            if (res) {
              ws.user = args[1];
              ws.send("auth:" + ws.user);
              wss.broadcast("useron:" + ws.user);
              MongoClient.connect(db, function(err, dba) {
                var cursor = dba.collection('chatlog').find();
                if (ws.flags_perm & VIEW_IP) {
                  cursor.each(function(err, doc) {
                    if (doc != null) {
                      ws.send("msgb:" + doc.time + ":" + doc.user + "::" + doc.ip + ":" + doc.message);
                    }
                  });
                }
                else {
                  cursor.each(function(err, doc) {
                    if (doc != null) {
                      ws.send("msgb:" + doc.time + ":" + doc.user + ":::" + doc.message);
                    }
                  });
                }
              });
            }
            else {
              ws.send("unauth:Bad User or Password");
            }
          });
        }
        else {
          ws.send("unauth:User doesn't exist");
        }
        break;
    }
  });
});
