/**
 * @fileoverview added by tsickle
 * Generated from: packages/core/src/view/util.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { WrappedValue, devModeEqual } from '../change_detection/change_detection';
import { SOURCE } from '../di/injector_compatibility';
import { ViewEncapsulation } from '../metadata/view';
import { looseIdentical } from '../util/comparison';
import { stringify } from '../util/stringify';
import { expressionChangedAfterItHasBeenCheckedError } from './errors';
import { Services, asElementData, asTextData } from './types';
/** @type {?} */
export const NOOP = (/**
 * @return {?}
 */
() => { });
/** @type {?} */
const _tokenKeyCache = new Map();
/**
 * @param {?} token
 * @return {?}
 */
export function tokenKey(token) {
    /** @type {?} */
    let key = _tokenKeyCache.get(token);
    if (!key) {
        key = stringify(token) + '_' + _tokenKeyCache.size;
        _tokenKeyCache.set(token, key);
    }
    return key;
}
/**
 * @param {?} view
 * @param {?} nodeIdx
 * @param {?} bindingIdx
 * @param {?} value
 * @return {?}
 */
export function unwrapValue(view, nodeIdx, bindingIdx, value) {
    if (WrappedValue.isWrapped(value)) {
        value = WrappedValue.unwrap(value);
        /** @type {?} */
        const globalBindingIdx = view.def.nodes[nodeIdx].bindingIndex + bindingIdx;
        /** @type {?} */
        const oldValue = WrappedValue.unwrap(view.oldValues[globalBindingIdx]);
        view.oldValues[globalBindingIdx] = new WrappedValue(oldValue);
    }
    return value;
}
/** @type {?} */
const UNDEFINED_RENDERER_TYPE_ID = '$$undefined';
/** @type {?} */
const EMPTY_RENDERER_TYPE_ID = '$$empty';
// Attention: this function is called as top level function.
// Putting any logic in here will destroy closure tree shaking!
/**
 * @param {?} values
 * @return {?}
 */
export function createRendererType2(values) {
    return {
        id: UNDEFINED_RENDERER_TYPE_ID,
        styles: values.styles,
        encapsulation: values.encapsulation,
        data: values.data
    };
}
/** @type {?} */
let _renderCompCount = 0;
/**
 * @param {?=} type
 * @return {?}
 */
export function resolveRendererType2(type) {
    if (type && type.id === UNDEFINED_RENDERER_TYPE_ID) {
        // first time we see this RendererType2. Initialize it...
        /** @type {?} */
        const isFilled = ((type.encapsulation != null && type.encapsulation !== ViewEncapsulation.None) ||
            type.styles.length || Object.keys(type.data).length);
        if (isFilled) {
            type.id = `c${_renderCompCount++}`;
        }
        else {
            type.id = EMPTY_RENDERER_TYPE_ID;
        }
    }
    if (type && type.id === EMPTY_RENDERER_TYPE_ID) {
        type = null;
    }
    return type || null;
}
/**
 * @param {?} view
 * @param {?} def
 * @param {?} bindingIdx
 * @param {?} value
 * @return {?}
 */
export function checkBinding(view, def, bindingIdx, value) {
    /** @type {?} */
    const oldValues = view.oldValues;
    if ((view.state & 2 /* FirstCheck */) ||
        !looseIdentical(oldValues[def.bindingIndex + bindingIdx], value)) {
        return true;
    }
    return false;
}
/**
 * @param {?} view
 * @param {?} def
 * @param {?} bindingIdx
 * @param {?} value
 * @return {?}
 */
export function checkAndUpdateBinding(view, def, bindingIdx, value) {
    if (checkBinding(view, def, bindingIdx, value)) {
        view.oldValues[def.bindingIndex + bindingIdx] = value;
        return true;
    }
    return false;
}
/**
 * @param {?} view
 * @param {?} def
 * @param {?} bindingIdx
 * @param {?} value
 * @return {?}
 */
export function checkBindingNoChanges(view, def, bindingIdx, value) {
    /** @type {?} */
    const oldValue = view.oldValues[def.bindingIndex + bindingIdx];
    if ((view.state & 1 /* BeforeFirstCheck */) || !devModeEqual(oldValue, value)) {
        /** @type {?} */
        const bindingName = def.bindings[bindingIdx].name;
        throw expressionChangedAfterItHasBeenCheckedError(Services.createDebugContext(view, def.nodeIndex), `${bindingName}: ${oldValue}`, `${bindingName}: ${value}`, (view.state & 1 /* BeforeFirstCheck */) !== 0);
    }
}
/**
 * @param {?} view
 * @return {?}
 */
export function markParentViewsForCheck(view) {
    /** @type {?} */
    let currView = view;
    while (currView) {
        if (currView.def.flags & 2 /* OnPush */) {
            // console.log('OP utils');
            currView.state |= 8 /* ChecksEnabled */;
        }
        currView = currView.viewContainerParent || currView.parent;
    }
}
/**
 * @param {?} view
 * @param {?} endView
 * @return {?}
 */
export function markParentViewsForCheckProjectedViews(view, endView) {
    /** @type {?} */
    let currView = view;
    while (currView && currView !== endView) {
        currView.state |= 64 /* CheckProjectedViews */;
        currView = currView.viewContainerParent || currView.parent;
    }
}
/**
 * @param {?} view
 * @param {?} nodeIndex
 * @param {?} eventName
 * @param {?} event
 * @return {?}
 */
export function dispatchEvent(view, nodeIndex, eventName, event) {
    try {
        /** @type {?} */
        const nodeDef = view.def.nodes[nodeIndex];
        /** @type {?} */
        const startView = nodeDef.flags & 33554432 /* ComponentView */ ?
            asElementData(view, nodeIndex).componentView :
            view;
        markParentViewsForCheck(startView);
        return Services.handleEvent(view, nodeIndex, eventName, event);
    }
    catch (e) {
        // Attention: Don't rethrow, as it would cancel Observable subscriptions!
        view.root.errorHandler.handleError(e);
    }
}
/**
 * @param {?} view
 * @return {?}
 */
export function declaredViewContainer(view) {
    if (view.parent) {
        /** @type {?} */
        const parentView = view.parent;
        return asElementData(parentView, (/** @type {?} */ (view.parentNodeDef)).nodeIndex);
    }
    return null;
}
/**
 * for component views, this is the host element.
 * for embedded views, this is the index of the parent node
 * that contains the view container.
 * @param {?} view
 * @return {?}
 */
export function viewParentEl(view) {
    /** @type {?} */
    const parentView = view.parent;
    if (parentView) {
        return (/** @type {?} */ (view.parentNodeDef)).parent;
    }
    else {
        return null;
    }
}
/**
 * @param {?} view
 * @param {?} def
 * @return {?}
 */
export function renderNode(view, def) {
    switch (def.flags & 201347067 /* Types */) {
        case 1 /* TypeElement */:
            return asElementData(view, def.nodeIndex).renderElement;
        case 2 /* TypeText */:
            return asTextData(view, def.nodeIndex).renderText;
    }
}
/**
 * @param {?} target
 * @param {?} name
 * @return {?}
 */
export function elementEventFullName(target, name) {
    return target ? `${target}:${name}` : name;
}
/**
 * @param {?} view
 * @return {?}
 */
export function isComponentView(view) {
    return !!view.parent && !!((/** @type {?} */ (view.parentNodeDef)).flags & 32768 /* Component */);
}
/**
 * @param {?} view
 * @return {?}
 */
export function isEmbeddedView(view) {
    return !!view.parent && !((/** @type {?} */ (view.parentNodeDef)).flags & 32768 /* Component */);
}
/**
 * @param {?} queryId
 * @return {?}
 */
export function filterQueryId(queryId) {
    return 1 << (queryId % 32);
}
/**
 * @param {?} matchedQueriesDsl
 * @return {?}
 */
export function splitMatchedQueriesDsl(matchedQueriesDsl) {
    /** @type {?} */
    const matchedQueries = {};
    /** @type {?} */
    let matchedQueryIds = 0;
    /** @type {?} */
    const references = {};
    if (matchedQueriesDsl) {
        matchedQueriesDsl.forEach((/**
         * @param {?} __0
         * @return {?}
         */
        ([queryId, valueType]) => {
            if (typeof queryId === 'number') {
                matchedQueries[queryId] = valueType;
                matchedQueryIds |= filterQueryId(queryId);
            }
            else {
                references[queryId] = valueType;
            }
        }));
    }
    return { matchedQueries, references, matchedQueryIds };
}
/**
 * @param {?} deps
 * @param {?=} sourceName
 * @return {?}
 */
