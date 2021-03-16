const render = (state) => {
  if (state.input.valid) {
    document.querySelector('.feedback').textContent = 'строка является rss';
  } else {
    document.querySelector('.feedback').textContent = 'строка не является rss';
  }
};

export default render;
