import watchedState from './view';

const controller = (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const url = formData.get('url');
  watchedState.input.value = url;
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
