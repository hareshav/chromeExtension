import { Groq } from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({ 
    apiKey: process.env.GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let popup=null;
async function showPopup(target) {
    // Get the textarea's position
    const rect = target.getBoundingClientRect();
    console.log('Textarea position:', rect);
    // Create popup if it doesn't exist
    if (!popup) {
        popup = document.createElement('div');
        // Position the popup absolutely near the target
        popup.style.position = 'absolute';
        popup.style.zIndex = '9999';
        popup.style.backgroundColor = 'white';
        popup.style.padding = '0px';
        popup.style.borderRadius = '0px';
        popup.style.boxShadow = '0 0px 0px rgba(0,0,0,0.1)';
        document.body.appendChild(popup);
    }

            // Add content and buttons
    console.log('Attempting to get textarea content');
            
    const inputInfo = await getInputInfo(target);
    console.log('Input info:', inputInfo);

    const groqresponse = await getGroqResponse(inputInfo);
    console.log('Groq response:', groqresponse);
    
    popup.innerHTML = `
        
            <style>
                .cascade-suggestion-popup {
                    position: absolute;
                    z-index: 10000;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    padding: 0;
                    width: 300px;
                    max-width: 90vw;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    overflow: hidden;
                    visibility: visible;
                }

                .cascade-suggestion-popup .popup-header {
                    background: #f5f8fa;
                    border-bottom: 1px solid #e1e8ed;
                    padding: 8px 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .cascade-suggestion-popup .popup-title {
                    font-weight: bold;
                    color: #1da1f2;
                }

                .cascade-suggestion-popup .popup-footer {
                    background: #f5f8fa;
                    border-top: 1px solid #e1e8ed;
                    padding: 6px 10px;
                    font-size: 11px;
                    color: #657786;
                    text-align: center;
                }

                .cascade-suggestion-popup .shortcut-hint {
                    font-style: italic;
                }

                .cascade-suggestion-popup .close-btn {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    color: #999;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                }

                .cascade-suggestion-popup .close-btn:hover {
                    background: #e1e8ed;
                    color: #333;
                }

                .cascade-suggestion-popup .suggestion-content {
                    padding: 10px;
                }

                .cascade-suggestion-popup .field-type {
                    color: #888;
                    font-size: 12px;
                    margin-bottom: 5px;
                    text-transform: capitalize;
                }

                .cascade-suggestion-popup .original-question {
                    color: #666;
                    font-style: italic;
                    margin-bottom: 8px;
                    font-size: 13px;
                }

                .cascade-suggestion-popup .suggestion-text {
                    color: #333;
                    margin-bottom: 10px;
                }

                .cascade-suggestion-popup .use-suggestion {
                    background: #2196F3;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                    transition: background 0.2s;
                    width: 100%;
                    margin-top: 8px;
                }

                .cascade-suggestion-popup .use-suggestion:hover {
                    background: #1976D2;
                }

                .cascade-suggestion-popup .main-suggestion {
                    font-weight: bold;
                    padding: 8px;
                    background: #f5f9ff;
                    border-radius: 4px;
                    border-left: 3px solid #2196F3;
                }

                .cascade-suggestion-popup .confidence {
                    font-size: 12px;
                    color: #666;
                    margin-left: 5px;
                }

                .cascade-suggestion-popup .context {
                    font-size: 12px;
                    color: #666;
                    margin: 8px 0;
                    font-style: italic;
                }

                .cascade-suggestion-popup .alternatives {
                    margin-top: 12px;
                }

                .cascade-suggestion-popup .alt-header {
                    font-weight: bold;
                    margin-bottom: 8px;
                    color: #555;
                    font-size: 12px;
                }

                .cascade-suggestion-popup .alt-suggestion {
                    background: #e8f4fd;
                    border: 1px solid #c5e1f9;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.2s;
                    margin-bottom: 6px;
                    display: block;
                    width: 100%;
                    text-align: left;
                    color: #0d47a1;
                }

                .cascade-suggestion-popup .alt-suggestion:hover {
                    background: #c5e1f9;
                    border-color: #90caf9;
                }
            </style>
            <div class="cascade-suggestion-popup">
            <div class="popup-header">
                <span class="popup-title">Suggestions</span>
                <button class="close-btn" title="Close">×</button>
            </div>
            <div class="suggestion-content">
                <p class="original-question">Original Question</p>
                <p class="suggestion-text">${groqresponse.answertext}</p>
                <p class="shortcut-hint">${groqresponse.confidence}</p>
                <button class="use-suggestion" title="useTextBtn">Use Text</button>
            </div>
            <div class="popup-footer">
                <p class="shortcut-hint">Press Esc to close suggestions</p>
            </div>
        </div>
    `;
    console.log('Popup HTML set');
    console.log('Popup exists:', popup !== null);
    
    // Make the popup visible
    popup.style.visibility = 'visible';
    // console.log('Popup content:', popup.innerHTML);

    // Get elements
    const closeBtn = popup.querySelector('button[title="Close"]');
    const useTextBtn = popup.querySelector('button[title="useTextBtn"]');

    // Remove any existing event listeners
    popup.querySelectorAll('button').forEach(button => {
        button.removeEventListener('click', () => {});
    });

    // Add event listeners only if elements exist
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            popup.remove();
            popup = null;
        });
    }
    
    if (useTextBtn) {
        useTextBtn.addEventListener('click', async () => {
            try {
                // Set the textarea value
                target.value = groqresponse.answer;
                
                // Focus the textarea and select the text
                target.focus();
                target.setSelectionRange(0, target.value.length);
                
                // Clean up the popup
                popup.remove();
                
                // Clean up event listeners
                popup.removeEventListener('click', clickHandler);
                popup = null;
                document.removeEventListener('click', outsideClickHandler);
            } catch (error) {
                console.error('Error setting textarea value:', error);
            }
        });
    }

    // Position the popup below the target input/textarea
    popup.style.top = `${window.scrollY + rect.bottom + 8}px`;
    popup.style.left = `${window.scrollX + rect.left}px`;

    // Add event listeners for the popup
    const clickHandler = (e) => {
        if (e.target === popup) {
            e.stopPropagation();
        }
    };
    
    // Add click outside handler
    const outsideClickHandler = (e) => {
        if (popup && !popup.contains(e.target)) {
            cleanup();
        }
    };
    
    // Clean up when the popup is removed
    const cleanup = () => {
        if (popup) {
            // Clean up event listeners
            popup.removeEventListener('click', clickHandler);
            document.removeEventListener('click', outsideClickHandler);
            
            // Remove popup
            popup.remove();
            popup = null;
        }
    };
    
    // Add event listeners
    popup.addEventListener('click', clickHandler);
    document.addEventListener('click', outsideClickHandler);

    // Add cleanup for when the extension context is invalidated
    chrome.runtime.onConnect.addListener((port) => {
        port.onDisconnect.addListener(cleanup);
    });;
    sleep(1000);
}
document.addEventListener('keydown', function (e) {
    console.log('Key pressed:', e.key,'    Popup:',popup);
    if (e.key === 'Escape' && popup) {
        console.log('ESC key pressed - closing popup');
        popup.remove();
        popup = null;
    }
});

