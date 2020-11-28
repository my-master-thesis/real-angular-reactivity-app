/**
 * @fileoverview added by tsickle
 * Generated from: packages/core/src/render3/features/copy_definition_feature.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { isComponentDef } from '../interfaces/type_checks';
import { getSuperType } from './inherit_definition_feature';
/**
 * Fields which exist on either directive or component definitions, and need to be copied from
 * parent to child classes by the `ɵɵCopyDefinitionFeature`.
 * @type {?}
 */
const COPY_DIRECTIVE_FIELDS = [
    // The child class should use the providers of its parent.
    'providersResolver',
];
/**
 * Fields which exist only on component definitions, and need to be copied from parent to child
 * classes by the `ɵɵCopyDefinitionFeature`.
 *
 * The type here allows any field of `ComponentDef` which is not also a property of `DirectiveDef`,
 * since those should go in `COPY_DIRECTIVE_FIELDS` above.
 * @type {?}
 */
const COPY_COMPONENT_FIELDS = [
    // The child class should use the template function of its parent, including all template
    // semantics.
    'template',
    'decls',
    'consts',
    'vars',
    'onPush',
    'changeDetection',
    'reactiveProperties',
    'ngContentSelectors',
    // The child class should use the CSS styles of its parent, including all styling semantics.
    'styles',
    'encapsulation',
    // The child class should be checked by the runtime in the same way as its parent.
    'schemas',
];
/**
 * Copies the fields not handled by the `ɵɵInheritDefinitionFeature` from the supertype of a
 * definition.
 *
 * This exists primarily to support ngcc migration of an existing View Engine pattern, where an
 * entire decorator is inherited from a parent to a child class. When ngcc detects this case, it
 * generates a skeleton definition on the child class, and applies this feature.
 *
 * The `ɵɵCopyDefinitionFeature` then copies any needed fields from the parent class' definition,
 * including things like the component template function.
 *
 * \@codeGenApi
 * @param {?} definition The definition of a child class which inherits from a parent class with its
 * own definition.
 *
 * @return {?}
 */
