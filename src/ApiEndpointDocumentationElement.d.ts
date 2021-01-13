import { CSSResult, LitElement, TemplateResult } from 'lit-element';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';

/**
 * `api-endpoint-documentation`
 *
 * A component to generate documentation for an endpoint from the AMF model.
 * 
 * @fires api-navigation-selection-changed
 * @fires tryit-requested
 * @fires apiserverchanged
 */
export declare class ApiEndpointDocumentationElement extends AmfHelperMixin(LitElement) {
  get styles(): CSSResult;

  /**
   * Method's endpoint definition as a
   * `http://raml.org/vocabularies/http#endpoint` of AMF model.
   */
  endpoint: any;
  /**
   * The ID in `amf` of current selection. It can be this endpoint
   * or any of methods
   * @attribute
   */
  selected: string;
  /**
   * A property to set to override AMF's model base URI information.
   * When this property is set, the `endpointUri` property is recalculated.
   * @attribute
   */
  baseUri: string;
  /**
   * Computed value, API version name
   * @attribute
   */
  apiVersion: string;
  /**
   * Endpoint URI to display in main URL field.
   * This value is computed when `amf`, `endpoint` or `baseUri` change.
   * @attribute
   */
  endpointUri: string;
  /**
   * Computed value of the `http://raml.org/vocabularies/http#server`
   * from `amf`
   */
  server: any;
  /**
   * Endpoint name.
   * It should be either a "displayName" or endpoint's relative
   * path.
   * @attribute
   */
  endpointName: string;
  /**
   * Computed value of method description from `method` property.
   * @attribute
   */
  description: string;
  /**
   * Computed value of endpoint's path.
   * @attribute
   */
  path: string;
  /**
   * Computed value from current `method`. True if the model containsPATCH
   * custom properties (annotations in RAML).
   * @attribute
   */
  hasCustomProperties: boolean;
  /**
   * If set it will renders the view in the narrow layout.
   * @attribute
   */
  narrow: boolean;
  /**
   * List of traits and resource types, if any.
   */
  extendsTypes: any[];
  /**
   * Computed value of a parent type.
   * In RAML it is resource type that can be applied to a resource.
   */
  parentType: any;
  /**
   * Computed value for parent type name.
   * @attribute
   */
  parentTypeName: string;
  /**
   * List of traits applied to this endpoint
   */
  traits: any[];
  /**
   * Model to generate a link to previous HTTP endpoint.
   * It should contain `id` and `label` properties
   */
  previous: any;
  /**
   * Model to generate a link to next HTTP endpoint.
   * It should contain `id` and `label` properties
   */
  next: any;
  /**
   * Scroll target used to observe `scroll` event.
   * When set the element will observe scroll and inform other components
   * about changes in navigation while scrolling through methods list.
   * The navigation event contains `passive: true` property that
   * determines that it's not user triggered navigation but rather
   * context enforced.
   */
  scrollTarget: Window|HTMLElement
  /**
   * Passing value of `noTryIt` to the method documentation.
   * Hides the "Try it" button from the view.
   * @attribute
   */
  noTryIt: boolean;
  /**
   * Computed list of operations to render in the operations list.
   */
  operations: any[];
  /**
   * Computed value if the endpoint contains operations.
   * @attribute
   */
  hasOperations: boolean;
  /**
   * If set then it renders methods documentation inline with
   * the endpoint documentation.
   * When it's not set (or value is `false`, default) then it renders
   * just a list of methods with links.
   * @attribute
   */
  inlineMethods: boolean;
  /**
   * In inline mode, passes the `noUrlEditor` value on the
   * `api-request-panel`
   * @attribute
   */
  noUrlEditor: boolean;
  /**
   * OAuth2 redirect URI.
   * This value **must** be set in order for OAuth 1/2 to work properly.
   * This is only required in inline mode (`inlineMethods`).
   * @attribute
   */
  redirectUri: string;
  /**
   * Enables compatibility with Anypoint components.
   * @attribute
   */
  compatibility: boolean;
  /**
   * Applied outlined theme to the try it panel
   * @attribute
   */
  outlined: boolean;
  /**
   * Passed to `api-type-document`. Enables internal links rendering for types.
   * @attribute
   */
  graph: boolean;

  _editorEventTarget: EventTarget
  /**
   * When set it hides bottom navigation links
   * @attribute
   */
  noNavigation: boolean;
  /**
   * Holds the value of the currently selected server
   * Data type: URI
   * @attribute
   */
  serverValue: string;
  /**
   * Holds the type of the currently selected server
   * Values: `server` | `uri` | `custom`
   * @attribute
   */
  serverType: string;
  /**
   * Optional property to set
   * If true, the server selector is not rendered
   * @attribute
   */
  noServerSelector: boolean;
  /**
   * Optional property to set
   * If true, the server selector custom base URI option is rendered
   * @attribute
   */
  allowCustomBaseUri: boolean;

  _methodsList: NodeListOf<HTMLDivElement>;

  constructor();

  __amfChanged(): void;

  _endpointChanged(): void;

  _processModelChange(): void;

  _processEndpointChange(): void;

  /**
   * Computes method's endpoint name.
   * It looks for `http://schema.org/name` in the endpoint definition and
   * if not found it uses path as name.
   *
   * @param endpoint Endpoint model.
   * @returns Endpoint name.
   */
  _computeEndpointName(endpoint: any): string|undefined;

  /**
   * Computes value of `path` property
   *
   * @param endpoint Endpoint model.
   */
  _computePath(endpoint: any): string|undefined;

