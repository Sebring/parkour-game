export class Player extends Phaser.Sprite {
  constructor(game, x = 0, y = 0, key = 'p_run') {
    super(game, x, y, key)
    game.add.existing(this)
    
    this.height = 60
    this.width = 20
    this.canJump = true
    this.isJumping = false
    this.isClimbing = false

    // physics
    game.physics.arcade.enable(this)
    this.body.drag.x = 100

    // random color
    this.tint = Math.random() * 0xffffff

    this._addAnimations()

    this.height = 60
    this.width = 20
  }

  _addAnimations() {
    this.animations.add('run')
    this.animations.play('run', 10, true)    
  }


  grabLedge = (dir, ledge) => {
  	console.log('grab ledge');
  	this.body.allowGravity = false
  	this.isJumping = false;
  	console.log('grab speed ' + this.body.velocity.y)
  	//this.body.velocity.y = diff
  	this.tint = 0x00ffff
  	this.isClimbing = {dir, ledge}
  }
	
	dropLedge = () => {
		console.log('drop ledge')
  	this.body.allowGravity = true
  	this.tint = 0xff0000
  	this.isClimbing = false
  }

  isFalling = () => {
  	let b = this.body.blocked
  	let isBlocked = b.up || b.down || b.left || b.right;
  	return !isBlocked;
  }
}
