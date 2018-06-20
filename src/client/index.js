import {GameHandler} from './gameHandler.js';
import {World} from './world.js'
import {GameLoop} from './gameLoop.js'
import {Player} from './player.js';
import {Renderer} from './renderer.js'
import {Gui} from './gui.js';
//this is the initializer.  It initializes everything for the game, except the GUI
export class Initializer {
    static initWorld(mapData) {
        //init the map with the size and the seed of the map.
        World.init(mapData.size, mapData.seed);
    }
    static initAll() {
         //init other game components. 
        this.player = new Player();
        GameLoop.init();
        GameHandler.init();
        Renderer.init(this.player);
    }
    static startGame() {
        GameHandler.start();
    }
}
//this is the GUI. It is responsible for displaying the TITLE SCREEN, MAP, and INVENTORY.
//Its responsible for starting up the game with the title screen.
Gui.init();
Gui.startMenu();


