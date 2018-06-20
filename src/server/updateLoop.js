import {PlayerList} from "./playerList";
import {SocketServer} from "./SocketServer";

export class UpdateLoop {
    static lastTime;
    static serverTime;
    static dt;
    static init() {
        this.lastTime = new Date().getTime();
        this.serverTime = 0;
        this.dt = 0;
    }
    static run() {
        const serverLoop = () => {
            let playerPayload = {serverTime: this.serverTime, playerData: PlayerList.players};
            SocketServer.app.sockets.emit('playerPayload',playerPayload);
            setTimeout(serverLoop, 45);
        };
        const physicsLoop = () => {
            //this is the time difference since the last update.
            this.dt = new Date().getTime() - this.lastTime;
            //this is the time on the server, a time that starts at 0 and increases per tick of loop.
            this.serverTime += this.dt;
            //we update the positions according to the current keystrokes.
            //PlayerList.updatePositions(this.dt);
            //we set a new last time.
            this.lastTime = new Date().getTime();
            //rerun the loop.
            setTimeout(physicsLoop, 15);
        };
        //update physics loop every 15 ms
        setTimeout(physicsLoop, 15);
        //update server loop every 30 ms
        setTimeout(serverLoop, 45);
    }

}