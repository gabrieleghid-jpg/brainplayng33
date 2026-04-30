// Avatar Renderer Module
class AvatarRenderer {
    constructor() {
        this.canvas = null;
        this.currentColors = {
            skin: '#fdbcb4',
            eyes: '#333333',
            hair: '#8b4513',
            shirt: '#4a90e2'
        };
        this.currentStyle = 'short';
        this.accessories = new Set();
        this.init();
    }

    init() {
        this.canvas = document.getElementById('avatarCanvas');
        if (!this.canvas) {
            console.error('Avatar canvas not found');
            return;
        }
    }

    applyColor(type, color) {
        this.currentColors[type] = color;
        this.updateAvatar();
    }

    applyHairStyle(style) {
        this.currentStyle = style;
        this.updateAvatar();
    }

    toggleAccessory(accessory) {
        if (this.accessories.has(accessory)) {
            this.accessories.delete(accessory);
        } else {
            this.accessories.add(accessory);
        }
        this.updateAvatar();
    }

    updateAvatar() {
        if (!this.canvas) return;

        // Update head color
        const head = this.canvas.querySelector('#avatarHead');
        if (head) {
            head.setAttribute('fill', this.currentColors.skin);
        }

        // Update eyes color
        const leftEye = this.canvas.querySelector('#leftEye');
        const rightEye = this.canvas.querySelector('#rightEye');
        if (leftEye) leftEye.setAttribute('fill', this.currentColors.eyes);
        if (rightEye) rightEye.setAttribute('fill', this.currentColors.eyes);

        // Update shirt color
        const shirt = this.canvas.querySelector('#avatarShirt');
        if (shirt) {
            shirt.setAttribute('fill', this.currentColors.shirt);
        }

        // Update hair
        this.updateHair();

        // Update accessories
        this.updateAccessories();
    }

    updateHair() {
        const hairContainer = this.canvas.querySelector('#hairContainer');
        if (!hairContainer) return;

        let hairHTML = '';
        const hairColor = this.currentColors.hair;

        switch(this.currentStyle) {
            case 'short':
                hairHTML = `
                    <path class="hair-base" d="M 35 30 Q 35 20, 50 18 Q 65 20, 65 30 Q 63 25, 50 23 Q 37 25, 35 30" 
                          fill="${hairColor}" stroke="${this.darkenColor(hairColor, 20)}" stroke-width="1"/>
                `;
                break;
            case 'long':
                hairHTML = `
                    <path class="hair-base" d="M 30 30 Q 30 15, 50 13 Q 70 15, 70 30 Q 68 25, 50 23 Q 32 25, 30 30" 
                          fill="${hairColor}" stroke="${this.darkenColor(hairColor, 20)}" stroke-width="1"/>
                    <path class="hair-style" d="M 30 30 Q 25 45, 30 60 Q 35 55, 50 58 Q 65 55, 70 60 Q 75 45, 70 30" 
                          fill="${hairColor}" stroke="${this.darkenColor(hairColor, 20)}" stroke-width="1"/>
                `;
                break;
            case 'spiky':
                hairHTML = `
                    <path class="hair-base" d="M 35 30 Q 35 20, 50 18 Q 65 20, 65 30 Q 63 25, 50 23 Q 37 25, 35 30" 
                          fill="${hairColor}" stroke="${this.darkenColor(hairColor, 20)}" stroke-width="1"/>
                    <path class="hair-style" d="M 32 25 L 30 15" stroke="${hairColor}" stroke-width="3"/>
                    <path class="hair-style" d="M 40 22 L 38 12" stroke="${hairColor}" stroke-width="3"/>
                    <path class="hair-style" d="M 50 20 L 50 10" stroke="${hairColor}" stroke-width="3"/>
                    <path class="hair-style" d="M 60 22 L 62 12" stroke="${hairColor}" stroke-width="3"/>
                    <path class="hair-style" d="M 68 25 L 70 15" stroke="${hairColor}" stroke-width="3"/>
                `;
                break;
            case 'curly':
                hairHTML = `
                    <path class="hair-base" d="M 30 30 Q 30 15, 50 13 Q 70 15, 70 30 Q 68 25, 50 23 Q 32 25, 30 30" 
                          fill="${hairColor}" stroke="${this.darkenColor(hairColor, 20)}" stroke-width="1"/>
                    <circle class="hair-style" cx="35" cy="20" r="4" fill="${hairColor}"/>
                    <circle class="hair-style" cx="45" cy="18" r="3" fill="${hairColor}"/>
                    <circle class="hair-style" cx="55" cy="18" r="3" fill="${hairColor}"/>
                    <circle class="hair-style" cx="65" cy="20" r="4" fill="${hairColor}"/>
                    <circle class="hair-style" cx="40" cy="25" r="3" fill="${hairColor}"/>
                    <circle class="hair-style" cx="60" cy="25" r="3" fill="${hairColor}"/>
                `;
                break;
            case 'bald':
                hairHTML = '';
                break;
        }
        
        hairContainer.innerHTML = hairHTML;
    }

