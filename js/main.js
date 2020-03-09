
let renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
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
varying vec2 pos;
void main() {
	pos.x = position.x;
	pos.y = position.y;
	pos = pos * 10.0;
	// Contains the position of the current vertex.
    gl_Position = vec4(position.x,position.y,position.z,1.0); 
}

`

let fragmentShader = `
// Position of te pixel that we are currently drawing in the space [-10,10] x [-10,10].
varying vec2 pos;

// Use high precision floats - to compute thingswithout errors
// "When adding or dividing numbers,be precise"
precision mediump float;

// Returns distance between 'samplePosition' and the border of circle placed at theo rigin (0,0). 
// Insid it's < 0. Outside it's > 0.
// float circle(vec2 samplePosition, float radius){
// 	float distanceFromCenter = length(samplePosition);
//  	float distanceFromBorder = distanceFromCenter - radius;
//     return distanceFromBorder;
// }

// Returns distance between 'samplePosition' and the border of rectangle placed at the origin (0,0). 
// Insid it's < 0. Outside it's > 0.
float rectangle(vec2 samplePosition, vec2 halfSize){
    vec2 componentWiseEdgeDistance = abs(samplePosition) - halfSize;
    float outsideDistance = length(max(componentWiseEdgeDistance, 0.0));
    float insideDistance = min(max(componentWiseEdgeDistance.x, componentWiseEdgeDistance.y), 0.0);
    return outsideDistance + insideDistance;
}

vec2 translate(vec2 samplePosition, vec2 offset){
    return samplePosition - offset;
}

float scene(vec2 position) {
    vec2 position2 = translate(position, vec2(3.0, 0.0));
	float distanceToRectangle = rectangle(position2, vec2(1.0, 2.0));
	return distanceToRectangle;
}

vec2 scale(vec2 samplePosition, float scale){
    return samplePosition / scale;
}



// Execute for every pixel.
void main() {
 	float dist = scene(pos);
	gl_FragColor = vec4(dist,dist,dist,1.0);
}

`

var material = new THREE.ShaderMaterial({vertexShader,fragmentShader})


let mesh = new THREE.Mesh(geometry, material)

scene.add(mesh)
renderer.render(scene, camera)