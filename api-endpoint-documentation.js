import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import {AmfHelperMixin} from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@api-components/raml-aware/raml-aware.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@api-components/api-annotation-document/api-annotation-document.js';
import '@api-components/api-parameters-document/api-parameters-document.js';
import '@api-components/api-method-documentation/api-method-documentation.js';
import '@advanced-rest-client/markdown-styles/markdown-styles.js';
import '@polymer/marked-element/marked-element.js';
import '@api-components/clipboard-copy/clipboard-copy.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@api-components/api-request-panel/api-request-panel.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@advanced-rest-client/http-code-snippets/http-code-snippets.js';
import '@api-components/api-example-generator/api-example-generator.js';
import '@advanced-rest-client/arc-icons/arc-icons.js';
import '@api-components/http-method-label/http-method-label-common-styles.js';
/* eslint-disable max-len */
/**
 * `api-endpoint-documentation`
 *
 * A component to generate documentation for an endpoint from AMF model
 *
 * This element works with [AMF](https://github.com/mulesoft/amf) data model.
 * To properly compute all the information relevant to endpoint documentation
 * set the following properties:
 *
 * - amfModel - as AMF's WebApi data model
 * - endpoint - As AMF's EndPoint data model
 *
 * When set, this will automatically populate the wiew with data.
 *
 * ## Updating API's base URI
 *
 * By default the component render the documentation as it is defined
 * in the AMF model. Sometimes, however, you may need to replace the base URI
 * of the API with something else. It is useful when the API does not
 * have base URI property defined (therefore this component render relative
 * paths instead of URIs) or when you want to manage different environments.
 *
 * To update base URI value either update `baseUri` property or use
 * `iron-meta` with key `ApiBaseUri`. First method is easier but the second
 * gives much more flexibility since it use a
 * [monostate pattern](http://wiki.c2.com/?MonostatePattern)
 * to manage base URI property.
 *
 * When the component constructs the funal URI for the endpoint it does the
 * following:
 * - if `baseUri` is set it uses this value as a base uri for the endpoint
 * - else if `iron-meta` with key `ApiBaseUri` exists and contains a value
 * it uses it uses this value as a base uri for the endpoin
 t
 * - else if `amfModel` is set then it computes base uri value from main
 * model document
 * Then it concatenates computed base URI with `endpoint`'s path property.
 *
 * ### Example
 *
 * ```html
 * <iron-meta key="ApiBaseUri" value="https://domain.com"></iron-meta>
 * ```
 *
 * To update value of the `iron-meta`:
 * ```javascript
 * new Polymer.IronMeta({key: 'ApiBaseUri'}).value = 'https://other.domain';
 * ```
 *
 * Note: The element will not get notified about the change in `iron-meta`.
 * The change will be reflected whehn `amfModel` or `endpoint` property chnage.
 *
 * ## Inline methods layout
 *
 * When `inlineMethods` is set then methods (api-method-document) is rendered
 * instead of list of links to methods.
 * Deep linking is still supported. The page scrolls when navigation event
 * changes.
 *
 * In this layout the try it panel is rendered next to method documentation
 * (normal layout) or below method documentation (narrow layout).
 *
 * ## Styling
 *
 * `<api-endpoint-documentation>` provides the following custom properties
 * and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--api-endpoint-documentation` | Mixin applied to this elment | `{}`
 * `--arc-font-headline` | Theme mixin, Applied to h1 element (title) | `{}`
 * `--arc-font-code1` | Theme mixin, applied to the URL area | `{}`
 * `--api-endpoint-documentation-url-font-size` | Font size of endpoin URL | `16px`
 * `--api-endpoint-documentation-url-background-color` | Background color of the URL section | `#424242`
 * `--api-endpoint-documentation-url-font-color` | Font color of the URL area | `#fff`
 * `--api-endpoint-documentation-bottom-navigation-color` | Color of of the bottom navigartion (icon + text) | `#000`
 * `--api-endpoint-documentation-tryit-background-color` | Background color of inlined "try it" panel | `#ECEFF1`
 * `--api-endpoint-documentation-method-doc-border-top-color` | Method doc top border color |  `#E5E5E5`
 * `--api-endpoint-documentation-method-doc-border-top-style` | Method doc top border style | `dashed`
 * `--api-endpoint-documentation-tryit-panels-background-color` | Bg color of try it panels | `#fff`
 * `--api-endpoint-documentation-tryit-panels-border-radius` | Try it panels border radius | `3px`
 * `--api-endpoint-documentation-tryit-panels-border-color` | Try it panels border color | `#EEEEEE`
 * `--api-endpoint-documentation-tryit-panels-border-style` | Try it panels border style | `solid`
 * `--api-endpoint-documentation-tryit-section-title`
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 * @memberof ApiElements
 * @appliesMixin AmfHelperMixin
 */
