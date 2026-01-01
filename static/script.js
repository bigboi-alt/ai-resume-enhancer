// ============================================
// AI RESUME ENHANCER - Interactive Script
// ============================================

// DOM Elements
const form = document.getElementById('enhancer-form');
const inputText = document.getElementById('input-text');
const toneSelect = document.getElementById('tone-select');
const outputType = document.getElementById('output-type');
const enhanceBtn = document.getElementById('enhance-btn');
const outputSection = document.getElementById('output-section');
const outputContent = document.getElementById('output-content');
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');
const charCount = document.getElementById('char-count');
const loadingOverlay = document.getElementById('loading-overlay');

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initParallaxEffects();
    initTypingEffect();
    initFloatingElements();
    initSmoothScroll();
    initTextareaEffects();
    initButtonEffects();
    initTooltips();
    createParticles();
    
    // Hide output section initially
    if (outputSection) {
        outputSection.style.display = 'none';
    }
});

// ============================================
// SCROLL ANIMATIONS (Intersection Observer)
// ============================================
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Add stagger effect for children
                const children = entry.target.querySelectorAll('.stagger-child');
                children.forEach((child, index) => {
                    child.style.animationDelay = `${index * 0.1}s`;
                    child.classList.add('animate-in');
                });
            }
        });
    }, observerOptions);

    // Observe all animatable elements
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // Feature cards stagger animation
    document.querySelectorAll('.feature-card').forEach((card, index) => {
        card.style.setProperty('--animation-order', index);
        observer.observe(card);
    });

    // Stats counter animation
    document.querySelectorAll('.stat-number').forEach(stat => {
        observer.observe(stat);
        stat.dataset.animated = 'false';
    });
}

// ============================================
// PARALLAX EFFECTS
// ============================================
function initParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.parallax');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(el => {
            const speed = el.dataset.speed || 0.5;
            const yPos = -(scrolled * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });

        // Navbar background change on scroll
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (scrolled > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

    // Mouse parallax for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth - 0.5;
            const mouseY = e.clientY / window.innerHeight - 0.5;

            const floatingElements = hero.querySelectorAll('.floating-shape');
            floatingElements.forEach((el, index) => {
                const speed = (index + 1) * 20;
                const x = mouseX * speed;
                const y = mouseY * speed;
                el.style.transform = `translate(${x}px, ${y}px)`;
            });
        });
    }
}

// ============================================
// TYPING EFFECT
// ============================================
function initTypingEffect() {
    const typingElements = document.querySelectorAll('.typing-effect');
    
    typingElements.forEach(el => {
        const text = el.dataset.text || el.textContent;
        el.textContent = '';
        el.style.visibility = 'visible';
        
        let index = 0;
        const speed = parseInt(el.dataset.speed) || 50;
        
        function type() {
            if (index < text.length) {
                el.textContent += text.charAt(index);
                index++;
                setTimeout(type, speed);
            } else {
                el.classList.add('typing-complete');
            }
        }
        
        // Start typing when element is in view
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setTimeout(type, 500);
                observer.disconnect();
            }
        });
        observer.observe(el);
    });
}

// ============================================
// FLOATING ELEMENTS ANIMATION
// ============================================
function initFloatingElements() {
    const floatingElements = document.querySelectorAll('.floating-element');
    
    floatingElements.forEach((el, index) => {
        // Random animation properties
        const duration = 3 + Math.random() * 2;
        const delay = Math.random() * 2;
        
        el.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
    });
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const offsetTop = target.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Add highlight effect to target
                target.classList.add('highlight-section');
                setTimeout(() => {
                    target.classList.remove('highlight-section');
                }, 2000);
            }
        });
    });
}

// ============================================
// TEXTAREA EFFECTS
// ============================================
function initTextareaEffects() {
    if (!inputText) return;

    // Character counter
    inputText.addEventListener('input', () => {
        const count = inputText.value.length;
        if (charCount) {
            charCount.textContent = count;
            
            // Color change based on length
            if (count > 2000) {
                charCount.classList.add('warning');
            } else {
                charCount.classList.remove('warning');
            }
        }

        // Auto-resize textarea
        inputText.style.height = 'auto';
        inputText.style.height = inputText.scrollHeight + 'px';
    });

    // Focus effects
    inputText.addEventListener('focus', () => {
        inputText.parentElement.classList.add('focused');
    });

    inputText.addEventListener('blur', () => {
        inputText.parentElement.classList.remove('focused');
    });

    // Paste formatting
    inputText.addEventListener('paste', (e) => {
        // Show paste animation
        showToast('📋 Text pasted!', 'info');
    });
}

