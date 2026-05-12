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
        
        // Se è un guest, usa "Sir Foxy"
        if (role === 'guest') {
            console.log('UTENTE RILEVATO COME GUEST - Sir Foxy');
            return {
                username: 'Sir Foxy',
                email: '',
                role: 'guest',
                profileImage: ''
            };
        }
        
        // Se è un utente registrato, usa i dati reali da localStorage per persistenza
        const email = sessionStorage.getItem('email') || localStorage.getItem('bp_email') || '';
        let username = sessionStorage.getItem('username') || localStorage.getItem('bp_username');
        
        // CARICA L'USERNAME PIÙ RECENTE DAL DATABASE UTENTI CONDIVISO
        if (email && role !== 'guest') {
            const usersDatabase = JSON.parse(localStorage.getItem('brainplayng_users_database') || '{}');
            if (usersDatabase[email] && usersDatabase[email].username) {
                // Usa l'username dal database se è più recente
                username = usersDatabase[email].username;
                console.log('USERNAME AGGIORNATO DAL DATABASE:', username);
                
                // Aggiorna anche sessionStorage/localStorage per consistenza
                sessionStorage.setItem('username', username);
                localStorage.setItem('bp_username', username);
            }
        }
        
        console.log('UTENTE REGISTRATO - Username finale:', username);
        
        return {
            username: username,
            email: email,
            role: role,
            profileImage: sessionStorage.getItem('profileImage') || localStorage.getItem('bp_profileImage') || ''
        };
    }

    // Salva utente registrato nel database condiviso
    static saveRegisteredUser(userData) {
        if (!userData.email || userData.role === 'guest') {
            return false;
        }

        // Recupera database utenti esistente
        const usersDatabase = JSON.parse(localStorage.getItem('brainplayng_users_database') || '{}');
        
        // Aggiungi o aggiorna utente
        usersDatabase[userData.email] = {
            email: userData.email,
            username: userData.username,
            role: userData.role,
            profileImage: userData.profileImage || '',
            registeredAt: userData.registeredAt || new Date().toISOString(),
            lastActive: new Date().toISOString(),
            streak: userData.streak || 1
        };
        
        // Salva database aggiornato
        localStorage.setItem('brainplayng_users_database', JSON.stringify(usersDatabase));
        console.log('Utente salvato nel database:', userData.email);
        return true;
    }

    // Aggiorna lastActive per utente
    static updateUserActivity(email) {
        if (!email) return false;
        
        const usersDatabase = JSON.parse(localStorage.getItem('brainplayng_users_database') || '{}');
        if (usersDatabase[email]) {
            usersDatabase[email].lastActive = new Date().toISOString();
            localStorage.setItem('brainplayng_users_database', JSON.stringify(usersDatabase));
            return true;
        }
        return false;
    }
}

// Export for global use
window.AuthModule = AuthModule;
window.checkAuthentication = AuthModule.checkAuthentication.bind(AuthModule);
window.getUserData = AuthModule.getUserData.bind(AuthModule);
window.logout = AuthModule.logout.bind(AuthModule);
window.forceCleanAuth = AuthModule.forceCleanAuth.bind(AuthModule);
