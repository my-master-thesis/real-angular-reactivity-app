/**
 * @fileoverview added by tsickle
 * Generated from: packages/core/src/render3/node_manipulation.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ViewEncapsulation } from '../metadata/view';
import { addToArray, removeFromArray } from '../util/array_utils';
import { assertDefined, assertDomNode, assertEqual, assertString } from '../util/assert';
import { assertLContainer, assertLView, assertTNodeForLView } from './assert';
import { attachPatchData } from './context_discovery';
import { ACTIVE_INDEX, CONTAINER_HEADER_OFFSET, MOVED_VIEWS, NATIVE, unusedValueExportToPlacateAjd as unused1 } from './interfaces/container';
import { NodeInjectorFactory } from './interfaces/injector';
import { unusedValueExportToPlacateAjd as unused2 } from './interfaces/node';
import { unusedValueExportToPlacateAjd as unused3 } from './interfaces/projection';
import { isProceduralRenderer, unusedValueExportToPlacateAjd as unused4 } from './interfaces/renderer';
import { isLContainer, isLView } from './interfaces/type_checks';
import { CHILD_HEAD, CLEANUP, DECLARATION_COMPONENT_VIEW, DECLARATION_LCONTAINER, FLAGS, HOST, NEXT, PARENT, QUERIES, RENDERER, TVIEW, T_HOST, unusedValueExportToPlacateAjd as unused5, CONTEXT } from './interfaces/view';
import { assertNodeOfPossibleTypes, assertNodeType } from './node_assert';
import { getLViewParent } from './util/view_traversal_utils';
import { getNativeByTNode, unwrapRNode } from './util/view_utils';
import { NOT_LOST_PROXY_INDICATOR, REACTIVE_PROPERTIES_INDICATOR, REMOVE_PROXY_INDICATOR } from "@angular/core/src/render3/interfaces/context";
/** @type {?} */
const unusedValueToPlacateAjd = unused1 + unused2 + unused3 + unused4 + unused5;
/**
 * @param {?} tNode
 * @param {?} embeddedView
 * @return {?}
 */
export function getLContainer(tNode, embeddedView) {
    ngDevMode && assertLView(embeddedView);
    /** @type {?} */
    const container = (/** @type {?} */ (embeddedView[PARENT]));
    if (tNode.index === -1) {
        // This is a dynamically created view inside a dynamic container.
        // The parent isn't an LContainer if the embedded view hasn't been attached yet.
        return isLContainer(container) ? container : null;
    }
    else {
        ngDevMode && assertLContainer(container);
        // This is a inline view node (e.g. embeddedViewStart)
        return container;
    }
}
/**
 * Retrieves render parent for a given view.
 * Might be null if a view is not yet attached to any container.
 * @param {?} tViewNode
 * @param {?} view
 * @return {?}
 */
export function getContainerRenderParent(tViewNode, view) {
    /** @type {?} */
    const container = getLContainer(tViewNode, view);
    return container ? nativeParentNode(view[RENDERER], container[NATIVE]) : null;
}
/** @enum {number} */
const WalkTNodeTreeAction = {
    /** node create in the native environment. Run on initial creation. */
    Create: 0,
    /**
     * node insert in the native environment.
     * Run when existing node has been detached and needs to be re-attached.
     */
    Insert: 1,
    /** node detach from the native environment */
    Detach: 2,
    /** node destruction using the renderer's API */
    Destroy: 3,
};
/**
 * NOTE: for performance reasons, the possible actions are inlined within the function instead of
 * being passed as an argument.
 * @param {?} action
 * @param {?} renderer
 * @param {?} parent
 * @param {?} lNodeToHandle
 * @param {?=} beforeNode
 * @return {?}
 */
function applyToElementOrContainer(action, renderer, parent, lNodeToHandle, beforeNode) {
    // If this slot was allocated for a text node dynamically created by i18n, the text node itself
    // won't be created until i18nApply() in the update block, so this node should be skipped.
    // For more info, see "ICU expressions should work inside an ngTemplateOutlet inside an ngFor"
    // in `i18n_spec.ts`.
    if (lNodeToHandle != null) {
        /** @type {?} */
        let lContainer;
        /** @type {?} */
        let isComponent = false;
        // We are expecting an RNode, but in the case of a component or LContainer the `RNode` is
        // wrapped in an array which needs to be unwrapped. We need to know if it is a component and if
        // it has LContainer so that we can process all of those cases appropriately.
        if (isLContainer(lNodeToHandle)) {
            lContainer = lNodeToHandle;
        }
        else if (isLView(lNodeToHandle)) {
            isComponent = true;
            ngDevMode && assertDefined(lNodeToHandle[HOST], 'HOST must be defined for a component LView');
            lNodeToHandle = (/** @type {?} */ (lNodeToHandle[HOST]));
        }
        /** @type {?} */
        const rNode = unwrapRNode(lNodeToHandle);
        ngDevMode && !isProceduralRenderer(renderer) && assertDomNode(rNode);
        if (action === 0 /* Create */ && parent !== null) {
            if (beforeNode == null) {
                nativeAppendChild(renderer, parent, rNode);
            }
            else {
                nativeInsertBefore(renderer, parent, rNode, beforeNode || null);
            }
        }
        else if (action === 1 /* Insert */ && parent !== null) {
            nativeInsertBefore(renderer, parent, rNode, beforeNode || null);
        }
        else if (action === 2 /* Detach */) {
            nativeRemoveNode(renderer, rNode, isComponent);
        }
        else if (action === 3 /* Destroy */) {
            ngDevMode && ngDevMode.rendererDestroyNode++;
            (/** @type {?} */ (((/** @type {?} */ (renderer))).destroyNode))(rNode);
        }
        if (lContainer != null) {
            applyContainer(renderer, action, lContainer, parent, beforeNode);
        }
    }
}
/**
 * @param {?} value
 * @param {?} renderer
 * @return {?}
 */
export function createTextNode(value, renderer) {
    ngDevMode && ngDevMode.rendererCreateTextNode++;
    ngDevMode && ngDevMode.rendererSetText++;
    return isProceduralRenderer(renderer) ? renderer.createText(value) :
        renderer.createTextNode(value);
}
/**
 * @param {?} tView
 * @param {?} lView
 * @param {?} insertMode
 * @param {?} beforeNode
 * @return {?}
 */
export function addRemoveViewFromContainer(tView, lView, insertMode, beforeNode) {
    /** @type {?} */
    const renderParent = getContainerRenderParent((/** @type {?} */ (tView.node)), lView);
    ngDevMode && assertNodeType((/** @type {?} */ (tView.node)), 2 /* View */);
    if (renderParent) {
        /** @type {?} */
        const renderer = lView[RENDERER];
        /** @type {?} */
        const action = insertMode ? 1 /* Insert */ : 2 /* Detach */;
        applyView(tView, lView, renderer, action, renderParent, beforeNode);
    }
}
/**
 * Detach a `LView` from the DOM by detaching its nodes.
 *
 * @param {?} tView The `TView' of the `LView` to be detached
 * @param {?} lView the `LView` to be detached.
 * @return {?}
 */
export function renderDetachView(tView, lView) {
    applyView(tView, lView, lView[RENDERER], 2 /* Detach */, null, null);
}
/**
 * Traverses down and up the tree of views and containers to remove listeners and
 * call onDestroy callbacks.
 *
 * Notes:
 *  - Because it's used for onDestroy calls, it needs to be bottom-up.
 *  - Must process containers instead of their views to avoid splicing
 *  when views are destroyed and re-added.
 *  - Using a while loop because it's faster than recursion
 *  - Destroy only called on movement to sibling or movement to parent (laterally or up)
 *
 * @param {?} rootView The view to destroy
 * @return {?}
 */
export function destroyViewTree(rootView) {
    // If the view has no children, we can clean it up and return early.
    /** @type {?} */
    let lViewOrLContainer = rootView[CHILD_HEAD];
    if (!lViewOrLContainer) {
        return cleanUpView(rootView[TVIEW], rootView);
    }
    while (lViewOrLContainer) {
        /** @type {?} */
        let next = null;
        if (isLView(lViewOrLContainer)) {
            // If LView, traverse down to child.
            next = lViewOrLContainer[CHILD_HEAD];
        }
        else {
            ngDevMode && assertLContainer(lViewOrLContainer);
            // If container, traverse down to its first LView.
            /** @type {?} */
            const firstView = lViewOrLContainer[CONTAINER_HEADER_OFFSET];
            if (firstView)
                next = firstView;
        }
        if (!next) {
            // Only clean up view when moving to the side or up, as destroy hooks
            // should be called in order from the bottom up.
            while (lViewOrLContainer && !(/** @type {?} */ (lViewOrLContainer))[NEXT] && lViewOrLContainer !== rootView) {
                isLView(lViewOrLContainer) && cleanUpView(lViewOrLContainer[TVIEW], lViewOrLContainer);
                lViewOrLContainer = getParentState(lViewOrLContainer, rootView);
            }
            if (lViewOrLContainer === null)
                lViewOrLContainer = rootView;
            isLView(lViewOrLContainer) && cleanUpView(lViewOrLContainer[TVIEW], lViewOrLContainer);
            next = lViewOrLContainer && (/** @type {?} */ (lViewOrLContainer))[NEXT];
        }
        lViewOrLContainer = next;
    }
}
/**
 * Inserts a view into a container.
 *
 * This adds the view to the container's array of active views in the correct
 * position. It also adds the view's elements to the DOM if the container isn't a
 * root node of another view (in that case, the view's elements will be added when
 * the container's parent view is added later).
 *
 * @param {?} tView The `TView' of the `LView` to insert
 * @param {?} lView The view to insert
 * @param {?} lContainer The container into which the view should be inserted
 * @param {?} index Which index in the container to insert the child view into
 * @return {?}
 */
export function insertView(tView, lView, lContainer, index) {
    ngDevMode && assertLView(lView);
    ngDevMode && assertLContainer(lContainer);
    /** @type {?} */
    const indexInContainer = CONTAINER_HEADER_OFFSET + index;
    /** @type {?} */
    const containerLength = lContainer.length;
    if (index > 0) {
        // This is a new view, we need to add it to the children.
        lContainer[indexInContainer - 1][NEXT] = lView;
    }
    if (index < containerLength - CONTAINER_HEADER_OFFSET) {
        lView[NEXT] = lContainer[indexInContainer];
        addToArray(lContainer, CONTAINER_HEADER_OFFSET + index, lView);
    }
    else {
        lContainer.push(lView);
        lView[NEXT] = null;
    }
    lView[PARENT] = lContainer;
    // track views where declaration and insertion points are different
    /** @type {?} */
    const declarationLContainer = lView[DECLARATION_LCONTAINER];
    if (declarationLContainer !== null && lContainer !== declarationLContainer) {
        trackMovedView(declarationLContainer, lView);
    }
    // notify query that a new view has been added
    /** @type {?} */
    const lQueries = lView[QUERIES];
    if (lQueries !== null) {
        lQueries.insertView(tView);
    }
    // Sets the attached flag
    lView[FLAGS] |= 128 /* Attached */;
}
/**
 * Track views created from the declaration container (TemplateRef) and inserted into a
 * different LContainer.
 * @param {?} declarationContainer
 * @param {?} lView
 * @return {?}
 */
function trackMovedView(declarationContainer, lView) {
    ngDevMode && assertDefined(lView, 'LView required');
    ngDevMode && assertLContainer(declarationContainer);
    /** @type {?} */
    const movedViews = declarationContainer[MOVED_VIEWS];
    /** @type {?} */
    const insertedLContainer = (/** @type {?} */ (lView[PARENT]));
    ngDevMode && assertLContainer(insertedLContainer);
    /** @type {?} */
    const insertedComponentLView = (/** @type {?} */ (insertedLContainer[PARENT]))[DECLARATION_COMPONENT_VIEW];
    ngDevMode && assertDefined(insertedComponentLView, 'Missing insertedComponentLView');
    /** @type {?} */
    const insertedComponentIsOnPush = (insertedComponentLView[FLAGS] & 16 /* CheckAlways */) !== 16 /* CheckAlways */;
    if (insertedComponentIsOnPush) {
        // console.log('insertedComponentIsOnPush', insertedComponentIsOnPush);
        /** @type {?} */
        const declaredComponentLView = lView[DECLARATION_COMPONENT_VIEW];
        ngDevMode && assertDefined(declaredComponentLView, 'Missing declaredComponentLView');
        if (declaredComponentLView !== insertedComponentLView) {
            // At this point the declaration-component is not same as insertion-component and we are in
            // on-push mode, this means that this is a transplanted view. Mark the declared lView as
            // having
            // transplanted views so that those views can participate in CD.
            declarationContainer[ACTIVE_INDEX] |= 1 /* HAS_TRANSPLANTED_VIEWS */;
        }
    }
    if (movedViews === null) {
        declarationContainer[MOVED_VIEWS] = [lView];
    }
    else {
        movedViews.push(lView);
    }
}
/**
 * @param {?} declarationContainer
 * @param {?} lView
 * @return {?}
 */
function detachMovedView(declarationContainer, lView) {
    ngDevMode && assertLContainer(declarationContainer);
    ngDevMode && assertDefined(declarationContainer[MOVED_VIEWS], 'A projected view should belong to a non-empty projected views collection');
    /** @type {?} */
    const movedViews = (/** @type {?} */ (declarationContainer[MOVED_VIEWS]));
    /** @type {?} */
    const declaredViewIndex = movedViews.indexOf(lView);
    movedViews.splice(declaredViewIndex, 1);
}
/**
 * Detaches a view from a container.
 *
 * This method removes the view from the container's array of active views. It also
 * removes the view's elements from the DOM.
 *
 * @param {?} lContainer The container from which to detach a view
 * @param {?} removeIndex The index of the view to detach
 * @return {?} Detached LView instance.
 */
export function detachView(lContainer, removeIndex) {
    if (lContainer.length <= CONTAINER_HEADER_OFFSET)
        return;
    /** @type {?} */
    const indexInContainer = CONTAINER_HEADER_OFFSET + removeIndex;
    /** @type {?} */
    const viewToDetach = lContainer[indexInContainer];
    if (viewToDetach) {
        /** @type {?} */
        const declarationLContainer = viewToDetach[DECLARATION_LCONTAINER];
        if (declarationLContainer !== null && declarationLContainer !== lContainer) {
            detachMovedView(declarationLContainer, viewToDetach);
        }
        if (removeIndex > 0) {
            lContainer[indexInContainer - 1][NEXT] = (/** @type {?} */ (viewToDetach[NEXT]));
        }
        /** @type {?} */
        const removedLView = removeFromArray(lContainer, CONTAINER_HEADER_OFFSET + removeIndex);
        addRemoveViewFromContainer(viewToDetach[TVIEW], viewToDetach, false, null);
        // notify query that a view has been removed
        /** @type {?} */
        const lQueries = removedLView[QUERIES];
        if (lQueries !== null) {
            lQueries.detachView(removedLView[TVIEW]);
        }
        viewToDetach[PARENT] = null;
        viewToDetach[NEXT] = null;
        // Unsets the attached flag
        viewToDetach[FLAGS] &= ~128 /* Attached */;
    }
    return viewToDetach;
}
/**
 * Removes a view from a container, i.e. detaches it and then destroys the underlying LView.
 *
 * @param {?} lContainer The container from which to remove a view
 * @param {?} removeIndex The index of the view to remove
 * @return {?}
 */
export function removeView(lContainer, removeIndex) {
    /** @type {?} */
    const detachedView = detachView(lContainer, removeIndex);
    detachedView && destroyLView(detachedView[TVIEW], detachedView);
}
/**
 * A standalone function which destroys an LView,
 * conducting clean up (e.g. removing listeners, calling onDestroys).
 *
 * @param {?} tView The `TView' of the `LView` to be destroyed
 * @param {?} lView The view to be destroyed.
 * @return {?}
 */
export function destroyLView(tView, lView) {
    if (!(lView[FLAGS] & 256 /* Destroyed */)) {
        /** @type {?} */
        const renderer = lView[RENDERER];
        if (isProceduralRenderer(renderer) && renderer.destroyNode) {
            applyView(tView, lView, renderer, 3 /* Destroy */, null, null);
        }
        destroyViewTree(lView);
    }
}
/**
 * Determines which LViewOrLContainer to jump to when traversing back up the
 * tree in destroyViewTree.
 *
 * Normally, the view's parent LView should be checked, but in the case of
 * embedded views, the container (which is the view node's parent, but not the
 * LView's parent) needs to be checked for a possible next property.
 *
 * @param {?} lViewOrLContainer The LViewOrLContainer for which we need a parent state
 * @param {?} rootView The rootView, so we don't propagate too far up the view tree
 * @return {?} The correct parent LViewOrLContainer
 */
export function getParentState(lViewOrLContainer, rootView) {
    /** @type {?} */
    let tNode;
    if (isLView(lViewOrLContainer) && (tNode = lViewOrLContainer[T_HOST]) &&
        tNode.type === 2 /* View */) {
        // if it's an embedded view, the state needs to go up to the container, in case the
        // container has a next
        return getLContainer((/** @type {?} */ (tNode)), lViewOrLContainer);
    }
    else {
        // otherwise, use parent view for containers or component views
        return lViewOrLContainer[PARENT] === rootView ? null : lViewOrLContainer[PARENT];
    }
}
/**
 * Calls onDestroys hooks for all directives and pipes in a given view and then removes all
 * listeners. Listeners are removed as the last step so events delivered in the onDestroys hooks
 * can be propagated to \@Output listeners.
 *
 * @param {?} tView `TView` for the `LView` to clean up.
 * @param {?} lView The LView to clean up
 * @return {?}
 */
function cleanUpView(tView, lView) {
    if (!(lView[FLAGS] & 256 /* Destroyed */)) {
        // Usually the Attached flag is removed when the view is detached from its parent, however
        // if it's a root view, the flag won't be unset hence why we're also removing on destroy.
        lView[FLAGS] &= ~128 /* Attached */;
        // Mark the LView as destroyed *before* executing the onDestroy hooks. An onDestroy hook
        // runs arbitrary user code, which could include its own `viewRef.destroy()` (or similar). If
        // We don't flag the view as destroyed before the hooks, this could lead to an infinite loop.
        // This also aligns with the ViewEngine behavior. It also means that the onDestroy hook is
        // really more of an "afterDestroy" hook if you think about it.
        lView[FLAGS] |= 256 /* Destroyed */;
        executeOnDestroys(tView, lView);
        removeListeners(tView, lView);
        /** @type {?} */
        const hostTNode = lView[T_HOST];
        // For component views only, the local renderer is destroyed as clean up time.
        if (hostTNode && hostTNode.type === 3 /* Element */ &&
            isProceduralRenderer(lView[RENDERER])) {
            ngDevMode && ngDevMode.rendererDestroy++;
            /** @type {?} */
            const component = (/** @type {?} */ (lView[CONTEXT]));
            /** @type {?} */
            const proxies = component && component[REACTIVE_PROPERTIES_INDICATOR] ? component[REACTIVE_PROPERTIES_INDICATOR] : [];
            for (const proxyKey of proxies) {
                if (typeof component[proxyKey] === 'object') {
                    // console.log('is object!!!', component[proxyKey][NOT_LOST_PROXY_INDICATOR]);
                    if (component[proxyKey][NOT_LOST_PROXY_INDICATOR]) {
                        component[proxyKey][REMOVE_PROXY_INDICATOR] = component;
                    }
                }
                Object.defineProperty(component, proxyKey, {
                    set: undefined,
                    get: undefined,
                });
                delete component[proxyKey];
            }
            // console.log('delete proxy', lView[CONTEXT], proxies);
            ((/** @type {?} */ (lView[RENDERER]))).destroy();
        }
        /** @type {?} */
        const declarationContainer = lView[DECLARATION_LCONTAINER];
        // we are dealing with an embedded view that is still inserted into a container
        if (declarationContainer !== null && isLContainer(lView[PARENT])) {
            // and this is a projected view
            if (declarationContainer !== lView[PARENT]) {
                detachMovedView(declarationContainer, lView);
            }
            // For embedded views still attached to a container: remove query result from this view.
            /** @type {?} */
            const lQueries = lView[QUERIES];
            if (lQueries !== null) {
                lQueries.detachView(tView);
            }
        }
    }
}
/**
 * Removes listeners and unsubscribes from output subscriptions
 * @param {?} tView
 * @param {?} lView
 * @return {?}
 */
function removeListeners(tView, lView) {
    /** @type {?} */
    const tCleanup = tView.cleanup;
    if (tCleanup !== null) {
        /** @type {?} */
        const lCleanup = (/** @type {?} */ (lView[CLEANUP]));
        for (let i = 0; i < tCleanup.length - 1; i += 2) {
            if (typeof tCleanup[i] === 'string') {
                // This is a native DOM listener
                /** @type {?} */
                const idxOrTargetGetter = tCleanup[i + 1];
                /** @type {?} */
                const target = typeof idxOrTargetGetter === 'function' ?
                    idxOrTargetGetter(lView) :
                    unwrapRNode(lView[idxOrTargetGetter]);
                /** @type {?} */
                const listener = lCleanup[tCleanup[i + 2]];
                /** @type {?} */
                const useCaptureOrSubIdx = tCleanup[i + 3];
                if (typeof useCaptureOrSubIdx === 'boolean') {
                    // native DOM listener registered with Renderer3
                    target.removeEventListener(tCleanup[i], listener, useCaptureOrSubIdx);
                }
                else {
                    if (useCaptureOrSubIdx >= 0) {
                        // unregister
                        lCleanup[useCaptureOrSubIdx]();
                    }
                    else {
                        // Subscription
                        lCleanup[-useCaptureOrSubIdx].unsubscribe();
                    }
                }
                i += 2;
            }
            else {
                // This is a cleanup function that is grouped with the index of its context
                /** @type {?} */
                const context = lCleanup[tCleanup[i + 1]];
                tCleanup[i].call(context);
            }
        }
        lView[CLEANUP] = null;
    }
}
/**
 * Calls onDestroy hooks for this view
 * @param {?} tView
 * @param {?} lView
 * @return {?}
 */