class ApiEndpointDocumentation extends AmfHelperMixin(PolymerElement) {
  static get template() {
    return html`
    <style include="markdown-styles"></style>
    <style include="http-method-label-common-styles"></style>
    <style>
    :host {
      display: block;
      @apply --arc-font-body1;
      @apply --api-endpoint-documentation;
    }

    h1 {
      @apply --arc-font-display1;
    }

    h2 {
      @apply --arc-font-title;
      font-size: 22px;
    }

    :host([narrow]) h1 {
      font-size: 20px;
      margin: 0;
    }

    :host([narrow]) h2 {
      font-size: 18px;
    }

    marked-element {
      margin: 12px 0;
    }

    .markdown-body {
      margin-bottom: 28px;
      color: var(--api-endpoint-documentation-description-color, rgba(0, 0, 0, 0.74));
      @apply --arc-font-body1;
    }

    .extensions {
      font-style: italic;
      margin: 12px 0;
    }

    .bottom-nav,
    .bottom-link {
      @apply --layout-horizontal;
      @apply --layout-center;
    }

    .bottom-nav {
      padding: 32px 0;
      margin: 16px 0;
      color: var(--api-endpoint-documentation-bottom-navigation-color, #000);
      font-size: 18px;
    }

    .bottom-link {
      cursor: pointer;
      max-width: 50%;
      word-break: break-all;
    }

    .bottom-link.previous {
      margin-right: 12px;
    }

    .bottom-link.next {
      margin-left: 12px;
    }

    .nav-separator {
      @apply --layout-flex;
    }

    .url-area {
      @apply --layout-flex;
      @apply --layout-horizontal;
      @apply --layout-center;
      @apply --arc-font-code1;
      font-size: var(--api-endpoint-documentation-url-font-size, 16px);
      margin-bottom: 40px;
      background: var(--api-endpoint-documentation-url-background-color, #424242);
      color: var(--api-endpoint-documentation-url-font-color, #fff);
      padding: 8px;
      border-radius: 4px;
    }

    .url-area[extra-margin] {
      margin-top: 20px;
    }

    .url-value {
      @apply --layout-flex;
      word-break: break-all;
    }

    .method-label {
      margin-bottom: 0px;
    }

    .method-anchor {
      text-decoration: none;
      color: inherit;
      @apply --arc-font-body1;
      font-size: 16px;
      @apply --arc-link;
    }

    .method-anchor:hover {
      text-decoration: underline;
    }

    .method {
      margin: 0.83em 0;
    }

    .method p {
      margin: 0;
    }

    .method-name + p {
      margin-top: 0.83em;
    }

    .method-container {
      @apply --layout-horizontal;
      padding: 24px 0;
      box-sizing: border-box;
      border-top: 2px var(--api-endpoint-documentation-method-doc-border-top-color, #E5E5E5) var(--api-endpoint-documentation-method-doc-border-top-style, dashed);
    }

    :host([narrow]) .method-container {
      @apply --layout-vertical;
    }

    .method-container api-method-documentation {
      width: var(--api-endpoint-documentation-method-doc-width, 60%);
      max-width: var(--api-endpoint-documentation-method-doc-max-width);
      padding-right: 12px;
      box-sizing: border-box;
    }

    .method-container .try-it-column {
      width: var(--api-endpoint-documentation-tryit-width, 40%);
      max-width: var(--api-endpoint-documentation-tryit-max-width);
      background-color: var(--api-endpoint-documentation-tryit-background-color, #ECEFF1);
    }

    :host([narrow]) .method-container api-method-documentation,
    :host([narrow]) .method-container .try-it-column {
      border: none !important;
      max-width: 900px;
      width: 100%;
      margin: 0;
      padding: 0;
    }

    .try-it-column api-request-panel,
    .try-it-column http-code-snippets {
      margin: 12px;
      padding: 8px;
      background-color: var(--api-endpoint-documentation-tryit-panels-background-color, #fff);
      box-sizing: border-box;
      border-radius: var(--api-endpoint-documentation-tryit-panels-border-radius, 3px);
      border: 1px var(--api-endpoint-documentation-tryit-panels-border-color, #EEEEEE) var(--api-endpoint-documentation-tryit-panels-border-style, solid);
    }

    .try-it-column h3 {
      padding-left: 12px;
      padding-right: 12px;
      @apply --layout-flex;
      @apply --arc-font-title;
      @apply --api-endpoint-documentation-tryit-section-title;
    }

    .section-title-area {
      @apply --layout-horizontal;
      @apply --layout-center;
      border-bottom: 1px var(--api-endpoint-documentation-tryit-title-border-bottom-color, #bac6cb) var(--api-endpoint-documentation-tryit-title-border-bottom-style, solid);
      cursor: pointer;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    .toggle-button {
      outline: none;
      color: var(--api-method-document-toggle-view-color, var(--arc-toggle-view-icon-color, rgba(0, 0, 0, 0.74)));
      transition: color 0.25s ease-in-out;
      @apply --toggle-button;
    }

    .toggle-button:hover {
      color: var(--api-method-document-toggle-view-hover-color, var(--arc-toggle-view-icon-hover-color, rgba(0, 0, 0, 0.88)));
      @apply --toggle-button-hover;
    }

    .toggle-icon {
      margin-left: 8px;
      transform: rotateZ(0deg);
      transition: transform 0.3s ease-in-out;
    }

    .toggle-icon.opened {
      transform: rotateZ(-180deg);
    }

    .noinfo {
      @apply --no-info-message;
    }
    </style>
    <template is="dom-if" if="[[aware]]">
      <raml-aware raml="{{amfModel}}" scope="[[aware]]"></raml-aware>
    </template>
    <template is="dom-if" if="[[hasName]]">
      <h1 class="title">[[endpointName]]</h1>
    </template>

    <template is="dom-if" if="[[!inlineMethods]]">
      <section class="url-area" extra-margin\$="[[!hasName]]">
        <div class="url-value">[[path]]</div>
        <paper-icon-button class="action-icon copy-icon" icon="arc:content-copy" on-tap="_copyPathClipboard" title="Copy path to clipboard"></paper-icon-button>
      </section>
      <clipboard-copy id="pathCopy" content="[[path]]"></clipboard-copy>
    </template>

    <template is="dom-if" if="[[hasExtension]]">
      <section class="extensions">
        <template is="dom-if" if="[[hasParentType]]">
          <span>Implements </span>
          <span class="resource-type-name" title="Resource type applied to this endpoint">[[parentTypeName]]</span>.
        </template>
        <template is="dom-if" if="[[hasTraits]]">
          <span>Mixes in </span>
          <span class="trait-name">[[_computeTraitNames(traits)]]</span>.
        </template>
      </section>
    </template>
    <template is="dom-if" if="[[hasCustomProperties]]">
      <api-annotation-document shape="[[endpoint]]"></api-annotation-document>
    </template>
    <template is="dom-if" if="[[description]]">
      <marked-element markdown="[[description]]">
        <div slot="markdown-html" class="markdown-body"></div>
      </marked-element>
    </template>

    <h2>Methods</h2>
    <template is="dom-if" if="[[hasOperations]]">
      <template is="dom-if" if="[[inlineMethods]]" restamp="true">
        <section class="methods">
          <template is="dom-repeat" items="[[operations]]" on-dom-change="_operationRendered" initial-count="2">
            <div class\$="method-container [[_computeTryItColumClass(index, operations)]]">
              <api-method-documentation data-operation-id\$="[[_computeOperationId(item)]]" amf-model="[[amfModel]]" endpoint="[[endpoint]]" method="[[item]]" narrow="[[narrow]]" base-uri="[[baseUri]]" no-try-it="[[noTryIt]]" render-security=""></api-method-documentation>
              <div class="try-it-column">
                <section class="request-panel">
                  <div class="section-title-area" on-click="_toggleRequestPanel" title="Toogle code example details">
                    <h3 class="table-title">Try the API</h3>
                    <div class="title-area-actions">
                      <paper-button class="toggle-button">
                        [[_computeToggleActionLabel(item._tryitOpened)]]
                        <iron-icon icon="arc:expand-more" class\$="[[_computeToggleIconClass(item._tryitOpened)]]"></iron-icon>
                      </paper-button>
                    </div>
                  </div>
                  <iron-collapse opened="[[item._tryitOpened]]">
                    <template is="dom-if" restamp="true" data-type="arp-if" on-dom-change="_tryItRendered">
                      <api-request-panel amf-model="[[amfModel]]" selected="[[_computeTryItSelected(item)]]" narrow="[[narrow]]" no-url-editor="[[noUrlEditor]]" base-uri="[[baseUri]]" redirect-uri="[[redirectUri]]" no-docs=""></api-request-panel>
                    </template>
                  </iron-collapse>
                </section>
                <section class="snippets">
                  <div class="section-title-area" on-click="_toggleSnippets" title="Toogle code example details">
                    <h3 class="table-title">Code examples</h3>
                    <div class="title-area-actions">
                      <paper-button class="toggle-button">
                        [[_computeToggleActionLabel(item._snippetsOpened)]]
                        <iron-icon icon="arc:expand-more" class\$="[[_computeToggleIconClass(item._snippetsOpened)]]"></iron-icon>
                      </paper-button>
                    </div>
                  </div>
                  <iron-collapse opened="[[item._snippetsOpened]]">
                    <http-code-snippets url="[[endpointUri]]" method="[[_computeHttpMethod(item)]]" headers="[[_computeSnippetsHeaders(item)]]" payload="[[_computeSnippetsPayload(item)]]"></http-code-snippets>
                  </iron-collapse>
                </section>
              </div>
            </div>
          </template>
        </section>
      </template>
      <template is="dom-if" if="[[!inlineMethods]]" restamp="true">
        <section class="methods">
          <template is="dom-repeat" items="[[operations]]">
            <div class="method">
              <div class="method-name">
                <a href="#" on-click="_methodNavigate" class="method-anchor" data-api-id\$="[[item.id]]">
                  <span class="method-label" data-method\$="[[item.method]]">[[item.method]]</span>
                  <span class="method-value" data-method\$="[[item.name]]">[[item.name]]</span>
                </a>
              </div>
              <template is="dom-if" if="[[item.desc]]">
                <p>[[item.desc]]</p>
              </template>
            </div>
          </template>
        </section>
      </template>
    </template>

    <template is="dom-if" if="[[!hasOperations]]">
      <p class="noinfo">This enpoint doesn't have HTTP methods defined in the API specification file.</p>
    </template>

    <template is="dom-if" if="[[hasPagination]]">
      <section class="bottom-nav">
        <template is="dom-if" if="[[hasPreviousLink]]">
          <div class="bottom-link previous" on-tap="_navigatePrevious">
            <paper-icon-button icon="arc:chevron-left"></paper-icon-button>
            <span class="nav-label">[[previous.label]]</span>
          </div>
        </template>
        <div class="nav-separator"></div>
        <template is="dom-if" if="[[hasNextLink]]">
          <div class="bottom-link next" on-tap="_navigateNext">
            <span class="nav-label">[[next.label]]</span>
            <paper-icon-button icon="arc:chevron-right"></paper-icon-button>
          </div>
        </template>
      </section>
    </template>
    <api-example-generator amf-model="[[amfModel]]" id="exampleGenerator"></api-example-generator>
`;
  }

