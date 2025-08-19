// Simple BrowBuddy Content Script
console.log('🤖 BrowBuddy loaded!');

// Create floating circle
function createCircle() {
    try {
        const circle = document.createElement('div');
        circle.className = 'browbuddy-circle';
        circle.id = 'browbuddy-circle';
        
        const icon = document.createElement('div');
        icon.className = 'browbuddy-icon';
        
        circle.appendChild(icon);
        document.body.appendChild(circle);
        
        // Click handler
        circle.addEventListener('click', () => {
            try {
                if (circle.classList.contains('active')) {
                    hideChat();
                } else {
                    showChat();
                }
            } catch (error) {
                console.error('❌ Error handling circle click:', error);
            }
        });
        
        console.log('✅ Circle created');
    } catch (error) {
        console.error('❌ Error creating circle:', error);
    }
}

// Show chat interface
function showChat() {
    try {
        const circle = document.getElementById('browbuddy-circle');
        if (!circle) {
            console.error('❌ Circle element not found');
            return;
        }
        
        circle.classList.add('active', 'loading');
        
        const overlay = document.createElement('div');
        overlay.id = 'browbuddy-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999998;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const chat = document.createElement('div');
        chat.style.cssText = `
            background: white;
            border-radius: 20px;
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        `;

        chat.innerHTML = `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; font-weight: bold; font-size: 18px;">
                🤖 BrowBuddy AI Assistant
                <button onclick="hideChat()" style="position: absolute; top: 15px; right: 20px; background: none; border: none; color: white; font-size: 24px; cursor: pointer;">×</button>
            </div>
            <div id="chat-area" style="flex: 1; padding: 20px; overflow-y: auto; max-height: 400px; background: #f8f9fa;">
                <div style="background: #e3f2fd; padding: 15px; border-radius: 10px; margin-bottom: 15px; border-left: 4px solid #2196f3;">
                    <strong>👋 Hello! I'm BrowBuddy, your AI assistant.</strong><br>
                    I can help you with this webpage. What would you like to know?
                </div>
            </div>
            <div style="padding: 20px; border-top: 1px solid #eee; background: white;">
                <div style="display: flex; gap: 10px;">
                    <input id="chat-input" type="text" placeholder="Ask me anything about this page..." style="flex: 1; padding: 12px 15px; border: 2px solid #e0e0e0; border-radius: 25px; font-size: 14px; outline: none;">
                    <button onclick="sendMessage()" style="padding: 12px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 25px; cursor: pointer; font-weight: bold;">Send</button>
                </div>
            </div>
        `;

        overlay.appendChild(chat);
        document.body.appendChild(overlay);
        
        // Focus input
        setTimeout(() => {
            try {
                const input = document.getElementById('chat-input');
                if (input) input.focus();
            } catch (error) {
                console.error('❌ Error focusing input:', error);
            }
        }, 100);
        
        // Remove loading state
      setTimeout(() => {
            try {
                circle.classList.remove('loading');
            } catch (error) {
                console.error('❌ Error removing loading state:', error);
            }
        }, 1000);
    } catch (error) {
        console.error('❌ Error showing chat:', error);
    }
}

// Hide chat interface
function hideChat() {
    try {
        const overlay = document.getElementById('browbuddy-overlay');
        if (overlay) overlay.remove();
        
        const circle = document.getElementById('browbuddy-circle');
        if (circle) circle.classList.remove('active');
    } catch (error) {
        console.error('❌ Error hiding chat:', error);
    }
}

// Handle agent query using agent flow
async function handleAgentQuery(message, chatArea, typingElement) {
    try {
        console.log('🤖 Processing query with agent flow:', message);
        
        // Check if agent flow is available
        if (!window.BrowBuddy || !window.BrowBuddy.runAgentFlow) {
            console.error('❌ Agent flow not available');
            showErrorResponse(chatArea, typingElement, 'Agent flow not available. Please refresh the page.');
            return;
        }
        
        // Call agent flow
        const response = await window.BrowBuddy.runAgentFlow(message);
        
        // Remove typing indicator
        if (typingElement && typingElement.parentNode) {
            typingElement.remove();
        }
        
        // Create AI response
        const aiMsg = document.createElement('div');
        aiMsg.style.cssText = `
            background: #f0f0f0;
            padding: 12px 16px;
            border-radius: 18px;
            margin: 10px 0;
            align-self: flex-start;
            max-width: 80%;
            word-wrap: break-word;
            line-height: 1.4;
        `;
        
        if (response && response !== 'Agent flow completed without final output') {
            aiMsg.textContent = response;
        } else {
            aiMsg.textContent = "I apologize, but I couldn't process your request. This might be due to OpenAI not being configured or an error in processing. Please check the console for details.";
        }
        
        chatArea.appendChild(aiMsg);
        chatArea.scrollTop = chatArea.scrollHeight;
        
        console.log('✅ Agent response displayed');
        
    } catch (error) {
        console.error('❌ Error in handleAgentQuery:', error);
        showErrorResponse(chatArea, typingElement, 'An error occurred while processing your request.');
    }
}

