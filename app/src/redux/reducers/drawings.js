export const addToDrawings = (payload) => ({
  type: 'ADD_TO_DRAWINGS',
  payload,
});
export const removeFromDrawings = (payload) => ({
  type: 'REMOVE_FROM_DRAWINGS',
  payload,
});
export const setDrawings = (payload) => ({
  type: 'SET_DRAWINGS',
  payload,
});
export const clearDrawings = () => ({
  type: 'CLEAR_DRAWINGS',
});

export default (state = [], action) => {
  switch (action.type) {
    case 'ADD_TO_DRAWINGS':
      return state.includes(action.payload)
        ? state
        : [...state, action.payload];

    case 'REMOVE_FROM_DRAWINGS': {
      const i = state.indexOf(action.payload);
      if (i > -1) state.splice(i, 1);
      return state;
    }

    case 'SET_DRAWINGS':
      return action.payload;

    case 'CLEAR_DRAWINGS':
      return [];

    default:
      return state;
  }
};
