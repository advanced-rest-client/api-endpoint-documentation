import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import { LitElement } from 'lit-element';

export const AmfLoader = {};

class HelperElement extends AmfHelperMixin(LitElement) {}
window.customElements.define('helper-element', HelperElement);

const helper = new HelperElement();

AmfLoader.load = async function(fileName, compact) {
  compact = compact ? '-compact' : '';
  fileName = fileName || 'demo-api';
  const file = `${fileName}${compact}.json`;
  const url = location.protocol + '//' + location.host + '/base/demo/'+ file;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('load', (e) => {
      let data;
      try {
        data = JSON.parse(e.target.response);
        /* istanbul ignore next */
      } catch (e) {
        /* istanbul ignore next */
        reject(e);
        /* istanbul ignore next */
        return;
      }
      resolve(data);
    });
    /* istanbul ignore next */
    xhr.addEventListener('error',
      () => reject(new Error('Unable to load model file')));
    xhr.open('GET', url);
    xhr.send();
  });
};

AmfLoader.lookupEndpoint = function(model, endpoint) {
  helper.amf = model;
  const webApi = helper._computeWebApi(model);
  return helper._computeEndpointByPath(webApi, endpoint);
};

AmfLoader.lookupOperation = function(model, endpoint, operation) {
  const endPoint = AmfLoader.lookupEndpoint(model, endpoint, operation);
  const opKey = helper._getAmfKey(helper.ns.w3.hydra.supportedOperation);
  const ops = helper._ensureArray(endPoint[opKey]);
  return ops.find((item) => helper._getValue(item, helper.ns.w3.hydra.core + 'method') === operation);
};

AmfLoader.lookupPayload = function(model, endpoint, operation) {
  const op = AmfLoader.lookupOperation(model, endpoint, operation);
  const expects = helper._computeExpects(op);
  return helper._ensureArray(helper._computePayload(expects));
};

AmfLoader.lookupEndpointOperation = function(model, endpoint, operation) {
  const endPoint = AmfLoader.lookupEndpoint(model, endpoint, operation);
  const opKey = helper._getAmfKey(helper.ns.w3.hydra.supportedOperation);
  const ops = helper._ensureArray(endPoint[opKey]);
  const op = ops.find((item) => helper._getValue(item, helper.ns.w3.hydra.core + 'method') === operation);
  return [endPoint, op];
};
