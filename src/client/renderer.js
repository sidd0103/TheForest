import {World} from "./world";
import {GameHandler} from "./gameHandler";
import {ServerLink} from "./serverLink";
import {User} from "./User";
import {RenderQueue} from "./renderQueue";
import {GameLoop} from "./gameLoop";

export class Renderer {
    static player;
    static renderQueue;
    static renderMargin;
    static plane = {};
    static init(player) {
        this.player = player;
        //add the player to the updateque
        this.renderQueue = new RenderQueue();
        this.renderQueue.addClient(ServerLink.socket.id, this.player);
        //render margin for optimization
        this.renderMargin = {
            x:Math.ceil(document.body.clientWidth / World.map.tileSize),
            y:Math.ceil(document.body.clientHeight / World.map.tileSize)
        };
        //build the coordinate plane so all positions can be in (0,0) for center of screen
        this.plane = {
            orgin : {
                x: Math.floor(document.body.clientWidth / 2 - (World.map.tileSize / 2)),
                y : Math.floor(document.body.clientHeight / 2 - (World.map.tileSize / 2))
            }
        };
        this.offset = {x: 0, y:0};
    }
    static update(dt) {
        for (let item of this.renderQueue.queue) {
            if (item != null && item.obj != null) {
                item.obj.update(dt);
            }
        }
    }
    static forceUpdate(data) {
        for (let clientId in data.playerData) {
            if (clientId !== ServerLink.socket.id && this.renderQueue != null) {
                let client = this.renderQueue.findClient(clientId);
                if (client != null) {
                    client.obj.forceUpdate(data.playerData[clientId]);
                }
                else {
                    let client = new User();
                    this.renderQueue.addClient(clientId, client);
                    client.forceUpdate(data.playerData[clientId]);
                }
            }
        }
    }
    static smoothUpdate(data) {
        for (let clientId in data.playerData) {
            if (clientId !== ServerLink.socket.id && this.renderQueue != null) {
                let client = this.renderQueue.findClient(clientId);
                if (client != null) {
                    client.obj.smoothUpdate(data.playerData[clientId]);
                }
                else {
                    let client = new User();
                    this.renderQueue.addClient(clientId, client);
                    client.smoothUpdate(data.playerData[clientId]);
                }
            }
        }
    }
    static clearRender() {
        GameHandler.ctx.clearRect(0,0,GameHandler.canvas.width, GameHandler.canvas.height);
    }
    static reRender() {
        //get the tile index the player is on using its position, so we can render stuff in the right spot
        let playerIndex = this.player.getIndex();
        //then clear the render so that we can repaint.
        this.clearRender();
        //then render the world
        this.renderTiles(GameHandler.ctx, playerIndex);
        //rendering entities --> the last parameter is the layer, it is responsible for making the 3d effect of the entities
        //this.renderEntities(GameHandler.ctx, GameHandler.upperCtx, playerIndex);
        //this.renderClients();
        //this.player.paint(GameHandler.ctx);
        this.renderAllEntities(playerIndex);
    }
    static renderTiles(ctx, indexOfPlayer) {
        ctx.shadowBlur=0;
        ctx.shadowColor="";
        //get the tiles within the render radius (it generates a rectange not a circle tho since i use forloops).
        for (let row = indexOfPlayer.y - this.renderMargin.y; row <= indexOfPlayer.y + this.renderMargin.y; row ++) {
            for (let col = indexOfPlayer.x - this.renderMargin.x; col <= indexOfPlayer.x + this.renderMargin.x; col ++) {
                //draw the tile
                let tile = null;
                if (row < World.map.mapSize && row >= 0 && col < World.map.mapSize && col >= 0) {
                    tile = World.map.tiles[row][col];
                }
                if (tile != null) {
                    let tilePlacement = {
                        x: this.plane.orgin.x - (this.player.pos.x) + (tile.pos.x * World.map.tileSize),
                        y: this.plane.orgin.y - (this.player.pos.y) + (tile.pos.y * World.map.tileSize)
                    };
                    let sprite = tile.sprite;
                    ctx.drawImage(
                        sprite.file.src,
                        sprite.pos.x,
                        sprite.pos.y,
                        sprite.size.x,
                        sprite.size.y,
                        tilePlacement.x,
                        tilePlacement.y,
                        World.map.tileSize,
                        World.map.tileSize
                    );
                }
            }   
        }
    }
    static renderAllEntities(indexOfPlayer) {
        //first, we sort the render queue by the y attribute of the free entities position
        this.renderQueue.sortByYPos();
        //the following loop only renders entities within the render radius.
        for (let row = indexOfPlayer.y - this.renderMargin.y; row <= indexOfPlayer.y + this.renderMargin.y; row ++) {
            //check if a non static entity is before our static entity.
            let tile = null
            if (row < World.map.mapSize && row >= 0) {
                tile = World.map.tiles[row][0];
            }
            GameHandler.ctx.shadowBlur=20;
            GameHandler.ctx.shadowColor="black";
            for (let i = 0; i < this.renderQueue.queue.length; i ++) {
                let item = this.renderQueue.getItem(i);
                if (tile!= null && item.obj.pos.y >= tile.getBottomPixelPos().y && item.obj.pos.y <= tile.getCenterPixelPos().y) {
                    if (item.type === ServerLink.socket.id) {
                        item.obj.paint(GameHandler.ctx);
                    }
                    else {
                        this.drawObj(item);
                    }
                }
            }
            GameHandler.ctx.shadowBlur=0;
            GameHandler.ctx.shadowColor="";
            for (let col = indexOfPlayer.x - this.renderMargin.x; col <= indexOfPlayer.x + this.renderMargin.x; col ++) {
                //check if a static entity needs to be drawn in the center.
                let entity = null;
                if (row < World.map.mapSize && row >= 0 && col < World.map.mapSize && col >= 0) {
                    entity = World.map.staticEntities[row][col];
                }
                if (entity != null) {
                    //handle the health of the entity (destructable environemnts)
                    if (entity.health != null) {
                        if (entity.health <= 0) {
                            World.map.staticEntities[row][col] = null;
                            //let the serve know the current state of the entity
                            let payload = {
                                exists: false,
                                broadcast: false,
                                health: entity.health
                            };
                            ServerLink.updateWorld(row, col, payload);
                            continue;
                        }
                        if (entity.health < entity.maxHealth && GameLoop.gameTime - entity.lastHealthUpdate >= entity.regenRate) {
                            entity.prevHealth = entity.health;
                            entity.health += entity.regenAmount;
                            entity.lastHealthUpdate = GameLoop.gameTime;
                            if (entity.health > entity.maxHealth) {
                                entity.health = entity.maxHealth;
                            }
                            let payload = {
                                exists: true,
                                broadcast: false,
                                health: entity.health,
                                lastHealthUpdate:  entity.lastHealthUpdate
                            };
                            ServerLink.updateWorld(row, col, payload);
                        }
                        GameHandler.ctx.globalAlpha = entity.health / 100;
                    }
                    //draw the static entity.
                    let entityPlacement = {
                        x: this.plane.orgin.x - (this.player.pos.x) + (entity.pos.x * World.map.tileSize) - entity.offset.x,
                        y: (this.plane.orgin.y - (this.player.pos.y) + (entity.pos.y * World.map.tileSize)) - entity.offset.y
                    };
                    let sprite = entity.sprite;
                    GameHandler.ctx.drawImage(sprite.file.src, sprite.pos.x, sprite.pos.y, sprite.size.x, sprite.size.y, entityPlacement.x, entityPlacement.y, World.map.tileSize, World.map.tileSize);
                    GameHandler.ctx.globalAlpha = 1;
                    entity.layer = 0;
                }
            }
            GameHandler.ctx.shadowBlur=20;
            GameHandler.ctx.shadowColor="black";
            //check if a non static entity is after  our static entity.
            for (let i = 0; i < this.renderQueue.queue.length; i ++) {
                let item = this.renderQueue.getItem(i);
                if (tile!= null && item.obj.pos.y >= tile.getCenterPixelPos().y && item.obj.pos.y <= tile.getTopPixelPos().y) {
                    if (item.type === ServerLink.socket.id) {
                        item.obj.paint(GameHandler.ctx);
                    }
                    else {
                        this.drawObj(item);
                    }
                }
            }
            GameHandler.ctx.shadowBlur=0;
            GameHandler.ctx.shadowColor="";
        }
    }
    static drawObj(item) {
        let obj = item.obj;
        let renderPos = this.getPlacementOf(item);
        let sprite = obj.sprite || obj.charClass.sprite;
        let spritePosition = sprite.pos || obj.aPos;
        GameHandler.ctx.drawImage(
            sprite.file.src,
            spritePosition.x,
            spritePosition.y,
            sprite.size.x,
            sprite.size.y,
            renderPos.x,
            renderPos.y,
            obj.size,
            obj.size
        );
    }
    static getPlacementOf(item) {
        let obj = item.obj;
        let offset = {x: 0, y:0};
        if (obj.offset != null) {
            offset = obj.offset;
        }
        else if (item.type.includes('PARTICLE') == false) {
            obj.offset = {
                x:((document.body.clientWidth / 2) - (obj.size / 2)) - this.plane.orgin.x - (this.player.pos.x),
                y:((document.body.clientHeight / 2) - (obj.size / 2)) - this.plane.orgin.y - (this.player.pos.y)
            };
            offset = obj.offset;
        }
        return {
            x: this.plane.orgin.x - (this.player.pos.x) + (obj.pos.x) + offset.x,
            y: this.plane.orgin.y - (this.player.pos.y) + (obj.pos.y) + offset.y
        };
    }
    
}