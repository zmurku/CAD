
class History {
    constructor(scene, view) {
        this.view = view
        this.historyButtonPanelDiv = document.getElementById('history-button-panel')
        this.scene = scene
        this.historyButtonPanel  = new ButtonPanel()
        this.historyButtonNumber = 0
        this.operationNumber     = 1
    }
    addHistoryButton() {
        let historyButton          = this.historyButtonPanel.addButton("operation " + this.operationNumber,"history")
        let currentOperationNumber = this.operationNumber
        historyButton.press()
        historyButton.addOnPress(() => {
            this.view.drawAllShapes(currentOperationNumber)
        })
        this.historyButtonPanelDiv.appendChild(historyButton.domElement)
        this.operationNumber     = this.operationNumber + 1
        this.historyButtonNumber = this.historyButtonNumber + 1
    }
}


