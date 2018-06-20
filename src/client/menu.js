import Parallax from 'parallax-js';
import {ServerLink} from "./serverLink";
export class Menu {
    constructor() {
        //save the serverlink
        //initiate the parallax.
        var scene = document.getElementById('titlePanel');
        var parallaxInstance = new Parallax(scene);
        //get all the UI elements. 
        this.element = document.getElementById('titlePanel');
        this.form = document.getElementById('form');
        this.classBtn = document.getElementById('class');
        this.userNameElement = document.getElementById('uid');
        this.nextBtn = document.getElementById('play');
        this.loader = document.getElementById('loader');
        this.loadStatus = document.getElementById('status');
        //attatch listeners. 
        var that = this;
        this.nextBtn.addEventListener('click',function(){
            that.userName = that.userNameElement.value;
            if (that.userName.includes(' ')) {
                alert("Usernames cannot contain spaces!");
            }
            else if (that.userName.length == 0) {
                alert("No username was entered!");
            }
            else {
                that.form.style.display = 'none';
                that.loader.style.display = 'flex';
                ServerLink.create(that);
            }
        });
    }
    close() {
        this.element.setAttribute('style', 'display:none !important');

    }
}