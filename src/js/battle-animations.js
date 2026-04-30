/**
 * Animazioni ed Effetti Speciali - Gioco di Combattimento
 * Animazioni per attacchi, danni, transizioni e effetti visivi
 */

// Sistema Animazioni
class BattleAnimations {
    constructor() {
        this.animationQueue = [];
        this.isAnimating = false;
    }

    // Animazione Danno
    async animateDamage(target, amount, isCritical = false) {
        const targetElement = target === 'player' ? 
            document.querySelector('.player .character-card') : 
            document.querySelector('.monster .character-card');
        
        if (!targetElement) return;

        // Shake effect
        targetElement.style.animation = 'none';
        setTimeout(() => {
            targetElement.style.animation = isCritical ? 'criticalDamage 0.5s ease' : 'damage 0.3s ease';
        }, 10);

        // Damage numbers
        this.showDamageNumber(targetElement, amount, isCritical);
        
        // Screen flash
        if (isCritical) {
            this.screenFlash('#ff0000');
        }

        await this.wait(500);
    }

    // Animazione Guarigione
    async animateHeal(target, amount) {
        const targetElement = target === 'player' ? 
            document.querySelector('.player .character-card') : 
            document.querySelector('.monster .character-card');
        
        if (!targetElement) return;

        // Green glow effect
        targetElement.style.boxShadow = '0 0 30px rgba(76, 175, 80, 0.8)';
        
        // Healing numbers
        this.showHealNumber(targetElement, amount);

        await this.wait(500);
        targetElement.style.boxShadow = '';
    }

    // Animazione Blocco
    async animateBlock(target, amount) {
        const targetElement = target === 'player' ? 
            document.querySelector('.player .character-card') : 
            document.querySelector('.monster .character-card');
        
        if (!targetElement) return;

        // Shield effect
        targetElement.style.animation = 'none';
        setTimeout(() => {
            targetElement.style.animation = 'block 0.4s ease';
        }, 10);

        // Block numbers
        this.showBlockNumber(targetElement, amount);

        await this.wait(400);
    }

    // Animazione Carta Giocata
    async animateCardPlay(cardElement) {
        if (!cardElement) return;

        // Scale up and fade
        cardElement.style.transition = 'all 0.3s ease';
        cardElement.style.transform = 'scale(1.2) translateY(-20px)';
        cardElement.style.opacity = '0.8';

        await this.wait(300);
        
        // Remove card
        cardElement.style.transform = 'scale(0)';
        cardElement.style.opacity = '0';
        
        await this.wait(200);
    }

    // Animazione Vittoria
    async animateVictory() {
        const monsterElement = document.querySelector('.monster .character-card');
        if (!monsterElement) return;

        // Monster defeat animation
        monsterElement.style.animation = 'defeat 1s ease forwards';
        
        // Victory effects
        this.createVictoryParticles();
        this.screenFlash('#4caf50');

        await this.wait(1000);
    }

    // Animazione Sconfitta
    async animateDefeat() {
        const playerElement = document.querySelector('.player .character-card');
        if (!playerElement) return;

        // Player defeat animation
        playerElement.style.animation = 'defeat 1s ease forwards';
        
        // Defeat effects
        this.screenFlash('#f44336');

        await this.wait(1000);
    }

    // Numeri Danno
    showDamageNumber(targetElement, amount, isCritical = false) {
        const damageNumber = document.createElement('div');
        damageNumber.className = 'damage-number';
        if (isCritical) {
            damageNumber.classList.add('critical');
        }
        damageNumber.textContent = `-${amount}`;
        
        const rect = targetElement.getBoundingClientRect();
        damageNumber.style.left = `${rect.left + rect.width / 2}px`;
        damageNumber.style.top = `${rect.top}px`;
        
        document.body.appendChild(damageNumber);
        
        // Animate number
        setTimeout(() => {
            damageNumber.style.transition = 'all 1s ease';
            damageNumber.style.transform = 'translateY(-50px)';
            damageNumber.style.opacity = '0';
        }, 10);
        
        setTimeout(() => {
            document.body.removeChild(damageNumber);
        }, 1000);
    }

