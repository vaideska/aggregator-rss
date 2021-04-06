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
    render.renderOpenModal(state, value, i18next);
  }
  if (path === 'status') {
    render.renderBlockForm(value);
  }
});
