/**
 * @fileoverview added by tsickle
 * Generated from: packages/core/src/render3/jit/directive.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { getCompilerFacade } from '../../compiler/compiler_facade';
import { resolveForwardRef } from '../../di/forward_ref';
import { getReflect, reflectDependencies } from '../../di/jit/util';
import { componentNeedsResolution, maybeQueueResolutionOfComponentResources } from '../../metadata/resource_loading';
import { ViewEncapsulation } from '../../metadata/view';
import { initNgDevMode } from '../../util/ng_dev_mode';
import { getComponentDef, getDirectiveDef } from '../definition';
import { EMPTY_ARRAY, EMPTY_OBJ } from '../empty';
import { NG_COMP_DEF, NG_DIR_DEF, NG_FACTORY_DEF } from '../fields';
import { stringifyForError } from '../util/misc_utils';
import { angularCoreEnv } from './environment';
import { flushModuleScopingQueueAsMuchAsPossible, patchComponentDefWithScope, transitiveScopesFor } from './module';
/**
 * Compile an Angular component according to its decorator metadata, and patch the resulting
 * component def (ɵcmp) onto the component type.
 *
 * Compilation may be asynchronous (due to the need to resolve URLs for the component template or
 * other resources, for example). In the event that compilation is not immediate, `compileComponent`
 * will enqueue resource resolution into a global queue and will fail to return the `ɵcmp`
 * until the global queue has been resolved with a call to `resolveComponentResources`.
 * @param {?} type
 * @param {?} metadata
 * @return {?}
 */
export function compileComponent(type, metadata) {
    // Initialize ngDevMode. This must be the first statement in compileComponent.
    // See the `initNgDevMode` docstring for more information.
    (typeof ngDevMode === 'undefined' || ngDevMode) && initNgDevMode();
    /** @type {?} */
    let ngComponentDef = null;
    // Metadata may have resources which need to be resolved.
    maybeQueueResolutionOfComponentResources(type, metadata);
    // Note that we're using the same function as `Directive`, because that's only subset of metadata
    // that we need to create the ngFactoryDef. We're avoiding using the component metadata
    // because we'd have to resolve the asynchronous templates.
    addDirectiveFactoryDef(type, metadata);
    Object.defineProperty(type, NG_COMP_DEF, {
        get: (/**
         * @return {?}
         */
        () => {
            if (ngComponentDef === null) {
                /** @type {?} */
                const compiler = getCompilerFacade();
                if (componentNeedsResolution(metadata)) {
                    /** @type {?} */
                    const error = [`Component '${type.name}' is not resolved:`];
                    if (metadata.templateUrl) {
                        error.push(` - templateUrl: ${metadata.templateUrl}`);
                    }
                    if (metadata.styleUrls && metadata.styleUrls.length) {
                        error.push(` - styleUrls: ${JSON.stringify(metadata.styleUrls)}`);
                    }
                    error.push(`Did you run and wait for 'resolveComponentResources()'?`);
                    throw new Error(error.join('\n'));
                }
                /** @type {?} */
                const templateUrl = metadata.templateUrl || `ng:///${type.name}/template.html`;
                /** @type {?} */
                const meta = Object.assign(Object.assign({}, directiveMetadata(type, metadata)), { typeSourceSpan: compiler.createParseSourceSpan('Component', type.name, templateUrl), template: metadata.template || '', preserveWhitespaces: metadata.preserveWhitespaces || false, styles: metadata.styles || EMPTY_ARRAY, animations: metadata.animations, directives: [], changeDetection: metadata.changeDetection, reactiveProperties: metadata.reactiveProperties, pipes: new Map(), encapsulation: metadata.encapsulation || ViewEncapsulation.Emulated, interpolation: metadata.interpolation, viewProviders: metadata.viewProviders || null });
                if (meta.usesInheritance) {
                    addDirectiveDefToUndecoratedParents(type);
                }
                ngComponentDef = compiler.compileComponent(angularCoreEnv, templateUrl, meta);
                // When NgModule decorator executed, we enqueued the module definition such that
                // it would only dequeue and add itself as module scope to all of its declarations,
                // but only if  if all of its declarations had resolved. This call runs the check
                // to see if any modules that are in the queue can be dequeued and add scope to
                // their declarations.
                flushModuleScopingQueueAsMuchAsPossible();
                // If component compilation is async, then the @NgModule annotation which declares the
                // component may execute and set an ngSelectorScope property on the component type. This
                // allows the component to patch itself with directiveDefs from the module after it
                // finishes compiling.
                if (hasSelectorScope(type)) {
                    /** @type {?} */
                    const scopes = transitiveScopesFor(type.ngSelectorScope);
                    patchComponentDefWithScope(ngComponentDef, scopes);
                }
            }
            return ngComponentDef;
        }),
        // Make the property configurable in dev mode to allow overriding in tests
        configurable: !!ngDevMode,
    });
}
/**
 * @template T
 * @param {?} component
 * @return {?}
 */
function hasSelectorScope(component) {
    return ((/** @type {?} */ (component))).ngSelectorScope !== undefined;
}
/**
 * Compile an Angular directive according to its decorator metadata, and patch the resulting
 * directive def onto the component type.
 *
 * In the event that compilation is not immediate, `compileDirective` will return a `Promise` which
 * will resolve when compilation completes and the directive becomes usable.
 * @param {?} type
 * @param {?} directive
 * @return {?}
 */
export function compileDirective(type, directive) {
    /** @type {?} */
    let ngDirectiveDef = null;
    addDirectiveFactoryDef(type, directive || {});
    Object.defineProperty(type, NG_DIR_DEF, {
        get: (/**
         * @return {?}
         */
        () => {
            if (ngDirectiveDef === null) {
                // `directive` can be null in the case of abstract directives as a base class
                // that use `@Directive()` with no selector. In that case, pass empty object to the
                // `directiveMetadata` function instead of null.
                /** @type {?} */
                const meta = getDirectiveMetadata(type, directive || {});
                ngDirectiveDef =
                    getCompilerFacade().compileDirective(angularCoreEnv, meta.sourceMapUrl, meta.metadata);
            }
            return ngDirectiveDef;
        }),
        // Make the property configurable in dev mode to allow overriding in tests
        configurable: !!ngDevMode,
    });
}
/**
 * @param {?} type
 * @param {?} metadata
 * @return {?}
 */
