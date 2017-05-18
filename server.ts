"use strict";

process.title = process.env.npm_package_name;


/*GLOBAL TODO:
	- Authenticaiton; Setup seperate Auth server that allows multiple database types (JSON, MySQL, Redis, etc)
	- Channels; Set the Communication server to use channels.
	- Channels; Setup a seperate Channel server that tells clients which Communicatoin server their requested Channel is on.
	- Modules; Make the Communication server use modules for code management.
	- Complete blank event handlers
	- Only support https
*/

//Libs
import * as ws from 'ws'
import * as uuid from 'node-uuid'
import * as bcrypt from 'bcrypt'
import * as fs from 'fs'
import * as events from 'events'
import * as https from 'https'
import * as http from 'http'
import {ObjectID, MongoClient, MongoError, Db} from 'mongodb'

//Local Modules used for Organization
import * as CONST from './constants'
import {IUser, IUserFlags, IAuth, IUnauth, IHide, IUnhide, ILogin, ILogout, IMessage, IMessageIncoming} from './interfaces'

//JSON Files / Static Configs
var accounts = require('./accounts');
var config = require('./config');
var channels = require('./channels');
var channel: string = 'example';
var globalOwners: string[] = ['james'];


//Class Overrides to add Attributes
class WebSocketServer extends ws.Server {
	clients: WebSocketClient[];
	event: events.EventEmitter;
	clientEvent: events.EventEmitter;
	constructor(options?: ws.IServerOptions | undefined, callback?: Function | undefined) {
		super(options, callback);
	}
}

class WebSocketClient extends ws {
	user: User;
	constructor(address: string, protocols?: string | string[] | undefined, options?: ws.IClientOptions | undefined) {
		super(address, protocols, options);
		this.user = new User();
	}
}

class User {
	id: number | undefined;
	name: string | undefined;
	display: string | undefined;
	session: string | undefined;
	auth: boolean;
	permissions: Permissions;
	flags: number;
	constructor() {
		this.id = undefined;
		this.name = undefined;
		this.display = undefined;
		this.session = undefined;
		this.auth = false;
		this.permissions = new Permissions();
		this.flags = 0;
	}
}

class Permissions {
	global: number;
	channel: number;
	constructor() {
		this.global = 0;
		this.channel = 0;
	}
	check(bit: number): boolean {
		if (this.channel & bit || this.global & bit) {
			return true; //Check both channel and global permission flags
		}
		else if (this.channel & CONST.IS_OWNER || this.global & CONST.IS_OWNER) {
			return true; //Owners have all permissions
		}
		else {
			return false;
		}
	}
}

//Globals
var wss: WebSocketServer;

/**********************
**  Global Functions **
**********************/

//Validates a bitmask has all the correct flags as defined by REQUIRED
function validBitmask(bitmask: number[]): boolean {
	for (var i = 0; i < bitmask.length; i++) {
		for (var r = 0; r < CONST.REQUIRED[bitmask[i]].length; r++) {
			if (bitmask.indexOf(CONST.REQUIRED[bitmask[i]][r]) < 0) {
				return false;
			}
		}
	}
	return true;
}

function messageString(string: string, object: any) {
	return JSON.stringify([string, object]);
}

