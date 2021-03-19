export const renderBlockForm = (input) => {
  if (input.url !== '' && input.valid) {
    document.querySelector('input').setAttribute('disabled', 'disabled');
    document.querySelector('button').setAttribute('disabled', 'disabled');
  } else {
    document.querySelector('input').removeAttribute('disabled', 'disabled');
    document.querySelector('button').removeAttribute('disabled', 'disabled');
  }
};

export const renderFeedback = (input) => {
  if (input.valid) {
    document.querySelector('.feedback').textContent = 'RSS успешно загружен';
    document.querySelector('form').reset();
  } else {
    document.querySelector('.feedback').textContent = input.errorMsg;
  }
  renderBlockForm(input);
  document.querySelector('input').focus();
};

export const renderStreams = (state) => {
  if (state.input.valid) {
    document.querySelector('.feedback').textContent = state.input.errorMsg;
  } else {
    document.querySelector('.feedback').textContent = state.input.errorMsg;
  }
};