export function splitDepsDsl(deps, sourceName) {
    return deps.map((/**
     * @param {?} value
     * @return {?}
     */
    value => {
        /** @type {?} */
        let token;
        /** @type {?} */
        let flags;
        if (Array.isArray(value)) {
            [flags, token] = value;
        }
        else {
            flags = 0 /* None */;
            token = value;
        }
        if (token && (typeof token === 'function' || typeof token === 'object') && sourceName) {
            Object.defineProperty(token, SOURCE, { value: sourceName, configurable: true });
        }
        return { flags, token, tokenKey: tokenKey(token) };
    }));
}
/**
 * @param {?} view
 * @param {?} renderHost
 * @param {?} def
 * @return {?}
 */
export function getParentRenderElement(view, renderHost, def) {
    /** @type {?} */
    let renderParent = def.renderParent;
    if (renderParent) {
        if ((renderParent.flags & 1 /* TypeElement */) === 0 ||
            (renderParent.flags & 33554432 /* ComponentView */) === 0 ||
            ((/** @type {?} */ (renderParent.element)).componentRendererType &&
                (/** @type {?} */ ((/** @type {?} */ (renderParent.element)).componentRendererType)).encapsulation ===
                    ViewEncapsulation.Native)) {
            // only children of non components, or children of components with native encapsulation should
            // be attached.
            return asElementData(view, (/** @type {?} */ (def.renderParent)).nodeIndex).renderElement;
        }
    }
    else {
        return renderHost;
    }
}
/** @type {?} */
const DEFINITION_CACHE = new WeakMap();
/**
 * @template D
 * @param {?} factory
 * @return {?}
 */
export function resolveDefinition(factory) {
    /** @type {?} */
    let value = (/** @type {?} */ ((/** @type {?} */ (DEFINITION_CACHE.get(factory)))));
    if (!value) {
        value = factory((/**
         * @return {?}
         */
        () => NOOP));
        value.factory = factory;
        DEFINITION_CACHE.set(factory, value);
    }
    return value;
}
/**
 * @param {?} view
 * @return {?}
 */
export function rootRenderNodes(view) {
    /** @type {?} */
    const renderNodes = [];
    visitRootRenderNodes(view, 0 /* Collect */, undefined, undefined, renderNodes);
    return renderNodes;
}
/** @enum {number} */
const RenderNodeAction = {
    Collect: 0, AppendChild: 1, InsertBefore: 2, RemoveChild: 3,
};
export { RenderNodeAction };
/**
 * @param {?} view
 * @param {?} action
 * @param {?} parentNode
 * @param {?} nextSibling
 * @param {?=} target
 * @return {?}
 */
export function visitRootRenderNodes(view, action, parentNode, nextSibling, target) {
    // We need to re-compute the parent node in case the nodes have been moved around manually
    if (action === 3 /* RemoveChild */) {
        parentNode = view.renderer.parentNode(renderNode(view, (/** @type {?} */ (view.def.lastRenderRootNode))));
    }
    visitSiblingRenderNodes(view, action, 0, view.def.nodes.length - 1, parentNode, nextSibling, target);
}
/**
 * @param {?} view
 * @param {?} action
 * @param {?} startIndex
 * @param {?} endIndex
 * @param {?} parentNode
 * @param {?} nextSibling
 * @param {?=} target
 * @return {?}
 */
export function visitSiblingRenderNodes(view, action, startIndex, endIndex, parentNode, nextSibling, target) {
    for (let i = startIndex; i <= endIndex; i++) {
        /** @type {?} */
        const nodeDef = view.def.nodes[i];
        if (nodeDef.flags & (1 /* TypeElement */ | 2 /* TypeText */ | 8 /* TypeNgContent */)) {
            visitRenderNode(view, nodeDef, action, parentNode, nextSibling, target);
        }
        // jump to next sibling
        i += nodeDef.childCount;
    }
}
/**
 * @param {?} view
 * @param {?} ngContentIndex
 * @param {?} action
 * @param {?} parentNode
 * @param {?} nextSibling
 * @param {?=} target
 * @return {?}
 */
export function visitProjectedRenderNodes(view, ngContentIndex, action, parentNode, nextSibling, target) {
    /** @type {?} */
    let compView = view;
    while (compView && !isComponentView(compView)) {
        compView = compView.parent;
    }
    /** @type {?} */
    const hostView = (/** @type {?} */ (compView)).parent;
    /** @type {?} */
    const hostElDef = viewParentEl((/** @type {?} */ (compView)));
    /** @type {?} */
    const startIndex = (/** @type {?} */ (hostElDef)).nodeIndex + 1;
    /** @type {?} */
    const endIndex = (/** @type {?} */ (hostElDef)).nodeIndex + (/** @type {?} */ (hostElDef)).childCount;
    for (let i = startIndex; i <= endIndex; i++) {
        /** @type {?} */
        const nodeDef = (/** @type {?} */ (hostView)).def.nodes[i];
        if (nodeDef.ngContentIndex === ngContentIndex) {
            visitRenderNode((/** @type {?} */ (hostView)), nodeDef, action, parentNode, nextSibling, target);
        }
        // jump to next sibling
        i += nodeDef.childCount;
    }
    if (!(/** @type {?} */ (hostView)).parent) {
        // a root view
        /** @type {?} */
        const projectedNodes = view.root.projectableNodes[ngContentIndex];
        if (projectedNodes) {
            for (let i = 0; i < projectedNodes.length; i++) {
                execRenderNodeAction(view, projectedNodes[i], action, parentNode, nextSibling, target);
            }
        }
    }
}
/**
 * @param {?} view
 * @param {?} nodeDef
 * @param {?} action
 * @param {?} parentNode
 * @param {?} nextSibling
 * @param {?=} target
 * @return {?}
 */
function visitRenderNode(view, nodeDef, action, parentNode, nextSibling, target) {
    if (nodeDef.flags & 8 /* TypeNgContent */) {
        visitProjectedRenderNodes(view, (/** @type {?} */ (nodeDef.ngContent)).index, action, parentNode, nextSibling, target);
    }
    else {
        /** @type {?} */
        const rn = renderNode(view, nodeDef);
        if (action === 3 /* RemoveChild */ && (nodeDef.flags & 33554432 /* ComponentView */) &&
            (nodeDef.bindingFlags & 48 /* CatSyntheticProperty */)) {
            // Note: we might need to do both actions.
            if (nodeDef.bindingFlags & (16 /* SyntheticProperty */)) {
                execRenderNodeAction(view, rn, action, parentNode, nextSibling, target);
            }
            if (nodeDef.bindingFlags & (32 /* SyntheticHostProperty */)) {
                /** @type {?} */
                const compView = asElementData(view, nodeDef.nodeIndex).componentView;
                execRenderNodeAction(compView, rn, action, parentNode, nextSibling, target);
            }
        }
        else {
            execRenderNodeAction(view, rn, action, parentNode, nextSibling, target);
        }
        if (nodeDef.flags & 16777216 /* EmbeddedViews */) {
            /** @type {?} */
            const embeddedViews = (/** @type {?} */ (asElementData(view, nodeDef.nodeIndex).viewContainer))._embeddedViews;
            for (let k = 0; k < embeddedViews.length; k++) {
                visitRootRenderNodes(embeddedViews[k], action, parentNode, nextSibling, target);
            }
        }
        if (nodeDef.flags & 1 /* TypeElement */ && !(/** @type {?} */ (nodeDef.element)).name) {
            visitSiblingRenderNodes(view, action, nodeDef.nodeIndex + 1, nodeDef.nodeIndex + nodeDef.childCount, parentNode, nextSibling, target);
        }
    }
}
/**
 * @param {?} view
 * @param {?} renderNode
 * @param {?} action
 * @param {?} parentNode
 * @param {?} nextSibling
 * @param {?=} target
 * @return {?}
 */
