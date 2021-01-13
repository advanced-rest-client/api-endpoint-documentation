/* eslint-disable lit-a11y/click-events-have-key-events */
/* eslint-disable no-continue */
/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
import { html, LitElement } from 'lit-element';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin';
import markdownStyles from '@advanced-rest-client/markdown-styles/markdown-styles.js';
import httpMethodStyles from '@api-components/http-method-label/http-method-label-common-styles.js';
import '@advanced-rest-client/arc-icons/arc-icon.js';
import '@api-components/api-annotation-document/api-annotation-document.js';
import '@api-components/api-parameters-document/api-parameters-document.js';
import '@api-components/api-method-documentation/api-method-documentation.js';
import '@api-components/api-method-documentation/api-url.js';
import '@advanced-rest-client/arc-marked/arc-marked.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@api-components/api-request/api-request-panel.js';
import '@anypoint-web-components/anypoint-collapse/anypoint-collapse.js';
import '@advanced-rest-client/http-code-snippets/http-code-snippets.js';
import { ExampleGenerator } from '@api-components/api-example-generator';
import styles from './Styles.js';

/**
 * `api-endpoint-documentation`
 *
 * A component to generate documentation for an endpoint from the AMF model.
 */
export class ApiEndpointDocumentationElement extends AmfHelperMixin(LitElement) {
  get styles() {
    return [
      markdownStyles,
      httpMethodStyles,
      styles,
    ];
  }

  static get properties() {
    return {
      /**
       * Method's endpoint definition as a
       * `http://raml.org/vocabularies/http#endpoint` of AMF model.
       */
      endpoint: { type: Object },
      /**
       * The ID in `amf` of current selection. It can be this endpoint
       * or any of methods
       */
      selected: { type: String },
      /**
       * A property to set to override AMF's model base URI information.
       * When this property is set, the `endpointUri` property is recalculated.
       */
      baseUri: { type: String },
      /**
       * Computed value, API version name
       */
      apiVersion: { type: String },
      /**
       * Endpoint URI to display in main URL field.
       * This value is computed when `amf`, `endpoint` or `baseUri` change.
       */
      endpointUri: { type: String },
      /**
       * Computed value of the `http://raml.org/vocabularies/http#server`
       * from `amf`
       */
      server: { type: Object },
      /**
       * Endpoint name.
       * It should be either a "displayName" or endpoint's relative
       * path.
       */
      endpointName: { type: String },
      /**
       * Computed value of method description from `method` property.
       */
      description: { type: String },
      /**
       * Computed value of endpoint's path.
       */
      path: { type: String },
      /**
       * Computed value from current `method`. True if the model containsPATCH
       * custom properties (annotations in RAML).
       */
      hasCustomProperties: { type: Boolean },
      /**
       * If set it will renders the view in the narrow layout.
       */
      narrow: { type: Boolean, reflect: true },
      /**
       * List of traits and resource types, if any.
       */
      extendsTypes: { type: Array },
      /**
       * Computed value of a parent type.
       * In RAML it is resource type that can be applied to a resource.
       */
      parentType: { type: Object },
      /**
       * Computed value for parent type name.
       */
      parentTypeName: { type: String },
      /**
       * List of traits applied to this endpoint
       */
      traits: { type: Array },
      /**
       * Model to generate a link to previous HTTP endpoint.
       * It should contain `id` and `label` properties
       */
      previous: { type: Object },
      /**
       * Model to generate a link to next HTTP endpoint.
       * It should contain `id` and `label` properties
       */
      next: { type: Object },
      /**
       * Scroll target used to observe `scroll` event.
       * When set the element will observe scroll and inform other components
       * about changes in navigation while scrolling through methods list.
       * The navigation event contains `passive: true` property that
       * determines that it's not user triggered navigation but rather
       * context enforced.
       */
      scrollTarget: { type: Object },
      /**
       * Passing value of `noTryIt` to the method documentation.
       * Hides the "Try it" button from the view.
       */
      noTryIt: { type: Boolean },
      /**
       * Computed list of operations to render in the operations list.
       */
      operations: { type: Array },
      /**
       * Computed value if the endpoint contains operations.
       */
      hasOperations: { type: Boolean },
      /**
       * If set then it renders methods documentation inline with
       * the endpoint documentation.
       * When it's not set (or value is `false`, default) then it renders
       * just a list of methods with links.
       */
      inlineMethods: { type: Boolean },
      /**
       * In inline mode, passes the `noUrlEditor` value on the
       * `api-request-panel`
       */
      noUrlEditor: { type: Boolean },
      /**
       * OAuth2 redirect URI.
       * This value **must** be set in order for OAuth 1/2 to work properly.
       * This is only required in inline mode (`inlineMethods`).
       */
      redirectUri: { type: String },
      /**
       * Enables compatibility with Anypoint components.
       */
      compatibility: { type: Boolean },
      /**
       * Applied outlined theme to the try it panel
       */
      outlined: { type: Boolean },
      /**
       * Passed to `api-type-document`. Enables internal links rendering for types.
       */
      graph: { type: Boolean },

      _editorEventTarget: { type: Object },
      /**
       * When set it hides bottom navigation links
       */
      noNavigation: { type: Boolean },
      /**
       * Holds the value of the currently selected server
       * Data type: URI
       */
      serverValue: { type: String },
      /**
       * Holds the type of the currently selected server
       * Values: `server` | `uri` | `custom`
       */
      serverType: { type: String },
      /**
       * Optional property to set
       * If true, the server selector is not rendered
       */
      noServerSelector: { type: Boolean },
      /**
       * Optional property to set
       * If true, the server selector custom base URI option is rendered
       */
      allowCustomBaseUri: { type: Boolean },
    };
  }

