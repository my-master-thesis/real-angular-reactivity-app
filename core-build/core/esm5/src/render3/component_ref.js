/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __extends } from "tslib";
import { InjectionToken } from '../di/injection_token';
import { ComponentFactory as viewEngine_ComponentFactory, ComponentRef as viewEngine_ComponentRef } from '../linker/component_factory';
import { ComponentFactoryResolver as viewEngine_ComponentFactoryResolver } from '../linker/component_factory_resolver';
import { ElementRef as viewEngine_ElementRef } from '../linker/element_ref';
import { RendererFactory2 } from '../render/api';
import { Sanitizer } from '../sanitization/sanitizer';
import { VERSION } from '../version';
import { NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR } from '../view/provider';
import { assertComponentType } from './assert';
import { createRootComponent, createRootComponentView, createRootContext, LifecycleHooksFeature } from './component';
import { getComponentDef } from './definition';
import { NodeInjector } from './di';
import { assignTViewNodeToLView, createLView, createTView, elementCreate, locateHostElement, renderView } from './instructions/shared';
import { domRendererFactory3 } from './interfaces/renderer';
import { TVIEW } from './interfaces/view';
import { MATH_ML_NAMESPACE, SVG_NAMESPACE } from './namespaces';
import { writeDirectClass } from './node_manipulation';
import { extractAttrsAndClassesFromSelector, stringifyCSSSelectorList } from './node_selector_matcher';
import { enterView, leaveView } from './state';
import { setUpAttributes } from './util/attrs_utils';
import { defaultScheduler } from './util/misc_utils';
import { getTNode } from './util/view_utils';
import { createElementRef } from './view_engine_compatibility';
import { RootViewRef } from './view_ref';
import { ChangeDetectionStrategy } from '../core';
var ComponentFactoryResolver = /** @class */ (function (_super) {
    __extends(ComponentFactoryResolver, _super);
    /**
     * @param ngModule The NgModuleRef to which all resolved factories are bound.
     */
    function ComponentFactoryResolver(ngModule) {
        var _this = _super.call(this) || this;
        _this.ngModule = ngModule;
        return _this;
    }
    ComponentFactoryResolver.prototype.resolveComponentFactory = function (component) {
        ngDevMode && assertComponentType(component);
        var componentDef = getComponentDef(component);
        return new ComponentFactory(componentDef, this.ngModule);
    };
    return ComponentFactoryResolver;
}(viewEngine_ComponentFactoryResolver));
export { ComponentFactoryResolver };
function toRefArray(map) {
    var array = [];
    for (var nonMinified in map) {
        if (map.hasOwnProperty(nonMinified)) {
            var minified = map[nonMinified];
            array.push({ propName: minified, templateName: nonMinified });
        }
    }
    return array;
}
function getNamespace(elementName) {
    var name = elementName.toLowerCase();
    return name === 'svg' ? SVG_NAMESPACE : (name === 'math' ? MATH_ML_NAMESPACE : null);
}
/**
 * A change detection scheduler token for {@link RootContext}. This token is the default value used
 * for the default `RootContext` found in the {@link ROOT_CONTEXT} token.
 */
export var SCHEDULER = new InjectionToken('SCHEDULER_TOKEN', {
    providedIn: 'root',
    factory: function () { return defaultScheduler; },
});
function createChainedInjector(rootViewInjector, moduleInjector) {
    return {
        get: function (token, notFoundValue, flags) {
            var value = rootViewInjector.get(token, NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR, flags);
            if (value !== NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR ||
                notFoundValue === NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR) {
                // Return the value from the root element injector when
                // - it provides it
                //   (value !== NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR)
                // - the module injector should not be checked
                //   (notFoundValue === NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR)
                return value;
            }
            return moduleInjector.get(token, notFoundValue, flags);
        }
    };
}
/**
 * Render3 implementation of {@link viewEngine_ComponentFactory}.
 */
