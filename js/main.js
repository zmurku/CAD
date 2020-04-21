function main() {
    let canvas = new Canvas()
    let scene  = new Scene(canvas)
    let menu   = new Menu(scene) 
    let view   = new View(scene, menu)
    scene.render()
}

main() 
