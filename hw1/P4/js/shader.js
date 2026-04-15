// Vertex Shader
export const vertexShaderSource = /* glsl */ `
    #define NUM_LIGHTS 2

    precision highp float;
    precision mediump int;
    
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec3 aFrontColor;
    attribute vec3 aBackColor;

    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform vec3 uViewPos;
    uniform vec3 uLightPos[NUM_LIGHTS];
    uniform vec3 uLightColor;
    uniform mat4 uProjectionMatrix;
    uniform mat3 uNormalMatrix;


    uniform int shader_type; // 0: flat, 1: interpolation, 2: phong

    varying vec3 vNormal;
    varying vec3 vFragPos;
    // varying vec3 vObjectColor;
    varying vec4 vFragColor;
    varying vec3 vFrontColor;
    varying vec3 vBackColor;


    void main() {
        vFragPos = vec3(uModelMatrix * vec4(aPosition, 1.0));
        vNormal = normalize(uNormalMatrix * aNormal);
        vFrontColor = aFrontColor;
        vBackColor = aBackColor;

        if(shader_type == 1){
            float normal_angle = dot(vNormal, uViewPos - vFragPos);
            vec3 vObjectColor;
            if(normal_angle >= 0.0){
                vObjectColor = aFrontColor;
                // vNormal = -vNormal;
            }
            else{
                vObjectColor = aBackColor;
            }


            float ambientStrength = 0.2;
            vec3 ambient = ambientStrength * uLightColor;

            vec3 result = ambient*vObjectColor;
            for(int i = 0; i < NUM_LIGHTS; i++){
                // 3. 使用計算好的 norm 進行光照計算
                vec3 lightDir = normalize(uLightPos[i] - vFragPos);
                float diff = max(dot(vNormal, lightDir), 0.0);
                vec3 diffuse = diff * uLightColor;

                float specularStrength = 0.5;
                vec3 viewDir = normalize(uViewPos - vFragPos);
                vec3 reflectDir = reflect(-lightDir, vNormal);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
                vec3 specular = specularStrength * spec * uLightColor;

                result = result + (diffuse + specular) * vObjectColor;
            }
            vFragColor = vec4(result, 1.0);
        }

        gl_Position = uProjectionMatrix * uViewMatrix * vec4(vFragPos, 1.0);
    }
`;

// Fragment Shader
// Fragment Shader
export const fragmentShaderSource = /* glsl */ `
    // 1. 啟用標準導數擴充功能 (必須寫在最前面)
    #extension GL_OES_standard_derivatives : enable
    
    #define NUM_LIGHTS 2

    precision highp float;
    precision mediump int;
    uniform vec3 uLightPos[NUM_LIGHTS];
    uniform vec3 uViewPos;
    uniform vec3 uLightColor;

    uniform int do_clipping; // 0:no, 1:yes
    uniform vec3 clipping_center;
    uniform vec3 clipping_dir;

    varying vec3 vNormal;
    varying vec3 vFragPos;
    varying vec3 vFrontColor;
    varying vec3 vBackColor;


    // varying vec3 vObjectColor;
    varying vec4 vFragColor;

    uniform int shader_type; // 0: flat, 1: interpolation, 2: phong

    void main() {

        // float normal_angle = dot(vNormal, uViewPos - vFragPos);
        vec3 vObjectColor;
        // if(normal_angle >= 0.0){
        if(gl_FrontFacing){
            vObjectColor = vFrontColor;
            // vNormal = -vNormal;
        }
        else{
            vObjectColor = vBackColor;
        }



        if(do_clipping == 1){
            vec3 clipping_vec = vFragPos - clipping_center;
            if(dot(clipping_vec, clipping_dir) < 0.0){
                discard;
            }
        }
        
        // 2. 根據 shader_type 決定法向量
        vec3 norm;
        
        //flat shading
        if (shader_type == 0) {
        // if (shader_type == 0) {
            // --- Flat Shading ---
            // dFdx 和 dFdy 會計算相鄰像素間 vFragPos 的變化率
            // 這會產生兩個位於三角形平面上的切向量
            vec3 dx = dFdx(vFragPos);
            vec3 dy = dFdy(vFragPos);
            
            // 透過外積 (Cross Product) 取得垂直於平面的面法向量 (Face Normal)
            // 註：如果發現光照全黑或反向，可以改成 cross(dy, dx)
            norm = normalize(cross(dx, dy));
        } 
        else if(shader_type == 1){
            gl_FragColor = vFragColor;
            return;
        }
        
        else {
            // --- Phong Shading (或 Interpolation) ---
            // 直接使用從 Vertex Shader 內插過來的平滑法向量
            norm = normalize(vNormal);
        }
        float ambientStrength = 0.5;
        vec3 ambient = ambientStrength * uLightColor;

        vec3 result = ambient*vObjectColor;
        for(int i = 0; i < NUM_LIGHTS; i++){
            // 3. 使用計算好的 norm 進行光照計算
            vec3 lightDir = normalize(uLightPos[i] - vFragPos);
            float diff = max(dot(norm, lightDir), 0.0);
            vec3 diffuse = diff * uLightColor;

            float specularStrength = 0.5;
            vec3 viewDir = normalize(uViewPos - vFragPos);
            vec3 reflectDir = reflect(-lightDir, norm);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
            vec3 specular = specularStrength * spec * uLightColor;

            result = result + (diffuse + specular) * vObjectColor;
        }
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
export function createProgram(gl, vertexSource, fragmentSource) {
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