import onChange from 'on-change';
import * as render from './render';

export default (state, i18next, elemDOM) => onChange(state, (path, value) => {
  switch (path) {
    case 'lastUpdatedDate': {
      render.renderStreams(state, i18next, elemDOM);
      break;
    }
    case 'streamLoadingStatus': {
      render.renderBlockForm(state, i18next);
      break;
    }
    case 'visitedPosts': {
      render.renderVisitedLink(value);
      break;
    }
    case 'uiState.modalPostId': {
      render.renderOpenModal(state, value, i18next);
      break;
    }
    default: {
      break;
    }
  }
});
