class Asset {
    constructor(location) {
        this.src = location;
    }
 }

export default {
    spriteSheets : [
        new Asset('./src/client/sprites/lofiEnvironment2.png'),
        new Asset('./src/client/sprites/players.png'),
        new Asset('./src/client/sprites/lofiEnvironment.png'),
        new Asset('./src/client/sprites/lofiObj3.png')
    ]
}