    // Numeri Guarigione
    showHealNumber(targetElement, amount) {
        const healNumber = document.createElement('div');
        healNumber.className = 'heal-number';
        healNumber.textContent = `+${amount}`;
        
        const rect = targetElement.getBoundingClientRect();
        healNumber.style.left = `${rect.left + rect.width / 2}px`;
        healNumber.style.top = `${rect.top}px`;
        
        document.body.appendChild(healNumber);
        
        // Animate number
        setTimeout(() => {
            healNumber.style.transition = 'all 1s ease';
            healNumber.style.transform = 'translateY(-50px)';
            healNumber.style.opacity = '0';
        }, 10);
        
        setTimeout(() => {
            document.body.removeChild(healNumber);
        }, 1000);
    }

    // Numeri Blocco
    showBlockNumber(targetElement, amount) {
        const blockNumber = document.createElement('div');
        blockNumber.className = 'block-number';
        blockNumber.textContent = `+${amount} Block`;
        
        const rect = targetElement.getBoundingClientRect();
        blockNumber.style.left = `${rect.left + rect.width / 2}px`;
        blockNumber.style.top = `${rect.top}px`;
        
        document.body.appendChild(blockNumber);
        
        // Animate number
        setTimeout(() => {
            blockNumber.style.transition = 'all 1s ease';
            blockNumber.style.transform = 'translateY(-50px)';
            blockNumber.style.opacity = '0';
        }, 10);
        
        setTimeout(() => {
            document.body.removeChild(blockNumber);
        }, 1000);
    }

    // Screen Flash
    screenFlash(color = '#ffffff') {
        const flash = document.createElement('div');
        flash.className = 'screen-flash';
        flash.style.background = color;
        
        document.body.appendChild(flash);
        
        setTimeout(() => {
            flash.style.opacity = '0.3';
        }, 10);
        
        setTimeout(() => {
            flash.style.opacity = '0';
        }, 100);
        
        setTimeout(() => {
            document.body.removeChild(flash);
        }, 200);
    }

    // Particelle Vittoria
    createVictoryParticles() {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.createParticle();
            }, i * 50);
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'victory-particle';
        particle.textContent = ['⭐', '✨', '🌟', '💫'][Math.floor(Math.random() * 4)];
        
        particle.style.left = `${Math.random() * window.innerWidth}px`;
        particle.style.top = `${window.innerHeight}px`;
        
        document.body.appendChild(particle);
        
        // Animate particle
        setTimeout(() => {
            particle.style.transition = 'all 2s ease';
            particle.style.transform = `translateY(-${window.innerHeight + 100}px) rotate(${Math.random() * 360}deg)`;
            particle.style.opacity = '0';
        }, 10);
        
        setTimeout(() => {
            document.body.removeChild(particle);
        }, 2000);
    }

    // Animazione Mappa
    async animateMapNodeSelection(nodeElement) {
        nodeElement.style.animation = 'none';
        setTimeout(() => {
            nodeElement.style.animation = 'nodeSelect 0.5s ease';
        }, 10);
        
        await this.wait(500);
    }

    async animateMapNodeCompletion(nodeElement) {
        nodeElement.style.animation = 'none';
        setTimeout(() => {
            nodeElement.style.animation = 'nodeComplete 0.8s ease';
        }, 10);
        
        await this.wait(800);
    }

    // Animazione Energia
    async animateEnergyChange(amount, isGain = true) {
        const energyBar = document.getElementById('playerEnergy');
        if (!energyBar) return;

        energyBar.style.transition = 'all 0.5s ease';
        
        if (isGain) {
            energyBar.style.boxShadow = '0 0 20px rgba(33, 150, 243, 0.8)';
        } else {
            energyBar.style.boxShadow = '0 0 20px rgba(244, 67, 54, 0.8)';
        }
        
        await this.wait(500);
        energyBar.style.boxShadow = '';
    }

    // Animazione Salute
    async animateHealthChange(target, amount, isDamage = true) {
        const healthBar = target === 'player' ? 
            document.getElementById('playerHealth') : 
            document.getElementById('monsterHealth');
        
        if (!healthBar) return;

        healthBar.style.transition = 'all 0.5s ease';
        
        if (isDamage) {
            healthBar.style.boxShadow = '0 0 20px rgba(244, 67, 54, 0.8)';
        } else {
            healthBar.style.boxShadow = '0 0 20px rgba(76, 175, 80, 0.8)';
        }
        
        await this.wait(500);
        healthBar.style.boxShadow = '';
    }

    // Animazione Transizione Schermate
    async animateScreenTransition(fromScreen, toScreen) {
        const from = document.getElementById(fromScreen);
        const to = document.getElementById(toScreen);
        
        if (!from || !to) return;

        // Fade out
        from.style.transition = 'opacity 0.3s ease';
        from.style.opacity = '0';
        
        await this.wait(300);
        
        // Switch screens
        from.style.display = 'none';
        to.style.display = 'flex';
        
        // Fade in
        to.style.opacity = '0';
        setTimeout(() => {
            to.style.transition = 'opacity 0.3s ease';
            to.style.opacity = '1';
        }, 10);
        
        await this.wait(300);
    }

    // Wait utility
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Istanza globale delle animazioni
const battleAnimations = new BattleAnimations();

