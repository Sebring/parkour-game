
const input = (state, action) => {
  switch (action.type) {
    case 'INPUT':
      return {
        input: action.id,
        time: action.time
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

export const inputs = (state = [], action) => {
  switch (action.type) {
    case 'INPUT':
      return [...state, input(undefined, action)]
    case 'FINISH':
      return [...state, finish(undefined, action)]
    default:
      return state
	}
}

export default inputs
