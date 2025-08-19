// Simple BrowBuddy Popup Script
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Event listeners
        const viewSessionBtn = document.getElementById('view-session');
        const viewEventsBtn = document.getElementById('view-events');
        const setApiKeyBtn = document.getElementById('set-api-key');
        const toggleOpenAIBtn = document.getElementById('toggle-openai');
        const apiKeyInput = document.getElementById('openai-key');
        const apiStatusText = document.getElementById('api-status-text');
        
        // Settings elements
        const sessionTimeoutInput = document.getElementById('session-timeout');
        const saveSessionTimeoutBtn = document.getElementById('save-session-timeout');
        const currentSessionId = document.getElementById('current-session-id');
        const newSessionBtn = document.getElementById('new-session');
        const clearSessionDataBtn = document.getElementById('clear-session-data');
        const aiModelSelect = document.getElementById('ai-model');
        const maxTokensInput = document.getElementById('max-tokens');
        const temperatureSlider = document.getElementById('temperature');
        const temperatureValue = document.getElementById('temperature-value');
        const autoAnalyzeCheckbox = document.getElementById('auto-analyze');
        const showNotificationsCheckbox = document.getElementById('show-notifications');
        const circlePositionSelect = document.getElementById('circle-position');
        const exportDataBtn = document.getElementById('export-data');
        const importDataBtn = document.getElementById('import-data');
        const clearAllDataBtn = document.getElementById('clear-all-data');
        const saveAllSettingsBtn = document.getElementById('save-all-settings');
        const resetSettingsBtn = document.getElementById('reset-settings');
        
        if (!viewSessionBtn || !viewEventsBtn || !setApiKeyBtn || !toggleOpenAIBtn) {
            console.error('❌ Required buttons not found');
            return;
        }
        
        viewSessionBtn.addEventListener('click', viewSession);
        viewEventsBtn.addEventListener('click', viewEvents);
        setApiKeyBtn.addEventListener('click', setApiKey);
        toggleOpenAIBtn.addEventListener('click', toggleOpenAI);
        
        // Settings event listeners
        saveSessionTimeoutBtn.addEventListener('click', saveSessionTimeout);
        newSessionBtn.addEventListener('click', startNewSession);
        clearSessionDataBtn.addEventListener('click', clearSessionData);
        temperatureSlider.addEventListener('input', updateTemperatureValue);
        exportDataBtn.addEventListener('click', exportData);
        importDataBtn.addEventListener('click', importData);
        clearAllDataBtn.addEventListener('click', clearAllData);
        saveAllSettingsBtn.addEventListener('click', saveAllSettings);
        resetSettingsBtn.addEventListener('click', resetSettings);
        
        // Load OpenAI status and settings on popup open
        loadOpenAIStatus();
        loadAllSettings();
        
        console.log('✅ Popup initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing popup:', error);
    }

    function viewSession() {
        try {
            console.log('🔍 Getting session info...');
            
            chrome.runtime.sendMessage({
                action: 'getCurrentSession'
            }, (response) => {
                try {
                    if (chrome.runtime.lastError) {
                        console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
                        showNotification('Error: ' + chrome.runtime.lastError.message);
                        return;
                    }
                    
                    if (response && response.success && response.session) {
                        console.log('📋 Session:', response.session);
                        showNotification(`Session: ${response.session.id.substring(0, 8)}...`);
                    } else {
                        console.log('❌ No session found or invalid response');
                        showNotification('No session found');
                    }
                } catch (error) {
                    console.error('❌ Error processing session response:', error);
                    showNotification('Error processing response');
                }
            });

            // Get session tabs
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
            console.error('❌ Error in viewSession:', error);
            showNotification('Error getting session info');
        }
    }

    function viewEvents() {
        try {
            console.log('🔍 Getting session events...');
            
            chrome.runtime.sendMessage({
                action: 'getSessionEvents'
            }, (response) => {
                try {
                    if (chrome.runtime.lastError) {
                        console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
                        showNotification('Error: ' + chrome.runtime.lastError.message);
                        return;
                    }
                    
                    if (response && response.success) {
                        console.log('📋 Events:', response.events);
                        console.log('📊 Total events:', response.events.length);
                        showNotification(`${response.events.length} events found`);
                    } else {
                        console.log('❌ No events found or invalid response');
                        showNotification('No events found');
                    }
                } catch (error) {
                    console.error('❌ Error processing events response:', error);
                    showNotification('Error processing events');
                }
            });
        } catch (error) {
            console.error('❌ Error in viewEvents:', error);
            showNotification('Error getting events');
        }
    }

    function setApiKey() {
        try {
            const apiKey = document.getElementById('openai-key').value.trim();
            if (!apiKey) {
                showNotification('Please enter an API key');
                return;
            }
            
            console.log('🔍 Setting OpenAI API key...');
            
            chrome.runtime.sendMessage({
                action: 'setOpenAIKey',
                apiKey: apiKey
            }, (response) => {
                try {
                    if (chrome.runtime.lastError) {
                        console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
                        showNotification('Error: ' + chrome.runtime.lastError.message);
                        return;
                    }
                    
                    if (response && response.success) {
                        showNotification('✅ API key set successfully');
                        loadOpenAIStatus(); // Refresh status
                        document.getElementById('openai-key').value = ''; // Clear input
                    } else {
                        showNotification('❌ Failed to set API key: ' + (response.error || 'Unknown error'));
                    }
                } catch (error) {
                    console.error('❌ Error processing set API key response:', error);
                    showNotification('Error processing response');
                }
            });
        } catch (error) {
            console.error('❌ Error in setApiKey:', error);
            showNotification('Error setting API key');
        }
    }

    function toggleOpenAI() {
        try {
            console.log('🔍 Toggling OpenAI...');
            
            chrome.runtime.sendMessage({
                action: 'toggleOpenAI'
            }, (response) => {
                try {
                    if (chrome.runtime.lastError) {
                        console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
                        showNotification('Error: ' + chrome.runtime.lastError.message);
                        return;
                    }
                    
                    if (response && response.success) {
                        showNotification('🤖 OpenAI ' + (response.enabled ? 'enabled' : 'disabled'));
                        loadOpenAIStatus(); // Refresh status
                    } else {
                        showNotification('❌ Failed to toggle OpenAI');
                    }
                } catch (error) {
                    console.error('❌ Error processing toggle OpenAI response:', error);
                    showNotification('Error processing response');
                }
            });
        } catch (error) {
            console.error('❌ Error in toggleOpenAI:', error);
            showNotification('Error toggling OpenAI');
        }
    }

    function loadOpenAIStatus() {
        try {
            console.log('🔍 Loading OpenAI status...');
            
            chrome.runtime.sendMessage({
                action: 'getOpenAISettings'
            }, (response) => {
                try {
                    if (chrome.runtime.lastError) {
                        console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
                        return;
                    }
                    
                    if (response && response.success) {
                        const hasKey = !!response.apiKey;
                        const isEnabled = response.enabled;
                        
                        const statusText = hasKey ? 
                            (isEnabled ? 'Status: Enabled' : 'Status: Disabled') : 
                            'Status: Not set';
                        
                        const toggleText = hasKey ? 
                            (isEnabled ? 'Disable' : 'Enable') : 
                            'Enable';
                        
                        document.getElementById('api-status-text').textContent = statusText;
                        document.getElementById('toggle-openai').textContent = toggleText;
                        document.getElementById('toggle-openai').disabled = !hasKey;
                    } else {
                        document.getElementById('api-status-text').textContent = 'Status: Error loading';
                        document.getElementById('toggle-openai').disabled = true;
                    }
                } catch (error) {
                    console.error('❌ Error processing OpenAI status response:', error);
                }
            });
        } catch (error) {
            console.error('❌ Error in loadOpenAIStatus:', error);
        }
    }

    function showNotification(message) {
        try {
            // Remove existing notifications
            const existingNotifications = document.querySelectorAll('.browbuddy-notification');
            existingNotifications.forEach(notification => notification.remove());
            
            const notification = document.createElement('div');
            notification.className = 'browbuddy-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 20px;
                border-radius: 25px;
                font-size: 14px;
                font-weight: 600;
                z-index: 1001;
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
                max-width: 300px;
                text-align: center;
                word-wrap: break-word;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => {
                try {
                    if (notification && notification.parentNode) {
                        notification.remove();
                    }
                } catch (error) {
                    console.error('❌ Error removing notification:', error);
                }
            }, 3000);
        } catch (error) {
            console.error('❌ Error showing notification:', error);
        }
    }

    // Settings Management Functions
    function loadAllSettings() {
        try {
            console.log('🔍 Loading all settings...');
            
            chrome.runtime.sendMessage({
                action: 'getAllSettings'
            }, (response) => {
                try {
                    if (chrome.runtime.lastError) {
                        console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
                        return;
                    }
                    
                    if (response && response.success) {
                        const settings = response.settings;
                        
                        // Load session settings
                        if (settings.sessionTimeout) {
                            document.getElementById('session-timeout').value = settings.sessionTimeout / 60000; // Convert to minutes
                        }
                        
                        if (settings.currentSession) {
                            document.getElementById('current-session-id').textContent = settings.currentSession.id.substring(0, 8) + '...';
                        }
                        
                        // Load AI settings
                        if (settings.aiModel) {
                            document.getElementById('ai-model').value = settings.aiModel;
                        }
                        
                        if (settings.maxTokens) {
                            document.getElementById('max-tokens').value = settings.maxTokens;
                        }
                        
                        if (settings.temperature !== undefined) {
                            document.getElementById('temperature').value = settings.temperature;
                            document.getElementById('temperature-value').textContent = settings.temperature;
                        }
                        
                        // Load interface settings
                        if (settings.autoAnalyze !== undefined) {
                            document.getElementById('auto-analyze').checked = settings.autoAnalyze;
                        }
                        
                        if (settings.showNotifications !== undefined) {
                            document.getElementById('show-notifications').checked = settings.showNotifications;
                        }
                        
                        if (settings.circlePosition) {
                            document.getElementById('circle-position').value = settings.circlePosition;
                        }
                        
                        console.log('✅ Settings loaded successfully');
                    } else {
                        console.log('❌ Failed to load settings');
                    }
                } catch (error) {
                    console.error('❌ Error processing settings response:', error);
                }
            });
        } catch (error) {
            console.error('❌ Error in loadAllSettings:', error);
        }
    }

    function saveSessionTimeout() {
        try {
            const timeoutMinutes = parseInt(document.getElementById('session-timeout').value);
            if (timeoutMinutes < 5 || timeoutMinutes > 480) {
                showNotification('Session timeout must be between 5 and 480 minutes');
                return;
            }
            
            const timeoutMs = timeoutMinutes * 60 * 1000;
            
            chrome.runtime.sendMessage({
                action: 'setSessionTimeout',
                timeout: timeoutMs
            }, (response) => {
                try {
                    if (chrome.runtime.lastError) {
                        console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
                        showNotification('Error: ' + chrome.runtime.lastError.message);
                        return;
                    }
                    
                    if (response && response.success) {
                        showNotification('✅ Session timeout updated');
                    } else {
                        showNotification('❌ Failed to update session timeout');
                    }
                } catch (error) {
                    console.error('❌ Error processing session timeout response:', error);
                    showNotification('Error processing response');
                }
            });
        } catch (error) {
            console.error('❌ Error in saveSessionTimeout:', error);
            showNotification('Error saving session timeout');
        }
    }

    function startNewSession() {
        try {
            chrome.runtime.sendMessage({
                action: 'initSession'
            }, (response) => {
                try {
                    if (chrome.runtime.lastError) {
                        console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
                        showNotification('Error: ' + chrome.runtime.lastError.message);
                        return;
                    }
                    
                    if (response && response.success) {
                        showNotification('✅ New session started');
                        loadAllSettings(); // Refresh session info
                    } else {
                        showNotification('❌ Failed to start new session');
                    }
                } catch (error) {
                    console.error('❌ Error processing new session response:', error);
                    showNotification('Error processing response');
                }
            });
        } catch (error) {
            console.error('❌ Error in startNewSession:', error);
            showNotification('Error starting new session');
        }
    }

    function clearSessionData() {
        try {
            if (confirm('Are you sure you want to clear all session data? This cannot be undone.')) {
                chrome.runtime.sendMessage({
                    action: 'clearSessionData'
                }, (response) => {
                    try {
                        if (chrome.runtime.lastError) {
                            console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
                            showNotification('Error: ' + chrome.runtime.lastError.message);
                            return;
                        }
                        
                        if (response && response.success) {
                            showNotification('✅ Session data cleared');
                            loadAllSettings(); // Refresh session info
                        } else {
                            showNotification('❌ Failed to clear session data');
                        }
                    } catch (error) {
                        console.error('❌ Error processing clear session response:', error);
                        showNotification('Error processing response');
                    }
                });
            }
        } catch (error) {
            console.error('❌ Error in clearSessionData:', error);
            showNotification('Error clearing session data');
        }
    }

    function updateTemperatureValue() {
        const value = document.getElementById('temperature').value;
        document.getElementById('temperature-value').textContent = value;
    }

    function exportData() {
        try {
            chrome.runtime.sendMessage({
                action: 'exportData'
            }, (response) => {
                try {
                    if (chrome.runtime.lastError) {
                        console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
                        showNotification('Error: ' + chrome.runtime.lastError.message);
                        return;
                    }
                    
                    if (response && response.success) {
                        // Create and download file
                        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `browbuddy-data-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        
                        showNotification('✅ Data exported successfully');
                    } else {
                        showNotification('❌ Failed to export data');
                    }
                } catch (error) {
                    console.error('❌ Error processing export response:', error);
                    showNotification('Error processing response');
                }
            });
        } catch (error) {
            console.error('❌ Error in exportData:', error);
            showNotification('Error exporting data');
        }
    }

    function importData() {
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const data = JSON.parse(e.target.result);
                            
                            chrome.runtime.sendMessage({
                                action: 'importData',
                                data: data
                            }, (response) => {
                                try {
                                    if (chrome.runtime.lastError) {
                                        console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
                                        showNotification('Error: ' + chrome.runtime.lastError.message);
                                        return;
                                    }
                                    
                                    if (response && response.success) {
                                        showNotification('✅ Data imported successfully');
                                        loadAllSettings(); // Refresh settings
                                    } else {
                                        showNotification('❌ Failed to import data: ' + (response.error || 'Unknown error'));
                                    }
                                } catch (error) {
                                    console.error('❌ Error processing import response:', error);
                                    showNotification('Error processing response');
                                }
                            });
                        } catch (error) {
                            console.error('❌ Error parsing import file:', error);
                            showNotification('Error: Invalid file format');
                        }
                    };
                    reader.readAsText(file);
                }
            };
            input.click();
        } catch (error) {
            console.error('❌ Error in importData:', error);
            showNotification('Error importing data');
        }
    }

    function clearAllData() {
        try {
            if (confirm('Are you sure you want to clear ALL data? This will reset everything and cannot be undone.')) {
                chrome.runtime.sendMessage({
                    action: 'clearAllData'
                }, (response) => {
                    try {
                        if (chrome.runtime.lastError) {
                            console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
                            showNotification('Error: ' + chrome.runtime.lastError.message);
                            return;
                        }
                        
                        if (response && response.success) {
                            showNotification('✅ All data cleared');
                            loadAllSettings(); // Refresh settings
                        } else {
                            showNotification('❌ Failed to clear all data');
                        }
                    } catch (error) {
                        console.error('❌ Error processing clear all data response:', error);
                        showNotification('Error processing response');
                    }
                });
            }
        } catch (error) {
            console.error('❌ Error in clearAllData:', error);
            showNotification('Error clearing all data');
        }
    }

    function saveAllSettings() {
        try {
            const settings = {
                sessionTimeout: parseInt(document.getElementById('session-timeout').value) * 60000, // Convert to milliseconds
                aiModel: document.getElementById('ai-model').value,
                maxTokens: parseInt(document.getElementById('max-tokens').value),
                temperature: parseFloat(document.getElementById('temperature').value),
                autoAnalyze: document.getElementById('auto-analyze').checked,
                showNotifications: document.getElementById('show-notifications').checked,
                circlePosition: document.getElementById('circle-position').value
            };
            
            chrome.runtime.sendMessage({
                action: 'saveAllSettings',
                settings: settings
            }, (response) => {
                try {
                    if (chrome.runtime.lastError) {
                        console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
                        showNotification('Error: ' + chrome.runtime.lastError.message);
                        return;
                    }
                    
                    if (response && response.success) {
                        showNotification('✅ All settings saved');
                    } else {
                        showNotification('❌ Failed to save settings');
                    }
                } catch (error) {
                    console.error('❌ Error processing save settings response:', error);
                    showNotification('Error processing response');
                }
            });
        } catch (error) {
            console.error('❌ Error in saveAllSettings:', error);
            showNotification('Error saving settings');
        }
    }

    function resetSettings() {
        try {
            if (confirm('Are you sure you want to reset all settings to defaults?')) {
                chrome.runtime.sendMessage({
                    action: 'resetSettings'
                }, (response) => {
                    try {
                        if (chrome.runtime.lastError) {
                            console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
                            showNotification('Error: ' + chrome.runtime.lastError.message);
                            return;
                        }
                        
                        if (response && response.success) {
                            showNotification('✅ Settings reset to defaults');
                            loadAllSettings(); // Refresh settings
                        } else {
                            showNotification('❌ Failed to reset settings');
                        }
                    } catch (error) {
                        console.error('❌ Error processing reset settings response:', error);
                        showNotification('Error processing response');
                    }
                });
            }
        } catch (error) {
            console.error('❌ Error in resetSettings:', error);
            showNotification('Error resetting settings');
        }
    }
  });
  