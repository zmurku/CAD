'use strict'

// =============
// === Scene ===
// =============



class Scene {
    constructor() {
        this.canvasWidth  = 600 
        this.canvasHeight = 600
        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setSize(this.canvasWidth, this.canvasHeight)
        this.scene    = new THREE.Scene()
        this.geometry = new THREE.BufferGeometry()
        this.vertices = new Float32Array([
            -1.0, -1.0,  0.0,
             1.0, -1.0,  0.0,
             1.0,  1.0,  0.0,
        
             1.0,  1.0,  0.0,
            -1.0,  1.0,  0.0,
            -1.0, -1.0,  0.0
        ])
        this.itemsPerElement       = 3
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.vertices,this.itemsPerElement))
        this.geometry.dynamic          = true
        this.canvas                = document.getElementById('viewport')
        this.canvas.appendChild(this.renderer.domElement)
        this.shapesPanelDiv        = document.getElementById('button-panel')  
        this.operationsPanelDiv    = document.getElementById('button-panel-2') 
        this.historyButtonPanelDiv = document.getElementById('history-button-panel')
        this.fieldOfViewDegrees    = 45 
        this.aspectRatio           = window.innerWidth / window.innerHeight
        this.nearClippingPlane     = 1
        this.farClippingPlane      = 500
        this.camera                = new THREE.PerspectiveCamera(this.fieldOfViewDegrees, this.aspectRatio, 
                                    this.nearClippingPlane, this.farClippingPlane) 
        this.camera.position.set(0, 0, 100)
        this.camera.lookAt(0, 0, 0); 
    }

    render() {
        this.renderer.render(this.scene, this.camera)
        window.requestAnimationFrame(() => this.render())
    }

}


// zrobic klase Scene z tego wyzej tak bysmy mogli zrobic
let scene = new Scene()
scene.render()

let extensions = {
    derivatives: true
}

let material = new THREE.ShaderMaterial({vertexShader,fragmentShader,extensions})
let mesh     = new THREE.Mesh(scene.geometry, material)
scene.scene.add(mesh)

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

scene.shapesPanelDiv.appendChild(buttonCircle.domElement)
scene.shapesPanelDiv.appendChild(buttonRectangle.domElement)
scene.shapesPanelDiv.appendChild(buttonTriangle.domElement)

let operationsButtonPanel = new ButtonPanel()
let buttonMerge           = operationsButtonPanel.addButton("merge")
let buttonSubtract        = operationsButtonPanel.addButton("subtract")
let buttonIntersect       = operationsButtonPanel.addButton("intersect")

let operation = null

scene.operationsPanelDiv.appendChild(buttonMerge.domElement)
scene.operationsPanelDiv.appendChild(buttonSubtract.domElement)
scene.operationsPanelDiv.appendChild(buttonIntersect.domElement)

buttonMerge.addOnPress(()     =>  { operation = "merge" })
buttonSubtract.addOnPress(()  =>  { operation = "subtract" })
buttonIntersect.addOnPress(() =>  { operation = "intersect" })



 

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
    scene.historyButtonPanelDiv.appendChild(historyButton.domElement)
    operationNumber     = operationNumber + 1
    historyButtonNumber = historyButtonNumber + 1
}



// to wyzej do klasy HistoryPanel
// let historyPanel = new HistoryPanel()




window.requestAnimationFrame(() => scene.render)






// -------------------------------------------

class Person {
    constructor(name) {
        this.name = name
    }

    sayHello() {
        console.log("Hi, my name is ", this.name)
    }
}


let zuzia = new Person("Zuzia")

function callSayHello(t) {
    t.sayHello()
}

function callMe(f) {
    f()
}

console.log("---------------")
zuzia.sayHello()
callSayHello(zuzia)
// callMe(zuzia.sayHello) // NIE DZIALA
callMe(function() { zuzia.sayHello() })
callMe(() => { zuzia.sayHello() })
callMe(zuzia.sayHello.bind(zuzia))
console.log("---------------")


