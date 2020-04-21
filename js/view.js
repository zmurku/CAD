
class View {
    constructor(scene,menu) {
        this.scene = scene
        this.menu = menu
        this.nextFigureNumber       = 1 
        this.lastFigure             = `figure_part_0(position)`   
        this.localFigureDescription = 0
        this.mouse = new Mouse()
        this.history = new History(scene, this)

        scene.canvas.addEventListener('mousedown', (e) => {
            this.mouse.clickPositionX = e.offsetX
            this.mouse.clickPositionY = scene.myCanvas.height - e.offsetY 
            this.mouse.isDown         = true
        })

        scene.canvas.addEventListener('mouseup', (e) => {
            this.mouse.isDown = false
            this.addNewOperation(true)
        })

        scene.canvas.addEventListener('mousemove', (e) => {
            if(this.mouse.isDown) {
                this.mouse.distX    = e.offsetX - this.mouse.clickPositionX
                this.mouse.distY    = (scene.myCanvas.height - e.offsetY) - this.mouse.clickPositionY
                let distanceXY      = (Math.sqrt(this.mouse.distX*this.mouse.distX + 
                                      this.mouse.distY*this.mouse.distY))
                this.clickDistance  = distanceXY 
                this.addNewOperation(false)
            }
        })        
    }

    drawAllShapes(shapeNumber) {
        let codeForTranslatingAllShapesToColor = `
            vec4 colorFigure(vec2 position) {
                float distance = figure_part_${shapeNumber}(position);
                float distance_outer= grow(distance,3.0);
                float border = subtract(distance_outer,distance);
                float alpha    = render(border);
                return vec4(1.0, 1.0, 1.0, alpha);
                }
                    `
        let extensions = {
            derivatives: true
            }             
    
        let fragmentShader2 = this.scene.glsl.fragmentShaderHeader + this.localFigureDescription + 
                              codeForTranslatingAllShapesToColor + this.scene.glsl.fragmentShaderEnding 
        let material2       = new THREE.ShaderMaterial({vertexShader:this.scene.glsl.vertexShader,
                              fragmentShader:fragmentShader2,extensions})
        this.scene.mesh.material       = material2
    
    } 
    
    
    addNewOperation(doKeep) {
        let size = 0
        let invalidInput = !this.menu.selectedShape || !this.menu.selectedOperation
        if (invalidInput) return  
        let nextFigureDesctiption = null
        let x = this.mouse.clickPositionX
        let y = this.mouse.clickPositionY
        let width  = Math.abs(this.mouse.distX)
        let height = Math.abs(this.mouse.distY)
        let rectX  = this.mouse.clickPositionX + width/2
        let rectY  = this.mouse.clickPositionY + height/2
        size = formatNumber(this.clickDistance)

        if(this.mouse.distY < 0) { rectY = rectY - height }
        if(this.mouse.distX < 0) { rectX = rectX - width }

        if(this.menu.selectedShape === "circle" && doKeep) { 
            nextFigureDesctiption = `
                float figure_part_${this.nextFigureNumber}(vec2 position) {
                vec2 position2 = translate(position,vec2(${x},${y}));
                float circle = distanceToCircle(position2, ${size});
                float old = figure_part_${this.nextFigureNumber-1}(position);
                float sub = ${this.menu.selectedOperation}(old, circle);
                return sub;
                }`
            this.lastFigure = `figure_part_${this.nextFigureNumber}(position);`
            this.history.addHistoryButton()

        } else if(this.menu.selectedShape === "circle" && !doKeep) {
            nextFigureDesctiption = `
                float figure_part_${this.nextFigureNumber}(vec2 position) {
                vec2 position2 = translate(position,vec2(${x},${y}));
                float circle = distanceToCircle(position2, ${size});
                float old = ${this.lastFigure};
                float sub = ${this.menu.selectedOperation}(old, circle);
                return sub;
                }`    
                
        } else if(this.menu.selectedShape === "rectangle" && doKeep) { 
            nextFigureDesctiption = `
                float figure_part_${this.nextFigureNumber}(vec2 position) {
                vec2 position2 = translate(position,vec2(${rectX},${rectY}));
                float rectangle = distanceToRectangle(position2, vec2(${width}, ${height}));
                float old = figure_part_${this.nextFigureNumber-1}(position);
                float sub = ${this.menu.selectedOperation}(old, rectangle);
                return sub;
                }`        
            this.lastFigure = `figure_part_${this.nextFigureNumber}(position);`
            this.history.addHistoryButton()


        } else if(this.menu.selectedShape === "rectangle" && !doKeep) {
            nextFigureDesctiption = `
                float figure_part_${this.nextFigureNumber}(vec2 position) {
                vec2 position2 = translate(position,vec2(${rectX},${rectY}));
                float rectangle = distanceToRectangle(position2, vec2(${width}, ${height}));
                float old = ${this.lastFigure};
                float sub = ${this.menu.selectedOperation}(old, rectangle);
                return sub;
                }`                
        }

        this.localFigureDescription = this.scene.glsl.figureDescription + nextFigureDesctiption

        if(doKeep) {
            this.nextFigureNumber += 1
            this.scene.glsl.figureDescription = this.localFigureDescription
        }

        this.drawAllShapes(this.history.operationNumber - 1)

    }
}
