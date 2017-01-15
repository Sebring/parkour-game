import PLAYER from '../constants/player'
import GAME from '../constants/game'

export class Player extends Phaser.Sprite {
  constructor(game, x = 0, y = 0, key = 'hero_run') {
    super(game, x, y, key)
    game.add.existing(this)
    
    this.canJump = true
    this.isJumping = false
    this.isClimbing = false

    // physics
    game.physics.arcade.enable(this)
    this.body.drag.x = 100

    // random color
    this.tint = Math.random() * 0xffffff

    this._addAnimations()

    
    this.scaleX = 0.3
    this.scale.y = 0.5
    this.scale.x = this.scaleX
    this.anchor.setTo(0.5)
  }

  setInputSource(handler) {
    this.inputHandler = handler
  }

  getInput() {
    return this.inputHandler? this.inputHandler() : GAME.NO_INPUT
  }

  _addAnimations() {
    this.animations.add('run')
    this.animations.play('run', 10, true)    
  }


  grabLedge(dir, ledge) {
  	console.log('grab ledge');
  	this.body.allowGravity = false
  	this.isJumping = false;
  	//console.log('grab speed ' + this.body.velocity.y)
  	//this.body.velocity.y = diff
  	this.tint = 0x00ffff
  	this.isClimbing = {dir, ledge}
  }
	
	dropLedge() {
		console.log('drop ledge')
  	this.body.allowGravity = true
  	this.tint = 0xff0000
  	this.isClimbing = false
  }

  isFalling() {
  	let b = this.body.blocked
  	let isBlocked = b.up || b.down || b.left || b.right;
  	return !isBlocked;
  }

  handlePlatform(tile, input) {
    if (this.body.blocked.down) {
      return;
    }
    
    if (!this.isClimbing) {
      if (this.body.y < tile.worldY) {
        if (this.body.blocked.right && input.right) {
          this.grabLedge('right', tile)
        } else if (this.body.blocked.left && input.left) {
          this.grabLedge('left', tile)
        }
      }
    }

  }

  handleInput(input) {

    // stop horizontal movement unless falling
    if (!this.isFalling()) {
      this.body.velocity.x = 0
      this.isJumping = false
    }     

    if (this.isClimbing) {
      this._handleClimbingInput(input)
      return;
    }

    if (input.left) {
      if (true || !this.isFalling()) {
        this.body.velocity.x = -250
        if (this.scale.x < 0) this.scale.x = this.scaleX
      }
    } else if (input.right) {
      if (true || !this.isFalling()) {
        this.body.velocity.x = 250
        if (this.scale.x > 0) this.scale.x = -this.scaleX
      }
    }

    if (input.jump) {
      if (this.body.onFloor()) {
        // jump
        this.body.velocity.y = PLAYER.JUMP_FORCE
        this.isJumping = true
      }
    } else if (this.isJumping) {
      // control jump height
      if (this.body.velocity.y < 0) {
        this.body.velocity.y /= 2
      }
    }

  }

  _handleClimbingInput(input) {
        
        let {dir, ledge} = this.isClimbing
        let heightDiff = ledge.worldY - this.body.y
                
        // has climbed up
        if (heightDiff > this.height) {
            console.log('climbed up')
            this.dropLedge()
            // reset speed to avoid ledge jumping or falling back down
            this.body.velocity.y = -50
            return
        }

        // slided down below ledge
        if (heightDiff < PLAYER.GRAB_DIFF_LIMIT) {
            // drop
            if (heightDiff < 0) {
                console.log('dropped')
                this.dropLedge()
                return
            } else {
                // grab edge
                //console.log('p.vy: ' + this.body.velocity.y)
                if (this.body.velocity.y > 0 && this.body.velocity.y <= PLAYER.GRAB_SPEED_LIMIT) {
                  console.log('edge grab')
                  this.tint = 0x00ff00
                  this.body.velocity.y = PLAYER.CLIMB_SPEED
                } else if (this.body.velocity.y > PLAYER.GRAB_SPEED_LIMIT ) {
                  console.log('slip')
                  this.dropLedge()
                  return
                }

            }
        }

        if (input.left) {

            // let go
            if (dir =='right') {
                this.dropLedge()
                this.body.velocity.x = 50
                return;
            } 
            // continue climb
            if (dir =='left') {
                this.body.velocity.y += PLAYER.CLIMB_SPEED
                this.body.velocity.clampY(-160, 600)
                this.body.velocity.x = -50
                return;
            } else {

            }
        } else if (input.right) {

          // let go
          if (dir =='left') {
              this.dropLedge()
              this.body.velocity.x = -50
              return;
          } 
          // continue climb
          if (dir =='right') {
            this.body.velocity.y += PLAYER.CLIMB_SPEED
            this.body.velocity.clampY(-160, 600)
            this.body.velocity.x = 50
            return;
          }

        }
        if (input.up) {
          this.body.velocity.y += PLAYER.CLIMB_SPEED
          this.body.velocity.clampY(-160, 600)
        } else if (input.down) {
          this.body.velocity.y -= PLAYER.CLIMB_SPEED*2
        } else {
          // don't climb
          console.log('stop climb')
          this.body.velocity.y = 0;
        }

/*
        if (this.jumpButton.isDown) {
            console.log(this.body.velocity.y)
            console.log(this.body.acceleration.y)
            this.body.velocity.y -= 20
            this.body.velocity.clampY(-160, 160)
        } else {
            
        }*/
    }
}
