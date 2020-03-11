
let width  = 600;
let height = 600;
let renderer = new THREE.WebGLRenderer()
renderer.setSize(width,height)
document.body.appendChild(renderer.domElement)

let fieldOfViewDegrees = 45 
let aspectRatio        = window.innerWidth / window.innerHeight
let nearClippingPlane  = 1
let farClippingPlane   = 500
let camera = new THREE.PerspectiveCamera(fieldOfViewDegrees, aspectRatio, nearClippingPlane, farClippingPlane)

camera.position.set(0, 0, 100)
camera.lookAt(0, 0, 0);

let scene = new THREE.Scene()

let geometry = new THREE.BufferGeometry()

let vertices = new Float32Array([
	-1.0, -1.0,  0.0,
	 1.0, -1.0,  0.0,
	 1.0,  1.0,  0.0,

	 1.0,  1.0,  0.0,
	-1.0,  1.0,  0.0,
	-1.0, -1.0,  0.0
])

let itemsPerElement = 3
geometry.setAttribute('position', new THREE.BufferAttribute(vertices,itemsPerElement))



let vertexShader = `
varying vec2 currentPixelPosition;
void main() {
	currentPixelPosition.x = position.x;
	currentPixelPosition.y = position.y;
	currentPixelPosition = currentPixelPosition * 600.0;
	// Contains the position of the current vertex.
    gl_Position = vec4(position.x,position.y,position.z,1.0); 
}

`

let fragmentShader = `

uniform vec2 u_resolution;
uniform float u_time;


// Position of te pixel that we are currently drawing in the space [-10,10] x [-10,10].
varying vec2 currentPixelPosition;

// Use high precision floats - to compute thingswithout errors
// "When adding or dividing numbers,be precise"
precision mediump float;

// Returns distance between 'samplePosition' and the border of circle placed at theo rigin (0,0). 
// Insid it's < 0. Outside it's > 0.
float distanceToCircle(vec2 samplePosition, float radius){
	float distanceFromCenter = length(samplePosition);
 	float distanceFromBorder = distanceFromCenter - radius;
    return distanceFromBorder;
}

// Returns distance between 'samplePosition' and the border of rectangle placed at the origin (0,0). 
// Insid it's < 0. Outside it's > 0.
float distanceToRectangle(vec2 samplePosition, vec2 halfSize){
    vec2 componentWiseEdgeDistance = abs(samplePosition) - halfSize;
    float outsideDistance = length(max(componentWiseEdgeDistance, 0.0));
    float insideDistance = min(max(componentWiseEdgeDistance.x, componentWiseEdgeDistance.y), 0.0);
    return outsideDistance + insideDistance;
}

float distanceToLineVertical(vec2 samplePosition, vec2 halfSize){
    vec2 componentWiseEdgeDistance = abs(samplePosition) - halfSize;
    return componentWiseEdgeDistance.x;
}

float distanceToLineHorizontal(vec2 samplePosition, vec2 halfSize){
    vec2 componentWiseEdgeDistance = abs(samplePosition) - halfSize;
    return componentWiseEdgeDistance.y;
}

float distanceToLineVertical5(vec2 samplePosition, vec2 halfSize){
    vec2 componentWiseEdgeDistance = abs(samplePosition) - halfSize;
    return componentWiseEdgeDistance.x;
}

float distanceToLineHorizontal5(vec2 samplePosition, vec2 halfSize){
    vec2 componentWiseEdgeDistance = abs(samplePosition) - halfSize;
    return componentWiseEdgeDistance.y;
}


/// Returns distance to a combined shape.
float merge(float distanceToShape1, float distanceToShape2){
    return min(distanceToShape1, distanceToShape2);
}

float intersect(float shape1, float shape2){
    return max(shape1, shape2);
}

float subtract(float base, float subtraction){
    return intersect(base, -subtraction);
}

float interpolate(float shape1, float shape2, float amount){
    return mix(shape1, shape2, amount);
}

float grow(float distance, float size){
    return distance - size;
}

vec2 repeatX(vec2 position, float distance) {
	float x = mod(position.x, distance);
	float y = position.y;
	return vec2(x, y);
}

vec2 repeatY(vec2 position, float distance) {
	float y = mod(position.y, distance);
	float x = position.x;
	return vec2(x, y);
}

vec2 translate(vec2 samplePosition, vec2 offset){
	return samplePosition - offset;
}


vec2 rotate(vec2 samplePosition, float rotation){
    const float PI = 3.14159;
    float angle = rotation * PI * 2.0 * -1.0;
	float sine = sin(angle);
	float cosine = cos(angle);
    return vec2(cosine * samplePosition.x + sine * samplePosition.y, cosine * samplePosition.y - sine * samplePosition.x);
}

vec2 scale(vec2 samplePosition, float scale){
    return samplePosition / scale;
}


float grid_distance(vec2 position) {
	vec2 position2 = translate(position, vec2(2.0, 0.0));
	vec2 repPositionX = repeatX(position, 40.0);
	vec2 repPositionY = repeatY(position, 40.0);
	vec2 repPositionX5 = repeatX(position, 200.0);
	vec2 repPositionY5 = repeatY(position, 200.0);
	float lineVertical   = distanceToLineVertical(repPositionX, vec2(2.0, 0.0));
	float lineHorizontal = distanceToLineHorizontal(repPositionY, vec2(0.0, 2.0));
	float lineVertical5   = distanceToLineVertical5(repPositionX5, vec2(4.0, 0.0));
	float lineHorizontal5 = distanceToLineHorizontal5(repPositionY5, vec2(0.0, 4.0));
	float add = merge(lineVertical, lineHorizontal);
	float add5 = merge(lineVertical5, lineHorizontal5);
	float addaddXD = merge(add, add5);
	return addaddXD;
}

float render (float distance) {
	float distanceChange = fwidth(distance) * 0.5;
	float antialiasedCutoff = smoothstep(distanceChange, -distanceChange, distance);
	return antialiasedCutoff;
}

vec4 grid(vec2 position) {
	float distance = grid_distance(position);
	float alpha    = render(distance);
	return vec4(1.0, 1.0, 1.0, alpha*0.08);
}

float background(vec2 position) {
	float rectangle = distanceToRectangle(position, vec2(600.0, 600.0));
	return rectangle;
}

vec4 mix_colors(vec4 bg, vec4 fg) {
	vec4 p_fg = fg * fg.a;
	vec4 p_bg = bg * bg.a;
	vec4 p_cd = (1.0 - fg.a) * p_bg + p_fg;
	vec4 cd   = p_cd / p_cd.a;
	return cd;
}

// Execute for every pixel.
void main() {
	vec4 grid_color = grid(currentPixelPosition);
	vec4 bg_color   = vec4(0.03, 0.15, 0.26 ,1.0);
	vec4 out_color  = mix_colors(bg_color,grid_color);

	gl_FragColor = out_color;

}


`

let extensions = {
	derivatives: true
}

var material = new THREE.ShaderMaterial({vertexShader,fragmentShader,extensions})


let mesh = new THREE.Mesh(geometry, material)

scene.add(mesh)
renderer.render(scene, camera)