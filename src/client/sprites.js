import assets from './assets.js';

export default {
    sprite : {
        grassTileLight : {
            file: assets.spriteSheets[0],
            static: true,
            pos: {x:120,y:168},
            size: {x:8,y:8}
        },
        grassTileDark : {
            file: assets.spriteSheets[0],
            static: true,
            pos: {x:112,y:168},
            size: {x:8,y:8}
        },
        brightGreenTree : {
            file: assets.spriteSheets[2],
            static: true,
            pos: {x:72,y:32},
            size: {x:8,y:8},
        },
        startParticle : {
            file: assets.spriteSheets[3],
            static: true,
            pos: {x:66,y:34},
            size: {x:4,y:4},
        },
        knight : {
            file: assets.spriteSheets[1],
            static: false,
            size: {x:8,y:7.99},
            aPos: {x:0,y:120},
            animData: {
                'up' : [{x:0,y:136},{x:8,y:136},{x:16,y:136}],
                'down' : [{x:0,y:128},{x:8,y:128},{x:16,y:128}],
                'right' : [{x:0,y:120},{x:8,y:120}],
                'left' : [{x:56,y:120},{x:64,y:120}],
            }
        },
    }
}