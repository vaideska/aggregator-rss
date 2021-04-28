/* eslint-disable no-param-reassign */
import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';

import watcher from './watchers';
import parseRSS from './parser';

const proxy = 'https://hexlet-allorigins.herokuapp.com';
const updateInterval = 5000;

const getProxyURL = (url) => {
  const proxyURL = new URL(proxy);
  proxyURL.pathname = 'get';
  proxyURL.searchParams.set('disableCache', 'true');
  proxyURL.searchParams.set('url', url);
  return proxyURL.toString();
};

yup.setLocale({
  string: {
    url: 'validURL',
    default: 'unknownError',
  },
  mixed: {
    notOneOf: 'alreadyExists',
    default: 'unknownError',
  },
});

const baseUrlSchema = yup.string().url().required();

const validateUrl = (url, feeds) => {
  const feedUrls = feeds.map((feed) => feed.url);
  const actualUrlSchema = baseUrlSchema.notOneOf(feedUrls);
  try {
    actualUrlSchema.validateSync(url);
    return null;
  } catch (e) {
    return e.message;
  }
};

const addStreamInState = (url, dataStream, watchedState) => {
  const feedId = _.uniqueId();
  watchedState.feeds.unshift({
    id: feedId,
    url,
    title: dataStream.titleFeed,
    description: dataStream.descriptionFeed,
  });

  const newPosts = dataStream.posts.map((dataPost) => ({
    id: _.uniqueId(),
    feedId,
    title: dataPost.title,
    link: dataPost.link,
    description: dataPost.description,
  }));
  watchedState.posts.push(...newPosts);
};

const createListenerForm = (watchedState, elementsDOM) => {
  const addStream = (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const url = formData.get('url').trim();

    watchedState.streamLoadingStatus = 'init';
    watchedState.validStatus = 'valid';
    const error = validateUrl(url, watchedState.feeds);

    if (error) {
      watchedState.errorMsgFeedback = error;
      watchedState.validStatus = 'error';
    } else {
      watchedState.validStatus = 'success';
      watchedState.streamLoadingStatus = 'loading';
      axios.get(getProxyURL(url))
        .then((response) => {
          const dataStream = parseRSS(response.data.contents);
          addStreamInState(url, dataStream, watchedState);
          watchedState.streamLoadingStatus = 'success';
          watchedState.errorMsgFeedback = '';
        })
        .catch((err) => {
          if (err.isAxiosError) {
            watchedState.errorMsgFeedback = 'networkError';
          } else if (err.isParsingError) {
            watchedState.errorMsgFeedback = 'notValidRss';
          } else {
            watchedState.errorMsgFeedback = 'unknownError';
          }
          watchedState.streamLoadingStatus = 'error';
        });
    }
  };

  elementsDOM.rssFormConteiner.addEventListener('submit', addStream);
};

const createListenerClickLink = (watchedState, elementsDOM) => {
  const updateVsitedLink = (event) => {
    const postId = event.target.dataset.id;
    if (postId) {
      watchedState.uiState.visitedPosts.push(postId);
      watchedState.uiState.modalPostId = postId;
    }
  };

  elementsDOM.postsConteiner.addEventListener('click', updateVsitedLink);
};

const isPostInState = (objStream, objState) => objStream.title === objState.title;

const addNewPostsInState = (dataStream, feedId, watchedState) => {
  const stateFeedPosts = watchedState.posts.filter((post) => post.feedId === feedId);
  const differencePosts = _.differenceWith(dataStream.posts, stateFeedPosts, isPostInState);
  const newPosts = differencePosts.map((dataPost) => ({
    id: _.uniqueId(),
    feedId,
    title: dataPost.title,
    link: dataPost.link,
    description: dataPost.description,
  }));
  watchedState.posts.push(...newPosts);
};

const updatePosts = (watchedState) => {
  const streamLoading = (feed) => {
    const urlSream = feed.url;
    return axios.get(getProxyURL(urlSream))
      .then((response) => {
        const dataStream = parseRSS(response.data.contents);
        addNewPostsInState(dataStream, feed.id, watchedState);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err.message);
      });
  };

  const promises = watchedState.feeds.map(streamLoading);
  Promise.all(promises)
    .finally(() => {
      setTimeout(updatePosts, updateInterval, watchedState);
    });
};

const runApp = (initState, i18next) => {
  const elementsDOM = {
    rssFormConteiner: document.querySelector('.rss-form'),
    feedsConteiner: document.querySelector('.feeds'),
    postsConteiner: document.querySelector('.posts'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalBtnLink: document.querySelector('.full-article'),
  };

  const watchedState = watcher(initState, i18next, elementsDOM);

  createListenerForm(watchedState, elementsDOM);
  createListenerClickLink(watchedState, elementsDOM);

  setTimeout(updatePosts, updateInterval, watchedState);
};

export default runApp;
