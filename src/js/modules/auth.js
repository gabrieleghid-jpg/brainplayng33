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

    static forceCleanAuth() {
        // Pulizia completa di tutti i dati di autenticazione
        sessionStorage.clear();
        localStorage.removeItem('bp_authenticated');
        localStorage.removeItem('bp_role');
        localStorage.removeItem('bp_username');
        localStorage.removeItem('bp_email');
        localStorage.removeItem('bp_profileImage');
        
        console.log('AuthModule: Dati puliti completamente');
        
        // Forza reload della pagina
        window.location.reload();
    }

    static getUserData() {
        // Debug completo di tutti i dati
        console.log('=== AUTH DEBUG COMPLETO ===');
        console.log('SessionStorage:', {
            authenticated: sessionStorage.getItem('authenticated'),
            username: sessionStorage.getItem('username'),
            email: sessionStorage.getItem('email'),
            role: sessionStorage.getItem('role')
        });
        console.log('LocalStorage:', {
            bp_authenticated: localStorage.getItem('bp_authenticated'),
            bp_username: localStorage.getItem('bp_username'),
            bp_email: localStorage.getItem('bp_email'),
            bp_role: localStorage.getItem('bp_role')
        });
        
        const isAuthenticated = sessionStorage.getItem('authenticated') === 'true' || 
                              localStorage.getItem('bp_authenticated') === 'true';
        
        // Per gli ospiti, controlla solo sessionStorage (non localStorage)
        const role = sessionStorage.getItem('role') || 
                     (localStorage.getItem('bp_role') === 'guest' ? null : localStorage.getItem('bp_role')) || 
                     'user';
        
        console.log('Valori calcolati:', { isAuthenticated, role });
        
        // Se è un guest, usa "Sir Foxy" e solo dati temporanei
        if (role === 'guest') {
            console.log('UTENTE RILEVATO COME GUEST - Sir Foxy (session only)');
            return {
                username: 'Sir Foxy',
                email: '',
                role: 'guest',
                profileImage: ''
            };
        }
        
        // Se è un utente registrato, usa i dati reali da localStorage per persistenza
        const username = sessionStorage.getItem('username') || localStorage.getItem('bp_username');
        
        console.log('UTENTE REGISTRATO - Username:', username);
        
        return {
            username: username,
            email: sessionStorage.getItem('email') || localStorage.getItem('bp_email') || '',
            role: role,
            profileImage: sessionStorage.getItem('profileImage') || localStorage.getItem('bp_profileImage') || ''
        };
    }
}

// Export for global use
window.AuthModule = AuthModule;
window.checkAuthentication = AuthModule.checkAuthentication.bind(AuthModule);
window.getUserData = AuthModule.getUserData.bind(AuthModule);
window.logout = AuthModule.logout.bind(AuthModule);
window.forceCleanAuth = AuthModule.forceCleanAuth.bind(AuthModule);
