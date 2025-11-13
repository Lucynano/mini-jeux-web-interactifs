// Create our only scene called mainScene
class mainScene extends Phaser.Scene {

    constructor() {
        super('mainScene');
        this.cards = [];
        this.images = [];
        this.firstClick = null;
        this.secondClick = null;
        this.noMatch = false; 
        this.clickTime = 0;
        this.score = 100;
        this.gameEnded = false;
        this.level = 'hard';
    }

    doClick(sprite) {
        if (this.firstClick == null) {
            this.firstClick = sprite.index; // step 1
        } else if (this.secondClick == null) {
            this.secondClick = sprite.index; // step 2
            // step 4
            if (this.images[this.firstClick].texture.key === this.images[this.secondClick].texture.key) {
                // step 5
                this.score += 20;
                this.firstClick = null; this.secondClick = null;
            } else {
                // step 6
                this.score -= 5;
                this.noMatch = true;
            }
        } else {
            return; // dont allow a third click, instead wait for the update loop to flip back after 0.5 seconds
        }

        // step 3, we only get here on first or second click due to the else statement returning
        this.clickTime = this.time.now / 1000;
        sprite.visible = false;
        this.images[sprite.index].visible = true;
    }

    endGame(message, color) {
        // Stop physics
        this.scene.pause();

        // Display message
        const text = this.add.text(0, 0, message, {
            font: '30px Arial',
            fill: color
        });
        text.setOrigin(0.5);
        text.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);
    }

    preload() {
        this.load.image('back', 'assets/back.png');
        for (let i = 0; i < 10; i++) {
            this.load.image('' + i, 'assets/' + i + '.png')
        }
        this.load.image('alien', 'assets/alien.png');
        this.load.image('darth-vader', 'assets/darth-vader.png');
        this.load.image('finn', 'assets/finn.png');
        this.load.image('futurama-bender', 'assets/futurama-bender.png');
        this.load.image('grinch', 'assets/grinch.png');
        this.load.image('homer-simpson', 'assets/homer-simpson.png');
        this.load.image('iron-man', 'assets/iron-man.png');
        this.load.image('jake', 'assets/jake.png');
        this.load.image('mickey', 'assets/mickey.png');
        this.load.image('popeye', 'assets/popeye.png');
        this.load.image('r2-d2', 'assets/r2-d2.png');
        this.load.image('rick-sanchez', 'assets/rick-sanchez.png');
        this.load.image('scream', 'assets/scream.png');
        this.load.image('spider-man-head', 'assets/spider-man-head.png');
        this.load.image('super-mario', 'assets/super-mario.png');
        this.load.image('superman', 'assets/superman.png');
        this.load.image('venom-head', 'assets/venom-head.png');
        this.load.image('walter-white', 'assets/walter-white.png');
    }

    create() {
        let keys = [];
        if (this.level === 'easy') {
            keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        } else {
            keys = [
                'alien', 'darth-vader', 'finn', 'futurama-bender', 'grinch', 'homer-simpson', 
                'iron-man', 'jake', 'mickey', 'popeye', 'r2-d2', 'rick-sanchez', 
                'scream', 'spider-man-head', 'super-mario', 'superman', 'venom-head', 'walter-white', 
            ];
        }
        
        let numPairs = keys.length;
        let totalCards = numPairs * 2;

        for (let i = 0; i < numPairs; i++) {
            this.images.push(this.add.sprite(0, 0, keys[i]));
            this.images.push(this.add.sprite(0, 0, keys[i]));
        }

        this.shuffle(this.images);

        let cols = Math.ceil(Math.sqrt(totalCards));
        let rows = Math.ceil(totalCards / cols);

        const screenWidth = this.game.config.width;
        const screenHeight = this.game.config.height;
        const margin = 20;
        this.TILE_SIZE = Math.min(
            (screenWidth - margin * 2) / cols,
            (screenHeight - margin * 2) / rows
        );

        let offsetX = (screenWidth - cols * this.TILE_SIZE) / 2 + this.TILE_SIZE / 2;
        let offsetY = (screenHeight - rows * this.TILE_SIZE) / 2 + this.TILE_SIZE / 2;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                let idx = (i * cols) + j;
                if (idx >= totalCards) break;

                this.cards[idx] = this.add.sprite(offsetX + (j * this.TILE_SIZE), offsetY + (i * this.TILE_SIZE), 'back');
                this.cards[idx].index = idx;

                this.images[idx].x = offsetX + (j * this.TILE_SIZE);
                this.images[idx].y = offsetY + (i * this.TILE_SIZE);
                this.images[idx].visible = false;

                this.cards[idx].displayWidth = this.TILE_SIZE * 0.9;
                this.cards[idx].displayHeight = this.TILE_SIZE * 0.9;
                this.images[idx].displayWidth = this.TILE_SIZE * 0.9;
                this.images[idx].displayHeight = this.TILE_SIZE * 0.9;

                this.cards[idx].setInteractive();
                let card = this.cards[idx];
                card.on('pointerdown', () => this.doClick(card));
                card.on('pointerover', () => card.setAlpha(0.5));
                card.on('pointerout', () => card.setAlpha(1));
            }
        }

        // Score
        this.scoreText = this.add.text(20, 20, 'Score: ' + this.score, { font: '20px Arial', fill: '#ffffff' });

        // Level
        this.add.text(this.game.config.width - 20, 20, this.level.toUpperCase(), {
            font: '20px Arial', fill: '#ffcc00'
        }).setOrigin(1, 0); 

        // Background design
        this.cameras.main.setBackgroundColor('#1d1160');
    }

    shuffle(o) {
        for (let j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }

    update() {
        if (this.noMatch) {
            if ((this.time.now / 1000) - this.clickTime > 0.5) {
                this.cards[this.firstClick].visible = true;
                this.cards[this.secondClick].visible = true;
                this.images[this.firstClick].visible = false;
                this.images[this.secondClick].visible = false;
                this.firstClick = null; this.secondClick = null;
                this.noMatch = false;
            }
        }

        this.scoreText.setText('Score: ' + this.score);

        if (!this.gameEnded) {
            // Check if all pairs are found
            let allFound = this.images.every(img => img.visible);
            if (allFound) {
                this.gameEnded = true;
                this.endGame('CONGRATULATION!', '#ffcc00');
            }

            // Check if score is 0 or less
            if (this.score <= 0) {
                this.gameEnded = true;
                this.endGame('GAME OVER', '#ff0000');
            }
        }
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