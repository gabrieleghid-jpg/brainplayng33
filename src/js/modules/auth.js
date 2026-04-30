// Authentication Module
class AuthModule {
    static checkAuthentication() {
        const isAuthenticated = sessionStorage.getItem('authenticated') === 'true' || 
                              localStorage.getItem('bp_authenticated') === 'true';
        
        if (!isAuthenticated) {
            window.location.href = 'index.html';
            return false;
        }
        
        return true;
    }

    static logout() {
        // Pulisci sessionStorage e localStorage
        sessionStorage.clear();
        localStorage.removeItem('bp_authenticated');
        localStorage.removeItem('bp_role');
        localStorage.removeItem('bp_username');
        localStorage.removeItem('bp_email');
        localStorage.removeItem('bp_profileImage');
        
        // Mostra notifica e reindirizza
        if (window.showToast) {
            window.showToast('Logout effettuato! Arrivederci.');
        }
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    static getUserData() {
        return {
            username: sessionStorage.getItem('username') || localStorage.getItem('bp_username') || 'BrainPlayer',
            email: sessionStorage.getItem('email') || localStorage.getItem('bp_email') || '',
            role: sessionStorage.getItem('role') || localStorage.getItem('bp_role') || 'user',
            profileImage: sessionStorage.getItem('profileImage') || localStorage.getItem('bp_profileImage') || ''
        };
    }
}

// Export for global use
window.AuthModule = AuthModule;
window.checkAuthentication = AuthModule.checkAuthentication.bind(AuthModule);
window.getUserData = AuthModule.getUserData.bind(AuthModule);
window.logout = AuthModule.logout.bind(AuthModule);
