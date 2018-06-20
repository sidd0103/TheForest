export class MovementList {
    constructor() {
        this.movements = [];
    }
    add(pos) {
        this.movements.push(new Movement(pos));
    }
    use() {
        let nextMovement = this.movements[0];
        this.movements.splice(0,1);
        return nextMovement;
    }
}
class Movement {
    constructor(futurePos) {
        this.pos = futurePos;
    }
}