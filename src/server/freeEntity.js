import {World} from "./world";
export class FreeEntity {
    constructor(pos, willMove) {
        if (new.target === FreeEntity) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }
        this.pos = pos;
        this.willMove = willMove;
        this.lastWillMove = {x: 0, y: 0};
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