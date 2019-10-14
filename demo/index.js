import { html, render } from 'lit-html';
import { LitElement } from 'lit-element';
import { ApiDemoPageBase } from '@advanced-rest-client/arc-demo-helper/ApiDemoPage.js';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
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
import '../api-endpoint-documentation.js';

class DemoElement extends AmfHelperMixin(LitElement) {}
window.customElements.define('demo-element', DemoElement);

class ComponentDemo extends ApiDemoPageBase {
  constructor() {
    super();
    this._componentName = 'api-method-documentation';

    this.initObservableProperties([
      'compatibility',
      'narrow',
      'noTryit',
      'endpoint',
      'previous',
      'next',
      'inlineMethods',
      'selectedShape',
      'scrollTarget'
    ]);
    this.noTryit = false;
    this.codeSnippets = true;
    this.renderSecurity = true;

    this.redirectUri = 'https://auth.advancedrestclient.com/oauth-popup.html';
    this.scrollTarget = window;

    this.demoStates = ['Material', 'Anypoint'];
    this._demoStateHandler = this._demoStateHandler.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);
    this._tryitRequested = this._tryitRequested.bind(this);
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    switch (state) {
      case 0:
        this.compatibility = false;
        break;
      case 1:
        this.compatibility = true;
        break;
    }
    if (this.compatibility) {
      document.body.classList.add('anypoint');
    } else {
      document.body.classList.remove('anypoint');
    }
  }

  _toggleMainOption(e) {
    const { name, checked } = e.target;
    this[name] = checked;
  }

  get helper() {
    if (!this.__helper) {
      this.__helper = document.getElementById('helper');
    }
    return this.__helper;
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
    const helper = this.helper;
    const eId = type === 'method' ? endpointId : id;
    if (this.endpoint) {
      const currentId = this.endpoint['@id'];
      if (currentId === eId) {
        this.selectedShape = id;
        return;
      }
    }
    const webApi = helper._computeWebApi(this.amf);
    const endpoint = helper._computeEndpointModel(webApi, eId);
    if (!endpoint) {
      this.endpoint = undefined;
      this.selectedShape = undefined;
      return;
    }
    this.endpoint = endpoint;
    this.selectedShape = id;
    const endpoints = helper._computeEndpoints(webApi);
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
    const helper = this.helper;
    let name = helper._getValue(item, helper.ns.aml.vocabularies.core.name);
    if (!name) {
      name = helper._getValue(item, helper.ns.aml.vocabularies.apiContract.path);
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
    const helper = this.helper;
    let name = helper._getValue(item, helper.ns.aml.vocabularies.core.name);
    if (!name) {
      name = helper._getValue(item, helper.ns.aml.vocabularies.apiContract.path);
    }
    this.next = {
      id: item['@id'],
      label: name
    };
  }

  _apiListTemplate() {
    return [
      ['google-drive-api', 'Google Drive'],
      ['exchange-experience-api', 'Exchange xAPI'],
      ['demo-api', 'Demo API'],
      ['appian-api', 'Applian API'],
      ['nexmo-sms-api', 'Nexmo SMS API']
    ].map(([file, label]) => html`
      <paper-item data-src="${file}-compact.json">${label} - compact model</paper-item>
      <paper-item data-src="${file}.json">${label}</paper-item>
      `);
  }

  _tryitRequested() {
    const toast = document.getElementById('tryItToast');
    toast.opened = true;
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
      noTryit
    } = this;
    return html `
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the API endpoint documentation element with various
        configuration options.
      </p>

      <arc-interactive-demo
        .states="${demoStates}"
        @state-chanegd="${this._demoStateHandler}"
        ?dark="${darkThemeActive}"
      >

        <div slot="content" class="doc-container">
          ${this._apiNavigationTemplate()}
          <api-endpoint-documentation
            .amf="${amf}"
            .endpoint="${endpoint}"
            .selected="${selectedShape}"
            .scrollTarget="${scrollTarget}"
            .redirect-uri="${redirectUri}"
            .previous="${previous}"
            .next="${next}"
            .inlineMethods="${inlineMethods}"
            .noTryIt="${noTryit}"
            ?narrow="${narrow}"
            ?compatibility="${compatibility}"
            @tryit-requested="${this._tryitRequested}"></api-endpoint-documentation>
        </div>
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
      </arc-interactive-demo>
    </section>`;
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

  _render() {
    const { amf } = this;
    render(html`
      ${this.headerTemplate()}

      <demo-element id="helper" .amf="${amf}"></demo-element>
      <xhr-simple-request></xhr-simple-request>
      <oauth2-authorization></oauth2-authorization>
      <oauth1-authorization></oauth1-authorization>
      <paper-toast id="navToast"></paper-toast>

      <div role="main">
        <h2 class="centered main">API endpoint documentation</h2>
        ${this._demoTemplate()}
        ${this._introductionTemplate()}
        ${this._usageTemplate()}
      </div>
      `, document.querySelector('#demo'));
  }
}
const instance = new ComponentDemo();
instance.render();
window.demo = instance;