  get baseUri() {
    return this._baseUri;
  }

  set baseUri(value) {
    const old = this._baseUri;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._baseUri = value;
    this.endpointUri = this._computeEndpointUri();
  }

  get scrollTarget() {
    return this._scrollTarget;
  }

  set scrollTarget(value) {
    const old = this._scrollTarget;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._scrollTarget = value;
    this._scrollTargetChanged(value);
  }

  get inlineMethods() {
    return this._inlineMethods;
  }

  set inlineMethods(value) {
    const old = this._inlineMethods;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._inlineMethods = value;
    this._inlineMethodsChanged(value);
    this.operations = this._computeEndpointOperations(this.endpoint, value);
    this.requestUpdate('inlineMethods', old);
  }

  get operations() {
    return this._operations;
  }

  set operations(value) {
    const old = this._operations;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._operations = value;
    this.hasOperations = !!(value && value.length);
    this.requestUpdate('operations', old);
  }

  get endpoint() {
    return this._endpoint;
  }

  set endpoint(value) {
    const old = this._endpoint;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._endpoint = value;
    this._endpointChanged();
  }

  get selected() {
    return this._selected;
  }

  set selected(value) {
    const old = this._selected;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._selected = value;
    this.endpointUri = this._computeEndpointUri();
    this._selectedChanged(value);
  }

  get server() {
    return this._server;
  }

  set server(value) {
    const old = this._server;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._server = value;
    this.requestUpdate('server', old);
  }

  constructor() {
    super();
    this._scrollHandler = this._scrollHandler.bind(this);

    this._editorEventTarget = this;
    this.compatibility = false;
    this.narrow = false;
    this.graph = false;
    this.noServerSelector = false;
    this.allowCustomBaseUri = false;
    this.noUrlEditor = false;
    this.outlined = false;
    this.noNavigation = false;
    /**
     * @type {string}
     */
    this.serverValue = undefined;
    /**
     * @type {string}
     */
    this.serverType = undefined;
    /**
     * @type {string}
     */
    this.redirectUri = undefined;
    this.next = undefined;
    this.previous = undefined;
  }

  __amfChanged() {
    if (this.__amfProcessingDebouncer) {
      return;
    }
    this.__amfProcessingDebouncer = true;
    setTimeout(() => this._processModelChange());
  }

