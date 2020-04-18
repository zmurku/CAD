
class View {
    constructor() {
        this.nextFigureNumber       = 1 
        this.lastFigure             = `figure_part_0(position)`   
        this.localFigureDescription = 0

        scene.canvas.addEventListener('mousedown', function(e) {
            mouseClickPositionX = e.offsetX
            mouseClickPositionY = canvasHeight - e.offsetY 
            mouse.isDown        = true
        })

        scene.canvas.addEventListener('mouseup', (e) => {
            mouse.isDown = false
            this.addNewOperation(true)
        })

        scene.canvas.addEventListener('mousemove', (e) => {
            if(mouse.isDown) {
                    mouse.distX    = e.offsetX - mouseClickPositionX
                    mouse.distY    = (canvasHeight - e.offsetY) - mouseClickPositionY
                    let distanceXY = (Math.sqrt(mouse.distX*mouse.distX + mouse.distY*mouse.distY))
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
    
        let fragmentShader2 = fragmentShaderHeader + this.localFigureDescription + 
                              codeForTranslatingAllShapesToColor + fragmentShaderEnding 
        let material2       = new THREE.ShaderMaterial({vertexShader:vertexShader,
                              fragmentShader:fragmentShader2,extensions})
        mesh.material       = material2
    
    } 
    
    
    addNewOperation(doKeep) {
        let size = 0
        let invalidInput = !shape || !operation
        if (invalidInput) return  
        let nextFigureDesctiption = null
        let x = mouseClickPositionX
        let y = mouseClickPositionY
        let width  = Math.abs(mouse.distX)
        let height = Math.abs(mouse.distY)
        let rectX  = mouseClickPositionX + width/2
        let rectY  = mouseClickPositionY + height/2
        size = formatNumber(this.clickDistance)

        if(mouse.distY < 0) { rectY = rectY - height }
        if(mouse.distX < 0) { rectX = rectX - width }

        if(shape === "circle" && doKeep) { 
            nextFigureDesctiption = `
                float figure_part_${this.nextFigureNumber}(vec2 position) {
                vec2 position2 = translate(position,vec2(${x},${y}));
                float circle = distanceToCircle(position2, ${size});
                float old = figure_part_${this.nextFigureNumber-1}(position);
                float sub = ${operation}(old, circle);
                return sub;
                }`
            this.lastFigure = `figure_part_${this.nextFigureNumber}(position);`
            addHistoryButton()

        } else if(shape === "circle" && !doKeep) {
            nextFigureDesctiption = `
                float figure_part_${this.nextFigureNumber}(vec2 position) {
                vec2 position2 = translate(position,vec2(${x},${y}));
                float circle = distanceToCircle(position2, ${size});
                float old = ${this.lastFigure};
                float sub = ${operation}(old, circle);
                return sub;
                }`    
                
        } else if(shape === "rectangle" && doKeep) { 
            nextFigureDesctiption = `
                float figure_part_${this.nextFigureNumber}(vec2 position) {
                vec2 position2 = translate(position,vec2(${rectX},${rectY}));
                float rectangle = distanceToRectangle(position2, vec2(${width}, ${height}));
                float old = figure_part_${this.nextFigureNumber-1}(position);
                float sub = ${operation}(old, rectangle);
                return sub;
                }`        
            this.lastFigure = `figure_part_${this.nextFigureNumber}(position);`
            addHistoryButton()


        } else if(shape === "rectangle" && !doKeep) {
            nextFigureDesctiption = `
                float figure_part_${this.nextFigureNumber}(vec2 position) {
                vec2 position2 = translate(position,vec2(${rectX},${rectY}));
                float rectangle = distanceToRectangle(position2, vec2(${width}, ${height}));
                float old = ${this.lastFigure};
                float sub = ${operation}(old, rectangle);
                return sub;
                }`                
        }


        this.localFigureDescription = figureDescription + nextFigureDesctiption

        if(doKeep) {
            this.nextFigureNumber += 1
            figureDescription = this.localFigureDescription
        }

        view.drawAllShapes(operationNumber - 1)

    }
}

let view = new View()