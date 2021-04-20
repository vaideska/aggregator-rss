import onChange from 'on-change';
import * as render from './render';

export default (state, i18next, elemDOM) => onChange(state, (path, value) => {
  if (path === 'lastUpdatedDate') {
    render.renderStreams(state, i18next, elemDOM);
  }
  if (path === 'streamLoadingStatus') {
    render.renderBlockForm(state, i18next);
  }
  if (path === 'visitedPosts') {
    render.renderVisitedLink(value);
  }
  if (path === 'uiState.modalPostId') {
    render.renderOpenModal(state, value, i18next);
  }
});
