import io from 'socket.io-client';
import {Initializer} from "./index";
import {Renderer} from "./renderer";
import {GameLoop} from "./gameLoop";
import * as timesyncClient from 'timesync'
import {World} from "./world";
export class ServerLink {
    static socket;
    static ts;
    static create(menu) {
        //first we sync the time on the client with the time on the server.
        this.ts = timesyncClient.create({
            server: '/timesync',
            interval: 10000
        });
        this.ts.on('change', function (offset) {
            //console.log('changed offset: ' + offset + ' ms');
        });
        /*The following code initializes the menu, which will be responsible for the title screen on the client.*/
        this.menu = menu;
        //create a socket on our socket server
        this.socket = io();
        //connect our socket, then send data for the player. 
        this.socket.on('connect', () => {
            //this.menu.loadStatus.innerHTML = 'Creating Player';
            let payload = {
                username: this.menu.userName,
                playerClass : 'KNIGHT'
            };
            this.socket.emit('playerData',payload);
            //we need to sync the clocks.
            this.socket.emit('syncClocks',(new Date(this.ts.now()).getTime()));
        });
        this.socket.on('serverTime',(times) => {
            GameLoop.saveSyncTimes(times);
        });
        //when a player has been added to the server, fetch the map. 
        this.socket.on('playerAdded', () => {
            this.menu.loadStatus.innerHTML = 'Fetching Map';
            //we request the server for the map seed and size. 
            this.socket.emit('requestMap');
        });
        this.socket.on('map', (data, changes) => {
            this.menu.loadStatus.innerHTML = 'Loading Map';
            //load the world with the initializer. 
            Initializer.initWorld(data);
            this.menu.loadStatus.innerHTML = 'Loading Entities';
            this.socket.emit('requestPlayers');
            console.log(changes);
            for (let payload in changes) {
                if (payload)
                this.handleWorldChange(changes[payload]);
            }
        });
        //when the other players have been sent to the client
        this.socket.on('players',(data) => {
            this.menu.loadStatus.innerHTML = 'Initializing Game Components';
            Initializer.initAll();
            this.menu.loadStatus.innerHTML = 'Starting Game';
            Initializer.startGame();
            this.menu.close();
        });
        //UPDATE LOOP
        //This recieves player data sent from the server every 30ms.

        this.socket.on('playerPayload',(data) => {
            Renderer.forceUpdate(data);
            //Renderer.smoothUpdate(data);
        });

        //this recieves disconnect events
        this.socket.on('disconnectEvent',(socketId)=> {
            let successful = Renderer.renderQueue.remove(socketId);
            if (successful) {
                console.log("Removed client: " + socketId);
            }
        })
        //listen for world changes
        this.socket.on('worldChange', (payload) => {
            this.handleWorldChange(payload);
        });
    }
    static getSyncedTime() {
        return new Date(ServerLink.ts.now()).getTime();
    }
    static handleWorldChange(payload) {
        World.map.staticEntities[payload.row][payload.col].health = payload.data.health;
        World.map.staticEntities[payload.row][payload.col].lastHealthUpdate = payload.data.lastHealthUpdate;
        if (payload.data.exists === false) {
            World.map.staticEntities[payload.row][payload.col] = null;
        }
    }
    static sendPlayerKeys(keys, timeStamp, dt) {
        let payload = {
            keys: keys,
            timestamp: timeStamp,
            dt: dt
        };
        this.socket.emit('playerKeys',payload);
    }
    static updateWorld(row, col, data) {
        let payload = {
            row: row,
            col: col,
            data: data
        };
        this.socket.emit('worldChange',payload);
    }
}