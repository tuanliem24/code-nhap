// ===============================
// CONFIGURATION & CONSTANTS
// ===============================
const CONFIG = {
    game: {
        balloonCount: 5,
        scorePerPop: 10,
        balloonCreateDelay: 500
    },
    effects: {
        confettiInterval: 300,
        balloonInterval: 2000,
        confettiLifetime: 5000,
        balloonLifetime: 10000
    },
    animations: {
        modalFadeDelay: 500,
        staggerDelay: 200,
        rippleDelay: 600
    },
    validation: {
        minNameLength: 1,
        maxNameLength: 50,
        strictNameCheck: true // Bật kiểm tra tên nghiêm ngặt
    }
};

const ALLOWED_NAMES = [
    // Tên gốc (đã có)
    'An', 'Anh', 'Bảo', 'Bình', 'Chi', 'Duy', 'Đức', 'Giang', 'Hà', 'Hải',
    'Hạnh', 'Hiếu', 'Hòa', 'Hùng', 'Hương', 'Khang', 'Khánh', 'Khôi', 'Lan', 'Linh',
    'Long', 'Mai', 'Minh', 'Nam', 'Nga', 'Ngọc', 'Nhung', 'Phong', 'Phúc', 'Quang',
    'Quốc', 'Sơn', 'Tâm', 'Thảo', 'Huy', 'Thu', 'Thúy', 'Trang', 'Trung', 'Tú',
    'Tuấn', 'Tùng', 'Văn', 'Liêm', 'Vũ', 'Yến',

    // Bổ sung thêm
    'Ánh', 'Bích', 'Cường', 'Diễm', 'Diệp', 'Đan', 'Đạt', 'Dũng', 'Dương',
    'Gia', 'Hạo', 'Hiền', 'Hoài', 'Hoàng', 'Huy', 'Hữu', 'Kim', 'Lâm', 'Lê',
    'Loan', 'Lộc', 'Ly', 'Mẫn', 'Mỹ', 'Nhân', 'Nhi', 'Nhã', 'Phi', 'Phú',
    'Quỳnh', 'Tài', 'Thái', 'Thịnh', 'Thiện', 'Tiến', 'Tiểu', 'Trà', 'Trí', 'Trinh',
    'Trọng', 'Uyên', 'Vi', 'Việt', 'Xuân', 'Quí', 'Tín', 'Đình', 'Kiên', 'Cẩm',

    // Thêm nhiều hơn nữa
    'Lan Anh', 'Bảo Ngọc', 'Minh Anh', 'Hà My', 'Gia Hân', 'Khánh Linh', 'Thiên An',
    'Trúc', 'Bằng', 'Châu', 'Thùy', 'Tường', 'Khả', 'Thục', 'Lương', 'Tấn',
    'Nguyên', 'Hồng', 'Tường Vy', 'Thanh', 'Hoan', 'Thắm', 'Thịnh', 'Thi',
    'Phương', 'Kiều', 'Nam Anh', 'Đông', 'Tố', 'Nguyệt', 'Bình Minh', 'Thái Sơn',
    'Bảo Trân', 'Anh Thư', 'Ngọc Trinh', 'Ngọc Hân', 'Như', 'Thanh Tâm', 'Tú Uyên',
    'Hoàng Yến', 'Trung Kiên', 'Tuệ', 'Bảo Long', 'Thiên', 'Thuận', 'Phương Anh'
];


const GAME_BALLOONS = ['🎈', '🎀', '⭐', '🌟', '💫'];
const GAME_COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'pink'];
const FLOATING_BALLOONS = ['🎈', '🎀', '⭐', '🌟', '💫', '🎊', '🎉'];
const CONFETTI_COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98fb98', '#f0e68c'];

// ===============================
// GAME STATE & UTILITY FUNCTIONS
// ===============================
// Game score
let score = 0;

// Utility function to safely remove elements
function safeRemoveElement(element) {
    try {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    } catch (error) {
        console.warn('Error removing element:', error);
    }
}

// Utility function to create element with attributes
function createElement(tag, attributes = {}, textContent = '') {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else {
            element.setAttribute(key, value);
        }
    });
    if (textContent) element.textContent = textContent;
    return element;
}

