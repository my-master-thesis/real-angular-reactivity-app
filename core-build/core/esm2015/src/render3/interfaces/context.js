/**
 * @fileoverview added by tsickle
 * Generated from: packages/core/src/render3/interfaces/context.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * This property will be monkey-patched on elements, components and directives
 * @type {?}
 */
export const MONKEY_PATCH_KEY_NAME = '__ngContext__';
/**
 * This properties will be monkey-patched on Proxy
 * @type {?}
 */
export const PROXY_INDICATOR = '__isProxy__';
/** @type {?} */
export const NOT_LOST_PROXY_INDICATOR = '__isRealProxy__';
/** @type {?} */
export const SET_PROXY_INDICATOR = '__setProxy__';
/** @type {?} */
export const REMOVE_PROXY_INDICATOR = '__removeProxy__';
/** @type {?} */
export const REACTIVE_PROPERTIES_INDICATOR = '__reactiveProperties__';
/**
 * The internal view context which is specific to a given DOM element, directive or
 * component instance. Each value in here (besides the LView and element node details)
 * can be present, null or undefined. If undefined then it implies the value has not been
 * looked up yet, otherwise, if null, then a lookup was executed and nothing was found.
 *
 * Each value will get filled when the respective value is examined within the getContext
 * function. The component, element and each directive instance will share the same instance
 * of the context.
 * @record
 */
