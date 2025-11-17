// =============================================
// CodeNexus - Advanced Code Playground
// =============================================

class CodePlayground {
    constructor() {
        this.currentFile = 'main.js';
        this.files = {
            'main.js': {
                language: 'JavaScript',
                icon: 'fab fa-js-square',
                content: document.getElementById('codeEditor').value
            },
            'styles.css': {
                language: 'CSS',
                icon: 'fab fa-css3-alt',
                content: '/* Add your CSS styles here */\n\nbody {\n    margin: 0;\n    padding: 0;\n    font-family: Arial, sans-serif;\n}\n\n.container {\n    max-width: 1200px;\n    margin: 0 auto;\n    padding: 20px;\n}'
            },
            'index.html': {
                language: 'HTML',
                icon: 'fab fa-html5',
                content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>My Page</title>\n</head>\n<body>\n    <h1>Hello World!</h1>\n</body>\n</html>'
            },
            'data.json': {
                language: 'JSON',
                icon: 'fas fa-brackets-curly',
                content: '{\n    "name": "CodeNexus",\n    "version": "1.0.0",\n    "features": [\n        "Syntax Highlighting",\n        "Multiple Themes",\n        "Live Preview",\n        "Code Execution"\n    ]\n}'
            }
        };
        
        this.settings = {
            theme: 'dark',
            fontSize: 14,
            tabSize: 4,
            autoSave: true
        };
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.updateLineNumbers();
        this.loadSettings();
        this.startAutoSave();
        
        // Add syntax highlighting simulation
        this.applySyntaxHighlighting();
    }
    
    cacheElements() {
        // Editor elements
        this.editor = document.getElementById('codeEditor');
        this.lineNumbers = document.getElementById('lineNumbers');
        this.languageBadge = document.getElementById('languageBadge');
        this.lineInfo = document.getElementById('lineInfo');
        
        // Navigation
        this.themeToggle = document.getElementById('themeToggle');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.shareBtn = document.getElementById('shareBtn');
        
        // Editor actions
        this.formatBtn = document.getElementById('formatBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.runBtn = document.getElementById('runBtn');
        
        // Output panel
        this.consoleView = document.getElementById('consoleView');
        this.previewView = document.getElementById('previewView');
        this.previewFrame = document.getElementById('previewFrame');
        this.clearConsole = document.getElementById('clearConsole');
        this.toggleOutput = document.getElementById('toggleOutput');
        this.outputPanel = document.getElementById('outputPanel');
        
        // Modals
        this.settingsModal = document.getElementById('settingsModal');
        this.shareModal = document.getElementById('shareModal');
        
        // File tree
        this.fileTree = document.querySelectorAll('.tree-item.file');
        
        // Sidebar
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        
        // Toast container
        this.toastContainer = document.getElementById('toastContainer');
    }
    
    attachEventListeners() {
        // Editor events
        this.editor.addEventListener('input', () => {
            this.updateLineNumbers();
            this.updateLineInfo();
            this.applySyntaxHighlighting();
            this.files[this.currentFile].content = this.editor.value;
        });
        
        this.editor.addEventListener('scroll', () => {
            this.lineNumbers.scrollTop = this.editor.scrollTop;
        });
        
        this.editor.addEventListener('click', () => this.updateLineInfo());
        this.editor.addEventListener('keyup', () => this.updateLineInfo());
        
        // Navigation buttons
        this.themeToggle.addEventListener('click', () => this.cycleTheme());
        this.settingsBtn.addEventListener('click', () => this.openModal(this.settingsModal));
        this.shareBtn.addEventListener('click', () => this.openModal(this.shareModal));
        
        // Editor action buttons
        this.formatBtn.addEventListener('click', () => this.formatCode());
        this.copyBtn.addEventListener('click', () => this.copyCode());
        this.downloadBtn.addEventListener('click', () => this.downloadCode());
        this.runBtn.addEventListener('click', () => this.runCode());
        
        // Output panel
        this.clearConsole.addEventListener('click', () => this.clearConsoleOutput());
        this.toggleOutput.addEventListener('click', () => this.toggleOutputPanel());
        
        // Output tabs
        document.querySelectorAll('.output-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchOutputTab(e.target.closest('.output-tab')));
        });
        
        // File tree
        this.fileTree.forEach(item => {
            item.addEventListener('click', () => this.switchFile(item.dataset.file));
        });
        
        // Sidebar toggle
        this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        
        // Settings modal
        document.getElementById('closeSettings').addEventListener('click', () => this.closeModal(this.settingsModal));
        document.getElementById('fontSizeInput').addEventListener('input', (e) => this.updateFontSize(e.target.value));
        document.getElementById('tabSizeInput').addEventListener('change', (e) => this.updateTabSize(e.target.value));
        document.getElementById('autoSaveToggle').addEventListener('change', (e) => this.toggleAutoSave(e.target.checked));
        
        // Theme cards
        document.querySelectorAll('.theme-card').forEach(card => {
            card.addEventListener('click', () => this.setTheme(card.dataset.theme));
        });
        
        // Share modal
        document.getElementById('closeShare').addEventListener('click', () => this.closeModal(this.shareModal));
        document.getElementById('copyLinkBtn').addEventListener('click', () => this.copyShareLink());
        
        // Close modals on backdrop click
        [this.settingsModal, this.shareModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal(modal);
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }
    
    updateLineNumbers() {
        const lines = this.editor.value.split('\n').length;
        this.lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
    }
    
    updateLineInfo() {
        const pos = this.editor.selectionStart;
        const textBeforeCursor = this.editor.value.substring(0, pos);
        const line = textBeforeCursor.split('\n').length;
        const col = textBeforeCursor.split('\n').pop().length + 1;
        this.lineInfo.textContent = `Ln ${line}, Col ${col}`;
    }
    
    applySyntaxHighlighting() {
        // This is a simplified syntax highlighting simulation
        // In production, you'd use a library like Prism.js or CodeMirror
        const lang = this.files[this.currentFile].language;
        this.languageBadge.textContent = lang;
    }
    
    cycleTheme() {
        const themes = ['dark', 'light', 'monokai', 'nord'];
        const currentIndex = themes.indexOf(this.settings.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.setTheme(themes[nextIndex]);
    }
    
    setTheme(theme) {
        this.settings.theme = theme;
        document.body.dataset.theme = theme;
        
        // Update theme cards
        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.toggle('active', card.dataset.theme === theme);
        });
        
        // Update theme toggle icon
        const icons = {
            dark: 'fa-moon',
            light: 'fa-sun',
            monokai: 'fa-palette',
            nord: 'fa-snowflake'
        };
        this.themeToggle.querySelector('i').className = `fas ${icons[theme]}`;
        
        this.showToast('Theme Changed', `Switched to ${theme} theme`, 'success');
        this.saveSettings();
    }
    
