import onChange from 'on-change';
import * as render from './render';

const createWatcher = (state, uiState, i18next, elemDOM) => onChange(state, (path, value) => {
  if (path === 'lastUpdatedDate') {
    render.renderStreams(state, uiState, i18next, elemDOM);
  }
  if (path === 'statusInputForm') {
    render.renderBlockForm(value, state.errorMsgFeedback, i18next);
  }
});

const createWatcherIU = (state, uiState, i18next) => onChange(uiState, (path, value) => {
  if (path.substr(-7) === 'visited') {
    render.renderVisitedLink(path, uiState);
  }
  if (path === 'modalPostId') {
    render.renderOpenModal(state, value, i18next);
  }
});

export { createWatcher, createWatcherIU };
