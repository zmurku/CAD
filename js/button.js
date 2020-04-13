
let shapesPanel        = document.getElementById('button-panel')  
let operationsPanel    = document.getElementById('button-panel-2') 

// ===============
// === Buttons ===
// ===============

class Button {
	constructor(name) {
		this.isPressed       = false
		this.isHovered       = false 
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


class ButtonPanel {
	constructor() {
		this.buttons = []
	}
	
	addButton(name) {
		let newButton = new Button(name)
		this.buttons.push(newButton)
		newButton.addOnPress(function() { console.log("hello world")} )
		return newButton
	}
}

// ===================
// === New Buttons ===
// ===================

let shapesButtonPanel = new ButtonPanel()
let buttonCircle = shapesButtonPanel.addButton("circle")
let buttonRectangle = shapesButtonPanel.addButton("rectangle")
let buttonTriangle = shapesButtonPanel.addButton("triangle")

buttonCircle.addOnPress(() => {
	buttonRectangle.release()
	buttonTriangle.release()
})

buttonRectangle.addOnPress(() => {
	buttonCircle.release()
	buttonTriangle.release()
})

buttonTriangle.addOnPress(() => {
	buttonRectangle.release()
	buttonCircle.release()
})

shapesPanel.appendChild(buttonCircle.domElement)
shapesPanel.appendChild(buttonRectangle.domElement)
shapesPanel.appendChild(buttonTriangle.domElement)

let buttonMerge     = new Button("merge")
let buttonSubtract  = new Button("subtract")
let buttonIntersect = new Button("intersect")

buttonMerge.addOnPress(() => {
	buttonSubtract.release()
	buttonIntersect.release()
})

buttonIntersect.addOnPress(() => {
	buttonSubtract.release()
	buttonMerge.release()
})

buttonSubtract.addOnPress(() => {
	buttonMerge.release()
	buttonIntersect.release()
})

operationsPanel.appendChild(buttonMerge.domElement)
operationsPanel.appendChild(buttonSubtract.domElement)
operationsPanel.appendChild(buttonIntersect.domElement)



let extensions = {
	derivatives: true
}



let nextFigureNumber       = 1 
let lastFigure             = `figure_part_0(position)`   
let mouseClickPositionX    = 0
let mouseClickPositionY    = 0
let clickDistance          = 0
let localFigureDescription = 0

function formatNumber(num) {
	if(num%1 === 0){
		return num+".0"
	} else {
		return num.toString()
	}	
}


canvas.addEventListener('mousedown', function(e) {
	mouseClickPositionX = e.offsetX
	mouseClickPositionY = canvasHeight - e.offsetY 
	mouse.isDown = true
})

canvas.addEventListener('mouseup', function(e) {
	mouse.isDown = false
	addNewOperation(true)
})

canvas.addEventListener('mousemove', function(e) {
    if(mouse.isDown) {
		mouse.distX    = e.offsetX - mouseClickPositionX
		mouse.distY    = (canvasHeight - e.offsetY) - mouseClickPositionY
		let distanceXY = (Math.sqrt(mouse.distX*mouse.distX + mouse.distY*mouse.distY))
		clickDistance  = distanceXY 
		addNewOperation(false)
	}
})

let historyButtonNumber        = 0
let figureNumber               = 0
let operationNumber            = 1 
function addHistoryButton() {
	let historyButton          = new Button("operation " + operationNumber,"history")
	let currentOperationNumber = operationNumber
	historyButton.addOnPress(() => {
		drawingAllShapes(currentOperationNumber)
	})
	historyButton.press()
	historyButtonPanel.appendChild(historyButton.domElement)
	operationNumber            = operationNumber + 1
	historyButtonNumber        = historyButtonNumber + 1
}