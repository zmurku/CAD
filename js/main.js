function main() {
    let sceneSize = new SceneSize()
    let canvas  = new Canvas(sceneSize)
    let menu   = new Menu(canvas) 
    let scene   = new Scene(canvas, menu)
    canvas.render()
}

main() 
