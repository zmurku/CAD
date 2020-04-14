'use strict'



// =============
// === Scene ===
// =============

let canvasWidth  = 600
let canvasHeight = 600
let renderer = new THREE.WebGLRenderer()
renderer.setSize(canvasWidth,canvasHeight)
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
geometry.dynamic    = true
let canvas          = document.getElementById('viewport')
canvas.appendChild(renderer.domElement)
let shapesPanelDiv        = document.getElementById('button-panel')  
let operationsPanelDiv    = document.getElementById('button-panel-2') 
let historyButtonPanelDiv = document.getElementById('history-button-panel')
let fieldOfViewDegrees = 45 
let aspectRatio        = window.innerWidth / window.innerHeight
let nearClippingPlane  = 1
let farClippingPlane   = 500
let camera             = new THREE.PerspectiveCamera(fieldOfViewDegrees, aspectRatio, 
    nearClippingPlane, farClippingPlane) 
camera.position.set(0, 0, 100)
camera.lookAt(0, 0, 0);

    

// ============
// === GLSL ===
// ============

let vertexShader = `
varying vec2 currentPixelPosition;
void main() {
    vec3 position2 = position + vec3(1.0,1.0,0.0);
    currentPixelPosition.x = position2.x / 2.0;
    currentPixelPosition.y = position2.y / 2.0;
    currentPixelPosition = currentPixelPosition * ${canvasWidth}.0;
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
    float x      = cosine * samplePosition.x + sine * samplePosition.y;
    float y      = cosine * samplePosition.y - sine * samplePosition.x;
    return vec2(x,y);
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
`
let fragmentShaderColorFigure = `
vec4 colorFigure(vec2 position) {
float distance = figure_part_0(position); 
float distance_outer= grow(distance,3.0);
float border = subtract(distance_outer,distance);
float alpha    = render(border);
return vec4(1.0, 1.0, 1.0, alpha);
}
`
let fragmentShaderEnding = `
float background(vec2 position) {
    float rectangle = distanceToRectangle(position, vec2(${canvasWidth}.0, ${canvasHeight}.0));
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
float figure_part_0(vec2 position) {
    vec2 position2 = translate(position, vec2(${canvasWidth*2}.0, ${canvasHeight*2}.0));
    float rectangle = distanceToRectangle(position2, vec2(200.0, 200.0));
    return rectangle;
}
`

let fragmentShader = fragmentShaderHeader + figureDescription + fragmentShaderColorFigure + 
    fragmentShaderEnding 
    



 
// =============
// === Mouse ===
// =============

let mouse = {
    isDown: false,
    distX: 0, 
    distY: 0
}


// ===================
// === New Buttons ===
// ===================


let shapesButtonPanel = new ButtonPanel()

let buttonCircle      = shapesButtonPanel.addButton("circle")
let buttonRectangle   = shapesButtonPanel.addButton("rectangle")
let buttonTriangle    = shapesButtonPanel.addButton("triangle")

let shape = null

buttonCircle.addOnPress(() =>    { shape = "circle" })
buttonRectangle.addOnPress(() => { shape = "rectangle" })
buttonTriangle.addOnPress(() =>  { shape = "triangle" })

buttonCircle.whenRelease(() =>    { shape = null })


shapesPanelDiv.appendChild(buttonCircle.domElement)
shapesPanelDiv.appendChild(buttonRectangle.domElement)
shapesPanelDiv.appendChild(buttonTriangle.domElement)

let operationsButtonPanel = new ButtonPanel()
let buttonMerge           = operationsButtonPanel.addButton("merge")
let buttonSubtract        = operationsButtonPanel.addButton("subtract")
let buttonIntersect       = operationsButtonPanel.addButton("intersect")

let operation = null

operationsPanelDiv.appendChild(buttonMerge.domElement)
operationsPanelDiv.appendChild(buttonSubtract.domElement)
operationsPanelDiv.appendChild(buttonIntersect.domElement)

buttonMerge.addOnPress(() =>      { operation = "merge" })
buttonSubtract.addOnPress(() =>   { operation = "subtract" })
buttonIntersect.addOnPress(() =>  { operation = "intersect" })



let extensions = {
    derivatives: true
}


let material = new THREE.ShaderMaterial({vertexShader,fragmentShader,extensions})
let mesh     = new THREE.Mesh(geometry, material)

let nextFigureNumber       = 1 
let lastFigure             = `figure_part_0(position)`   
let mouseClickPositionX    = 0
let mouseClickPositionY    = 0
let clickDistance          = 0
let localFigureDescription = 0


function formatNumber(num) {
    if(num%1 === 0){
            return num+".0"
    } else {
            return num.toString()
    }    
}


canvas.addEventListener('mousedown', function(e) {
    mouseClickPositionX = e.offsetX
    mouseClickPositionY = canvasHeight - e.offsetY 
    mouse.isDown = true
})

