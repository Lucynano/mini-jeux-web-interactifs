// Create our only scene called mainScene
class mainScene extends Phaser.Scene {
    hit() {
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

    preload() {
        this.load.image('player', 'assets/player.png');
        this.load.image('star', 'assets/star.png');
        
    }

    create() {
        this.player = this.physics.add.sprite(100, 100, 'player');
        this.star = this.physics.add.sprite(300, 300, 'star');

        // Prevent player to go outside from square
        this.player.setCollideWorldBounds(true);

        // Store the score in a variable, init at 0
        this.score = 0;

        let style = { font: '20px Arial', fill: '#fff' };

        this.scoreText = this.add.text(20, 20, 'score: ' + this.score, style);

        this.arrow = this.input.keyboard.createCursorKeys();
    }

    update() {
        // If the player is overlapping with the star
        if (this.physics.overlap(this.player, this.star)) {
            // Call the new hit() method
            this.hit();
        }

        // Handle horizontal movements
        if (this.arrow.right.isDown) {
            // If the right arrow is pressed, move to the right
            this.player.x += 3;
        } else if (this.arrow.left.isDown) {
            // If the left arrow is pressed, move to the left
            this.player.x -= 3;
        }

        // Do the same for vertical movements
        if (this.arrow.down.isDown) {
            // If the right arrow is pressed, move to the right
            this.player.y += 3;
        } else if (this.arrow.up.isDown) {
            // If the left arrow is pressed, move to the left
            this.player.y -= 3;
        }
    }
}

new Phaser.Game({
    width: 500,
    height: 500,
    backgroundColor: '#111',
    scene: mainScene,
    physics: { default: 'arcade' }, // The physics engine to use
    parent: 'game', // Create the game inside the div
});