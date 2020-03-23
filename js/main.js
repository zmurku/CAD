
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

geometry.dynamic = true

let vertexShader = `
varying vec2 currentPixelPosition;
void main() {
	vec3 position2 = position + vec3(1.0,1.0,0.0);
	currentPixelPosition.x = position2.x / 2.0;
	currentPixelPosition.y = position2.y / 2.0;
	currentPixelPosition = currentPixelPosition * 600.0;
	// Contains the position of the current vertex.
    gl_Position = vec4(position.x,position.y,position.z,1.0); 
}

`

let fragmentShaderHeader = `

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
float distanceToRectangle(vec2 samplePosition, vec2 size){
	vec2 halfSize= size / 2.0;
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
	vec2 repPositionX = repeatX(position, 20.0);
	vec2 repPositionY = repeatY(position, 20.0);
	vec2 repPositionX5 = repeatX(position, 100.0);
	vec2 repPositionY5 = repeatY(position, 100.0);
	float lineVertical   = distanceToLineVertical(repPositionX, vec2(1.0, 0.0));
	float lineHorizontal = distanceToLineHorizontal(repPositionY, vec2(0.0, 1.0));
	float lineVertical5   = distanceToLineVertical5(repPositionX5, vec2(2.0, 0.0));
	float lineHorizontal5 = distanceToLineHorizontal5(repPositionY5, vec2(0.0, 2.0));
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

// float figure_part_1(vec2 position) {
// 	vec2 position2 = translate(position, vec2(150.0, 0.0));
// 	float rectangle = distanceToRectangle(position2, vec2(200.0, 200.0));
// 	float circle = distanceToCircle(position, 150.0);
// 	float sub = subtract(rectangle, circle);
// 	float growth = grow(sub, 3.0);
// 	float sub2 = subtract(growth, sub);
// 	return sub2;
// }
`
let fragmentShaderColorFigure = `
vec4 colorFigure(vec2 position) {
float distance = figure_part_1(position); 
float alpha    = render(distance);
return vec4(1.0, 1.0, 1.0, alpha);
}
`
let fragmentShaderEnding = `
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
	gl_FragColor = layer3(currentPixelPosition);
}
`
let figureDescription = `
float figure_part_1(vec2 position) {
	vec2 position2 = translate(position, vec2(300.0, 300.0));
	float rectangle = distanceToRectangle(position2, vec2(200.0, 200.0));
	return rectangle;
}
`

let fragmentShader = fragmentShaderHeader + figureDescription + fragmentShaderColorFigure + fragmentShaderEnding 


let extensions = {
	derivatives: true
}

let material = new THREE.ShaderMaterial({vertexShader,fragmentShader,extensions})

let mesh = new THREE.Mesh(geometry, material)

let figurePart = `
float figure_part_`

let figureNumber = 1

let figureDescriptionEnding = `(vec2 position) {
float circle = distanceToCircle(position, 150.0);
float rectangle = figure_part_1(position);
float sub = subtract(rectangle, circle);
return sub;
}
`

function getCursorPosition(canvas, event) {
	let rect = canvas.getBoundingClientRect()
    let x = event.clientX - rect.left
    let y = 600.0 - (event.clientY - rect.top)
	console.log("x: " + x + " y: " + y)
	
	console.log(selectedButtons.shape)
	figureNumber = figureNumber + 1

	let figureDescription2 = null;

	if (selectedButtons.shape === "circle") {
		figureDescription2 = `
			float figure_part_${figureNumber}(vec2 position) {
				vec2 position2 = translate(position,vec2(${x},${y}));
				float circle = distanceToCircle(position2, 50.0);
				float old = figure_part_${figureNumber-1}(position);
				float sub = subtract(old, circle);
				return sub;
			}`
    } else if (selectedButtons.shape === "rectangle") { 
		figureDescription2 = `
			float figure_part_${figureNumber}(vec2 position) {
				vec2 position2 = translate(position,vec2(${x},${y}));
				float rectangle = distanceToRectangle(position2, vec2(200.0, 200.0));
				float old = figure_part_${figureNumber-1}(position);
				float sub = subtract(old, rectangle);
				return sub;
		}`
	}
	let fragmentShaderColorFigure2 = `
	vec4 colorFigure(vec2 position) {
		float distance = figure_part_${figureNumber}(position); 
		float alpha    = render(distance);
		return vec4(1.0, 1.0, 1.0, alpha);
		}
	
	`


	figureDescription = figureDescription + figureDescription2
	let fragmentShader2 = fragmentShaderHeader + figureDescription + fragmentShaderColorFigure2 + fragmentShaderEnding 
	// let fragmentShader2 = fragmentShaderHeader + figureDescription + fragmentShaderColorFigure2 + fragmentShaderEnding


	let material2 = new THREE.ShaderMaterial({vertexShader:vertexShader,fragmentShader:fragmentShader2,extensions})
	


	mesh.material = material2
   
}

canvas.addEventListener('mousedown', function(e) {
    getCursorPosition(canvas, e)
})

scene.add(mesh)

function render() {
	renderer.render(scene, camera)
	window.requestAnimationFrame(render)
}

window.requestAnimationFrame(render)

