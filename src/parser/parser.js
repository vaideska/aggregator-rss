const getTitle = (elem) => (elem.querySelector('title') === null ? 'emptyTitle' : elem.querySelector('title').textContent);
const getDescription = (elem) => (elem.querySelector('description') === null ? '' : elem.querySelector('description').textContent);
const getLink = (elem) => (elem.querySelector('link').textContent);

const parserDataDOM = (dataDOM) => {
  const channelElement = dataDOM.querySelector('channel');
  const titleFeed = getTitle(channelElement);
  const descriptionFeed = getDescription(channelElement);

  const itemElements = dataDOM.querySelectorAll('item');
  const posts = [];
  itemElements.forEach((itemElement) => {
    const postData = {
      title: getTitle(itemElement),
      link: getLink(itemElement),
      description: getDescription(itemElement),
    };
    posts.push(postData);
  });
  return { titleFeed, descriptionFeed, posts };
};

const parserRSS = (data) => {
  const parser = new DOMParser();
  const dataDOM = parser.parseFromString(data, 'application/xml');
  if (dataDOM.querySelector('parsererror') !== null) {
    throw new Error('notValidRss');
  }
  return parserDataDOM(dataDOM);
};

export default parserRSS;
