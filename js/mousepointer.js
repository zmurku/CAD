class MousePointer {
    constructor() {
        this.divCursor      = document.createElement("div")
        document.body.appendChild(this.divCursor)
        this.divCursor.innerHTML = this.cursor()
      
    }
    cursor() {
        return `
        <svg width="40" height="40">
        <rect x="8"y="20"width="10" height="2" fill="black" />  
        <rect x="24"y="20"width="10" height="2" fill="black" />  
        <rect x="20"y="24"width="2" height="10" fill="black" /> 
        <rect x="20"y="8"width="2" height="10" fill="black" />
        </svg>`
    }
}

let mousePointer = new MousePointer()
