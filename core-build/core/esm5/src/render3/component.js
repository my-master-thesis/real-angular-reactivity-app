/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// We are temporarily importing the existing viewEngine from core so we can be sure we are
// correctly implementing its interfaces for backwards compatibility.
import { ChangeDetectionStrategy } from '../core';
import { assertDataInRange } from '../util/assert';
import { assertComponentType } from './assert';
import { getComponentDef } from './definition';
import { diPublicInInjector, getOrCreateNodeInjectorForNode } from './di';
import { registerPostOrderHooks } from './hooks';
import { addHostBindingsToExpandoInstructions, addToViewTree, CLEAN_PROMISE, createLView, createTView, getOrCreateTComponentView, getOrCreateTNode, growHostVarsSpace, initTNodeFlags, instantiateRootComponent, invokeHostBindingsInCreationMode, locateHostElement, markAsComponentHost, refreshView, renderView } from './instructions/shared';
import { domRendererFactory3 } from './interfaces/renderer';
import { CONTEXT, HEADER_OFFSET, TVIEW } from './interfaces/view';
import { writeDirectClass, writeDirectStyle } from './node_manipulation';
import { enterView, getPreviousOrParentTNode, leaveView, setSelectedIndex } from './state';
import { computeStaticStyling } from './styling/static_styling';
import { setUpAttributes } from './util/attrs_utils';
import { publishDefaultGlobalUtils } from './util/global_utils';
import { defaultScheduler, stringifyForError } from './util/misc_utils';
import { getRootContext } from './util/view_traversal_utils';
import { readPatchedLView } from './util/view_utils';
var ɵ0 = function (token, notFoundValue) {
    throw new Error('NullInjector: Not found: ' + stringifyForError(token));
};
// TODO: A hack to not pull in the NullInjector from @angular/core.
export var NULL_INJECTOR = {
    get: ɵ0
};
/**
 * Bootstraps a Component into an existing host element and returns an instance
 * of the component.
 *
 * Use this function to bootstrap a component into the DOM tree. Each invocation
 * of this function will create a separate tree of components, injectors and
 * change detection cycles and lifetimes. To dynamically insert a new component
 * into an existing tree such that it shares the same injection, change detection
 * and object lifetime, use {@link ViewContainer#createComponent}.
 *
 * @param componentType Component to bootstrap
 * @param options Optional parameters which control bootstrapping
 */
export function renderComponent(componentType /* Type as workaround for: Microsoft/TypeScript/issues/4881 */, opts) {
    if (opts === void 0) { opts = {}; }
    ngDevMode && publishDefaultGlobalUtils();
    ngDevMode && assertComponentType(componentType);
    var rendererFactory = opts.rendererFactory || domRendererFactory3;
    var sanitizer = opts.sanitizer || null;
    var componentDef = getComponentDef(componentType);
    if (componentDef.type != componentType)
        componentDef.type = componentType;
    // The first index of the first selector is the tag name.
    var componentTag = componentDef.selectors[0][0];
    var hostRenderer = rendererFactory.createRenderer(null, null);
    var hostRNode = locateHostElement(hostRenderer, opts.host || componentTag, componentDef.encapsulation);
    // console.log(componentDef.onPush, componentDef.changeDetection, componentDef, LViewFlags.Dirty);
    var rootFlags = componentDef.changeDetection !== ChangeDetectionStrategy.Default ? 64 /* Dirty */ | 512 /* IsRoot */ :
        16 /* CheckAlways */ | 512 /* IsRoot */;
    var rootContext = createRootContext(opts.scheduler, opts.playerHandler);
    var renderer = rendererFactory.createRenderer(hostRNode, componentDef);
    var rootTView = createTView(0 /* Root */, -1, null, 1, 0, null, null, null, null, null);
    var rootView = createLView(null, rootTView, rootContext, rootFlags, null, null, rendererFactory, renderer, undefined, opts.injector || null);
    enterView(rootView, null);
    var component;
    try {
        if (rendererFactory.begin)
            rendererFactory.begin();
        var componentView = createRootComponentView(hostRNode, componentDef, rootView, rendererFactory, renderer, sanitizer);
        component = createRootComponent(componentView, componentDef, rootView, rootContext, opts.hostFeatures || null);
        // create mode pass
        renderView(rootTView, rootView, null);
        // update mode pass
        refreshView(rootTView, rootView, null, null);
    }
    finally {
        leaveView();
        if (rendererFactory.end)
            rendererFactory.end();
    }
    return component;
}
/**
 * Creates the root component view and the root component node.
 *
 * @param rNode Render host element.
 * @param def ComponentDef
 * @param rootView The parent view where the host node is stored
 * @param hostRenderer The current renderer
 * @param sanitizer The sanitizer, if provided
 *
 * @returns Component view created
 */
export function createRootComponentView(rNode, def, rootView, rendererFactory, hostRenderer, sanitizer) {
    var tView = rootView[TVIEW];
    ngDevMode && assertDataInRange(rootView, 0 + HEADER_OFFSET);
    rootView[0 + HEADER_OFFSET] = rNode;
    var tNode = getOrCreateTNode(tView, null, 0, 3 /* Element */, null, null);
    var mergedAttrs = tNode.mergedAttrs = def.hostAttrs;
    if (mergedAttrs !== null) {
        computeStaticStyling(tNode, mergedAttrs);
        if (rNode !== null) {
            setUpAttributes(hostRenderer, rNode, mergedAttrs);
            if (tNode.classes !== null) {
                writeDirectClass(hostRenderer, rNode, tNode.classes);
            }
            if (tNode.styles !== null) {
                writeDirectStyle(hostRenderer, rNode, tNode.styles);
            }
        }
    }
    var viewRenderer = rendererFactory.createRenderer(rNode, def);
    var componentView = createLView(rootView, getOrCreateTComponentView(def), null, def.changeDetection !== ChangeDetectionStrategy.Default ? 64 /* Dirty */ : 16 /* CheckAlways */, rootView[HEADER_OFFSET], tNode, rendererFactory, viewRenderer, sanitizer);
    if (tView.firstCreatePass) {
        diPublicInInjector(getOrCreateNodeInjectorForNode(tNode, rootView), tView, def.type);
        markAsComponentHost(tView, tNode);
        initTNodeFlags(tNode, rootView.length, 1);
    }
    addToViewTree(rootView, componentView);
    // Store component view at node index, with node as the HOST
    return rootView[HEADER_OFFSET] = componentView;
}
/**
 * Creates a root component and sets it up with features and host bindings. Shared by
 * renderComponent() and ViewContainerRef.createComponent().
 */