function execRenderNodeAction(view, renderNode, action, parentNode, nextSibling, target) {
    /** @type {?} */
    const renderer = view.renderer;
    switch (action) {
        case 1 /* AppendChild */:
            renderer.appendChild(parentNode, renderNode);
            break;
        case 2 /* InsertBefore */:
            renderer.insertBefore(parentNode, renderNode, nextSibling);
            break;
        case 3 /* RemoveChild */:
            renderer.removeChild(parentNode, renderNode);
            break;
        case 0 /* Collect */:
            (/** @type {?} */ (target)).push(renderNode);
            break;
    }
}
/** @type {?} */
const NS_PREFIX_RE = /^:([^:]+):(.+)$/;
/**
 * @param {?} name
 * @return {?}
 */
export function splitNamespace(name) {
    if (name[0] === ':') {
        /** @type {?} */
        const match = (/** @type {?} */ (name.match(NS_PREFIX_RE)));
        return [match[1], match[2]];
    }
    return ['', name];
}
/**
 * @param {?} bindings
 * @return {?}
 */
export function calcBindingFlags(bindings) {
    /** @type {?} */
    let flags = 0;
    for (let i = 0; i < bindings.length; i++) {
        flags |= bindings[i].flags;
    }
    return flags;
}
/**
 * @param {?} valueCount
 * @param {?} constAndInterp
 * @return {?}
 */
export function interpolate(valueCount, constAndInterp) {
    /** @type {?} */
    let result = '';
    for (let i = 0; i < valueCount * 2; i = i + 2) {
        result = result + constAndInterp[i] + _toStringWithNull(constAndInterp[i + 1]);
    }
    return result + constAndInterp[valueCount * 2];
}
/**
 * @param {?} valueCount
 * @param {?} c0
 * @param {?} a1
 * @param {?} c1
 * @param {?=} a2
 * @param {?=} c2
 * @param {?=} a3
 * @param {?=} c3
 * @param {?=} a4
 * @param {?=} c4
 * @param {?=} a5
 * @param {?=} c5
 * @param {?=} a6
 * @param {?=} c6
 * @param {?=} a7
 * @param {?=} c7
 * @param {?=} a8
 * @param {?=} c8
 * @param {?=} a9
 * @param {?=} c9
 * @return {?}
 */
export function inlineInterpolate(valueCount, c0, a1, c1, a2, c2, a3, c3, a4, c4, a5, c5, a6, c6, a7, c7, a8, c8, a9, c9) {
    switch (valueCount) {
        case 1:
            return c0 + _toStringWithNull(a1) + c1;
        case 2:
            return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2;
        case 3:
            return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                c3;
        case 4:
            return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                c3 + _toStringWithNull(a4) + c4;
        case 5:
            return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5;
        case 6:
            return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) + c6;
        case 7:
            return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) +
                c6 + _toStringWithNull(a7) + c7;
        case 8:
            return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) +
                c6 + _toStringWithNull(a7) + c7 + _toStringWithNull(a8) + c8;
        case 9:
            return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) +
                c6 + _toStringWithNull(a7) + c7 + _toStringWithNull(a8) + c8 + _toStringWithNull(a9) + c9;
        default:
            throw new Error(`Does not support more than 9 expressions`);
    }
}
/**
 * @param {?} v
 * @return {?}
 */
