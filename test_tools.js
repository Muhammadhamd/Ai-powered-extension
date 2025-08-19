// Node.js test script for BrowBuddy tools logic
// Run with: node test_tools.js

// Mock DOM and window objects for Node.js
global.window = {
    BrowBuddy: {}
};

global.document = {
    title: 'Test Page',
    documentElement: {
        outerHTML: '<html><head><title>Test Page</title></head><body><h1>Test Content</h1><p>This is test content.</p></body></html>'
    },
    createElement: function(tag) {
        return {
            innerHTML: '',
            textContent: 'Test content from mock element',
            querySelectorAll: function() {
                return []; // Return empty array for elements to remove
            }
        };
    },
    querySelectorAll: function(selector) {
        if (selector === 'meta') {
            return [
                { getAttribute: () => 'description', getAttribute: () => 'Test page description' },
                { getAttribute: () => 'keywords', getAttribute: () => 'test, page, demo' }
            ];
        }
        if (selector === 'a[href]') {
            return [
                { textContent: 'Test Link', href: 'https://example.com', title: 'Test link title' }
            ];
        }
        return [];
    }
};

global.location = {
    href: 'https://test.example.com/page',
    hostname: 'test.example.com',
    pathname: '/page',
    hash: '',
    search: '',
    protocol: 'https:'
};

global.navigator = {
    userAgent: 'Test User Agent',
    language: 'en-US'
};

console.log('🧪 Testing BrowBuddy Tools in Node.js Environment\n');

// Test 1: Tool Registry
console.log('1. Testing tool registry...');
const toolRegistry = Object.create(null);

function registerTool(toolName, toolFn, description = '') {
    if (typeof toolName !== 'string' || !toolName.trim()) {
        throw new Error('Tool name must be a non-empty string');
    }
    if (typeof toolFn !== 'function') {
        throw new Error('Tool function must be a function');
    }
    toolRegistry[toolName] = {
        fn: toolFn,
        description: description,
        registeredAt: new Date().toISOString()
    };
    console.log(`✅ Tool registered: ${toolName}`);
    return true;
}

async function callTool(toolName, args = {}) {
    const tool = toolRegistry[toolName];
    if (!tool) {
        console.warn(`❌ Tool not found: ${toolName}`);
        return { error: `Tool '${toolName}' not found` };
    }
    try {
        console.log(`🔧 Calling tool: ${toolName}`, args);
        const result = await Promise.resolve(tool.fn(args));
        return { success: true, data: result };
    } catch (error) {
        console.error(`❌ Tool ${toolName} error:`, error.message);
        return { error: error.message };
    }
}

// Test 2: Tool Functions
console.log('\n2. Testing tool functions...');

function getSafePageContent(args = {}) {
    try {
        // Simulate page content extraction
        let content = 'Test Page This is test content from the page. Sample text for testing.';
        
        if (args.maxLength && typeof args.maxLength === 'number') {
            content = content.substring(0, args.maxLength);
        }
        
        return content;
    } catch (error) {
        console.error('Error getting page content:', error);
        return '';
    }
}

function getCurrentPageInfo(args = {}) {
    try {
        return {
            title: document.title,
            url: location.href,
            domain: location.hostname,
            pathname: location.pathname,
            userAgent: navigator.userAgent,
            language: navigator.language,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error getting page info:', error);
        return {};
    }
}

function getPageMetadata(args = {}) {
    try {
        const metadata = {
            title: document.title,
            url: location.href,
            domain: location.hostname,
            timestamp: new Date().toISOString()
        };

        if (args.includeLinks) {
            metadata.links = [
                { text: 'Test Link', href: 'https://example.com', title: 'Test link' }
            ];
        }

        return metadata;
    } catch (error) {
        console.error('Error getting metadata:', error);
        return {};
    }
}

// Test 3: Register and test tools
console.log('\n3. Registering tools...');
registerTool('getSafePageContent', getSafePageContent, 'Extract clean text content');
registerTool('getCurrentPageInfo', getCurrentPageInfo, 'Get page information');
registerTool('getPageMetadata', getPageMetadata, 'Get page metadata');

// Test 4: Tool schemas
console.log('\n4. Testing tool schemas...');
function getToolSchemas() {
    return [
        {
            type: "function",
            function: {
                name: "getSafePageContent",
                description: "Extract clean text content from the current webpage",
                parameters: {
                    type: "object",
                    properties: {
                        maxLength: {
                            type: "number",
                            description: "Maximum length of content to return"
                        }
                    },
                    required: []
                }
            }
        },
        {
            type: "function",
            function: {
                name: "getCurrentPageInfo",
                description: "Get basic information about the current webpage",
                parameters: {
                    type: "object",
                    properties: {},
                    required: []
                }
            }
        }
    ];
}

const schemas = getToolSchemas();
console.log(`✅ Generated ${schemas.length} tool schemas`);
schemas.forEach(schema => {
    console.log(`   - ${schema.function.name}: ${schema.function.description}`);
});

// Test 5: Execute tools
console.log('\n5. Testing tool execution...');

async function runTests() {
    // Test getSafePageContent
    const contentResult = await callTool('getSafePageContent', {});
    console.log('getSafePageContent result:', contentResult.success ? '✅' : '❌', 
                contentResult.success ? contentResult.data.substring(0, 50) + '...' : contentResult.error);

    // Test getCurrentPageInfo
    const infoResult = await callTool('getCurrentPageInfo', {});
    console.log('getCurrentPageInfo result:', infoResult.success ? '✅' : '❌',
                infoResult.success ? `Title: ${infoResult.data.title}` : infoResult.error);

    // Test with parameters
    const limitedContentResult = await callTool('getSafePageContent', { maxLength: 20 });
    console.log('getSafePageContent (limited) result:', limitedContentResult.success ? '✅' : '❌',
                limitedContentResult.success ? `"${limitedContentResult.data}"` : limitedContentResult.error);

    // Test non-existent tool
    const invalidResult = await callTool('nonExistentTool', {});
    console.log('Invalid tool result:', invalidResult.error ? '✅' : '❌', invalidResult.error || 'Unexpected success');
}

runTests().then(() => {
    console.log('\n🎉 All tests completed!');
}).catch(error => {
    console.error('\n❌ Test error:', error);
});

// Test 6: Mock agent flow logic
console.log('\n6. Testing agent flow logic...');

function simulateAgentFlow() {
    const userQuery = "What is on this page?";
    const tools = getToolSchemas();
    
    console.log(`Query: "${userQuery}"`);
    console.log(`Available tools: ${tools.map(t => t.function.name).join(', ')}`);
    
    // Simulate LLM deciding to use getSafePageContent
    console.log('🤖 LLM decides to use: getSafePageContent');
    
    // Simulate tool execution
    callTool('getSafePageContent', {}).then(result => {
        if (result.success) {
            console.log('🔧 Tool result:', result.data.substring(0, 100) + '...');
            console.log('🤖 LLM would now process this content and provide final answer');
        } else {
            console.log('❌ Tool failed:', result.error);
        }
    });
}

setTimeout(simulateAgentFlow, 1000);