export function createRootComponent(componentView, componentDef, rootLView, rootContext, hostFeatures) {
    var tView = rootLView[TVIEW];
    // Create directive instance with factory() and store at next index in viewData
    var component = instantiateRootComponent(tView, rootLView, componentDef);
    rootContext.components.push(component);
    componentView[CONTEXT] = component;
    hostFeatures && hostFeatures.forEach(function (feature) { return feature(component, componentDef); });
    // We want to generate an empty QueryList for root content queries for backwards
    // compatibility with ViewEngine.
    if (componentDef.contentQueries) {
        componentDef.contentQueries(1 /* Create */, component, rootLView.length - 1);
    }
    var rootTNode = getPreviousOrParentTNode();
    if (tView.firstCreatePass &&
        (componentDef.hostBindings !== null || componentDef.hostAttrs !== null)) {
        var elementIndex = rootTNode.index - HEADER_OFFSET;
        setSelectedIndex(elementIndex);
        var rootTView = rootLView[TVIEW];
        addHostBindingsToExpandoInstructions(rootTView, componentDef);
        growHostVarsSpace(rootTView, rootLView, componentDef.hostVars);
        invokeHostBindingsInCreationMode(componentDef, component);
    }
    return component;
}
export function createRootContext(scheduler, playerHandler) {
    return {
        components: [],
        scheduler: scheduler || defaultScheduler,
        clean: CLEAN_PROMISE,
        playerHandler: playerHandler || null,
        flags: 0 /* Empty */
    };
}
/**
 * Used to enable lifecycle hooks on the root component.
 *
 * Include this feature when calling `renderComponent` if the root component
 * you are rendering has lifecycle hooks defined. Otherwise, the hooks won't
 * be called properly.
 *
 * Example:
 *
 * ```
 * renderComponent(AppComponent, {hostFeatures: [LifecycleHooksFeature]});
 * ```
 */
export function LifecycleHooksFeature(component, def) {
    var rootTView = readPatchedLView(component)[TVIEW];
    var dirIndex = rootTView.data.length - 1;
    // TODO(misko): replace `as TNode` with createTNode call. (needs refactoring to lose dep on
    // LNode).
    registerPostOrderHooks(rootTView, { directiveStart: dirIndex, directiveEnd: dirIndex + 1 });
}
/**
 * Wait on component until it is rendered.
 *
 * This function returns a `Promise` which is resolved when the component's
 * change detection is executed. This is determined by finding the scheduler
 * associated with the `component`'s render tree and waiting until the scheduler
 * flushes. If nothing is scheduled, the function returns a resolved promise.
 *
 * Example:
 * ```
 * await whenRendered(myComponent);
 * ```
 *
 * @param component Component to wait upon
 * @returns Promise which resolves when the component is rendered.
 */
