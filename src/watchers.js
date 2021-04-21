/* eslint-disable no-param-reassign */
import _ from 'lodash';
import onChange from 'on-change';

export default (state, i18next, elementsDOM) => onChange(state, (path, value) => {
  const getTitle = (title) => (title === 'emptyTitle' ? i18next.t('emptyTitle') : title);

  const renderFeedback = () => {
    const { feedbackElement } = elementsDOM;
    if (state.validURL) {
      feedbackElement.classList.remove('text-danger');
      feedbackElement.classList.add('text-success');
      feedbackElement.textContent = i18next.t('feedbackMessage.successMsg');
      elementsDOM.rssFormConteiner.reset();
    } else {
      feedbackElement.classList.remove('text-success');
      feedbackElement.classList.add('text-danger');
      feedbackElement.textContent = i18next.t(`feedbackMessage.${state.errorMsgFeedback}`);
    }
    elementsDOM.inputElement.focus();
  };

  const renderBlockForm = () => {
    if (state.streamLoadingStatus === 'loading') {
      elementsDOM.inputElement.setAttribute('readonly', '');
      document.querySelector('button[type=submit]').setAttribute('disabled', 'disabled');
    } else {
      elementsDOM.inputElement.removeAttribute('readonly', '');
      document.querySelector('button[type=submit]').removeAttribute('disabled', 'disabled');
      renderFeedback();
    }
  };

  const renderVisitedLink = (visitedPosts) => {
    const visitedLastPostId = visitedPosts[visitedPosts.length - 1];
    document.querySelector(`a[data-id="${visitedLastPostId}"]`).setAttribute('class', 'fw-normal');
  };

  const renderOpenModal = (postId) => {
    const dataPost = state.posts.filter((post) => post.id === postId)[0];
    const title = getTitle(dataPost.title, i18next);
    elementsDOM.modalTitle.textContent = title;
    elementsDOM.modalBody.textContent = dataPost.description;
    document.querySelector('.full-article').setAttribute('href', dataPost.link);
  };

  const renderFeeds = () => {
    elementsDOM.feedsConteiner.innerHTML = '';

    const headingFeeds = document.createElement('h2');
    headingFeeds.textContent = i18next.t('feeds');

    const feedsList = document.createElement('ul');
    feedsList.setAttribute('class', 'list-group mb-5');

    state.feeds.forEach((feed) => {
      const feedElement = document.createElement('li');
      feedElement.setAttribute('class', 'list-group-item');
      const title = getTitle(feed.title, i18next);
      feedElement.innerHTML = `<h3>${title}</h3><p>${feed.description}</p>`;
      feedsList.append(feedElement);

      elementsDOM.feedsConteiner.prepend(feedsList);
      elementsDOM.feedsConteiner.prepend(headingFeeds);
    });
  };

  const renderPosts = () => {
    elementsDOM.postsConteiner.innerHTML = '';
    const headingPosts = document.createElement('h2');
    headingPosts.textContent = i18next.t('posts');

    const postsList = document.createElement('ul');
    postsList.setAttribute('class', 'list-group mb-5');

    state.posts.forEach((post) => {
      const postElement = document.createElement('li');
      postElement.setAttribute('class', 'list-group-item d-flex justify-content-between align-items-start');
      const visitedLink = _.includes(state.uiState.visitedPosts, post.id);
      const classLink = visitedLink === true ? 'font-weight-normal fw-normal text-decoration-none' : 'font-weight-bold fw-bold text-decoration-none';
      const title = getTitle(post.title, i18next);
      postElement.innerHTML = `<a href = "${post.link}" class="${classLink}" data-id="${post.id}" target="_blank" rel="noopener noreferrer">${title}</a> <button type="button" class="btn btn-primary btn-sm" data-id="${post.id}" data-bs-toggle="modal" data-bs-target="#modal">${i18next.t('modalButtonName')}</button>`;
      postsList.prepend(postElement);
    });

    elementsDOM.postsConteiner.prepend(postsList);
    elementsDOM.postsConteiner.prepend(headingPosts);
  };

  switch (path) {
    case 'feeds': {
      renderFeeds();
      break;
    }
    case 'posts': {
      renderPosts();
      break;
    }
    case 'streamLoadingStatus': {
      renderBlockForm();
      break;
    }
    case 'uiState.visitedPosts': {
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
