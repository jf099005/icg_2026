import {getModelMatrix} from "./geometry.js"
import {read_model} from "./read_model.js"
import * as IO from "./IO.js"
import { trans } from "./geometry.js";
import { vertexShaderSource, fragmentShaderSource ,createProgram } from "./shader.js";
import { startTime } from "./init.js";
async function startApp() {
    window.addEventListener("keydown", IO.onKeyDownevent);
    window.addEventListener("keyup", IO.onKeyUpevent);

    const canvas = document.getElementById('glCanvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL not supported');
        alert('WebGL is not supported in your browser');
        throw new Error('WebGL context could not be created');
    }

    // Set viewport and clear color
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.1, 0.1, 0.1, 1.0); // Blue background (darker blue with more opacity)
    gl.enable(gl.DEPTH_TEST);
    
    console.log('WebGL context initialized');
    console.log('Canvas size:', canvas.width, 'x', canvas.height);

    // Create and use program
    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    
    if (!program) {
        console.error('Failed to create WebGL program');
        throw new Error('Program creation failed');
    }
    
    gl.useProgram(program);

    // Get attribute locations
    const positionLoc = gl.getAttribLocation(program, 'aPosition');
    const normalLoc = gl.getAttribLocation(program, 'aNormal');
    const frontcolorLoc = gl.getAttribLocation(program, 'aFrontColor');
    const backcolorLoc = gl.getAttribLocation(program, 'aBackColor');

    // Get uniform locations
    const modelMatrixLoc = gl.getUniformLocation(program, 'uModelMatrix');
    const viewMatrixLoc = gl.getUniformLocation(program, 'uViewMatrix');
    const projectionMatrixLoc = gl.getUniformLocation(program, 'uProjectionMatrix');
    const normalMatrixLoc = gl.getUniformLocation(program, 'uNormalMatrix');
    // const objectColorLoc = gl.getUniformLocation(program, 'uObjectColor');
    const lightPosLoc = gl.getUniformLocation(program, 'uLightPos[0]');
    const viewPosLoc = gl.getUniformLocation(program, 'uViewPos');
    const lightColorLoc = gl.getUniformLocation(program, 'uLightColor');
    // 替換原本「Create cube geometry」到「animate()」之前的代碼
    // 在 animate() 迴圈內加入這些設定
    gl.useProgram(program); // 確保正在使用您的 program

    // 設定物體顏色 (例如紅色)
    // gl.uniform3f(objectColorLoc, 0.8, 0.8, 0.8);

    // 設定光源位置 (高處、稍微偏右前方)
    gl.uniform3fv(lightPosLoc, new Float32Array([
        -10, -10, -10,
        10, 10, 10
    ]));

    // 設定攝影機位置 (假設從 Z 軸看過去)
    gl.uniform3f(viewPosLoc, 0.0, 0.0, -200.0);

    // 設定光源顏色 (白光)
    gl.uniform3f(lightColorLoc, 1.0, 1.0, 1.0);

    // 將滑桿連結到模型縮放
    let objectScale = 1.0;
    const scaleSlider = document.getElementById('scaleSlider');
    const scaleValue = document.getElementById('scaleValue');
    if (scaleSlider && scaleValue) {
        scaleSlider.addEventListener(
            'input', (event) => {
                objectScale = parseFloat(event.target.value);
                scaleValue.textContent = objectScale.toFixed(2);
            }
        );
    }

    let objectShear = 0.0;
    const shearSlider = document.getElementById('shearSlider');
    const shearValue = document.getElementById('shearValue');
    if(shearSlider){
        shearSlider.addEventListener(
            'input', (event) => {
                objectShear = parseFloat(event.target.value);
                shearValue.textContent = objectShear.toFixed(2);
            }
        )
    }


    function createBuffer(gl, data, target = gl.ARRAY_BUFFER) {
        const buffer = gl.createBuffer();
        gl.bindBuffer(target, buffer);
        gl.bufferData(target, data, gl.STATIC_DRAW);
        return buffer;
    }

    function animate() {
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        IO.update_config();
        const modelMatrix = getModelMatrix(
            [0,0,0], 
            [0, elapsedSeconds, 0], 
            trans,
            objectScale,
            [0, 0, objectShear]
        );

        gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix);
        
        const normalMatrix = mat3.create();
        mat3.normalFromMat4(normalMatrix, modelMatrix);
        gl.uniformMatrix3fv(normalMatrixLoc, false, normalMatrix);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // 重要：因為 JSON 通常不帶 Index，改用 drawArrays
        gl.drawArrays(gl.TRIANGLES, 0, vertexCount);

        requestAnimationFrame(animate);
    }
    

    const { positions, normals, front_colors, back_colors, vertexCount } =
                await read_model('tomcat.json');
    console.log("colors:", front_colors);

    // const posBuffer = createBuffer(gl, positions);
    createBuffer(gl, positions);
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);

    createBuffer(gl, normals);
    gl.enableVertexAttribArray(normalLoc);
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);

    createBuffer(gl, front_colors);
    gl.enableVertexAttribArray(frontcolorLoc);
    gl.vertexAttribPointer(frontcolorLoc, 3, gl.FLOAT, false, 0, 0);

    createBuffer(gl, back_colors);
    gl.enableVertexAttribArray(backcolorLoc);
    gl.vertexAttribPointer(backcolorLoc, 3, gl.FLOAT, false, 0, 0);


    //new-----------------
// ==========================================
    // [新增] 設定 View 矩陣 (攝影機) 與 Projection 矩陣 (透視)
    // ==========================================
    const viewMatrix = mat4.create();
    // 攝影機位置 [0, 0, 10], 看向 [0, 0, 0], 上方向為 Y 軸正向 [0, 1, 0]
    mat4.lookAt(viewMatrix, [0, 0, 10], [0, 0, 0], [0, 1, 0]);
    gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);

    const projectionMatrix = mat4.create();
    // 視角 45 度 (轉為弧度), 畫布長寬比, 近裁剪面 0.1, 遠裁剪面 100.0
    mat4.perspective(projectionMatrix, 45 * Math.PI / 180, canvas.width / canvas.height, 0.1, 100.0);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, projectionMatrix);
    // ==========================================
    //**********

    // 4. 動畫迴圈 (將原本的 animate 搬進來)
    animate();
}


startApp();