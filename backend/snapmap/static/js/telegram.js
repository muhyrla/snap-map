// Telegram WebApp API integration
class TelegramWebApp {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.init();
    }

    init() {
        if (this.tg) {
            // Configure the app
            this.tg.ready();
            this.tg.expand();
            
            // Set theme
            this.tg.setHeaderColor('#ffffff');
            this.tg.setBackgroundColor('#ffffff');
            
            // Disable closing confirmation
            this.tg.enableClosingConfirmation();
            
            // Set main button
            this.setupMainButton();
            
            // Handle back button
            this.tg.BackButton.onClick(() => {
                this.tg.close();
            });
        }
    }

    setupMainButton() {
        if (this.tg) {
            this.tg.MainButton.setText('SNAP!');
            this.tg.MainButton.color = '#FFE4E1';
            this.tg.MainButton.textColor = '#000000';
            this.tg.MainButton.show();
        }
    }

    // Get user data from Telegram
    getUserData() {
        if (this.tg) {
            return this.tg.initDataUnsafe?.user || null;
        }
        return null;
    }

    // Send data to bot
    sendData(data) {
        if (this.tg) {
            this.tg.sendData(JSON.stringify(data));
        }
    }

    // Show alert
    showAlert(message) {
        if (this.tg) {
            this.tg.showAlert(message);
        } else {
            alert(message);
        }
    }

    // Show confirm
    showConfirm(message, callback) {
        if (this.tg) {
            this.tg.showConfirm(message, callback);
        } else {
            const result = confirm(message);
            callback(result);
        }
    }

    // Close app
    close() {
        if (this.tg) {
            this.tg.close();
        }
    }

    // Haptic feedback
    hapticFeedback(type = 'light') {
        if (this.tg?.HapticFeedback) {
            this.tg.HapticFeedback.impactOccurred(type);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.telegramWebApp = new TelegramWebApp();
    
    // Add click handlers for navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            window.telegramWebApp.hapticFeedback('light');
            
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Handle navigation
            const text = this.querySelector('span').textContent.toLowerCase();
            handleNavigation(text);
        });
    });
    
    // Add click handler for settings
    const settingsIcon = document.querySelector('.settings-icon');
    if (settingsIcon) {
        settingsIcon.addEventListener('click', function() {
            window.telegramWebApp.hapticFeedback('medium');
            window.telegramWebApp.showAlert('Настройки пока не доступны');
        });
    }
    
    // Add click handler for main button
    if (window.telegramWebApp.tg) {
        window.telegramWebApp.tg.MainButton.onClick(() => {
            window.telegramWebApp.hapticFeedback('heavy');
            handleSnapAction();
        });
    }
});

// Navigation handler
function handleNavigation(section) {
    switch(section) {
        case 'home':
            // Already on home page
            break;
        case 'leaderboard':
            window.telegramWebApp.showAlert('Таблица лидеров пока не доступна');
            break;
        case 'snap!':
            handleSnapAction();
            break;
        case 'quests':
            window.telegramWebApp.showAlert('Квесты пока не доступны');
            break;
        case 'market':
            window.telegramWebApp.showAlert('Магазин пока не доступен');
            break;
    }
}

// Handle SNAP action
function handleSnapAction() {
    window.telegramWebApp.showConfirm(
        'Хотите сделать снимок?',
        function(confirmed) {
            if (confirmed) {
                // Here you would integrate with camera API
                window.telegramWebApp.showAlert('Функция камеры будет добавлена позже');
            }
        }
    );
}

// Load user data from Telegram
function loadUserData() {
    const userData = window.telegramWebApp.getUserData();
    if (userData) {
        // Update username
        const usernameElements = document.querySelectorAll('.username');
        usernameElements.forEach(el => {
            el.textContent = userData.first_name || 'USERNAME';
        });
        
        // You can also load user's balance, stats, etc. from your backend
        loadUserStats(userData.id);
    }
}

// Load user statistics from backend
function loadUserStats(userId) {
    // This would make an API call to your Django backend
    // For now, we'll use mock data
    console.log('Loading stats for user:', userId);
}

// Initialize user data when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(loadUserData, 100);
});
