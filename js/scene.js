'use strict'

class Scene {
    constructor(canvas) {
        this.myCanvas = canvas
        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setSize(canvas.width, canvas.height)
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
        this.geometry.dynamic      = true
        this.canvas                = document.getElementById('viewport')
        this.canvas.appendChild(this.renderer.domElement)
        this.shapesPanelDiv        = document.getElementById('button-panel')  
        this.operationsPanelDiv    = document.getElementById('button-panel-2')
        this.fieldOfViewDegrees    = 45 
        this.aspectRatio           = window.innerWidth / window.innerHeight
        this.nearClippingPlane     = 1
        this.farClippingPlane      = 500
        this.camera                = new THREE.PerspectiveCamera(this.fieldOfViewDegrees, this.aspectRatio, 
                                     this.nearClippingPlane, this.farClippingPlane) 
        this.camera.position.set(0, 0, 100)
        this.camera.lookAt(0, 0, 0); 
        let extensions = {
        derivatives: true
        } 
        this.glsl          = new Glsl(canvas)
        let vertexShader   = this.glsl.vertexShader
        let fragmentShader = this.glsl.fragmentShader
        let material       = new THREE.ShaderMaterial({vertexShader,fragmentShader,extensions})
        this.mesh          = new THREE.Mesh(this.geometry, material)
        this.scene.add(this.mesh)
    }

    render() {
        this.renderer.render(this.scene, this.camera)
        window.requestAnimationFrame(() => this.render())
    }
}
