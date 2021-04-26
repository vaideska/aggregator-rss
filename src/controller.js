/* eslint-disable no-param-reassign */
import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';

import watcher from './watchers';
import parseRSS from './parser';

const proxy = 'https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=';
const updateInterval = 5000;

const validation = (url, state) => {
  const schemaURL = yup.string().required().url();
  const schema = yup.mixed()
    .notOneOf(state.feeds.map((feed) => feed.url)).concat(schemaURL);
  try {
    schema.validateSync(url);
    return null;
  } catch (err) {
    return err.message;
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

    const error = validation(url, watchedState);

    if (error) {
      //  console.log(error.message.key, '!!!', error.key);
      watchedState.errorMsgFeedback = error === 'this must be a valid URL' ? 'validURL' : 'alreadyExists';
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

const updatePosts = (watchedState) => {
  const streamLoading = (feed) => {
    const urlSream = feed.url;
    return axios.get(`${proxy}${encodeURIComponent(urlSream)}`)
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
