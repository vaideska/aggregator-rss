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

const addPostsInState = (dataStream, feedId, watchedState) => {
  const dataPosts = dataStream.posts;
  const newPosts = [];
  dataPosts.forEach((dataPost) => {
    const { link } = dataPost;
    const oldPost = postInState(link, feedId, watchedState)[0];
    if (oldPost === undefined) {
      newPosts.push(dataPost);
    }
  });

  newPosts.reverse().forEach((dataPost) => {
    const id = _.uniqueId();
    const post = {
      id,
      feedId,
      title: dataPost.title,
      link: dataPost.link,
      description: dataPost.description,
    };
    watchedState.posts.push(post);
  });
};

const addStreamInState = (url, dataStream, watchedState) => {
  const id = _.uniqueId();
  watchedState.feeds.unshift({
    id,
    url,
    title: dataStream.titleFeed,
    description: dataStream.descriptionFeed,
  });

  addPostsInState(dataStream, id, watchedState);
};

const createListenerForm = (watchedState, elemDOM) => {
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
        watchedState.lastUpdatedDate = new Date();
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

  elemDOM.rssFormConteiner.addEventListener('submit', addStream);
};

const updatePosts = (watchedState) => {
  const promises = watchedState.feeds.map((feed) => {
    const urlSream = feed.url;
    return axios.get(`${proxy}${encodeURIComponent(urlSream)}`)
      .then((response) => {
        const dataStream = parseRSS(response.data.contents);
        addPostsInState(dataStream, feed.id, watchedState);
      });
  });
  Promise.all(promises)
    .finally(() => {
      watchedState.lastUpdatedDate = new Date();
    });
};

const createListenerClickLink = (watchedState, elemDOM) => {
  const updateVsitedLink = (e) => {
    const postId = e.target.dataset.id;
    if (postId) {
      watchedState.uiState.visitedPosts.push(postId);
    }
    if (e.target.tagName === 'BUTTON') {
      watchedState.uiState.modalPostId = postId;
    }
  };

  elemDOM.postsConteiner.addEventListener('click', updateVsitedLink);
};

const runApp = (initState, i18next) => {
  const elemDOM = {
    rssFormConteiner: document.querySelector('.rss-form'),
    feedsConteiner: document.querySelector('.feeds'),
    postsConteiner: document.querySelector('.posts'),
  };

  const watchedState = watcher(initState, i18next, elemDOM);

  createListenerForm(watchedState, elemDOM);
  createListenerClickLink(watchedState, elemDOM);

  const cb = () => {
    updatePosts(watchedState);
    setTimeout(cb, updateInterval);
  };

  setTimeout(cb, updateInterval);
};

export default runApp;
