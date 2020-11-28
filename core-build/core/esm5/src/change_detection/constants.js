/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * The strategy that the default change detector uses to detect changes.
 * When set, takes effect the next time change detection is triggered.
 *
 * @publicApi
 */
export var ChangeDetectionStrategy;
(function (ChangeDetectionStrategy) {
    /**
     * Use the `CheckOnce` strategy, meaning that automatic change detection is deactivated
     * until reactivated by setting the strategy to `Default` (`CheckAlways`).
     * Change detection can still be explicitly invoked.
     * This strategy applies to all child directives and cannot be overridden.
     */
    ChangeDetectionStrategy[ChangeDetectionStrategy["OnPush"] = 0] = "OnPush";
    /**
     * Use the default `CheckAlways` strategy, in which change detection is automatic until
     * explicitly deactivated.
     */
    ChangeDetectionStrategy[ChangeDetectionStrategy["Default"] = 1] = "Default";
    /* fourth */
    ChangeDetectionStrategy[ChangeDetectionStrategy["Reactivity"] = 2] = "Reactivity";
})(ChangeDetectionStrategy || (ChangeDetectionStrategy = {}));
/**
 * Defines the possible states of the default change detector.
 * @see `ChangeDetectorRef`
 */
export var ChangeDetectorStatus;
(function (ChangeDetectorStatus) {
    /**
     * A state in which, after calling `detectChanges()`, the change detector
     * state becomes `Checked`, and must be explicitly invoked or reactivated.
     */
    ChangeDetectorStatus[ChangeDetectorStatus["CheckOnce"] = 0] = "CheckOnce";
    /**
     * A state in which change detection is skipped until the change detector mode
     * becomes `CheckOnce`.
     */
    ChangeDetectorStatus[ChangeDetectorStatus["Checked"] = 1] = "Checked";
    /**
     * A state in which change detection continues automatically until explicitly
     * deactivated.
     */
    ChangeDetectorStatus[ChangeDetectorStatus["CheckAlways"] = 2] = "CheckAlways";
    /**
     * A state in which a change detector sub tree is not a part of the main tree and
     * should be skipped.
     */
    ChangeDetectorStatus[ChangeDetectorStatus["Detached"] = 3] = "Detached";
    /**
     * Indicates that the change detector encountered an error checking a binding
     * or calling a directive lifecycle method and is now in an inconsistent state. Change
     * detectors in this state do not detect changes.
     */
    ChangeDetectorStatus[ChangeDetectorStatus["Errored"] = 4] = "Errored";
    /**
     * Indicates that the change detector has been destroyed.
     */
    ChangeDetectorStatus[ChangeDetectorStatus["Destroyed"] = 5] = "Destroyed";
})(ChangeDetectorStatus || (ChangeDetectorStatus = {}));
/**
 * Reports whether a given strategy is currently the default for change detection.
 * @param changeDetectionStrategy The strategy to check.
 * @returns True if the given strategy is the current default, false otherwise.
 * @see `ChangeDetectorStatus`
 * @see `ChangeDetectorRef`
 */
