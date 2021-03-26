const state = {
  lastUpdatedDate: '',
  modalPostId: '',
  input: {
    url: '',
    valid: true,
    errorMsg: '',
  },
  streams: [], //  {url, id}
  feeds: [], //  {idStream, id, data: {title, description}}
  posts: [], // {idFeed, id, visited: false, data: {title, link, description}}
};

export default state;
