import seedrandom from 'seedrandom';
import Sprites from "../client/sprites";

export class World {
    static map;
    static seed;
    static size;
    static changes = {};
    static init(size, seed) {
        this.entities = [];
        //the seed of the map is a string that will be used to generate an RNG function. 
        this.seed = seed
        if (this.seed == null) {
            this.seed = Math.random().toString(36);
        }
        //we initate the rng function with the seed. 
        this.map = new Map(size, this.seed);
    }
    static getMap() {
        return {seed: this.seed, size: this.map.mapSize};
    }
}
//the map class will generate a random map filled with integers. The client will interpret these integers.
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
}

class Map {
    constructor(size, seed) {
        //we turn the seed into an RNG generator use seedrandom
        this.seed = seed;
        this.randSeedVal = seedrandom(this.seed);
        //we initate the parameters of the map. 
        this.tileSize = 56;
        this.tilesJSON = "";
        this.mapSize = size;
        //offset constants
        this.offsets = {
            center : {x:0,y:(this.tileSize / 2) + 5}
        }
        //initate array of tiles
        this.tiles = [...Array(this.mapSize)].map(e => Array(this.mapSize));
        //iniate static objects (trees, shrubs)
        this.staticEntities = [...Array(this.mapSize)].map(e => Array(this.mapSize));
        //generate random tiles and static objects for the map. 
        this.generateRandomTiles();
        this.generateRandomEntities();
        //set the bounds of the map
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
    }
    generateRandomTiles() {
        let possibleTiles = ['LIGHT_GRASS_TILE','DARK_GRASS_TILE'];
        for (let row = 0; row < this.mapSize; row ++) {
            let pos = {x: 0, y: (-1 * this.mapSize / 2) + (row)}
            for (let col = 0; col <this.mapSize; col ++) {
                pos.x = (-1 * this.mapSize / 2) + col;
                let tile = possibleTiles[0];
                let randInt = Math.floor(this.randSeedVal() * 100);
                if (randInt > 50) {
                    tile = possibleTiles[1];
                }
                this.tiles[row][col] = new Tile(false, tile, {x:pos.x, y:pos.y});
            }
        }
    }
    generateRandomEntities() {
        let possibleEntities = ['BRIGHT_GREEN_TREE'];
        for (let row = 0; row < this.mapSize; row ++) {
            let pos = {x: 0, y: (-1 * this.mapSize / 2) + (row)}
            for (let col = 0; col < this.mapSize; col ++) {
                pos.x = (-1 * this.mapSize / 2) + col;
                let randInt = Math.floor(this.randSeedVal() * 100);
                let index = null;
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