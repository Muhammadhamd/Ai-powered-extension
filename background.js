// Simple BrowBuddy Background Script
console.log('🤖 BrowBuddy background script loaded');

// Session tracking
let currentSessionId = null;
let sessionStartTime = null;
let sessionTimeout = null; // Timeout in milliseconds
let sessionCheckInterval = null; // Interval for checking session timeout

// Default session timeout: 30 minutes (30 * 60 * 1000 = 1,800,000 ms)
const DEFAULT_SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// OpenAI settings
let openaiApiKey = null;
let openaiEnabled = false;

// Initialize session
function initSession() {
    try {
        currentSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStartTime = new Date().toISOString();
        
        console.log('🆕 New session:', currentSessionId);
        console.log('⏰ Session timeout:', sessionTimeout ? `${sessionTimeout / 60000} minutes` : '30 minutes (default)');
        
        chrome.storage.local.set({
            current_session: {
                id: currentSessionId,
                startTime: sessionStartTime,
                lastActivity: sessionStartTime,
                timeout: sessionTimeout || DEFAULT_SESSION_TIMEOUT
            }
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('❌ Error storing session:', chrome.runtime.lastError);
            } else {
                console.log('✅ Session stored successfully');
            }
        });
        
        // Start session timeout checking
        startSessionTimeoutCheck();
    } catch (error) {
        console.error('❌ Error initializing session:', error);
    }
}

// Load session settings
function loadSessionSettings() {
    try {
        chrome.storage.local.get(['session_timeout', 'current_session'], (result) => {
            try {
                if (chrome.runtime.lastError) {
                    console.error('❌ Error loading session settings:', chrome.runtime.lastError);
                    return;
                }
                
                // Set session timeout (default 30 minutes)
                sessionTimeout = result.session_timeout || DEFAULT_SESSION_TIMEOUT;
                console.log('⏰ Session timeout loaded:', `${sessionTimeout / 60000} minutes`);
                
                // Check if we need to start a new session
                if (result.current_session) {
                    const lastActivity = new Date(result.current_session.lastActivity);
                    const now = new Date();
                    const timeSinceLastActivity = now.getTime() - lastActivity.getTime();
                    
                    if (timeSinceLastActivity > sessionTimeout) {
                        console.log('⏰ Session expired, starting new session');
                        initSession();
                    } else {
                        // Continue with existing session
                        currentSessionId = result.current_session.id;
                        sessionStartTime = result.current_session.startTime;
                        console.log('🔄 Continuing existing session:', currentSessionId);
                        startSessionTimeoutCheck();
                    }
                } else {
                    // No existing session, start new one
                    initSession();
                }
            } catch (error) {
                console.error('❌ Error processing session settings:', error);
                initSession(); // Fallback to new session
            }
        });
    } catch (error) {
        console.error('❌ Error loading session settings:', error);
        initSession(); // Fallback to new session
    }
}

// Load OpenAI settings
function loadOpenAISettings() {
    try {
        chrome.storage.local.get(['openai_api_key', 'openai_enabled'], (result) => {
            try {
                if (chrome.runtime.lastError) {
                    console.error('❌ Error loading OpenAI settings:', chrome.runtime.lastError);
                    return;
                }
                
                openaiApiKey = result.openai_api_key || null;
                openaiEnabled = result.openai_enabled || false;
                
                console.log('🤖 OpenAI settings loaded:', {
                    enabled: openaiEnabled,
                    hasKey: !!openaiApiKey
                });
            } catch (error) {
                console.error('❌ Error processing OpenAI settings:', error);
            }
        });
    } catch (error) {
        console.error('❌ Error loading OpenAI settings:', error);
    }
}

// Start session timeout checking
function startSessionTimeoutCheck() {
    try {
        // Clear existing interval
        if (sessionCheckInterval) {
            clearInterval(sessionCheckInterval);
        }
        
        // Check session timeout every minute
        sessionCheckInterval = setInterval(() => {
            checkSessionTimeout();
        }, 60000); // Check every minute
        
        console.log('⏰ Session timeout checking started');
    } catch (error) {
        console.error('❌ Error starting session timeout check:', error);
    }
}

