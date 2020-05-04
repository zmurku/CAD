/// Scene is responsible for drawing and displaying figures.
class Scene{ 
    constructor(canvas, menu) {
        this.canvas = canvas
        this.menu = menu
        this.nextFigureNumber       = 1 
        this.lastFigureNumber             = `figure_part_0(position)`   
        this.localFigureDescription = 0
        this.mouse = new Mouse()
        this.historyButtonPanel    = new HistoryButtonPanel(canvas, this)
        this.operationNumber       = 0

        

        canvas.sceneSize.addEventListener('mousedown', (e) => {
            this.mouse.clickPositionX = e.offsetX
            this.mouse.clickPositionY = canvas.myCanvas.height - e.offsetY 
            this.mouse.isDown         = true
        })

        canvas.sceneSize.addEventListener('mouseup', (e) => {
            this.mouse.isDown = false
            this.addNewOperation(true)
        })

        canvas.sceneSize.addEventListener('mousemove', (e) => {
            if(this.mouse.isDown) {
                this.mouse.distX    = e.offsetX - this.mouse.clickPositionX
                this.mouse.distY    = (canvas.myCanvas.height - e.offsetY) - this.mouse.clickPositionY
                let distanceXY      = (Math.sqrt(this.mouse.distX*this.mouse.distX + 
                                      this.mouse.distY*this.mouse.distY))
                this.clickDistance  = distanceXY 
                this.addNewOperation(false)
            }
        })        

        // document.addEventListener('keydown', (event)=> {
        //     if (event.ctrlKey && event.key === 'z') {
        //         this.operationNumber -= 1
        //         if(this.operationNumber < 0) {
        //             this.operationNumber += 1
        //             return undefined
        //         } else {
        //             this.drawAllShapes(this.operationNumber)
        //         }
        //     } else if(event.ctrlKey && event.key === 'y') {
        //         this.operationNumber += 1
        //         if(this.operationNumber < this.nextFigureNumber) {
        //             this.drawAllShapes(this.operationNumber)
        //         } else {
        //             this.operationNumber -= 1
        //             return undefined
        //         }
        //     }    
        // });

        document.addEventListener('keydown', (event)=> {
            console.log(event)
            if (event.ctrlKey && event.key === 'z') {
               this.undo()
            } else if(event.ctrlKey && event.key === 'y') {
                this.redo()
            }    
        })
    }

    undo() {
        if(this.operationNumber > 0) {
            this.operationNumber -= 1
            this.drawAllShapes(this.operationNumber)
        }
    }

    redo() {
        if(this.operationNumber < this.nextFigureNumber - 1) {
            this.operationNumber += 1
            this.drawAllShapes(this.operationNumber)
        }
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
    
        let fragmentShader2 = this.canvas.glslTemplate.fragmentShaderHeader + this.localFigureDescription + 
                              codeForTranslatingAllShapesToColor + this.canvas.glslTemplate.fragmentShaderEnding 
        let material2       = new THREE.ShaderMaterial({vertexShader:this.canvas.glslTemplate.vertexShader,
                              fragmentShader:fragmentShader2,extensions})

        this.canvas.mesh.material       = material2
    
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
                float current_figure = figure_part_${this.nextFigureNumber - 1}(position);
                float sub = ${this.menu.selectedOperation}(current_figure, circle);
                return sub;
                }`
            

        } else if(this.menu.selectedShape === "circle" && !doKeep) {
            nextFigureDesctiption = `
                float figure_part_${this.nextFigureNumber}(vec2 position) {
                vec2 position2 = translate(position,vec2(${x},${y}));
                float circle = distanceToCircle(position2, ${size});
                float current_figure = ${this.lastFigureNumber};
                float sub = ${this.menu.selectedOperation}(current_figure, circle);
                return sub;
                }`    
            

        } else if(this.menu.selectedShape === "rectangle" && doKeep) { 
            nextFigureDesctiption = `
                float figure_part_${this.nextFigureNumber}(vec2 position) {
                vec2 position2 = translate(position,vec2(${rectX},${rectY}));
                float rectangle = distanceToRectangle(position2, vec2(${width}, ${height}));
                float current_figure = figure_part_${this.nextFigureNumber-1}(position);
                float sub = ${this.menu.selectedOperation}(current_figure, rectangle);
                return sub;
                }`        
        


        } else if(this.menu.selectedShape === "rectangle" && !doKeep) {
            nextFigureDesctiption = `
                float figure_part_${this.nextFigureNumber}(vec2 position) {
                vec2 position2 = translate(position,vec2(${rectX},${rectY}));
                float rectangle = distanceToRectangle(position2, vec2(${width}, ${height}));
                float current_figure = ${this.lastFigureNumber};
                float sub = ${this.menu.selectedOperation}(current_figure, rectangle);
                return sub;
                }`                
        }

        this.localFigureDescription = this.canvas.glslTemplate.figureDescription + nextFigureDesctiption


        if(doKeep) {
            this.lastFigureNumber = `figure_part_${this.nextFigureNumber}(position);`
            this.historyButtonPanel.addHistoryButton(this.menu.selectedOperation)
            this.operationNumber  = this.nextFigureNumber
            this.nextFigureNumber += 1
            this.canvas.glslTemplate.figureDescription = this.localFigureDescription
            this.drawAllShapes(this.operationNumber)
        } else {
            let dontKeepNextFigureDescription = this.localFigureDescription
            dontKeepNextFigureDescription = this.canvas.glslTemplate.figureDescription + nextFigureDesctiption
            this.drawAllShapes(this.operationNumber + 1)

        } 

    }
}
