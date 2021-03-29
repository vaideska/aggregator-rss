import i18next from 'i18next';

export const renderBlockForm = (input) => {
  if (input.url !== '' && input.valid) {
    document.querySelector('input').setAttribute('disabled', 'disabled');
    document.querySelector('button[type=submit]').setAttribute('disabled', 'disabled');
  } else {
    document.querySelector('input').removeAttribute('disabled', 'disabled');
    document.querySelector('button[type=submit]').removeAttribute('disabled', 'disabled');
  }
};

export const renderFeedback = (input) => {
  const feedbackElement = document.querySelector('.feedback');
  if (input.valid) {
    feedbackElement.classList.add('text-success');
    feedbackElement.textContent = i18next.t('feedbackMessage.successMsg');
    document.querySelector('form').reset();
  } else {
    feedbackElement.classList.add('text-danger');
    feedbackElement.textContent = input.errorMsg;
  }
  renderBlockForm(input);
  document.querySelector('input').focus();
};

export const renderVisitedLink = (path, state) => {
  const id = path.replace(/\D+/g, '');
  document.querySelector(`a[data-id="${state.posts[id].id}"]`).setAttribute('class', 'fw-normal');
};

export const renderOpenModal = (state, idPost) => {
  const dataPost = state.posts.filter((post) => post.id === idPost)[0].data;
  document.querySelector('.modal-title').textContent = dataPost.title;
  document.querySelector('.modal-body').textContent = dataPost.description;
  document.querySelector('.full-article').setAttribute('href', dataPost.link);
};

const addFeedPosts = (postsList, posts) => {
  posts.forEach((post) => {
    const postElement = document.createElement('li');
    postElement.setAttribute('class', 'list-group-item d-flex justify-content-between align-items-start');
    const classLink = post.visited === true ? 'fw-normal' : 'fw-bold';
    postElement.innerHTML = `<a href = "${post.data.link}" class=${classLink} data-id="${post.id}" target="_blank" rel="noopener noreferrer">${post.data.title}</a>
    <button type="button" class="btn btn-primary btn-sm" data-id="${post.id}" data-bs-toggle="modal" data-bs-target="#modal">${i18next.t('modalButtonName')}</button>`;
    postsList.prepend(postElement);
  });
};

export const renderStreams = (state) => {
  if (state.streams.length === 0) return;
  const feedsConteiner = document.querySelector('.feeds');
  feedsConteiner.innerHTML = '';

  const postsConteiner = document.querySelector('.posts');
  postsConteiner.innerHTML = '';

  const headingFeeds = document.createElement('h2');
  headingFeeds.textContent = i18next.t('feeds');

  const headingPosts = document.createElement('h2');
  headingPosts.textContent = i18next.t('posts');

  const feedsList = document.createElement('ul');
  feedsList.setAttribute('class', 'list-group mb-5');

  const postsList = document.createElement('ul');
  postsList.setAttribute('class', 'list-group mb-5');

  state.feeds.forEach((feed) => {
    const feedElement = document.createElement('li');
    feedElement.setAttribute('class', 'list-group-item');
    feedElement.innerHTML = `<h3>${feed.data.title}</h3><p>${feed.data.description}</p>`;
    feedsList.append(feedElement);
  });
  addFeedPosts(postsList, state.posts);

  feedsConteiner.prepend(feedsList);
  feedsConteiner.prepend(headingFeeds);
  postsConteiner.prepend(postsList);
  postsConteiner.prepend(headingPosts);
};
//  https://meduza.io/rss2/all
//  https://www.yahoo.com/news/rss
//  https://www.sports.ru/tribuna/blogs/utkin/rss.xml