document.addEventListener('click', async (e) => {
    const target = e.target;
    const suggestionsEnabled = await chrome.storage.local.get(['suggestionsEnabled'])    
    console.log('Suggestions enabled:', suggestionsEnabled);
    if (suggestionsEnabled.suggestionsEnabled && (target.tagName.toLowerCase() === 'textarea' || target.tagName.toLowerCase() === 'input')) {
        console.log('Textarea clicked:', target);
        
        // Prevent direct editing of textarea
        e.preventDefault();
        
        // Remove existing popup if it exists
        if (popup) {
            return;
        }
        showPopup(target);
    }
    });



//shortcut
document.addEventListener('keydown', function (e) {
    // console.log('Key pressed:', e);
    if (e.altKey && e.shiftKey && e.key.toLowerCase() === 's') {
    //   const clickedTextarea = document.querySelector('textarea[data-clicked="true"]');
    const suggestionsEnabled = chrome.storage.local.get(['suggestionsEnabled'])   
    console.log('clicked button');
      if (suggestionsEnabled.suggestionsEnabled && document.activeElement.tagName.toLowerCase() === 'textarea'||document.activeElement.tagName.toLowerCase() === 'input') {

        // showPopup(clickedTextarea);
        console.log("key pressed");
        // Reset so it doesn't keep triggering
        showPopup(document.activeElement)
      } 
    }
  });



/*FUNCTIONS TO BE USED FOR ABOVE*/
 
async function getInputInfo(input) {
    // Get the question from the input
    const question = getQuestionFromInput(input);
    
    // Get the page content
    const pageContent = getPageContent();
    
    // Get purpose information
    const purposeInfo = determineInputPurpose(input);
    
    // Get main content from storage
    let mainContent = '';
    try {
        const result = await chrome.storage.local.get('mainContent');
        if (result.mainContent) {
            mainContent = result.mainContent;
        }
    } catch (e) {
        console.error('Error getting main content from storage:', e);
    }
    
    return {
        question: question,
        purpose: purposeInfo.purpose,
        confidence: purposeInfo.confidence,
        attributes: purposeInfo.attributes,
        type: input.type || 'text',
        value: input.value || '',
        pageContent: pageContent,
        mainContent: mainContent || ''
    };
}

