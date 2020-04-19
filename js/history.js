
class History {
    constructor() {
        this.historyButtonPanel  = new ButtonPanel()
        this.historyButtonNumber = 0
        this.operationNumber     = 1
    }
    addHistoryButton() {
        let historyButton          = this.historyButtonPanel.addButton("operation " + this.operationNumber,"history")
        let currentOperationNumber = this.operationNumber
        historyButton.press()
        historyButton.addOnPress(() => {
            view.drawAllShapes(currentOperationNumber)
        })
        scene.historyButtonPanelDiv.appendChild(historyButton.domElement)
        this.operationNumber     = this.operationNumber + 1
        this.historyButtonNumber = this.historyButtonNumber + 1
    }
}

// nie tu
let history = new History()

/// co to tu robi?
window.requestAnimationFrame(() => scene.render)