// Show error response
function showErrorResponse(chatArea, typingElement, errorMessage) {
    try {
        // Remove typing indicator
        if (typingElement && typingElement.parentNode) {
            typingElement.remove();
        }
        
        // Create error response
        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = `
            background: #ffebee;
            color: #c62828;
            padding: 12px 16px;
            border-radius: 18px;
            margin: 10px 0;
            align-self: flex-start;
            max-width: 80%;
            word-wrap: break-word;
            border-left: 4px solid #e53935;
        `;
        errorMsg.textContent = errorMessage;
        
        chatArea.appendChild(errorMsg);
        chatArea.scrollTop = chatArea.scrollHeight;
    } catch (error) {
        console.error('❌ Error showing error response:', error);
    }
}

// Send message
function sendMessage() {
    try {
        const input = document.getElementById('chat-input');
        if (!input) {
            console.error('❌ Chat input not found');
            return;
        }
        
        const message = input.value.trim();
        if (!message) return;
        
        const chatArea = document.getElementById('chat-area');
        if (!chatArea) {
            console.error('❌ Chat area not found');
            return;
        }
        
        // Add user message
        const userMsg = document.createElement('div');
        userMsg.style.cssText = `
            background: #667eea;
            color: white;
            padding: 12px 16px;
            border-radius: 18px;
            margin: 10px 0;
            align-self: flex-end;
            max-width: 80%;
            word-wrap: break-word;
        `;
        userMsg.textContent = message;
        chatArea.appendChild(userMsg);
        
        // Clear input
        input.value = '';
        
        // Show typing indicator
        const typing = document.createElement('div');
        typing.style.cssText = `
            background: #f0f0f0;
            padding: 12px 16px;
            border-radius: 18px;
            margin: 10px 0;
            align-self: flex-start;
            max-width: 80%;
            font-style: italic;
            color: #666;
        `;
        typing.textContent = 'BrowBuddy is thinking...';
        chatArea.appendChild(typing);
        
        // Scroll to bottom
        chatArea.scrollTop = chatArea.scrollHeight;
        
        // Use agent flow to get real AI response
        handleAgentQuery(message, chatArea, typing);
    } catch (error) {
        console.error('❌ Error sending message:', error);
    }
}

// Enter key handler
document.addEventListener('keydown', (e) => {
    try {
        if (e.key === 'Enter' && document.getElementById('chat-input')) {
            sendMessage();
        }
    } catch (error) {
        console.error('❌ Error handling enter key:', error);
    }
});

// Keyboard shortcut
document.addEventListener('keydown', (e) => {
    try {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
            e.preventDefault();
            const circle = document.getElementById('browbuddy-circle');
            if (circle) {
                if (circle.classList.contains('active')) {
                    hideChat();
                } else {
                    showChat();
                }
            }
        }
    } catch (error) {
        console.error('❌ Error handling keyboard shortcut:', error);
    }
});

// Log current tab info
function logCurrentTab() {
    try {
        const tabInfo = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            title: document.title,
            time: new Date().toLocaleTimeString(),
            date: new Date().toLocaleDateString()
        };
        
        console.log('🌐 Current Tab:', tabInfo);
        return tabInfo;
    } catch (error) {
        console.error('❌ Error logging current tab:', error);
        return null;
    }
}

// Get session info
function getSessionInfo() {
    try {
        console.log('🔍 Content: getSessionInfo requested before');
        chrome.runtime.sendMessage({
            action: 'getCurrentSession'
        }, (response) => {
            try {
                console.log('🔍 Content: getSessionInfo response:', response);
                if (chrome.runtime.lastError) {
                    console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
                    return;
                }
                
                if (response && response.success && response.session) {
                    console.log('📋 Session:', response.session);
                } else {
                    console.log('❌ No session found or invalid response');
                }
            } catch (error) {
                console.error('❌ Error processing session response:', error);
            }
        });
    } catch (error) {
        console.error('❌ Error getting session info:', error);
    }
}

