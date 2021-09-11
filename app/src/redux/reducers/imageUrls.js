export const addUrl = (payload) => ({
  type: 'ADD_URL',
  payload,
});

export const setUrls = (payload) => ({
  type: 'SET_URLS',
  payload,
});

export const clearUrls = () => ({
  type: 'CLEAR_URLS',
});

export default (state = [], action) => {
  switch (action.type) {
    case 'ADD_URL':
      return state.includes(action.payload)
        ? state
        : [...state, action.payload];

    case 'SET_URLS':
      return action.payload;

    case 'CLEAR_URLS':
      return [];

    default:
      return state;
  }
};
