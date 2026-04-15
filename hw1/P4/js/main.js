import {getModelMatrix} from "./geometry.js"
import {load_model, Model, read_model} from "./model.js"
import * as IO from "./IO.js"
import { trans } from "./geometry.js";
import { vertexShaderSource, fragmentShaderSource ,createProgram } from "./shader.js";
import { startTime } from "./init.js";
async function startApp() {
    window.addEventListener("keydown", IO.onKeyDownevent);
    window.addEventListener("keyup", IO.onKeyUpevent);

    const canvas = document.getElementById('glCanvas');
    const gl = canvas.getContext('webgl');

    // Vertex Shader
    // 取得 WebGL context 後執行
    const ext = gl.getExtension('OES_standard_derivatives');
    if (!ext) {
        console.warn("此裝置/瀏覽器不支援 OES_standard_derivatives，Flat Shading 可能無法正常運作。");
    }

    if (!gl) {
        console.error('WebGL not supported');
        alert('WebGL is not supported in your browser');
        throw new Error('WebGL context could not be created');
    }

    // Set viewport and clear color
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.1, 0.1, 0.1, 1.0); // Blue background (darker blue with more opacity)
    
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    // gl.cullFace(gl.BACK); // 剔除背面
    
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
    const lightPosLoc = gl.getUniformLocation(program, 'uLightPos[0]');
    const viewPosLoc = gl.getUniformLocation(program, 'uViewPos');
    const lightColorLoc = gl.getUniformLocation(program, 'uLightColor');

    gl.useProgram(program); // 確保正在使用您的 program

    gl.uniform3fv(lightPosLoc, new Float32Array([
        10, 10, 0,
        -10, -10, 0
    ]));

    // 設定攝影機位置 (假設從 Z 軸看過去)
    gl.uniform3f(viewPosLoc, 0.0, 0.0, 10.0);

    // 設定光源顏色 (白光)
    gl.uniform3f(lightColorLoc, 1.0, 1.0, 1.0);

    const clippingControlLoc = gl.getUniformLocation(program, 'do_clipping');
    const clippingCenterLoc = gl.getUniformLocation(program, 'clipping_center');
    const clippingDirLoc = gl.getUniformLocation(program, 'clipping_dir');


    // const clipping_center = vec3(0, 0, 0);
    // const clipping_dir = vec3(0, 1, 1);

    gl.uniform1i(clippingControlLoc, 1);
    gl.uniform3fv(clippingCenterLoc, [0.0, 0.0, 0.0]);
    gl.uniform3fv(clippingDirLoc, [1.0, -1.0, -1.0]);

    // 將滑桿連結到模型縮放
    function bindSlider(sliderId, valueId, onChange) {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(valueId);

        if (!slider || !valueDisplay) return;

        slider.addEventListener('input', (event) => {
            const value = parseFloat(event.target.value);
            valueDisplay.textContent = value.toFixed(2);
            onChange(value);
        });
    }

    let objectScale = 1.0;
    bindSlider('scaleSlider', 'scaleValue', (value) => {
        objectScale = value;
        model1.scale = value;
    });

    let objectShear = 0.0;
    bindSlider('shearSlider', 'shearValue', (value) => {
        objectShear = value;
        model1.shearing = [0, 0, value];
    });

    function createBuffer(gl, data, target = gl.ARRAY_BUFFER) {
        const buffer = gl.createBuffer();
        gl.bindBuffer(target, buffer);
        gl.bufferData(target, data, gl.STATIC_DRAW);
        return buffer;
    }

    // Add this where you get your other uniform locations
    const shaderTypeLoc = gl.getUniformLocation(program, 'shader_type');

    // ... your existing uniform setups ...

    // --- Shading Menu Toggle Logic ---
    let currentShaderType = 2; // Default to Phong
    gl.uniform1i(shaderTypeLoc, currentShaderType); // Set initial state in shader

    const shadingSelect = document.getElementById('shadingSelect');
    if (shadingSelect) {
        shadingSelect.addEventListener('change', (event) => {
            currentShaderType = parseInt(event.target.value, 10);
            gl.uniform1i(shaderTypeLoc, currentShaderType);
            console.log(`Shading mode switched to: ${currentShaderType}`);
        });
    }

    const normalMatrix = mat3.create();
    const angle = 0.1;
    function animate(models) {
        const loop = (timestamp) => {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            const elapsedSeconds = timestamp / 1000.0;
            // const elapsedSeconds = (Date.now() - startTime) / 1000;
            IO.update_config();

            for(const model of models){
                const modeltrans = [
                    model.location[0] + trans[0],
                    model.location[1] + trans[1],
                    model.location[2] + trans[2]
                ]
                const modelMatrix = getModelMatrix(
                    [0, elapsedSeconds*angle, 0], 
                    modeltrans,
                    model.scale,
                    model.shearing
                );

                // clipping_center = mat4.multiply(modelMatrixLoc, (clipping_dir, 0));
    
                gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix);
                mat3.normalFromMat4(normalMatrix, modelMatrix);
                
                gl.uniformMatrix3fv(normalMatrixLoc, false, normalMatrix);
                gl.drawArrays(gl.TRIANGLES, model.idx_left, model.num_nodes);
            }

            requestAnimationFrame(loop);
        }
        loop();
    }
    

    // const { positions, normals, front_colors, back_colors, vertexCount } =
    //             await read_model('tomcat.json');
    const model1 = await load_model('models/Teapot.json', 0, [0,0,0]);

    var current_idx = model1.num_nodes;

    const model2 = await load_model('models/Tomcat.json', current_idx, [5, 0, 0]);
    current_idx += model2.num_nodes;
    
    const model3 = await load_model('models/Csie.json', current_idx, [-5, 0, 0]);
    current_idx += model3.num_nodes;


    // const models = [model1, model2, model3];
    const models = [model1];


    let totalPositions = 0, totalNormals = 0, totalFrontColors = 0, totalBackColors = 0;
    for(const model of models) {
        totalPositions += model.positions.length;
        totalNormals += model.normals.length;
        totalFrontColors += model.front_colors.length;
        totalBackColors += model.back_colors.length;
    }

    // 2. 直接建立正確大小的 TypedArray (這樣對記憶體與效能最好)
    const positions_pool = new Float32Array(totalPositions);
    const normals_pool = new Float32Array(totalNormals);
    const front_colors_pool = new Float32Array(totalFrontColors);
    const back_colors_pool = new Float32Array(totalBackColors);

    // 3. 使用 .set() 快速將各個模型的陣列填入 pool 中
    let posOffset = 0, normOffset = 0, frontOffset = 0, backOffset = 0;

    for(const model of models){
        positions_pool.set(model.positions, posOffset);
        posOffset += model.positions.length;

        normals_pool.set(model.normals, normOffset);
        normOffset += model.normals.length;

        front_colors_pool.set(model.front_colors, frontOffset);
        frontOffset += model.front_colors.length;

        back_colors_pool.set(model.back_colors, backOffset);
        backOffset += model.back_colors.length;
    }

    console.log("Total node values:", positions_pool.length);
    //******************** */

    
    createBuffer(gl, new Float32Array(positions_pool));
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);

    createBuffer(gl, new Float32Array(normals_pool));
    gl.enableVertexAttribArray(normalLoc);
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);

    createBuffer(gl, new Float32Array(front_colors_pool));
    gl.enableVertexAttribArray(frontcolorLoc);
    gl.vertexAttribPointer(frontcolorLoc, 3, gl.FLOAT, false, 0, 0);

    createBuffer(gl, new Float32Array(back_colors_pool));
    gl.enableVertexAttribArray(backcolorLoc);
    gl.vertexAttribPointer(backcolorLoc, 3, gl.FLOAT, false, 0, 0);


// ==========================================
    // [新增功能 1] Clipping 控制按鈕
    // ==========================================
    let isClippingEnabled = true; // 預設為開啟 (因為你原本設為 1)
    const clippingBtn = document.getElementById('clippingBtn');
    if (clippingBtn) {
        clippingBtn.addEventListener('click', () => {
            isClippingEnabled = !isClippingEnabled;
            // 更新 Shader 中的 clipping_control uniform
            gl.uniform1i(clippingControlLoc, isClippingEnabled ? 1 : 0);
            console.log(`Clipping is now: ${isClippingEnabled ? 'ON' : 'OFF'}`);
        });
    }

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
    animate( models );
}


startApp();