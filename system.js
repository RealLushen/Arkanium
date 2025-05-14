// Basic console protection system
(function() {
    // Detect and warn when console is open
    let consoleIsOpen = false;
    
    // Method 1: Check for opening developer tools via resize
    const THRESHOLD = 160;
    const devToolsDetection = () => {
        const widthThreshold = window.outerWidth - window.innerWidth > THRESHOLD;
        const heightThreshold = window.outerHeight - window.innerHeight > THRESHOLD;
        
        if (widthThreshold || heightThreshold) {
            if (!consoleIsOpen) {
                consoleIsOpen = true;
                // You can trigger actions when console is detected
                console.log("%c⚠️ Console detected! ⚠️", "color:red; font-size:24px; font-weight:bold;");
                console.log("%cThis is a feature for developers only. Using this to modify game data will corrupt your save file.", "color:red; font-size:16px;");
            }
        } else {
            consoleIsOpen = false;
        }
    };
    
    // Method 2: Console debugging protection
    setInterval(function() {
        try {
            const x = document.createElement('div');
            Object.defineProperty(x, 'id', {
                get: function() {
                    consoleIsOpen = true;
                    console.log("%c⚠️ Console detected! ⚠️", "color:red; font-size:24px; font-weight:bold;");
                    console.log("%cThis is a feature for developers only. Using this to modify game data will corrupt your save file.", "color:red; font-size:16px;");
                }
            });
            console.log(x);
        } catch(e) {}
    }, 1000);
    
    // Check at regular intervals for developer tools
    window.addEventListener('resize', devToolsDetection);
    setInterval(devToolsDetection, 1000);
    
    // Block keyboard shortcuts to open developer tools
    document.addEventListener('keydown', function(event) {
        // F12 key
        if (event.keyCode === 123) {
            event.preventDefault();
            console.log("%c⚠️ Developer Tools should not be used. ⚠️", "color:red; font-size:24px; font-weight:bold;");
            return false;
        }
        
        // Ctrl+Shift+I or Ctrl+Shift+J or Ctrl+Shift+C (Chrome, Firefox, Edge)
        if ((event.ctrlKey && event.shiftKey && (event.keyCode === 73 || event.keyCode === 74 || event.keyCode === 67))) {
            event.preventDefault();
            console.log("%c⚠️ Developer Tools should not be used. ⚠️", "color:red; font-size:24px; font-weight:bold;");
            return false;
        }
        
        // Ctrl+Shift+K (Firefox specific)
        if (event.ctrlKey && event.shiftKey && event.keyCode === 75) {
            event.preventDefault();
            return false;
        }
        
        // Context menu
        if (event.keyCode === 93 || (event.ctrlKey && event.keyCode === 93)) {
            event.preventDefault();
            return false;
        }
    });
    
    // Also prevent right-click context menu which could be used to access dev tools
    document.addEventListener('contextmenu', function(event) {
        // Allow right-clicking on links with href attributes
        if (event.target.tagName === 'A' && event.target.getAttribute('href')) {
            return true;
        }
        event.preventDefault();
        return false;
    });
    
    console.log("Basic protection system initialized");
})();