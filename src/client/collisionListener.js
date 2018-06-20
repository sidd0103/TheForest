import {World} from "./world";
import {Renderer} from "./renderer";

export class CollisionListener {
    static frontOffset = 5;
    static backOffset = -8;
    static checkCollisionsAndMove(obj) {
        let indexOfObj = obj.getIndex();
        let calculateCollisions = (objIndex) => {
            let staticEntity = null;
            if (objIndex.y < World.map.mapSize && objIndex.y >= 0 && objIndex.x < World.map.mapSize && objIndex.x >= 0) {
                staticEntity = World.map.staticEntities[objIndex.y][objIndex.x];
            }
            if (staticEntity != null && staticEntity.collidable) {
                //first we get the position of the entity
                let entityPos = staticEntity.getPixelPos();
                let residualMove = {
                    x : obj.pos.x + obj.willMove.x - entityPos.x,
                    y: obj.pos.y + obj.willMove.y - entityPos.y
                };
                let residualStatic = {
                    x : obj.pos.x - entityPos.x,
                    y: obj.pos.y - entityPos.y
                };
                //if your speed is great enough, you can skip a tile completely. We need to apprehend this.
                let indexNextOfObj = obj.getFutureIndex();
                if (indexNextOfObj.y !== objIndex.y) {
                    calculateCollisions(indexNextOfObj);
                }
                else { //if the speed is not great enough, and all movement is constrained to the same block.
                    //if you are behind the collidable, but then would move in front of it:
                    if (residualStatic.y < this.backOffset && residualMove.y >= this.backOffset) {
                        if (obj.willMove.y > 0) {
                            //console.log("collision down");
                            let collidePayload = {
                                direction: 'y',
                                index: {x: objIndex.x, y:objIndex.y},
                                data: this.backOffset + entityPos.y - obj.pos.y,
                                collidedWith: staticEntity
                            };
                            obj.collide(collidePayload);
                        }
                    }
                    //if you are in front of the collidable, but then would move behind it:
                    else if (residualStatic.y > this.frontOffset && residualMove.y <= this.frontOffset) {
                        //console.log("collision up");
                        if (obj.willMove.y < 0) {
                            let collidePayload = {
                                direction: 'y',
                                index: {x: objIndex.x, y:objIndex.y},
                                data: this.frontOffset + entityPos.y - obj.pos.y,
                                collidedWith: staticEntity
                            };
                            obj.collide(collidePayload);
                        }
                    }
                    else if (residualStatic.y === this.backOffset && obj.willMove.y > 0) {
                        let collidePayload = {
                            direction: 'y',
                            index: {x: objIndex.x, y:objIndex.y},
                            data: 0,
                            collidedWith: staticEntity
                        };
                        obj.collide(collidePayload);
                    }
                    else if (residualStatic.y === this.frontOffset && obj.willMove.y < 0) {
                        let collidePayload = {
                            direction: 'y',
                            index: {x: objIndex.x, y:objIndex.y},
                            data: 0,
                            collidedWith: staticEntity
                        };
                        obj.collide(collidePayload);
                    }
                }
            }
            //handle the bounds
            let offset = {x:0,y:0};
            if (obj.pos.x + offset.x  / 2 * World.map.tileSize >= World.map.bounds.x.max) {
                if (obj.willMove.x > 0) {
                    let collidePayload = {
                        direction: 'x',
                        data: 0,
                        collidedWith: 'MAX_BOUND_X'
                    };
                    obj.collide(collidePayload);
                }
            }
            if (obj.pos.x - offset.x  / 2 * World.map.tileSize <= World.map.bounds.x.min) {
                if (obj.willMove.x < 0) {
                    let collidePayload = {
                        direction: 'x',
                        data: 0,
                        collidedWith: 'MIN_BOUND_X'
                    };
                    obj.collide(collidePayload);
                }
            }
            if (obj.pos.y + offset.y  / 2 * World.map.tileSize >= World.map.bounds.y.max - World.map.tileSize) {
                if (obj.willMove.y > 0) {
                    let collidePayload = {
                        direction: 'y',
                        data: 0,
                        collidedWith: 'MAX_BOUND_Y'
                    };
                    obj.collide(collidePayload);
                }
            }
            if (obj.pos.y - offset.y  / 2 * World.map.tileSize <= World.map.bounds.y.min) {
                if (obj.willMove.y < 0) {
                    let collidePayload = {
                        direction: 'y',
                        data: 0,
                        collidedWith: 'MIN_BOUND_Y'
                    };
                    obj.collide(collidePayload);
                }
            }
        };
        calculateCollisions(indexOfObj);
        obj.pos.x += obj.willMove.x;
        obj.pos.y += obj.willMove.y;

        /* DEBUG
        if (obj.willMove.x != 0 || obj.willMove.y != 0) {
            console.log(obj.willMove);
        }
        */
    }
}

