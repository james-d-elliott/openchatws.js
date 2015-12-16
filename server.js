"use strict";

//Libs
var WebSocketServer = require('ws').Server;
var MongoClient = require('mongodb').MongoClient;
var bcrypt = require('bcrypt');
var fs = require('fs');
var uuid = require('node-uuid');
var EventEmitter = require('events').EventEmitter;

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


//JSON Files
var accounts = require('./accounts');
var config = require('./config');

var wss = null;
var server = null;
var http = null;

//Connect To DB
MongoClient.connect(config.database, function(err, chatlog) {

	//Setup Websocket Server
	var dummyRequest = function(req, res) {
        res.writeHead(200);
        res.end("WebSocketServer\n");
    };

	if (config.ssl.enable) {
		http = require('https');
		server = http.createServer({
			key: fs.readFileSync(config.ssl.key),
			cert: fs.readFileSync(config.ssl.cert)
		}, dummyRequest).listen(config.websocket.port);
	}
	else {
		http = require('http');
		server = http.createServer(dummyRequest).listen(config.websocket.port);
	}
	wss = new WebSocketServer({server: server});
    wss.msg = new EventEmitter();


	//Server Functions

	//description: broadcasts a generic Message; authOnly true will only send to connections that are logged in.
	wss.bcast = function bcast(data, authOnly) {
        var message = JSON.stringify(data);
		if (authOnly) {
			wss.clients.forEach(function each(client) {
				if (client.user.name) {
					client.send(message);
				}
			});
		}
		else {
			wss.clients.forEach(function each(client) {
				client.send(message);
			});
		}
	};

	//description: broadcasts a user entered message
	wss.bcastMsg = function bcastMsg(ws, msg, authOnly) {
        msg.date = new Date();
        var msgip = JSON.stringify(['message', msg]);
        msg.ip = undefined;
        msg = JSON.stringify(['message', msg]);
		if (authOnly) {
			wss.clients.forEach(function each(client) {
				if (client.user.name) {
					client.send(ws.user.flags.perm & VIEW_IP ? msgip : msg);
				}
			});
		}
		else {
			wss.clients.forEach(function each(client) {
				client.send(ws.user.flags.perm & VIEW_IP ? msgip : msg);
			});
		}
    };

    //description: parses html entities that could be used for exploits
    wss.html_safe_entities = function html_safe_entities(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };

    //Client to Server Message Events
    wss.msg.on('login', function(ws, user) {
        var name = user.name.toLowerCase();
        if (name in accounts && user.password) {
            bcrypt.compare(user.password, accounts[name].password, function(err, valid) {
                if (valid) {
                    ws.user.name = name;
                    ws.user.display = user.name;
                    ws.send(JSON.stringify(['auth', {name: ws.user.name}]));
                    if (ws.user.flags.perm & VIEW_IP) {
                        var cursor = chatlog.collection('example').find({}, {});
                    }
                    else {
                        var cursor = chatlog.collection('example').find({}, {ip: 0});
                    }
                    cursor.each(function(err, document) {
                        ws.send(JSON.stringify(['message', document]));
                    });
                }
                else {
                    ws.send('["deny",{"code":1}]'); //deny reason is name or password wrong
                }
            });
        }
        else {
            ws.send('["deny",{"code":2}]'); //deny reason is name not existing
        }
    });
    
    wss.msg.on('logout', function(ws, data) {
        ws.send(JSON.stringify(['unauth', {name: ws.user.name}]));
        ws.user.name = undefined;
        ws.user.display = undefined;
    });
    
    wss.msg.on('message', function(ws, message) {
        var msg = {name: ws.user.name, display: ws.user.display, date: new Date(), ip: ws.upgradeReq.connection.remoteAddress, text: wss.html_safe_entities(message.text)};
        chatlog.collection('example').insert(msg);
        wss.bcastMsg(ws, msg, true);
        
    });

    
    //Event Listeners
    wss.on('connection', function connection(ws) {

        ws.user = {name: undefined, display: undefined, flags: {perm: 0, user: 0}, session: uuid.v4()};
   
        //Refactor this for users who request the list.
        //ws.send("users:" + wss.clients.map(function(item){return item.user.name}).filter(function(n){return n != undefined}).join(';'));
        ws.send('["protocol",{"version":1}]');
        wss.bcast(['online', {count: wss._server._connections}]);

        ws.on('close', function close(code, message) {
            wss.bcast(['online', {count: wss._server._connections}]);
        });
        ws.on('message', function message(data, flags) {
            try {
              var event = JSON.parse(data);
              wss.msg.emit(event[0], ws, event[1]);
            }
            catch(e) {
              try {
                ws.close();
              }
              catch(e) {
                ws.terminate();
              }
            }
        });
    });
});
