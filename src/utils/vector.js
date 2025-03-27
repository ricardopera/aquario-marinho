function addVectors(v1, v2) {
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y
    };
}

function subtractVectors(v1, v2) {
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y
    };
}

function multiplyVector(v, scalar) {
    return {
        x: v.x * scalar,
        y: v.y * scalar
    };
}

function divideVector(v, scalar) {
    if (scalar === 0) return { x: 0, y: 0 };
    return {
        x: v.x / scalar,
        y: v.y / scalar
    };
}

function magnitude(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

function normalize(v) {
    const mag = magnitude(v);
    return mag > 0 ? divideVector(v, mag) : { x: 0, y: 0 };
}

function limitVector(v, max) {
    const mag = magnitude(v);
    if (mag > max) {
        return multiplyVector(normalize(v), max);
    }
    return v;
}

function distanceBetween(v1, v2) {
    const dx = v1.x - v2.x;
    const dy = v1.y - v2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function angleOfVector(v) {
    return Math.atan2(v.y, v.x);
}

function fromAngle(angle, magnitude = 1) {
    return {
        x: Math.cos(angle) * magnitude,
        y: Math.sin(angle) * magnitude
    };
}

export { 
    addVectors, 
    subtractVectors, 
    multiplyVector, 
    divideVector, 
    magnitude, 
    normalize,
    limitVector,
    distanceBetween,
    angleOfVector,
    fromAngle
};