// Cleanup function for page unload
function cleanup() {
    if (window.confettiInterval) clearInterval(window.confettiInterval);
    if (window.balloonInterval) clearInterval(window.balloonInterval);
}

// Add cleanup on page unload
window.addEventListener('beforeunload', cleanup);

// ===============================
// ANTI-REFRESH/RELOAD PROTECTION
// ===============================
// Prevent page refresh/reload until user enters correct name
let hasEnteredCorrectName = false;

// Block all refresh/close attempts with maximum protection
window.addEventListener('beforeunload', function(e) {
    if (!hasEnteredCorrectName) {
        // Save state to localStorage
        localStorage.setItem('childrenDay_mustEnterName', 'true');
        localStorage.setItem('childrenDay_timestamp', Date.now().toString());

        // Show maximum warning
        const message = '🚫 KHÔNG THỂ THOÁT! Bạn phải nhập đúng tên mới có thể rời khỏi trang này! 🔒\n\nNếu bạn đóng tab này, trang sẽ tự động mở lại và bạn vẫn phải nhập tên!';

        e.preventDefault();
        e.returnValue = message;

        // Try to prevent close with additional dialogs
        setTimeout(() => {
            if (!hasEnteredCorrectName) {
                alert('⚠️ CẢNH BÁO: Bạn không thể thoát cho đến khi nhập đúng tên!');
            }
        }, 100);

        return message;
    }
});

// Enhanced visibility change detection
document.addEventListener('visibilitychange', function() {
    if (!hasEnteredCorrectName && document.hidden) {
        // Page is hidden (tab switched or minimized)
        localStorage.setItem('childrenDay_mustEnterName', 'true');
        localStorage.setItem('childrenDay_timestamp', Date.now().toString());

        // Try to bring page back to focus when possible
        setTimeout(() => {
            if (!hasEnteredCorrectName && !document.hidden) {
                window.focus();
                if (nameInput) nameInput.focus();
                showRefreshBlockedMessage();
            }
        }, 1000);
    }
});

// Block keyboard shortcuts for refresh
document.addEventListener('keydown', function(e) {
    if (!hasEnteredCorrectName) {
        // Block F5
        if (e.key === 'F5') {
            e.preventDefault();
            showRefreshBlockedMessage();
            return false;
        }

        // Block Ctrl+R (Windows/Linux) or Cmd+R (Mac)
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            showRefreshBlockedMessage();
            return false;
        }

        // Block Ctrl+F5 (Hard refresh)
        if (e.ctrlKey && e.key === 'F5') {
            e.preventDefault();
            showRefreshBlockedMessage();
            return false;
        }

        // Block Ctrl+Shift+R (Hard refresh)
        if (e.ctrlKey && e.shiftKey && e.key === 'R') {
            e.preventDefault();
            showRefreshBlockedMessage();
            return false;
        }

        // Block browser navigation keys
        if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
            e.preventDefault();
            showRefreshBlockedMessage();
            return false;
        }
    }
});

