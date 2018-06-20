import Sprites from './sprites.js';

export default {
    charClass : {
        knight : {
            sprite : Sprites.sprite.knight,
            stats : {
                //in pixels per second
                speed : .7,
                dex: 5,
                shootDistance: 100,
            }
        }
    }
}