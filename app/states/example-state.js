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
      this.map = this.add.tilemap('map1')
      this.map.addTilesetImage('background')
      this.map.setCollision([1])
      
      // level
      this.layer = this.map.createLayer('map_layer')
      this.layer.resizeWorld()
      
      // goal
      this.goalGroup = this.game.add.group()
      this.map.createFromObjects('object_layer', 1, 'player', undefined, undefined, undefined,this.goalGroup)
      this.game.physics.enable(this.goalGroup.children[0], Phaser.Physics.ARCADE)
      this.goalGroup.children[0].body.allowGravity = false
      this.goalGroup.children[0].anchor.set(0.5,0.5)

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

      this.game.physics.arcade.isPaused = true
      this.player.setInputSource(this._inputSourceKeyboard)


      // menu
      this.menu = this.game.add.text(100, 100 ,'Space to start', {font: "54px Arial Black", fill: "#c51b7d" })
      this.menu.stroke = '#de77ae'
      this.menu.strokeThickness = 10
      this.menu.setShadow(2, 2, "#333333", 2, true, true)
      this.menu.padding.set(10, 16)
      this.menu.inputEnabled = true


      this.jumpButton.onDown.addOnce( () => {
        this.game.physics.arcade.isPaused = false
        this.menu.destroy()
        this.timer = Date.now();
      })

      // timer
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
      
      let finishTime = Number((Date.now() - this.timer)).toString()
      console.log(finishTime/1000  + ' seconds')
      
      // be fair and move ghost if it has a move waiting
      if (this.ghost)
        this._setReplayPosition();
      
      this.game.physics.arcade.isPaused = true

      // menu
      this.menu = this.game.add.text(100, 100 ,'Space to start', {font: "54px Arial Black", fill: "#c51b7d" })
      this.menu.stroke = '#de77ae'
      this.menu.strokeThickness = 10
      this.menu.setShadow(2, 2, "#333333", 2, true, true)
      this.menu.padding.set(10, 16)
      this.menu.inputEnabled = true

      this.jumpButton.onDown.addOnce( () => {
        this.game.physics.arcade.isPaused = false
        this.menu.destroy()
        let p = this.playerGroup.children[0]
        this.player.body.velocity.set(0,0)
        this.player.x = p.x
        this.player.y = p.y
        this.timer = Date.now()
        this.store = setupStore()
        this.game_state.finishTime = false
      })

      /*if (this.game_state.isFinished) {
        this.game.paused = true;
        return;
      }*/

      //this.store.dispatch({type:'FINISH', game_event:'FINISH', time:finishTime})
      //this.game.paused = true
      this.game_state.isFinished = true
      this.game_state.finishTime = finishTime
      
      // save replay and clear
      this.replay = new Replay(this.store.getState())

      //this._addInputToStore(GAME.NO_INPUT);
      
      this.game.trigger(STATE_EVENTS.EXAMPLE_COMPLETED)
      // reset player position
      //let p = this.playerGroup.children[0]
      this.player.reset()
      if (this.ghost)
        this.ghost.destroy()
      this.ghost = new Player(this.game, this.player.x, this.player.y)
      this.ghost.anchor.set(0.5,0.5)
      this.ghost.alpha = 0.5
      this.ghost.body.allowGravity= false
      
      // reset timer
      this.timer = false
      this.timeSlip = false
    }

    _inputSourceKeyboard = () => {
      let i = {up:this.cursors.up.isDown, down:this.cursors.down.isDown, 
            left:this.cursors.left.isDown, right:this.cursors.right.isDown, 
            jump:this.jumpButton.isDown}
     // if (this.game_state.isFinished === false)
        this._addPositionToStore()
        return i
    }

    _setReplayPosition = () =>  {
      // use input from replay
      if (!this.timer)
        this.timer = Date.now()
      
      let p = this.replay.getPosition(this.timer, this)
      if (p) {
        this.ghost.body.position = p
      }
    }

    update() {
      if (this.game.physics.arcade.isPaused) {
        return
      }
        
      // player reached goal
      this.physics.arcade.overlap(this.player, this.goalGroup, () => {
        //this.player.setInputSource()
        this._finish()
      })
       // ghost reached goal
      this.physics.arcade.overlap(this.ghost, this.goalGroup, () => {
        //console.log('Ghost win')
        return
      })

      let input = this.player.getInput()
      
      // player vs tile
      this.physics.arcade.collide(this.player, this.layer, (player, tile) => {
        player.handlePlatform(tile, input)          
      })

      this.player.handleInput(input)

      if (!this.ghost) return;

      this._setReplayPosition();
    }

    _addPositionToStore() {
    //  if (this.game_state.isFinished === true)
    //    return
     let position = {}
     position.x = this.player.body.position.x;
     position.y = this.player.body.position.y;
     this.store.dispatch({type:'STATE_POSITION', id:null, time:Number((Date.now() - this.timer)), position:position})
    }

    render() {
      let timeValue = this.game_state.finishTime? this.game_state.finishTime/1000 : Number((Date.now() - this.timer)/1000).toFixed(2)
        this.countDownText.text = timeValue  + ' s'
    }
}
