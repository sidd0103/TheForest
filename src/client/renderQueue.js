class QueueItem {
    constructor(type, data) {
        this.type = type;
        this.obj = data;
    }
}

export class RenderQueue {
    constructor() {
        this.particleCount = 0;
        this.queue = [];
    }
    addParticle(particle) {
        let id = 'PARTICLE_' + this.particleCount;
        let queueItem = new QueueItem(id, particle);
        this.queue.push(queueItem);
        this.particleCount ++;
        return id;
    }
    addClient(socketid, client) {
        let queueItem = new QueueItem(socketid, client);
        this.queue.push(queueItem);
        return socketid;
    }
    findClient(socketId) {
        for (let item of this.queue ){
            if (item.type == socketId) {
                return item;
            }
        }
        return null;
    }
    remove(socketId) {
        for (let i = 0; i < this.queue.length; i ++) {
            if (this.queue[i].type == socketId) {
                this.queue.splice(i, 1);
                return true;
            }
        }
        return false;
    }
    getItem(i) {
        return this.queue[i];
    }
    sortByYPos() {
        //we use merge sort to sort all the clients by y pos very fast.
        function mergeSort(arr){
            let len = arr.length;
            if(len <2)
                return arr;
            let mid = Math.floor(len/2),
                left = arr.slice(0,mid),
                right =arr.slice(mid);
            return merge(mergeSort(left),mergeSort(right));
        }
        function merge(left, right){
            let result = [],
                lLen = left.length,
                rLen = right.length,
                l = 0,
                r = 0;
            while(l < lLen && r < rLen){
                if(left[l].obj.pos.y < right[r].obj.pos.y){
                    result.push(left[l++]);
                }
                else{
                    result.push(right[r++]);
                }
            }
            return result.concat(left.slice(l)).concat(right.slice(r));
        }
        mergeSort(this.queue);
    }
}