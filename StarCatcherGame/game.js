class MenuScene extends Phaser.Scene {
    constructor() {
        super('menuScene');
    }

    preload() {
        this.load.image('player', 'assets/player.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('ufo', 'assets/ufo.png');
    }

    create() {
        // Difficulty 
        this.selectedDifficulty = 'easy';

        // Background
        this.cameras.main.setBackgroundColor('#1d1160');

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Texte de difficulté
        this.difficultyText = this.add.text(centerX, centerY - 20, 'Difficulty: EASY', {
            font: '28px Arial',
            fill: '#7CFC00' // vert clair
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.changeDifficulty());

        // Texte d’instruction
        this.add.text(centerX, centerY + 30, '(Click to change, press SPACE to start)', {
            font: '16px Arial',
            fill: '#f5f5f5'
        }).setOrigin(0.5);

        // Espace pour démarrer
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('mainScene', { difficulty: this.selectedDifficulty });
        });
    }

    changeDifficulty() {
        const levels = ['easy', 'medium', 'hard'];
        const currentIndex = levels.indexOf(this.selectedDifficulty);
        const nextIndex = (currentIndex + 1) % levels.length;
        this.selectedDifficulty = levels[nextIndex];

        // Couleurs harmonisées avec fond violet
        const colorMap = {
            easy: '#7CFC00', // vert clair
            medium: '#4FC3F7', // bleu ciel
            hard: '#FF6EB4' // rose violacé
        };

        this.difficultyText.setText('Difficulty: ' + this.selectedDifficulty.toUpperCase());
        this.difficultyText.setFill(colorMap[this.selectedDifficulty]);
    }
}

// Create our only scene called mainScene
class mainScene extends Phaser.Scene {
    constructor() {
        super('mainScene');
    }

    init(data) {
        this.difficulty = data.difficulty || 'easy';
    }
    
    hitStar() {
        // Change the position x and y of the star randomly
        this.star.x = Phaser.Math.Between(100, 400);
        this.star.y = Phaser.Math.Between(100, 400);

        // Increment the score by 10
        this.score += 10;

        // Display the updated score on the screen
        this.scoreText.setText('Score: ' + this.score);

        this.tweens.add({
            targets: this.player, // on the player
            duration: 200, // for 200ms
            scaleX: 1.2, // that scale vertically by 20%
            scaleY: 1.2, // and scale horizontally by 20%
            yoyo: true, // at the end, go back to original scale
        });
    }

    hitUfo() {
        this.endGame('GAME OVER', '#ff0000');
    }

