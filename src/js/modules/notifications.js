// Notifications Module
class NotificationsModule {
    static showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Animazione ingresso
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease';
        }, 10);

        // Rimozione automatica
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    static showToast(message, type = 'info') {
        // Alias per compatibilità
        this.showNotification(message, type);
    }

    static showError(message) {
        this.showNotification(message, 'error');
    }

    static showSuccess(message) {
        this.showNotification(message, 'success');
    }

    static showInfo(message) {
        this.showNotification(message, 'info');
    }
}

// Export for global use
window.NotificationsModule = NotificationsModule;
window.showToast = NotificationsModule.showToast.bind(NotificationsModule);
