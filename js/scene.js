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
 /// nie tu
let scene = new Scene()
scene.render()

/// to nizej do klasy 
let extensions = {
    derivatives: true
}

let material = new THREE.ShaderMaterial({vertexShader,fragmentShader,extensions})
let mesh     = new THREE.Mesh(scene.geometry, material)
scene.scene.add(mesh)
