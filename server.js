"use strict";

process.title = process.env.npm_package_name;

//Libs
var WebSocketServer = require('ws').Server;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var bcrypt = require('bcrypt');
var fs = require('fs');
var uuid = require('node-uuid');
var EventEmitter = require('events').EventEmitter;

//Permission Flags
var WRITE_HIDE = 1; //Can hide Messages
var UPDATE_HIDE = 2; //Can unhide Messages
var VIEW_HIDE = 4; //Can See hidden Messages
var VIEW_HIDEINFO = 8; //Can See hidden Message Details
var WRITE_BAN = 16;  //Can Ban Users
var UPDATE_BAN = 32; //Can Modify Bans
var VIEW_BAN = 64; //Can View Banned Users
var VIEW_BANNED = 128; //Can View Bannned User Messages (i.e. messages that are sent by users who are currently banned will now show)
var WRITE_UNBAN = 256; //Can Unban Users
var VIEW_UNBAN = 512; //Can View Unban Info
var WRITE_PERM = 1024; //Can Edit Permissions Flags
var VIEW_PERM = 2048; //Can View Permissions Flags
var WRITE_USER = 4096; //Can Edit Users Flags
var VIEW_USER = 8192; //Can View Users Flags

var VIEW_IP = 536870912;
var IS_MOD = 1073741824;
var IS_ADMIN = 2147483648;


//JSON Files
var accounts = require('./accounts');
var config = require('./config');


//Globals
var wss = null;
var server = null;
var http = null;


//Connect To Chat DB
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
                    try {
					   client.send(message);
                    }
                    catch(e) {
                        console.log(e);
                    }
				}
			});
		}
		else {
			wss.clients.forEach(function each(client) {
                try {
                   client.send(message);
                }
                catch(e) {
                    console.log(e);
                }
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
                    ws.user.flags.perm = accounts[name].flags.perm;
                    ws.user.flags.user = accounts[name].flags.user;
                    ws.send(JSON.stringify(['auth', {name: ws.user.name}]));
                    var filter = {};
                    if (!ws.user.flags.perm & VIEW_HIDE) {
                        filter.hidden = false;
                    }
                    if (!ws.user.flags.perm & VIEW_BANNED) {
                        filter.banned = false;
                    }
                    if (ws.user.flags.perm & VIEW_IP) {
                        var cursor = chatlog.collection('example').find(filter, {}).stream({});
                    }
                    else {
                        var cursor = chatlog.collection('example').find(filter, {ip: 0}).stream({});
                    }
                    cursor.on('data', function(message) {
                        ws.send(JSON.stringify(['message', message]));
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

    wss.msg.on('hide', function(ws, data) {
        if (ws.user.flags.perm & WRITE_HIDE) {
            chatlog.collection('example').update({_id: {$in: data.ids}}, {$set: {hidden: true}, $push: {history: {action: 'hide', date: new Date(), name: ws.user.name, reason: data.reason}}}, {multi: true}, function(err, object) {
                console.log(err);
                console.log(object);
            });
        }
    });

    wss.msg.on('unhide', function(ws, data) {
        if (ws.user.flags.perm & UPDATE_HIDE) {
            var ids = [];
            for (var i = 0, len = data.ids.length; i < len; i++) {
                id = data.ids[i]
                chatlog.collection('example').update({_id: ObjectId(id)}, {$set: {hidden: false}, $push: {action: 'unhide', date: new Date(), name: ws.user.name, reason: data.reason}}, function(err, object) {
                    if (!err) {
                        ids.push(id);
                    }
                });
            }
            if (ids.length > 0) {
                wss.bcast(['unhide', {ids: ids, name: ws.user.name}]);
                //need to bcast unhidden messages too
            }
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
        ws.send('["version",{"server":"' + process.env.npm_package_version + '","protocol":' + process.env.npm_package_protocol + '}]');
        wss.bcast(['online', {count: wss._server._connections, users: wss.clients.map(function(item){return item.user.name}).filter(function(n){return n != undefined})}]);

        ws.on('close', function close(code, message) {
            wss.bcast(['online', {count: wss._server._connections, users: wss.clients.map(function(item){return item.user.name}).filter(function(n){return n != undefined})}]);
        });
        ws.on('message', function message(data, flags) {
            try {
              var event = JSON.parse(data);
              wss.msg.emit(event[0], ws, event[1]);
            }
            catch(e) {
              try {
                console.log(e);
                ws.close();
              }
              catch(e) {
                ws.terminate();
              }
            }
        });
    });
});
