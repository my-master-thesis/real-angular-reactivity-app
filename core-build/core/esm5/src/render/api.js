/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InjectionToken } from '../di/injection_token';
import { injectRenderer2 as render3InjectRenderer2 } from '../render3/view_engine_compatibility';
import { noop } from '../util/noop';
export var Renderer2Interceptor = new InjectionToken('Renderer2Interceptor');
/**
 * Creates and initializes a custom renderer that implements the `Renderer2` base class.
 *
 * @publicApi
 */
var RendererFactory2 = /** @class */ (function () {
    function RendererFactory2() {
    }
    return RendererFactory2;
}());
export { RendererFactory2 };
/**
 * Flags for renderer-specific style modifiers.
 * @publicApi
 */
export var RendererStyleFlags2;
(function (RendererStyleFlags2) {
    // TODO(misko): This needs to be refactored into a separate file so that it can be imported from
    // `node_manipulation.ts` Currently doing the import cause resolution order to change and fails
    // the tests. The work around is to have hard coded value in `node_manipulation.ts` for now.
    /**
     * Marks a style as important.
     */
    RendererStyleFlags2[RendererStyleFlags2["Important"] = 1] = "Important";
    /**
     * Marks a style as using dash case naming (this-is-dash-case).
     */
    RendererStyleFlags2[RendererStyleFlags2["DashCase"] = 2] = "DashCase";
})(RendererStyleFlags2 || (RendererStyleFlags2 = {}));
/**
 * Extend this base class to implement custom rendering. By default, Angular
 * renders a template into DOM. You can use custom rendering to intercept
 * rendering calls, or to render to something other than DOM.
 *
 * Create your custom renderer using `RendererFactory2`.
 *
 * Use a custom renderer to bypass Angular's templating and
 * make custom UI changes that can't be expressed declaratively.
 * For example if you need to set a property or an attribute whose name is
 * not statically known, use the `setProperty()` or
 * `setAttribute()` method.
 *
 * @publicApi
 */
