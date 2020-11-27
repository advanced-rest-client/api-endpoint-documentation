import { css } from 'lit-element';

export default css`:host {
  display: block;
}

.title {
  font-size: var(--arc-font-headline-font-size);
  letter-spacing: var(--arc-font-headline-letter-spacing);
  line-height: var(--arc-font-headline-line-height);
  font-weight: var(--api-method-documentation-title-method-font-weight,
    var(--arc-font-headline-font-weight, 500));
  text-transform: capitalize;
}

.heading2 {
  font-size: var(--arc-font-title-font-size);
  font-weight: var(--arc-font-title-font-weight);
  line-height: var(--arc-font-title-line-height);
  margin: 0.84em 0;
}

.heading3 {
  flex: 1;
  font-size: var(--arc-font-subhead-font-size);
  font-weight: var(--arc-font-subhead-font-weight);
  line-height: var(--arc-font-subhead-line-height);
}

:host([narrow]) .title {
  font-size: var(--arc-font-headline-narrow-font-size, 20px);
  margin: 0;
}

:host([narrow]) .heading2 {
  font-size: var(--arc-font-title-narrow-font-size, 18px);
}

:host([narrow]) .heading3 {
  font-size: var(--arc-font-subhead-narrow-font-size, 17px);
}

arc-marked {
  margin: 8px 0;
  padding: 0px;
}

.markdown-body {
  margin-bottom: 28px;
  color: var(--api-endpoint-documentation-description-color, rgba(0, 0, 0, 0.74));
}

.extensions {
  font-style: italic;
  margin: 12px 0;
}

.bottom-nav,
.bottom-link {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.bottom-nav {
  padding: 32px 0;
  margin: 16px 0;
  color: var(--api-endpoint-documentation-bottom-navigation-color, #000);
}

.bottom-link {
  cursor: pointer;
  max-width: 50%;
  word-break: break-all;
  text-decoration: underline;
}

.bottom-link.previous {
  margin-right: 12px;
}

.bottom-link.next {
  margin-left: 12px;
}

.nav-separator {
  flex: 1;
}

.method-label {
  margin-bottom: 0px;
}

.method-anchor {
  text-decoration: none;
  color: inherit;
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
  display: flex;
  flex-direction: row;
  padding: 24px 0;
  box-sizing: border-box;
  border-top-width: 2px;
  border-top-color: var(--api-endpoint-documentation-method-doc-border-top-color, #E5E5E5);
  border-top-style: var(--api-endpoint-documentation-method-doc-border-top-style, dashed);
}

:host([narrow]) .method-container {
  flex-direction: column;
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
  padding: 4px 4px 12px 4px;
  margin: 4px;
  background-color: var(--api-endpoint-documentation-tryit-panels-background-color, #fff);
  box-sizing: border-box;
  border-radius: var(--api-endpoint-documentation-tryit-panels-border-radius, 3px);
  border-width: 1px;
  border-color: var(--api-endpoint-documentation-tryit-panels-border-color, #EEEEEE);
  border-style: var(--api-endpoint-documentation-tryit-panels-border-style, solid);
}

.try-it-column .heading3 {
  padding-left: 12px;
  padding-right: 12px;
  flex: 1;
}

.section-title-area {
  flex-direction: row;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  border-bottom-width: 1px;
  border-bottom-color: var(--api-endpoint-documentation-tryit-title-border-bottom-color, #bac6cb);
  border-bottom-style: var(--api-endpoint-documentation-tryit-title-border-bottom-style, solid);
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
  font-style: var(--no-info-message-font-style, italic);
  font-size: var(--no-info-message-font-size, 16px);
  color: var(--no-info-message-color, rgba(0, 0, 0, 0.74));
}

.icon {
  display: block;
  width: 24px;
  height: 24px;
  fill: currentColor;
}
`;
