# Console Test Commands for BrowBuddy

## Quick Testing in Browser Console

Once you load the extension, open any webpage and press F12 to open console, then run these commands:

### 1. Check if modules are loaded
```javascript
// Check if BrowBuddy is available
console.log('BrowBuddy available:', !!window.BrowBuddy);

// Check what's available
console.log('BrowBuddy methods:', Object.keys(window.BrowBuddy));

// Check if tools are available
console.log('Tools available:', !!window.BrowBuddy?.tools);
console.log('Tool methods:', Object.keys(window.BrowBuddy?.tools || {}));
```

### 2. Test individual tools
```javascript
// Test getSafePageContent
BrowBuddy.tools.callTool('getSafePageContent', {}).then(result => {
    console.log('Page content result:', result);
});

// Test getCurrentPageInfo
BrowBuddy.tools.callTool('getCurrentPageInfo', {}).then(result => {
    console.log('Page info result:', result);
});

// Test getPageMetadata with parameters
BrowBuddy.tools.callTool('getPageMetadata', { 
    includeLinks: true, 
    maxLinks: 5,
    includeHeadings: true,
    maxHeadings: 10 
}).then(result => {
    console.log('Page metadata result:', result);
});
```

### 3. Check tool schemas
```javascript
// Get available tool schemas
const schemas = BrowBuddy.tools.getToolSchemas();
console.log('Tool schemas:', schemas);

// Show tool names and descriptions
schemas.forEach(schema => {
    console.log(`${schema.function.name}: ${schema.function.description}`);
});
```

### 4. Test agent flow (requires OpenAI API key)
```javascript
// First, make sure OpenAI is configured
// Go to extension popup and set your API key

// Then test the agent flow
BrowBuddy.runAgentFlow("What are the main topics on this page?").then(result => {
    console.log('Agent flow result:', result);
});

// Test with different queries
BrowBuddy.runAgentFlow("Extract all the links from this page").then(result => {
    console.log('Links extraction result:', result);
});

BrowBuddy.runAgentFlow("What is the title and main heading of this page?").then(result => {
    console.log('Title/heading result:', result);
});
```

### 5. Test error handling
```javascript
// Test with invalid tool
BrowBuddy.tools.callTool('invalidTool', {}).then(result => {
    console.log('Invalid tool result:', result);
});

// Test with invalid arguments
BrowBuddy.tools.callTool('extractTextFromSelector', { selector: '' }).then(result => {
    console.log('Invalid selector result:', result);
});
```

### 6. Monitor the full conversation
```javascript
// Enable detailed logging for debugging
console.log('Starting detailed agent flow test...');

BrowBuddy.runAgentFlow("Give me a summary of this webpage").then(result => {
    console.log('Final result:', result);
}).catch(error => {
    console.error('Agent flow error:', error);
});

// Check the console for detailed logs showing:
// - Tool schemas being sent
// - LLM responses with tool calls
// - Tool execution results
// - Final response
```

## Debugging Tips

1. **Check extension popup** - Make sure OpenAI API key is set and enabled
2. **Monitor Network tab** - See actual API calls to OpenAI
3. **Check Console logs** - Look for detailed logs from agentFlow.js
4. **Test on simple pages first** - Try on pages like Wikipedia articles
5. **Verify tool results** - Make sure tools return expected data format

## Expected Output Examples

### Successful tool call:
```json
{
  "success": true,
  "data": "Page content text here..."
}
```

### Failed tool call:
```json
{
  "error": "Tool 'invalidTool' not found"
}
```

### Agent flow with tool usage:
```
🤖 Starting agent flow for: What are the main topics on this page?
🔧 Available tools: getSafePageContent,getPageHTML,getPageMetadata,extractTextFromSelector,getCurrentPageInfo
🔄 Agent Step 1
🧠 LLM Response: { content: null, tool_calls: 1 }
🔧 Executing tool calls...
🔧 Calling tool: getSafePageContent {}
✅ Tool getSafePageContent completed
🔄 Agent Step 2
🧠 LLM Response: { content: "Based on the page content...", tool_calls: 0 }
✅ Agent flow complete
```