canvas.addEventListener('mouseup', function(e) {
    mouse.isDown = false
    addNewOperation(true)
})

canvas.addEventListener('mousemove', function(e) {
    if(mouse.isDown) {
            mouse.distX    = e.offsetX - mouseClickPositionX
            mouse.distY    = (canvasHeight - e.offsetY) - mouseClickPositionY
            let distanceXY = (Math.sqrt(mouse.distX*mouse.distX + mouse.distY*mouse.distY))
        clickDistance  = distanceXY 
            addNewOperation(false)
    }
})

let historyButtonPanel         = new ButtonPanel()
let historyButtonNumber        = 0
let figureNumber               = 0
let operationNumber            = 1 
function addHistoryButton() {
    let historyButton          = historyButtonPanel.addButton("operation " + operationNumber,"history")
    let currentOperationNumber = operationNumber
    historyButton.press()
    historyButton.addOnPress(() => {
        drawAllShapes(currentOperationNumber)
    })
    historyButtonPanelDiv.appendChild(historyButton.domElement)
    operationNumber            = operationNumber + 1
    historyButtonNumber        = historyButtonNumber + 1
}



function addNewOperation(doKeep) {
    console.log(shape)
    let size = 0
    let invalidInput = !shape || !operation
    if(invalidInput) return  
    let nextFigureDesctiption = null
    let x = mouseClickPositionX
    let y = mouseClickPositionY
    
    size = formatNumber(clickDistance)

    let width  = Math.abs(mouse.distX)
    let height = Math.abs(mouse.distY)
    let rectX  = mouseClickPositionX + width/2
    let rectY  = mouseClickPositionY + height/2

    if(mouse.distY < 0) { rectY = rectY - height }
    if(mouse.distX < 0) { rectX = rectX - width }

    if(shape === "circle" && doKeep) { 
            nextFigureDesctiption = `
            float figure_part_${nextFigureNumber}(vec2 position) {
            vec2 position2 = translate(position,vec2(${x},${y}));
            float circle = distanceToCircle(position2, ${size});
            float old = figure_part_${nextFigureNumber-1}(position);
            float sub = ${operation}(old, circle);
            return sub;
            }`
            lastFigure = `figure_part_${nextFigureNumber}(position);`
            figureNumber = figureNumber + 1
            addHistoryButton()

    } else if(shape === "circle" && !doKeep) {
            nextFigureDesctiption = `
                float figure_part_${nextFigureNumber}(vec2 position) {
                vec2 position2 = translate(position,vec2(${x},${y}));
                float circle = distanceToCircle(position2, ${size});
                float old = ${lastFigure};
                float sub = ${operation}(old, circle);
                return sub;
            }`    
            
    } else if(shape === "rectangle" && doKeep) { 
            nextFigureDesctiption = `
            float figure_part_${nextFigureNumber}(vec2 position) {
            vec2 position2 = translate(position,vec2(${rectX},${rectY}));
            float rectangle = distanceToRectangle(position2, vec2(${width}, ${height}));
            float old = figure_part_${nextFigureNumber-1}(position);
            float sub = ${operation}(old, rectangle);
            return sub;
            }`        
            lastFigure = `figure_part_${nextFigureNumber}(position);`
            addHistoryButton()


    } else if(shape === "rectangle" && !doKeep) {
            nextFigureDesctiption = `
                float figure_part_${nextFigureNumber}(vec2 position) {
                vec2 position2 = translate(position,vec2(${rectX},${rectY}));
                float rectangle = distanceToRectangle(position2, vec2(${width}, ${height}));
                float old = ${lastFigure};
                float sub = ${operation}(old, rectangle);
                return sub;
            }`                
    }


    localFigureDescription = figureDescription + nextFigureDesctiption

    if(doKeep) {
            nextFigureNumber += 1
            figureDescription = localFigureDescription
    }

    drawAllShapes(operationNumber - 1)

}

function drawAllShapes(shapeNumber) {
    let codeForTranslatingAllShapesToColor = `
        vec4 colorFigure(vec2 position) {
            float distance = figure_part_${shapeNumber}(position);
            float distance_outer= grow(distance,3.0);
            float border = subtract(distance_outer,distance);
            float alpha    = render(border);
            return vec4(1.0, 1.0, 1.0, alpha);
            }
                `

    let fragmentShader2 = fragmentShaderHeader + localFigureDescription + 
        codeForTranslatingAllShapesToColor + fragmentShaderEnding 
    let material2 = new THREE.ShaderMaterial({vertexShader:vertexShader,
            fragmentShader:fragmentShader2,extensions})
    mesh.material = material2

}    

scene.add(mesh)

function render() {
    renderer.render(scene, camera)
    window.requestAnimationFrame(render)
    
}

window.requestAnimationFrame(render)