var ComponentFactory = /** @class */ (function (_super) {
    __extends(ComponentFactory, _super);
    /**
     * @param componentDef The component definition.
     * @param ngModule The NgModuleRef to which the factory is bound.
     */
    function ComponentFactory(componentDef, ngModule) {
        var _this = _super.call(this) || this;
        _this.componentDef = componentDef;
        _this.ngModule = ngModule;
        _this.componentType = componentDef.type;
        _this.selector = stringifyCSSSelectorList(componentDef.selectors);
        _this.ngContentSelectors =
            componentDef.ngContentSelectors ? componentDef.ngContentSelectors : [];
        _this.isBoundToModule = !!ngModule;
        return _this;
    }
    Object.defineProperty(ComponentFactory.prototype, "inputs", {
        get: function () {
            return toRefArray(this.componentDef.inputs);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComponentFactory.prototype, "outputs", {
        get: function () {
            return toRefArray(this.componentDef.outputs);
        },
        enumerable: true,
        configurable: true
    });
    ComponentFactory.prototype.create = function (injector, projectableNodes, rootSelectorOrNode, ngModule) {
        ngModule = ngModule || this.ngModule;
        var rootViewInjector = ngModule ? createChainedInjector(injector, ngModule.injector) : injector;
        var rendererFactory = rootViewInjector.get(RendererFactory2, domRendererFactory3);
        var sanitizer = rootViewInjector.get(Sanitizer, null);
        var hostRenderer = rendererFactory.createRenderer(null, this.componentDef);
        // Determine a tag name used for creating host elements when this component is created
        // dynamically. Default to 'div' if this component did not specify any tag name in its selector.
        var elementName = this.componentDef.selectors[0][0] || 'div';
        var hostRNode = rootSelectorOrNode ?
            locateHostElement(hostRenderer, rootSelectorOrNode, this.componentDef.encapsulation) :
            elementCreate(elementName, rendererFactory.createRenderer(null, this.componentDef), getNamespace(elementName));
        var rootFlags = this.componentDef.changeDetection !== ChangeDetectionStrategy.Default ? 64 /* Dirty */ | 512 /* IsRoot */ :
            16 /* CheckAlways */ | 512 /* IsRoot */;
        // Check whether this Component needs to be isolated from other components, i.e. whether it
        // should be placed into its own (empty) root context or existing root context should be used.
        // Note: this is internal-only convention and might change in the future, so it should not be
        // relied upon externally.
        var isIsolated = typeof rootSelectorOrNode === 'string' &&
            /^#root-ng-internal-isolated-\d+/.test(rootSelectorOrNode);
        var rootContext = createRootContext();
        // Create the root view. Uses empty TView and ContentTemplate.
        var rootTView = createTView(0 /* Root */, -1, null, 1, 0, null, null, null, null, null);
        var rootLView = createLView(null, rootTView, rootContext, rootFlags, null, null, rendererFactory, hostRenderer, sanitizer, rootViewInjector);
        // rootView is the parent when bootstrapping
        // TODO(misko): it looks like we are entering view here but we don't really need to as
        // `renderView` does that. However as the code is written it is needed because
        // `createRootComponentView` and `createRootComponent` both read global state. Fixing those
        // issues would allow us to drop this.
        enterView(rootLView, null);
        var component;
        var tElementNode;
        try {
            var componentView = createRootComponentView(hostRNode, this.componentDef, rootLView, rendererFactory, hostRenderer);
            if (hostRNode) {
                if (rootSelectorOrNode) {
                    setUpAttributes(hostRenderer, hostRNode, ['ng-version', VERSION.full]);
                }
                else {
                    // If host element is created as a part of this function call (i.e. `rootSelectorOrNode`
                    // is not defined), also apply attributes and classes extracted from component selector.
                    // Extract attributes and classes from the first selector only to match VE behavior.
                    var _a = extractAttrsAndClassesFromSelector(this.componentDef.selectors[0]), attrs = _a.attrs, classes = _a.classes;
                    if (attrs) {
                        setUpAttributes(hostRenderer, hostRNode, attrs);
                    }
                    if (classes && classes.length > 0) {
                        writeDirectClass(hostRenderer, hostRNode, classes.join(' '));
                    }
                }
            }
            tElementNode = getTNode(rootLView[TVIEW], 0);
            if (projectableNodes) {
                // projectable nodes can be passed as array of arrays or an array of iterables (ngUpgrade
                // case). Here we do normalize passed data structure to be an array of arrays to avoid
                // complex checks down the line.
                tElementNode.projection =
                    projectableNodes.map(function (nodesforSlot) { return Array.from(nodesforSlot); });
            }
            // TODO: should LifecycleHooksFeature and other host features be generated by the compiler and
            // executed here?
            // Angular 5 reference: https://stackblitz.com/edit/lifecycle-hooks-vcref
            component = createRootComponent(componentView, this.componentDef, rootLView, rootContext, [LifecycleHooksFeature]);
            renderView(rootTView, rootLView, null);
        }
        finally {
            leaveView();
        }
        var componentRef = new ComponentRef(this.componentType, component, createElementRef(viewEngine_ElementRef, tElementNode, rootLView), rootLView, tElementNode);
        if (!rootSelectorOrNode || isIsolated) {
            // The host element of the internal or isolated root view is attached to the component's host
            // view node.
            componentRef.hostView._tViewNode.child = tElementNode;
        }
        return componentRef;
    };
    return ComponentFactory;
}(viewEngine_ComponentFactory));
export { ComponentFactory };
var componentFactoryResolver = new ComponentFactoryResolver();
/**
 * Creates a ComponentFactoryResolver and stores it on the injector. Or, if the
 * ComponentFactoryResolver
 * already exists, retrieves the existing ComponentFactoryResolver.
 *
 * @returns The ComponentFactoryResolver instance to use
 */
export function injectComponentFactoryResolver() {
    return componentFactoryResolver;
}
/**
 * Represents an instance of a Component created via a {@link ComponentFactory}.
 *
 * `ComponentRef` provides access to the Component Instance as well other objects related to this
 * Component Instance and allows you to destroy the Component Instance via the {@link #destroy}
 * method.
 *
 */
var ComponentRef = /** @class */ (function (_super) {
    __extends(ComponentRef, _super);
    function ComponentRef(componentType, instance, location, _rootLView, _tNode) {
        var _this = _super.call(this) || this;
        _this.location = location;
        _this._rootLView = _rootLView;
        _this._tNode = _tNode;
        _this.destroyCbs = [];
        _this.instance = instance;
        _this.hostView = _this.changeDetectorRef = new RootViewRef(_rootLView);
        _this.hostView._tViewNode = assignTViewNodeToLView(_rootLView[TVIEW], null, -1, _rootLView);
        _this.componentType = componentType;
        return _this;
    }
    Object.defineProperty(ComponentRef.prototype, "injector", {
        get: function () { return new NodeInjector(this._tNode, this._rootLView); },
        enumerable: true,
        configurable: true
    });
    ComponentRef.prototype.destroy = function () {
        if (this.destroyCbs) {
            this.destroyCbs.forEach(function (fn) { return fn(); });
            this.destroyCbs = null;
            !this.hostView.destroyed && this.hostView.destroy();
        }
    };
    ComponentRef.prototype.onDestroy = function (callback) {
        if (this.destroyCbs) {
            this.destroyCbs.push(callback);
        }
    };
    return ComponentRef;
}(viewEngine_ComponentRef));
export { ComponentRef };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50X3JlZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvY29tcG9uZW50X3JlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBR0gsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBSXJELE9BQU8sRUFDTCxnQkFBZ0IsSUFBSSwyQkFBMkIsRUFDL0MsWUFBWSxJQUFJLHVCQUF1QixFQUN4QyxNQUFNLDZCQUE2QixDQUFDO0FBQ3JDLE9BQU8sRUFBQyx3QkFBd0IsSUFBSSxtQ0FBbUMsRUFBQyxNQUFNLHNDQUFzQyxDQUFDO0FBQ3JILE9BQU8sRUFBQyxVQUFVLElBQUkscUJBQXFCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUUxRSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDL0MsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBQ3BELE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDbkMsT0FBTyxFQUFDLHFDQUFxQyxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFFdkUsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQzdDLE9BQU8sRUFBQyxtQkFBbUIsRUFBRSx1QkFBdUIsRUFBRSxpQkFBaUIsRUFBRSxxQkFBcUIsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUNuSCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzdDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDbEMsT0FBTyxFQUNMLHNCQUFzQixFQUN0QixXQUFXLEVBQ1gsV0FBVyxFQUNYLGFBQWEsRUFDYixpQkFBaUIsRUFDakIsVUFBVSxFQUNYLE1BQU0sdUJBQXVCLENBQUM7QUFHL0IsT0FB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RUFBRTtZQUNuQixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEVBQUUsSUFBSSxPQUFBLEVBQUUsRUFBRSxFQUFKLENBQUksQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1lBQ3ZCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNyRDtJQUNILENBQUM7SUFFRCxnQ0FBUyxHQUFULFVBQVUsUUFBb0I7UUFDNUIsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ25CLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ2hDO0lBQ0gsQ0FBQztJQUNILG1CQUFDO0FBQUQsQ0FBQyxBQWpDRCxDQUFxQyx1QkFBdUIsR0FpQzNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NoYW5nZURldGVjdG9yUmVmIGFzIFZpZXdFbmdpbmVfQ2hhbmdlRGV0ZWN0b3JSZWZ9IGZyb20gJy4uL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdG9yX3JlZic7XG5pbXBvcnQge0luamVjdGlvblRva2VufSBmcm9tICcuLi9kaS9pbmplY3Rpb25fdG9rZW4nO1xuaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnLi4vZGkvaW5qZWN0b3InO1xuaW1wb3J0IHtJbmplY3RGbGFnc30gZnJvbSAnLi4vZGkvaW50ZXJmYWNlL2luamVjdG9yJztcbmltcG9ydCB7VHlwZX0gZnJvbSAnLi4vaW50ZXJmYWNlL3R5cGUnO1xuaW1wb3J0IHtcbiAgQ29tcG9uZW50RmFjdG9yeSBhcyB2aWV3RW5naW5lX0NvbXBvbmVudEZhY3RvcnksXG4gIENvbXBvbmVudFJlZiBhcyB2aWV3RW5naW5lX0NvbXBvbmVudFJlZlxufSBmcm9tICcuLi9saW5rZXIvY29tcG9uZW50X2ZhY3RvcnknO1xuaW1wb3J0IHtDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIgYXMgdmlld0VuZ2luZV9Db21wb25lbnRGYWN0b3J5UmVzb2x2ZXJ9IGZyb20gJy4uL2xpbmtlci9jb21wb25lbnRfZmFjdG9yeV9yZXNvbHZlcic7XG5pbXBvcnQge0VsZW1lbnRSZWYgYXMgdmlld0VuZ2luZV9FbGVtZW50UmVmfSBmcm9tICcuLi9saW5rZXIvZWxlbWVudF9yZWYnO1xuaW1wb3J0IHtOZ01vZHVsZVJlZiBhcyB2aWV3RW5naW5lX05nTW9kdWxlUmVmfSBmcm9tICcuLi9saW5rZXIvbmdfbW9kdWxlX2ZhY3RvcnknO1xuaW1wb3J0IHtSZW5kZXJlckZhY3RvcnkyfSBmcm9tICcuLi9yZW5kZXIvYXBpJztcbmltcG9ydCB7U2FuaXRpemVyfSBmcm9tICcuLi9zYW5pdGl6YXRpb24vc2FuaXRpemVyJztcbmltcG9ydCB7VkVSU0lPTn0gZnJvbSAnLi4vdmVyc2lvbic7XG5pbXBvcnQge05PVF9GT1VORF9DSEVDS19PTkxZX0VMRU1FTlRfSU5KRUNUT1J9IGZyb20gJy4uL3ZpZXcvcHJvdmlkZXInO1xuXG5pbXBvcnQge2Fzc2VydENvbXBvbmVudFR5cGV9IGZyb20gJy4vYXNzZXJ0JztcbmltcG9ydCB7Y3JlYXRlUm9vdENvbXBvbmVudCwgY3JlYXRlUm9vdENvbXBvbmVudFZpZXcsIGNyZWF0ZVJvb3RDb250ZXh0LCBMaWZlY3ljbGVIb29rc0ZlYXR1cmV9IGZyb20gJy4vY29tcG9uZW50JztcbmltcG9ydCB7Z2V0Q29tcG9uZW50RGVmfSBmcm9tICcuL2RlZmluaXRpb24nO1xuaW1wb3J0IHtOb2RlSW5qZWN0b3J9IGZyb20gJy4vZGknO1xuaW1wb3J0IHtcbiAgYXNzaWduVFZpZXdOb2RlVG9MVmlldyxcbiAgY3JlYXRlTFZpZXcsXG4gIGNyZWF0ZVRWaWV3LFxuICBlbGVtZW50Q3JlYXRlLFxuICBsb2NhdGVIb3N0RWxlbWVudCxcbiAgcmVuZGVyVmlld1xufSBmcm9tICcuL2luc3RydWN0aW9ucy9zaGFyZWQnO1xuaW1wb3J0IHtDb21wb25lbnREZWZ9IGZyb20gJy4vaW50ZXJmYWNlcy9kZWZpbml0aW9uJztcbmltcG9ydCB7VENvbnRhaW5lck5vZGUsIFRFbGVtZW50Q29udGFpbmVyTm9kZSwgVEVsZW1lbnROb2RlfSBmcm9tICcuL2ludGVyZmFjZXMvbm9kZSc7XG5pbXBvcnQge2RvbVJlbmRlcmVyRmFjdG9yeTMsIFJlbmRlcmVyRmFjdG9yeTMsIFJOb2RlfSBmcm9tICcuL2ludGVyZmFjZXMvcmVuZGVyZXInO1xuaW1wb3J0IHtMVmlldywgTFZpZXdGbGFncywgVFZJRVcsIFRWaWV3VHlwZX0gZnJvbSAnLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtNQVRIX01MX05BTUVTUEFDRSwgU1ZHX05BTUVTUEFDRX0gZnJvbSAnLi9uYW1lc3BhY2VzJztcbmltcG9ydCB7d3JpdGVEaXJlY3RDbGFzc30gZnJvbSAnLi9ub2RlX21hbmlwdWxhdGlvbic7XG5pbXBvcnQge2V4dHJhY3RBdHRyc0FuZENsYXNzZXNGcm9tU2VsZWN0b3IsIHN0cmluZ2lmeUNTU1NlbGVjdG9yTGlzdH0gZnJvbSAnLi9ub2RlX3NlbGVjdG9yX21hdGNoZXInO1xuaW1wb3J0IHtlbnRlclZpZXcsIGxlYXZlVmlld30gZnJvbSAnLi9zdGF0ZSc7XG5pbXBvcnQge3NldFVwQXR0cmlidXRlc30gZnJvbSAnLi91dGlsL2F0dHJzX3V0aWxzJztcbmltcG9ydCB7ZGVmYXVsdFNjaGVkdWxlcn0gZnJvbSAnLi91dGlsL21pc2NfdXRpbHMnO1xuaW1wb3J0IHtnZXRUTm9kZX0gZnJvbSAnLi91dGlsL3ZpZXdfdXRpbHMnO1xuaW1wb3J0IHtjcmVhdGVFbGVtZW50UmVmfSBmcm9tICcuL3ZpZXdfZW5naW5lX2NvbXBhdGliaWxpdHknO1xuaW1wb3J0IHtSb290Vmlld1JlZiwgVmlld1JlZn0gZnJvbSAnLi92aWV3X3JlZic7XG5pbXBvcnQge0NoYW5nZURldGVjdGlvblN0cmF0ZWd5fSBmcm9tICcuLi9jb3JlJztcblxuZXhwb3J0IGNsYXNzIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciBleHRlbmRzIHZpZXdFbmdpbmVfQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSBuZ01vZHVsZSBUaGUgTmdNb2R1bGVSZWYgdG8gd2hpY2ggYWxsIHJlc29sdmVkIGZhY3RvcmllcyBhcmUgYm91bmQuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG5nTW9kdWxlPzogdmlld0VuZ2luZV9OZ01vZHVsZVJlZjxhbnk+KSB7IHN1cGVyKCk7IH1cblxuICByZXNvbHZlQ29tcG9uZW50RmFjdG9yeTxUPihjb21wb25lbnQ6IFR5cGU8VD4pOiB2aWV3RW5naW5lX0NvbXBvbmVudEZhY3Rvcnk8VD4ge1xuICAgIG5nRGV2TW9kZSAmJiBhc3NlcnRDb21wb25lbnRUeXBlKGNvbXBvbmVudCk7XG4gICAgY29uc3QgY29tcG9uZW50RGVmID0gZ2V0Q29tcG9uZW50RGVmKGNvbXBvbmVudCkgITtcbiAgICByZXR1cm4gbmV3IENvbXBvbmVudEZhY3RvcnkoY29tcG9uZW50RGVmLCB0aGlzLm5nTW9kdWxlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB0b1JlZkFycmF5KG1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30pOiB7cHJvcE5hbWU6IHN0cmluZzsgdGVtcGxhdGVOYW1lOiBzdHJpbmc7fVtdIHtcbiAgY29uc3QgYXJyYXk6IHtwcm9wTmFtZTogc3RyaW5nOyB0ZW1wbGF0ZU5hbWU6IHN0cmluZzt9W10gPSBbXTtcbiAgZm9yIChsZXQgbm9uTWluaWZpZWQgaW4gbWFwKSB7XG4gICAgaWYgKG1hcC5oYXNPd25Qcm9wZXJ0eShub25NaW5pZmllZCkpIHtcbiAgICAgIGNvbnN0IG1pbmlmaWVkID0gbWFwW25vbk1pbmlmaWVkXTtcbiAgICAgIGFycmF5LnB1c2goe3Byb3BOYW1lOiBtaW5pZmllZCwgdGVtcGxhdGVOYW1lOiBub25NaW5pZmllZH0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYXJyYXk7XG59XG5cbmZ1bmN0aW9uIGdldE5hbWVzcGFjZShlbGVtZW50TmFtZTogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICBjb25zdCBuYW1lID0gZWxlbWVudE5hbWUudG9Mb3dlckNhc2UoKTtcbiAgcmV0dXJuIG5hbWUgPT09ICdzdmcnID8gU1ZHX05BTUVTUEFDRSA6IChuYW1lID09PSAnbWF0aCcgPyBNQVRIX01MX05BTUVTUEFDRSA6IG51bGwpO1xufVxuXG4vKipcbiAqIEEgY2hhbmdlIGRldGVjdGlvbiBzY2hlZHVsZXIgdG9rZW4gZm9yIHtAbGluayBSb290Q29udGV4dH0uIFRoaXMgdG9rZW4gaXMgdGhlIGRlZmF1bHQgdmFsdWUgdXNlZFxuICogZm9yIHRoZSBkZWZhdWx0IGBSb290Q29udGV4dGAgZm91bmQgaW4gdGhlIHtAbGluayBST09UX0NPTlRFWFR9IHRva2VuLlxuICovXG5leHBvcnQgY29uc3QgU0NIRURVTEVSID0gbmV3IEluamVjdGlvblRva2VuPCgoZm46ICgpID0+IHZvaWQpID0+IHZvaWQpPignU0NIRURVTEVSX1RPS0VOJywge1xuICBwcm92aWRlZEluOiAncm9vdCcsXG4gIGZhY3Rvcnk6ICgpID0+IGRlZmF1bHRTY2hlZHVsZXIsXG59KTtcblxuZnVuY3Rpb24gY3JlYXRlQ2hhaW5lZEluamVjdG9yKHJvb3RWaWV3SW5qZWN0b3I6IEluamVjdG9yLCBtb2R1bGVJbmplY3RvcjogSW5qZWN0b3IpOiBJbmplY3RvciB7XG4gIHJldHVybiB7XG4gICAgZ2V0OiA8VD4odG9rZW46IFR5cGU8VD58IEluamVjdGlvblRva2VuPFQ+LCBub3RGb3VuZFZhbHVlPzogVCwgZmxhZ3M/OiBJbmplY3RGbGFncyk6IFQgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSByb290Vmlld0luamVjdG9yLmdldCh0b2tlbiwgTk9UX0ZPVU5EX0NIRUNLX09OTFlfRUxFTUVOVF9JTkpFQ1RPUiBhcyBULCBmbGFncyk7XG5cbiAgICAgIGlmICh2YWx1ZSAhPT0gTk9UX0ZPVU5EX0NIRUNLX09OTFlfRUxFTUVOVF9JTkpFQ1RPUiB8fFxuICAgICAgICAgIG5vdEZvdW5kVmFsdWUgPT09IE5PVF9GT1VORF9DSEVDS19PTkxZX0VMRU1FTlRfSU5KRUNUT1IpIHtcbiAgICAgICAgLy8gUmV0dXJuIHRoZSB2YWx1ZSBmcm9tIHRoZSByb290IGVsZW1lbnQgaW5qZWN0b3Igd2hlblxuICAgICAgICAvLyAtIGl0IHByb3ZpZGVzIGl0XG4gICAgICAgIC8vICAgKHZhbHVlICE9PSBOT1RfRk9VTkRfQ0hFQ0tfT05MWV9FTEVNRU5UX0lOSkVDVE9SKVxuICAgICAgICAvLyAtIHRoZSBtb2R1bGUgaW5qZWN0b3Igc2hvdWxkIG5vdCBiZSBjaGVja2VkXG4gICAgICAgIC8vICAgKG5vdEZvdW5kVmFsdWUgPT09IE5PVF9GT1VORF9DSEVDS19PTkxZX0VMRU1FTlRfSU5KRUNUT1IpXG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1vZHVsZUluamVjdG9yLmdldCh0b2tlbiwgbm90Rm91bmRWYWx1ZSwgZmxhZ3MpO1xuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBSZW5kZXIzIGltcGxlbWVudGF0aW9uIG9mIHtAbGluayB2aWV3RW5naW5lX0NvbXBvbmVudEZhY3Rvcnl9LlxuICovXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50RmFjdG9yeTxUPiBleHRlbmRzIHZpZXdFbmdpbmVfQ29tcG9uZW50RmFjdG9yeTxUPiB7XG4gIHNlbGVjdG9yOiBzdHJpbmc7XG4gIGNvbXBvbmVudFR5cGU6IFR5cGU8YW55PjtcbiAgbmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXTtcbiAgaXNCb3VuZFRvTW9kdWxlOiBib29sZWFuO1xuXG4gIGdldCBpbnB1dHMoKToge3Byb3BOYW1lOiBzdHJpbmc7IHRlbXBsYXRlTmFtZTogc3RyaW5nO31bXSB7XG4gICAgcmV0dXJuIHRvUmVmQXJyYXkodGhpcy5jb21wb25lbnREZWYuaW5wdXRzKTtcbiAgfVxuXG4gIGdldCBvdXRwdXRzKCk6IHtwcm9wTmFtZTogc3RyaW5nOyB0ZW1wbGF0ZU5hbWU6IHN0cmluZzt9W10ge1xuICAgIHJldHVybiB0b1JlZkFycmF5KHRoaXMuY29tcG9uZW50RGVmLm91dHB1dHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBjb21wb25lbnREZWYgVGhlIGNvbXBvbmVudCBkZWZpbml0aW9uLlxuICAgKiBAcGFyYW0gbmdNb2R1bGUgVGhlIE5nTW9kdWxlUmVmIHRvIHdoaWNoIHRoZSBmYWN0b3J5IGlzIGJvdW5kLlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGNvbXBvbmVudERlZjogQ29tcG9uZW50RGVmPGFueT4sIHByaXZhdGUgbmdNb2R1bGU/OiB2aWV3RW5naW5lX05nTW9kdWxlUmVmPGFueT4pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuY29tcG9uZW50VHlwZSA9IGNvbXBvbmVudERlZi50eXBlO1xuICAgIHRoaXMuc2VsZWN0b3IgPSBzdHJpbmdpZnlDU1NTZWxlY3Rvckxpc3QoY29tcG9uZW50RGVmLnNlbGVjdG9ycyk7XG4gICAgdGhpcy5uZ0NvbnRlbnRTZWxlY3RvcnMgPVxuICAgICAgICBjb21wb25lbnREZWYubmdDb250ZW50U2VsZWN0b3JzID8gY29tcG9uZW50RGVmLm5nQ29udGVudFNlbGVjdG9ycyA6IFtdO1xuICAgIHRoaXMuaXNCb3VuZFRvTW9kdWxlID0gISFuZ01vZHVsZTtcbiAgfVxuXG4gIGNyZWF0ZShcbiAgICAgIGluamVjdG9yOiBJbmplY3RvciwgcHJvamVjdGFibGVOb2Rlcz86IGFueVtdW118dW5kZWZpbmVkLCByb290U2VsZWN0b3JPck5vZGU/OiBhbnksXG4gICAgICBuZ01vZHVsZT86IHZpZXdFbmdpbmVfTmdNb2R1bGVSZWY8YW55Pnx1bmRlZmluZWQpOiB2aWV3RW5naW5lX0NvbXBvbmVudFJlZjxUPiB7XG4gICAgbmdNb2R1bGUgPSBuZ01vZHVsZSB8fCB0aGlzLm5nTW9kdWxlO1xuXG4gICAgY29uc3Qgcm9vdFZpZXdJbmplY3RvciA9XG4gICAgICAgIG5nTW9kdWxlID8gY3JlYXRlQ2hhaW5lZEluamVjdG9yKGluamVjdG9yLCBuZ01vZHVsZS5pbmplY3RvcikgOiBpbmplY3RvcjtcblxuICAgIGNvbnN0IHJlbmRlcmVyRmFjdG9yeSA9XG4gICAgICAgIHJvb3RWaWV3SW5qZWN0b3IuZ2V0KFJlbmRlcmVyRmFjdG9yeTIsIGRvbVJlbmRlcmVyRmFjdG9yeTMpIGFzIFJlbmRlcmVyRmFjdG9yeTM7XG4gICAgY29uc3Qgc2FuaXRpemVyID0gcm9vdFZpZXdJbmplY3Rvci5nZXQoU2FuaXRpemVyLCBudWxsKTtcblxuICAgIGNvbnN0IGhvc3RSZW5kZXJlciA9IHJlbmRlcmVyRmFjdG9yeS5jcmVhdGVSZW5kZXJlcihudWxsLCB0aGlzLmNvbXBvbmVudERlZik7XG4gICAgLy8gRGV0ZXJtaW5lIGEgdGFnIG5hbWUgdXNlZCBmb3IgY3JlYXRpbmcgaG9zdCBlbGVtZW50cyB3aGVuIHRoaXMgY29tcG9uZW50IGlzIGNyZWF0ZWRcbiAgICAvLyBkeW5hbWljYWxseS4gRGVmYXVsdCB0byAnZGl2JyBpZiB0aGlzIGNvbXBvbmVudCBkaWQgbm90IHNwZWNpZnkgYW55IHRhZyBuYW1lIGluIGl0cyBzZWxlY3Rvci5cbiAgICBjb25zdCBlbGVtZW50TmFtZSA9IHRoaXMuY29tcG9uZW50RGVmLnNlbGVjdG9yc1swXVswXSBhcyBzdHJpbmcgfHwgJ2Rpdic7XG4gICAgY29uc3QgaG9zdFJOb2RlID0gcm9vdFNlbGVjdG9yT3JOb2RlID9cbiAgICAgICAgbG9jYXRlSG9zdEVsZW1lbnQoaG9zdFJlbmRlcmVyLCByb290U2VsZWN0b3JPck5vZGUsIHRoaXMuY29tcG9uZW50RGVmLmVuY2Fwc3VsYXRpb24pIDpcbiAgICAgICAgZWxlbWVudENyZWF0ZShcbiAgICAgICAgICAgIGVsZW1lbnROYW1lLCByZW5kZXJlckZhY3RvcnkuY3JlYXRlUmVuZGVyZXIobnVsbCwgdGhpcy5jb21wb25lbnREZWYpLFxuICAgICAgICAgICAgZ2V0TmFtZXNwYWNlKGVsZW1lbnROYW1lKSk7XG5cbiAgICBjb25zdCByb290RmxhZ3MgPSB0aGlzLmNvbXBvbmVudERlZi5jaGFuZ2VEZXRlY3Rpb24gIT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHQgPyBMVmlld0ZsYWdzLkRpcnR5IHwgTFZpZXdGbGFncy5Jc1Jvb3QgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIExWaWV3RmxhZ3MuQ2hlY2tBbHdheXMgfCBMVmlld0ZsYWdzLklzUm9vdDtcblxuICAgIC8vIENoZWNrIHdoZXRoZXIgdGhpcyBDb21wb25lbnQgbmVlZHMgdG8gYmUgaXNvbGF0ZWQgZnJvbSBvdGhlciBjb21wb25lbnRzLCBpLmUuIHdoZXRoZXIgaXRcbiAgICAvLyBzaG91bGQgYmUgcGxhY2VkIGludG8gaXRzIG93biAoZW1wdHkpIHJvb3QgY29udGV4dCBvciBleGlzdGluZyByb290IGNvbnRleHQgc2hvdWxkIGJlIHVzZWQuXG4gICAgLy8gTm90ZTogdGhpcyBpcyBpbnRlcm5hbC1vbmx5IGNvbnZlbnRpb24gYW5kIG1pZ2h0IGNoYW5nZSBpbiB0aGUgZnV0dXJlLCBzbyBpdCBzaG91bGQgbm90IGJlXG4gICAgLy8gcmVsaWVkIHVwb24gZXh0ZXJuYWxseS5cbiAgICBjb25zdCBpc0lzb2xhdGVkID0gdHlwZW9mIHJvb3RTZWxlY3Rvck9yTm9kZSA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgL14jcm9vdC1uZy1pbnRlcm5hbC1pc29sYXRlZC1cXGQrLy50ZXN0KHJvb3RTZWxlY3Rvck9yTm9kZSk7XG5cbiAgICBjb25zdCByb290Q29udGV4dCA9IGNyZWF0ZVJvb3RDb250ZXh0KCk7XG5cbiAgICAvLyBDcmVhdGUgdGhlIHJvb3Qgdmlldy4gVXNlcyBlbXB0eSBUVmlldyBhbmQgQ29udGVudFRlbXBsYXRlLlxuICAgIGNvbnN0IHJvb3RUVmlldyA9IGNyZWF0ZVRWaWV3KFRWaWV3VHlwZS5Sb290LCAtMSwgbnVsbCwgMSwgMCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCk7XG4gICAgY29uc3Qgcm9vdExWaWV3ID0gY3JlYXRlTFZpZXcoXG4gICAgICAgIG51bGwsIHJvb3RUVmlldywgcm9vdENvbnRleHQsIHJvb3RGbGFncywgbnVsbCwgbnVsbCwgcmVuZGVyZXJGYWN0b3J5LCBob3N0UmVuZGVyZXIsXG4gICAgICAgIHNhbml0aXplciwgcm9vdFZpZXdJbmplY3Rvcik7XG5cbiAgICAvLyByb290VmlldyBpcyB0aGUgcGFyZW50IHdoZW4gYm9vdHN0cmFwcGluZ1xuICAgIC8vIFRPRE8obWlza28pOiBpdCBsb29rcyBsaWtlIHdlIGFyZSBlbnRlcmluZyB2aWV3IGhlcmUgYnV0IHdlIGRvbid0IHJlYWxseSBuZWVkIHRvIGFzXG4gICAgLy8gYHJlbmRlclZpZXdgIGRvZXMgdGhhdC4gSG93ZXZlciBhcyB0aGUgY29kZSBpcyB3cml0dGVuIGl0IGlzIG5lZWRlZCBiZWNhdXNlXG4gICAgLy8gYGNyZWF0ZVJvb3RDb21wb25lbnRWaWV3YCBhbmQgYGNyZWF0ZVJvb3RDb21wb25lbnRgIGJvdGggcmVhZCBnbG9iYWwgc3RhdGUuIEZpeGluZyB0aG9zZVxuICAgIC8vIGlzc3VlcyB3b3VsZCBhbGxvdyB1cyB0byBkcm9wIHRoaXMuXG4gICAgZW50ZXJWaWV3KHJvb3RMVmlldywgbnVsbCk7XG5cbiAgICBsZXQgY29tcG9uZW50OiBUO1xuICAgIGxldCB0RWxlbWVudE5vZGU6IFRFbGVtZW50Tm9kZTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb21wb25lbnRWaWV3ID0gY3JlYXRlUm9vdENvbXBvbmVudFZpZXcoXG4gICAgICAgICAgaG9zdFJOb2RlLCB0aGlzLmNvbXBvbmVudERlZiwgcm9vdExWaWV3LCByZW5kZXJlckZhY3RvcnksIGhvc3RSZW5kZXJlcik7XG4gICAgICBpZiAoaG9zdFJOb2RlKSB7XG4gICAgICAgIGlmIChyb290U2VsZWN0b3JPck5vZGUpIHtcbiAgICAgICAgICBzZXRVcEF0dHJpYnV0ZXMoaG9zdFJlbmRlcmVyLCBob3N0Uk5vZGUsIFsnbmctdmVyc2lvbicsIFZFUlNJT04uZnVsbF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIElmIGhvc3QgZWxlbWVudCBpcyBjcmVhdGVkIGFzIGEgcGFydCBvZiB0aGlzIGZ1bmN0aW9uIGNhbGwgKGkuZS4gYHJvb3RTZWxlY3Rvck9yTm9kZWBcbiAgICAgICAgICAvLyBpcyBub3QgZGVmaW5lZCksIGFsc28gYXBwbHkgYXR0cmlidXRlcyBhbmQgY2xhc3NlcyBleHRyYWN0ZWQgZnJvbSBjb21wb25lbnQgc2VsZWN0b3IuXG4gICAgICAgICAgLy8gRXh0cmFjdCBhdHRyaWJ1dGVzIGFuZCBjbGFzc2VzIGZyb20gdGhlIGZpcnN0IHNlbGVjdG9yIG9ubHkgdG8gbWF0Y2ggVkUgYmVoYXZpb3IuXG4gICAgICAgICAgY29uc3Qge2F0dHJzLCBjbGFzc2VzfSA9XG4gICAgICAgICAgICAgIGV4dHJhY3RBdHRyc0FuZENsYXNzZXNGcm9tU2VsZWN0b3IodGhpcy5jb21wb25lbnREZWYuc2VsZWN0b3JzWzBdKTtcbiAgICAgICAgICBpZiAoYXR0cnMpIHtcbiAgICAgICAgICAgIHNldFVwQXR0cmlidXRlcyhob3N0UmVuZGVyZXIsIGhvc3RSTm9kZSwgYXR0cnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoY2xhc3NlcyAmJiBjbGFzc2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHdyaXRlRGlyZWN0Q2xhc3MoaG9zdFJlbmRlcmVyLCBob3N0Uk5vZGUsIGNsYXNzZXMuam9pbignICcpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdEVsZW1lbnROb2RlID0gZ2V0VE5vZGUocm9vdExWaWV3W1RWSUVXXSwgMCkgYXMgVEVsZW1lbnROb2RlO1xuXG4gICAgICBpZiAocHJvamVjdGFibGVOb2Rlcykge1xuICAgICAgICAvLyBwcm9qZWN0YWJsZSBub2RlcyBjYW4gYmUgcGFzc2VkIGFzIGFycmF5IG9mIGFycmF5cyBvciBhbiBhcnJheSBvZiBpdGVyYWJsZXMgKG5nVXBncmFkZVxuICAgICAgICAvLyBjYXNlKS4gSGVyZSB3ZSBkbyBub3JtYWxpemUgcGFzc2VkIGRhdGEgc3RydWN0dXJlIHRvIGJlIGFuIGFycmF5IG9mIGFycmF5cyB0byBhdm9pZFxuICAgICAgICAvLyBjb21wbGV4IGNoZWNrcyBkb3duIHRoZSBsaW5lLlxuICAgICAgICB0RWxlbWVudE5vZGUucHJvamVjdGlvbiA9XG4gICAgICAgICAgICBwcm9qZWN0YWJsZU5vZGVzLm1hcCgobm9kZXNmb3JTbG90OiBSTm9kZVtdKSA9PiB7IHJldHVybiBBcnJheS5mcm9tKG5vZGVzZm9yU2xvdCk7IH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBUT0RPOiBzaG91bGQgTGlmZWN5Y2xlSG9va3NGZWF0dXJlIGFuZCBvdGhlciBob3N0IGZlYXR1cmVzIGJlIGdlbmVyYXRlZCBieSB0aGUgY29tcGlsZXIgYW5kXG4gICAgICAvLyBleGVjdXRlZCBoZXJlP1xuICAgICAgLy8gQW5ndWxhciA1IHJlZmVyZW5jZTogaHR0cHM6Ly9zdGFja2JsaXR6LmNvbS9lZGl0L2xpZmVjeWNsZS1ob29rcy12Y3JlZlxuICAgICAgY29tcG9uZW50ID0gY3JlYXRlUm9vdENvbXBvbmVudChcbiAgICAgICAgICBjb21wb25lbnRWaWV3LCB0aGlzLmNvbXBvbmVudERlZiwgcm9vdExWaWV3LCByb290Q29udGV4dCwgW0xpZmVjeWNsZUhvb2tzRmVhdHVyZV0pO1xuXG4gICAgICByZW5kZXJWaWV3KHJvb3RUVmlldywgcm9vdExWaWV3LCBudWxsKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgbGVhdmVWaWV3KCk7XG4gICAgfVxuXG4gICAgY29uc3QgY29tcG9uZW50UmVmID0gbmV3IENvbXBvbmVudFJlZihcbiAgICAgICAgdGhpcy5jb21wb25lbnRUeXBlLCBjb21wb25lbnQsXG4gICAgICAgIGNyZWF0ZUVsZW1lbnRSZWYodmlld0VuZ2luZV9FbGVtZW50UmVmLCB0RWxlbWVudE5vZGUsIHJvb3RMVmlldyksIHJvb3RMVmlldywgdEVsZW1lbnROb2RlKTtcblxuICAgIGlmICghcm9vdFNlbGVjdG9yT3JOb2RlIHx8IGlzSXNvbGF0ZWQpIHtcbiAgICAgIC8vIFRoZSBob3N0IGVsZW1lbnQgb2YgdGhlIGludGVybmFsIG9yIGlzb2xhdGVkIHJvb3QgdmlldyBpcyBhdHRhY2hlZCB0byB0aGUgY29tcG9uZW50J3MgaG9zdFxuICAgICAgLy8gdmlldyBub2RlLlxuICAgICAgY29tcG9uZW50UmVmLmhvc3RWaWV3Ll90Vmlld05vZGUgIS5jaGlsZCA9IHRFbGVtZW50Tm9kZTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBvbmVudFJlZjtcbiAgfVxufVxuXG5jb25zdCBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciA9IG5ldyBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIoKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyIGFuZCBzdG9yZXMgaXQgb24gdGhlIGluamVjdG9yLiBPciwgaWYgdGhlXG4gKiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXJcbiAqIGFscmVhZHkgZXhpc3RzLCByZXRyaWV2ZXMgdGhlIGV4aXN0aW5nIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlci5cbiAqXG4gKiBAcmV0dXJucyBUaGUgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyIGluc3RhbmNlIHRvIHVzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0Q29tcG9uZW50RmFjdG9yeVJlc29sdmVyKCk6IHZpZXdFbmdpbmVfQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyIHtcbiAgcmV0dXJuIGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGFuIGluc3RhbmNlIG9mIGEgQ29tcG9uZW50IGNyZWF0ZWQgdmlhIGEge0BsaW5rIENvbXBvbmVudEZhY3Rvcnl9LlxuICpcbiAqIGBDb21wb25lbnRSZWZgIHByb3ZpZGVzIGFjY2VzcyB0byB0aGUgQ29tcG9uZW50IEluc3RhbmNlIGFzIHdlbGwgb3RoZXIgb2JqZWN0cyByZWxhdGVkIHRvIHRoaXNcbiAqIENvbXBvbmVudCBJbnN0YW5jZSBhbmQgYWxsb3dzIHlvdSB0byBkZXN0cm95IHRoZSBDb21wb25lbnQgSW5zdGFuY2UgdmlhIHRoZSB7QGxpbmsgI2Rlc3Ryb3l9XG4gKiBtZXRob2QuXG4gKlxuICovXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50UmVmPFQ+IGV4dGVuZHMgdmlld0VuZ2luZV9Db21wb25lbnRSZWY8VD4ge1xuICBkZXN0cm95Q2JzOiAoKCkgPT4gdm9pZClbXXxudWxsID0gW107XG4gIGluc3RhbmNlOiBUO1xuICBob3N0VmlldzogVmlld1JlZjxUPjtcbiAgY2hhbmdlRGV0ZWN0b3JSZWY6IFZpZXdFbmdpbmVfQ2hhbmdlRGV0ZWN0b3JSZWY7XG4gIGNvbXBvbmVudFR5cGU6IFR5cGU8VD47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBjb21wb25lbnRUeXBlOiBUeXBlPFQ+LCBpbnN0YW5jZTogVCwgcHVibGljIGxvY2F0aW9uOiB2aWV3RW5naW5lX0VsZW1lbnRSZWYsXG4gICAgICBwcml2YXRlIF9yb290TFZpZXc6IExWaWV3LFxuICAgICAgcHJpdmF0ZSBfdE5vZGU6IFRFbGVtZW50Tm9kZXxUQ29udGFpbmVyTm9kZXxURWxlbWVudENvbnRhaW5lck5vZGUpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuaW5zdGFuY2UgPSBpbnN0YW5jZTtcbiAgICB0aGlzLmhvc3RWaWV3ID0gdGhpcy5jaGFuZ2VEZXRlY3RvclJlZiA9IG5ldyBSb290Vmlld1JlZjxUPihfcm9vdExWaWV3KTtcbiAgICB0aGlzLmhvc3RWaWV3Ll90Vmlld05vZGUgPSBhc3NpZ25UVmlld05vZGVUb0xWaWV3KF9yb290TFZpZXdbVFZJRVddLCBudWxsLCAtMSwgX3Jvb3RMVmlldyk7XG4gICAgdGhpcy5jb21wb25lbnRUeXBlID0gY29tcG9uZW50VHlwZTtcbiAgfVxuXG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiBuZXcgTm9kZUluamVjdG9yKHRoaXMuX3ROb2RlLCB0aGlzLl9yb290TFZpZXcpOyB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5kZXN0cm95Q2JzKSB7XG4gICAgICB0aGlzLmRlc3Ryb3lDYnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICAgIHRoaXMuZGVzdHJveUNicyA9IG51bGw7XG4gICAgICAhdGhpcy5ob3N0Vmlldy5kZXN0cm95ZWQgJiYgdGhpcy5ob3N0Vmlldy5kZXN0cm95KCk7XG4gICAgfVxuICB9XG5cbiAgb25EZXN0cm95KGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuZGVzdHJveUNicykge1xuICAgICAgdGhpcy5kZXN0cm95Q2JzLnB1c2goY2FsbGJhY2spO1xuICAgIH1cbiAgfVxufVxuIl19