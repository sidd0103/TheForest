import {Menu} from './menu.js'

export class Gui {
    static menu;
    static canvas;
    static ctx;
    static init() {
        //initialize the GUI canvas elements
        this.canvas = document.getElementById("gui");
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;
        this.ctx = this.canvas.getContext("2d");
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.imageSmoothingEnabled = false;
    }
    static startMenu() {
        this.menu = new Menu();
    }
}