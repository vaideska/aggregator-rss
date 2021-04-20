const getTitle = (elem) => (elem.querySelector('title') === null ? 'emptyTitle' : elem.querySelector('title').textContent);
const getDescription = (elem) => (elem.querySelector('description') === null ? '' : elem.querySelector('description').textContent);
const getLink = (elem) => (elem.querySelector('link').textContent);

const parseDataDOM = (dataDOM) => {
  const channelElement = dataDOM.querySelector('channel');
  const titleFeed = getTitle(channelElement);
  const descriptionFeed = getDescription(channelElement);

  const itemElements = dataDOM.querySelectorAll('item');
  const posts = Array.from(itemElements).map((itemElement) => ({
    title: getTitle(itemElement),
    link: getLink(itemElement),
    description: getDescription(itemElement),
  }));
  return { titleFeed, descriptionFeed, posts };
};

const parseRSS = (data) => {
  const parser = new DOMParser();
  const dataDOM = parser.parseFromString(data, 'application/xml');
  if (dataDOM.querySelector('parsererror')) {
    throw new Error('notValidRss');
  }
  return parseDataDOM(dataDOM);
};

export default parseRSS;