// Check if session has timed out
function checkSessionTimeout() {
    try {
        chrome.storage.local.get(['current_session'], (result) => {
            try {
                if (chrome.runtime.lastError) {
                    console.error('❌ Error checking session timeout:', chrome.runtime.lastError);
                    return;
                }
                
                if (result.current_session) {
                    const lastActivity = new Date(result.current_session.lastActivity);
                    const now = new Date();
                    const timeSinceLastActivity = now.getTime() - lastActivity.getTime();
                    
                    if (timeSinceLastActivity > sessionTimeout) {
                        console.log('⏰ Session timed out, starting new session');
                        initSession();
                    }
                }
            } catch (error) {
                console.error('❌ Error processing session timeout check:', error);
            }
        });
    } catch (error) {
        console.error('❌ Error checking session timeout:', error);
    }
}

// Update session last activity
function updateSessionActivity() {
    try {
        chrome.storage.local.get(['current_session'], (result) => {
            try {
                if (chrome.runtime.lastError) {
                    console.error('❌ Error getting current session for activity update:', chrome.runtime.lastError);
                    return;
                }
                
                if (result.current_session) {
                    const updatedSession = {
                        ...result.current_session,
                        lastActivity: new Date().toISOString()
                    };
                    
                    chrome.storage.local.set({ current_session: updatedSession }, () => {
                        if (chrome.runtime.lastError) {
                            console.error('❌ Error updating session activity:', chrome.runtime.lastError);
                        }
                    });
                }
            } catch (error) {
                console.error('❌ Error processing session activity update:', error);
            }
        });
    } catch (error) {
        console.error('❌ Error updating session activity:', error);
    }
}

// Call OpenAI API with tools support
async function callOpenAI(messages, tools = null, model = 'gpt-4o-mini', maxTokens = 16000) {
    try {
        model = 'gpt-4o-mini'
        if (!openaiApiKey) {
            throw new Error('OpenAI API key not set');
        }
        
        console.log('🤖 Calling OpenAI API...', { model, tools: tools ? tools.length : 0 });
        
        const requestBody = {
            model: model,
            messages: messages,
            max_tokens: maxTokens,
            temperature: 0.7
        };

        // Add tools if provided
        if (tools && tools.length > 0) {
            requestBody.tools = tools;
            requestBody.tool_choice = "auto"; // Let the model decide when to use tools
        }
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiApiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ OpenAI API call successful');
        return data; // Return full response instead of just content
    } catch (error) {
        console.error('❌ OpenAI API call failed:', error);
        throw error;
    }
}

// Analyze page content with OpenAI
async function analyzePageContent(data) {
    try {
        const { prompt, pageContent, url } = data;
        
        const messages = [
            {
                role: 'system',
                content: 'You are a helpful AI assistant that analyzes webpage content. Provide clear, concise, and insightful analysis.'
            },
            {
                role: 'user',
                content: `${prompt}\n\nPage URL: ${url}\nPage Title: ${pageContent.title}\n\nContent:\n${pageContent.textContent.substring(0, 3000)}`
            }
        ];
        
        const analysis = await callOpenAI(messages);
        return analysis;
    } catch (error) {
        console.error('❌ Error analyzing page content:', error);
        throw error;
    }
}

// Modify runAgentWithTools to notify frontend
async function runAgentWithTools(data) {
    try {
        const { question, tools, conversation_history = [] } = data;

        // Build messages array starting with system message
        const messages = [
            {
                role: 'system',
                content: 'You are a helpful AI assistant that can use tools to help users analyze and interact with web content. Use the available tools when needed to provide accurate and helpful responses.'
            },
            ...conversation_history, // Include previous conversation
            {
                role: 'user',
                content: question
            }
        ];

        console.log('🤖 Running agent with tools:', { tools: tools ? tools.length : 0 });

        // Call OpenAI with tools
        const response = await callOpenAI(messages, tools);

        return {
            full_response: response,
            message: response.choices[0]?.message,
            tool_calls: response.choices[0]?.message?.tool_calls || null,
            content: response.choices[0]?.message?.content || null
        };
    } catch (error) {
        console.error('❌ Error running agent with tools:', error);
        throw error;
    }
}