var Renderer2 = /** @class */ (function () {
    function Renderer2() {
    }
    /**
     * @internal
     * @nocollapse
     */
    Renderer2.__NG_ELEMENT_ID__ = function () { return SWITCH_RENDERER2_FACTORY(); };
    return Renderer2;
}());
export { Renderer2 };
export var SWITCH_RENDERER2_FACTORY__POST_R3__ = render3InjectRenderer2;
var SWITCH_RENDERER2_FACTORY__PRE_R3__ = noop;
var SWITCH_RENDERER2_FACTORY = SWITCH_RENDERER2_FACTORY__PRE_R3__;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyL2FwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFckQsT0FBTyxFQUFDLGVBQWUsSUFBSSxzQkFBc0IsRUFBQyxNQUFNLHNDQUFzQyxDQUFDO0FBQy9GLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFHbEMsTUFBTSxDQUFDLElBQU0sb0JBQW9CLEdBQUcsSUFBSSxjQUFjLENBQWMsc0JBQXNCLENBQUMsQ0FBQztBQW1DNUY7Ozs7R0FJRztBQUNIO0lBQUE7SUFxQkEsQ0FBQztJQUFELHVCQUFDO0FBQUQsQ0FBQyxBQXJCRCxJQXFCQzs7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLENBQU4sSUFBWSxtQkFZWDtBQVpELFdBQVksbUJBQW1CO0lBQzdCLGdHQUFnRztJQUNoRywrRkFBK0Y7SUFDL0YsNEZBQTRGO0lBQzVGOztPQUVHO0lBQ0gsdUVBQWtCLENBQUE7SUFDbEI7O09BRUc7SUFDSCxxRUFBaUIsQ0FBQTtBQUNuQixDQUFDLEVBWlcsbUJBQW1CLEtBQW5CLG1CQUFtQixRQVk5QjtBQUVEOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBQ0g7SUFBQTtJQTBLQSxDQUFDO0lBTEM7OztPQUdHO0lBQ0ksMkJBQWlCLEdBQW9CLGNBQU0sT0FBQSx3QkFBd0IsRUFBRSxFQUExQixDQUEwQixDQUFDO0lBQy9FLGdCQUFDO0NBQUEsQUExS0QsSUEwS0M7U0ExS3FCLFNBQVM7QUE2Sy9CLE1BQU0sQ0FBQyxJQUFNLG1DQUFtQyxHQUFHLHNCQUFzQixDQUFDO0FBQzFFLElBQU0sa0NBQWtDLEdBQUcsSUFBSSxDQUFDO0FBQ2hELElBQU0sd0JBQXdCLEdBQWtDLGtDQUFrQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGlvblRva2VufSBmcm9tICcuLi9kaS9pbmplY3Rpb25fdG9rZW4nO1xuaW1wb3J0IHtWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnLi4vbWV0YWRhdGEvdmlldyc7XG5pbXBvcnQge2luamVjdFJlbmRlcmVyMiBhcyByZW5kZXIzSW5qZWN0UmVuZGVyZXIyfSBmcm9tICcuLi9yZW5kZXIzL3ZpZXdfZW5naW5lX2NvbXBhdGliaWxpdHknO1xuaW1wb3J0IHtub29wfSBmcm9tICcuLi91dGlsL25vb3AnO1xuXG5cbmV4cG9ydCBjb25zdCBSZW5kZXJlcjJJbnRlcmNlcHRvciA9IG5ldyBJbmplY3Rpb25Ub2tlbjxSZW5kZXJlcjJbXT4oJ1JlbmRlcmVyMkludGVyY2VwdG9yJyk7XG5cbi8qKlxuICogVXNlZCBieSBgUmVuZGVyZXJGYWN0b3J5MmAgdG8gYXNzb2NpYXRlIGN1c3RvbSByZW5kZXJpbmcgZGF0YSBhbmQgc3R5bGVzXG4gKiB3aXRoIGEgcmVuZGVyaW5nIGltcGxlbWVudGF0aW9uLlxuICogIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZW5kZXJlclR5cGUyIHtcbiAgLyoqXG4gICAqIEEgdW5pcXVlIGlkZW50aWZ5aW5nIHN0cmluZyBmb3IgdGhlIG5ldyByZW5kZXJlciwgdXNlZCB3aGVuIGNyZWF0aW5nXG4gICAqIHVuaXF1ZSBzdHlsZXMgZm9yIGVuY2Fwc3VsYXRpb24uXG4gICAqL1xuICBpZDogc3RyaW5nO1xuICAvKipcbiAgICogVGhlIHZpZXcgZW5jYXBzdWxhdGlvbiB0eXBlLCB3aGljaCBkZXRlcm1pbmVzIGhvdyBzdHlsZXMgYXJlIGFwcGxpZWQgdG9cbiAgICogRE9NIGVsZW1lbnRzLiBPbmUgb2ZcbiAgICogLSBgRW11bGF0ZWRgIChkZWZhdWx0KTogRW11bGF0ZSBuYXRpdmUgc2NvcGluZyBvZiBzdHlsZXMuXG4gICAqIC0gYE5hdGl2ZWA6IFVzZSB0aGUgbmF0aXZlIGVuY2Fwc3VsYXRpb24gbWVjaGFuaXNtIG9mIHRoZSByZW5kZXJlci5cbiAgICogLSBgU2hhZG93RG9tYDogVXNlIG1vZGVybiBbU2hhZG93XG4gICAqIERPTV0oaHR0cHM6Ly93M2MuZ2l0aHViLmlvL3dlYmNvbXBvbmVudHMvc3BlYy9zaGFkb3cvKSBhbmRcbiAgICogY3JlYXRlIGEgU2hhZG93Um9vdCBmb3IgY29tcG9uZW50J3MgaG9zdCBlbGVtZW50LlxuICAgKiAtIGBOb25lYDogRG8gbm90IHByb3ZpZGUgYW55IHRlbXBsYXRlIG9yIHN0eWxlIGVuY2Fwc3VsYXRpb24uXG4gICAqL1xuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbjtcbiAgLyoqXG4gICAqIERlZmluZXMgQ1NTIHN0eWxlcyB0byBiZSBzdG9yZWQgb24gYSByZW5kZXJlciBpbnN0YW5jZS5cbiAgICovXG4gIHN0eWxlczogKHN0cmluZ3xhbnlbXSlbXTtcbiAgLyoqXG4gICAqIERlZmluZXMgYXJiaXRyYXJ5IGRldmVsb3Blci1kZWZpbmVkIGRhdGEgdG8gYmUgc3RvcmVkIG9uIGEgcmVuZGVyZXIgaW5zdGFuY2UuXG4gICAqIFRoaXMgaXMgdXNlZnVsIGZvciByZW5kZXJlcnMgdGhhdCBkZWxlZ2F0ZSB0byBvdGhlciByZW5kZXJlcnMuXG4gICAqL1xuICBkYXRhOiB7W2tpbmQ6IHN0cmluZ106IGFueX07XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhbmQgaW5pdGlhbGl6ZXMgYSBjdXN0b20gcmVuZGVyZXIgdGhhdCBpbXBsZW1lbnRzIHRoZSBgUmVuZGVyZXIyYCBiYXNlIGNsYXNzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlbmRlcmVyRmFjdG9yeTIge1xuICAvKipcbiAgICogQ3JlYXRlcyBhbmQgaW5pdGlhbGl6ZXMgYSBjdXN0b20gcmVuZGVyZXIgZm9yIGEgaG9zdCBET00gZWxlbWVudC5cbiAgICogQHBhcmFtIGhvc3RFbGVtZW50IFRoZSBlbGVtZW50IHRvIHJlbmRlci5cbiAgICogQHBhcmFtIHR5cGUgVGhlIGJhc2UgY2xhc3MgdG8gaW1wbGVtZW50LlxuICAgKiBAcmV0dXJucyBUaGUgbmV3IGN1c3RvbSByZW5kZXJlciBpbnN0YW5jZS5cbiAgICovXG4gIGFic3RyYWN0IGNyZWF0ZVJlbmRlcmVyKGhvc3RFbGVtZW50OiBhbnksIHR5cGU6IFJlbmRlcmVyVHlwZTJ8bnVsbCk6IFJlbmRlcmVyMjtcbiAgLyoqXG4gICAqIEEgY2FsbGJhY2sgaW52b2tlZCB3aGVuIHJlbmRlcmluZyBoYXMgYmVndW4uXG4gICAqL1xuICBhYnN0cmFjdCBiZWdpbj8oKTogdm9pZDtcbiAgLyoqXG4gICAqIEEgY2FsbGJhY2sgaW52b2tlZCB3aGVuIHJlbmRlcmluZyBoYXMgY29tcGxldGVkLlxuICAgKi9cbiAgYWJzdHJhY3QgZW5kPygpOiB2b2lkO1xuICAvKipcbiAgICogVXNlIHdpdGggYW5pbWF0aW9ucyB0ZXN0LW9ubHkgbW9kZS4gTm90aWZpZXMgdGhlIHRlc3Qgd2hlbiByZW5kZXJpbmcgaGFzIGNvbXBsZXRlZC5cbiAgICogQHJldHVybnMgVGhlIGFzeW5jaHJvbm91cyByZXN1bHQgb2YgdGhlIGRldmVsb3Blci1kZWZpbmVkIGZ1bmN0aW9uLlxuICAgKi9cbiAgYWJzdHJhY3Qgd2hlblJlbmRlcmluZ0RvbmU/KCk6IFByb21pc2U8YW55Pjtcbn1cblxuLyoqXG4gKiBGbGFncyBmb3IgcmVuZGVyZXItc3BlY2lmaWMgc3R5bGUgbW9kaWZpZXJzLlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBSZW5kZXJlclN0eWxlRmxhZ3MyIHtcbiAgLy8gVE9ETyhtaXNrbyk6IFRoaXMgbmVlZHMgdG8gYmUgcmVmYWN0b3JlZCBpbnRvIGEgc2VwYXJhdGUgZmlsZSBzbyB0aGF0IGl0IGNhbiBiZSBpbXBvcnRlZCBmcm9tXG4gIC8vIGBub2RlX21hbmlwdWxhdGlvbi50c2AgQ3VycmVudGx5IGRvaW5nIHRoZSBpbXBvcnQgY2F1c2UgcmVzb2x1dGlvbiBvcmRlciB0byBjaGFuZ2UgYW5kIGZhaWxzXG4gIC8vIHRoZSB0ZXN0cy4gVGhlIHdvcmsgYXJvdW5kIGlzIHRvIGhhdmUgaGFyZCBjb2RlZCB2YWx1ZSBpbiBgbm9kZV9tYW5pcHVsYXRpb24udHNgIGZvciBub3cuXG4gIC8qKlxuICAgKiBNYXJrcyBhIHN0eWxlIGFzIGltcG9ydGFudC5cbiAgICovXG4gIEltcG9ydGFudCA9IDEgPDwgMCxcbiAgLyoqXG4gICAqIE1hcmtzIGEgc3R5bGUgYXMgdXNpbmcgZGFzaCBjYXNlIG5hbWluZyAodGhpcy1pcy1kYXNoLWNhc2UpLlxuICAgKi9cbiAgRGFzaENhc2UgPSAxIDw8IDFcbn1cblxuLyoqXG4gKiBFeHRlbmQgdGhpcyBiYXNlIGNsYXNzIHRvIGltcGxlbWVudCBjdXN0b20gcmVuZGVyaW5nLiBCeSBkZWZhdWx0LCBBbmd1bGFyXG4gKiByZW5kZXJzIGEgdGVtcGxhdGUgaW50byBET00uIFlvdSBjYW4gdXNlIGN1c3RvbSByZW5kZXJpbmcgdG8gaW50ZXJjZXB0XG4gKiByZW5kZXJpbmcgY2FsbHMsIG9yIHRvIHJlbmRlciB0byBzb21ldGhpbmcgb3RoZXIgdGhhbiBET00uXG4gKlxuICogQ3JlYXRlIHlvdXIgY3VzdG9tIHJlbmRlcmVyIHVzaW5nIGBSZW5kZXJlckZhY3RvcnkyYC5cbiAqXG4gKiBVc2UgYSBjdXN0b20gcmVuZGVyZXIgdG8gYnlwYXNzIEFuZ3VsYXIncyB0ZW1wbGF0aW5nIGFuZFxuICogbWFrZSBjdXN0b20gVUkgY2hhbmdlcyB0aGF0IGNhbid0IGJlIGV4cHJlc3NlZCBkZWNsYXJhdGl2ZWx5LlxuICogRm9yIGV4YW1wbGUgaWYgeW91IG5lZWQgdG8gc2V0IGEgcHJvcGVydHkgb3IgYW4gYXR0cmlidXRlIHdob3NlIG5hbWUgaXNcbiAqIG5vdCBzdGF0aWNhbGx5IGtub3duLCB1c2UgdGhlIGBzZXRQcm9wZXJ0eSgpYCBvclxuICogYHNldEF0dHJpYnV0ZSgpYCBtZXRob2QuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUmVuZGVyZXIyIHtcbiAgLyoqXG4gICAqIFVzZSB0byBzdG9yZSBhcmJpdHJhcnkgZGV2ZWxvcGVyLWRlZmluZWQgZGF0YSBvbiBhIHJlbmRlcmVyIGluc3RhbmNlLFxuICAgKiBhcyBhbiBvYmplY3QgY29udGFpbmluZyBrZXktdmFsdWUgcGFpcnMuXG4gICAqIFRoaXMgaXMgdXNlZnVsIGZvciByZW5kZXJlcnMgdGhhdCBkZWxlZ2F0ZSB0byBvdGhlciByZW5kZXJlcnMuXG4gICAqL1xuICBhYnN0cmFjdCBnZXQgZGF0YSgpOiB7W2tleTogc3RyaW5nXTogYW55fTtcblxuICAvKipcbiAgICogSW1wbGVtZW50IHRoaXMgY2FsbGJhY2sgdG8gZGVzdHJveSB0aGUgcmVuZGVyZXIgb3IgdGhlIGhvc3QgZWxlbWVudC5cbiAgICovXG4gIGFic3RyYWN0IGRlc3Ryb3koKTogdm9pZDtcbiAgLyoqXG4gICAqIEltcGxlbWVudCB0aGlzIGNhbGxiYWNrIHRvIGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgaG9zdCBlbGVtZW50LlxuICAgKiBAcGFyYW0gbmFtZSBBbiBpZGVudGlmeWluZyBuYW1lIGZvciB0aGUgbmV3IGVsZW1lbnQsIHVuaXF1ZSB3aXRoaW4gdGhlIG5hbWVzcGFjZS5cbiAgICogQHBhcmFtIG5hbWVzcGFjZSBUaGUgbmFtZXNwYWNlIGZvciB0aGUgbmV3IGVsZW1lbnQuXG4gICAqIEByZXR1cm5zIFRoZSBuZXcgZWxlbWVudC5cbiAgICovXG4gIGFic3RyYWN0IGNyZWF0ZUVsZW1lbnQobmFtZTogc3RyaW5nLCBuYW1lc3BhY2U/OiBzdHJpbmd8bnVsbCk6IGFueTtcbiAgLyoqXG4gICAqIEltcGxlbWVudCB0aGlzIGNhbGxiYWNrIHRvIGFkZCBhIGNvbW1lbnQgdG8gdGhlIERPTSBvZiB0aGUgaG9zdCBlbGVtZW50LlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIGNvbW1lbnQgdGV4dC5cbiAgICogQHJldHVybnMgVGhlIG1vZGlmaWVkIGVsZW1lbnQuXG4gICAqL1xuICBhYnN0cmFjdCBjcmVhdGVDb21tZW50KHZhbHVlOiBzdHJpbmcpOiBhbnk7XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudCB0aGlzIGNhbGxiYWNrIHRvIGFkZCB0ZXh0IHRvIHRoZSBET00gb2YgdGhlIGhvc3QgZWxlbWVudC5cbiAgICogQHBhcmFtIHZhbHVlIFRoZSB0ZXh0IHN0cmluZy5cbiAgICogQHJldHVybnMgVGhlIG1vZGlmaWVkIGVsZW1lbnQuXG4gICAqL1xuICBhYnN0cmFjdCBjcmVhdGVUZXh0KHZhbHVlOiBzdHJpbmcpOiBhbnk7XG4gIC8qKlxuICAgKiBJZiBudWxsIG9yIHVuZGVmaW5lZCwgdGhlIHZpZXcgZW5naW5lIHdvbid0IGNhbGwgaXQuXG4gICAqIFRoaXMgaXMgdXNlZCBhcyBhIHBlcmZvcm1hbmNlIG9wdGltaXphdGlvbiBmb3IgcHJvZHVjdGlvbiBtb2RlLlxuICAgKi9cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIGRlc3Ryb3lOb2RlICE6ICgobm9kZTogYW55KSA9PiB2b2lkKSB8IG51bGw7XG4gIC8qKlxuICAgKiBBcHBlbmRzIGEgY2hpbGQgdG8gYSBnaXZlbiBwYXJlbnQgbm9kZSBpbiB0aGUgaG9zdCBlbGVtZW50IERPTS5cbiAgICogQHBhcmFtIHBhcmVudCBUaGUgcGFyZW50IG5vZGUuXG4gICAqIEBwYXJhbSBuZXdDaGlsZCBUaGUgbmV3IGNoaWxkIG5vZGUuXG4gICAqL1xuICBhYnN0cmFjdCBhcHBlbmRDaGlsZChwYXJlbnQ6IGFueSwgbmV3Q2hpbGQ6IGFueSk6IHZvaWQ7XG4gIC8qKlxuICAgKiBJbXBsZW1lbnQgdGhpcyBjYWxsYmFjayB0byBpbnNlcnQgYSBjaGlsZCBub2RlIGF0IGEgZ2l2ZW4gcG9zaXRpb24gaW4gYSBwYXJlbnQgbm9kZVxuICAgKiBpbiB0aGUgaG9zdCBlbGVtZW50IERPTS5cbiAgICogQHBhcmFtIHBhcmVudCBUaGUgcGFyZW50IG5vZGUuXG4gICAqIEBwYXJhbSBuZXdDaGlsZCBUaGUgbmV3IGNoaWxkIG5vZGVzLlxuICAgKiBAcGFyYW0gcmVmQ2hpbGQgVGhlIGV4aXN0aW5nIGNoaWxkIG5vZGUgdGhhdCBzaG91bGQgcHJlY2VkZSB0aGUgbmV3IG5vZGUuXG4gICAqL1xuICBhYnN0cmFjdCBpbnNlcnRCZWZvcmUocGFyZW50OiBhbnksIG5ld0NoaWxkOiBhbnksIHJlZkNoaWxkOiBhbnkpOiB2b2lkO1xuICAvKipcbiAgICogSW1wbGVtZW50IHRoaXMgY2FsbGJhY2sgdG8gcmVtb3ZlIGEgY2hpbGQgbm9kZSBmcm9tIHRoZSBob3N0IGVsZW1lbnQncyBET00uXG4gICAqIEBwYXJhbSBwYXJlbnQgVGhlIHBhcmVudCBub2RlLlxuICAgKiBAcGFyYW0gb2xkQ2hpbGQgVGhlIGNoaWxkIG5vZGUgdG8gcmVtb3ZlLlxuICAgKiBAcGFyYW0gaXNIb3N0RWxlbWVudCBPcHRpb25hbGx5IHNpZ25hbCB0byB0aGUgcmVuZGVyZXIgd2hldGhlciB0aGlzIGVsZW1lbnQgaXMgYSBob3N0IGVsZW1lbnRcbiAgICogb3Igbm90XG4gICAqL1xuICBhYnN0cmFjdCByZW1vdmVDaGlsZChwYXJlbnQ6IGFueSwgb2xkQ2hpbGQ6IGFueSwgaXNIb3N0RWxlbWVudD86IGJvb2xlYW4pOiB2b2lkO1xuICAvKipcbiAgICogSW1wbGVtZW50IHRoaXMgY2FsbGJhY2sgdG8gcHJlcGFyZSBhbiBlbGVtZW50IHRvIGJlIGJvb3RzdHJhcHBlZFxuICAgKiBhcyBhIHJvb3QgZWxlbWVudCwgYW5kIHJldHVybiB0aGUgZWxlbWVudCBpbnN0YW5jZS5cbiAgICogQHBhcmFtIHNlbGVjdG9yT3JOb2RlIFRoZSBET00gZWxlbWVudC5cbiAgICogQHBhcmFtIHByZXNlcnZlQ29udGVudCBXaGV0aGVyIHRoZSBjb250ZW50cyBvZiB0aGUgcm9vdCBlbGVtZW50XG4gICAqIHNob3VsZCBiZSBwcmVzZXJ2ZWQsIG9yIGNsZWFyZWQgdXBvbiBib290c3RyYXAgKGRlZmF1bHQgYmVoYXZpb3IpLlxuICAgKiBVc2Ugd2l0aCBgVmlld0VuY2Fwc3VsYXRpb24uU2hhZG93RG9tYCB0byBhbGxvdyBzaW1wbGUgbmF0aXZlXG4gICAqIGNvbnRlbnQgcHJvamVjdGlvbiB2aWEgYDxzbG90PmAgZWxlbWVudHMuXG4gICAqIEByZXR1cm5zIFRoZSByb290IGVsZW1lbnQuXG4gICAqL1xuICBhYnN0cmFjdCBzZWxlY3RSb290RWxlbWVudChzZWxlY3Rvck9yTm9kZTogc3RyaW5nfGFueSwgcHJlc2VydmVDb250ZW50PzogYm9vbGVhbik6IGFueTtcbiAgLyoqXG4gICAqIEltcGxlbWVudCB0aGlzIGNhbGxiYWNrIHRvIGdldCB0aGUgcGFyZW50IG9mIGEgZ2l2ZW4gbm9kZVxuICAgKiBpbiB0aGUgaG9zdCBlbGVtZW50J3MgRE9NLlxuICAgKiBAcGFyYW0gbm9kZSBUaGUgY2hpbGQgbm9kZSB0byBxdWVyeS5cbiAgICogQHJldHVybnMgVGhlIHBhcmVudCBub2RlLCBvciBudWxsIGlmIHRoZXJlIGlzIG5vIHBhcmVudC5cbiAgICogRm9yIFdlYldvcmtlcnMsIGFsd2F5cyByZXR1cm5zIHRydWUuXG4gICAqIFRoaXMgaXMgYmVjYXVzZSB0aGUgY2hlY2sgaXMgc3luY2hyb25vdXMsXG4gICAqIGFuZCB0aGUgY2FsbGVyIGNhbid0IHJlbHkgb24gY2hlY2tpbmcgZm9yIG51bGwuXG4gICAqL1xuICBhYnN0cmFjdCBwYXJlbnROb2RlKG5vZGU6IGFueSk6IGFueTtcbiAgLyoqXG4gICAqIEltcGxlbWVudCB0aGlzIGNhbGxiYWNrIHRvIGdldCB0aGUgbmV4dCBzaWJsaW5nIG5vZGUgb2YgYSBnaXZlbiBub2RlXG4gICAqIGluIHRoZSBob3N0IGVsZW1lbnQncyBET00uXG4gICAqIEByZXR1cm5zIFRoZSBzaWJsaW5nIG5vZGUsIG9yIG51bGwgaWYgdGhlcmUgaXMgbm8gc2libGluZy5cbiAgICogRm9yIFdlYldvcmtlcnMsIGFsd2F5cyByZXR1cm5zIGEgdmFsdWUuXG4gICAqIFRoaXMgaXMgYmVjYXVzZSB0aGUgY2hlY2sgaXMgc3luY2hyb25vdXMsXG4gICAqIGFuZCB0aGUgY2FsbGVyIGNhbid0IHJlbHkgb24gY2hlY2tpbmcgZm9yIG51bGwuXG4gICAqL1xuICBhYnN0cmFjdCBuZXh0U2libGluZyhub2RlOiBhbnkpOiBhbnk7XG4gIC8qKlxuICAgKiBJbXBsZW1lbnQgdGhpcyBjYWxsYmFjayB0byBzZXQgYW4gYXR0cmlidXRlIHZhbHVlIGZvciBhbiBlbGVtZW50IGluIHRoZSBET00uXG4gICAqIEBwYXJhbSBlbCBUaGUgZWxlbWVudC5cbiAgICogQHBhcmFtIG5hbWUgVGhlIGF0dHJpYnV0ZSBuYW1lLlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIG5ldyB2YWx1ZS5cbiAgICogQHBhcmFtIG5hbWVzcGFjZSBUaGUgbmFtZXNwYWNlLlxuICAgKi9cbiAgYWJzdHJhY3Qgc2V0QXR0cmlidXRlKGVsOiBhbnksIG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgbmFtZXNwYWNlPzogc3RyaW5nfG51bGwpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnQgdGhpcyBjYWxsYmFjayB0byByZW1vdmUgYW4gYXR0cmlidXRlIGZyb20gYW4gZWxlbWVudCBpbiB0aGUgRE9NLlxuICAgKiBAcGFyYW0gZWwgVGhlIGVsZW1lbnQuXG4gICAqIEBwYXJhbSBuYW1lIFRoZSBhdHRyaWJ1dGUgbmFtZS5cbiAgICogQHBhcmFtIG5hbWVzcGFjZSBUaGUgbmFtZXNwYWNlLlxuICAgKi9cbiAgYWJzdHJhY3QgcmVtb3ZlQXR0cmlidXRlKGVsOiBhbnksIG5hbWU6IHN0cmluZywgbmFtZXNwYWNlPzogc3RyaW5nfG51bGwpOiB2b2lkO1xuICAvKipcbiAgICogSW1wbGVtZW50IHRoaXMgY2FsbGJhY2sgdG8gYWRkIGEgY2xhc3MgdG8gYW4gZWxlbWVudCBpbiB0aGUgRE9NLlxuICAgKiBAcGFyYW0gZWwgVGhlIGVsZW1lbnQuXG4gICAqIEBwYXJhbSBuYW1lIFRoZSBjbGFzcyBuYW1lLlxuICAgKi9cbiAgYWJzdHJhY3QgYWRkQ2xhc3MoZWw6IGFueSwgbmFtZTogc3RyaW5nKTogdm9pZDtcblxuICAvKipcbiAgICogSW1wbGVtZW50IHRoaXMgY2FsbGJhY2sgdG8gcmVtb3ZlIGEgY2xhc3MgZnJvbSBhbiBlbGVtZW50IGluIHRoZSBET00uXG4gICAqIEBwYXJhbSBlbCBUaGUgZWxlbWVudC5cbiAgICogQHBhcmFtIG5hbWUgVGhlIGNsYXNzIG5hbWUuXG4gICAqL1xuICBhYnN0cmFjdCByZW1vdmVDbGFzcyhlbDogYW55LCBuYW1lOiBzdHJpbmcpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnQgdGhpcyBjYWxsYmFjayB0byBzZXQgYSBDU1Mgc3R5bGUgZm9yIGFuIGVsZW1lbnQgaW4gdGhlIERPTS5cbiAgICogQHBhcmFtIGVsIFRoZSBlbGVtZW50LlxuICAgKiBAcGFyYW0gc3R5bGUgVGhlIG5hbWUgb2YgdGhlIHN0eWxlLlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIG5ldyB2YWx1ZS5cbiAgICogQHBhcmFtIGZsYWdzIEZsYWdzIGZvciBzdHlsZSB2YXJpYXRpb25zLiBObyBmbGFncyBhcmUgc2V0IGJ5IGRlZmF1bHQuXG4gICAqL1xuICBhYnN0cmFjdCBzZXRTdHlsZShlbDogYW55LCBzdHlsZTogc3RyaW5nLCB2YWx1ZTogYW55LCBmbGFncz86IFJlbmRlcmVyU3R5bGVGbGFnczIpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnQgdGhpcyBjYWxsYmFjayB0byByZW1vdmUgdGhlIHZhbHVlIGZyb20gYSBDU1Mgc3R5bGUgZm9yIGFuIGVsZW1lbnQgaW4gdGhlIERPTS5cbiAgICogQHBhcmFtIGVsIFRoZSBlbGVtZW50LlxuICAgKiBAcGFyYW0gc3R5bGUgVGhlIG5hbWUgb2YgdGhlIHN0eWxlLlxuICAgKiBAcGFyYW0gZmxhZ3MgRmxhZ3MgZm9yIHN0eWxlIHZhcmlhdGlvbnMgdG8gcmVtb3ZlLCBpZiBzZXQuID8/P1xuICAgKi9cbiAgYWJzdHJhY3QgcmVtb3ZlU3R5bGUoZWw6IGFueSwgc3R5bGU6IHN0cmluZywgZmxhZ3M/OiBSZW5kZXJlclN0eWxlRmxhZ3MyKTogdm9pZDtcblxuICAvKipcbiAgICogSW1wbGVtZW50IHRoaXMgY2FsbGJhY2sgdG8gc2V0IHRoZSB2YWx1ZSBvZiBhIHByb3BlcnR5IG9mIGFuIGVsZW1lbnQgaW4gdGhlIERPTS5cbiAgICogQHBhcmFtIGVsIFRoZSBlbGVtZW50LlxuICAgKiBAcGFyYW0gbmFtZSBUaGUgcHJvcGVydHkgbmFtZS5cbiAgICogQHBhcmFtIHZhbHVlIFRoZSBuZXcgdmFsdWUuXG4gICAqL1xuICBhYnN0cmFjdCBzZXRQcm9wZXJ0eShlbDogYW55LCBuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnQgdGhpcyBjYWxsYmFjayB0byBzZXQgdGhlIHZhbHVlIG9mIGEgbm9kZSBpbiB0aGUgaG9zdCBlbGVtZW50LlxuICAgKiBAcGFyYW0gbm9kZSBUaGUgbm9kZS5cbiAgICogQHBhcmFtIHZhbHVlIFRoZSBuZXcgdmFsdWUuXG4gICAqL1xuICBhYnN0cmFjdCBzZXRWYWx1ZShub2RlOiBhbnksIHZhbHVlOiBzdHJpbmcpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnQgdGhpcyBjYWxsYmFjayB0byBzdGFydCBhbiBldmVudCBsaXN0ZW5lci5cbiAgICogQHBhcmFtIHRhcmdldCBUaGUgY29udGV4dCBpbiB3aGljaCB0byBsaXN0ZW4gZm9yIGV2ZW50cy4gQ2FuIGJlXG4gICAqIHRoZSBlbnRpcmUgd2luZG93IG9yIGRvY3VtZW50LCB0aGUgYm9keSBvZiB0aGUgZG9jdW1lbnQsIG9yIGEgc3BlY2lmaWNcbiAgICogRE9NIGVsZW1lbnQuXG4gICAqIEBwYXJhbSBldmVudE5hbWUgVGhlIGV2ZW50IHRvIGxpc3RlbiBmb3IuXG4gICAqIEBwYXJhbSBjYWxsYmFjayBBIGhhbmRsZXIgZnVuY3Rpb24gdG8gaW52b2tlIHdoZW4gdGhlIGV2ZW50IG9jY3Vycy5cbiAgICogQHJldHVybnMgQW4gXCJ1bmxpc3RlblwiIGZ1bmN0aW9uIGZvciBkaXNwb3Npbmcgb2YgdGhpcyBoYW5kbGVyLlxuICAgKi9cbiAgYWJzdHJhY3QgbGlzdGVuKFxuICAgICAgdGFyZ2V0OiAnd2luZG93J3wnZG9jdW1lbnQnfCdib2R5J3xhbnksIGV2ZW50TmFtZTogc3RyaW5nLFxuICAgICAgY2FsbGJhY2s6IChldmVudDogYW55KSA9PiBib29sZWFuIHwgdm9pZCk6ICgpID0+IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKiBAbm9jb2xsYXBzZVxuICAgKi9cbiAgc3RhdGljIF9fTkdfRUxFTUVOVF9JRF9fOiAoKSA9PiBSZW5kZXJlcjIgPSAoKSA9PiBTV0lUQ0hfUkVOREVSRVIyX0ZBQ1RPUlkoKTtcbn1cblxuXG5leHBvcnQgY29uc3QgU1dJVENIX1JFTkRFUkVSMl9GQUNUT1JZX19QT1NUX1IzX18gPSByZW5kZXIzSW5qZWN0UmVuZGVyZXIyO1xuY29uc3QgU1dJVENIX1JFTkRFUkVSMl9GQUNUT1JZX19QUkVfUjNfXyA9IG5vb3A7XG5jb25zdCBTV0lUQ0hfUkVOREVSRVIyX0ZBQ1RPUlk6IHR5cGVvZiByZW5kZXIzSW5qZWN0UmVuZGVyZXIyID0gU1dJVENIX1JFTkRFUkVSMl9GQUNUT1JZX19QUkVfUjNfXztcbiJdfQ==