    formatCode() {
        try {
            const lang = this.files[this.currentFile].language;
            let formatted = this.editor.value;
            
            if (lang === 'JSON') {
                const parsed = JSON.parse(this.editor.value);
                formatted = JSON.stringify(parsed, null, this.settings.tabSize);
            } else if (lang === 'JavaScript') {
                // Simple indentation fix
                formatted = this.simpleFormat(this.editor.value);
            }
            
            this.editor.value = formatted;
            this.files[this.currentFile].content = formatted;
            this.updateLineNumbers();
            this.showToast('Code Formatted', 'Your code has been formatted', 'success');
        } catch (error) {
            this.showToast('Format Error', error.message, 'error');
        }
    }
    
    simpleFormat(code) {
        // Basic formatting for demo purposes
        const lines = code.split('\n');
        let indentLevel = 0;
        const indentSize = this.settings.tabSize;
        
        return lines.map(line => {
            const trimmed = line.trim();
            
            if (trimmed.match(/^[}\]]/)) {
                indentLevel = Math.max(0, indentLevel - 1);
            }
            
            const formatted = ' '.repeat(indentLevel * indentSize) + trimmed;
            
            if (trimmed.match(/[{[]$/)) {
                indentLevel++;
            }
            
            return formatted;
        }).join('\n');
    }
    
    copyCode() {
        navigator.clipboard.writeText(this.editor.value).then(() => {
            this.showToast('Copied!', 'Code copied to clipboard', 'success');
        }).catch(() => {
            this.showToast('Copy Failed', 'Could not copy to clipboard', 'error');
        });
    }
    
