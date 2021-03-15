const render = (state) => {
  document.querySelector('.feedback').textContent = state.input.valid;
};

export default render;
