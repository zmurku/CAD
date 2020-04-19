// todo - tu ma sie wsyzstko dziac

function main() {
    let canvas = new Canvas()
    let scene  = new Scene(canvas)
    scene.render()
    let menu = new Menu(scene) 
    let view = new View(scene, menu)
}

main() 