export function ɵɵCopyDefinitionFeature(definition) {
    /** @type {?} */
    let superType = (/** @type {?} */ (getSuperType(definition.type)));
    /** @type {?} */
    let superDef = undefined;
    if (isComponentDef(definition)) {
        // Don't use getComponentDef/getDirectiveDef. This logic relies on inheritance.
        superDef = (/** @type {?} */ (superType.ɵcmp));
    }
    else {
        // Don't use getComponentDef/getDirectiveDef. This logic relies on inheritance.
        superDef = (/** @type {?} */ (superType.ɵdir));
    }
    // Needed because `definition` fields are readonly.
    /** @type {?} */
    const defAny = ((/** @type {?} */ (definition)));
    // Copy over any fields that apply to either directives or components.
    for (const field of COPY_DIRECTIVE_FIELDS) {
        defAny[field] = superDef[field];
    }
    if (isComponentDef(superDef)) {
        // Copy over any component-specific fields.
        for (const field of COPY_COMPONENT_FIELDS) {
            defAny[field] = superDef[field];
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29weV9kZWZpbml0aW9uX2ZlYXR1cmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2ZlYXR1cmVzL2NvcHlfZGVmaW5pdGlvbl9mZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVNBLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUV6RCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sOEJBQThCLENBQUM7Ozs7OztNQU1wRCxxQkFBcUIsR0FBb0M7SUFDN0QsMERBQTBEO0lBQzFELG1CQUFtQjtDQUlwQjs7Ozs7Ozs7O01BU0sscUJBQXFCLEdBQXdFO0lBQ2pHLHlGQUF5RjtJQUN6RixhQUFhO0lBQ2IsVUFBVTtJQUNWLE9BQU87SUFDUCxRQUFRO0lBQ1IsTUFBTTtJQUNOLFFBQVE7SUFDUixpQkFBaUI7SUFDakIsb0JBQW9CO0lBQ3BCLG9CQUFvQjtJQUVwQiw0RkFBNEY7SUFDNUYsUUFBUTtJQUNSLGVBQWU7SUFFZixrRkFBa0Y7SUFDbEYsU0FBUztDQUNWOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQkQsTUFBTSxVQUFVLHVCQUF1QixDQUFDLFVBQWdEOztRQUNsRixTQUFTLEdBQUcsbUJBQUEsWUFBWSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRTs7UUFFM0MsUUFBUSxHQUFrRCxTQUFTO0lBQ3ZFLElBQUksY0FBYyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1FBQzlCLCtFQUErRTtRQUMvRSxRQUFRLEdBQUcsbUJBQUEsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO0tBQzdCO1NBQU07UUFDTCwrRUFBK0U7UUFDL0UsUUFBUSxHQUFHLG1CQUFBLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUM3Qjs7O1VBR0ssTUFBTSxHQUFHLENBQUMsbUJBQUEsVUFBVSxFQUFPLENBQUM7SUFFbEMsc0VBQXNFO0lBQ3RFLEtBQUssTUFBTSxLQUFLLElBQUkscUJBQXFCLEVBQUU7UUFDekMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNqQztJQUVELElBQUksY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1FBQzVCLDJDQUEyQztRQUMzQyxLQUFLLE1BQU0sS0FBSyxJQUFJLHFCQUFxQixFQUFFO1lBQ3pDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDakM7S0FDRjtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcG9uZW50RGVmLCBEaXJlY3RpdmVEZWZ9IGZyb20gJy4uL2ludGVyZmFjZXMvZGVmaW5pdGlvbic7XG5pbXBvcnQge2lzQ29tcG9uZW50RGVmfSBmcm9tICcuLi9pbnRlcmZhY2VzL3R5cGVfY2hlY2tzJztcblxuaW1wb3J0IHtnZXRTdXBlclR5cGV9IGZyb20gJy4vaW5oZXJpdF9kZWZpbml0aW9uX2ZlYXR1cmUnO1xuXG4vKipcbiAqIEZpZWxkcyB3aGljaCBleGlzdCBvbiBlaXRoZXIgZGlyZWN0aXZlIG9yIGNvbXBvbmVudCBkZWZpbml0aW9ucywgYW5kIG5lZWQgdG8gYmUgY29waWVkIGZyb21cbiAqIHBhcmVudCB0byBjaGlsZCBjbGFzc2VzIGJ5IHRoZSBgybXJtUNvcHlEZWZpbml0aW9uRmVhdHVyZWAuXG4gKi9cbmNvbnN0IENPUFlfRElSRUNUSVZFX0ZJRUxEUzogKGtleW9mIERpcmVjdGl2ZURlZjx1bmtub3duPilbXSA9IFtcbiAgLy8gVGhlIGNoaWxkIGNsYXNzIHNob3VsZCB1c2UgdGhlIHByb3ZpZGVycyBvZiBpdHMgcGFyZW50LlxuICAncHJvdmlkZXJzUmVzb2x2ZXInLFxuXG4gIC8vIE5vdCBsaXN0ZWQgaGVyZSBhcmUgYW55IGZpZWxkcyB3aGljaCBhcmUgaGFuZGxlZCBieSB0aGUgYMm1ybVJbmhlcml0RGVmaW5pdGlvbkZlYXR1cmVgLCBzdWNoXG4gIC8vIGFzIGlucHV0cywgb3V0cHV0cywgYW5kIGhvc3QgYmluZGluZyBmdW5jdGlvbnMuXG5dO1xuXG4vKipcbiAqIEZpZWxkcyB3aGljaCBleGlzdCBvbmx5IG9uIGNvbXBvbmVudCBkZWZpbml0aW9ucywgYW5kIG5lZWQgdG8gYmUgY29waWVkIGZyb20gcGFyZW50IHRvIGNoaWxkXG4gKiBjbGFzc2VzIGJ5IHRoZSBgybXJtUNvcHlEZWZpbml0aW9uRmVhdHVyZWAuXG4gKlxuICogVGhlIHR5cGUgaGVyZSBhbGxvd3MgYW55IGZpZWxkIG9mIGBDb21wb25lbnREZWZgIHdoaWNoIGlzIG5vdCBhbHNvIGEgcHJvcGVydHkgb2YgYERpcmVjdGl2ZURlZmAsXG4gKiBzaW5jZSB0aG9zZSBzaG91bGQgZ28gaW4gYENPUFlfRElSRUNUSVZFX0ZJRUxEU2AgYWJvdmUuXG4gKi9cbmNvbnN0IENPUFlfQ09NUE9ORU5UX0ZJRUxEUzogRXhjbHVkZTxrZXlvZiBDb21wb25lbnREZWY8dW5rbm93bj4sIGtleW9mIERpcmVjdGl2ZURlZjx1bmtub3duPj5bXSA9IFtcbiAgLy8gVGhlIGNoaWxkIGNsYXNzIHNob3VsZCB1c2UgdGhlIHRlbXBsYXRlIGZ1bmN0aW9uIG9mIGl0cyBwYXJlbnQsIGluY2x1ZGluZyBhbGwgdGVtcGxhdGVcbiAgLy8gc2VtYW50aWNzLlxuICAndGVtcGxhdGUnLFxuICAnZGVjbHMnLFxuICAnY29uc3RzJyxcbiAgJ3ZhcnMnLFxuICAnb25QdXNoJyxcbiAgJ2NoYW5nZURldGVjdGlvbicsXG4gICdyZWFjdGl2ZVByb3BlcnRpZXMnLFxuICAnbmdDb250ZW50U2VsZWN0b3JzJyxcblxuICAvLyBUaGUgY2hpbGQgY2xhc3Mgc2hvdWxkIHVzZSB0aGUgQ1NTIHN0eWxlcyBvZiBpdHMgcGFyZW50LCBpbmNsdWRpbmcgYWxsIHN0eWxpbmcgc2VtYW50aWNzLlxuICAnc3R5bGVzJyxcbiAgJ2VuY2Fwc3VsYXRpb24nLFxuXG4gIC8vIFRoZSBjaGlsZCBjbGFzcyBzaG91bGQgYmUgY2hlY2tlZCBieSB0aGUgcnVudGltZSBpbiB0aGUgc2FtZSB3YXkgYXMgaXRzIHBhcmVudC5cbiAgJ3NjaGVtYXMnLFxuXTtcblxuLyoqXG4gKiBDb3BpZXMgdGhlIGZpZWxkcyBub3QgaGFuZGxlZCBieSB0aGUgYMm1ybVJbmhlcml0RGVmaW5pdGlvbkZlYXR1cmVgIGZyb20gdGhlIHN1cGVydHlwZSBvZiBhXG4gKiBkZWZpbml0aW9uLlxuICpcbiAqIFRoaXMgZXhpc3RzIHByaW1hcmlseSB0byBzdXBwb3J0IG5nY2MgbWlncmF0aW9uIG9mIGFuIGV4aXN0aW5nIFZpZXcgRW5naW5lIHBhdHRlcm4sIHdoZXJlIGFuXG4gKiBlbnRpcmUgZGVjb3JhdG9yIGlzIGluaGVyaXRlZCBmcm9tIGEgcGFyZW50IHRvIGEgY2hpbGQgY2xhc3MuIFdoZW4gbmdjYyBkZXRlY3RzIHRoaXMgY2FzZSwgaXRcbiAqIGdlbmVyYXRlcyBhIHNrZWxldG9uIGRlZmluaXRpb24gb24gdGhlIGNoaWxkIGNsYXNzLCBhbmQgYXBwbGllcyB0aGlzIGZlYXR1cmUuXG4gKlxuICogVGhlIGDJtcm1Q29weURlZmluaXRpb25GZWF0dXJlYCB0aGVuIGNvcGllcyBhbnkgbmVlZGVkIGZpZWxkcyBmcm9tIHRoZSBwYXJlbnQgY2xhc3MnIGRlZmluaXRpb24sXG4gKiBpbmNsdWRpbmcgdGhpbmdzIGxpa2UgdGhlIGNvbXBvbmVudCB0ZW1wbGF0ZSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0gZGVmaW5pdGlvbiBUaGUgZGVmaW5pdGlvbiBvZiBhIGNoaWxkIGNsYXNzIHdoaWNoIGluaGVyaXRzIGZyb20gYSBwYXJlbnQgY2xhc3Mgd2l0aCBpdHNcbiAqIG93biBkZWZpbml0aW9uLlxuICpcbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1Q29weURlZmluaXRpb25GZWF0dXJlKGRlZmluaXRpb246IERpcmVjdGl2ZURlZjxhbnk+fCBDb21wb25lbnREZWY8YW55Pik6IHZvaWQge1xuICBsZXQgc3VwZXJUeXBlID0gZ2V0U3VwZXJUeXBlKGRlZmluaXRpb24udHlwZSkgITtcblxuICBsZXQgc3VwZXJEZWY6IERpcmVjdGl2ZURlZjxhbnk+fENvbXBvbmVudERlZjxhbnk+fHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgaWYgKGlzQ29tcG9uZW50RGVmKGRlZmluaXRpb24pKSB7XG4gICAgLy8gRG9uJ3QgdXNlIGdldENvbXBvbmVudERlZi9nZXREaXJlY3RpdmVEZWYuIFRoaXMgbG9naWMgcmVsaWVzIG9uIGluaGVyaXRhbmNlLlxuICAgIHN1cGVyRGVmID0gc3VwZXJUeXBlLsm1Y21wICE7XG4gIH0gZWxzZSB7XG4gICAgLy8gRG9uJ3QgdXNlIGdldENvbXBvbmVudERlZi9nZXREaXJlY3RpdmVEZWYuIFRoaXMgbG9naWMgcmVsaWVzIG9uIGluaGVyaXRhbmNlLlxuICAgIHN1cGVyRGVmID0gc3VwZXJUeXBlLsm1ZGlyICE7XG4gIH1cblxuICAvLyBOZWVkZWQgYmVjYXVzZSBgZGVmaW5pdGlvbmAgZmllbGRzIGFyZSByZWFkb25seS5cbiAgY29uc3QgZGVmQW55ID0gKGRlZmluaXRpb24gYXMgYW55KTtcblxuICAvLyBDb3B5IG92ZXIgYW55IGZpZWxkcyB0aGF0IGFwcGx5IHRvIGVpdGhlciBkaXJlY3RpdmVzIG9yIGNvbXBvbmVudHMuXG4gIGZvciAoY29uc3QgZmllbGQgb2YgQ09QWV9ESVJFQ1RJVkVfRklFTERTKSB7XG4gICAgZGVmQW55W2ZpZWxkXSA9IHN1cGVyRGVmW2ZpZWxkXTtcbiAgfVxuXG4gIGlmIChpc0NvbXBvbmVudERlZihzdXBlckRlZikpIHtcbiAgICAvLyBDb3B5IG92ZXIgYW55IGNvbXBvbmVudC1zcGVjaWZpYyBmaWVsZHMuXG4gICAgZm9yIChjb25zdCBmaWVsZCBvZiBDT1BZX0NPTVBPTkVOVF9GSUVMRFMpIHtcbiAgICAgIGRlZkFueVtmaWVsZF0gPSBzdXBlckRlZltmaWVsZF07XG4gICAgfVxuICB9XG59XG4iXX0=