// CSS Animations (injected dynamically)
const animationCSS = `
@keyframes damage {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
}

@keyframes criticalDamage {
    0%, 100% { transform: translateX(0) scale(1); }
    25% { transform: translateX(-15px) scale(1.05); }
    75% { transform: translateX(15px) scale(1.05); }
}

@keyframes block {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

@keyframes defeat {
    0% { transform: scale(1) rotate(0deg); opacity: 1; }
    50% { transform: scale(1.2) rotate(10deg); opacity: 0.8; }
    100% { transform: scale(0) rotate(90deg); opacity: 0; }
}

@keyframes nodeSelect {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
}

@keyframes nodeComplete {
    0% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.2) rotate(180deg); }
    100% { transform: scale(1) rotate(360deg); }
}

.damage-number {
    position: fixed;
    font-size: 2rem;
    font-weight: bold;
    color: #f44336;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
    z-index: 1000;
    pointer-events: none;
    animation: damageFloat 1s ease forwards;
}

.damage-number.critical {
    font-size: 3rem;
    color: #ff0000;
    text-shadow: 0 0 10px rgba(255,0,0,0.8);
}

.heal-number {
    position: fixed;
    font-size: 2rem;
    font-weight: bold;
    color: #4caf50;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
    z-index: 1000;
    pointer-events: none;
    animation: healFloat 1s ease forwards;
}

.block-number {
    position: fixed;
    font-size: 1.5rem;
    font-weight: bold;
    color: #2196f3;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
    z-index: 1000;
    pointer-events: none;
    animation: blockFloat 1s ease forwards;
}

@keyframes damageFloat {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-50px); opacity: 0; }
}

@keyframes healFloat {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-50px); opacity: 0; }
}

@keyframes blockFloat {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-50px); opacity: 0; }
}

.screen-flash {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    opacity: 0;
    z-index: 999;
    pointer-events: none;
}

.victory-particle {
    position: fixed;
    font-size: 2rem;
    z-index: 998;
    pointer-events: none;
    animation: particleFloat 2s ease forwards;
}

@keyframes particleFloat {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
}
`;

// Inject CSS into page
function injectAnimationCSS() {
    if (!document.getElementById('battle-animations-css')) {
        const style = document.createElement('style');
        style.id = 'battle-animations-css';
        style.textContent = animationCSS;
        document.head.appendChild(style);
    }
}

// Initialize animations when page loads
document.addEventListener('DOMContentLoaded', () => {
    injectAnimationCSS();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BattleAnimations, battleAnimations };
}
