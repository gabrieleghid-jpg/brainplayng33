// Daily System Module - Minigiochi giornalieri e streak
class DailySystemModule {
    static STORAGE_KEYS = {
        DAILY_DATA: 'dailyData',
        STREAK: 'streak',
        LAST_LOGIN_DATE: 'lastLoginDate'
    };

    static init() {
        const userData = this.getUserKey();
        if (!userData) return;

        const today = this.getTodayDateString();
        const lastLogin = this.getLastLoginDate();

        if (lastLogin && lastLogin !== today) {
            const yesterday = this.getYesterdayDateString();
            if (lastLogin === yesterday) {
                this.incrementStreak();
            } else {
                this.resetStreak();
            }
        }

        this.setLastLoginDate(today);
        this.ensureDailyDataExists();
    }

    static getUserKey() {
        const userData = window.AuthModule?.getUserData?.() || {};
        if (userData.role === 'guest') {
            return null;
        }
        return userData.email || 'default';
    }

    static getStorageKey(suffix) {
        const userKey = this.getUserKey();
        return userKey ? `${suffix}_${userKey}` : suffix;
    }

    static getTodayDateString() {
        const now = new Date();
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const today = new Date(now.toLocaleString('en-US', { timeZone }));
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }

    static getYesterdayDateString() {
        const now = new Date();
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const yesterday = new Date(now.toLocaleString('en-US', { timeZone }));
        yesterday.setDate(yesterday.getDate() - 1);
        return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    }

    static getLastLoginDate() {
        const key = this.getStorageKey(this.STORAGE_KEYS.LAST_LOGIN_DATE);
        return localStorage.getItem(key);
    }

    static setLastLoginDate(dateString) {
        const key = this.getStorageKey(this.STORAGE_KEYS.LAST_LOGIN_DATE);
        localStorage.setItem(key, dateString);
    }

    static getStreak() {
        const key = this.getStorageKey(this.STORAGE_KEYS.STREAK);
        return parseInt(localStorage.getItem(key) || '0', 10);
    }

    static setStreak(streak) {
        const key = this.getStorageKey(this.STORAGE_KEYS.STREAK);
        localStorage.setItem(key, String(streak));
    }

    static incrementStreak() {
        const current = this.getStreak();
        this.setStreak(current + 1);
    }

    static resetStreak() {
        this.setStreak(1);
    }

    static ensureDailyDataExists() {
        const key = this.getStorageKey(this.STORAGE_KEYS.DAILY_DATA);
        const today = this.getTodayDateString();
        let data = JSON.parse(localStorage.getItem(key) || '{}');

        if (data.date !== today) {
            data = {
                date: today,
                minigamesCompleted: {},
                completed: false
            };
            localStorage.setItem(key, JSON.stringify(data));
        }
    }

    static getDailyData() {
        const key = this.getStorageKey(this.STORAGE_KEYS.DAILY_DATA);
        return JSON.parse(localStorage.getItem(key) || '{}');
    }

    static saveDailyData(data) {
        const key = this.getStorageKey(this.STORAGE_KEYS.DAILY_DATA);
        localStorage.setItem(key, JSON.stringify(data));
    }

    static completeMinigame(minigameId) {
        const data = this.getDailyData();
        data.minigamesCompleted[minigameId] = true;

        const minigames = this.getDailyMinigames();
        const allCompleted = minigames.every(mg => data.minigamesCompleted[mg.id]);
        data.completed = allCompleted;

        this.saveDailyData(data);

        if (allCompleted) {
            this.giveDailyBonus();
        }

        return data;
    }

    static getDailyMinigames() {
        return [
            { id: 'sudoku', name: 'Sudoku', reward: 20 },
            { id: 'wordle', name: 'Wordle', reward: 20 },
            { id: 'math', name: 'Calcolo Veloce', reward: 20 }
        ];
    }

    static giveDailyBonus() {
        const streak = this.getStreak();
        const baseReward = 50;
        const streakBonus = streak * 10;
        const totalReward = baseReward + streakBonus;

        if (window.ExpSystemModule) {
            window.ExpSystemModule.addExp(totalReward);
        }

        if (window.CreditsModule) {
            window.CreditsModule.addCredits(10 + streak);
        }

        if (window.showToast) {
            window.showToast(`🎁 Bonus giornaliero! +${totalReward} EXP e +${10 + streak} crediti! (Streak: ${streak})`);
        }
    }

    static getStreakMultiplier() {
        const streak = this.getStreak();
        if (streak >= 30) return 3.0;
        if (streak >= 15) return 2.5;
        if (streak >= 7) return 2.0;
        if (streak >= 3) return 1.5;
        return 1.0;
    }

    static getModifiedExp(originalExp) {
        const multiplier = this.getStreakMultiplier();
        return Math.floor(originalExp * multiplier);
    }
}

window.DailySystemModule = DailySystemModule;
