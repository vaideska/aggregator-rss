import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import { watchedStatus, watchedStateData, watchedProcess } from './view';
import state from './model';

const proxy = 'https://hexlet-allorigins.herokuapp.com/get?url=';

const isUrlInState = (url) => state.streams.filter((stream) => stream.url === url).length > 0;

const isValid = (url) => {
  const schema = yup.string().url();
  return schema.isValid(url);
};

const downloadStream = (url) => axios.get(`${proxy}${encodeURIComponent(url)}`);

const parserRSS = (data) => {
  const parser = new DOMParser();
  return parser.parseFromString(data, 'application/xml');
};

const changeStatus = (url, valid, errorMsg = '') => {
  watchedStatus.input = {
    url,
    valid,
    errorMsg,
  };
};

const addStreamInState = (url, dataStream) => {
  const idStream = _.uniqueId();
  const stream = { url, id: idStream };

  const channelElement = dataStream.querySelector('channel');
  const idFeed = _.uniqueId();
  state.feeds.push({
    id: idFeed,
    idStream,
    data: {
      title: channelElement.querySelector('title').textContent,
      description: channelElement.querySelector('description').textContent,
    },
  });

  const itemElements = dataStream.querySelectorAll('item');
  itemElements.forEach((itemElement) => {
    const post = {
      id: _.uniqueId(),
      idFeed,
      data: {
        title: itemElement.querySelector('title').textContent,
        link: itemElement.querySelector('link').textContent,
        description: itemElement.querySelector('description').textContent,
      },
    };
    state.posts.push(post);
  });

  watchedStateData.streams.push(stream);
  changeStatus('', true);
};

const controller = (element) => {
  element.preventDefault();
  const formData = new FormData(element.target);
  const url = formData.get('url');

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
      if (response.data.contents !== '' && response.data.contents !== null) {
        const dataStream = parserRSS(response.data.contents);
        addStreamInState(url, dataStream);
      } else {
        throw new Error('Ресурс не содержит валидный RSS');
      }
    })
    .catch((err) => {
      changeStatus(url, false, err.message);
    });
};

const app = () => {
  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', controller);
};

export default app;
