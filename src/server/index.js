import {World} from './world.js'
import {HttpServer} from "./HTTPServer";
import {SocketServer} from "./SocketServer";
import {UpdateLoop} from "./updateLoop";
//First, generate a world for the server.
console.log("Creating new game...");
World.init(500);
//then we start up our servers.
console.log("World generated of seed: " + World.seed);
HttpServer.start(4040);
SocketServer.start();
//next, we create and start a serverloop
UpdateLoop.init();
UpdateLoop.run();
