// Sistema Avatar Animato Lottie per BrainPlayng
class AnimatedAvatarSystem {
    constructor() {
        this.lottieAnimations = {};
        this.currentAnimation = 'idle';
        this.avatarContainer = null;
        this.isInitialized = false;
        
        // Dati animazioni Lottie (create per simulare l'avatar basato sull'immagine)
        this.animationData = {
            idle: this.createIdleAnimation(),
            wave: this.createWaveAnimation(),
            blink: this.createBlinkAnimation(),
            happy: this.createHappyAnimation()
        };
        
        this.init();
    }

    init() {
        this.createAvatarContainer();
        this.setupEventListeners();
        this.startIdleAnimation();
    }

    hasLottie() {
        return typeof window.lottie !== 'undefined' && typeof window.lottie.loadAnimation === 'function';
    }

    createAvatarContainer() {
        // Trova o crea il contenitore per l'avatar
        this.avatarContainer = document.querySelector('.avatar-base') || 
                              document.getElementById('avatarDisplay') ||
                              document.getElementById('navAvatar');
        
        if (this.avatarContainer) {
            // Svuota il contenitore e prepara per Lottie
            this.avatarContainer.innerHTML = '';
            this.avatarContainer.style.position = 'relative';
            this.avatarContainer.style.overflow = 'visible';
        }
    }

    createIdleAnimation() {
        // Animazione idle con occhi che lampeggiano
        return {
            "v": "5.12.2",
            "fr": 30,
            "ip": 0,
            "op": 120,
            "w": 120,
            "h": 120,
            "nm": "Idle Avatar",
            "ddd": 0,
            "assets": [],
            "layers": [
                {
                    "ddd": 0,
                    "ind": 1,
                    "ty": 4,
                    "nm": "Body",
                    "sr": 1,
                    "ks": {
                        "o": {"a": 0, "k": 100},
                        "r": {"a": 0, "k": 0},
                        "p": {"a": 0, "k": [60, 60]},
                        "s": {"a": 0, "k": [100, 100]}
                    },
                    "shapes": [
                        {
                            "ty": "rc",
                            "d": 1,
                            "s": {"a": 0, "k": [80, 80]},
                            "p": {"a": 0, "k": [0, 0]},
                            "r": {"a": 0, "k": 20},
                            "nm": "Body Shape",
                            "fill": {
                                "ty": "fl",
                                "c": {"a": 0, "k": [0.3, 0.5, 0.9, 1]}
                            }
                        }
                    ]
                },
                {
                    "ddd": 0,
                    "ind": 2,
                    "ty": 4,
                    "nm": "Left Eye",
                    "sr": 1,
                    "ks": {
                        "o": {"a": 1, "k": [
                            {"t": 0, "s": [100]},
                            {"t": 50, "s": [0]},
                            {"t": 55, "s": [100]},
                            {"t": 120, "s": [100]}
                        ]},
                        "r": {"a": 0, "k": 0},
                        "p": {"a": 0, "k": [45, 45]},
                        "s": {"a": 0, "k": [100, 100]}
                    },
                    "shapes": [
                        {
                            "ty": "el",
                            "d": 1,
                            "s": {"a": 0, "k": [12, 8]},
                            "p": {"a": 0, "k": [0, 0]},
                            "nm": "Eye Shape",
                            "fill": {
                                "ty": "fl",
                                "c": {"a": 0, "k": [0, 0, 0, 1]}
                            }
                        }
                    ]
                },
                {
                    "ddd": 0,
                    "ind": 3,
                    "ty": 4,
                    "nm": "Right Eye",
                    "sr": 1,
                    "ks": {
                        "o": {"a": 1, "k": [
                            {"t": 0, "s": [100]},
                            {"t": 50, "s": [0]},
                            {"t": 55, "s": [100]},
                            {"t": 120, "s": [100]}
                        ]},
                        "r": {"a": 0, "k": 0},
                        "p": {"a": 0, "k": [75, 45]},
                        "s": {"a": 0, "k": [100, 100]}
                    },
                    "shapes": [
                        {
                            "ty": "el",
                            "d": 1,
                            "s": {"a": 0, "k": [12, 8]},
                            "p": {"a": 0, "k": [0, 0]},
                            "nm": "Eye Shape",
                            "fill": {
                                "ty": "fl",
                                "c": {"a": 0, "k": [0, 0, 0, 1]}
                            }
                        }
                    ]
                },
                {
                    "ddd": 0,
                    "ind": 4,
                    "ty": 4,
                    "nm": "Mouth",
                    "sr": 1,
                    "ks": {
                        "o": {"a": 0, "k": 100},
                        "r": {"a": 0, "k": 0},
                        "p": {"a": 0, "k": [60, 75]},
                        "s": {"a": 0, "k": [100, 100]}
                    },
                    "shapes": [
                        {
                            "ty": "rc",
                            "d": 1,
                            "s": {"a": 0, "k": [20, 8]},
                            "p": {"a": 0, "k": [0, 0]},
                            "r": {"a": 0, "k": 4},
                            "nm": "Mouth Shape",
                            "fill": {
                                "ty": "fl",
                                "c": {"a": 0, "k": [0.2, 0.3, 0.6, 1]}
                            }
                        }
                    ]
                }
            ]
        };
    }

