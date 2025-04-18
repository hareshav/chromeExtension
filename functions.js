function getPageContent() {
    // Try to get the most relevant content from the page
    let content = '';
    
    // First try: Look for main content containers
    const mainElements = document.querySelectorAll('main, article, [role="main"], .main-content, #main-content, .content, #content');
    if (mainElements.length > 0) {
        // Use the first main element found
        content = mainElements[0].textContent;
    }
    
    // If no main content found, try to get content from the body
    if (!content) {
        // Get all text nodes from the body, excluding scripts, styles, etc.
        const bodyText = document.body.textContent;
        
        // Remove common unwanted elements
        const unwantedElements = document.querySelectorAll('script, style, noscript, [aria-hidden="true"]');
        unwantedElements.forEach(el => {
            content += el.textContent;
        });
        
        // Get remaining text
        content = bodyText.replace(content, '');
    }
    
    // Clean up the content
    content = content
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();
    
    // Limit content length to prevent overwhelming the API
    const maxLength = 2000;
    if (content.length > maxLength) {
        content = content.substring(0, maxLength) + '...';
    }
    
    return content;
}