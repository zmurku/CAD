'use strict'

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
    ClickPositionX: 0,
    ClickPositionY: 0,
    clickDistance:  0,
    isDown: false,
    distX:  0, 
    distY:  0
}


// ===================
// === New Buttons ===
// ===================
class Menu {
    constructor() {
        this.shapesButtonPanel = new ButtonPanel()
        this.buttonCircle      = this.shapesButtonPanel.addButton("circle")
        this.buttonRectangle   = this.shapesButtonPanel.addButton("rectangle")
        this.buttonTriangle    = this.shapesButtonPanel.addButton("triangle")

        this.shape = null

        this.buttonCircle.addOnPress(()    => { this.shape = "circle" })
        this.buttonRectangle.addOnPress(() => { this.shape = "rectangle" })
        this.buttonTriangle.addOnPress(()  => { this.shape = "triangle" })

        this.buttonCircle.whenRelease(()    => { this.shape = null })
        this.buttonRectangle.whenRelease(() => { this.shape = null })
        this.buttonTriangle.whenRelease(()  => { this.shape = null })

        scene.shapesPanelDiv.appendChild(this.buttonCircle.domElement)
        scene.shapesPanelDiv.appendChild(this.buttonRectangle.domElement)
        scene.shapesPanelDiv.appendChild(this.buttonTriangle.domElement)

                
        this.operationsButtonPanel = new ButtonPanel()

        this.buttonMerge           = this.operationsButtonPanel.addButton("merge")
        this.buttonSubtract        = this.operationsButtonPanel.addButton("subtract")
        this.buttonIntersect       = this.operationsButtonPanel.addButton("intersect")

        this.operation = null

        scene.operationsPanelDiv.appendChild(this.buttonMerge.domElement)
        scene.operationsPanelDiv.appendChild(this.buttonSubtract.domElement)
        scene.operationsPanelDiv.appendChild(this.buttonIntersect.domElement)

        this.buttonMerge.addOnPress(()     =>  { this.operation = "merge" })
        this.buttonSubtract.addOnPress(()  =>  { this.operation = "subtract" })
        this.buttonIntersect.addOnPress(() =>  { this.operation = "intersect" })
    }
}

let menu = new Menu()
console.log(menu)
// ===============
// === HISTORY ===
// ===============



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

// class Person {
//     constructor(name) {
//         this.name = name
//     }

//     sayHello() {
//         console.log("Hi, my name is ", this.name)
//     }
// }


// let zuzia = new Person("Zuzia")

// function callSayHello(t) {
//     t.sayHello()
// }

// function callMe(f) {
//     f()
// }

// console.log("---------------")
// zuzia.sayHello()
// callSayHello(zuzia)
// // callMe(zuzia.sayHello) // NIE DZIALA
// callMe(function() { zuzia.sayHello() })
// callMe(() => { zuzia.sayHello() })
// callMe(zuzia.sayHello.bind(zuzia))
// console.log("---------------")