function determineInputPurpose(input) {
    const attributes = {};
    
    // Get essential attributes that help identify purpose
    const essentialAttrs = ['id', 'name', 'placeholder', 'aria-label', 'title', 'type', 'class'];
    for (const attr of essentialAttrs) {
        if (input[attr]) attributes[attr] = input[attr];
        else if (input.getAttribute(attr)) attributes[attr] = input.getAttribute(attr);
    }
    
    // Add current value
    attributes.value = input.value || '';
    
    // Get parent form attributes if available
    const parentForm = input.form;
    if (parentForm) {
        if (parentForm.id) attributes.formId = parentForm.id;
        if (parentForm.name) attributes.formName = parentForm.name;
    }
    
    // Analyze purpose based on attributes and context
    let purpose = '';
    let confidence = 'low';
    
    // Check for common patterns in attributes
    const attrValues = Object.values(attributes).join(' ').toLowerCase();
    const nameValue = (attributes.name || '').toLowerCase();
    const idValue = (attributes.id || '').toLowerCase();
    const placeholderValue = (attributes.placeholder || '').toLowerCase();
    const typeValue = (attributes.type || '').toLowerCase();
    
    // Common input purposes
    const patterns = [
        { keywords: ['name', 'fullname', 'full-name', 'full_name', 'firstname', 'lastname'], purpose: 'name input' },
        { keywords: ['email', 'e-mail', 'mail'], purpose: 'email address' },
        { keywords: ['phone', 'mobile', 'cell', 'telephone'], purpose: 'phone number' },
        { keywords: ['age', 'years', 'birthday', 'birth', 'dob', 'date of birth'], purpose: 'age or date of birth' },
        { keywords: ['address', 'street', 'city', 'state', 'zip', 'postal'], purpose: 'address information' },
        { keywords: ['password', 'pwd', 'pass'], purpose: 'password' },
        { keywords: ['username', 'user', 'login', 'account'], purpose: 'username or account identifier' },
        { keywords: ['search', 'find', 'query', 'lookup'], purpose: 'search query' },
        { keywords: ['comment', 'message', 'feedback', 'review'], purpose: 'comment or feedback' },
        { keywords: ['bio', 'about', 'introduction', 'profile', 'description'], purpose: 'biographical information' },
        { keywords: ['company', 'organization', 'business', 'employer'], purpose: 'company or organization name' },
        { keywords: ['title', 'position', 'job', 'role', 'occupation'], purpose: 'job title or position' },
        { keywords: ['website', 'url', 'site', 'homepage'], purpose: 'website URL' },
        { keywords: ['country', 'nation', 'region'], purpose: 'country or region' },
        { keywords: ['gender', 'sex'], purpose: 'gender information' },
        { keywords: ['payment', 'credit', 'card', 'cvv', 'expiry', 'expiration'], purpose: 'payment information' }
    ];
    
    // Check for matches in attributes
    for (const pattern of patterns) {
        for (const keyword of pattern.keywords) {
            if (nameValue.includes(keyword) || 
                idValue.includes(keyword) || 
                placeholderValue.includes(keyword) ||
                attrValues.includes(keyword)) {
                purpose = pattern.purpose;
                confidence = 'high';
                break;
            }
        }
        if (purpose) break;
    }
    
    // If no match found, use input type as fallback
    if (!purpose) {
        if (typeValue === 'email') {
            purpose = 'email address';
            confidence = 'high';
        } else if (typeValue === 'tel') {
            purpose = 'phone number';
            confidence = 'high';
        } else if (typeValue === 'password') {
            purpose = 'password';
            confidence = 'high';
        } else if (typeValue === 'search') {
            purpose = 'search query';
            confidence = 'high';
        } else if (typeValue === 'url') {
            purpose = 'website URL';
            confidence = 'high';
        } else if (typeValue === 'date') {
            purpose = 'date information';
            confidence = 'high';
        } else if (typeValue === 'number') {
            purpose = 'numeric information';
            confidence = 'medium';
        } else if (typeValue === 'checkbox') {
            purpose = 'yes/no selection';
            confidence = 'medium';
        } else if (typeValue === 'radio') {
            purpose = 'option selection';
            confidence = 'medium';
        } else if (typeValue === 'textarea') {
            purpose = 'detailed text information';
            confidence = 'medium';
        } else {
            purpose = 'text information';
            confidence = 'low';
        }
    }
    
    return {
        purpose: purpose,
        confidence: confidence,
        attributes: attributes
    };
}

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

async function getQuestionFromInput(input) {
    let question = '';
    
    // First try: explicit label with 'for' attribute
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) {
        question = label.textContent.trim();
    }
    
    // Second try: placeholder text
    if (!question && input.placeholder) {
        question = input.placeholder.trim();
    }
    
    // Third try: input name
    if (!question && input.name) {
        question = input.name.trim();
    }
    
    // Fourth try: aria-label
    if (!question && input.getAttribute('aria-label')) {
        question = input.getAttribute('aria-label').trim();
    }
    
    // If no question found, generate one based on purpose
    if (!question) {
        const purposeInfo = determineInputPurpose(input);
        question = await generateQuestionFromPurpose(purposeInfo.purpose, input.type);
    }
    
    return question;
}

