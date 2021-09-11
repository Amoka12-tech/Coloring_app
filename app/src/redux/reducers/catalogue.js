export const addToCatalogue = (payload) => ({
  type: 'ADD_TO_CATALOGUE',
  payload,
});

export const removeFromCatalogue = (payload) => ({
  type: 'REMOVE_FROM_CATALOGUE',
  payload,
});

export const setCatalogue = (payload) => ({
  type: 'SET_CATALOGUE',
  payload,
});

export const clearCatalogue = () => ({
  type: 'CLEAR_CATALOGUE',
});

export default (state = [], action) => {
  switch (action.type) {
    case 'ADD_TO_CATALOGUE':
      return state.includes(action.payload)
        ? state
        : [...state, action.payload];

    case 'REMOVE_FROM_CATALOGUE': {
      const i = state.indexOf(action.payload);
      if (i > -1) state.splice(i, 1);
      return state;
    }

    case 'SET_CATALOGUE':
      return action.payload;

    case 'CLEAR_CATALOGUE':
      return [];

    default:
      return state;
  }
};
