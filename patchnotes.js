// Patch notes data
const PATCH_NOTES = [
    {
        version: "0.0.1",
        date: "May 13, 2025",
        changes: [
            "Initial Alpha Build Released",
            "Implemented Functional Axe Upgrades",
            "Implemented Materials System to Upgrade Axe",
            "Implemented first Enemies and Mutations"
        ]
    }
];

// Function to get all patch notes
function getAllPatchNotes() {
    return PATCH_NOTES;
}

// Function to get the latest patch notes
function getLatestPatchNotes(count = 1) {
    return PATCH_NOTES.slice(0, count);
}

// Function to display patch notes in the UI
function displayPatchNotes(elementId, count = 3) {
    const patchNotesElement = document.getElementById(elementId);
    if (!patchNotesElement) return;
    
    const notes = count ? getLatestPatchNotes(count) : getAllPatchNotes();
    
    patchNotesElement.innerHTML = '';
    
    notes.forEach(patch => {
        const patchElement = document.createElement('div');
        patchElement.className = 'patch-note';
        
        const headerElement = document.createElement('div');
        headerElement.className = 'patch-header';
        
        const versionElement = document.createElement('span');
        versionElement.className = 'patch-version';
        versionElement.textContent = `v${patch.version}`;
        
        const dateElement = document.createElement('span');
        dateElement.className = 'patch-date';
        dateElement.textContent = patch.date;
        
        headerElement.appendChild(versionElement);
        headerElement.appendChild(dateElement);
        
        const changesList = document.createElement('ul');
        changesList.className = 'patch-changes';
        
        patch.changes.forEach(change => {
            const changeItem = document.createElement('li');
            changeItem.textContent = change;
            changesList.appendChild(changeItem);
        });
        
        patchElement.appendChild(headerElement);
        patchElement.appendChild(changesList);
        
        patchNotesElement.appendChild(patchElement);
    });
}