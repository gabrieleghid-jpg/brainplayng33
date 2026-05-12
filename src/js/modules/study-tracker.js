// Study Tracker Module
class StudyTrackerModule {
    static init() {
        // Controlla se l'utente è autenticato
        if (!window.AuthModule || !window.AuthModule.checkAuthentication()) {
            return;
        }

        // Ottieni email dell'utente corrente
        const userData = window.AuthModule.getUserData();
        const userEmail = userData.email;
        
        if (!userEmail || userData.role === 'guest') {
            return;
        }

        // Inizializza dati di studio per questo utente se non esistono
        const studyKey = `studyData_${userEmail}`;
        if (!localStorage.getItem(studyKey)) {
            const initialData = {
                totalStudyTime: 0,
                currentStreak: 0,
                lastStudyDate: null,
                studySessions: [],
                achievements: [],
                dailyStudyTime: 0,
                dailyStudyDate: new Date().toDateString(),
                dailySessions: 0,
                sessionStartTime: null,
                dailyMinigames: 0,
                lastSessionDuration: 0,
                dailySchemi: 0,
                siteTimeToday: 0,
                lastSiteActivity: Date.now()
            };
            localStorage.setItem(studyKey, JSON.stringify(initialData));
            console.log(`StudyTracker: Inizializzati dati per ${userEmail}`);
        }

        this.checkDailyReset();
        
        // Inizia tracking automatico del tempo sul sito
        this.startSiteTracking();
        console.log('StudyTracker inizializzato - tracking sito attivo');
    }

    static addStudySession(duration) {
        const userData = window.AuthModule.getUserData();
        const studyKey = `studyData_${userData.email}`;
        const data = JSON.parse(localStorage.getItem(studyKey) || '{}');
        const now = new Date();
        const today = now.toDateString();
        
        // Aggiungi sessione
        data.studySessions.push({
            date: today,
            duration: duration,
            timestamp: now.getTime()
        });
        
        // Aggiorna tempo totale
        data.totalStudyTime += duration;
        
        // Calcola streak
        if (data.lastStudyDate !== today) {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (data.lastStudyDate === yesterday.toDateString()) {
                data.currentStreak++;
            } else {
                data.currentStreak = 1;
            }
            data.lastStudyDate = today;
        }
        
        // Salva dati
        localStorage.setItem(studyKey, JSON.stringify(data));
        
        // Aggiorna UI se presente
        this.updateUI();
    }

    static getStudyStats() {
        const userData = window.AuthModule.getUserData();
        const studyKey = `studyData_${userData.email}`;
        const data = JSON.parse(localStorage.getItem(studyKey) || '{}');
        return {
            totalHours: (data.totalStudyTime / 3600).toFixed(1) + 'h',
            currentStreak: data.currentStreak + '🔥',
            sessions: data.studySessions.length,
            achievements: data.achievements.length
        };
    }

    static checkDailyReset() {
        const userData = window.AuthModule.getUserData();
        const studyKey = `studyData_${userData.email}`;
        const data = JSON.parse(localStorage.getItem(studyKey) || '{}');
        const today = new Date().toDateString();
        
        // Se è un nuovo giorno, resetta i dati giornalieri
        if (data.dailyStudyDate !== today) {
            data.dailyStudyTime = 0;
            data.dailySessions = 0;
            data.dailyMinigames = 0;
            data.lastSessionDuration = 0;
            data.dailyStudyDate = today;
            localStorage.setItem(studyKey, JSON.stringify(data));
            console.log('StudyTracker: Reset giornaliero completato');
        }
    }

    static startSiteTracking() {
        // Inizia a tracciare il tempo totale sul sito
        if (!this.siteTrackingInterval) {
            this.siteTrackingInterval = setInterval(() => {
                this.updateSiteTime();
            }, 60000); // Aggiorna ogni minuto
            
            // Inizia subito
            const userData = window.AuthModule.getUserData();
            const studyKey = `studyData_${userData.email}`;
            const data = JSON.parse(localStorage.getItem(studyKey) || '{}');
            if (!data.lastSiteActivity) {
                data.lastSiteActivity = Date.now();
                localStorage.setItem(studyKey, JSON.stringify(data));
            }
        }
    }