// Legacy function - kept for backward compatibility
async function answerQuestion(data) {
    try {
        const { question, pageContext } = data;
        
        const messages = [
            {
                role: 'system',
                content: 'You are a helpful AI assistant that answers questions about webpage content. Use the provided page context to give relevant and accurate answers.'
            },
            {
                role: 'user',
                content: `Question: ${question}\n\nPage Context:\nTitle: ${pageContext.title}\nURL: ${pageContext.url}\nContent: ${pageContext.content}`
            }
        ];
        
        const response = await callOpenAI(messages);
        return response.choices[0]?.message?.content || 'No response received';
    } catch (error) {
        console.error('❌ Error answering question:', error);
        throw error;
    }
}

// Store tab event
function storeEvent(event) {
    try {
        // Update session activity when storing events
        updateSessionActivity();
        
        chrome.storage.local.get(['session_events'], (result) => {
            try {
                if (chrome.runtime.lastError) {
                    console.error('❌ Error getting session events:', chrome.runtime.lastError);
                    return;
                }
                
                const events = result.session_events || [];
                events.push(event);
                
                if (events.length > 1000) {
                    events.splice(0, events.length - 1000);
                }
                
                chrome.storage.local.set({ session_events: events }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('❌ Error storing session events:', chrome.runtime.lastError);
                    } else {
                        console.log('✅ Event stored successfully');
                    }
                });
            } catch (error) {
                console.error('❌ Error processing session events:', error);
            }
        });
    } catch (error) {
        console.error('❌ Error storing event:', error);
    }
}

// Function to trigger a function in the frontend
function triggerFrontendFunction(tabId, data) {
    chrome.tabs.sendMessage(tabId, { action: 'triggerFunction', data: data }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('❌ Error sending message to frontend:', chrome.runtime.lastError);
            return;
        }
        console.log('✅ Message sent to frontend:', response);
    });
}

// Example usage: Trigger the function for a specific tab
// chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     if (tabs.length > 0) {
//         triggerFrontendFunction(tabs[0].id, { someKey: 'someValue' });
//     }
// });

// Initialize on install/startup
try {
chrome.runtime.onInstalled.addListener(() => {
        console.log('🔄 Extension installed/updated, loading settings');
        loadSessionSettings();
        loadOpenAISettings();
    });
    chrome.runtime.onStartup.addListener(() => {
        console.log('🔄 Browser started, loading settings');
        loadSessionSettings();
        loadOpenAISettings();
    });
} catch (error) {
    console.error('❌ Error setting up event listeners:', error);
}

// Track tab events
try {
    chrome.tabs.onCreated.addListener((tab) => {
        try {
            const event = {
                sessionId: currentSessionId,
                tabId: tab.id,
                windowId: tab.windowId,
                index: tab.index,
                timestamp: new Date().toISOString(),
                event: 'created',
                url: tab.url || null,
                title: tab.title || null
            };
            
            console.log('🆕 Tab created:', event);
            storeEvent(event);
        } catch (error) {
            console.error('❌ Error handling tab created:', error);
        }
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        try {
            if (changeInfo.status === 'complete' && changeInfo.url) {
                const event = {
                    sessionId: currentSessionId,
                    tabId: tabId,
                    windowId: tab.windowId,
                    index: tab.index,
                    timestamp: new Date().toISOString(),
                    event: 'updated',
                    url: changeInfo.url,
                    title: tab.title || null
                };
                
                console.log('🔄 Tab updated:', event);
                storeEvent(event);
            }
        } catch (error) {
            console.error('❌ Error handling tab updated:', error);
        }
    });

    chrome.tabs.onActivated.addListener((activeInfo) => {
        try {
            const event = {
                sessionId: currentSessionId,
                tabId: activeInfo.tabId,
                windowId: activeInfo.windowId,
                timestamp: new Date().toISOString(),
                event: 'activated'
            };
            
            console.log('👆 Tab activated:', event);
            storeEvent(event);
        } catch (error) {
            console.error('❌ Error handling tab activated:', error);
        }
    });

    chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
        try {
            const event = {
                sessionId: currentSessionId,
                tabId: tabId,
                windowId: removeInfo.windowId,
                timestamp: new Date().toISOString(),
                event: 'removed'
            };
            
            console.log('❌ Tab closed:', event);
            storeEvent(event);
        } catch (error) {
            console.error('❌ Error handling tab removed:', error);
        }
    });
} catch (error) {
    console.error('❌ Error setting up tab event listeners:', error);
}