  /**
   * Computes `extendsTypes`
   *
   * @param shape AMF shape to get `#extends` model
   */
  _computeExtendsTypes(shape: any): any[];

  /**
   * Computes parent type as RAML's resource type.
   *
   * @param types Current value of `extendsTypes`
   */
  _computeParentType(types: any[]): any;

  /**
   * Computes value for the `parentTypeName`
   *
   * @param type Parent type shape
   */
  _computeParentTypeName(type: any): string|undefined;

  /**
   * Computes value for `traits` property
   *
   * @param types Current value of `extendsTypes`
   */
  _computeTraits(types: any[]): any[]|undefined;
  
  /**
   * Computes list of trait names to render it in the doc.
   *
   * @param traits AMF trait definition
   * @return Trait name if defined.
   */
  _computeTraitNames(traits: any[]): string|undefined;

  /**
   * Navigates to next method. Calls `_navigate` with id of previous item.
   */
  _navigatePrevious(): void;

  /**
   * Navigates to next method. Calls `_navigate` with id of next item.
   */
  _navigateNext(): void;

  /**
   * Dispatches `api-navigation-selection-changed` so other components
   * can update their state.
   */
  _navigate(id: string, type: string): void;

  /**
   * Computes value for `operations` property.
   * @param endpoint Endpoint model.
   */
  _computeEndpointOperations(endpoint: any, inlineMethods: boolean): any[];

  _methodNavigate(e: CustomEvent): void;

  /**
   * Handles scroll target change and adds scroll event.
   *
   * @param st The scroll target.
   */
  _scrollTargetChanged(st: HTMLElement|Window): void;

  /**
   * Scroll handler for `scrollTarget`.
   * It does not stall the main thread by executing the action after nex render.
   */
  _scrollHandler(): void;

  /**
   * I hope this won't be required in final version :(
   */
  _checkMethodsPosition(): void;

  /**
   * Function that checks if an `element` is in the main scrolling area.
   *
   * @param targetHeight Height (visible) of the scroll target
   * @param scrollHeight Height of the scroll target
   * @param dir Direction where the scroll is going (up or down)
   * @param element The node to test
   * @returns True when it determines that the element is in the main scroll area,
   */
  _occupiesMainScrollArea(targetHeight: number, scrollHeight: number, dir: HTMLElement, element: Element): boolean;

  /**
   * Dispatches `api-navigation-selection-changed` custom event with
   * `passive: true` set on the detail object.
   * Listeners should not react on this event except for the ones that
   * should reflect passive navigation change.
   *
   * @param selected Id of selected method as in AMF model.
   */
  _notifyPassiveNavigation(selected: string): void;

  /**
   * Handler for either `selected` or `endpoint property change`
   * @param selected Currently selected shape ID in AMF model
   */
  _selectedChanged(selected: string): void;

  /**
   * Positions the method (operation) or endpoint (main title).
   *
   * @param id Selected AMF id.
   */
  _repositionVerb(id: string): void;

  _computeOperationId(item: any): string|undefined;

  // Computes a label for the section toggle buttons.
  _computeToggleActionLabel(opened: boolean): string;

  // Computes class for the toggle's button icon.
  _computeToggleIconClass(opened: boolean): string;

  /**
   * Computes example headers string for code snippets.
   * @param method Method (operation) model
   * @return Computed example value for headers
   */
  _computeSnippetsHeaders(method: any): string|undefined;

  /**
   * Computes example payload string for code snippets.
   * @param {any[]} payload Payload model from AMF
   * @return {string|undefined} Computed example value for payload
   */
  _computeSnippetsPayload(payload: any): string|undefined;

  /**
   * Tries to find an example value (whether it's default value or from an
   * example) to put it into snippet's values.
   *
   * @param item A http://raml.org/vocabularies/http#Parameter property
   */
  _computePropertyValue(item: any): string|undefined;

  /**
   * Computes value for `httpMethod` property.
   *
   * @param method AMF `supportedOperation` model
   * @return HTTP method name
   */
  _computeHttpMethod(method: any): string|undefined;

  _toggleSnippets(e: Event): void;

  _toggleRequestPanel(e: Event): void;

  /**
   * A handler for the `inlineMethods` property change.
   * When set it automatically disables the try it button.
   *
   * @param value Current value of `inlineMethods`
   */
  _inlineMethodsChanged(value: boolean): void;

  /**
   * Computes special class names for the method container.
   * It adds `first`, and `last` names to corresponding
   * containers.
   */
  _computeTryItColumClass(index: number, operations: any[]): void;

  _computeTryItSelected(item: any): void;

  render(): TemplateResult;

  _annotationTemplate(): TemplateResult|string;

  _getDescriptionTemplate(description: string): TemplateResult|string;

  _getTitleTemplate(): TemplateResult|string;

  _getUrlTemplate(): TemplateResult|string;

  _handleUrlChange(event: Event): void;

  _getExtensionsTemplate(): TemplateResult|string;

  _getOperationsTemplate(): TemplateResult|string;

  _getInlineMethodsTemplate(): TemplateResult|string;

  _inlineMethodTemplate(item: any, index: number, operations: any[]): TemplateResult;

  _getRequestPanelTemplate(item: any, index: number): TemplateResult;

  _getSnippetsTemplate(item: any, index: number): TemplateResult;

  _getMethodsListTemplate(): TemplateResult|string;

  _getNavigationTemplate(): TemplateResult|string;
}