function executeOnDestroys(tView, lView) {
    /** @type {?} */
    let destroyHooks;
    if (tView != null && (destroyHooks = tView.destroyHooks) != null) {
        for (let i = 0; i < destroyHooks.length; i += 2) {
            /** @type {?} */
            const context = lView[(/** @type {?} */ (destroyHooks[i]))];
            // Only call the destroy hook if the context has been requested.
            if (!(context instanceof NodeInjectorFactory)) {
                ((/** @type {?} */ (destroyHooks[i + 1]))).call(context);
            }
        }
    }
}
/**
 * Returns a native element if a node can be inserted into the given parent.
 *
 * There are two reasons why we may not be able to insert a element immediately.
 * - Projection: When creating a child content element of a component, we have to skip the
 *   insertion because the content of a component will be projected.
 *   `<component><content>delayed due to projection</content></component>`
 * - Parent container is disconnected: This can happen when we are inserting a view into
 *   parent container, which itself is disconnected. For example the parent container is part
 *   of a View which has not be inserted or is made for projection but has not been inserted
 *   into destination.
 * @param {?} tView
 * @param {?} tNode
 * @param {?} currentView
 * @return {?}
 */
function getRenderParent(tView, tNode, currentView) {
    // Skip over element and ICU containers as those are represented by a comment node and
    // can't be used as a render parent.
    /** @type {?} */
    let parentTNode = tNode.parent;
    while (parentTNode != null && (parentTNode.type === 4 /* ElementContainer */ ||
        parentTNode.type === 5 /* IcuContainer */)) {
        tNode = parentTNode;
        parentTNode = tNode.parent;
    }
    // If the parent tNode is null, then we are inserting across views: either into an embedded view
    // or a component view.
    if (parentTNode == null) {
        /** @type {?} */
        const hostTNode = (/** @type {?} */ (currentView[T_HOST]));
        if (hostTNode.type === 2 /* View */) {
            // We are inserting a root element of an embedded view We might delay insertion of children
            // for a given view if it is disconnected. This might happen for 2 main reasons:
            // - view is not inserted into any container(view was created but not inserted yet)
            // - view is inserted into a container but the container itself is not inserted into the DOM
            // (container might be part of projection or child of a view that is not inserted yet).
            // In other words we can insert children of a given view if this view was inserted into a
            // container and the container itself has its render parent determined.
            return getContainerRenderParent((/** @type {?} */ (hostTNode)), currentView);
        }
        else {
            // We are inserting a root element of the component view into the component host element and
            // it should always be eager.
            ngDevMode && assertNodeOfPossibleTypes(hostTNode, 3 /* Element */);
            return currentView[HOST];
        }
    }
    else {
        /** @type {?} */
        const isIcuCase = tNode && tNode.type === 5 /* IcuContainer */;
        // If the parent of this node is an ICU container, then it is represented by comment node and we
        // need to use it as an anchor. If it is projected then it's direct parent node is the renderer.
        if (isIcuCase && tNode.flags & 4 /* isProjected */) {
            return (/** @type {?} */ (getNativeByTNode(tNode, currentView).parentNode));
        }
        ngDevMode && assertNodeType(parentTNode, 3 /* Element */);
        if (parentTNode.flags & 2 /* isComponentHost */) {
            /** @type {?} */
            const tData = tView.data;
            /** @type {?} */
            const tNode = (/** @type {?} */ (tData[parentTNode.index]));
            /** @type {?} */
            const encapsulation = ((/** @type {?} */ (tData[tNode.directiveStart]))).encapsulation;
            // We've got a parent which is an element in the current view. We just need to verify if the
            // parent element is not a component. Component's content nodes are not inserted immediately
            // because they will be projected, and so doing insert at this point would be wasteful.
            // Since the projection would then move it to its final destination. Note that we can't
            // make this assumption when using the Shadow DOM, because the native projection placeholders
            // (<content> or <slot>) have to be in place as elements are being inserted.
            if (encapsulation !== ViewEncapsulation.ShadowDom &&
                encapsulation !== ViewEncapsulation.Native) {
                return null;
            }
        }
        return (/** @type {?} */ (getNativeByTNode(parentTNode, currentView)));
    }
}
/**
 * Inserts a native node before another native node for a given parent using {\@link Renderer3}.
 * This is a utility function that can be used when native nodes were determined - it abstracts an
 * actual renderer being used.
 * @param {?} renderer
 * @param {?} parent
 * @param {?} child
 * @param {?} beforeNode
 * @return {?}
 */
export function nativeInsertBefore(renderer, parent, child, beforeNode) {
    ngDevMode && ngDevMode.rendererInsertBefore++;
    if (isProceduralRenderer(renderer)) {
        renderer.insertBefore(parent, child, beforeNode);
    }
    else {
        parent.insertBefore(child, beforeNode, true);
    }
}
/**
 * @param {?} renderer
 * @param {?} parent
 * @param {?} child
 * @return {?}
 */
function nativeAppendChild(renderer, parent, child) {
    ngDevMode && ngDevMode.rendererAppendChild++;
    ngDevMode && assertDefined(parent, 'parent node must be defined');
    if (isProceduralRenderer(renderer)) {
        renderer.appendChild(parent, child);
    }
    else {
        parent.appendChild(child);
    }
}
/**
 * @param {?} renderer
 * @param {?} parent
 * @param {?} child
 * @param {?} beforeNode
 * @return {?}
 */
function nativeAppendOrInsertBefore(renderer, parent, child, beforeNode) {
    if (beforeNode !== null) {
        nativeInsertBefore(renderer, parent, child, beforeNode);
    }
    else {
        nativeAppendChild(renderer, parent, child);
    }
}
/**
 * Removes a node from the DOM given its native parent.
 * @param {?} renderer
 * @param {?} parent
 * @param {?} child
 * @param {?=} isHostElement
 * @return {?}
 */
function nativeRemoveChild(renderer, parent, child, isHostElement) {
    if (isProceduralRenderer(renderer)) {
        renderer.removeChild(parent, child, isHostElement);
    }
    else {
        parent.removeChild(child);
    }
}
/**
 * Returns a native parent of a given native node.
 * @param {?} renderer
 * @param {?} node
 * @return {?}
 */
export function nativeParentNode(renderer, node) {
    return (/** @type {?} */ ((isProceduralRenderer(renderer) ? renderer.parentNode(node) : node.parentNode)));
}
/**
 * Returns a native sibling of a given native node.
 * @param {?} renderer
 * @param {?} node
 * @return {?}
 */
export function nativeNextSibling(renderer, node) {
    return isProceduralRenderer(renderer) ? renderer.nextSibling(node) : node.nextSibling;
}
/**
 * Finds a native "anchor" node for cases where we can't append a native child directly
 * (`appendChild`) and need to use a reference (anchor) node for the `insertBefore` operation.
 * @param {?} parentTNode
 * @param {?} lView
 * @return {?}
 */
function getNativeAnchorNode(parentTNode, lView) {
    if (parentTNode.type === 2 /* View */) {
        /** @type {?} */
        const lContainer = getLContainer((/** @type {?} */ (parentTNode)), lView);
        if (lContainer === null)
            return null;
        /** @type {?} */
        const index = lContainer.indexOf(lView, CONTAINER_HEADER_OFFSET) - CONTAINER_HEADER_OFFSET;
        return getBeforeNodeForView(index, lContainer);
    }
    else if (parentTNode.type === 4 /* ElementContainer */ ||
        parentTNode.type === 5 /* IcuContainer */) {
        return getNativeByTNode(parentTNode, lView);
    }
    return null;
}
/**
 * Appends the `child` native node (or a collection of nodes) to the `parent`.
 *
 * The element insertion might be delayed {\@link canInsertNativeNode}.
 *
 * @param {?} tView The `TView' to be appended
 * @param {?} lView The current LView
 * @param {?} childEl The native child (or children) that should be appended
 * @param {?} childTNode The TNode of the child element
 * @return {?} Whether or not the child was appended
 */
export function appendChild(tView, lView, childEl, childTNode) {
    /** @type {?} */
    const renderParent = getRenderParent(tView, childTNode, lView);
    if (renderParent != null) {
        /** @type {?} */
        const renderer = lView[RENDERER];
        /** @type {?} */
        const parentTNode = childTNode.parent || (/** @type {?} */ (lView[T_HOST]));
        /** @type {?} */
        const anchorNode = getNativeAnchorNode(parentTNode, lView);
        if (Array.isArray(childEl)) {
            for (let i = 0; i < childEl.length; i++) {
                nativeAppendOrInsertBefore(renderer, renderParent, childEl[i], anchorNode);
            }
        }
        else {
            nativeAppendOrInsertBefore(renderer, renderParent, childEl, anchorNode);
        }
    }
}
/**
 * Returns the first native node for a given LView, starting from the provided TNode.
 *
 * Native nodes are returned in the order in which those appear in the native tree (DOM).
 * @param {?} lView
 * @param {?} tNode
 * @return {?}
 */
function getFirstNativeNode(lView, tNode) {
    if (tNode !== null) {
        ngDevMode && assertNodeOfPossibleTypes(tNode, 3 /* Element */, 0 /* Container */, 4 /* ElementContainer */, 5 /* IcuContainer */, 1 /* Projection */);
        /** @type {?} */
        const tNodeType = tNode.type;
        if (tNodeType === 3 /* Element */) {
            return getNativeByTNode(tNode, lView);
        }
        else if (tNodeType === 0 /* Container */) {
            return getBeforeNodeForView(-1, lView[tNode.index]);
        }
        else if (tNodeType === 4 /* ElementContainer */ || tNodeType === 5 /* IcuContainer */) {
            /** @type {?} */
            const elIcuContainerChild = tNode.child;
            if (elIcuContainerChild !== null) {
                return getFirstNativeNode(lView, elIcuContainerChild);
            }
            else {
                /** @type {?} */
                const rNodeOrLContainer = lView[tNode.index];
                if (isLContainer(rNodeOrLContainer)) {
                    return getBeforeNodeForView(-1, rNodeOrLContainer);
                }
                else {
                    return unwrapRNode(rNodeOrLContainer);
                }
            }
        }
        else {
            /** @type {?} */
            const componentView = lView[DECLARATION_COMPONENT_VIEW];
            /** @type {?} */
            const componentHost = (/** @type {?} */ (componentView[T_HOST]));
            /** @type {?} */
            const parentView = getLViewParent(componentView);
            /** @type {?} */
            const firstProjectedTNode = ((/** @type {?} */ (componentHost.projection)))[(/** @type {?} */ (tNode.projection))];
            if (firstProjectedTNode != null) {
                return getFirstNativeNode((/** @type {?} */ (parentView)), firstProjectedTNode);
            }
            else {
                return getFirstNativeNode(lView, tNode.next);
            }
        }
    }
    return null;
}
/**
 * @param {?} viewIndexInContainer
 * @param {?} lContainer
 * @return {?}
 */
export function getBeforeNodeForView(viewIndexInContainer, lContainer) {
    /** @type {?} */
    const nextViewIndex = CONTAINER_HEADER_OFFSET + viewIndexInContainer + 1;
    if (nextViewIndex < lContainer.length) {
        /** @type {?} */
        const lView = (/** @type {?} */ (lContainer[nextViewIndex]));
        /** @type {?} */
        const firstTNodeOfView = lView[TVIEW].firstChild;
        if (firstTNodeOfView !== null) {
            return getFirstNativeNode(lView, firstTNodeOfView);
        }
    }
    return lContainer[NATIVE];
}
/**
 * Removes a native node itself using a given renderer. To remove the node we are looking up its
 * parent from the native tree as not all platforms / browsers support the equivalent of
 * node.remove().
 *
 * @param {?} renderer A renderer to be used
 * @param {?} rNode The native node that should be removed
 * @param {?=} isHostElement A flag indicating if a node to be removed is a host of a component.
 * @return {?}
 */
export function nativeRemoveNode(renderer, rNode, isHostElement) {
    /** @type {?} */
    const nativeParent = nativeParentNode(renderer, rNode);
    if (nativeParent) {
        nativeRemoveChild(renderer, nativeParent, rNode, isHostElement);
    }
}
/**
 * Performs the operation of `action` on the node. Typically this involves inserting or removing
 * nodes on the LView or projection boundary.
 * @param {?} renderer
 * @param {?} action
 * @param {?} tNode
 * @param {?} lView
 * @param {?} renderParent
 * @param {?} beforeNode
 * @param {?} isProjection
 * @return {?}
 */
function applyNodes(renderer, action, tNode, lView, renderParent, beforeNode, isProjection) {
    while (tNode != null) {
        ngDevMode && assertTNodeForLView(tNode, lView);
        ngDevMode && assertNodeOfPossibleTypes(tNode, 0 /* Container */, 3 /* Element */, 4 /* ElementContainer */, 1 /* Projection */, 1 /* Projection */, 5 /* IcuContainer */);
        /** @type {?} */
        const rawSlotValue = lView[tNode.index];
        /** @type {?} */
        const tNodeType = tNode.type;
        if (isProjection) {
            if (action === 0 /* Create */) {
                rawSlotValue && attachPatchData(unwrapRNode(rawSlotValue), lView);
                tNode.flags |= 4 /* isProjected */;
            }
        }
        if ((tNode.flags & 64 /* isDetached */) !== 64 /* isDetached */) {
            if (tNodeType === 4 /* ElementContainer */ || tNodeType === 5 /* IcuContainer */) {
                applyNodes(renderer, action, tNode.child, lView, renderParent, beforeNode, false);
                applyToElementOrContainer(action, renderer, renderParent, rawSlotValue, beforeNode);
            }
            else if (tNodeType === 1 /* Projection */) {
                applyProjectionRecursive(renderer, action, lView, (/** @type {?} */ (tNode)), renderParent, beforeNode);
            }
            else {
                ngDevMode && assertNodeOfPossibleTypes(tNode, 3 /* Element */, 0 /* Container */);
                applyToElementOrContainer(action, renderer, renderParent, rawSlotValue, beforeNode);
            }
        }
        tNode = isProjection ? tNode.projectionNext : tNode.next;
    }
}
/**
 * `applyView` performs operation on the view as specified in `action` (insert, detach, destroy)
 *
 * Inserting a view without projection or containers at top level is simple. Just iterate over the
 * root nodes of the View, and for each node perform the `action`.
 *
 * Things get more complicated with containers and projections. That is because coming across:
 * - Container: implies that we have to insert/remove/destroy the views of that container as well
 *              which in turn can have their own Containers at the View roots.
 * - Projection: implies that we have to insert/remove/destroy the nodes of the projection. The
 *               complication is that the nodes we are projecting can themselves have Containers
 *               or other Projections.
 *
 * As you can see this is a very recursive problem. Yes recursion is not most efficient but the
 * code is complicated enough that trying to implemented with recursion becomes unmaintainable.
 *
 * @param {?} tView The `TView' which needs to be inserted, detached, destroyed
 * @param {?} lView The LView which needs to be inserted, detached, destroyed.
 * @param {?} renderer Renderer to use
 * @param {?} action action to perform (insert, detach, destroy)
 * @param {?} renderParent parent DOM element for insertion/removal.
 * @param {?} beforeNode Before which node the insertions should happen.
 * @return {?}
 */
function applyView(tView, lView, renderer, action, renderParent, beforeNode) {
    ngDevMode && assertNodeType((/** @type {?} */ (tView.node)), 2 /* View */);
    /** @type {?} */
    const viewRootTNode = (/** @type {?} */ (tView.node)).child;
    applyNodes(renderer, action, viewRootTNode, lView, renderParent, beforeNode, false);
}
/**
 * `applyProjection` performs operation on the projection.
 *
 * Inserting a projection requires us to locate the projected nodes from the parent component. The
 * complication is that those nodes themselves could be re-projected from their parent component.
 *
 * @param {?} tView The `TView` of `LView` which needs to be inserted, detached, destroyed
 * @param {?} lView The `LView` which needs to be inserted, detached, destroyed.
 * @param {?} tProjectionNode node to project
 * @return {?}
 */
export function applyProjection(tView, lView, tProjectionNode) {
    /** @type {?} */
    const renderer = lView[RENDERER];
    /** @type {?} */
    const renderParent = getRenderParent(tView, tProjectionNode, lView);
    /** @type {?} */
    const parentTNode = tProjectionNode.parent || (/** @type {?} */ (lView[T_HOST]));
    /** @type {?} */
    let beforeNode = getNativeAnchorNode(parentTNode, lView);
    applyProjectionRecursive(renderer, 0 /* Create */, lView, tProjectionNode, renderParent, beforeNode);
}
/**
 * `applyProjectionRecursive` performs operation on the projection specified by `action` (insert,
 * detach, destroy)
 *
 * Inserting a projection requires us to locate the projected nodes from the parent component. The
 * complication is that those nodes themselves could be re-projected from their parent component.
 *
 * @param {?} renderer Render to use
 * @param {?} action action to perform (insert, detach, destroy)
 * @param {?} lView The LView which needs to be inserted, detached, destroyed.
 * @param {?} tProjectionNode node to project
 * @param {?} renderParent parent DOM element for insertion/removal.
 * @param {?} beforeNode Before which node the insertions should happen.
 * @return {?}
 */
function applyProjectionRecursive(renderer, action, lView, tProjectionNode, renderParent, beforeNode) {
    /** @type {?} */
    const componentLView = lView[DECLARATION_COMPONENT_VIEW];
    /** @type {?} */
    const componentNode = (/** @type {?} */ (componentLView[T_HOST]));
    ngDevMode &&
        assertEqual(typeof tProjectionNode.projection, 'number', 'expecting projection index');
    /** @type {?} */
    const nodeToProjectOrRNodes = (/** @type {?} */ ((/** @type {?} */ (componentNode.projection))[tProjectionNode.projection]));
    if (Array.isArray(nodeToProjectOrRNodes)) {
        // This should not exist, it is a bit of a hack. When we bootstrap a top level node and we
        // need to support passing projectable nodes, so we cheat and put them in the TNode
        // of the Host TView. (Yes we put instance info at the T Level). We can get away with it
        // because we know that that TView is not shared and therefore it will not be a problem.
        // This should be refactored and cleaned up.
        for (let i = 0; i < nodeToProjectOrRNodes.length; i++) {
            /** @type {?} */
            const rNode = nodeToProjectOrRNodes[i];
            applyToElementOrContainer(action, renderer, renderParent, rNode, beforeNode);
        }
    }
    else {
        /** @type {?} */
        let nodeToProject = nodeToProjectOrRNodes;
        /** @type {?} */
        const projectedComponentLView = (/** @type {?} */ (componentLView[PARENT]));
        applyNodes(renderer, action, nodeToProject, projectedComponentLView, renderParent, beforeNode, true);
    }
}
/**
 * `applyContainer` performs an operation on the container and its views as specified by
 * `action` (insert, detach, destroy)
 *
 * Inserting a Container is complicated by the fact that the container may have Views which
 * themselves have containers or projections.
 *
 * @param {?} renderer Renderer to use
 * @param {?} action action to perform (insert, detach, destroy)
 * @param {?} lContainer The LContainer which needs to be inserted, detached, destroyed.
 * @param {?} renderParent parent DOM element for insertion/removal.
 * @param {?} beforeNode Before which node the insertions should happen.
 * @return {?}
 */
function applyContainer(renderer, action, lContainer, renderParent, beforeNode) {
    ngDevMode && assertLContainer(lContainer);
    /** @type {?} */
    const anchor = lContainer[NATIVE];
    // LContainer has its own before node.
    /** @type {?} */
    const native = unwrapRNode(lContainer);
    // An LContainer can be created dynamically on any node by injecting ViewContainerRef.
    // Asking for a ViewContainerRef on an element will result in a creation of a separate anchor node
    // (comment in the DOM) that will be different from the LContainer's host node. In this particular
    // case we need to execute action on 2 nodes:
    // - container's host node (this is done in the executeActionOnElementOrContainer)
    // - container's host node (this is done here)
    if (anchor !== native) {
        // This is very strange to me (Misko). I would expect that the native is same as anchor. I don't
        // see a reason why they should be different, but they are.
        //
        // If they are we need to process the second anchor as well.
        applyToElementOrContainer(action, renderer, renderParent, anchor, beforeNode);
    }
    for (let i = CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
        /** @type {?} */
        const lView = (/** @type {?} */ (lContainer[i]));
        applyView(lView[TVIEW], lView, renderer, action, renderParent, anchor);
    }
}
/**
 * Writes class/style to element.
 *
 * @param {?} renderer Renderer to use.
 * @param {?} isClassBased `true` if it should be written to `class` (`false` to write to `style`)
 * @param {?} rNode The Node to write to.
 * @param {?} prop Property to write to. This would be the class/style name.
 * @param {?} value Value to write. If `null`/`undefined`/`false` this is considered a remove (set/add
 *        otherwise).
 * @return {?}
 */
export function applyStyling(renderer, isClassBased, rNode, prop, value) {
    /** @type {?} */
    const isProcedural = isProceduralRenderer(renderer);
    if (isClassBased) {
        // We actually want JS true/false here because any truthy value should add the class
        if (!value) {
            ngDevMode && ngDevMode.rendererRemoveClass++;
            if (isProcedural) {
                ((/** @type {?} */ (renderer))).removeClass(rNode, prop);
            }
            else {
                ((/** @type {?} */ (rNode))).classList.remove(prop);
            }
        }
        else {
            ngDevMode && ngDevMode.rendererAddClass++;
            if (isProcedural) {
                ((/** @type {?} */ (renderer))).addClass(rNode, prop);
            }
            else {
                ngDevMode && assertDefined(((/** @type {?} */ (rNode))).classList, 'HTMLElement expected');
                ((/** @type {?} */ (rNode))).classList.add(prop);
            }
        }
    }
    else {
        // TODO(misko): Can't import RendererStyleFlags2.DashCase as it causes imports to be resolved in
        // different order which causes failures. Using direct constant as workaround for now.
        /** @type {?} */
        const flags = prop.indexOf('-') == -1 ? undefined : 2 /* RendererStyleFlags2.DashCase */;
        if (value == null /** || value === undefined */) {
            ngDevMode && ngDevMode.rendererRemoveStyle++;
            if (isProcedural) {
                ((/** @type {?} */ (renderer))).removeStyle(rNode, prop, flags);
            }
            else {
                ((/** @type {?} */ (rNode))).style.removeProperty(prop);
            }
        }
        else {
            ngDevMode && ngDevMode.rendererSetStyle++;
            if (isProcedural) {
                ((/** @type {?} */ (renderer))).setStyle(rNode, prop, value, flags);
            }
            else {
                ngDevMode && assertDefined(((/** @type {?} */ (rNode))).style, 'HTMLElement expected');
                ((/** @type {?} */ (rNode))).style.setProperty(prop, value);
            }
        }
    }
}
/**
 * Write `cssText` to `RElement`.
 *
 * This function does direct write without any reconciliation. Used for writing initial values, so
 * that static styling values do not pull in the style parser.
 *
 * @param {?} renderer Renderer to use
 * @param {?} element The element which needs to be updated.
 * @param {?} newValue The new class list to write.
 * @return {?}
 */
