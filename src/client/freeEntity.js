import {World} from "./world";
import {MovementList} from "./movements";

export class FreeEntity {
    constructor(pos, willMove) {
        if (new.target === FreeEntity) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }
        this.pos = pos;
        this.lastPos = {x:0,y:0};
        this.willMove = willMove;
        this.movements = new MovementList();
        this.updateType = 'FORCE';
    }
    update() {
        if (this.updateType === 'SMOOTH') {
            let nextMovements = this.movements.use();
            if (nextMovements != null) {
                this.pos.x += nextMovements.pos.x;
                this.pos.y += nextMovements.pos.y;
            }
        }
    }
    collide(payload) {
        if (payload.direction === 'x') {
            this.willMove.x = payload.data;
        }
        else {
            this.willMove.y = payload.data;
        }
    }
    forceUpdate(data) {
        this.lastPos = this.pos;
        this.pos = data.pos;
    }
    smoothUpdate(data) {
        this.updateType = 'SMOOTH';
        let maxSteps = 3;
        let resid = {x: data.pos.x - this.pos.x, y: data.pos.y - this.pos.y};
        console.log(resid);
        let interPos = {x: resid.x / maxSteps, y : resid.y / maxSteps};
        for (let i = 0; i < maxSteps; i ++) {
            this.movements.add(interPos);
        }
    }
    getIndex() {
        return {
            x: Math.round((World.map.mapSize / 2) + this.pos.x / World.map.tileSize),
            y: Math.ceil((World.map.mapSize / 2) + this.pos.y / World.map.tileSize)
        };
    }
    getFutureIndex() {
        return {
            x: Math.round((World.map.mapSize / 2) + (this.pos.x + this.willMove.x) / World.map.tileSize),
            y: Math.ceil((World.map.mapSize / 2) + (this.pos.y + this.willMove.y) / World.map.tileSize)
        };
    }
}