    updateAccessories() {
        const accessoriesContainer = this.canvas.querySelector('#accessoriesContainer');
        if (!accessoriesContainer) return;

        let accessoriesHTML = '';

        this.accessories.forEach(accessory => {
            switch(accessory) {
                case 'glasses':
                    accessoriesHTML += `
                        <circle cx="42" cy="38" r="6" fill="none" stroke="#333" stroke-width="1"/>
                        <circle cx="58" cy="38" r="6" fill="none" stroke="#333" stroke-width="1"/>
                        <line x1="48" y1="38" x2="52" y2="38" stroke="#333" stroke-width="1"/>
                    `;
                    break;
                case 'hat':
                    accessoriesHTML += `
                        <path d="M 25 25 Q 50 15, 75 25 L 70 35 Q 50 30, 30 35 Z" 
                              fill="#4a4a4a" stroke="#333" stroke-width="1"/>
                    `;
                    break;
                case 'crown':
                    accessoriesHTML += `
                        <path d="M 30 25 L 35 15 L 40 20 L 45 12 L 50 20 L 55 12 L 60 20 L 65 15 L 70 25 L 65 30 L 35 30 Z" 
                              fill="#ffd700" stroke="#333" stroke-width="1"/>
                    `;
                    break;
                case 'headband':
                    accessoriesHTML += `
                        <rect x="25" y="32" width="50" height="4" fill="#ff6b6b" rx="2"/>
                    `;
                    break;
            }
        });

        accessoriesContainer.innerHTML = accessoriesHTML;
    }

    randomize() {
        const colors = {
            skin: ['#fdbcb4', '#f8a5a2', '#d4a574', '#8d5524', '#ffe0bd'],
            eyes: ['#333333', '#4169e1', '#228b22', '#8b4513', '#808080'],
            hair: ['#8b4513', '#000000', '#ffd700', '#ff6b6b', '#4169e1'],
            shirt: ['#4a90e2', '#27ae60', '#e74c3c', '#9b59b6']
        };

        const styles = ['short', 'long', 'spiky', 'curly', 'bald'];
        const accessoryOptions = ['glasses', 'hat', 'crown', 'headband'];

        // Random colors
        Object.keys(colors).forEach(type => {
            const randomColor = colors[type][Math.floor(Math.random() * colors[type].length)];
            this.currentColors[type] = randomColor;
        });

        // Random style
        this.currentStyle = styles[Math.floor(Math.random() * styles.length)];

        // Random accessories
        this.accessories.clear();
        const numAccessories = Math.floor(Math.random() * 3);
        for (let i = 0; i < numAccessories; i++) {
            const randomAccessory = accessoryOptions[Math.floor(Math.random() * accessoryOptions.length)];
            this.accessories.add(randomAccessory);
        }

        this.updateAvatar();
        return this.getAvatarData();
    }

    reset() {
        this.currentColors = {
            skin: '#fdbcb4',
            eyes: '#333333',
            hair: '#8b4513',
            shirt: '#4a90e2'
        };
        this.currentStyle = 'short';
        this.accessories.clear();
        this.updateAvatar();
    }

    getAvatarData() {
        return {
            colors: { ...this.currentColors },
            style: this.currentStyle,
            accessories: Array.from(this.accessories)
        };
    }

    loadAvatarData(data) {
        if (data.colors) {
            this.currentColors = { ...this.currentColors, ...data.colors };
        }
        if (data.style) {
            this.currentStyle = data.style;
        }
        if (data.accessories) {
            this.accessories = new Set(data.accessories);
        }
        this.updateAvatar();
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    }

    exportSVG() {
        if (!this.canvas) return null;
        return new XMLSerializer().serializeToString(this.canvas);
    }
}

// Export for global use
window.AvatarRenderer = AvatarRenderer;
