import GAME from '../constants/game'
import PLAYER from '../constants/player'
import STATE_EVENTS from '../constants/state-events'
import { Player } from '../models/player'
import setupStore from '../replay/setupStore'

export class ExampleState extends Phaser.State {
    map = null
    layer = null


    create() {

      // game states
      this.game_state = {
        isFinished: false,
        finishTime: '0.0',
        replayState: undefined
      }

      // store
      this.store = setupStore()
      this._renderStore()
      this.store.subscribe(this._renderStore)
      this.lastInput = false;
      
      /* TODO add start action with date.now()
        this.store.dispatch({type:'ADD_INPUT', 
        id:1,time:Date.now()})
      */
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

      // input
      this.cursors = this.game.input.keyboard.createCursorKeys()
      this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
      // store initial input state
      this._addInputToStore();

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

      // author and version text
      let text = this.add.text(this.world.centerX, this.world.bottom - 30, 
        'v'+GAME.VERSION + ' - Johan Sebring')
      text.fontSize = 16
    }

    _renderStore = () => {
    /* console.log('dispatch')
      console.log(this.store.getState())
    */
    }

    _finish() {
      console.log("WIN CONDITION!")
      console.log((Date.now() - this.timer)/1000  + ' seconds')
      let finishTime = Number((Date.now() - this.timer)/1000).toString()
      this.store.dispatch({type:'FINISH', game_event:'FINISH', time:finishTime})
      this.game.paused = true
      this.game_state.isFinished = true
      this.game_state.finishTime = finishTime
      this.game_state.replayState = this.store.getState()
      console.log(this.game_state.replayState)
      this.game.trigger(STATE_EVENTS.EXAMPLE_COMPLETED)
    }

    _getInput() {
      return {up:this.cursors.up.isDown, down:this.cursors.down.isDown, 
          left:this.cursors.left.isDown, right:this.cursors.right.isDown, 
          jump:this.jumpButton.isDown}
    }

    update() {
      
      // reached goal
      this.physics.arcade.overlap(this.player, this.goalGroup, () => {
        this._finish()
        return
      })

      let input = this._getInput()

      // save input to store
      this._addInputToStore()
      
      // player vs tile
      this.physics.arcade.collide(this.player, this.layer, (player, tile) => {
        player.handlePlatform(tile, input)          
      })

      this.player.handleInput(input)
    
    }

    _addInputToStore() {
      let c = {up:this.cursors.up.isDown, down:this.cursors.down.isDown, 
          left:this.cursors.left.isDown, right:this.cursors.right.isDown, 
          jump:this.jumpButton.isDown}
      if (JSON.stringify(c) !== JSON.stringify(this.lastInput)) {
        this.lastInput = c
        this.store.dispatch({type:'INPUT', id:c, time:Number((Date.now() - this.timer)/1000)})
      }
    }

    render() {
      let timeValue = this.game_state.isFinished? this.game_state.finishTime : Number((Date.now() - this.timer)/1000).toFixed(2)
        this.countDownText.text = timeValue  + ' s'
    }
}
