import { assert, fixture, html, aTimeout } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-endpoint-documentation.js';

describe('AsyncAPI 3.0 operation rendering (endpoint documentation)', () => {
  let amf;
  before(async () => {
    amf = await AmfLoader.load('async30', false); // (fileName, compact)
  });

  async function loadEndpoint() {
    const endpoint = amf['@graph'].find((node) =>
      node['@type']?.includes('http://a.ml/vocabularies/apiContract#EndPoint') &&
      node['http://a.ml/vocabularies/apiContract#supportedOperation']);
    const element = await fixture(html`<api-endpoint-documentation
      .amf="${amf}" .endpoint="${endpoint}"></api-endpoint-documentation>`);
    await aTimeout(100);
    return element;
  }

  it('labels the async op SEND (not POST) and colors it publish', async () => {
    const element = await loadEndpoint();
    const badges = Array.from(element.shadowRoot.querySelectorAll('.method-label'));
    const texts = badges.map((n) => n.textContent.trim().toLowerCase());
    assert.include(texts, 'send');
    assert.notInclude(texts, 'post');
    const send = badges.find((n) => n.textContent.trim().toLowerCase() === 'send');
    assert.equal(send.getAttribute('data-method'), 'publish');
  });
});
