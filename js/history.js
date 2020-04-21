
class History {
    constructor(scene, view) {
        this.historyButtonPanelDiv = document.getElementById('history-button-panel')
        this.historyButtonPanel    = new ButtonPanel()
        this.historyButtonNumber   = 0
        this.operationNumber       = 1
        this.scene = scene  
        this.view = view
    }
    addHistoryButton() {
        let historyButton          = this.historyButtonPanel.addButton("operation " + this.operationNumber,"history")
        let currentOperationNumber = this.operationNumber 
        this.operationNumber       = this.operationNumber + 1
        this.historyButtonNumber   = this.historyButtonNumber + 1
        this.historyButtonPanelDiv.appendChild(historyButton.domElement)
        historyButton.press()
        historyButton.addOnPress(() => {
            this.view.drawAllShapes(currentOperationNumber)
        })
       
    }
}
