import onChange from 'on-change';
import {
  renderFeedback,
  renderStreams,
  renderBlockForm,
  renderVisitedLink,
  renderOpenModal,
} from './render';
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

export const watchedVisitedLink = onChange(state, (path) => {
  renderVisitedLink(path, state);
});

export const watchedOpenModal = onChange(state, (path, value) => {
  renderOpenModal(state, value);
});