function getDirectiveMetadata(type, metadata) {
    /** @type {?} */
    const name = type && type.name;
    /** @type {?} */
    const sourceMapUrl = `ng:///${name}/ɵdir.js`;
    /** @type {?} */
    const compiler = getCompilerFacade();
    /** @type {?} */
    const facade = directiveMetadata((/** @type {?} */ (type)), metadata);
    facade.typeSourceSpan = compiler.createParseSourceSpan('Directive', name, sourceMapUrl);
    if (facade.usesInheritance) {
        addDirectiveDefToUndecoratedParents(type);
    }
    return { metadata: facade, sourceMapUrl };
}
/**
 * @param {?} type
 * @param {?} metadata
 * @return {?}
 */
function addDirectiveFactoryDef(type, metadata) {
    /** @type {?} */
    let ngFactoryDef = null;
    Object.defineProperty(type, NG_FACTORY_DEF, {
        get: (/**
         * @return {?}
         */
        () => {
            if (ngFactoryDef === null) {
                /** @type {?} */
                const meta = getDirectiveMetadata(type, metadata);
                /** @type {?} */
                const compiler = getCompilerFacade();
                ngFactoryDef = compiler.compileFactory(angularCoreEnv, `ng:///${type.name}/ɵfac.js`, Object.assign(Object.assign({}, meta.metadata), { injectFn: 'directiveInject', target: compiler.R3FactoryTarget.Directive }));
            }
            return ngFactoryDef;
        }),
        // Make the property configurable in dev mode to allow overriding in tests
        configurable: !!ngDevMode,
    });
}
/**
 * @param {?} type
 * @return {?}
 */
export function extendsDirectlyFromObject(type) {
    return Object.getPrototypeOf(type.prototype) === Object.prototype;
}
/**
 * Extract the `R3DirectiveMetadata` for a particular directive (either a `Directive` or a
 * `Component`).
 * @param {?} type
 * @param {?} metadata
 * @return {?}
 */
export function directiveMetadata(type, metadata) {
    // Reflect inputs and outputs.
    /** @type {?} */
    const reflect = getReflect();
    /** @type {?} */
    const propMetadata = reflect.ownPropMetadata(type);
    return {
        name: type.name,
        type: type,
        typeArgumentCount: 0,
        selector: metadata.selector !== undefined ? metadata.selector : null,
        deps: reflectDependencies(type),
        host: metadata.host || EMPTY_OBJ,
        propMetadata: propMetadata,
        inputs: metadata.inputs || EMPTY_ARRAY,
        outputs: metadata.outputs || EMPTY_ARRAY,
        queries: extractQueriesMetadata(type, propMetadata, isContentQuery),
        lifecycle: { usesOnChanges: reflect.hasLifecycleHook(type, 'ngOnChanges') },
        typeSourceSpan: (/** @type {?} */ (null)),
        usesInheritance: !extendsDirectlyFromObject(type),
        exportAs: extractExportAs(metadata.exportAs),
        providers: metadata.providers || null,
        viewQueries: extractQueriesMetadata(type, propMetadata, isViewQuery)
    };
}
/**
 * Adds a directive definition to all parent classes of a type that don't have an Angular decorator.
 * @param {?} type
 * @return {?}
 */
function addDirectiveDefToUndecoratedParents(type) {
    /** @type {?} */
    const objPrototype = Object.prototype;
    /** @type {?} */
    let parent = Object.getPrototypeOf(type.prototype).constructor;
    // Go up the prototype until we hit `Object`.
    while (parent && parent !== objPrototype) {
        // Since inheritance works if the class was annotated already, we only need to add
        // the def if there are no annotations and the def hasn't been created already.
        if (!getDirectiveDef(parent) && !getComponentDef(parent) &&
            shouldAddAbstractDirective(parent)) {
            compileDirective(parent, null);
        }
        parent = Object.getPrototypeOf(parent);
    }
}
/**
 * @param {?} selector
 * @return {?}
 */
function convertToR3QueryPredicate(selector) {
    return typeof selector === 'string' ? splitByComma(selector) : resolveForwardRef(selector);
}
/**
 * @param {?} propertyName
 * @param {?} ann
 * @return {?}
 */
export function convertToR3QueryMetadata(propertyName, ann) {
    return {
        propertyName: propertyName,
        predicate: convertToR3QueryPredicate(ann.selector),
        descendants: ann.descendants,
        first: ann.first,
        read: ann.read ? ann.read : null,
        static: !!ann.static
    };
}
/**
 * @param {?} type
 * @param {?} propMetadata
 * @param {?} isQueryAnn
 * @return {?}
 */
function extractQueriesMetadata(type, propMetadata, isQueryAnn) {
    /** @type {?} */
    const queriesMeta = [];
    for (const field in propMetadata) {
        if (propMetadata.hasOwnProperty(field)) {
            /** @type {?} */
            const annotations = propMetadata[field];
            annotations.forEach((/**
             * @param {?} ann
             * @return {?}
             */
            ann => {
                if (isQueryAnn(ann)) {
                    if (!ann.selector) {
                        throw new Error(`Can't construct a query for the property "${field}" of ` +
                            `"${stringifyForError(type)}" since the query selector wasn't defined.`);
                    }
                    if (annotations.some(isInputAnnotation)) {
                        throw new Error(`Cannot combine @Input decorators with query decorators`);
                    }
                    queriesMeta.push(convertToR3QueryMetadata(field, ann));
                }
            }));
        }
    }
    return queriesMeta;
}
/**
 * @param {?} exportAs
 * @return {?}
 */
function extractExportAs(exportAs) {
    return exportAs === undefined ? null : splitByComma(exportAs);
}
/**
 * @param {?} value
 * @return {?}
 */
function isContentQuery(value) {
    /** @type {?} */
    const name = value.ngMetadataName;
    return name === 'ContentChild' || name === 'ContentChildren';
}
/**
 * @param {?} value
 * @return {?}
 */
function isViewQuery(value) {
    /** @type {?} */
    const name = value.ngMetadataName;
    return name === 'ViewChild' || name === 'ViewChildren';
}
/**
 * @param {?} value
 * @return {?}
 */
function isInputAnnotation(value) {
    return value.ngMetadataName === 'Input';
}
/**
 * @param {?} value
 * @return {?}
 */
function splitByComma(value) {
    return value.split(',').map((/**
     * @param {?} piece
     * @return {?}
     */
    piece => piece.trim()));
}
/** @type {?} */
const LIFECYCLE_HOOKS = [
    'ngOnChanges', 'ngOnInit', 'ngOnDestroy', 'ngDoCheck', 'ngAfterViewInit', 'ngAfterViewChecked',
    'ngAfterContentInit', 'ngAfterContentChecked'
];
/**
 * @param {?} type
 * @return {?}
 */
