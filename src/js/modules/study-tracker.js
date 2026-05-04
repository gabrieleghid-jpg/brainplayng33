// Study Tracker Module
class StudyTrackerModule {
    static init() {
        // Inizializza i dati di studio se non esistono
        if (!localStorage.getItem('studyData')) {
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
                lastSessionDuration: 0
            };
            localStorage.setItem('studyData', JSON.stringify(initialData));
        }
        
        // Controlla se è un nuovo giorno e resetta i dati giornalieri
        this.checkDailyReset();
        
        // Inizia a tracciare se l'utente è attivo
        this.startTracking();
    }

    static addStudySession(duration) {
        const data = JSON.parse(localStorage.getItem('studyData') || '{}');
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
        localStorage.setItem('studyData', JSON.stringify(data));
        
        // Aggiorna UI se presente
        this.updateUI();
    }

    static getStudyStats() {
        const data = JSON.parse(localStorage.getItem('studyData') || '{}');
        return {
            totalHours: (data.totalStudyTime / 3600).toFixed(1) + 'h',
            currentStreak: data.currentStreak + '🔥',
            sessions: data.studySessions.length,
            achievements: data.achievements.length
        };
    }

    static checkDailyReset() {
        const data = JSON.parse(localStorage.getItem('studyData') || '{}');
        const today = new Date().toDateString();
        
        // Se è un nuovo giorno, resetta i dati giornalieri
        if (data.dailyStudyDate !== today) {
            data.dailyStudyTime = 0;
            data.dailySessions = 0;
            data.dailyMinigames = 0;
            data.lastSessionDuration = 0;
            data.dailyStudyDate = today;
            localStorage.setItem('studyData', JSON.stringify(data));
            console.log('StudyTracker: Reset giornaliero completato');
        }
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
        const data = JSON.parse(localStorage.getItem('studyData') || '{}');
        
        if (data.sessionStartTime) {
            const now = Date.now();
            const sessionDuration = Math.floor((now - data.sessionStartTime) / 1000 / 60); // minuti
            
            // Accumula il tempo giornaliero invece di sostituirlo
            const previousTime = data.dailyStudyTime || 0;
            const timeDifference = sessionDuration - (data.lastSessionDuration || 0);
            
            if (timeDifference > 0) {
                data.dailyStudyTime = previousTime + timeDifference;
                data.lastSessionDuration = sessionDuration;
                localStorage.setItem('studyData', JSON.stringify(data));
                
                // Aggiorna UI
                this.updateTodayUI();
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
        const data = JSON.parse(localStorage.getItem('studyData') || '{}');
        this.checkDailyReset(); // Assicura che i dati siano del giorno corrente
        
        // Incrementa i minigiochi completati oggi
        data.dailyMinigames = (data.dailyMinigames || 0) + 1;
        localStorage.setItem('studyData', JSON.stringify(data));
        
        // Aggiorna UI
        this.updateTodayUI();
        
        console.log(`Minigioco completato! Totali oggi: ${data.dailyMinigames}`);
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
        const stats = this.getStudyStats();
        
        // Aggiorna profile.html se presente
        const studyTimeEl = document.getElementById('statStudyTime');
        const streakEl = document.getElementById('statStreak');
        
        if (studyTimeEl) studyTimeEl.textContent = stats.totalHours;
        if (streakEl) streakEl.textContent = stats.currentStreak;
        
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
