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
      statusInputForm: 'init',
      errorMsgFeedback: '',
      lastUpdatedDate: '',
      feeds: [], // {id, url, title, description}
      posts: [], // {feedId, id, title, link, description}
    };

    const uiState = {
      modalPostId: '',
      posts: [], //  {id, visited: false}
    };
    /*  const state = {
      lastUpdatedDate: '',
      status: 'init',
      modalPostId: '',
      input: {
        url: '',
        valid: true,
        errorMsg: '',
      },
      streams: [], //  {url, id}
      feeds: [], //  {idStream, id, data: {title, description}}
      posts: [], // {idFeed, id, visited: false, data: {title, link, description}}
    };  */

    runApp(state, uiState, i18nextInstance);
  });
};
