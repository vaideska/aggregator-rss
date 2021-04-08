import onChange from 'on-change';
import * as render from './render';

export const createWatcher = (state, i18next) => onChange(state, (path, value) => {
  if (path === 'lastUpdatedDate') {
    render.renderStreams(state, i18next);
  }
  if (path === 'statusInputForm') {
    render.renderBlockForm(value, state.errorMsgFeedback, i18next);
  }
});

export const createWatcherIUState = (uiState, i18next) => onChange(uiState, (path, value) => {
  if (path.substr(-7) === 'visited') {
    render.renderVisitedLink(path, uiState);
  }
  if (path === 'modalPostId') {
    render.renderOpenModal(uiState, value, i18next);
  }
});
