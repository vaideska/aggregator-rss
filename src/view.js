import onChange from 'on-change';
import render from './render';
import state from './state';

const watchedState = onChange(state, () => {
  render(state);
});

export default watchedState;