// Get session tabs
function getSessionTabs() {
    try {
        console.log('🔍 Content: getSessionTabs requested');
        chrome.runtime.sendMessage({
            action: 'getSessionTabs'
        }, (response) => {
            try {
                if (chrome.runtime.lastError) {
                    console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
                    return;
                }
                
                if (response && response.success) {
                    console.log('📋 Session Tabs:', response.tabs);
                    console.log('📊 Total tabs:', response.count);
                } else {
                    console.log('❌ Failed to get session tabs');
                }
            } catch (error) {
                console.error('❌ Error processing session tabs response:', error);
            }
        });
    } catch (error) {
        console.error('❌ Error getting session tabs:', error);
    }
}

// Get session timeout
function getSessionTimeout() {
    try {
        console.log('🔍 Content: getSessionTimeout requested');
        chrome.runtime.sendMessage({
            action: 'getSessionTimeout'
        }, (response) => {
            try {
                if (chrome.runtime.lastError) {
                    console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
                    return;
                }
                
                if (response && response.success) {
                    const timeoutMinutes = response.timeout / 60000;
                    const defaultMinutes = response.defaultTimeout / 60000;
                    console.log('⏰ Current session timeout:', `${timeoutMinutes} minutes`);
                    console.log('⏰ Default timeout:', `${defaultMinutes} minutes`);
                } else {
                    console.log('❌ Failed to get session timeout');
                }
            } catch (error) {
                console.error('❌ Error processing session timeout response:', error);
            }
        });
    } catch (error) {
        console.error('❌ Error getting session timeout:', error);
    }
}

// Set session timeout
function setSessionTimeout(minutes) {
    try {
        if (!minutes || minutes < 1) {
            console.error('❌ Invalid timeout value. Must be at least 1 minute.');
            return;
        }
        
        const timeoutMs = minutes * 60 * 1000; // Convert minutes to milliseconds
        console.log('🔍 Content: setSessionTimeout requested:', `${minutes} minutes`);
        
        chrome.runtime.sendMessage({
            action: 'setSessionTimeout',
            timeout: timeoutMs
        }, (response) => {
            try {
                if (chrome.runtime.lastError) {
                    console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
                    return;
                }
                
                if (response && response.success) {
                    const timeoutMinutes = response.timeout / 60000;
                    console.log('✅ Session timeout updated to:', `${timeoutMinutes} minutes`);
                } else {
                    console.log('❌ Failed to set session timeout');
                }
            } catch (error) {
                console.error('❌ Error processing set session timeout response:', error);
            }
        });
    } catch (error) {
        console.error('❌ Error setting session timeout:', error);
    }
}

// Get page HTML
function getPageHTML() {
    try {
        console.log('🔍 Content: getPageHTML requested');
        
        // Get the complete HTML of the current page
        const html = document.documentElement.outerHTML;
        
        console.log('📄 Page HTML length:', html.length, 'characters');
        console.log('📄 Page HTML preview:', html.substring(0, 200) + '...');
        
        return html;
    } catch (error) {
        console.error('❌ Error getting page HTML:', error);
        return null;
    }
}

// Get page content (text only)
function getPageContent() {
    try {
        console.log('🔍 Content: getPageContent requested');
        
        // Remove script and style elements to get clean text content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = document.documentElement.outerHTML;
        
        // Remove script and style elements
        const scripts = tempDiv.querySelectorAll('script, style, noscript, iframe, img, video, audio, canvas, svg');
        scripts.forEach(element => element.remove());
        
        // Get text content
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        
        // Clean up the text (remove extra whitespace, newlines)
        const cleanContent = textContent
            .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
            .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
            .trim();               // Remove leading/trailing whitespace
        
        console.log('📝 Page content length:', cleanContent.length, 'characters');
        console.log('📝 Page content preview:', cleanContent.substring(0, 200) + '...');
        
        return cleanContent;
    } catch (error) {
        console.error('❌ Error getting page content:', error);
        return null;
    }
}

