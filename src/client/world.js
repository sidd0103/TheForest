import Sprites from './sprites.js';
import seedrandom from 'seedrandom';

export class World {
    static map;
    static seed;
    //using the seedrandom library, we can generate a world form a seed generated on the server.
    static init(size, seed) {
        this.seed = seed;
        console.log("Generating world of size : " + size);
        //use the seed to generate random numbers. s
        this.map = new Map(size, seed);
    }
}


/* Below is previous code from when the client would generate its own world.
export class World {
    constructor(type, size) {
        this.map = new Map(type, size);
        this.entities = [];
    }
}
*/
class Destructable {
    constructor() {
        this.prevHealth = null;
        this.maxHealth = 100;
        this.regenAmount = 50;
        this.health = 100;
        this.lastHealthUpdate = null;
        this.regenRate = 1000;
    }
}
class Entity extends Destructable {
    constructor(staticObject, collidable, sprite, pos, offset) {
        super();
        this.staticObject = staticObject;
        this.collidable = collidable;
        this.sprite = sprite;
        this.pos = pos;
        this.offset = offset;
    }
    getPixelPos() {
        return ({
            x: Math.round(this.pos.x * World.map.tileSize),
            y: Math.round(((this.pos.y * World.map.tileSize) - (World.map.tileSize / 2) + 5))
        });
    }
}

class Tile {
    constructor(collidable, sprite, pos) {
        this.sprite = sprite;
        this.collidable = collidable;
        this.pos = pos;
    }
    getCenterPixelPos() {
        return ({
            x: Math.round(this.pos.x * World.map.tileSize),
            y: Math.round(((this.pos.y * World.map.tileSize) - (World.map.tileSize / 2) + 5))
        });
    }
    getTopPixelPos() {
        return ({
            x: Math.round(this.pos.x * World.map.tileSize),
            y: Math.round(this.pos.y * World.map.tileSize)
        });
    }
    getBottomPixelPos() {
        return ({
            x: Math.round(this.pos.x * World.map.tileSize),
            y: Math.round((this.pos.y * World.map.tileSize) - (World.map.tileSize))
        });
    }
}

class Map {
    constructor(mapSize, mapSeed) {
        //we turn the seed into an RNG generator use seedrandom
        this.mapSeed = mapSeed;
        this.randSeedVal = seedrandom(this.mapSeed);
        //we initate the parameters of the world. 
        this.mapSize = mapSize;
        this.tileSize = 56;
        //offset constants
        this.offsets = {
            center : {x:0,y:(this.tileSize / 2) + 5}
        }
        //initate array of tiles
        this.tiles = [...Array(this.mapSize)].map(e => Array(this.mapSize));
        //iniate static objects (trees, shrubs)
        this.staticEntities = [...Array(this.mapSize)].map(e => Array(this.mapSize));
        //this.renderRadius = {x:10,y:10};
        this.buildTiles();
        this.buildEntities();
        //set the bounds
        this.bounds = {
            x: {
                max: this.tiles[0][this.mapSize - 1].pos.x * this.tileSize,
                min: this.tiles[0][0].pos.x * this.tileSize,
            },
            y: {
                max: this.tiles[this.mapSize - 1][0].pos.y * this.tileSize,
                min: this.tiles[0][0].pos.y * this.tileSize,
            }
        };
        console.log("bounds",this.bounds);
    }
    buildTiles() {
        var possibleTiles = [Sprites.sprite.grassTileLight, Sprites.sprite.grassTileDark];
        for (var row = 0; row < this.mapSize; row ++) {
            var pos = {x: 0, y: (-1 * this.mapSize / 2) + (row)}
            for (var col = 0; col <this.mapSize; col ++) {
                pos.x = (-1 * this.mapSize / 2) + col;
                var tile = possibleTiles[0];
                var randInt = Math.floor(this.randSeedVal() * 100);
                if (randInt > 50) {
                    tile = possibleTiles[1];
                }
                this.tiles[row][col] = new Tile(false, tile, {x:pos.x, y:pos.y});
            }
        }
    }
    buildEntities() {
        var possibleEntities = [Sprites.sprite.brightGreenTree];
        for (var row = 0; row < this.mapSize; row ++) {
            var pos = {x: 0, y: (-1 * this.mapSize / 2) + (row)}
            for (var col = 0; col < this.mapSize; col ++) {
                pos.x = (-1 * this.mapSize / 2) + col;
                var randInt = Math.floor(this.randSeedVal() * 100);
                var index = null;
                if (randInt > 70) {
                    index = 0;
                }
                if (index != null) {
                    this.staticEntities[row][col] = (new Entity(true, true, possibleEntities[index], {x:pos.x, y:pos.y}, this.offsets.center));
                }
            }
        }
    }
}
