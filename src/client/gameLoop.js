import {Renderer} from "./renderer";
import {ServerLink} from "./serverLink";

export class GameLoop {
    static gameTime = 0;
    static lastTime;
    static syncTimes;
    static dt;
    static init() {
        this.dt = 15;
        this.lastTime = ServerLink.getSyncedTime();
    }
    static run() {
        //first we need to set the gametime to be that of the server time.
        let elapsed = ServerLink.getSyncedTime() - this.syncTimes.currentTime; //this is the time elapsed since the server responded.
        this.gameTime = elapsed + this.syncTimes.serverTime; //set the game time.
        const gameLoop = () => {
            //handle frames/gametime
            Renderer.reRender();
            requestAnimationFrame(gameLoop);
        };
        const physicsLoop = () => {
            //this is the time difference since the last update.
            this.dt = ServerLink.getSyncedTime() - this.lastTime;
            //this is the time on the server, a time that starts at 0 and increases per tick of loop.
            let prev = this.gameTime;
            this.gameTime += this.dt;
            //we update the positions according to the current keystrokes.
            Renderer.update(this.dt);
            //we set a new last time.
            this.lastTime = ServerLink.getSyncedTime();
            //rerun the loop.
            setTimeout(physicsLoop, 15);
        };
        requestAnimationFrame(gameLoop);
        setTimeout(physicsLoop, 15);
    }
    static saveSyncTimes(times) {
        this.syncTimes = times;
    }
}