    downloadCode() {
        const blob = new Blob([this.editor.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.currentFile;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Downloaded', `${this.currentFile} downloaded`, 'success');
    }
    
    runCode() {
        this.logToConsole('Running code...', 'info');
        
        const lang = this.files[this.currentFile].language;
        
        if (lang === 'JavaScript') {
            this.runJavaScript();
        } else if (lang === 'HTML') {
            this.runHTML();
        } else {
            this.logToConsole(`Cannot execute ${lang} files directly`, 'warn');
        }
    }
    
    runJavaScript() {
        const originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error
        };
        
        // Override console methods to capture output
        console.log = (...args) => {
            this.logToConsole(args.join(' '), 'log');
            originalConsole.log(...args);
        };
        console.warn = (...args) => {
            this.logToConsole(args.join(' '), 'warn');
            originalConsole.warn(...args);
        };
        console.error = (...args) => {
            this.logToConsole(args.join(' '), 'error');
            originalConsole.error(...args);
        };
        
        try {
            // Execute the code
            eval(this.editor.value);
            this.logToConsole('Code executed successfully', 'info');
        } catch (error) {
            this.logToConsole(`Error: ${error.message}`, 'error');
            this.addProblem(error.message, 'error');
        } finally {
            // Restore console methods
            console.log = originalConsole.log;
            console.warn = originalConsole.warn;
            console.error = originalConsole.error;
        }
    }
    
    runHTML() {
        const htmlContent = this.editor.value;
        const cssContent = this.files['styles.css']?.content || '';
        const jsContent = this.files['main.js']?.content || '';
        
        const fullHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>${cssContent}</style>
            </head>
            <body>
                ${htmlContent}
                <script>${jsContent}<\/script>
            </body>
            </html>
        `;
        
        this.previewFrame.srcdoc = fullHTML;
        this.switchOutputTab(document.querySelector('.output-tab[data-tab="preview"]'));
        this.logToConsole('HTML preview updated', 'info');
    }
    
    logToConsole(message, type = 'log') {
        const messageEl = document.createElement('div');
        messageEl.className = `console-message ${type}`;
        
        const icons = {
            log: 'fa-terminal',
            info: 'fa-info-circle',
            warn: 'fa-exclamation-triangle',
            error: 'fa-times-circle'
        };
        
        const timestamp = new Date().toLocaleTimeString();
        
        messageEl.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${this.escapeHtml(message)}</span>
            <span class="timestamp">${timestamp}</span>
        `;
        
        this.consoleView.appendChild(messageEl);
        this.consoleView.scrollTop = this.consoleView.scrollHeight;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    clearConsoleOutput() {
        this.consoleView.innerHTML = '';
        this.logToConsole('Console cleared', 'info');
    }
    
    toggleOutputPanel() {
        this.outputPanel.classList.toggle('minimized');
        const icon = this.toggleOutput.querySelector('i');
        icon.className = this.outputPanel.classList.contains('minimized') 
            ? 'fas fa-chevron-up' 
            : 'fas fa-chevron-down';
    }
    
    switchOutputTab(tab) {
        const targetTab = tab.dataset.tab;
        
        // Update tab active states
        document.querySelectorAll('.output-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update view active states
        document.querySelectorAll('.console-view, .preview-view, .problems-view').forEach(v => {
            v.classList.remove('active');
        });
        document.getElementById(`${targetTab}View`).classList.add('active');
    }
    
    addProblem(message, severity = 'error') {
        const problemsView = document.getElementById('problemsView');
        const badge = document.getElementById('problemCount');
        
        // Remove empty state if exists
        const emptyState = problemsView.querySelector('.empty-state');
        if (emptyState) emptyState.remove();
        
        const problemEl = document.createElement('div');
        problemEl.className = `console-message ${severity}`;
        problemEl.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${this.escapeHtml(message)}</span>
            <span class="timestamp">${this.currentFile}</span>
        `;
        
        problemsView.appendChild(problemEl);
        
        const count = problemsView.querySelectorAll('.console-message').length;
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
    
    switchFile(filename) {
        // Save current file content
        this.files[this.currentFile].content = this.editor.value;
        
        // Switch to new file
        this.currentFile = filename;
        this.editor.value = this.files[filename].content;
        this.languageBadge.textContent = this.files[filename].language;
        
        // Update UI
        this.updateLineNumbers();
        this.updateLineInfo();
        this.applySyntaxHighlighting();
        
        // Update file tree active states
        document.querySelectorAll('.tree-item.file').forEach(item => {
            item.classList.toggle('active', item.dataset.file === filename);
        });
        
        this.showToast('File Switched', `Now editing ${filename}`, 'success');
    }
    
    toggleSidebar() {
        this.sidebar.classList.toggle('collapsed');
        const icon = this.sidebarToggle.querySelector('i');
        icon.className = this.sidebar.classList.contains('collapsed') 
            ? 'fas fa-chevron-right' 
            : 'fas fa-chevron-left';
    }
    
    openModal(modal) {
        modal.classList.add('active');
    }
    
    closeModal(modal) {
        modal.classList.remove('active');
    }
    
    updateFontSize(size) {
        this.settings.fontSize = parseInt(size);
        this.editor.style.fontSize = `${size}px`;
        this.lineNumbers.style.fontSize = `${size}px`;
        document.getElementById('fontSizeValue').textContent = `${size}px`;
        this.saveSettings();
    }
    
    updateTabSize(size) {
        this.settings.tabSize = parseInt(size);
        this.editor.style.tabSize = size;
        this.saveSettings();
    }
    
    toggleAutoSave(enabled) {
        this.settings.autoSave = enabled;
        this.saveSettings();
        this.showToast('Auto Save', enabled ? 'Enabled' : 'Disabled', 'info');
    }
    
    copyShareLink() {
        const input = document.getElementById('shareLinkInput');
        input.select();
        navigator.clipboard.writeText(input.value).then(() => {
            this.showToast('Link Copied!', 'Share link copied to clipboard', 'success');
        });
    }
    
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + S: Save (preventDefault to avoid browser save)
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.saveFiles();
            this.showToast('Saved', 'All files saved', 'success');
        }
        
        // Ctrl/Cmd + R: Run
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            this.runCode();
        }
        
        // Ctrl/Cmd + /: Toggle comment (basic implementation)
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            this.toggleComment();
        }
        
        // Ctrl/Cmd + D: Duplicate line
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            this.duplicateLine();
        }
    }
    
    toggleComment() {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const text = this.editor.value;
        const beforeCursor = text.substring(0, start);
        const lineStart = beforeCursor.lastIndexOf('\n') + 1;
        const lineEnd = text.indexOf('\n', end);
        const line = text.substring(lineStart, lineEnd === -1 ? text.length : lineEnd);
        
        const commented = line.trim().startsWith('//');
        const newLine = commented ? line.replace('//', '') : '//' + line;
        
        this.editor.value = text.substring(0, lineStart) + newLine + text.substring(lineEnd === -1 ? text.length : lineEnd);
        this.updateLineNumbers();
    }
    
    duplicateLine() {
        const start = this.editor.selectionStart;
        const text = this.editor.value;
        const beforeCursor = text.substring(0, start);
        const lineStart = beforeCursor.lastIndexOf('\n') + 1;
        const lineEnd = text.indexOf('\n', start);
        const line = text.substring(lineStart, lineEnd === -1 ? text.length : lineEnd);
        
        this.editor.value = text.substring(0, lineEnd === -1 ? text.length : lineEnd) + '\n' + line + text.substring(lineEnd === -1 ? text.length : lineEnd);
        this.updateLineNumbers();
    }
    
    showToast(title, message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;
        
        this.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    saveSettings() {
        localStorage.setItem('codeNexusSettings', JSON.stringify(this.settings));
    }
    
    loadSettings() {
        const saved = localStorage.getItem('codeNexusSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
            this.setTheme(this.settings.theme);
            this.updateFontSize(this.settings.fontSize);
            this.updateTabSize(this.settings.tabSize);
            document.getElementById('fontSizeInput').value = this.settings.fontSize;
            document.getElementById('tabSizeInput').value = this.settings.tabSize;
            document.getElementById('autoSaveToggle').checked = this.settings.autoSave;
        }
    }
    
    saveFiles() {
        this.files[this.currentFile].content = this.editor.value;
        localStorage.setItem('codeNexusFiles', JSON.stringify(this.files));
    }
    
    startAutoSave() {
        setInterval(() => {
            if (this.settings.autoSave) {
                this.saveFiles();
            }
        }, 30000); // Auto-save every 30 seconds
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const playground = new CodePlayground();
    
    // Add welcome animation
    setTimeout(() => {
        playground.showToast('Welcome!', 'CodeNexus is ready to code', 'success');
    }, 500);
    
    // Simulate typing effect for demo
    const demoText = document.getElementById('codeEditor').value;
    let currentIndex = 0;
    
    // Optional: Add particles background effect
    createParticleBackground();
});

// Particle background effect
function createParticleBackground() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';
    canvas.style.opacity = '0.3';
    
    document.body.prepend(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 2 + 1
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(100, 150, 255, 0.5)';
        
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}