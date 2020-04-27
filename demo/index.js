import { html } from 'lit-html';
import { ApiDemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import '@advanced-rest-client/arc-demo-helper/arc-demo-helper.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@api-components/api-navigation/api-navigation.js';
import '@polymer/paper-toast/paper-toast.js';
import '@anypoint-web-components/anypoint-styles/colors.js';
import '@anypoint-web-components/anypoint-styles/typography.js';
import '@advanced-rest-client/oauth-authorization/oauth2-authorization.js';
import '@advanced-rest-client/oauth-authorization/oauth1-authorization.js';
import '@advanced-rest-client/xhr-simple-request/xhr-simple-request.js';
import '@api-components/api-server-selector/api-server-selector.js';
import '../api-endpoint-documentation.js';

class ComponentDemo extends ApiDemoPage {
  constructor() {
    super();

    this.initObservableProperties([
      'compatibility',
      'narrow',
      'noTryit',
      'endpoint',
      'previous',
      'next',
      'inlineMethods',
      'selectedShape',
      'scrollTarget',
      'renderCustomServer',
      'allowCustomBaseUri',
      'noServerSelector',
      'urlLabel',
      'serverType',
      'serverValue',
    ]);
    this.componentName = 'api-endpoint-documentation';
    this.noTryit = false;
    this.inlineMethods = false;
    this.codeSnippets = true;
    this.renderSecurity = true;
    this.renderCustomServer = false;
    this.allowCustomBaseUri = false;
    this.noServerSelector = false;
    this.urlLabel = false;

    this.redirectUri = 'https://auth.advancedrestclient.com/oauth-popup.html';
    this.scrollTarget = window;

    this.demoStates = ['Material', 'Anypoint'];
    this._demoStateHandler = this._demoStateHandler.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);
    this._tryitRequested = this._tryitRequested.bind(this);
    this._serverHandler = this._serverHandler.bind(this);
  }

  get server() {
    const { serverValue, serverType, endpointId, methodId } = this;
    if (serverType && serverType !== 'server') {
      return null;
    }
    const servers = this._getServers({ endpointId, methodId });
    if (!servers || !servers.length) {
      return null;
    }
    if (!serverValue && servers.length) {
      return servers[0];
    }
    return servers.find((server) => this._getServerUri(server) === serverValue);
  }

  get baseUri() {
    const { serverValue, serverType } = this;
    if (['custom', 'uri'].indexOf(serverType) !== -1) {
      return serverValue;
    }
    return null;
  }

  /**
   * @param {Object} server Server definition.
   * @return {String|undefined} Value for server's base URI
   */
  _getServerUri(server) {
    const key = this._getAmfKey(this.ns.aml.vocabularies.core.urlTemplate);
    return /** @type string */ (this._getValue(server, key));
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.outlined = state === 1;
    this.compatibility = state === 2;
    this._updateCompatibility();
  }

  _navChanged(e) {
    const { selected, type, passive, endpointId } = e.detail;
    if (passive) {
      const toast = document.getElementById('navToast');
      toast.text = 'Passive navigation to: ' + selected;
      toast.opened = true;
      return;
    }
    const allowed = ['endpoint'];
    if (this.inlineMethods) {
      allowed.push('method');
    }
    if (allowed.indexOf(type) !== -1) {
      this.setData(selected, type, endpointId);
      this.hasData = true;
    } else {
      this.hasData = false;
    }
  }

  setData(id, type, endpointId) {
    if (type === 'method') {
      this.endpointId = endpointId;
      this.methodId = id;
    } else {
      this.endpointId = id;
      this.methodId = null;
    }
    const eId = type === 'method' ? endpointId : id;
    if (this.endpoint) {
      const currentId = this.endpoint['@id'];
      if (currentId === eId) {
        this.selectedShape = id;
        return;
      }
    }
    const webApi = this._computeWebApi(this.amf);
    const endpoint = this._computeEndpointModel(webApi, eId);
    if (!endpoint) {
      this.endpoint = undefined;
      this.selectedShape = undefined;
      return;
    }
    this.endpoint = endpoint;
    this.selectedShape = id;
    const endpoints = this._computeEndpoints(webApi);
    for (let i = 0, len = endpoints.length; i < len; i++) {
      if (endpoints[i]['@id'] === eId) {
        this._setPrevious(endpoints[i - 1]);
        this._setNext(endpoints[i + 1]);
        break;
      }
    }
  }

  _setPrevious(item) {
    if (!item) {
      this.previous = undefined;
      return;
    }
    let name = this._getValue(item, this.ns.aml.vocabularies.core.name);
    if (!name) {
      name = this._getValue(item, this.ns.aml.vocabularies.apiContract.path);
    }
    this.previous = {
      id: item['@id'],
      label: name
    };
  }

  _setNext(item) {
    if (!item) {
      this.next = undefined;
      return;
    }
    let name = this._getValue(item, this.ns.aml.vocabularies.core.name);
    if (!name) {
      name = this._getValue(item, this.ns.aml.vocabularies.apiContract.path);
    }
    this.next = {
      id: item['@id'],
      label: name
    };
  }

  _apiListTemplate() {
    return [
      ['google-drive-api', 'Google Drive'],
      ['multi-server', 'Multiple servers'],
      ['exchange-experience-api', 'Exchange xAPI'],
      ['demo-api', 'Demo API'],
      ['appian-api', 'Applian API'],
      ['nexmo-sms-api', 'Nexmo SMS API'],
    ].map(([file, label]) => html`
      <anypoint-item data-src="${file}-compact.json">${label} - compact model</anypoint-item>
      <anypoint-item data-src="${file}.json">${label}</anypoint-item>
      `);
  }

  _tryitRequested() {
    const toast = document.getElementById('tryItToast');
    toast.opened = true;
  }

  _serverHandler(e) {
    const { value, type } = e.detail;
    this.serverType = type;
    this.serverValue = value;
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      compatibility,
      amf,
      narrow,
      endpoint,
      selectedShape,
      previous,
      scrollTarget,
      redirectUri,
      inlineMethods,
      next,
      noTryit,
      serverType,
      serverValue,
      urlLabel,
      noServerSelector,
      allowCustomBaseUri,
      server,
      baseUri,
    } = this;
    return html `
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the API endpoint documentation element with various
        configuration options.
      </p>

      ${this._serverSelectorTemplate()}

      <arc-interactive-demo
        .states="${demoStates}"
        @state-chanegd="${this._demoStateHandler}"
        ?dark="${darkThemeActive}"
      >
        <api-endpoint-documentation
          slot="content"
          .amf="${amf}"
          .endpoint="${endpoint}"
          .selected="${selectedShape}"
          .server="${server}"
          .baseUri="${baseUri}"
          .scrollTarget="${scrollTarget}"
          .redirect-uri="${redirectUri}"
          .previous="${previous}"
          .next="${next}"
          .inlineMethods="${inlineMethods}"
          .noTryIt="${noTryit}"
          .serverType="${serverType}"
          .serverValue="${serverValue}"
          ?urlLabel="${urlLabel}"
          ?noServerSelector="${noServerSelector}"
          ?allowCustomBaseUri="${allowCustomBaseUri}"
          ?narrow="${narrow}"
          ?compatibility="${compatibility}"
          @tryit-requested="${this._tryitRequested}"
          @apiserverchanged="${this._serverHandler}"
        >
          ${this._addCustomServers()}
        </api-endpoint-documentation>

        <label slot="options" id="mainOptionsLabel">Options</label>

        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="narrow"
          @change="${this._toggleMainOption}"
          >Narrow view</anypoint-checkbox
        >
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="noTryit"
          @change="${this._toggleMainOption}"
          >No try it</anypoint-checkbox
        >
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="inlineMethods"
          @change="${this._toggleMainOption}"
          >Render methods</anypoint-checkbox
        >
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="urlLabel"
          @change="${this._toggleMainOption}"
          >URL label</anypoint-checkbox
        >
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="renderCustomServer"
          @change="${this._toggleMainOption}"
          >Custom servers</anypoint-checkbox
        >
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="allowCustomBaseUri"
          @change="${this._toggleMainOption}"
          >Custom Base Uri</anypoint-checkbox
        >
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="noServerSelector"
          @change="${this._toggleMainOption}"
          >Remove Server Selector</anypoint-checkbox
        >
      </arc-interactive-demo>
    </section>`;
  }

  _addCustomServers() {
    if (!this.renderCustomServer) {
      return;
    }
    const { compatibility } = this;
    return html`
    <div class="other-section" slot="custom-base-uri">Other options</div>
    <anypoint-item
      slot="custom-base-uri"
      value="http://mocking.com"
      ?compatibility="${compatibility}"
    >Mocking service</anypoint-item>
    <anypoint-item
      slot="custom-base-uri"
      value="http://customServer.com2"
      ?compatibility="${compatibility}"
    >Custom instance</anypoint-item>`;
  }

  /**
   * @return {object} A template for the server selector
   */
  _serverSelectorTemplate() {
    const {
      amf,
      serverType,
      serverValue,
      compatibility,
    } = this;
    return html`
    <api-server-selector
      .amf="${amf}"
      .value="${serverValue}"
      .type="${serverType}"
      autoselect
      allowCustom
      ?compatibility="${compatibility}"
      @apiserverchanged="${this._serverHandler}"
    >${this._addCustomServers()}</api-server-selector>`;
  }

  _introductionTemplate() {
    return html `
      <section class="documentation-section">
        <h3>Introduction</h3>
        <p>
          A web component to render documentation for an API endpoint. The view is rendered
          using AMF data model.
        </p>
      </section>
    `;
  }

  _usageTemplate() {
    return html `
      <section class="documentation-section">
        <h2>Usage</h2>
        <p>API request editor comes with 2 predefied styles:</p>
        <ul>
          <li><b>Material Design</b> (default)</li>
          <li>
            <b>Compatibility</b> - To provide compatibility with Anypoint design, use
            <code>compatibility</code> property
          </li>
        </ul>
      </section>`;
  }

  contentTemplate() {
    return html`
    <xhr-simple-request></xhr-simple-request>
    <oauth2-authorization></oauth2-authorization>
    <oauth1-authorization></oauth1-authorization>
    <paper-toast id="navToast"></paper-toast>

    <h2 class="centered main">API endpoint documentation</h2>
    ${this._demoTemplate()}
    ${this._introductionTemplate()}
    ${this._usageTemplate()}
    `;
  }
}
const instance = new ComponentDemo();
instance.render();
