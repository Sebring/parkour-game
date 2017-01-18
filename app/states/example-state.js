import GAME from '../constants/game'
import PLAYER from '../constants/player'
import STATE_EVENTS from '../constants/state-events'
import { Player } from '../models/player'
import setupStore from '../replay/setupStore'
import { Replay } from '../replay/replay'
import { Menu} from '../menu/menu'

export class ExampleState extends Phaser.State {
    map = null
    layer = null


    create() {

      // game states
      this.game_state = {
        isFinished: false,
        finishTime: false,
        replayState: undefined
      }

      // store
     // this.store = setupStore()
     // this._renderStore()
     // this.store.subscribe(this._renderStore)
     // this.lastInput = false;
      
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
      this.Menu = new Menu(this.game)
      this.Menu.addMenuItem('Start New', undefined, 100, () => {
        this.startNewGame(true)
      })
      //this.menuFactory.select(this.menu[0])

      this.jumpButton.onDown.add( () => {
        if (this.Menu.isVisible())
          this.Menu.onAction()
      })

      this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN).onDown.add( () => {
        if (this.Menu.isVisible())
          this.Menu.selectNext()
      })
      this.game.input.keyboard.addKey(Phaser.Keyboard.UP).onDown.add( () => {
        if (this.Menu.isVisible())
          this.Menu.selectPrev()
      })


      // timer
      const bannerText = 'Parkour.io'
      this.countDownText = this.game.add.text(this.world.centerX, 25, bannerText)
      //banner.font = 'Bangers'
      this.countDownText.padding.set(10, 16)
      this.countDownText.fontSize = 32
      this.countDownText.fill = '#000'
      this.countDownText.smoothed = false
      this.countDownText.anchor.setTo(0.5)

      // author and version text
      let author = this.game.add.text(this.world.centerX, this.world.bottom - 30, 
        'v'+GAME.VERSION + ' - Johan Sebring')
      author.fontSize = 16
    }

    _renderStore = () => {
    /* console.log('dispatch')
      console.log(this.store.getState())
    */
    }

    _resetGame(resetStore = true) {
      this.player.reset()
      this.timer = false
      if (this.ghost)
        this.ghost.destroy()
      this.ghost = false
      if (resetStore) {
        this.store = setupStore()
        this.replay = null
      }
      this.game_state.finishTime = false
    }

    _startGame() {
      this.timer = Date.now()
      this.Menu.hide()
      this.game.physics.arcade.isPaused = false
    }

    startNewGame(startGame = false) {  
      
      // reset game state and replay
      this._resetGame(true)

      // start game?
      startGame && this._startGame()
    }

    startNewRace(startGame = false) {      

      // reset game state
      this._resetGame(false)

      // reset ghost
      this.ghost = new Player(this.game, this.player.x, this.player.y)
      this.ghost.anchor.set(0.5,0.5)
      this.ghost.alpha = 0.5
      this.ghost.body.allowGravity= false

      // replay
      this.replay.reset() // = new Replay(this.store.getState())
      this.store = setupStore()

      // start game
      startGame && this._startGame()
    }

    _finish() {
      console.log("WIN CONDITION!")
      
      // timer
      let finishTime = Number((Date.now() - this.timer)).toString()
      this.game_state.finishTime = finishTime
      console.log(finishTime/1000  + ' seconds')
      
      // reset player (do this before pause)
      this.player.reset()
      if (this.ghost) {
        // update ghost to latest tick
        this._setReplayPosition();
      }
      
      // save replay
      this.replay = new Replay(this.store.getState())
  
      // menu
      // FIXME: hide if no ghost
      this.Menu.addMenuItem('Race vs Ghost', undefined, undefined, () => {
        this.startNewRace(true)
      })
      
      this.Menu.show()

      // pause
      this.game.physics.arcade.isPaused = true


      
      // save replay and clear
     // this.replay = new Replay(this.store.getState())

      // example - trigger event
      //this.game.trigger(STATE_EVENTS.EXAMPLE_COMPLETED)
    }

    _inputSourceKeyboard = () => {
      let i = {up:this.cursors.up.isDown, down:this.cursors.down.isDown, 
            left:this.cursors.left.isDown, right:this.cursors.right.isDown, 
            jump:this.jumpButton.isDown}

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