// Show message when refresh is blocked
function showRefreshBlockedMessage() {
    // Create temporary warning message
    const warningDiv = document.createElement('div');
    warningDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        font-weight: bold;
        font-size: 1.1rem;
        z-index: 9999;
        box-shadow: 0 10px 30px rgba(231, 76, 60, 0.4);
        animation: shake 0.5s ease-in-out;
        border: 2px solid #fff;
    `;
    warningDiv.innerHTML = '🚫 Không thể refresh! Hãy nhập đúng tên để tiếp tục! 🔒';

    document.body.appendChild(warningDiv);

    // Remove warning after 3 seconds
    setTimeout(() => {
        if (warningDiv.parentNode) {
            warningDiv.remove();
        }
    }, 3000);

    // Focus back to name input
    if (nameInput) {
        nameInput.focus();
    }
}

// DOM elements
let nameModal;
let mainContent;
let nameInput;
let submitBtn;
let errorMsg;
let welcomeMsg;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    createNameModal();
    hideMainContent();
    startBackgroundEffects();
    initializeAntiBypassProtection();
});

// ===============================
// ADDITIONAL ANTI-BYPASS PROTECTION
// ===============================
function initializeAntiBypassProtection() {
    // Disable right-click context menu
    document.addEventListener('contextmenu', function(e) {
        if (!hasEnteredCorrectName) {
            e.preventDefault();
            showRefreshBlockedMessage();
        }
    });

    // Block developer tools shortcuts
    document.addEventListener('keydown', function(e) {
        if (!hasEnteredCorrectName) {
            // Block F12 (Developer Tools)
            if (e.key === 'F12') {
                e.preventDefault();
                showRefreshBlockedMessage();
                return false;
            }

            // Block Ctrl+Shift+I (Developer Tools)
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                showRefreshBlockedMessage();
                return false;
            }

            // Block Ctrl+Shift+J (Console)
            if (e.ctrlKey && e.shiftKey && e.key === 'J') {
                e.preventDefault();
                showRefreshBlockedMessage();
                return false;
            }

            // Block Ctrl+U (View Source)
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                showRefreshBlockedMessage();
                return false;
            }
        }
    });

    // Monitor if user tries to manipulate the modal
    const observer = new MutationObserver(function(mutations) {
        if (!hasEnteredCorrectName && nameModal) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    // If someone tries to remove the modal, recreate it
                    if (!document.contains(nameModal)) {
                        setTimeout(() => {
                            if (!hasEnteredCorrectName) {
                                createNameModal();
                                showRefreshBlockedMessage();
                            }
                        }, 100);
                    }
                }
            });
        }
    });

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Create name input modal
function createNameModal() {
    nameModal = document.createElement('div');
    nameModal.className = 'name-modal';
    nameModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>🎈 Chào Mừng Đến Với Ngày 1/6! 🎈</h2>
                <p>Hãy cho chúng tôi biết tên của bạn nhé!</p>
            </div>
            <div class="modal-body">
                <input type="text" id="nameInput" placeholder="Nhập tên của bạn..." autocomplete="off">
                <div class="button-group">
                    <button id="submitBtn">Vào Trang Chúc Mừng! 🎉</button>
                </div>
                <p id="errorMsg" class="error-message"></p>
                <div class="valid-names-hint">
                    <p>🔒 <strong>Chỉ những tên trong danh sách mới được vào!</strong></p>
                    <p class="hint-text">Hãy nhập đúng tên của bạn trong danh sách được mời.</p>
                </div>
                <div class="security-warning">
                    <p style="color: #e74c3c; font-weight: bold; font-size: 0.9rem; margin-top: 1rem; background: rgba(231, 76, 60, 0.1); padding: 0.8rem; border-radius: 8px; border-left: 4px solid #e74c3c;">
                        ⚠️ <strong>CẢNH BÁO:</strong> Không thể refresh, F5, hoặc thoát trang cho đến khi nhập đúng tên! 🚫
                    </p>
                </div>
            </div>
            <div class="floating-elements">
                <span class="float-emoji">🎈</span>
                <span class="float-emoji">🌟</span>
                <span class="float-emoji">🎨</span>
                <span class="float-emoji">🎭</span>
                <span class="float-emoji">🎪</span>
            </div>
        </div>
    `;

    document.body.appendChild(nameModal);

    // Get elements
    nameInput = document.getElementById('nameInput');
    submitBtn = document.getElementById('submitBtn');
    errorMsg = document.getElementById('errorMsg');

    // Add event listeners
    submitBtn.addEventListener('click', validateAndEnter);

    nameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            validateAndEnter();
        }
    });

    nameInput.addEventListener('input', function() {
        errorMsg.textContent = '';
        errorMsg.style.display = 'none';
    });

    // Focus on input
    setTimeout(() => nameInput.focus(), 500);
}

// Hide main content initially
function hideMainContent() {
    const body = document.body;
    const mainElements = body.querySelectorAll('header, section, footer');
    mainElements.forEach(element => {
        element.style.display = 'none';
    });
}

