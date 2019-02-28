[![Published on NPM](https://img.shields.io/npm/v/@api-components/api-endpoint-documentation.svg)](https://www.npmjs.com/package/@api-components/api-endpoint-documentation)

[![Build Status](https://travis-ci.org/advanced-rest-client/api-endpoint-documentation.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/api-endpoint-documentation)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/api-endpoint-documentation)

## &lt;api-endpoint-documentation&gt;

A component to generate documentation for an API resource from AMF model.

**See breaking changes and list of required dependencies at the bottom of this document**

```html
<api-endpoint-documentation></api-endpoint-documentation>
```

### API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)

## Usage

### Installation
```
npm install --save @api-components/api-endpoint-documentation
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import '@api-components/api-endpoint-documentation/api-endpoint-documentation.js';
    </script>
  </head>
  <body>
    <api-endpoint-documentation></api-endpoint-documentation>
  </body>
</html>
```

### In a Polymer 3 element

```js
import {PolymerElement, html} from '@polymer/polymer';
import '@api-components/api-endpoint-documentation/api-endpoint-documentation.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
    <api-endpoint-documentation></api-endpoint-documentation>
    `;
  }

  _authChanged(e) {
    console.log(e.detail);
  }
}
customElements.define('sample-element', SampleElement);
```

### Installation

```sh
git clone https://github.com/advanced-rest-client/api-endpoint-documentation
cd api-url-editor
npm install
npm install -g polymer-cli
```

### Running the demo locally

```sh
polymer serve --npm
open http://127.0.0.1:<port>/demo/
```

### Running the tests
```sh
polymer test --npm
```

## Breaking Changes in v3

Due to completely different dependencies import algorithm the CodeMirror and it's dependencies has to
be included to the web application manually, outside the component.

Web Compoennts are ES6 modules and libraries like CodeMirror are not adjusted to
new spec. Therefore importing the library inside the component won't make it work
(no reference is created).

All the dependencies described below are installed with the package.

**Code Mirror support**

CodeMirror + JSON linter (body editor) + headers hints and syntax (headers editor) + basic syntax (body editor).

```html
<script src="../../../jsonlint/lib/jsonlint.js"></script>
<script src="../../../codemirror/lib/codemirror.js"></script>
<script src="../../../codemirror/addon/mode/loadmode.js"></script>
<script src="../../../codemirror/mode/meta.js"></script>
<script src="../../../codemirror/mode/javascript/javascript.js"></script>
<script src="../../../codemirror/mode/xml/xml.js"></script>
<script src="../../../codemirror/mode/htmlmixed/htmlmixed.js"></script>
<script src="../../../codemirror/addon/lint/lint.js"></script>
<script src="../../../codemirror/addon/lint/json-lint.js"></script>
<script src="../../../@advanced-rest-client/code-mirror-hint/headers-addon.js"></script>
<script src="../../../@advanced-rest-client/code-mirror-hint/show-hint.js"></script>
<script src="../../../@advanced-rest-client/code-mirror-hint/hint-http-headers.js"></script>
```

CodeMirror's modes location. May be skipped if all possible modes are already included into the app.

```html
<script>
/* global CodeMirror */
CodeMirror.modeURL = '../../../codemirror/mode/%N/%N.js';
</script>
```

**Dependencies for OAuth1 and Digest authorization methods.**

```html
<script src="../../../cryptojslib/components/core.js"></script>
<script src="../../../cryptojslib/rollups/sha1.js"></script>
<script src="../../../cryptojslib/components/enc-base64-min.js"></script>
<script src="../../../cryptojslib/rollups/md5.js"></script>
<script src="../../../cryptojslib/rollups/hmac-sha1.js"></script>
<script src="../../../jsrsasign/lib/jsrsasign-rsa-min.js"></script>
```
