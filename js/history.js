// 1. zbior przyciskow
// 2. przechowujainformacje o numerze operacji 
// 3. Po kliknieciu naprzycisk wyswietlany jest widok zapamietany podnumeremprzycisku.

// Po wykonanej operacji tworzy nowy przycisk w panelu historii,
// przypisuje mu numer, pod którym zapamiętany jest aktualny 
// widok (figury wyświetlone na scenie). Umożliwia to cofanie się 
// do poprzednich widoków. 

class History { /// rename -> HistoryButtonPanel
    constructor(scene, view) {
        this.historyButtonPanelDiv = document.getElementById('history-button-panel')
        this.historyButtonPanel    = new ButtonPanel()
        this.historyButtonNumber   = 0
        this.operationNumber       = 1
        this.scene = scene  
        this.view  = view
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
