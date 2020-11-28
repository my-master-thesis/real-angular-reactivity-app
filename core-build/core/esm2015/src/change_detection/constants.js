/**
 * @fileoverview added by tsickle
 * Generated from: packages/core/src/change_detection/constants.ts
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
const ChangeDetectionStrategy = {
    /**
     * Use the `CheckOnce` strategy, meaning that automatic change detection is deactivated
     * until reactivated by setting the strategy to `Default` (`CheckAlways`).
     * Change detection can still be explicitly invoked.
     * This strategy applies to all child directives and cannot be overridden.
     */
    OnPush: 0,
    /**
     * Use the default `CheckAlways` strategy, in which change detection is automatic until
     * explicitly deactivated.
     */
    Default: 1,
    /* fourth */
    Reactivity: 2,
};
export { ChangeDetectionStrategy };
ChangeDetectionStrategy[ChangeDetectionStrategy.OnPush] = 'OnPush';
ChangeDetectionStrategy[ChangeDetectionStrategy.Default] = 'Default';
ChangeDetectionStrategy[ChangeDetectionStrategy.Reactivity] = 'Reactivity';
/** @enum {number} */
const ChangeDetectorStatus = {
    /**
     * A state in which, after calling `detectChanges()`, the change detector
     * state becomes `Checked`, and must be explicitly invoked or reactivated.
     */
    CheckOnce: 0,
    /**
     * A state in which change detection is skipped until the change detector mode
     * becomes `CheckOnce`.
     */
    Checked: 1,
    /**
     * A state in which change detection continues automatically until explicitly
     * deactivated.
     */
    CheckAlways: 2,
    /**
     * A state in which a change detector sub tree is not a part of the main tree and
     * should be skipped.
     */
    Detached: 3,
    /**
     * Indicates that the change detector encountered an error checking a binding
     * or calling a directive lifecycle method and is now in an inconsistent state. Change
     * detectors in this state do not detect changes.
     */
    Errored: 4,
    /**
     * Indicates that the change detector has been destroyed.
     */
    Destroyed: 5,
};
export { ChangeDetectorStatus };
ChangeDetectorStatus[ChangeDetectorStatus.CheckOnce] = 'CheckOnce';
ChangeDetectorStatus[ChangeDetectorStatus.Checked] = 'Checked';
ChangeDetectorStatus[ChangeDetectorStatus.CheckAlways] = 'CheckAlways';
ChangeDetectorStatus[ChangeDetectorStatus.Detached] = 'Detached';
ChangeDetectorStatus[ChangeDetectorStatus.Errored] = 'Errored';
ChangeDetectorStatus[ChangeDetectorStatus.Destroyed] = 'Destroyed';
/**
 * Reports whether a given strategy is currently the default for change detection.
 * @see `ChangeDetectorStatus` / `ChangeDetectorRef`
 * @param {?} changeDetectionStrategy The strategy to check.
 * @return {?} True if the given strategy is the current default, false otherwise.
 */
