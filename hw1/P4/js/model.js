class Model{
    constructor(nodes, idx_start, location, rotate, shearing){
        this.positions = nodes;
        this.idx_left = idx_start;
        this.num_nodes = nodes.length/3;
        this.location = location;
        this.rotate = rotate;
        this.shearing = shearing;
    }
}