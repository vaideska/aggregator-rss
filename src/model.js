const state = {
  input: {
    url: '',
    valid: true,
  },
  streams: [], //  {url, id}
  feeds: [], //  {idSteam, id, data: {title, description}}
  posts: [], // {idFeed, id, data: {title, link, description}}
};

export default state;
