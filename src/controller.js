import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import {
  watchedStatus,
  watchedStateData,
  watchedProcess,
  watchedVisitedLink,
  watchedOpenModal,
} from './view';
import state from './model';

const proxy = 'https://hexlet-allorigins.herokuapp.com/get?url=';
const updateInterval = 5000;
const intervalError = 1000;

const catUrl = (url) => url.substring(url.indexOf('//', 0));

const isUrlInState = (url) => state.streams.filter(
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
    throw new Error('Ресурс не содержит валидный RSS');
  }
  return parserData;
};

const changeStatus = (url, valid, errorMsg = '') => {
  watchedStatus.input = {
    url,
    valid,
    errorMsg,
  };
};

const postInState = (link, idFeed) => state.posts.filter(
  (post) => post.idFeed === idFeed && post.data.link === link,
);

const addPostsInState = (dataStream, idFeed) => {
  const itemElements = dataStream.querySelectorAll('item');
  const newPosts = [];
  itemElements.forEach((itemElement) => {
    const link = itemElement.querySelector('link').textContent;
    const postData = {
      title: itemElement.querySelector('title').textContent,
      link,
      description: itemElement.querySelector('description') === null ? '' : itemElement.querySelector('description').textContent,
    };
    const oldPost = postInState(link, idFeed)[0];
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
    state.posts.push(post);
  });
};

const addStreamInState = (url, dataStream) => {
  const idStream = _.uniqueId();
  const stream = { url, id: idStream };
  state.streams.push(stream);

  const channelElement = dataStream.querySelector('channel');
  const idFeed = _.uniqueId();
  state.feeds.unshift({
    id: idFeed,
    idStream,
    data: {
      title: channelElement.querySelector('title').textContent,
      description: channelElement.querySelector('description') === null ? '' : channelElement.querySelector('description').textContent,
    },
  });

  addPostsInState(dataStream, idFeed);
};

const controller = (element) => {
  element.preventDefault();
  const formData = new FormData(element.target);
  const url = formData.get('url').trim();

  watchedProcess.input.url = url;

  if (isUrlInState(url)) {
    changeStatus(url, false, 'RSS уже существует');
    return;
  }

  isValid(url)
    .then((valid) => {
      if (!valid) {
        throw new Error('Ссылка должна быть валидным URL');
      }
      return downloadStream(url);
    })
    .then((response) => {
      const dataStream = parserRSS(response.data.contents);
      addStreamInState(url, dataStream);
      watchedStateData.lastUpdatedDate = new Date();
      changeStatus('', true);
    })
    .catch((err) => {
      changeStatus(url, false, err.message);
    });
};

const updatePosts = () => {
  const promises = state.feeds.map((feed) => {
    const streamObj = state.streams.filter((stream) => stream.id === feed.idStream);
    const urlSream = streamObj[0].url;
    return downloadStream(urlSream)
      .then((response) => {
        const dataStream = parserRSS(response.data.contents);
        addPostsInState(dataStream, feed.id);
      })
      .catch((e) => {
        throw e;
      });
  });
  return Promise.all(promises);
};

const updateVsitedLink = (e) => {
  const postId = e.target.dataset.id;
  if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
    watchedVisitedLink.posts.filter((post) => post.id === postId)[0].visited = true;
  }
  if (e.target.tagName === 'BUTTON') {
    watchedVisitedLink.posts.filter((post) => post.id === postId)[0].visited = true;
    watchedOpenModal.modalPostId = postId;
  }
};

const app = () => {
  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', controller);

  const posts = document.querySelector('.posts');
  posts.addEventListener('click', updateVsitedLink);

  let delay = updateInterval;
  const cb = () => {
    updatePosts()
      .then(() => {
        watchedStateData.lastUpdatedDate = new Date();
        delay = updateInterval;
        setTimeout(cb, delay);
      })
      .catch(() => {
        delay += intervalError;
        setTimeout(cb, delay);
      });
  };

  setTimeout(cb, delay);
};

export default app;
