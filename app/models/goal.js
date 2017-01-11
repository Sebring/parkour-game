export class Goal extends Phaser.Sprite {
  constructor(game, x = 0, y = 0, key = 'player') {
    super(game, x, y, key)
    game.add.existing(this)
        
    update () {
      this.angle += 1
    }
  }
}