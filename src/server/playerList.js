import Classes from './classes.js';
import {FreeEntity} from "./freeEntity";
import {CollisionListener} from "./collisionListener";
import {UpdateLoop} from "./updateLoop";

export class PlayerList {
    static players = {}
    static add(token, username, playerClass) {
        this.players[token] = new Player(token, username, playerClass);
    }
    static updatePositions(dt) {
        for(let player in this.players) {
            this.players[player].updatePos(dt);
        }
    }
    static remove(token) {
        delete this.players[token];
    }
}

class Player extends FreeEntity{
    constructor(token, username, playerClass) {
        super({x: 0, y:0}, {x:0,y:0});
        this.token = token;
        this.username = username;
        this.charClass = Classes.charClass[playerClass];
        this.keysPressed = {};
        this.constants = {
            'leftKey' : 65,
            'rightKey' : 68,
            'upKey' : 87,
            'downKey' : 83,
            'enterKey' : 13
        };
    }
    handleKeyPressAndMove(keys, clientTime, dt) {
        if (keys != null) {
            this.keysPressed = keys;
            let latency = Math.abs(new Date().getTime() - clientTime);
            //console.log(latency, this.pos);
            //this.pos.x -= this.charClass.stats.speed * latency;
            //this.pos.y -= this.charClass.stats.speed * latency;
            this.updatePos(dt);
        }
    }
    updatePos(dt) {
        let movement = {x:0,y:0};
        if (this.keysPressed[this.constants.leftKey] && !this.keysPressed[this.constants.rightKey]) {
            movement.x = -1 * this.charClass.stats.speed * (dt);
        }
        if (this.keysPressed[this.constants.rightKey]  && !this.keysPressed[this.constants.leftKey]) {
            movement.x = this.charClass.stats.speed * (dt);
        }

        if (this.keysPressed[this.constants.upKey] && !this.keysPressed[this.constants.downKey]) {
            movement.y = -1 * this.charClass.stats.speed * (dt);
        }
        if (this.keysPressed[this.constants.downKey]  && !this.keysPressed[this.constants.upKey]) {
            movement.y = this.charClass.stats.speed * (dt);
        }
        //slow diagonal movement
        if (movement.y !== 0 && movement.x !== 0) {
            movement.x = (movement.x  / 1.4); //square root of 2 = 1.4142
            movement.y = (movement.y / 1.4); //square root of 2 = 1.4142
        }
        movement.x = Math.trunc(movement.x);
        movement.y = Math.trunc(movement.y);

        this.willMove = movement;

        CollisionListener.checkCollisionsAndMove(this);

    }
}