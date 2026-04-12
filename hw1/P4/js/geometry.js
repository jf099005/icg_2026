import { mat4 } from "https://esm.sh/gl-matrix";

export var trans = [0, 0, 0];

var modelMatrix = mat4.create();
var shearMatrix = mat4.create();
export function getModelMatrix(center, angles, translate, scale, shear){
    console.log(center, angles, translate, shear);
    mat4.identity(modelMatrix);

    mat4.identity(shearMatrix);
    shearMatrix[9] = shearMatrix[9] + shear[2];


    mat4.translate(modelMatrix, modelMatrix, translate);
    mat4.rotateY(modelMatrix, modelMatrix, angles[1]); // 讓模型旋轉方便檢查各面
    mat4.scale(modelMatrix, modelMatrix, [scale, scale, scale]); // 根據滑桿調整大小
    mat4.multiply(modelMatrix, modelMatrix, shearMatrix);
    return modelMatrix;
}

