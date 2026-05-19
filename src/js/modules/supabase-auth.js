/**
 * Modulo per l'autenticazione con Supabase
 * Gestisce login, registrazione, logout e sincronizzazione con localStorage
 */

class SupabaseAuth {
  static isConfigured() {
    return (
      typeof supabaseClient !== 'undefined' &&
      supabaseClient !== null &&
      ENV.SUPABASE_URL &&
      ENV.SUPABASE_URL !== 'https://XXXXXXXXXXXXXXXX.supabase.co' &&
      ENV.SUPABASE_ANON_KEY &&
      ENV.SUPABASE_ANON_KEY.startsWith('eyJhbG')
    );
  }

  static async register(email, password, username) {
    if (!this.isConfigured()) {
      console.warn('Supabase non configurato, uso localStorage come fallback');
      return this._registerLocal(email, password, username);
    }

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });

      if (error) throw error;

      const user = data.user;
      
      // Salva anche in localStorage per consistenza
      this._saveToLocalStorage({
        email,
        username,
        role: 'user'
      });

      // Salva anche nel database utenti
      if (window.AuthModule && window.AuthModule.saveRegisteredUser) {
        window.AuthModule.saveRegisteredUser({
          email,
          username,
          role: 'user',
          registeredAt: new Date().toISOString()
        });
      }

      return { success: true, user };
    } catch (err) {
      console.error('Errore registrazione Supabase:', err);
      throw err;
    }
  }

  static async login(email, password) {
    if (!this.isConfigured()) {
      console.warn('Supabase non configurato, uso localStorage come fallback');
      return this._loginLocal(email, password);
    }

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      const user = data.user;
      const username = user.user_metadata?.username || user.email.split('@')[0];

      // Salva anche in localStorage per consistenza
      this._saveToLocalStorage({
        email,
        username,
        role: 'user'
      });

      // Aggiorna anche il database utenti
      if (window.AuthModule && window.AuthModule.saveRegisteredUser) {
        window.AuthModule.saveRegisteredUser({
          email,
          username,
          role: 'user'
        });
      }

      return { success: true, user };
    } catch (err) {
      console.error('Errore login Supabase:', err);
      throw err;
    }
  }

  static async logout() {
    if (this.isConfigured()) {
      try {
        await supabaseClient.auth.signOut();
      } catch (err) {
        console.error('Errore logout Supabase:', err);
      }
    }
    
    // Pulisci sempre localStorage e sessionStorage
    this._clearLocalStorage();
  }

  static async getCurrentUser() {
    if (!this.isConfigured()) {
      return this._getLocalUser();
    }

    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) {
        return this._getLocalUser();
      }

      const user = session.user;
      const username = user.user_metadata?.username || user.email.split('@')[0];

      return {
        email: user.email,
        username,
        role: 'user'
      };
    } catch (err) {
      console.error('Errore recupero utente Supabase:', err);
      return this._getLocalUser();
    }
  }

  // --- Metodi per localStorage (fallback) ---

  static _registerLocal(email, password, username) {
    const STORAGE_ACCOUNTS_KEY = 'bp_accounts';
    const accounts = JSON.parse(localStorage.getItem(STORAGE_ACCOUNTS_KEY) || '{}');
    
    if (accounts[email.toLowerCase()]) {
      throw new Error('Email già registrata');
    }

    accounts[email.toLowerCase()] = {
      email,
      password,
      username,
      registeredAt: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
    
    this._saveToLocalStorage({ email, username, role: 'user' });
    
    if (window.AuthModule && window.AuthModule.saveRegisteredUser) {
      window.AuthModule.saveRegisteredUser({
        email,
        username,
        role: 'user',
        registeredAt: new Date().toISOString()
      });
    }

    return { success: true };
  }

  static _loginLocal(email, password) {
    const STORAGE_ACCOUNTS_KEY = 'bp_accounts';
    const accounts = JSON.parse(localStorage.getItem(STORAGE_ACCOUNTS_KEY) || '{}');
    const account = accounts[email.toLowerCase()];

    if (!account || account.password !== password) {
      throw new Error('Email o password errati!');
    }

    this._saveToLocalStorage({
      email,
      username: account.username,
      role: 'user'
    });

    return { success: true };
  }

  static _saveToLocalStorage(userData) {
    sessionStorage.setItem('authenticated', 'true');
    sessionStorage.setItem('username', userData.username);
    sessionStorage.setItem('email', userData.email);
    sessionStorage.setItem('role', userData.role);
    
    localStorage.setItem('bp_authenticated', 'true');
    localStorage.setItem('bp_username', userData.username);
    localStorage.setItem('bp_email', userData.email);
    localStorage.setItem('bp_role', userData.role);
  }

  static _clearLocalStorage() {
    sessionStorage.clear();
    localStorage.removeItem('bp_authenticated');
    localStorage.removeItem('bp_role');
    localStorage.removeItem('bp_username');
    localStorage.removeItem('bp_email');
    localStorage.removeItem('bp_profileImage');
  }

  static _getLocalUser() {
    const isAuthenticated = sessionStorage.getItem('authenticated') === 'true' || 
                          localStorage.getItem('bp_authenticated') === 'true';
    
    if (!isAuthenticated) {
      return null;
    }

    const email = sessionStorage.getItem('email') || localStorage.getItem('bp_email') || '';
    const username = sessionStorage.getItem('username') || localStorage.getItem('bp_username') || '';
    const role = sessionStorage.getItem('role') || localStorage.getItem('bp_role') || 'user';

    return { email, username, role };
  }
}

window.SupabaseAuth = SupabaseAuth;
