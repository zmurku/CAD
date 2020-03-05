let renderer = new THREE.WebGLRenderer()
renderer.setSize( window.innerWidth, window.innerHeight )
document.body.appendChild( renderer.domElement )

let camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 )
camera.position.set( 0, 0, 100 )
camera.lookAt( 0, 0, 0 );

let scene = new THREE.Scene()

// let material = new THREE.LineBasicMaterial( { color: 0x0000ff } )
let geometry = new THREE.BufferGeometry()

let vertices = new Float32Array( [
	-1.0, -1.0,  0.0,
	 1.0, -1.0,  0.0,
	 1.0,  1.0,  0.0,

	 1.0,  1.0,  0.0,
	-1.0,  1.0,  0.0,
	-1.0, -1.0,  0.0
] )
geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) )
// let materialBox = new THREE.MeshBasicMaterial( { color: 0xff0000 } )

let vertexShader = `
varying vec2 pos;
void main() {
	pos.x = position.x;
	pos.y = position.y;
	pos = pos * 10.0;
    gl_Position = vec4(position.x,position.y,position.z,1.0);
}
`

let fragmentShader = `
varying vec2 pos;
precision mediump float;

float circle(vec2 samplePosition, float radius){
    return length(samplePosition) - radius;
}

float scene(vec2 position) {
    float sceneDistance = circle(position, 2.0);
    return sceneDistance;
}

void main() {
	float dist = clamp(scene(pos),0.0,1.0);
	gl_FragColor = vec4(dist,dist,dist,1.0);
}
`

var material = new THREE.ShaderMaterial({vertexShader,fragmentShader})


let mesh = new THREE.Mesh( geometry, material )

scene.add(mesh)
renderer.render(scene, camera)