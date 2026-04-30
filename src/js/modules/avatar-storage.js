// Avatar Storage Module
class AvatarStorage {
    constructor() {
        this.STORAGE_KEY = 'bp_avatar_data';
        this.GALLERY_KEY = 'bp_avatar_gallery';
        this.init();
    }

    init() {
        // Initialize default gallery if empty
        if (!this.getGallery()) {
            this.initializeDefaultGallery();
        }
    }

    saveAvatarData(avatarData) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(avatarData));
            return true;
        } catch (error) {
            console.error('Error saving avatar data:', error);
            return false;
        }
    }

    loadAvatarData() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Error loading avatar data:', error);
            return null;
        }
    }

    saveToGallery(avatarData, name = 'Avatar Personalizzato') {
        try {
            const gallery = this.getGallery();
            const avatarEntry = {
                id: Date.now().toString(),
                name: name,
                data: avatarData,
                createdAt: new Date().toISOString(),
                type: 'custom'
            };
            
            gallery.push(avatarEntry);
            
            // Keep only last 20 custom avatars
            if (gallery.filter(a => a.type === 'custom').length > 20) {
                const customAvatars = gallery.filter(a => a.type === 'custom');
                const oldestCustom = customAvatars.shift();
                const index = gallery.findIndex(a => a.id === oldestCustom.id);
                if (index !== -1) {
                    gallery.splice(index, 1);
                }
            }
            
            localStorage.setItem(this.GALLERY_KEY, JSON.stringify(gallery));
            return avatarEntry.id;
        } catch (error) {
            console.error('Error saving to gallery:', error);
            return null;
        }
    }

    getGallery() {
        try {
            const saved = localStorage.getItem(this.GALLERY_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading gallery:', error);
            return [];
        }
    }

    getGalleryFiltered(filter = 'all') {
        const gallery = this.getGallery();
        if (filter === 'all') return gallery;
        return gallery.filter(avatar => avatar.type === filter);
    }

    deleteFromGallery(avatarId) {
        try {
            const gallery = this.getGallery();
            const index = gallery.findIndex(avatar => avatar.id === avatarId);
            if (index !== -1) {
                gallery.splice(index, 1);
                localStorage.setItem(this.GALLERY_KEY, JSON.stringify(gallery));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting from gallery:', error);
            return false;
        }
    }

    initializeDefaultGallery() {
        const defaultAvatars = [
            {
                id: 'default-male-1',
                name: 'Studente Classico',
                data: {
                    colors: {
                        skin: '#fdbcb4',
                        eyes: '#333333',
                        hair: '#000000',
                        shirt: '#4a90e2'
                    },
                    style: 'short',
                    accessories: []
                },
                createdAt: new Date().toISOString(),
                type: 'male'
            },
            {
                id: 'default-female-1',
                name: 'Studentessa Classica',
                data: {
                    colors: {
                        skin: '#fdbcb4',
                        eyes: '#4169e1',
                        hair: '#8b4513',
                        shirt: '#e74c3c'
                    },
                    style: 'long',
                    accessories: []
                },
                createdAt: new Date().toISOString(),
                type: 'female'
            },
            {
                id: 'default-cool-1',
                name: 'Ragazzo Cool',
                data: {
                    colors: {
                        skin: '#ffe0bd',
                        eyes: '#333333',
                        hair: '#000000',
                        shirt: '#27ae60'
                    },
                    style: 'spiky',
                    accessories: ['glasses']
                },
                createdAt: new Date().toISOString(),
                type: 'male'
            },
            {
                id: 'default-elegant-1',
                name: 'Professionista',
                data: {
                    colors: {
                        skin: '#f8a5a2',
                        eyes: '#8b4513',
                        hair: '#8d5524',
                        shirt: '#9b59b6'
                    },
                    style: 'short',
                    accessories: ['glasses']
                },
                createdAt: new Date().toISOString(),
                type: 'custom'
            }
        ];

        localStorage.setItem(this.GALLERY_KEY, JSON.stringify(defaultAvatars));
    }

    exportGallery() {
        try {
            const gallery = this.getGallery();
            const dataStr = JSON.stringify(gallery, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `avatar-gallery-${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Error exporting gallery:', error);
            return false;
        }
    }

    importGallery(jsonData) {
        try {
            const importedData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            if (!Array.isArray(importedData)) {
                throw new Error('Invalid gallery data format');
            }

            // Validate and clean imported data
            const validAvatars = importedData.filter(avatar => {
                return avatar.id && avatar.name && avatar.data && 
                       avatar.data.colors && avatar.data.style !== undefined;
            });

            if (validAvatars.length === 0) {
                throw new Error('No valid avatars found in imported data');
            }

            // Merge with existing gallery
            const existingGallery = this.getGallery();
            const mergedGallery = [...existingGallery];
            
            validAvatars.forEach(importedAvatar => {
                // Check for duplicate IDs
                if (!mergedGallery.find(a => a.id === importedAvatar.id)) {
                    importedAvatar.type = 'imported';
                    importedAvatar.createdAt = new Date().toISOString();
                    mergedGallery.push(importedAvatar);
                }
            });

            localStorage.setItem(this.GALLERY_KEY, JSON.stringify(mergedGallery));
            return validAvatars.length;
        } catch (error) {
            console.error('Error importing gallery:', error);
            return 0;
        }
    }

    getStorageStats() {
        try {
            const avatarData = this.loadAvatarData();
            const gallery = this.getGallery();
            
            return {
                hasSavedAvatar: !!avatarData,
                gallerySize: gallery.length,
                customAvatars: gallery.filter(a => a.type === 'custom').length,
                importedAvatars: gallery.filter(a => a.type === 'imported').length,
                lastModified: avatarData ? new Date().toISOString() : null
            };
        } catch (error) {
            console.error('Error getting storage stats:', error);
            return null;
        }
    }

    clearAllData() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            localStorage.removeItem(this.GALLERY_KEY);
            this.initializeDefaultGallery();
            return true;
        } catch (error) {
            console.error('Error clearing avatar data:', error);
            return false;
        }
    }
}

// Export for global use
window.AvatarStorage = AvatarStorage;