// Handle messages
try {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        try {
            if (!request || !request.action) {
                console.error('❌ Invalid message received:', request);
                sendResponse({ success: false, error: 'Invalid message' });
                return true;
            }

            if (request.action === 'getCurrentSession') {
                try {
                    chrome.storage.local.get(['current_session'], (result) => {
                        try {
                            if (chrome.runtime.lastError) {
                                console.error('❌ Error getting current session:', chrome.runtime.lastError);
                                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                                return;
                            }
                            
                            sendResponse({ 
                                success: true, 
                                session: result.current_session || null 
                            });
                        } catch (error) {
                            console.error('❌ Error processing current session response:', error);
                            sendResponse({ success: false, error: error.message });
                        }
                    });
                } catch (error) {
                    console.error('❌ Error handling getCurrentSession:', error);
                    sendResponse({ success: false, error: error.message });
                }
                return true;
            }

            if (request.action === 'getSessionEvents') {
                try {
                    chrome.storage.local.get(['session_events'], (result) => {
                        try {
                            if (chrome.runtime.lastError) {
                                console.error('❌ Error getting session events:', chrome.runtime.lastError);
                                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                                return;
                            }
                            
                            sendResponse({ 
                                success: true, 
                                events: result.session_events || [] 
                            });
                        } catch (error) {
                            console.error('❌ Error processing session events response:', error);
                            sendResponse({ success: false, error: error.message });
                        }
                    });
                } catch (error) {
                    console.error('❌ Error handling getSessionEvents:', error);
                    sendResponse({ success: false, error: error.message });
                }
                return true;
            }

            if (request.action === 'getSessionTabs') {
                try {
                    chrome.tabs.query({}, (tabs) => {
                        try {
                            if (chrome.runtime.lastError) {
                                console.error('❌ Error querying tabs:', chrome.runtime.lastError);
                                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                                return;
                            }
                            
                            const sessionTabs = tabs.map(tab => ({
                                sessionId: currentSessionId,
                                tabId: tab.id,
                                windowId: tab.windowId,
                                index: tab.index,
                                url: tab.url,
                                title: tab.title,
                                active: tab.active,
                                pinned: tab.pinned,
                                incognito: tab.incognito,
                                status: tab.status,
                                lastAccessed: new Date().toISOString()
                            }));

                            sendResponse({ 
                                success: true, 
                                sessionId: currentSessionId,
                                tabs: sessionTabs,
                                count: sessionTabs.length
                            });
                        } catch (error) {
                            console.error('❌ Error processing session tabs response:', error);
                            sendResponse({ success: false, error: error.message });
                        }
                    });
                } catch (error) {
                    console.error('❌ Error handling getSessionTabs:', error);
                    sendResponse({ success: false, error: error.message });
                }
                return true;
            }

            if (request.action === 'setSessionTimeout') {
                try {
                    const timeout = request.timeout || DEFAULT_SESSION_TIMEOUT;
                    sessionTimeout = timeout;
                    
                    chrome.storage.local.set({ session_timeout: timeout }, () => {
                        try {
                            if (chrome.runtime.lastError) {
                                console.error('❌ Error setting session timeout:', chrome.runtime.lastError);
                                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                                return;
                            }
                            
                            console.log('⏰ Session timeout updated:', `${timeout / 60000} minutes`);
                            sendResponse({ success: true, timeout: timeout });
                        } catch (error) {
                            console.error('❌ Error processing session timeout response:', error);
                            sendResponse({ success: false, error: error.message });
                        }
                    });
                } catch (error) {
                    console.error('❌ Error handling setSessionTimeout:', error);
                    sendResponse({ success: false, error: error.message });
                }
                return true;
            }

            if (request.action === 'getSessionTimeout') {
                try {
                    sendResponse({ 
                        success: true, 
                        timeout: sessionTimeout || DEFAULT_SESSION_TIMEOUT,
                        defaultTimeout: DEFAULT_SESSION_TIMEOUT
                    });
                } catch (error) {
                    console.error('❌ Error handling getSessionTimeout:', error);
                    sendResponse({ success: false, error: error.message });
                }
                return true;
            }

            // OpenAI message handlers
            if (request.action === 'getOpenAISettings') {
                try {
                    sendResponse({ 
                        success: true, 
                        apiKey: openaiApiKey,
                        enabled: openaiEnabled
                    });
                } catch (error) {
                    console.error('❌ Error handling getOpenAISettings:', error);
                    sendResponse({ success: false, error: error.message });
                }
                return true;
            }

            if (request.action === 'setOpenAIKey') {
                try {
                    const apiKey = request.apiKey;
                    openaiApiKey = apiKey;
                    openaiEnabled = true;
                    
                    chrome.storage.local.set({ 
                        openai_api_key: apiKey,
                        openai_enabled: true
                    }, () => {
                        try {
                            if (chrome.runtime.lastError) {
                                console.error('❌ Error setting OpenAI key:', chrome.runtime.lastError);
                                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                                return;
                            }
                            
                            console.log('✅ OpenAI API key saved');
                            sendResponse({ success: true });
                        } catch (error) {
                            console.error('❌ Error processing set OpenAI key response:', error);
                            sendResponse({ success: false, error: error.message });
                        }
                    });
                } catch (error) {
                    console.error('❌ Error handling setOpenAIKey:', error);
                    sendResponse({ success: false, error: error.message });
                }
                return true;
            }

            if (request.action === 'toggleOpenAI') {
                try {
                    openaiEnabled = !openaiEnabled;
                    
                    chrome.storage.local.set({ openai_enabled: openaiEnabled }, () => {
                        try {
                            if (chrome.runtime.lastError) {
                                console.error('❌ Error toggling OpenAI:', chrome.runtime.lastError);
                                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                                return;
                            }
                            
                            console.log('🤖 OpenAI toggled:', openaiEnabled ? 'ON' : 'OFF');
                            sendResponse({ success: true, enabled: openaiEnabled });
                        } catch (error) {
                            console.error('❌ Error processing toggle OpenAI response:', error);
                            sendResponse({ success: false, error: error.message });
                        }
                    });
                } catch (error) {
                    console.error('❌ Error handling toggleOpenAI:', error);
                    sendResponse({ success: false, error: error.message });
                }
                return true;
            }

            if (request.action === 'analyzeWithOpenAI') {
                try {
                    if (!openaiEnabled || !openaiApiKey) {
                        sendResponse({ success: false, error: 'OpenAI not enabled or API key not set' });
                        return true;
                    }
                    
                    analyzePageContent(request.data)
                        .then(analysis => {
                            sendResponse({ success: true, analysis: analysis });
                        })
                        .catch(error => {
                            console.error('❌ Error in analyzeWithOpenAI:', error);
                            sendResponse({ success: false, error: error.message });
                        });
                } catch (error) {
                    console.error('❌ Error handling analyzeWithOpenAI:', error);
                    sendResponse({ success: false, error: error.message });
                }
                return true;
            }

            if (request.action === 'askOpenAI') {
                try {
                    if (!openaiEnabled || !openaiApiKey) {
                        sendResponse({ success: false, error: 'OpenAI not enabled or API key not set' });
                        return true;
                    }
                    
                    answerQuestion(request.data)
                        .then(answer => {
                            sendResponse({ success: true, answer: answer });
                        })
                        .catch(error => {
                            console.error('❌ Error in askOpenAI:', error);
                            sendResponse({ success: false, error: error.message });
                        });
                } catch (error) {
                    console.error('❌ Error handling askOpenAI:', error);
                    sendResponse({ success: false, error: error.message });
                }
                return true;
            }

            if (request.action === 'runAgentWithTools') {
                try {
                    if (!openaiEnabled || !openaiApiKey) {
                        sendResponse({ success: false, error: 'OpenAI not enabled or API key not set' });
                        return true;
                    }
                    
                    runAgentWithTools(request.data)
                        .then(result => {
                            sendResponse({ success: true, result: result });
                        })
                        .catch(error => {
                            console.error('❌ Error in runAgentWithTools:', error);
                            sendResponse({ success: false, error: error.message });
                        });
                } catch (error) {
                    console.error('❌ Error handling runAgentWithTools:', error);
                    sendResponse({ success: false, error: error.message });
                }
                return true;
            }

            if (request.action === 'intermediateResponse') {
                try {
                    const tabId = sender?.tab?.id;
                    if (typeof tabId === 'number') {
                        chrome.tabs.sendMessage(tabId, { action: 'intermediateResponse', message: request.message });
                        sendResponse({ success: true });
                    } else {
                        // Fallback to active tab if sender.tab is unavailable
                        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                            if (tabs && tabs.length > 0) {
                                chrome.tabs.sendMessage(tabs[0].id, { action: 'intermediateResponse', message: request.message });
                                sendResponse({ success: true });
                            } else {
                                sendResponse({ success: false, error: 'No active tab found for intermediate response' });
                            }
                        });
                    }
                } catch (error) {
                    console.error('❌ Error forwarding intermediateResponse:', error);
                    sendResponse({ success: false, error: error.message });
                }
                return true;
            }

            // Settings message handlers
            if (request.action === 'getAllSettings') {
                try {
                    chrome.storage.local.get([
                        'session_timeout', 
                        'current_session', 
                        'ai_model', 
                        'max_tokens', 
                        'temperature',
                        'auto_analyze',
                        'show_notifications',
                        'circle_position'
                    ], (result) => {
                        try {
                            if (chrome.runtime.lastError) {
                                console.error('❌ Error getting all settings:', chrome.runtime.lastError);
                                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                                return;
                            }
                            
                            const settings = {
                                sessionTimeout: result.session_timeout || DEFAULT_SESSION_TIMEOUT,
                                currentSession: result.current_session || null,
                                aiModel: result.ai_model || 'gpt-3.5-turbo',
                                maxTokens: result.max_tokens || 1000,
                                temperature: result.temperature !== undefined ? result.temperature : 0.7,
                                autoAnalyze: result.auto_analyze !== undefined ? result.auto_analyze : false,
                                showNotifications: result.show_notifications !== undefined ? result.show_notifications : true,
                                circlePosition: result.circle_position || 'bottom-right'
                            };
                            
                            sendResponse({ success: true, settings: settings });
                        } catch (error) {
                            console.error('❌ Error processing getAllSettings response:', error);
                            sendResponse({ success: false, error: error.message });
                        }
                    });
                } catch (error) {
                    console.error('❌ Error handling getAllSettings:', error);
                    sendResponse({ success: false, error: error.message });
                }
                return true;
            }

            if (request.action === 'saveAllSettings') {
                try {
                    const settings = request.settings;
                    
                    chrome.storage.local.set({
                        session_timeout: settings.sessionTimeout,
                        ai_model: settings.aiModel,
                        max_tokens: settings.maxTokens,
                        temperature: settings.temperature,
                        auto_analyze: settings.autoAnalyze,
                        show_notifications: settings.showNotifications,
                        circle_position: settings.circlePosition
                    }, () => {
                        try {
                            if (chrome.runtime.lastError) {
                                console.error('❌ Error saving all settings:', chrome.runtime.lastError);
                                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                                return;
                            }
                            
                            // Update local variables
                            sessionTimeout = settings.sessionTimeout;
                            
                            console.log('✅ All settings saved');
                            sendResponse({ success: true });
                        } catch (error) {
                            console.error('❌ Error processing saveAllSettings response:', error);
                            sendResponse({ success: false, error: error.message });
                        }
                    });
                } catch (error) {
                    console.error('❌ Error handling saveAllSettings:', error);
                    sendResponse({ success: false, error: error.message });
                }
                return true;
            }

            if (request.action === 'resetSettings') {
                try {
                    const defaultSettings = {
                        session_timeout: DEFAULT_SESSION_TIMEOUT,
                        ai_model: 'gpt-3.5-turbo',
                        max_tokens: 1000,
                        temperature: 0.7,
                        auto_analyze: false,
                        show_notifications: true,
                        circle_position: 'bottom-right'
                    };
                    
                    chrome.storage.local.set(defaultSettings, () => {
                        try {
                            if (chrome.runtime.lastError) {
                                console.error('❌ Error resetting settings:', chrome.runtime.lastError);
                                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                                return;
                            }
                            
                            // Update local variables
                            sessionTimeout = DEFAULT_SESSION_TIMEOUT;
                            
                            console.log('✅ Settings reset to defaults');
                            sendResponse({ success: true });
                        } catch (error) {
                            console.error('❌ Error processing resetSettings response:', error);
                            sendResponse({ success: false, error: error.message });
                        }
                    });
                } catch (error) {
                    console.error('❌ Error handling resetSettings:', error);
                    sendResponse({ success: false, error: error.message });
                }
                return true;
            }

            if (request.action === 'clearSessionData') {
                try {
                    chrome.storage.local.remove(['session_events', 'current_session'], () => {
                        try {
                            if (chrome.runtime.lastError) {
                                console.error('❌ Error clearing session data:', chrome.runtime.lastError);
                                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                                return;
                            }
                            
                            console.log('✅ Session data cleared');
                            sendResponse({ success: true });
                        } catch (error) {
                            console.error('❌ Error processing clearSessionData response:', error);
                            sendResponse({ success: false, error: error.message });
                        }
                    });
                } catch (error) {
                    console.error('❌ Error handling clearSessionData:', error);
                    sendResponse({ success: false, error: error.message });
                }
                return true;
            }

            if (request.action === 'clearAllData') {
                try {
                    chrome.storage.local.clear(() => {
                        try {
                            if (chrome.runtime.lastError) {
                                console.error('❌ Error clearing all data:', chrome.runtime.lastError);
                                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                                return;
                            }
                            
                            // Reset local variables
                            openaiApiKey = null;
                            openaiEnabled = false;
                            sessionTimeout = DEFAULT_SESSION_TIMEOUT;
                            currentSessionId = null;
                            sessionStartTime = null;
                            
                            console.log('✅ All data cleared');
                            sendResponse({ success: true });
                        } catch (error) {
                            console.error('❌ Error processing clearAllData response:', error);
                            sendResponse({ success: false, error: error.message });
                        }
                    });
                } catch (error) {
                    console.error('❌ Error handling clearAllData:', error);
                    sendResponse({ success: false, error: error.message });
                }
                return true;
            }

            if (request.action === 'exportData') {
                try {
                    chrome.storage.local.get(null, (result) => {
                        try {
                            if (chrome.runtime.lastError) {
                                console.error('❌ Error exporting data:', chrome.runtime.lastError);
                                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                                return;
                            }
                            
                            const exportData = {
                                exportDate: new Date().toISOString(),
                                version: '1.0',
                                data: result
                            };
                            
                            console.log('✅ Data exported');
                            sendResponse({ success: true, data: exportData });
                        } catch (error) {
                            console.error('❌ Error processing exportData response:', error);
                            sendResponse({ success: false, error: error.message });
                        }
                    });
                } catch (error) {
                    console.error('❌ Error handling exportData:', error);
                    sendResponse({ success: false, error: error.message });
                }
                return true;
            }

            if (request.action === 'importData') {
                try {
                    const importData = request.data;
                    
                    if (!importData || !importData.data) {
                        sendResponse({ success: false, error: 'Invalid import data format' });
                        return true;
                    }
                    
                    chrome.storage.local.set(importData.data, () => {
                        try {
                            if (chrome.runtime.lastError) {
                                console.error('❌ Error importing data:', chrome.runtime.lastError);
                                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                                return;
                            }
                            
                            // Reload settings
                            loadOpenAISettings();
                            loadSessionSettings();
                            
                            console.log('✅ Data imported');
                            sendResponse({ success: true });
                        } catch (error) {
                            console.error('❌ Error processing importData response:', error);
                            sendResponse({ success: false, error: error.message });
                        }
                    });
                } catch (error) {
                    console.error('❌ Error handling importData:', error);
                    sendResponse({ success: false, error: error.message });
                }
                return true;
            }

            // Unknown action
            console.error('❌ Unknown action:', request.action);
            sendResponse({ success: false, error: 'Unknown action' });
            return true;
        } catch (error) {
            console.error('❌ Error in message listener:', error);
            sendResponse({ success: false, error: error.message });
            return true;
        }
    });
} catch (error) {
    console.error('❌ Error setting up message listener:', error);
}