  _endpointChanged() {
    if (this.__endpointProcessingDebouncer) {
      return;
    }
    this.__endpointProcessingDebouncer = true;
    setTimeout(() => this._processEndpointChange());
  }

  _processModelChange() {
    this.__amfProcessingDebouncer = false;
    const { amf } = this;
    if (!amf) {
      return;
    }
    this.apiVersion = this._computeApiVersion(amf);
    this.operations = this._computeEndpointOperations(this.endpoint, this.inlineMethods);
  }

  _processEndpointChange() {
    this.__endpointProcessingDebouncer = false;
    const { endpoint } = this;
    if (!endpoint) {
      return;
    }
    this.endpointName = this._computeEndpointName(endpoint);
    this.description = this._computeDescription(endpoint);
    this.path = this._computePath(endpoint);
    this.hasCustomProperties = this._computeHasCustomProperties(endpoint);
    const types = this._computeExtendsTypes(endpoint);
    this.extendsTypes = types;
    this.traits = this._computeTraits(types);
    const parent = this._computeParentType(types);
    this.parentType = parent;
    this.parentTypeName = this._computeParentTypeName(parent);
    this.operations = this._computeEndpointOperations(endpoint, this.inlineMethods);
  }

  /**
   * Computes method's endpoint name.
   * It looks for `http://schema.org/name` in the endpoint definition and
   * if not found it uses path as name.
   *
   * @param {any} endpoint Endpoint model.
   * @return {string} Endpoint name.
   */
  _computeEndpointName(endpoint) {
    const name = /** @type string */ (this._getValue(endpoint, this.ns.aml.vocabularies.core.name));
    // if (!name) {
    //   name = this._computePath(endpoint);
    // }
    return name;
  }

  /**
   * Computes value of `path` property
   *
   * @param {any} endpoint Endpoint model.
   * @return {string}
   */
  _computePath(endpoint) {
    return /** @type string */ (this._getValue(endpoint, this.ns.aml.vocabularies.apiContract.path));
  }

  /**
   * Computes `extendsTypes`
   *
   * @param {any} shape AMF shape to get `#extends` model
   * @return {any[]|undefined}
   */
  _computeExtendsTypes(shape) {
    const key = this._getAmfKey(this.ns.aml.vocabularies.document.extends);
    return shape && this._ensureArray(shape[key]);
  }

  /**
   * Computes parent type as RAML's resource type.
   *
   * @param {any[]} types Current value of `extendsTypes`
   * @return {any|undefined}
   */
  _computeParentType(types) {
    if (!types || !types.length) {
      return undefined;
    }
    return types.find((item) =>
      this._hasType(item, this.ns.aml.vocabularies.apiContract.ParametrizedResourceType));
  }

  /**
   * Computes value for the `parentTypeName`
   *
   * @param {any} type Parent type shape
   * @return {string|undefined}
   */
  _computeParentTypeName(type) {
    return /** @type string */ (this._getValue(type, this.ns.aml.vocabularies.core.name));
  }

  /**
   * Computes value for `traits` property
   *
   * @param {any[]} types Current value of `extendsTypes`
   * @return {any[]|undefined}
   */
  _computeTraits(types) {
    if (!types || !types.length) {
      return undefined;
    }
    const data = types.filter((item) =>
      this._hasType(item, this.ns.aml.vocabularies.apiContract.ParametrizedTrait));
    return data.length ? data : undefined;
  }
  
  /**
   * Computes list of trait names to render it in the doc.
   *
   * @param {any[]} traits AMF trait definition
   * @return {String|undefined} Trait name if defined.
   */
  _computeTraitNames(traits) {
    if (!traits || !traits.length) {
      return undefined;
    }
    const names = traits.map((trait) => this._getValue(trait, this.ns.aml.vocabularies.core.name));
    if (names.length === 2) {
      return names.join(' and ');
    }
    return names.join(', ');
  }

  /**
   * Navigates to next method. Calls `_navigate` with id of previous item.
   */
  _navigatePrevious() {
    this._navigate(this.previous.id, 'endpoint');
  }

