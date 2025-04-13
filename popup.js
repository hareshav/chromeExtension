document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.getElementById('mainContent');
    const status = document.getElementById('status');

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