    static updateSiteTime() {
        const userData = window.AuthModule.getUserData();
        const studyKey = `studyData_${userData.email}`;
        const data = JSON.parse(localStorage.getItem(studyKey) || '{}');
        const now = Date.now();
        
        if (data.lastSiteActivity) {
            const timeDiff = Math.floor((now - data.lastSiteActivity) / 1000 / 60); // minuti
            
            if (timeDiff > 0 && timeDiff < 5) { // Solo se l'utente è attivo (meno di 5 minuti di inattività)
                data.siteTimeToday = (data.siteTimeToday || 0) + 1;
            }
        }
        
        data.lastSiteActivity = now;
        localStorage.setItem(studyKey, JSON.stringify(data));
    }

    static startTracking() {
        // Inizia a tracciare il tempo di studio
        if (!this.trackingInterval) {
            this.trackingInterval = setInterval(() => {
                this.updateDailyTime();
            }, 60000); // Aggiorna ogni minuto
            
            // Inizia subito se non stiamo già tracciando
            const data = JSON.parse(localStorage.getItem('studyData') || '{}');
            if (!data.sessionStartTime) {
                data.sessionStartTime = Date.now();
                localStorage.setItem('studyData', JSON.stringify(data));
            }
        }
    }

    static updateDailyTime() {
        const userData = window.AuthModule.getUserData();
        const studyKey = `studyData_${userData.email}`;
        const data = JSON.parse(localStorage.getItem(studyKey) || '{}');
        
        if (data.sessionStartTime) {
            const now = Date.now();
            const elapsed = Math.floor((now - data.sessionStartTime) / 1000 / 60); // minuti
            
            if (elapsed > 0) {
                data.dailyStudyTime += elapsed;
                data.totalStudyTime += elapsed;
                data.lastSessionDuration = elapsed;
                data.dailySessions++;
                
                // Resetta il timer per il prossimo minuto
                data.sessionStartTime = now;
                localStorage.setItem(studyKey, JSON.stringify(data));
                
                // Aggiorna UI
                this.updateUI();
            }
        }
    }

    static stopTracking() {
        if (this.trackingInterval) {
            clearInterval(this.trackingInterval);
            this.trackingInterval = null;
        }
        
        // Salva il tempo finale della sessione ma non resettare il tempo accumulato
        const data = JSON.parse(localStorage.getItem('studyData') || '{}');
        if (data.sessionStartTime) {
            const now = Date.now();
            const sessionDuration = Math.floor((now - data.sessionStartTime) / 1000 / 60);
            
            // Aggiungi il tempo della sessione corrente al totale giornaliero
            const timeDifference = sessionDuration - (data.lastSessionDuration || 0);
            if (timeDifference > 0) {
                data.dailyStudyTime = (data.dailyStudyTime || 0) + timeDifference;
                data.lastSessionDuration = 0; // Reset per prossima sessione
            }
        }
        
        // Resetta solo il tempo di inizio sessione, non il tempo accumulato
        data.sessionStartTime = null;
        localStorage.setItem('studyData', JSON.stringify(data));
    }

    static addMinigameCompleted() {
        // Usa chiave specifica per utente come gli EXP
        const userData = window.AuthModule?.getUserData?.() || {};
        const studyKey = userData.email ? `studyData_${userData.email}` : 'studyData';
        
        const data = JSON.parse(localStorage.getItem(studyKey) || '{}');
        const today = new Date().toDateString();
        
        // Reset giornaliero se necessario
        this.checkDailyReset();
        
        // Incrementa minigiochi completati oggi
        data.dailyMinigames = (data.dailyMinigames || 0) + 1;
        
        // Aggiorna streak giornaliero
        if (data.lastStudyDate !== today) {
            data.currentStreak++;
            data.lastStudyDate = today;
        }
        
        // Salva i dati con chiave specifica
        localStorage.setItem(studyKey, JSON.stringify(data));
        
        console.log(`Minigioco completato: ${userData.email}, chiave: ${studyKey}, total: ${data.dailyMinigames}`);
        
        // Aggiorna UI se presente
        this.updateUI();
    }

