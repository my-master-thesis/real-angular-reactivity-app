/**
 * @fileoverview added by tsickle
 * Generated from: packages/core/src/view/provider.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectorRef, SimpleChange, WrappedValue } from '../change_detection/change_detection';
import { INJECTOR, Injector, resolveForwardRef } from '../di';
import { ElementRef } from '../linker/element_ref';
import { TemplateRef } from '../linker/template_ref';
import { ViewContainerRef } from '../linker/view_container_ref';
import { Renderer2 } from '../render/api';
import { isObservable } from '../util/lang';
import { stringify } from '../util/stringify';
import { createChangeDetectorRef, createInjector } from './refs';
import { Services, asElementData, asProviderData, shouldCallLifecycleInitHook } from './types';
import { calcBindingFlags, checkBinding, dispatchEvent, isComponentView, splitDepsDsl, splitMatchedQueriesDsl, tokenKey, viewParentEl } from './util';
/** @type {?} */
const Renderer2TokenKey = tokenKey(Renderer2);
/** @type {?} */
const ElementRefTokenKey = tokenKey(ElementRef);
/** @type {?} */
const ViewContainerRefTokenKey = tokenKey(ViewContainerRef);
/** @type {?} */
const TemplateRefTokenKey = tokenKey(TemplateRef);
/** @type {?} */
const ChangeDetectorRefTokenKey = tokenKey(ChangeDetectorRef);
/** @type {?} */
const InjectorRefTokenKey = tokenKey(Injector);
/** @type {?} */
const INJECTORRefTokenKey = tokenKey(INJECTOR);
/**
 * @param {?} checkIndex
 * @param {?} flags
 * @param {?} matchedQueries
 * @param {?} childCount
 * @param {?} ctor
 * @param {?} deps
 * @param {?=} props
 * @param {?=} outputs
 * @return {?}
 */
export function directiveDef(checkIndex, flags, matchedQueries, childCount, ctor, deps, props, outputs) {
    /** @type {?} */
    const bindings = [];
    if (props) {
        for (let prop in props) {
            const [bindingIndex, nonMinifiedName] = props[prop];
            bindings[bindingIndex] = {
                flags: 8 /* TypeProperty */,
                name: prop, nonMinifiedName,
                ns: null,
                securityContext: null,
                suffix: null
            };
        }
    }
    /** @type {?} */
    const outputDefs = [];
    if (outputs) {
        for (let propName in outputs) {
            outputDefs.push({ type: 1 /* DirectiveOutput */, propName, target: null, eventName: outputs[propName] });
        }
    }
    flags |= 16384 /* TypeDirective */;
    return _def(checkIndex, flags, matchedQueries, childCount, ctor, ctor, deps, bindings, outputDefs);
}
/**
 * @param {?} flags
 * @param {?} ctor
 * @param {?} deps
 * @return {?}
 */
export function pipeDef(flags, ctor, deps) {
    flags |= 16 /* TypePipe */;
    return _def(-1, flags, null, 0, ctor, ctor, deps);
}
/**
 * @param {?} flags
 * @param {?} matchedQueries
 * @param {?} token
 * @param {?} value
 * @param {?} deps
 * @return {?}
 */
export function providerDef(flags, matchedQueries, token, value, deps) {
    return _def(-1, flags, matchedQueries, 0, token, value, deps);
}
/**
 * @param {?} checkIndex
 * @param {?} flags
 * @param {?} matchedQueriesDsl
 * @param {?} childCount
 * @param {?} token
 * @param {?} value
 * @param {?} deps
 * @param {?=} bindings
 * @param {?=} outputs
 * @return {?}
 */
export function _def(checkIndex, flags, matchedQueriesDsl, childCount, token, value, deps, bindings, outputs) {
    const { matchedQueries, references, matchedQueryIds } = splitMatchedQueriesDsl(matchedQueriesDsl);
    if (!outputs) {
        outputs = [];
    }
    if (!bindings) {
        bindings = [];
    }
    // Need to resolve forwardRefs as e.g. for `useValue` we
    // lowered the expression and then stopped evaluating it,
    // i.e. also didn't unwrap it.
    value = resolveForwardRef(value);
    /** @type {?} */
    const depDefs = splitDepsDsl(deps, stringify(token));
    return {
        // will bet set by the view definition
        nodeIndex: -1,
        parent: null,
        renderParent: null,
        bindingIndex: -1,
        outputIndex: -1,
        // regular values
        checkIndex,
        flags,
        childFlags: 0,
        directChildFlags: 0,
        childMatchedQueries: 0, matchedQueries, matchedQueryIds, references,
        ngContentIndex: -1, childCount, bindings,
        bindingFlags: calcBindingFlags(bindings), outputs,
        element: null,
        provider: { token, value, deps: depDefs },
        text: null,
        query: null,
        ngContent: null
    };
}
/**
 * @param {?} view
 * @param {?} def
 * @return {?}
 */
export function createProviderInstance(view, def) {
    return _createProviderInstance(view, def);
}
/**
 * @param {?} view
 * @param {?} def
 * @return {?}
 */
export function createPipeInstance(view, def) {
    // deps are looked up from component.
    /** @type {?} */
    let compView = view;
    while (compView.parent && !isComponentView(compView)) {
        compView = compView.parent;
    }
    // pipes can see the private services of the component
    /** @type {?} */
    const allowPrivateServices = true;
    // pipes are always eager and classes!
    return createClass((/** @type {?} */ (compView.parent)), (/** @type {?} */ (viewParentEl(compView))), allowPrivateServices, (/** @type {?} */ (def.provider)).value, (/** @type {?} */ (def.provider)).deps);
}
/**
 * @param {?} view
 * @param {?} def
 * @return {?}
 */
export function createDirectiveInstance(view, def) {
    // components can see other private services, other directives can't.
    /** @type {?} */
    const allowPrivateServices = (def.flags & 32768 /* Component */) > 0;
    // directives are always eager and classes!
    /** @type {?} */
    const instance = createClass(view, (/** @type {?} */ (def.parent)), allowPrivateServices, (/** @type {?} */ (def.provider)).value, (/** @type {?} */ (def.provider)).deps);
    if (def.outputs.length) {
        for (let i = 0; i < def.outputs.length; i++) {
            /** @type {?} */
            const output = def.outputs[i];
            /** @type {?} */
            const outputObservable = instance[(/** @type {?} */ (output.propName))];
            if (isObservable(outputObservable)) {
                /** @type {?} */
                const subscription = outputObservable.subscribe(eventHandlerClosure(view, (/** @type {?} */ (def.parent)).nodeIndex, output.eventName));
                (/** @type {?} */ (view.disposables))[def.outputIndex + i] = subscription.unsubscribe.bind(subscription);
            }
            else {
                throw new Error(`@Output ${output.propName} not initialized in '${instance.constructor.name}'.`);
            }
        }
    }
    return instance;
}
/**
 * @param {?} view
 * @param {?} index
 * @param {?} eventName
 * @return {?}
 */
function eventHandlerClosure(view, index, eventName) {
    return (/**
     * @param {?} event
     * @return {?}
     */
    (event) => dispatchEvent(view, index, eventName, event));
}
/**
 * @param {?} view
 * @param {?} def
 * @param {?} v0
 * @param {?} v1
 * @param {?} v2
 * @param {?} v3
 * @param {?} v4
 * @param {?} v5
 * @param {?} v6
 * @param {?} v7
 * @param {?} v8
 * @param {?} v9
 * @return {?}
 */
export function checkAndUpdateDirectiveInline(view, def, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
    /** @type {?} */
    const providerData = asProviderData(view, def.nodeIndex);
    /** @type {?} */
    const directive = providerData.instance;
    /** @type {?} */
    let changed = false;
    /** @type {?} */
    let changes = (/** @type {?} */ (undefined));
    /** @type {?} */
    const bindLen = def.bindings.length;
    if (bindLen > 0 && checkBinding(view, def, 0, v0)) {
        changed = true;
        changes = updateProp(view, providerData, def, 0, v0, changes);
    }
    if (bindLen > 1 && checkBinding(view, def, 1, v1)) {
        changed = true;
        changes = updateProp(view, providerData, def, 1, v1, changes);
    }
    if (bindLen > 2 && checkBinding(view, def, 2, v2)) {
        changed = true;
        changes = updateProp(view, providerData, def, 2, v2, changes);
    }
    if (bindLen > 3 && checkBinding(view, def, 3, v3)) {
        changed = true;
        changes = updateProp(view, providerData, def, 3, v3, changes);
    }
    if (bindLen > 4 && checkBinding(view, def, 4, v4)) {
        changed = true;
        changes = updateProp(view, providerData, def, 4, v4, changes);
    }
    if (bindLen > 5 && checkBinding(view, def, 5, v5)) {
        changed = true;
        changes = updateProp(view, providerData, def, 5, v5, changes);
    }
    if (bindLen > 6 && checkBinding(view, def, 6, v6)) {
        changed = true;
        changes = updateProp(view, providerData, def, 6, v6, changes);
    }
    if (bindLen > 7 && checkBinding(view, def, 7, v7)) {
        changed = true;
        changes = updateProp(view, providerData, def, 7, v7, changes);
    }
    if (bindLen > 8 && checkBinding(view, def, 8, v8)) {
        changed = true;
        changes = updateProp(view, providerData, def, 8, v8, changes);
    }
    if (bindLen > 9 && checkBinding(view, def, 9, v9)) {
        changed = true;
        changes = updateProp(view, providerData, def, 9, v9, changes);
    }
    if (changes) {
        directive.ngOnChanges(changes);
    }
    if ((def.flags & 65536 /* OnInit */) &&
        shouldCallLifecycleInitHook(view, 256 /* InitState_CallingOnInit */, def.nodeIndex)) {
        directive.ngOnInit();
    }
    if (def.flags & 262144 /* DoCheck */) {
        directive.ngDoCheck();
    }
    return changed;
}
/**
 * @param {?} view
 * @param {?} def
 * @param {?} values
 * @return {?}
 */
export function checkAndUpdateDirectiveDynamic(view, def, values) {
    /** @type {?} */
    const providerData = asProviderData(view, def.nodeIndex);
    /** @type {?} */
    const directive = providerData.instance;
    /** @type {?} */
    let changed = false;
    /** @type {?} */
    let changes = (/** @type {?} */ (undefined));
    for (let i = 0; i < values.length; i++) {
        if (checkBinding(view, def, i, values[i])) {
            changed = true;
            changes = updateProp(view, providerData, def, i, values[i], changes);
        }
    }
    if (changes) {
        directive.ngOnChanges(changes);
    }
    if ((def.flags & 65536 /* OnInit */) &&
        shouldCallLifecycleInitHook(view, 256 /* InitState_CallingOnInit */, def.nodeIndex)) {
        directive.ngOnInit();
    }
    if (def.flags & 262144 /* DoCheck */) {
        directive.ngDoCheck();
    }
    return changed;
}
/**
 * @param {?} view
 * @param {?} def
 * @return {?}
 */
function _createProviderInstance(view, def) {
    // private services can see other private services
    /** @type {?} */
    const allowPrivateServices = (def.flags & 8192 /* PrivateProvider */) > 0;
    /** @type {?} */
    const providerDef = def.provider;
    switch (def.flags & 201347067 /* Types */) {
        case 512 /* TypeClassProvider */:
            return createClass(view, (/** @type {?} */ (def.parent)), allowPrivateServices, (/** @type {?} */ (providerDef)).value, (/** @type {?} */ (providerDef)).deps);
        case 1024 /* TypeFactoryProvider */:
            return callFactory(view, (/** @type {?} */ (def.parent)), allowPrivateServices, (/** @type {?} */ (providerDef)).value, (/** @type {?} */ (providerDef)).deps);
        case 2048 /* TypeUseExistingProvider */:
            return resolveDep(view, (/** @type {?} */ (def.parent)), allowPrivateServices, (/** @type {?} */ (providerDef)).deps[0]);
        case 256 /* TypeValueProvider */:
            return (/** @type {?} */ (providerDef)).value;
    }
}
/**
 * @param {?} view
 * @param {?} elDef
 * @param {?} allowPrivateServices
 * @param {?} ctor
 * @param {?} deps
 * @return {?}
 */
