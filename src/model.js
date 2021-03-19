const state = {
  input: {
    url: '',
    valid: true,
    errorMsg: '',
  },
  streams: [], //  {url, id}
  feeds: [], //  {idStream, id, data: {title, description}}
  posts: [], // {idFeed, id, data: {title, link, description}}
};

export default state;
