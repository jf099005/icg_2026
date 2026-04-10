// Vertex Shader
const vertexShaderSource = /* glsl */ `
    precision mediump float;

    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec3 aFrontColor;
    attribute vec3 aBackColor;

    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform vec3 uViewPos;
    uniform mat4 uProjectionMatrix;
    uniform mat3 uNormalMatrix;

    varying vec3 vNormal;
    varying vec3 vFragPos;
    varying vec3 vObjectColor;

    void main() {
        vFragPos = vec3(uModelMatrix * vec4(aPosition, 1.0));
        vNormal = normalize(uNormalMatrix * aNormal);
        // vObjectColor = 0.5*(aBackColor + aFrontColor);
        // vObjectColor = aFrontColor;
        float normal_angle = dot(vNormal, uViewPos - vFragPos);
        if(normal_angle <= 0.0){
            vObjectColor = aFrontColor;
        }
        else{
            vObjectColor = aBackColor;
        }
        gl_Position = uProjectionMatrix * uViewMatrix * vec4(vFragPos, 1.0);
    }
`;

// Fragment Shader
const fragmentShaderSource = /* glsl */ `
    precision mediump float;

    // uniform vec3 uObjectColor;
    uniform vec3 uLightPos;
    uniform vec3 uViewPos;
    uniform vec3 uLightColor;

    varying vec3 vNormal;
    varying vec3 vFragPos;
    varying vec3 vObjectColor;

    void main() {
        float ambientStrength = 0.2;
        vec3 ambient = ambientStrength * uLightColor;

        vec3 norm = normalize(vNormal);
        vec3 lightDir = normalize(uLightPos - vFragPos);
        float diff = max(dot(norm, lightDir), 0.0);
        vec3 diffuse = diff * uLightColor;

        float specularStrength = 0.5;
        vec3 viewDir = normalize(uViewPos - vFragPos);
        vec3 reflectDir = reflect(-lightDir, norm);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
        vec3 specular = specularStrength * spec * uLightColor;

        vec3 result = (ambient + diffuse + specular) * vObjectColor;
        gl_FragColor = vec4(result, 1.0);
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

