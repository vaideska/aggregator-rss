/* eslint-disable no-param-reassign */
import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';

import createWatcher from './view';

const proxy = 'https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=';
const updateInterval = 5000;

const catUrl = (url) => {
  const catHttp = url.substring(url.indexOf('//', 0) + 2);
  if (catHttp.substring(0, 4) === 'www.') {
    return catHttp.substring(4);
  }
  return catHttp;
};

const isUrlInState = (url, state) => state.streams.filter(
  (stream) => catUrl(stream.url) === catUrl(url),
).length > 0;

const isValid = (url) => {
  const schema = yup.string().url();
  return schema.isValid(url);
};

const downloadStream = (url) => axios.get(`${proxy}${encodeURIComponent(url)}`);

const parserRSS = (data) => {
  const parser = new DOMParser();
  const parserData = parser.parseFromString(data, 'application/xml');
  if (parserData.querySelector('parsererror') !== null) {
    throw new Error('notValidRss');
  }
  return parserData;
};

/*  const changeStatus = (url, valid, errorMsg = '') => {
  watcher.watchedStatus.input = {
    url,
    valid,
    errorMsg,
  };
};  */

const postInState = (link, idFeed, state) => state.posts.filter(
  (post) => post.idFeed === idFeed && post.data.link === link,
);

const addPostsInState = (dataStream, idFeed, watchedState, state) => {
  const itemElements = dataStream.querySelectorAll('item');
  const newPosts = [];
  itemElements.forEach((itemElement) => {
    const link = itemElement.querySelector('link').textContent;
    const postData = {
      title: itemElement.querySelector('title') === null ? 'emptyTitle' : itemElement.querySelector('title').textContent,
      link,
      description: itemElement.querySelector('description') === null ? '' : itemElement.querySelector('description').textContent,
    };
    const oldPost = postInState(link, idFeed, state)[0];
    if (oldPost !== undefined) {
      oldPost.data = postData;
    } else {
      newPosts.push(postData);
    }
  });

  newPosts.reverse().forEach((dataPost) => {
    const post = {
      id: _.uniqueId(),
      idFeed,
      visited: false,
      data: dataPost,
    };
    watchedState.posts.push(post);
  });
};

const addStreamInState = (url, dataStream, watchedState, state) => {
  const idStream = _.uniqueId();
  const stream = { url, id: idStream };
  watchedState.streams.push(stream);

  const channelElement = dataStream.querySelector('channel');
  const idFeed = _.uniqueId();
  watchedState.feeds.unshift({
    id: idFeed,
    idStream,
    data: {
      title: channelElement.querySelector('title') === null ? 'emptyTitle' : channelElement.querySelector('title').textContent,
      description: channelElement.querySelector('description') === null ? '' : channelElement.querySelector('description').textContent,
    },
  });

  addPostsInState(dataStream, idFeed, watchedState, state);
};

const createListenerForm = (watchedState, state) => {
  const addStream = (element) => {
    element.preventDefault();
    watchedState.status = 'loading';
    const formData = new FormData(element.target);
    const url = formData.get('url').trim();

    if (isUrlInState(url, state)) {
      watchedState.input = { url, valid: false, errorMsg: 'alreadyExists' };
      watchedState.status = 'error';
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
        addStreamInState(url, dataStream, watchedState, state);
        watchedState.lastUpdatedDate = new Date();
        watchedState.input = { url: '', valid: true, errorMsg: '' };
        watchedState.status = 'success';
      })
      .catch((err) => {
        if (err.message === 'Network Error' || err.message === 'no internet') {
          watchedState.input = { url, valid: false, errorMsg: 'networkError' };
        } else {
          watchedState.input = { url, valid: false, errorMsg: err.message };
        }
        watchedState.status = 'error';
      });
  };

  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', addStream);
};

const updatePosts = (state) => {
  const promises = state.feeds.map((feed) => {
    const streamObj = state.streams.filter((stream) => stream.id === feed.idStream);
    const urlSream = streamObj[0].url;
    return downloadStream(urlSream)
      .then((response) => {
        const dataStream = parserRSS(response.data.contents);
        addPostsInState(dataStream, feed.id, state, state);
      })
      .catch(() => {
        throw new Error('unknownError');
      });
  });
  return Promise.all(promises);
};

const createListenerClickLink = (watchedState) => {
  const updateVsitedLink = (e) => {
    const postId = e.target.dataset.id;
    if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
      watchedState.posts.filter((post) => post.id === postId)[0].visited = true;
    }
    if (e.target.tagName === 'BUTTON') {
      watchedState.posts.filter((post) => post.id === postId)[0].visited = true;
      watchedState.modalPostId = postId;
    }
  };

  const posts = document.querySelector('.posts');
  posts.addEventListener('click', updateVsitedLink);
};

const runApp = (state, i18next) => {
  const watchedState = createWatcher(state, i18next);

  createListenerForm(watchedState, state);
  createListenerClickLink(watchedState, state);

  const cb = () => {
    updatePosts(state)
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