function html_safe_entities(str: string): string {
	return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function bitmaskArray(bitmask: number): number[] {
	var binary = bitmask.toString(2);
	var bma = [];
	for (var i = binary.length - 1, p = 0; i > -1; i--, p++) {
		if (binary[i] == '1') {
			bma.push(Math.pow(2, p));
		}
	}
	return bma;
}

function broadcastLine(line: string, authOnly?: boolean | undefined, modOnly?: boolean | undefined, adminOnly?: boolean | undefined, ownerOnly?: boolean | undefined) {
		if (authOnly) {
			for (var i = 0; i < wss.clients.length; i++) {
				if (wss.clients[i].user.auth) {
					wss.clients[i].send(line);
				}
			}
		}
		else {
			for (var i = 0; i < wss.clients.length; i++) {
				wss.clients[i].send(line);
			}
		}
}

function broadcastObj(type: string, object: any, authOnly?: boolean | undefined, modOnly?: boolean | undefined, adminOnly?: boolean | undefined, ownerOnly?: boolean | undefined): void {
	broadcastLine(messageString(type, object), authOnly, modOnly, adminOnly, ownerOnly)
}

function broadcastItem(item: any, authOnly?: boolean | undefined, modOnly?: boolean | undefined, adminOnly?: boolean | undefined, ownerOnly?: boolean | undefined): void {
	broadcastLine(JSON.stringify(item), authOnly, modOnly, adminOnly, ownerOnly);
}

function broadcastOnline(): void {

}

function replyDeny(ws: WebSocketClient, code: number, message?: string | undefined): void {
	var deny = {code: code, message: ""};
	if (message) {
		deny.message = message;
	}
	ws.send(messageString('deny', deny))
}

function replyVersion(ws: WebSocketClient): void {

}

/**********************
**     Databases     **
**********************/
var server: any;

MongoClient.connect(config.database, function(err: MongoError, chatlog: Db) {
	if (err) {
		console.log(err);
		process.exit(1);
	}

	/**********************
	** WebSocket Server  **
	**********************/

	var dummyRequest = function(req: http.ServerRequest, res: http.ServerResponse) {
		res.writeHead(200);
		res.end('WebSocketServer\n');
	};

	if (config.ssl.enable) {
		server = https.createServer({
			key: fs.readFileSync(config.ssl.key),
			cert: fs.readFileSync(config.ssl.cert)
		}, dummyRequest).listen(config.websocket.port);
	}
	else {
		server = http.createServer(dummyRequest).listen(config.websocket.port);
	}
	wss = new WebSocketServer({server: server});
	wss.event = new events.EventEmitter();
	wss.clientEvent = new events.EventEmitter();


	/**********************
	**   Client Events   **
	**********************/

	//client event: get_log
	//category: user requests
	//descriptoin: handle attemps to get event log
	wss.clientEvent.on('get_log', function(ws: WebSocketClient, log: any): void {

	});

	//client event: get_warn
	//category: user requests
	//descriptoin: handle attemps to get warning log
	wss.clientEvent.on('get_warn', function(ws: WebSocketClient, warn: any): void {

	});
	
	//client event: get_users
	//category: user requests
	//descriptoin: handle attemps to get users list
	wss.clientEvent.on('get_users', function(ws: WebSocketClient, users: any): void {

	});

	//client event: get_filter
	//category: user requests
	//descriptoin: handle attemps to get filter settings
	wss.clientEvent.on('get_filter', function(ws: WebSocketClient, filter: any): void {

	});

	//client event: get_spam
	//category: user requests
	//descriptoin: handle attemps to get spam settings
	wss.clientEvent.on('get_spam', function(ws: WebSocketClient, spam: any): void {

	});

	//client event: get_moderation
	//category: user requests
	//descriptoin: handle attemps to get moderation settings
	wss.clientEvent.on('get_moderation', function(ws: WebSocketClient, moderation: any): void {

	});

	//client event: get_channel
	//category: user requests
	//descriptoin: handle attemps to get channel settings
	wss.clientEvent.on('get_channel', function(ws: WebSocketClient, filter: any): void {

	});

	//client event: get_ban
	//category: user requests
	//descriptoin: handle attemps to get singular ban
	wss.clientEvent.on('get_ban', function(ws: WebSocketClient, ban: any): void {

	});

	//client event: get_bans
	//category: user requests
	//descriptoin: handle attemps to get ban list
	wss.clientEvent.on('get_bans', function(ws: WebSocketClient, bans: any): void {

	});

	//client event: get_hide
	//category: user requests
	//descriptoin: handle attemps to get hide list
	wss.clientEvent.on('get_hide', function(ws: WebSocketClient, hide: any): void {

	});

	//client event: icon
	//category: user flags
	//descriptoin: handle attemps to change user icon
	wss.clientEvent.on('icon', function(ws: WebSocketClient, icon: any): void {

	});

	//client event: mask
	//category: user flags
	//descriptoin: handle attemps to change user mask
	wss.clientEvent.on('mask', function(ws: WebSocketClient, mask: any): void {

	});

	//client event: flag
	//category: user flags
	//descriptoin: handle attemps to set user flag state
	wss.clientEvent.on('flag', function(ws: WebSocketClient, flag: any): void {

	});

	//client event: bypass
	//category: user flags
	//descriptoin: handle attemps to set user bypass settings
	wss.clientEvent.on('bypass', function(ws: WebSocketClient, bypass: any): void {

	});

	//client event: permission
	//category: administration
	//descriptoin: handle attemps to change user permissions
	wss.clientEvent.on('permission', function(ws: WebSocketClient, permission: any): void {

	});

	//client event: channel
	//category: adminstration
	//descriptoin: handle attemps to change basic channel settings
	wss.clientEvent.on('channel', function(ws: WebSocketClient, channel: any): void {

	});

	//client event: moderation
	//category: adminstration
	//descriptoin: handle attemps to change auto moderation settings
	wss.clientEvent.on('moderation', function(ws: WebSocketClient, moderation: any): void {

	});

	//client event: filter
	//category: adminstration
	//descriptoin: handle attemps to change filter settings
	wss.clientEvent.on('filter', function(ws: WebSocketClient, filter: any): void {

	});

	//client event: spam
	//category: adminstration
	//descriptoin: handle attemps to change spam settings
	wss.clientEvent.on('spam', function(ws: WebSocketClient, spam: any): void {

	});

	//client event: ban
	//category: moderation
	//descriptoin: handle attemps to ban a user
	wss.clientEvent.on('ban', function(ws: WebSocketClient, ban: any): void {

	});

	//client event: unban
	//category: moderation
	//descriptoin: handle attemps to unban a user
	wss.clientEvent.on('unban', function(ws: WebSocketClient, unban: any): void {

	});

	//client event: hide
	//category: moderation
	//description: handles attempts to hide messages
	wss.clientEvent.on('hide', function(ws: WebSocketClient, hide: any): void {
		if (ws.user.permissions.channel & CONST.WRITE_HIDE) {
			chatlog.collection(channel).update({_id: {$in: hide.ids}}, {$set: {hidden: true}, $push: {history: {action: 'hide', date: new Date(), name: ws.user.name, reason: hide.reason}}}, {multi: true}, function(err: MongoError, object: any) {
				//TODO: send notification to clients
				console.log(err);
				console.log(object);
			});
		}
        else {
			replyDeny(ws, CONST.DENY_NO_PERMISSION);
        }
	});

	//client event: unhide
	//category: moderation
	//description: handles attempts to unhide messages
	wss.clientEvent.on('unhide', function(ws: WebSocketClient, data: any) {
		if (ws.user.permissions.check(CONST.UPDATE_HIDE)) {
			var unhide: IUnhide = {ids: [], name: ""};
			unhide.name = ws.user.name;
			for (var i = 0, len = data.ids.length; i < len; i++) {
				var id: number = data.ids[i]
				chatlog.collection(channel).update({_id: new ObjectID(id)}, {$set: {hidden: false}, $push: {action: 'unhide', date: new Date(), name: ws.user.name, reason: data.reason}}, function(err: MongoError, object: any) {
					if (!err) {
						unhide.ids.push(id);
					}
				});
			}
			if (unhide.ids.length > 0) {
				broadcastObj('unhide', unhide);
				//TODO: need to bcast unhidden messages too
			}
		}
        else {
            //ws.send('["deny",{"code":' + DENY_NO_PERMISSION +'}]');
			replyDeny(ws, CONST.DENY_NO_PERMISSION);
        }
	});

	//client event: login
	//category: authentication
	//description: handles a login attempt against the auth server
	wss.clientEvent.on('login', function(ws: WebSocketClient, login: ILogin) {
		var name = login.name.toLowerCase();
		var auth: IAuth = {name: undefined};
		var test = login.test;
		
		console.log('in login');
		if (!ws.user.auth && name in accounts && user.password) {
			bcrypt.compare(user.password, accounts[name].password, function(err: Error, valid: boolean) {
				var i = bcrypt.hashSync(user.password, 10);
				console.log(i);
				if (valid) {
					console.log('valid');
					ws.user.name = name;
					ws.user.display = user.name;
					ws.user.permissions.channel = accounts[name].flags.perm;
					ws.user.permissions.global = accounts[name].flags.user;
					ws.user.auth = true;
                    auth.name = ws.user.name;
					ws.send(messageString('auth', auth));
					broadcastOnline();
					var filter: any = {hidden: false, banned: false};
					if (ws.user.permissions.check(CONST.VIEW_HIDE)) {
						filter.hidden = undefined;
					}
					if (ws.user.permissions.check(CONST.VIEW_BAN)) {
						filter.banned = undefined;
					}
					if (ws.user.permissions.check(CONST.IP_VIEW)) {
						var cursor = chatlog.collection(channel).find(filter, {}).stream({});
					}
					else {
						var cursor = chatlog.collection(channel).find(filter, {ip: 0}).stream({});
					}
					cursor.on('data', function(message: any) {
						ws.send(messageString('message', message));
					});
				}
				else {
					//ws.send('["deny",{"code":' + DENY_USER_NOT_EXIST + '}]');
					console.log('bad un pw');
					replyDeny(ws, CONST.DENY_USER_NOT_EXIST);
				}
			});
		}
		else {
			//ws.send('["deny",{"code":' + DENY_USER_OR_PASS_WRONG + '}]');
			console.log('bad un');
			replyDeny(ws, CONST.DENY_USER_OR_PASS_WRONG);
		}
	});

	//client event: logout
	//category: authentication
	//description: handles attemps to logout from the auth server
	wss.clientEvent.on('logout', function(ws: WebSocketClient, logout: ILogout) {
		var unauth: IUnauth = {name: undefined};
		unauth.name = ws.user.name;
		ws.user.id = undefined;
		ws.user.name = undefined;
		ws.user.display = undefined;
		ws.user.auth = false;
		ws.user.permissions.channel = 0;
		ws.user.permissions.global = 0;
		ws.send(messageString('unauth', unauth));
	});

	wss.clientEvent.on('message', function(ws: WebSocketClient, message: IMessageIncoming) {
		var msg: IMessage = {name: ws.user.name, display: ws.user.display, date: new Date(), ip: ws.upgradeReq.connection.remoteAddress, text: html_safe_entities(message.text)};
		chatlog.collection(channel).insert(msg);
		var messageWithIP = messageString('message', msg);
		msg.ip = undefined;
		var messageNormal = messageString('message', msg);
		var client = undefined;
		
		//Sanitize message flags
		if (message.flags) {
			//if (message.flags & IS_MODER)
		}
		for (var i: number = 0; i < wss.clients.length; i++) {
			client = wss.clients[i];
			if (client.user.auth && (message.flags )) {
				client.send(client.user.permissions.check(CONST.IP_VIEW) ? messageWithIP : messageNormal);
			}
		}
	});

	wss.clientEvent.on('users', function(ws: WebSocketClient, users: any) {
	
	});

	//Event Listeners
	wss.on('connection', function connection(ws: WebSocketClient) {
		ws.user.session = uuid.v4();

		var version = {server: undefined, protocol: undefined};
		version.server = process.env.npm_package_version;
		version.protocol = process.env.npm_package_protocol;
		ws.send(messageString('version', version));
		broadcastOnline();

		ws.on('close', function close(code: number, message: string) {
			broadcastOnline();
		});

		ws.on('message', function message(data: any, flags: any) {
			console.log(data);
			try {
			  var event = JSON.parse(data);
			}
			catch(ex) {
			  try {
				console.log('exception in ws.on.message (JSON parse): ' + ex);
				ws.close();
			  }
			  catch(ex) {
				console.log('exception in ws.on.message (JSON parse) ws close: ' + ex);
				ws.terminate();
			  }
			}
			try {
				wss.clientEvent.emit(event[0], ws, event[1]);
			}
			catch(ex) {
				try {
					console.log('exception in ws.on.message (emit event): ' + ex);
					ws.close();
				}
				catch(ex) {
					console.log('exception in ws.on.message (emit event) ws close: ' + ex);
					ws.terminate();
				}
			}
		});
	});
});