// Get page content with more detailed extraction
function getPageContentDetailed() {
    try {
        console.log('🔍 Content: getPageContentDetailed requested');
        
        const content = {
            title: document.title || '',
            url: window.location.href,
            timestamp: new Date().toISOString(),
            headings: [],
            paragraphs: [],
            links: [],
            textContent: ''
        };
        
        // Extract headings
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(heading => {
            content.headings.push({
                level: heading.tagName.toLowerCase(),
                text: heading.textContent.trim()
            });
        });
        
        // Extract paragraphs
        const paragraphs = document.querySelectorAll('p');
        paragraphs.forEach(p => {
            const text = p.textContent.trim();
            if (text.length > 0) {
                content.paragraphs.push(text);
            }
        });
        
        // Extract links
        const links = document.querySelectorAll('a[href]');
        links.forEach(link => {
            content.links.push({
                text: link.textContent.trim(),
                href: link.href,
                title: link.title || ''
            });
        });
        
        // Get main text content
        content.textContent = getPageContent();
        
        console.log('📊 Detailed content extracted:');
        console.log('  - Title:', content.title);
        console.log('  - Headings:', content.headings.length);
        console.log('  - Paragraphs:', content.paragraphs.length);
        console.log('  - Links:', content.links.length);
        console.log('  - Text length:', content.textContent);
        
        return content;
    } catch (error) {
        console.error('❌ Error getting detailed page content:', error);
        return null;
    }
}

// OpenAI integration functions
let openaiApiKey = null;
let openaiEnabled = false;

// Initialize OpenAI settings
function initOpenAI() {
    try {
        console.log('🔍 Content: initOpenAI requested');
        chrome.runtime.sendMessage({
            action: 'getOpenAISettings'
        }, (response) => {
            try {
                if (chrome.runtime.lastError) {
                    console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
                    return;
                }
                
                if (response && response.success) {
                    openaiApiKey = response.apiKey;
                    openaiEnabled = response.enabled;
                    console.log('🤖 OpenAI initialized:', openaiEnabled ? 'Enabled' : 'Disabled');
                } else {
                    console.log('❌ Failed to get OpenAI settings');
                }
            } catch (error) {
                console.error('❌ Error processing OpenAI settings response:', error);
            }
        });
    } catch (error) {
        console.error('❌ Error initializing OpenAI:', error);
    }
}

// Set OpenAI API key
function setOpenAIKey(apiKey) {
    try {
        if (!apiKey || apiKey.trim() === '') {
            console.error('❌ Invalid API key provided');
            return;
        }
        
        console.log('🔍 Content: setOpenAIKey requested');
        chrome.runtime.sendMessage({
            action: 'setOpenAIKey',
            apiKey: apiKey.trim()
        }, (response) => {
            try {
                if (chrome.runtime.lastError) {
                    console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
                    return;
                }
                
                if (response && response.success) {
                    openaiApiKey = apiKey.trim();
                    openaiEnabled = true;
                    console.log('✅ OpenAI API key set successfully');
                } else {
                    console.log('❌ Failed to set OpenAI API key');
                }
            } catch (error) {
                console.error('❌ Error processing set OpenAI key response:', error);
            }
        });
    } catch (error) {
        console.error('❌ Error setting OpenAI key:', error);
    }
}

// Analyze page content with OpenAI
function analyzePageWithAI(prompt = null) {
    try {
        if (!openaiEnabled || !openaiApiKey) {
            console.error('❌ OpenAI not enabled or API key not set');
            return;
        }
        
        console.log('🔍 Content: analyzePageWithAI requested');
        
        // Get page content
        const pageContent = getPageContentDetailed();
        if (!pageContent) {
            console.error('❌ Failed to get page content');
            return;
        }
        
        // Create default prompt if none provided
        const defaultPrompt = `Analyze this webpage content and provide a brief summary. Focus on the main topics, key information, and any important insights.`;
        const finalPrompt = prompt || defaultPrompt;
        
        // Prepare data for OpenAI
        const analysisData = {
            prompt: finalPrompt,
            pageContent: pageContent,
            url: window.location.href,
            timestamp: new Date().toISOString()
        };
        
        chrome.runtime.sendMessage({
            action: 'analyzeWithOpenAI',
            data: analysisData
        }, (response) => {
            try {
                if (chrome.runtime.lastError) {
                    console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
                    return;
                }
                
                if (response && response.success) {
                    console.log('🤖 AI Analysis:', response.analysis);
                    return response.analysis;
                } else {
                    console.log('❌ Failed to analyze with AI:', response.error);
                }
            } catch (error) {
                console.error('❌ Error processing AI analysis response:', error);
            }
        });
    } catch (error) {
        console.error('❌ Error analyzing page with AI:', error);
    }
}