  /**
   * Navigates to next method. Calls `_navigate` with id of next item.
   */
  _navigateNext() {
    this._navigate(this.next.id, 'endpoint');
  }

  /**
   * Dispatches `api-navigation-selection-changed` so other components
   * can update their state.
   *
   * @param {String} id
   * @param {String} type
   */
  _navigate(id, type) {
    const e = new CustomEvent('api-navigation-selection-changed', {
      bubbles: true,
      composed: true,
      detail: {
        selected: id,
        type,
      }
    });
    this.dispatchEvent(e);
  }

  /**
   * Computes value for `operations` property.
   * @param {any} endpoint Endpoint model.
   * @param {boolean} inlineMethods
   * @return {any[]}
   */
  _computeEndpointOperations(endpoint, inlineMethods) {
    if (!endpoint) {
      return undefined;
    }
    const key = this._getAmfKey(this.ns.aml.vocabularies.apiContract.supportedOperation);
    const ops = this._ensureArray(endpoint[key]);
    if (!ops || !ops.length) {
      return undefined;
    }
    if (inlineMethods) {
      return ops.map((item) => {
        item._tryitOpened = true;
        return item;
      });
    }
    const result = [];
    ops.forEach((op) => {
      const method = this._getValue(op, this.ns.aml.vocabularies.apiContract.method);
      const name = this._getValue(op, this.ns.aml.vocabularies.core.name);
      const desc = this._getValue(op, this.ns.aml.vocabularies.core.description);
      result[result.length] = {
        method,
        name,
        desc,
        id: op['@id']
      };
    });
    return result;
  }

  _methodNavigate(e) {
    e.stopPropagation();
    e.preventDefault();
    const target = (e.path || e.composedPath()).find((node) => node.nodeName === 'A');
    const id = target.dataset.apiId;
    this._navigate(id, 'method');
  }

  /**
   * Handles scroll target change and adds scroll event.
   *
   * @param {HTMLElement|Window} st The scroll target.
   */
  _scrollTargetChanged(st) {
    if (this._oldScrollTarget) {
      this._oldScrollTarget.removeEventListener('scroll', this._scrollHandler);
      this._oldScrollTarget = undefined;
    }
    if (st) {
      st.addEventListener('scroll', this._scrollHandler);
      this._oldScrollTarget = st;
    }
  }

  /**
   * Scroll handler for `scrollTarget`.
   * It does not stall the main thread by executing the action after nex render.
   */
  _scrollHandler() {
    if (!this.inlineMethods) {
      return;
    }
    setTimeout(() => this._checkMethodsPosition());
  }

  /**
   * I hope this won't be required in final version :(
   */
  _checkMethodsPosition() {
    const st = this._oldScrollTarget;
    if (!st) {
      return;
    }
    // Window object has `scrollY` but HTML element has `scrollTop`
    // @ts-ignore
    const scroll = st.scrollY || st.scrollTop;
    if (scroll === undefined) {
      return;
    }
    const diff = (this._lastScrollPos || 0) - scroll;
    if (diff === 0) {
      return;
    }
    this._lastScrollPos = scroll;
    const dir = diff < 0 ? 'down' : 'up';
    // @ts-ignore
    const scrollHeight = st.scrollHeight || st.innerHeight;
    // @ts-ignore
    const targetHeight = st.offsetHeight || st.innerHeight;
    if (!this._methodsList) {
      const section = this.shadowRoot.querySelector('section.methods');
      // This list is a live node list so the reference has to be made
      // only once.
      this._methodsList = section.childNodes;
    }
    for (let i = 0, len = this._methodsList.length; i < len; i++) {
      const node = this._methodsList[i];
      if (node.nodeName !== 'DIV') {
        continue;
      }
      const div = /** @type HTMLDivElement */ (node);
      if (this._occupiesMainScrollArea(targetHeight, scrollHeight, dir, div)) {
        const doc = div.querySelector('api-method-documentation');
        // @ts-ignore
        this._notifyPassiveNavigation(doc.method['@id']);
        return;
      }
    }
  }

