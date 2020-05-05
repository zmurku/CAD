class MousePointer {
    constructor(canvas) {
        this.canvas    = canvas
        this.divCursor = document.createElement("div")
        document.body.appendChild(this.divCursor)
        this.divCursor.innerHTML = this.cursor()
        this.divCursor.style.position="absolute";
        this.cursorPosition()
    }

    cursorPosition() {
        document.body.addEventListener('mousemove', (e) => {
            let cursorWidth  = 44
            let cursorHeight = 44
            let x = e.clientX - cursorWidth/2
            let y = e.clientY - cursorHeight/2
            this.divCursor.style.top  = y + "px"
            this.divCursor.style.left = x + "px"
            this.divCursor.style.pointerEvents = "none"
        })
    }
    cursor() {
        return `
        <svg width="44" height="44">
        <rect x="9"y="21"width="12" height="3" fill="black" />  
        <rect x="10"y="22"width="10" height="1" fill="white" />  
        <rect x="24"y="21"width="12" height="3" fill="black" />  
        <rect x="25"y="22"width="10" height="1" fill="white" /> 
        <rect x="21"y="24"width="3" height="12" fill="black" /> 
        <rect x="22"y="25"width="1" height="10" fill="white" /> 
        <rect x="21"y="9"width="3" height="12" fill="black" />
        <rect x="22"y="10"width="1" height="10" fill="white" />
        </svg>`
    }
}

let mousePointer = new MousePointer()
