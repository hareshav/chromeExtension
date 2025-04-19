document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.getElementById('mainContent');
    const status = document.getElementById('status');
    const suggestionsToggle = document.getElementById('suggestionsToggle');
    let suggestionsEnabled = true;

    // Function to update content
    function updateContent() {
        const content = mainContent.value.trim();
        
        // Save content to storage
        chrome.storage.local.set({ mainContent: content }, function() {
            // Notify content script
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.scripting.executeScript({
                    target: {tabId: tabs[0].id},
                    function: () => {
                        // Notify the content script to update recommendations
                        document.dispatchEvent(new CustomEvent('contentUpdated'));
                    }
                });
            });

            // Show brief status
            status.textContent = 'Content updated';
            status.className = 'status-message success';
            setTimeout(() => {
                status.className = 'status-message';
            }, 1000);
        });
    }

    // Initialize toggle state from storage
    chrome.storage.local.get(['suggestionsEnabled'], function(result) {
        suggestionsEnabled = result.suggestionsEnabled !== false;
        suggestionsToggle.checked = suggestionsEnabled;
    });

    // Handle toggle changes
    suggestionsToggle.addEventListener('change', function() {
        suggestionsEnabled = this.checked;
        chrome.storage.local.set({ suggestionsEnabled });
        
        // Send message to content script to update suggestion state
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'toggleSuggestions',
                enabled: suggestionsEnabled
            });
        });
    });

    // Handle content changes with debounce
    let updateTimeout;
    mainContent.addEventListener('input', () => {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(updateContent, 500); // Update after 500ms of no typing
    });

    // Load any previously saved content
    chrome.storage.local.get(['mainContent'], function(result) {
        if (result.mainContent) {
            mainContent.value = result.mainContent;
        }
    });
});
