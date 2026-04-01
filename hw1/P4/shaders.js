// Vertex Shader
const vertexShaderSource = /* glsl */ `
    attribute vec3 aPosition;
    attribute vec3 aNormal;

    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat3 uNormalMatrix;

    varying vec3 vNormal;
    varying vec3 vFragPos;

    void main() {
        vFragPos = vec3(uModelMatrix * vec4(aPosition, 1.0));
        vNormal = normalize(uNormalMatrix * aNormal);
        gl_Position = uProjectionMatrix * uViewMatrix * vec4(vFragPos, 1.0);
    }
`;

// Fragment Shader
const fragmentShaderSource = /* glsl */ `
    precision mediump float;

    uniform vec3 uObjectColor;
    uniform vec3 uLightPos;
    uniform vec3 uViewPos;
    uniform vec3 uLightColor;

    varying vec3 vNormal;
    varying vec3 vFragPos;
    

    void main() {
        vec3 vlightsource = normalize(uLightPos - vFragPos);
        vec3 reflectColor = uObjectColor*uLightColor;

        vec3 vCamera = normalize(uViewPos - vFragPos);

        // vec3 p = -dot(vlightsource, vNormal) * vNormal;
        float c = dot(vlightsource, vCamera) - 2.0 *dot(vlightsource, vNormal)*dot(vNormal, vCamera);
        // gl_FragColor = vec4(uObjectColor, 1.0);
        c = max(c, 0.0);
        gl_FragColor = vec4(reflectColor*c, 1.0);
    }
`;

        /**
         * Compile a shader program
         */
function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(shader);
        console.error('Shader compilation error:', error);
        console.error('Shader type:', type === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT');
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

/**
 * Create a WebGL program from vertex and fragment shaders
 */
function createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = compileShader(gl, vertexSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) {
        return null;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program linking error:', gl.getProgramInfoLog(program));
        return null;
    }

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    return program;
}