// Show personal letter
function showPersonalLetter(userName) {
    // Remove name modal
    nameModal.style.opacity = '0';
    setTimeout(() => {
        nameModal.remove();

        // Create letter modal
        const letterModal = document.createElement('div');
        letterModal.className = 'letter-modal';
        letterModal.innerHTML = `
            <div class="letter-content">
                <div class="letter-envelope" id="letterEnvelope">
                    <div class="envelope-front">
                        <div class="envelope-seal">💌</div>
                        <div class="envelope-text">
                            <p>Thư gửi ${userName}</p>
                            <p class="envelope-subtitle">Nhấn để mở 💝</p>
                        </div>
                    </div>
                </div>

                <div class="letter-paper" id="letterPaper" style="display: none;">
                    <div class="letter-header">
                        <h2>💌 Thư Chúc Mừng Ngày 1/6 💌</h2>
                        <p class="letter-date">Ngày ${new Date().toLocaleDateString('vi-VN')}</p>
                    </div>

                    <div class="letter-body">
                        <p class="greeting">Gửi ${userName} thân yêu,</p>

                        <p>Hôm nay là ngày Quốc tế Thiếu nhi 1/6 - một ngày đặc biệt dành riêng cho Bạn nhỏ!</p>

                        <p>Chúng tôi muốn gửi đến ${userName} những lời chúc tốt đẹp nhất:</p>

                        <ul class="wishes-list">
                            <li>🌟 Chúc ${userName} luôn vui vẻ và hạnh phúc</li>
                            <li>🎨 Mong ${userName} luôn sáng tạo và thông minh</li>
                            <li>🌈 Hy vọng ${userName} luôn khỏe mạnh và yêu đời</li>
                            <li>🎪 Chúc ${userName} có thật nhiều kỷ niệm đẹp</li>
                            <li>💫 Mong ${userName} luôn tỏa sáng như ngôi sao</li>
                        </ul>

                        <p>Hãy tận hưởng ngày đặc biệt này và đừng quên chơi những trò chơi vui vẻ!</p>

                        <div class="letter-signature">
                            <p>Với tình yêu thương,</p>
                            <p class="signature">💖 Website Chúc Mừng Ngày 1/6 💖</p>
                        </div>
                    </div>

                    <div class="letter-footer">
                        <button class="enter-btn" id="enterMainPage">
                            Vào Trang Chúc Mừng! 🎉
                        </button>
                    </div>
                </div>

                <div class="letter-decorations">
                    <span class="deco-emoji">🎈</span>
                    <span class="deco-emoji">🌟</span>
                    <span class="deco-emoji">🎊</span>
                    <span class="deco-emoji">💝</span>
                    <span class="deco-emoji">🎉</span>
                </div>
            </div>
        `;

        document.body.appendChild(letterModal);

        // Add envelope click event
        const envelope = document.getElementById('letterEnvelope');
        const paper = document.getElementById('letterPaper');

        envelope.addEventListener('click', function() {
            envelope.style.transform = 'scale(0.8)';
            envelope.style.opacity = '0';

            setTimeout(() => {
                envelope.style.display = 'none';
                paper.style.display = 'block';
                paper.style.animation = 'letterUnfold 1s ease-out';
            }, 500);
        });

        // Add enter button event
        document.getElementById('enterMainPage').addEventListener('click', function() {
            letterModal.style.opacity = '0';
            setTimeout(() => {
                letterModal.remove();
                showMainContent(userName);
            }, 500);
        });

    }, 500);
}

