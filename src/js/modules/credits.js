// Credits Management Module
class CreditsModule {
    static STORAGE_KEY = 'bp_crediti';
    
    static getCrediti() {
        return parseInt(localStorage.getItem(this.STORAGE_KEY) || '0');
    }
    
    static setCrediti(crediti) {
        localStorage.setItem(this.STORAGE_KEY, crediti.toString());
        this.updateCreditDisplay();
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
        return -1; // Crediti insufficienti
    }
    
    static updateCreditDisplay() {
        const crediti = this.getCrediti();
        const elements = document.querySelectorAll('#userCredits, #creditsDisplay, #totalCredits');
        elements.forEach(element => {
            if (element) element.textContent = crediti;
        });
    }
    
    static showCreditNotification(importo, type = 'earned') {
        if (window.NotificationsModule) {
            const message = type === 'earned' ? `+${importo} crediti guadagnati!` : `-${importo} crediti spesi!`;
            const notificationType = type === 'earned' ? 'success' : 'info';
            window.NotificationsModule.showNotification(message, notificationType);
        }
    }

    static canAfford(importo) {
        return this.getCrediti() >= importo;
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
        this.showCreditNotification(importo, 'spent');
        return true;
    }

    static earnCrediti(importo, reason = 'Attività') {
        const nuovi = this.aggiungiCrediti(importo);
        this.logTransaction(importo, reason);
        this.showCreditNotification(importo, 'earned');
        return nuovi;
    }

    static logTransaction(importo, reason) {
        const transactions = this.getTransactionHistory();
        const transaction = {
            id: Date.now(),
            amount: importo,
            reason: reason,
            timestamp: new Date().toISOString(),
            balance: this.getCrediti()
        };
        
        transactions.unshift(transaction);
        
        // Keep only last 50 transactions
        if (transactions.length > 50) {
            transactions.splice(50);
        }
        
        localStorage.setItem('bp_credit_transactions', JSON.stringify(transactions));
    }

    static getTransactionHistory() {
        try {
            const saved = localStorage.getItem('bp_credit_transactions');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading transaction history:', error);
            return [];
        }
    }

    static getStats() {
        const transactions = this.getTransactionHistory();
        const current = this.getCrediti();
        
        const earned = transactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);
            
        const spent = transactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        return {
            current: current,
            totalEarned: earned,
            totalSpent: spent,
            transactionCount: transactions.length,
            lastTransaction: transactions.length > 0 ? transactions[0] : null
        };
    }

    static reset() {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem('bp_credit_transactions');
        this.updateCreditDisplay();
    }

    static initializeCredits(startingCredits = 100) {
        if (this.getCrediti() === 0) {
            this.setCrediti(startingCredits);
            this.logTransaction(startingCredits, 'Bonus iniziale');
            this.showCreditNotification(startingCredits, 'earned');
        }
    }

    static showStats() {
        const stats = this.getStats();
        const transactions = this.getTransactionHistory();
        
        const modal = document.createElement('div');
        modal.className = 'credits-modal';
        modal.innerHTML = `
            <div class="credits-modal-content">
                <div class="credits-modal-header">
                    <h3>💰 Statistiche Crediti</h3>
                    <button class="close-modal" onclick="this.closest('.credits-modal').remove()">✖️</button>
                </div>
                <div class="credits-stats">
                    <div class="stat-item">
                        <span class="stat-label">Crediti Attuali:</span>
                        <span class="stat-value current">${stats.current}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Totali Guadagnati:</span>
                        <span class="stat-value earned">+${stats.totalEarned}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Totali Spesi:</span>
                        <span class="stat-value spent">-${stats.totalSpent}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Transazioni:</span>
                        <span class="stat-value">${stats.transactionCount}</span>
                    </div>
                </div>
                <div class="recent-transactions">
                    <h4>Transazioni Recenti</h4>
                    <div class="transactions-list">
                        ${transactions.slice(0, 5).map(t => `
                            <div class="transaction-item ${t.amount > 0 ? 'positive' : 'negative'}">
                                <span class="transaction-amount">${t.amount > 0 ? '+' : ''}${t.amount}</span>
                                <span class="transaction-reason">${t.reason}</span>
                                <span class="transaction-time">${this.formatTime(t.timestamp)}</span>
                            </div>
                        `).join('') || '<p class="no-transactions">Nessuna transazione</p>'}
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="CreditsModule.reset()">🔄 Reset Crediti</button>
                    <button class="btn-primary" onclick="CreditsModule.earnCrediti(50, 'Bonus manuale')">+50 Crediti</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add styles if not exists
        if (!document.querySelector('#credits-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'credits-modal-styles';
            style.textContent = `
                .credits-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .credits-modal-content {
                    background: var(--panel);
                    border-radius: 20px;
                    padding: 2rem;
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    border: 1px solid var(--border);
                }
                .credits-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                .credits-stats {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                .stat-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem;
                    background: var(--background);
                    border-radius: 10px;
                }
                .stat-value.current { color: var(--accent); font-weight: 700; }
                .stat-value.earned { color: #4ade80; font-weight: 700; }
                .stat-value.spent { color: #f87171; font-weight: 700; }
                .recent-transactions h4 {
                    margin-bottom: 1rem;
                    color: var(--text);
                }
                .transaction-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.5rem;
                    border-radius: 8px;
                    margin-bottom: 0.5rem;
                }
                .transaction-item.positive { background: rgba(74, 222, 128, 0.1); }
                .transaction-item.negative { background: rgba(248, 113, 113, 0.1); }
                .modal-actions {
                    display: flex;
                    gap: 1rem;
                    margin-top: 2rem;
                    justify-content: center;
                }
                .no-transactions {
                    text-align: center;
                    color: var(--muted);
                    font-style: italic;
                }
            `;
            document.head.appendChild(style);
        }
    }

    static formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Adesso';
        if (diffMins < 60) return `${diffMins} min fa`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h fa`;
        return date.toLocaleDateString('it-IT');
    }

    static animateCreditChange(amount) {
        const animationContainer = document.getElementById('creditsAnimation');
        if (!animationContainer) return;
        
        const changeElement = document.createElement('div');
        changeElement.className = `credit-change ${amount > 0 ? 'positive' : 'negative'}`;
        changeElement.textContent = `${amount > 0 ? '+' : ''}${amount}`;
        
        animationContainer.appendChild(changeElement);
        
        setTimeout(() => {
            changeElement.remove();
        }, 2000);
    }
}

// Export for global use
window.CreditsModule = CreditsModule;
