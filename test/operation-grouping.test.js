import { assert, fixture, html, aTimeout } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-endpoint-documentation.js';

describe('OAS 3.2 operation grouping (endpoint documentation)', () => {
  let amf;
  before(async () => {
    amf = await AmfLoader.load('oas32', false);
  });

  async function loadEndpoint(pathMatch) {
    // Find the endpoint manually from the AMF graph
    const endpoint = amf['@graph'].find(node =>
      node['@type']?.includes('http://a.ml/vocabularies/apiContract#EndPoint') &&
      node['http://a.ml/vocabularies/apiContract#path'] === pathMatch
    );
    const element = await fixture(html`<api-endpoint-documentation
      .amf="${amf}"
      .endpoint="${endpoint}"></api-endpoint-documentation>`);
    await aTimeout(100);
    return element;
  }

  it('groups query and additional operations under labeled subsections', async () => {
    const element = await loadEndpoint('/resources/{id}');
    const labels = Array.from(element.shadowRoot.querySelectorAll('.op-group-label')).map((n) => n.textContent.trim());
    assert.deepEqual(labels, ['Operations', 'Query', 'Additional operations']);
  });

  it('renders a standard-only endpoint without group headers', async () => {
    const element = await loadEndpoint('/auth');
    assert.equal(element.shadowRoot.querySelectorAll('.op-group-label').length, 0);
  });
});
