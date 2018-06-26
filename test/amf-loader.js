const AmfLoader = {};
AmfLoader.load = function(endpointIndex) {
  endpointIndex = endpointIndex || 0;
  const url = location.protocol + '//' + location.host +
    location.pathname.substr(0, location.pathname.lastIndexOf('/'))
    .replace('/test', '/demo') + '/demo-api.json';
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('load', (e) => {
      let data;
      try {
        data = JSON.parse(e.target.response);
      } catch (e) {
        reject(e);
        return;
      }
      const def = data[0]['http://a.ml/vocabularies/document#encodes'][0];
      const endpoint = def['http://a.ml/vocabularies/http#endpoint'][endpointIndex];
      resolve([data, endpoint]);
    });
    xhr.addEventListener('error',
      () => reject(new Error('Unable to load model file')));
    xhr.open('GET', url);
    xhr.send();
  });
};
