// Anti-cheat protection system
(function() {
    // Obfuscated key for encryption - this will be minified and harder to find in production
    const ENCRYPTION_KEY = "ark4n1um_g4m3_d4t4_s3cur1ty_k3y";
    
    // Store original localStorage methods
    const originalSetItem = localStorage.setItem;
    const originalGetItem = localStorage.getItem;
    
    // Override localStorage methods with encrypted versions
    localStorage.setItem = function(key, value) {
        // Only encrypt our game data
        if (key === 'arkaniumPlayerData') {
            // Create a checksum before encrypting
            const data = JSON.parse(value);
            data._checksum = generateChecksum(data);
            
            // Encrypt the data
            const encryptedValue = encrypt(JSON.stringify(data), ENCRYPTION_KEY);
            originalSetItem.call(localStorage, key, encryptedValue);
        } else {
            originalSetItem.call(localStorage, key, value);
        }
    };
    
    localStorage.getItem = function(key) {
        const value = originalGetItem.call(localStorage, key);
        
        // Only decrypt our game data
        if (key === 'arkaniumPlayerData' && value) {
            try {
                // Decrypt the data
                const decryptedValue = decrypt(value, ENCRYPTION_KEY);
                const data = JSON.parse(decryptedValue);
                
                // Verify checksum to detect tampering
                const originalChecksum = data._checksum;
                delete data._checksum;
                const calculatedChecksum = generateChecksum(data);
                
                // If checksums don't match, data has been tampered with
                if (originalChecksum !== calculatedChecksum) {
                    console.error("Data integrity violation detected!");
                    
                    // You could reset the game data here, 
                    // or implement other anti-cheat measures
                    
                    // For this implementation, we'll restore default data
                    const defaultData = {
                        nickname: "Player",
                        highestRound: 0,
                        materials: {
                            gold: 0,
                            iron: 0,
                            titanium: 0
                        },
                        weapon: {
                            level: 1,
                            minDamage: 2,
                            maxDamage: 5,
                            name: 'Rusty Axe',
                            description: 'A weathered axe that has seen better days. Despite its rust, it\'s still sharp enough to cut through flesh.'
                        }
                    };
                    localStorage.setItem('arkaniumPlayerData', JSON.stringify(defaultData));
                    return JSON.stringify(defaultData);
                }
                
                // Add checksum back to avoid formatting differences
                data._checksum = originalChecksum;
                return JSON.stringify(data);
            } catch (e) {
                console.error("Error decrypting data", e);
                return value;
            }
        }
        
        return value;
    };
    
    // Generate a checksum for data
    function generateChecksum(data) {
        // Create a simple hash of the object's important values
        // This isn't cryptographically secure but makes casual tampering harder
        const str = JSON.stringify(data);
        let hash = 0;
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        return hash.toString(16);
    }
    
    // Simple XOR encryption (not secure but adds a layer of obfuscation)
    function encrypt(text, key) {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        // Convert to base64 to make it harder to read
        return btoa(result);
    }
    
    // Simple XOR decryption
    function decrypt(text, key) {
        try {
            // Decode from base64
            const decoded = atob(text);
            let result = '';
            for (let i = 0; i < decoded.length; i++) {
                result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            return result;
        } catch (e) {
            // If decryption fails, return the original text
            return text;
        }
    }
    
    // Add console detection
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
                console.log("%cThis is a feature for developers only. Using this to modify data will delete your save files.", "color:red; font-size:16px;");
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
                    console.log("%cThis is a feature for developers only. Using this to modify data will delete your save files.", "color:red; font-size:16px;");
                }
            });
            console.log(x);
        } catch(e) {}
    }, 1000);
    
    // Check at regular intervals for developer tools
    window.addEventListener('resize', devToolsDetection);
    setInterval(devToolsDetection, 1000);
    
    // Additional protection: Add a hidden input to detect if F12 is pressed
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
    });
    
    console.log("Data protection system initialized");
})();