    endGame(message, color) {
        this.physics.pause();
        if (this.timerEvent) this.timerEvent.remove();
        this.player.setTint(color === '#ff0000' ? 0xff0000 : 0xffffff);
        const text = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, message, {
            font: '30px Arial',
            fill: color
        }).setOrigin(0.5);
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 50, 'Press R to restart or M for menu', {
            font: '16px Arial',
            fill: '#f5f5f5'
        }).setOrigin(0.5);
        this.isGameOver = true;
        this.input.keyboard.once('keydown-R', () => this.scene.restart({ difficulty: this.difficulty }));
        this.input.keyboard.once('keydown-M', () => this.scene.start('menuScene'));
    }

    create() {
        const config = {
            easy: { ufoSpeed: 200,  ufoCount: 2, timer: 30 },
            medium: { ufoSpeed: 250, ufoCount: 2, timer: 30 },
            hard: { ufoSpeed: 300, ufoCount: 3, timer: 30 }
        }[this.difficulty];

        // Player
        this.player = this.physics.add.sprite(100, 100, 'player');
        this.player.setCollideWorldBounds(true); // Prevent player to go outside from square 
        this.player.setSize(32, 32); // Hitbox less small than img
        
        // Star
        this.star = this.physics.add.sprite(300, 300, 'star');

        // ufo
        this.ufos = [];
        for (let i = 0; i < config.ufoCount; i++) {
            // Random ufo positions
            const ufo = this.physics.add.sprite(
                Phaser.Math.Between(50, 450),
                Phaser.Math.Between(50, 450),
                'ufo'
            );
            ufo.setCollideWorldBounds(true);

            // Give each ufo a random direction
            ufo.direction = new Phaser.Math.Vector2(
                Phaser.Math.Between(-1, 1),
                Phaser.Math.Between(-1, 1)
            );

            // If direction is (0, 0), give it a default random direction
            if (ufo.direction.x === 0 && ufo.direction.y === 0) {
                ufo.direction.x = 1;
            }

            this.ufos.push(ufo);
        }
        
        // Store the score in a variable, init at 0
        this.score = 0;
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            font: '20px Arial',
            fill: '#f5f5f5'
        });

        // Timer
        this.timeLeft = config.timer;
        this.timeText = this.add.text(this.game.config.width - 20, 20, 'Time: ' + this.timeLeft, {
            font: '20px Arial',
            fill: '#ffcc00'
        }).setOrigin(1, 0);

        // Decrease timer every second
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                this.timeText.setText('Time: ' + this.timeLeft);

                // If time runs out => game over
                if (this.timeLeft <= 0) {
                    this.endGame('TIME UP!', '#ffcc00');
                }
            },
            loop: true
        });

        // Input
        this.arrow = this.input.keyboard.createCursorKeys();

        // Collisions
        this.physics.add.overlap(this.player, this.star, this.hitStar, null, this);
        this.ufos.forEach(ufo => {
            this.physics.add.overlap(this.player, ufo, this.hitUfo, null, this);
        });



        // ufo movement
        this.ufoSpeed = config.ufoSpeed;

        // Change ufo direction randomly every 1 second
        this.time.addEvent({
            delay: 3000,
            callback: () => {
                this.ufos.forEach(ufo => {
                    ufo.direction.x = Phaser.Math.Between(-1, 1);
                    ufo.direction.y = Phaser.Math.Between(-1, 1);

                    // If direction is (0, 0), give it a default random direction
                    if (ufo.direction.x === 0 && ufo.direction.y === 0) {
                        ufo.direction.x = 1;
                    }

                    // Small animation to make direction change visible
                    this.tweens.add({
                        targets: ufo,
                        alpha: 0.5,
                        yoyo: true,
                        duration: 100
                    });
                });
            },
            loop: true
        });

        this.cameras.main.setBackgroundColor('#1d1160');

        // Flag to control when game is over
        this.isGameOver = false;
    }

    update() {
        // If game over or time up => stop update
        if (this.isGameOver) {
            this.player.setVelocity(0);
            return;
        }

        // Player movement controls 
        this.player.setVelocity(0);

        // Handle horizontal movements
        if (this.arrow.right.isDown) {
            // If the right arrow is pressed, move to the right
            this.player.setVelocityX(150);
        } else if (this.arrow.left.isDown) {
            // If the left arrow is pressed, move to the left
            this.player.setVelocityX(-150);
        }

        // Do the same for vertical movements
        if (this.arrow.down.isDown) {
            // If the right arrow is pressed, move to the right
            this.player.setVelocityY(150);
        } else if (this.arrow.up.isDown) {
            // If the left arrow is pressed, move to the left
            this.player.setVelocityY(-150);
        }

        // ufo moves continuously
        this.ufos.forEach(ufo => {
            ufo.x += ufo.direction.x * (this.ufoSpeed / 100);
            ufo.y += ufo.direction.y * (this.ufoSpeed / 100);

            // Bounce on the borders
            if (ufo.x <= 20 || ufo.x >= 480) ufo.direction.x *= -1;
            if (ufo.y <= 20 || ufo.y >= 480) ufo.direction.y *= -1;
        })
    }
}

// Game Config
new Phaser.Game({
    width: 500,
    height: 500,
    scene: [MenuScene, mainScene],
    physics: { 
        default: 'arcade',
        // arcade: {
        //     debug: true,
        // } 
    }, // The physics engine to use
    parent: 'game', // Create the game inside the div
});