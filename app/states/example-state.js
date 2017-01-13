import GAME from '../constants/game'
import PLAYER from '../constants/player'
import STATE_EVENTS from '../constants/state-events'
import { Player } from '../models/player'
import setupStore from '../replay/setupStore'
import { Replay } from '../replay/replay'

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

      // input
      this.cursors = this.game.input.keyboard.createCursorKeys()
      this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)

      // player
      this.playerGroup = this.game.add.group()
      this.map.createFromObjects('object_layer', 2, null, undefined, undefined, undefined, this.playerGroup)
      
      let p = this.playerGroup.children[0]
      this.player = new Player(this.game, p.x, p.y)
      // store initial input state
      //this._addInputToStore();
      this.player.setInputSource(this._inputSourceKeyboard)


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

      if (this.game_state.isFinished) {
        // it was a ghost run
        this.game.paused = true;
        return;
      }

      let finishTime = Number((Date.now() - this.timer)).toString()
      this.store.dispatch({type:'FINISH', game_event:'FINISH', time:finishTime})
      //this.game.paused = true
      this.game_state.isFinished = true
      this.game_state.finishTime = finishTime
      
      // save replay and clear
      this.replay = new Replay(this.store.getState())
      this.store = setupStore()
      //this._addInputToStore(GAME.NO_INPUT);
      
      this.game.trigger(STATE_EVENTS.EXAMPLE_COMPLETED)
      // reset player position
      let p = this.playerGroup.children[0]
      this.player.x = p.x
      this.player.y = p.y
      this.ghost = new Player(this.game, p.x, p.y)
      this.ghost.alpha = 0.5
      
      this.ghost.setInputSource(this._inputSourceReplay)
      this.player.setInputSource(this._inputSourceKeyboard)
      // reset timer
      this.timer = false
      this.timeSlip = false
    }

    repositionPlayer(position) {
      console.log('reposition', position)
      console.log(`x:${this.player.body.x}, y:${this.player.body.y}`)
    //  this.player.body.x = position.x
      this.player.body.y = position.y
    }

    _getInput() {
      if (!this.game_state.isFinished) {
        let i = {up:this.cursors.up.isDown, down:this.cursors.down.isDown, 
            left:this.cursors.left.isDown, right:this.cursors.right.isDown, 
            jump:this.jumpButton.isDown}
        this._addInputToStore(i) 
        return i
      } else {
        // use input from replay
        if (!this.timer)
          this.timer = Date.now()
        return this.replay.getInput(this.timer, this)
      }
    }

    _inputSourceKeyboard = () => {
      let i = {up:this.cursors.up.isDown, down:this.cursors.down.isDown, 
            left:this.cursors.left.isDown, right:this.cursors.right.isDown, 
            jump:this.jumpButton.isDown}
      this._addInputToStore(i) 
      return i
    }

    _inputSourceReplay = () =>  {
      // use input from replay
      if (!this.timer)
        this.timer = Date.now()
      return this.replay.getInput(this.timer, this)
    }

    update() {
      
      // player reached goal
      this.physics.arcade.overlap(this.player, this.goalGroup, () => {
        this.player.setInputSource()
        this._finish()
        return
      })
       // ghost reached goal
      this.physics.arcade.overlap(this.ghost, this.goalGroup, () => {
        this.ghost.setInputSource()
        return
      })

      let input = this.player.getInput()
      
      // player vs tile
      this.physics.arcade.collide(this.player, this.layer, (player, tile) => {
        player.handlePlatform(tile, input)          
      })

      this.player.handleInput(input)

      if (!this.ghost) return;


      input = this.ghost.getInput()
      if (!input) return;
      
      // player vs tile
      this.physics.arcade.collide(this.ghost, this.layer, (player, tile) => {
        player.handlePlatform(tile, input)          
      })

      this.ghost.handleInput(input)
    
    }

    _addInputToStore(input) {
      if (JSON.stringify(input) !== JSON.stringify(this.lastInput)) {
        this.lastInput = input
        let pos = {x:this.player.body.x, y:this.player.body.y}
        this.store.dispatch({type:'INPUT', id:input, time:Number((Date.now() - this.timer)), pos:pos})
      }
    }

    render() {
      let timeValue = this.game_state.isFinished? this.game_state.finishTime/1000 : Number((Date.now() - this.timer)/1000).toFixed(2)
        this.countDownText.text = timeValue  + ' s'
    }
}
