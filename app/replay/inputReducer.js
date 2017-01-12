
const input = (state, action) => {
  console.log('inputReducer')
  switch (action.type) {
    case 'INPUT':
      return {
        id: action.id,
        time: action.time
      }
    default:
      return state
	}
}

export const inputs = (state = [], action) => {
  switch (action.type) {
    case 'INPUT':
      return [...state, input(undefined, action)]
    default:
      return state
	}
}

export default inputs
