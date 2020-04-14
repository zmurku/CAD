class Button {
    constructor(name) {
        this.isPressed       = false
        this.isHovered       = false 
        this.whenReleaseRegistry = []
        this.onPressRegistry = []
        this.name            = name
        let divElement       = document.createElement("div")
        divElement.id        = this.name
        divElement.innerText = this.name
        divElement.style.setProperty("background-color", "#888888")
        divElement.style.setProperty("width", "100px")
        divElement.style.setProperty("height", "64px")
        divElement.style.setProperty("display", "inline-block")

        divElement.addEventListener("mouseover" , () => { this.over() })
        divElement.addEventListener("mouseout"  , () => { this.out() })
        divElement.addEventListener("mousedown" , () => { this.toggle() })
        
        this.domElement = divElement
    }

        
    /// Wciska przycisk i wykonuje wszystkie callbaci zarejestrowane w `onPressRegistry`.
    press() {
        // dla kazdej funkcji `f`, bedacej elementem `onPressRegistry` wykonuje ja.
        for(let f of this.onPressRegistry){
            f()
        }
        this.isPressed = true
        this._updateStyle()
    }

    

    /// Wyciska przycisk.
    release() {
        for(let f of this.whenReleaseRegistry){
            f()
        }
        this.isPressed = false 
        this._updateStyle()
    }

    /// Wciska przycisk, kiedy nie jest wciśnięty i wyciska go, gdy jest wciśnięty.
    toggle() {
        if(this.isPressed) {
            this.release()
        } else {
            this.press()
        }
    }

    /// Ustawia przycisk w trybie "najechania".
    over() {
        this.isHovered = true
        this._updateStyle()
    }

    /// Ustawia przycisk w trybie "zjechania".
    out() {
        this.isHovered = false
        this._updateStyle()
    }

    /// Przyjmuje callback, który zostanie wykonany po wciśnięciu przycisku. 
    addOnPress(f) {
        this.onPressRegistry.push(f)
    }    

    whenRelease(f) {
        this.whenReleaseRegistry.push(f)
    }  
  

    _updateStyle() {
        let darkBlue  = "#003B62"
        let lightBlue = "#53B3E1"
        let darkGray  = "#888888"
        let lightGray = "#AAAAAA"

        let color = null

        if     ( this.isPressed &&  this.isHovered) { color = lightBlue }
        else if( this.isPressed && !this.isHovered) { color = darkBlue }
        else if(!this.isPressed &&  this.isHovered) { color = lightGray }
        else                                        { color = darkGray }

        this.domElement.style.setProperty("background-color", color)
    }

}

// Allows creating new buttons. Remembers them and in case a button is pressed, makes all other
// buttons released.
class ButtonPanel {
    constructor() {
        this.buttons = []
    }
    
    /// Creates a new button in this panel.
    addButton(name) {
        let newButton = new Button(name)
        this.buttons.push(newButton)
        newButton.addOnPress(() => { 
            for(let button of this.buttons) {
                button.release()
            }
        })
        return newButton
        
    }
}



