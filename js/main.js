'use strict'

// =============
// === Scene ===
// =============


let renderer = new THREE.WebGLRenderer()
renderer.setSize(canvasWidth,canvasHeight)
let scene    = new THREE.Scene()
let geometry = new THREE.BufferGeometry()
let vertices = new Float32Array([
    -1.0, -1.0,  0.0,
     1.0, -1.0,  0.0,
     1.0,  1.0,  0.0,

     1.0,  1.0,  0.0,
    -1.0,  1.0,  0.0,
    -1.0, -1.0,  0.0
])
let itemsPerElement       = 3
geometry.setAttribute('position', new THREE.BufferAttribute(vertices,itemsPerElement))
geometry.dynamic          = true
let canvas                = document.getElementById('viewport')
canvas.appendChild(renderer.domElement)
let shapesPanelDiv        = document.getElementById('button-panel')  
let operationsPanelDiv    = document.getElementById('button-panel-2') 
let historyButtonPanelDiv = document.getElementById('history-button-panel')
let fieldOfViewDegrees    = 45 
let aspectRatio           = window.innerWidth / window.innerHeight
let nearClippingPlane     = 1
let farClippingPlane      = 500
let camera                = new THREE.PerspectiveCamera(fieldOfViewDegrees, aspectRatio, 
    nearClippingPlane, farClippingPlane) 
camera.position.set(0, 0, 100)
camera.lookAt(0, 0, 0);

    
// =============
// === Mouse ===
// =============

let mouse = {
    isDown: false,
    distX:  0, 
    distY:  0
}


// ===================
// === New Buttons ===
// ===================


let shapesButtonPanel = new ButtonPanel()
let buttonCircle      = shapesButtonPanel.addButton("circle")
let buttonRectangle   = shapesButtonPanel.addButton("rectangle")
let buttonTriangle    = shapesButtonPanel.addButton("triangle")

let shape = null
buttonCircle.addOnPress(()    => { shape = "circle" })
buttonRectangle.addOnPress(() => { shape = "rectangle" })
buttonTriangle.addOnPress(()  => { shape = "triangle" })

buttonCircle.whenRelease(()    => { shape = null })
buttonRectangle.whenRelease(() => { shape = null })
buttonTriangle.whenRelease(()  => { shape = null })

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

buttonMerge.addOnPress(()     =>  { operation = "merge" })
buttonSubtract.addOnPress(()  =>  { operation = "subtract" })
buttonIntersect.addOnPress(() =>  { operation = "intersect" })

let extensions = {
    derivatives: true
}

let material = new THREE.ShaderMaterial({vertexShader,fragmentShader,extensions})
let mesh     = new THREE.Mesh(geometry, material)
 

// ===============
// === HISTORY ===
// ===============

let mouseClickPositionX = 0
let mouseClickPositionY = 0
let clickDistance       = 0
let historyButtonPanel  = new ButtonPanel()
let historyButtonNumber = 0
let operationNumber     = 1

function addHistoryButton() {
    let historyButton          = historyButtonPanel.addButton("operation " + operationNumber,"history")
    let currentOperationNumber = operationNumber
    historyButton.press()
    historyButton.addOnPress(() => {
        view.drawAllShapes(currentOperationNumber)
    })
    historyButtonPanelDiv.appendChild(historyButton.domElement)
    operationNumber     = operationNumber + 1
    historyButtonNumber = historyButtonNumber + 1
}

scene.add(mesh)

function render() {
    renderer.render(scene, camera)
    window.requestAnimationFrame(render)
}

window.requestAnimationFrame(render)

