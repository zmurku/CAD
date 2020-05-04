/// Visual button element which you can register callbacks to after a specific action it has done, 
/// like the button was clicked.
class Button {
    constructor(name) {
        this.isPressed       = false
        this.isHovered       = false 
        this.onPressRegistry = []
        this.name            = name
        this.divElement      = document.createElement("div")
        this.divElement.id        = this.name
        this.divElement.innerText = this.name    
        this.whenReleaseRegistry  = []
        this.divElement.style.setProperty("background-color", "#00000000")
        this.divElement.style.setProperty("width", "63px")
        this.divElement.style.setProperty("height", "44px")
        this.divElement.style.setProperty("display", "inline-block")
        this.divElement.addEventListener("mouseover" , () => { this.over() })
        this.divElement.addEventListener("mouseout"  , () => { this.out() })
        this.divElement.addEventListener("mousedown" , () => { this.toggle() })
        this.domElement = this.divElement
    }

    press() {
        for(let f of this.onPressRegistry) {
            f()
        }
        this.isPressed = true
        // this._updateStyle()
        this.updateOpacity()
    }

    release() {
        for(let f of this.whenReleaseRegistry) {
            f()
        }
        this.isPressed = false 
        // this._updateStyle()
        this.updateOpacity()
    }

    toggle() {
        if(this.isPressed) {
            this.release()
        } else {
            this.press()
        }
    }

    over() {
        this.isHovered = true
        // this._updateStyle()
        this.updateOpacity()
    }

    out() {
        this.isHovered = false
        // this._updateStyle()
        this.updateOpacity()
    }

    addOnPress(f) {
        this.onPressRegistry.push(f)
    }    

    whenRelease(f) {
        this.whenReleaseRegistry.push(f)
    }  

    setIcon(svg) {
        this.divElement.innerHTML = svg   
        this.updateOpacity()
    }

    historyWidth() {
        this.divElement.style.setProperty("width", "150px")
    }

    // _updateStyle() {
    //     let darkBlue  = "#003B62"
    //     let lightBlue = "#53B3E1"
    //     let darkGray  = "#888888"
    //     let lightGray = "#AAAAAA"

    //     let color = null

    //     if     ( this.isPressed &&  this.isHovered) { color = lightBlue }
    //     else if( this.isPressed && !this.isHovered) { color = darkBlue }
    //     else if(!this.isPressed &&  this.isHovered) { color = lightGray }
    //     else                                        { color = darkGray }

    //     this.domElement.style.setProperty("background-color", color)
    // }

    updateOpacity() {
        let opacity = 0.2
        if     ( this.isPressed &&  this.isHovered) { opacity = 1.0 }
        else if( this.isPressed && !this.isHovered) { opacity = 1.0 }
        else if(!this.isPressed &&  this.isHovered) { opacity = 0.3 }
        else                                        { opacity = 0.3 }
        this.domElement.style.setProperty("opacity", opacity)
    }

}

/// Set of buttons where only one button can be pressed.
class ButtonPanel {
    constructor() {
        this.buttons = []
    }
    
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
