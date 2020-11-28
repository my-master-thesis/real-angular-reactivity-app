/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __values } from "tslib";
import { isComponentDef } from '../interfaces/type_checks';
import { getSuperType } from './inherit_definition_feature';
/**
 * Fields which exist on either directive or component definitions, and need to be copied from
 * parent to child classes by the `ɵɵCopyDefinitionFeature`.
 */
var COPY_DIRECTIVE_FIELDS = [
    // The child class should use the providers of its parent.
    'providersResolver',
];
/**
 * Fields which exist only on component definitions, and need to be copied from parent to child
 * classes by the `ɵɵCopyDefinitionFeature`.
 *
 * The type here allows any field of `ComponentDef` which is not also a property of `DirectiveDef`,
 * since those should go in `COPY_DIRECTIVE_FIELDS` above.
 */
var COPY_COMPONENT_FIELDS = [
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
 * @param definition The definition of a child class which inherits from a parent class with its
 * own definition.
 *
 * @codeGenApi
 */
export function ɵɵCopyDefinitionFeature(definition) {
    var e_1, _a, e_2, _b;
    var superType = getSuperType(definition.type);
    var superDef = undefined;
    if (isComponentDef(definition)) {
        // Don't use getComponentDef/getDirectiveDef. This logic relies on inheritance.
        superDef = superType.ɵcmp;
    }
    else {
        // Don't use getComponentDef/getDirectiveDef. This logic relies on inheritance.
        superDef = superType.ɵdir;
    }
    // Needed because `definition` fields are readonly.
    var defAny = definition;
    try {
        // Copy over any fields that apply to either directives or components.
        for (var COPY_DIRECTIVE_FIELDS_1 = __values(COPY_DIRECTIVE_FIELDS), COPY_DIRECTIVE_FIELDS_1_1 = COPY_DIRECTIVE_FIELDS_1.next(); !COPY_DIRECTIVE_FIELDS_1_1.done; COPY_DIRECTIVE_FIELDS_1_1 = COPY_DIRECTIVE_FIELDS_1.next()) {
            var field = COPY_DIRECTIVE_FIELDS_1_1.value;
            defAny[field] = superDef[field];
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (COPY_DIRECTIVE_FIELDS_1_1 && !COPY_DIRECTIVE_FIELDS_1_1.done && (_a = COPY_DIRECTIVE_FIELDS_1.return)) _a.call(COPY_DIRECTIVE_FIELDS_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (isComponentDef(superDef)) {
        try {
            // Copy over any component-specific fields.
            for (var COPY_COMPONENT_FIELDS_1 = __values(COPY_COMPONENT_FIELDS), COPY_COMPONENT_FIELDS_1_1 = COPY_COMPONENT_FIELDS_1.next(); !COPY_COMPONENT_FIELDS_1_1.done; COPY_COMPONENT_FIELDS_1_1 = COPY_COMPONENT_FIELDS_1.next()) {
                var field = COPY_COMPONENT_FIELDS_1_1.value;
                defAny[field] = superDef[field];
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (COPY_COMPONENT_FIELDS_1_1 && !COPY_COMPONENT_FIELDS_1_1.done && (_b = COPY_COMPONENT_FIELDS_1.return)) _b.call(COPY_COMPONENT_FIELDS_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29weV9kZWZpbml0aW9uX2ZlYXR1cmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2ZlYXR1cmVzL2NvcHlfZGVmaW5pdGlvbl9mZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFHSCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFFekQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBRTFEOzs7R0FHRztBQUNILElBQU0scUJBQXFCLEdBQW9DO0lBQzdELDBEQUEwRDtJQUMxRCxtQkFBbUI7Q0FJcEIsQ0FBQztBQUVGOzs7Ozs7R0FNRztBQUNILElBQU0scUJBQXFCLEdBQXdFO0lBQ2pHLHlGQUF5RjtJQUN6RixhQUFhO0lBQ2IsVUFBVTtJQUNWLE9BQU87SUFDUCxRQUFRO0lBQ1IsTUFBTTtJQUNOLFFBQVE7SUFDUixpQkFBaUI7SUFDakIsb0JBQW9CO0lBQ3BCLG9CQUFvQjtJQUVwQiw0RkFBNEY7SUFDNUYsUUFBUTtJQUNSLGVBQWU7SUFFZixrRkFBa0Y7SUFDbEYsU0FBUztDQUNWLENBQUM7QUFFRjs7Ozs7Ozs7Ozs7Ozs7O0dBZUc7QUFDSCxNQUFNLFVBQVUsdUJBQXVCLENBQUMsVUFBZ0Q7O0lBQ3RGLElBQUksU0FBUyxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFHLENBQUM7SUFFaEQsSUFBSSxRQUFRLEdBQWtELFNBQVMsQ0FBQztJQUN4RSxJQUFJLGNBQWMsQ0FBQyxVQUFVLENBQUMsRUFBRTtRQUM5QiwrRUFBK0U7UUFDL0UsUUFBUSxHQUFHLFNBQVMsQ0FBQyxJQUFNLENBQUM7S0FDN0I7U0FBTTtRQUNMLCtFQUErRTtRQUMvRSxRQUFRLEdBQUcsU0FBUyxDQUFDLElBQU0sQ0FBQztLQUM3QjtJQUVELG1EQUFtRDtJQUNuRCxJQUFNLE1BQU0sR0FBSSxVQUFrQixDQUFDOztRQUVuQyxzRUFBc0U7UUFDdEUsS0FBb0IsSUFBQSwwQkFBQSxTQUFBLHFCQUFxQixDQUFBLDREQUFBLCtGQUFFO1lBQXRDLElBQU0sS0FBSyxrQ0FBQTtZQUNkLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDakM7Ozs7Ozs7OztJQUVELElBQUksY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFOztZQUM1QiwyQ0FBMkM7WUFDM0MsS0FBb0IsSUFBQSwwQkFBQSxTQUFBLHFCQUFxQixDQUFBLDREQUFBLCtGQUFFO2dCQUF0QyxJQUFNLEtBQUssa0NBQUE7Z0JBQ2QsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNqQzs7Ozs7Ozs7O0tBQ0Y7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudERlZiwgRGlyZWN0aXZlRGVmfSBmcm9tICcuLi9pbnRlcmZhY2VzL2RlZmluaXRpb24nO1xuaW1wb3J0IHtpc0NvbXBvbmVudERlZn0gZnJvbSAnLi4vaW50ZXJmYWNlcy90eXBlX2NoZWNrcyc7XG5cbmltcG9ydCB7Z2V0U3VwZXJUeXBlfSBmcm9tICcuL2luaGVyaXRfZGVmaW5pdGlvbl9mZWF0dXJlJztcblxuLyoqXG4gKiBGaWVsZHMgd2hpY2ggZXhpc3Qgb24gZWl0aGVyIGRpcmVjdGl2ZSBvciBjb21wb25lbnQgZGVmaW5pdGlvbnMsIGFuZCBuZWVkIHRvIGJlIGNvcGllZCBmcm9tXG4gKiBwYXJlbnQgdG8gY2hpbGQgY2xhc3NlcyBieSB0aGUgYMm1ybVDb3B5RGVmaW5pdGlvbkZlYXR1cmVgLlxuICovXG5jb25zdCBDT1BZX0RJUkVDVElWRV9GSUVMRFM6IChrZXlvZiBEaXJlY3RpdmVEZWY8dW5rbm93bj4pW10gPSBbXG4gIC8vIFRoZSBjaGlsZCBjbGFzcyBzaG91bGQgdXNlIHRoZSBwcm92aWRlcnMgb2YgaXRzIHBhcmVudC5cbiAgJ3Byb3ZpZGVyc1Jlc29sdmVyJyxcblxuICAvLyBOb3QgbGlzdGVkIGhlcmUgYXJlIGFueSBmaWVsZHMgd2hpY2ggYXJlIGhhbmRsZWQgYnkgdGhlIGDJtcm1SW5oZXJpdERlZmluaXRpb25GZWF0dXJlYCwgc3VjaFxuICAvLyBhcyBpbnB1dHMsIG91dHB1dHMsIGFuZCBob3N0IGJpbmRpbmcgZnVuY3Rpb25zLlxuXTtcblxuLyoqXG4gKiBGaWVsZHMgd2hpY2ggZXhpc3Qgb25seSBvbiBjb21wb25lbnQgZGVmaW5pdGlvbnMsIGFuZCBuZWVkIHRvIGJlIGNvcGllZCBmcm9tIHBhcmVudCB0byBjaGlsZFxuICogY2xhc3NlcyBieSB0aGUgYMm1ybVDb3B5RGVmaW5pdGlvbkZlYXR1cmVgLlxuICpcbiAqIFRoZSB0eXBlIGhlcmUgYWxsb3dzIGFueSBmaWVsZCBvZiBgQ29tcG9uZW50RGVmYCB3aGljaCBpcyBub3QgYWxzbyBhIHByb3BlcnR5IG9mIGBEaXJlY3RpdmVEZWZgLFxuICogc2luY2UgdGhvc2Ugc2hvdWxkIGdvIGluIGBDT1BZX0RJUkVDVElWRV9GSUVMRFNgIGFib3ZlLlxuICovXG5jb25zdCBDT1BZX0NPTVBPTkVOVF9GSUVMRFM6IEV4Y2x1ZGU8a2V5b2YgQ29tcG9uZW50RGVmPHVua25vd24+LCBrZXlvZiBEaXJlY3RpdmVEZWY8dW5rbm93bj4+W10gPSBbXG4gIC8vIFRoZSBjaGlsZCBjbGFzcyBzaG91bGQgdXNlIHRoZSB0ZW1wbGF0ZSBmdW5jdGlvbiBvZiBpdHMgcGFyZW50LCBpbmNsdWRpbmcgYWxsIHRlbXBsYXRlXG4gIC8vIHNlbWFudGljcy5cbiAgJ3RlbXBsYXRlJyxcbiAgJ2RlY2xzJyxcbiAgJ2NvbnN0cycsXG4gICd2YXJzJyxcbiAgJ29uUHVzaCcsXG4gICdjaGFuZ2VEZXRlY3Rpb24nLFxuICAncmVhY3RpdmVQcm9wZXJ0aWVzJyxcbiAgJ25nQ29udGVudFNlbGVjdG9ycycsXG5cbiAgLy8gVGhlIGNoaWxkIGNsYXNzIHNob3VsZCB1c2UgdGhlIENTUyBzdHlsZXMgb2YgaXRzIHBhcmVudCwgaW5jbHVkaW5nIGFsbCBzdHlsaW5nIHNlbWFudGljcy5cbiAgJ3N0eWxlcycsXG4gICdlbmNhcHN1bGF0aW9uJyxcblxuICAvLyBUaGUgY2hpbGQgY2xhc3Mgc2hvdWxkIGJlIGNoZWNrZWQgYnkgdGhlIHJ1bnRpbWUgaW4gdGhlIHNhbWUgd2F5IGFzIGl0cyBwYXJlbnQuXG4gICdzY2hlbWFzJyxcbl07XG5cbi8qKlxuICogQ29waWVzIHRoZSBmaWVsZHMgbm90IGhhbmRsZWQgYnkgdGhlIGDJtcm1SW5oZXJpdERlZmluaXRpb25GZWF0dXJlYCBmcm9tIHRoZSBzdXBlcnR5cGUgb2YgYVxuICogZGVmaW5pdGlvbi5cbiAqXG4gKiBUaGlzIGV4aXN0cyBwcmltYXJpbHkgdG8gc3VwcG9ydCBuZ2NjIG1pZ3JhdGlvbiBvZiBhbiBleGlzdGluZyBWaWV3IEVuZ2luZSBwYXR0ZXJuLCB3aGVyZSBhblxuICogZW50aXJlIGRlY29yYXRvciBpcyBpbmhlcml0ZWQgZnJvbSBhIHBhcmVudCB0byBhIGNoaWxkIGNsYXNzLiBXaGVuIG5nY2MgZGV0ZWN0cyB0aGlzIGNhc2UsIGl0XG4gKiBnZW5lcmF0ZXMgYSBza2VsZXRvbiBkZWZpbml0aW9uIG9uIHRoZSBjaGlsZCBjbGFzcywgYW5kIGFwcGxpZXMgdGhpcyBmZWF0dXJlLlxuICpcbiAqIFRoZSBgybXJtUNvcHlEZWZpbml0aW9uRmVhdHVyZWAgdGhlbiBjb3BpZXMgYW55IG5lZWRlZCBmaWVsZHMgZnJvbSB0aGUgcGFyZW50IGNsYXNzJyBkZWZpbml0aW9uLFxuICogaW5jbHVkaW5nIHRoaW5ncyBsaWtlIHRoZSBjb21wb25lbnQgdGVtcGxhdGUgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIGRlZmluaXRpb24gVGhlIGRlZmluaXRpb24gb2YgYSBjaGlsZCBjbGFzcyB3aGljaCBpbmhlcml0cyBmcm9tIGEgcGFyZW50IGNsYXNzIHdpdGggaXRzXG4gKiBvd24gZGVmaW5pdGlvbi5cbiAqXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtUNvcHlEZWZpbml0aW9uRmVhdHVyZShkZWZpbml0aW9uOiBEaXJlY3RpdmVEZWY8YW55PnwgQ29tcG9uZW50RGVmPGFueT4pOiB2b2lkIHtcbiAgbGV0IHN1cGVyVHlwZSA9IGdldFN1cGVyVHlwZShkZWZpbml0aW9uLnR5cGUpICE7XG5cbiAgbGV0IHN1cGVyRGVmOiBEaXJlY3RpdmVEZWY8YW55PnxDb21wb25lbnREZWY8YW55Pnx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIGlmIChpc0NvbXBvbmVudERlZihkZWZpbml0aW9uKSkge1xuICAgIC8vIERvbid0IHVzZSBnZXRDb21wb25lbnREZWYvZ2V0RGlyZWN0aXZlRGVmLiBUaGlzIGxvZ2ljIHJlbGllcyBvbiBpbmhlcml0YW5jZS5cbiAgICBzdXBlckRlZiA9IHN1cGVyVHlwZS7JtWNtcCAhO1xuICB9IGVsc2Uge1xuICAgIC8vIERvbid0IHVzZSBnZXRDb21wb25lbnREZWYvZ2V0RGlyZWN0aXZlRGVmLiBUaGlzIGxvZ2ljIHJlbGllcyBvbiBpbmhlcml0YW5jZS5cbiAgICBzdXBlckRlZiA9IHN1cGVyVHlwZS7JtWRpciAhO1xuICB9XG5cbiAgLy8gTmVlZGVkIGJlY2F1c2UgYGRlZmluaXRpb25gIGZpZWxkcyBhcmUgcmVhZG9ubHkuXG4gIGNvbnN0IGRlZkFueSA9IChkZWZpbml0aW9uIGFzIGFueSk7XG5cbiAgLy8gQ29weSBvdmVyIGFueSBmaWVsZHMgdGhhdCBhcHBseSB0byBlaXRoZXIgZGlyZWN0aXZlcyBvciBjb21wb25lbnRzLlxuICBmb3IgKGNvbnN0IGZpZWxkIG9mIENPUFlfRElSRUNUSVZFX0ZJRUxEUykge1xuICAgIGRlZkFueVtmaWVsZF0gPSBzdXBlckRlZltmaWVsZF07XG4gIH1cblxuICBpZiAoaXNDb21wb25lbnREZWYoc3VwZXJEZWYpKSB7XG4gICAgLy8gQ29weSBvdmVyIGFueSBjb21wb25lbnQtc3BlY2lmaWMgZmllbGRzLlxuICAgIGZvciAoY29uc3QgZmllbGQgb2YgQ09QWV9DT01QT05FTlRfRklFTERTKSB7XG4gICAgICBkZWZBbnlbZmllbGRdID0gc3VwZXJEZWZbZmllbGRdO1xuICAgIH1cbiAgfVxufVxuIl19