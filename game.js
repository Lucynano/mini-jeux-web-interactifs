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
        this.scoreText.setText('score: ' + this.score);

        this.tweens.add({
            targets: this.player, // on the player
            duration: 200, // for 200ms
            scaleX: 1.2, // that scale vertically by 20%
            scaleY: 1.2, // and scale horizontally by 20%
            yoyo: true, // at the end, go back to original scale
        });
    }

    hitBot() {
        // Stop physics and end the game
        this.physics.pause();

        this.player.setTint(0xff0000); // Turn the player red

         const gameOverText =  this.add.text(0, 0, 'GAME OVER', {
            font: '30px Arial',
            fill: '#ff0000'
        });
        gameOverText.setOrigin(0.5); // Center based on its own size
        gameOverText.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);

        // Stop update loop completely
        this.isGameOver = true;
    }

    preload() {
        this.load.image('player', 'assets/player.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bot', 'assets/bot.png');
        
    }

    create() {
        // Difficulty settings
        const difficulty = 'easy';
        const config = {
            easy: { botSpeed: 100,  botCount: 2, timer: 30 },
            medium: { botSpeed: 150, botCount: 2, timer: 30 },
            hard: { botSpeed: 200, botCount: 3, timer: 30 }
        }[difficulty];

        // Player
        this.player = this.physics.add.sprite(100, 100, 'player');
        this.player.setCollideWorldBounds(true); // Prevent player to go outside from square 
        
        // Star
        this.star = this.physics.add.sprite(300, 300, 'star');

        // Bot
        this.bots = [];
        for (let i = 0; i < config.botCount; i++) {
            // Random bot positions
            const bot = this.physics.add.sprite(
                Phaser.Math.Between(50, 450),
                Phaser.Math.Between(50, 450),
                'bot'
            );
            bot.setCollideWorldBounds(true);

            // Give each bot a random direction
            bot.direction = new Phaser.Math.Vector2(
                Phaser.Math.Between(-1, 1),
                Phaser.Math.Between(-1, 1)
            );

            // If direction is (0, 0), give it a default random direction
            if (bot.direction.x === 0 && bot.direction.y === 0) {
                bot.direction.x = 1;
            }

            this.bots.push(bot);
        }
        
        // Store the score in a variable, init at 0
        this.score = 0;
        this.scoreText = this.add.text(20, 20, 'score: 0', {
            font: '20px Arial',
            fill: '#ffffff'
        });

        // Timer
        this.timeLeft = config.timer;
        this.timeText = this.add.text(370, 20, 'Time: ' + this.timeLeft, {
            font: '20px Arial',
            fill: '#ffcc00'
        });

        // Decrease timer every second
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                this.timeText.setText('Time: ' + this.timeLeft);

                // If time runs out => game over
                if (this.timeLeft <= 0) {
                    this.physics.pause();
                    const timeUpText =  this.add.text(150, 250, 'TIME UP!', {
                        font: '30px Arial',
                        fill: '#ffcc00'
                    });
                    timeUpText.setOrigin(0.5); // Center based on its own size
                    timeUpText.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);
                    
                    this.isGameOver = true;
                }
            },
            loop: true
        });

        // Input
        this.arrow = this.input.keyboard.createCursorKeys();

        // Collisions
        this.physics.add.overlap(this.player, this.star, this.hitStar, null, this);
        this.bots.forEach(bot => {
            this.physics.add.overlap(this.player, bot, this.hitBot, null, this);
        });



        // Bot movement
        this.botSpeed = config.botSpeed;

        // Change bot direction randomly every 1 second
        this.time.addEvent({
            delay: 3000,
            callback: () => {
                this.bots.forEach(bot => {
                    bot.direction.x = Phaser.Math.Between(-1, 1);
                    bot.direction.y = Phaser.Math.Between(-1, 1);

                    // If direction is (0, 0), give it a default random direction
                    if (bot.direction.x === 0 && bot.direction.y === 0) {
                        bot.direction.x = 1;
                    }

                    // Small animation to make direction change visible
                    this.tweens.add({
                        targets: bot,
                        alpha: 0.5,
                        yoyo: true,
                        duration: 100
                    });
                });
            },
            loop: true
        });

        // Background design
        this.cameras.main.setBackgroundColor('#0d0d0d');

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

        // bot moves continuously
        this.bots.forEach(bot => {
            bot.x += bot.direction.x * (this.botSpeed / 100);
            bot.y += bot.direction.y * (this.botSpeed / 100);

            // Bounce on the borders
            if (bot.x <= 20 || bot.x >= 480) bot.direction.x *= -1;
            if (bot.y <= 20 || bot.y >= 480) bot.direction.y *= -1;
        })


    }
}
// Game Config
new Phaser.Game({
    width: 500,
    height: 500,
    scene: mainScene,
    physics: { default: 'arcade' }, // The physics engine to use
    parent: 'game', // Create the game inside the div
});