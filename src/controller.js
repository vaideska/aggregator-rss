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
  const schemaURL = yup.string().url().required();
  const schemaNotOneOf = yup.mixed().notOneOf(state.feeds.map((feed) => getHostNameURL(feed.url)));
  try {
    schemaNotOneOf.validateSync(getHostNameURL(url));
    schemaURL.validateSync(url);
    return null;
  } catch (err) {
    return err.name;
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

  dataStream.posts.forEach((dataPost) => {
    const post = {
      id: _.uniqueId(),
      feedId,
      title: dataPost.title,
      link: dataPost.link,
      description: dataPost.description,
    };
    watchedState.posts.push(post);
  });
};

const createListenerForm = (watchedState, elementsDOM) => {
  const addStream = (element) => {
    element.preventDefault();

    const formData = new FormData(element.target);
    const url = formData.get('url').trim();

    const valid = validation(url, watchedState);
    if (valid) {
      watchedState.errorMsgFeedback = valid;
      watchedState.validURL = false;
      watchedState.streamLoadingStatus = 'error';
    } else {
      watchedState.validURL = true;
      watchedState.streamLoadingStatus = 'loading';
      axios.get(`${proxy}${encodeURIComponent(url)}`)
        .then((response) => {
          const dataStream = parseRSS(response.data.contents);
          addStreamInState(url, dataStream, watchedState);
          watchedState.errorMsgFeedback = '';
          watchedState.streamLoadingStatus = 'success';
        })
        .catch((err) => {
          if (err.isAxiosError) {
            watchedState.errorMsgFeedback = 'networkError';
          } else if (err.message === 'notValidRss') {
            watchedState.errorMsgFeedback = err.message;
          } else {
            watchedState.errorMsgFeedback = 'unknownError';
          }
          watchedState.streamLoadingStatus = 'error';
        });
    }
  };

  elementsDOM.rssFormConteiner.addEventListener('submit', addStream);
};

const isPostInState = (objStream, objState) => objStream.link === objState.link;

const addNewPostsInState = (dataStream, feedId, watchedState) => {
  const newPosts = _.differenceWith(dataStream.posts, watchedState.posts, isPostInState);
  if (newPosts.length !== 0) {
    newPosts.forEach((dataPost) => {
      const post = {
        id: _.uniqueId(),
        feedId,
        title: dataPost.title,
        link: dataPost.link,
        description: dataPost.description,
      };
      watchedState.posts.push(post);
    });
  }
};

const createListenerClickLink = (watchedState, elementsDOM) => {
  const updateVsitedLink = (e) => {
    const postId = e.target.dataset.id;
    if (postId) {
      watchedState.uiState.visitedPosts.push(postId);
      watchedState.uiState.modalPostId = postId;
    }
  };

  elementsDOM.postsConteiner.addEventListener('click', updateVsitedLink);
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

  const cb = () => {
    const streamLoading = (feed) => {
      const urlSream = feed.url;
      return axios.get(`${proxy}${encodeURIComponent(urlSream)}`)
        .then((response) => {
          const dataStream = parseRSS(response.data.contents);
          addNewPostsInState(dataStream, feed.id, watchedState);
        })
        .catch(() => {});
    };

    const promises = watchedState.feeds.map(streamLoading);
    Promise.all(promises)
      .finally(() => {
        setTimeout(cb, updateInterval);
      });
  };

  setTimeout(cb, updateInterval);
};

export default runApp;
