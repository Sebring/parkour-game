import GAME from '../constants/game'
import PLAYER from '../constants/player'
import STATE_EVENTS from '../constants/state-events'
import { Player } from '../models/player'

export class ExampleState extends Phaser.State {
    map = null
    layer = null


    create() {
      this.physics.startSystem(Phaser.Physics.ARCADE)
      this.physics.arcade.gravity.y = GAME.GRAVITY

      // tilemap
      this.map = this.add.tilemap('example-map')
      this.map.addTilesetImage('background')
      this.map.setCollision([1])
      
      // level
      this.layer = this.map.createLayer('map_layer')
      this.layer.resizeWorld()
      
      // goal
      this.goalGroup = this.game.add.group()
      this.map.createFromObjects('object_layer', 1, 'player', undefined, undefined, undefined,this.goalGroup)
      this.game.physics.enable(this.goalGroup.children[0], Phaser.Physics.ARCADE)
      this.goalGroup.children[0].body.allowGravity = false;

      
      // player
      this.playerGroup = this.game.add.group()
      this.map.createFromObjects('object_layer', 2, null, undefined, undefined, undefined, this.playerGroup)
      
      let p = this.playerGroup.children[0]
      this.player = new Player(this.game, p.x, p.y)
      this.game.trigger(STATE_EVENTS.EXAMPLE_COMPLETED)

      // stickman
          /* stickman
    this.player = this.game.add.sprite(100,150,'p_run')
    this.player.animations.add('run')
    this.player.animations.play('run', 10, true)
    this.player.scale.set(0.5,0.5)
    /*
    /*
      this.stickman = this.game.add.sprite(100,100,'p_run')
      this.stickman.animations.add('run')
      this.stickman.animations.play('run', 50, true)
      */
      // input
      this.cursors = this.game.input.keyboard.createCursorKeys()
      this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
      
      // timer
      this.timer = Date.now();

      const bannerText = 'Parkour.io'
      this.countDownText = this.add.text(this.world.centerX, 25, bannerText)
      //banner.font = 'Bangers'
      this.countDownText.padding.set(10, 16)
      this.countDownText.fontSize = 32
      this.countDownText.fill = '#000'
      this.countDownText.smoothed = false
      this.countDownText.anchor.setTo(0.5)

      // author text
      let text = this.add.text(this.world.centerX, this.world.bottom - 30, 'v.0.0.1 - Johan Sebring')
      text.fontSize = 16
    }

    update() {
      // goal
      this.physics.arcade.overlap(this.player, this.goalGroup, () => {
        console.log("WIN CONDITION!")
        console.log((Date.now() - this.time)/1000  + ' seconds');
        crash()
      })
      // player vs tile
      this.physics.arcade.collide(this.player, this.layer, (player, tile) => {
        //console.log(player.body.blocked)
        if (player.body.blocked.down) {
          return;
        }
        if (!player.isClimbing) {
          if (player.body.y < tile.worldY) {
            // console.log(player.isFalling())
            //console.log(`player y is ${player.body.y} + " and layer.y " ${layer.worldY}`)
            if (player.body.blocked.right && this.cursors.right.isDown) {
              player.grabLedge('right', tile)
            } else if (player.body.blocked.left && this.cursors.left.isDown) {
              player.grabLedge('left', tile)
            }
          }
        }
          
      });

      // stop horizontal movement
      if (!this.player.isFalling()) {
        this.player.body.velocity.x = 0
        this.player.isJumping = false;
      } else {

      }
      

      // player input/movement
      if (this.player.isClimbing) {
        this.handleClimbingInput();
        return;
      }


      if (this.cursors.left.isDown) {
        if (true || !this.player.isFalling()) {
          this.player.body.velocity.x = -250
        } else { }
      }
      else if (this.cursors.right.isDown) {
        if (true || !this.player.isFalling()) {
          this.player.body.velocity.x = 250
        } else {
        //  this.player.body.velocity.x -= 1
        }
      }

      if (this.jumpButton.isDown) {//(this.player.body.onFloor() || this.player.body.touching.down)) {
          
        if (this.player.body.onFloor()) {
          // jump
          this.player.body.velocity.y = PLAYER.JUMP_FORCE
          this.player.isJumping = true;

        }
  
      } else if (this.player.isJumping) {
        // control jump height
        if (this.player.body.velocity.y < 0) {
          this.player.body.velocity.y /= 2
        }
      }
    
    }


    handleClimbingInput() {
        
        let {dir, ledge} = this.player.isClimbing;

        let heightDiff = ledge.worldY - this.player.body.y;
                
        // has climbed up
        if (heightDiff > this.player.height) {
            console.log('climbed up')
            this.player.dropLedge()
            // reset speed to avoid ledge jumping or falling back down
            this.player.body.velocity.y = -50
            return
        }

        // slided down below ledge
        if (heightDiff < PLAYER.GRAB_DIFF_LIMIT) {
            // drop
            if (heightDiff < 0) {
                console.log('dropped')
                this.player.dropLedge()
                return
            } else {
                // grab edge
                console.log('p.vy: ' + this.player.body.velocity.y)
                if (this.player.body.velocity.y > 0 && this.player.body.velocity.y <= PLAYER.GRAB_SPEED_LIMIT) {
                  console.log('edge grab')
                  this.player.tint = 0x00ff00
                  this.player.body.velocity.y = PLAYER.CLIMB_SPEED
                } else if (this.player.body.velocity.y > PLAYER.GRAB_SPEED_LIMIT ) {
                  console.log('slip')
                 // this.player.body.velocity.y *=.5
                  this.player.dropLedge()
                  return
                }

            }
        }

        if (this.cursors.left.isDown) {

            // let go
            if (dir =='right') {
                this.player.dropLedge()
                this.player.body.velocity.x = 50
                return;
            } 
            // continue climb
            if (dir =='left') {
                this.player.body.velocity.y += PLAYER.CLIMB_SPEED
                this.player.body.velocity.clampY(-160, 600)
                this.player.body.velocity.x = -50
                return;
            } else {

            }
        } else if (this.cursors.right.isDown) {

          // let go
          if (dir =='left') {
              this.player.dropLedge()
              this.player.body.velocity.x = -50
              return;
          } 
          // continue climb
          if (dir =='right') {
            this.player.body.velocity.y += PLAYER.CLIMB_SPEED
            this.player.body.velocity.clampY(-160, 600)
            this.player.body.velocity.x = 50
            return;
          }

        }
        if (this.cursors.up.isDown) {
          this.player.body.velocity.y += PLAYER.CLIMB_SPEED
          this.player.body.velocity.clampY(-160, 600)
        } else if (this.cursors.down.isDown) {
          this.player.body.velocity.y -= PLAYER.CLIMB_SPEED*2
        } else {
          // don't climb
          console.log('stop climb')
          this.player.body.velocity.y = 0;
        }

/*
        if (this.jumpButton.isDown) {
            console.log(this.player.body.velocity.y)
            console.log(this.player.body.acceleration.y)
            this.player.body.velocity.y -= 20
            this.player.body.velocity.clampY(-160, 160)
        } else {
            
        }*/
    }

    render() {
        this.countDownText.text = Number((Date.now() - this.timer)/1000).toFixed(2)  + ' s';
    }
}
