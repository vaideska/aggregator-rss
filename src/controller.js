import * as yup from 'yup';
import axios from 'axios';
import watchedState from './view';

const proxy = 'https://hexlet-allorigins.herokuapp.com/get?url=';

const isValid = (url) => {
  const schema = yup.string().url().matches(/(\.rss$)/);
  return schema.isValid(url);
};

const parserRSS = (data) => {
  const parser = new DOMParser();
  return parser.parseFromString(data, 'application/xml');
};

const changeState = (url, valid) => {
  watchedState.input = {
    url,
    valid,
  };
};

const addStreamInState = (stream) => stream; // !!!

const downloadStream = (url) => {
  axios
    .get(`${proxy}${encodeURIComponent(url)}`).then((response) => {
      if (response.status === 200 && response.data.contents !== '') {
        const stream = parserRSS(response.data.contents);
        addStreamInState(stream);
      } else {
        changeState(url, false);
      }
    })
    .catch(() => {
      changeState(url, false);
    });
};

const controller = (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const url = formData.get('url');
  isValid(url)
    .then((valid) => {
      changeState(url, valid);
    })
    .then(downloadStream(url));
  // изменение state
};

const app = () => {
  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', controller);
};

export default app;
