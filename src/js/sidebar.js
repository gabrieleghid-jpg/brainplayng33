// Sistema Sidebar Menu per BrainPlayng
class SidebarManager {
    constructor() {
        this.sidebar = null;
        this.sidebarToggle = null;
        this.sidebarOverlay = null;
        this.menuTrigger = null;
        this.isOpen = false;
        
        this.init();
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.createMenuTrigger();
        this.updateUserInfo();
        this.setupThemeIntegration();
    }

    cacheElements() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.themeNavToggle = document.getElementById('themeNavToggle');
    }

    createMenuTrigger() {
        // Crea il pulsante menu nell'header se non esiste
        const nav = document.querySelector('.nav-actions');
        if (nav && !document.querySelector('.menu-trigger')) {
            const menuTrigger = document.createElement('button');
            menuTrigger.className = 'menu-trigger';
            menuTrigger.id = 'menuTrigger';
            menuTrigger.setAttribute('aria-label', 'Apri menù');
            menuTrigger.innerHTML = `
                <span></span>
                <span></span>
                <span></span>
            `;
            
            // Inserisci prima degli altri elementi
            nav.insertBefore(menuTrigger, nav.firstChild);
            this.menuTrigger = menuTrigger;
        }
    }

    setupEventListeners() {
        // Toggle sidebar con pulsante menu
        if (this.menuTrigger) {
            this.menuTrigger.addEventListener('click', () => this.toggleSidebar());
        }

        // Chiudi sidebar con toggle interno
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => this.closeSidebar());
        }

        // Chiudi sidebar con overlay
        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', () => this.closeSidebar());
        }

        // Chiudi sidebar con ESC
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isOpen) {
                this.closeSidebar();
            }
        });

        // Gestione link di navigazione
        this.setupNavigationLinks();

        // Tema nel sidebar
        if (this.themeNavToggle) {
            this.themeNavToggle.addEventListener('click', () => {
                if (window.themeManager) {
                    window.themeManager.toggleTheme();
                    this.updateThemeToggle();
                }
            });
        }

        // Gestione logout
        this.setupLogout();

        // Chiudi sidebar quando si clicca un link (navigazione)
        document.querySelectorAll('.sidebar .nav-link[href]').forEach(link => {
            link.addEventListener('click', () => {
                this.closeSidebar();
            });
        });

        // Responsive: chiudi su resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024 && this.isOpen) {
                this.closeSidebar();
            }
        });
    }

    setupNavigationLinks() {
        // Aggiungi classe active al link corrente
        const currentPath = window.location.pathname;
        const currentFile = currentPath.split('/').pop() || 'home.html';
        
        document.querySelectorAll('.sidebar .nav-link[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentFile || 
                (currentFile === '' && href === 'home.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    setupThemeIntegration() {
        // Aggiorna il testo del tema nel sidebar
        this.updateThemeToggle();
        
        // Ascolta cambiamenti tema
        document.addEventListener('themeChanged', () => {
            this.updateThemeToggle();
        });
    }

    updateThemeToggle() {
        if (!this.themeNavToggle) return;
        
        const isDark = window.themeManager ? window.themeManager.isDarkTheme() : 
                         document.body.classList.contains('dark');
        const icon = isDark ? '☀️' : '🌙';
        const text = isDark ? 'Tema Chiaro' : 'Tema Scuro';
        
        const iconElement = this.themeNavToggle.querySelector('.nav-icon');
        const textElement = this.themeNavToggle.querySelector('.nav-text');
        
        if (iconElement) iconElement.textContent = icon;
        if (textElement) textElement.textContent = text;
    }

    setupLogout() {
        // Assicurati che la funzione logout esista
        if (typeof window.logout !== 'function') {
            window.logout = function() {
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
            };
        }
    }

    toggleSidebar() {
        if (this.isOpen) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }

    openSidebar() {
        if (!this.sidebar) return;
        
        this.sidebar.classList.add('open');
        this.sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Previene scroll
        this.isOpen = true;
        
        // Focus management
        if (this.sidebarToggle) {
            this.sidebarToggle.focus();
        }
        
        // Animazione ingresso
        this.animateIn();
    }

    closeSidebar() {
        if (!this.sidebar) return;
        
        this.sidebar.classList.remove('open');
        this.sidebarOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Ripristina scroll
        this.isOpen = false;
        
        // Focus management
        if (this.menuTrigger) {
            this.menuTrigger.focus();
        }
        
        // Animazione uscita
        this.animateOut();
    }

    animateIn() {
        // Animazione degli elementi del menù
        const navItems = this.sidebar.querySelectorAll('.nav-item');
        navItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 50);
        });
    }

    animateOut() {
        // Reset animazioni
        const navItems = this.sidebar.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.style.transition = '';
            item.style.opacity = '';
            item.style.transform = '';
        });
    }

    updateUserInfo() {
        // Aggiorna le informazioni utente nel footer del sidebar
        const sidebarAvatar = document.getElementById('sidebarAvatar');
        const userName = document.querySelector('.user-name-mini');
        const userCredits = document.querySelector('.user-credits-mini');
        
        // Ottieni informazioni utente
        const username = sessionStorage.getItem('username') || 
                        localStorage.getItem('bp_username') || 
                        'BrainPlayer';
        
        const credits = localStorage.getItem('bp_crediti') || '0';
        
        // Aggiorna avatar
        if (sidebarAvatar) {
            const initials = username.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
            sidebarAvatar.textContent = initials;
        }
        
        // Aggiorna nome
        if (userName) {
            userName.textContent = username;
        }
        
        // Aggiorna crediti
        if (userCredits) {
            userCredits.textContent = credits + ' crediti';
        }
    }

    // Metodi pubblici
    isOpenSidebar() {
        return this.isOpen;
    }

    forceClose() {
        this.closeSidebar();
    }

    // Auto-aggiornamento quando i crediti cambiano
    setupCreditListener() {
        // Intercetta cambiamenti dei crediti
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = (key, value) => {
            if (key === 'bp_crediti') {
                setTimeout(() => this.updateUserInfo(), 100);
            }
            originalSetItem.call(localStorage, key, value);
        };
    }
}

// Inizializza il sistema sidebar
window.sidebarManager = new SidebarManager();

// Funzioni globali per accesso rapido
window.openSidebar = function() {
    if (window.sidebarManager) {
        window.sidebarManager.openSidebar();
    }
};

window.closeSidebar = function() {
    if (window.sidebarManager) {
        window.sidebarManager.closeSidebar();
    }
};

window.toggleSidebar = function() {
    if (window.sidebarManager) {
        window.sidebarManager.toggleSidebar();
    }
};

// Auto-inizializzazione quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.sidebarManager) {
            window.sidebarManager.updateUserInfo();
            window.sidebarManager.setupCreditListener();
        }
    });
} else {
    if (window.sidebarManager) {
        window.sidebarManager.updateUserInfo();
        window.sidebarManager.setupCreditListener();
    }
}

console.log('Sistema sidebar caricato!');
