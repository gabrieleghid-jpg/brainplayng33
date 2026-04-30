// Sistema Tema Globale Centralizzato per BrainPlayng
class ThemeManager {
    constructor() {
        this.storageKey = 'bp_theme';
        this.currentTheme = this.loadTheme();
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
        this.isInitialized = true;
    }

    loadTheme() {
        const saved = localStorage.getItem(this.storageKey);
        return saved || 'light';
    }

    saveTheme(theme) {
        localStorage.setItem(this.storageKey, theme);
        this.currentTheme = theme;
    }

    applyTheme(theme) {
        const body = document.body;
        
        // Rimuovi tutte le classi tema
        body.classList.remove('dark', 'light');
        
        // Aggiungi la classe tema corrente
        body.classList.add(theme);
        
        // Aggiorna l'icona del pulsante tema
        this.updateThemeToggle(theme);
        
        // Aggiorna favicon se necessario
        this.updateFavicon(theme);
        
        // Aggiorna meta theme-color per mobile
        this.updateMetaThemeColor(theme);
        
        // Sincronizza avatar animato se presente
        if (window.animatedAvatar) {
            this.syncAnimatedAvatar(theme);
        }
    }

    updateThemeToggle(theme) {
        const themeToggles = document.querySelectorAll('.theme-toggle');
        const icon = theme === 'dark' ? '☀️' : '🌙';
        
        themeToggles.forEach(toggle => {
            toggle.textContent = icon;
            toggle.setAttribute('aria-label', 
                theme === 'dark' ? 'Attiva modalità chiara' : 'Attiva modalità scura'
            );
        });
    }

    updateFavicon(theme) {
        const favicon = document.querySelector('link[rel="icon"]') || 
                       document.querySelector('link[rel="shortcut icon"]');
        
        if (favicon) {
            // Potenzialmente cambiare favicon in base al tema
            // Per ora mantieni quello esistente
        }
    }

    updateMetaThemeColor(theme) {
        const themeColor = theme === 'dark' ? '#080b16' : '#f5f7ff';
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        metaThemeColor.content = themeColor;
    }

    syncAnimatedAvatar(theme) {
        // Sincronizza l'avatar animato con il tema
        if (window.animatedAvatar && window.mascotteGrowth) {
            const levelInfo = window.mascotteGrowth.getCurrentLevelInfo();
            
            // Aggiusta i colori dell'avatar in base al tema
            if (theme === 'dark') {
                // Tema scuro: colori più vividi
                window.animatedAvatar.updateColors(levelInfo);
            } else {
                // Tema chiaro: colori normali
                window.animatedAvatar.updateColors(levelInfo);
            }
        }
    }

    setupEventListeners() {
        // Listener per tutti i pulsanti tema
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('theme-toggle') || 
                event.target.closest('.theme-toggle')) {
                this.toggleTheme();
            }
        });

        // Listener per cambiamenti tema da altre fonti
        window.addEventListener('storage', (event) => {
            if (event.key === this.storageKey) {
                this.applyTheme(event.newValue);
            }
        });

        // Listener per preferenze di sistema
        if (window.matchMedia) {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            darkModeQuery.addEventListener('change', (event) => {
                // Applica solo se non c'è una preferenza salvata
                if (!localStorage.getItem(this.storageKey)) {
                    this.applyTheme(event.matches ? 'dark' : 'light');
                }
            });
        }

        // Keyboard shortcut: Ctrl/Cmd + Shift + T
        document.addEventListener('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
                event.preventDefault();
                this.toggleTheme();
            }
        });
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.saveTheme(newTheme);
        this.applyTheme(newTheme);
        
        // Animazione di transizione
        this.animateThemeTransition();
        
        // Mostra notifica
        this.showThemeNotification(newTheme);
    }

    animateThemeTransition() {
        const body = document.body;
        body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        
        setTimeout(() => {
            body.style.transition = '';
        }, 300);
    }

    showThemeNotification(theme) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
            color: ${theme === 'dark' ? '#ffffff' : '#000000'};
            padding: 1rem 1.5rem;
            border-radius: 12px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            border: 1px solid ${theme === 'dark' ? '#333333' : '#e0e0e0'};
        `;
        
        const icon = theme === 'dark' ? '🌙' : '☀️';
        notification.textContent = `${icon} Modalità ${theme === 'dark' ? 'scura' : 'chiara'} attivata`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // Metodi per controllo esterno
    setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            this.saveTheme(theme);
            this.applyTheme(theme);
        }
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    isDarkTheme() {
        return this.currentTheme === 'dark';
    }

    isLightTheme() {
        return this.currentTheme === 'light';
    }

    // Reset tema alle preferenze di sistema
    resetToSystemPreference() {
        localStorage.removeItem(this.storageKey);
        const systemPrefersDark = window.matchMedia && 
                                window.matchMedia('(prefers-color-scheme: dark)').matches;
        const systemTheme = systemPrefersDark ? 'dark' : 'light';
        this.applyTheme(systemTheme);
    }

    // Applica tema a elementi specifici (per componenti dinamici)
    applyThemeToElement(element, theme = this.currentTheme) {
        if (!element) return;
        
        element.classList.remove('dark', 'light');
        element.classList.add(theme);
    }

    // Ottieni variabili CSS per il tema corrente
    getThemeVariables() {
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);
        
        const variables = {};
        // Estrai tutte le variabili CSS che iniziano con --
        for (let i = 0; i < computedStyle.length; i++) {
            const property = computedStyle[i];
            if (property.startsWith('--')) {
                variables[property] = computedStyle.getPropertyValue(property).trim();
            }
        }
        
        return variables;
    }

    // Sincronizza tema tra iframe o finestre
    syncTheme() {
        // Invia evento di cambio tema ad altre finestre
        window.postMessage({
            type: 'themeChange',
            theme: this.currentTheme
        }, '*');
    }

    // Inizializza tema per nuove pagine/caricamenti
    initializeForPage() {
        if (!this.isInitialized) {
            this.init();
        } else {
            this.applyTheme(this.currentTheme);
        }
    }
}

// Inizializza il gestore temi globale
window.themeManager = new ThemeManager();

// Funzioni globali per accesso rapido
window.toggleTheme = function() {
    window.themeManager.toggleTheme();
};

window.setTheme = function(theme) {
    window.themeManager.setTheme(theme);
};

window.getCurrentTheme = function() {
    return window.themeManager.getCurrentTheme();
};

// Auto-inizializzazione quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeManager.initializeForPage();
    });
} else {
    window.themeManager.initializeForPage();
}

// Ascolta messaggi da altre finestre per sincronizzazione tema
window.addEventListener('message', (event) => {
    if (event.data.type === 'themeChange' && event.data.theme) {
        window.themeManager.applyTheme(event.data.theme);
    }
});

console.log('Sistema tema globale caricato!');
