import onChange from 'on-change';
import { renderFeedback, renderStreams, renderBlockForm } from './render';
import state from './model';

export const watchedStatus = onChange(state, () => {
  renderFeedback(state.input);
});

export const watchedProcess = onChange(state, () => {
  renderBlockForm(state.input);
});

export const watchedStateData = onChange(state, () => {
  renderStreams(state);
});
