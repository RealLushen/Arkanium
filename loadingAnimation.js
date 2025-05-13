// Loading animation script
document.addEventListener('DOMContentLoaded', function() {
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    
    // Create logo container for animation
    const logoContainer = document.createElement('div');
    logoContainer.className = 'loading-logo-container';
    
    // Create logo image
    const logoImage = document.createElement('img');
    logoImage.src = 'logo.png';
    logoImage.alt = 'Arkanium';
    logoImage.className = 'loading-logo';
    
    // Add logo to container
    logoContainer.appendChild(logoImage);
    
    // Add container to overlay
    loadingOverlay.appendChild(logoContainer);
    
    // Add overlay to body
    document.body.appendChild(loadingOverlay);
    
    // Hide main content initially
    const mainContainer = document.querySelector('.container');
    if (mainContainer) {
        mainContainer.style.opacity = '0';
    }
    
    // Start animation sequence
    setTimeout(() => {
        // Add pulsate class to logo
        logoImage.classList.add('pulsate');
        
        // After pulsate animation, move logo to header position
        setTimeout(() => {
            logoImage.classList.remove('pulsate');
            logoContainer.classList.add('move-to-header');
            
            // Start fading in the main content
            setTimeout(() => {
                if (mainContainer) {
                    mainContainer.style.opacity = '1';
                    mainContainer.style.transition = 'opacity 0.8s ease-in-out';
                }
                
                // Finally, remove the loading overlay
                setTimeout(() => {
                    loadingOverlay.style.opacity = '0';
                    setTimeout(() => {
                        document.body.removeChild(loadingOverlay);
                    }, 500);
                }, 300);
            }, 700);
        }, 800); // Logo pulsate time
    }, 200); // Initial delay
});