function createClass(view, elDef, allowPrivateServices, ctor, deps) {
    /** @type {?} */
    const len = deps.length;
    switch (len) {
        case 0:
            return new ctor();
        case 1:
            return new ctor(resolveDep(view, elDef, allowPrivateServices, deps[0]));
        case 2:
            return new ctor(resolveDep(view, elDef, allowPrivateServices, deps[0]), resolveDep(view, elDef, allowPrivateServices, deps[1]));
        case 3:
            return new ctor(resolveDep(view, elDef, allowPrivateServices, deps[0]), resolveDep(view, elDef, allowPrivateServices, deps[1]), resolveDep(view, elDef, allowPrivateServices, deps[2]));
        default:
            /** @type {?} */
            const depValues = [];
            for (let i = 0; i < len; i++) {
                depValues.push(resolveDep(view, elDef, allowPrivateServices, deps[i]));
            }
            return new ctor(...depValues);
    }
}
/**
 * @param {?} view
 * @param {?} elDef
 * @param {?} allowPrivateServices
 * @param {?} factory
 * @param {?} deps
 * @return {?}
 */
function callFactory(view, elDef, allowPrivateServices, factory, deps) {
    /** @type {?} */
    const len = deps.length;
    switch (len) {
        case 0:
            return factory();
        case 1:
            return factory(resolveDep(view, elDef, allowPrivateServices, deps[0]));
        case 2:
            return factory(resolveDep(view, elDef, allowPrivateServices, deps[0]), resolveDep(view, elDef, allowPrivateServices, deps[1]));
        case 3:
            return factory(resolveDep(view, elDef, allowPrivateServices, deps[0]), resolveDep(view, elDef, allowPrivateServices, deps[1]), resolveDep(view, elDef, allowPrivateServices, deps[2]));
        default:
            /** @type {?} */
            const depValues = [];
            for (let i = 0; i < len; i++) {
                depValues.push(resolveDep(view, elDef, allowPrivateServices, deps[i]));
            }
            return factory(...depValues);
    }
}
// This default value is when checking the hierarchy for a token.
//
// It means both:
// - the token is not provided by the current injector,
// - only the element injectors should be checked (ie do not check module injectors
//
//          mod1
//         /
//       el1   mod2
//         \  /
//         el2
//
// When requesting el2.injector.get(token), we should check in the following order and return the
// first found value:
// - el2.injector.get(token, default)
// - el1.injector.get(token, NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR) -> do not check the module
// - mod2.injector.get(token, default)
/** @type {?} */
export const NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR = {};
/**
 * @param {?} view
 * @param {?} elDef
 * @param {?} allowPrivateServices
 * @param {?} depDef
 * @param {?=} notFoundValue
 * @return {?}
 */
export function resolveDep(view, elDef, allowPrivateServices, depDef, notFoundValue = Injector.THROW_IF_NOT_FOUND) {
    if (depDef.flags & 8 /* Value */) {
        return depDef.token;
    }
    /** @type {?} */
    const startView = view;
    if (depDef.flags & 2 /* Optional */) {
        notFoundValue = null;
    }
    /** @type {?} */
    const tokenKey = depDef.tokenKey;
    if (tokenKey === ChangeDetectorRefTokenKey) {
        // directives on the same element as a component should be able to control the change detector
        // of that component as well.
        allowPrivateServices = !!(elDef && (/** @type {?} */ (elDef.element)).componentView);
    }
    if (elDef && (depDef.flags & 1 /* SkipSelf */)) {
        allowPrivateServices = false;
        elDef = (/** @type {?} */ (elDef.parent));
    }
    /** @type {?} */
    let searchView = view;
    while (searchView) {
        if (elDef) {
            switch (tokenKey) {
                case Renderer2TokenKey: {
                    /** @type {?} */
                    const compView = findCompView(searchView, elDef, allowPrivateServices);
                    return compView.renderer;
                }
                case ElementRefTokenKey:
                    return new ElementRef(asElementData(searchView, elDef.nodeIndex).renderElement);
                case ViewContainerRefTokenKey:
                    return asElementData(searchView, elDef.nodeIndex).viewContainer;
                case TemplateRefTokenKey: {
                    if ((/** @type {?} */ (elDef.element)).template) {
                        return asElementData(searchView, elDef.nodeIndex).template;
                    }
                    break;
                }
                case ChangeDetectorRefTokenKey: {
                    /** @type {?} */
                    let cdView = findCompView(searchView, elDef, allowPrivateServices);
                    return createChangeDetectorRef(cdView);
                }
                case InjectorRefTokenKey:
                case INJECTORRefTokenKey:
                    return createInjector(searchView, elDef);
                default:
                    /** @type {?} */
                    const providerDef = (/** @type {?} */ ((allowPrivateServices ? (/** @type {?} */ (elDef.element)).allProviders :
                        (/** @type {?} */ (elDef.element)).publicProviders)))[tokenKey];
                    if (providerDef) {
                        /** @type {?} */
                        let providerData = asProviderData(searchView, providerDef.nodeIndex);
                        if (!providerData) {
                            providerData = { instance: _createProviderInstance(searchView, providerDef) };
                            searchView.nodes[providerDef.nodeIndex] = (/** @type {?} */ (providerData));
                        }
                        return providerData.instance;
                    }
            }
        }
        allowPrivateServices = isComponentView(searchView);
        elDef = (/** @type {?} */ (viewParentEl(searchView)));
        searchView = (/** @type {?} */ (searchView.parent));
        if (depDef.flags & 4 /* Self */) {
            searchView = null;
        }
    }
    /** @type {?} */
    const value = startView.root.injector.get(depDef.token, NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR);
    if (value !== NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR ||
        notFoundValue === NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR) {
        // Return the value from the root element injector when
        // - it provides it
        //   (value !== NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR)
        // - the module injector should not be checked
        //   (notFoundValue === NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR)
        return value;
    }
    return startView.root.ngModule.injector.get(depDef.token, notFoundValue);
}
/**
 * @param {?} view
 * @param {?} elDef
 * @param {?} allowPrivateServices
 * @return {?}
 */
function findCompView(view, elDef, allowPrivateServices) {
    /** @type {?} */
    let compView;
    if (allowPrivateServices) {
        compView = asElementData(view, elDef.nodeIndex).componentView;
    }
    else {
        compView = view;
        while (compView.parent && !isComponentView(compView)) {
            compView = compView.parent;
        }
    }
    return compView;
}
/**
 * @param {?} view
 * @param {?} providerData
 * @param {?} def
 * @param {?} bindingIdx
 * @param {?} value
 * @param {?} changes
 * @return {?}
 */
function updateProp(view, providerData, def, bindingIdx, value, changes) {
    if (def.flags & 32768 /* Component */) {
        /** @type {?} */
        const compView = asElementData(view, (/** @type {?} */ (def.parent)).nodeIndex).componentView;
        if (compView.def.flags & 2 /* OnPush */) {
            // console.log('OP providers');
            compView.state |= 8 /* ChecksEnabled */;
        }
    }
    /** @type {?} */
    const binding = def.bindings[bindingIdx];
    /** @type {?} */
    const propName = (/** @type {?} */ (binding.name));
    // Note: This is still safe with Closure Compiler as
    // the user passed in the property name as an object has to `providerDef`,
    // so Closure Compiler will have renamed the property correctly already.
    providerData.instance[propName] = value;
    if (def.flags & 524288 /* OnChanges */) {
        changes = changes || {};
        /** @type {?} */
        const oldValue = WrappedValue.unwrap(view.oldValues[def.bindingIndex + bindingIdx]);
        /** @type {?} */
        const binding = def.bindings[bindingIdx];
        changes[(/** @type {?} */ (binding.nonMinifiedName))] =
            new SimpleChange(oldValue, value, (view.state & 2 /* FirstCheck */) !== 0);
    }
    view.oldValues[def.bindingIndex + bindingIdx] = value;
    return changes;
}
// This function calls the ngAfterContentCheck, ngAfterContentInit,
// ngAfterViewCheck, and ngAfterViewInit lifecycle hooks (depending on the node
// flags in lifecycle). Unlike ngDoCheck, ngOnChanges and ngOnInit, which are
// called during a pre-order traversal of the view tree (that is calling the
// parent hooks before the child hooks) these events are sent in using a
// post-order traversal of the tree (children before parents). This changes the
// meaning of initIndex in the view state. For ngOnInit, initIndex tracks the
// expected nodeIndex which a ngOnInit should be called. When sending
// ngAfterContentInit and ngAfterViewInit it is the expected count of
// ngAfterContentInit or ngAfterViewInit methods that have been called. This
// ensure that despite being called recursively or after picking up after an
// exception, the ngAfterContentInit or ngAfterViewInit will be called on the
// correct nodes. Consider for example, the following (where E is an element
// and D is a directive)
//  Tree:       pre-order index  post-order index
//    E1        0                6
//      E2      1                1
//       D3     2                0
//      E4      3                5
//       E5     4                4
//        E6    5                2
//        E7    6                3
// As can be seen, the post-order index has an unclear relationship to the
// pre-order index (postOrderIndex === preOrderIndex - parentCount +
// childCount). Since number of calls to ngAfterContentInit and ngAfterViewInit
// are stable (will be the same for the same view regardless of exceptions or
// recursion) we just need to count them which will roughly correspond to the
// post-order index (it skips elements and directives that do not have
// lifecycle hooks).
//
// For example, if an exception is raised in the E6.onAfterViewInit() the
// initIndex is left at 3 (by shouldCallLifecycleInitHook() which set it to
// initIndex + 1). When checkAndUpdateView() is called again D3, E2 and E6 will
// not have their ngAfterViewInit() called but, starting with E7, the rest of
// the view will begin getting ngAfterViewInit() called until a check and
// pass is complete.
//
// This algorthim also handles recursion. Consider if E4's ngAfterViewInit()
// indirectly calls E1's ChangeDetectorRef.detectChanges(). The expected
// initIndex is set to 6, the recusive checkAndUpdateView() starts walk again.
// D3, E2, E6, E7, E5 and E4 are skipped, ngAfterViewInit() is called on E1.
// When the recursion returns the initIndex will be 7 so E1 is skipped as it
// has already been called in the recursively called checkAnUpdateView().
/**
 * @param {?} view
 * @param {?} lifecycles
 * @return {?}
 */
export function callLifecycleHooksChildrenFirst(view, lifecycles) {
    if (!(view.def.nodeFlags & lifecycles)) {
        return;
    }
    /** @type {?} */
    const nodes = view.def.nodes;
    /** @type {?} */
    let initIndex = 0;
    for (let i = 0; i < nodes.length; i++) {
        /** @type {?} */
        const nodeDef = nodes[i];
        /** @type {?} */
        let parent = nodeDef.parent;
        if (!parent && nodeDef.flags & lifecycles) {
            // matching root node (e.g. a pipe)
            callProviderLifecycles(view, i, nodeDef.flags & lifecycles, initIndex++);
        }
        if ((nodeDef.childFlags & lifecycles) === 0) {
            // no child matches one of the lifecycles
            i += nodeDef.childCount;
        }
        while (parent && (parent.flags & 1 /* TypeElement */) &&
            i === parent.nodeIndex + parent.childCount) {
            // last child of an element
            if (parent.directChildFlags & lifecycles) {
                initIndex = callElementProvidersLifecycles(view, parent, lifecycles, initIndex);
            }
            parent = parent.parent;
        }
    }
}
/**
 * @param {?} view
 * @param {?} elDef
 * @param {?} lifecycles
 * @param {?} initIndex
 * @return {?}
 */