  /**
   * Function that checks if an `element` is in the main scrolling area.
   *
   * @param {number} targetHeight Height (visible) of the scroll target
   * @param {number} scrollHeight Height of the scroll target
   * @param {string} dir Direction where the scroll is going (up or down)
   * @param {Element} element The node to test
   * @return {boolean} True when it determines that the element is in the main
   * scroll area,
   */
  _occupiesMainScrollArea(targetHeight, scrollHeight, dir, element) {
    const rect = element.getBoundingClientRect();
    if (rect.top < 0 && rect.bottom > targetHeight) {
      // Occupies whole area
      return true;
    }
    if (rect.bottom < 0 || targetHeight < rect.top ||
      (rect.top < 0 && rect.top + rect.height <= 0)) {
      // Completely out of screen
      return false;
    }
    if (rect.top < 0 && dir === 'down' && rect.top + rect.height < targetHeight / 2) {
      // less than half screen
      return false;
    }
    if (dir === 'down' && (rect.top + rect.height) > targetHeight / 2) {
      return true;
    }
    const padding = 60;
    if (rect.y > 0 && rect.y < padding) {
      if (dir === 'up') {
        return false;
      }
      return true;
    }
    if (dir === 'up' && (rect.bottom + padding) > scrollHeight && rect.bottom < targetHeight) {
      return true;
    }
    return false;
  }

  /**
   * Dispatches `api-navigation-selection-changed` custom event with
   * `passive: true` set on the detail object.
   * Listeners should not react on this event except for the ones that
   * should reflect passive navigation change.
   *
   * @param {string} selected Id of selected method as in AMF model.
   */
  _notifyPassiveNavigation(selected) {
    if (this.__notifyingChange || this.__latestNotified === selected ||
      this.selected === selected) {
      return;
    }
    this.__latestNotified = selected;
    this.__notifyingChange = true;
    setTimeout(() => {
      this.__notifyingChange = false;
      this.dispatchEvent(new CustomEvent('api-navigation-selection-changed', {
        composed: true,
        bubbles: true,
        detail: {
          selected,
          type: 'method',
          passive: true
        }
      }));
    }, 200);
  }

  /**
   * Handler for either `selected` or `endpoint property change`
   * @param {string} selected Currently selected shape ID in AMF model
   */
  _selectedChanged(selected) {
    if (!selected) {
      return;
    }
    const { endpoint, inlineMethods } = this;
    if (!endpoint || !inlineMethods) {
      return;
    }
    setTimeout(() => this._repositionVerb(selected));
  }

  /**
   * Positions the method (operation) or endpoint (main title).
   *
   * @param {string} id Selected AMF id.
   */
  _repositionVerb(id) {
    let options;
    if ('scrollBehavior' in document.documentElement.style) {
      options = /** @type ScrollIntoViewOptions */ ({
        block: 'start',
        inline: 'nearest',
      });
    } else {
      options = true;
    }
    const isEndpoint = (this.endpoint && this.endpoint['@id'] === id);
    if (isEndpoint) {
      const title = this.shadowRoot.querySelector('.title');
      if (title) {
        title.scrollIntoView(true);
      }
      return;
    }
    const selector = `[data-operation-id="${id}"]`;
    const node = this.shadowRoot.querySelector(selector);
    if (!node) {
      return;
    }
    node.scrollIntoView(options);
  }

  _computeOperationId(item) {
    return item && item['@id'];
  }

  // Computes a label for the section toggle buttons.
  _computeToggleActionLabel(opened) {
    return opened ? 'Hide' : 'Show';
  }

  // Computes class for the toggle's button icon.
  _computeToggleIconClass(opened) {
    let classes = 'toggle-icon';
    if (opened) {
      classes += ' opened';
    }
    return classes;
  }

  /**
   * Computes example headers string for code snippets.
   * @param {any} method Method (operation) model
   * @return {string|undefined} Computed example value for headers
   */
  _computeSnippetsHeaders(method) {
    if (!method) {
      return undefined;
    }
    const expects = this._computeExpects(method);
    if (!expects) {
      return undefined;
    }
    let result;
    const headers = /** @type any[] */ (this._computeHeaders(expects));
    if (headers && headers.length) {
      result = '';
      headers.forEach((item) => {
        const name = this._getValue(item, this.ns.aml.vocabularies.core.name);
        const value = this._computePropertyValue(item) || '';
        result += `${name}: ${value}\n`;
      });
    }
    return result;
  }