// ============================================
// BUTTON EFFECTS
// ============================================
function initButtonEffects() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(btn => {
        // Ripple effect
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });

        // Magnetic effect
        btn.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            this.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
        });

        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translate(0, 0)';
        });
    });
}

// ============================================
// TOOLTIPS
// ============================================
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(el => {
        el.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.classList.add('tooltip');
            tooltip.textContent = this.dataset.tooltip;
            
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
            tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
            
            setTimeout(() => tooltip.classList.add('visible'), 10);
            
            this._tooltip = tooltip;
        });

        el.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                this._tooltip.classList.remove('visible');
                setTimeout(() => this._tooltip.remove(), 200);
            }
        });
    });
}

// ============================================
// PARTICLES BACKGROUND
// ============================================
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random properties
        const size = Math.random() * 10 + 5;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${x}%;
            top: ${y}%;
            animation: particleFloat ${duration}s ease-in-out ${delay}s infinite;
            opacity: ${Math.random() * 0.5 + 0.1};
        `;
        
        particlesContainer.appendChild(particle);
    }
}

// ============================================
// FORM SUBMISSION & API CALL
// ============================================
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const text = inputText.value.trim();
        const tone = toneSelect.value;
        const type = outputType.value;

        // Validation
        if (!text) {
            shakeElement(inputText);
            showToast('Please enter some text to enhance!', 'error');
            return;
        }

        if (text.length < 20) {
            showToast('Please enter at least 20 characters for better results.', 'warning');
            return;
        }

        // Show loading
        showLoading();
        enhanceBtn.disabled = true;
        enhanceBtn.innerHTML = '<span class="spinner"></span> Enhancing...';

        try {
            const response = await fetch('/enhance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    tone: tone,
                    output_type: type
                })
            });

            const data = await response.json();

            if (data.success) {
                displayOutput(data.enhanced_text, data.suggestions);
                showToast('✨ Enhancement complete!', 'success');
                
                // Scroll to output
                setTimeout(() => {
                    outputSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 300);
            } else {
                showToast(data.error || 'Enhancement failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Connection error. Please check your internet.', 'error');
        } finally {
            hideLoading();
            enhanceBtn.disabled = false;
            enhanceBtn.innerHTML = '<span class="btn-icon">✨</span> Enhance My Resume';
        }
    });
}

// ============================================
// DISPLAY OUTPUT
// ============================================
function displayOutput(enhancedText, suggestions = []) {
    if (!outputSection || !outputContent) return;

    // Show output section with animation
    outputSection.style.display = 'block';
    outputSection.classList.add('fade-in-up');

    // Format the output
    let formattedHTML = '';
    
    if (Array.isArray(enhancedText)) {
        formattedHTML = '<ul class="bullet-list">';
        enhancedText.forEach((item, index) => {
            formattedHTML += `
                <li class="bullet-item" style="animation-delay: ${index * 0.1}s">
                    <span class="bullet-icon">✓</span>
                    <span class="bullet-text">${item}</span>
                </li>
            `;
        });
        formattedHTML += '</ul>';
    } else {
        // Parse text with bullet points
        const lines = enhancedText.split('\n').filter(line => line.trim());
        formattedHTML = '<ul class="bullet-list">';
        lines.forEach((line, index) => {
            const cleanLine = line.replace(/^[-•*]\s*/, '');
            formattedHTML += `
                <li class="bullet-item" style="animation-delay: ${index * 0.1}s">
                    <span class="bullet-icon">✓</span>
                    <span class="bullet-text">${cleanLine}</span>
                </li>
            `;
        });
        formattedHTML += '</ul>';
    }

    // Add suggestions if available
    if (suggestions && suggestions.length > 0) {
        formattedHTML += `
            <div class="suggestions-section">
                <h4>💡 Pro Tips</h4>
                <ul class="suggestions-list">
                    ${suggestions.map(s => `<li>${s}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    outputContent.innerHTML = formattedHTML;

    // Animate bullet items
    const bulletItems = outputContent.querySelectorAll('.bullet-item');
    bulletItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('animate-in');
        }, index * 100);
    });

    // Update stats
    updateStats();
}

// ============================================
// COPY FUNCTIONALITY
// ============================================
if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
        const text = getPlainTextFromOutput();
        
        try {
            await navigator.clipboard.writeText(text);
            
            // Success animation
            copyBtn.classList.add('copied');
            copyBtn.innerHTML = '<span class="btn-icon">✓</span> Copied!';
            
            showToast('📋 Copied to clipboard!', 'success');
            
            // Reset button
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtn.innerHTML = '<span class="btn-icon">📋</span> Copy';
            }, 2000);
        } catch (err) {
            showToast('Failed to copy. Please try again.', 'error');
        }
    });
}

// ============================================
// DOWNLOAD FUNCTIONALITY
// ============================================
if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        const text = getPlainTextFromOutput();
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'enhanced-resume.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('📥 Download started!', 'success');
        
        // Button animation
        downloadBtn.classList.add('downloading');
        setTimeout(() => {
            downloadBtn.classList.remove('downloading');
        }, 1000);
    });
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function getPlainTextFromOutput() {
    const bulletItems = outputContent.querySelectorAll('.bullet-text');
    const lines = Array.from(bulletItems).map(item => `• ${item.textContent}`);
    return lines.join('\n');
}

function showLoading() {
    if (loadingOverlay) {
        loadingOverlay.classList.add('active');
    }
    document.body.style.overflow = 'hidden';
}

function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.classList.remove('active');
    }
    document.body.style.overflow = '';
}

function shakeElement(element) {
    element.classList.add('shake');
    setTimeout(() => element.classList.remove('shake'), 500);
}

function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.classList.add('toast', `toast-${type}`);
    toast.innerHTML = `
        <span class="toast-icon">${getToastIcon(type)}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close">×</button>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto dismiss
    const dismissTime = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, dismissTime);

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    });
}