function callElementProvidersLifecycles(view, elDef, lifecycles, initIndex) {
    for (let i = elDef.nodeIndex + 1; i <= elDef.nodeIndex + elDef.childCount; i++) {
        /** @type {?} */
        const nodeDef = view.def.nodes[i];
        if (nodeDef.flags & lifecycles) {
            callProviderLifecycles(view, i, nodeDef.flags & lifecycles, initIndex++);
        }
        // only visit direct children
        i += nodeDef.childCount;
    }
    return initIndex;
}
/**
 * @param {?} view
 * @param {?} index
 * @param {?} lifecycles
 * @param {?} initIndex
 * @return {?}
 */
function callProviderLifecycles(view, index, lifecycles, initIndex) {
    /** @type {?} */
    const providerData = asProviderData(view, index);
    if (!providerData) {
        return;
    }
    /** @type {?} */
    const provider = providerData.instance;
    if (!provider) {
        return;
    }
    Services.setCurrentNode(view, index);
    if (lifecycles & 1048576 /* AfterContentInit */ &&
        shouldCallLifecycleInitHook(view, 512 /* InitState_CallingAfterContentInit */, initIndex)) {
        provider.ngAfterContentInit();
    }
    if (lifecycles & 2097152 /* AfterContentChecked */) {
        provider.ngAfterContentChecked();
    }
    if (lifecycles & 4194304 /* AfterViewInit */ &&
        shouldCallLifecycleInitHook(view, 768 /* InitState_CallingAfterViewInit */, initIndex)) {
        provider.ngAfterViewInit();
    }
    if (lifecycles & 8388608 /* AfterViewChecked */) {
        provider.ngAfterViewChecked();
    }
    if (lifecycles & 131072 /* OnDestroy */) {
        provider.ngOnDestroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy92aWV3L3Byb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxpQkFBaUIsRUFBRSxZQUFZLEVBQWlCLFlBQVksRUFBQyxNQUFNLHNDQUFzQyxDQUFDO0FBQ2xILE9BQU8sRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixFQUFDLE1BQU0sT0FBTyxDQUFDO0FBQzVELE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDbkQsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDOUQsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN4QyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUU1QyxPQUFPLEVBQUMsdUJBQXVCLEVBQUUsY0FBYyxFQUFDLE1BQU0sUUFBUSxDQUFDO0FBQy9ELE9BQU8sRUFBc0gsUUFBUSxFQUFrQyxhQUFhLEVBQUUsY0FBYyxFQUFFLDJCQUEyQixFQUFDLE1BQU0sU0FBUyxDQUFDO0FBQ2xQLE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBRSxZQUFZLEVBQUUsc0JBQXNCLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBQyxNQUFNLFFBQVEsQ0FBQzs7TUFFOUksaUJBQWlCLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQzs7TUFDdkMsa0JBQWtCLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQzs7TUFDekMsd0JBQXdCLEdBQUcsUUFBUSxDQUFDLGdCQUFnQixDQUFD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QUFHLENBQUMsSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7UUFDakQsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNmLE9BQU8sR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUMvRDtJQUNELElBQUksT0FBTyxHQUFHLENBQUMsSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7UUFDakQsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNmLE9BQU8sR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUMvRDtJQUNELElBQUksT0FBTyxHQUFHLENBQUMsSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7UUFDakQsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNmLE9BQU8sR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUMvRDtJQUNELElBQUksT0FBTyxHQUFHLENBQUMsSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7UUFDakQsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNmLE9BQU8sR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUMvRDtJQUNELElBQUksT0FBTyxHQUFHLENBQUMsSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7UUFDakQsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNmLE9BQU8sR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUMvRDtJQUNELElBQUksT0FBTyxHQUFHLENBQUMsSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7UUFDakQsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNmLE9BQU8sR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUMvRDtJQUNELElBQUksT0FBTyxHQUFHLENBQUMsSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7UUFDakQsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNmLE9BQU8sR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUMvRDtJQUNELElBQUksT0FBTyxHQUFHLENBQUMsSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7UUFDakQsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNmLE9BQU8sR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUMvRDtJQUNELElBQUksT0FBTyxHQUFHLENBQUMsSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7UUFDakQsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNmLE9BQU8sR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxHQUFH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O0lBQ0QsT0FBTyxTQUFTLENBQUM7QUFDbkIsQ0FBQzs7Ozs7Ozs7QUFFRCxTQUFTLHNCQUFzQixDQUMzQixJQUFjLEVBQUUsS0FBYSxFQUFFLFVBQXFCLEVBQUUsU0FBaUI7O1VBQ25FLFlBQVksR0FBRyxjQUFjLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQztJQUNoRCxJQUFJLENBQUMsWUFBWSxFQUFFO1FBQ2pCLE9BQU87S0FDUjs7VUFDSyxRQUFRLEdBQUcsWUFBWSxDQUFDLFFBQVE7SUFDdEMsSUFBSSxDQUFDLFFBQVEsRUFBRTtRQUNiLE9BQU87S0FDUjtJQUNELFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3JDLElBQUksVUFBVSxpQ0FBNkI7UUFDdkMsMkJBQTJCLENBQUMsSUFBSSwrQ0FBK0MsU0FBUyxDQUFDLEVBQUU7UUFDN0YsUUFBUSxDQUFDLGtCQUFrQixFQUFFLENBQUM7S0FDL0I7SUFDRCxJQUFJLFVBQVUsb0NBQWdDLEVBQUU7UUFDOUMsUUFBUSxDQUFDLHFCQUFxQixFQUFFLENBQUM7S0FDbEM7SUFDRCxJQUFJLFVBQVUsOEJBQTBCO1FBQ3BDLDJCQUEyQixDQUFDLElBQUksNENBQTRDLFNBQVMsQ0FBQyxFQUFFO1FBQzFGLFFBQVEsQ0FBQyxlQUFlLEVBQUUsQ0FBQztLQUM1QjtJQUNELElBQUksVUFBVSxpQ0FBNkIsRUFBRTtRQUMzQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztLQUMvQjtJQUNELElBQUksVUFBVSx5QkFBc0IsRUFBRTtRQUNwQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7S0FDeEI7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NoYW5nZURldGVjdG9yUmVmLCBTaW1wbGVDaGFuZ2UsIFNpbXBsZUNoYW5nZXMsIFdyYXBwZWRWYWx1ZX0gZnJvbSAnLi4vY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uJztcbmltcG9ydCB7SU5KRUNUT1IsIEluamVjdG9yLCByZXNvbHZlRm9yd2FyZFJlZn0gZnJvbSAnLi4vZGknO1xuaW1wb3J0IHtFbGVtZW50UmVmfSBmcm9tICcuLi9saW5rZXIvZWxlbWVudF9yZWYnO1xuaW1wb3J0IHtUZW1wbGF0ZVJlZn0gZnJvbSAnLi4vbGlua2VyL3RlbXBsYXRlX3JlZic7XG5pbXBvcnQge1ZpZXdDb250YWluZXJSZWZ9IGZyb20gJy4uL2xpbmtlci92aWV3X2NvbnRhaW5lcl9yZWYnO1xuaW1wb3J0IHtSZW5kZXJlcjJ9IGZyb20gJy4uL3JlbmRlci9hcGknO1xuaW1wb3J0IHtpc09ic2VydmFibGV9IGZyb20gJy4uL3V0aWwvbGFuZyc7XG5pbXBvcnQge3N0cmluZ2lmeX0gZnJvbSAnLi4vdXRpbC9zdHJpbmdpZnknO1xuXG5pbXBvcnQge2NyZWF0ZUNoYW5nZURldGVjdG9yUmVmLCBjcmVhdGVJbmplY3Rvcn0gZnJvbSAnLi9yZWZzJztcbmltcG9ydCB7QmluZGluZ0RlZiwgQmluZGluZ0ZsYWdzLCBEZXBEZWYsIERlcEZsYWdzLCBOb2RlRGVmLCBOb2RlRmxhZ3MsIE91dHB1dERlZiwgT3V0cHV0VHlwZSwgUHJvdmlkZXJEYXRhLCBRdWVyeVZhbHVlVHlwZSwgU2VydmljZXMsIFZpZXdEYXRhLCBWaWV3RmxhZ3MsIFZpZXdTdGF0ZSwgYXNFbGVtZW50RGF0YSwgYXNQcm92aWRlckRhdGEsIHNob3VsZENhbGxMaWZlY3ljbGVJbml0SG9va30gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQge2NhbGNCaW5kaW5nRmxhZ3MsIGNoZWNrQmluZGluZywgZGlzcGF0Y2hFdmVudCwgaXNDb21wb25lbnRWaWV3LCBzcGxpdERlcHNEc2wsIHNwbGl0TWF0Y2hlZFF1ZXJpZXNEc2wsIHRva2VuS2V5LCB2aWV3UGFyZW50RWx9IGZyb20gJy4vdXRpbCc7XG5cbmNvbnN0IFJlbmRlcmVyMlRva2VuS2V5ID0gdG9rZW5LZXkoUmVuZGVyZXIyKTtcbmNvbnN0IEVsZW1lbnRSZWZUb2tlbktleSA9IHRva2VuS2V5KEVsZW1lbnRSZWYpO1xuY29uc3QgVmlld0NvbnRhaW5lclJlZlRva2VuS2V5ID0gdG9rZW5LZXkoVmlld0NvbnRhaW5lclJlZik7XG5jb25zdCBUZW1wbGF0ZVJlZlRva2VuS2V5ID0gdG9rZW5LZXkoVGVtcGxhdGVSZWYpO1xuY29uc3QgQ2hhbmdlRGV0ZWN0b3JSZWZUb2tlbktleSA9IHRva2VuS2V5KENoYW5nZURldGVjdG9yUmVmKTtcbmNvbnN0IEluamVjdG9yUmVmVG9rZW5LZXkgPSB0b2tlbktleShJbmplY3Rvcik7XG5jb25zdCBJTkpFQ1RPUlJlZlRva2VuS2V5ID0gdG9rZW5LZXkoSU5KRUNUT1IpO1xuXG5leHBvcnQgZnVuY3Rpb24gZGlyZWN0aXZlRGVmKFxuICAgIGNoZWNrSW5kZXg6IG51bWJlciwgZmxhZ3M6IE5vZGVGbGFncyxcbiAgICBtYXRjaGVkUXVlcmllczogbnVsbCB8IFtzdHJpbmcgfCBudW1iZXIsIFF1ZXJ5VmFsdWVUeXBlXVtdLCBjaGlsZENvdW50OiBudW1iZXIsIGN0b3I6IGFueSxcbiAgICBkZXBzOiAoW0RlcEZsYWdzLCBhbnldIHwgYW55KVtdLCBwcm9wcz86IG51bGwgfCB7W25hbWU6IHN0cmluZ106IFtudW1iZXIsIHN0cmluZ119LFxuICAgIG91dHB1dHM/OiBudWxsIHwge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9KTogTm9kZURlZiB7XG4gIGNvbnN0IGJpbmRpbmdzOiBCaW5kaW5nRGVmW10gPSBbXTtcbiAgaWYgKHByb3BzKSB7XG4gICAgZm9yIChsZXQgcHJvcCBpbiBwcm9wcykge1xuICAgICAgY29uc3QgW2JpbmRpbmdJbmRleCwgbm9uTWluaWZpZWROYW1lXSA9IHByb3BzW3Byb3BdO1xuICAgICAgYmluZGluZ3NbYmluZGluZ0luZGV4XSA9IHtcbiAgICAgICAgZmxhZ3M6IEJpbmRpbmdGbGFncy5UeXBlUHJvcGVydHksXG4gICAgICAgIG5hbWU6IHByb3AsIG5vbk1pbmlmaWVkTmFtZSxcbiAgICAgICAgbnM6IG51bGwsXG4gICAgICAgIHNlY3VyaXR5Q29udGV4dDogbnVsbCxcbiAgICAgICAgc3VmZml4OiBudWxsXG4gICAgICB9O1xuICAgIH1cbiAgfVxuICBjb25zdCBvdXRwdXREZWZzOiBPdXRwdXREZWZbXSA9IFtdO1xuICBpZiAob3V0cHV0cykge1xuICAgIGZvciAobGV0IHByb3BOYW1lIGluIG91dHB1dHMpIHtcbiAgICAgIG91dHB1dERlZnMucHVzaChcbiAgICAgICAgICB7dHlwZTogT3V0cHV0VHlwZS5EaXJlY3RpdmVPdXRwdXQsIHByb3BOYW1lLCB0YXJnZXQ6IG51bGwsIGV2ZW50TmFtZTogb3V0cHV0c1twcm9wTmFtZV19KTtcbiAgICB9XG4gIH1cbiAgZmxhZ3MgfD0gTm9kZUZsYWdzLlR5cGVEaXJlY3RpdmU7XG4gIHJldHVybiBfZGVmKFxuICAgICAgY2hlY2tJbmRleCwgZmxhZ3MsIG1hdGNoZWRRdWVyaWVzLCBjaGlsZENvdW50LCBjdG9yLCBjdG9yLCBkZXBzLCBiaW5kaW5ncywgb3V0cHV0RGVmcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwaXBlRGVmKGZsYWdzOiBOb2RlRmxhZ3MsIGN0b3I6IGFueSwgZGVwczogKFtEZXBGbGFncywgYW55XSB8IGFueSlbXSk6IE5vZGVEZWYge1xuICBmbGFncyB8PSBOb2RlRmxhZ3MuVHlwZVBpcGU7XG4gIHJldHVybiBfZGVmKC0xLCBmbGFncywgbnVsbCwgMCwgY3RvciwgY3RvciwgZGVwcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlckRlZihcbiAgICBmbGFnczogTm9kZUZsYWdzLCBtYXRjaGVkUXVlcmllczogbnVsbCB8IFtzdHJpbmcgfCBudW1iZXIsIFF1ZXJ5VmFsdWVUeXBlXVtdLCB0b2tlbjogYW55LFxuICAgIHZhbHVlOiBhbnksIGRlcHM6IChbRGVwRmxhZ3MsIGFueV0gfCBhbnkpW10pOiBOb2RlRGVmIHtcbiAgcmV0dXJuIF9kZWYoLTEsIGZsYWdzLCBtYXRjaGVkUXVlcmllcywgMCwgdG9rZW4sIHZhbHVlLCBkZXBzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9kZWYoXG4gICAgY2hlY2tJbmRleDogbnVtYmVyLCBmbGFnczogTm9kZUZsYWdzLFxuICAgIG1hdGNoZWRRdWVyaWVzRHNsOiBbc3RyaW5nIHwgbnVtYmVyLCBRdWVyeVZhbHVlVHlwZV1bXSB8IG51bGwsIGNoaWxkQ291bnQ6IG51bWJlciwgdG9rZW46IGFueSxcbiAgICB2YWx1ZTogYW55LCBkZXBzOiAoW0RlcEZsYWdzLCBhbnldIHwgYW55KVtdLCBiaW5kaW5ncz86IEJpbmRpbmdEZWZbXSxcbiAgICBvdXRwdXRzPzogT3V0cHV0RGVmW10pOiBOb2RlRGVmIHtcbiAgY29uc3Qge21hdGNoZWRRdWVyaWVzLCByZWZlcmVuY2VzLCBtYXRjaGVkUXVlcnlJZHN9ID0gc3BsaXRNYXRjaGVkUXVlcmllc0RzbChtYXRjaGVkUXVlcmllc0RzbCk7XG4gIGlmICghb3V0cHV0cykge1xuICAgIG91dHB1dHMgPSBbXTtcbiAgfVxuICBpZiAoIWJpbmRpbmdzKSB7XG4gICAgYmluZGluZ3MgPSBbXTtcbiAgfVxuICAvLyBOZWVkIHRvIHJlc29sdmUgZm9yd2FyZFJlZnMgYXMgZS5nLiBmb3IgYHVzZVZhbHVlYCB3ZVxuICAvLyBsb3dlcmVkIHRoZSBleHByZXNzaW9uIGFuZCB0aGVuIHN0b3BwZWQgZXZhbHVhdGluZyBpdCxcbiAgLy8gaS5lLiBhbHNvIGRpZG4ndCB1bndyYXAgaXQuXG4gIHZhbHVlID0gcmVzb2x2ZUZvcndhcmRSZWYodmFsdWUpO1xuXG4gIGNvbnN0IGRlcERlZnMgPSBzcGxpdERlcHNEc2woZGVwcywgc3RyaW5naWZ5KHRva2VuKSk7XG5cbiAgcmV0dXJuIHtcbiAgICAvLyB3aWxsIGJldCBzZXQgYnkgdGhlIHZpZXcgZGVmaW5pdGlvblxuICAgIG5vZGVJbmRleDogLTEsXG4gICAgcGFyZW50OiBudWxsLFxuICAgIHJlbmRlclBhcmVudDogbnVsbCxcbiAgICBiaW5kaW5nSW5kZXg6IC0xLFxuICAgIG91dHB1dEluZGV4OiAtMSxcbiAgICAvLyByZWd1bGFyIHZhbHVlc1xuICAgIGNoZWNrSW5kZXgsXG4gICAgZmxhZ3MsXG4gICAgY2hpbGRGbGFnczogMCxcbiAgICBkaXJlY3RDaGlsZEZsYWdzOiAwLFxuICAgIGNoaWxkTWF0Y2hlZFF1ZXJpZXM6IDAsIG1hdGNoZWRRdWVyaWVzLCBtYXRjaGVkUXVlcnlJZHMsIHJlZmVyZW5jZXMsXG4gICAgbmdDb250ZW50SW5kZXg6IC0xLCBjaGlsZENvdW50LCBiaW5kaW5ncyxcbiAgICBiaW5kaW5nRmxhZ3M6IGNhbGNCaW5kaW5nRmxhZ3MoYmluZGluZ3MpLCBvdXRwdXRzLFxuICAgIGVsZW1lbnQ6IG51bGwsXG4gICAgcHJvdmlkZXI6IHt0b2tlbiwgdmFsdWUsIGRlcHM6IGRlcERlZnN9LFxuICAgIHRleHQ6IG51bGwsXG4gICAgcXVlcnk6IG51bGwsXG4gICAgbmdDb250ZW50OiBudWxsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQcm92aWRlckluc3RhbmNlKHZpZXc6IFZpZXdEYXRhLCBkZWY6IE5vZGVEZWYpOiBhbnkge1xuICByZXR1cm4gX2NyZWF0ZVByb3ZpZGVySW5zdGFuY2UodmlldywgZGVmKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBpcGVJbnN0YW5jZSh2aWV3OiBWaWV3RGF0YSwgZGVmOiBOb2RlRGVmKTogYW55IHtcbiAgLy8gZGVwcyBhcmUgbG9va2VkIHVwIGZyb20gY29tcG9uZW50LlxuICBsZXQgY29tcFZpZXcgPSB2aWV3O1xuICB3aGlsZSAoY29tcFZpZXcucGFyZW50ICYmICFpc0NvbXBvbmVudFZpZXcoY29tcFZpZXcpKSB7XG4gICAgY29tcFZpZXcgPSBjb21wVmlldy5wYXJlbnQ7XG4gIH1cbiAgLy8gcGlwZXMgY2FuIHNlZSB0aGUgcHJpdmF0ZSBzZXJ2aWNlcyBvZiB0aGUgY29tcG9uZW50XG4gIGNvbnN0IGFsbG93UHJpdmF0ZVNlcnZpY2VzID0gdHJ1ZTtcbiAgLy8gcGlwZXMgYXJlIGFsd2F5cyBlYWdlciBhbmQgY2xhc3NlcyFcbiAgcmV0dXJuIGNyZWF0ZUNsYXNzKFxuICAgICAgY29tcFZpZXcucGFyZW50ICEsIHZpZXdQYXJlbnRFbChjb21wVmlldykgISwgYWxsb3dQcml2YXRlU2VydmljZXMsIGRlZi5wcm92aWRlciAhLnZhbHVlLFxuICAgICAgZGVmLnByb3ZpZGVyICEuZGVwcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVEaXJlY3RpdmVJbnN0YW5jZSh2aWV3OiBWaWV3RGF0YSwgZGVmOiBOb2RlRGVmKTogYW55IHtcbiAgLy8gY29tcG9uZW50cyBjYW4gc2VlIG90aGVyIHByaXZhdGUgc2VydmljZXMsIG90aGVyIGRpcmVjdGl2ZXMgY2FuJ3QuXG4gIGNvbnN0IGFsbG93UHJpdmF0ZVNlcnZpY2VzID0gKGRlZi5mbGFncyAmIE5vZGVGbGFncy5Db21wb25lbnQpID4gMDtcbiAgLy8gZGlyZWN0aXZlcyBhcmUgYWx3YXlzIGVhZ2VyIGFuZCBjbGFzc2VzIVxuICBjb25zdCBpbnN0YW5jZSA9IGNyZWF0ZUNsYXNzKFxuICAgICAgdmlldywgZGVmLnBhcmVudCAhLCBhbGxvd1ByaXZhdGVTZXJ2aWNlcywgZGVmLnByb3ZpZGVyICEudmFsdWUsIGRlZi5wcm92aWRlciAhLmRlcHMpO1xuICBpZiAoZGVmLm91dHB1dHMubGVuZ3RoKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZWYub3V0cHV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3Qgb3V0cHV0ID0gZGVmLm91dHB1dHNbaV07XG4gICAgICBjb25zdCBvdXRwdXRPYnNlcnZhYmxlID0gaW5zdGFuY2Vbb3V0cHV0LnByb3BOYW1lICFdO1xuICAgICAgaWYgKGlzT2JzZXJ2YWJsZShvdXRwdXRPYnNlcnZhYmxlKSkge1xuICAgICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSBvdXRwdXRPYnNlcnZhYmxlLnN1YnNjcmliZShcbiAgICAgICAgICAgIGV2ZW50SGFuZGxlckNsb3N1cmUodmlldywgZGVmLnBhcmVudCAhLm5vZGVJbmRleCwgb3V0cHV0LmV2ZW50TmFtZSkpO1xuICAgICAgICB2aWV3LmRpc3Bvc2FibGVzICFbZGVmLm91dHB1dEluZGV4ICsgaV0gPSBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUuYmluZChzdWJzY3JpcHRpb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEBPdXRwdXQgJHtvdXRwdXQucHJvcE5hbWV9IG5vdCBpbml0aWFsaXplZCBpbiAnJHtpbnN0YW5jZS5jb25zdHJ1Y3Rvci5uYW1lfScuYCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBpbnN0YW5jZTtcbn1cblxuZnVuY3Rpb24gZXZlbnRIYW5kbGVyQ2xvc3VyZSh2aWV3OiBWaWV3RGF0YSwgaW5kZXg6IG51bWJlciwgZXZlbnROYW1lOiBzdHJpbmcpIHtcbiAgcmV0dXJuIChldmVudDogYW55KSA9PiBkaXNwYXRjaEV2ZW50KHZpZXcsIGluZGV4LCBldmVudE5hbWUsIGV2ZW50KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrQW5kVXBkYXRlRGlyZWN0aXZlSW5saW5lKFxuICAgIHZpZXc6IFZpZXdEYXRhLCBkZWY6IE5vZGVEZWYsIHYwOiBhbnksIHYxOiBhbnksIHYyOiBhbnksIHYzOiBhbnksIHY0OiBhbnksIHY1OiBhbnksIHY2OiBhbnksXG4gICAgdjc6IGFueSwgdjg6IGFueSwgdjk6IGFueSk6IGJvb2xlYW4ge1xuICBjb25zdCBwcm92aWRlckRhdGEgPSBhc1Byb3ZpZGVyRGF0YSh2aWV3LCBkZWYubm9kZUluZGV4KTtcbiAgY29uc3QgZGlyZWN0aXZlID0gcHJvdmlkZXJEYXRhLmluc3RhbmNlO1xuICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xuICBsZXQgY2hhbmdlczogU2ltcGxlQ2hhbmdlcyA9IHVuZGVmaW5lZCAhO1xuICBjb25zdCBiaW5kTGVuID0gZGVmLmJpbmRpbmdzLmxlbmd0aDtcbiAgaWYgKGJpbmRMZW4gPiAwICYmIGNoZWNrQmluZGluZyh2aWV3LCBkZWYsIDAsIHYwKSkge1xuICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIGNoYW5nZXMgPSB1cGRhdGVQcm9wKHZpZXcsIHByb3ZpZGVyRGF0YSwgZGVmLCAwLCB2MCwgY2hhbmdlcyk7XG4gIH1cbiAgaWYgKGJpbmRMZW4gPiAxICYmIGNoZWNrQmluZGluZyh2aWV3LCBkZWYsIDEsIHYxKSkge1xuICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIGNoYW5nZXMgPSB1cGRhdGVQcm9wKHZpZXcsIHByb3ZpZGVyRGF0YSwgZGVmLCAxLCB2MSwgY2hhbmdlcyk7XG4gIH1cbiAgaWYgKGJpbmRMZW4gPiAyICYmIGNoZWNrQmluZGluZyh2aWV3LCBkZWYsIDIsIHYyKSkge1xuICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIGNoYW5nZXMgPSB1cGRhdGVQcm9wKHZpZXcsIHByb3ZpZGVyRGF0YSwgZGVmLCAyLCB2MiwgY2hhbmdlcyk7XG4gIH1cbiAgaWYgKGJpbmRMZW4gPiAzICYmIGNoZWNrQmluZGluZyh2aWV3LCBkZWYsIDMsIHYzKSkge1xuICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIGNoYW5nZXMgPSB1cGRhdGVQcm9wKHZpZXcsIHByb3ZpZGVyRGF0YSwgZGVmLCAzLCB2MywgY2hhbmdlcyk7XG4gIH1cbiAgaWYgKGJpbmRMZW4gPiA0ICYmIGNoZWNrQmluZGluZyh2aWV3LCBkZWYsIDQsIHY0KSkge1xuICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIGNoYW5nZXMgPSB1cGRhdGVQcm9wKHZpZXcsIHByb3ZpZGVyRGF0YSwgZGVmLCA0LCB2NCwgY2hhbmdlcyk7XG4gIH1cbiAgaWYgKGJpbmRMZW4gPiA1ICYmIGNoZWNrQmluZGluZyh2aWV3LCBkZWYsIDUsIHY1KSkge1xuICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIGNoYW5nZXMgPSB1cGRhdGVQcm9wKHZpZXcsIHByb3ZpZGVyRGF0YSwgZGVmLCA1LCB2NSwgY2hhbmdlcyk7XG4gIH1cbiAgaWYgKGJpbmRMZW4gPiA2ICYmIGNoZWNrQmluZGluZyh2aWV3LCBkZWYsIDYsIHY2KSkge1xuICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIGNoYW5nZXMgPSB1cGRhdGVQcm9wKHZpZXcsIHByb3ZpZGVyRGF0YSwgZGVmLCA2LCB2NiwgY2hhbmdlcyk7XG4gIH1cbiAgaWYgKGJpbmRMZW4gPiA3ICYmIGNoZWNrQmluZGluZyh2aWV3LCBkZWYsIDcsIHY3KSkge1xuICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIGNoYW5nZXMgPSB1cGRhdGVQcm9wKHZpZXcsIHByb3ZpZGVyRGF0YSwgZGVmLCA3LCB2NywgY2hhbmdlcyk7XG4gIH1cbiAgaWYgKGJpbmRMZW4gPiA4ICYmIGNoZWNrQmluZGluZyh2aWV3LCBkZWYsIDgsIHY4KSkge1xuICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIGNoYW5nZXMgPSB1cGRhdGVQcm9wKHZpZXcsIHByb3ZpZGVyRGF0YSwgZGVmLCA4LCB2OCwgY2hhbmdlcyk7XG4gIH1cbiAgaWYgKGJpbmRMZW4gPiA5ICYmIGNoZWNrQmluZGluZyh2aWV3LCBkZWYsIDksIHY5KSkge1xuICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIGNoYW5nZXMgPSB1cGRhdGVQcm9wKHZpZXcsIHByb3ZpZGVyRGF0YSwgZGVmLCA5LCB2OSwgY2hhbmdlcyk7XG4gIH1cbiAgaWYgKGNoYW5nZXMpIHtcbiAgICBkaXJlY3RpdmUubmdPbkNoYW5nZXMoY2hhbmdlcyk7XG4gIH1cbiAgaWYgKChkZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuT25Jbml0KSAmJlxuICAgICAgc2hvdWxkQ2FsbExpZmVjeWNsZUluaXRIb29rKHZpZXcsIFZpZXdTdGF0ZS5Jbml0U3RhdGVfQ2FsbGluZ09uSW5pdCwgZGVmLm5vZGVJbmRleCkpIHtcbiAgICBkaXJlY3RpdmUubmdPbkluaXQoKTtcbiAgfVxuICBpZiAoZGVmLmZsYWdzICYgTm9kZUZsYWdzLkRvQ2hlY2spIHtcbiAgICBkaXJlY3RpdmUubmdEb0NoZWNrKCk7XG4gIH1cbiAgcmV0dXJuIGNoYW5nZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0FuZFVwZGF0ZURpcmVjdGl2ZUR5bmFtaWMoXG4gICAgdmlldzogVmlld0RhdGEsIGRlZjogTm9kZURlZiwgdmFsdWVzOiBhbnlbXSk6IGJvb2xlYW4ge1xuICBjb25zdCBwcm92aWRlckRhdGEgPSBhc1Byb3ZpZGVyRGF0YSh2aWV3LCBkZWYubm9kZUluZGV4KTtcbiAgY29uc3QgZGlyZWN0aXZlID0gcHJvdmlkZXJEYXRhLmluc3RhbmNlO1xuICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xuICBsZXQgY2hhbmdlczogU2ltcGxlQ2hhbmdlcyA9IHVuZGVmaW5lZCAhO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChjaGVja0JpbmRpbmcodmlldywgZGVmLCBpLCB2YWx1ZXNbaV0pKSB7XG4gICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgIGNoYW5nZXMgPSB1cGRhdGVQcm9wKHZpZXcsIHByb3ZpZGVyRGF0YSwgZGVmLCBpLCB2YWx1ZXNbaV0sIGNoYW5nZXMpO1xuICAgIH1cbiAgfVxuICBpZiAoY2hhbmdlcykge1xuICAgIGRpcmVjdGl2ZS5uZ09uQ2hhbmdlcyhjaGFuZ2VzKTtcbiAgfVxuICBpZiAoKGRlZi5mbGFncyAmIE5vZGVGbGFncy5PbkluaXQpICYmXG4gICAgICBzaG91bGRDYWxsTGlmZWN5Y2xlSW5pdEhvb2sodmlldywgVmlld1N0YXRlLkluaXRTdGF0ZV9DYWxsaW5nT25Jbml0LCBkZWYubm9kZUluZGV4KSkge1xuICAgIGRpcmVjdGl2ZS5uZ09uSW5pdCgpO1xuICB9XG4gIGlmIChkZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuRG9DaGVjaykge1xuICAgIGRpcmVjdGl2ZS5uZ0RvQ2hlY2soKTtcbiAgfVxuICByZXR1cm4gY2hhbmdlZDtcbn1cblxuZnVuY3Rpb24gX2NyZWF0ZVByb3ZpZGVySW5zdGFuY2UodmlldzogVmlld0RhdGEsIGRlZjogTm9kZURlZik6IGFueSB7XG4gIC8vIHByaXZhdGUgc2VydmljZXMgY2FuIHNlZSBvdGhlciBwcml2YXRlIHNlcnZpY2VzXG4gIGNvbnN0IGFsbG93UHJpdmF0ZVNlcnZpY2VzID0gKGRlZi5mbGFncyAmIE5vZGVGbGFncy5Qcml2YXRlUHJvdmlkZXIpID4gMDtcbiAgY29uc3QgcHJvdmlkZXJEZWYgPSBkZWYucHJvdmlkZXI7XG4gIHN3aXRjaCAoZGVmLmZsYWdzICYgTm9kZUZsYWdzLlR5cGVzKSB7XG4gICAgY2FzZSBOb2RlRmxhZ3MuVHlwZUNsYXNzUHJvdmlkZXI6XG4gICAgICByZXR1cm4gY3JlYXRlQ2xhc3MoXG4gICAgICAgICAgdmlldywgZGVmLnBhcmVudCAhLCBhbGxvd1ByaXZhdGVTZXJ2aWNlcywgcHJvdmlkZXJEZWYgIS52YWx1ZSwgcHJvdmlkZXJEZWYgIS5kZXBzKTtcbiAgICBjYXNlIE5vZGVGbGFncy5UeXBlRmFjdG9yeVByb3ZpZGVyOlxuICAgICAgcmV0dXJuIGNhbGxGYWN0b3J5KFxuICAgICAgICAgIHZpZXcsIGRlZi5wYXJlbnQgISwgYWxsb3dQcml2YXRlU2VydmljZXMsIHByb3ZpZGVyRGVmICEudmFsdWUsIHByb3ZpZGVyRGVmICEuZGVwcyk7XG4gICAgY2FzZSBOb2RlRmxhZ3MuVHlwZVVzZUV4aXN0aW5nUHJvdmlkZXI6XG4gICAgICByZXR1cm4gcmVzb2x2ZURlcCh2aWV3LCBkZWYucGFyZW50ICEsIGFsbG93UHJpdmF0ZVNlcnZpY2VzLCBwcm92aWRlckRlZiAhLmRlcHNbMF0pO1xuICAgIGNhc2UgTm9kZUZsYWdzLlR5cGVWYWx1ZVByb3ZpZGVyOlxuICAgICAgcmV0dXJuIHByb3ZpZGVyRGVmICEudmFsdWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQ2xhc3MoXG4gICAgdmlldzogVmlld0RhdGEsIGVsRGVmOiBOb2RlRGVmLCBhbGxvd1ByaXZhdGVTZXJ2aWNlczogYm9vbGVhbiwgY3RvcjogYW55LCBkZXBzOiBEZXBEZWZbXSk6IGFueSB7XG4gIGNvbnN0IGxlbiA9IGRlcHMubGVuZ3RoO1xuICBzd2l0Y2ggKGxlbikge1xuICAgIGNhc2UgMDpcbiAgICAgIHJldHVybiBuZXcgY3RvcigpO1xuICAgIGNhc2UgMTpcbiAgICAgIHJldHVybiBuZXcgY3RvcihyZXNvbHZlRGVwKHZpZXcsIGVsRGVmLCBhbGxvd1ByaXZhdGVTZXJ2aWNlcywgZGVwc1swXSkpO1xuICAgIGNhc2UgMjpcbiAgICAgIHJldHVybiBuZXcgY3RvcihcbiAgICAgICAgICByZXNvbHZlRGVwKHZpZXcsIGVsRGVmLCBhbGxvd1ByaXZhdGVTZXJ2aWNlcywgZGVwc1swXSksXG4gICAgICAgICAgcmVzb2x2ZURlcCh2aWV3LCBlbERlZiwgYWxsb3dQcml2YXRlU2VydmljZXMsIGRlcHNbMV0pKTtcbiAgICBjYXNlIDM6XG4gICAgICByZXR1cm4gbmV3IGN0b3IoXG4gICAgICAgICAgcmVzb2x2ZURlcCh2aWV3LCBlbERlZiwgYWxsb3dQcml2YXRlU2VydmljZXMsIGRlcHNbMF0pLFxuICAgICAgICAgIHJlc29sdmVEZXAodmlldywgZWxEZWYsIGFsbG93UHJpdmF0ZVNlcnZpY2VzLCBkZXBzWzFdKSxcbiAgICAgICAgICByZXNvbHZlRGVwKHZpZXcsIGVsRGVmLCBhbGxvd1ByaXZhdGVTZXJ2aWNlcywgZGVwc1syXSkpO1xuICAgIGRlZmF1bHQ6XG4gICAgICBjb25zdCBkZXBWYWx1ZXMgPSBbXTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZGVwVmFsdWVzLnB1c2gocmVzb2x2ZURlcCh2aWV3LCBlbERlZiwgYWxsb3dQcml2YXRlU2VydmljZXMsIGRlcHNbaV0pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgY3RvciguLi5kZXBWYWx1ZXMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNhbGxGYWN0b3J5KFxuICAgIHZpZXc6IFZpZXdEYXRhLCBlbERlZjogTm9kZURlZiwgYWxsb3dQcml2YXRlU2VydmljZXM6IGJvb2xlYW4sIGZhY3Rvcnk6IGFueSxcbiAgICBkZXBzOiBEZXBEZWZbXSk6IGFueSB7XG4gIGNvbnN0IGxlbiA9IGRlcHMubGVuZ3RoO1xuICBzd2l0Y2ggKGxlbikge1xuICAgIGNhc2UgMDpcbiAgICAgIHJldHVybiBmYWN0b3J5KCk7XG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIGZhY3RvcnkocmVzb2x2ZURlcCh2aWV3LCBlbERlZiwgYWxsb3dQcml2YXRlU2VydmljZXMsIGRlcHNbMF0pKTtcbiAgICBjYXNlIDI6XG4gICAgICByZXR1cm4gZmFjdG9yeShcbiAgICAgICAgICByZXNvbHZlRGVwKHZpZXcsIGVsRGVmLCBhbGxvd1ByaXZhdGVTZXJ2aWNlcywgZGVwc1swXSksXG4gICAgICAgICAgcmVzb2x2ZURlcCh2aWV3LCBlbERlZiwgYWxsb3dQcml2YXRlU2VydmljZXMsIGRlcHNbMV0pKTtcbiAgICBjYXNlIDM6XG4gICAgICByZXR1cm4gZmFjdG9yeShcbiAgICAgICAgICByZXNvbHZlRGVwKHZpZXcsIGVsRGVmLCBhbGxvd1ByaXZhdGVTZXJ2aWNlcywgZGVwc1swXSksXG4gICAgICAgICAgcmVzb2x2ZURlcCh2aWV3LCBlbERlZiwgYWxsb3dQcml2YXRlU2VydmljZXMsIGRlcHNbMV0pLFxuICAgICAgICAgIHJlc29sdmVEZXAodmlldywgZWxEZWYsIGFsbG93UHJpdmF0ZVNlcnZpY2VzLCBkZXBzWzJdKSk7XG4gICAgZGVmYXVsdDpcbiAgICAgIGNvbnN0IGRlcFZhbHVlcyA9IFtdO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBkZXBWYWx1ZXMucHVzaChyZXNvbHZlRGVwKHZpZXcsIGVsRGVmLCBhbGxvd1ByaXZhdGVTZXJ2aWNlcywgZGVwc1tpXSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhY3RvcnkoLi4uZGVwVmFsdWVzKTtcbiAgfVxufVxuXG4vLyBUaGlzIGRlZmF1bHQgdmFsdWUgaXMgd2hlbiBjaGVja2luZyB0aGUgaGllcmFyY2h5IGZvciBhIHRva2VuLlxuLy9cbi8vIEl0IG1lYW5zIGJvdGg6XG4vLyAtIHRoZSB0b2tlbiBpcyBub3QgcHJvdmlkZWQgYnkgdGhlIGN1cnJlbnQgaW5qZWN0b3IsXG4vLyAtIG9ubHkgdGhlIGVsZW1lbnQgaW5qZWN0b3JzIHNob3VsZCBiZSBjaGVja2VkIChpZSBkbyBub3QgY2hlY2sgbW9kdWxlIGluamVjdG9yc1xuLy9cbi8vICAgICAgICAgIG1vZDFcbi8vICAgICAgICAgL1xuLy8gICAgICAgZWwxICAgbW9kMlxuLy8gICAgICAgICBcXCAgL1xuLy8gICAgICAgICBlbDJcbi8vXG4vLyBXaGVuIHJlcXVlc3RpbmcgZWwyLmluamVjdG9yLmdldCh0b2tlbiksIHdlIHNob3VsZCBjaGVjayBpbiB0aGUgZm9sbG93aW5nIG9yZGVyIGFuZCByZXR1cm4gdGhlXG4vLyBmaXJzdCBmb3VuZCB2YWx1ZTpcbi8vIC0gZWwyLmluamVjdG9yLmdldCh0b2tlbiwgZGVmYXVsdClcbi8vIC0gZWwxLmluamVjdG9yLmdldCh0b2tlbiwgTk9UX0ZPVU5EX0NIRUNLX09OTFlfRUxFTUVOVF9JTkpFQ1RPUikgLT4gZG8gbm90IGNoZWNrIHRoZSBtb2R1bGVcbi8vIC0gbW9kMi5pbmplY3Rvci5nZXQodG9rZW4sIGRlZmF1bHQpXG5leHBvcnQgY29uc3QgTk9UX0ZPVU5EX0NIRUNLX09OTFlfRUxFTUVOVF9JTkpFQ1RPUiA9IHt9O1xuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZURlcChcbiAgICB2aWV3OiBWaWV3RGF0YSwgZWxEZWY6IE5vZGVEZWYsIGFsbG93UHJpdmF0ZVNlcnZpY2VzOiBib29sZWFuLCBkZXBEZWY6IERlcERlZixcbiAgICBub3RGb3VuZFZhbHVlOiBhbnkgPSBJbmplY3Rvci5USFJPV19JRl9OT1RfRk9VTkQpOiBhbnkge1xuICBpZiAoZGVwRGVmLmZsYWdzICYgRGVwRmxhZ3MuVmFsdWUpIHtcbiAgICByZXR1cm4gZGVwRGVmLnRva2VuO1xuICB9XG4gIGNvbnN0IHN0YXJ0VmlldyA9IHZpZXc7XG4gIGlmIChkZXBEZWYuZmxhZ3MgJiBEZXBGbGFncy5PcHRpb25hbCkge1xuICAgIG5vdEZvdW5kVmFsdWUgPSBudWxsO1xuICB9XG4gIGNvbnN0IHRva2VuS2V5ID0gZGVwRGVmLnRva2VuS2V5O1xuXG4gIGlmICh0b2tlbktleSA9PT0gQ2hhbmdlRGV0ZWN0b3JSZWZUb2tlbktleSkge1xuICAgIC8vIGRpcmVjdGl2ZXMgb24gdGhlIHNhbWUgZWxlbWVudCBhcyBhIGNvbXBvbmVudCBzaG91bGQgYmUgYWJsZSB0byBjb250cm9sIHRoZSBjaGFuZ2UgZGV0ZWN0b3JcbiAgICAvLyBvZiB0aGF0IGNvbXBvbmVudCBhcyB3ZWxsLlxuICAgIGFsbG93UHJpdmF0ZVNlcnZpY2VzID0gISEoZWxEZWYgJiYgZWxEZWYuZWxlbWVudCAhLmNvbXBvbmVudFZpZXcpO1xuICB9XG5cbiAgaWYgKGVsRGVmICYmIChkZXBEZWYuZmxhZ3MgJiBEZXBGbGFncy5Ta2lwU2VsZikpIHtcbiAgICBhbGxvd1ByaXZhdGVTZXJ2aWNlcyA9IGZhbHNlO1xuICAgIGVsRGVmID0gZWxEZWYucGFyZW50ICE7XG4gIH1cblxuICBsZXQgc2VhcmNoVmlldzogVmlld0RhdGF8bnVsbCA9IHZpZXc7XG4gIHdoaWxlIChzZWFyY2hWaWV3KSB7XG4gICAgaWYgKGVsRGVmKSB7XG4gICAgICBzd2l0Y2ggKHRva2VuS2V5KSB7XG4gICAgICAgIGNhc2UgUmVuZGVyZXIyVG9rZW5LZXk6IHtcbiAgICAgICAgICBjb25zdCBjb21wVmlldyA9IGZpbmRDb21wVmlldyhzZWFyY2hWaWV3LCBlbERlZiwgYWxsb3dQcml2YXRlU2VydmljZXMpO1xuICAgICAgICAgIHJldHVybiBjb21wVmlldy5yZW5kZXJlcjtcbiAgICAgICAgfVxuICAgICAgICBjYXNlIEVsZW1lbnRSZWZUb2tlbktleTpcbiAgICAgICAgICByZXR1cm4gbmV3IEVsZW1lbnRSZWYoYXNFbGVtZW50RGF0YShzZWFyY2hWaWV3LCBlbERlZi5ub2RlSW5kZXgpLnJlbmRlckVsZW1lbnQpO1xuICAgICAgICBjYXNlIFZpZXdDb250YWluZXJSZWZUb2tlbktleTpcbiAgICAgICAgICByZXR1cm4gYXNFbGVtZW50RGF0YShzZWFyY2hWaWV3LCBlbERlZi5ub2RlSW5kZXgpLnZpZXdDb250YWluZXI7XG4gICAgICAgIGNhc2UgVGVtcGxhdGVSZWZUb2tlbktleToge1xuICAgICAgICAgIGlmIChlbERlZi5lbGVtZW50ICEudGVtcGxhdGUpIHtcbiAgICAgICAgICAgIHJldHVybiBhc0VsZW1lbnREYXRhKHNlYXJjaFZpZXcsIGVsRGVmLm5vZGVJbmRleCkudGVtcGxhdGU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgQ2hhbmdlRGV0ZWN0b3JSZWZUb2tlbktleToge1xuICAgICAgICAgIGxldCBjZFZpZXcgPSBmaW5kQ29tcFZpZXcoc2VhcmNoVmlldywgZWxEZWYsIGFsbG93UHJpdmF0ZVNlcnZpY2VzKTtcbiAgICAgICAgICByZXR1cm4gY3JlYXRlQ2hhbmdlRGV0ZWN0b3JSZWYoY2RWaWV3KTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlIEluamVjdG9yUmVmVG9rZW5LZXk6XG4gICAgICAgIGNhc2UgSU5KRUNUT1JSZWZUb2tlbktleTpcbiAgICAgICAgICByZXR1cm4gY3JlYXRlSW5qZWN0b3Ioc2VhcmNoVmlldywgZWxEZWYpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGNvbnN0IHByb3ZpZGVyRGVmID1cbiAgICAgICAgICAgICAgKGFsbG93UHJpdmF0ZVNlcnZpY2VzID8gZWxEZWYuZWxlbWVudCAhLmFsbFByb3ZpZGVycyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsRGVmLmVsZW1lbnQgIS5wdWJsaWNQcm92aWRlcnMpICFbdG9rZW5LZXldO1xuICAgICAgICAgIGlmIChwcm92aWRlckRlZikge1xuICAgICAgICAgICAgbGV0IHByb3ZpZGVyRGF0YSA9IGFzUHJvdmlkZXJEYXRhKHNlYXJjaFZpZXcsIHByb3ZpZGVyRGVmLm5vZGVJbmRleCk7XG4gICAgICAgICAgICBpZiAoIXByb3ZpZGVyRGF0YSkge1xuICAgICAgICAgICAgICBwcm92aWRlckRhdGEgPSB7aW5zdGFuY2U6IF9jcmVhdGVQcm92aWRlckluc3RhbmNlKHNlYXJjaFZpZXcsIHByb3ZpZGVyRGVmKX07XG4gICAgICAgICAgICAgIHNlYXJjaFZpZXcubm9kZXNbcHJvdmlkZXJEZWYubm9kZUluZGV4XSA9IHByb3ZpZGVyRGF0YSBhcyBhbnk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvdmlkZXJEYXRhLmluc3RhbmNlO1xuICAgICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBhbGxvd1ByaXZhdGVTZXJ2aWNlcyA9IGlzQ29tcG9uZW50VmlldyhzZWFyY2hWaWV3KTtcbiAgICBlbERlZiA9IHZpZXdQYXJlbnRFbChzZWFyY2hWaWV3KSAhO1xuICAgIHNlYXJjaFZpZXcgPSBzZWFyY2hWaWV3LnBhcmVudCAhO1xuXG4gICAgaWYgKGRlcERlZi5mbGFncyAmIERlcEZsYWdzLlNlbGYpIHtcbiAgICAgIHNlYXJjaFZpZXcgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHZhbHVlID0gc3RhcnRWaWV3LnJvb3QuaW5qZWN0b3IuZ2V0KGRlcERlZi50b2tlbiwgTk9UX0ZPVU5EX0NIRUNLX09OTFlfRUxFTUVOVF9JTkpFQ1RPUik7XG5cbiAgaWYgKHZhbHVlICE9PSBOT1RfRk9VTkRfQ0hFQ0tfT05MWV9FTEVNRU5UX0lOSkVDVE9SIHx8XG4gICAgICBub3RGb3VuZFZhbHVlID09PSBOT1RfRk9VTkRfQ0hFQ0tfT05MWV9FTEVNRU5UX0lOSkVDVE9SKSB7XG4gICAgLy8gUmV0dXJuIHRoZSB2YWx1ZSBmcm9tIHRoZSByb290IGVsZW1lbnQgaW5qZWN0b3Igd2hlblxuICAgIC8vIC0gaXQgcHJvdmlkZXMgaXRcbiAgICAvLyAgICh2YWx1ZSAhPT0gTk9UX0ZPVU5EX0NIRUNLX09OTFlfRUxFTUVOVF9JTkpFQ1RPUilcbiAgICAvLyAtIHRoZSBtb2R1bGUgaW5qZWN0b3Igc2hvdWxkIG5vdCBiZSBjaGVja2VkXG4gICAgLy8gICAobm90Rm91bmRWYWx1ZSA9PT0gTk9UX0ZPVU5EX0NIRUNLX09OTFlfRUxFTUVOVF9JTkpFQ1RPUilcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICByZXR1cm4gc3RhcnRWaWV3LnJvb3QubmdNb2R1bGUuaW5qZWN0b3IuZ2V0KGRlcERlZi50b2tlbiwgbm90Rm91bmRWYWx1ZSk7XG59XG5cbmZ1bmN0aW9uIGZpbmRDb21wVmlldyh2aWV3OiBWaWV3RGF0YSwgZWxEZWY6IE5vZGVEZWYsIGFsbG93UHJpdmF0ZVNlcnZpY2VzOiBib29sZWFuKSB7XG4gIGxldCBjb21wVmlldzogVmlld0RhdGE7XG4gIGlmIChhbGxvd1ByaXZhdGVTZXJ2aWNlcykge1xuICAgIGNvbXBWaWV3ID0gYXNFbGVtZW50RGF0YSh2aWV3LCBlbERlZi5ub2RlSW5kZXgpLmNvbXBvbmVudFZpZXc7XG4gIH0gZWxzZSB7XG4gICAgY29tcFZpZXcgPSB2aWV3O1xuICAgIHdoaWxlIChjb21wVmlldy5wYXJlbnQgJiYgIWlzQ29tcG9uZW50Vmlldyhjb21wVmlldykpIHtcbiAgICAgIGNvbXBWaWV3ID0gY29tcFZpZXcucGFyZW50O1xuICAgIH1cbiAgfVxuICByZXR1cm4gY29tcFZpZXc7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVByb3AoXG4gICAgdmlldzogVmlld0RhdGEsIHByb3ZpZGVyRGF0YTogUHJvdmlkZXJEYXRhLCBkZWY6IE5vZGVEZWYsIGJpbmRpbmdJZHg6IG51bWJlciwgdmFsdWU6IGFueSxcbiAgICBjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogU2ltcGxlQ2hhbmdlcyB7XG4gIGlmIChkZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuQ29tcG9uZW50KSB7XG4gICAgY29uc3QgY29tcFZpZXcgPSBhc0VsZW1lbnREYXRhKHZpZXcsIGRlZi5wYXJlbnQgIS5ub2RlSW5kZXgpLmNvbXBvbmVudFZpZXc7XG4gICAgaWYgKGNvbXBWaWV3LmRlZi5mbGFncyAmIFZpZXdGbGFncy5PblB1c2gpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdPUCBwcm92aWRlcnMnKTtcbiAgICAgIGNvbXBWaWV3LnN0YXRlIHw9IFZpZXdTdGF0ZS5DaGVja3NFbmFibGVkO1xuICAgIH1cbiAgfVxuICBjb25zdCBiaW5kaW5nID0gZGVmLmJpbmRpbmdzW2JpbmRpbmdJZHhdO1xuICBjb25zdCBwcm9wTmFtZSA9IGJpbmRpbmcubmFtZSAhO1xuICAvLyBOb3RlOiBUaGlzIGlzIHN0aWxsIHNhZmUgd2l0aCBDbG9zdXJlIENvbXBpbGVyIGFzXG4gIC8vIHRoZSB1c2VyIHBhc3NlZCBpbiB0aGUgcHJvcGVydHkgbmFtZSBhcyBhbiBvYmplY3QgaGFzIHRvIGBwcm92aWRlckRlZmAsXG4gIC8vIHNvIENsb3N1cmUgQ29tcGlsZXIgd2lsbCBoYXZlIHJlbmFtZWQgdGhlIHByb3BlcnR5IGNvcnJlY3RseSBhbHJlYWR5LlxuICBwcm92aWRlckRhdGEuaW5zdGFuY2VbcHJvcE5hbWVdID0gdmFsdWU7XG4gIGlmIChkZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuT25DaGFuZ2VzKSB7XG4gICAgY2hhbmdlcyA9IGNoYW5nZXMgfHwge307XG4gICAgY29uc3Qgb2xkVmFsdWUgPSBXcmFwcGVkVmFsdWUudW53cmFwKHZpZXcub2xkVmFsdWVzW2RlZi5iaW5kaW5nSW5kZXggKyBiaW5kaW5nSWR4XSk7XG4gICAgY29uc3QgYmluZGluZyA9IGRlZi5iaW5kaW5nc1tiaW5kaW5nSWR4XTtcbiAgICBjaGFuZ2VzW2JpbmRpbmcubm9uTWluaWZpZWROYW1lICFdID1cbiAgICAgICAgbmV3IFNpbXBsZUNoYW5nZShvbGRWYWx1ZSwgdmFsdWUsICh2aWV3LnN0YXRlICYgVmlld1N0YXRlLkZpcnN0Q2hlY2spICE9PSAwKTtcbiAgfVxuICB2aWV3Lm9sZFZhbHVlc1tkZWYuYmluZGluZ0luZGV4ICsgYmluZGluZ0lkeF0gPSB2YWx1ZTtcbiAgcmV0dXJuIGNoYW5nZXM7XG59XG5cbi8vIFRoaXMgZnVuY3Rpb24gY2FsbHMgdGhlIG5nQWZ0ZXJDb250ZW50Q2hlY2ssIG5nQWZ0ZXJDb250ZW50SW5pdCxcbi8vIG5nQWZ0ZXJWaWV3Q2hlY2ssIGFuZCBuZ0FmdGVyVmlld0luaXQgbGlmZWN5Y2xlIGhvb2tzIChkZXBlbmRpbmcgb24gdGhlIG5vZGVcbi8vIGZsYWdzIGluIGxpZmVjeWNsZSkuIFVubGlrZSBuZ0RvQ2hlY2ssIG5nT25DaGFuZ2VzIGFuZCBuZ09uSW5pdCwgd2hpY2ggYXJlXG4vLyBjYWxsZWQgZHVyaW5nIGEgcHJlLW9yZGVyIHRyYXZlcnNhbCBvZiB0aGUgdmlldyB0cmVlICh0aGF0IGlzIGNhbGxpbmcgdGhlXG4vLyBwYXJlbnQgaG9va3MgYmVmb3JlIHRoZSBjaGlsZCBob29rcykgdGhlc2UgZXZlbnRzIGFyZSBzZW50IGluIHVzaW5nIGFcbi8vIHBvc3Qtb3JkZXIgdHJhdmVyc2FsIG9mIHRoZSB0cmVlIChjaGlsZHJlbiBiZWZvcmUgcGFyZW50cykuIFRoaXMgY2hhbmdlcyB0aGVcbi8vIG1lYW5pbmcgb2YgaW5pdEluZGV4IGluIHRoZSB2aWV3IHN0YXRlLiBGb3IgbmdPbkluaXQsIGluaXRJbmRleCB0cmFja3MgdGhlXG4vLyBleHBlY3RlZCBub2RlSW5kZXggd2hpY2ggYSBuZ09uSW5pdCBzaG91bGQgYmUgY2FsbGVkLiBXaGVuIHNlbmRpbmdcbi8vIG5nQWZ0ZXJDb250ZW50SW5pdCBhbmQgbmdBZnRlclZpZXdJbml0IGl0IGlzIHRoZSBleHBlY3RlZCBjb3VudCBvZlxuLy8gbmdBZnRlckNvbnRlbnRJbml0IG9yIG5nQWZ0ZXJWaWV3SW5pdCBtZXRob2RzIHRoYXQgaGF2ZSBiZWVuIGNhbGxlZC4gVGhpc1xuLy8gZW5zdXJlIHRoYXQgZGVzcGl0ZSBiZWluZyBjYWxsZWQgcmVjdXJzaXZlbHkgb3IgYWZ0ZXIgcGlja2luZyB1cCBhZnRlciBhblxuLy8gZXhjZXB0aW9uLCB0aGUgbmdBZnRlckNvbnRlbnRJbml0IG9yIG5nQWZ0ZXJWaWV3SW5pdCB3aWxsIGJlIGNhbGxlZCBvbiB0aGVcbi8vIGNvcnJlY3Qgbm9kZXMuIENvbnNpZGVyIGZvciBleGFtcGxlLCB0aGUgZm9sbG93aW5nICh3aGVyZSBFIGlzIGFuIGVsZW1lbnRcbi8vIGFuZCBEIGlzIGEgZGlyZWN0aXZlKVxuLy8gIFRyZWU6ICAgICAgIHByZS1vcmRlciBpbmRleCAgcG9zdC1vcmRlciBpbmRleFxuLy8gICAgRTEgICAgICAgIDAgICAgICAgICAgICAgICAgNlxuLy8gICAgICBFMiAgICAgIDEgICAgICAgICAgICAgICAgMVxuLy8gICAgICAgRDMgICAgIDIgICAgICAgICAgICAgICAgMFxuLy8gICAgICBFNCAgICAgIDMgICAgICAgICAgICAgICAgNVxuLy8gICAgICAgRTUgICAgIDQgICAgICAgICAgICAgICAgNFxuLy8gICAgICAgIEU2ICAgIDUgICAgICAgICAgICAgICAgMlxuLy8gICAgICAgIEU3ICAgIDYgICAgICAgICAgICAgICAgM1xuLy8gQXMgY2FuIGJlIHNlZW4sIHRoZSBwb3N0LW9yZGVyIGluZGV4IGhhcyBhbiB1bmNsZWFyIHJlbGF0aW9uc2hpcCB0byB0aGVcbi8vIHByZS1vcmRlciBpbmRleCAocG9zdE9yZGVySW5kZXggPT09IHByZU9yZGVySW5kZXggLSBwYXJlbnRDb3VudCArXG4vLyBjaGlsZENvdW50KS4gU2luY2UgbnVtYmVyIG9mIGNhbGxzIHRvIG5nQWZ0ZXJDb250ZW50SW5pdCBhbmQgbmdBZnRlclZpZXdJbml0XG4vLyBhcmUgc3RhYmxlICh3aWxsIGJlIHRoZSBzYW1lIGZvciB0aGUgc2FtZSB2aWV3IHJlZ2FyZGxlc3Mgb2YgZXhjZXB0aW9ucyBvclxuLy8gcmVjdXJzaW9uKSB3ZSBqdXN0IG5lZWQgdG8gY291bnQgdGhlbSB3aGljaCB3aWxsIHJvdWdobHkgY29ycmVzcG9uZCB0byB0aGVcbi8vIHBvc3Qtb3JkZXIgaW5kZXggKGl0IHNraXBzIGVsZW1lbnRzIGFuZCBkaXJlY3RpdmVzIHRoYXQgZG8gbm90IGhhdmVcbi8vIGxpZmVjeWNsZSBob29rcykuXG4vL1xuLy8gRm9yIGV4YW1wbGUsIGlmIGFuIGV4Y2VwdGlvbiBpcyByYWlzZWQgaW4gdGhlIEU2Lm9uQWZ0ZXJWaWV3SW5pdCgpIHRoZVxuLy8gaW5pdEluZGV4IGlzIGxlZnQgYXQgMyAoYnkgc2hvdWxkQ2FsbExpZmVjeWNsZUluaXRIb29rKCkgd2hpY2ggc2V0IGl0IHRvXG4vLyBpbml0SW5kZXggKyAxKS4gV2hlbiBjaGVja0FuZFVwZGF0ZVZpZXcoKSBpcyBjYWxsZWQgYWdhaW4gRDMsIEUyIGFuZCBFNiB3aWxsXG4vLyBub3QgaGF2ZSB0aGVpciBuZ0FmdGVyVmlld0luaXQoKSBjYWxsZWQgYnV0LCBzdGFydGluZyB3aXRoIEU3LCB0aGUgcmVzdCBvZlxuLy8gdGhlIHZpZXcgd2lsbCBiZWdpbiBnZXR0aW5nIG5nQWZ0ZXJWaWV3SW5pdCgpIGNhbGxlZCB1bnRpbCBhIGNoZWNrIGFuZFxuLy8gcGFzcyBpcyBjb21wbGV0ZS5cbi8vXG4vLyBUaGlzIGFsZ29ydGhpbSBhbHNvIGhhbmRsZXMgcmVjdXJzaW9uLiBDb25zaWRlciBpZiBFNCdzIG5nQWZ0ZXJWaWV3SW5pdCgpXG4vLyBpbmRpcmVjdGx5IGNhbGxzIEUxJ3MgQ2hhbmdlRGV0ZWN0b3JSZWYuZGV0ZWN0Q2hhbmdlcygpLiBUaGUgZXhwZWN0ZWRcbi8vIGluaXRJbmRleCBpcyBzZXQgdG8gNiwgdGhlIHJlY3VzaXZlIGNoZWNrQW5kVXBkYXRlVmlldygpIHN0YXJ0cyB3YWxrIGFnYWluLlxuLy8gRDMsIEUyLCBFNiwgRTcsIEU1IGFuZCBFNCBhcmUgc2tpcHBlZCwgbmdBZnRlclZpZXdJbml0KCkgaXMgY2FsbGVkIG9uIEUxLlxuLy8gV2hlbiB0aGUgcmVjdXJzaW9uIHJldHVybnMgdGhlIGluaXRJbmRleCB3aWxsIGJlIDcgc28gRTEgaXMgc2tpcHBlZCBhcyBpdFxuLy8gaGFzIGFscmVhZHkgYmVlbiBjYWxsZWQgaW4gdGhlIHJlY3Vyc2l2ZWx5IGNhbGxlZCBjaGVja0FuVXBkYXRlVmlldygpLlxuZXhwb3J0IGZ1bmN0aW9uIGNhbGxMaWZlY3ljbGVIb29rc0NoaWxkcmVuRmlyc3QodmlldzogVmlld0RhdGEsIGxpZmVjeWNsZXM6IE5vZGVGbGFncykge1xuICBpZiAoISh2aWV3LmRlZi5ub2RlRmxhZ3MgJiBsaWZlY3ljbGVzKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBub2RlcyA9IHZpZXcuZGVmLm5vZGVzO1xuICBsZXQgaW5pdEluZGV4ID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IG5vZGVEZWYgPSBub2Rlc1tpXTtcbiAgICBsZXQgcGFyZW50ID0gbm9kZURlZi5wYXJlbnQ7XG4gICAgaWYgKCFwYXJlbnQgJiYgbm9kZURlZi5mbGFncyAmIGxpZmVjeWNsZXMpIHtcbiAgICAgIC8vIG1hdGNoaW5nIHJvb3Qgbm9kZSAoZS5nLiBhIHBpcGUpXG4gICAgICBjYWxsUHJvdmlkZXJMaWZlY3ljbGVzKHZpZXcsIGksIG5vZGVEZWYuZmxhZ3MgJiBsaWZlY3ljbGVzLCBpbml0SW5kZXgrKyk7XG4gICAgfVxuICAgIGlmICgobm9kZURlZi5jaGlsZEZsYWdzICYgbGlmZWN5Y2xlcykgPT09IDApIHtcbiAgICAgIC8vIG5vIGNoaWxkIG1hdGNoZXMgb25lIG9mIHRoZSBsaWZlY3ljbGVzXG4gICAgICBpICs9IG5vZGVEZWYuY2hpbGRDb3VudDtcbiAgICB9XG4gICAgd2hpbGUgKHBhcmVudCAmJiAocGFyZW50LmZsYWdzICYgTm9kZUZsYWdzLlR5cGVFbGVtZW50KSAmJlxuICAgICAgICAgICBpID09PSBwYXJlbnQubm9kZUluZGV4ICsgcGFyZW50LmNoaWxkQ291bnQpIHtcbiAgICAgIC8vIGxhc3QgY2hpbGQgb2YgYW4gZWxlbWVudFxuICAgICAgaWYgKHBhcmVudC5kaXJlY3RDaGlsZEZsYWdzICYgbGlmZWN5Y2xlcykge1xuICAgICAgICBpbml0SW5kZXggPSBjYWxsRWxlbWVudFByb3ZpZGVyc0xpZmVjeWNsZXModmlldywgcGFyZW50LCBsaWZlY3ljbGVzLCBpbml0SW5kZXgpO1xuICAgICAgfVxuICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gY2FsbEVsZW1lbnRQcm92aWRlcnNMaWZlY3ljbGVzKFxuICAgIHZpZXc6IFZpZXdEYXRhLCBlbERlZjogTm9kZURlZiwgbGlmZWN5Y2xlczogTm9kZUZsYWdzLCBpbml0SW5kZXg6IG51bWJlcik6IG51bWJlciB7XG4gIGZvciAobGV0IGkgPSBlbERlZi5ub2RlSW5kZXggKyAxOyBpIDw9IGVsRGVmLm5vZGVJbmRleCArIGVsRGVmLmNoaWxkQ291bnQ7IGkrKykge1xuICAgIGNvbnN0IG5vZGVEZWYgPSB2aWV3LmRlZi5ub2Rlc1tpXTtcbiAgICBpZiAobm9kZURlZi5mbGFncyAmIGxpZmVjeWNsZXMpIHtcbiAgICAgIGNhbGxQcm92aWRlckxpZmVjeWNsZXModmlldywgaSwgbm9kZURlZi5mbGFncyAmIGxpZmVjeWNsZXMsIGluaXRJbmRleCsrKTtcbiAgICB9XG4gICAgLy8gb25seSB2aXNpdCBkaXJlY3QgY2hpbGRyZW5cbiAgICBpICs9IG5vZGVEZWYuY2hpbGRDb3VudDtcbiAgfVxuICByZXR1cm4gaW5pdEluZGV4O1xufVxuXG5mdW5jdGlvbiBjYWxsUHJvdmlkZXJMaWZlY3ljbGVzKFxuICAgIHZpZXc6IFZpZXdEYXRhLCBpbmRleDogbnVtYmVyLCBsaWZlY3ljbGVzOiBOb2RlRmxhZ3MsIGluaXRJbmRleDogbnVtYmVyKSB7XG4gIGNvbnN0IHByb3ZpZGVyRGF0YSA9IGFzUHJvdmlkZXJEYXRhKHZpZXcsIGluZGV4KTtcbiAgaWYgKCFwcm92aWRlckRhdGEpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgcHJvdmlkZXIgPSBwcm92aWRlckRhdGEuaW5zdGFuY2U7XG4gIGlmICghcHJvdmlkZXIpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgU2VydmljZXMuc2V0Q3VycmVudE5vZGUodmlldywgaW5kZXgpO1xuICBpZiAobGlmZWN5Y2xlcyAmIE5vZGVGbGFncy5BZnRlckNvbnRlbnRJbml0ICYmXG4gICAgICBzaG91bGRDYWxsTGlmZWN5Y2xlSW5pdEhvb2sodmlldywgVmlld1N0YXRlLkluaXRTdGF0ZV9DYWxsaW5nQWZ0ZXJDb250ZW50SW5pdCwgaW5pdEluZGV4KSkge1xuICAgIHByb3ZpZGVyLm5nQWZ0ZXJDb250ZW50SW5pdCgpO1xuICB9XG4gIGlmIChsaWZlY3ljbGVzICYgTm9kZUZsYWdzLkFmdGVyQ29udGVudENoZWNrZWQpIHtcbiAgICBwcm92aWRlci5uZ0FmdGVyQ29udGVudENoZWNrZWQoKTtcbiAgfVxuICBpZiAobGlmZWN5Y2xlcyAmIE5vZGVGbGFncy5BZnRlclZpZXdJbml0ICYmXG4gICAgICBzaG91bGRDYWxsTGlmZWN5Y2xlSW5pdEhvb2sodmlldywgVmlld1N0YXRlLkluaXRTdGF0ZV9DYWxsaW5nQWZ0ZXJWaWV3SW5pdCwgaW5pdEluZGV4KSkge1xuICAgIHByb3ZpZGVyLm5nQWZ0ZXJWaWV3SW5pdCgpO1xuICB9XG4gIGlmIChsaWZlY3ljbGVzICYgTm9kZUZsYWdzLkFmdGVyVmlld0NoZWNrZWQpIHtcbiAgICBwcm92aWRlci5uZ0FmdGVyVmlld0NoZWNrZWQoKTtcbiAgfVxuICBpZiAobGlmZWN5Y2xlcyAmIE5vZGVGbGFncy5PbkRlc3Ryb3kpIHtcbiAgICBwcm92aWRlci5uZ09uRGVzdHJveSgpO1xuICB9XG59XG4iXX0=