var WebSocketServer = require('ws').Server;
var MongoClient = require('mongodb').MongoClient;
var bcrypt = require('bcrypt');

var accounts = require('./accounts');

var wss = new WebSocketServer({ port: 8081 });
var db = 'mongodb://localhost:27017/chat';

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};

wss.on('connection', function connection(ws) {
  ws.user = null;
  wss.broadcast("c:" + wss._server._connections);
  ws.on('close', function close() {
    wss.broadcast("useroff:" + ws.user);
    ws.user = null;
    wss.broadcast("c:" + wss._server._connections);
  });
  ws.send("users:" + wss.clients.map(function(item){return item.user}).filter(function(n){return n != undefined}).join(','));
  ws.on('message', function incoming(message) {
    
    console.log('received: %s', message);
    var args = message.split(":");

    switch (args[0]) {
      case "msg":
        if (ws.user) {
          var msg = args.slice(1).join(":");
          MongoClient.connect(db, function(err, dba) {
            var now = new Date() / 1000 * 1000;
            dba.collection('chatlog').insert({user: ws.user, time: now, message: msg});
            wss.broadcast("msgb:" + now + ":" + ws.user + ":" + msg);
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
                cursor.each(function(err, doc) {
                  if (doc != null) {
                    ws.send("msgb:" + doc.time + ":" + doc.user + ":" + doc.message);
                  }
                });
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