function _toStringWithNull(v) {
    return v != null ? v.toString() : '';
}
/** @type {?} */
export const EMPTY_ARRAY = [];
/** @type {?} */
export const EMPTY_MAP = {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3ZpZXcvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsWUFBWSxFQUFFLFlBQVksRUFBQyxNQUFNLHNDQUFzQyxDQUFDO0FBQ2hGLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUNwRCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUVuRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDbEQsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzVDLE9BQU8sRUFBQywyQ0FBMkMsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUNyRSxPQUFPLEVBQTZILFFBQVEsRUFBeUUsYUFBYSxFQUFFLFVBQVUsRUFBQyxNQUFNLFNBQVMsQ0FBQzs7QUFFL1AsTUFBTSxPQUFPLElBQUk7OztBQUFRLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQTs7TUFFM0IsY0FBYyxHQUFHLElBQUksR0FBRyxFQUFlOzs7OztBQUU3QyxNQUFNLFVBQVUsUUFBUSxDQUFDLEtBQVU7O1FBQzdCLEdBQUcsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztJQUNuQyxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ1IsR0FBRyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQztRQUNuRCxjQUFjLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztLQUNoQztJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQzs7Ozs7Ozs7QUFFRCxNQUFNLFVBQVUsV0FBVyxDQUFDLElBQWMsRUFBRSxPQUFlLEVBQUUsVUFBa0IsRUFBRSxLQUFVO0lB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QUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN2QyxDQUFDOztBQUVELE1BQU0sT0FBTyxXQUFXLEdBQVUsRUFBRTs7QUFDcEMsTUFBTSxPQUFPLFNBQVMsR0FBeUIsRUFBRSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtXcmFwcGVkVmFsdWUsIGRldk1vZGVFcXVhbH0gZnJvbSAnLi4vY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uJztcbmltcG9ydCB7U09VUkNFfSBmcm9tICcuLi9kaS9pbmplY3Rvcl9jb21wYXRpYmlsaXR5JztcbmltcG9ydCB7Vmlld0VuY2Fwc3VsYXRpb259IGZyb20gJy4uL21ldGFkYXRhL3ZpZXcnO1xuaW1wb3J0IHtSZW5kZXJlclR5cGUyfSBmcm9tICcuLi9yZW5kZXIvYXBpJztcbmltcG9ydCB7bG9vc2VJZGVudGljYWx9IGZyb20gJy4uL3V0aWwvY29tcGFyaXNvbic7XG5pbXBvcnQge3N0cmluZ2lmeX0gZnJvbSAnLi4vdXRpbC9zdHJpbmdpZnknO1xuaW1wb3J0IHtleHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEVycm9yfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQge0JpbmRpbmdEZWYsIEJpbmRpbmdGbGFncywgRGVmaW5pdGlvbiwgRGVmaW5pdGlvbkZhY3RvcnksIERlcERlZiwgRGVwRmxhZ3MsIEVsZW1lbnREYXRhLCBOb2RlRGVmLCBOb2RlRmxhZ3MsIFF1ZXJ5VmFsdWVUeXBlLCBTZXJ2aWNlcywgVmlld0RhdGEsIFZpZXdEZWZpbml0aW9uLCBWaWV3RGVmaW5pdGlvbkZhY3RvcnksIFZpZXdGbGFncywgVmlld1N0YXRlLCBhc0VsZW1lbnREYXRhLCBhc1RleHREYXRhfSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGNvbnN0IE5PT1A6IGFueSA9ICgpID0+IHt9O1xuXG5jb25zdCBfdG9rZW5LZXlDYWNoZSA9IG5ldyBNYXA8YW55LCBzdHJpbmc+KCk7XG5cbmV4cG9ydCBmdW5jdGlvbiB0b2tlbktleSh0b2tlbjogYW55KTogc3RyaW5nIHtcbiAgbGV0IGtleSA9IF90b2tlbktleUNhY2hlLmdldCh0b2tlbik7XG4gIGlmICgha2V5KSB7XG4gICAga2V5ID0gc3RyaW5naWZ5KHRva2VuKSArICdfJyArIF90b2tlbktleUNhY2hlLnNpemU7XG4gICAgX3Rva2VuS2V5Q2FjaGUuc2V0KHRva2VuLCBrZXkpO1xuICB9XG4gIHJldHVybiBrZXk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bndyYXBWYWx1ZSh2aWV3OiBWaWV3RGF0YSwgbm9kZUlkeDogbnVtYmVyLCBiaW5kaW5nSWR4OiBudW1iZXIsIHZhbHVlOiBhbnkpOiBhbnkge1xuICBpZiAoV3JhcHBlZFZhbHVlLmlzV3JhcHBlZCh2YWx1ZSkpIHtcbiAgICB2YWx1ZSA9IFdyYXBwZWRWYWx1ZS51bndyYXAodmFsdWUpO1xuICAgIGNvbnN0IGdsb2JhbEJpbmRpbmdJZHggPSB2aWV3LmRlZi5ub2Rlc1tub2RlSWR4XS5iaW5kaW5nSW5kZXggKyBiaW5kaW5nSWR4O1xuICAgIGNvbnN0IG9sZFZhbHVlID0gV3JhcHBlZFZhbHVlLnVud3JhcCh2aWV3Lm9sZFZhbHVlc1tnbG9iYWxCaW5kaW5nSWR4XSk7XG4gICAgdmlldy5vbGRWYWx1ZXNbZ2xvYmFsQmluZGluZ0lkeF0gPSBuZXcgV3JhcHBlZFZhbHVlKG9sZFZhbHVlKTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbmNvbnN0IFVOREVGSU5FRF9SRU5ERVJFUl9UWVBFX0lEID0gJyQkdW5kZWZpbmVkJztcbmNvbnN0IEVNUFRZX1JFTkRFUkVSX1RZUEVfSUQgPSAnJCRlbXB0eSc7XG5cbi8vIEF0dGVudGlvbjogdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgYXMgdG9wIGxldmVsIGZ1bmN0aW9uLlxuLy8gUHV0dGluZyBhbnkgbG9naWMgaW4gaGVyZSB3aWxsIGRlc3Ryb3kgY2xvc3VyZSB0cmVlIHNoYWtpbmchXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUmVuZGVyZXJUeXBlMih2YWx1ZXM6IHtcbiAgc3R5bGVzOiAoc3RyaW5nIHwgYW55W10pW10sXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLFxuICBkYXRhOiB7W2tpbmQ6IHN0cmluZ106IGFueVtdfVxufSk6IFJlbmRlcmVyVHlwZTIge1xuICByZXR1cm4ge1xuICAgIGlkOiBVTkRFRklORURfUkVOREVSRVJfVFlQRV9JRCxcbiAgICBzdHlsZXM6IHZhbHVlcy5zdHlsZXMsXG4gICAgZW5jYXBzdWxhdGlvbjogdmFsdWVzLmVuY2Fwc3VsYXRpb24sXG4gICAgZGF0YTogdmFsdWVzLmRhdGFcbiAgfTtcbn1cblxubGV0IF9yZW5kZXJDb21wQ291bnQgPSAwO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVJlbmRlcmVyVHlwZTIodHlwZT86IFJlbmRlcmVyVHlwZTIgfCBudWxsKTogUmVuZGVyZXJUeXBlMnxudWxsIHtcbiAgaWYgKHR5cGUgJiYgdHlwZS5pZCA9PT0gVU5ERUZJTkVEX1JFTkRFUkVSX1RZUEVfSUQpIHtcbiAgICAvLyBmaXJzdCB0aW1lIHdlIHNlZSB0aGlzIFJlbmRlcmVyVHlwZTIuIEluaXRpYWxpemUgaXQuLi5cbiAgICBjb25zdCBpc0ZpbGxlZCA9XG4gICAgICAgICgodHlwZS5lbmNhcHN1bGF0aW9uICE9IG51bGwgJiYgdHlwZS5lbmNhcHN1bGF0aW9uICE9PSBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lKSB8fFxuICAgICAgICAgdHlwZS5zdHlsZXMubGVuZ3RoIHx8IE9iamVjdC5rZXlzKHR5cGUuZGF0YSkubGVuZ3RoKTtcbiAgICBpZiAoaXNGaWxsZWQpIHtcbiAgICAgIHR5cGUuaWQgPSBgYyR7X3JlbmRlckNvbXBDb3VudCsrfWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHR5cGUuaWQgPSBFTVBUWV9SRU5ERVJFUl9UWVBFX0lEO1xuICAgIH1cbiAgfVxuICBpZiAodHlwZSAmJiB0eXBlLmlkID09PSBFTVBUWV9SRU5ERVJFUl9UWVBFX0lEKSB7XG4gICAgdHlwZSA9IG51bGw7XG4gIH1cbiAgcmV0dXJuIHR5cGUgfHwgbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrQmluZGluZyhcbiAgICB2aWV3OiBWaWV3RGF0YSwgZGVmOiBOb2RlRGVmLCBiaW5kaW5nSWR4OiBudW1iZXIsIHZhbHVlOiBhbnkpOiBib29sZWFuIHtcbiAgY29uc3Qgb2xkVmFsdWVzID0gdmlldy5vbGRWYWx1ZXM7XG4gIGlmICgodmlldy5zdGF0ZSAmIFZpZXdTdGF0ZS5GaXJzdENoZWNrKSB8fFxuICAgICAgIWxvb3NlSWRlbnRpY2FsKG9sZFZhbHVlc1tkZWYuYmluZGluZ0luZGV4ICsgYmluZGluZ0lkeF0sIHZhbHVlKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrQW5kVXBkYXRlQmluZGluZyhcbiAgICB2aWV3OiBWaWV3RGF0YSwgZGVmOiBOb2RlRGVmLCBiaW5kaW5nSWR4OiBudW1iZXIsIHZhbHVlOiBhbnkpOiBib29sZWFuIHtcbiAgaWYgKGNoZWNrQmluZGluZyh2aWV3LCBkZWYsIGJpbmRpbmdJZHgsIHZhbHVlKSkge1xuICAgIHZpZXcub2xkVmFsdWVzW2RlZi5iaW5kaW5nSW5kZXggKyBiaW5kaW5nSWR4XSA9IHZhbHVlO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrQmluZGluZ05vQ2hhbmdlcyhcbiAgICB2aWV3OiBWaWV3RGF0YSwgZGVmOiBOb2RlRGVmLCBiaW5kaW5nSWR4OiBudW1iZXIsIHZhbHVlOiBhbnkpIHtcbiAgY29uc3Qgb2xkVmFsdWUgPSB2aWV3Lm9sZFZhbHVlc1tkZWYuYmluZGluZ0luZGV4ICsgYmluZGluZ0lkeF07XG4gIGlmICgodmlldy5zdGF0ZSAmIFZpZXdTdGF0ZS5CZWZvcmVGaXJzdENoZWNrKSB8fCAhZGV2TW9kZUVxdWFsKG9sZFZhbHVlLCB2YWx1ZSkpIHtcbiAgICBjb25zdCBiaW5kaW5nTmFtZSA9IGRlZi5iaW5kaW5nc1tiaW5kaW5nSWR4XS5uYW1lO1xuICAgIHRocm93IGV4cHJlc3Npb25DaGFuZ2VkQWZ0ZXJJdEhhc0JlZW5DaGVja2VkRXJyb3IoXG4gICAgICAgIFNlcnZpY2VzLmNyZWF0ZURlYnVnQ29udGV4dCh2aWV3LCBkZWYubm9kZUluZGV4KSwgYCR7YmluZGluZ05hbWV9OiAke29sZFZhbHVlfWAsXG4gICAgICAgIGAke2JpbmRpbmdOYW1lfTogJHt2YWx1ZX1gLCAodmlldy5zdGF0ZSAmIFZpZXdTdGF0ZS5CZWZvcmVGaXJzdENoZWNrKSAhPT0gMCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hcmtQYXJlbnRWaWV3c0ZvckNoZWNrKHZpZXc6IFZpZXdEYXRhKSB7XG4gIGxldCBjdXJyVmlldzogVmlld0RhdGF8bnVsbCA9IHZpZXc7XG4gIHdoaWxlIChjdXJyVmlldykge1xuICAgIGlmIChjdXJyVmlldy5kZWYuZmxhZ3MgJiBWaWV3RmxhZ3MuT25QdXNoKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZygnT1AgdXRpbHMnKTtcbiAgICAgIGN1cnJWaWV3LnN0YXRlIHw9IFZpZXdTdGF0ZS5DaGVja3NFbmFibGVkO1xuICAgIH1cbiAgICBjdXJyVmlldyA9IGN1cnJWaWV3LnZpZXdDb250YWluZXJQYXJlbnQgfHwgY3VyclZpZXcucGFyZW50O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXJrUGFyZW50Vmlld3NGb3JDaGVja1Byb2plY3RlZFZpZXdzKHZpZXc6IFZpZXdEYXRhLCBlbmRWaWV3OiBWaWV3RGF0YSkge1xuICBsZXQgY3VyclZpZXc6IFZpZXdEYXRhfG51bGwgPSB2aWV3O1xuICB3aGlsZSAoY3VyclZpZXcgJiYgY3VyclZpZXcgIT09IGVuZFZpZXcpIHtcbiAgICBjdXJyVmlldy5zdGF0ZSB8PSBWaWV3U3RhdGUuQ2hlY2tQcm9qZWN0ZWRWaWV3cztcbiAgICBjdXJyVmlldyA9IGN1cnJWaWV3LnZpZXdDb250YWluZXJQYXJlbnQgfHwgY3VyclZpZXcucGFyZW50O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNwYXRjaEV2ZW50KFxuICAgIHZpZXc6IFZpZXdEYXRhLCBub2RlSW5kZXg6IG51bWJlciwgZXZlbnROYW1lOiBzdHJpbmcsIGV2ZW50OiBhbnkpOiBib29sZWFufHVuZGVmaW5lZCB7XG4gIHRyeSB7XG4gICAgY29uc3Qgbm9kZURlZiA9IHZpZXcuZGVmLm5vZGVzW25vZGVJbmRleF07XG4gICAgY29uc3Qgc3RhcnRWaWV3ID0gbm9kZURlZi5mbGFncyAmIE5vZGVGbGFncy5Db21wb25lbnRWaWV3ID9cbiAgICAgICAgYXNFbGVtZW50RGF0YSh2aWV3LCBub2RlSW5kZXgpLmNvbXBvbmVudFZpZXcgOlxuICAgICAgICB2aWV3O1xuICAgIG1hcmtQYXJlbnRWaWV3c0ZvckNoZWNrKHN0YXJ0Vmlldyk7XG4gICAgcmV0dXJuIFNlcnZpY2VzLmhhbmRsZUV2ZW50KHZpZXcsIG5vZGVJbmRleCwgZXZlbnROYW1lLCBldmVudCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBBdHRlbnRpb246IERvbid0IHJldGhyb3csIGFzIGl0IHdvdWxkIGNhbmNlbCBPYnNlcnZhYmxlIHN1YnNjcmlwdGlvbnMhXG4gICAgdmlldy5yb290LmVycm9ySGFuZGxlci5oYW5kbGVFcnJvcihlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVjbGFyZWRWaWV3Q29udGFpbmVyKHZpZXc6IFZpZXdEYXRhKTogRWxlbWVudERhdGF8bnVsbCB7XG4gIGlmICh2aWV3LnBhcmVudCkge1xuICAgIGNvbnN0IHBhcmVudFZpZXcgPSB2aWV3LnBhcmVudDtcbiAgICByZXR1cm4gYXNFbGVtZW50RGF0YShwYXJlbnRWaWV3LCB2aWV3LnBhcmVudE5vZGVEZWYgIS5ub2RlSW5kZXgpO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIGZvciBjb21wb25lbnQgdmlld3MsIHRoaXMgaXMgdGhlIGhvc3QgZWxlbWVudC5cbiAqIGZvciBlbWJlZGRlZCB2aWV3cywgdGhpcyBpcyB0aGUgaW5kZXggb2YgdGhlIHBhcmVudCBub2RlXG4gKiB0aGF0IGNvbnRhaW5zIHRoZSB2aWV3IGNvbnRhaW5lci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZpZXdQYXJlbnRFbCh2aWV3OiBWaWV3RGF0YSk6IE5vZGVEZWZ8bnVsbCB7XG4gIGNvbnN0IHBhcmVudFZpZXcgPSB2aWV3LnBhcmVudDtcbiAgaWYgKHBhcmVudFZpZXcpIHtcbiAgICByZXR1cm4gdmlldy5wYXJlbnROb2RlRGVmICEucGFyZW50O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJOb2RlKHZpZXc6IFZpZXdEYXRhLCBkZWY6IE5vZGVEZWYpOiBhbnkge1xuICBzd2l0Y2ggKGRlZi5mbGFncyAmIE5vZGVGbGFncy5UeXBlcykge1xuICAgIGNhc2UgTm9kZUZsYWdzLlR5cGVFbGVtZW50OlxuICAgICAgcmV0dXJuIGFzRWxlbWVudERhdGEodmlldywgZGVmLm5vZGVJbmRleCkucmVuZGVyRWxlbWVudDtcbiAgICBjYXNlIE5vZGVGbGFncy5UeXBlVGV4dDpcbiAgICAgIHJldHVybiBhc1RleHREYXRhKHZpZXcsIGRlZi5ub2RlSW5kZXgpLnJlbmRlclRleHQ7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVsZW1lbnRFdmVudEZ1bGxOYW1lKHRhcmdldDogc3RyaW5nIHwgbnVsbCwgbmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHRhcmdldCA/IGAke3RhcmdldH06JHtuYW1lfWAgOiBuYW1lO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDb21wb25lbnRWaWV3KHZpZXc6IFZpZXdEYXRhKTogYm9vbGVhbiB7XG4gIHJldHVybiAhIXZpZXcucGFyZW50ICYmICEhKHZpZXcucGFyZW50Tm9kZURlZiAhLmZsYWdzICYgTm9kZUZsYWdzLkNvbXBvbmVudCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0VtYmVkZGVkVmlldyh2aWV3OiBWaWV3RGF0YSk6IGJvb2xlYW4ge1xuICByZXR1cm4gISF2aWV3LnBhcmVudCAmJiAhKHZpZXcucGFyZW50Tm9kZURlZiAhLmZsYWdzICYgTm9kZUZsYWdzLkNvbXBvbmVudCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXJRdWVyeUlkKHF1ZXJ5SWQ6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiAxIDw8IChxdWVyeUlkICUgMzIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3BsaXRNYXRjaGVkUXVlcmllc0RzbChcbiAgICBtYXRjaGVkUXVlcmllc0RzbDogW3N0cmluZyB8IG51bWJlciwgUXVlcnlWYWx1ZVR5cGVdW10gfCBudWxsKToge1xuICBtYXRjaGVkUXVlcmllczoge1txdWVyeUlkOiBzdHJpbmddOiBRdWVyeVZhbHVlVHlwZX0sXG4gIHJlZmVyZW5jZXM6IHtbcmVmSWQ6IHN0cmluZ106IFF1ZXJ5VmFsdWVUeXBlfSxcbiAgbWF0Y2hlZFF1ZXJ5SWRzOiBudW1iZXJcbn0ge1xuICBjb25zdCBtYXRjaGVkUXVlcmllczoge1txdWVyeUlkOiBzdHJpbmddOiBRdWVyeVZhbHVlVHlwZX0gPSB7fTtcbiAgbGV0IG1hdGNoZWRRdWVyeUlkcyA9IDA7XG4gIGNvbnN0IHJlZmVyZW5jZXM6IHtbcmVmSWQ6IHN0cmluZ106IFF1ZXJ5VmFsdWVUeXBlfSA9IHt9O1xuICBpZiAobWF0Y2hlZFF1ZXJpZXNEc2wpIHtcbiAgICBtYXRjaGVkUXVlcmllc0RzbC5mb3JFYWNoKChbcXVlcnlJZCwgdmFsdWVUeXBlXSkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBxdWVyeUlkID09PSAnbnVtYmVyJykge1xuICAgICAgICBtYXRjaGVkUXVlcmllc1txdWVyeUlkXSA9IHZhbHVlVHlwZTtcbiAgICAgICAgbWF0Y2hlZFF1ZXJ5SWRzIHw9IGZpbHRlclF1ZXJ5SWQocXVlcnlJZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZWZlcmVuY2VzW3F1ZXJ5SWRdID0gdmFsdWVUeXBlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHJldHVybiB7bWF0Y2hlZFF1ZXJpZXMsIHJlZmVyZW5jZXMsIG1hdGNoZWRRdWVyeUlkc307XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzcGxpdERlcHNEc2woZGVwczogKFtEZXBGbGFncywgYW55XSB8IGFueSlbXSwgc291cmNlTmFtZT86IHN0cmluZyk6IERlcERlZltdIHtcbiAgcmV0dXJuIGRlcHMubWFwKHZhbHVlID0+IHtcbiAgICBsZXQgdG9rZW46IGFueTtcbiAgICBsZXQgZmxhZ3M6IERlcEZsYWdzO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgW2ZsYWdzLCB0b2tlbl0gPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZmxhZ3MgPSBEZXBGbGFncy5Ob25lO1xuICAgICAgdG9rZW4gPSB2YWx1ZTtcbiAgICB9XG4gICAgaWYgKHRva2VuICYmICh0eXBlb2YgdG9rZW4gPT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIHRva2VuID09PSAnb2JqZWN0JykgJiYgc291cmNlTmFtZSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRva2VuLCBTT1VSQ0UsIHt2YWx1ZTogc291cmNlTmFtZSwgY29uZmlndXJhYmxlOiB0cnVlfSk7XG4gICAgfVxuICAgIHJldHVybiB7ZmxhZ3MsIHRva2VuLCB0b2tlbktleTogdG9rZW5LZXkodG9rZW4pfTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQYXJlbnRSZW5kZXJFbGVtZW50KHZpZXc6IFZpZXdEYXRhLCByZW5kZXJIb3N0OiBhbnksIGRlZjogTm9kZURlZik6IGFueSB7XG4gIGxldCByZW5kZXJQYXJlbnQgPSBkZWYucmVuZGVyUGFyZW50O1xuICBpZiAocmVuZGVyUGFyZW50KSB7XG4gICAgaWYgKChyZW5kZXJQYXJlbnQuZmxhZ3MgJiBOb2RlRmxhZ3MuVHlwZUVsZW1lbnQpID09PSAwIHx8XG4gICAgICAgIChyZW5kZXJQYXJlbnQuZmxhZ3MgJiBOb2RlRmxhZ3MuQ29tcG9uZW50VmlldykgPT09IDAgfHxcbiAgICAgICAgKHJlbmRlclBhcmVudC5lbGVtZW50ICEuY29tcG9uZW50UmVuZGVyZXJUeXBlICYmXG4gICAgICAgICByZW5kZXJQYXJlbnQuZWxlbWVudCAhLmNvbXBvbmVudFJlbmRlcmVyVHlwZSAhLmVuY2Fwc3VsYXRpb24gPT09XG4gICAgICAgICAgICAgVmlld0VuY2Fwc3VsYXRpb24uTmF0aXZlKSkge1xuICAgICAgLy8gb25seSBjaGlsZHJlbiBvZiBub24gY29tcG9uZW50cywgb3IgY2hpbGRyZW4gb2YgY29tcG9uZW50cyB3aXRoIG5hdGl2ZSBlbmNhcHN1bGF0aW9uIHNob3VsZFxuICAgICAgLy8gYmUgYXR0YWNoZWQuXG4gICAgICByZXR1cm4gYXNFbGVtZW50RGF0YSh2aWV3LCBkZWYucmVuZGVyUGFyZW50ICEubm9kZUluZGV4KS5yZW5kZXJFbGVtZW50O1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcmVuZGVySG9zdDtcbiAgfVxufVxuXG5jb25zdCBERUZJTklUSU9OX0NBQ0hFID0gbmV3IFdlYWtNYXA8YW55LCBEZWZpbml0aW9uPGFueT4+KCk7XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlRGVmaW5pdGlvbjxEIGV4dGVuZHMgRGVmaW5pdGlvbjxhbnk+PihmYWN0b3J5OiBEZWZpbml0aW9uRmFjdG9yeTxEPik6IEQge1xuICBsZXQgdmFsdWUgPSBERUZJTklUSU9OX0NBQ0hFLmdldChmYWN0b3J5KSAhYXMgRDtcbiAgaWYgKCF2YWx1ZSkge1xuICAgIHZhbHVlID0gZmFjdG9yeSgoKSA9PiBOT09QKTtcbiAgICB2YWx1ZS5mYWN0b3J5ID0gZmFjdG9yeTtcbiAgICBERUZJTklUSU9OX0NBQ0hFLnNldChmYWN0b3J5LCB2YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcm9vdFJlbmRlck5vZGVzKHZpZXc6IFZpZXdEYXRhKTogYW55W10ge1xuICBjb25zdCByZW5kZXJOb2RlczogYW55W10gPSBbXTtcbiAgdmlzaXRSb290UmVuZGVyTm9kZXModmlldywgUmVuZGVyTm9kZUFjdGlvbi5Db2xsZWN0LCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgcmVuZGVyTm9kZXMpO1xuICByZXR1cm4gcmVuZGVyTm9kZXM7XG59XG5cbmV4cG9ydCBjb25zdCBlbnVtIFJlbmRlck5vZGVBY3Rpb24ge0NvbGxlY3QsIEFwcGVuZENoaWxkLCBJbnNlcnRCZWZvcmUsIFJlbW92ZUNoaWxkfVxuXG5leHBvcnQgZnVuY3Rpb24gdmlzaXRSb290UmVuZGVyTm9kZXMoXG4gICAgdmlldzogVmlld0RhdGEsIGFjdGlvbjogUmVuZGVyTm9kZUFjdGlvbiwgcGFyZW50Tm9kZTogYW55LCBuZXh0U2libGluZzogYW55LCB0YXJnZXQ/OiBhbnlbXSkge1xuICAvLyBXZSBuZWVkIHRvIHJlLWNvbXB1dGUgdGhlIHBhcmVudCBub2RlIGluIGNhc2UgdGhlIG5vZGVzIGhhdmUgYmVlbiBtb3ZlZCBhcm91bmQgbWFudWFsbHlcbiAgaWYgKGFjdGlvbiA9PT0gUmVuZGVyTm9kZUFjdGlvbi5SZW1vdmVDaGlsZCkge1xuICAgIHBhcmVudE5vZGUgPSB2aWV3LnJlbmRlcmVyLnBhcmVudE5vZGUocmVuZGVyTm9kZSh2aWV3LCB2aWV3LmRlZi5sYXN0UmVuZGVyUm9vdE5vZGUgISkpO1xuICB9XG4gIHZpc2l0U2libGluZ1JlbmRlck5vZGVzKFxuICAgICAgdmlldywgYWN0aW9uLCAwLCB2aWV3LmRlZi5ub2Rlcy5sZW5ndGggLSAxLCBwYXJlbnROb2RlLCBuZXh0U2libGluZywgdGFyZ2V0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZpc2l0U2libGluZ1JlbmRlck5vZGVzKFxuICAgIHZpZXc6IFZpZXdEYXRhLCBhY3Rpb246IFJlbmRlck5vZGVBY3Rpb24sIHN0YXJ0SW5kZXg6IG51bWJlciwgZW5kSW5kZXg6IG51bWJlciwgcGFyZW50Tm9kZTogYW55LFxuICAgIG5leHRTaWJsaW5nOiBhbnksIHRhcmdldD86IGFueVtdKSB7XG4gIGZvciAobGV0IGkgPSBzdGFydEluZGV4OyBpIDw9IGVuZEluZGV4OyBpKyspIHtcbiAgICBjb25zdCBub2RlRGVmID0gdmlldy5kZWYubm9kZXNbaV07XG4gICAgaWYgKG5vZGVEZWYuZmxhZ3MgJiAoTm9kZUZsYWdzLlR5cGVFbGVtZW50IHwgTm9kZUZsYWdzLlR5cGVUZXh0IHwgTm9kZUZsYWdzLlR5cGVOZ0NvbnRlbnQpKSB7XG4gICAgICB2aXNpdFJlbmRlck5vZGUodmlldywgbm9kZURlZiwgYWN0aW9uLCBwYXJlbnROb2RlLCBuZXh0U2libGluZywgdGFyZ2V0KTtcbiAgICB9XG4gICAgLy8ganVtcCB0byBuZXh0IHNpYmxpbmdcbiAgICBpICs9IG5vZGVEZWYuY2hpbGRDb3VudDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmlzaXRQcm9qZWN0ZWRSZW5kZXJOb2RlcyhcbiAgICB2aWV3OiBWaWV3RGF0YSwgbmdDb250ZW50SW5kZXg6IG51bWJlciwgYWN0aW9uOiBSZW5kZXJOb2RlQWN0aW9uLCBwYXJlbnROb2RlOiBhbnksXG4gICAgbmV4dFNpYmxpbmc6IGFueSwgdGFyZ2V0PzogYW55W10pIHtcbiAgbGV0IGNvbXBWaWV3OiBWaWV3RGF0YXxudWxsID0gdmlldztcbiAgd2hpbGUgKGNvbXBWaWV3ICYmICFpc0NvbXBvbmVudFZpZXcoY29tcFZpZXcpKSB7XG4gICAgY29tcFZpZXcgPSBjb21wVmlldy5wYXJlbnQ7XG4gIH1cbiAgY29uc3QgaG9zdFZpZXcgPSBjb21wVmlldyAhLnBhcmVudDtcbiAgY29uc3QgaG9zdEVsRGVmID0gdmlld1BhcmVudEVsKGNvbXBWaWV3ICEpO1xuICBjb25zdCBzdGFydEluZGV4ID0gaG9zdEVsRGVmICEubm9kZUluZGV4ICsgMTtcbiAgY29uc3QgZW5kSW5kZXggPSBob3N0RWxEZWYgIS5ub2RlSW5kZXggKyBob3N0RWxEZWYgIS5jaGlsZENvdW50O1xuICBmb3IgKGxldCBpID0gc3RhcnRJbmRleDsgaSA8PSBlbmRJbmRleDsgaSsrKSB7XG4gICAgY29uc3Qgbm9kZURlZiA9IGhvc3RWaWV3ICEuZGVmLm5vZGVzW2ldO1xuICAgIGlmIChub2RlRGVmLm5nQ29udGVudEluZGV4ID09PSBuZ0NvbnRlbnRJbmRleCkge1xuICAgICAgdmlzaXRSZW5kZXJOb2RlKGhvc3RWaWV3ICEsIG5vZGVEZWYsIGFjdGlvbiwgcGFyZW50Tm9kZSwgbmV4dFNpYmxpbmcsIHRhcmdldCk7XG4gICAgfVxuICAgIC8vIGp1bXAgdG8gbmV4dCBzaWJsaW5nXG4gICAgaSArPSBub2RlRGVmLmNoaWxkQ291bnQ7XG4gIH1cbiAgaWYgKCFob3N0VmlldyAhLnBhcmVudCkge1xuICAgIC8vIGEgcm9vdCB2aWV3XG4gICAgY29uc3QgcHJvamVjdGVkTm9kZXMgPSB2aWV3LnJvb3QucHJvamVjdGFibGVOb2Rlc1tuZ0NvbnRlbnRJbmRleF07XG4gICAgaWYgKHByb2plY3RlZE5vZGVzKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb2plY3RlZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGV4ZWNSZW5kZXJOb2RlQWN0aW9uKHZpZXcsIHByb2plY3RlZE5vZGVzW2ldLCBhY3Rpb24sIHBhcmVudE5vZGUsIG5leHRTaWJsaW5nLCB0YXJnZXQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiB2aXNpdFJlbmRlck5vZGUoXG4gICAgdmlldzogVmlld0RhdGEsIG5vZGVEZWY6IE5vZGVEZWYsIGFjdGlvbjogUmVuZGVyTm9kZUFjdGlvbiwgcGFyZW50Tm9kZTogYW55LCBuZXh0U2libGluZzogYW55LFxuICAgIHRhcmdldD86IGFueVtdKSB7XG4gIGlmIChub2RlRGVmLmZsYWdzICYgTm9kZUZsYWdzLlR5cGVOZ0NvbnRlbnQpIHtcbiAgICB2aXNpdFByb2plY3RlZFJlbmRlck5vZGVzKFxuICAgICAgICB2aWV3LCBub2RlRGVmLm5nQ29udGVudCAhLmluZGV4LCBhY3Rpb24sIHBhcmVudE5vZGUsIG5leHRTaWJsaW5nLCB0YXJnZXQpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IHJuID0gcmVuZGVyTm9kZSh2aWV3LCBub2RlRGVmKTtcbiAgICBpZiAoYWN0aW9uID09PSBSZW5kZXJOb2RlQWN0aW9uLlJlbW92ZUNoaWxkICYmIChub2RlRGVmLmZsYWdzICYgTm9kZUZsYWdzLkNvbXBvbmVudFZpZXcpICYmXG4gICAgICAgIChub2RlRGVmLmJpbmRpbmdGbGFncyAmIEJpbmRpbmdGbGFncy5DYXRTeW50aGV0aWNQcm9wZXJ0eSkpIHtcbiAgICAgIC8vIE5vdGU6IHdlIG1pZ2h0IG5lZWQgdG8gZG8gYm90aCBhY3Rpb25zLlxuICAgICAgaWYgKG5vZGVEZWYuYmluZGluZ0ZsYWdzICYgKEJpbmRpbmdGbGFncy5TeW50aGV0aWNQcm9wZXJ0eSkpIHtcbiAgICAgICAgZXhlY1JlbmRlck5vZGVBY3Rpb24odmlldywgcm4sIGFjdGlvbiwgcGFyZW50Tm9kZSwgbmV4dFNpYmxpbmcsIHRhcmdldCk7XG4gICAgICB9XG4gICAgICBpZiAobm9kZURlZi5iaW5kaW5nRmxhZ3MgJiAoQmluZGluZ0ZsYWdzLlN5bnRoZXRpY0hvc3RQcm9wZXJ0eSkpIHtcbiAgICAgICAgY29uc3QgY29tcFZpZXcgPSBhc0VsZW1lbnREYXRhKHZpZXcsIG5vZGVEZWYubm9kZUluZGV4KS5jb21wb25lbnRWaWV3O1xuICAgICAgICBleGVjUmVuZGVyTm9kZUFjdGlvbihjb21wVmlldywgcm4sIGFjdGlvbiwgcGFyZW50Tm9kZSwgbmV4dFNpYmxpbmcsIHRhcmdldCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGV4ZWNSZW5kZXJOb2RlQWN0aW9uKHZpZXcsIHJuLCBhY3Rpb24sIHBhcmVudE5vZGUsIG5leHRTaWJsaW5nLCB0YXJnZXQpO1xuICAgIH1cbiAgICBpZiAobm9kZURlZi5mbGFncyAmIE5vZGVGbGFncy5FbWJlZGRlZFZpZXdzKSB7XG4gICAgICBjb25zdCBlbWJlZGRlZFZpZXdzID0gYXNFbGVtZW50RGF0YSh2aWV3LCBub2RlRGVmLm5vZGVJbmRleCkudmlld0NvbnRhaW5lciAhLl9lbWJlZGRlZFZpZXdzO1xuICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBlbWJlZGRlZFZpZXdzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIHZpc2l0Um9vdFJlbmRlck5vZGVzKGVtYmVkZGVkVmlld3Nba10sIGFjdGlvbiwgcGFyZW50Tm9kZSwgbmV4dFNpYmxpbmcsIHRhcmdldCk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChub2RlRGVmLmZsYWdzICYgTm9kZUZsYWdzLlR5cGVFbGVtZW50ICYmICFub2RlRGVmLmVsZW1lbnQgIS5uYW1lKSB7XG4gICAgICB2aXNpdFNpYmxpbmdSZW5kZXJOb2RlcyhcbiAgICAgICAgICB2aWV3LCBhY3Rpb24sIG5vZGVEZWYubm9kZUluZGV4ICsgMSwgbm9kZURlZi5ub2RlSW5kZXggKyBub2RlRGVmLmNoaWxkQ291bnQsIHBhcmVudE5vZGUsXG4gICAgICAgICAgbmV4dFNpYmxpbmcsIHRhcmdldCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGV4ZWNSZW5kZXJOb2RlQWN0aW9uKFxuICAgIHZpZXc6IFZpZXdEYXRhLCByZW5kZXJOb2RlOiBhbnksIGFjdGlvbjogUmVuZGVyTm9kZUFjdGlvbiwgcGFyZW50Tm9kZTogYW55LCBuZXh0U2libGluZzogYW55LFxuICAgIHRhcmdldD86IGFueVtdKSB7XG4gIGNvbnN0IHJlbmRlcmVyID0gdmlldy5yZW5kZXJlcjtcbiAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICBjYXNlIFJlbmRlck5vZGVBY3Rpb24uQXBwZW5kQ2hpbGQ6XG4gICAgICByZW5kZXJlci5hcHBlbmRDaGlsZChwYXJlbnROb2RlLCByZW5kZXJOb2RlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgUmVuZGVyTm9kZUFjdGlvbi5JbnNlcnRCZWZvcmU6XG4gICAgICByZW5kZXJlci5pbnNlcnRCZWZvcmUocGFyZW50Tm9kZSwgcmVuZGVyTm9kZSwgbmV4dFNpYmxpbmcpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBSZW5kZXJOb2RlQWN0aW9uLlJlbW92ZUNoaWxkOlxuICAgICAgcmVuZGVyZXIucmVtb3ZlQ2hpbGQocGFyZW50Tm9kZSwgcmVuZGVyTm9kZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFJlbmRlck5vZGVBY3Rpb24uQ29sbGVjdDpcbiAgICAgIHRhcmdldCAhLnB1c2gocmVuZGVyTm9kZSk7XG4gICAgICBicmVhaztcbiAgfVxufVxuXG5jb25zdCBOU19QUkVGSVhfUkUgPSAvXjooW146XSspOiguKykkLztcblxuZXhwb3J0IGZ1bmN0aW9uIHNwbGl0TmFtZXNwYWNlKG5hbWU6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgaWYgKG5hbWVbMF0gPT09ICc6Jykge1xuICAgIGNvbnN0IG1hdGNoID0gbmFtZS5tYXRjaChOU19QUkVGSVhfUkUpICE7XG4gICAgcmV0dXJuIFttYXRjaFsxXSwgbWF0Y2hbMl1dO1xuICB9XG4gIHJldHVybiBbJycsIG5hbWVdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FsY0JpbmRpbmdGbGFncyhiaW5kaW5nczogQmluZGluZ0RlZltdKTogQmluZGluZ0ZsYWdzIHtcbiAgbGV0IGZsYWdzID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaW5kaW5ncy5sZW5ndGg7IGkrKykge1xuICAgIGZsYWdzIHw9IGJpbmRpbmdzW2ldLmZsYWdzO1xuICB9XG4gIHJldHVybiBmbGFncztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGludGVycG9sYXRlKHZhbHVlQ291bnQ6IG51bWJlciwgY29uc3RBbmRJbnRlcnA6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgbGV0IHJlc3VsdCA9ICcnO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHZhbHVlQ291bnQgKiAyOyBpID0gaSArIDIpIHtcbiAgICByZXN1bHQgPSByZXN1bHQgKyBjb25zdEFuZEludGVycFtpXSArIF90b1N0cmluZ1dpdGhOdWxsKGNvbnN0QW5kSW50ZXJwW2kgKyAxXSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdCArIGNvbnN0QW5kSW50ZXJwW3ZhbHVlQ291bnQgKiAyXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlubGluZUludGVycG9sYXRlKFxuICAgIHZhbHVlQ291bnQ6IG51bWJlciwgYzA6IHN0cmluZywgYTE6IGFueSwgYzE6IHN0cmluZywgYTI/OiBhbnksIGMyPzogc3RyaW5nLCBhMz86IGFueSxcbiAgICBjMz86IHN0cmluZywgYTQ/OiBhbnksIGM0Pzogc3RyaW5nLCBhNT86IGFueSwgYzU/OiBzdHJpbmcsIGE2PzogYW55LCBjNj86IHN0cmluZywgYTc/OiBhbnksXG4gICAgYzc/OiBzdHJpbmcsIGE4PzogYW55LCBjOD86IHN0cmluZywgYTk/OiBhbnksIGM5Pzogc3RyaW5nKTogc3RyaW5nIHtcbiAgc3dpdGNoICh2YWx1ZUNvdW50KSB7XG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIGMwICsgX3RvU3RyaW5nV2l0aE51bGwoYTEpICsgYzE7XG4gICAgY2FzZSAyOlxuICAgICAgcmV0dXJuIGMwICsgX3RvU3RyaW5nV2l0aE51bGwoYTEpICsgYzEgKyBfdG9TdHJpbmdXaXRoTnVsbChhMikgKyBjMjtcbiAgICBjYXNlIDM6XG4gICAgICByZXR1cm4gYzAgKyBfdG9TdHJpbmdXaXRoTnVsbChhMSkgKyBjMSArIF90b1N0cmluZ1dpdGhOdWxsKGEyKSArIGMyICsgX3RvU3RyaW5nV2l0aE51bGwoYTMpICtcbiAgICAgICAgICBjMztcbiAgICBjYXNlIDQ6XG4gICAgICByZXR1cm4gYzAgKyBfdG9TdHJpbmdXaXRoTnVsbChhMSkgKyBjMSArIF90b1N0cmluZ1dpdGhOdWxsKGEyKSArIGMyICsgX3RvU3RyaW5nV2l0aE51bGwoYTMpICtcbiAgICAgICAgICBjMyArIF90b1N0cmluZ1dpdGhOdWxsKGE0KSArIGM0O1xuICAgIGNhc2UgNTpcbiAgICAgIHJldHVybiBjMCArIF90b1N0cmluZ1dpdGhOdWxsKGExKSArIGMxICsgX3RvU3RyaW5nV2l0aE51bGwoYTIpICsgYzIgKyBfdG9TdHJpbmdXaXRoTnVsbChhMykgK1xuICAgICAgICAgIGMzICsgX3RvU3RyaW5nV2l0aE51bGwoYTQpICsgYzQgKyBfdG9TdHJpbmdXaXRoTnVsbChhNSkgKyBjNTtcbiAgICBjYXNlIDY6XG4gICAgICByZXR1cm4gYzAgKyBfdG9TdHJpbmdXaXRoTnVsbChhMSkgKyBjMSArIF90b1N0cmluZ1dpdGhOdWxsKGEyKSArIGMyICsgX3RvU3RyaW5nV2l0aE51bGwoYTMpICtcbiAgICAgICAgICBjMyArIF90b1N0cmluZ1dpdGhOdWxsKGE0KSArIGM0ICsgX3RvU3RyaW5nV2l0aE51bGwoYTUpICsgYzUgKyBfdG9TdHJpbmdXaXRoTnVsbChhNikgKyBjNjtcbiAgICBjYXNlIDc6XG4gICAgICByZXR1cm4gYzAgKyBfdG9TdHJpbmdXaXRoTnVsbChhMSkgKyBjMSArIF90b1N0cmluZ1dpdGhOdWxsKGEyKSArIGMyICsgX3RvU3RyaW5nV2l0aE51bGwoYTMpICtcbiAgICAgICAgICBjMyArIF90b1N0cmluZ1dpdGhOdWxsKGE0KSArIGM0ICsgX3RvU3RyaW5nV2l0aE51bGwoYTUpICsgYzUgKyBfdG9TdHJpbmdXaXRoTnVsbChhNikgK1xuICAgICAgICAgIGM2ICsgX3RvU3RyaW5nV2l0aE51bGwoYTcpICsgYzc7XG4gICAgY2FzZSA4OlxuICAgICAgcmV0dXJuIGMwICsgX3RvU3RyaW5nV2l0aE51bGwoYTEpICsgYzEgKyBfdG9TdHJpbmdXaXRoTnVsbChhMikgKyBjMiArIF90b1N0cmluZ1dpdGhOdWxsKGEzKSArXG4gICAgICAgICAgYzMgKyBfdG9TdHJpbmdXaXRoTnVsbChhNCkgKyBjNCArIF90b1N0cmluZ1dpdGhOdWxsKGE1KSArIGM1ICsgX3RvU3RyaW5nV2l0aE51bGwoYTYpICtcbiAgICAgICAgICBjNiArIF90b1N0cmluZ1dpdGhOdWxsKGE3KSArIGM3ICsgX3RvU3RyaW5nV2l0aE51bGwoYTgpICsgYzg7XG4gICAgY2FzZSA5OlxuICAgICAgcmV0dXJuIGMwICsgX3RvU3RyaW5nV2l0aE51bGwoYTEpICsgYzEgKyBfdG9TdHJpbmdXaXRoTnVsbChhMikgKyBjMiArIF90b1N0cmluZ1dpdGhOdWxsKGEzKSArXG4gICAgICAgICAgYzMgKyBfdG9TdHJpbmdXaXRoTnVsbChhNCkgKyBjNCArIF90b1N0cmluZ1dpdGhOdWxsKGE1KSArIGM1ICsgX3RvU3RyaW5nV2l0aE51bGwoYTYpICtcbiAgICAgICAgICBjNiArIF90b1N0cmluZ1dpdGhOdWxsKGE3KSArIGM3ICsgX3RvU3RyaW5nV2l0aE51bGwoYTgpICsgYzggKyBfdG9TdHJpbmdXaXRoTnVsbChhOSkgKyBjOTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBEb2VzIG5vdCBzdXBwb3J0IG1vcmUgdGhhbiA5IGV4cHJlc3Npb25zYCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX3RvU3RyaW5nV2l0aE51bGwodjogYW55KTogc3RyaW5nIHtcbiAgcmV0dXJuIHYgIT0gbnVsbCA/IHYudG9TdHJpbmcoKSA6ICcnO1xufVxuXG5leHBvcnQgY29uc3QgRU1QVFlfQVJSQVk6IGFueVtdID0gW107XG5leHBvcnQgY29uc3QgRU1QVFlfTUFQOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xuIl19