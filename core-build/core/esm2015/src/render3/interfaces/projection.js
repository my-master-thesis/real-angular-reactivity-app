/**
 * @fileoverview added by tsickle
 * Generated from: packages/core/src/render3/interfaces/projection.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** @enum {number} */
const SelectorFlags = {
    /** Indicates this is the beginning of a new negative selector */
    NOT: 1,
    /** Mode for matching attributes */
    ATTRIBUTE: 2,
    /** Mode for matching tag names */
    ELEMENT: 4,
    /** Mode for matching class names */
    CLASS: 8,
};
export { SelectorFlags };
// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
/** @type {?} */
export const unusedValueExportToPlacateAjd = 1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaW50ZXJmYWNlcy9wcm9qZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUErREEsTUFBa0IsYUFBYTtJQUM3QixpRUFBaUU7SUFDakUsR0FBRyxHQUFTO0lBRVosbUNBQW1DO0lBQ25DLFNBQVMsR0FBUztJQUVsQixrQ0FBa0M7SUFDbEMsT0FBTyxHQUFTO0lBRWhCLG9DQUFvQztJQUNwQyxLQUFLLEdBQVM7RUFDZjs7Ozs7QUFJRCxNQUFNLE9BQU8sNkJBQTZCLEdBQUcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIlxuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5cbi8qKlxuICogRXhwcmVzc2VzIGEgc2luZ2xlIENTUyBTZWxlY3Rvci5cbiAqXG4gKiBCZWdpbm5pbmcgb2YgYXJyYXlcbiAqIC0gRmlyc3QgaW5kZXg6IGVsZW1lbnQgbmFtZVxuICogLSBTdWJzZXF1ZW50IG9kZCBpbmRpY2VzOiBhdHRyIGtleXNcbiAqIC0gU3Vic2VxdWVudCBldmVuIGluZGljZXM6IGF0dHIgdmFsdWVzXG4gKlxuICogQWZ0ZXIgU2VsZWN0b3JGbGFncy5DTEFTUyBmbGFnXG4gKiAtIENsYXNzIG5hbWUgdmFsdWVzXG4gKlxuICogU2VsZWN0b3JGbGFncy5OT1QgZmxhZ1xuICogLSBDaGFuZ2VzIHRoZSBtb2RlIHRvIE5PVFxuICogLSBDYW4gYmUgY29tYmluZWQgd2l0aCBvdGhlciBmbGFncyB0byBzZXQgdGhlIGVsZW1lbnQgLyBhdHRyIC8gY2xhc3MgbW9kZVxuICpcbiAqIGUuZy4gU2VsZWN0b3JGbGFncy5OT1QgfCBTZWxlY3RvckZsYWdzLkVMRU1FTlRcbiAqXG4gKiBFeGFtcGxlOlxuICogT3JpZ2luYWw6IGBkaXYuZm9vLmJhclthdHRyMT12YWwxXVthdHRyMl1gXG4gKiBQYXJzZWQ6IFsnZGl2JywgJ2F0dHIxJywgJ3ZhbDEnLCAnYXR0cjInLCAnJywgU2VsZWN0b3JGbGFncy5DTEFTUywgJ2ZvbycsICdiYXInXVxuICpcbiAqIE9yaWdpbmFsOiAnZGl2W2F0dHIxXTpub3QoLmZvb1thdHRyMl0pXG4gKiBQYXJzZWQ6IFtcbiAqICAnZGl2JywgJ2F0dHIxJywgJycsXG4gKiAgU2VsZWN0b3JGbGFncy5OT1QgfCBTZWxlY3RvckZsYWdzLkFUVFJJQlVURSAnYXR0cjInLCAnJywgU2VsZWN0b3JGbGFncy5DTEFTUywgJ2ZvbydcbiAqIF1cbiAqXG4gKiBTZWUgbW9yZSBleGFtcGxlcyBpbiBub2RlX3NlbGVjdG9yX21hdGNoZXJfc3BlYy50c1xuICovXG5leHBvcnQgdHlwZSBDc3NTZWxlY3RvciA9IChzdHJpbmcgfCBTZWxlY3RvckZsYWdzKVtdO1xuXG4vKipcbiAqIEEgbGlzdCBvZiBDc3NTZWxlY3RvcnMuXG4gKlxuICogQSBkaXJlY3RpdmUgb3IgY29tcG9uZW50IGNhbiBoYXZlIG11bHRpcGxlIHNlbGVjdG9ycy4gVGhpcyB0eXBlIGlzIHVzZWQgZm9yXG4gKiBkaXJlY3RpdmUgZGVmcyBzbyBhbnkgb2YgdGhlIHNlbGVjdG9ycyBpbiB0aGUgbGlzdCB3aWxsIG1hdGNoIHRoYXQgZGlyZWN0aXZlLlxuICpcbiAqIE9yaWdpbmFsOiAnZm9ybSwgW25nRm9ybV0nXG4gKiBQYXJzZWQ6IFtbJ2Zvcm0nXSwgWycnLCAnbmdGb3JtJywgJyddXVxuICovXG5leHBvcnQgdHlwZSBDc3NTZWxlY3Rvckxpc3QgPSBDc3NTZWxlY3RvcltdO1xuXG4vKipcbiAqIExpc3Qgb2Ygc2xvdHMgZm9yIGEgcHJvamVjdGlvbi4gQSBzbG90IGNhbiBiZSBlaXRoZXIgYmFzZWQgb24gYSBwYXJzZWQgQ1NTIHNlbGVjdG9yXG4gKiB3aGljaCB3aWxsIGJlIHVzZWQgdG8gZGV0ZXJtaW5lIG5vZGVzIHdoaWNoIGFyZSBwcm9qZWN0ZWQgaW50byB0aGF0IHNsb3QuXG4gKlxuICogV2hlbiBzZXQgdG8gXCIqXCIsIHRoZSBzbG90IGlzIHJlc2VydmVkIGFuZCBjYW4gYmUgdXNlZCBmb3IgbXVsdGktc2xvdCBwcm9qZWN0aW9uXG4gKiB1c2luZyB7QGxpbmsgVmlld0NvbnRhaW5lclJlZiNjcmVhdGVDb21wb25lbnR9LiBUaGUgbGFzdCBzbG90IHRoYXQgc3BlY2lmaWVzIHRoZVxuICogd2lsZGNhcmQgc2VsZWN0b3Igd2lsbCByZXRyaWV2ZSBhbGwgcHJvamVjdGFibGUgbm9kZXMgd2hpY2ggZG8gbm90IG1hdGNoIGFueSBzZWxlY3Rvci5cbiAqL1xuZXhwb3J0IHR5cGUgUHJvamVjdGlvblNsb3RzID0gKENzc1NlbGVjdG9yTGlzdCB8ICcqJylbXTtcblxuLyoqIEZsYWdzIHVzZWQgdG8gYnVpbGQgdXAgQ3NzU2VsZWN0b3JzICovXG5leHBvcnQgY29uc3QgZW51bSBTZWxlY3RvckZsYWdzIHtcbiAgLyoqIEluZGljYXRlcyB0aGlzIGlzIHRoZSBiZWdpbm5pbmcgb2YgYSBuZXcgbmVnYXRpdmUgc2VsZWN0b3IgKi9cbiAgTk9UID0gMGIwMDAxLFxuXG4gIC8qKiBNb2RlIGZvciBtYXRjaGluZyBhdHRyaWJ1dGVzICovXG4gIEFUVFJJQlVURSA9IDBiMDAxMCxcblxuICAvKiogTW9kZSBmb3IgbWF0Y2hpbmcgdGFnIG5hbWVzICovXG4gIEVMRU1FTlQgPSAwYjAxMDAsXG5cbiAgLyoqIE1vZGUgZm9yIG1hdGNoaW5nIGNsYXNzIG5hbWVzICovXG4gIENMQVNTID0gMGIxMDAwLFxufVxuXG4vLyBOb3RlOiBUaGlzIGhhY2sgaXMgbmVjZXNzYXJ5IHNvIHdlIGRvbid0IGVycm9uZW91c2x5IGdldCBhIGNpcmN1bGFyIGRlcGVuZGVuY3lcbi8vIGZhaWx1cmUgYmFzZWQgb24gdHlwZXMuXG5leHBvcnQgY29uc3QgdW51c2VkVmFsdWVFeHBvcnRUb1BsYWNhdGVBamQgPSAxO1xuIl19