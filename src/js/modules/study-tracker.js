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
                achievements: []
            };
            localStorage.setItem('studyData', JSON.stringify(initialData));
        }
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

    static updateUI() {
        const stats = this.getStudyStats();
        
        // Aggiorna profile.html se presente
        const studyTimeEl = document.getElementById('statStudyTime');
        const streakEl = document.getElementById('statStreak');
        
        if (studyTimeEl) studyTimeEl.textContent = stats.totalHours;
        if (streakEl) streakEl.textContent = stats.currentStreak;
    }

    static simulateStudySession() {
        // Simula una sessione di studio di 30 minuti
        this.addStudySession(30 * 60); // 30 minuti in secondi
    }
}

// Export per uso globale
window.StudyTrackerModule = StudyTrackerModule;
