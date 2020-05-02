function main() {
    console.log("main")
    let sceneSize = new SceneSize()
    let canvas  = new Canvas(sceneSize)
    let menu   = new Menu(canvas) 
    let scene   = new Scene(canvas, menu)
    console.log(scene)
    canvas.render()
}

main() 
