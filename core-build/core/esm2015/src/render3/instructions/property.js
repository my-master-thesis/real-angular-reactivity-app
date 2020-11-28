/**
 * @fileoverview added by tsickle
 * Generated from: packages/core/src/render3/instructions/property.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { bindingUpdated } from '../bindings';
import { getLView, getSelectedIndex, getTView, nextBindingIndex } from '../state';
import { elementPropertyInternal, setInputsForProperty, storePropertyBindingMetadata } from './shared';
/**
 * Update a property on a selected element.
 *
 * Operates on the element selected by index via the {\@link select} instruction.
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new `\@Inputs` don't have to be re-compiled
 *
 * \@codeGenApi
 * @template T
 * @param {?} propName Name of property. Because it is going to DOM, this is not subject to
 *        renaming as part of minification.
 * @param {?} value New value to write.
 * @param {?=} sanitizer An optional function used to sanitize the value.
 * @return {?} This function returns itself so that it may be chained
 * (e.g. `property('name', ctx.name)('title', ctx.title)`)
 *
 */
export function ɵɵproperty(propName, value, sanitizer) {
    // console.log(propName, value, sanitizer);
    /** @type {?} */
    const lView = getLView();
    /** @type {?} */
    const bindingIndex = nextBindingIndex();
    if (bindingUpdated(lView, bindingIndex, value)) {
        /** @type {?} */
        const nodeIndex = getSelectedIndex();
        /** @type {?} */
        const tView = getTView();
        elementPropertyInternal(tView, lView, nodeIndex, propName, value, sanitizer);
        ngDevMode && storePropertyBindingMetadata(tView.data, nodeIndex, propName, bindingIndex);
    }
    return ɵɵproperty;
}
/**
 * Given `<div style="..." my-dir>` and `MyDir` with `\@Input('style')` we need to write to
 * directive input.
 * @param {?} tView
 * @param {?} tNode
 * @param {?} lView
 * @param {?} value
 * @param {?} isClassBased
 * @return {?}
 */