async function getGroqResponse(inputInfo) {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful assistant that generates relevant answers for form fields.
                    Your response must be ONLY a JSON object with this exact structure:
                    
                    
                    {
                        "answertext": "A direct, concise answer that the user can copy into the form field",
                        "confidence": "A number between 0 and 100",
                        "explanation": "Brief explanation of why this answer is appropriate"
                    }
                    
                    example
                    {
                        "answertext":"text",
                        "confidence":100,
                        "explanation":"reason"
                    }
                    
                    IMPORTANT: ONLY return the JSON object, nothing else.
                    Do not include any explanations or other text outside the JSON.
                    
                    The answer should be concise and directly usable in the form field it should be only string.
                    If the page content contains relevant information that could help answer the question,
                    incorporate that information into your response.
                    
                    If the user has already started typing (current value), use that as a basis for your suggestions.
                    
                    If main content is provided, prioritize using it over page content.`
                },
                {
                    role: 'user',
                    content: `Generate a direct, usable answer for this form field:
                    
                    Question: ${inputInfo.question}
                    Field purpose: ${inputInfo.purpose}
                    Current value: "${inputInfo.value}"
                    
                    Main content (priority):
                    ${inputInfo.mainContent}
                    
                    Page content (fallback):
                    ${inputInfo.pageContent}
                    
                    Based on the question, field purpose, and content, provide a direct answer that the user can enter into this form field.
                    If main content is available, use it as the primary source for generating the answer.
                    If main content is not available or not relevant, use the page content as a fallback.`
                }
            ],
            model: 'llama3-8b-8192',
            temperature: 0.3,
            max_tokens: 100,
            response_format: { type: "json_object" }
        });

        if (!chatCompletion.choices || !chatCompletion.choices[0] || !chatCompletion.choices[0].message) {
            throw new Error('Invalid response format from Groq API');
        }
        // console.log(typeof(chatCompletion.choices[0].message.content));
        // return chatCompletion.choices[0].message.content;
        const responseText = chatCompletion.choices[0].message.content.trim();
        let responseJson;
        try {
            responseJson = JSON.parse(responseText);
            
            // Validate the response structure
            if (!responseJson.answertext || typeof responseJson.confidence !== 'number' || !responseJson.explanation) {
                throw new Error('Invalid response structure');
            }
            
        } catch (e) {
            // If parsing fails, try to extract the JSON object
            const match = responseText.match(/({.*})/);
            if (match) {
                try {
                    responseJson = JSON.parse(match[1]);
                    if (!responseJson.answertext || typeof responseJson.confidence !== 'number' || !responseJson.explanation) {
                        throw new Error('Invalid response structure');
                    }
                } catch {
                    throw new Error('Failed to extract valid JSON');
                }
            } else {
                // If no JSON object found, try to create a fallback response
                const fallbackAnswer = responseText.trim();
                if (fallbackAnswer) {
                    return {
                        answertext: fallbackAnswer,
                        confidence: 50,
                        explanation: 'Fallback response - direct text from API'
                    };
                } else {
                    throw new Error('No JSON object found in response');
                }
            }
        }

        return {
            answertext: responseJson.answertext || '',
            confidence: responseJson.confidence || 0,
            explanation: responseJson.explanation || ''
        };
    } catch (error) {
        // Log the error for debugging
        console.error('API Error:', error);
        
        // Return a fallback response
        return {
            answer: `Error: ${error.message}`,
            confidence: 0,
            explanation: 'Failed to generate a valid response'
        };
    }
}

// Function to generate a question from input purpose using Groq
async function generateQuestionFromPurpose(purpose, type) {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful assistant that generates clear, concise questions for form fields.
                    Your response must be ONLY the question text, with no additional explanation, JSON, or formatting.
                    The question should be natural, direct, and end with a question mark when appropriate.`
                },
                {
                    role: 'user',
                    content: `Generate a clear, natural question for a form field with the following purpose: "${purpose}"
                    The field type is: ${type}
                    
                    Return ONLY the question text, nothing else.`
                }
            ],
            model: 'llama3-8b-8192',
            temperature: 0.3,
            max_tokens: 100
        });
        
        if (!chatCompletion.choices || !chatCompletion.choices[0] || !chatCompletion.choices[0].message) {
            throw new Error('Invalid response format from Groq API');
        }
        
        const question = chatCompletion.choices[0].message.content.trim();
        return question;
        
    } catch (error) {
        // Fallback to a simple question if API call fails
        return `Please provide ${purpose}`;
    }
}
