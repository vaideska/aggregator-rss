/* eslint-disable no-param-reassign */
import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';

import watcher from './watchers';
import parseRSS from './parser';

const proxy = 'https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=';
const updateInterval = 5000;

const getHostNameURL = (url) => {
  const urlObj = new URL(url);
  return urlObj.hostname;
};

const validation = (url, state) => {
  const schemaURL = yup.string().url();
  const schemaNotOneOf = yup.mixed().notOneOf(state.feeds.map((feed) => getHostNameURL(feed.url)));
  try {
    schemaNotOneOf.validateSync(getHostNameURL(url));
    schemaURL.validateSync(url);
  } catch (err) {
    return err.message;
  }
  return true;
};

const postInState = (link, feedId, state) => state.posts.filter(
  (post) => post.feedId === feedId && post.link === link,
);

const addStreamInState = (url, dataStream, watchedState) => {
  const feedId = _.uniqueId();
  watchedState.feeds.unshift({
    id: feedId,
    url,
    title: dataStream.titleFeed,
    description: dataStream.descriptionFeed,
  });

  const newPosts = [];
  dataStream.posts.forEach((dataPost) => {
    const post = {
      id: _.uniqueId(),
      feedId,
      title: dataPost.title,
      link: dataPost.link,
      description: dataPost.description,
    };
    newPosts.unshift(post);
  });
  watchedState.posts.push(...newPosts);
};

const createListenerForm = (watchedState, elementsDOM) => {
  const addStream = (element) => {
    element.preventDefault();

    watchedState.streamLoadingStatus = 'loading';
    const formData = new FormData(element.target);
    const url = formData.get('url').trim();

    const valid = validation(url, watchedState);
    if (valid !== true) {
      const alreadyExists = valid.match(/^this must not be one of/, '');
      watchedState.errorMsgFeedback = alreadyExists === null ? 'validURL' : 'alreadyExists';
      watchedState.validURL = false;
      watchedState.streamLoadingStatus = 'error';
      return;
    }

    axios.get(`${proxy}${encodeURIComponent(url)}`)
      .then((response) => {
        const dataStream = parseRSS(response.data.contents);
        addStreamInState(url, dataStream, watchedState);
        watchedState.errorMsgFeedback = '';
        watchedState.validURL = true;
        watchedState.streamLoadingStatus = 'success';
      })
      .catch((err) => {
        if (err.message === 'Network Error' || err.message === 'no internet') {
          watchedState.errorMsgFeedback = 'networkError';
        } else {
          watchedState.errorMsgFeedback = err.message;
        }
        watchedState.streamLoadingStatus = 'error';
      });
  };

  elementsDOM.rssFormConteiner.addEventListener('submit', addStream);
};

const addNewPostsInState = (dataStream, feedId, watchedState) => {
  const newPosts = [];
  dataStream.posts.forEach((dataPost) => {
    const { link } = dataPost;
    const oldPost = postInState(link, feedId, watchedState)[0];
    if (oldPost === undefined) {
      const post = {
        id: _.uniqueId(),
        feedId,
        title: dataPost.title,
        link,
        description: dataPost.description,
      };
      newPosts.push(post);
    }
  });
  if (newPosts.length !== 0) {
    watchedState.posts.push(...newPosts);
  }
};

const updatePosts = (watchedState) => {
  const streamLoading = (feed) => {
    const urlSream = feed.url;
    return axios.get(`${proxy}${encodeURIComponent(urlSream)}`)
      .then((response) => {
        const dataStream = parseRSS(response.data.contents);
        addNewPostsInState(dataStream, feed.id, watchedState);
      });
  };

  const promises = watchedState.feeds.map(streamLoading);
  Promise.all(promises)
    .finally(() => {
    });
};

const createListenerClickLink = (watchedState, elementsDOM) => {
  const updateVsitedLink = (e) => {
    const postId = e.target.dataset.id;
    if (postId) {
      watchedState.uiState.visitedPosts.push(postId);
    }
    if (e.target.tagName === 'BUTTON') {
      watchedState.uiState.modalPostId = postId;
    }
  };

  elementsDOM.postsConteiner.addEventListener('click', updateVsitedLink);
};

const runApp = (initState, i18next) => {
  const elementsDOM = {
    rssFormConteiner: document.querySelector('.rss-form'),
    inputElement: document.querySelector('input'),
    feedsConteiner: document.querySelector('.feeds'),
    postsConteiner: document.querySelector('.posts'),
    feedbackElement: document.querySelector('.feedback'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalBtnLink: document.querySelector('.full-article'),
  };

  const watchedState = watcher(initState, i18next, elementsDOM);

  createListenerForm(watchedState, elementsDOM);
  createListenerClickLink(watchedState, elementsDOM);

  const cb = () => {
    updatePosts(watchedState);
    setTimeout(cb, updateInterval);
  };

  setTimeout(cb, updateInterval);
};

export default runApp;
