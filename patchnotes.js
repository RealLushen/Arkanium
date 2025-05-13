// Patch notes data
const PATCH_NOTES = [
    {
        version: "0.0.3",
        date: "13.05.2025",
        changes: [
            "The big UI-Update!",
            "Changed Game Color Scheme to Darker",
            "Changed Background to Image instead of Color"
        ]
    },
    {
        version: "0.0.2",
        date: "13.05.2025",
        changes: [
            "Added 30 new Enemies (5 per Tier)",
            "Reduced Material Drop Rates by 50%",
            "Reduced Axe Damage per Upgrade by 30%",
            "Changed the Defend Mechanic to Flat Reduction",
            "Added a Indicator Ingame to show active Block",
            "Updated Mutations to fit to the new Block Modifier"
        ]
    },
    {
        version: "0.0.1",
        date: "13.05.2025",
        changes: [
            "Initial Alpha Build Release",
            "Implemented Enemy Battle Logic",
            "Implemented Scripts for Axe Upgrading",
            "Implemented Mutation System"
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
        
        const versionElement = document.createElement('div');
        versionElement.className = 'patch-version';
        versionElement.textContent = `v${patch.version}`;
        
        const dateElement = document.createElement('div');
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