export function whenRendered(component) {
    return getRootContext(component).clean;
}
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsMEZBQTBGO0FBQzFGLHFFQUFxRTtBQUNyRSxPQUFPLEVBQUMsdUJBQXVCLEVBQU8sTUFBTSxTQUFTLENBQUM7QUFHdEQsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDakQsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQzdDLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDN0MsT0FBTyxFQUFDLGtCQUFrQixFQUFFLDhCQUE4QixFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3hFLE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUMvQyxPQUFPLEVBQ0wsb0NBQW9DLEVBQ3BDLGFBQWEsRUFDYixhQUFhLEVBQ2IsV0FBVyxFQUNYLFdBQVcsRUFDWCx5QkFBeUIsRUFDekIsZ0JBQWdCLEVBQ2hCLGlCQUFpQixFQUNqQixjQUFjLEVBQ2Qsd0JBQXdCLEVBQ3hCLGdDQUFnQyxFQUNoQyxpQkFBaUIsRUFDakIsbUJBQW1CLEVBQ25CLFdBQVcsRUFDWCxVQUFVLEVBQ1gsTUFBTSx1QkFBdUIsQ0FBQztBQUkvQixPQUFPLEVBQUMsbUJBQW1CLEVBQXdDLE1BQU0sdUJBQXVCLENBQUM7QUFDakcsT0FBTyxFQUNMLE9BQU8sRUFDUCxhQUFhLEVBS2IsS0FBSyxFQUVOLE1BQU0sbUJBQW1CLENBQUM7QUFDM0IsT0FBTyxFQUFDLGdCQUFnQixFQUFFLGdCQUFnQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDdkUsT0FBTyxFQUFDLFNBQVMsRUFBRSx3QkFBd0IsRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUMs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UmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gV2UgYXJlIHRlbXBvcmFyaWx5IGltcG9ydGluZyB0aGUgZXhpc3Rpbmcgdmlld0VuZ2luZSBmcm9tIGNvcmUgc28gd2UgY2FuIGJlIHN1cmUgd2UgYXJlXG4vLyBjb3JyZWN0bHkgaW1wbGVtZW50aW5nIGl0cyBpbnRlcmZhY2VzIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS5cbmltcG9ydCB7Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIFR5cGV9IGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnLi4vZGkvaW5qZWN0b3InO1xuaW1wb3J0IHtTYW5pdGl6ZXJ9IGZyb20gJy4uL3Nhbml0aXphdGlvbi9zYW5pdGl6ZXInO1xuaW1wb3J0IHthc3NlcnREYXRhSW5SYW5nZX0gZnJvbSAnLi4vdXRpbC9hc3NlcnQnO1xuaW1wb3J0IHthc3NlcnRDb21wb25lbnRUeXBlfSBmcm9tICcuL2Fzc2VydCc7XG5pbXBvcnQge2dldENvbXBvbmVudERlZn0gZnJvbSAnLi9kZWZpbml0aW9uJztcbmltcG9ydCB7ZGlQdWJsaWNJbkluamVjdG9yLCBnZXRPckNyZWF0ZU5vZGVJbmplY3RvckZvck5vZGV9IGZyb20gJy4vZGknO1xuaW1wb3J0IHtyZWdpc3RlclBvc3RPcmRlckhvb2tzfSBmcm9tICcuL2hvb2tzJztcbmltcG9ydCB7XG4gIGFkZEhvc3RCaW5kaW5nc1RvRXhwYW5kb0luc3RydWN0aW9ucyxcbiAgYWRkVG9WaWV3VHJlZSxcbiAgQ0xFQU5fUFJPTUlTRSxcbiAgY3JlYXRlTFZpZXcsXG4gIGNyZWF0ZVRWaWV3LFxuICBnZXRPckNyZWF0ZVRDb21wb25lbnRWaWV3LFxuICBnZXRPckNyZWF0ZVROb2RlLFxuICBncm93SG9zdFZhcnNTcGFjZSxcbiAgaW5pdFROb2RlRmxhZ3MsXG4gIGluc3RhbnRpYXRlUm9vdENvbXBvbmVudCxcbiAgaW52b2tlSG9zdEJpbmRpbmdzSW5DcmVhdGlvbk1vZGUsXG4gIGxvY2F0ZUhvc3RFbGVtZW50LFxuICBtYXJrQXNDb21wb25lbnRIb3N0LFxuICByZWZyZXNoVmlldyxcbiAgcmVuZGVyVmlld1xufSBmcm9tICcuL2luc3RydWN0aW9ucy9zaGFyZWQnO1xuaW1wb3J0IHtDb21wb25lbnREZWYsIENvbXBvbmVudFR5cGUsIFJlbmRlckZsYWdzfSBmcm9tICcuL2ludGVyZmFjZXMvZGVmaW5pdGlvbic7XG5pbXBvcnQge1RFbGVtZW50Tm9kZSwgVE5vZGUsIFROb2RlVHlwZX0gZnJvbSAnLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtQbGF5ZXJIYW5kbGVyfSBmcm9tICcuL2ludGVyZmFjZXMvcGxheWVyJztcbmltcG9ydCB7ZG9tUmVuZGVyZXJGYWN0b3J5MywgUkVsZW1lbnQsIFJlbmRlcmVyMywgUmVuZGVyZXJGYWN0b3J5M30gZnJvbSAnLi9pbnRlcmZhY2VzL3JlbmRlcmVyJztcbmltcG9ydCB7XG4gIENPTlRFWFQsXG4gIEhFQURFUl9PRkZTRVQsXG4gIExWaWV3LFxuICBMVmlld0ZsYWdzLFxuICBSb290Q29udGV4dCxcbiAgUm9vdENvbnRleHRGbGFncyxcbiAgVFZJRVcsXG4gIFRWaWV3VHlwZVxufSBmcm9tICcuL2ludGVyZmFjZXMvdmlldyc7XG5pbXBvcnQge3dyaXRlRGlyZWN0Q2xhc3MsIHdyaXRlRGlyZWN0U3R5bGV9IGZyb20gJy4vbm9kZV9tYW5pcHVsYXRpb24nO1xuaW1wb3J0IHtlbnRlclZpZXcsIGdldFByZXZpb3VzT3JQYXJlbnRUTm9kZSwgbGVhdmVWaWV3LCBzZXRTZWxlY3RlZEluZGV4fSBmcm9tICcuL3N0YXRlJztcbmltcG9ydCB7Y29tcHV0ZVN0YXRpY1N0eWxpbmd9IGZyb20gJy4vc3R5bGluZy9zdGF0aWNfc3R5bGluZyc7XG5pbXBvcnQge3NldFVwQXR0cmlidXRlc30gZnJvbSAnLi91dGlsL2F0dHJzX3V0aWxzJztcbmltcG9ydCB7cHVibGlzaERlZmF1bHRHbG9iYWxVdGlsc30gZnJvbSAnLi91dGlsL2dsb2JhbF91dGlscyc7XG5pbXBvcnQge2RlZmF1bHRTY2hlZHVsZXIsIHN0cmluZ2lmeUZvckVycm9yfSBmcm9tICcuL3V0aWwvbWlzY191dGlscyc7XG5pbXBvcnQge2dldFJvb3RDb250ZXh0fSBmcm9tICcuL3V0aWwvdmlld190cmF2ZXJzYWxfdXRpbHMnO1xuaW1wb3J0IHtyZWFkUGF0Y2hlZExWaWV3fSBmcm9tICcuL3V0aWwvdmlld191dGlscyc7XG5cblxuLyoqIE9wdGlvbnMgdGhhdCBjb250cm9sIGhvdyB0aGUgY29tcG9uZW50IHNob3VsZCBiZSBib290c3RyYXBwZWQuICovXG5leHBvcnQgaW50ZXJmYWNlIENyZWF0ZUNvbXBvbmVudE9wdGlvbnMge1xuICAvKiogV2hpY2ggcmVuZGVyZXIgZmFjdG9yeSB0byB1c2UuICovXG4gIHJlbmRlcmVyRmFjdG9yeT86IFJlbmRlcmVyRmFjdG9yeTM7XG5cbiAgLyoqIEEgY3VzdG9tIHNhbml0aXplciBpbnN0YW5jZSAqL1xuICBzYW5pdGl6ZXI/OiBTYW5pdGl6ZXI7XG5cbiAgLyoqIEEgY3VzdG9tIGFuaW1hdGlvbiBwbGF5ZXIgaGFuZGxlciAqL1xuICBwbGF5ZXJIYW5kbGVyPzogUGxheWVySGFuZGxlcjtcblxuICAvKipcbiAgICogSG9zdCBlbGVtZW50IG9uIHdoaWNoIHRoZSBjb21wb25lbnQgd2lsbCBiZSBib290c3RyYXBwZWQuIElmIG5vdCBzcGVjaWZpZWQsXG4gICAqIHRoZSBjb21wb25lbnQgZGVmaW5pdGlvbidzIGB0YWdgIGlzIHVzZWQgdG8gcXVlcnkgdGhlIGV4aXN0aW5nIERPTSBmb3IgdGhlXG4gICAqIGVsZW1lbnQgdG8gYm9vdHN0cmFwLlxuICAgKi9cbiAgaG9zdD86IFJFbGVtZW50fHN0cmluZztcblxuICAvKiogTW9kdWxlIGluamVjdG9yIGZvciB0aGUgY29tcG9uZW50LiBJZiB1bnNwZWNpZmllZCwgdGhlIGluamVjdG9yIHdpbGwgYmUgTlVMTF9JTkpFQ1RPUi4gKi9cbiAgaW5qZWN0b3I/OiBJbmplY3RvcjtcblxuICAvKipcbiAgICogTGlzdCBvZiBmZWF0dXJlcyB0byBiZSBhcHBsaWVkIHRvIHRoZSBjcmVhdGVkIGNvbXBvbmVudC4gRmVhdHVyZXMgYXJlIHNpbXBseVxuICAgKiBmdW5jdGlvbnMgdGhhdCBkZWNvcmF0ZSBhIGNvbXBvbmVudCB3aXRoIGEgY2VydGFpbiBiZWhhdmlvci5cbiAgICpcbiAgICogVHlwaWNhbGx5LCB0aGUgZmVhdHVyZXMgaW4gdGhpcyBsaXN0IGFyZSBmZWF0dXJlcyB0aGF0IGNhbm5vdCBiZSBhZGRlZCB0byB0aGVcbiAgICogb3RoZXIgZmVhdHVyZXMgbGlzdCBpbiB0aGUgY29tcG9uZW50IGRlZmluaXRpb24gYmVjYXVzZSB0aGV5IHJlbHkgb24gb3RoZXIgZmFjdG9ycy5cbiAgICpcbiAgICogRXhhbXBsZTogYExpZmVjeWNsZUhvb2tzRmVhdHVyZWAgaXMgYSBmdW5jdGlvbiB0aGF0IGFkZHMgbGlmZWN5Y2xlIGhvb2sgY2FwYWJpbGl0aWVzXG4gICAqIHRvIHJvb3QgY29tcG9uZW50cyBpbiBhIHRyZWUtc2hha2FibGUgd2F5LiBJdCBjYW5ub3QgYmUgYWRkZWQgdG8gdGhlIGNvbXBvbmVudFxuICAgKiBmZWF0dXJlcyBsaXN0IGJlY2F1c2UgdGhlcmUncyBubyB3YXkgb2Yga25vd2luZyB3aGVuIHRoZSBjb21wb25lbnQgd2lsbCBiZSB1c2VkIGFzXG4gICAqIGEgcm9vdCBjb21wb25lbnQuXG4gICAqL1xuICBob3N0RmVhdHVyZXM/OiBIb3N0RmVhdHVyZVtdO1xuXG4gIC8qKlxuICAgKiBBIGZ1bmN0aW9uIHdoaWNoIGlzIHVzZWQgdG8gc2NoZWR1bGUgY2hhbmdlIGRldGVjdGlvbiB3b3JrIGluIHRoZSBmdXR1cmUuXG4gICAqXG4gICAqIFdoZW4gbWFya2luZyBjb21wb25lbnRzIGFzIGRpcnR5LCBpdCBpcyBuZWNlc3NhcnkgdG8gc2NoZWR1bGUgdGhlIHdvcmsgb2ZcbiAgICogY2hhbmdlIGRldGVjdGlvbiBpbiB0aGUgZnV0dXJlLiBUaGlzIGlzIGRvbmUgdG8gY29hbGVzY2UgbXVsdGlwbGVcbiAgICoge0BsaW5rIG1hcmtEaXJ0eX0gY2FsbHMgaW50byBhIHNpbmdsZSBjaGFuZ2VkIGRldGVjdGlvbiBwcm9jZXNzaW5nLlxuICAgKlxuICAgKiBUaGUgZGVmYXVsdCB2YWx1ZSBvZiB0aGUgc2NoZWR1bGVyIGlzIHRoZSBgcmVxdWVzdEFuaW1hdGlvbkZyYW1lYCBmdW5jdGlvbi5cbiAgICpcbiAgICogSXQgaXMgYWxzbyB1c2VmdWwgdG8gb3ZlcnJpZGUgdGhpcyBmdW5jdGlvbiBmb3IgdGVzdGluZyBwdXJwb3Nlcy5cbiAgICovXG4gIHNjaGVkdWxlcj86ICh3b3JrOiAoKSA9PiB2b2lkKSA9PiB2b2lkO1xufVxuXG4vKiogU2VlIENyZWF0ZUNvbXBvbmVudE9wdGlvbnMuaG9zdEZlYXR1cmVzICovXG50eXBlIEhvc3RGZWF0dXJlID0gKDxUPihjb21wb25lbnQ6IFQsIGNvbXBvbmVudERlZjogQ29tcG9uZW50RGVmPFQ+KSA9PiB2b2lkKTtcblxuLy8gVE9ETzogQSBoYWNrIHRvIG5vdCBwdWxsIGluIHRoZSBOdWxsSW5qZWN0b3IgZnJvbSBAYW5ndWxhci9jb3JlLlxuZXhwb3J0IGNvbnN0IE5VTExfSU5KRUNUT1I6IEluamVjdG9yID0ge1xuICBnZXQ6ICh0b2tlbjogYW55LCBub3RGb3VuZFZhbHVlPzogYW55KSA9PiB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOdWxsSW5qZWN0b3I6IE5vdCBmb3VuZDogJyArIHN0cmluZ2lmeUZvckVycm9yKHRva2VuKSk7XG4gIH1cbn07XG5cbi8qKlxuICogQm9vdHN0cmFwcyBhIENvbXBvbmVudCBpbnRvIGFuIGV4aXN0aW5nIGhvc3QgZWxlbWVudCBhbmQgcmV0dXJucyBhbiBpbnN0YW5jZVxuICogb2YgdGhlIGNvbXBvbmVudC5cbiAqXG4gKiBVc2UgdGhpcyBmdW5jdGlvbiB0byBib290c3RyYXAgYSBjb21wb25lbnQgaW50byB0aGUgRE9NIHRyZWUuIEVhY2ggaW52b2NhdGlvblxuICogb2YgdGhpcyBmdW5jdGlvbiB3aWxsIGNyZWF0ZSBhIHNlcGFyYXRlIHRyZWUgb2YgY29tcG9uZW50cywgaW5qZWN0b3JzIGFuZFxuICogY2hhbmdlIGRldGVjdGlvbiBjeWNsZXMgYW5kIGxpZmV0aW1lcy4gVG8gZHluYW1pY2FsbHkgaW5zZXJ0IGEgbmV3IGNvbXBvbmVudFxuICogaW50byBhbiBleGlzdGluZyB0cmVlIHN1Y2ggdGhhdCBpdCBzaGFyZXMgdGhlIHNhbWUgaW5qZWN0aW9uLCBjaGFuZ2UgZGV0ZWN0aW9uXG4gKiBhbmQgb2JqZWN0IGxpZmV0aW1lLCB1c2Uge0BsaW5rIFZpZXdDb250YWluZXIjY3JlYXRlQ29tcG9uZW50fS5cbiAqXG4gKiBAcGFyYW0gY29tcG9uZW50VHlwZSBDb21wb25lbnQgdG8gYm9vdHN0cmFwXG4gKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25hbCBwYXJhbWV0ZXJzIHdoaWNoIGNvbnRyb2wgYm9vdHN0cmFwcGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyQ29tcG9uZW50PFQ+KFxuICAgIGNvbXBvbmVudFR5cGU6IENvbXBvbmVudFR5cGU8VD58XG4gICAgICAgIFR5cGU8VD4vKiBUeXBlIGFzIHdvcmthcm91bmQgZm9yOiBNaWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvNDg4MSAqL1xuICAgICxcbiAgICBvcHRzOiBDcmVhdGVDb21wb25lbnRPcHRpb25zID0ge30pOiBUIHtcbiAgbmdEZXZNb2RlICYmIHB1Ymxpc2hEZWZhdWx0R2xvYmFsVXRpbHMoKTtcbiAgbmdEZXZNb2RlICYmIGFzc2VydENvbXBvbmVudFR5cGUoY29tcG9uZW50VHlwZSk7XG5cbiAgY29uc3QgcmVuZGVyZXJGYWN0b3J5ID0gb3B0cy5yZW5kZXJlckZhY3RvcnkgfHwgZG9tUmVuZGVyZXJGYWN0b3J5MztcbiAgY29uc3Qgc2FuaXRpemVyID0gb3B0cy5zYW5pdGl6ZXIgfHwgbnVsbDtcbiAgY29uc3QgY29tcG9uZW50RGVmID0gZ2V0Q29tcG9uZW50RGVmPFQ+KGNvbXBvbmVudFR5cGUpICE7XG4gIGlmIChjb21wb25lbnREZWYudHlwZSAhPSBjb21wb25lbnRUeXBlKSAoY29tcG9uZW50RGVmIGFze3R5cGU6IFR5cGU8YW55Pn0pLnR5cGUgPSBjb21wb25lbnRUeXBlO1xuXG4gIC8vIFRoZSBmaXJzdCBpbmRleCBvZiB0aGUgZmlyc3Qgc2VsZWN0b3IgaXMgdGhlIHRhZyBuYW1lLlxuICBjb25zdCBjb21wb25lbnRUYWcgPSBjb21wb25lbnREZWYuc2VsZWN0b3JzICFbMF0gIVswXSBhcyBzdHJpbmc7XG4gIGNvbnN0IGhvc3RSZW5kZXJlciA9IHJlbmRlcmVyRmFjdG9yeS5jcmVhdGVSZW5kZXJlcihudWxsLCBudWxsKTtcbiAgY29uc3QgaG9zdFJOb2RlID1cbiAgICAgIGxvY2F0ZUhvc3RFbGVtZW50KGhvc3RSZW5kZXJlciwgb3B0cy5ob3N0IHx8IGNvbXBvbmVudFRhZywgY29tcG9uZW50RGVmLmVuY2Fwc3VsYXRpb24pO1xuICAvLyBjb25zb2xlLmxvZyhjb21wb25lbnREZWYub25QdXNoLCBjb21wb25lbnREZWYuY2hhbmdlRGV0ZWN0aW9uLCBjb21wb25lbnREZWYsIExWaWV3RmxhZ3MuRGlydHkpO1xuICBjb25zdCByb290RmxhZ3MgPSBjb21wb25lbnREZWYuY2hhbmdlRGV0ZWN0aW9uICE9PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0ID8gTFZpZXdGbGFncy5EaXJ0eSB8IExWaWV3RmxhZ3MuSXNSb290IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIExWaWV3RmxhZ3MuQ2hlY2tBbHdheXMgfCBMVmlld0ZsYWdzLklzUm9vdDtcbiAgY29uc3Qgcm9vdENvbnRleHQgPSBjcmVhdGVSb290Q29udGV4dChvcHRzLnNjaGVkdWxlciwgb3B0cy5wbGF5ZXJIYW5kbGVyKTtcblxuICBjb25zdCByZW5kZXJlciA9IHJlbmRlcmVyRmFjdG9yeS5jcmVhdGVSZW5kZXJlcihob3N0Uk5vZGUsIGNvbXBvbmVudERlZik7XG4gIGNvbnN0IHJvb3RUVmlldyA9IGNyZWF0ZVRWaWV3KFRWaWV3VHlwZS5Sb290LCAtMSwgbnVsbCwgMSwgMCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCk7XG4gIGNvbnN0IHJvb3RWaWV3OiBMVmlldyA9IGNyZWF0ZUxWaWV3KFxuICAgICAgbnVsbCwgcm9vdFRWaWV3LCByb290Q29udGV4dCwgcm9vdEZsYWdzLCBudWxsLCBudWxsLCByZW5kZXJlckZhY3RvcnksIHJlbmRlcmVyLCB1bmRlZmluZWQsXG4gICAgICBvcHRzLmluamVjdG9yIHx8IG51bGwpO1xuXG4gIGVudGVyVmlldyhyb290VmlldywgbnVsbCk7XG4gIGxldCBjb21wb25lbnQ6IFQ7XG5cbiAgdHJ5IHtcbiAgICBpZiAocmVuZGVyZXJGYWN0b3J5LmJlZ2luKSByZW5kZXJlckZhY3RvcnkuYmVnaW4oKTtcbiAgICBjb25zdCBjb21wb25lbnRWaWV3ID0gY3JlYXRlUm9vdENvbXBvbmVudFZpZXcoXG4gICAgICAgIGhvc3RSTm9kZSwgY29tcG9uZW50RGVmLCByb290VmlldywgcmVuZGVyZXJGYWN0b3J5LCByZW5kZXJlciwgc2FuaXRpemVyKTtcbiAgICBjb21wb25lbnQgPSBjcmVhdGVSb290Q29tcG9uZW50KFxuICAgICAgICBjb21wb25lbnRWaWV3LCBjb21wb25lbnREZWYsIHJvb3RWaWV3LCByb290Q29udGV4dCwgb3B0cy5ob3N0RmVhdHVyZXMgfHwgbnVsbCk7XG5cbiAgICAvLyBjcmVhdGUgbW9kZSBwYXNzXG4gICAgcmVuZGVyVmlldyhyb290VFZpZXcsIHJvb3RWaWV3LCBudWxsKTtcbiAgICAvLyB1cGRhdGUgbW9kZSBwYXNzXG4gICAgcmVmcmVzaFZpZXcocm9vdFRWaWV3LCByb290VmlldywgbnVsbCwgbnVsbCk7XG5cbiAgfSBmaW5hbGx5IHtcbiAgICBsZWF2ZVZpZXcoKTtcbiAgICBpZiAocmVuZGVyZXJGYWN0b3J5LmVuZCkgcmVuZGVyZXJGYWN0b3J5LmVuZCgpO1xuICB9XG5cbiAgcmV0dXJuIGNvbXBvbmVudDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIHRoZSByb290IGNvbXBvbmVudCB2aWV3IGFuZCB0aGUgcm9vdCBjb21wb25lbnQgbm9kZS5cbiAqXG4gKiBAcGFyYW0gck5vZGUgUmVuZGVyIGhvc3QgZWxlbWVudC5cbiAqIEBwYXJhbSBkZWYgQ29tcG9uZW50RGVmXG4gKiBAcGFyYW0gcm9vdFZpZXcgVGhlIHBhcmVudCB2aWV3IHdoZXJlIHRoZSBob3N0IG5vZGUgaXMgc3RvcmVkXG4gKiBAcGFyYW0gaG9zdFJlbmRlcmVyIFRoZSBjdXJyZW50IHJlbmRlcmVyXG4gKiBAcGFyYW0gc2FuaXRpemVyIFRoZSBzYW5pdGl6ZXIsIGlmIHByb3ZpZGVkXG4gKlxuICogQHJldHVybnMgQ29tcG9uZW50IHZpZXcgY3JlYXRlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUm9vdENvbXBvbmVudFZpZXcoXG4gICAgck5vZGU6IFJFbGVtZW50IHwgbnVsbCwgZGVmOiBDb21wb25lbnREZWY8YW55Piwgcm9vdFZpZXc6IExWaWV3LFxuICAgIHJlbmRlcmVyRmFjdG9yeTogUmVuZGVyZXJGYWN0b3J5MywgaG9zdFJlbmRlcmVyOiBSZW5kZXJlcjMsXG4gICAgc2FuaXRpemVyPzogU2FuaXRpemVyIHwgbnVsbCk6IExWaWV3IHtcbiAgY29uc3QgdFZpZXcgPSByb290Vmlld1tUVklFV107XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnREYXRhSW5SYW5nZShyb290VmlldywgMCArIEhFQURFUl9PRkZTRVQpO1xuICByb290Vmlld1swICsgSEVBREVSX09GRlNFVF0gPSByTm9kZTtcbiAgY29uc3QgdE5vZGU6IFRFbGVtZW50Tm9kZSA9IGdldE9yQ3JlYXRlVE5vZGUodFZpZXcsIG51bGwsIDAsIFROb2RlVHlwZS5FbGVtZW50LCBudWxsLCBudWxsKTtcbiAgY29uc3QgbWVyZ2VkQXR0cnMgPSB0Tm9kZS5tZXJnZWRBdHRycyA9IGRlZi5ob3N0QXR0cnM7XG4gIGlmIChtZXJnZWRBdHRycyAhPT0gbnVsbCkge1xuICAgIGNvbXB1dGVTdGF0aWNTdHlsaW5nKHROb2RlLCBtZXJnZWRBdHRycyk7XG4gICAgaWYgKHJOb2RlICE9PSBudWxsKSB7XG4gICAgICBzZXRVcEF0dHJpYnV0ZXMoaG9zdFJlbmRlcmVyLCByTm9kZSwgbWVyZ2VkQXR0cnMpO1xuICAgICAgaWYgKHROb2RlLmNsYXNzZXMgIT09IG51bGwpIHtcbiAgICAgICAgd3JpdGVEaXJlY3RDbGFzcyhob3N0UmVuZGVyZXIsIHJOb2RlLCB0Tm9kZS5jbGFzc2VzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0Tm9kZS5zdHlsZXMgIT09IG51bGwpIHtcbiAgICAgICAgd3JpdGVEaXJlY3RTdHlsZShob3N0UmVuZGVyZXIsIHJOb2RlLCB0Tm9kZS5zdHlsZXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHZpZXdSZW5kZXJlciA9IHJlbmRlcmVyRmFjdG9yeS5jcmVhdGVSZW5kZXJlcihyTm9kZSwgZGVmKTtcbiAgY29uc3QgY29tcG9uZW50VmlldyA9IGNyZWF0ZUxWaWV3KFxuICAgICAgcm9vdFZpZXcsIGdldE9yQ3JlYXRlVENvbXBvbmVudFZpZXcoZGVmKSwgbnVsbCxcbiAgICAgIGRlZi5jaGFuZ2VEZXRlY3Rpb24gIT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHQgPyBMVmlld0ZsYWdzLkRpcnR5IDogTFZpZXdGbGFncy5DaGVja0Fsd2F5cywgcm9vdFZpZXdbSEVBREVSX09GRlNFVF0sIHROb2RlLFxuICAgICAgcmVuZGVyZXJGYWN0b3J5LCB2aWV3UmVuZGVyZXIsIHNhbml0aXplcik7XG5cbiAgaWYgKHRWaWV3LmZpcnN0Q3JlYXRlUGFzcykge1xuICAgIGRpUHVibGljSW5JbmplY3RvcihnZXRPckNyZWF0ZU5vZGVJbmplY3RvckZvck5vZGUodE5vZGUsIHJvb3RWaWV3KSwgdFZpZXcsIGRlZi50eXBlKTtcbiAgICBtYXJrQXNDb21wb25lbnRIb3N0KHRWaWV3LCB0Tm9kZSk7XG4gICAgaW5pdFROb2RlRmxhZ3ModE5vZGUsIHJvb3RWaWV3Lmxlbmd0aCwgMSk7XG4gIH1cblxuICBhZGRUb1ZpZXdUcmVlKHJvb3RWaWV3LCBjb21wb25lbnRWaWV3KTtcblxuICAvLyBTdG9yZSBjb21wb25lbnQgdmlldyBhdCBub2RlIGluZGV4LCB3aXRoIG5vZGUgYXMgdGhlIEhPU1RcbiAgcmV0dXJuIHJvb3RWaWV3W0hFQURFUl9PRkZTRVRdID0gY29tcG9uZW50Vmlldztcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgcm9vdCBjb21wb25lbnQgYW5kIHNldHMgaXQgdXAgd2l0aCBmZWF0dXJlcyBhbmQgaG9zdCBiaW5kaW5ncy4gU2hhcmVkIGJ5XG4gKiByZW5kZXJDb21wb25lbnQoKSBhbmQgVmlld0NvbnRhaW5lclJlZi5jcmVhdGVDb21wb25lbnQoKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJvb3RDb21wb25lbnQ8VD4oXG4gICAgY29tcG9uZW50VmlldzogTFZpZXcsIGNvbXBvbmVudERlZjogQ29tcG9uZW50RGVmPFQ+LCByb290TFZpZXc6IExWaWV3LCByb290Q29udGV4dDogUm9vdENvbnRleHQsXG4gICAgaG9zdEZlYXR1cmVzOiBIb3N0RmVhdHVyZVtdIHwgbnVsbCk6IGFueSB7XG4gIGNvbnN0IHRWaWV3ID0gcm9vdExWaWV3W1RWSUVXXTtcbiAgLy8gQ3JlYXRlIGRpcmVjdGl2ZSBpbnN0YW5jZSB3aXRoIGZhY3RvcnkoKSBhbmQgc3RvcmUgYXQgbmV4dCBpbmRleCBpbiB2aWV3RGF0YVxuICBjb25zdCBjb21wb25lbnQgPSBpbnN0YW50aWF0ZVJvb3RDb21wb25lbnQodFZpZXcsIHJvb3RMVmlldywgY29tcG9uZW50RGVmKTtcblxuICByb290Q29udGV4dC5jb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcbiAgY29tcG9uZW50Vmlld1tDT05URVhUXSA9IGNvbXBvbmVudDtcblxuICBob3N0RmVhdHVyZXMgJiYgaG9zdEZlYXR1cmVzLmZvckVhY2goKGZlYXR1cmUpID0+IGZlYXR1cmUoY29tcG9uZW50LCBjb21wb25lbnREZWYpKTtcblxuICAvLyBXZSB3YW50IHRvIGdlbmVyYXRlIGFuIGVtcHR5IFF1ZXJ5TGlzdCBmb3Igcm9vdCBjb250ZW50IHF1ZXJpZXMgZm9yIGJhY2t3YXJkc1xuICAvLyBjb21wYXRpYmlsaXR5IHdpdGggVmlld0VuZ2luZS5cbiAgaWYgKGNvbXBvbmVudERlZi5jb250ZW50UXVlcmllcykge1xuICAgIGNvbXBvbmVudERlZi5jb250ZW50UXVlcmllcyhSZW5kZXJGbGFncy5DcmVhdGUsIGNvbXBvbmVudCwgcm9vdExWaWV3Lmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgY29uc3Qgcm9vdFROb2RlID0gZ2V0UHJldmlvdXNPclBhcmVudFROb2RlKCk7XG4gIGlmICh0Vmlldy5maXJzdENyZWF0ZVBhc3MgJiZcbiAgICAgIChjb21wb25lbnREZWYuaG9zdEJpbmRpbmdzICE9PSBudWxsIHx8IGNvbXBvbmVudERlZi5ob3N0QXR0cnMgIT09IG51bGwpKSB7XG4gICAgY29uc3QgZWxlbWVudEluZGV4ID0gcm9vdFROb2RlLmluZGV4IC0gSEVBREVSX09GRlNFVDtcbiAgICBzZXRTZWxlY3RlZEluZGV4KGVsZW1lbnRJbmRleCk7XG5cbiAgICBjb25zdCByb290VFZpZXcgPSByb290TFZpZXdbVFZJRVddO1xuICAgIGFkZEhvc3RCaW5kaW5nc1RvRXhwYW5kb0luc3RydWN0aW9ucyhyb290VFZpZXcsIGNvbXBvbmVudERlZik7XG4gICAgZ3Jvd0hvc3RWYXJzU3BhY2Uocm9vdFRWaWV3LCByb290TFZpZXcsIGNvbXBvbmVudERlZi5ob3N0VmFycyk7XG5cbiAgICBpbnZva2VIb3N0QmluZGluZ3NJbkNyZWF0aW9uTW9kZShjb21wb25lbnREZWYsIGNvbXBvbmVudCk7XG4gIH1cbiAgcmV0dXJuIGNvbXBvbmVudDtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUm9vdENvbnRleHQoXG4gICAgc2NoZWR1bGVyPzogKHdvcmtGbjogKCkgPT4gdm9pZCkgPT4gdm9pZCwgcGxheWVySGFuZGxlcj86IFBsYXllckhhbmRsZXJ8bnVsbCk6IFJvb3RDb250ZXh0IHtcbiAgcmV0dXJuIHtcbiAgICBjb21wb25lbnRzOiBbXSxcbiAgICBzY2hlZHVsZXI6IHNjaGVkdWxlciB8fCBkZWZhdWx0U2NoZWR1bGVyLFxuICAgIGNsZWFuOiBDTEVBTl9QUk9NSVNFLFxuICAgIHBsYXllckhhbmRsZXI6IHBsYXllckhhbmRsZXIgfHwgbnVsbCxcbiAgICBmbGFnczogUm9vdENvbnRleHRGbGFncy5FbXB0eVxuICB9O1xufVxuXG4vKipcbiAqIFVzZWQgdG8gZW5hYmxlIGxpZmVjeWNsZSBob29rcyBvbiB0aGUgcm9vdCBjb21wb25lbnQuXG4gKlxuICogSW5jbHVkZSB0aGlzIGZlYXR1cmUgd2hlbiBjYWxsaW5nIGByZW5kZXJDb21wb25lbnRgIGlmIHRoZSByb290IGNvbXBvbmVudFxuICogeW91IGFyZSByZW5kZXJpbmcgaGFzIGxpZmVjeWNsZSBob29rcyBkZWZpbmVkLiBPdGhlcndpc2UsIHRoZSBob29rcyB3b24ndFxuICogYmUgY2FsbGVkIHByb3Blcmx5LlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBgXG4gKiByZW5kZXJDb21wb25lbnQoQXBwQ29tcG9uZW50LCB7aG9zdEZlYXR1cmVzOiBbTGlmZWN5Y2xlSG9va3NGZWF0dXJlXX0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBMaWZlY3ljbGVIb29rc0ZlYXR1cmUoY29tcG9uZW50OiBhbnksIGRlZjogQ29tcG9uZW50RGVmPGFueT4pOiB2b2lkIHtcbiAgY29uc3Qgcm9vdFRWaWV3ID0gcmVhZFBhdGNoZWRMVmlldyhjb21wb25lbnQpICFbVFZJRVddO1xuICBjb25zdCBkaXJJbmRleCA9IHJvb3RUVmlldy5kYXRhLmxlbmd0aCAtIDE7XG5cbiAgLy8gVE9ETyhtaXNrbyk6IHJlcGxhY2UgYGFzIFROb2RlYCB3aXRoIGNyZWF0ZVROb2RlIGNhbGwuIChuZWVkcyByZWZhY3RvcmluZyB0byBsb3NlIGRlcCBvblxuICAvLyBMTm9kZSkuXG4gIHJlZ2lzdGVyUG9zdE9yZGVySG9va3MoXG4gICAgICByb290VFZpZXcsIHsgZGlyZWN0aXZlU3RhcnQ6IGRpckluZGV4LCBkaXJlY3RpdmVFbmQ6IGRpckluZGV4ICsgMSB9IGFzIFROb2RlKTtcbn1cblxuLyoqXG4gKiBXYWl0IG9uIGNvbXBvbmVudCB1bnRpbCBpdCBpcyByZW5kZXJlZC5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYSBgUHJvbWlzZWAgd2hpY2ggaXMgcmVzb2x2ZWQgd2hlbiB0aGUgY29tcG9uZW50J3NcbiAqIGNoYW5nZSBkZXRlY3Rpb24gaXMgZXhlY3V0ZWQuIFRoaXMgaXMgZGV0ZXJtaW5lZCBieSBmaW5kaW5nIHRoZSBzY2hlZHVsZXJcbiAqIGFzc29jaWF0ZWQgd2l0aCB0aGUgYGNvbXBvbmVudGAncyByZW5kZXIgdHJlZSBhbmQgd2FpdGluZyB1bnRpbCB0aGUgc2NoZWR1bGVyXG4gKiBmbHVzaGVzLiBJZiBub3RoaW5nIGlzIHNjaGVkdWxlZCwgdGhlIGZ1bmN0aW9uIHJldHVybnMgYSByZXNvbHZlZCBwcm9taXNlLlxuICpcbiAqIEV4YW1wbGU6XG4gKiBgYGBcbiAqIGF3YWl0IHdoZW5SZW5kZXJlZChteUNvbXBvbmVudCk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gY29tcG9uZW50IENvbXBvbmVudCB0byB3YWl0IHVwb25cbiAqIEByZXR1cm5zIFByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgd2hlbiB0aGUgY29tcG9uZW50IGlzIHJlbmRlcmVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gd2hlblJlbmRlcmVkKGNvbXBvbmVudDogYW55KTogUHJvbWlzZTxudWxsPiB7XG4gIHJldHVybiBnZXRSb290Q29udGV4dChjb21wb25lbnQpLmNsZWFuO1xufVxuIl19