export function LContext() { }
if (false) {
    /**
     * The component's parent view data.
     * @type {?}
     */
    LContext.prototype.lView;
    /**
     * The index instance of the node.
     * @type {?}
     */
    LContext.prototype.nodeIndex;
    /**
     * The instance of the DOM node that is attached to the lNode.
     * @type {?}
     */
    LContext.prototype.native;
    /**
     * The instance of the Component node.
     * @type {?}
     */
    LContext.prototype.component;
    /**
     * The list of active directives that exist on this element.
     * @type {?}
     */
    LContext.prototype.directives;
    /**
     * The map of local references (local reference name => element or directive instance) that exist
     * on this element.
     * @type {?}
     */
    LContext.prototype.localRefs;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaW50ZXJmYWNlcy9jb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFlQSxNQUFNLE9BQU8scUJBQXFCLEdBQUcsZUFBZTs7Ozs7QUFLcEQsTUFBTSxPQUFPLGVBQWUsR0FBRyxhQUFhOztBQUM1QyxNQUFNLE9BQU8sd0JBQXdCLEdBQUcsaUJBQWlCOztBQUN6RCxNQUFNLE9BQU8sbUJBQW1CLEdBQUcsY0FBYzs7QUFDakQsTUFBTSxPQUFPLHNCQUFzQixHQUFHLGlCQUFpQjs7QUFDdkQsTUFBTSxPQUFPLDZCQUE2QixHQUFHLHdCQUF3Qjs7Ozs7Ozs7Ozs7O0FBWXJFLDhCQStCQzs7Ozs7O0lBM0JDLHlCQUFhOzs7OztJQUtiLDZCQUFrQjs7Ozs7SUFLbEIsMEJBQWM7Ozs7O0lBS2QsNkJBQTZCOzs7OztJQUs3Qiw4QkFBaUM7Ozs7OztJQU1qQyw2QkFBK0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cblxuaW1wb3J0IHtSTm9kZX0gZnJvbSAnLi9yZW5kZXJlcic7XG5pbXBvcnQge0xWaWV3fSBmcm9tICcuL3ZpZXcnO1xuXG4vKipcbiAqIFRoaXMgcHJvcGVydHkgd2lsbCBiZSBtb25rZXktcGF0Y2hlZCBvbiBlbGVtZW50cywgY29tcG9uZW50cyBhbmQgZGlyZWN0aXZlc1xuICovXG5leHBvcnQgY29uc3QgTU9OS0VZX1BBVENIX0tFWV9OQU1FID0gJ19fbmdDb250ZXh0X18nO1xuXG4vKipcbiAqIFRoaXMgcHJvcGVydGllcyB3aWxsIGJlIG1vbmtleS1wYXRjaGVkIG9uIFByb3h5XG4gKi9cbmV4cG9ydCBjb25zdCBQUk9YWV9JTkRJQ0FUT1IgPSAnX19pc1Byb3h5X18nO1xuZXhwb3J0IGNvbnN0IE5PVF9MT1NUX1BST1hZX0lORElDQVRPUiA9ICdfX2lzUmVhbFByb3h5X18nO1xuZXhwb3J0IGNvbnN0IFNFVF9QUk9YWV9JTkRJQ0FUT1IgPSAnX19zZXRQcm94eV9fJztcbmV4cG9ydCBjb25zdCBSRU1PVkVfUFJPWFlfSU5ESUNBVE9SID0gJ19fcmVtb3ZlUHJveHlfXyc7XG5leHBvcnQgY29uc3QgUkVBQ1RJVkVfUFJPUEVSVElFU19JTkRJQ0FUT1IgPSAnX19yZWFjdGl2ZVByb3BlcnRpZXNfXyc7XG5cbi8qKlxuICogVGhlIGludGVybmFsIHZpZXcgY29udGV4dCB3aGljaCBpcyBzcGVjaWZpYyB0byBhIGdpdmVuIERPTSBlbGVtZW50LCBkaXJlY3RpdmUgb3JcbiAqIGNvbXBvbmVudCBpbnN0YW5jZS4gRWFjaCB2YWx1ZSBpbiBoZXJlIChiZXNpZGVzIHRoZSBMVmlldyBhbmQgZWxlbWVudCBub2RlIGRldGFpbHMpXG4gKiBjYW4gYmUgcHJlc2VudCwgbnVsbCBvciB1bmRlZmluZWQuIElmIHVuZGVmaW5lZCB0aGVuIGl0IGltcGxpZXMgdGhlIHZhbHVlIGhhcyBub3QgYmVlblxuICogbG9va2VkIHVwIHlldCwgb3RoZXJ3aXNlLCBpZiBudWxsLCB0aGVuIGEgbG9va3VwIHdhcyBleGVjdXRlZCBhbmQgbm90aGluZyB3YXMgZm91bmQuXG4gKlxuICogRWFjaCB2YWx1ZSB3aWxsIGdldCBmaWxsZWQgd2hlbiB0aGUgcmVzcGVjdGl2ZSB2YWx1ZSBpcyBleGFtaW5lZCB3aXRoaW4gdGhlIGdldENvbnRleHRcbiAqIGZ1bmN0aW9uLiBUaGUgY29tcG9uZW50LCBlbGVtZW50IGFuZCBlYWNoIGRpcmVjdGl2ZSBpbnN0YW5jZSB3aWxsIHNoYXJlIHRoZSBzYW1lIGluc3RhbmNlXG4gKiBvZiB0aGUgY29udGV4dC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMQ29udGV4dCB7XG4gIC8qKlxuICAgKiBUaGUgY29tcG9uZW50J3MgcGFyZW50IHZpZXcgZGF0YS5cbiAgICovXG4gIGxWaWV3OiBMVmlldztcblxuICAvKipcbiAgICogVGhlIGluZGV4IGluc3RhbmNlIG9mIHRoZSBub2RlLlxuICAgKi9cbiAgbm9kZUluZGV4OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRoZSBpbnN0YW5jZSBvZiB0aGUgRE9NIG5vZGUgdGhhdCBpcyBhdHRhY2hlZCB0byB0aGUgbE5vZGUuXG4gICAqL1xuICBuYXRpdmU6IFJOb2RlO1xuXG4gIC8qKlxuICAgKiBUaGUgaW5zdGFuY2Ugb2YgdGhlIENvbXBvbmVudCBub2RlLlxuICAgKi9cbiAgY29tcG9uZW50OiB7fXxudWxsfHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogVGhlIGxpc3Qgb2YgYWN0aXZlIGRpcmVjdGl2ZXMgdGhhdCBleGlzdCBvbiB0aGlzIGVsZW1lbnQuXG4gICAqL1xuICBkaXJlY3RpdmVzOiBhbnlbXXxudWxsfHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogVGhlIG1hcCBvZiBsb2NhbCByZWZlcmVuY2VzIChsb2NhbCByZWZlcmVuY2UgbmFtZSA9PiBlbGVtZW50IG9yIGRpcmVjdGl2ZSBpbnN0YW5jZSkgdGhhdCBleGlzdFxuICAgKiBvbiB0aGlzIGVsZW1lbnQuXG4gICAqL1xuICBsb2NhbFJlZnM6IHtba2V5OiBzdHJpbmddOiBhbnl9fG51bGx8dW5kZWZpbmVkO1xufVxuIl19