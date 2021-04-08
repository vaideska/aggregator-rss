import onChange from 'on-change';
import * as render from './render';

export const createWatcher = (state, uiState, i18next) => onChange(state, (path, value) => {
  if (path === 'lastUpdatedDate') {
    render.renderStreams(state, uiState, i18next);
  }
  if (path === 'statusInputForm') {
    render.renderBlockForm(value, state.errorMsgFeedback, i18next);
  }
});

export const createWatcherIU = (state, uiState, i18next) => onChange(uiState, (path, value) => {
  if (path.substr(-7) === 'visited') {
    render.renderVisitedLink(path, uiState);
  }
  if (path === 'modalPostId') {
    render.renderOpenModal(state, value, i18next);
  }
});