// Show main content
function showMainContent(userName) {
    const body = document.body;
    const mainElements = body.querySelectorAll('header, section, footer');

    // Remove modal
    nameModal.style.opacity = '0';
    setTimeout(() => {
        nameModal.remove();

        // Show main content with animation
        mainElements.forEach((element, index) => {
            element.style.display = 'block';
            element.style.opacity = '0';
            element.style.transform = 'translateY(50px)';

            setTimeout(() => {
                element.style.transition = 'all 0.6s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 200);
        });

        // Update welcome message
        updateWelcomeMessage(userName);

        // Start main page animations
        startMainAnimations();

    }, 500);
}

// Validate name and enter - with strict name checking
function validateAndEnter() {
    const name = nameInput.value.trim();

    // Enhanced validation with better error messages
    if (name === '') {
        showError('Bạn chưa nhập tên! Hãy nhập tên để tiếp tục nhé! 😊');
        return;
    }

    if (name.length < CONFIG.validation.minNameLength) {
        showError('Hãy nhập ít nhất 1 ký tự! 📝');
        return;
    }

    if (name.length > CONFIG.validation.maxNameLength) {
        showError('Tên quá dài! Hãy nhập tên ngắn hơn nhé! 😅');
        return;
    }

    // Strict name checking - only allowed names can enter
    if (CONFIG.validation.strictNameCheck) {
        const normalizedInput = normalizeVietnameseName(name);
        const isAllowed = ALLOWED_NAMES.some(allowedName =>
            normalizeVietnameseName(allowedName) === normalizedInput
        );

        if (!isAllowed) {
            showError(`Xin lỗi! Tên "${name}" không có trong danh sách được mời. 🚫`);
            return;
        }
    }

    // All validations passed - mark as entered correct name
    hasEnteredCorrectName = true;

    // Show letter first!
    showPersonalLetter(name);
}

// Normalize Vietnamese name for comparison (remove accents, lowercase)
function normalizeVietnameseName(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/đ/g, 'd')
        .replace(/\s+/g, ' ')
        .trim();
}

// Show error message
function showError(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
    errorMsg.style.animation = 'shake 0.5s ease-in-out';

    // Remove animation class after animation completes
    setTimeout(() => {
        errorMsg.style.animation = '';
    }, 500);
}

// Update welcome message with user's name
function updateWelcomeMessage(userName) {
    const heroTitle = document.querySelector('.hero-title');
    const mainTitle = document.querySelector('.main-title');

    if (heroTitle) {
        heroTitle.innerHTML = `Chúc Mừng ${userName}! 🌟`;
    }

    if (mainTitle) {
        mainTitle.innerHTML = `🎈 CHÚC MỪNG ${userName.toUpperCase()} - NGÀY 1/6 🎈`;
    }

    // Add personalized message
    const heroMessage = document.querySelector('.hero-message');
    if (heroMessage) {
        const personalMessage = document.createElement('p');
        personalMessage.className = 'message-line personal-message';
        personalMessage.innerHTML = `🎁 Chúc ${userName} luôn vui vẻ và hạnh phúc! 🎁`;
        heroMessage.insertBefore(personalMessage, heroMessage.firstChild);
    }
}

// Start background effects
function startBackgroundEffects() {
    createConfetti();
    createFloatingBalloons();
}

// Create confetti effect
function createConfetti() {
    const confettiContainer = document.getElementById('confetti');
    if (!confettiContainer) return;

    const confettiInterval = setInterval(() => {
        const confetti = createElement('div', {
            class: 'confetti',
            style: {
                left: Math.random() * 100 + '%',
                backgroundColor: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
                animationDuration: (Math.random() * 3 + 2) + 's',
                animationDelay: Math.random() * 2 + 's'
            }
        });

        confettiContainer.appendChild(confetti);

        // Remove confetti after animation with error handling
        setTimeout(() => safeRemoveElement(confetti), CONFIG.effects.confettiLifetime);
    }, CONFIG.effects.confettiInterval);

    // Store interval ID for cleanup if needed
    window.confettiInterval = confettiInterval;
}

// Create floating balloons
function createFloatingBalloons() {
    const balloonsContainer = document.getElementById('balloons');
    if (!balloonsContainer) return;

    const balloonInterval = setInterval(() => {
        const balloon = createElement('div', {
            class: 'floating-balloon',
            style: {
                left: Math.random() * 100 + '%',
                animationDuration: (Math.random() * 4 + 6) + 's',
                animationDelay: Math.random() * 3 + 's'
            }
        }, FLOATING_BALLOONS[Math.floor(Math.random() * FLOATING_BALLOONS.length)]);

        balloonsContainer.appendChild(balloon);

        // Remove balloon after animation with error handling
        setTimeout(() => safeRemoveElement(balloon), CONFIG.effects.balloonLifetime);
    }, CONFIG.effects.balloonInterval);

    // Store interval ID for cleanup if needed
    window.balloonInterval = balloonInterval;
}

// Start main page animations
function startMainAnimations() {
    // Initialize balloon pop game
    initializeBalloonGame();

    // Add click effects to activity cards
    addCardClickEffects();

    // Add image hover effects
    addImageHoverEffects();
}

// Initialize balloon pop game
function initializeBalloonGame() {
    const gameBalloonsContainer = document.getElementById('gameBalloons');
    const scoreElement = document.getElementById('score');

    function createGameBalloon() {
        const balloon = document.createElement('div');
        balloon.className = 'game-balloon';
        balloon.textContent = GAME_BALLOONS[Math.floor(Math.random() * GAME_BALLOONS.length)];
        balloon.style.color = GAME_COLORS[Math.floor(Math.random() * GAME_COLORS.length)];
        balloon.style.animationDelay = Math.random() * 2 + 's';

        // Enhanced click handler with better effects
        balloon.addEventListener('click', function(event) {
            // Prevent multiple clicks
            if (balloon.dataset.clicked) return;
            balloon.dataset.clicked = 'true';

            // Pop effect with smoother animation
            balloon.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            balloon.style.transform = 'scale(0)';
            balloon.style.opacity = '0';

            // Update score
            score += CONFIG.game.scorePerPop;
            scoreElement.textContent = score;

            // Create pop effect with click position
            createPopEffect(event);

            // Remove balloon and create new one
            setTimeout(() => {
                try {
                    if (balloon.parentNode) {
                        balloon.parentNode.removeChild(balloon);
                    }
                    createGameBalloon();
                } catch (error) {
                    console.warn('Error in balloon click handler:', error);
                }
            }, 300);
        });

        gameBalloonsContainer.appendChild(balloon);
    }

    // Create initial balloons with staggered timing
    for (let i = 0; i < CONFIG.game.balloonCount; i++) {
        setTimeout(() => createGameBalloon(), i * CONFIG.game.balloonCreateDelay);
    }
}

// Create pop effect with enhanced visuals
function createPopEffect(event) {
    const pop = document.createElement('div');
    pop.textContent = `+${CONFIG.game.scorePerPop}`;
    pop.style.position = 'fixed';
    pop.style.left = event.clientX + 'px';
    pop.style.top = event.clientY + 'px';
    pop.style.color = '#ff6b9d';
    pop.style.fontWeight = 'bold';
    pop.style.fontSize = '1.5rem';
    pop.style.pointerEvents = 'none';
    pop.style.zIndex = '1000';
    pop.style.animation = 'popUp 1s ease-out forwards';
    pop.style.textShadow = '2px 2px 4px rgba(0,0,0,0.3)';

    document.body.appendChild(pop);

    // Create additional sparkle effects
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.textContent = '✨';
            sparkle.style.position = 'fixed';
            sparkle.style.left = (event.clientX + (Math.random() - 0.5) * 50) + 'px';
            sparkle.style.top = (event.clientY + (Math.random() - 0.5) * 50) + 'px';
            sparkle.style.fontSize = '1rem';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.animation = 'sparkle 1s ease-out forwards';
            sparkle.style.zIndex = '999';

            document.body.appendChild(sparkle);

            setTimeout(() => {
                try {
                    if (sparkle.parentNode) {
                        sparkle.parentNode.removeChild(sparkle);
                    }
                } catch (error) {
                    console.warn('Error removing sparkle:', error);
                }
            }, 1000);
        }, i * 100);
    }

    setTimeout(() => {
        try {
            if (pop.parentNode) {
                pop.parentNode.removeChild(pop);
            }
        } catch (error) {
            console.warn('Error removing pop effect:', error);
        }
    }, 1000);
}

// Add click effects to activity cards
function addCardClickEffects() {
    const activityCards = document.querySelectorAll('.activity-card');

    activityCards.forEach(card => {
        card.addEventListener('click', function() {
            // Create ripple effect
            const ripple = document.createElement('div');
            ripple.className = 'ripple';

            const rect = card.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';

            card.appendChild(ripple);

            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        });
    });
}

// Add image hover effects
function addImageHoverEffects() {
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            createSparkles(item);
        });
    });
}

// Create sparkle effect
function createSparkles(element) {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.textContent = '✨';
            sparkle.style.position = 'absolute';
            sparkle.style.left = Math.random() * element.offsetWidth + 'px';
            sparkle.style.top = Math.random() * element.offsetHeight + 'px';
            sparkle.style.fontSize = '1rem';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.animation = 'sparkle 1s ease-out forwards';
            sparkle.style.zIndex = '100';

            element.style.position = 'relative';
            element.appendChild(sparkle);

            setTimeout(() => {
                if (sparkle.parentNode) {
                    sparkle.parentNode.removeChild(sparkle);
                }
            }, 1000);
        }, i * 100);
    }
}
