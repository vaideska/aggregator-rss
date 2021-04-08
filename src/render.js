const getTitle = (title, i18next) => (title === 'emptyTitle' ? i18next.t('emptyTitle') : title);

const renderFeedback = (errorMsgFeedback, i18next) => {
  const feedbackElement = document.querySelector('.feedback');
  if (errorMsgFeedback === '') {
    feedbackElement.classList.remove('text-danger');
    feedbackElement.classList.add('text-success');
    feedbackElement.textContent = i18next.t('feedbackMessage.successMsg');
    document.querySelector('form').reset();
  } else {
    feedbackElement.classList.remove('text-success');
    feedbackElement.classList.add('text-danger');
    feedbackElement.textContent = i18next.t(`feedbackMessage.${errorMsgFeedback}`);
  }
  document.querySelector('input').focus();
};

export const renderBlockForm = (status, errorMsgFeedback, i18next) => {
  if (status === 'loading') {
    document.querySelector('input').setAttribute('readonly', '');
    document.querySelector('button[type=submit]').setAttribute('disabled', 'disabled');
  } else {
    document.querySelector('input').removeAttribute('readonly', '');
    document.querySelector('button[type=submit]').removeAttribute('disabled', 'disabled');
    renderFeedback(errorMsgFeedback, i18next);
  }
};

export const renderVisitedLink = (path, state) => {
  const id = path.replace(/\D+/g, '');
  document.querySelector(`a[data-id="${state.posts[id].id}"]`).setAttribute('class', 'fw-normal');
};

export const renderOpenModal = (state, postId, i18next) => {
  const dataPost = state.posts.filter((post) => post.id === postId)[0];
  const title = getTitle(dataPost.title, i18next);
  document.querySelector('.modal-title').textContent = title;
  document.querySelector('.modal-body').textContent = dataPost.description;
  document.querySelector('.full-article').setAttribute('href', dataPost.link);
};

const addFeedPosts = (postsList, posts, uiState, i18next) => {
  posts.forEach((post) => {
    const postElement = document.createElement('li');
    postElement.setAttribute('class', 'list-group-item d-flex justify-content-between align-items-start');
    const visitedLink = uiState.posts.filter((postIU) => postIU.id === post.id)[0].visited;
    console.log(uiState);
    const classLink = visitedLink === true ? 'font-weight-normal fw-normal' : 'font-weight-bold fw-bold';
    const title = getTitle(post.title, i18next);
    postElement.innerHTML = `<a href = "${post.link}" class="${classLink}" data-id="${post.id}" target="_blank" rel="noopener noreferrer">${title}</a> <button type="button" class="btn btn-primary btn-sm" data-id="${post.id}" data-bs-toggle="modal" data-bs-target="#modal">${i18next.t('modalButtonName')}</button>`;
    postsList.prepend(postElement);
  });
};

export const renderStreams = (state, uiState, i18next) => {
  if (state.feeds.length === 0) return;
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
    const title = getTitle(feed.title, i18next);
    feedElement.innerHTML = `<h3>${title}</h3><p>${feed.description}</p>`;
    feedsList.append(feedElement);
  });
  addFeedPosts(postsList, state.posts, uiState, i18next);

  feedsConteiner.prepend(feedsList);
  feedsConteiner.prepend(headingFeeds);
  postsConteiner.prepend(postsList);
  postsConteiner.prepend(headingPosts);
};
//  https://meduza.io/rss2/all
//  https://www.yahoo.com/news/rss
//  https://www.sports.ru/tribuna/blogs/utkin/rss.xml