export function isDefaultChangeDetectionStrategy(changeDetectionStrategy) {
    return changeDetectionStrategy == null ||
        changeDetectionStrategy === ChangeDetectionStrategy.Default;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvY2hhbmdlX2RldGVjdGlvbi9jb25zdGFudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWVBLE1BQVksdUJBQXVCO0lBQ2pDOzs7OztPQUtHO0lBQ0gsTUFBTSxHQUFJO0lBRVY7OztPQUdHO0lBQ0gsT0FBTyxHQUFJO0lBQ1gsWUFBWTtJQUNaLFVBQVUsR0FBSTtFQUNmOzs7Ozs7QUFNRCxNQUFZLG9CQUFvQjtJQUM5Qjs7O09BR0c7SUFDSCxTQUFTLEdBQUE7SUFFVDs7O09BR0c7SUFDSCxPQUFPLEdBQUE7SUFFUDs7O09BR0c7SUFDSCxXQUFXLEdBQUE7SUFFWDs7O09BR0c7SUFDSCxRQUFRLEdBQUE7SUFFUjs7OztPQUlHO0lBQ0gsT0FBTyxHQUFBO0lBRVA7O09BRUc7SUFDSCxTQUFTLEdBQUE7RUFDVjs7Ozs7Ozs7Ozs7Ozs7QUFTRCxNQUFNLFVBQVUsZ0NBQWdDLENBQUMsdUJBQWdEO0lBRS9GLE9BQU8sdUJBQXVCLElBQUksSUFBSTtRQUNsQyx1QkFBdUIsS0FBSyx1QkFBdUIsQ0FBQyxPQUFPLENBQUM7QUFDbEUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuXG4vKipcbiAqIFRoZSBzdHJhdGVneSB0aGF0IHRoZSBkZWZhdWx0IGNoYW5nZSBkZXRlY3RvciB1c2VzIHRvIGRldGVjdCBjaGFuZ2VzLlxuICogV2hlbiBzZXQsIHRha2VzIGVmZmVjdCB0aGUgbmV4dCB0aW1lIGNoYW5nZSBkZXRlY3Rpb24gaXMgdHJpZ2dlcmVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGVudW0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kge1xuICAvKipcbiAgICogVXNlIHRoZSBgQ2hlY2tPbmNlYCBzdHJhdGVneSwgbWVhbmluZyB0aGF0IGF1dG9tYXRpYyBjaGFuZ2UgZGV0ZWN0aW9uIGlzIGRlYWN0aXZhdGVkXG4gICAqIHVudGlsIHJlYWN0aXZhdGVkIGJ5IHNldHRpbmcgdGhlIHN0cmF0ZWd5IHRvIGBEZWZhdWx0YCAoYENoZWNrQWx3YXlzYCkuXG4gICAqIENoYW5nZSBkZXRlY3Rpb24gY2FuIHN0aWxsIGJlIGV4cGxpY2l0bHkgaW52b2tlZC5cbiAgICogVGhpcyBzdHJhdGVneSBhcHBsaWVzIHRvIGFsbCBjaGlsZCBkaXJlY3RpdmVzIGFuZCBjYW5ub3QgYmUgb3ZlcnJpZGRlbi5cbiAgICovXG4gIE9uUHVzaCA9IDAsXG5cbiAgLyoqXG4gICAqIFVzZSB0aGUgZGVmYXVsdCBgQ2hlY2tBbHdheXNgIHN0cmF0ZWd5LCBpbiB3aGljaCBjaGFuZ2UgZGV0ZWN0aW9uIGlzIGF1dG9tYXRpYyB1bnRpbFxuICAgKiBleHBsaWNpdGx5IGRlYWN0aXZhdGVkLlxuICAgKi9cbiAgRGVmYXVsdCA9IDEsXG4gIC8qIGZvdXJ0aCAqL1xuICBSZWFjdGl2aXR5ID0gMlxufVxuXG4vKipcbiAqIERlZmluZXMgdGhlIHBvc3NpYmxlIHN0YXRlcyBvZiB0aGUgZGVmYXVsdCBjaGFuZ2UgZGV0ZWN0b3IuXG4gKiBAc2VlIGBDaGFuZ2VEZXRlY3RvclJlZmBcbiAqL1xuZXhwb3J0IGVudW0gQ2hhbmdlRGV0ZWN0b3JTdGF0dXMge1xuICAvKipcbiAgICogQSBzdGF0ZSBpbiB3aGljaCwgYWZ0ZXIgY2FsbGluZyBgZGV0ZWN0Q2hhbmdlcygpYCwgdGhlIGNoYW5nZSBkZXRlY3RvclxuICAgKiBzdGF0ZSBiZWNvbWVzIGBDaGVja2VkYCwgYW5kIG11c3QgYmUgZXhwbGljaXRseSBpbnZva2VkIG9yIHJlYWN0aXZhdGVkLlxuICAgKi9cbiAgQ2hlY2tPbmNlLFxuXG4gIC8qKlxuICAgKiBBIHN0YXRlIGluIHdoaWNoIGNoYW5nZSBkZXRlY3Rpb24gaXMgc2tpcHBlZCB1bnRpbCB0aGUgY2hhbmdlIGRldGVjdG9yIG1vZGVcbiAgICogYmVjb21lcyBgQ2hlY2tPbmNlYC5cbiAgICovXG4gIENoZWNrZWQsXG5cbiAgLyoqXG4gICAqIEEgc3RhdGUgaW4gd2hpY2ggY2hhbmdlIGRldGVjdGlvbiBjb250aW51ZXMgYXV0b21hdGljYWxseSB1bnRpbCBleHBsaWNpdGx5XG4gICAqIGRlYWN0aXZhdGVkLlxuICAgKi9cbiAgQ2hlY2tBbHdheXMsXG5cbiAgLyoqXG4gICAqIEEgc3RhdGUgaW4gd2hpY2ggYSBjaGFuZ2UgZGV0ZWN0b3Igc3ViIHRyZWUgaXMgbm90IGEgcGFydCBvZiB0aGUgbWFpbiB0cmVlIGFuZFxuICAgKiBzaG91bGQgYmUgc2tpcHBlZC5cbiAgICovXG4gIERldGFjaGVkLFxuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgdGhhdCB0aGUgY2hhbmdlIGRldGVjdG9yIGVuY291bnRlcmVkIGFuIGVycm9yIGNoZWNraW5nIGEgYmluZGluZ1xuICAgKiBvciBjYWxsaW5nIGEgZGlyZWN0aXZlIGxpZmVjeWNsZSBtZXRob2QgYW5kIGlzIG5vdyBpbiBhbiBpbmNvbnNpc3RlbnQgc3RhdGUuIENoYW5nZVxuICAgKiBkZXRlY3RvcnMgaW4gdGhpcyBzdGF0ZSBkbyBub3QgZGV0ZWN0IGNoYW5nZXMuXG4gICAqL1xuICBFcnJvcmVkLFxuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgdGhhdCB0aGUgY2hhbmdlIGRldGVjdG9yIGhhcyBiZWVuIGRlc3Ryb3llZC5cbiAgICovXG4gIERlc3Ryb3llZCxcbn1cblxuLyoqXG4gKiBSZXBvcnRzIHdoZXRoZXIgYSBnaXZlbiBzdHJhdGVneSBpcyBjdXJyZW50bHkgdGhlIGRlZmF1bHQgZm9yIGNoYW5nZSBkZXRlY3Rpb24uXG4gKiBAcGFyYW0gY2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kgVGhlIHN0cmF0ZWd5IHRvIGNoZWNrLlxuICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgZ2l2ZW4gc3RyYXRlZ3kgaXMgdGhlIGN1cnJlbnQgZGVmYXVsdCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICogQHNlZSBgQ2hhbmdlRGV0ZWN0b3JTdGF0dXNgXG4gKiBAc2VlIGBDaGFuZ2VEZXRlY3RvclJlZmBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRGVmYXVsdENoYW5nZURldGVjdGlvblN0cmF0ZWd5KGNoYW5nZURldGVjdGlvblN0cmF0ZWd5OiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSk6XG4gICAgYm9vbGVhbiB7XG4gIHJldHVybiBjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSA9PSBudWxsIHx8XG4gICAgICBjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSA9PT0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdDtcbn1cbiJdfQ==