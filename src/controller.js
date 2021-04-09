/* eslint-disable no-param-reassign */
import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';

import { createWatcher, createWatcherIU } from './view';
import parserRSS from './parser/parser';

const proxy = 'https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=';
const updateInterval = 5000;

const catUrl = (url) => {
  const catHttp = url.substring(url.indexOf('//', 0) + 2);
  if (catHttp.substring(0, 4) === 'www.') {
    return catHttp.substring(4);
  }
  return catHttp;
};

const isUrlInState = (url, state) => state.feeds.filter(
  (feed) => catUrl(feed.url) === catUrl(url),
).length > 0;

const isValid = (url) => {
  const schema = yup.string().url();
  return schema.isValid(url);
};

const downloadStream = (url) => axios.get(`${proxy}${encodeURIComponent(url)}`);

const postInState = (link, feedId, state) => state.posts.filter(
  (post) => post.feedId === feedId && post.link === link,
);

const addPostsInState = (dataStream, feedId, watchedState, watchedUIState) => {
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
    watchedUIState.posts.push({ id, visited: false });
  });
};

const addStreamInState = (url, dataStream, watchedState, watchedUIState) => {
  const id = _.uniqueId();
  watchedState.feeds.unshift({
    id,
    url,
    title: dataStream.titleFeed,
    description: dataStream.descriptionFeed,
  });

  addPostsInState(dataStream, id, watchedState, watchedUIState);
};

const createListenerForm = (watchedState, watchedUIState) => {
  const addStream = (element) => {
    element.preventDefault();

    watchedState.statusInputForm = 'loading';
    const formData = new FormData(element.target);
    const url = formData.get('url').trim();

    if (isUrlInState(url, watchedState)) {
      watchedState.errorMsgFeedback = 'alreadyExists';
      watchedState.statusInputForm = 'error';
      return;
    }

    isValid(url)
      .then((valid) => {
        if (!valid) {
          throw new Error('validURL');
        }
        return downloadStream(url);
      })
      .then((response) => {
        const dataStream = parserRSS(response.data.contents);
        addStreamInState(url, dataStream, watchedState, watchedUIState);
        watchedState.lastUpdatedDate = new Date();
        watchedState.errorMsgFeedback = '';
        watchedState.statusInputForm = 'success';
      })
      .catch((err) => {
        if (err.message === 'Network Error' || err.message === 'no internet') {
          watchedState.errorMsgFeedback = 'networkError';
        } else {
          watchedState.errorMsgFeedback = err.message;
        }
        watchedState.statusInputForm = 'error';
      });
  };

  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', addStream);
};

const updatePosts = (watchedState, watchedUIState) => {
  const promises = watchedState.feeds.map((feed) => {
    const urlSream = feed.url;
    return downloadStream(urlSream)
      .then((response) => {
        const dataStream = parserRSS(response.data.contents);
        addPostsInState(dataStream, feed.id, watchedState, watchedUIState);
      })
      .catch(() => {
        throw new Error('unknownError');
      });
  });
  return Promise.all(promises);
};

const createListenerClickLink = (watchedUIState) => {
  const updateVsitedLink = (e) => {
    const postId = e.target.dataset.id;
    if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
      watchedUIState.posts.filter((post) => post.id === postId)[0].visited = true;
    }
    if (e.target.tagName === 'BUTTON') {
      watchedUIState.posts.filter((post) => post.id === postId)[0].visited = true;
      watchedUIState.modalPostId = postId;
    }
  };

  const posts = document.querySelector('.posts');
  posts.addEventListener('click', updateVsitedLink);
};

const runApp = (initState, initUIState, i18next) => {
  const watchedState = createWatcher(initState, initUIState, i18next);
  const watchedUIState = createWatcherIU(initState, initUIState, i18next);

  createListenerForm(watchedState, watchedUIState);
  createListenerClickLink(watchedUIState);

  const cb = () => {
    updatePosts(watchedState, watchedUIState)
      .then(() => {
        watchedState.lastUpdatedDate = new Date();
        setTimeout(cb, updateInterval);
      })
      .catch(() => {
        setTimeout(cb, updateInterval);
      });
  };

  setTimeout(cb, updateInterval);
};

export default runApp;
