
const input = (state, action) => {
  switch (action.type) {
    case 'STATE_POSITION':
      return {
        input: action.id,
        time: action.time,
        position: action.position
      }
    default:
      return state
	}
}

const finish = (state, action) => {
  return {
    game_event: action.game_event,
    time: action.time
  }
}

export const positions = (state = [], action) => {
  switch (action.type) {
    case 'STATE_POSITION':
      return [...state, input(undefined, action)]
    case 'FINISH':
      return [...state, finish(undefined, action)]
    default:
      return state
	}
}

export default positions