  /**
   * Computes example payload string for code snippets.
   * @param {any[]} payload Payload model from AMF
   * @return {string|undefined} Computed example value for payload
   */
  _computeSnippetsPayload(payload) {
    if (payload && Array.isArray(payload)) {
      [payload] = payload;
    }
    if (this._hasType(payload, this.ns.aml.vocabularies.apiContract.Operation)) {
      const expects = this._computeExpects(payload);
      payload = this._computePayload(expects);
    }
    if (payload && Array.isArray(payload)) {
      [payload] = payload;
    }
    if (!payload) {
      return undefined;
    }

    let mt = /** @type string */ (this._getValue(payload, this.ns.aml.vocabularies.core.mediaType));
    if (!mt) {
      mt = 'application/json';
    }
    const gen = new ExampleGenerator(this.amf);
    const examples = gen.generatePayloadExamples(payload, mt, {});
    if (!examples || !examples[0]) {
      return undefined;
    }
    return examples[0].value;
  }

  /**
   * Tries to find an example value (whether it's default value or from an
   * example) to put it into snippet's values.
   *
   * @param {any} item A http://raml.org/vocabularies/http#Parameter property
   * @return {string|undefined}
   */
  _computePropertyValue(item) {
    const key = this._getAmfKey(this.ns.aml.vocabularies.shapes.schema);
    let schema = item && item[key];
    if (!schema) {
      return undefined;
    }
    if (Array.isArray(schema)) {
      [schema] = schema;
    }
    let value = /** @type string */ (this._getValue(item, this.ns.w3.shacl.defaultValue));
    if (!value) {
      const examplesKey = this._getAmfKey(this.ns.aml.vocabularies.apiContract.examples);
      let example = item[examplesKey];
      if (example) {
        if (Array.isArray(example)) {
          [example] = example;
        }
        value = /** @type string */ (this._getValue(item, this.ns.aml.vocabularies.document.value));
      }
    }
    return value;
  }

  /**
   * Computes value for `httpMethod` property.
   *
   * @param {any} method AMF `supportedOperation` model
   * @return {string|undefined} HTTP method name
   */
  _computeHttpMethod(method) {
    let name = /** @type string */ (this._getValue(method, this.ns.aml.vocabularies.apiContract.method));
    if (name) {
      name = name.toUpperCase();
    }
    return name;
  }

  _toggleSnippets(e) {
    const index = Number(e.currentTarget.dataset.index);
    const newState = !this.operations[index]._snippetsOpened;
    this.operations[index]._snippetsOpened = newState;
    this.requestUpdate();
  }

  _toggleRequestPanel(e) {
    const index = Number(e.currentTarget.dataset.index);
    const newState = !this.operations[index]._tryitOpened;
    this.operations[index]._tryitOpened = newState;
    this.requestUpdate();
  }

  /**
   * A handler for the `inlineMethods` property change.
   * When set it automatically disables the try it button.
   *
   * @param {boolean} value Current value of `inlineMethods`
   */
  _inlineMethodsChanged(value) {
    if (value && !this.noTryIt) {
      this.noTryIt = true;
    }
  }

  /**
   * Computes special class names for the method container.
   * It adds `first`, and `last` names to corresponding
   * containers.
   *
   * @param {number} index
   * @param {any[]} operations
   * @return {string}
   */
  _computeTryItColumClass(index, operations) {
    if (!operations || !operations.length || index === undefined) {
      return '';
    }
    let klass = '';
    if (index === 0) {
      klass += ' first';
    }
    if (index === operations.length - 1) {
      klass += ' last';
    }
    return klass;
  }

  _computeTryItSelected(item) {
    if (!item) {
      return undefined;
    }
    return item['@id'];
  }

