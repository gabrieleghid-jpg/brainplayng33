// EXP System Module
class ExpSystemModule {
    static init() {
        // Inizializza i dati EXP se non esistono
        if (!localStorage.getItem('expData')) {
            const initialData = {
                level: 1,
                currentExp: 0,
                totalExp: 0,
                title: 'Principiante',
                achievements: []
            };
            localStorage.setItem('expData', JSON.stringify(initialData));
        }
    }

    static getExpData() {
        // Controlla se l'utente è un ospite
        const userData = window.AuthModule?.getUserData?.() || {};
        if (userData.role === 'guest') {
            return {
                level: 0,
                currentExp: 0,
                totalExp: 0,
                title: 'Ospite',
                achievements: []
            };
        }
        
        // Usa chiave specifica per l'email dell'utente
        const userExpKey = userData.email ? `expData_${userData.email}` : 'expData';
        const data = JSON.parse(localStorage.getItem(userExpKey) || '{}');
        return {
            level: data.level || 1,
            currentExp: data.currentExp || 0,
            totalExp: data.totalExp || 0,
            title: data.title || 'Principiante',
            achievements: data.achievements || []
        };
    }

    static addExp(amount) {
        // Controlla se l'utente è un ospite
        const userData = window.AuthModule?.getUserData?.() || {};
        if (userData.role === 'guest') {
            console.log('EXP: Ospite detected, dati non salvati');
            // Per ospiti, non salvare nulla ma aggiorna temporaneamente l'UI
            this.updateUI();
            return { 
                level: 0, 
                currentExp: 0, 
                totalExp: 0, 
                title: 'Ospite',
                achievements: [],
                guest: true
            };
        }
        
        // Usa chiave specifica per l'email dell'utente
        const userExpKey = userData.email ? `expData_${userData.email}` : 'expData';
        const data = JSON.parse(localStorage.getItem(userExpKey) || '{}');
        const currentLevel = data.level || 1;
        const currentExp = data.currentExp || 0;
        const totalExp = data.totalExp || 0;
        
        const newTotalExp = totalExp + amount;
        const newCurrentExp = currentExp + amount;
        
        // Calcola nuovo livello
        let newLevel = currentLevel;
        let levelUp = false;
        const expForNextLevel = currentLevel * 100;
        
        if (newCurrentExp >= expForNextLevel) {
            newLevel++;
            levelUp = true;
            data.currentExp = newCurrentExp - expForNextLevel;
        } else {
            data.currentExp = newCurrentExp;
        }
        
        data.level = newLevel;
        data.totalExp = newTotalExp;
        
        // Salva i dati con chiave specifica
        localStorage.setItem(userExpKey, JSON.stringify(data));
        
        // Aggiorna attività utente
        if (window.AuthModule && window.AuthModule.updateUserActivity) {
            window.AuthModule.updateUserActivity(userData.email);
        }
        
        // Aggiorna l'interfaccia
        this.updateUI();
        
        return {
            level: newLevel,
            currentExp: data.currentExp,
            totalExp: newTotalExp,
            title: this.getTitle(newLevel),
            levelUp: levelUp,
            newLevel: newLevel
        };
    }

    static getExpNeeded(level) {
        // Formula: 100 * level * 1.2
        return Math.floor(100 * level * 1.2);
    }

    static getTitle(level) {
        if (level >= 20) return 'Maestro';
        if (level >= 15) return 'Esperto';
        if (level >= 10) return 'Avanzato';
        if (level >= 7) return 'Intermedio';
        if (level >= 4) return 'Apprendista';
        return 'Principiante';
    }

    static updateUI() {
        const data = this.getExpData();
        const expNeeded = this.getExpNeeded(data.level);
        const expPercentage = (data.currentExp / expNeeded) * 100;
        
        // Aggiorna home page se presente
        const levelEl = document.getElementById('homeLevel');
        const expEl = document.getElementById('homeExp');
        const expBarEl = document.getElementById('homeExpBar');
        
        if (levelEl) {
            levelEl.textContent = `Lv. ${data.level} · ${data.title}`;
        }
        if (expEl) {
            expEl.textContent = `${data.currentExp} / ${expNeeded}`;
        }
        if (expBarEl) {
            expBarEl.style.width = `${expPercentage}%`;
        }
    }

    static getGuestData() {
        return {
            level: 0,
            currentExp: 0,
            totalExp: 0,
            title: 'Ospite',
            achievements: []
        };
    }
}

// Export per uso globale
window.ExpSystemModule = ExpSystemModule;