  static get properties() {
    return {
      /**
       * `raml-aware` scope property to use.
       */
      aware: String,
      /**
       * Generated AMF json/ld model form the API spec.
       * The element assumes the object of the first array item to be a
       * type of `"http://raml.org/vocabularies/document#Document`
       * on AMF vocabulary.
       *
       * It is only usefult for the element to resolve references.
       *
       * @type {Object|Array}
       */
      amfModel: Object,
      /**
       * Method's endpoint definition as a
       * `http://raml.org/vocabularies/http#endpoint` of AMF model.
       */
      endpoint: {type: Object, observer: '_endpointChnaged'},
      /**
       * The ID in `amfModel` of current selection. It can be this endpoint
       * or any of methods
       */
      selected: {type: String},
      /**
       * A property to set to override AMF's model base URI information.
       * When this property is set, the `endpointUri` property is recalculated.
       */
      baseUri: String,
      /**
       * Computed value, API version name
       */
      apiVersion: {
        type: String,
        computed: '_computeApiVersion(amfModel)'
      },
      /**
       * Endpoint URI to display in main URL field.
       * This value is computed when `amfModel`, `endpoint` or `baseUri` change.
       */
      endpointUri: {
        type: String,
        computed: '_computeEndpointUri(server, endpoint, baseUri, apiVersion)'
      },
      /**
       * Computed value of the `http://raml.org/vocabularies/http#server`
       * from `amfModel`
       */
      server: {
        type: Object,
        computed: '_computeServer(amfModel)'
      },
      /**
       * Endpoint name.
       * It should be either a "displayName" or endpoint's relative
       * path.
       */
      endpointName: {
        type: String,
        computed: '_computeEndpointName(endpoint)'
      },
      /**
       * Computed value, `true` if the endpoint has display name.
       */
      hasName: {
        type: Boolean,
        value: false,
        computed: '_computeHasStringValue(endpointName)'
      },
      /**
       * Computed value of method description from `method` property.
       */
      description: {
        type: String,
        computed: '_computeDescription(endpoint)'
      },
      /**
       * Computed value of endpoint's path.
       */
      path: {
        type: String,
        computed: '_computePath(endpoint)'
      },
      /**
       * Computed value from current `method`. True if the model containsPATCH
       * custom properties (annotations in RAML).
       */
      hasCustomProperties: {
        type: Boolean,
        computed: '_computeHasCustomProperties(endpoint)'
      },
      /**
       * Computed value of AMF security definition from `method`
       * property.
       */
      security: {
        type: Object,
        computed: '_computeSecurity(endpoint)'
      },
      /**
       * Computed value, true if `security` has values.
       */
      hasSecurity: {
        type: Boolean,
        computed: '_computeHasArrayValue(security)'
      },
      /**
       * If set it will renders the view in the narrow layout.
       */
      narrow: {
        type: Boolean,
        reflectToAttribute: true
      },
      /**
       * List of traits and resource types, if any.
       *
       * @type {Array<Object>}
       */
      extendsTypes: {
        type: Array,
        computed: '_computeExtendsTypes(endpoint)'
      },
      /**
       * Computed value of a parent type.
       * In RAML it is resource type that can be applied to a resource.
       */
      parentType: {
        type: Object,
        computed: '_computeParentType(extendsTypes)'
      },
      /**
       * Computed value, true if `parentType` has a value.
       */
      hasParentType: {
        type: Boolean,
        computed: '_computeHasParentType(parentType)'
      },
      /**
       * Computed value for parent type name.
       */
      parentTypeName: {
        type: String,
        computed: '_computeParentTypeName(parentType)'
      },
      /**
       * List of traits appied to this endpoint
       *
       * @type {Array<Object>}
       */
      traits: {
        type: Array,
        computed: '_computeTraits(extendsTypes)'
      },
      /**
       * Computed value, true if the endpoint has traits.
       */
      hasTraits: {
        type: Boolean,
        computed: '_computeHasArrayValue(traits)'
      },
      /**
       * True if the endpoint is extended by either traits or resource type.
       */
      hasExtension: {
        type: Boolean,
        computed: '_computeHasExtension(hasTraits, hasParentType)'
      },
      /**
       * Model to generate a link to previous HTTP endpoint.
       * It should contain `id` and `label` properties
       */
      previous: Object,
      /**
       * Computed value, true if `previous` is set
       */
      hasPreviousLink: {
        type: Boolean,
        computed: '_computeHasStringValue(previous)'
      },
      /**
       * Model to generate a link to next HTTP endpoint.
       * It should contain `id` and `label` properties
       */
      next: Object,
      /**
       * Computed value, true if `next` is set
       */
      hasNextLink: {
        type: Boolean,
        computed: '_computeHasStringValue(next)'
      },
      /**
       * Computed value, true to render bottom navigation
       */
      hasPagination: {
        type: Boolean,
        computed: '_computeHasNavigation(hasPreviousLink, hasNextLink)'
      },
      /**
       * Scroll target used to observe `scroll` event.
       * When set the element will observe scroll and inform other components
       * about changes in navigation while scrolling through methods list.
       * The navigation event contains `passive: true` property that
       * determines that it's not user triggered navigation but rather
       * context enforced.
       */
      scrollTarget: {
        type: Object,
        observer: '_scrollTargetChanged'
      },
      /**
       * Passing value of `noTryIt` to the method documentation.
       * Hiddes "Try it" button from the view.
       */
      noTryIt: Boolean,
      /**
       * Computed list of operations to render in the operations list.
       * @type {Object}
       */
      operations: {
        type: Array,
        computed: '_computeOperations(endpoint, inlineMethods, amfModel)'
      },
      /**
       * Computed value if the endpoint contains operations.
       */
      hasOperations: {
        type: Boolean,
        value: false,
        computed: '_computeHasArrayValue(operations)'
      },
      /**
       * If set then it renders methods documentation inline with
       * the endpoint documentation.
       * When it's not set (or value is `false`, default) then it renders
       * just a list of methods with links.
       */
      inlineMethods: {
        type: Boolean,
        value: false,
        observer: '_inlineMethodsChanged'
      },
      /**
       * In inline mode, passes the `noUrlEditor` value on the
       * `api-request-paqnel`
       */
      noUrlEditor: Boolean,
      /**
       * OAuth2 redirect URI.
       * This value **must** be set in order for OAuth 1/2 to work properly.
       * This is only required in inline mode (`inlineMethods`).
       */
      redirectUri: String,
      _editorEventTarget: {
        type: Object,
        readOnly: true,
        value: function() {
          return this;
        }
      }
    };
  }

