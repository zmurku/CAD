function main() {
    let sceneSize = new SceneSize()
    let canvas  = new Canvas(sceneSize)
    let menu   = new Menu(canvas) 
    let view   = new View(canvas, menu)
    canvas.render()
}

main() 
