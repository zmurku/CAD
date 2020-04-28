/// A set of two `ButtonPanel`s allowing to choose shape and operation to perform. `Menu` remembers
/// the chosen shape and operation in the `selectedShape` and `selectedOperation` fields 
/// respectively. If no shape or operation is chosen, the fields are set to `null`.
class Menu {
    constructor(canvas) {
        this.canvas = canvas
        this.createShapesPanel()       
        this.createOperationsPanel()
    }
    createShapesPanel() {
        this.shapesButtonPanel = new ButtonPanel()
        this.buttonCircle      = this.shapesButtonPanel.addButton("circle")
        this.buttonRectangle   = this.shapesButtonPanel.addButton("rectangle")
        this.buttonTriangle    = this.shapesButtonPanel.addButton("triangle")

        this.selectedShape = null

        this.buttonCircle.addOnPress(()    => { this.selectedShape = "circle" })
        this.buttonRectangle.addOnPress(() => { this.selectedShape = "rectangle" })
        this.buttonTriangle.addOnPress(()  => { this.selectedShape = "triangle" })

        this.buttonCircle.whenRelease(()    => { this.selectedShape = null })
        this.buttonRectangle.whenRelease(() => { this.selectedShape = null })
        this.buttonTriangle.whenRelease(()  => { this.selectedShape = null })

        this.canvas.shapesPanelDiv.appendChild(this.buttonCircle.domElement)
        this.canvas.shapesPanelDiv.appendChild(this.buttonRectangle.domElement)
        this.canvas.shapesPanelDiv.appendChild(this.buttonTriangle.domElement)
    }

    createOperationsPanel() {
        let icons = new Icons()
        this.operationsButtonPanel = new ButtonPanel()
        this.buttonMerge           = this.operationsButtonPanel.addButton("merge")
        this.buttonSubtract        = this.operationsButtonPanel.addButton("subtract")
        this.buttonIntersect       = this.operationsButtonPanel.addButton("intersect")
        this.buttonMerge.setIcon(icons.merge())
        this.buttonIntersect.setIcon(icons.intersect())
        this.buttonSubtract.setIcon(icons.subtract())

        this.selectedOperation = null

        this.canvas.operationsPanelDiv.appendChild(this.buttonMerge.domElement)
        this.canvas.operationsPanelDiv.appendChild(this.buttonSubtract.domElement)
        this.canvas.operationsPanelDiv.appendChild(this.buttonIntersect.domElement)

        this.buttonMerge.addOnPress(()     =>  { this.selectedOperation = "merge" })
        this.buttonSubtract.addOnPress(()  =>  { this.selectedOperation = "subtract" })
        this.buttonIntersect.addOnPress(() =>  { this.selectedOperation = "intersect" })
    }
}