  render() {
    const { hasOperations, description } = this;
    return html`<style>${this.styles}</style>
    ${this._getTitleTemplate()}
    ${this._getUrlTemplate()}
    ${this._getExtensionsTemplate()}
    ${this._annotationTemplate()}
    ${this._getDescriptionTemplate(description)}
    <div class="heading2 table-title" role="heading" aria-level="2">Methods</div>
    ${hasOperations ?
      this._getOperationsTemplate() :
      html`<p class="noinfo">This endpoint doesn't have HTTP methods defined in the API specification file.</p>`}
    ${this._getNavigationTemplate()}`;
  }

  _annotationTemplate() {
    if (!this.hasCustomProperties) {
      return '';
    }
    const { endpoint, amf } = this;
    return html`<api-annotation-document
      .amf="${amf}"
      .shape="${endpoint}"
    ></api-annotation-document>`
  }

  _getDescriptionTemplate(description) {
    if (!description) {
      return '';
    }
    return html`<arc-marked .markdown="${description}" sanitize>
      <div slot="markdown-html" class="markdown-body"></div>
    </arc-marked>`;
  }

  _getTitleTemplate() {
    const { endpointName } = this;
    if (!endpointName) {
      return '';
    }
    return html`
    <div role="heading" aria-level="1" class="title">${endpointName}</div>
    `;
  }

  _getUrlTemplate() {
    if (this.inlineMethods) {
      return '';
    }
    return html`
    <section class="url-area">
      <api-url
        .amf="${this.amf}"
        .server="${this.server}"
        .endpoint="${this.endpoint}"
        .apiVersion="${this.apiVersion}"
        .baseUri="${this.baseUri}"
        @change="${this._handleUrlChange}"
      ></api-url>
    </section>`;
  }

  _handleUrlChange(event) {
    this.endpointUri = event.detail.url;
  }

  _getExtensionsTemplate() {
    const { parentTypeName, traits } = this;
    const hasTraits = !!(traits && traits.length);
    if (!hasTraits && !parentTypeName) {
      return '';
    }
    const traitsLabel = hasTraits && this._computeTraitNames(traits);
    return html`<section class="extensions">
      ${parentTypeName ? html`<span>Implements </span>
      <span class="resource-type-name" title="Resource type applied to this endpoint">${parentTypeName}</span>.` : ''}
      ${hasTraits ? html`<span>Mixes in </span>
      <span class="trait-name">${traitsLabel}</span>.` : ''}
    </section>`;
  }

  _getOperationsTemplate() {
    return this.inlineMethods ?
      this._getInlineMethodsTemplate() :
      this._getMethodsListTemplate();
  }

  _getInlineMethodsTemplate() {
    const { operations } = this;
    if (!operations || !operations.length) {
      return '';
    }
    return html`<section class="methods">
      ${operations.map((item, index) => this._inlineMethodTemplate(item, index, operations))}
    </section>`;
  }

  _inlineMethodTemplate(item, index, operations) {
    const {
      amf,
      endpoint,
      narrow,
      baseUri,
      noTryIt,
      compatibility,
      graph,
      server,
    } = this;
    const klass = this._computeTryItColumClass(index, operations);
    return html`
    <div class="method-container ${klass}">
      <api-method-documentation
        data-operation-id="${item['@id']}"
        .amf="${amf}"
        .server="${server}"
        .endpoint="${endpoint}"
        .method="${item}"
        .narrow="${narrow}"
        .baseUri="${baseUri}"
        .noTryIt="${noTryIt}"
        .compatibility="${compatibility}"
        ?graph="${graph}"
        renderSecurity
      ></api-method-documentation>
      <div class="try-it-column">
        ${this._getRequestPanelTemplate(item, index)}
        ${this._getSnippetsTemplate(item, index)}
      </div>
    </div>`;
  }

  _getRequestPanelTemplate(item, index) {
    // TODO(pawel): maybe to use a directive that renders content asynchronously to
    // avoid cost of loading the try it panel with the method, especially when the try it panel
    // is not rendered immediately ith the method.
    const label = this._computeToggleActionLabel(item._tryitOpened);
    const iconClass = this._computeToggleIconClass(item._tryitOpened);
    return html`
    <section class="request-panel">
      <div
        class="section-title-area"
        data-index="${index}"
        @click="${this._toggleRequestPanel}"
        title="Toggle code example details"
      >
        <div class="heading3 table-title" role="heading" aria-level="2">Try the API</div>
        <div class="title-area-actions">
          <anypoint-button class="toggle-button" ?compatibility="${this.compatibility}">
            ${label}
            <arc-icon icon="expandMore" class="${iconClass}"></arc-icon>
          </anypoint-button>
        </div>
      </div>
      <anypoint-collapse .opened="${item._tryitOpened}">
        <api-request-panel
          .amf="${this.amf}"
          .selected="${item['@id']}"
          ?noServerSelector="${this.noServerSelector}"
          ?allowCustomBaseUri="${this.allowCustomBaseUri}"
          .serverValue="${this.serverValue}"
          .serverType="${this.serverType}"
          ?noUrlEditor="${this.noUrlEditor}"
          .baseUri="${this.baseUri}"
          .redirectUri="${this.redirectUri}"
          ?compatibility="${this.compatibility}"
          ?outlined="${this.outlined}"
        ></api-request-panel>
      </anypoint-collapse>
    </section>`;
  }

  _getSnippetsTemplate(item, index) {
    const label = this._computeToggleActionLabel(item._snippetsOpened);
    const iconClass = this._computeToggleIconClass(item._snippetsOpened);
    return html`<section class="snippets">
      <div
        class="section-title-area"
        data-index="${index}"
        @click="${this._toggleSnippets}" title="Toggle code example details">
        <div class="heading3 table-title" role="heading" aria-level="2">Code examples</div>
        <div class="title-area-actions">
          <anypoint-button class="toggle-button" ?compatibility="${this.compatibility}">
            ${label}
            <arc-icon icon="expandMore" class="${iconClass}"></arc-icon>
          </anypoint-button>
        </div>
      </div>
      <anypoint-collapse .opened="${item._snippetsOpened}">
        <http-code-snippets
          scrollable
          .url="${this.endpointUri}"
          .method="${this._computeHttpMethod(item)}"
          .headers="${this._computeSnippetsHeaders(item)}"
          .payload="${this._computeSnippetsPayload(item)}"></http-code-snippets>
      </anypoint-collapse>
    </section>`;
  }

  _getMethodsListTemplate() {
    const { operations } = this;
    if (!operations || !operations.length) {
      return '';
    }
    return html`<section class="methods">
      ${operations.map((item) => html`<div class="method">
        <div class="method-name">
          <a href="#" @click="${this._methodNavigate}" class="method-anchor" data-api-id="${item.id}">
            <span class="method-label" data-method="${item.method}">${item.method}</span>
            <span class="method-value" data-method="${item.name}">${item.name}</span>
          </a>
        </div>
        ${this._getDescriptionTemplate(item.desc)}
      </div>`)}
    </section>`;
  }

  _getNavigationTemplate() {
    const { next, previous, noNavigation } = this;
    if (!next && !previous || noNavigation) {
      return '';
    }
    return html`<section class="bottom-nav">
      ${previous ? html`<div class="bottom-link previous" @click="${this._navigatePrevious}">
        <anypoint-icon-button title="${previous.label}">
          <arc-icon icon="chevronLeft"></arc-icon>
        </anypoint-icon-button>
        <span class="nav-label">${previous.label}</span>
      </div>` : ''}
      <div class="nav-separator"></div>
      ${next ? html`<div class="bottom-link next" @click="${this._navigateNext}">
        <span class="nav-label">${next.label}</span>
        <anypoint-icon-button title="${next.label}">
          <arc-icon icon="chevronRight"></arc-icon>
        </anypoint-icon-button>
      </div>` : ''}
    </section>`;
  }
  /**
   * Dispatched when the user requested previous / next
   *
   * @event api-navigation-selection-changed
   * @param {String} selected
   * @param {String} type
   */
}