  static get observers() {
    return [
      '_selectedChanged(selected, endpoint, inlineMethods)'
    ];
  }

  constructor() {
    super();
    this._scrollHandler = this._scrollHandler.bind(this);
  }

  /**
   * Computes method's endpoint name.
   * It looks for `http://schema.org/name` in the endpoint definition and
   * if not found it uses path as name.
   *
   * @param {Object} endpoint Endpoint model.
   * @return {String} Endpoint name.
   */
  _computeEndpointName(endpoint) {
    const name = this._getValue(endpoint, this.ns.schema.schemaName);
    // if (!name) {
    //   name = this._computePath(endpoint);
    // }
    return name;
  }
  /**
   * Computes value of `path` property
   *
   * @param {Object} endpoint Endpoint model.
   * @return {String}
   */
  _computePath(endpoint) {
    return this._getValue(endpoint, this.ns.raml.vocabularies.http + 'path');
  }
  /**
   * Computes `extendsTypes`
   *
   * @param {Object} shape AMF shape to get `#extends` model
   * @return {Array<Object>|undefined}
   */
  _computeExtendsTypes(shape) {
    const key = this._getAmfKey(this.ns.raml.vocabularies.document + 'extends');
    return shape && this._ensureArray(shape[key]);
  }
  /**
   * Computes parent type as RAML's resource type.
   *
   * @param {Array<Object>} types Current value of `extendsTypes`
   * @return {Object|undefined}
   */
  _computeParentType(types) {
    if (!types || !types.length) {
      return;
    }
    return types.find((item) =>
      this._hasType(item, this.ns.raml.vocabularies.document + 'ParametrizedResourceType'));
  }
  /**
   * Computes value for `hasParentType` property
   *
   * @param {?Object} type Parent resource type.
   * @return {Boolean}
   */
  _computeHasParentType(type) {
    return !!type;
  }
  /**
   * Computes vaolue for `parentTypeName`
   *
   * @param {?Object} type Parent type shape
   * @return {String|undefined}
   */
  _computeParentTypeName(type) {
    return this._getValue(type, this.ns.schema.schemaName);
  }
  /**
   * Computes value for `traits` property
   *
   * @param {Array<Object>} types Current value of `extendsTypes`
   * @return {Array<Object>|undefined}
   */
  _computeTraits(types) {
    if (!types || !types.length) {
      return;
    }
    const data = types.filter((item) =>
      this._hasType(item, this.ns.raml.vocabularies.document + 'ParametrizedTrait'));
    return data.length ? data : undefined;
  }
  /**
   * Computes list of trait names to render it in the doc.
   *
   * @param {Array<Object>} traits AMF trait definition
   * @return {String|undefined} Trait name if defined.
   */
  _computeTraitNames(traits) {
    if (!traits || !traits.length) {
      return;
    }
    const names = traits.map((trait) => this._getValue(trait, this.ns.schema.schemaName));
    if (names.length === 2) {
      return names.join(' and ');
    }
    return names.join(', ');
  }
  /**
   * Computes value for `hasExtension` property
   *
   * @param {Boolean} hasTraits
   * @param {Boolean} hasParentType
   * @return {Boolean}
   */
  _computeHasExtension(hasTraits, hasParentType) {
    return !!(hasTraits || hasParentType);
  }
  /**
   * Computes value for `hasPagination` property
   * @param {Boolean} previous
   * @param {Boolean} next
   * @return {Boolean}
   */
  _computeHasNavigation(previous, next) {
    return !!(previous || next);
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
        type: type
      }
    });
    this.dispatchEvent(e);
  }

  _copyPathClipboard(e) {
    const button = e.localTarget || e.target;
    if (this.$.pathCopy.copy()) {
      button.icon = 'arc:done';
    } else {
      button.icon = 'arc:error';
    }
    setTimeout(() => {
      button.icon = 'arc:content-copy';
    }, 1000);
  }
  /**
   * Computes value for `operations` property.
   * @param {Object} endpoint Endpoint model.
   * @param {Boolean} inlineMethods
   * @return {Array<Object>}
   */
  _computeOperations(endpoint, inlineMethods) {
    if (!endpoint) {
      return;
    }
    const key = this._getAmfKey(this.ns.w3.hydra.supportedOperation);
    const ops = this._ensureArray(endpoint[key]);
    if (!ops || !ops.length) {
      return;
    }
    if (inlineMethods) {
      return ops.map((item) => {
        item._tryitOpened = true;
        return item;
      });
    }
    const result = [];
    for (let i = 0, len = ops.length; i < len; i++) {
      const op = ops[i];
      const method = this._getValue(op, this.ns.w3.hydra.core + 'method');
      const name = this._getValue(op, this.ns.schema.schemaName);
      const desc = this._getValue(op, this.ns.schema.desc);
      result[result.length] = {
        method,
        name,
        desc,
        id: op['@id']
      };
    }
    return result;
  }

  _methodNavigate(e) {
    e.stopPropagation();
    e.preventDefault();
    const target = e.composedPath().find((node) => node.nodeName === 'A');
    const id = target.dataset.apiId;
    this._navigate(id, 'method');
  }

  /**
   * Handles scroll target chane and adds scroll event.
   *
   * @param {Node} st The scroll target.
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
   * It does not stall main thred by executing the action after nex render.
   */
  _scrollHandler() {
    if (!this.inlineMethods) {
      return;
    }
    afterNextRender(this, this._checkMethodsPosition);
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
    const scrollHeigth = st.scrollHeight || st.innerHeight;
    const targetHeigth = st.offsetHeight || st.innerHeight;
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
      if (this._occupiesMainScrollArea(targetHeigth, scrollHeigth, dir, node)) {
        const doc = node.querySelector('api-method-documentation');
        this._notifyPassiveNavigation(doc.method['@id']);
        return;
      }
    }
  }
  /**
   * Function that checks if an `element` is in the main scrolling area.
   *
   * @param {Number} targetHeigth Height (visible) of the scroll target
   * @param {Number} scrollHeigth Height of the scroll target
   * @param {String} dir Direction where the scroll is going (up or down)
   * @param {Node} element The node to test
   * @return {Boolean} True when it determines that the element is in the main
   * scroll area,
   */
  _occupiesMainScrollArea(targetHeigth, scrollHeigth, dir, element) {
    const rect = element.getBoundingClientRect();
    if (rect.top < 0 && rect.bottom > targetHeigth) {
      // Occupies whole area
      return true;
    }
    if (rect.bottom < 0 || targetHeigth < rect.top ||
      (rect.top < 0 && rect.top + rect.height <= 0)) {
      // Completely out of screen
      return false;
    }
    if (rect.top < 0 && dir === 'down' && rect.top + rect.height < targetHeigth / 2) {
      // less than half screen
      return false;
    }
    if (dir === 'down' && (rect.top + rect.height) > targetHeigth / 2) {
      return true;
    }
    const padding = 60;
    if (rect.y > 0 && rect.y < padding) {
      if (dir === 'up') {
        return false;
      }
      return true;
    }
    if (dir === 'up' && (rect.bottom + padding) > scrollHeigth && rect.bottom < targetHeigth) {
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
   * @param {String} selected Id of selected method as in AMF model.
   */
  _notifyPassiveNavigation(selected) {
    if (this.__notyfyingChange || this.__latestNotified === selected ||
      this.selected === selected) {
      return;
    }
    this.__latestNotified = selected;
    this.__notyfyingChange = true;
    setTimeout(() => {
      this.__notyfyingChange = false;
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
   * Hadnler for either `selected` or `endpoint proerty change`
   * @param {String} selected Currently selected shape ID in AMF model
   * @param {Object} endpoint AMF model for the endpoint.
   * @param {Boolean} inlineMethods True if methods documentation is included
   */
  _selectedChanged(selected, endpoint, inlineMethods) {
    if (!selected || !endpoint || !inlineMethods) {
      return;
    }
    afterNextRender(this, () => this._repositionVerb(selected));
  }
  /**
   * Positions the method (operation) or endpoint (main title).
   *
   * @param {String} id Selected AMF id.
   */
  _repositionVerb(id) {
    let options;
    if ('scrollBehavior' in document.documentElement.style) {
      options = {
        block: 'start',
        inline: 'nearest'
      };
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
    let clazz = 'toggle-icon';
    if (opened) {
      clazz += ' opened';
    }
    return clazz;
  }

  /**
   * Computes example headers string for code snippets.
   * @param {Array} method Method (operation) model
   * @return {String|undefind} Computed example value for headers
   */
  _computeSnippetsHeaders(method) {
    if (!method) {
      return;
    }
    const expects = this._computeExpects(method);
    if (!expects) {
      return;
    }
    let result;
    const headers = this._computeHeaders(expects);
    if (headers && headers.length) {
      result = '';
      headers.forEach((item) => {
        const name = this._getValue(item, this.ns.schema.schemaName);
        const value = this._computePropertyValue(item) || '';
        result += `${name}: ${value}\n`;
      });
    }
    return result;
  }
  /**
   * Computes example payload string for code snippets.
   * @param {Array} payload Payload model from AMF
   * @return {String|undefind} Computed example value for payload
   */
  _computeSnippetsPayload(payload) {
    if (payload && payload instanceof Array) {
      payload = payload[0];
    }
    if (this._hasType(payload, this.ns.w3.hydra.core + 'Operation')) {
      const expects = this._computeExpects(payload);
      payload = this._computePayload(expects);
    }
    if (payload && payload instanceof Array) {
      payload = payload[0];
    }
    if (!payload) {
      return;
    }

    let mt = this._getValue(payload, this.ns.raml.vocabularies.http + 'mediaType');
    if (!mt) {
      mt = 'application/json';
    }
    const examples = this.$.exampleGenerator.generatePayloadExamples(payload, mt, {});
    if (!examples || !examples[0]) {
      return;
    }
    return examples[0].value;
  }
  /**
   * Tries to find an example value (whether it's default value or from an
   * example) to put it into snippet's values.
   *
   * @param {Object} item A http://raml.org/vocabularies/http#Parameter property
   * @return {String|undefined}
   */
  _computePropertyValue(item) {
    const key = this._getAmfKey(this.ns.raml.vocabularies.http + 'schema');
    let schema = item && item[key];
    if (!schema) {
      return;
    }
    if (schema instanceof Array) {
      schema = schema[0];
    }
    let value = this._getValue(item, this.ns.w3.shacl.name + 'defaultValue');
    if (!value) {
      const examplesKey = this._getAmfKey(this.ns.raml.vocabularies.document + 'examples');
      let example = item[examplesKey];
      if (example) {
        if (example instanceof Array) {
          example = example[0];
        }
        value = this._getValue(item, this.ns.raml.vocabularies.document + 'value');
      }
    }
    return value;
  }

  /**
   * Computes value for `httpMethod` property.
   *
   * @param {Object} method AMF `supportedOperation` model
   * @return {String|undefined} HTTP method name
   */
  _computeHttpMethod(method) {
    let name = this._getValue(method, this.ns.w3.hydra.core + 'method');
    if (name) {
      name = name.toUpperCase();
    }
    return name;
  }

  _toggleSnippets(e) {
    const newState = !e.model.get('item._snippetsOpened');
    e.model.set('item._snippetsOpened', newState);
  }

  _toggleRequestPanel(e) {
    const newState = !e.model.get('item._tryitOpened');
    e.model.set('item._tryitOpened', newState);
  }
  /**
   * A handler for the `inlineMethods` property change.
   * When set it automatically disables the try it button.
   *
   * @param {Boolean} value Current value of `inlineMethods`
   */
  _inlineMethodsChanged(value) {
    if (value) {
      this.noTryIt = true;
    }
  }
  /**
   * The try it panel is not rendered at start time when the user initializes
   * the endpoint documentation to reduce number of computations happening
   * at the same time. When `dom-repeat` renders all documentation
   * panels it calls this function which initializes requests panels one
   * by one in the tasks scheduler.
   */
  _operationRendered() {
    const ifs = this.shadowRoot.querySelectorAll('[data-type="arp-if"]');
    this._renderTryItQueue(ifs);
  }
  /**
   * Renders next try it panel from the NodeList
   * @param {NodeList} queue Node list of `dom-if`'s with the panel
   * @param {?Number} index Currently iterated item.
   */
  _renderTryItQueue(queue, index) {
    index = index || 0;
    const domIf = queue[index];
    if (!domIf) {
      return;
    }
    afterNextRender(this, () => {
      domIf.if = true;
      index++;
      this._renderTryItQueue(queue, index);
    });
  }
  /**
   * Request editor handles events when it's state changes. But the change
   * may influence other editors visible on the same page (eg URL change).
   * When the request panel is rendered it sets events target of the panel
   * to the panel so it won't listen for changes in other editors.
   *
   * @param {CustomEvent} e
   */
  _tryItRendered(e) {
    if (!e.target.if) {
      return;
    }
    const panel = e.target.parentElement.querySelector('api-request-panel');
    panel.eventsTarget = panel;
  }
  /**
   * Sets `false` on try it condition templae.
   */
  _clearRequestPanels() {
    const ifs = this.shadowRoot.querySelectorAll('[data-type="arp-if"]');
    for (let i = 0; i < ifs.length; i++) {
      if (ifs[i].if) {
        ifs[i].if = false;
      }
    }
  }
  /**
   * Computes special class names for the method container.
   * It adds `first`, and `last` names to corresponding
   * containers.
   *
   * @param {Number} index
   * @param {Array} operations
   * @return {String}
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
      return;
    }
    return item['@id'];
  }

  _endpointChnaged() {
    this._clearRequestPanels();
  }
  /**
   * Dispatched when the user requested previous / next
   *
   * @event api-navigation-selection-changed
   * @param {String} selected
   * @param {String} type
   */
}
window.customElements.define('api-endpoint-documentation', ApiEndpointDocumentation);
