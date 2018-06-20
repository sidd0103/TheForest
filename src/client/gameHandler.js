import Sprites from './sprites.js';
import Assets from './assets.js';
import {GameLoop} from "./gameLoop";

export class GameHandler {
    static upperCtx;
    static ctx;
    static canvas;
    static upperCanvas;
    static init() {
        //initiate the bottom layer
        this.canvas = document.getElementById("layer0");
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;
        this.ctx = this.canvas.getContext("2d");
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.imageSmoothingEnabled = false;
        //initate the top layer
        this.upperCanvas = document.getElementById("layer1");
        this.upperCanvas.width = document.body.clientWidth;
        this.upperCanvas.height = document.body.clientHeight;
        this.upperCtx = this.upperCanvas.getContext("2d");
        this.upperCtx.webkitImageSmoothingEnabled = false;
        this.upperCtx.mozImageSmoothingEnabled = false;
        this.upperCtx.imageSmoothingEnabled = false;
        //initate highest layer
        this.highestCanvas = document.getElementById("layer2");
        this.highestCanvas.width = document.body.clientWidth;
        this.highestCanvas.height = document.body.clientHeight;
        this.highestCtx = this.highestCanvas.getContext("2d");
        this.highestCtx.webkitImageSmoothingEnabled = false;
        this.highestCtx.mozImageSmoothingEnabled = false;
        this.highestCtx.imageSmoothingEnabled = false;
    }
    static start() {
        //load the assets first, 
        this.loadAssetsThenStart(0, Assets.spriteSheets);
    }
    static loadAssetsThenStart(index, assets) {
        if (index >= assets.length) {
            console.log("Loaded all assets!");
            GameLoop.run();
        }
        else {
            var img = new Image();
            console.log(assets[index].src);
            img.src = assets[index].src;
            var that = this;
            img.onload = function() {
                Assets.spriteSheets[index].src = img;
                that.loadAssetsThenStart(index + 1, assets);
            }   
        }
    }
}