import {User} from "./User";
import {ServerLink} from "./serverLink";
import {CollisionListener} from "./collisionListener";
import {GameLoop} from "./gameLoop";
import {Renderer} from "./renderer";
import {Particle} from "./particle";
import {GameHandler} from "./gameHandler";
import Sprites from "./sprites";

export class Player extends User {
    constructor() {
        super();
        this.xPos = (document.body.clientWidth / 2) - (this.size / 2);
        this.yPos = (document.body.clientHeight / 2) - (this.size / 2);
        //handle keypresses
        this.keys = {mouse:{}};
        this.lastClickTime = null;
        this.constants = {
            'leftKey' : 65,
            'rightKey' : 68,
            'upKey' : 87,
            'downKey' : 83,
            'enterKey' : 13,
            'leftClick' : 0,
            'rightClick' : 1
        };
        window.onkeyup = (e) => {
            this.keys[e.keyCode] = false;
        };
        window.onkeydown = (e) => {
            this.keys[e.keyCode] = true;
        }
        window.onmousedown = (e) => {
            this.keys.mouse[e.button] = true;
        };
        window.onmousemove = (e) => {
            let offset ={x:e.clientX - this.xPos - 20,y:e.clientY-this.yPos - 20};
            let magnitude = Math.sqrt(offset.x * offset.x + offset.y * offset.y);
            let unitVector = {x:offset.x / magnitude, y: offset.y / magnitude};
            this.keys.mouse.vec = unitVector;
        };
        window.onmouseup = (e) => {
            this.keys.mouse[e.button] = false;
            this.keys.mouse.vec = null;
        }
    }
    paint(ctx) {
        ctx.shadowBlur=20;
        ctx.shadowColor="black";
        var sprite = this.sprite;
        if (!this.sprite.static) {
            if (this.aPos.cSize != null) {
                ctx.drawImage(sprite.file.src, this.aPos.x, this.aPos.y, this.aPos.cSize.x, this.aPos.cSize.y, this.xPos, this.yPos, this.size, this.size);
            }
            else {
                ctx.drawImage(sprite.file.src, this.aPos.x, this.aPos.y, sprite.size.x, sprite.size.y, this.xPos, this.yPos, this.size, this.size);
            }
        }
    }
    update(dt) {
        this.detectMovement(dt);
        this.detectMouse(dt);
    }
    detectMouse(dt) {
        if (this.keys.mouse[this.constants.leftClick]) {
            if (this.lastClickTime == null || GameLoop.gameTime - this.lastClickTime > 1000 / this.charClass.stats.dex) {
                let sprite = Sprites.sprite.startParticle;
                let particlePos = {x: this.pos.x + 20,y: this.pos.y + 20};
                let particle = new Particle(particlePos, this.keys.mouse.vec, 200, .8, 10, sprite);
                this.lastClickTime = GameLoop.gameTime;
                //now we orientate it in the right direction
                let unitVec = this.keys.mouse.vec;
                let maxVal = Math.sqrt(2)/2;
                if (unitVec != null) {
                    if (unitVec.x >= 0) {
                        if (unitVec.y >= -maxVal && unitVec.y <= maxVal) {
                            this.animate(this.sprite.animData.right);
                        }
                        else if (unitVec.y > maxVal) {
                            this.animate(this.sprite.animData.down);
                        }
                        else if (unitVec.y < maxVal) {
                            this.animate(this.sprite.animData.up);
                        }
                    }
                    else if (unitVec.x < 0) {
                        if (unitVec.y >= -maxVal && unitVec.y <= maxVal) {
                            this.animate(this.sprite.animData.left);
                        }
                        else if (unitVec.y > maxVal) {
                            this.animate(this.sprite.animData.down);
                        }
                        else if (unitVec.y < maxVal) {
                            this.animate(this.sprite.animData.up);
                        }
                    }
                }
            }
        }
    }
    detectMovement(dt) {
        var movement = {x:0,y:0};
        if (this.keys[this.constants.leftKey] && !this.keys[this.constants.rightKey]) {
            movement.x = -1 * this.charClass.stats.speed * (dt);
            this.animate(this.sprite.animData.left);
        }
        if (this.keys[this.constants.rightKey]  && !this.keys[this.constants.leftKey]) {
            movement.x = this.charClass.stats.speed * (dt);
            this.animate(this.sprite.animData.right);
        }
        
        if (this.keys[this.constants.upKey] && !this.keys[this.constants.downKey]) {
            movement.y = -1 * this.charClass.stats.speed * (dt);
            this.animate(this.sprite.animData.up);
        }
        if (this.keys[this.constants.downKey]  && !this.keys[this.constants.upKey]) {
            movement.y = this.charClass.stats.speed * (dt);
            this.animate(this.sprite.animData.down);
        }

        //slow diagonal movement
        if (movement.y !== 0 && movement.x !== 0) {
            movement.x = (movement.x  / 1.4); //square root of 2 = 1.4142
            movement.y = (movement.y / 1.4); //square root of 2 = 1.4142
        }
        //stop walking animation if no movement
        if (movement.y === 0 && movement.x === 0) {
            this.aPos.x = this.orientation[0].x;
            this.aPos.y = this.orientation[0].y;
        }
        //collisions can use this to apprehend where the player will be.

        movement.x = Math.trunc(movement.x);
        movement.y = Math.trunc(movement.y);

        this.willMove = movement;
        ServerLink.sendPlayerKeys(this.keys, new Date(ServerLink.ts.now()).getTime(), dt);
        CollisionListener.checkCollisionsAndMove(this);
        //this.pos.x += movement.x;
        //this.pos.y += movement.y;
    }
}