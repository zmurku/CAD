class Icons {
    constructor() {
    
    }
    merge() { 
        return `
            <svg height="100%" width="100%" viewBox="0 0 100 130">
            <mask id="myMask1">
            <circle cx="80" cy="50" r="200" fill="white" />
            <circle cx="80" cy="50" r="40" fill="black" />
            </mask>
            
            <circle cx="80" cy="50" r="40" fill="#FFFFFFFF" />
            <circle cx="40" cy="50" r="40" fill="#FFFFFFFF" />
            <circle cx="40" cy="50" r="40" fill="#FFFFFFFF" mask="url(#myMask1)"
            </svg> 
            `  
        
    }

    intersect() {
        return `
            <svg height="100%" width="100%" viewBox="0 0 100 130">
            <mask id="myMask2">
            <circle cx="80" cy="50" r="40" fill="white" />
            </mask>
            
            <circle cx="80" cy="50" r="40" fill="#FFFFFF40" />
            <circle cx="40" cy="50" r="40" fill="#FFFFFF40" />
            <circle cx="40" cy="50" r="40" fill="#FFFFFFFF" mask="url(#myMask2)"/>
            </svg> 
            `    
    } 

    subtract() {
        return `
            <svg height="100%" width="100%" viewBox="0 0 100 130">
            <mask id="myMask3">
            <circle cx="80" cy="50" r="200" fill="white" />
            <circle cx="80" cy="50" r="40" fill="black" />
            </mask>
            
            <circle cx="80" cy="50" r="40" fill="#FFFFFF40" />
            <circle cx="40" cy="50" r="40" fill="#FFFFFF40" />
            <circle cx="40" cy="50" r="40" fill="#FFFFFFFF" mask="url(#myMask3)"/>
            </svg> 
            ` 
    }

    circle() {
        return `
            <svg height="100%" width="100%" viewBox="0 0 100 130">
            <circle cx="40" cy="50" r="40" fill="#FFFFFFFF" />
            </svg> 
            `
    }

    rectangle() {
        return `
        <svg height="100%" width="100%" viewBox="0 -13 100 130">
        <rect cx="40" cy="50" width="75" height="75" fill="#FFFFFFFF" />  
        </svg>
        `
    }
}

