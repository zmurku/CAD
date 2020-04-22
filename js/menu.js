/// A set of two `ButtonPanel`s allowing to choose shape and operation to perform. `Menu` remembers
/// the choosen shape and operation in the `selectedShape` and `selectedOperation` fields 
/// respectively. If no shape oroperation is choosen, the fields are set to `null`.
class Menu {
    constructor(scene) {
        // Tworzenie przycisków w panelu kształtów.
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

        scene.shapesPanelDiv.appendChild(this.buttonCircle.domElement)
        scene.shapesPanelDiv.appendChild(this.buttonRectangle.domElement)
        scene.shapesPanelDiv.appendChild(this.buttonTriangle.domElement)

        // Tworzenie przycisków w panelu operacji.         
        this.operationsButtonPanel = new ButtonPanel()
        this.buttonMerge           = this.operationsButtonPanel.addButton("merge")
        this.buttonSubtract        = this.operationsButtonPanel.addButton("subtract")
        this.buttonIntersect       = this.operationsButtonPanel.addButton("intersect")

        this.selectedOperation = null

        scene.operationsPanelDiv.appendChild(this.buttonMerge.domElement)
        scene.operationsPanelDiv.appendChild(this.buttonSubtract.domElement)
        scene.operationsPanelDiv.appendChild(this.buttonIntersect.domElement)

        this.buttonMerge.addOnPress(()     =>  { this.selectedOperation = "merge" })
        this.buttonSubtract.addOnPress(()  =>  { this.selectedOperation = "subtract" })
        this.buttonIntersect.addOnPress(() =>  { this.selectedOperation = "intersect" })
    }

    // createShapePanel() {
        
    // }
}
