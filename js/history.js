/// A set of buttons that store information about the operation number. After clicking on 
/// the button, the view that has been saved under the button number is displayed.


class HistoryButtonPanel { 
    constructor(canvas, scene) {
       
        this.historyButtonPanelDiv = document.getElementById('history')
        this.historyButtonPanel    = new ButtonPanel()
        this.historyButtonNumber   = 0
        this.canvas = canvas  
        this.scene  = scene
    }
    addHistoryButton(selectedOperation) {
        let objDiv = document.getElementById('history-panel')
        objDiv.scrollTop = objDiv.scrollHeight
        let currentOperationNumber = this.scene.operationNumber 
        this.historyButtonNumber   = this.historyButtonNumber + 1
        let historyButton          = this.historyButtonPanel.addButton(currentOperationNumber + ": "+ selectedOperation,"history")
        this.historyButtonPanelDiv.appendChild(historyButton.domElement)
        //console.log(this.historyButtonPanelDiv)
        historyButton.press()
        historyButton.historyWidth()
        historyButton.addOnPress(() => {
            this.scene.drawAllShapes(currentOperationNumber)
        })
        
    }
    // updateHistoryButtonPanel() {
        
    // }
    
}


