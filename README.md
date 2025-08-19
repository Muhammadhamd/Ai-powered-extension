# 🤖 BrowBuddy - AI-Powered Browser Assistant

BrowBuddy is a Chrome extension that provides an AI-powered assistant that appears as a floating circle on every webpage, helping you navigate and interact with web content.

## ✨ Features

- **Floating AI Assistant**: A beautiful circular interface that appears on every website
- **Smart Chat Interface**: Ask questions about the current webpage
- **Keyboard Shortcuts**: Quick access with `Ctrl+Shift+B`
- **Customizable Position**: Choose where the circle appears on the page
- **Modern UI**: Beautiful gradients and smooth animations
- **Context Menu Integration**: Right-click to ask BrowBuddy about selected text
- **Settings Management**: Easy-to-use popup interface for configuration

## 🚀 Installation

### For Development/Testing:

1. **Download/Clone** this repository to your local machine
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in the top-right corner)
4. **Click "Load unpacked"** and select the extension folder
5. **Pin the extension** to your toolbar for easy access

### For Production:

1. **Package the extension** using Chrome's developer tools
2. **Upload to Chrome Web Store** (requires developer account)
3. **Install from the store** like any other extension

## 🎯 How to Use

### Basic Usage:
1. **Install the extension** and it will appear on every webpage
2. **Click the floating circle** (bottom-right by default) to open the AI interface
3. **Type your question** about the current webpage
4. **Get AI-powered responses** to help you navigate and understand the content

### Keyboard Shortcuts:
- `Ctrl+Shift+B` (Windows/Linux) or `Cmd+Shift+B` (Mac): Toggle AI interface

### Context Menu:
- **Right-click** on any text or page
- **Select "Ask BrowBuddy about this page"** for quick assistance

### Settings:
- **Click the extension icon** in the toolbar to open settings
- **Toggle the extension** on/off
- **Change circle position** (bottom-right, bottom-left, top-right, top-left)

## 🛠️ Technical Details

### File Structure:
```
browbuddy/
├── manifest.json          # Extension configuration
├── popup.html            # Settings popup interface
├── popup.css             # Popup styling
├── popup.js              # Popup functionality
├── content.js            # Content script for webpage integration
├── content.css           # Floating circle styling
├── background.js         # Background service worker
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

### Key Components:

1. **Content Script (`content.js`)**: 
   - Creates the floating circle
   - Manages AI chat interface
   - Handles user interactions

2. **Popup Interface (`popup.html/js/css`)**:
   - Extension settings and controls
   - Status information
   - Feature overview

3. **Background Script (`background.js`)**:
   - Extension lifecycle management
   - Message passing between components
   - Context menu integration

4. **Styling (`content.css`)**:
   - Floating circle design
   - Animations and transitions
   - Responsive design

## 🔧 Customization

### Changing Colors:
Edit the CSS variables in `content.css` and `popup.css`:
```css
/* Main gradient colors */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Modifying Position:
The circle position can be changed in the popup settings or by editing the CSS in `content.css`.

### Adding Features:
The modular structure makes it easy to add new features:
- Add new AI capabilities in `content.js`
- Extend the popup interface in `popup.html`
- Add new settings in the background script

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

## 📝 TODO

- [ ] Integrate with actual AI API (OpenAI, Claude, etc.)
- [ ] Add page content analysis
- [ ] Implement content summarization
- [ ] Add voice input/output
- [ ] Create browser action popup
- [ ] Add more customization options
- [ ] Implement user preferences storage
- [ ] Add analytics and usage tracking

## 🐛 Known Issues

- Currently uses placeholder AI responses (needs API integration)
- Circle position changes require page refresh
- Some websites may block content script injection

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Chrome Extension API documentation
- Modern CSS techniques and animations
- AI/ML community for inspiration

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Contact the development team

---

**Made with ❤️ for better web browsing** 