function getToastIcon(type) {
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    return icons[type] || icons.info;
}

function updateStats() {
    // Animate stats counter if visible
    document.querySelectorAll('.stat-number').forEach(stat => {
        if (stat.dataset.animated === 'false') {
            const target = parseInt(stat.dataset.target) || 0;
            animateCounter(stat, target);
            stat.dataset.animated = 'true';
        }
    });
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const duration = 2000;
    const stepTime = duration / 50;
    
    const counter = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString() + '+';
            clearInterval(counter);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, stepTime);
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (document.activeElement === inputText) {
            form.dispatchEvent(new Event('submit'));
        }
    }
    
    // Escape to close loading
    if (e.key === 'Escape') {
        hideLoading();
    }
});

// ============================================
// TONE SELECTOR ANIMATION
// ============================================
if (toneSelect) {
    toneSelect.addEventListener('change', function() {
        this.classList.add('changed');
        setTimeout(() => this.classList.remove('changed'), 300);
        
        // Show tone description
        const descriptions = {
            'professional': '👔 Formal and corporate-ready',
            'casual': '😊 Friendly and approachable',
            'ats-friendly': '🤖 Optimized for applicant tracking systems',
            'creative': '🎨 Unique and attention-grabbing',
            'executive': '👑 C-level and leadership focused'
        };
        
        const desc = descriptions[this.value];
        if (desc) {
            showToast(desc, 'info');
        }
    });
}

// ============================================
// EXAMPLE TEXT INSERTION
// ============================================
const exampleBtn = document.getElementById('example-btn');
if (exampleBtn) {
    exampleBtn.addEventListener('click', () => {
        const exampleText = `I am a software developer with 3 years experience. I know Python, JavaScript, and some machine learning. I worked at a startup where I built web applications. I'm good at solving problems and working with teams. I want to grow my career in tech.`;
        
        inputText.value = '';
        let index = 0;
        
        // Typing animation
        const typeInterval = setInterval(() => {
            if (index < exampleText.length) {
                inputText.value += exampleText.charAt(index);
                index++;
                inputText.dispatchEvent(new Event('input'));
            } else {
                clearInterval(typeInterval);
            }
        }, 20);
        
        showToast('📝 Example text loaded!', 'info');
    });
}

