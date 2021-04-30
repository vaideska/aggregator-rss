const parseDataDOM = (dataDOM) => {
  const channelElement = dataDOM.querySelector('channel');
  const titleFeed = channelElement.querySelector('title').textContent;
  const channelElementDesc = channelElement.querySelector('description');
  const descriptionFeed = channelElementDesc === null ? '' : channelElementDesc.textContent;

  const itemElements = dataDOM.querySelectorAll('item');
  const posts = Array.from(itemElements).reverse().map((itemElement) => {
    const itemElementDesc = itemElement.querySelector('description');
    const descriptionPost = itemElementDesc === null ? '' : itemElementDesc.textContent;
    return {
      title: itemElement.querySelector('title').textContent,
      link: itemElement.querySelector('link').textContent,
      description: descriptionPost,
    };
  });
  return { titleFeed, descriptionFeed, posts };
};

const parseRSS = (data) => {
  const parser = new DOMParser();
  const dataDOM = parser.parseFromString(data, 'application/xml');
  if (dataDOM.querySelector('parsererror')) {
    const error = new Error();
    error.isParsingError = true;
    throw error;
    //  throw new Error('notValidRss');
  }
  return parseDataDOM(dataDOM);
};

export default parseRSS;