    createWaveAnimation() {
        // Animazione di saluto
        return {
            "v": "5.12.2",
            "fr": 30,
            "ip": 0,
            "op": 60,
            "w": 120,
            "h": 120,
            "nm": "Wave Avatar",
            "ddd": 0,
            "assets": [],
            "layers": [
                {
                    "ddd": 0,
                    "ind": 1,
                    "ty": 4,
                    "nm": "Body",
                    "sr": 1,
                    "ks": {
                        "o": {"a": 0, "k": 100},
                        "r": {"a": 0, "k": 0},
                        "p": {"a": 0, "k": [60, 60]},
                        "s": {"a": 0, "k": [100, 100]}
                    },
                    "shapes": [
                        {
                            "ty": "rc",
                            "d": 1,
                            "s": {"a": 0, "k": [80, 80]},
                            "p": {"a": 0, "k": [0, 0]},
                            "r": {"a": 0, "k": 20},
                            "nm": "Body Shape",
                            "fill": {
                                "ty": "fl",
                                "c": {"a": 0, "k": [0.3, 0.5, 0.9, 1]}
                            }
                        }
                    ]
                },
                {
                    "ddd": 0,
                    "ind": 2,
                    "ty": 4,
                    "nm": "Left Eye",
                    "sr": 1,
                    "ks": {
                        "o": {"a": 0, "k": 100},
                        "r": {"a": 0, "k": 0},
                        "p": {"a": 0, "k": [45, 45]},
                        "s": {"a": 0, "k": [100, 100]}
                    },
                    "shapes": [
                        {
                            "ty": "el",
                            "d": 1,
                            "s": {"a": 0, "k": [12, 8]},
                            "p": {"a": 0, "k": [0, 0]},
                            "nm": "Eye Shape",
                            "fill": {
                                "ty": "fl",
                                "c": {"a": 0, "k": [0, 0, 0, 1]}
                            }
                        }
                    ]
                },
                {
                    "ddd": 0,
                    "ind": 3,
                    "ty": 4,
                    "nm": "Right Eye",
                    "sr": 1,
                    "ks": {
                        "o": {"a": 0, "k": 100},
                        "r": {"a": 0, "k": 0},
                        "p": {"a": 0, "k": [75, 45]},
                        "s": {"a": 0, "k": [100, 100]}
                    },
                    "shapes": [
                        {
                            "ty": "el",
                            "d": 1,
                            "s": {"a": 0, "k": [12, 8]},
                            "p": {"a": 0, "k": [0, 0]},
                            "nm": "Eye Shape",
                            "fill": {
                                "ty": "fl",
                                "c": {"a": 0, "k": [0, 0, 0, 1]}
                            }
                        }
                    ]
                },
                {
                    "ddd": 0,
                    "ind": 4,
                    "ty": 4,
                    "nm": "Mouth",
                    "sr": 1,
                    "ks": {
                        "o": {"a": 0, "k": 100},
                        "r": {"a": 0, "k": 0},
                        "p": {"a": 0, "k": [60, 75]},
                        "s": {"a": 0, "k": [100, 100]}
                    },
                    "shapes": [
                        {
                            "ty": "rc",
                            "d": 1,
                            "s": {"a": 0, "k": [25, 10]},
                            "p": {"a": 0, "k": [0, 0]},
                            "r": {"a": 0, "k": 5},
                            "nm": "Mouth Shape",
                            "fill": {
                                "ty": "fl",
                                "c": {"a": 0, "k": [0.2, 0.3, 0.6, 1]}
                            }
                        }
                    ]
                },
                {
                    "ddd": 0,
                    "ind": 5,
                    "ty": 4,
                    "nm": "Right Arm",
                    "sr": 1,
                    "ks": {
                        "o": {"a": 0, "k": 100},
                        "r": {"a": 1, "k": [
                            {"t": 0, "s": [0]},
                            {"t": 15, "s": [-30]},
                            {"t": 30, "s": [30]},
                            {"t": 45, "s": [-30]},
                            {"t": 60, "s": [0]}
                        ]},
                        "p": {"a": 0, "k": [90, 60]},
                        "s": {"a": 0, "k": [100, 100]}
                    },
                    "shapes": [
                        {
                            "ty": "rc",
                            "d": 1,
                            "s": {"a": 0, "k": [30, 15]},
                            "p": {"a": 0, "k": [0, 0]},
                            "r": {"a": 0, "k": 8},
                            "nm": "Arm Shape",
                            "fill": {
                                "ty": "fl",
                                "c": {"a": 0, "k": [0.3, 0.5, 0.9, 1]}
                            }
                        }
                    ]
                }
            ]
        };
    }