// ============================================
// THEME TOGGLE (BONUS)
// ============================================
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.innerHTML = isDark ? '☀️' : '🌙';
    });
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '☀️';
    }
}

// ============================================
// BEFORE/AFTER COMPARISON
// ============================================
function showComparison(original, enhanced) {
    const modal = document.createElement('div');
    modal.classList.add('comparison-modal');
    modal.innerHTML = `
        <div class="comparison-content">
            <button class="modal-close">×</button>
            <h3>Before & After</h3>
            <div class="comparison-grid">
                <div class="comparison-side original">
                    <h4>📝 Original</h4>
                    <div class="comparison-text">${original}</div>
                </div>
                <div class="comparison-arrow">→</div>
                <div class="comparison-side enhanced">
                    <h4>✨ Enhanced</h4>
                    <div class="comparison-text">${enhanced}</div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
    
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    });
}

// ============================================
// PROGRESSIVE ENHANCEMENT
// ============================================
function enhanceProgressively(text, stages = 3) {
    return new Promise((resolve) => {
        let currentStage = 0;
        const results = [];
        
        // Simulate progressive enhancement
        const interval = setInterval(() => {
            currentStage++;
            updateProgressUI(currentStage, stages);
            
            if (currentStage >= stages) {
                clearInterval(interval);
                resolve(results);
            }
        }, 1000);
    });
}

function updateProgressUI(current, total) {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        const percent = (current / total) * 100;
        progressBar.style.width = `${percent}%`;
        
        const stages = ['Analyzing...', 'Enhancing...', 'Polishing...'];
        const stageText = document.querySelector('.progress-stage');
        if (stageText) {
            stageText.textContent = stages[current - 1] || 'Processing...';
        }
    }
}

// ============================================
// ACCESSIBILITY ENHANCEMENTS
// ============================================
// Focus trap for modals
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        }
    });
}

// Announce to screen readers
function announce(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'alert');
    announcement.setAttribute('aria-live', 'polite');
    announcement.classList.add('sr-only');
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
}

// ============================================
// LOCAL STORAGE FOR DRAFTS
// ============================================
// Auto-save draft
let saveTimeout;
if (inputText) {
    inputText.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            localStorage.setItem('resumeDraft', inputText.value);
        }, 1000);
    });

    // Load draft on page load
    const savedDraft = localStorage.getItem('resumeDraft');
    if (savedDraft && inputText.value === '') {
        inputText.value = savedDraft;
        inputText.dispatchEvent(new Event('input'));
        showToast('📄 Previous draft restored!', 'info');
    }
}

// Clear draft
const clearBtn = document.getElementById('clear-btn');
if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        inputText.value = '';
        localStorage.removeItem('resumeDraft');
        inputText.dispatchEvent(new Event('input'));
        showToast('🗑️ Cleared!', 'info');
        
        // Animation
        clearBtn.classList.add('cleared');
        setTimeout(() => clearBtn.classList.remove('cleared'), 500);
    });
}

// ============================================
// EXPORT TO DIFFERENT FORMATS
// ============================================
function exportToFormat(format) {
    const text = getPlainTextFromOutput();
    
    switch(format) {
        case 'pdf':
            exportToPDF(text);
            break;
        case 'docx':
            exportToDocx(text);
            break;
        case 'txt':
            exportToTxt(text);
            break;
        case 'markdown':
            exportToMarkdown(text);
            break;
    }
}

function exportToTxt(text) {
    const blob = new Blob([text], { type: 'text/plain' });
    downloadBlob(blob, 'enhanced-resume.txt');
}

function exportToMarkdown(text) {
    const lines = text.split('\n');
    const markdown = lines.map(line => {
        if (line.startsWith('•')) {
            return line.replace('•', '-');
        }
        return line;
    }).join('\n');
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    downloadBlob(blob, 'enhanced-resume.md');
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

console.log('🚀 AI Resume Enhancer loaded successfully!');