export function setDirectiveInputsWhichShadowsStyling(tView, tNode, lView, value, isClassBased) {
    /** @type {?} */
    const inputs = (/** @type {?} */ (tNode.inputs));
    /** @type {?} */
    const property = isClassBased ? 'class' : 'style';
    // We support both 'class' and `className` hence the fallback.
    /** @type {?} */
    const stylingInputs = inputs[property] || (isClassBased && inputs['className']);
    setInputsForProperty(tView, lView, stylingInputs, property, value);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvcGVydHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2luc3RydWN0aW9ucy9wcm9wZXJ0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFPQSxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBSTNDLE9BQU8sRUFBQyxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ2hGLE9BQU8sRUFBQyx1QkFBdUIsRUFBRSxvQkFBb0IsRUFBRSw0QkFBNEIsRUFBQyxNQUFNLFVBQVUsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFxQnJHLE1BQU0sVUFBVSxVQUFVLENBQ3RCLFFBQWdCLEVBQUUsS0FBUSxFQUFFLFNBQThCOzs7VUFFdEQsS0FBSyxHQUFHLFFBQVEsRUFBRTs7VUFDbEIsWUFBWSxHQUFHLGdCQUFnQixFQUFFO0lBQ3ZDLElBQUksY0FBYyxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLEVBQUU7O2NBQ3hDLFNBQVMsR0FBRyxnQkFBZ0IsRUFBRTs7Y0FDOUIsS0FBSyxHQUFHLFFBQVEsRUFBRTtRQUN4Qix1QkFBdUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzdFLFNBQVMsSUFBSSw0QkFBNEIsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7S0FDMUY7SUFDRCxPQUFPLFVBQVUsQ0FBQztBQUNwQixDQUFDOzs7Ozs7Ozs7OztBQU1ELE1BQU0sVUFBVSxxQ0FBcUMsQ0FDakQsS0FBWSxFQUFFLEtBQVksRUFBRSxLQUFZLEVBQUUsS0FBVSxFQUFFLFlBQXFCOztVQUN2RSxNQUFNLEdBQUcsbUJBQUEsS0FBSyxDQUFDLE1BQU0sRUFBRTs7VUFDdkIsUUFBUSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPOzs7VUFFM0MsYUFBYSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDL0Usb0JBQW9CLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3JFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge2JpbmRpbmdVcGRhdGVkfSBmcm9tICcuLi9iaW5kaW5ncyc7XG5pbXBvcnQge1ROb2RlfSBmcm9tICcuLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtTYW5pdGl6ZXJGbn0gZnJvbSAnLi4vaW50ZXJmYWNlcy9zYW5pdGl6YXRpb24nO1xuaW1wb3J0IHtMVmlldywgVFZpZXd9IGZyb20gJy4uL2ludGVyZmFjZXMvdmlldyc7XG5pbXBvcnQge2dldExWaWV3LCBnZXRTZWxlY3RlZEluZGV4LCBnZXRUVmlldywgbmV4dEJpbmRpbmdJbmRleH0gZnJvbSAnLi4vc3RhdGUnO1xuaW1wb3J0IHtlbGVtZW50UHJvcGVydHlJbnRlcm5hbCwgc2V0SW5wdXRzRm9yUHJvcGVydHksIHN0b3JlUHJvcGVydHlCaW5kaW5nTWV0YWRhdGF9IGZyb20gJy4vc2hhcmVkJztcblxuXG4vKipcbiAqIFVwZGF0ZSBhIHByb3BlcnR5IG9uIGEgc2VsZWN0ZWQgZWxlbWVudC5cbiAqXG4gKiBPcGVyYXRlcyBvbiB0aGUgZWxlbWVudCBzZWxlY3RlZCBieSBpbmRleCB2aWEgdGhlIHtAbGluayBzZWxlY3R9IGluc3RydWN0aW9uLlxuICpcbiAqIElmIHRoZSBwcm9wZXJ0eSBuYW1lIGFsc28gZXhpc3RzIGFzIGFuIGlucHV0IHByb3BlcnR5IG9uIG9uZSBvZiB0aGUgZWxlbWVudCdzIGRpcmVjdGl2ZXMsXG4gKiB0aGUgY29tcG9uZW50IHByb3BlcnR5IHdpbGwgYmUgc2V0IGluc3RlYWQgb2YgdGhlIGVsZW1lbnQgcHJvcGVydHkuIFRoaXMgY2hlY2sgbXVzdFxuICogYmUgY29uZHVjdGVkIGF0IHJ1bnRpbWUgc28gY2hpbGQgY29tcG9uZW50cyB0aGF0IGFkZCBuZXcgYEBJbnB1dHNgIGRvbid0IGhhdmUgdG8gYmUgcmUtY29tcGlsZWRcbiAqXG4gKiBAcGFyYW0gcHJvcE5hbWUgTmFtZSBvZiBwcm9wZXJ0eS4gQmVjYXVzZSBpdCBpcyBnb2luZyB0byBET00sIHRoaXMgaXMgbm90IHN1YmplY3QgdG9cbiAqICAgICAgICByZW5hbWluZyBhcyBwYXJ0IG9mIG1pbmlmaWNhdGlvbi5cbiAqIEBwYXJhbSB2YWx1ZSBOZXcgdmFsdWUgdG8gd3JpdGUuXG4gKiBAcGFyYW0gc2FuaXRpemVyIEFuIG9wdGlvbmFsIGZ1bmN0aW9uIHVzZWQgdG8gc2FuaXRpemUgdGhlIHZhbHVlLlxuICogQHJldHVybnMgVGhpcyBmdW5jdGlvbiByZXR1cm5zIGl0c2VsZiBzbyB0aGF0IGl0IG1heSBiZSBjaGFpbmVkXG4gKiAoZS5nLiBgcHJvcGVydHkoJ25hbWUnLCBjdHgubmFtZSkoJ3RpdGxlJywgY3R4LnRpdGxlKWApXG4gKlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVwcm9wZXJ0eTxUPihcbiAgICBwcm9wTmFtZTogc3RyaW5nLCB2YWx1ZTogVCwgc2FuaXRpemVyPzogU2FuaXRpemVyRm4gfCBudWxsKTogdHlwZW9mIMm1ybVwcm9wZXJ0eSB7XG4gIC8vIGNvbnNvbGUubG9nKHByb3BOYW1lLCB2YWx1ZSwgc2FuaXRpemVyKTtcbiAgY29uc3QgbFZpZXcgPSBnZXRMVmlldygpO1xuICBjb25zdCBiaW5kaW5nSW5kZXggPSBuZXh0QmluZGluZ0luZGV4KCk7XG4gIGlmIChiaW5kaW5nVXBkYXRlZChsVmlldywgYmluZGluZ0luZGV4LCB2YWx1ZSkpIHtcbiAgICBjb25zdCBub2RlSW5kZXggPSBnZXRTZWxlY3RlZEluZGV4KCk7XG4gICAgY29uc3QgdFZpZXcgPSBnZXRUVmlldygpO1xuICAgIGVsZW1lbnRQcm9wZXJ0eUludGVybmFsKHRWaWV3LCBsVmlldywgbm9kZUluZGV4LCBwcm9wTmFtZSwgdmFsdWUsIHNhbml0aXplcik7XG4gICAgbmdEZXZNb2RlICYmIHN0b3JlUHJvcGVydHlCaW5kaW5nTWV0YWRhdGEodFZpZXcuZGF0YSwgbm9kZUluZGV4LCBwcm9wTmFtZSwgYmluZGluZ0luZGV4KTtcbiAgfVxuICByZXR1cm4gybXJtXByb3BlcnR5O1xufVxuXG4vKipcbiAqIEdpdmVuIGA8ZGl2IHN0eWxlPVwiLi4uXCIgbXktZGlyPmAgYW5kIGBNeURpcmAgd2l0aCBgQElucHV0KCdzdHlsZScpYCB3ZSBuZWVkIHRvIHdyaXRlIHRvXG4gKiBkaXJlY3RpdmUgaW5wdXQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXREaXJlY3RpdmVJbnB1dHNXaGljaFNoYWRvd3NTdHlsaW5nKFxuICAgIHRWaWV3OiBUVmlldywgdE5vZGU6IFROb2RlLCBsVmlldzogTFZpZXcsIHZhbHVlOiBhbnksIGlzQ2xhc3NCYXNlZDogYm9vbGVhbikge1xuICBjb25zdCBpbnB1dHMgPSB0Tm9kZS5pbnB1dHMgITtcbiAgY29uc3QgcHJvcGVydHkgPSBpc0NsYXNzQmFzZWQgPyAnY2xhc3MnIDogJ3N0eWxlJztcbiAgLy8gV2Ugc3VwcG9ydCBib3RoICdjbGFzcycgYW5kIGBjbGFzc05hbWVgIGhlbmNlIHRoZSBmYWxsYmFjay5cbiAgY29uc3Qgc3R5bGluZ0lucHV0cyA9IGlucHV0c1twcm9wZXJ0eV0gfHwgKGlzQ2xhc3NCYXNlZCAmJiBpbnB1dHNbJ2NsYXNzTmFtZSddKTtcbiAgc2V0SW5wdXRzRm9yUHJvcGVydHkodFZpZXcsIGxWaWV3LCBzdHlsaW5nSW5wdXRzLCBwcm9wZXJ0eSwgdmFsdWUpO1xufVxuIl19