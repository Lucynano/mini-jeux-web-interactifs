// Create our only scene called mainScene
class mainScene extends Phaser.Scene {
    constructor() {
        super('mainScene');
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
        // Stop physics
        this.physics.pause();

        // Stop timer
        if (this.timerEvent) {
            this.timerEvent.remove();
        }

        // Optionally color player
        this.player.setTint(color === '#ff0000' ? 0xff0000 : 0xffffff);

        // Display message
        const text = this.add.text(0, 0, message, {
            font: '30px Arial',
            fill: color
        });
        text.setOrigin(0.5);
        text.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);

        this.isGameOver = true;
    }

    preload() {
        this.load.image('player', 'assets/player.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('ufo', 'assets/ufo.png');
        
    }

    create() {
        // Difficulty settings
        const difficulty = 'hard';
        const config = {
            easy: { ufoSpeed: 150,  ufoCount: 2, timer: 30 },
            medium: { ufoSpeed: 200, ufoCount: 2, timer: 30 },
            hard: { ufoSpeed: 250, ufoCount: 3, timer: 30 }
        }[difficulty];

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
            fill: '#ffffff'
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

        // Background design
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
    scene: mainScene,
    physics: { 
        default: 'arcade',
        // arcade: {
        //     debug: true,
        // } 
    }, // The physics engine to use
    parent: 'game', // Create the game inside the div
});