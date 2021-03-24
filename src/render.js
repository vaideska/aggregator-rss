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

const addFeedPosts = (postsList, posts) => {
  posts.forEach((post) => {
    const postElement = document.createElement('li');
    postElement.setAttribute('class', 'list-group-item d-flex justify-content-between align-items-start');
    postElement.innerHTML = `<a href = "${post.data.link}" id="${post.id}" target="_blank" rel="noopener noreferrer">${post.data.title}</a>`;
    postsList.prepend(postElement);
  });
};

//  const sortIdFeeds = (feed1, feed2) => feed2.id - feed1.id;

export const renderStreams = (state) => {
  if (state.streams.length === 0) return;
  const feedsConteiner = document.querySelector('.feeds');
  feedsConteiner.innerHTML = '';

  const postsConteiner = document.querySelector('.posts');
  postsConteiner.innerHTML = '';

  const headingFeeds = document.createElement('h2');
  headingFeeds.textContent = 'Фиды';

  const headingPosts = document.createElement('h2');
  headingPosts.textContent = 'Посты';

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
