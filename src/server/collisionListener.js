import {World} from "./world";

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
            let tileSize = World.map.tileSize;
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
                            obj.willMove.y = this.backOffset + entityPos.y - obj.pos.y;
                        }
                    }
                    //if you are in front of the collidable, but then would move behind it:
                    else if (residualStatic.y > this.frontOffset && residualMove.y <= this.frontOffset) {
                        if (obj.willMove.y < 0) {
                            obj.willMove.y = this.frontOffset + entityPos.y - obj.pos.y;
                        }
                    }
                    else if (residualStatic.y === this.backOffset && obj.willMove.y > 0) {
                        obj.willMove.y = 0;
                    }
                    else if (residualStatic.y === this.frontOffset && obj.willMove.y < 0) {
                        obj.willMove.y = 0;
                    }
                }
            }
            //handle the bounds
            let offset = {x:0,y:0};
            if (obj.pos.x + offset.x  / 2 * World.map.tileSize >= World.map.bounds.x.max) {
                if (obj.willMove.x > 0) {
                    obj.willMove.x = 0;
                }
            }
            if (obj.pos.x - offset.x  / 2 * World.map.tileSize <= World.map.bounds.x.min) {
                if (obj.willMove.x < 0) {
                    obj.willMove.x = 0;
                }
            }
            if (obj.pos.y + offset.y  / 2 * World.map.tileSize >= World.map.bounds.y.max - World.map.tileSize) {
                if (obj.willMove.y > 0) {
                    obj.willMove.y = 0;
                }
            }
            if (obj.pos.y - offset.y  / 2 * World.map.tileSize <= World.map.bounds.y.min) {
                if (obj.willMove.y < 0) {
                    obj.willMove.y = 0;
                }
            }
        };
        calculateCollisions(indexOfObj);
        obj.lastWillMove = obj.willMove;
        obj.pos.x += obj.willMove.x;
        obj.pos.y += obj.willMove.y;

        /* DEBUG
       if (obj.willMove.x != 0 || obj.willMove.y != 0) {
           console.log(obj.willMove);
       }
       */


    }
}

