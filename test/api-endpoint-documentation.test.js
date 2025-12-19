/* eslint-disable prefer-destructuring */
import { fixture, assert, html, aTimeout, nextFrame } from '@open-wc/testing';
import * as sinon from 'sinon';
import { AmfLoader } from './amf-loader.js';
import '../api-endpoint-documentation.js';

/** @typedef {import('../index').ApiEndpointDocumentationElement} ApiEndpointDocumentationElement */

describe('ApiEndpointDocumentationElement', () => {
  /**
   * @returns {Promise<ApiEndpointDocumentationElement>}
   */
  async function basicFixture() {
    return (fixture(html`<api-endpoint-documentation></api-endpoint-documentation>`));
  }

  /**
   * @returns {Promise<ApiEndpointDocumentationElement>}
   */
  async function baseUriFixture(amf, endpoint) {
    return (fixture(html`<api-endpoint-documentation
      baseUri="https://domain.com"
      .amf="${amf}"
      .endpoint="${endpoint}"></api-endpoint-documentation>`));
  }

  /**
   * @returns {Promise<ApiEndpointDocumentationElement>}
   */
  async function modelFixture(amf, endpoint) {
    return (fixture(html`<api-endpoint-documentation
      .amf="${amf}"
      .endpoint="${endpoint}"></api-endpoint-documentation>`));
  }

  /**
   * @returns {Promise<ApiEndpointDocumentationElement>}
   */
  async function inlineMethodsFixture(amf, endpoint) {
    return (fixture(html`<api-endpoint-documentation
      .amf="${amf}"
      .endpoint="${endpoint}"
      inlineMethods></api-endpoint-documentation>`));
  }

  /**
   * @returns {Promise<ApiEndpointDocumentationElement>}
   */
  async function noNavigationFixture(amf, endpoint) {
    return (fixture(html`<api-endpoint-documentation
      .amf="${amf}"
      .endpoint="${endpoint}"
      noNavigation></api-endpoint-documentation>`));
  }

  /**
   * @returns {Promise<(HTMLElement|ApiEndpointDocumentationElement)[]>}
   */
  async function scrollTargetFixture(amf, endpoint) {
    const target = /** @type HTMLDivElement */ (await fixture(html`
      <div style="overflow: auto; height: 100px;">
      <api-endpoint-documentation
      .amf="${amf}"
      .endpoint="${endpoint}"
      inlineMethods></api-endpoint-documentation>
      </div>`));
    const element = target.querySelector('api-endpoint-documentation');
    element.scrollTarget = target;
    return [target, element];
  }

  const demoApi = 'demo-api';

  describe('Basic tests', () => {
    it('arc-marked is not in the DOM by default', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('arc-marked');
      assert.notOk(node);
    });
  });

  describe('Bottom navigation', () => {
    const prev = { 'label': 'p', 'id': 'pp' };
    const next = { 'label': 'n', 'id': 'nn' };

    let element = /** @type ApiEndpointDocumentationElement */ (null);
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
    let element = /** @type ApiEndpointDocumentationElement */ (null);
    let target;
    before(async () => {
      amf = await AmfLoader.load(demoApi, true);
    });

    beforeEach(async () => {
      const endpoint = AmfLoader.lookupEndpoint(amf, '/people/{personId}');
      // @ts-ignore
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
      const lastNode = /** @type HTMLElement */ (element.shadowRoot.querySelector('.method-container.last'));
      target.scrollTop = lastNode.offsetTop;
      element._checkMethodsPosition();
      assert.isTrue(spy.called);
    });

    it('calls _notifyPassiveNavigation() when scrolling to a previous method', async () => {
      element._checkMethodsPosition();
      const spy = sinon.spy(element, '_notifyPassiveNavigation');
      const lastNode = /** @type HTMLElement */ (element.shadowRoot.querySelector('.method-container.last'));
      target.scrollTop = lastNode.offsetTop;
      element._checkMethodsPosition();
      target.scrollTop = element._methodsList[1].offsetTop;
      element._checkMethodsPosition();
      assert.isTrue(spy.called);
    });
  });

  describe('selection change', () => {
    let amf;
    let element = /** @type ApiEndpointDocumentationElement */ (null);
    before(async () => {
      amf = await AmfLoader.load(demoApi, true);
      const endpoint = AmfLoader.lookupEndpoint(amf, '/people/{personId}');
      const nodes = await scrollTargetFixture(amf, endpoint);
      // @ts-ignore
      element = nodes[1];
      element.selected = endpoint['@id'];
      await aTimeout(0);
    });

    it('calls _repositionVerb()', async () => {
      const spy = sinon.spy(element, '_repositionVerb');
      const method = AmfLoader.lookupOperation(amf, '/people/{personId}', 'put');
      element.selected = method['@id'];
      await aTimeout(0);
      assert.isTrue(spy.called);
    });
  });

  [
    ['Compact model', true],
    ['Full model', false]
  ].forEach(([label, compact]) => {
    describe(String(label), () => {
      describe('Title rendering', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(demoApi, Boolean(compact));
        });

        it('renders title when display name', async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, '/people');
          const element = await modelFixture(amf, endpoint);
          // model change debouncer
          await aTimeout(0);
          const title = element.shadowRoot.querySelector('.title');
          assert.ok(title);
          assert.equal(title.textContent.trim(), 'People');
        });

        it('does not render title when no display name', async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, '/notypes');
          const element = await modelFixture(amf, endpoint);
          // model change debouncer
          await aTimeout(0);
          const title = element.shadowRoot.querySelector('.title');
          assert.notOk(title);
        });
      });

      describe('Method description rendering', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(demoApi, Boolean(compact));
        });

        it('renders title when display name', async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, '/people');
          const element = await modelFixture(amf, endpoint);
          await aTimeout(0);
          const desc = element.shadowRoot.querySelector('.methods .method arc-marked');
          assert.ok(desc);
          // @ts-ignore
          assert.typeOf(desc.markdown, 'string');
        });

      });

      describe('Basic computations', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(demoApi, Boolean(compact));
        });

        let element = /** @type ApiEndpointDocumentationElement */ (null);
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
          amf = await AmfLoader.load(demoApi, Boolean(compact));
        });

        let element = /** @type ApiEndpointDocumentationElement */ (null);
        beforeEach(async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, '/people/{personId}');
          element = await modelFixture(amf, endpoint);
          await aTimeout(0);
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
          amf = await AmfLoader.load(demoApi, Boolean(compact));
        });

        let element = /** @type ApiEndpointDocumentationElement */ (null);
        beforeEach(async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, '/products');
          element = await modelFixture(amf, endpoint);
          await aTimeout(0);
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
          amf = await AmfLoader.load(demoApi, Boolean(compact));
        });

        let endpoint;
        beforeEach(() => {
          endpoint = AmfLoader.lookupEndpoint(amf, '/people/{personId}');
        });

        it('sets URL from base uri', async () => {
          const element = await baseUriFixture(amf, endpoint);
          await aTimeout(0);
          assert.equal(element.endpointUri, 'https://domain.com/people/{personId}');
        });

        it('sets URL from base uri', async () => {
          const element = await baseUriFixture(amf, endpoint);
          await aTimeout(0);
          assert.equal(element.endpointUri, 'https://domain.com/people/{personId}');
        });
      });

      describe('inline methods', () => {
        let amf;
        let element = /** @type ApiEndpointDocumentationElement */ (null);
        before(async () => {
          amf = await AmfLoader.load(demoApi, Boolean(compact));
          const endpoint = AmfLoader.lookupEndpoint(amf, '/people/{personId}');
          element = await inlineMethodsFixture(amf, endpoint);
        });

        it('Renders 3 methods containers', () => {
          const nodes = element.shadowRoot.querySelectorAll('.method-container');
          assert.lengthOf(nodes, 3);
        });
        // (Pawel): Note, methods docs rendering is async. This won't check for every
        // method rendering as the time of element rendering is unknown.
        // There's an (fair) assumption that when one panel is rendered then other
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
        let element = /** @type ApiEndpointDocumentationElement */ (null);
        before(async () => {
          amf = await AmfLoader.load(demoApi, Boolean(compact));
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
          amf = await AmfLoader.load(demoApi, Boolean(compact));
        });

        it('does not render annotation when not available', async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, '/people/{personId}');
          const element = await modelFixture(amf, endpoint);
          await aTimeout(0);
          const node = element.shadowRoot.querySelector('api-annotation-document');
          assert.notOk(node, 'annotation is not rendered');
        });

        it('renders annotation when available', async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, '/people');
          const element = await modelFixture(amf, endpoint);
          await aTimeout(0);
          const node = element.shadowRoot.querySelector('api-annotation-document');
          assert.ok(node, 'annotation is rendered');
          // The annotation document sets `hidden` attribute when there's nothing
          // to render (the shape has no annotations).
          // @ts-ignore
          assert.isFalse(node.hasAttribute('hidden'), 'node is not hidden');
        });
      });

      describe('AsyncAPI', () => {
        let element = /** @type ApiEndpointDocumentationElement */ (null);
        const asyncApi = 'async-api'
        let asyncAmf;

        before(async () => {
          asyncAmf = await AmfLoader.load(asyncApi, Boolean(compact));
        });

        it('should have endpoint uri set', async () => {
          const endpoint = AmfLoader.lookupEndpoint(asyncAmf, 'hello');
          element = await modelFixture(asyncAmf, endpoint);
          await nextFrame();
          const servers = element._getServers({});
          const server = servers[0];
          element.server = server;
          await nextFrame();
          assert.isDefined(element.server);
          assert.isNotNull(element.server);
          assert.equal(element.endpointUri, 'amqp://broker.mycompany.com');
        });
      });

      describe('gRPC API', () => {
        let element = /** @type ApiEndpointDocumentationElement */ (null);
        const grpcApi = 'grpc-test';
        let grpcAmf;

        before(async () => {
          grpcAmf = await AmfLoader.load(grpcApi, false);
        });

        it('sets isGrpcEndpoint to true for gRPC endpoints', async () => {
          const service = AmfLoader.lookupGrpcService(grpcAmf, 0);
          element = await modelFixture(grpcAmf, service);
          await aTimeout(0);
          assert.isTrue(element.isGrpcEndpoint, 'isGrpcEndpoint should be true');
        });

        it('does not render URL section for gRPC endpoints', async () => {
          const service = AmfLoader.lookupGrpcService(grpcAmf, 0);
          element = await modelFixture(grpcAmf, service);
          await aTimeout(0);
          const urlSection = element.shadowRoot.querySelector('.url-area');
          assert.notOk(urlSection, 'URL section should not be rendered');
        });

        it('computes operations with gRPC stream type information', async () => {
          const service = AmfLoader.lookupGrpcService(grpcAmf, 0);
          element = await modelFixture(grpcAmf, service);
          await aTimeout(0);
          const { operations } = element;
          assert.isArray(operations, 'operations should be an array');
          assert.isAbove(operations.length, 0, 'should have at least one operation');
          
          const firstOp = operations[0];
          assert.isTrue(firstOp.isGrpc, 'operation should be marked as gRPC');
          assert.isDefined(firstOp.grpcStreamType, 'should have grpcStreamType');
          assert.isDefined(firstOp.grpcStreamTypeDisplay, 'should have grpcStreamTypeDisplay');
          assert.isDefined(firstOp.methodForColor, 'should have methodForColor for styling');
        });

        it('renders gRPC stream type badges instead of HTTP methods', async () => {
          const service = AmfLoader.lookupGrpcService(grpcAmf, 0);
          element = await modelFixture(grpcAmf, service);
          await aTimeout(0);
          const methodLabels = element.shadowRoot.querySelectorAll('.method-label');
          assert.isAbove(methodLabels.length, 0, 'should have method labels');
          
          const firstLabel = methodLabels[0];
          const labelText = firstLabel.textContent.trim();
          // The display name from AmfHelperMixin returns capitalized format (e.g., "Unary", "Client Streaming")
          const validGrpcTypes = ['Unary', 'Client Streaming', 'Server Streaming', 'Bidirectional'];
          const isValidGrpcType = validGrpcTypes.some(type => labelText.includes(type));
          assert.isTrue(isValidGrpcType, `should display a valid gRPC stream type, got: ${labelText}`);
        });

        it('maps gRPC stream types to correct HTTP method colors', async () => {
          const service = AmfLoader.lookupGrpcService(grpcAmf, 0);
          element = await modelFixture(grpcAmf, service);
          await aTimeout(0);
          const { operations } = element;
          
          const unaryOp = operations.find(op => op.grpcStreamType === 'unary');
          if (unaryOp) {
            assert.equal(unaryOp.methodForColor, 'patch', 'unary should map to patch (violet)');
          }
          
          const clientStreamOp = operations.find(op => op.grpcStreamType === 'client_streaming');
          if (clientStreamOp) {
            assert.equal(clientStreamOp.methodForColor, 'publish', 'client_streaming should map to publish (green)');
          }
          
          const serverStreamOp = operations.find(op => op.grpcStreamType === 'server_streaming');
          if (serverStreamOp) {
            assert.equal(serverStreamOp.methodForColor, 'subscribe', 'server_streaming should map to subscribe (blue)');
          }
          
          const bidiStreamOp = operations.find(op => op.grpcStreamType === 'bidi_streaming');
          if (bidiStreamOp) {
            assert.equal(bidiStreamOp.methodForColor, 'options', 'bidi_streaming should map to options (gray)');
          }
        });

        it('renders methods list template with gRPC operations', async () => {
          const service = AmfLoader.lookupGrpcService(grpcAmf, 0);
          element = await modelFixture(grpcAmf, service);
          await aTimeout(0);
          const methodsSection = element.shadowRoot.querySelector('.methods');
          assert.ok(methodsSection, 'methods section should be rendered');
          
          const methodElements = methodsSection.querySelectorAll('.method');
          assert.isAbove(methodElements.length, 0, 'should have method elements');
        });
      });
    });
  });
});