    createBlinkAnimation() {
        // Animazione di battito di ciglia veloce
        return {
            "v": "5.12.2",
            "fr": 30,
            "ip": 0,
            "op": 15,
            "w": 120,
            "h": 120,
            "nm": "Blink Avatar",
            "ddd": 0,
            "assets": [],
            "layers": [
                {
                    "ddd": 0,
                    "ind": 1,
                    "ty": 4,
                    "nm": "Body",
                    "sr": 1,
                    "ks": {
                        "o": {"a": 0, "k": 100},
                        "r": {"a": 0, "k": 0},
                        "p": {"a": 0, "k": [60, 60]},
                        "s": {"a": 0, "k": [100, 100]}
                    },
                    "shapes": [
                        {
                            "ty": "rc",
                            "d": 1,
                            "s": {"a": 0, "k": [80, 80]},
                            "p": {"a": 0, "k": [0, 0]},
                            "r": {"a": 0, "k": 20},
                            "nm": "Body Shape",
                            "fill": {
                                "ty": "fl",
                                "c": {"a": 0, "k": [0.3, 0.5, 0.9, 1]}
                            }
                        }
                    ]
                },
                {
                    "ddd": 0,
                    "ind": 2,
                    "ty": 4,
                    "nm": "Left Eye",
                    "sr": 1,
                    "ks": {
                        "o": {"a": 1, "k": [
                            {"t": 0, "s": [100]},
                            {"t": 2, "s": [0]},
                            {"t": 4, "s": [100]},
                            {"t": 15, "s": [100]}
                        ]},
                        "r": {"a": 0, "k": 0},
                        "p": {"a": 0, "k": [45, 45]},
                        "s": {"a": 0, "k": [100, 100]}
                    },
                    "shapes": [
                        {
                            "ty": "el",
                            "d": 1,
                            "s": {"a": 0, "k": [12, 8]},
                            "p": {"a": 0, "k": [0, 0]},
                            "nm": "Eye Shape",
                            "fill": {
                                "ty": "fl",
                                "c": {"a": 0, "k": [0, 0, 0, 1]}
                            }
                        }
                    ]
                },
                {
                    "ddd": 0,
                    "ind": 3,
                    "ty": 4,
                    "nm": "Right Eye",
                    "sr": 1,
                    "ks": {
                        "o": {"a": 1, "k": [
                            {"t": 0, "s": [100]},
                            {"t": 2, "s": [0]},
                            {"t": 4, "s": [100]},
                            {"t": 15, "s": [100]}
                        ]},
                        "r": {"a": 0, "k": 0},
                        "p": {"a": 0, "k": [75, 45]},
                        "s": {"a": 0, "k": [100, 100]}
                    },
                    "shapes": [
                        {
                            "ty": "el",
                            "d": 1,
                            "s": {"a": 0, "k": [12, 8]},
                            "p": {"a": 0, "k": [0, 0]},
                            "nm": "Eye Shape",
                            "fill": {
                                "ty": "fl",
                                "c": {"a": 0, "k": [0, 0, 0, 1]}
                            }
                        }
                    ]
                },
                {
                    "ddd": 0,
                    "ind": 4,
                    "ty": 4,
                    "nm": "Mouth",
                    "sr": 1,
                    "ks": {
                        "o": {"a": 0, "k": 100},
                        "r": {"a": 0, "k": 0},
                        "p": {"a": 0, "k": [60, 75]},
                        "s": {"a": 0, "k": [100, 100]}
                    },
                    "shapes": [
                        {
                            "ty": "rc",
                            "d": 1,
                            "s": {"a": 0, "k": [20, 8]},
                            "p": {"a": 0, "k": [0, 0]},
                            "r": {"a": 0, "k": 4},
                            "nm": "Mouth Shape",
                            "fill": {
                                "ty": "fl",
                                "c": {"a": 0, "k": [0.2, 0.3, 0.6, 1]}
                            }
                        }
                    ]
                }
            ]
        };
    }

