class Icons {
    constructor() {
    
    }
    merge() { 
        return `
            <svg height="100%" width="100%" viewBox="0 0 100 130">
            <mask id="myMask">
                <circle cx="70" cy="50" r="200" fill="white" />
                <circle cx="70" cy="50" r="40" fill="black" />
            </mask>
            
            <circle cx="70" cy="50" r="40" fill="#00000040" />
            <circle cx="40" cy="50" r="40" fill="#00000040" />
            <circle cx="40" cy="50" r="40" fill="#00000040" mask="url(#myMask)"
            </svg> 
            `  
        
    }

    intersect() {
        return `
            <svg height="100%" width="100%" viewBox="0 0 100 130">
            <mask id="myMask">
                <circle cx="70" cy="50" r="40" fill="white" />
            </mask>
            
            <circle cx="70" cy="50" r="40" fill="#00000020" />
            <circle cx="40" cy="50" r="40" fill="#00000020" />
            <circle cx="40" cy="50" r="40" fill="#00000040" mask="url(#myMask)"/>
            </svg> 
            `    
    } 

    subtract() {
        return `
            <svg height="100%" width="100%" viewBox="0 0 100 130">
            <mask id="myMask">
                <circle cx="70" cy="50" r="200" fill="white" />
                <circle cx="70" cy="50" r="40" fill="black" />
            </mask>
            
            <circle cx="70" cy="50" r="40" fill="#00000020" />
            <circle cx="40" cy="50" r="40" fill="#00000020" />
            <circle cx="40" cy="50" r="40" fill="#00000040" mask="url(#myMask)"/>
            </svg> 
            ` 
    }
}

