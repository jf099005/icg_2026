export class Model{
    constructor(nodes, normals, front_colors, back_colors, idx_start, location, rotate, shearing){
        this.positions = nodes;
        this.normals = normals;
        this.front_colors = front_colors;
        this.back_colors = back_colors;
        this.idx_left = idx_start;
        this.num_nodes = nodes.length/3;
        this.location = location;
        this.rotate = rotate;
        this.shearing = shearing;
        this.scale = 1;
    }
}


export function get_bounding_box(positions){
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    // 1. 找 bounding box
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];

        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (z < minZ) minZ = z;

        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        if (z > maxZ) maxZ = z;
    }

    return {minX, maxX, minY, maxY, minZ, maxZ};
    // 2. 算中心點
    // const centerX = (minX + maxX) / 2;
    // const centerY = (minY + maxY) / 2;
    // const centerZ = (minZ + maxZ) / 2;
    // return {centerX, centerY, centerZ};
}

function normalize(positions){
    // const {centerX, centerY, centerZ} = get_center(positions);
    // 3. 平移所有點
    var scale = 5;
    const {minX, maxX, minY, maxY, minZ, maxZ} = get_bounding_box(positions);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;
    scale /= Math.max(maxX-minX, maxY-minY,maxZ-minZ);
    for (let i = 0; i < positions.length; i += 3) {
        positions[i]     -= centerX;
        positions[i]     *= scale;
        positions[i + 1] -= centerY;
        positions[i + 1] *= scale;
        positions[i + 2] -= centerZ;
        positions[i + 2] *= scale;
    }
    return positions;
}

export async function read_model(model_name){
    const response = await fetch(model_name);
    const modelData = await response.json();

    // 2. 轉換數據
    const positions_src = new Float32Array(modelData.vertexPositions);
    const positions = normalize(positions_src);
    // const positions = positions_src;


    const normals = new Float32Array(modelData.vertexNormals);
    const front_colors = new Float32Array(modelData.vertexFrontcolors);
    const back_colors = new Float32Array(modelData.vertexBackcolors);
    const vertexCount = positions.length / 3;

    console.log("vertexCount:", vertexCount);
    return { positions, normals, front_colors, back_colors, vertexCount};
}

export async function load_model(model_name, idx_start, location){
    const { positions, normals, front_colors, back_colors, vertexCount} = await read_model(model_name);
    return new Model(
        positions, 
        normals,
        front_colors,
        back_colors,
        idx_start,
        location,
        [0,0,0],
        [0,0,0]
    );
}