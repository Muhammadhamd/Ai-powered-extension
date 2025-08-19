// BrowBuddy Tools Registry
// Tools that agents can use to interact with web pages

(function () {
    const toolRegistry = Object.create(null);

    // Tools API
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
        console.log(`🔧 Tool registered: ${toolName}`);
        return true;
    }

    async function callTool(toolName, args = {}) {
        const tool = toolRegistry[toolName];
        if (!tool) {
            console.warn(`Tools: tool not found: ${toolName}`);
            return { error: `Tool '${toolName}' not found` };
        }
        try {
            console.log(`🔧 Calling tool: ${toolName}`, args);
            const result = await Promise.resolve(tool.fn(args));
            return { success: true, data: result };
        } catch (error) {
            console.error(`Tools: tool ${toolName} error`, error);
            return { error: error.message };
        }
    }

    function listTools() {
        return Object.keys(toolRegistry);
    }

    function getToolInfo(toolName) {
        const tool = toolRegistry[toolName];
        if (!tool) return null;
        return {
            name: toolName,
            description: tool.description,
            registeredAt: tool.registeredAt
        };
    }

    function getAllToolsInfo() {
        return Object.entries(toolRegistry).map(([name, tool]) => ({
            name,
            description: tool.description,
            registeredAt: tool.registeredAt
        }));
    }

    // ================================
    // DEFAULT TOOLS
    // ================================

    // Tool: Get safe page content (text only)
    function getSafePageContent(args = {}) {
        try {
            // Try to use BrowBuddy's getPageContent if available
            if (window.BrowBuddy && typeof window.BrowBuddy.getPageContent === 'function') {
                return window.BrowBuddy.getPageContent();
            }
            
            // Fallback minimal extraction
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = document.documentElement.outerHTML;
            const elementsToRemove = tempDiv.querySelectorAll('script, style, noscript, iframe, img, video, audio, canvas, svg');
            elementsToRemove.forEach(el => el.remove());
            
            let content = (tempDiv.textContent || '').replace(/\s+/g, ' ').trim();
            
            // Apply length limit if specified
            if (args.maxLength && typeof args.maxLength === 'number') {
                content = content.substring(0, args.maxLength);
            }
            
            return content;
        } catch (error) {
            console.error('Tools: error getting page content', error);
            return '';
        }
    }

    // Get tool schema for OpenAI function calling
    function getToolSchemas() {
        return [
            {
                type: "function",
                function: {
                    name: "getSafePageContent",
                    description: "Extract clean text content from the current webpage, removing scripts, styles, and other non-text elements",
                    parameters: {
                        type: "object",
                        properties: {
                            maxLength: {
                                type: "number",
                                description: "Maximum length of content to return (optional)"
                            }
                        },
                        required: []
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "getPageHTML",
                    description: "Get the full HTML source code of the current webpage",
                    parameters: {
                        type: "object",
                        properties: {
                            maxLength: {
                                type: "number",
                                description: "Maximum length of HTML to return (optional)"
                            }
                        },
                        required: []
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "getPageMetadata",
                    description: "Extract metadata from the webpage including title, URL, meta tags, links, and headings",
                    parameters: {
                        type: "object",
                        properties: {
                            includeLinks: {
                                type: "boolean",
                                description: "Whether to include links from the page"
                            },
                            maxLinks: {
                                type: "number",
                                description: "Maximum number of links to return (default: 50)"
                            },
                            includeHeadings: {
                                type: "boolean",
                                description: "Whether to include headings from the page"
                            },
                            maxHeadings: {
                                type: "number",
                                description: "Maximum number of headings to return (default: 30)"
                            }
                        },
                        required: []
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "extractTextFromSelector",
                    description: "Extract text content from specific HTML elements using CSS selectors",
                    parameters: {
                        type: "object",
                        properties: {
                            selector: {
                                type: "string",
                                description: "CSS selector to target specific elements (e.g., 'h1', '.className', '#id')"
                            },
                            maxResults: {
                                type: "number",
                                description: "Maximum number of matching elements to process (default: 10)"
                            }
                        },
                        required: ["selector"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "getCurrentPageInfo",
                    description: "Get basic information about the current webpage including URL, title, domain, and browser details",
                    parameters: {
                        type: "object",
                        properties: {},
                        required: []
                    }
                }
            }
        ];
    }

    // Tool: Get page HTML
    function getPageHTML(args = {}) {
        try {
            // Try to use BrowBuddy's getPageHTML if available
            if (window.BrowBuddy && typeof window.BrowBuddy.getPageHTML === 'function') {
                return window.BrowBuddy.getPageHTML();
            }
            
            let html = document.documentElement.outerHTML;
            
            // Apply length limit if specified
            if (args.maxLength && typeof args.maxLength === 'number') {
                html = html.substring(0, args.maxLength);
            }
            
            return html;
        } catch (error) {
            console.error('Tools: error getting page HTML', error);
            return '';
        }
    }

    // Tool: Get page metadata
    function getPageMetadata(args = {}) {
        try {
            const metadata = {
                title: document.title,
                url: window.location.href,
                domain: window.location.hostname,
                pathname: window.location.pathname,
                timestamp: new Date().toISOString()
            };

            // Get meta tags
            const metaTags = {};
            document.querySelectorAll('meta').forEach(meta => {
                const name = meta.getAttribute('name') || meta.getAttribute('property');
                const content = meta.getAttribute('content');
                if (name && content) {
                    metaTags[name] = content;
                }
            });
            metadata.metaTags = metaTags;

            // Get links (if requested)
            if (args.includeLinks) {
                const links = Array.from(document.querySelectorAll('a[href]')).map(link => ({
                    text: link.textContent.trim(),
                    href: link.href,
                    title: link.title
                })).filter(link => link.text && link.href);
                metadata.links = links.slice(0, args.maxLinks || 50);
            }

            // Get headings (if requested)
            if (args.includeHeadings) {
                const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(heading => ({
                    tag: heading.tagName.toLowerCase(),
                    text: heading.textContent.trim(),
                    level: parseInt(heading.tagName.charAt(1))
                })).filter(heading => heading.text);
                metadata.headings = headings.slice(0, args.maxHeadings || 30);
            }

            return metadata;
        } catch (error) {
            console.error('Tools: error getting page metadata', error);
            return {};
        }
    }

    // Tool: Extract text from CSS selector
    function extractTextFromSelector(args = {}) {
        try {
            const { selector, maxResults = 10 } = args;
            if (!selector) {
                return { error: 'Selector is required' };
            }

            const elements = document.querySelectorAll(selector);
            const results = Array.from(elements).slice(0, maxResults).map(el => ({
                text: el.textContent.trim(),
                tagName: el.tagName.toLowerCase(),
                className: el.className,
                id: el.id
            })).filter(item => item.text);

            return {
                selector,
                count: results.length,
                results
            };
        } catch (error) {
            console.error('Tools: error extracting text from selector', error);
            return { error: error.message };
        }
    }

    // Tool: Get current page info
    function getCurrentPageInfo(args = {}) {
        try {
            return {
                title: document.title,
                url: window.location.href,
                domain: window.location.hostname,
                pathname: window.location.pathname,
                hash: window.location.hash,
                search: window.location.search,
                protocol: window.location.protocol,
                userAgent: navigator.userAgent,
                language: navigator.language,
                timestamp: new Date().toISOString(),
                readyState: document.readyState,
                characterSet: document.characterSet,
                referrer: document.referrer
            };
        } catch (error) {
            console.error('Tools: error getting current page info', error);
            return {};
        }
    }

    // ================================
    // REGISTER DEFAULT TOOLS
    // ================================

    registerTool('getSafePageContent', getSafePageContent, 'Extract clean text content from the current page');
    registerTool('getPageHTML', getPageHTML, 'Get the full HTML source of the current page');
    registerTool('getPageMetadata', getPageMetadata, 'Extract metadata, meta tags, links, and headings from the page');
    registerTool('extractTextFromSelector', extractTextFromSelector, 'Extract text content from elements matching a CSS selector');
    registerTool('getCurrentPageInfo', getCurrentPageInfo, 'Get basic information about the current page (URL, title, etc.)');

    // ================================
    // EXPOSE TO GLOBAL
    // ================================

    // Create tools namespace
    const toolsAPI = {
        registerTool,
        callTool,
        listTools,
        getToolInfo,
        getAllToolsInfo,
        // Direct access to tool functions for internal use
        getSafePageContent,
        getPageHTML,
        getPageMetadata,
        extractTextFromSelector,
        getCurrentPageInfo
    };

    // Expose to BrowBuddy namespace
    window.BrowBuddy = Object.assign({}, window.BrowBuddy || {}, {
        tools: Object.assign(toolsAPI, {
            getToolSchemas // Add schema function to tools API
        })
    });

    console.log('🔧 Tools module initialized with', Object.keys(toolRegistry).length, 'default tools');
})();
