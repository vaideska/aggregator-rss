import i18next from 'i18next';
import resources from './locales/index';

import runApp from './controller';

export default () => {
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  }).then(() => {
    const state = {
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
    };

    runApp(state, i18nextInstance);
  });
};