    createHappyAnimation() {
        // Animazione felice
        return {
            "v": "5.12.2",
            "fr": 30,
            "ip": 0,
            "op": 45,
            "w": 120,
            "h": 120,
            "nm": "Happy Avatar",
            "ddd": 0,
            "assets": [],
            "layers": [
                {
                    "ddd": 0,
                    "ind": 1,
                    "ty": 4,
                    "nm": "Body",
                    "sr": 1,
                    "ks": {
                        "o": {"a": 0, "k": 100},
                        "r": {"a": 1, "k": [
                            {"t": 0, "s": [0]},
                            {"t": 22, "s": [5]},
                            {"t": 45, "s": [0]}
                        ]},
                        "p": {"a": 0, "k": [60, 60]},
                        "s": {"a": 0, "k": [100, 100]}
                    },
                    "shapes": [
                        {
                            "ty": "rc",
                            "d": 1,
                            "s": {"a": 0, "k": [80, 80]},
                            "p": {"a": 0, "k": [0, 0]},
                            "r": {"a": 0, "k": 20},
                            "nm": "Body Shape",
                            "fill": {
                                "ty": "fl",
                                "c": {"a": 0, "k": [0.3, 0.5, 0.9, 1]}
                            }
                        }
                    ]
                },
                {
                    "ddd": 0,
                    "ind": 2,
                    "ty": 4,
                    "nm": "Left Eye",
                    "sr": 1,
                    "ks": {
                        "o": {"a": 0, "k": 100},
                        "r": {"a": 0, "k": 0},
                        "p": {"a": 0, "k": [45, 45]},
                        "s": {"a": 0, "k": [100, 100]}
                    },
                    "shapes": [
                        {
                            "ty": "el",
                            "d": 1,
                            "s": {"a": 0, "k": [12, 8]},
                            "p": {"a": 0, "k": [0, 0]},
                            "nm": "Eye Shape",
                            "fill": {
                                "ty": "fl",
                                "c": {"a": 0, "k": [0, 0, 0, 1]}
                            }
                        }
                    ]
                },
                {
                    "ddd": 0,
                    "ind": 3,
                    "ty": 4,
                    "nm": "Right Eye",
                    "sr": 1,
                    "ks": {
                        "o": {"a": 0, "k": 100},
                        "r": {"a": 0, "k": 0},
                        "p": {"a": 0, "k": [75, 45]},
                        "s": {"a": 0, "k": [100, 100]}
                    },
                    "shapes": [
                        {
                            "ty": "el",
                            "d": 1,
                            "s": {"a": 0, "k": [12, 8]},
                            "p": {"a": 0, "k": [0, 0]},
                            "nm": "Eye Shape",
                            "fill": {
                                "ty": "fl",
                                "c": {"a": 0, "k": [0, 0, 0, 1]}
                            }
                        }
                    ]
                },
                {
                    "ddd": 0,
                    "ind": 4,
                    "ty": 4,
                    "nm": "Mouth",
                    "sr": 1,
                    "ks": {
                        "o": {"a": 0, "k": 100},
                        "r": {"a": 0, "k": 0},
                        "p": {"a": 0, "k": [60, 75]},
                        "s": {"a": 0, "k": [100, 100]}
                    },
                    "shapes": [
                        {
                            "ty": "rc",
                            "d": 1,
                            "s": {"a": 1, "k": [
                            {"t": 0, "s": [20, 8]},
                            {"t": 22, "s": [30, 15]},
                            {"t": 45, "s": [20, 8]}
                        ]},
                            "p": {"a": 0, "k": [0, 0]},
                            "r": {"a": 0, "k": 8},
                            "nm": "Mouth Shape",
                            "fill": {
                                "ty": "fl",
                                "c": {"a": 0, "k": [0.2, 0.3, 0.6, 1]}
                            }
                        }
                    ]
                }
            ]
        };
    }

