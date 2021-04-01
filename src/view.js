import onChange from 'on-change';
import * as render from './render';

export default (state, i18next) => onChange(state, (path, value) => {
  if (path === 'input') {
    render.renderFeedback(state.input, i18next);
  }
  if (path === 'lastUpdatedDate') {
    render.renderStreams(state, i18next);
  }
  if (path.substr(-7) === 'visited') {
    render.renderVisitedLink(path, state);
  }
  if (path === 'modalPostId') {
    render.renderOpenModal(state, value);
  }
  if (path === 'status') {
    render.renderBlockForm(value);
  }
});

/*  export const watchedStatus = onChange(state, () => {
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
}); */
