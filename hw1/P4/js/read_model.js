export function get_center(positions){
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

    // 2. 算中心點
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;
    return {centerX, centerY, centerZ};
}

function centralize(positions){
    const {centerX, centerY, centerZ} = get_center(positions);
    // 3. 平移所有點
    for (let i = 0; i < positions.length; i += 3) {
        positions[i]     -= centerX;
        positions[i + 1] -= centerY;
        positions[i + 2] -= centerZ;
    }
    return positions;
}

export async function read_model(model_name){
    const response = await fetch(model_name);
    const modelData = await response.json();

    // 2. 轉換數據
    const positions_src = new Float32Array(modelData.vertexPositions);
    // const positions = centralize(positions_src);
    const positions = positions_src;


    const normals = new Float32Array(modelData.vertexNormals);
    const front_colors = new Float32Array(modelData.vertexFrontcolors);
    const back_colors = new Float32Array(modelData.vertexBackcolors);
    const vertexCount = positions.length / 3;

    console.log("vertexCount:", vertexCount);
    return { positions, normals, front_colors, back_colors, vertexCount};
}