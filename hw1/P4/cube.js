        function createCube(size = 1.0) {
            const half = size / 2;

            // Vertices for a unit cube centered at origin
            const vertices = [
                // Front face
                -half, -half,  half,
                 half, -half,  half,
                 half,  half,  half,
                -half,  half,  half,

                // Back face
                -half, -half, -half,
                -half,  half, -half,
                 half,  half, -half,
                 half, -half, -half,

                // Top face
                -half,  half, -half,
                -half,  half,  half,
                 half,  half,  half,
                 half,  half, -half,

                // Bottom face
                -half, -half, -half,
                 half, -half, -half,
                 half, -half,  half,
                -half, -half,  half,

                // Right face
                 half, -half, -half,
                 half,  half, -half,
                 half,  half,  half,
                 half, -half,  half,

                // Left face
                -half, -half, -half,
                -half, -half,  half,
                -half,  half,  half,
                -half,  half, -half,
            ];

            // Normals for each face (perpendicular to the face)
            const normals = [
                // Front face
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,

                // Back face
                0, 0, -1,
                0, 0, -1,
                0, 0, -1,
                0, 0, -1,

                // Top face
                0, 1, 0,
                0, 1, 0,
                0, 1, 0,
                0, 1, 0,

                // Bottom face
                0, -1, 0,
                0, -1, 0,
                0, -1, 0,
                0, -1, 0,

                // Right face
                1, 0, 0,
                1, 0, 0,
                1, 0, 0,
                1, 0, 0,

                // Left face
                -1, 0, 0,
                -1, 0, 0,
                -1, 0, 0,
                -1, 0, 0,
            ];

            // Face indices (triangles)
            const indices = [
                0, 1, 2, 0, 2, 3,       // Front
                4, 5, 6, 4, 6, 7,       // Back
                8, 9, 10, 8, 10, 11,    // Top
                12, 13, 14, 12, 14, 15, // Bottom
                16, 17, 18, 16, 18, 19, // Right
                20, 21, 22, 20, 22, 23  // Left
            ];

            return {
                vertices: new Float32Array(vertices),
                normals: new Float32Array(normals),
                indices: new Uint16Array(indices),
                indexCount: indices.length
            };
        }

