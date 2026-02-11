// ===============================
// VARIÁVEIS GLOBAIS
// ===============================
let musica;
let volumeGlobal = 0.5;

// ===============================
// CENA: MENU PRINCIPAL
// ===============================
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('bg', 'assets/cenario_desfocado.png');
        this.load.image('logo', 'assets/logo_menu2.png');
        this.load.audio('musica', 'assets/musica2.mp3');
    }

    create() {
        const { width, height } = this.scale;

        // Música (loop)
        if (!musica) {
            musica = this.sound.add('musica', {
                loop: true,
                volume: volumeGlobal
            });
            musica.play();
        }

        const bg = this.add.image(width / 2, height / 2, 'bg');
        bg.setDisplaySize(width, height);

        const logo = this.add.image(width / 2, height * 0.25, 'logo');
        logo.setScale(0.6);

        const createButton = (y, text, callback) => {
            return this.add.text(width / 2, y, text, {
                fontFamily: 'Orbitron',
                fontSize: '28px',
                color: '#E6F4FF',
                backgroundColor: '#0B1E3B',
                padding: { x: 50, y: 16 }
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerup', callback);
        };

        createButton(height * 0.5, 'JOGAR', () => {
            this.scene.start('IntroScene');
        });

        createButton(height * 0.62, 'CONFIGURAÇÕES', () => {
            this.scene.start('ConfigScene');
        });

        createButton(height * 0.74, 'CRÉDITOS', () => {
            this.scene.start('CreditsScene');
        });
    }
}

// ===============================
// CENA: CONFIGURAÇÕES
// ===============================
class ConfigScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ConfigScene' });
    }

    create() {
        const { width, height } = this.scale;

        this.add.text(width / 2, height * 0.2, 'VOLUME', {
            fontFamily: 'Orbitron',
            fontSize: '32px',
            color: '#E6F4FF'
        }).setOrigin(0.5);

        this.add.rectangle(width / 2, height * 0.4, 300, 6, 0x444444);

        const bar = this.add.rectangle(
            width / 2 - 150 + volumeGlobal * 300,
            height * 0.4,
            12,
            20,
            0x00ffff
        ).setInteractive({ draggable: true });

        this.input.setDraggable(bar);

        bar.on('drag', (pointer, dragX) => {
            dragX = Phaser.Math.Clamp(dragX, width / 2 - 150, width / 2 + 150);
            bar.x = dragX;

            volumeGlobal = (dragX - (width / 2 - 150)) / 300;
            musica.setVolume(volumeGlobal);
        });

        this.add.text(width / 2, height * 0.7, 'VOLTAR', {
            fontFamily: 'Orbitron',
            fontSize: '26px',
            backgroundColor: '#0B1E3B',
            padding: { x: 30, y: 12 }
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerup', () => this.scene.start('MenuScene'));
    }
}

// ===============================
// CENA: INTRO (VÍDEO)
// ===============================
class IntroScene extends Phaser.Scene {
    constructor() {
        super({ key: 'IntroScene' });
    }

    preload() {
        this.load.video('intro', 'assets/intro.mp4', 'loadeddata', false, true);
    }

    create() {
        const { width, height } = this.scale;

        // PARA a música durante o vídeo
        if (musica && musica.isPlaying) {
            musica.pause();
        }

        const video = this.add.video(width / 2, height / 2, 'intro');
        video.setDisplaySize(width, height);
        video.setOrigin(0.5);
        video.play();

        video.on('complete', () => {
            this.scene.start('GameScene');
        });
    }
}

// ===============================
// CENA: JOGO
// ===============================
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('cenario', 'assets/cenario2.jpeg');
        this.load.image('player', 'assets/boneco1.png');
    }

    create() {
        const { width, height } = this.scale;

        // RETOMA música
        if (musica && musica.isPaused) {
            musica.resume();
        }

        // Mundo grande
        const worldWidth = 3000;
        this.physics.world.setBounds(0, 0, worldWidth, height);

        // Cenário ajustado (sem faixa preta)
        const cenario = this.add.image(0, height / 2, 'cenario')
            .setOrigin(0, 0.5);

        const scale = height / cenario.height;
        cenario.setScale(scale);

        // Player proporcional
        this.player = this.physics.add.sprite(200, height - 180, 'player');
        this.player.setScale(1.4);
        this.player.setGravityY(900);
        this.player.setCollideWorldBounds(true);

        // Chão invisível alinhado ao cenário
        const ground = this.add.rectangle(
            worldWidth / 2,
            height - 60,
            worldWidth,
            120
        );

        this.physics.add.existing(ground, true);
        this.physics.add.collider(this.player, ground);

        // Câmera
        this.cameras.main.setBounds(0, 0, worldWidth, height);
        this.cameras.main.startFollow(this.player);

        // Controles
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');
    }

    update() {
        const speed = 240;

        if (this.cursors.left.isDown || this.keys.A.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown || this.keys.D.isDown) {
            this.player.setVelocityX(speed);
        } else {
            this.player.setVelocityX(0);
        }

        if (
            (this.cursors.up.isDown || this.keys.W.isDown) &&
            this.player.body.touching.down
        ) {
            this.player.setVelocityY(-480);
        }
    }
}

// ===============================
// CENA: CRÉDITOS
// ===============================
class CreditsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CreditsScene' });
    }

    create() {
        const { width, height } = this.scale;

        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

        this.add.text(
            width / 2,
            height * 0.45,
            'CRÉDITOS\n\nThinker Journey\n\nObrigado por jogar!',
            {
                fontFamily: 'Orbitron',
                fontSize: '24px',
                color: '#E6F4FF',
                align: 'center'
            }
        ).setOrigin(0.5);

        this.add.text(width / 2, height * 0.75, 'VOLTAR', {
            fontFamily: 'Orbitron',
            fontSize: '26px',
            backgroundColor: '#0B1E3B',
            padding: { x: 30, y: 12 }
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerup', () => this.scene.start('MenuScene'));
    }
}

// ===============================
// CONFIGURAÇÃO DO JOGO
// ===============================
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth * 0.95,
    height: window.innerHeight * 0.95,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
        MenuScene,
        ConfigScene,
        IntroScene,
        GameScene,
        CreditsScene
    ]
};

const game = new Phaser.Game(config);

// Responsivo
window.addEventListener('resize', () => {
    game.scale.resize(
        window.innerWidth * 0.95,
        window.innerHeight * 0.95
    );
});
