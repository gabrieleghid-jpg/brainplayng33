// Credits Management Module - Fonte Unica di Verità
class CreditsModule {
    static STORAGE_KEY = 'bp_global_credits';
    
    static getCrediti() {
        // Controlla se l'utente è un ospite
        const userData = window.AuthModule?.getUserData?.() || {};
        if (userData.role === 'guest') {
            // Per ospiti, usa sessionStorage (temporaneo)
            const saved = sessionStorage.getItem('bp_guest_credits');
            return saved ? parseInt(saved) : 0;
        }
        
        // Per utenti registrati, usa localStorage (persistente)
        const saved = localStorage.getItem(this.STORAGE_KEY);
        return saved ? parseInt(saved) : 0;
    }
    
    static setCrediti(crediti) {
        // Controlla se l'utente è un ospite
        const userData = window.AuthModule?.getUserData?.() || {};
        if (userData.role === 'guest') {
            // Per ospiti, salva in sessionStorage (temporaneo)
            sessionStorage.setItem('bp_guest_credits', crediti.toString());
        } else {
            // Per utenti registrati, salva in localStorage (persistente)
            localStorage.setItem(this.STORAGE_KEY, crediti.toString());
        }
        
        this.updateCreditDisplay();
        
        // Notifica altre schede aperte dello stesso sito
        window.dispatchEvent(new CustomEvent('creditsUpdated', { detail: { credits: crediti } }));
    }
    
    static aggiungiCrediti(importo) {
        const attuali = this.getCrediti();
        const nuovi = attuali + importo;
        this.setCrediti(nuovi);
        return nuovi;
    }
    
    static sottraiCrediti(importo) {
        const attuali = this.getCrediti();
        if (attuali >= importo) {
            const nuovi = attuali - importo;
            this.setCrediti(nuovi);
            return nuovi;
        }
        return -1;
    }
    
    static updateCreditDisplay() {
        const crediti = this.getCrediti();
        // Cerca TUTTI i possibili ID usati nelle varie pagine
        const selectors = [
            '#userCredits', 
            '#creditsDisplay', 
            '#totalCredits', 
            '#navCredits', 
            '#creditiDisplay',
            '.user-credits-mini'
        ];
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el) {
                    // Formattazione speciale per alcuni elementi
                    if (el.id === 'creditiDisplay' || el.classList.contains('user-credits-mini')) {
                        el.textContent = `${crediti} crediti`;
                    } else {
                        el.textContent = crediti;
                    }
                }
            });
        });
    }

    static earnCrediti(importo, reason = 'Attività') {
        const nuovi = this.aggiungiCrediti(importo);
        this.logTransaction(importo, reason);
        if (window.NotificationsModule) {
            window.NotificationsModule.showSuccess(`+${importo} crediti! (${reason})`);
        }
        return nuovi;
    }

    static spendCrediti(importo, reason = 'Acquisto') {
        const result = this.sottraiCrediti(importo);
        if (result === -1) {
            if (window.NotificationsModule) {
                window.NotificationsModule.showError('Crediti insufficienti!');
            }
            return false;
        }
        this.logTransaction(-importo, reason);
        if (window.NotificationsModule) {
            window.NotificationsModule.showInfo(`-${importo} crediti per ${reason}`);
        }
        return true;
    }

    static canAfford(importo) {
        return this.getCrediti() >= importo;
    }

    static logTransaction(importo, reason) {
        const history = this.getTransactionHistory();
        history.unshift({
            id: Date.now(),
            amount: importo,
            reason: reason,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('bp_credit_history', JSON.stringify(history.slice(0, 50)));
    }

    static getTransactionHistory() {
        const saved = localStorage.getItem('bp_credit_history');
        return saved ? JSON.parse(saved) : [];
    }
}

// Ascolta cambiamenti da altre schede
window.addEventListener('storage', (event) => {
    if (event.key === CreditsModule.STORAGE_KEY) {
        CreditsModule.updateCreditDisplay();
    }
});

// Inizializzazione automatica al caricamento del modulo
document.addEventListener('DOMContentLoaded', () => {
    CreditsModule.updateCreditDisplay();
});

window.CreditsModule = CreditsModule;
