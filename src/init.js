import i18next from 'i18next';
import resources from './locales/index';

import runApp from './controller';

export default () => {
  const i18nextInstance = i18next.createInstance();
  return i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => {
    const state = {
      streamLoadingStatus: 'init',
      validStatus: null,
      errorMsgFeedback: null,
      feeds: [],
      posts: [],
      uiState: {
        modalPostId: null,
        visitedPosts: [],
      },
    };
    runApp(state, i18nextInstance);
  });
};
