import {HttpServer} from './HTTPServer.js';
import io from 'socket.io';
import {PlayerList} from './playerList.js';
import {World} from "./world";
import {UpdateLoop} from "./updateLoop";

export class SocketServer {
    static app;
    static start() {
        console.log("Starting Socket Server on port: " + HttpServer.port);
        //we attatch our socket server to our webserver so it can listen to requests from files served via the webserver.
        this.app = io(HttpServer.server);
        //listen for a socket that will be created by a client that connects to the webserver.
        //we refer to a client on the server as a server "socket" from now on.
        this.app.on('connect',(socket) => {
            console.log("[CONNECTION] New Client: " + socket.id);
            /*LISTENERS*/
            //recieve data on the player, save a server sided version of the player.
            socket.on('playerData',(data) => {
                console.log(data);
                //set the player data properly.
                PlayerList.add(socket.id, data.username, data.playerClass);
                console.log("[EVENT] Added Player of username: " + data.username);
                //let the socket know a player has been added.
                socket.emit('playerAdded');
            });
            //the following listener is involved in syncing the game clocks.
            socket.on('syncClocks',(clientInitTime) => {
                let payload = {
                    currentTime: new Date().getTime(),
                    serverTime: UpdateLoop.serverTime
                };
                socket.emit('serverTime',payload);
            });
            //the following listeners are involved in getting assets for the game.
            socket.on('requestMap',() => {
                socket.emit('map',World.getMap(),World.changes);
            });
            socket.on('requestPlayers',() => {
                socket.emit('players','');
            });
            socket.on('playerKeys', (payload) => {
                //console.log(keyCode);
                PlayerList.players[socket.id].handleKeyPressAndMove(payload.keys, payload.timestamp, payload.dt);
            });
            socket.on('disconnect',() => {
                PlayerList.remove(socket.id);
                this.app.sockets.emit('disconnectEvent',socket.id);
            });
            socket.on('worldChange', (payload) => {
                if (World.map.staticEntities[payload.row][payload.col] != null) {
                    World.map.staticEntities[payload.row][payload.col].health = payload.data.health;
                    if (payload.data.exists === false) {
                        World.map.staticEntities[payload.row][payload.col] = null;
                    }
                    if (payload.data.broadcast) {
                        socket.broadcast.emit('worldChange',payload);
                    }
                    World.changes[payload.row+' '+payload.col] = payload;
                    if (payload.data.health >= 100)  {
                        delete World.changes[payload.row+' '+payload.col];
                    }
                }
            });
        });
    }
}
