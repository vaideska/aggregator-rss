/* eslint-disable no-param-reassign */
import _ from 'lodash';
import onChange from 'on-change';

export default (state, i18next, elemDOM) => onChange(state, (path, value) => {
  const getTitle = (title) => (title === 'emptyTitle' ? i18next.t('emptyTitle') : title);

  const renderFeedback = () => {
    const feedbackElement = document.querySelector('.feedback');
    if (state.validURL) {
      feedbackElement.classList.remove('text-danger');
      feedbackElement.classList.add('text-success');
      feedbackElement.textContent = i18next.t('feedbackMessage.successMsg');
      document.querySelector('form').reset();
    } else {
      feedbackElement.classList.remove('text-success');
      feedbackElement.classList.add('text-danger');
      feedbackElement.textContent = i18next.t(`feedbackMessage.${state.errorMsgFeedback}`);
    }
    document.querySelector('input').focus();
  };

  const renderBlockForm = () => {
    if (state.streamLoadingStatus === 'loading') {
      document.querySelector('input').setAttribute('readonly', '');
      document.querySelector('button[type=submit]').setAttribute('disabled', 'disabled');
    } else {
      document.querySelector('input').removeAttribute('readonly', '');
      document.querySelector('button[type=submit]').removeAttribute('disabled', 'disabled');
      renderFeedback();
    }
  };

  const renderVisitedLink = (id) => {
    document.querySelector(`a[data-id="${id}"]`).setAttribute('class', 'fw-normal');
  };

  const renderOpenModal = (postId) => {
    const dataPost = state.posts.filter((post) => post.id === postId)[0];
    const title = getTitle(dataPost.title, i18next);
    document.querySelector('.modal-title').textContent = title;
    document.querySelector('.modal-body').textContent = dataPost.description;
    document.querySelector('.full-article').setAttribute('href', dataPost.link);
  };

  const addFeedPosts = (postsList) => {
    state.posts.forEach((post) => {
      const postElement = document.createElement('li');
      postElement.setAttribute('class', 'list-group-item d-flex justify-content-between align-items-start');
      const visitedLink = _.includes(state.uiState.visitedPosts, post.id);
      const classLink = visitedLink === true ? 'font-weight-normal fw-normal text-decoration-none' : 'font-weight-bold fw-bold text-decoration-none';
      const title = getTitle(post.title, i18next);
      postElement.innerHTML = `<a href = "${post.link}" class="${classLink}" data-id="${post.id}" target="_blank" rel="noopener noreferrer">${title}</a> <button type="button" class="btn btn-primary btn-sm" data-id="${post.id}" data-bs-toggle="modal" data-bs-target="#modal">${i18next.t('modalButtonName')}</button>`;
      postsList.prepend(postElement);
    });
  };

  const renderStreams = () => { //  разделить рендер фидов и постов
    if (state.feeds.length === 0) return;
    elemDOM.feedsConteiner.innerHTML = '';
    elemDOM.postsConteiner.innerHTML = '';

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
    addFeedPosts(postsList);

    elemDOM.feedsConteiner.prepend(feedsList);
    elemDOM.feedsConteiner.prepend(headingFeeds);
    elemDOM.postsConteiner.prepend(postsList);
    elemDOM.postsConteiner.prepend(headingPosts);
  };

  switch (path) {
    case 'lastUpdatedDate': {
      renderStreams();
      break;
    }
    case 'streamLoadingStatus': {
      renderBlockForm();
      break;
    }
    case 'visitedPosts': {
      renderVisitedLink(value);
      break;
    }
    case 'uiState.modalPostId': {
      renderOpenModal(value);
      break;
    }
    default: {
      break;
    }
  }
});
