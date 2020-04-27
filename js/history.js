/// A set of buttons that store information about the operation number. After clicking on 
/// the button, the view that has been saved under the button number is displayed.
class HistoryButtonPanel { 
    constructor(canvas, scene) {
        this.historyButtonPanelDiv = document.getElementById('history-panel')
        this.historyButtonPanel    = new ButtonPanel()
        this.historyButtonNumber   = 0
        this.operationNumber       = 1
        this.canvas = canvas  
        this.scene  = scene
    }
    addHistoryButton() {
        let historyButton          = this.historyButtonPanel.addButton("operation " + this.operationNumber,"history")
        let currentOperationNumber = this.operationNumber 
        this.operationNumber       = this.operationNumber + 1
        this.historyButtonNumber   = this.historyButtonNumber + 1
        console.log(this.historyButtonPanelDiv)
        this.historyButtonPanelDiv.appendChild(historyButton.domElement)
        historyButton.press()
        historyButton.addOnPress(() => {
            this.scene.drawAllShapes(currentOperationNumber)
        })
       
    }
}
