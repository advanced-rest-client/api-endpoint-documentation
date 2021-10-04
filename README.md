# DEPRECATED

This component is being deprecated. The code base has been moved to [api-documentation](https://github.com/advanced-rest-client/api-documentation) module. This module will be archived when [PR 37](https://github.com/advanced-rest-client/api-documentation/pull/37) is merged.

-----

A component to generate documentation for an API resource from AMF model.

[![Tests and publishing](https://github.com/advanced-rest-client/api-endpoint-documentation/actions/workflows/deployment.yml/badge.svg)](https://github.com/advanced-rest-client/api-endpoint-documentation/actions/workflows/deployment.yml)

[![Published on NPM](https://img.shields.io/npm/v/@api-components/api-endpoint-documentation.svg)](https://www.npmjs.com/package/@api-components/api-endpoint-documentation)

## Version compatibility

This version only works with AMF model version 2 (AMF parser >= 4.0.0).
For compatibility with previous model version use `3.x.x` version of the component.

## Styling

`<api-endpoint-documentation>` provides the following custom properties and mixins for styling:

Custom property | Description | Default
----------------|-------------|----------
`--arc-font-headline-color` | Color of the method title | ``
`--arc-font-headline-font-size` | Font size of the method title | ``
`--arc-font-headline-letter-spacing` | Letter spacing of the method title | ``
`--arc-font-headline-line-height` | Line height of the method title | ``
`--arc-font-headline-narrow-font-size` | Font size of the method title in mobile-friendly view | ``
`--arc-font-title-color` | Color of the overview section title | ``
`--arc-font-title-font-size` | Font size of the overview section title | ``
`--arc-font-title-line-height` | Line height of the overview section title | ``
`--arc-font-title-narrow-font-size` | Font size of the overview section title in mobile-friendly view | ``
`--arc-font-subhead-color` | Color of the collapsible section title | ``
`--arc-font-subhead-font-size` | Font size of the collapsible section title | ``
`--arc-font-subhead-line-height` | Line height of the collapsible section title | ``
`--arc-font-subhead-narrow-font-size` | Font size of the collapsible section title in mobile-friendly view | ``
`--api-endpoint-documentation-description-color` |  | `rgba(0, 0, 0, 0.74)`
`--api-endpoint-documentation-bottom-navigation-color` |  | `#000`
`--api-endpoint-documentation-method-doc-border-top-color` |  | `#E5E5E5`
`--api-endpoint-documentation-method-doc-border-top-style` |  | `dashed`
`--api-endpoint-documentation-tryit-width` |  | `40%`
`--api-endpoint-documentation-tryit-max-width` |  | ``
`--api-endpoint-documentation-tryit-background-color` |  | `#ECEFF1`
`--api-endpoint-documentation-tryit-panels-background-color` |  | `#fff`
`--api-endpoint-documentation-tryit-panels-border-radius` |  | `3px`
`--api-endpoint-documentation-tryit-panels-border-color` |  | `#EEEEEE`
`--api-endpoint-documentation-tryit-panels-border-style` |  | `solid`
`--api-endpoint-documentation-tryit-title-border-bottom-color` |  | `#bac6cb`
`--api-endpoint-documentation-tryit-title-border-bottom-style` |  | `solid`
`--no-info-message-font-style` |  | `italic`
`--no-info-message-font-size` |  | `16px`
`--no-info-message-color` |  | `rgba(0, 0, 0, 0.74)`

## Usage

### Installation

```sh
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
    <api-endpoint-documentation amf="..." endpoint="..."></api-endpoint-documentation>
  </body>
</html>
```

### In a LitElement

```js
import { LitElement, html } from 'lit-element';
import '@api-components/api-endpoint-documentation/api-endpoint-documentation.js';

class SampleElement extends PolymerElement {
  render() {
    return html`
    <api-endpoint-documentation
      .amf="${this.amf}"
      .endpoint="${this.endpoint}"
      .method="${this.method}"
      .previous="${this.previous}"
      .next="${this.next}"
      ?narrow="${this.narrow}"
      ?legacy="${this.legacy}"
      ?outlined="${this.outlined}"
      .inlineMethods="${inlineMethods}"
      .scrollTarget="${scrollTarget}"
      .noTryIt="${this.noTryit}"
      @tryit-requested="${this._tryitHandler}"></api-endpoint-documentation>
    `;
  }

  _tryitHandler(e) {
    console.log('opening api-request-panel...');
  }
}
customElements.define('sample-element', SampleElement);
```

## Development

```sh
git clone https://github.com/advanced-rest-client/api-endpoint-documentation
cd api-endpoint-documentation
npm install
```

### Running the demo locally

```sh
npm start
```

### Running the tests

```sh
npm test
```

## Breaking Changes in v3

When using `inlineMethods` property you should note this breaking changes.

### OAuth popup location

The `bower-location` attribute becomes `auth-popup-location`.
It is a path to `node_modules` directory. It can be both relative or absolute location. For example `/static/console/node_modules` will produce OAuth Redirect URI `/static/console/node_modules/@advanced-rest-client/oauth-authorization/oauth-popup.html`.

However, you are encourage to use your own redirect popup. It can be anything but it must post message to the opened window with URL parameters. See `@advanced-rest-client/oauth-authorization/oauth-popup.html` for more details.

### Code Mirror dependencies

Code mirror is not ES6 ready. Their build contains AMD exports which is incompatible with native modules. Therefore the dependencies cannot be imported with the element but outside of it.
The component requires the following scripts to be ready before it's initialized (especially body and headers editors):

```html
<script src="node_modules/jsonlint/lib/jsonlint.js"></script>
<script src="node_modules/codemirror/lib/codemirror.js"></script>
<script src="node_modules/codemirror/addon/mode/loadmode.js"></script>
<script src="node_modules/codemirror/mode/meta.js"></script>
<!-- Some basic syntax highlighting -->
<script src="node_modules/codemirror/mode/javascript/javascript.js"></script>
<script src="node_modules/codemirror/mode/xml/xml.js"></script>
<script src="node_modules/codemirror/mode/htmlmixed/htmlmixed.js"></script>
<script src="node_modules/codemirror/addon/lint/lint.js"></script>
<script src="node_modules/codemirror/addon/lint/json-lint.js"></script>
```

CodeMirror's modes location. May be skipped if all possible modes are already included into the app.

```html
<script>
/* global CodeMirror */
CodeMirror.modeURL = 'node_modules/codemirror/mode/%N/%N.js';
</script>
```

### Dependencies for OAuth1 and Digest authorization methods

For the same reasons as for CodeMirror this dependencies are required for OAuth1 and Digest authorization panels to work.

```html
<script src="node_modules/cryptojslib/components/core.js"></script>
<script src="node_modules/cryptojslib/rollups/sha1.js"></script>
<script src="node_modules/cryptojslib/components/enc-base64-min.js"></script>
<script src="node_modules/cryptojslib/rollups/md5.js"></script>
<script src="node_modules/cryptojslib/rollups/hmac-sha1.js"></script>
<script src="node_modules/jsrsasign/lib/jsrsasign-rsa-min.js"></script>
```
