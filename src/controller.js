import * as yup from 'yup';
import watchedState from './view';

const isValid = (url) => {
  const schema = yup.string().url().matches(/(\.rss$)/);
  return schema.isValid(url).then((valid) => valid);
};

const controller = (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const url = formData.get('url');
  isValid(url).then((valid) => {
    watchedState.input = {
      url,
      valid,
    };
  });
  //  валидация url -> изменение state при ошибки
  //  скачивание потока
  //  парсинг данных потока
  // изменение state
};

const app = () => {
  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', controller);
};

export default app;