    setupEventListeners() {
        // Eventi mouse per interazioni
        if (this.avatarContainer) {
            this.avatarContainer.addEventListener('mouseenter', () => {
                this.playAnimation('wave');
            });

            this.avatarContainer.addEventListener('click', () => {
                this.playAnimation('happy');
            });

            this.avatarContainer.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    this.playAnimation('idle');
                }, 2000);
            });
        }

        // Eventi di crescita mascotte
        document.addEventListener('mascotteGrowth', (event) => {
            this.playAnimation('happy');
        });

        // Eventi crediti
        document.addEventListener('creditsEarned', (event) => {
            this.playAnimation('happy');
        });
    }

    startIdleAnimation() {
        if (!this.avatarContainer) return;
        if (!this.hasLottie()) {
            this.avatarContainer.textContent = 'BP';
            this.avatarContainer.style.display = 'grid';
            this.avatarContainer.style.placeItems = 'center';
            this.isInitialized = true;
            return;
        }
        
        // Crea l'elemento Lottie per l'animazione idle
        const lottieElement = document.createElement('div');
        lottieElement.style.width = '100%';
        lottieElement.style.height = '100%';
        lottieElement.style.position = 'absolute';
        lottieElement.style.top = '0';
        lottieElement.style.left = '0';
        
        this.avatarContainer.appendChild(lottieElement);
        
        // Carica l'animazione
        this.lottieAnimations.idle = lottie.loadAnimation({
            container: lottieElement,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: this.animationData.idle
        });

        this.currentAnimation = 'idle';
        this.isInitialized = true;
    }

    playAnimation(animationName) {
        if (!this.isInitialized || !this.avatarContainer) return;
        if (!this.hasLottie()) return;

        // Se l'animazione è già in esecuzione, non fare nulla
        if (this.currentAnimation === animationName && animationName === 'idle') {
            return;
        }

        // Ferma l'animazione corrente
        if (this.lottieAnimations[this.currentAnimation]) {
            this.lottieAnimations[this.currentAnimation].stop();
        }

        // Svuota il contenitore
        this.avatarContainer.innerHTML = '';

        // Crea nuovo elemento Lottie
        const lottieElement = document.createElement('div');
        lottieElement.style.width = '100%';
        lottieElement.style.height = '100%';
        lottieElement.style.position = 'absolute';
        lottieElement.style.top = '0';
        lottieElement.style.left = '0';
        
        this.avatarContainer.appendChild(lottieElement);

        // Carica la nuova animazione
        const animationData = this.animationData[animationName];
        const loop = animationName === 'idle';
        
        this.lottieAnimations[animationName] = lottie.loadAnimation({
            container: lottieElement,
            renderer: 'svg',
            loop: loop,
            autoplay: true,
            animationData: animationData
        });

        this.currentAnimation = animationName;

        // Per animazioni non-idle, torna all'idle dopo un po'
        if (animationName !== 'idle') {
            setTimeout(() => {
                this.playAnimation('idle');
            }, animationName === 'wave' ? 2000 : 1500);
        }
    }

    // Metodo per aggiornare i colori basati sul livello della mascotte
    updateColors(levelInfo) {
        if (!this.isInitialized) return;

        // Aggiorna i colori delle animazioni basati sul livello
        const color = levelInfo.color || '#4f46e5';
        
        // Converti hex a RGB per Lottie
        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? [
                parseInt(result[1], 16) / 255,
                parseInt(result[2], 16) / 255,
                parseInt(result[3], 16) / 255,
                1
            ] : [0.3, 0.5, 0.9, 1];
        };

        const rgbColor = hexToRgb(color);

        // Aggiorna i colori in tutte le animazioni
        Object.keys(this.animationData).forEach(key => {
            const animation = this.animationData[key];
            if (animation.layers) {
                animation.layers.forEach(layer => {
                    if (layer.shapes && layer.shapes[0] && layer.shapes[0].fill) {
                        layer.shapes[0].fill.c.k = rgbColor;
                    }
                });
            }
        });

        // Riavvia l'animazione corrente con i nuovi colori
        const currentAnim = this.currentAnimation;
        this.playAnimation(currentAnim);
    }

    // Metodi per interazioni esterne
    wave() {
        this.playAnimation('wave');
    }

    blink() {
        this.playAnimation('blink');
    }

    happy() {
        this.playAnimation('happy');
    }

    idle() {
        this.playAnimation('idle');
    }
}

// Inizializza il sistema avatar animato
window.animatedAvatar = new AnimatedAvatarSystem();

// Funzioni globali per interazione
window.playAvatarAnimation = function(animationName) {
    if (window.animatedAvatar) {
        window.animatedAvatar.playAnimation(animationName);
    }
};

window.avatarWave = function() {
    if (window.animatedAvatar) {
        window.animatedAvatar.wave();
    }
};

window.avatarHappy = function() {
    if (window.animatedAvatar) {
        window.animatedAvatar.happy();
    }
};

if (!window.animatedAvatar.hasLottie()) {
    console.warn('Lottie non disponibile: avatar animato disattivato.');
} else {
    console.log('Sistema avatar animato caricato!');
}
