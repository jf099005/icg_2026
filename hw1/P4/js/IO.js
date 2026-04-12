import { trans } from "./geometry.js";
import { startTime } from "./init.js";
export var keys = [];
export function onKeyDownevent(event) {
    var id = event.keyCode;
    keys[id] = 1;
}

export function onKeyUpevent(event) {
    var id = event.keyCode;
    keys[id] = 0;
}

var rotationAngle = 0.0;
let lastTime = startTime;

export function update_config(){
    var timeNow = new Date().getTime();
    lastTime = timeNow;
    var stepSize = 0.2;
    if (keys[87])
        trans[2] += stepSize;
    if (keys[83])
        trans[2] += -stepSize;
    if (keys[68])
        trans[0] += stepSize;
    if (keys[65])
        trans[0] += -stepSize;
    if (keys[82])
        trans[1] += stepSize;
    if (keys[70])
        trans[1] += -stepSize;
}

