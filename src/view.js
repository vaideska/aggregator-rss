import onChange from 'on-change';
import * as render from './render';
import state from './model';

export const watchedStatus = onChange(state, () => {
  render.renderFeedback(state.input);
});

export const watchedProcess = onChange(state, () => {
  render.renderBlockForm(state.input);
});

export const watchedStateData = onChange(state, () => {
  render.renderStreams(state);
});

export const watchedVisitedLink = onChange(state, (path) => {
  render.renderVisitedLink(path, state);
});

export const watchedOpenModal = onChange(state, (path, value) => {
  render.renderOpenModal(state, value);
});
