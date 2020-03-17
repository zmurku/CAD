
let width  = 600;
let height = 600;
let renderer = new THREE.WebGLRenderer()
renderer.setSize(width,height)
let canvas = document.getElementById('root')
canvas.appendChild(renderer.domElement)
let buttonPanel = document.getElementById('button-panel')
let buttonPanel_2 = document.getElementById('button-panel-2')


// po kliknięciu  w jakieś miejsce na canvasie ma się wyświetlić info o:
// położeniu i wciśniętych przysiskach

buttons = {}
let selectedButtons = {}

function getCursorPosition(canvas, event) {
    let rect = canvas.getBoundingClientRect()
    let x = event.clientX - rect.left
    let y = event.clientY - rect.top
    console.log("x: " + x + " y: " + y)
}

canvas.addEventListener('mousedown', function(e) {
    getCursorPosition(canvas, e)
})

function updateButtons() {
    for(let buttonName in buttons) {
		let button = buttons[buttonName]
		button.domElement.style.setProperty("background-color", "#888888")

		let doHighlight = false 
        for(let groupName in selectedButtons) {
			if(selectedButtons[groupName] === buttonName) {
				doHighlight = true
			}
		}

		if(doHighlight) {
			button.domElement.style.setProperty("background-color", "#003B62")
		}
	}
}

class Button {
	constructor(name,groupName) {
		this.name      = name
		this.groupName = groupName
        buttons[name]  = this
		let divElement = document.createElement("div")
		divElement.id  = this.name
		divElement.innerText = this.name
		divElement.style.setProperty("background-color", "#888888")
		divElement.style.setProperty("width", "100px")
		divElement.style.setProperty("height", "64px")
		divElement.style.setProperty("display", "inline-block")

		divElement.addEventListener("mouseover", () => {
			if(selectedButtons[groupName] !== this.name) {
				divElement.style.setProperty("background-color", "#C0C0C0")	
			}
		})

		divElement.addEventListener("mouseout", () => {
			if(selectedButtons[groupName] !== this.name){
				divElement.style.setProperty("background-color", "#888888")
			}
		})

		divElement.addEventListener("mousedown", function() {
			selectedButtons[groupName] = name
			updateButtons()
		})
		
		this.domElement = divElement
	}
}

let buttonCircle    = new Button("circle","shape")
let buttonRectangle = new Button("rectangle","shape")
let buttonTriangle  = new Button("triangle","shape")

buttonPanel.appendChild(buttonCircle.domElement)
buttonPanel.appendChild(buttonRectangle.domElement)
buttonPanel.appendChild(buttonTriangle.domElement)

let buttonMerge     = new Button("merge","operation")
let buttonSubtract  = new Button("subtract","operation")
let buttonIntersect = new Button("intersect","operation")

buttonPanel_2.appendChild(buttonMerge.domElement)
buttonPanel_2.appendChild(buttonSubtract.domElement)
buttonPanel_2.appendChild(buttonIntersect.domElement)

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

float distanceToFigure(vec2 position) {
	vec2 position2 = translate(position, vec2(150.0, 0.0));
	float rectangle = distanceToRectangle(position2, vec2(200.0, 200.0));
	float circle = distanceToCircle(position, 150.0);
	float sub = subtract(rectangle, circle);
	float growth = grow(sub, 3.0);
	float sub2 = subtract(growth, sub);
	return sub2;
}

vec4 colorFigure(vec2 position) {
	float distance = distanceToFigure(position);
	float alpha    = render(distance);
	return vec4(1.0, 1.0, 1.0, alpha);
}

float background(vec2 position) {
	float rectangle = distanceToRectangle(position, vec2(600.0, 600.0));
	return rectangle;
}


vec4 mix_colors(vec4 background, vec4 foreground) {
	vec4 p_foreground = foreground * foreground.a;
	vec4 p_background = background * background.a;
	vec4 p_cd = (1.0 - foreground.a) * p_background + p_foreground;
	vec4 cd   = p_cd / p_cd.a;
	return cd;
}

vec4 layer1(vec2 position) {
	return vec4(0.03, 0.15, 0.26, 1.0);
}

vec4 layer2(vec2 position) {
	vec4 background = layer1(position);
	vec4 foreground = grid(position);
	vec4 add = mix_colors(background, foreground);
	return add;
}

vec4 layer3(vec2 position) {
	vec4 grid = layer2(position);
	vec4 figure = colorFigure(position);
	vec4 add = mix_colors(grid, figure);
	return add;
}

// Execute for every pixel.
void main() {
	// vec4 fig_color  = colorFigure(currentPixelPosition);
	// vec4 grid_color = grid(currentPixelPosition);
	// vec4 bg_color   = vec4(0.03, 0.15, 0.26 ,1.0);
	// vec4 out_color  = mix_colors(bg_color,grid_color);
	// vec4 out_color_fig = mix_colors(out_color, fig_color);
	vec4 layer_3 = layer3(currentPixelPosition);

	// gl_FragColor = out_color_fig;


	//gl_FragColor = layer1(currentPixelPosition);// blue tlo
	//gl_FragColor = layer2(currentPixelPosition);// blue tlo + kreski
	gl_FragColor = layer3(currentPixelPosition);// blue tlo + kreski + shapy

}


`

let extensions = {
	derivatives: true
}

var material = new THREE.ShaderMaterial({vertexShader,fragmentShader,extensions})


let mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)
renderer.render(scene, camera)