import {FreeEntity} from "./freeEntity";
import {CollisionListener} from "./collisionListener";
import Sprites from './sprites.js';
import {Renderer} from "./renderer";
import {GameLoop} from "./gameLoop";
import {ServerLink} from "./serverLink";

export class Particle extends FreeEntity {
    //orgin, unit vector, lifetime (in distance), velocity, damage, sprite
    constructor(orgin, vector, maxDistance, velocity, damage, sprite) {
        super(orgin,{x:0,y:0});
        this.vel = velocity;
        this.unitVector = vector;
        this.size = 20;
        this.damage = damage;
        this.maxDistance = maxDistance;
        this.distanceTraveled = 0;
        this.sprite = sprite;
        this.id = Renderer.renderQueue.addParticle(this);
    }
    update(dt) {
        if (this != null && this.unitVector != null && this.vel != null) {
            this.willMove = {
                x: this.unitVector.x * dt * this.vel,
                y: this.unitVector.y * dt * this.vel
            };
            let oldPos = {x:this.pos.x,y:this.pos.y};
            CollisionListener.checkCollisionsAndMove(this);
            let changeVector = {x:this.pos.x- oldPos.x, y:this.pos.y - oldPos.y};
            let changeMagnitude = Math.sqrt(changeVector.x * changeVector.x + changeVector.y * changeVector.y);
            this.distanceTraveled += changeMagnitude;
        }
        else {
            this.collide();
        }
        if (this.distanceTraveled > this.maxDistance) {
            this.collide();
        }
    }
    collide(payload) {
        Renderer.renderQueue.remove(this.id);
        if (payload != null) {
            if (payload.collidedWith != null && payload.collidedWith.health != null) {
                payload.collidedWith.prevHealth = payload.collidedWith.health;
                payload.collidedWith.health -= this.damage;
                payload.collidedWith.lastHealthUpdate = GameLoop.gameTime;
                //let the serve know the current state of the entity if it changed
                let message = {
                    exists: true,
                    broadcast: true,
                    health: payload.collidedWith.health,
                    lastHealthUpdate:  payload.collidedWith.lastHealthUpdate
                };
                ServerLink.updateWorld(payload.index.y, payload.index.x, message);
            }
        }
    }
}