export function isDefaultChangeDetectionStrategy(changeDetectionStrategy) {
    return changeDetectionStrategy == null ||
        changeDetectionStrategy === ChangeDetectionStrategy.Default;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvY2hhbmdlX2RldGVjdGlvbi9jb25zdGFudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBR0g7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQU4sSUFBWSx1QkFnQlg7QUFoQkQsV0FBWSx1QkFBdUI7SUFDakM7Ozs7O09BS0c7SUFDSCx5RUFBVSxDQUFBO0lBRVY7OztPQUdHO0lBQ0gsMkVBQVcsQ0FBQTtJQUNYLFlBQVk7SUFDWixpRkFBYyxDQUFBO0FBQ2hCLENBQUMsRUFoQlcsdUJBQXVCLEtBQXZCLHVCQUF1QixRQWdCbEM7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLENBQU4sSUFBWSxvQkFvQ1g7QUFwQ0QsV0FBWSxvQkFBb0I7SUFDOUI7OztPQUdHO0lBQ0gseUVBQVMsQ0FBQTtJQUVUOzs7T0FHRztJQUNILHFFQUFPLENBQUE7SUFFUDs7O09BR0c7SUFDSCw2RUFBVyxDQUFBO0lBRVg7OztPQUdHO0lBQ0gsdUVBQVEsQ0FBQTtJQUVSOzs7O09BSUc7SUFDSCxxRUFBTyxDQUFBO0lBRVA7O09BRUc7SUFDSCx5RUFBUyxDQUFBO0FBQ1gsQ0FBQyxFQXBDVyxvQkFBb0IsS0FBcEIsb0JBQW9CLFFBb0MvQjtBQUVEOzs7Ozs7R0FNRztBQUNILE1BQU0sVUFBVSxnQ0FBZ0MsQ0FBQyx1QkFBZ0Q7SUFFL0YsT0FBTyx1QkFBdUIsSUFBSSxJQUFJO1FBQ2xDLHVCQUF1QixLQUFLLHVCQUF1QixDQUFDLE9BQU8sQ0FBQztBQUNsRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5cbi8qKlxuICogVGhlIHN0cmF0ZWd5IHRoYXQgdGhlIGRlZmF1bHQgY2hhbmdlIGRldGVjdG9yIHVzZXMgdG8gZGV0ZWN0IGNoYW5nZXMuXG4gKiBXaGVuIHNldCwgdGFrZXMgZWZmZWN0IHRoZSBuZXh0IHRpbWUgY2hhbmdlIGRldGVjdGlvbiBpcyB0cmlnZ2VyZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSB7XG4gIC8qKlxuICAgKiBVc2UgdGhlIGBDaGVja09uY2VgIHN0cmF0ZWd5LCBtZWFuaW5nIHRoYXQgYXV0b21hdGljIGNoYW5nZSBkZXRlY3Rpb24gaXMgZGVhY3RpdmF0ZWRcbiAgICogdW50aWwgcmVhY3RpdmF0ZWQgYnkgc2V0dGluZyB0aGUgc3RyYXRlZ3kgdG8gYERlZmF1bHRgIChgQ2hlY2tBbHdheXNgKS5cbiAgICogQ2hhbmdlIGRldGVjdGlvbiBjYW4gc3RpbGwgYmUgZXhwbGljaXRseSBpbnZva2VkLlxuICAgKiBUaGlzIHN0cmF0ZWd5IGFwcGxpZXMgdG8gYWxsIGNoaWxkIGRpcmVjdGl2ZXMgYW5kIGNhbm5vdCBiZSBvdmVycmlkZGVuLlxuICAgKi9cbiAgT25QdXNoID0gMCxcblxuICAvKipcbiAgICogVXNlIHRoZSBkZWZhdWx0IGBDaGVja0Fsd2F5c2Agc3RyYXRlZ3ksIGluIHdoaWNoIGNoYW5nZSBkZXRlY3Rpb24gaXMgYXV0b21hdGljIHVudGlsXG4gICAqIGV4cGxpY2l0bHkgZGVhY3RpdmF0ZWQuXG4gICAqL1xuICBEZWZhdWx0ID0gMSxcbiAgLyogZm91cnRoICovXG4gIFJlYWN0aXZpdHkgPSAyXG59XG5cbi8qKlxuICogRGVmaW5lcyB0aGUgcG9zc2libGUgc3RhdGVzIG9mIHRoZSBkZWZhdWx0IGNoYW5nZSBkZXRlY3Rvci5cbiAqIEBzZWUgYENoYW5nZURldGVjdG9yUmVmYFxuICovXG5leHBvcnQgZW51bSBDaGFuZ2VEZXRlY3RvclN0YXR1cyB7XG4gIC8qKlxuICAgKiBBIHN0YXRlIGluIHdoaWNoLCBhZnRlciBjYWxsaW5nIGBkZXRlY3RDaGFuZ2VzKClgLCB0aGUgY2hhbmdlIGRldGVjdG9yXG4gICAqIHN0YXRlIGJlY29tZXMgYENoZWNrZWRgLCBhbmQgbXVzdCBiZSBleHBsaWNpdGx5IGludm9rZWQgb3IgcmVhY3RpdmF0ZWQuXG4gICAqL1xuICBDaGVja09uY2UsXG5cbiAgLyoqXG4gICAqIEEgc3RhdGUgaW4gd2hpY2ggY2hhbmdlIGRldGVjdGlvbiBpcyBza2lwcGVkIHVudGlsIHRoZSBjaGFuZ2UgZGV0ZWN0b3IgbW9kZVxuICAgKiBiZWNvbWVzIGBDaGVja09uY2VgLlxuICAgKi9cbiAgQ2hlY2tlZCxcblxuICAvKipcbiAgICogQSBzdGF0ZSBpbiB3aGljaCBjaGFuZ2UgZGV0ZWN0aW9uIGNvbnRpbnVlcyBhdXRvbWF0aWNhbGx5IHVudGlsIGV4cGxpY2l0bHlcbiAgICogZGVhY3RpdmF0ZWQuXG4gICAqL1xuICBDaGVja0Fsd2F5cyxcblxuICAvKipcbiAgICogQSBzdGF0ZSBpbiB3aGljaCBhIGNoYW5nZSBkZXRlY3RvciBzdWIgdHJlZSBpcyBub3QgYSBwYXJ0IG9mIHRoZSBtYWluIHRyZWUgYW5kXG4gICAqIHNob3VsZCBiZSBza2lwcGVkLlxuICAgKi9cbiAgRGV0YWNoZWQsXG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyB0aGF0IHRoZSBjaGFuZ2UgZGV0ZWN0b3IgZW5jb3VudGVyZWQgYW4gZXJyb3IgY2hlY2tpbmcgYSBiaW5kaW5nXG4gICAqIG9yIGNhbGxpbmcgYSBkaXJlY3RpdmUgbGlmZWN5Y2xlIG1ldGhvZCBhbmQgaXMgbm93IGluIGFuIGluY29uc2lzdGVudCBzdGF0ZS4gQ2hhbmdlXG4gICAqIGRldGVjdG9ycyBpbiB0aGlzIHN0YXRlIGRvIG5vdCBkZXRlY3QgY2hhbmdlcy5cbiAgICovXG4gIEVycm9yZWQsXG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyB0aGF0IHRoZSBjaGFuZ2UgZGV0ZWN0b3IgaGFzIGJlZW4gZGVzdHJveWVkLlxuICAgKi9cbiAgRGVzdHJveWVkLFxufVxuXG4vKipcbiAqIFJlcG9ydHMgd2hldGhlciBhIGdpdmVuIHN0cmF0ZWd5IGlzIGN1cnJlbnRseSB0aGUgZGVmYXVsdCBmb3IgY2hhbmdlIGRldGVjdGlvbi5cbiAqIEBwYXJhbSBjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSBUaGUgc3RyYXRlZ3kgdG8gY2hlY2suXG4gKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBnaXZlbiBzdHJhdGVneSBpcyB0aGUgY3VycmVudCBkZWZhdWx0LCBmYWxzZSBvdGhlcndpc2UuXG4gKiBAc2VlIGBDaGFuZ2VEZXRlY3RvclN0YXR1c2BcbiAqIEBzZWUgYENoYW5nZURldGVjdG9yUmVmYFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNEZWZhdWx0Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3koY2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3k6IENoYW5nZURldGVjdGlvblN0cmF0ZWd5KTpcbiAgICBib29sZWFuIHtcbiAgcmV0dXJuIGNoYW5nZURldGVjdGlvblN0cmF0ZWd5ID09IG51bGwgfHxcbiAgICAgIGNoYW5nZURldGVjdGlvblN0cmF0ZWd5ID09PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0O1xufVxuIl19