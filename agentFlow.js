// BrowBuddy Simple Agentic Flow
// LLM decides tools and next steps in a loop using OpenAI function calling

(function () {
	// Simple agent loop: query -> LLM decides tools + next step -> repeat until final_output
	async function runAgentFlow(userQuery) {
		if (!userQuery?.trim()) return null;
		if (!window.BrowBuddy?.tools) {
			console.error('Tools module not available');
			return null;
		}

		let step = 1;
		let conversationHistory = []; // Track full conversation including tool calls
		
		console.log('🤖 Starting agent flow for:', userQuery);

		// Get tool schemas for OpenAI function calling
		const toolSchemas = window.BrowBuddy.tools.getToolSchemas();
		console.log('🔧 Available tools:', toolSchemas.map(t => t.function.name));

		while (step <= 10) { // Max 10 steps to prevent infinite loops
			console.log(`🔄 Agent Step ${step}`);
			
			try {
				// Call LLM with tools
				const llmResult = await callLLMWithTools(userQuery, toolSchemas, conversationHistory);
				if (!llmResult || !llmResult.success) {
					console.error('LLM call failed:', llmResult?.error);
					break;
				}

				const { message, tool_calls } = llmResult.result;
				console.log('🧠 LLM Response:', { content: message.content, tool_calls: tool_calls?.length || 0 });

				// Add assistant message to conversation history
				conversationHistory.push({
					role: 'assistant',
					content: message.content,
					tool_calls: tool_calls
				});

				// If LLM made tool calls, execute them
				if (tool_calls && tool_calls.length > 0) {
					console.log('🔧 Executing tool calls...');
					
					for (const toolCall of tool_calls) {
						const { id, function: funcCall } = toolCall;
						const { name, arguments: args } = funcCall;
						
						console.log(`🔧 Calling tool: ${name}`, args);
						
						try {
							// Parse arguments
							const parsedArgs = JSON.parse(args);
							
							// Execute tool
							const toolResult = await window.BrowBuddy.tools.callTool(name, parsedArgs);
							
							// Add tool result to conversation history
							conversationHistory.push({
								role: 'tool',
								tool_call_id: id,
								content: JSON.stringify(toolResult)
							});
							
							console.log(`✅ Tool ${name} completed`);
						} catch (error) {
							console.error(`❌ Tool ${name} failed:`, error);
							
							// Add error to conversation history
							conversationHistory.push({
								role: 'tool',
								tool_call_id: id,
								content: JSON.stringify({ error: error.message })
							});
						}
					}
					
					// Continue loop to let LLM process tool results
					step++;
					continue;
				}

				// If no tool calls and we have content, this is the final response
				if (message.content) {
					console.log('✅ Agent flow complete');
					return message.content;
				}

				// Shouldn't reach here, but safety break
				console.log('⚠️ No content or tool calls, breaking');
				break;

			} catch (error) {
				console.error('Agent flow error:', error);
				break;
			}
		}

		return 'Agent flow completed without final output';
	}

	// Helper to call LLM with tools using new background function
	async function callLLMWithTools(userQuery, tools, conversationHistory) {
		return new Promise((resolve) => {
			chrome.runtime.sendMessage({
				action: 'runAgentWithTools',
				data: {
					question: userQuery,
					tools: tools,
					conversation_history: conversationHistory
				},
			}, (response) => {
				if (chrome.runtime.lastError) {
					console.error('LLM call failed:', chrome.runtime.lastError);
					resolve({ success: false, error: chrome.runtime.lastError.message });
					return;
				}
				resolve(response || { success: false, error: 'No response' });
			});
		});
	}

	// Legacy helper - kept for backward compatibility
	async function callLLM(prompt) {
		return new Promise((resolve) => {
			chrome.runtime.sendMessage({
				action: 'askOpenAI',
				data: {
					question: prompt,
					pageContext: { 
						title: document.title, 
						url: window.location.href, 
						content: ''
					},
					timestamp: new Date().toISOString(),
				},
			}, (response) => {
				if (chrome.runtime.lastError) {
					console.error('LLM call failed:', chrome.runtime.lastError);
					resolve(null);
					return;
				}
				resolve(response?.success ? response.answer : null);
			});
		});
	}

	// Expose to global
	window.BrowBuddy = Object.assign({}, window.BrowBuddy || {}, {
		runAgentFlow
	});

	console.log('🤖 Simple Agent Flow loaded with OpenAI function calling');
})();