    static addSchemaCompleted() {
        // Usa chiave specifica per utente come gli EXP
        const userData = window.AuthModule?.getUserData?.() || {};
        const studyKey = userData.email ? `studyData_${userData.email}` : 'studyData';
        
        const data = JSON.parse(localStorage.getItem(studyKey) || '{}');
        const today = new Date().toDateString();
        
        // Reset giornaliero se necessario
        this.checkDailyReset();
        
        // Incrementa schemi completati oggi
        data.dailySchemi = (data.dailySchemi || 0) + 1;
        
        // Aggiorna streak giornaliero
        if (data.lastStudyDate !== today) {
            data.currentStreak++;
            data.lastStudyDate = today;
        }
        
        // Salva i dati con chiave specifica
        localStorage.setItem(studyKey, JSON.stringify(data));
        
        console.log(`Schema completato: ${userData.email}, chiave: ${studyKey}, total: ${data.dailySchemi}`);
        
        // Aggiorna UI se presente
        this.updateUI();
    }

    static getDailyStats() {
        // Usa chiave specifica per utente come gli EXP
        const userData = window.AuthModule?.getUserData?.() || {};
        const studyKey = userData.email ? `studyData_${userData.email}` : 'studyData';
        
        const data = JSON.parse(localStorage.getItem(studyKey) || '{}');
        return {
            siteTimeMinutes: data.siteTimeToday || 0,
            minigamesCompleted: data.dailyMinigames || 0,
            schemiCompleted: data.dailySchemi || 0,
            currentStreak: data.currentStreak || 0,
            lastActiveDate: data.lastStudyDate
        };
    }

    static getTodayStats() {
        const data = JSON.parse(localStorage.getItem('studyData') || '{}');
        this.checkDailyReset(); // Assicura che i dati siano del giorno corrente
        
        return {
            studyMinutes: data.dailyStudyTime,
            sessions: data.dailySessions,
            minigames: data.dailyMinigames || 0,
            goal: Math.min(100, Math.round((data.dailyStudyTime / 60) * 100)) // Goal basato su 60 minuti
        };
    }

    static updateTodayUI() {
        const stats = this.getTodayStats();
        
        // Aggiorna la sezione OGGI nella home
        const studyMinutesEl = document.getElementById('todayStudyMinutes');
        const sessionsEl = document.getElementById('todaySessions');
        const goalEl = document.getElementById('todayGoal');
        const minigamesEl = document.getElementById('todayMinigames');
        
        if (studyMinutesEl) studyMinutesEl.textContent = `${stats.studyMinutes}m`;
        if (sessionsEl) sessionsEl.textContent = stats.sessions;
        if (goalEl) goalEl.textContent = `${stats.goal}%`;
        if (minigamesEl) minigamesEl.textContent = stats.minigames;
    }

    static updateUI() {
        const userData = window.AuthModule.getUserData();
        
        if (!userData.email || userData.role === 'guest') {
            // Per ospiti, mostra 0
            const studyTimeEl = document.getElementById('statStudyTime');
            const streakEl = document.getElementById('statStreak');
            if (studyTimeEl) studyTimeEl.textContent = '0h';
            if (streakEl) streakEl.textContent = '0🔥';
            return;
        }
        
        const studyKey = `studyData_${userData.email}`;
        const data = JSON.parse(localStorage.getItem(studyKey) || '{}');
        
        // Aggiorna profile.html se presente
        const studyTimeEl = document.getElementById('statStudyTime');
        const streakEl = document.getElementById('statStreak');
        
        if (studyTimeEl) {
            const hours = Math.floor(data.totalStudyTime / 3600);
            const minutes = Math.floor((data.totalStudyTime % 3600) / 60);
            studyTimeEl.textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        }
        if (streakEl) streakEl.textContent = `${data.currentStreak || 0}🔥`;
        
        // Aggiorna anche la sezione OGGI
        this.updateTodayUI();
    }

    static simulateStudySession() {
        // Simula una sessione di studio di 30 minuti
        this.addStudySession(30 * 60); // 30 minuti in secondi
    }
}

// Export per uso globale
window.StudyTrackerModule = StudyTrackerModule;
