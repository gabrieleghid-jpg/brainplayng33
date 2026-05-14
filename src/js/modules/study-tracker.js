// Study Tracker Module
class StudyTrackerModule {
    static _siteListenersBound = false;

    /** Giorno locale YYYY-MM-DD (mezzanotte → mezzanotte) */
    static calendarDayLocal(d = new Date()) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    static parseStoredCalendarDay(raw) {
        if (raw == null || raw === '') return null;
        const s = String(raw).trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
        const t = Date.parse(s);
        if (!Number.isNaN(t)) return StudyTrackerModule.calendarDayLocal(new Date(t));
        return null;
    }

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
                dailyCalendar: StudyTrackerModule.calendarDayLocal(),
                dailySessions: 0,
                sessionStartTime: null,
                dailyMinigames: 0,
                lastSessionDuration: 0,
                dailySchemi: 0,
                siteTimeToday: 0,
                siteSecondsToday: 0,
                lastSiteActivity: Date.now()
            };
            localStorage.setItem(studyKey, JSON.stringify(initialData));
            console.log(`StudyTracker: Inizializzati dati per ${userEmail}`);
        }

        this.checkDailyReset();

        this._bindSitePresenceListeners();

        // Inizia tracking automatico del tempo sul sito (tab visibile)
        this.startSiteTracking();
        console.log('StudyTracker inizializzato - tracking sito attivo');
    }

    static _bindSitePresenceListeners() {
        if (StudyTrackerModule._siteListenersBound) return;
        StudyTrackerModule._siteListenersBound = true;

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                StudyTrackerModule.checkDailyReset();
                const userData = window.AuthModule?.getUserData?.() || {};
                if (userData.email && userData.role !== 'guest') {
                    const studyKey = `studyData_${userData.email}`;
                    const data = JSON.parse(localStorage.getItem(studyKey) || '{}');
                    data.lastSiteActivity = Date.now();
                    localStorage.setItem(studyKey, JSON.stringify(data));
                }
                StudyTrackerModule.updateTodayUI();
            }
        });
    }

    static addStudySession(duration) {
        const userData = window.AuthModule.getUserData();
        if (!userData.email || userData.role === 'guest') return;

        this.checkDailyReset();
        const studyKey = `studyData_${userData.email}`;
        const data = JSON.parse(localStorage.getItem(studyKey) || '{}');
        const now = new Date();
        const today = now.toDateString();

        if (!Array.isArray(data.studySessions)) data.studySessions = [];

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
        if (!userData.email || userData.role === 'guest') return;

        const studyKey = `studyData_${userData.email}`;
        const data = JSON.parse(localStorage.getItem(studyKey) || '{}');
        const today = StudyTrackerModule.calendarDayLocal();

        let storedDay =
            StudyTrackerModule.parseStoredCalendarDay(data.dailyCalendar) ||
            StudyTrackerModule.parseStoredCalendarDay(data.dailyStudyDate);

        if (!storedDay) {
            data.dailyCalendar = today;
            data.dailyStudyDate = new Date().toDateString();
            if (data.siteSecondsToday == null) data.siteSecondsToday = 0;
            localStorage.setItem(studyKey, JSON.stringify(data));
            return;
        }

        if (storedDay !== today) {
            data.dailyStudyTime = 0;
            data.dailySessions = 0;
            data.dailyMinigames = 0;
            data.dailySchemi = 0;
            data.lastSessionDuration = 0;
            data.dailyStudyDate = new Date().toDateString();
            data.dailyCalendar = today;
            data.sessionStartTime = null;
            data.siteTimeToday = 0;
            data.siteSecondsToday = 0;
            localStorage.setItem(studyKey, JSON.stringify(data));
            console.log('StudyTracker: Reset giornaliero completato');
        } else {
            let changed = false;
            if (data.dailyCalendar !== storedDay) {
                data.dailyCalendar = storedDay;
                changed = true;
            }
            if ((Number(data.siteSecondsToday) || 0) === 0 && Number(data.siteTimeToday) > 0) {
                data.siteSecondsToday = (Number(data.siteTimeToday) || 0) * 60;
                data.siteTimeToday = 0;
                changed = true;
            }
            if (changed) {
                localStorage.setItem(studyKey, JSON.stringify(data));
            }
        }
    }

    static startSiteTracking() {
        if (this.siteTrackingInterval) {
            clearInterval(this.siteTrackingInterval);
            this.siteTrackingInterval = null;
        }

        this.siteTrackingInterval = setInterval(() => {
            this.updateSiteTime();
        }, 15000);

        const userData = window.AuthModule.getUserData();
        if (!userData.email || userData.role === 'guest') return;

        this.checkDailyReset();
        const studyKey = `studyData_${userData.email}`;
        const data = JSON.parse(localStorage.getItem(studyKey) || '{}');
        data.lastSiteActivity = Date.now();
        localStorage.setItem(studyKey, JSON.stringify(data));
    }

    static updateSiteTime() {
        const userData = window.AuthModule.getUserData();
        if (!userData.email || userData.role === 'guest') return;

        this.checkDailyReset();

        const studyKey = `studyData_${userData.email}`;
        const data = JSON.parse(localStorage.getItem(studyKey) || '{}');
        const now = Date.now();

        if (document.visibilityState === 'hidden') {
            data.lastSiteActivity = now;
            localStorage.setItem(studyKey, JSON.stringify(data));
            return;
        }

        data.siteSecondsToday = (Number(data.siteSecondsToday) || 0) + 15;
        data.lastSiteActivity = now;
        localStorage.setItem(studyKey, JSON.stringify(data));
        this.updateTodayUI();
    }

    static startTracking() {
        const userData = window.AuthModule?.getUserData?.() || {};
        if (!userData.email || userData.role === 'guest') return;

        this.checkDailyReset();
        const studyKey = `studyData_${userData.email}`;
        const data = JSON.parse(localStorage.getItem(studyKey) || '{}');
        data.sessionStartTime = Date.now();
        localStorage.setItem(studyKey, JSON.stringify(data));

        if (!this.trackingInterval) {
            this.trackingInterval = setInterval(() => {
                this.updateDailyTime();
            }, 60000);
        }
    }

    static updateDailyTime() {
        const userData = window.AuthModule?.getUserData?.() || {};
        if (!userData.email || userData.role === 'guest') return;

        const studyKey = `studyData_${userData.email}`;
        const data = JSON.parse(localStorage.getItem(studyKey) || '{}');

        if (data.sessionStartTime) {
            const now = Date.now();
            const elapsedMin = Math.floor((now - data.sessionStartTime) / 60000);

            if (elapsedMin > 0) {
                data.dailyStudyTime = (data.dailyStudyTime || 0) + elapsedMin;
                data.totalStudyTime = (data.totalStudyTime || 0) + elapsedMin * 60;
                data.lastSessionDuration = elapsedMin;
                data.dailySessions = (data.dailySessions || 0) + 1;

                data.sessionStartTime = now;
                localStorage.setItem(studyKey, JSON.stringify(data));

                this.updateUI();
            }
        }
    }

    static stopTracking() {
        if (this.trackingInterval) {
            clearInterval(this.trackingInterval);
            this.trackingInterval = null;
        }

        const userData = window.AuthModule?.getUserData?.() || {};
        if (!userData.email || userData.role === 'guest') return;

        const studyKey = `studyData_${userData.email}`;
        const data = JSON.parse(localStorage.getItem(studyKey) || '{}');

        if (data.sessionStartTime) {
            const now = Date.now();
            const remainderMin = Math.floor((now - data.sessionStartTime) / 60000);
            if (remainderMin > 0) {
                data.dailyStudyTime = (data.dailyStudyTime || 0) + remainderMin;
                data.totalStudyTime = (data.totalStudyTime || 0) + remainderMin * 60;
                data.dailySessions = (data.dailySessions || 0) + 1;
            }
            data.sessionStartTime = null;
            data.lastSessionDuration = 0;
            localStorage.setItem(studyKey, JSON.stringify(data));
            this.updateUI();
        }
    }

    static addMinigameCompleted() {
        const userData = window.AuthModule?.getUserData?.() || {};
        if (!userData.email || userData.role === 'guest') return;

        const studyKey = `studyData_${userData.email}`;
        
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
        const userData = window.AuthModule?.getUserData?.() || {};
        if (!userData.email || userData.role === 'guest') return;

        const studyKey = `studyData_${userData.email}`;
        
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
        const userData = window.AuthModule?.getUserData?.() || {};
        if (!userData.email || userData.role === 'guest') {
            return {
                siteTimeMinutes: 0,
                minigamesCompleted: 0,
                schemiCompleted: 0,
                currentStreak: 0,
                lastActiveDate: null
            };
        }

        const studyKey = `studyData_${userData.email}`;
        
        const data = JSON.parse(localStorage.getItem(studyKey) || '{}');
        const siteSecs = Number(data.siteSecondsToday) || 0;
        return {
            siteTimeMinutes: Math.round(siteSecs / 60),
            minigamesCompleted: data.dailyMinigames || 0,
            schemiCompleted: data.dailySchemi || 0,
            currentStreak: data.currentStreak || 0,
            lastActiveDate: data.lastStudyDate
        };
    }

    static getTodayStats() {
        const userData = window.AuthModule?.getUserData?.() || {};
        if (!userData.email || userData.role === 'guest') {
            return { studyMinutes: 0, sessions: 0, minigames: 0, goal: 0 };
        }

        this.checkDailyReset();
        const studyKey = `studyData_${userData.email}`;
        const data = JSON.parse(localStorage.getItem(studyKey) || '{}');
        const today = new Date().toDateString();

        const sessionSecs = (data.studySessions || [])
            .filter((s) => s.date === today)
            .reduce((acc, s) => acc + (Number(s.duration) || 0), 0);
        const fromSessionsMin = Math.floor(sessionSecs / 60);

        const timerMin = Number(data.dailyStudyTime) || 0;
        const siteSecs = Number(data.siteSecondsToday) || 0;
        const siteMin = Math.round(siteSecs / 60);
        const studyMinutes = fromSessionsMin + timerMin + siteMin;

        const GOAL_MINUTES = 60;
        const goal = Math.min(100, Math.round((studyMinutes / GOAL_MINUTES) * 100));

        return {
            studyMinutes,
            sessions: data.dailySessions || 0,
            minigames: data.dailyMinigames || 0,
            goal
        };
    }

    static updateTodayUI() {
        const stats = this.getTodayStats();

        const studyMinutesEl = document.getElementById('todayStudyMinutes');
        const sessionsEl = document.getElementById('todaySessions');
        const goalEl = document.getElementById('todayGoal');
        const minigamesEl = document.getElementById('todayMinigames');

        if (studyMinutesEl) studyMinutesEl.textContent = `${stats.studyMinutes}m`;
        if (sessionsEl) sessionsEl.textContent = String(stats.sessions);
        if (goalEl) goalEl.textContent = `${stats.goal}%`;
        if (minigamesEl) minigamesEl.textContent = String(stats.minigames);
    }

    static updateUI() {
        const userData = window.AuthModule.getUserData();

        if (!userData.email || userData.role === 'guest') {
            const studyTimeEl = document.getElementById('statStudyTime');
            const streakEl = document.getElementById('statStreak');
            if (studyTimeEl) studyTimeEl.textContent = '0h';
            if (streakEl) streakEl.textContent = '0🔥';
            this.updateTodayUI();
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