export function writeDirectStyle(renderer, element, newValue) {
    ngDevMode && assertString(newValue, '\'newValue\' should be a string');
    if (isProceduralRenderer(renderer)) {
        renderer.setAttribute(element, 'style', newValue);
    }
    else {
        ((/** @type {?} */ (element))).style.cssText = newValue;
    }
    ngDevMode && ngDevMode.rendererSetStyle++;
}
/**
 * Write `className` to `RElement`.
 *
 * This function does direct write without any reconciliation. Used for writing initial values, so
 * that static styling values do not pull in the style parser.
 *
 * @param {?} renderer Renderer to use
 * @param {?} element The element which needs to be updated.
 * @param {?} newValue The new class list to write.
 * @return {?}
 */
export function writeDirectClass(renderer, element, newValue) {
    ngDevMode && assertString(newValue, '\'newValue\' should be a string');
    if (isProceduralRenderer(renderer)) {
        if (newValue === '') {
            // There are tests in `google3` which expect `element.getAttribute('class')` to be `null`.
            renderer.removeAttribute(element, 'class');
        }
        else {
            renderer.setAttribute(element, 'class', newValue);
        }
    }
    else {
        element.className = newValue;
    }
    ngDevMode && ngDevMode.rendererSetClassName++;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZV9tYW5pcHVsYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL25vZGVfbWFuaXB1bGF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVNBLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxVQUFVLEVBQUUsZUFBZSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDaEUsT0FBTyxFQUFDLGFBQWEsRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3ZGLE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDNUUsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3BELE9BQU8sRUFBQyxZQUFZLEVBQW1CLHVCQUF1QixFQUFjLFdBQVcsRUFBRSxNQUFNLEVBQUUsNkJBQTZCLElBQUksT0FBTyxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFFekssT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDMUQsT0FBTyxFQUF5RSw2QkFBNkIsSUFBSSxPQUFPLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNuSixPQUFPLEVBQUMsNkJBQTZCLElBQUksT0FBTyxFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFDakYsT0FBTyxFQUF5RCxvQkFBb0IsRUFBRSw2QkFBNkIsSUFBSSxPQUFPLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUM3SixPQUFPLEVBQUMsWUFBWSxFQUFFLE9BQU8sRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQy9ELE9BQU8sRUFDTCxVQUFVLEVBQ1YsT0FBTyxFQUNQLDBCQUEwQixFQUMxQixzQkFBc0IsRUFDdEIsS0FBSyxFQUNM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QUFFLEVBQUU7WUFDbkIsMEZBQTBGO1lBQzFGLFFBQVEsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQzVDO2FBQU07WUFDTCxRQUFRLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDbkQ7S0FDRjtTQUFNO1FBQ0wsT0FBTyxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7S0FDOUI7SUFDRCxTQUFTLElBQUksU0FBUyxDQUFDLG9CQUFvQixFQUFFLENBQUM7QUFDaEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtSZW5kZXJlcjJ9IGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0IHtWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnLi4vbWV0YWRhdGEvdmlldyc7XG5pbXBvcnQge2FkZFRvQXJyYXksIHJlbW92ZUZyb21BcnJheX0gZnJvbSAnLi4vdXRpbC9hcnJheV91dGlscyc7XG5pbXBvcnQge2Fzc2VydERlZmluZWQsIGFzc2VydERvbU5vZGUsIGFzc2VydEVxdWFsLCBhc3NlcnRTdHJpbmd9IGZyb20gJy4uL3V0aWwvYXNzZXJ0JztcbmltcG9ydCB7YXNzZXJ0TENvbnRhaW5lciwgYXNzZXJ0TFZpZXcsIGFzc2VydFROb2RlRm9yTFZpZXd9IGZyb20gJy4vYXNzZXJ0JztcbmltcG9ydCB7YXR0YWNoUGF0Y2hEYXRhfSBmcm9tICcuL2NvbnRleHRfZGlzY292ZXJ5JztcbmltcG9ydCB7QUNUSVZFX0lOREVYLCBBY3RpdmVJbmRleEZsYWcsIENPTlRBSU5FUl9IRUFERVJfT0ZGU0VULCBMQ29udGFpbmVyLCBNT1ZFRF9WSUVXUywgTkFUSVZFLCB1bnVzZWRWYWx1ZUV4cG9ydFRvUGxhY2F0ZUFqZCBhcyB1bnVzZWQxfSBmcm9tICcuL2ludGVyZmFjZXMvY29udGFpbmVyJztcbmltcG9ydCB7Q29tcG9uZW50RGVmfSBmcm9tICcuL2ludGVyZmFjZXMvZGVmaW5pdGlvbic7XG5pbXBvcnQge05vZGVJbmplY3RvckZhY3Rvcnl9IGZyb20gJy4vaW50ZXJmYWNlcy9pbmplY3Rvcic7XG5pbXBvcnQge1RFbGVtZW50Tm9kZSwgVE5vZGUsIFROb2RlRmxhZ3MsIFROb2RlVHlwZSwgVFByb2plY3Rpb25Ob2RlLCBUVmlld05vZGUsIHVudXNlZFZhbHVlRXhwb3J0VG9QbGFjYXRlQWpkIGFzIHVudXNlZDJ9IGZyb20gJy4vaW50ZXJmYWNlcy9ub2RlJztcbmltcG9ydCB7dW51c2VkVmFsdWVFeHBvcnRUb1BsYWNhdGVBamQgYXMgdW51c2VkM30gZnJvbSAnLi9pbnRlcmZhY2VzL3Byb2plY3Rpb24nO1xuaW1wb3J0IHtQcm9jZWR1cmFsUmVuZGVyZXIzLCBSRWxlbWVudCwgUk5vZGUsIFJUZXh0LCBSZW5kZXJlcjMsIGlzUHJvY2VkdXJhbFJlbmRlcmVyLCB1bnVzZWRWYWx1ZUV4cG9ydFRvUGxhY2F0ZUFqZCBhcyB1bnVzZWQ0fSBmcm9tICcuL2ludGVyZmFjZXMvcmVuZGVyZXInO1xuaW1wb3J0IHtpc0xDb250YWluZXIsIGlzTFZpZXd9IGZyb20gJy4vaW50ZXJmYWNlcy90eXBlX2NoZWNrcyc7XG5pbXBvcnQge1xuICBDSElMRF9IRUFELFxuICBDTEVBTlVQLFxuICBERUNMQVJBVElPTl9DT01QT05FTlRfVklFVyxcbiAgREVDTEFSQVRJT05fTENPTlRBSU5FUixcbiAgRkxBR1MsXG4gIEhPU1QsXG4gIEhvb2tEYXRhLFxuICBMVmlldyxcbiAgTFZpZXdGbGFncyxcbiAgTkVYVCxcbiAgUEFSRU5ULFxuICBRVUVSSUVTLFxuICBSRU5ERVJFUixcbiAgVFZJRVcsXG4gIFRWaWV3LFxuICBUX0hPU1QsXG4gIHVudXNlZFZhbHVlRXhwb3J0VG9QbGFjYXRlQWpkIGFzIHVudXNlZDUsXG4gIENPTlRFWFRcbn0gZnJvbSAnLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHthc3NlcnROb2RlT2ZQb3NzaWJsZVR5cGVzLCBhc3NlcnROb2RlVHlwZX0gZnJvbSAnLi9ub2RlX2Fzc2VydCc7XG5pbXBvcnQge2dldExWaWV3UGFyZW50fSBmcm9tICcuL3V0aWwvdmlld190cmF2ZXJzYWxfdXRpbHMnO1xuaW1wb3J0IHtnZXROYXRpdmVCeVROb2RlLCB1bndyYXBSTm9kZX0gZnJvbSAnLi91dGlsL3ZpZXdfdXRpbHMnO1xuaW1wb3J0IHtcbiAgTk9UX0xPU1RfUFJPWFlfSU5ESUNBVE9SLFxuICBSRUFDVElWRV9QUk9QRVJUSUVTX0lORElDQVRPUixcbiAgUkVNT1ZFX1BST1hZX0lORElDQVRPUlxufSBmcm9tIFwiQGFuZ3VsYXIvY29yZS9zcmMvcmVuZGVyMy9pbnRlcmZhY2VzL2NvbnRleHRcIjtcblxuY29uc3QgdW51c2VkVmFsdWVUb1BsYWNhdGVBamQgPSB1bnVzZWQxICsgdW51c2VkMiArIHVudXNlZDMgKyB1bnVzZWQ0ICsgdW51c2VkNTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldExDb250YWluZXIodE5vZGU6IFRWaWV3Tm9kZSwgZW1iZWRkZWRWaWV3OiBMVmlldyk6IExDb250YWluZXJ8bnVsbCB7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRMVmlldyhlbWJlZGRlZFZpZXcpO1xuICBjb25zdCBjb250YWluZXIgPSBlbWJlZGRlZFZpZXdbUEFSRU5UXSBhcyBMQ29udGFpbmVyO1xuICBpZiAodE5vZGUuaW5kZXggPT09IC0xKSB7XG4gICAgLy8gVGhpcyBpcyBhIGR5bmFtaWNhbGx5IGNyZWF0ZWQgdmlldyBpbnNpZGUgYSBkeW5hbWljIGNvbnRhaW5lci5cbiAgICAvLyBUaGUgcGFyZW50IGlzbid0IGFuIExDb250YWluZXIgaWYgdGhlIGVtYmVkZGVkIHZpZXcgaGFzbid0IGJlZW4gYXR0YWNoZWQgeWV0LlxuICAgIHJldHVybiBpc0xDb250YWluZXIoY29udGFpbmVyKSA/IGNvbnRhaW5lciA6IG51bGw7XG4gIH0gZWxzZSB7XG4gICAgbmdEZXZNb2RlICYmIGFzc2VydExDb250YWluZXIoY29udGFpbmVyKTtcbiAgICAvLyBUaGlzIGlzIGEgaW5saW5lIHZpZXcgbm9kZSAoZS5nLiBlbWJlZGRlZFZpZXdTdGFydClcbiAgICByZXR1cm4gY29udGFpbmVyO1xuICB9XG59XG5cblxuLyoqXG4gKiBSZXRyaWV2ZXMgcmVuZGVyIHBhcmVudCBmb3IgYSBnaXZlbiB2aWV3LlxuICogTWlnaHQgYmUgbnVsbCBpZiBhIHZpZXcgaXMgbm90IHlldCBhdHRhY2hlZCB0byBhbnkgY29udGFpbmVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29udGFpbmVyUmVuZGVyUGFyZW50KHRWaWV3Tm9kZTogVFZpZXdOb2RlLCB2aWV3OiBMVmlldyk6IFJFbGVtZW50fG51bGwge1xuICBjb25zdCBjb250YWluZXIgPSBnZXRMQ29udGFpbmVyKHRWaWV3Tm9kZSwgdmlldyk7XG4gIHJldHVybiBjb250YWluZXIgPyBuYXRpdmVQYXJlbnROb2RlKHZpZXdbUkVOREVSRVJdLCBjb250YWluZXJbTkFUSVZFXSkgOiBudWxsO1xufVxuXG5jb25zdCBlbnVtIFdhbGtUTm9kZVRyZWVBY3Rpb24ge1xuICAvKiogbm9kZSBjcmVhdGUgaW4gdGhlIG5hdGl2ZSBlbnZpcm9ubWVudC4gUnVuIG9uIGluaXRpYWwgY3JlYXRpb24uICovXG4gIENyZWF0ZSA9IDAsXG5cbiAgLyoqXG4gICAqIG5vZGUgaW5zZXJ0IGluIHRoZSBuYXRpdmUgZW52aXJvbm1lbnQuXG4gICAqIFJ1biB3aGVuIGV4aXN0aW5nIG5vZGUgaGFzIGJlZW4gZGV0YWNoZWQgYW5kIG5lZWRzIHRvIGJlIHJlLWF0dGFjaGVkLlxuICAgKi9cbiAgSW5zZXJ0ID0gMSxcblxuICAvKiogbm9kZSBkZXRhY2ggZnJvbSB0aGUgbmF0aXZlIGVudmlyb25tZW50ICovXG4gIERldGFjaCA9IDIsXG5cbiAgLyoqIG5vZGUgZGVzdHJ1Y3Rpb24gdXNpbmcgdGhlIHJlbmRlcmVyJ3MgQVBJICovXG4gIERlc3Ryb3kgPSAzLFxufVxuXG5cblxuLyoqXG4gKiBOT1RFOiBmb3IgcGVyZm9ybWFuY2UgcmVhc29ucywgdGhlIHBvc3NpYmxlIGFjdGlvbnMgYXJlIGlubGluZWQgd2l0aGluIHRoZSBmdW5jdGlvbiBpbnN0ZWFkIG9mXG4gKiBiZWluZyBwYXNzZWQgYXMgYW4gYXJndW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGFwcGx5VG9FbGVtZW50T3JDb250YWluZXIoXG4gICAgYWN0aW9uOiBXYWxrVE5vZGVUcmVlQWN0aW9uLCByZW5kZXJlcjogUmVuZGVyZXIzLCBwYXJlbnQ6IFJFbGVtZW50IHwgbnVsbCxcbiAgICBsTm9kZVRvSGFuZGxlOiBSTm9kZSB8IExDb250YWluZXIgfCBMVmlldywgYmVmb3JlTm9kZT86IFJOb2RlIHwgbnVsbCkge1xuICAvLyBJZiB0aGlzIHNsb3Qgd2FzIGFsbG9jYXRlZCBmb3IgYSB0ZXh0IG5vZGUgZHluYW1pY2FsbHkgY3JlYXRlZCBieSBpMThuLCB0aGUgdGV4dCBub2RlIGl0c2VsZlxuICAvLyB3b24ndCBiZSBjcmVhdGVkIHVudGlsIGkxOG5BcHBseSgpIGluIHRoZSB1cGRhdGUgYmxvY2ssIHNvIHRoaXMgbm9kZSBzaG91bGQgYmUgc2tpcHBlZC5cbiAgLy8gRm9yIG1vcmUgaW5mbywgc2VlIFwiSUNVIGV4cHJlc3Npb25zIHNob3VsZCB3b3JrIGluc2lkZSBhbiBuZ1RlbXBsYXRlT3V0bGV0IGluc2lkZSBhbiBuZ0ZvclwiXG4gIC8vIGluIGBpMThuX3NwZWMudHNgLlxuICBpZiAobE5vZGVUb0hhbmRsZSAhPSBudWxsKSB7XG4gICAgbGV0IGxDb250YWluZXI6IExDb250YWluZXJ8dW5kZWZpbmVkO1xuICAgIGxldCBpc0NvbXBvbmVudCA9IGZhbHNlO1xuICAgIC8vIFdlIGFyZSBleHBlY3RpbmcgYW4gUk5vZGUsIGJ1dCBpbiB0aGUgY2FzZSBvZiBhIGNvbXBvbmVudCBvciBMQ29udGFpbmVyIHRoZSBgUk5vZGVgIGlzXG4gICAgLy8gd3JhcHBlZCBpbiBhbiBhcnJheSB3aGljaCBuZWVkcyB0byBiZSB1bndyYXBwZWQuIFdlIG5lZWQgdG8ga25vdyBpZiBpdCBpcyBhIGNvbXBvbmVudCBhbmQgaWZcbiAgICAvLyBpdCBoYXMgTENvbnRhaW5lciBzbyB0aGF0IHdlIGNhbiBwcm9jZXNzIGFsbCBvZiB0aG9zZSBjYXNlcyBhcHByb3ByaWF0ZWx5LlxuICAgIGlmIChpc0xDb250YWluZXIobE5vZGVUb0hhbmRsZSkpIHtcbiAgICAgIGxDb250YWluZXIgPSBsTm9kZVRvSGFuZGxlO1xuICAgIH0gZWxzZSBpZiAoaXNMVmlldyhsTm9kZVRvSGFuZGxlKSkge1xuICAgICAgaXNDb21wb25lbnQgPSB0cnVlO1xuICAgICAgbmdEZXZNb2RlICYmIGFzc2VydERlZmluZWQobE5vZGVUb0hhbmRsZVtIT1NUXSwgJ0hPU1QgbXVzdCBiZSBkZWZpbmVkIGZvciBhIGNvbXBvbmVudCBMVmlldycpO1xuICAgICAgbE5vZGVUb0hhbmRsZSA9IGxOb2RlVG9IYW5kbGVbSE9TVF0gITtcbiAgICB9XG4gICAgY29uc3Qgck5vZGU6IFJOb2RlID0gdW53cmFwUk5vZGUobE5vZGVUb0hhbmRsZSk7XG4gICAgbmdEZXZNb2RlICYmICFpc1Byb2NlZHVyYWxSZW5kZXJlcihyZW5kZXJlcikgJiYgYXNzZXJ0RG9tTm9kZShyTm9kZSk7XG5cbiAgICBpZiAoYWN0aW9uID09PSBXYWxrVE5vZGVUcmVlQWN0aW9uLkNyZWF0ZSAmJiBwYXJlbnQgIT09IG51bGwpIHtcbiAgICAgIGlmIChiZWZvcmVOb2RlID09IG51bGwpIHtcbiAgICAgICAgbmF0aXZlQXBwZW5kQ2hpbGQocmVuZGVyZXIsIHBhcmVudCwgck5vZGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmF0aXZlSW5zZXJ0QmVmb3JlKHJlbmRlcmVyLCBwYXJlbnQsIHJOb2RlLCBiZWZvcmVOb2RlIHx8IG51bGwpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSBXYWxrVE5vZGVUcmVlQWN0aW9uLkluc2VydCAmJiBwYXJlbnQgIT09IG51bGwpIHtcbiAgICAgIG5hdGl2ZUluc2VydEJlZm9yZShyZW5kZXJlciwgcGFyZW50LCByTm9kZSwgYmVmb3JlTm9kZSB8fCBudWxsKTtcbiAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gV2Fsa1ROb2RlVHJlZUFjdGlvbi5EZXRhY2gpIHtcbiAgICAgIG5hdGl2ZVJlbW92ZU5vZGUocmVuZGVyZXIsIHJOb2RlLCBpc0NvbXBvbmVudCk7XG4gICAgfSBlbHNlIGlmIChhY3Rpb24gPT09IFdhbGtUTm9kZVRyZWVBY3Rpb24uRGVzdHJveSkge1xuICAgICAgbmdEZXZNb2RlICYmIG5nRGV2TW9kZS5yZW5kZXJlckRlc3Ryb3lOb2RlKys7XG4gICAgICAocmVuZGVyZXIgYXMgUHJvY2VkdXJhbFJlbmRlcmVyMykuZGVzdHJveU5vZGUgIShyTm9kZSk7XG4gICAgfVxuICAgIGlmIChsQ29udGFpbmVyICE9IG51bGwpIHtcbiAgICAgIGFwcGx5Q29udGFpbmVyKHJlbmRlcmVyLCBhY3Rpb24sIGxDb250YWluZXIsIHBhcmVudCwgYmVmb3JlTm9kZSk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUZXh0Tm9kZSh2YWx1ZTogc3RyaW5nLCByZW5kZXJlcjogUmVuZGVyZXIzKTogUlRleHQge1xuICBuZ0Rldk1vZGUgJiYgbmdEZXZNb2RlLnJlbmRlcmVyQ3JlYXRlVGV4dE5vZGUrKztcbiAgbmdEZXZNb2RlICYmIG5nRGV2TW9kZS5yZW5kZXJlclNldFRleHQrKztcbiAgcmV0dXJuIGlzUHJvY2VkdXJhbFJlbmRlcmVyKHJlbmRlcmVyKSA/IHJlbmRlcmVyLmNyZWF0ZVRleHQodmFsdWUpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlcmVyLmNyZWF0ZVRleHROb2RlKHZhbHVlKTtcbn1cblxuLyoqXG4gKiBBZGRzIG9yIHJlbW92ZXMgYWxsIERPTSBlbGVtZW50cyBhc3NvY2lhdGVkIHdpdGggYSB2aWV3LlxuICpcbiAqIEJlY2F1c2Ugc29tZSByb290IG5vZGVzIG9mIHRoZSB2aWV3IG1heSBiZSBjb250YWluZXJzLCB3ZSBzb21ldGltZXMgbmVlZFxuICogdG8gcHJvcGFnYXRlIGRlZXBseSBpbnRvIHRoZSBuZXN0ZWQgY29udGFpbmVycyB0byByZW1vdmUgYWxsIGVsZW1lbnRzIGluIHRoZVxuICogdmlld3MgYmVuZWF0aCBpdC5cbiAqXG4gKiBAcGFyYW0gdFZpZXcgVGhlIGBUVmlldycgb2YgdGhlIGBMVmlld2AgZnJvbSB3aGljaCBlbGVtZW50cyBzaG91bGQgYmUgYWRkZWQgb3IgcmVtb3ZlZFxuICogQHBhcmFtIGxWaWV3IFRoZSB2aWV3IGZyb20gd2hpY2ggZWxlbWVudHMgc2hvdWxkIGJlIGFkZGVkIG9yIHJlbW92ZWRcbiAqIEBwYXJhbSBpbnNlcnRNb2RlIFdoZXRoZXIgb3Igbm90IGVsZW1lbnRzIHNob3VsZCBiZSBhZGRlZCAoaWYgZmFsc2UsIHJlbW92aW5nKVxuICogQHBhcmFtIGJlZm9yZU5vZGUgVGhlIG5vZGUgYmVmb3JlIHdoaWNoIGVsZW1lbnRzIHNob3VsZCBiZSBhZGRlZCwgaWYgaW5zZXJ0IG1vZGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZFJlbW92ZVZpZXdGcm9tQ29udGFpbmVyKFxuICAgIHRWaWV3OiBUVmlldywgbFZpZXc6IExWaWV3LCBpbnNlcnRNb2RlOiB0cnVlLCBiZWZvcmVOb2RlOiBSTm9kZSB8IG51bGwpOiB2b2lkO1xuZXhwb3J0IGZ1bmN0aW9uIGFkZFJlbW92ZVZpZXdGcm9tQ29udGFpbmVyKFxuICAgIHRWaWV3OiBUVmlldywgbFZpZXc6IExWaWV3LCBpbnNlcnRNb2RlOiBmYWxzZSwgYmVmb3JlTm9kZTogbnVsbCk6IHZvaWQ7XG5leHBvcnQgZnVuY3Rpb24gYWRkUmVtb3ZlVmlld0Zyb21Db250YWluZXIoXG4gICAgdFZpZXc6IFRWaWV3LCBsVmlldzogTFZpZXcsIGluc2VydE1vZGU6IGJvb2xlYW4sIGJlZm9yZU5vZGU6IFJOb2RlIHwgbnVsbCk6IHZvaWQge1xuICBjb25zdCByZW5kZXJQYXJlbnQgPSBnZXRDb250YWluZXJSZW5kZXJQYXJlbnQodFZpZXcubm9kZSBhcyBUVmlld05vZGUsIGxWaWV3KTtcbiAgbmdEZXZNb2RlICYmIGFzc2VydE5vZGVUeXBlKHRWaWV3Lm5vZGUgYXMgVE5vZGUsIFROb2RlVHlwZS5WaWV3KTtcbiAgaWYgKHJlbmRlclBhcmVudCkge1xuICAgIGNvbnN0IHJlbmRlcmVyID0gbFZpZXdbUkVOREVSRVJdO1xuICAgIGNvbnN0IGFjdGlvbiA9IGluc2VydE1vZGUgPyBXYWxrVE5vZGVUcmVlQWN0aW9uLkluc2VydCA6IFdhbGtUTm9kZVRyZWVBY3Rpb24uRGV0YWNoO1xuICAgIGFwcGx5Vmlldyh0VmlldywgbFZpZXcsIHJlbmRlcmVyLCBhY3Rpb24sIHJlbmRlclBhcmVudCwgYmVmb3JlTm9kZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBEZXRhY2ggYSBgTFZpZXdgIGZyb20gdGhlIERPTSBieSBkZXRhY2hpbmcgaXRzIG5vZGVzLlxuICpcbiAqIEBwYXJhbSB0VmlldyBUaGUgYFRWaWV3JyBvZiB0aGUgYExWaWV3YCB0byBiZSBkZXRhY2hlZFxuICogQHBhcmFtIGxWaWV3IHRoZSBgTFZpZXdgIHRvIGJlIGRldGFjaGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyRGV0YWNoVmlldyh0VmlldzogVFZpZXcsIGxWaWV3OiBMVmlldykge1xuICBhcHBseVZpZXcodFZpZXcsIGxWaWV3LCBsVmlld1tSRU5ERVJFUl0sIFdhbGtUTm9kZVRyZWVBY3Rpb24uRGV0YWNoLCBudWxsLCBudWxsKTtcbn1cblxuLyoqXG4gKiBUcmF2ZXJzZXMgZG93biBhbmQgdXAgdGhlIHRyZWUgb2Ygdmlld3MgYW5kIGNvbnRhaW5lcnMgdG8gcmVtb3ZlIGxpc3RlbmVycyBhbmRcbiAqIGNhbGwgb25EZXN0cm95IGNhbGxiYWNrcy5cbiAqXG4gKiBOb3RlczpcbiAqICAtIEJlY2F1c2UgaXQncyB1c2VkIGZvciBvbkRlc3Ryb3kgY2FsbHMsIGl0IG5lZWRzIHRvIGJlIGJvdHRvbS11cC5cbiAqICAtIE11c3QgcHJvY2VzcyBjb250YWluZXJzIGluc3RlYWQgb2YgdGhlaXIgdmlld3MgdG8gYXZvaWQgc3BsaWNpbmdcbiAqICB3aGVuIHZpZXdzIGFyZSBkZXN0cm95ZWQgYW5kIHJlLWFkZGVkLlxuICogIC0gVXNpbmcgYSB3aGlsZSBsb29wIGJlY2F1c2UgaXQncyBmYXN0ZXIgdGhhbiByZWN1cnNpb25cbiAqICAtIERlc3Ryb3kgb25seSBjYWxsZWQgb24gbW92ZW1lbnQgdG8gc2libGluZyBvciBtb3ZlbWVudCB0byBwYXJlbnQgKGxhdGVyYWxseSBvciB1cClcbiAqXG4gKiAgQHBhcmFtIHJvb3RWaWV3IFRoZSB2aWV3IHRvIGRlc3Ryb3lcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlc3Ryb3lWaWV3VHJlZShyb290VmlldzogTFZpZXcpOiB2b2lkIHtcbiAgLy8gSWYgdGhlIHZpZXcgaGFzIG5vIGNoaWxkcmVuLCB3ZSBjYW4gY2xlYW4gaXQgdXAgYW5kIHJldHVybiBlYXJseS5cbiAgbGV0IGxWaWV3T3JMQ29udGFpbmVyID0gcm9vdFZpZXdbQ0hJTERfSEVBRF07XG4gIGlmICghbFZpZXdPckxDb250YWluZXIpIHtcbiAgICByZXR1cm4gY2xlYW5VcFZpZXcocm9vdFZpZXdbVFZJRVddLCByb290Vmlldyk7XG4gIH1cblxuICB3aGlsZSAobFZpZXdPckxDb250YWluZXIpIHtcbiAgICBsZXQgbmV4dDogTFZpZXd8TENvbnRhaW5lcnxudWxsID0gbnVsbDtcblxuICAgIGlmIChpc0xWaWV3KGxWaWV3T3JMQ29udGFpbmVyKSkge1xuICAgICAgLy8gSWYgTFZpZXcsIHRyYXZlcnNlIGRvd24gdG8gY2hpbGQuXG4gICAgICBuZXh0ID0gbFZpZXdPckxDb250YWluZXJbQ0hJTERfSEVBRF07XG4gICAgfSBlbHNlIHtcbiAgICAgIG5nRGV2TW9kZSAmJiBhc3NlcnRMQ29udGFpbmVyKGxWaWV3T3JMQ29udGFpbmVyKTtcbiAgICAgIC8vIElmIGNvbnRhaW5lciwgdHJhdmVyc2UgZG93biB0byBpdHMgZmlyc3QgTFZpZXcuXG4gICAgICBjb25zdCBmaXJzdFZpZXc6IExWaWV3fHVuZGVmaW5lZCA9IGxWaWV3T3JMQ29udGFpbmVyW0NPTlRBSU5FUl9IRUFERVJfT0ZGU0VUXTtcbiAgICAgIGlmIChmaXJzdFZpZXcpIG5leHQgPSBmaXJzdFZpZXc7XG4gICAgfVxuXG4gICAgaWYgKCFuZXh0KSB7XG4gICAgICAvLyBPbmx5IGNsZWFuIHVwIHZpZXcgd2hlbiBtb3ZpbmcgdG8gdGhlIHNpZGUgb3IgdXAsIGFzIGRlc3Ryb3kgaG9va3NcbiAgICAgIC8vIHNob3VsZCBiZSBjYWxsZWQgaW4gb3JkZXIgZnJvbSB0aGUgYm90dG9tIHVwLlxuICAgICAgd2hpbGUgKGxWaWV3T3JMQ29udGFpbmVyICYmICFsVmlld09yTENvbnRhaW5lciAhW05FWFRdICYmIGxWaWV3T3JMQ29udGFpbmVyICE9PSByb290Vmlldykge1xuICAgICAgICBpc0xWaWV3KGxWaWV3T3JMQ29udGFpbmVyKSAmJiBjbGVhblVwVmlldyhsVmlld09yTENvbnRhaW5lcltUVklFV10sIGxWaWV3T3JMQ29udGFpbmVyKTtcbiAgICAgICAgbFZpZXdPckxDb250YWluZXIgPSBnZXRQYXJlbnRTdGF0ZShsVmlld09yTENvbnRhaW5lciwgcm9vdFZpZXcpO1xuICAgICAgfVxuICAgICAgaWYgKGxWaWV3T3JMQ29udGFpbmVyID09PSBudWxsKSBsVmlld09yTENvbnRhaW5lciA9IHJvb3RWaWV3O1xuICAgICAgaXNMVmlldyhsVmlld09yTENvbnRhaW5lcikgJiYgY2xlYW5VcFZpZXcobFZpZXdPckxDb250YWluZXJbVFZJRVddLCBsVmlld09yTENvbnRhaW5lcik7XG4gICAgICBuZXh0ID0gbFZpZXdPckxDb250YWluZXIgJiYgbFZpZXdPckxDb250YWluZXIgIVtORVhUXTtcbiAgICB9XG4gICAgbFZpZXdPckxDb250YWluZXIgPSBuZXh0O1xuICB9XG59XG5cbi8qKlxuICogSW5zZXJ0cyBhIHZpZXcgaW50byBhIGNvbnRhaW5lci5cbiAqXG4gKiBUaGlzIGFkZHMgdGhlIHZpZXcgdG8gdGhlIGNvbnRhaW5lcidzIGFycmF5IG9mIGFjdGl2ZSB2aWV3cyBpbiB0aGUgY29ycmVjdFxuICogcG9zaXRpb24uIEl0IGFsc28gYWRkcyB0aGUgdmlldydzIGVsZW1lbnRzIHRvIHRoZSBET00gaWYgdGhlIGNvbnRhaW5lciBpc24ndCBhXG4gKiByb290IG5vZGUgb2YgYW5vdGhlciB2aWV3IChpbiB0aGF0IGNhc2UsIHRoZSB2aWV3J3MgZWxlbWVudHMgd2lsbCBiZSBhZGRlZCB3aGVuXG4gKiB0aGUgY29udGFpbmVyJ3MgcGFyZW50IHZpZXcgaXMgYWRkZWQgbGF0ZXIpLlxuICpcbiAqIEBwYXJhbSB0VmlldyBUaGUgYFRWaWV3JyBvZiB0aGUgYExWaWV3YCB0byBpbnNlcnRcbiAqIEBwYXJhbSBsVmlldyBUaGUgdmlldyB0byBpbnNlcnRcbiAqIEBwYXJhbSBsQ29udGFpbmVyIFRoZSBjb250YWluZXIgaW50byB3aGljaCB0aGUgdmlldyBzaG91bGQgYmUgaW5zZXJ0ZWRcbiAqIEBwYXJhbSBpbmRleCBXaGljaCBpbmRleCBpbiB0aGUgY29udGFpbmVyIHRvIGluc2VydCB0aGUgY2hpbGQgdmlldyBpbnRvXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnNlcnRWaWV3KHRWaWV3OiBUVmlldywgbFZpZXc6IExWaWV3LCBsQ29udGFpbmVyOiBMQ29udGFpbmVyLCBpbmRleDogbnVtYmVyKSB7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRMVmlldyhsVmlldyk7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRMQ29udGFpbmVyKGxDb250YWluZXIpO1xuICBjb25zdCBpbmRleEluQ29udGFpbmVyID0gQ09OVEFJTkVSX0hFQURFUl9PRkZTRVQgKyBpbmRleDtcbiAgY29uc3QgY29udGFpbmVyTGVuZ3RoID0gbENvbnRhaW5lci5sZW5ndGg7XG5cbiAgaWYgKGluZGV4ID4gMCkge1xuICAgIC8vIFRoaXMgaXMgYSBuZXcgdmlldywgd2UgbmVlZCB0byBhZGQgaXQgdG8gdGhlIGNoaWxkcmVuLlxuICAgIGxDb250YWluZXJbaW5kZXhJbkNvbnRhaW5lciAtIDFdW05FWFRdID0gbFZpZXc7XG4gIH1cbiAgaWYgKGluZGV4IDwgY29udGFpbmVyTGVuZ3RoIC0gQ09OVEFJTkVSX0hFQURFUl9PRkZTRVQpIHtcbiAgICBsVmlld1tORVhUXSA9IGxDb250YWluZXJbaW5kZXhJbkNvbnRhaW5lcl07XG4gICAgYWRkVG9BcnJheShsQ29udGFpbmVyLCBDT05UQUlORVJfSEVBREVSX09GRlNFVCArIGluZGV4LCBsVmlldyk7XG4gIH0gZWxzZSB7XG4gICAgbENvbnRhaW5lci5wdXNoKGxWaWV3KTtcbiAgICBsVmlld1tORVhUXSA9IG51bGw7XG4gIH1cblxuICBsVmlld1tQQVJFTlRdID0gbENvbnRhaW5lcjtcblxuICAvLyB0cmFjayB2aWV3cyB3aGVyZSBkZWNsYXJhdGlvbiBhbmQgaW5zZXJ0aW9uIHBvaW50cyBhcmUgZGlmZmVyZW50XG4gIGNvbnN0IGRlY2xhcmF0aW9uTENvbnRhaW5lciA9IGxWaWV3W0RFQ0xBUkFUSU9OX0xDT05UQUlORVJdO1xuICBpZiAoZGVjbGFyYXRpb25MQ29udGFpbmVyICE9PSBudWxsICYmIGxDb250YWluZXIgIT09IGRlY2xhcmF0aW9uTENvbnRhaW5lcikge1xuICAgIHRyYWNrTW92ZWRWaWV3KGRlY2xhcmF0aW9uTENvbnRhaW5lciwgbFZpZXcpO1xuICB9XG5cbiAgLy8gbm90aWZ5IHF1ZXJ5IHRoYXQgYSBuZXcgdmlldyBoYXMgYmVlbiBhZGRlZFxuICBjb25zdCBsUXVlcmllcyA9IGxWaWV3W1FVRVJJRVNdO1xuICBpZiAobFF1ZXJpZXMgIT09IG51bGwpIHtcbiAgICBsUXVlcmllcy5pbnNlcnRWaWV3KHRWaWV3KTtcbiAgfVxuXG4gIC8vIFNldHMgdGhlIGF0dGFjaGVkIGZsYWdcbiAgbFZpZXdbRkxBR1NdIHw9IExWaWV3RmxhZ3MuQXR0YWNoZWQ7XG59XG5cbi8qKlxuICogVHJhY2sgdmlld3MgY3JlYXRlZCBmcm9tIHRoZSBkZWNsYXJhdGlvbiBjb250YWluZXIgKFRlbXBsYXRlUmVmKSBhbmQgaW5zZXJ0ZWQgaW50byBhXG4gKiBkaWZmZXJlbnQgTENvbnRhaW5lci5cbiAqL1xuZnVuY3Rpb24gdHJhY2tNb3ZlZFZpZXcoZGVjbGFyYXRpb25Db250YWluZXI6IExDb250YWluZXIsIGxWaWV3OiBMVmlldykge1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZChsVmlldywgJ0xWaWV3IHJlcXVpcmVkJyk7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRMQ29udGFpbmVyKGRlY2xhcmF0aW9uQ29udGFpbmVyKTtcbiAgY29uc3QgbW92ZWRWaWV3cyA9IGRlY2xhcmF0aW9uQ29udGFpbmVyW01PVkVEX1ZJRVdTXTtcbiAgY29uc3QgaW5zZXJ0ZWRMQ29udGFpbmVyID0gbFZpZXdbUEFSRU5UXSBhcyBMQ29udGFpbmVyO1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0TENvbnRhaW5lcihpbnNlcnRlZExDb250YWluZXIpO1xuICBjb25zdCBpbnNlcnRlZENvbXBvbmVudExWaWV3ID0gaW5zZXJ0ZWRMQ29udGFpbmVyW1BBUkVOVF0gIVtERUNMQVJBVElPTl9DT01QT05FTlRfVklFV107XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKGluc2VydGVkQ29tcG9uZW50TFZpZXcsICdNaXNzaW5nIGluc2VydGVkQ29tcG9uZW50TFZpZXcnKTtcbiAgY29uc3QgaW5zZXJ0ZWRDb21wb25lbnRJc09uUHVzaCA9XG4gICAgICAoaW5zZXJ0ZWRDb21wb25lbnRMVmlld1tGTEFHU10gJiBMVmlld0ZsYWdzLkNoZWNrQWx3YXlzKSAhPT0gTFZpZXdGbGFncy5DaGVja0Fsd2F5cztcbiAgaWYgKGluc2VydGVkQ29tcG9uZW50SXNPblB1c2gpIHtcbiAgICAvLyBjb25zb2xlLmxvZygnaW5zZXJ0ZWRDb21wb25lbnRJc09uUHVzaCcsIGluc2VydGVkQ29tcG9uZW50SXNPblB1c2gpO1xuICAgIGNvbnN0IGRlY2xhcmVkQ29tcG9uZW50TFZpZXcgPSBsVmlld1tERUNMQVJBVElPTl9DT01QT05FTlRfVklFV107XG4gICAgbmdEZXZNb2RlICYmIGFzc2VydERlZmluZWQoZGVjbGFyZWRDb21wb25lbnRMVmlldywgJ01pc3NpbmcgZGVjbGFyZWRDb21wb25lbnRMVmlldycpO1xuICAgIGlmIChkZWNsYXJlZENvbXBvbmVudExWaWV3ICE9PSBpbnNlcnRlZENvbXBvbmVudExWaWV3KSB7XG4gICAgICAvLyBBdCB0aGlzIHBvaW50IHRoZSBkZWNsYXJhdGlvbi1jb21wb25lbnQgaXMgbm90IHNhbWUgYXMgaW5zZXJ0aW9uLWNvbXBvbmVudCBhbmQgd2UgYXJlIGluXG4gICAgICAvLyBvbi1wdXNoIG1vZGUsIHRoaXMgbWVhbnMgdGhhdCB0aGlzIGlzIGEgdHJhbnNwbGFudGVkIHZpZXcuIE1hcmsgdGhlIGRlY2xhcmVkIGxWaWV3IGFzXG4gICAgICAvLyBoYXZpbmdcbiAgICAgIC8vIHRyYW5zcGxhbnRlZCB2aWV3cyBzbyB0aGF0IHRob3NlIHZpZXdzIGNhbiBwYXJ0aWNpcGF0ZSBpbiBDRC5cbiAgICAgIGRlY2xhcmF0aW9uQ29udGFpbmVyW0FDVElWRV9JTkRFWF0gfD0gQWN0aXZlSW5kZXhGbGFnLkhBU19UUkFOU1BMQU5URURfVklFV1M7XG4gICAgfVxuICB9XG4gIGlmIChtb3ZlZFZpZXdzID09PSBudWxsKSB7XG4gICAgZGVjbGFyYXRpb25Db250YWluZXJbTU9WRURfVklFV1NdID0gW2xWaWV3XTtcbiAgfSBlbHNlIHtcbiAgICBtb3ZlZFZpZXdzLnB1c2gobFZpZXcpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRldGFjaE1vdmVkVmlldyhkZWNsYXJhdGlvbkNvbnRhaW5lcjogTENvbnRhaW5lciwgbFZpZXc6IExWaWV3KSB7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRMQ29udGFpbmVyKGRlY2xhcmF0aW9uQ29udGFpbmVyKTtcbiAgbmdEZXZNb2RlICYmIGFzc2VydERlZmluZWQoXG4gICAgICAgICAgICAgICAgICAgZGVjbGFyYXRpb25Db250YWluZXJbTU9WRURfVklFV1NdLFxuICAgICAgICAgICAgICAgICAgICdBIHByb2plY3RlZCB2aWV3IHNob3VsZCBiZWxvbmcgdG8gYSBub24tZW1wdHkgcHJvamVjdGVkIHZpZXdzIGNvbGxlY3Rpb24nKTtcbiAgY29uc3QgbW92ZWRWaWV3cyA9IGRlY2xhcmF0aW9uQ29udGFpbmVyW01PVkVEX1ZJRVdTXSAhO1xuICBjb25zdCBkZWNsYXJlZFZpZXdJbmRleCA9IG1vdmVkVmlld3MuaW5kZXhPZihsVmlldyk7XG4gIG1vdmVkVmlld3Muc3BsaWNlKGRlY2xhcmVkVmlld0luZGV4LCAxKTtcbn1cblxuLyoqXG4gKiBEZXRhY2hlcyBhIHZpZXcgZnJvbSBhIGNvbnRhaW5lci5cbiAqXG4gKiBUaGlzIG1ldGhvZCByZW1vdmVzIHRoZSB2aWV3IGZyb20gdGhlIGNvbnRhaW5lcidzIGFycmF5IG9mIGFjdGl2ZSB2aWV3cy4gSXQgYWxzb1xuICogcmVtb3ZlcyB0aGUgdmlldydzIGVsZW1lbnRzIGZyb20gdGhlIERPTS5cbiAqXG4gKiBAcGFyYW0gbENvbnRhaW5lciBUaGUgY29udGFpbmVyIGZyb20gd2hpY2ggdG8gZGV0YWNoIGEgdmlld1xuICogQHBhcmFtIHJlbW92ZUluZGV4IFRoZSBpbmRleCBvZiB0aGUgdmlldyB0byBkZXRhY2hcbiAqIEByZXR1cm5zIERldGFjaGVkIExWaWV3IGluc3RhbmNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGV0YWNoVmlldyhsQ29udGFpbmVyOiBMQ29udGFpbmVyLCByZW1vdmVJbmRleDogbnVtYmVyKTogTFZpZXd8dW5kZWZpbmVkIHtcbiAgaWYgKGxDb250YWluZXIubGVuZ3RoIDw9IENPTlRBSU5FUl9IRUFERVJfT0ZGU0VUKSByZXR1cm47XG5cbiAgY29uc3QgaW5kZXhJbkNvbnRhaW5lciA9IENPTlRBSU5FUl9IRUFERVJfT0ZGU0VUICsgcmVtb3ZlSW5kZXg7XG4gIGNvbnN0IHZpZXdUb0RldGFjaCA9IGxDb250YWluZXJbaW5kZXhJbkNvbnRhaW5lcl07XG5cbiAgaWYgKHZpZXdUb0RldGFjaCkge1xuICAgIGNvbnN0IGRlY2xhcmF0aW9uTENvbnRhaW5lciA9IHZpZXdUb0RldGFjaFtERUNMQVJBVElPTl9MQ09OVEFJTkVSXTtcbiAgICBpZiAoZGVjbGFyYXRpb25MQ29udGFpbmVyICE9PSBudWxsICYmIGRlY2xhcmF0aW9uTENvbnRhaW5lciAhPT0gbENvbnRhaW5lcikge1xuICAgICAgZGV0YWNoTW92ZWRWaWV3KGRlY2xhcmF0aW9uTENvbnRhaW5lciwgdmlld1RvRGV0YWNoKTtcbiAgICB9XG5cblxuICAgIGlmIChyZW1vdmVJbmRleCA+IDApIHtcbiAgICAgIGxDb250YWluZXJbaW5kZXhJbkNvbnRhaW5lciAtIDFdW05FWFRdID0gdmlld1RvRGV0YWNoW05FWFRdIGFzIExWaWV3O1xuICAgIH1cbiAgICBjb25zdCByZW1vdmVkTFZpZXcgPSByZW1vdmVGcm9tQXJyYXkobENvbnRhaW5lciwgQ09OVEFJTkVSX0hFQURFUl9PRkZTRVQgKyByZW1vdmVJbmRleCk7XG4gICAgYWRkUmVtb3ZlVmlld0Zyb21Db250YWluZXIodmlld1RvRGV0YWNoW1RWSUVXXSwgdmlld1RvRGV0YWNoLCBmYWxzZSwgbnVsbCk7XG5cbiAgICAvLyBub3RpZnkgcXVlcnkgdGhhdCBhIHZpZXcgaGFzIGJlZW4gcmVtb3ZlZFxuICAgIGNvbnN0IGxRdWVyaWVzID0gcmVtb3ZlZExWaWV3W1FVRVJJRVNdO1xuICAgIGlmIChsUXVlcmllcyAhPT0gbnVsbCkge1xuICAgICAgbFF1ZXJpZXMuZGV0YWNoVmlldyhyZW1vdmVkTFZpZXdbVFZJRVddKTtcbiAgICB9XG5cbiAgICB2aWV3VG9EZXRhY2hbUEFSRU5UXSA9IG51bGw7XG4gICAgdmlld1RvRGV0YWNoW05FWFRdID0gbnVsbDtcbiAgICAvLyBVbnNldHMgdGhlIGF0dGFjaGVkIGZsYWdcbiAgICB2aWV3VG9EZXRhY2hbRkxBR1NdICY9IH5MVmlld0ZsYWdzLkF0dGFjaGVkO1xuICB9XG4gIHJldHVybiB2aWV3VG9EZXRhY2g7XG59XG5cbi8qKlxuICogUmVtb3ZlcyBhIHZpZXcgZnJvbSBhIGNvbnRhaW5lciwgaS5lLiBkZXRhY2hlcyBpdCBhbmQgdGhlbiBkZXN0cm95cyB0aGUgdW5kZXJseWluZyBMVmlldy5cbiAqXG4gKiBAcGFyYW0gbENvbnRhaW5lciBUaGUgY29udGFpbmVyIGZyb20gd2hpY2ggdG8gcmVtb3ZlIGEgdmlld1xuICogQHBhcmFtIHJlbW92ZUluZGV4IFRoZSBpbmRleCBvZiB0aGUgdmlldyB0byByZW1vdmVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVZpZXcobENvbnRhaW5lcjogTENvbnRhaW5lciwgcmVtb3ZlSW5kZXg6IG51bWJlcikge1xuICBjb25zdCBkZXRhY2hlZFZpZXcgPSBkZXRhY2hWaWV3KGxDb250YWluZXIsIHJlbW92ZUluZGV4KTtcbiAgZGV0YWNoZWRWaWV3ICYmIGRlc3Ryb3lMVmlldyhkZXRhY2hlZFZpZXdbVFZJRVddLCBkZXRhY2hlZFZpZXcpO1xufVxuXG4vKipcbiAqIEEgc3RhbmRhbG9uZSBmdW5jdGlvbiB3aGljaCBkZXN0cm95cyBhbiBMVmlldyxcbiAqIGNvbmR1Y3RpbmcgY2xlYW4gdXAgKGUuZy4gcmVtb3ZpbmcgbGlzdGVuZXJzLCBjYWxsaW5nIG9uRGVzdHJveXMpLlxuICpcbiAqIEBwYXJhbSB0VmlldyBUaGUgYFRWaWV3JyBvZiB0aGUgYExWaWV3YCB0byBiZSBkZXN0cm95ZWRcbiAqIEBwYXJhbSBsVmlldyBUaGUgdmlldyB0byBiZSBkZXN0cm95ZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXN0cm95TFZpZXcodFZpZXc6IFRWaWV3LCBsVmlldzogTFZpZXcpIHtcbiAgaWYgKCEobFZpZXdbRkxBR1NdICYgTFZpZXdGbGFncy5EZXN0cm95ZWQpKSB7XG4gICAgY29uc3QgcmVuZGVyZXIgPSBsVmlld1tSRU5ERVJFUl07XG4gICAgaWYgKGlzUHJvY2VkdXJhbFJlbmRlcmVyKHJlbmRlcmVyKSAmJiByZW5kZXJlci5kZXN0cm95Tm9kZSkge1xuICAgICAgYXBwbHlWaWV3KHRWaWV3LCBsVmlldywgcmVuZGVyZXIsIFdhbGtUTm9kZVRyZWVBY3Rpb24uRGVzdHJveSwgbnVsbCwgbnVsbCk7XG4gICAgfVxuXG4gICAgZGVzdHJveVZpZXdUcmVlKGxWaWV3KTtcbiAgfVxufVxuXG4vKipcbiAqIERldGVybWluZXMgd2hpY2ggTFZpZXdPckxDb250YWluZXIgdG8ganVtcCB0byB3aGVuIHRyYXZlcnNpbmcgYmFjayB1cCB0aGVcbiAqIHRyZWUgaW4gZGVzdHJveVZpZXdUcmVlLlxuICpcbiAqIE5vcm1hbGx5LCB0aGUgdmlldydzIHBhcmVudCBMVmlldyBzaG91bGQgYmUgY2hlY2tlZCwgYnV0IGluIHRoZSBjYXNlIG9mXG4gKiBlbWJlZGRlZCB2aWV3cywgdGhlIGNvbnRhaW5lciAod2hpY2ggaXMgdGhlIHZpZXcgbm9kZSdzIHBhcmVudCwgYnV0IG5vdCB0aGVcbiAqIExWaWV3J3MgcGFyZW50KSBuZWVkcyB0byBiZSBjaGVja2VkIGZvciBhIHBvc3NpYmxlIG5leHQgcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIGxWaWV3T3JMQ29udGFpbmVyIFRoZSBMVmlld09yTENvbnRhaW5lciBmb3Igd2hpY2ggd2UgbmVlZCBhIHBhcmVudCBzdGF0ZVxuICogQHBhcmFtIHJvb3RWaWV3IFRoZSByb290Vmlldywgc28gd2UgZG9uJ3QgcHJvcGFnYXRlIHRvbyBmYXIgdXAgdGhlIHZpZXcgdHJlZVxuICogQHJldHVybnMgVGhlIGNvcnJlY3QgcGFyZW50IExWaWV3T3JMQ29udGFpbmVyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQYXJlbnRTdGF0ZShsVmlld09yTENvbnRhaW5lcjogTFZpZXcgfCBMQ29udGFpbmVyLCByb290VmlldzogTFZpZXcpOiBMVmlld3xcbiAgICBMQ29udGFpbmVyfG51bGwge1xuICBsZXQgdE5vZGU7XG4gIGlmIChpc0xWaWV3KGxWaWV3T3JMQ29udGFpbmVyKSAmJiAodE5vZGUgPSBsVmlld09yTENvbnRhaW5lcltUX0hPU1RdKSAmJlxuICAgICAgdE5vZGUudHlwZSA9PT0gVE5vZGVUeXBlLlZpZXcpIHtcbiAgICAvLyBpZiBpdCdzIGFuIGVtYmVkZGVkIHZpZXcsIHRoZSBzdGF0ZSBuZWVkcyB0byBnbyB1cCB0byB0aGUgY29udGFpbmVyLCBpbiBjYXNlIHRoZVxuICAgIC8vIGNvbnRhaW5lciBoYXMgYSBuZXh0XG4gICAgcmV0dXJuIGdldExDb250YWluZXIodE5vZGUgYXMgVFZpZXdOb2RlLCBsVmlld09yTENvbnRhaW5lcik7XG4gIH0gZWxzZSB7XG4gICAgLy8gb3RoZXJ3aXNlLCB1c2UgcGFyZW50IHZpZXcgZm9yIGNvbnRhaW5lcnMgb3IgY29tcG9uZW50IHZpZXdzXG4gICAgcmV0dXJuIGxWaWV3T3JMQ29udGFpbmVyW1BBUkVOVF0gPT09IHJvb3RWaWV3ID8gbnVsbCA6IGxWaWV3T3JMQ29udGFpbmVyW1BBUkVOVF07XG4gIH1cbn1cblxuLyoqXG4gKiBDYWxscyBvbkRlc3Ryb3lzIGhvb2tzIGZvciBhbGwgZGlyZWN0aXZlcyBhbmQgcGlwZXMgaW4gYSBnaXZlbiB2aWV3IGFuZCB0aGVuIHJlbW92ZXMgYWxsXG4gKiBsaXN0ZW5lcnMuIExpc3RlbmVycyBhcmUgcmVtb3ZlZCBhcyB0aGUgbGFzdCBzdGVwIHNvIGV2ZW50cyBkZWxpdmVyZWQgaW4gdGhlIG9uRGVzdHJveXMgaG9va3NcbiAqIGNhbiBiZSBwcm9wYWdhdGVkIHRvIEBPdXRwdXQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB0VmlldyBgVFZpZXdgIGZvciB0aGUgYExWaWV3YCB0byBjbGVhbiB1cC5cbiAqIEBwYXJhbSBsVmlldyBUaGUgTFZpZXcgdG8gY2xlYW4gdXBcbiAqL1xuZnVuY3Rpb24gY2xlYW5VcFZpZXcodFZpZXc6IFRWaWV3LCBsVmlldzogTFZpZXcpOiB2b2lkIHtcbiAgaWYgKCEobFZpZXdbRkxBR1NdICYgTFZpZXdGbGFncy5EZXN0cm95ZWQpKSB7XG4gICAgLy8gVXN1YWxseSB0aGUgQXR0YWNoZWQgZmxhZyBpcyByZW1vdmVkIHdoZW4gdGhlIHZpZXcgaXMgZGV0YWNoZWQgZnJvbSBpdHMgcGFyZW50LCBob3dldmVyXG4gICAgLy8gaWYgaXQncyBhIHJvb3QgdmlldywgdGhlIGZsYWcgd29uJ3QgYmUgdW5zZXQgaGVuY2Ugd2h5IHdlJ3JlIGFsc28gcmVtb3Zpbmcgb24gZGVzdHJveS5cbiAgICBsVmlld1tGTEFHU10gJj0gfkxWaWV3RmxhZ3MuQXR0YWNoZWQ7XG5cbiAgICAvLyBNYXJrIHRoZSBMVmlldyBhcyBkZXN0cm95ZWQgKmJlZm9yZSogZXhlY3V0aW5nIHRoZSBvbkRlc3Ryb3kgaG9va3MuIEFuIG9uRGVzdHJveSBob29rXG4gICAgLy8gcnVucyBhcmJpdHJhcnkgdXNlciBjb2RlLCB3aGljaCBjb3VsZCBpbmNsdWRlIGl0cyBvd24gYHZpZXdSZWYuZGVzdHJveSgpYCAob3Igc2ltaWxhcikuIElmXG4gICAgLy8gV2UgZG9uJ3QgZmxhZyB0aGUgdmlldyBhcyBkZXN0cm95ZWQgYmVmb3JlIHRoZSBob29rcywgdGhpcyBjb3VsZCBsZWFkIHRvIGFuIGluZmluaXRlIGxvb3AuXG4gICAgLy8gVGhpcyBhbHNvIGFsaWducyB3aXRoIHRoZSBWaWV3RW5naW5lIGJlaGF2aW9yLiBJdCBhbHNvIG1lYW5zIHRoYXQgdGhlIG9uRGVzdHJveSBob29rIGlzXG4gICAgLy8gcmVhbGx5IG1vcmUgb2YgYW4gXCJhZnRlckRlc3Ryb3lcIiBob29rIGlmIHlvdSB0aGluayBhYm91dCBpdC5cbiAgICBsVmlld1tGTEFHU10gfD0gTFZpZXdGbGFncy5EZXN0cm95ZWQ7XG5cbiAgICBleGVjdXRlT25EZXN0cm95cyh0VmlldywgbFZpZXcpO1xuICAgIHJlbW92ZUxpc3RlbmVycyh0VmlldywgbFZpZXcpO1xuICAgIGNvbnN0IGhvc3RUTm9kZSA9IGxWaWV3W1RfSE9TVF07XG4gICAgLy8gRm9yIGNvbXBvbmVudCB2aWV3cyBvbmx5LCB0aGUgbG9jYWwgcmVuZGVyZXIgaXMgZGVzdHJveWVkIGFzIGNsZWFuIHVwIHRpbWUuXG4gICAgaWYgKGhvc3RUTm9kZSAmJiBob3N0VE5vZGUudHlwZSA9PT0gVE5vZGVUeXBlLkVsZW1lbnQgJiZcbiAgICAgICAgaXNQcm9jZWR1cmFsUmVuZGVyZXIobFZpZXdbUkVOREVSRVJdKSkge1xuICAgICAgbmdEZXZNb2RlICYmIG5nRGV2TW9kZS5yZW5kZXJlckRlc3Ryb3krKztcbiAgICAgIGNvbnN0IGNvbXBvbmVudCA9IGxWaWV3W0NPTlRFWFRdIGFzIGFueTtcbiAgICAgIGNvbnN0IHByb3hpZXMgPSBjb21wb25lbnQgJiYgY29tcG9uZW50W1JFQUNUSVZFX1BST1BFUlRJRVNfSU5ESUNBVE9SXSA/IGNvbXBvbmVudFtSRUFDVElWRV9QUk9QRVJUSUVTX0lORElDQVRPUl0gOiBbXTtcbiAgICAgIGZvcihjb25zdCBwcm94eUtleSBvZiBwcm94aWVzKXtcbiAgICAgICAgaWYgKHR5cGVvZiBjb21wb25lbnRbcHJveHlLZXldID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdpcyBvYmplY3QhISEnLCBjb21wb25lbnRbcHJveHlLZXldW05PVF9MT1NUX1BST1hZX0lORElDQVRPUl0pO1xuICAgICAgICAgIGlmIChjb21wb25lbnRbcHJveHlLZXldW05PVF9MT1NUX1BST1hZX0lORElDQVRPUl0pIHtcbiAgICAgICAgICAgIGNvbXBvbmVudFtwcm94eUtleV1bUkVNT1ZFX1BST1hZX0lORElDQVRPUl0gPSBjb21wb25lbnQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb21wb25lbnQsIHByb3h5S2V5LCB7XG4gICAgICAgICAgc2V0OiB1bmRlZmluZWQsXG4gICAgICAgICAgZ2V0OiB1bmRlZmluZWQsXG4gICAgICAgIH0pO1xuICAgICAgICBkZWxldGUgY29tcG9uZW50W3Byb3h5S2V5XTtcbiAgICAgIH1cbiAgICAgIC8vIGNvbnNvbGUubG9nKCdkZWxldGUgcHJveHknLCBsVmlld1tDT05URVhUXSwgcHJveGllcyk7XG4gICAgICAobFZpZXdbUkVOREVSRVJdIGFzIFByb2NlZHVyYWxSZW5kZXJlcjMpLmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICBjb25zdCBkZWNsYXJhdGlvbkNvbnRhaW5lciA9IGxWaWV3W0RFQ0xBUkFUSU9OX0xDT05UQUlORVJdO1xuICAgIC8vIHdlIGFyZSBkZWFsaW5nIHdpdGggYW4gZW1iZWRkZWQgdmlldyB0aGF0IGlzIHN0aWxsIGluc2VydGVkIGludG8gYSBjb250YWluZXJcbiAgICBpZiAoZGVjbGFyYXRpb25Db250YWluZXIgIT09IG51bGwgJiYgaXNMQ29udGFpbmVyKGxWaWV3W1BBUkVOVF0pKSB7XG4gICAgICAvLyBhbmQgdGhpcyBpcyBhIHByb2plY3RlZCB2aWV3XG4gICAgICBpZiAoZGVjbGFyYXRpb25Db250YWluZXIgIT09IGxWaWV3W1BBUkVOVF0pIHtcbiAgICAgICAgZGV0YWNoTW92ZWRWaWV3KGRlY2xhcmF0aW9uQ29udGFpbmVyLCBsVmlldyk7XG4gICAgICB9XG5cbiAgICAgIC8vIEZvciBlbWJlZGRlZCB2aWV3cyBzdGlsbCBhdHRhY2hlZCB0byBhIGNvbnRhaW5lcjogcmVtb3ZlIHF1ZXJ5IHJlc3VsdCBmcm9tIHRoaXMgdmlldy5cbiAgICAgIGNvbnN0IGxRdWVyaWVzID0gbFZpZXdbUVVFUklFU107XG4gICAgICBpZiAobFF1ZXJpZXMgIT09IG51bGwpIHtcbiAgICAgICAgbFF1ZXJpZXMuZGV0YWNoVmlldyh0Vmlldyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKiBSZW1vdmVzIGxpc3RlbmVycyBhbmQgdW5zdWJzY3JpYmVzIGZyb20gb3V0cHV0IHN1YnNjcmlwdGlvbnMgKi9cbmZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVycyh0VmlldzogVFZpZXcsIGxWaWV3OiBMVmlldyk6IHZvaWQge1xuICBjb25zdCB0Q2xlYW51cCA9IHRWaWV3LmNsZWFudXA7XG4gIGlmICh0Q2xlYW51cCAhPT0gbnVsbCkge1xuICAgIGNvbnN0IGxDbGVhbnVwID0gbFZpZXdbQ0xFQU5VUF0gITtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRDbGVhbnVwLmxlbmd0aCAtIDE7IGkgKz0gMikge1xuICAgICAgaWYgKHR5cGVvZiB0Q2xlYW51cFtpXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgLy8gVGhpcyBpcyBhIG5hdGl2ZSBET00gbGlzdGVuZXJcbiAgICAgICAgY29uc3QgaWR4T3JUYXJnZXRHZXR0ZXIgPSB0Q2xlYW51cFtpICsgMV07XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IHR5cGVvZiBpZHhPclRhcmdldEdldHRlciA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgICAgICBpZHhPclRhcmdldEdldHRlcihsVmlldykgOlxuICAgICAgICAgICAgdW53cmFwUk5vZGUobFZpZXdbaWR4T3JUYXJnZXRHZXR0ZXJdKTtcbiAgICAgICAgY29uc3QgbGlzdGVuZXIgPSBsQ2xlYW51cFt0Q2xlYW51cFtpICsgMl1dO1xuICAgICAgICBjb25zdCB1c2VDYXB0dXJlT3JTdWJJZHggPSB0Q2xlYW51cFtpICsgM107XG4gICAgICAgIGlmICh0eXBlb2YgdXNlQ2FwdHVyZU9yU3ViSWR4ID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAvLyBuYXRpdmUgRE9NIGxpc3RlbmVyIHJlZ2lzdGVyZWQgd2l0aCBSZW5kZXJlcjNcbiAgICAgICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0Q2xlYW51cFtpXSwgbGlzdGVuZXIsIHVzZUNhcHR1cmVPclN1YklkeCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHVzZUNhcHR1cmVPclN1YklkeCA+PSAwKSB7XG4gICAgICAgICAgICAvLyB1bnJlZ2lzdGVyXG4gICAgICAgICAgICBsQ2xlYW51cFt1c2VDYXB0dXJlT3JTdWJJZHhdKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFN1YnNjcmlwdGlvblxuICAgICAgICAgICAgbENsZWFudXBbLXVzZUNhcHR1cmVPclN1YklkeF0udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaSArPSAyO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVGhpcyBpcyBhIGNsZWFudXAgZnVuY3Rpb24gdGhhdCBpcyBncm91cGVkIHdpdGggdGhlIGluZGV4IG9mIGl0cyBjb250ZXh0XG4gICAgICAgIGNvbnN0IGNvbnRleHQgPSBsQ2xlYW51cFt0Q2xlYW51cFtpICsgMV1dO1xuICAgICAgICB0Q2xlYW51cFtpXS5jYWxsKGNvbnRleHQpO1xuICAgICAgfVxuICAgIH1cbiAgICBsVmlld1tDTEVBTlVQXSA9IG51bGw7XG4gIH1cbn1cblxuLyoqIENhbGxzIG9uRGVzdHJveSBob29rcyBmb3IgdGhpcyB2aWV3ICovXG5mdW5jdGlvbiBleGVjdXRlT25EZXN0cm95cyh0VmlldzogVFZpZXcsIGxWaWV3OiBMVmlldyk6IHZvaWQge1xuICBsZXQgZGVzdHJveUhvb2tzOiBIb29rRGF0YXxudWxsO1xuXG4gIGlmICh0VmlldyAhPSBudWxsICYmIChkZXN0cm95SG9va3MgPSB0Vmlldy5kZXN0cm95SG9va3MpICE9IG51bGwpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRlc3Ryb3lIb29rcy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgY29uc3QgY29udGV4dCA9IGxWaWV3W2Rlc3Ryb3lIb29rc1tpXSBhcyBudW1iZXJdO1xuXG4gICAgICAvLyBPbmx5IGNhbGwgdGhlIGRlc3Ryb3kgaG9vayBpZiB0aGUgY29udGV4dCBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gICAgICBpZiAoIShjb250ZXh0IGluc3RhbmNlb2YgTm9kZUluamVjdG9yRmFjdG9yeSkpIHtcbiAgICAgICAgKGRlc3Ryb3lIb29rc1tpICsgMV0gYXMoKSA9PiB2b2lkKS5jYWxsKGNvbnRleHQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgYSBuYXRpdmUgZWxlbWVudCBpZiBhIG5vZGUgY2FuIGJlIGluc2VydGVkIGludG8gdGhlIGdpdmVuIHBhcmVudC5cbiAqXG4gKiBUaGVyZSBhcmUgdHdvIHJlYXNvbnMgd2h5IHdlIG1heSBub3QgYmUgYWJsZSB0byBpbnNlcnQgYSBlbGVtZW50IGltbWVkaWF0ZWx5LlxuICogLSBQcm9qZWN0aW9uOiBXaGVuIGNyZWF0aW5nIGEgY2hpbGQgY29udGVudCBlbGVtZW50IG9mIGEgY29tcG9uZW50LCB3ZSBoYXZlIHRvIHNraXAgdGhlXG4gKiAgIGluc2VydGlvbiBiZWNhdXNlIHRoZSBjb250ZW50IG9mIGEgY29tcG9uZW50IHdpbGwgYmUgcHJvamVjdGVkLlxuICogICBgPGNvbXBvbmVudD48Y29udGVudD5kZWxheWVkIGR1ZSB0byBwcm9qZWN0aW9uPC9jb250ZW50PjwvY29tcG9uZW50PmBcbiAqIC0gUGFyZW50IGNvbnRhaW5lciBpcyBkaXNjb25uZWN0ZWQ6IFRoaXMgY2FuIGhhcHBlbiB3aGVuIHdlIGFyZSBpbnNlcnRpbmcgYSB2aWV3IGludG9cbiAqICAgcGFyZW50IGNvbnRhaW5lciwgd2hpY2ggaXRzZWxmIGlzIGRpc2Nvbm5lY3RlZC4gRm9yIGV4YW1wbGUgdGhlIHBhcmVudCBjb250YWluZXIgaXMgcGFydFxuICogICBvZiBhIFZpZXcgd2hpY2ggaGFzIG5vdCBiZSBpbnNlcnRlZCBvciBpcyBtYWRlIGZvciBwcm9qZWN0aW9uIGJ1dCBoYXMgbm90IGJlZW4gaW5zZXJ0ZWRcbiAqICAgaW50byBkZXN0aW5hdGlvbi5cbiAqL1xuZnVuY3Rpb24gZ2V0UmVuZGVyUGFyZW50KHRWaWV3OiBUVmlldywgdE5vZGU6IFROb2RlLCBjdXJyZW50VmlldzogTFZpZXcpOiBSRWxlbWVudHxudWxsIHtcbiAgLy8gU2tpcCBvdmVyIGVsZW1lbnQgYW5kIElDVSBjb250YWluZXJzIGFzIHRob3NlIGFyZSByZXByZXNlbnRlZCBieSBhIGNvbW1lbnQgbm9kZSBhbmRcbiAgLy8gY2FuJ3QgYmUgdXNlZCBhcyBhIHJlbmRlciBwYXJlbnQuXG4gIGxldCBwYXJlbnRUTm9kZSA9IHROb2RlLnBhcmVudDtcbiAgd2hpbGUgKHBhcmVudFROb2RlICE9IG51bGwgJiYgKHBhcmVudFROb2RlLnR5cGUgPT09IFROb2RlVHlwZS5FbGVtZW50Q29udGFpbmVyIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRUTm9kZS50eXBlID09PSBUTm9kZVR5cGUuSWN1Q29udGFpbmVyKSkge1xuICAgIHROb2RlID0gcGFyZW50VE5vZGU7XG4gICAgcGFyZW50VE5vZGUgPSB0Tm9kZS5wYXJlbnQ7XG4gIH1cblxuICAvLyBJZiB0aGUgcGFyZW50IHROb2RlIGlzIG51bGwsIHRoZW4gd2UgYXJlIGluc2VydGluZyBhY3Jvc3Mgdmlld3M6IGVpdGhlciBpbnRvIGFuIGVtYmVkZGVkIHZpZXdcbiAgLy8gb3IgYSBjb21wb25lbnQgdmlldy5cbiAgaWYgKHBhcmVudFROb2RlID09IG51bGwpIHtcbiAgICBjb25zdCBob3N0VE5vZGUgPSBjdXJyZW50Vmlld1tUX0hPU1RdICE7XG4gICAgaWYgKGhvc3RUTm9kZS50eXBlID09PSBUTm9kZVR5cGUuVmlldykge1xuICAgICAgLy8gV2UgYXJlIGluc2VydGluZyBhIHJvb3QgZWxlbWVudCBvZiBhbiBlbWJlZGRlZCB2aWV3IFdlIG1pZ2h0IGRlbGF5IGluc2VydGlvbiBvZiBjaGlsZHJlblxuICAgICAgLy8gZm9yIGEgZ2l2ZW4gdmlldyBpZiBpdCBpcyBkaXNjb25uZWN0ZWQuIFRoaXMgbWlnaHQgaGFwcGVuIGZvciAyIG1haW4gcmVhc29uczpcbiAgICAgIC8vIC0gdmlldyBpcyBub3QgaW5zZXJ0ZWQgaW50byBhbnkgY29udGFpbmVyKHZpZXcgd2FzIGNyZWF0ZWQgYnV0IG5vdCBpbnNlcnRlZCB5ZXQpXG4gICAgICAvLyAtIHZpZXcgaXMgaW5zZXJ0ZWQgaW50byBhIGNvbnRhaW5lciBidXQgdGhlIGNvbnRhaW5lciBpdHNlbGYgaXMgbm90IGluc2VydGVkIGludG8gdGhlIERPTVxuICAgICAgLy8gKGNvbnRhaW5lciBtaWdodCBiZSBwYXJ0IG9mIHByb2plY3Rpb24gb3IgY2hpbGQgb2YgYSB2aWV3IHRoYXQgaXMgbm90IGluc2VydGVkIHlldCkuXG4gICAgICAvLyBJbiBvdGhlciB3b3JkcyB3ZSBjYW4gaW5zZXJ0IGNoaWxkcmVuIG9mIGEgZ2l2ZW4gdmlldyBpZiB0aGlzIHZpZXcgd2FzIGluc2VydGVkIGludG8gYVxuICAgICAgLy8gY29udGFpbmVyIGFuZCB0aGUgY29udGFpbmVyIGl0c2VsZiBoYXMgaXRzIHJlbmRlciBwYXJlbnQgZGV0ZXJtaW5lZC5cbiAgICAgIHJldHVybiBnZXRDb250YWluZXJSZW5kZXJQYXJlbnQoaG9zdFROb2RlIGFzIFRWaWV3Tm9kZSwgY3VycmVudFZpZXcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBXZSBhcmUgaW5zZXJ0aW5nIGEgcm9vdCBlbGVtZW50IG9mIHRoZSBjb21wb25lbnQgdmlldyBpbnRvIHRoZSBjb21wb25lbnQgaG9zdCBlbGVtZW50IGFuZFxuICAgICAgLy8gaXQgc2hvdWxkIGFsd2F5cyBiZSBlYWdlci5cbiAgICAgIG5nRGV2TW9kZSAmJiBhc3NlcnROb2RlT2ZQb3NzaWJsZVR5cGVzKGhvc3RUTm9kZSwgVE5vZGVUeXBlLkVsZW1lbnQpO1xuICAgICAgcmV0dXJuIGN1cnJlbnRWaWV3W0hPU1RdO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjb25zdCBpc0ljdUNhc2UgPSB0Tm9kZSAmJiB0Tm9kZS50eXBlID09PSBUTm9kZVR5cGUuSWN1Q29udGFpbmVyO1xuICAgIC8vIElmIHRoZSBwYXJlbnQgb2YgdGhpcyBub2RlIGlzIGFuIElDVSBjb250YWluZXIsIHRoZW4gaXQgaXMgcmVwcmVzZW50ZWQgYnkgY29tbWVudCBub2RlIGFuZCB3ZVxuICAgIC8vIG5lZWQgdG8gdXNlIGl0IGFzIGFuIGFuY2hvci4gSWYgaXQgaXMgcHJvamVjdGVkIHRoZW4gaXQncyBkaXJlY3QgcGFyZW50IG5vZGUgaXMgdGhlIHJlbmRlcmVyLlxuICAgIGlmIChpc0ljdUNhc2UgJiYgdE5vZGUuZmxhZ3MgJiBUTm9kZUZsYWdzLmlzUHJvamVjdGVkKSB7XG4gICAgICByZXR1cm4gZ2V0TmF0aXZlQnlUTm9kZSh0Tm9kZSwgY3VycmVudFZpZXcpLnBhcmVudE5vZGUgYXMgUkVsZW1lbnQ7XG4gICAgfVxuXG4gICAgbmdEZXZNb2RlICYmIGFzc2VydE5vZGVUeXBlKHBhcmVudFROb2RlLCBUTm9kZVR5cGUuRWxlbWVudCk7XG4gICAgaWYgKHBhcmVudFROb2RlLmZsYWdzICYgVE5vZGVGbGFncy5pc0NvbXBvbmVudEhvc3QpIHtcbiAgICAgIGNvbnN0IHREYXRhID0gdFZpZXcuZGF0YTtcbiAgICAgIGNvbnN0IHROb2RlID0gdERhdGFbcGFyZW50VE5vZGUuaW5kZXhdIGFzIFROb2RlO1xuICAgICAgY29uc3QgZW5jYXBzdWxhdGlvbiA9ICh0RGF0YVt0Tm9kZS5kaXJlY3RpdmVTdGFydF0gYXMgQ29tcG9uZW50RGVmPGFueT4pLmVuY2Fwc3VsYXRpb247XG5cbiAgICAgIC8vIFdlJ3ZlIGdvdCBhIHBhcmVudCB3aGljaCBpcyBhbiBlbGVtZW50IGluIHRoZSBjdXJyZW50IHZpZXcuIFdlIGp1c3QgbmVlZCB0byB2ZXJpZnkgaWYgdGhlXG4gICAgICAvLyBwYXJlbnQgZWxlbWVudCBpcyBub3QgYSBjb21wb25lbnQuIENvbXBvbmVudCdzIGNvbnRlbnQgbm9kZXMgYXJlIG5vdCBpbnNlcnRlZCBpbW1lZGlhdGVseVxuICAgICAgLy8gYmVjYXVzZSB0aGV5IHdpbGwgYmUgcHJvamVjdGVkLCBhbmQgc28gZG9pbmcgaW5zZXJ0IGF0IHRoaXMgcG9pbnQgd291bGQgYmUgd2FzdGVmdWwuXG4gICAgICAvLyBTaW5jZSB0aGUgcHJvamVjdGlvbiB3b3VsZCB0aGVuIG1vdmUgaXQgdG8gaXRzIGZpbmFsIGRlc3RpbmF0aW9uLiBOb3RlIHRoYXQgd2UgY2FuJ3RcbiAgICAgIC8vIG1ha2UgdGhpcyBhc3N1bXB0aW9uIHdoZW4gdXNpbmcgdGhlIFNoYWRvdyBET00sIGJlY2F1c2UgdGhlIG5hdGl2ZSBwcm9qZWN0aW9uIHBsYWNlaG9sZGVyc1xuICAgICAgLy8gKDxjb250ZW50PiBvciA8c2xvdD4pIGhhdmUgdG8gYmUgaW4gcGxhY2UgYXMgZWxlbWVudHMgYXJlIGJlaW5nIGluc2VydGVkLlxuICAgICAgaWYgKGVuY2Fwc3VsYXRpb24gIT09IFZpZXdFbmNhcHN1bGF0aW9uLlNoYWRvd0RvbSAmJlxuICAgICAgICAgIGVuY2Fwc3VsYXRpb24gIT09IFZpZXdFbmNhcHN1bGF0aW9uLk5hdGl2ZSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZ2V0TmF0aXZlQnlUTm9kZShwYXJlbnRUTm9kZSwgY3VycmVudFZpZXcpIGFzIFJFbGVtZW50O1xuICB9XG59XG5cbi8qKlxuICogSW5zZXJ0cyBhIG5hdGl2ZSBub2RlIGJlZm9yZSBhbm90aGVyIG5hdGl2ZSBub2RlIGZvciBhIGdpdmVuIHBhcmVudCB1c2luZyB7QGxpbmsgUmVuZGVyZXIzfS5cbiAqIFRoaXMgaXMgYSB1dGlsaXR5IGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgd2hlbiBuYXRpdmUgbm9kZXMgd2VyZSBkZXRlcm1pbmVkIC0gaXQgYWJzdHJhY3RzIGFuXG4gKiBhY3R1YWwgcmVuZGVyZXIgYmVpbmcgdXNlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5hdGl2ZUluc2VydEJlZm9yZShcbiAgICByZW5kZXJlcjogUmVuZGVyZXIzLCBwYXJlbnQ6IFJFbGVtZW50LCBjaGlsZDogUk5vZGUsIGJlZm9yZU5vZGU6IFJOb2RlIHwgbnVsbCk6IHZvaWQge1xuICBuZ0Rldk1vZGUgJiYgbmdEZXZNb2RlLnJlbmRlcmVySW5zZXJ0QmVmb3JlKys7XG4gIGlmIChpc1Byb2NlZHVyYWxSZW5kZXJlcihyZW5kZXJlcikpIHtcbiAgICByZW5kZXJlci5pbnNlcnRCZWZvcmUocGFyZW50LCBjaGlsZCwgYmVmb3JlTm9kZSk7XG4gIH0gZWxzZSB7XG4gICAgcGFyZW50Lmluc2VydEJlZm9yZShjaGlsZCwgYmVmb3JlTm9kZSwgdHJ1ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbmF0aXZlQXBwZW5kQ2hpbGQocmVuZGVyZXI6IFJlbmRlcmVyMywgcGFyZW50OiBSRWxlbWVudCwgY2hpbGQ6IFJOb2RlKTogdm9pZCB7XG4gIG5nRGV2TW9kZSAmJiBuZ0Rldk1vZGUucmVuZGVyZXJBcHBlbmRDaGlsZCsrO1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZChwYXJlbnQsICdwYXJlbnQgbm9kZSBtdXN0IGJlIGRlZmluZWQnKTtcbiAgaWYgKGlzUHJvY2VkdXJhbFJlbmRlcmVyKHJlbmRlcmVyKSkge1xuICAgIHJlbmRlcmVyLmFwcGVuZENoaWxkKHBhcmVudCwgY2hpbGQpO1xuICB9IGVsc2Uge1xuICAgIHBhcmVudC5hcHBlbmRDaGlsZChjaGlsZCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbmF0aXZlQXBwZW5kT3JJbnNlcnRCZWZvcmUoXG4gICAgcmVuZGVyZXI6IFJlbmRlcmVyMywgcGFyZW50OiBSRWxlbWVudCwgY2hpbGQ6IFJOb2RlLCBiZWZvcmVOb2RlOiBSTm9kZSB8IG51bGwpIHtcbiAgaWYgKGJlZm9yZU5vZGUgIT09IG51bGwpIHtcbiAgICBuYXRpdmVJbnNlcnRCZWZvcmUocmVuZGVyZXIsIHBhcmVudCwgY2hpbGQsIGJlZm9yZU5vZGUpO1xuICB9IGVsc2Uge1xuICAgIG5hdGl2ZUFwcGVuZENoaWxkKHJlbmRlcmVyLCBwYXJlbnQsIGNoaWxkKTtcbiAgfVxufVxuXG4vKiogUmVtb3ZlcyBhIG5vZGUgZnJvbSB0aGUgRE9NIGdpdmVuIGl0cyBuYXRpdmUgcGFyZW50LiAqL1xuZnVuY3Rpb24gbmF0aXZlUmVtb3ZlQ2hpbGQoXG4gICAgcmVuZGVyZXI6IFJlbmRlcmVyMywgcGFyZW50OiBSRWxlbWVudCwgY2hpbGQ6IFJOb2RlLCBpc0hvc3RFbGVtZW50PzogYm9vbGVhbik6IHZvaWQge1xuICBpZiAoaXNQcm9jZWR1cmFsUmVuZGVyZXIocmVuZGVyZXIpKSB7XG4gICAgcmVuZGVyZXIucmVtb3ZlQ2hpbGQocGFyZW50LCBjaGlsZCwgaXNIb3N0RWxlbWVudCk7XG4gIH0gZWxzZSB7XG4gICAgcGFyZW50LnJlbW92ZUNoaWxkKGNoaWxkKTtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgYSBuYXRpdmUgcGFyZW50IG9mIGEgZ2l2ZW4gbmF0aXZlIG5vZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuYXRpdmVQYXJlbnROb2RlKHJlbmRlcmVyOiBSZW5kZXJlcjMsIG5vZGU6IFJOb2RlKTogUkVsZW1lbnR8bnVsbCB7XG4gIHJldHVybiAoaXNQcm9jZWR1cmFsUmVuZGVyZXIocmVuZGVyZXIpID8gcmVuZGVyZXIucGFyZW50Tm9kZShub2RlKSA6IG5vZGUucGFyZW50Tm9kZSkgYXMgUkVsZW1lbnQ7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIG5hdGl2ZSBzaWJsaW5nIG9mIGEgZ2l2ZW4gbmF0aXZlIG5vZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuYXRpdmVOZXh0U2libGluZyhyZW5kZXJlcjogUmVuZGVyZXIzLCBub2RlOiBSTm9kZSk6IFJOb2RlfG51bGwge1xuICByZXR1cm4gaXNQcm9jZWR1cmFsUmVuZGVyZXIocmVuZGVyZXIpID8gcmVuZGVyZXIubmV4dFNpYmxpbmcobm9kZSkgOiBub2RlLm5leHRTaWJsaW5nO1xufVxuXG4vKipcbiAqIEZpbmRzIGEgbmF0aXZlIFwiYW5jaG9yXCIgbm9kZSBmb3IgY2FzZXMgd2hlcmUgd2UgY2FuJ3QgYXBwZW5kIGEgbmF0aXZlIGNoaWxkIGRpcmVjdGx5XG4gKiAoYGFwcGVuZENoaWxkYCkgYW5kIG5lZWQgdG8gdXNlIGEgcmVmZXJlbmNlIChhbmNob3IpIG5vZGUgZm9yIHRoZSBgaW5zZXJ0QmVmb3JlYCBvcGVyYXRpb24uXG4gKiBAcGFyYW0gcGFyZW50VE5vZGVcbiAqIEBwYXJhbSBsVmlld1xuICovXG5mdW5jdGlvbiBnZXROYXRpdmVBbmNob3JOb2RlKHBhcmVudFROb2RlOiBUTm9kZSwgbFZpZXc6IExWaWV3KTogUk5vZGV8bnVsbCB7XG4gIGlmIChwYXJlbnRUTm9kZS50eXBlID09PSBUTm9kZVR5cGUuVmlldykge1xuICAgIGNvbnN0IGxDb250YWluZXIgPSBnZXRMQ29udGFpbmVyKHBhcmVudFROb2RlIGFzIFRWaWV3Tm9kZSwgbFZpZXcpO1xuICAgIGlmIChsQ29udGFpbmVyID09PSBudWxsKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBpbmRleCA9IGxDb250YWluZXIuaW5kZXhPZihsVmlldywgQ09OVEFJTkVSX0hFQURFUl9PRkZTRVQpIC0gQ09OVEFJTkVSX0hFQURFUl9PRkZTRVQ7XG4gICAgcmV0dXJuIGdldEJlZm9yZU5vZGVGb3JWaWV3KGluZGV4LCBsQ29udGFpbmVyKTtcbiAgfSBlbHNlIGlmIChcbiAgICAgIHBhcmVudFROb2RlLnR5cGUgPT09IFROb2RlVHlwZS5FbGVtZW50Q29udGFpbmVyIHx8XG4gICAgICBwYXJlbnRUTm9kZS50eXBlID09PSBUTm9kZVR5cGUuSWN1Q29udGFpbmVyKSB7XG4gICAgcmV0dXJuIGdldE5hdGl2ZUJ5VE5vZGUocGFyZW50VE5vZGUsIGxWaWV3KTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBBcHBlbmRzIHRoZSBgY2hpbGRgIG5hdGl2ZSBub2RlIChvciBhIGNvbGxlY3Rpb24gb2Ygbm9kZXMpIHRvIHRoZSBgcGFyZW50YC5cbiAqXG4gKiBUaGUgZWxlbWVudCBpbnNlcnRpb24gbWlnaHQgYmUgZGVsYXllZCB7QGxpbmsgY2FuSW5zZXJ0TmF0aXZlTm9kZX0uXG4gKlxuICogQHBhcmFtIHRWaWV3IFRoZSBgVFZpZXcnIHRvIGJlIGFwcGVuZGVkXG4gKiBAcGFyYW0gbFZpZXcgVGhlIGN1cnJlbnQgTFZpZXdcbiAqIEBwYXJhbSBjaGlsZEVsIFRoZSBuYXRpdmUgY2hpbGQgKG9yIGNoaWxkcmVuKSB0aGF0IHNob3VsZCBiZSBhcHBlbmRlZFxuICogQHBhcmFtIGNoaWxkVE5vZGUgVGhlIFROb2RlIG9mIHRoZSBjaGlsZCBlbGVtZW50XG4gKiBAcmV0dXJucyBXaGV0aGVyIG9yIG5vdCB0aGUgY2hpbGQgd2FzIGFwcGVuZGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBlbmRDaGlsZChcbiAgICB0VmlldzogVFZpZXcsIGxWaWV3OiBMVmlldywgY2hpbGRFbDogUk5vZGUgfCBSTm9kZVtdLCBjaGlsZFROb2RlOiBUTm9kZSk6IHZvaWQge1xuICBjb25zdCByZW5kZXJQYXJlbnQgPSBnZXRSZW5kZXJQYXJlbnQodFZpZXcsIGNoaWxkVE5vZGUsIGxWaWV3KTtcbiAgaWYgKHJlbmRlclBhcmVudCAhPSBudWxsKSB7XG4gICAgY29uc3QgcmVuZGVyZXIgPSBsVmlld1tSRU5ERVJFUl07XG4gICAgY29uc3QgcGFyZW50VE5vZGU6IFROb2RlID0gY2hpbGRUTm9kZS5wYXJlbnQgfHwgbFZpZXdbVF9IT1NUXSAhO1xuICAgIGNvbnN0IGFuY2hvck5vZGUgPSBnZXROYXRpdmVBbmNob3JOb2RlKHBhcmVudFROb2RlLCBsVmlldyk7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoY2hpbGRFbCkpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRFbC5sZW5ndGg7IGkrKykge1xuICAgICAgICBuYXRpdmVBcHBlbmRPckluc2VydEJlZm9yZShyZW5kZXJlciwgcmVuZGVyUGFyZW50LCBjaGlsZEVsW2ldLCBhbmNob3JOb2RlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbmF0aXZlQXBwZW5kT3JJbnNlcnRCZWZvcmUocmVuZGVyZXIsIHJlbmRlclBhcmVudCwgY2hpbGRFbCwgYW5jaG9yTm9kZSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgZmlyc3QgbmF0aXZlIG5vZGUgZm9yIGEgZ2l2ZW4gTFZpZXcsIHN0YXJ0aW5nIGZyb20gdGhlIHByb3ZpZGVkIFROb2RlLlxuICpcbiAqIE5hdGl2ZSBub2RlcyBhcmUgcmV0dXJuZWQgaW4gdGhlIG9yZGVyIGluIHdoaWNoIHRob3NlIGFwcGVhciBpbiB0aGUgbmF0aXZlIHRyZWUgKERPTSkuXG4gKi9cbmZ1bmN0aW9uIGdldEZpcnN0TmF0aXZlTm9kZShsVmlldzogTFZpZXcsIHROb2RlOiBUTm9kZSB8IG51bGwpOiBSTm9kZXxudWxsIHtcbiAgaWYgKHROb2RlICE9PSBudWxsKSB7XG4gICAgbmdEZXZNb2RlICYmIGFzc2VydE5vZGVPZlBvc3NpYmxlVHlwZXMoXG4gICAgICAgICAgICAgICAgICAgICB0Tm9kZSwgVE5vZGVUeXBlLkVsZW1lbnQsIFROb2RlVHlwZS5Db250YWluZXIsIFROb2RlVHlwZS5FbGVtZW50Q29udGFpbmVyLFxuICAgICAgICAgICAgICAgICAgICAgVE5vZGVUeXBlLkljdUNvbnRhaW5lciwgVE5vZGVUeXBlLlByb2plY3Rpb24pO1xuXG4gICAgY29uc3QgdE5vZGVUeXBlID0gdE5vZGUudHlwZTtcbiAgICBpZiAodE5vZGVUeXBlID09PSBUTm9kZVR5cGUuRWxlbWVudCkge1xuICAgICAgcmV0dXJuIGdldE5hdGl2ZUJ5VE5vZGUodE5vZGUsIGxWaWV3KTtcbiAgICB9IGVsc2UgaWYgKHROb2RlVHlwZSA9PT0gVE5vZGVUeXBlLkNvbnRhaW5lcikge1xuICAgICAgcmV0dXJuIGdldEJlZm9yZU5vZGVGb3JWaWV3KC0xLCBsVmlld1t0Tm9kZS5pbmRleF0pO1xuICAgIH0gZWxzZSBpZiAodE5vZGVUeXBlID09PSBUTm9kZVR5cGUuRWxlbWVudENvbnRhaW5lciB8fCB0Tm9kZVR5cGUgPT09IFROb2RlVHlwZS5JY3VDb250YWluZXIpIHtcbiAgICAgIGNvbnN0IGVsSWN1Q29udGFpbmVyQ2hpbGQgPSB0Tm9kZS5jaGlsZDtcbiAgICAgIGlmIChlbEljdUNvbnRhaW5lckNoaWxkICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBnZXRGaXJzdE5hdGl2ZU5vZGUobFZpZXcsIGVsSWN1Q29udGFpbmVyQ2hpbGQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgck5vZGVPckxDb250YWluZXIgPSBsVmlld1t0Tm9kZS5pbmRleF07XG4gICAgICAgIGlmIChpc0xDb250YWluZXIock5vZGVPckxDb250YWluZXIpKSB7XG4gICAgICAgICAgcmV0dXJuIGdldEJlZm9yZU5vZGVGb3JWaWV3KC0xLCByTm9kZU9yTENvbnRhaW5lcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHVud3JhcFJOb2RlKHJOb2RlT3JMQ29udGFpbmVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBjb21wb25lbnRWaWV3ID0gbFZpZXdbREVDTEFSQVRJT05fQ09NUE9ORU5UX1ZJRVddO1xuICAgICAgY29uc3QgY29tcG9uZW50SG9zdCA9IGNvbXBvbmVudFZpZXdbVF9IT1NUXSBhcyBURWxlbWVudE5vZGU7XG4gICAgICBjb25zdCBwYXJlbnRWaWV3ID0gZ2V0TFZpZXdQYXJlbnQoY29tcG9uZW50Vmlldyk7XG4gICAgICBjb25zdCBmaXJzdFByb2plY3RlZFROb2RlOiBUTm9kZXxudWxsID1cbiAgICAgICAgICAoY29tcG9uZW50SG9zdC5wcm9qZWN0aW9uIGFzKFROb2RlIHwgbnVsbClbXSlbdE5vZGUucHJvamVjdGlvbiBhcyBudW1iZXJdO1xuXG4gICAgICBpZiAoZmlyc3RQcm9qZWN0ZWRUTm9kZSAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBnZXRGaXJzdE5hdGl2ZU5vZGUocGFyZW50VmlldyAhLCBmaXJzdFByb2plY3RlZFROb2RlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBnZXRGaXJzdE5hdGl2ZU5vZGUobFZpZXcsIHROb2RlLm5leHQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QmVmb3JlTm9kZUZvclZpZXcodmlld0luZGV4SW5Db250YWluZXI6IG51bWJlciwgbENvbnRhaW5lcjogTENvbnRhaW5lcik6IFJOb2RlfFxuICAgIG51bGwge1xuICBjb25zdCBuZXh0Vmlld0luZGV4ID0gQ09OVEFJTkVSX0hFQURFUl9PRkZTRVQgKyB2aWV3SW5kZXhJbkNvbnRhaW5lciArIDE7XG4gIGlmIChuZXh0Vmlld0luZGV4IDwgbENvbnRhaW5lci5sZW5ndGgpIHtcbiAgICBjb25zdCBsVmlldyA9IGxDb250YWluZXJbbmV4dFZpZXdJbmRleF0gYXMgTFZpZXc7XG4gICAgY29uc3QgZmlyc3RUTm9kZU9mVmlldyA9IGxWaWV3W1RWSUVXXS5maXJzdENoaWxkO1xuICAgIGlmIChmaXJzdFROb2RlT2ZWaWV3ICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZ2V0Rmlyc3ROYXRpdmVOb2RlKGxWaWV3LCBmaXJzdFROb2RlT2ZWaWV3KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbENvbnRhaW5lcltOQVRJVkVdO1xufVxuXG4vKipcbiAqIFJlbW92ZXMgYSBuYXRpdmUgbm9kZSBpdHNlbGYgdXNpbmcgYSBnaXZlbiByZW5kZXJlci4gVG8gcmVtb3ZlIHRoZSBub2RlIHdlIGFyZSBsb29raW5nIHVwIGl0c1xuICogcGFyZW50IGZyb20gdGhlIG5hdGl2ZSB0cmVlIGFzIG5vdCBhbGwgcGxhdGZvcm1zIC8gYnJvd3NlcnMgc3VwcG9ydCB0aGUgZXF1aXZhbGVudCBvZlxuICogbm9kZS5yZW1vdmUoKS5cbiAqXG4gKiBAcGFyYW0gcmVuZGVyZXIgQSByZW5kZXJlciB0byBiZSB1c2VkXG4gKiBAcGFyYW0gck5vZGUgVGhlIG5hdGl2ZSBub2RlIHRoYXQgc2hvdWxkIGJlIHJlbW92ZWRcbiAqIEBwYXJhbSBpc0hvc3RFbGVtZW50IEEgZmxhZyBpbmRpY2F0aW5nIGlmIGEgbm9kZSB0byBiZSByZW1vdmVkIGlzIGEgaG9zdCBvZiBhIGNvbXBvbmVudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5hdGl2ZVJlbW92ZU5vZGUocmVuZGVyZXI6IFJlbmRlcmVyMywgck5vZGU6IFJOb2RlLCBpc0hvc3RFbGVtZW50PzogYm9vbGVhbik6IHZvaWQge1xuICBjb25zdCBuYXRpdmVQYXJlbnQgPSBuYXRpdmVQYXJlbnROb2RlKHJlbmRlcmVyLCByTm9kZSk7XG4gIGlmIChuYXRpdmVQYXJlbnQpIHtcbiAgICBuYXRpdmVSZW1vdmVDaGlsZChyZW5kZXJlciwgbmF0aXZlUGFyZW50LCByTm9kZSwgaXNIb3N0RWxlbWVudCk7XG4gIH1cbn1cblxuXG4vKipcbiAqIFBlcmZvcm1zIHRoZSBvcGVyYXRpb24gb2YgYGFjdGlvbmAgb24gdGhlIG5vZGUuIFR5cGljYWxseSB0aGlzIGludm9sdmVzIGluc2VydGluZyBvciByZW1vdmluZ1xuICogbm9kZXMgb24gdGhlIExWaWV3IG9yIHByb2plY3Rpb24gYm91bmRhcnkuXG4gKi9cbmZ1bmN0aW9uIGFwcGx5Tm9kZXMoXG4gICAgcmVuZGVyZXI6IFJlbmRlcmVyMywgYWN0aW9uOiBXYWxrVE5vZGVUcmVlQWN0aW9uLCB0Tm9kZTogVE5vZGUgfCBudWxsLCBsVmlldzogTFZpZXcsXG4gICAgcmVuZGVyUGFyZW50OiBSRWxlbWVudCB8IG51bGwsIGJlZm9yZU5vZGU6IFJOb2RlIHwgbnVsbCwgaXNQcm9qZWN0aW9uOiBib29sZWFuKSB7XG4gIHdoaWxlICh0Tm9kZSAhPSBudWxsKSB7XG4gICAgbmdEZXZNb2RlICYmIGFzc2VydFROb2RlRm9yTFZpZXcodE5vZGUsIGxWaWV3KTtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0Tm9kZU9mUG9zc2libGVUeXBlcyhcbiAgICAgICAgICAgICAgICAgICAgIHROb2RlLCBUTm9kZVR5cGUuQ29udGFpbmVyLCBUTm9kZVR5cGUuRWxlbWVudCwgVE5vZGVUeXBlLkVsZW1lbnRDb250YWluZXIsXG4gICAgICAgICAgICAgICAgICAgICBUTm9kZVR5cGUuUHJvamVjdGlvbiwgVE5vZGVUeXBlLlByb2plY3Rpb24sIFROb2RlVHlwZS5JY3VDb250YWluZXIpO1xuICAgIGNvbnN0IHJhd1Nsb3RWYWx1ZSA9IGxWaWV3W3ROb2RlLmluZGV4XTtcbiAgICBjb25zdCB0Tm9kZVR5cGUgPSB0Tm9kZS50eXBlO1xuICAgIGlmIChpc1Byb2plY3Rpb24pIHtcbiAgICAgIGlmIChhY3Rpb24gPT09IFdhbGtUTm9kZVRyZWVBY3Rpb24uQ3JlYXRlKSB7XG4gICAgICAgIHJhd1Nsb3RWYWx1ZSAmJiBhdHRhY2hQYXRjaERhdGEodW53cmFwUk5vZGUocmF3U2xvdFZhbHVlKSwgbFZpZXcpO1xuICAgICAgICB0Tm9kZS5mbGFncyB8PSBUTm9kZUZsYWdzLmlzUHJvamVjdGVkO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoKHROb2RlLmZsYWdzICYgVE5vZGVGbGFncy5pc0RldGFjaGVkKSAhPT0gVE5vZGVGbGFncy5pc0RldGFjaGVkKSB7XG4gICAgICBpZiAodE5vZGVUeXBlID09PSBUTm9kZVR5cGUuRWxlbWVudENvbnRhaW5lciB8fCB0Tm9kZVR5cGUgPT09IFROb2RlVHlwZS5JY3VDb250YWluZXIpIHtcbiAgICAgICAgYXBwbHlOb2RlcyhyZW5kZXJlciwgYWN0aW9uLCB0Tm9kZS5jaGlsZCwgbFZpZXcsIHJlbmRlclBhcmVudCwgYmVmb3JlTm9kZSwgZmFsc2UpO1xuICAgICAgICBhcHBseVRvRWxlbWVudE9yQ29udGFpbmVyKGFjdGlvbiwgcmVuZGVyZXIsIHJlbmRlclBhcmVudCwgcmF3U2xvdFZhbHVlLCBiZWZvcmVOb2RlKTtcbiAgICAgIH0gZWxzZSBpZiAodE5vZGVUeXBlID09PSBUTm9kZVR5cGUuUHJvamVjdGlvbikge1xuICAgICAgICBhcHBseVByb2plY3Rpb25SZWN1cnNpdmUoXG4gICAgICAgICAgICByZW5kZXJlciwgYWN0aW9uLCBsVmlldywgdE5vZGUgYXMgVFByb2plY3Rpb25Ob2RlLCByZW5kZXJQYXJlbnQsIGJlZm9yZU5vZGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmdEZXZNb2RlICYmIGFzc2VydE5vZGVPZlBvc3NpYmxlVHlwZXModE5vZGUsIFROb2RlVHlwZS5FbGVtZW50LCBUTm9kZVR5cGUuQ29udGFpbmVyKTtcbiAgICAgICAgYXBwbHlUb0VsZW1lbnRPckNvbnRhaW5lcihhY3Rpb24sIHJlbmRlcmVyLCByZW5kZXJQYXJlbnQsIHJhd1Nsb3RWYWx1ZSwgYmVmb3JlTm9kZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHROb2RlID0gaXNQcm9qZWN0aW9uID8gdE5vZGUucHJvamVjdGlvbk5leHQgOiB0Tm9kZS5uZXh0O1xuICB9XG59XG5cblxuLyoqXG4gKiBgYXBwbHlWaWV3YCBwZXJmb3JtcyBvcGVyYXRpb24gb24gdGhlIHZpZXcgYXMgc3BlY2lmaWVkIGluIGBhY3Rpb25gIChpbnNlcnQsIGRldGFjaCwgZGVzdHJveSlcbiAqXG4gKiBJbnNlcnRpbmcgYSB2aWV3IHdpdGhvdXQgcHJvamVjdGlvbiBvciBjb250YWluZXJzIGF0IHRvcCBsZXZlbCBpcyBzaW1wbGUuIEp1c3QgaXRlcmF0ZSBvdmVyIHRoZVxuICogcm9vdCBub2RlcyBvZiB0aGUgVmlldywgYW5kIGZvciBlYWNoIG5vZGUgcGVyZm9ybSB0aGUgYGFjdGlvbmAuXG4gKlxuICogVGhpbmdzIGdldCBtb3JlIGNvbXBsaWNhdGVkIHdpdGggY29udGFpbmVycyBhbmQgcHJvamVjdGlvbnMuIFRoYXQgaXMgYmVjYXVzZSBjb21pbmcgYWNyb3NzOlxuICogLSBDb250YWluZXI6IGltcGxpZXMgdGhhdCB3ZSBoYXZlIHRvIGluc2VydC9yZW1vdmUvZGVzdHJveSB0aGUgdmlld3Mgb2YgdGhhdCBjb250YWluZXIgYXMgd2VsbFxuICogICAgICAgICAgICAgIHdoaWNoIGluIHR1cm4gY2FuIGhhdmUgdGhlaXIgb3duIENvbnRhaW5lcnMgYXQgdGhlIFZpZXcgcm9vdHMuXG4gKiAtIFByb2plY3Rpb246IGltcGxpZXMgdGhhdCB3ZSBoYXZlIHRvIGluc2VydC9yZW1vdmUvZGVzdHJveSB0aGUgbm9kZXMgb2YgdGhlIHByb2plY3Rpb24uIFRoZVxuICogICAgICAgICAgICAgICBjb21wbGljYXRpb24gaXMgdGhhdCB0aGUgbm9kZXMgd2UgYXJlIHByb2plY3RpbmcgY2FuIHRoZW1zZWx2ZXMgaGF2ZSBDb250YWluZXJzXG4gKiAgICAgICAgICAgICAgIG9yIG90aGVyIFByb2plY3Rpb25zLlxuICpcbiAqIEFzIHlvdSBjYW4gc2VlIHRoaXMgaXMgYSB2ZXJ5IHJlY3Vyc2l2ZSBwcm9ibGVtLiBZZXMgcmVjdXJzaW9uIGlzIG5vdCBtb3N0IGVmZmljaWVudCBidXQgdGhlXG4gKiBjb2RlIGlzIGNvbXBsaWNhdGVkIGVub3VnaCB0aGF0IHRyeWluZyB0byBpbXBsZW1lbnRlZCB3aXRoIHJlY3Vyc2lvbiBiZWNvbWVzIHVubWFpbnRhaW5hYmxlLlxuICpcbiAqIEBwYXJhbSB0VmlldyBUaGUgYFRWaWV3JyB3aGljaCBuZWVkcyB0byBiZSBpbnNlcnRlZCwgZGV0YWNoZWQsIGRlc3Ryb3llZFxuICogQHBhcmFtIGxWaWV3IFRoZSBMVmlldyB3aGljaCBuZWVkcyB0byBiZSBpbnNlcnRlZCwgZGV0YWNoZWQsIGRlc3Ryb3llZC5cbiAqIEBwYXJhbSByZW5kZXJlciBSZW5kZXJlciB0byB1c2VcbiAqIEBwYXJhbSBhY3Rpb24gYWN0aW9uIHRvIHBlcmZvcm0gKGluc2VydCwgZGV0YWNoLCBkZXN0cm95KVxuICogQHBhcmFtIHJlbmRlclBhcmVudCBwYXJlbnQgRE9NIGVsZW1lbnQgZm9yIGluc2VydGlvbi9yZW1vdmFsLlxuICogQHBhcmFtIGJlZm9yZU5vZGUgQmVmb3JlIHdoaWNoIG5vZGUgdGhlIGluc2VydGlvbnMgc2hvdWxkIGhhcHBlbi5cbiAqL1xuZnVuY3Rpb24gYXBwbHlWaWV3KFxuICAgIHRWaWV3OiBUVmlldywgbFZpZXc6IExWaWV3LCByZW5kZXJlcjogUmVuZGVyZXIzLCBhY3Rpb246IFdhbGtUTm9kZVRyZWVBY3Rpb24sXG4gICAgcmVuZGVyUGFyZW50OiBSRWxlbWVudCB8IG51bGwsIGJlZm9yZU5vZGU6IFJOb2RlIHwgbnVsbCkge1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0Tm9kZVR5cGUodFZpZXcubm9kZSAhLCBUTm9kZVR5cGUuVmlldyk7XG4gIGNvbnN0IHZpZXdSb290VE5vZGU6IFROb2RlfG51bGwgPSB0Vmlldy5ub2RlICEuY2hpbGQ7XG4gIGFwcGx5Tm9kZXMocmVuZGVyZXIsIGFjdGlvbiwgdmlld1Jvb3RUTm9kZSwgbFZpZXcsIHJlbmRlclBhcmVudCwgYmVmb3JlTm9kZSwgZmFsc2UpO1xufVxuXG4vKipcbiAqIGBhcHBseVByb2plY3Rpb25gIHBlcmZvcm1zIG9wZXJhdGlvbiBvbiB0aGUgcHJvamVjdGlvbi5cbiAqXG4gKiBJbnNlcnRpbmcgYSBwcm9qZWN0aW9uIHJlcXVpcmVzIHVzIHRvIGxvY2F0ZSB0aGUgcHJvamVjdGVkIG5vZGVzIGZyb20gdGhlIHBhcmVudCBjb21wb25lbnQuIFRoZVxuICogY29tcGxpY2F0aW9uIGlzIHRoYXQgdGhvc2Ugbm9kZXMgdGhlbXNlbHZlcyBjb3VsZCBiZSByZS1wcm9qZWN0ZWQgZnJvbSB0aGVpciBwYXJlbnQgY29tcG9uZW50LlxuICpcbiAqIEBwYXJhbSB0VmlldyBUaGUgYFRWaWV3YCBvZiBgTFZpZXdgIHdoaWNoIG5lZWRzIHRvIGJlIGluc2VydGVkLCBkZXRhY2hlZCwgZGVzdHJveWVkXG4gKiBAcGFyYW0gbFZpZXcgVGhlIGBMVmlld2Agd2hpY2ggbmVlZHMgdG8gYmUgaW5zZXJ0ZWQsIGRldGFjaGVkLCBkZXN0cm95ZWQuXG4gKiBAcGFyYW0gdFByb2plY3Rpb25Ob2RlIG5vZGUgdG8gcHJvamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQcm9qZWN0aW9uKHRWaWV3OiBUVmlldywgbFZpZXc6IExWaWV3LCB0UHJvamVjdGlvbk5vZGU6IFRQcm9qZWN0aW9uTm9kZSkge1xuICBjb25zdCByZW5kZXJlciA9IGxWaWV3W1JFTkRFUkVSXTtcbiAgY29uc3QgcmVuZGVyUGFyZW50ID0gZ2V0UmVuZGVyUGFyZW50KHRWaWV3LCB0UHJvamVjdGlvbk5vZGUsIGxWaWV3KTtcbiAgY29uc3QgcGFyZW50VE5vZGUgPSB0UHJvamVjdGlvbk5vZGUucGFyZW50IHx8IGxWaWV3W1RfSE9TVF0gITtcbiAgbGV0IGJlZm9yZU5vZGUgPSBnZXROYXRpdmVBbmNob3JOb2RlKHBhcmVudFROb2RlLCBsVmlldyk7XG4gIGFwcGx5UHJvamVjdGlvblJlY3Vyc2l2ZShcbiAgICAgIHJlbmRlcmVyLCBXYWxrVE5vZGVUcmVlQWN0aW9uLkNyZWF0ZSwgbFZpZXcsIHRQcm9qZWN0aW9uTm9kZSwgcmVuZGVyUGFyZW50LCBiZWZvcmVOb2RlKTtcbn1cblxuLyoqXG4gKiBgYXBwbHlQcm9qZWN0aW9uUmVjdXJzaXZlYCBwZXJmb3JtcyBvcGVyYXRpb24gb24gdGhlIHByb2plY3Rpb24gc3BlY2lmaWVkIGJ5IGBhY3Rpb25gIChpbnNlcnQsXG4gKiBkZXRhY2gsIGRlc3Ryb3kpXG4gKlxuICogSW5zZXJ0aW5nIGEgcHJvamVjdGlvbiByZXF1aXJlcyB1cyB0byBsb2NhdGUgdGhlIHByb2plY3RlZCBub2RlcyBmcm9tIHRoZSBwYXJlbnQgY29tcG9uZW50LiBUaGVcbiAqIGNvbXBsaWNhdGlvbiBpcyB0aGF0IHRob3NlIG5vZGVzIHRoZW1zZWx2ZXMgY291bGQgYmUgcmUtcHJvamVjdGVkIGZyb20gdGhlaXIgcGFyZW50IGNvbXBvbmVudC5cbiAqXG4gKiBAcGFyYW0gcmVuZGVyZXIgUmVuZGVyIHRvIHVzZVxuICogQHBhcmFtIGFjdGlvbiBhY3Rpb24gdG8gcGVyZm9ybSAoaW5zZXJ0LCBkZXRhY2gsIGRlc3Ryb3kpXG4gKiBAcGFyYW0gbFZpZXcgVGhlIExWaWV3IHdoaWNoIG5lZWRzIHRvIGJlIGluc2VydGVkLCBkZXRhY2hlZCwgZGVzdHJveWVkLlxuICogQHBhcmFtIHRQcm9qZWN0aW9uTm9kZSBub2RlIHRvIHByb2plY3RcbiAqIEBwYXJhbSByZW5kZXJQYXJlbnQgcGFyZW50IERPTSBlbGVtZW50IGZvciBpbnNlcnRpb24vcmVtb3ZhbC5cbiAqIEBwYXJhbSBiZWZvcmVOb2RlIEJlZm9yZSB3aGljaCBub2RlIHRoZSBpbnNlcnRpb25zIHNob3VsZCBoYXBwZW4uXG4gKi9cbmZ1bmN0aW9uIGFwcGx5UHJvamVjdGlvblJlY3Vyc2l2ZShcbiAgICByZW5kZXJlcjogUmVuZGVyZXIzLCBhY3Rpb246IFdhbGtUTm9kZVRyZWVBY3Rpb24sIGxWaWV3OiBMVmlldyxcbiAgICB0UHJvamVjdGlvbk5vZGU6IFRQcm9qZWN0aW9uTm9kZSwgcmVuZGVyUGFyZW50OiBSRWxlbWVudCB8IG51bGwsIGJlZm9yZU5vZGU6IFJOb2RlIHwgbnVsbCkge1xuICBjb25zdCBjb21wb25lbnRMVmlldyA9IGxWaWV3W0RFQ0xBUkFUSU9OX0NPTVBPTkVOVF9WSUVXXTtcbiAgY29uc3QgY29tcG9uZW50Tm9kZSA9IGNvbXBvbmVudExWaWV3W1RfSE9TVF0gYXMgVEVsZW1lbnROb2RlO1xuICBuZ0Rldk1vZGUgJiZcbiAgICAgIGFzc2VydEVxdWFsKHR5cGVvZiB0UHJvamVjdGlvbk5vZGUucHJvamVjdGlvbiwgJ251bWJlcicsICdleHBlY3RpbmcgcHJvamVjdGlvbiBpbmRleCcpO1xuICBjb25zdCBub2RlVG9Qcm9qZWN0T3JSTm9kZXMgPSBjb21wb25lbnROb2RlLnByb2plY3Rpb24gIVt0UHJvamVjdGlvbk5vZGUucHJvamVjdGlvbl0gITtcbiAgaWYgKEFycmF5LmlzQXJyYXkobm9kZVRvUHJvamVjdE9yUk5vZGVzKSkge1xuICAgIC8vIFRoaXMgc2hvdWxkIG5vdCBleGlzdCwgaXQgaXMgYSBiaXQgb2YgYSBoYWNrLiBXaGVuIHdlIGJvb3RzdHJhcCBhIHRvcCBsZXZlbCBub2RlIGFuZCB3ZVxuICAgIC8vIG5lZWQgdG8gc3VwcG9ydCBwYXNzaW5nIHByb2plY3RhYmxlIG5vZGVzLCBzbyB3ZSBjaGVhdCBhbmQgcHV0IHRoZW0gaW4gdGhlIFROb2RlXG4gICAgLy8gb2YgdGhlIEhvc3QgVFZpZXcuIChZZXMgd2UgcHV0IGluc3RhbmNlIGluZm8gYXQgdGhlIFQgTGV2ZWwpLiBXZSBjYW4gZ2V0IGF3YXkgd2l0aCBpdFxuICAgIC8vIGJlY2F1c2Ugd2Uga25vdyB0aGF0IHRoYXQgVFZpZXcgaXMgbm90IHNoYXJlZCBhbmQgdGhlcmVmb3JlIGl0IHdpbGwgbm90IGJlIGEgcHJvYmxlbS5cbiAgICAvLyBUaGlzIHNob3VsZCBiZSByZWZhY3RvcmVkIGFuZCBjbGVhbmVkIHVwLlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZVRvUHJvamVjdE9yUk5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCByTm9kZSA9IG5vZGVUb1Byb2plY3RPclJOb2Rlc1tpXTtcbiAgICAgIGFwcGx5VG9FbGVtZW50T3JDb250YWluZXIoYWN0aW9uLCByZW5kZXJlciwgcmVuZGVyUGFyZW50LCByTm9kZSwgYmVmb3JlTm9kZSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGxldCBub2RlVG9Qcm9qZWN0OiBUTm9kZXxudWxsID0gbm9kZVRvUHJvamVjdE9yUk5vZGVzO1xuICAgIGNvbnN0IHByb2plY3RlZENvbXBvbmVudExWaWV3ID0gY29tcG9uZW50TFZpZXdbUEFSRU5UXSBhcyBMVmlldztcbiAgICBhcHBseU5vZGVzKFxuICAgICAgICByZW5kZXJlciwgYWN0aW9uLCBub2RlVG9Qcm9qZWN0LCBwcm9qZWN0ZWRDb21wb25lbnRMVmlldywgcmVuZGVyUGFyZW50LCBiZWZvcmVOb2RlLCB0cnVlKTtcbiAgfVxufVxuXG5cbi8qKlxuICogYGFwcGx5Q29udGFpbmVyYCBwZXJmb3JtcyBhbiBvcGVyYXRpb24gb24gdGhlIGNvbnRhaW5lciBhbmQgaXRzIHZpZXdzIGFzIHNwZWNpZmllZCBieVxuICogYGFjdGlvbmAgKGluc2VydCwgZGV0YWNoLCBkZXN0cm95KVxuICpcbiAqIEluc2VydGluZyBhIENvbnRhaW5lciBpcyBjb21wbGljYXRlZCBieSB0aGUgZmFjdCB0aGF0IHRoZSBjb250YWluZXIgbWF5IGhhdmUgVmlld3Mgd2hpY2hcbiAqIHRoZW1zZWx2ZXMgaGF2ZSBjb250YWluZXJzIG9yIHByb2plY3Rpb25zLlxuICpcbiAqIEBwYXJhbSByZW5kZXJlciBSZW5kZXJlciB0byB1c2VcbiAqIEBwYXJhbSBhY3Rpb24gYWN0aW9uIHRvIHBlcmZvcm0gKGluc2VydCwgZGV0YWNoLCBkZXN0cm95KVxuICogQHBhcmFtIGxDb250YWluZXIgVGhlIExDb250YWluZXIgd2hpY2ggbmVlZHMgdG8gYmUgaW5zZXJ0ZWQsIGRldGFjaGVkLCBkZXN0cm95ZWQuXG4gKiBAcGFyYW0gcmVuZGVyUGFyZW50IHBhcmVudCBET00gZWxlbWVudCBmb3IgaW5zZXJ0aW9uL3JlbW92YWwuXG4gKiBAcGFyYW0gYmVmb3JlTm9kZSBCZWZvcmUgd2hpY2ggbm9kZSB0aGUgaW5zZXJ0aW9ucyBzaG91bGQgaGFwcGVuLlxuICovXG5mdW5jdGlvbiBhcHBseUNvbnRhaW5lcihcbiAgICByZW5kZXJlcjogUmVuZGVyZXIzLCBhY3Rpb246IFdhbGtUTm9kZVRyZWVBY3Rpb24sIGxDb250YWluZXI6IExDb250YWluZXIsXG4gICAgcmVuZGVyUGFyZW50OiBSRWxlbWVudCB8IG51bGwsIGJlZm9yZU5vZGU6IFJOb2RlIHwgbnVsbCB8IHVuZGVmaW5lZCkge1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0TENvbnRhaW5lcihsQ29udGFpbmVyKTtcbiAgY29uc3QgYW5jaG9yID0gbENvbnRhaW5lcltOQVRJVkVdOyAgLy8gTENvbnRhaW5lciBoYXMgaXRzIG93biBiZWZvcmUgbm9kZS5cbiAgY29uc3QgbmF0aXZlID0gdW53cmFwUk5vZGUobENvbnRhaW5lcik7XG4gIC8vIEFuIExDb250YWluZXIgY2FuIGJlIGNyZWF0ZWQgZHluYW1pY2FsbHkgb24gYW55IG5vZGUgYnkgaW5qZWN0aW5nIFZpZXdDb250YWluZXJSZWYuXG4gIC8vIEFza2luZyBmb3IgYSBWaWV3Q29udGFpbmVyUmVmIG9uIGFuIGVsZW1lbnQgd2lsbCByZXN1bHQgaW4gYSBjcmVhdGlvbiBvZiBhIHNlcGFyYXRlIGFuY2hvciBub2RlXG4gIC8vIChjb21tZW50IGluIHRoZSBET00pIHRoYXQgd2lsbCBiZSBkaWZmZXJlbnQgZnJvbSB0aGUgTENvbnRhaW5lcidzIGhvc3Qgbm9kZS4gSW4gdGhpcyBwYXJ0aWN1bGFyXG4gIC8vIGNhc2Ugd2UgbmVlZCB0byBleGVjdXRlIGFjdGlvbiBvbiAyIG5vZGVzOlxuICAvLyAtIGNvbnRhaW5lcidzIGhvc3Qgbm9kZSAodGhpcyBpcyBkb25lIGluIHRoZSBleGVjdXRlQWN0aW9uT25FbGVtZW50T3JDb250YWluZXIpXG4gIC8vIC0gY29udGFpbmVyJ3MgaG9zdCBub2RlICh0aGlzIGlzIGRvbmUgaGVyZSlcbiAgaWYgKGFuY2hvciAhPT0gbmF0aXZlKSB7XG4gICAgLy8gVGhpcyBpcyB2ZXJ5IHN0cmFuZ2UgdG8gbWUgKE1pc2tvKS4gSSB3b3VsZCBleHBlY3QgdGhhdCB0aGUgbmF0aXZlIGlzIHNhbWUgYXMgYW5jaG9yLiBJIGRvbid0XG4gICAgLy8gc2VlIGEgcmVhc29uIHdoeSB0aGV5IHNob3VsZCBiZSBkaWZmZXJlbnQsIGJ1dCB0aGV5IGFyZS5cbiAgICAvL1xuICAgIC8vIElmIHRoZXkgYXJlIHdlIG5lZWQgdG8gcHJvY2VzcyB0aGUgc2Vjb25kIGFuY2hvciBhcyB3ZWxsLlxuICAgIGFwcGx5VG9FbGVtZW50T3JDb250YWluZXIoYWN0aW9uLCByZW5kZXJlciwgcmVuZGVyUGFyZW50LCBhbmNob3IsIGJlZm9yZU5vZGUpO1xuICB9XG4gIGZvciAobGV0IGkgPSBDT05UQUlORVJfSEVBREVSX09GRlNFVDsgaSA8IGxDb250YWluZXIubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBsVmlldyA9IGxDb250YWluZXJbaV0gYXMgTFZpZXc7XG4gICAgYXBwbHlWaWV3KGxWaWV3W1RWSUVXXSwgbFZpZXcsIHJlbmRlcmVyLCBhY3Rpb24sIHJlbmRlclBhcmVudCwgYW5jaG9yKTtcbiAgfVxufVxuXG4vKipcbiAqIFdyaXRlcyBjbGFzcy9zdHlsZSB0byBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSByZW5kZXJlciBSZW5kZXJlciB0byB1c2UuXG4gKiBAcGFyYW0gaXNDbGFzc0Jhc2VkIGB0cnVlYCBpZiBpdCBzaG91bGQgYmUgd3JpdHRlbiB0byBgY2xhc3NgIChgZmFsc2VgIHRvIHdyaXRlIHRvIGBzdHlsZWApXG4gKiBAcGFyYW0gck5vZGUgVGhlIE5vZGUgdG8gd3JpdGUgdG8uXG4gKiBAcGFyYW0gcHJvcCBQcm9wZXJ0eSB0byB3cml0ZSB0by4gVGhpcyB3b3VsZCBiZSB0aGUgY2xhc3Mvc3R5bGUgbmFtZS5cbiAqIEBwYXJhbSB2YWx1ZSBWYWx1ZSB0byB3cml0ZS4gSWYgYG51bGxgL2B1bmRlZmluZWRgL2BmYWxzZWAgdGhpcyBpcyBjb25zaWRlcmVkIGEgcmVtb3ZlIChzZXQvYWRkXG4gKiAgICAgICAgb3RoZXJ3aXNlKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5U3R5bGluZyhcbiAgICByZW5kZXJlcjogUmVuZGVyZXIzLCBpc0NsYXNzQmFzZWQ6IGJvb2xlYW4sIHJOb2RlOiBSRWxlbWVudCwgcHJvcDogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gIGNvbnN0IGlzUHJvY2VkdXJhbCA9IGlzUHJvY2VkdXJhbFJlbmRlcmVyKHJlbmRlcmVyKTtcbiAgaWYgKGlzQ2xhc3NCYXNlZCkge1xuICAgIC8vIFdlIGFjdHVhbGx5IHdhbnQgSlMgdHJ1ZS9mYWxzZSBoZXJlIGJlY2F1c2UgYW55IHRydXRoeSB2YWx1ZSBzaG91bGQgYWRkIHRoZSBjbGFzc1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIG5nRGV2TW9kZSAmJiBuZ0Rldk1vZGUucmVuZGVyZXJSZW1vdmVDbGFzcysrO1xuICAgICAgaWYgKGlzUHJvY2VkdXJhbCkge1xuICAgICAgICAocmVuZGVyZXIgYXMgUmVuZGVyZXIyKS5yZW1vdmVDbGFzcyhyTm9kZSwgcHJvcCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAock5vZGUgYXMgSFRNTEVsZW1lbnQpLmNsYXNzTGlzdC5yZW1vdmUocHJvcCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG5nRGV2TW9kZSAmJiBuZ0Rldk1vZGUucmVuZGVyZXJBZGRDbGFzcysrO1xuICAgICAgaWYgKGlzUHJvY2VkdXJhbCkge1xuICAgICAgICAocmVuZGVyZXIgYXMgUmVuZGVyZXIyKS5hZGRDbGFzcyhyTm9kZSwgcHJvcCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZCgock5vZGUgYXMgSFRNTEVsZW1lbnQpLmNsYXNzTGlzdCwgJ0hUTUxFbGVtZW50IGV4cGVjdGVkJyk7XG4gICAgICAgIChyTm9kZSBhcyBIVE1MRWxlbWVudCkuY2xhc3NMaXN0LmFkZChwcm9wKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gVE9ETyhtaXNrbyk6IENhbid0IGltcG9ydCBSZW5kZXJlclN0eWxlRmxhZ3MyLkRhc2hDYXNlIGFzIGl0IGNhdXNlcyBpbXBvcnRzIHRvIGJlIHJlc29sdmVkIGluXG4gICAgLy8gZGlmZmVyZW50IG9yZGVyIHdoaWNoIGNhdXNlcyBmYWlsdXJlcy4gVXNpbmcgZGlyZWN0IGNvbnN0YW50IGFzIHdvcmthcm91bmQgZm9yIG5vdy5cbiAgICBjb25zdCBmbGFncyA9IHByb3AuaW5kZXhPZignLScpID09IC0xID8gdW5kZWZpbmVkIDogMiAvKiBSZW5kZXJlclN0eWxlRmxhZ3MyLkRhc2hDYXNlICovO1xuICAgIGlmICh2YWx1ZSA9PSBudWxsIC8qKiB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkICovKSB7XG4gICAgICBuZ0Rldk1vZGUgJiYgbmdEZXZNb2RlLnJlbmRlcmVyUmVtb3ZlU3R5bGUrKztcbiAgICAgIGlmIChpc1Byb2NlZHVyYWwpIHtcbiAgICAgICAgKHJlbmRlcmVyIGFzIFJlbmRlcmVyMikucmVtb3ZlU3R5bGUock5vZGUsIHByb3AsIGZsYWdzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIChyTm9kZSBhcyBIVE1MRWxlbWVudCkuc3R5bGUucmVtb3ZlUHJvcGVydHkocHJvcCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG5nRGV2TW9kZSAmJiBuZ0Rldk1vZGUucmVuZGVyZXJTZXRTdHlsZSsrO1xuICAgICAgaWYgKGlzUHJvY2VkdXJhbCkge1xuICAgICAgICAocmVuZGVyZXIgYXMgUmVuZGVyZXIyKS5zZXRTdHlsZShyTm9kZSwgcHJvcCwgdmFsdWUsIGZsYWdzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKChyTm9kZSBhcyBIVE1MRWxlbWVudCkuc3R5bGUsICdIVE1MRWxlbWVudCBleHBlY3RlZCcpO1xuICAgICAgICAock5vZGUgYXMgSFRNTEVsZW1lbnQpLnN0eWxlLnNldFByb3BlcnR5KHByb3AsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuXG4vKipcbiAqIFdyaXRlIGBjc3NUZXh0YCB0byBgUkVsZW1lbnRgLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gZG9lcyBkaXJlY3Qgd3JpdGUgd2l0aG91dCBhbnkgcmVjb25jaWxpYXRpb24uIFVzZWQgZm9yIHdyaXRpbmcgaW5pdGlhbCB2YWx1ZXMsIHNvXG4gKiB0aGF0IHN0YXRpYyBzdHlsaW5nIHZhbHVlcyBkbyBub3QgcHVsbCBpbiB0aGUgc3R5bGUgcGFyc2VyLlxuICpcbiAqIEBwYXJhbSByZW5kZXJlciBSZW5kZXJlciB0byB1c2VcbiAqIEBwYXJhbSBlbGVtZW50IFRoZSBlbGVtZW50IHdoaWNoIG5lZWRzIHRvIGJlIHVwZGF0ZWQuXG4gKiBAcGFyYW0gbmV3VmFsdWUgVGhlIG5ldyBjbGFzcyBsaXN0IHRvIHdyaXRlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gd3JpdGVEaXJlY3RTdHlsZShyZW5kZXJlcjogUmVuZGVyZXIzLCBlbGVtZW50OiBSRWxlbWVudCwgbmV3VmFsdWU6IHN0cmluZykge1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0U3RyaW5nKG5ld1ZhbHVlLCAnXFwnbmV3VmFsdWVcXCcgc2hvdWxkIGJlIGEgc3RyaW5nJyk7XG4gIGlmIChpc1Byb2NlZHVyYWxSZW5kZXJlcihyZW5kZXJlcikpIHtcbiAgICByZW5kZXJlci5zZXRBdHRyaWJ1dGUoZWxlbWVudCwgJ3N0eWxlJywgbmV3VmFsdWUpO1xuICB9IGVsc2Uge1xuICAgIChlbGVtZW50IGFzIEhUTUxFbGVtZW50KS5zdHlsZS5jc3NUZXh0ID0gbmV3VmFsdWU7XG4gIH1cbiAgbmdEZXZNb2RlICYmIG5nRGV2TW9kZS5yZW5kZXJlclNldFN0eWxlKys7XG59XG5cbi8qKlxuICogV3JpdGUgYGNsYXNzTmFtZWAgdG8gYFJFbGVtZW50YC5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIGRvZXMgZGlyZWN0IHdyaXRlIHdpdGhvdXQgYW55IHJlY29uY2lsaWF0aW9uLiBVc2VkIGZvciB3cml0aW5nIGluaXRpYWwgdmFsdWVzLCBzb1xuICogdGhhdCBzdGF0aWMgc3R5bGluZyB2YWx1ZXMgZG8gbm90IHB1bGwgaW4gdGhlIHN0eWxlIHBhcnNlci5cbiAqXG4gKiBAcGFyYW0gcmVuZGVyZXIgUmVuZGVyZXIgdG8gdXNlXG4gKiBAcGFyYW0gZWxlbWVudCBUaGUgZWxlbWVudCB3aGljaCBuZWVkcyB0byBiZSB1cGRhdGVkLlxuICogQHBhcmFtIG5ld1ZhbHVlIFRoZSBuZXcgY2xhc3MgbGlzdCB0byB3cml0ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdyaXRlRGlyZWN0Q2xhc3MocmVuZGVyZXI6IFJlbmRlcmVyMywgZWxlbWVudDogUkVsZW1lbnQsIG5ld1ZhbHVlOiBzdHJpbmcpIHtcbiAgbmdEZXZNb2RlICYmIGFzc2VydFN0cmluZyhuZXdWYWx1ZSwgJ1xcJ25ld1ZhbHVlXFwnIHNob3VsZCBiZSBhIHN0cmluZycpO1xuICBpZiAoaXNQcm9jZWR1cmFsUmVuZGVyZXIocmVuZGVyZXIpKSB7XG4gICAgaWYgKG5ld1ZhbHVlID09PSAnJykge1xuICAgICAgLy8gVGhlcmUgYXJlIHRlc3RzIGluIGBnb29nbGUzYCB3aGljaCBleHBlY3QgYGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdjbGFzcycpYCB0byBiZSBgbnVsbGAuXG4gICAgICByZW5kZXJlci5yZW1vdmVBdHRyaWJ1dGUoZWxlbWVudCwgJ2NsYXNzJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlbmRlcmVyLnNldEF0dHJpYnV0ZShlbGVtZW50LCAnY2xhc3MnLCBuZXdWYWx1ZSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gbmV3VmFsdWU7XG4gIH1cbiAgbmdEZXZNb2RlICYmIG5nRGV2TW9kZS5yZW5kZXJlclNldENsYXNzTmFtZSsrO1xufVxuIl19