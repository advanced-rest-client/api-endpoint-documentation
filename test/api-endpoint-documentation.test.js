import { fixture, assert, html, aTimeout, nextFrame } from '@open-wc/testing';
import * as sinon from 'sinon';
import { AmfLoader } from './amf-loader.js';
import '../api-endpoint-documentation.js';

describe('<api-endpoint-documentation>', function() {
  async function basicFixture() {
    return (await fixture(`<api-endpoint-documentation></api-endpoint-documentation>`));
  }

  async function awareFixture() {
    return (await fixture(`<api-endpoint-documentation aware="test"></api-endpoint-documentation>`));
  }

  async function baseUriFixture(amf, endpoint) {
    return (await fixture(html`<api-endpoint-documentation
      baseuri="https://domain.com"
      .amf="${amf}"
      .endpoint="${endpoint}"></api-endpoint-documentation>`));
  }

  async function modelFixture(amf, endpoint) {
    return (await fixture(html`<api-endpoint-documentation
      .amf="${amf}"
      .endpoint="${endpoint}"></api-endpoint-documentation>`));
  }

  async function inlineMethodsFixture(amf, endpoint) {
    return (await fixture(html`<api-endpoint-documentation
      .amf="${amf}"
      .endpoint="${endpoint}"
      inlinemethods></api-endpoint-documentation>`));
  }

  async function noNavigationFixture(amf, endpoint) {
    return (await fixture(html`<api-endpoint-documentation
      .amf="${amf}"
      .endpoint="${endpoint}"
      noNavigation></api-endpoint-documentation>`));
  }

  async function scrollTargetFixture(amf, endpoint) {
    const target = (await fixture(html`
      <div style="overflow: auto; height: 100px;">
      <api-endpoint-documentation
      .amf="${amf}"
      .endpoint="${endpoint}"
      inlinemethods></api-endpoint-documentation>
      </div>`));
    const element = target.querySelector('api-endpoint-documentation');
    element.scrollTarget = target;
    return [target, element];
  }

  const demoApi = 'demo-api';

  describe('Basic tests', () => {
    it('Adds raml-aware to the DOM if aware is set', async () => {
      const element = await awareFixture();
      const node = element.shadowRoot.querySelector('raml-aware');
      assert.ok(node);
    });

    it('passes AMF model', async () => {
      const element = await awareFixture();
      const aware = document.createElement('raml-aware');
      aware.scope = 'test';
      aware.api = [{}];
      assert.deepEqual(element.amf, [{}]);
    });

    it('raml-aware is not in the DOM by default', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('raml-aware');
      assert.notOk(node);
    });

    it('arc-marked is not in the DOM by default', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('arc-marked');
      assert.notOk(node);
    });
  });

  describe('Bottom navigation', () => {
    const prev = { 'label': 'p', 'id': 'pp' };
    const next = { 'label': 'n', 'id': 'nn' };

    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('does not render bottom navigation when no params', () => {
      const node = element.shadowRoot.querySelector('.bottom-nav');
      assert.notOk(node);
    });

    it('renders bottom navigation', async () => {
      element.next = next;
      element.previous = prev;
      await nextFrame();
      const node = element.shadowRoot.querySelector('.bottom-nav');
      assert.ok(node);
    });

    it('Renders previous buttons', async () => {
      element.previous = prev;
      await nextFrame();
      const node = element.shadowRoot.querySelector('.bottom-link.previous');
      assert.ok(node);
    });

    it('Renders next buttons', async () => {
      element.next = next;
      await nextFrame();
      const node = element.shadowRoot.querySelector('.bottom-link.next');
      assert.ok(node);
    });

    it('Does not render previous for next only', async () => {
      element.next = next;
      await nextFrame();
      const node = element.shadowRoot.querySelector('.bottom-link.previous');
      assert.notOk(node);
    });

    it('Does not render next for previous only', async () => {
      element.previous = prev;
      await nextFrame();
      const node = element.shadowRoot.querySelector('.bottom-link.next');
      assert.notOk(node);
    });

    it('_navigatePrevious() calls _navigate()', async () => {
      element.previous = prev;
      await nextFrame();
      const spy = sinon.spy(element, '_navigate');
      element._navigatePrevious();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], prev.id, 'ID argument is set');
      assert.equal(spy.args[0][1], 'endpoint', 'type argument is set');
    });

    it('_navigateNext() calls _navigate()', async () => {
      element.next = next;
      await nextFrame();
      const spy = sinon.spy(element, '_navigate');
      element._navigateNext();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], next.id);
      assert.equal(spy.args[0][1], 'endpoint', 'type argument is set');
    });
  });

  describe('scroll target', () => {
    let amf;
    let element;
    let target;
    before(async () => {
      amf = await AmfLoader.load(demoApi, true);
    });

    beforeEach(async () => {
      const endpoint = AmfLoader.lookupEndpoint(amf, '/people/{personId}');
      [target, element] = await scrollTargetFixture(amf, endpoint);
      await aTimeout(0);
    });

    it('calls _checkMethodsPosition() when target is scrolling', async () => {
      const spy = sinon.spy(element, '_checkMethodsPosition');
      target.scrollTop = 200;
      target.dispatchEvent(new CustomEvent('scroll'));
      await aTimeout(0);
      assert.isTrue(spy.called);
    });

    it('calls _notifyPassiveNavigation() when scrolling to a next method', async () => {
      element._checkMethodsPosition();
      const spy = sinon.spy(element, '_notifyPassiveNavigation');
      const lastNode = element.shadowRoot.querySelector('.method-container.last');
      target.scrollTop = lastNode.offsetTop;
      element._checkMethodsPosition();
      assert.isTrue(spy.called);
    });

    it('calls _notifyPassiveNavigation() when scrolling to a previous method', async () => {
      element._checkMethodsPosition();
      const spy = sinon.spy(element, '_notifyPassiveNavigation');
      const lastNode = element.shadowRoot.querySelector('.method-container.last');
      target.scrollTop = lastNode.offsetTop;
      element._checkMethodsPosition();
      target.scrollTop = element._methodsList[1].offsetTop;
      element._checkMethodsPosition();
      assert.isTrue(spy.called);
    });
  });

  describe('selection change', () => {
    let amf;
    let element;
    before(async () => {
      amf = await AmfLoader.load(demoApi, true);
      const endpoint = AmfLoader.lookupEndpoint(amf, '/people/{personId}');
      const nodes = await scrollTargetFixture(amf, endpoint);
      element = nodes[1];
      element.selected = endpoint['@id'];
      await aTimeout();
    });

    it('calls _repositionVerb()', async () => {
      const spy = sinon.spy(element, '_repositionVerb');
      const method = AmfLoader.lookupOperation(amf, '/people/{personId}', 'put');
      element.selected = method['@id'];
      await aTimeout();
      assert.isTrue(spy.called);
    });
  });

  describe('compatibility mode', () => {
    it('sets compatibility on item when setting legacy', async () => {
      const element = await basicFixture();
      element.legacy = true;
      assert.isTrue(element.legacy, 'legacy is set');
      assert.isTrue(element.compatibility, 'compatibility is set');
    });

    it('returns compatibility value from item when getting legacy', async () => {
      const element = await basicFixture();
      element.compatibility = true;
      assert.isTrue(element.legacy, 'legacy is set');
    });
  });

  [
    ['Compact model', true],
    ['Full model', false]
  ].forEach(([label, compact]) => {
    describe(label, () => {
      describe('Title rendering', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(demoApi, compact);
        });

        it('renders title when display name', async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, '/people');
          const element = await modelFixture(amf, endpoint);
          // model change debouncer
          await aTimeout();
          const title = element.shadowRoot.querySelector('.title');
          assert.ok(title);
          assert.equal(title.textContent.trim(), 'People');
        });

        it('does not render title when no display name', async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, '/notypes');
          const element = await modelFixture(amf, endpoint);
          // model change debouncer
          await aTimeout();
          const title = element.shadowRoot.querySelector('.title');
          assert.notOk(title);
        });
      });

      describe('Method description rendering', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(demoApi, compact);
        });

        it('renders title when display name', async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, '/people');
          const element = await modelFixture(amf, endpoint);
          await aTimeout();
          const desc = element.shadowRoot.querySelector('.methods .method arc-marked');
          assert.ok(desc);
          assert.typeOf(desc.markdown, 'string');
        });

      });

      describe('Basic computations', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(demoApi, compact);
        });

        let element;
        beforeEach(async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, '/notypes');
          element = await modelFixture(amf, endpoint);
        });

        it('traits is not computed', () => {
          assert.isUndefined(element.traits);
        });

        it('extensions are not rendered', () => {
          const node = element.shadowRoot.querySelector('.extensions');
          assert.notOk(node);
        });
      });
      // https://www.mulesoft.org/jira/browse/APIMF-1644
      describe.skip('Resource type computations', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(demoApi, compact);
        });

        let element;
        beforeEach(async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, '/people/{personId}');
          element = await modelFixture(amf, endpoint);
          await aTimeout();
        });

        it('traits is not computed', () => {
          assert.isUndefined(element.traits);
        });

        it('Extensions node is rendered', () => {
          const node = element.shadowRoot.querySelector('.extensions');
          assert.ok(node);
        });

        it('Resource type name is rendered', () => {
          const node = element.shadowRoot.querySelector('.resource-type-name');
          assert.ok(node);
        });

        it('Trait name is not rendered', () => {
          const node = element.shadowRoot.querySelector('.trait-name');
          assert.notOk(node);
        });
      });
      // https://www.mulesoft.org/jira/browse/APIMF-1644
      describe.skip('Traits type computations', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(demoApi, compact);
        });

        let element;
        beforeEach(async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, '/products');
          element = await modelFixture(amf, endpoint);
          await aTimeout();
        });

        it('parentType is not computed', () => {
          assert.isUndefined(element.parentType);
        });

        it('parentTypeName is not computed', () => {
          assert.isUndefined(element.parentTypeName);
        });

        it('traits is computed', () => {
          assert.typeOf(element.traits, 'array');
          assert.lengthOf(element.traits, 1);
        });

        it('Extensions node is rendered', () => {
          const node = element.shadowRoot.querySelector('.extensions');
          assert.ok(node);
        });

        it('Resource type name is not rendered', () => {
          const node = element.shadowRoot.querySelector('.resource-type-name');
          assert.notOk(node);
        });

        it('Trait name is rendered', () => {
          const node = element.shadowRoot.querySelector('.trait-name');
          assert.ok(node);
        });
      });

      describe('Base URI property', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(demoApi, compact);
        });

        let endpoint;
        beforeEach(() => {
          endpoint = AmfLoader.lookupEndpoint(amf, '/people/{personId}');
        });

        it('sets URL from base uri', async () => {
          const element = await baseUriFixture(amf, endpoint);
          await aTimeout();
          assert.equal(element.endpointUri, 'https://domain.com/people/{personId}');
        });

        it('sets URL from base uri', async () => {
          const element = await baseUriFixture(amf, endpoint);
          await aTimeout();
          assert.equal(element.endpointUri, 'https://domain.com/people/{personId}');
        });
      });

      describe('inline methods', () => {
        let amf;
        let element;
        before(async () => {
          amf = await AmfLoader.load(demoApi, compact);
          const endpoint = AmfLoader.lookupEndpoint(amf, '/people/{personId}');
          element = await inlineMethodsFixture(amf, endpoint);
        });

        it('Renders 3 methods containers', () => {
          const nodes = element.shadowRoot.querySelectorAll('.method-container');
          assert.lengthOf(nodes, 3);
        });
        // (Pawel): Note, methods docs rendering is async. This won't check for every
        // method rendering as the time of element rendering is unknown.
        // There's an (fair) assumption that when one panel is redered then other
        // are rendered as well.
        it('Renders method documentations', () => {
          const node = element.shadowRoot.querySelector('api-method-documentation');
          assert.ok(node);
        });

        it('Renders tryit panels', () => {
          const node = element.shadowRoot.querySelector('api-request-panel');
          assert.ok(node);
        });

        it('Renders code snippets', () => {
          const node = element.shadowRoot.querySelector('api-request-panel');
          assert.ok(node);
        });
      });

      describe('No navigation', () => {
        let amf;
        let element;
        before(async () => {
          amf = await AmfLoader.load(demoApi, compact);
          const endpoint = AmfLoader.lookupEndpoint(amf, '/people');
          element = await noNavigationFixture(amf, endpoint);
        });

        it('does not render navigation', () => {
          const node = element.shadowRoot.querySelector('.bottom-nav');
          assert.notOk(node);
        });
      });

      describe('Annotation rendering', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(demoApi, compact);
        });

        it('does not render annotation when not available', async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, '/people/{personId}');
          const element = await modelFixture(amf, endpoint);
          await aTimeout();
          const node = element.shadowRoot.querySelector('api-annotation-document');
          assert.notOk(node, 'annotation is not rendered');
        });

        it('renders annotation when available', async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, '/people');
          const element = await modelFixture(amf, endpoint);
          await aTimeout();
          const node = element.shadowRoot.querySelector('api-annotation-document');
          assert.ok(node, 'annotation is rendered');
          // The annotation document sets `hidden` attribute when there's nothing
          // to render (the shape has no annotations).
          assert.isFalse(node.hasAttribute('hidden'), 'node is not hidden');
        });
      });
    });
  });
});
