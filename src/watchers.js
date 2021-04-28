/* eslint-disable no-param-reassign */
import _ from 'lodash';
import onChange from 'on-change';

export default (state, i18next, elementsDOM) => {
  const getTitle = (title) => (title === null ? i18next.t('emptyTitle') : title);

  const renderFeedback = () => {
    const feedbackElement = elementsDOM.rssFormConteiner.querySelector('.feedback');
    if (state.validStatus === 'success' && state.streamLoadingStatus === 'success') {
      feedbackElement.classList.remove('text-danger');
      feedbackElement.classList.add('text-success');
      feedbackElement.textContent = i18next.t('feedbackMessage.successMsg');
      elementsDOM.rssFormConteiner.reset();
    }
    if (state.validStatus === 'error' || state.streamLoadingStatus === 'error') {
      feedbackElement.classList.remove('text-success');
      feedbackElement.classList.add('text-danger');
      feedbackElement.textContent = i18next.t(`feedbackMessage.${state.errorMsgFeedback}`);
    }
    elementsDOM.rssFormConteiner.querySelector('input').focus();
  };

  const renderBlockForm = () => {
    if (state.streamLoadingStatus === 'loading') {
      elementsDOM.rssFormConteiner.querySelector('input').setAttribute('readonly', '');
      document.querySelector('button[type=submit]').setAttribute('disabled', 'disabled');
    } else {
      elementsDOM.rssFormConteiner.querySelector('input').removeAttribute('readonly', '');
      document.querySelector('button[type=submit]').removeAttribute('disabled', 'disabled');
      renderFeedback();
    }
  };

  const renderVisitedLink = (visitedPosts) => {
    const visitedLastPostId = visitedPosts[visitedPosts.length - 1];
    document.querySelector(`a[data-id="${visitedLastPostId}"]`).setAttribute('class', 'fw-normal');
  };

  const renderOpenModal = (postId) => {
    const dataPost = _.find(state.posts, { id: postId });
    const title = getTitle(dataPost.title, i18next);
    elementsDOM.modalTitle.textContent = title;
    elementsDOM.modalBody.textContent = dataPost.description;
    elementsDOM.modalBtnLink.setAttribute('href', dataPost.link);
  };

  const renderFeeds = () => {
    const headingFeeds = document.createElement('h2');
    headingFeeds.textContent = i18next.t('feeds');

    const feedsList = document.createElement('ul');
    feedsList.setAttribute('class', 'list-group mb-5');

    state.feeds.forEach((feed) => {
      const feedElement = document.createElement('li');
      feedElement.setAttribute('class', 'list-group-item');
      const title = getTitle(feed.title, i18next);

      const feedTitle = document.createElement('h3');
      feedTitle.textContent = title;
      const feedDescription = document.createElement('p');
      feedDescription.textContent = feed.description;

      feedElement.append(feedTitle);
      feedElement.append(feedDescription);
      feedsList.append(feedElement);
    });
    elementsDOM.feedsConteiner.innerHTML = '';
    elementsDOM.feedsConteiner.prepend(feedsList);
    elementsDOM.feedsConteiner.prepend(headingFeeds);
  };

  const renderPosts = () => {
    const headingPosts = document.createElement('h2');
    headingPosts.textContent = i18next.t('posts');

    const postsList = document.createElement('ul');
    postsList.setAttribute('class', 'list-group mb-5');

    state.posts.forEach((post) => {
      const postElement = document.createElement('li');
      postElement.setAttribute('class', 'list-group-item d-flex justify-content-between align-items-start');
      const visitedLink = _.includes(state.uiState.visitedPosts, post.id);
      const classLink = visitedLink ? 'font-weight-normal fw-normal text-decoration-none' : 'font-weight-bold fw-bold text-decoration-none';
      const title = getTitle(post.title, i18next);

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', post.link);
      linkElement.setAttribute('class', classLink);
      linkElement.setAttribute('data-id', post.id);
      linkElement.setAttribute('target', '_blank');
      linkElement.setAttribute('rel', 'noopener noreferrer');
      linkElement.textContent = title;

      const buttonElement = document.createElement('button');
      buttonElement.setAttribute('type', 'button');
      buttonElement.setAttribute('class', 'btn btn-primary btn-sm');
      buttonElement.setAttribute('data-id', post.id);
      buttonElement.setAttribute('data-bs-toggle', 'modal');
      buttonElement.setAttribute('data-bs-target', '#modal');
      buttonElement.textContent = i18next.t('modalButtonName');

      postElement.append(linkElement);
      postElement.append(buttonElement);
      postsList.prepend(postElement);
    });
    elementsDOM.postsConteiner.innerHTML = '';
    elementsDOM.postsConteiner.prepend(postsList);
    elementsDOM.postsConteiner.prepend(headingPosts);
  };

  return onChange(state, (path, value) => {
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
      case 'validStatus': {
        renderFeedback();
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
};
