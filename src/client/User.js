import Classes from "./classes";
import {FreeEntity} from "./freeEntity";
import {World} from "./world";
import {GameLoop} from "./gameLoop";
import {Renderer} from "./renderer";

export class User extends FreeEntity {
    constructor() {
        super({x: 0, y: 0}, {x: 0, y: 0});
        this.size = 45;
        this.charClass = Classes.charClass.knight;
        this.orientation = this.charClass.sprite.animData.left;
        this.sprite = this.charClass.sprite;
        this.xPos = (document.body.clientWidth / 2) - (this.size / 2);
        this.yPos = (document.body.clientHeight / 2) - (this.size / 2);
        this.offset;
        this.gameStats = {health: 100, stamina: 100};
        this.aPos = {x:this.sprite.animData.left[0].x, y: this.sprite.animData.left[0].y};
    }
    getIndex() {
        return {
            x: Math.round((World.map.mapSize / 2) + this.pos.x / World.map.tileSize),
            y: Math.ceil((World.map.mapSize / 2) + this.pos.y / World.map.tileSize)
        };
    }
    getLowerIndex() {
        return {
            x: Math.round((World.map.mapSize / 2) + this.pos.x / World.map.tileSize),
            y: Math.floor((World.map.mapSize / 2) + this.pos.y / World.map.tileSize)
        };
    }
    getFutureIndex() {
        return {
            x: Math.round((World.map.mapSize / 2) + (this.pos.x + this.willMove.x) / World.map.tileSize),
            y: Math.ceil((World.map.mapSize / 2) + (this.pos.y + this.willMove.y) / World.map.tileSize)
        };
    }
    forceUpdate(data) {
        this.lastPos = this.pos;
        this.pos = data.pos;
        let movement = {x: this.pos.x - this.lastPos.x, y: this.pos.y - this.lastPos.y};
        //handle animations.
        if (movement.x < 0) {
            this.animate(this.sprite.animData.left);
        }
        if (movement.x > 0) {
            this.animate(this.sprite.animData.right);
        }
        if (movement.y < 0) {
            this.animate(this.sprite.animData.up);
        }
        if (movement.y > 0) {
            this.animate(this.sprite.animData.down);
        }
        if (movement.y === 0 && movement.x === 0) {
            this.aPos.x = this.orientation[0].x;
            this.aPos.y = this.orientation[0].y;
        }
    }
    animate(frames) {
        this.orientation = frames;
        let animRate = this.charClass.stats.speed / World.map.tileSize;
        let gameTime = Math.floor(GameLoop.gameTime * animRate);
        let index = gameTime % frames.length;
        //console.log(frames[index]);
        this.aPos.x = frames[index].x;
        this.aPos.y = frames[index].y;
    }
    animateShoot(frames) {
        this.orientation = frames;
        let animRate = .10;
        let gameTime = Math.floor(GameLoop.gameTime * .10);
        let index = gameTime % frames.length;
        //console.log(frames[index]);
        this.aPos.x = frames[index].x;
        this.aPos.y = frames[index].y;
    }
}