function shouldAddAbstractDirective(type) {
    /** @type {?} */
    const reflect = getReflect();
    if (LIFECYCLE_HOOKS.some((/**
     * @param {?} hookName
     * @return {?}
     */
    hookName => reflect.hasLifecycleHook(type, hookName)))) {
        return true;
    }
    /** @type {?} */
    const propMetadata = reflect.propMetadata(type);
    for (const field in propMetadata) {
        /** @type {?} */
        const annotations = propMetadata[field];
        for (let i = 0; i < annotations.length; i++) {
            /** @type {?} */
            const current = annotations[i];
            /** @type {?} */
            const metadataName = current.ngMetadataName;
            if (isInputAnnotation(current) || isContentQuery(current) || isViewQuery(current) ||
                metadataName === 'Output' || metadataName === 'HostBinding' ||
                metadataName === 'HostListener') {
                return true;
            }
        }
    }
    return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9qaXQvZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBNEIsaUJBQWlCLEVBQUMsTUFBTSxnQ0FBZ0MsQ0FBQztBQUU1RixPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUN2RCxPQUFPLEVBQUMsVUFBVSxFQUFFLG1CQUFtQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFJbEUsT0FBTyxFQUFDLHdCQUF3QixFQUFFLHdDQUF3QyxFQUFDLE1BQU0saUNBQWlDLENBQUM7QUFDbkgsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDdEQsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3JELE9BQU8sRUFBQyxlQUFlLEVBQUUsZUFBZSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQy9ELE9BQU8sRUFBQyxXQUFXLEVBQUUsU0FBUyxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ2hELE9BQU8sRUFBQyxXQUFXLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUVsRSxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUVyRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzdDLE9BQU8sRUFBQyx1Q0FBdUMsRUFBRSwwQkFBMEIsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLFVBQVUsQ0FBQzs7Ozs7Ozs7Ozs7OztBQWFsSCxNQUFNLFVBQVUsZ0JBQWdCLENBQUMsSUFBZSxFQUFFLFFBQW1CO0lBQ25FLDhFQUE4RTtJQUM5RSwwREFBMEQ7SUFDMUQsQ0FBQyxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxDQUFD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QUFDLE9BQU8sQ0FBQyxJQUFJLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDO2dCQUM3RSxZQUFZLEtBQUssUUFBUSxJQUFJLFlBQVksS0FBSyxhQUFhO2dCQUMzRCxZQUFZLEtBQUssY0FBYyxFQUFFO2dCQUNuQyxPQUFPLElBQUksQ0FBQzthQUNiO1NBQ0Y7S0FDRjtJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtSM0RpcmVjdGl2ZU1ldGFkYXRhRmFjYWRlLCBnZXRDb21waWxlckZhY2FkZX0gZnJvbSAnLi4vLi4vY29tcGlsZXIvY29tcGlsZXJfZmFjYWRlJztcbmltcG9ydCB7UjNDb21wb25lbnRNZXRhZGF0YUZhY2FkZSwgUjNRdWVyeU1ldGFkYXRhRmFjYWRlfSBmcm9tICcuLi8uLi9jb21waWxlci9jb21waWxlcl9mYWNhZGVfaW50ZXJmYWNlJztcbmltcG9ydCB7cmVzb2x2ZUZvcndhcmRSZWZ9IGZyb20gJy4uLy4uL2RpL2ZvcndhcmRfcmVmJztcbmltcG9ydCB7Z2V0UmVmbGVjdCwgcmVmbGVjdERlcGVuZGVuY2llc30gZnJvbSAnLi4vLi4vZGkvaml0L3V0aWwnO1xuaW1wb3J0IHtUeXBlfSBmcm9tICcuLi8uLi9pbnRlcmZhY2UvdHlwZSc7XG5pbXBvcnQge1F1ZXJ5fSBmcm9tICcuLi8uLi9tZXRhZGF0YS9kaSc7XG5pbXBvcnQge0NvbXBvbmVudCwgRGlyZWN0aXZlLCBJbnB1dH0gZnJvbSAnLi4vLi4vbWV0YWRhdGEvZGlyZWN0aXZlcyc7XG5pbXBvcnQge2NvbXBvbmVudE5lZWRzUmVzb2x1dGlvbiwgbWF5YmVRdWV1ZVJlc29sdXRpb25PZkNvbXBvbmVudFJlc291cmNlc30gZnJvbSAnLi4vLi4vbWV0YWRhdGEvcmVzb3VyY2VfbG9hZGluZyc7XG5pbXBvcnQge1ZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICcuLi8uLi9tZXRhZGF0YS92aWV3JztcbmltcG9ydCB7aW5pdE5nRGV2TW9kZX0gZnJvbSAnLi4vLi4vdXRpbC9uZ19kZXZfbW9kZSc7XG5pbXBvcnQge2dldENvbXBvbmVudERlZiwgZ2V0RGlyZWN0aXZlRGVmfSBmcm9tICcuLi9kZWZpbml0aW9uJztcbmltcG9ydCB7RU1QVFlfQVJSQVksIEVNUFRZX09CSn0gZnJvbSAnLi4vZW1wdHknO1xuaW1wb3J0IHtOR19DT01QX0RFRiwgTkdfRElSX0RFRiwgTkdfRkFDVE9SWV9ERUZ9IGZyb20gJy4uL2ZpZWxkcyc7XG5pbXBvcnQge0NvbXBvbmVudFR5cGV9IGZyb20gJy4uL2ludGVyZmFjZXMvZGVmaW5pdGlvbic7XG5pbXBvcnQge3N0cmluZ2lmeUZvckVycm9yfSBmcm9tICcuLi91dGlsL21pc2NfdXRpbHMnO1xuXG5pbXBvcnQge2FuZ3VsYXJDb3JlRW52fSBmcm9tICcuL2Vudmlyb25tZW50JztcbmltcG9ydCB7Zmx1c2hNb2R1bGVTY29waW5nUXVldWVBc011Y2hBc1Bvc3NpYmxlLCBwYXRjaENvbXBvbmVudERlZldpdGhTY29wZSwgdHJhbnNpdGl2ZVNjb3Blc0Zvcn0gZnJvbSAnLi9tb2R1bGUnO1xuXG5cblxuLyoqXG4gKiBDb21waWxlIGFuIEFuZ3VsYXIgY29tcG9uZW50IGFjY29yZGluZyB0byBpdHMgZGVjb3JhdG9yIG1ldGFkYXRhLCBhbmQgcGF0Y2ggdGhlIHJlc3VsdGluZ1xuICogY29tcG9uZW50IGRlZiAoybVjbXApIG9udG8gdGhlIGNvbXBvbmVudCB0eXBlLlxuICpcbiAqIENvbXBpbGF0aW9uIG1heSBiZSBhc3luY2hyb25vdXMgKGR1ZSB0byB0aGUgbmVlZCB0byByZXNvbHZlIFVSTHMgZm9yIHRoZSBjb21wb25lbnQgdGVtcGxhdGUgb3JcbiAqIG90aGVyIHJlc291cmNlcywgZm9yIGV4YW1wbGUpLiBJbiB0aGUgZXZlbnQgdGhhdCBjb21waWxhdGlvbiBpcyBub3QgaW1tZWRpYXRlLCBgY29tcGlsZUNvbXBvbmVudGBcbiAqIHdpbGwgZW5xdWV1ZSByZXNvdXJjZSByZXNvbHV0aW9uIGludG8gYSBnbG9iYWwgcXVldWUgYW5kIHdpbGwgZmFpbCB0byByZXR1cm4gdGhlIGDJtWNtcGBcbiAqIHVudGlsIHRoZSBnbG9iYWwgcXVldWUgaGFzIGJlZW4gcmVzb2x2ZWQgd2l0aCBhIGNhbGwgdG8gYHJlc29sdmVDb21wb25lbnRSZXNvdXJjZXNgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZUNvbXBvbmVudCh0eXBlOiBUeXBlPGFueT4sIG1ldGFkYXRhOiBDb21wb25lbnQpOiB2b2lkIHtcbiAgLy8gSW5pdGlhbGl6ZSBuZ0Rldk1vZGUuIFRoaXMgbXVzdCBiZSB0aGUgZmlyc3Qgc3RhdGVtZW50IGluIGNvbXBpbGVDb21wb25lbnQuXG4gIC8vIFNlZSB0aGUgYGluaXROZ0Rldk1vZGVgIGRvY3N0cmluZyBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkgJiYgaW5pdE5nRGV2TW9kZSgpO1xuXG4gIGxldCBuZ0NvbXBvbmVudERlZjogYW55ID0gbnVsbDtcblxuICAvLyBNZXRhZGF0YSBtYXkgaGF2ZSByZXNvdXJjZXMgd2hpY2ggbmVlZCB0byBiZSByZXNvbHZlZC5cbiAgbWF5YmVRdWV1ZVJlc29sdXRpb25PZkNvbXBvbmVudFJlc291cmNlcyh0eXBlLCBtZXRhZGF0YSk7XG5cbiAgLy8gTm90ZSB0aGF0IHdlJ3JlIHVzaW5nIHRoZSBzYW1lIGZ1bmN0aW9uIGFzIGBEaXJlY3RpdmVgLCBiZWNhdXNlIHRoYXQncyBvbmx5IHN1YnNldCBvZiBtZXRhZGF0YVxuICAvLyB0aGF0IHdlIG5lZWQgdG8gY3JlYXRlIHRoZSBuZ0ZhY3RvcnlEZWYuIFdlJ3JlIGF2b2lkaW5nIHVzaW5nIHRoZSBjb21wb25lbnQgbWV0YWRhdGFcbiAgLy8gYmVjYXVzZSB3ZSdkIGhhdmUgdG8gcmVzb2x2ZSB0aGUgYXN5bmNocm9ub3VzIHRlbXBsYXRlcy5cbiAgYWRkRGlyZWN0aXZlRmFjdG9yeURlZih0eXBlLCBtZXRhZGF0YSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHR5cGUsIE5HX0NPTVBfREVGLCB7XG4gICAgZ2V0OiAoKSA9PiB7XG4gICAgICBpZiAobmdDb21wb25lbnREZWYgPT09IG51bGwpIHtcbiAgICAgICAgY29uc3QgY29tcGlsZXIgPSBnZXRDb21waWxlckZhY2FkZSgpO1xuXG4gICAgICAgIGlmIChjb21wb25lbnROZWVkc1Jlc29sdXRpb24obWV0YWRhdGEpKSB7XG4gICAgICAgICAgY29uc3QgZXJyb3IgPSBbYENvbXBvbmVudCAnJHt0eXBlLm5hbWV9JyBpcyBub3QgcmVzb2x2ZWQ6YF07XG4gICAgICAgICAgaWYgKG1ldGFkYXRhLnRlbXBsYXRlVXJsKSB7XG4gICAgICAgICAgICBlcnJvci5wdXNoKGAgLSB0ZW1wbGF0ZVVybDogJHttZXRhZGF0YS50ZW1wbGF0ZVVybH1gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG1ldGFkYXRhLnN0eWxlVXJscyAmJiBtZXRhZGF0YS5zdHlsZVVybHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBlcnJvci5wdXNoKGAgLSBzdHlsZVVybHM6ICR7SlNPTi5zdHJpbmdpZnkobWV0YWRhdGEuc3R5bGVVcmxzKX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXJyb3IucHVzaChgRGlkIHlvdSBydW4gYW5kIHdhaXQgZm9yICdyZXNvbHZlQ29tcG9uZW50UmVzb3VyY2VzKCknP2ApO1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvci5qb2luKCdcXG4nKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0ZW1wbGF0ZVVybCA9IG1ldGFkYXRhLnRlbXBsYXRlVXJsIHx8IGBuZzovLy8ke3R5cGUubmFtZX0vdGVtcGxhdGUuaHRtbGA7XG4gICAgICAgIGNvbnN0IG1ldGE6IFIzQ29tcG9uZW50TWV0YWRhdGFGYWNhZGUgPSB7XG4gICAgICAgICAgLi4uZGlyZWN0aXZlTWV0YWRhdGEodHlwZSwgbWV0YWRhdGEpLFxuICAgICAgICAgIHR5cGVTb3VyY2VTcGFuOiBjb21waWxlci5jcmVhdGVQYXJzZVNvdXJjZVNwYW4oJ0NvbXBvbmVudCcsIHR5cGUubmFtZSwgdGVtcGxhdGVVcmwpLFxuICAgICAgICAgIHRlbXBsYXRlOiBtZXRhZGF0YS50ZW1wbGF0ZSB8fCAnJyxcbiAgICAgICAgICBwcmVzZXJ2ZVdoaXRlc3BhY2VzOiBtZXRhZGF0YS5wcmVzZXJ2ZVdoaXRlc3BhY2VzIHx8IGZhbHNlLFxuICAgICAgICAgIHN0eWxlczogbWV0YWRhdGEuc3R5bGVzIHx8IEVNUFRZX0FSUkFZLFxuICAgICAgICAgIGFuaW1hdGlvbnM6IG1ldGFkYXRhLmFuaW1hdGlvbnMsXG4gICAgICAgICAgZGlyZWN0aXZlczogW10sXG4gICAgICAgICAgY2hhbmdlRGV0ZWN0aW9uOiBtZXRhZGF0YS5jaGFuZ2VEZXRlY3Rpb24sXG4gICAgICAgICAgcmVhY3RpdmVQcm9wZXJ0aWVzOiBtZXRhZGF0YS5yZWFjdGl2ZVByb3BlcnRpZXMsXG4gICAgICAgICAgcGlwZXM6IG5ldyBNYXAoKSxcbiAgICAgICAgICBlbmNhcHN1bGF0aW9uOiBtZXRhZGF0YS5lbmNhcHN1bGF0aW9uIHx8IFZpZXdFbmNhcHN1bGF0aW9uLkVtdWxhdGVkLFxuICAgICAgICAgIGludGVycG9sYXRpb246IG1ldGFkYXRhLmludGVycG9sYXRpb24sXG4gICAgICAgICAgdmlld1Byb3ZpZGVyczogbWV0YWRhdGEudmlld1Byb3ZpZGVycyB8fCBudWxsLFxuICAgICAgICB9O1xuICAgICAgICBpZiAobWV0YS51c2VzSW5oZXJpdGFuY2UpIHtcbiAgICAgICAgICBhZGREaXJlY3RpdmVEZWZUb1VuZGVjb3JhdGVkUGFyZW50cyh0eXBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5nQ29tcG9uZW50RGVmID0gY29tcGlsZXIuY29tcGlsZUNvbXBvbmVudChhbmd1bGFyQ29yZUVudiwgdGVtcGxhdGVVcmwsIG1ldGEpO1xuXG4gICAgICAgIC8vIFdoZW4gTmdNb2R1bGUgZGVjb3JhdG9yIGV4ZWN1dGVkLCB3ZSBlbnF1ZXVlZCB0aGUgbW9kdWxlIGRlZmluaXRpb24gc3VjaCB0aGF0XG4gICAgICAgIC8vIGl0IHdvdWxkIG9ubHkgZGVxdWV1ZSBhbmQgYWRkIGl0c2VsZiBhcyBtb2R1bGUgc2NvcGUgdG8gYWxsIG9mIGl0cyBkZWNsYXJhdGlvbnMsXG4gICAgICAgIC8vIGJ1dCBvbmx5IGlmICBpZiBhbGwgb2YgaXRzIGRlY2xhcmF0aW9ucyBoYWQgcmVzb2x2ZWQuIFRoaXMgY2FsbCBydW5zIHRoZSBjaGVja1xuICAgICAgICAvLyB0byBzZWUgaWYgYW55IG1vZHVsZXMgdGhhdCBhcmUgaW4gdGhlIHF1ZXVlIGNhbiBiZSBkZXF1ZXVlZCBhbmQgYWRkIHNjb3BlIHRvXG4gICAgICAgIC8vIHRoZWlyIGRlY2xhcmF0aW9ucy5cbiAgICAgICAgZmx1c2hNb2R1bGVTY29waW5nUXVldWVBc011Y2hBc1Bvc3NpYmxlKCk7XG5cbiAgICAgICAgLy8gSWYgY29tcG9uZW50IGNvbXBpbGF0aW9uIGlzIGFzeW5jLCB0aGVuIHRoZSBATmdNb2R1bGUgYW5ub3RhdGlvbiB3aGljaCBkZWNsYXJlcyB0aGVcbiAgICAgICAgLy8gY29tcG9uZW50IG1heSBleGVjdXRlIGFuZCBzZXQgYW4gbmdTZWxlY3RvclNjb3BlIHByb3BlcnR5IG9uIHRoZSBjb21wb25lbnQgdHlwZS4gVGhpc1xuICAgICAgICAvLyBhbGxvd3MgdGhlIGNvbXBvbmVudCB0byBwYXRjaCBpdHNlbGYgd2l0aCBkaXJlY3RpdmVEZWZzIGZyb20gdGhlIG1vZHVsZSBhZnRlciBpdFxuICAgICAgICAvLyBmaW5pc2hlcyBjb21waWxpbmcuXG4gICAgICAgIGlmIChoYXNTZWxlY3RvclNjb3BlKHR5cGUpKSB7XG4gICAgICAgICAgY29uc3Qgc2NvcGVzID0gdHJhbnNpdGl2ZVNjb3Blc0Zvcih0eXBlLm5nU2VsZWN0b3JTY29wZSk7XG4gICAgICAgICAgcGF0Y2hDb21wb25lbnREZWZXaXRoU2NvcGUobmdDb21wb25lbnREZWYsIHNjb3Blcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBuZ0NvbXBvbmVudERlZjtcbiAgICB9LFxuICAgIC8vIE1ha2UgdGhlIHByb3BlcnR5IGNvbmZpZ3VyYWJsZSBpbiBkZXYgbW9kZSB0byBhbGxvdyBvdmVycmlkaW5nIGluIHRlc3RzXG4gICAgY29uZmlndXJhYmxlOiAhIW5nRGV2TW9kZSxcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGhhc1NlbGVjdG9yU2NvcGU8VD4oY29tcG9uZW50OiBUeXBlPFQ+KTogY29tcG9uZW50IGlzIFR5cGU8VD4mXG4gICAge25nU2VsZWN0b3JTY29wZTogVHlwZTxhbnk+fSB7XG4gIHJldHVybiAoY29tcG9uZW50IGFze25nU2VsZWN0b3JTY29wZT86IGFueX0pLm5nU2VsZWN0b3JTY29wZSAhPT0gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIENvbXBpbGUgYW4gQW5ndWxhciBkaXJlY3RpdmUgYWNjb3JkaW5nIHRvIGl0cyBkZWNvcmF0b3IgbWV0YWRhdGEsIGFuZCBwYXRjaCB0aGUgcmVzdWx0aW5nXG4gKiBkaXJlY3RpdmUgZGVmIG9udG8gdGhlIGNvbXBvbmVudCB0eXBlLlxuICpcbiAqIEluIHRoZSBldmVudCB0aGF0IGNvbXBpbGF0aW9uIGlzIG5vdCBpbW1lZGlhdGUsIGBjb21waWxlRGlyZWN0aXZlYCB3aWxsIHJldHVybiBhIGBQcm9taXNlYCB3aGljaFxuICogd2lsbCByZXNvbHZlIHdoZW4gY29tcGlsYXRpb24gY29tcGxldGVzIGFuZCB0aGUgZGlyZWN0aXZlIGJlY29tZXMgdXNhYmxlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZURpcmVjdGl2ZSh0eXBlOiBUeXBlPGFueT4sIGRpcmVjdGl2ZTogRGlyZWN0aXZlIHwgbnVsbCk6IHZvaWQge1xuICBsZXQgbmdEaXJlY3RpdmVEZWY6IGFueSA9IG51bGw7XG5cbiAgYWRkRGlyZWN0aXZlRmFjdG9yeURlZih0eXBlLCBkaXJlY3RpdmUgfHwge30pO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0eXBlLCBOR19ESVJfREVGLCB7XG4gICAgZ2V0OiAoKSA9PiB7XG4gICAgICBpZiAobmdEaXJlY3RpdmVEZWYgPT09IG51bGwpIHtcbiAgICAgICAgLy8gYGRpcmVjdGl2ZWAgY2FuIGJlIG51bGwgaW4gdGhlIGNhc2Ugb2YgYWJzdHJhY3QgZGlyZWN0aXZlcyBhcyBhIGJhc2UgY2xhc3NcbiAgICAgICAgLy8gdGhhdCB1c2UgYEBEaXJlY3RpdmUoKWAgd2l0aCBubyBzZWxlY3Rvci4gSW4gdGhhdCBjYXNlLCBwYXNzIGVtcHR5IG9iamVjdCB0byB0aGVcbiAgICAgICAgLy8gYGRpcmVjdGl2ZU1ldGFkYXRhYCBmdW5jdGlvbiBpbnN0ZWFkIG9mIG51bGwuXG4gICAgICAgIGNvbnN0IG1ldGEgPSBnZXREaXJlY3RpdmVNZXRhZGF0YSh0eXBlLCBkaXJlY3RpdmUgfHwge30pO1xuICAgICAgICBuZ0RpcmVjdGl2ZURlZiA9XG4gICAgICAgICAgICBnZXRDb21waWxlckZhY2FkZSgpLmNvbXBpbGVEaXJlY3RpdmUoYW5ndWxhckNvcmVFbnYsIG1ldGEuc291cmNlTWFwVXJsLCBtZXRhLm1ldGFkYXRhKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZ0RpcmVjdGl2ZURlZjtcbiAgICB9LFxuICAgIC8vIE1ha2UgdGhlIHByb3BlcnR5IGNvbmZpZ3VyYWJsZSBpbiBkZXYgbW9kZSB0byBhbGxvdyBvdmVycmlkaW5nIGluIHRlc3RzXG4gICAgY29uZmlndXJhYmxlOiAhIW5nRGV2TW9kZSxcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldERpcmVjdGl2ZU1ldGFkYXRhKHR5cGU6IFR5cGU8YW55PiwgbWV0YWRhdGE6IERpcmVjdGl2ZSkge1xuICBjb25zdCBuYW1lID0gdHlwZSAmJiB0eXBlLm5hbWU7XG4gIGNvbnN0IHNvdXJjZU1hcFVybCA9IGBuZzovLy8ke25hbWV9L8m1ZGlyLmpzYDtcbiAgY29uc3QgY29tcGlsZXIgPSBnZXRDb21waWxlckZhY2FkZSgpO1xuICBjb25zdCBmYWNhZGUgPSBkaXJlY3RpdmVNZXRhZGF0YSh0eXBlIGFzIENvbXBvbmVudFR5cGU8YW55PiwgbWV0YWRhdGEpO1xuICBmYWNhZGUudHlwZVNvdXJjZVNwYW4gPSBjb21waWxlci5jcmVhdGVQYXJzZVNvdXJjZVNwYW4oJ0RpcmVjdGl2ZScsIG5hbWUsIHNvdXJjZU1hcFVybCk7XG4gIGlmIChmYWNhZGUudXNlc0luaGVyaXRhbmNlKSB7XG4gICAgYWRkRGlyZWN0aXZlRGVmVG9VbmRlY29yYXRlZFBhcmVudHModHlwZSk7XG4gIH1cbiAgcmV0dXJuIHttZXRhZGF0YTogZmFjYWRlLCBzb3VyY2VNYXBVcmx9O1xufVxuXG5mdW5jdGlvbiBhZGREaXJlY3RpdmVGYWN0b3J5RGVmKHR5cGU6IFR5cGU8YW55PiwgbWV0YWRhdGE6IERpcmVjdGl2ZSB8IENvbXBvbmVudCkge1xuICBsZXQgbmdGYWN0b3J5RGVmOiBhbnkgPSBudWxsO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0eXBlLCBOR19GQUNUT1JZX0RFRiwge1xuICAgIGdldDogKCkgPT4ge1xuICAgICAgaWYgKG5nRmFjdG9yeURlZiA9PT0gbnVsbCkge1xuICAgICAgICBjb25zdCBtZXRhID0gZ2V0RGlyZWN0aXZlTWV0YWRhdGEodHlwZSwgbWV0YWRhdGEpO1xuICAgICAgICBjb25zdCBjb21waWxlciA9IGdldENvbXBpbGVyRmFjYWRlKCk7XG4gICAgICAgIG5nRmFjdG9yeURlZiA9IGNvbXBpbGVyLmNvbXBpbGVGYWN0b3J5KGFuZ3VsYXJDb3JlRW52LCBgbmc6Ly8vJHt0eXBlLm5hbWV9L8m1ZmFjLmpzYCwge1xuICAgICAgICAgIC4uLm1ldGEubWV0YWRhdGEsXG4gICAgICAgICAgaW5qZWN0Rm46ICdkaXJlY3RpdmVJbmplY3QnLFxuICAgICAgICAgIHRhcmdldDogY29tcGlsZXIuUjNGYWN0b3J5VGFyZ2V0LkRpcmVjdGl2ZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZ0ZhY3RvcnlEZWY7XG4gICAgfSxcbiAgICAvLyBNYWtlIHRoZSBwcm9wZXJ0eSBjb25maWd1cmFibGUgaW4gZGV2IG1vZGUgdG8gYWxsb3cgb3ZlcnJpZGluZyBpbiB0ZXN0c1xuICAgIGNvbmZpZ3VyYWJsZTogISFuZ0Rldk1vZGUsXG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kc0RpcmVjdGx5RnJvbU9iamVjdCh0eXBlOiBUeXBlPGFueT4pOiBib29sZWFuIHtcbiAgcmV0dXJuIE9iamVjdC5nZXRQcm90b3R5cGVPZih0eXBlLnByb3RvdHlwZSkgPT09IE9iamVjdC5wcm90b3R5cGU7XG59XG5cbi8qKlxuICogRXh0cmFjdCB0aGUgYFIzRGlyZWN0aXZlTWV0YWRhdGFgIGZvciBhIHBhcnRpY3VsYXIgZGlyZWN0aXZlIChlaXRoZXIgYSBgRGlyZWN0aXZlYCBvciBhXG4gKiBgQ29tcG9uZW50YCkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXJlY3RpdmVNZXRhZGF0YSh0eXBlOiBUeXBlPGFueT4sIG1ldGFkYXRhOiBEaXJlY3RpdmUpOiBSM0RpcmVjdGl2ZU1ldGFkYXRhRmFjYWRlIHtcbiAgLy8gUmVmbGVjdCBpbnB1dHMgYW5kIG91dHB1dHMuXG4gIGNvbnN0IHJlZmxlY3QgPSBnZXRSZWZsZWN0KCk7XG4gIGNvbnN0IHByb3BNZXRhZGF0YSA9IHJlZmxlY3Qub3duUHJvcE1ldGFkYXRhKHR5cGUpO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogdHlwZS5uYW1lLFxuICAgIHR5cGU6IHR5cGUsXG4gICAgdHlwZUFyZ3VtZW50Q291bnQ6IDAsXG4gICAgc2VsZWN0b3I6IG1ldGFkYXRhLnNlbGVjdG9yICE9PSB1bmRlZmluZWQgPyBtZXRhZGF0YS5zZWxlY3RvciA6IG51bGwsXG4gICAgZGVwczogcmVmbGVjdERlcGVuZGVuY2llcyh0eXBlKSxcbiAgICBob3N0OiBtZXRhZGF0YS5ob3N0IHx8IEVNUFRZX09CSixcbiAgICBwcm9wTWV0YWRhdGE6IHByb3BNZXRhZGF0YSxcbiAgICBpbnB1dHM6IG1ldGFkYXRhLmlucHV0cyB8fCBFTVBUWV9BUlJBWSxcbiAgICBvdXRwdXRzOiBtZXRhZGF0YS5vdXRwdXRzIHx8IEVNUFRZX0FSUkFZLFxuICAgIHF1ZXJpZXM6IGV4dHJhY3RRdWVyaWVzTWV0YWRhdGEodHlwZSwgcHJvcE1ldGFkYXRhLCBpc0NvbnRlbnRRdWVyeSksXG4gICAgbGlmZWN5Y2xlOiB7dXNlc09uQ2hhbmdlczogcmVmbGVjdC5oYXNMaWZlY3ljbGVIb29rKHR5cGUsICduZ09uQ2hhbmdlcycpfSxcbiAgICB0eXBlU291cmNlU3BhbjogbnVsbCAhLFxuICAgIHVzZXNJbmhlcml0YW5jZTogIWV4dGVuZHNEaXJlY3RseUZyb21PYmplY3QodHlwZSksXG4gICAgZXhwb3J0QXM6IGV4dHJhY3RFeHBvcnRBcyhtZXRhZGF0YS5leHBvcnRBcyksXG4gICAgcHJvdmlkZXJzOiBtZXRhZGF0YS5wcm92aWRlcnMgfHwgbnVsbCxcbiAgICB2aWV3UXVlcmllczogZXh0cmFjdFF1ZXJpZXNNZXRhZGF0YSh0eXBlLCBwcm9wTWV0YWRhdGEsIGlzVmlld1F1ZXJ5KVxuICB9O1xufVxuXG4vKipcbiAqIEFkZHMgYSBkaXJlY3RpdmUgZGVmaW5pdGlvbiB0byBhbGwgcGFyZW50IGNsYXNzZXMgb2YgYSB0eXBlIHRoYXQgZG9uJ3QgaGF2ZSBhbiBBbmd1bGFyIGRlY29yYXRvci5cbiAqL1xuZnVuY3Rpb24gYWRkRGlyZWN0aXZlRGVmVG9VbmRlY29yYXRlZFBhcmVudHModHlwZTogVHlwZTxhbnk+KSB7XG4gIGNvbnN0IG9ialByb3RvdHlwZSA9IE9iamVjdC5wcm90b3R5cGU7XG4gIGxldCBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodHlwZS5wcm90b3R5cGUpLmNvbnN0cnVjdG9yO1xuXG4gIC8vIEdvIHVwIHRoZSBwcm90b3R5cGUgdW50aWwgd2UgaGl0IGBPYmplY3RgLlxuICB3aGlsZSAocGFyZW50ICYmIHBhcmVudCAhPT0gb2JqUHJvdG90eXBlKSB7XG4gICAgLy8gU2luY2UgaW5oZXJpdGFuY2Ugd29ya3MgaWYgdGhlIGNsYXNzIHdhcyBhbm5vdGF0ZWQgYWxyZWFkeSwgd2Ugb25seSBuZWVkIHRvIGFkZFxuICAgIC8vIHRoZSBkZWYgaWYgdGhlcmUgYXJlIG5vIGFubm90YXRpb25zIGFuZCB0aGUgZGVmIGhhc24ndCBiZWVuIGNyZWF0ZWQgYWxyZWFkeS5cbiAgICBpZiAoIWdldERpcmVjdGl2ZURlZihwYXJlbnQpICYmICFnZXRDb21wb25lbnREZWYocGFyZW50KSAmJlxuICAgICAgICBzaG91bGRBZGRBYnN0cmFjdERpcmVjdGl2ZShwYXJlbnQpKSB7XG4gICAgICBjb21waWxlRGlyZWN0aXZlKHBhcmVudCwgbnVsbCk7XG4gICAgfVxuICAgIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihwYXJlbnQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRUb1IzUXVlcnlQcmVkaWNhdGUoc2VsZWN0b3I6IGFueSk6IGFueXxzdHJpbmdbXSB7XG4gIHJldHVybiB0eXBlb2Ygc2VsZWN0b3IgPT09ICdzdHJpbmcnID8gc3BsaXRCeUNvbW1hKHNlbGVjdG9yKSA6IHJlc29sdmVGb3J3YXJkUmVmKHNlbGVjdG9yKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRUb1IzUXVlcnlNZXRhZGF0YShwcm9wZXJ0eU5hbWU6IHN0cmluZywgYW5uOiBRdWVyeSk6IFIzUXVlcnlNZXRhZGF0YUZhY2FkZSB7XG4gIHJldHVybiB7XG4gICAgcHJvcGVydHlOYW1lOiBwcm9wZXJ0eU5hbWUsXG4gICAgcHJlZGljYXRlOiBjb252ZXJ0VG9SM1F1ZXJ5UHJlZGljYXRlKGFubi5zZWxlY3RvciksXG4gICAgZGVzY2VuZGFudHM6IGFubi5kZXNjZW5kYW50cyxcbiAgICBmaXJzdDogYW5uLmZpcnN0LFxuICAgIHJlYWQ6IGFubi5yZWFkID8gYW5uLnJlYWQgOiBudWxsLFxuICAgIHN0YXRpYzogISFhbm4uc3RhdGljXG4gIH07XG59XG5mdW5jdGlvbiBleHRyYWN0UXVlcmllc01ldGFkYXRhKFxuICAgIHR5cGU6IFR5cGU8YW55PiwgcHJvcE1ldGFkYXRhOiB7W2tleTogc3RyaW5nXTogYW55W119LFxuICAgIGlzUXVlcnlBbm46IChhbm46IGFueSkgPT4gYW5uIGlzIFF1ZXJ5KTogUjNRdWVyeU1ldGFkYXRhRmFjYWRlW10ge1xuICBjb25zdCBxdWVyaWVzTWV0YTogUjNRdWVyeU1ldGFkYXRhRmFjYWRlW10gPSBbXTtcbiAgZm9yIChjb25zdCBmaWVsZCBpbiBwcm9wTWV0YWRhdGEpIHtcbiAgICBpZiAocHJvcE1ldGFkYXRhLmhhc093blByb3BlcnR5KGZpZWxkKSkge1xuICAgICAgY29uc3QgYW5ub3RhdGlvbnMgPSBwcm9wTWV0YWRhdGFbZmllbGRdO1xuICAgICAgYW5ub3RhdGlvbnMuZm9yRWFjaChhbm4gPT4ge1xuICAgICAgICBpZiAoaXNRdWVyeUFubihhbm4pKSB7XG4gICAgICAgICAgaWYgKCFhbm4uc2VsZWN0b3IpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgQ2FuJ3QgY29uc3RydWN0IGEgcXVlcnkgZm9yIHRoZSBwcm9wZXJ0eSBcIiR7ZmllbGR9XCIgb2YgYCArXG4gICAgICAgICAgICAgICAgYFwiJHtzdHJpbmdpZnlGb3JFcnJvcih0eXBlKX1cIiBzaW5jZSB0aGUgcXVlcnkgc2VsZWN0b3Igd2Fzbid0IGRlZmluZWQuYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChhbm5vdGF0aW9ucy5zb21lKGlzSW5wdXRBbm5vdGF0aW9uKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgY29tYmluZSBASW5wdXQgZGVjb3JhdG9ycyB3aXRoIHF1ZXJ5IGRlY29yYXRvcnNgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcXVlcmllc01ldGEucHVzaChjb252ZXJ0VG9SM1F1ZXJ5TWV0YWRhdGEoZmllbGQsIGFubikpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHF1ZXJpZXNNZXRhO1xufVxuXG5mdW5jdGlvbiBleHRyYWN0RXhwb3J0QXMoZXhwb3J0QXM6IHN0cmluZyB8IHVuZGVmaW5lZCk6IHN0cmluZ1tdfG51bGwge1xuICByZXR1cm4gZXhwb3J0QXMgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBzcGxpdEJ5Q29tbWEoZXhwb3J0QXMpO1xufVxuXG5mdW5jdGlvbiBpc0NvbnRlbnRRdWVyeSh2YWx1ZTogYW55KTogdmFsdWUgaXMgUXVlcnkge1xuICBjb25zdCBuYW1lID0gdmFsdWUubmdNZXRhZGF0YU5hbWU7XG4gIHJldHVybiBuYW1lID09PSAnQ29udGVudENoaWxkJyB8fCBuYW1lID09PSAnQ29udGVudENoaWxkcmVuJztcbn1cblxuZnVuY3Rpb24gaXNWaWV3UXVlcnkodmFsdWU6IGFueSk6IHZhbHVlIGlzIFF1ZXJ5IHtcbiAgY29uc3QgbmFtZSA9IHZhbHVlLm5nTWV0YWRhdGFOYW1lO1xuICByZXR1cm4gbmFtZSA9PT0gJ1ZpZXdDaGlsZCcgfHwgbmFtZSA9PT0gJ1ZpZXdDaGlsZHJlbic7XG59XG5cbmZ1bmN0aW9uIGlzSW5wdXRBbm5vdGF0aW9uKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBJbnB1dCB7XG4gIHJldHVybiB2YWx1ZS5uZ01ldGFkYXRhTmFtZSA9PT0gJ0lucHV0Jztcbn1cblxuZnVuY3Rpb24gc3BsaXRCeUNvbW1hKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIHJldHVybiB2YWx1ZS5zcGxpdCgnLCcpLm1hcChwaWVjZSA9PiBwaWVjZS50cmltKCkpO1xufVxuXG5jb25zdCBMSUZFQ1lDTEVfSE9PS1MgPSBbXG4gICduZ09uQ2hhbmdlcycsICduZ09uSW5pdCcsICduZ09uRGVzdHJveScsICduZ0RvQ2hlY2snLCAnbmdBZnRlclZpZXdJbml0JywgJ25nQWZ0ZXJWaWV3Q2hlY2tlZCcsXG4gICduZ0FmdGVyQ29udGVudEluaXQnLCAnbmdBZnRlckNvbnRlbnRDaGVja2VkJ1xuXTtcblxuZnVuY3Rpb24gc2hvdWxkQWRkQWJzdHJhY3REaXJlY3RpdmUodHlwZTogVHlwZTxhbnk+KTogYm9vbGVhbiB7XG4gIGNvbnN0IHJlZmxlY3QgPSBnZXRSZWZsZWN0KCk7XG5cbiAgaWYgKExJRkVDWUNMRV9IT09LUy5zb21lKGhvb2tOYW1lID0+IHJlZmxlY3QuaGFzTGlmZWN5Y2xlSG9vayh0eXBlLCBob29rTmFtZSkpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBjb25zdCBwcm9wTWV0YWRhdGEgPSByZWZsZWN0LnByb3BNZXRhZGF0YSh0eXBlKTtcblxuICBmb3IgKGNvbnN0IGZpZWxkIGluIHByb3BNZXRhZGF0YSkge1xuICAgIGNvbnN0IGFubm90YXRpb25zID0gcHJvcE1ldGFkYXRhW2ZpZWxkXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYW5ub3RhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGN1cnJlbnQgPSBhbm5vdGF0aW9uc1tpXTtcbiAgICAgIGNvbnN0IG1ldGFkYXRhTmFtZSA9IGN1cnJlbnQubmdNZXRhZGF0YU5hbWU7XG5cbiAgICAgIGlmIChpc0lucHV0QW5ub3RhdGlvbihjdXJyZW50KSB8fCBpc0NvbnRlbnRRdWVyeShjdXJyZW50KSB8fCBpc1ZpZXdRdWVyeShjdXJyZW50KSB8fFxuICAgICAgICAgIG1ldGFkYXRhTmFtZSA9PT0gJ091dHB1dCcgfHwgbWV0YWRhdGFOYW1lID09PSAnSG9zdEJpbmRpbmcnIHx8XG4gICAgICAgICAgbWV0YWRhdGFOYW1lID09PSAnSG9zdExpc3RlbmVyJykge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG4iXX0=