// Generate AI response for user query
function askAI(question) {
    try {
        if (!openaiEnabled || !openaiApiKey) {
            console.error('❌ OpenAI not enabled or API key not set');
            return;
        }
        
        if (!question || question.trim() === '') {
            console.error('❌ No question provided');
            return;
        }
        
        console.log('🔍 Content: askAI requested:', question);
        
        // Get current page context
        const pageContent = getPageContent();
        const pageTitle = document.title;
        const pageUrl = window.location.href;
        
        // Prepare data for OpenAI
        const queryData = {
            question: question.trim(),
            pageContext: {
                title: pageTitle,
                url: pageUrl,
                content: pageContent.substring(0, 2000) // Limit content length
            },
            timestamp: new Date().toISOString()
        };
        
        chrome.runtime.sendMessage({
            action: 'askOpenAI',
            data: queryData
        }, (response) => {
            try {
                if (chrome.runtime.lastError) {
                    console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
                    return;
                }
                
                if (response && response.success) {
                    console.log('🤖 AI Response:', response.answer);
                    return response.answer;
                } else {
                    console.log('❌ Failed to get AI response:', response.error);
                }
            } catch (error) {
                console.error('❌ Error processing AI response:', error);
            }
        });
    } catch (error) {
        console.error('❌ Error asking AI:', error);
    }
}

// Toggle OpenAI on/off
function toggleOpenAI() {
    try {
        console.log('🔍 Content: toggleOpenAI requested');
        chrome.runtime.sendMessage({
            action: 'toggleOpenAI'
        }, (response) => {
            try {
                if (chrome.runtime.lastError) {
                    console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
                    return;
                }
                
                if (response && response.success) {
                    openaiEnabled = response.enabled;
                    console.log('🤖 OpenAI toggled:', openaiEnabled ? 'ON' : 'OFF');
                } else {
                    console.log('❌ Failed to toggle OpenAI');
                }
            } catch (error) {
                console.error('❌ Error processing toggle OpenAI response:', error);
            }
        });
    } catch (error) {
        console.error('❌ Error toggling OpenAI:', error);
    }
}

// Make functions global
window.BrowBuddy = Object.assign({}, window.BrowBuddy || {}, {
    logCurrentTab,
    getSessionInfo,
    getSessionTabs,
    getSessionTimeout,
    setSessionTimeout,
    getPageHTML,
    getPageContent,
    getPageContentDetailed,
    initOpenAI,
    setOpenAIKey,
    analyzePageWithAI,
    askAI,
    toggleOpenAI
});

// Initialize
try {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createCircle);
    } else {
        createCircle();
    }

    // Log initial tab info
    setTimeout(logCurrentTab, 2000);
    setTimeout(getSessionInfo, 2000);
    setTimeout(getSessionTabs, 2000);
    setTimeout(getPageContentDetailed, 2000);
    setTimeout(initOpenAI, 2000);
    console.log('🤖 BrowBuddy loaded! Available functions:');
    console.log('📊 Session: BrowBuddy.logCurrentTab(), BrowBuddy.getSessionInfo(), BrowBuddy.getSessionTabs()');
    console.log('📄 Content: BrowBuddy.getPageHTML(), BrowBuddy.getPageContent(), BrowBuddy.getPageContentDetailed()');
    console.log('🤖 AI: BrowBuddy.setOpenAIKey(key), BrowBuddy.askAI(question), BrowBuddy.analyzePageWithAI()');
    console.log('🔧 Tools: BrowBuddy.tools.callTool(name, args), BrowBuddy.tools.listTools()');
    console.log('🚀 Agent Flow: BrowBuddy.runAgentFlow("your question here")');
    console.log('');
    console.log('💡 Quick test: BrowBuddy.runAgentFlow("What is this page about?")');
    
    // Add helper function for testing
    window.testAgentFlow = async function() {
        console.log('🧪 Testing agent flow...');
        try {
            if (!window.BrowBuddy?.runAgentFlow) {
                console.error('❌ Agent flow not available yet. Wait a moment and try again.');
                return;
            }
            
            const result = await window.BrowBuddy.runAgentFlow("What are the main topics on this page?");
            console.log('✅ Test result:', result);
        } catch (error) {
            console.error('❌ Test error:', error);
        }
    };
    
    console.log('🧪 Quick test function: testAgentFlow()');
    console.log('');
} catch (error) {
    console.error('❌ Error initializing BrowBuddy:', error);
}
  