/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import { unwrapSafeValue } from '../../sanitization/bypass';
import { stylePropNeedsSanitization, ɵɵsanitizeStyle } from '../../sanitization/sanitization';
import { keyValueArrayGet, keyValueArraySet } from '../../util/array_utils';
import { assertDefined, assertEqual, assertLessThan, assertNotEqual, throwError } from '../../util/assert';
import { EMPTY_ARRAY } from '../../util/empty';
import { concatStringsWithSpace, stringify } from '../../util/stringify';
import { assertFirstUpdatePass } from '../assert';
import { bindingUpdated } from '../bindings';
import { getTStylingRangeNext, getTStylingRangeNextDuplicate, getTStylingRangePrev, getTStylingRangePrevDuplicate } from '../interfaces/styling';
import { HEADER_OFFSET, RENDERER } from '../interfaces/view';
import { applyStyling } from '../node_manipulation';
import { getCurrentDirectiveIndex, getCurrentStyleSanitizer, getLView, getSelectedIndex, getTView, incrementBindingIndex, setCurrentStyleSanitizer } from '../state';
import { insertTStylingBinding } from '../styling/style_binding_list';
import { getLastParsedKey, getLastParsedValue, parseClassName, parseClassNameNext, parseStyle, parseStyleNext } from '../styling/styling_parser';
import { NO_CHANGE } from '../tokens';
import { getNativeByIndex } from '../util/view_utils';
import { setDirectiveInputsWhichShadowsStyling } from './property';
/**
 * Sets the current style sanitizer function which will then be used
 * within all follow-up prop and map-based style binding instructions
 * for the given element.
 *
 * Note that once styling has been applied to the element (i.e. once
 * `advance(n)` is executed or the hostBindings/template function exits)
 * then the active `sanitizerFn` will be set to `null`. This means that
 * once styling is applied to another element then a another call to
 * `styleSanitizer` will need to be made.
 *
 * @param sanitizerFn The sanitization function that will be used to
 *       process style prop/value entries.
 *
 * @codeGenApi
 */
export function ɵɵstyleSanitizer(sanitizer) {
    setCurrentStyleSanitizer(sanitizer);
}
/**
 * Update a style binding on an element with the provided value.
 *
 * If the style value is falsy then it will be removed from the element
 * (or assigned a different value depending if there are any styles placed
 * on the element with `styleMap` or any static styles that are
 * present from when the element was created with `styling`).
 *
 * Note that the styling element is updated as part of `stylingApply`.
 *
 * @param prop A valid CSS property.
 * @param value New value to write (`null` or an empty string to remove).
 * @param suffix Optional suffix. Used with scalar values to add unit such as `px`.
 *        Note that when a suffix is provided then the underlying sanitizer will
 *        be ignored.
 *
 * Note that this will apply the provided style value to the host element if this function is called
 * within a host binding function.
 *
 * @codeGenApi
 */
export function ɵɵstyleProp(prop, value, suffix) {
    checkStylingProperty(prop, value, suffix, false);
    return ɵɵstyleProp;
}
/**
 * Update a class binding on an element with the provided value.
 *
 * This instruction is meant to handle the `[class.foo]="exp"` case and,
 * therefore, the class binding itself must already be allocated using
 * `styling` within the creation block.
 *
 * @param prop A valid CSS class (only one).
 * @param value A true/false value which will turn the class on or off.
 *
 * Note that this will apply the provided class value to the host element if this function
 * is called within a host binding function.
 *
 * @codeGenApi
 */
export function ɵɵclassProp(className, value) {
    checkStylingProperty(className, value, null, true);
    return ɵɵclassProp;
}
/**
 * Update style bindings using an object literal on an element.
 *
 * This instruction is meant to apply styling via the `[style]="exp"` template bindings.
 * When styles are applied to the element they will then be updated with respect to
 * any styles/classes set via `styleProp`. If any styles are set to falsy
 * then they will be removed from the element.
 *
 * Note that the styling instruction will not be applied until `stylingApply` is called.
 *
 * @param styles A key/value style map of the styles that will be applied to the given element.
 *        Any missing styles (that have already been applied to the element beforehand) will be
 *        removed (unset) from the element's styling.
 *
 * Note that this will apply the provided styleMap value to the host element if this function
 * is called within a host binding.
 *
 * @codeGenApi
 */
export function ɵɵstyleMap(styles) {
    checkStylingMap(styleKeyValueArraySet, styleStringParser, styles, false);
}
/**
 * Parse text as style and add values to KeyValueArray.
 *
 * This code is pulled out to a separate function so that it can be tree shaken away if it is not
 * needed. It is only referenced from `ɵɵstyleMap`.
 *
 * @param keyValueArray KeyValueArray to add parsed values to.
 * @param text text to parse.
 */
export function styleStringParser(keyValueArray, text) {
    for (var i = parseStyle(text); i >= 0; i = parseStyleNext(text, i)) {
        styleKeyValueArraySet(keyValueArray, getLastParsedKey(text), getLastParsedValue(text));
    }
}
/**
 * Update class bindings using an object literal or class-string on an element.
 *
 * This instruction is meant to apply styling via the `[class]="exp"` template bindings.
 * When classes are applied to the element they will then be updated with
 * respect to any styles/classes set via `classProp`. If any
 * classes are set to falsy then they will be removed from the element.
 *
 * Note that the styling instruction will not be applied until `stylingApply` is called.
 * Note that this will the provided classMap value to the host element if this function is called
 * within a host binding.
 *
 * @param classes A key/value map or string of CSS classes that will be added to the
 *        given element. Any missing classes (that have already been applied to the element
 *        beforehand) will be removed (unset) from the element's list of CSS classes.
 *
 * @codeGenApi
 */
export function ɵɵclassMap(classes) {
    checkStylingMap(keyValueArraySet, classStringParser, classes, true);
}
/**
 * Parse text as class and add values to KeyValueArray.
 *
 * This code is pulled out to a separate function so that it can be tree shaken away if it is not
 * needed. It is only referenced from `ɵɵclassMap`.
 *
 * @param keyValueArray KeyValueArray to add parsed values to.
 * @param text text to parse.
 */
export function classStringParser(keyValueArray, text) {
    for (var i = parseClassName(text); i >= 0; i = parseClassNameNext(text, i)) {
        keyValueArraySet(keyValueArray, getLastParsedKey(text), true);
    }
}
/**
 * Common code between `ɵɵclassProp` and `ɵɵstyleProp`.
 *
 * @param prop property name.
 * @param value binding value.
 * @param suffixOrSanitizer suffix or sanitization function
 * @param isClassBased `true` if `class` change (`false` if `style`)
 */
export function checkStylingProperty(prop, value, suffixOrSanitizer, isClassBased) {
    var lView = getLView();
    var tView = getTView();
    // Styling instructions use 2 slots per binding.
    // 1. one for the value / TStylingKey
    // 2. one for the intermittent-value / TStylingRange
    var bindingIndex = incrementBindingIndex(2);
    if (tView.firstUpdatePass) {
        stylingFirstUpdatePass(tView, prop, bindingIndex, isClassBased);
    }
    if (value !== NO_CHANGE && bindingUpdated(lView, bindingIndex, value)) {
        // This is a work around. Once PR#34480 lands the sanitizer is passed explicitly and this line
        // can be removed.
        var styleSanitizer = void 0;
        if (suffixOrSanitizer == null) {
            if (styleSanitizer = getCurrentStyleSanitizer()) {
                suffixOrSanitizer = styleSanitizer;
            }
        }
        var tNode = tView.data[getSelectedIndex() + HEADER_OFFSET];
        updateStyling(tView, tNode, lView, lView[RENDERER], prop, lView[bindingIndex + 1] = normalizeAndApplySuffixOrSanitizer(value, suffixOrSanitizer), isClassBased, bindingIndex);
    }
}
/**
 * Common code between `ɵɵclassMap` and `ɵɵstyleMap`.
 *
 * @param keyValueArraySet (See `keyValueArraySet` in "util/array_utils") Gets passed in as a
 * function so that
 *        `style` can pass in version which does sanitization. This is done for tree shaking
 *        purposes.
 * @param stringParser Parser used to parse `value` if `string`. (Passed in as `style` and `class`
 *        have different parsers.)
 * @param value bound value from application
 * @param isClassBased `true` if `class` change (`false` if `style`)
 */
export function checkStylingMap(keyValueArraySet, stringParser, value, isClassBased) {
    var tView = getTView();
    var bindingIndex = incrementBindingIndex(2);
    if (tView.firstUpdatePass) {
        stylingFirstUpdatePass(tView, null, bindingIndex, isClassBased);
    }
    var lView = getLView();
    if (value !== NO_CHANGE && bindingUpdated(lView, bindingIndex, value)) {
        // `getSelectedIndex()` should be here (rather than in instruction) so that it is guarded by the
        // if so as not to read unnecessarily.
        var tNode = tView.data[getSelectedIndex() + HEADER_OFFSET];
        if (hasStylingInputShadow(tNode, isClassBased) && !isInHostBindings(tView, bindingIndex)) {
            if (ngDevMode) {
                // verify that if we are shadowing then `TData` is appropriately marked so that we skip
                // processing this binding in styling resolution.
                var tStylingKey = tView.data[bindingIndex];
                assertEqual(Array.isArray(tStylingKey) ? tStylingKey[1] : tStylingKey, false, 'Styling linked list shadow input should be marked as \'false\'');
            }
            // VE does not concatenate the static portion like we are doing here.
            // Instead VE just ignores the static completely if dynamic binding is present.
            // Because of locality we have already set the static portion because we don't know if there
            // is a dynamic portion until later. If we would ignore the static portion it would look like
            // the binding has removed it. This would confuse `[ngStyle]`/`[ngClass]` to do the wrong
            // thing as it would think that the static portion was removed. For this reason we
            // concatenate it so that `[ngStyle]`/`[ngClass]`  can continue to work on changed.
            var staticPrefix = isClassBased ? tNode.classes : tNode.styles;
            ngDevMode && isClassBased === false && staticPrefix !== null &&
                assertEqual(staticPrefix.endsWith(';'), true, 'Expecting static portion to end with \';\'');
            if (staticPrefix !== null) {
                // We want to make sure that falsy values of `value` become empty strings.
                value = concatStringsWithSpace(staticPrefix, value ? value : '');
            }
            // Given `<div [style] my-dir>` such that `my-dir` has `@Input('style')`.
            // This takes over the `[style]` binding. (Same for `[class]`)
            setDirectiveInputsWhichShadowsStyling(tView, tNode, lView, value, isClassBased);
        }
        else {
            updateStylingMap(tView, tNode, lView, lView[RENDERER], lView[bindingIndex + 1], lView[bindingIndex + 1] = toStylingKeyValueArray(keyValueArraySet, stringParser, value), isClassBased, bindingIndex);
        }
    }
}
/**
 * Determines when the binding is in `hostBindings` section
 *
 * @param tView Current `TView`
 * @param bindingIndex index of binding which we would like if it is in `hostBindings`
 */
function isInHostBindings(tView, bindingIndex) {
    // All host bindings are placed after the expando section.
    return bindingIndex >= tView.expandoStartIndex;
}
/**
* Collects the necessary information to insert the binding into a linked list of style bindings
* using `insertTStylingBinding`.
*
* @param tView `TView` where the binding linked list will be stored.
* @param tStylingKey Property/key of the binding.
* @param bindingIndex Index of binding associated with the `prop`
* @param isClassBased `true` if `class` change (`false` if `style`)
*/
function stylingFirstUpdatePass(tView, tStylingKey, bindingIndex, isClassBased) {
    ngDevMode && assertFirstUpdatePass(tView);
    var tData = tView.data;
    if (tData[bindingIndex + 1] === null) {
        // The above check is necessary because we don't clear first update pass until first successful
        // (no exception) template execution. This prevents the styling instruction from double adding
        // itself to the list.
        // `getSelectedIndex()` should be here (rather than in instruction) so that it is guarded by the
        // if so as not to read unnecessarily.
        var tNode = tData[getSelectedIndex() + HEADER_OFFSET];
        var isHostBindings = isInHostBindings(tView, bindingIndex);
        if (hasStylingInputShadow(tNode, isClassBased) && tStylingKey === null && !isHostBindings) {
            // `tStylingKey === null` implies that we are either `[style]` or `[class]` binding.
            // If there is a directive which uses `@Input('style')` or `@Input('class')` than
            // we need to neutralize this binding since that directive is shadowing it.
            // We turn this into a noop by setting the key to `false`
            tStylingKey = false;
        }
        tStylingKey = wrapInStaticStylingKey(tData, tNode, tStylingKey, isClassBased);
        insertTStylingBinding(tData, tNode, tStylingKey, bindingIndex, isHostBindings, isClassBased);
    }
}
/**
 * Adds static styling information to the binding if applicable.
 *
 * The linked list of styles not only stores the list and keys, but also stores static styling
 * information on some of the keys. This function determines if the key should contain the styling
 * information and computes it.
 *
 * See `TStylingStatic` for more details.
 *
 * @param tData `TData` where the linked list is stored.
 * @param tNode `TNode` for which the styling is being computed.
 * @param stylingKey `TStylingKeyPrimitive` which may need to be wrapped into `TStylingKey`
 * @param isClassBased `true` if `class` (`false` if `style`)
 */
export function wrapInStaticStylingKey(tData, tNode, stylingKey, isClassBased) {
    var hostDirectiveDef = getHostDirectiveDef(tData);
    var residual = isClassBased ? tNode.residualClasses : tNode.residualStyles;
    if (hostDirectiveDef === null) {
        // We are in template node.
        // If template node already had styling instruction then it has already collected the static
        // styling and there is no need to collect them again. We know that we are the first styling
        // instruction because the `TNode.*Bindings` points to 0 (nothing has been inserted yet).
        var isFirstStylingInstructionInTemplate = (isClassBased ? tNode.classBindings : tNode.styleBindings) === 0;
        if (isFirstStylingInstructionInTemplate) {
            // It would be nice to be able to get the statics from `mergeAttrs`, however, at this point
            // they are already merged and it would not be possible to figure which property belongs where
            // in the priority.
            stylingKey = collectStylingFromDirectives(null, tData, tNode, stylingKey, isClassBased);
            stylingKey = collectStylingFromTAttrs(stylingKey, tNode.attrs, isClassBased);
            // We know that if we have styling binding in template we can't have residual.
            residual = null;
        }
    }
    else {
        // We are in host binding node and there was no binding instruction in template node.
        // This means that we need to compute the residual.
        var directiveStylingLast = tNode.directiveStylingLast;
        var isFirstStylingInstructionInHostBinding = directiveStylingLast === -1 || tData[directiveStylingLast] !== hostDirectiveDef;
        if (isFirstStylingInstructionInHostBinding) {
            stylingKey =
                collectStylingFromDirectives(hostDirectiveDef, tData, tNode, stylingKey, isClassBased);
            if (residual === null) {
                // - If `null` than either:
                //    - Template styling instruction already ran and it has consumed the static
                //      styling into its `TStylingKey` and so there is no need to update residual. Instead
                //      we need to update the `TStylingKey` associated with the first template node
                //      instruction. OR
                //    - Some other styling instruction ran and determined that there are no residuals
                var templateStylingKey = getTemplateHeadTStylingKey(tData, tNode, isClassBased);
                if (templateStylingKey !== undefined && Array.isArray(templateStylingKey)) {
                    // Only recompute if `templateStylingKey` had static values. (If no static value found
                    // then there is nothing to do since this operation can only produce less static keys, not
                    // more.)
                    templateStylingKey = collectStylingFromDirectives(null, tData, tNode, templateStylingKey[1] /* unwrap previous statics */, isClassBased);
                    templateStylingKey =
                        collectStylingFromTAttrs(templateStylingKey, tNode.attrs, isClassBased);
                    setTemplateHeadTStylingKey(tData, tNode, isClassBased, templateStylingKey);
                }
            }
            else {
                // We only need to recompute residual if it is not `null`.
                // - If existing residual (implies there was no template styling). This means that some of
                //   the statics may have moved from the residual to the `stylingKey` and so we have to
                //   recompute.
                // - If `undefined` this is the first time we are running.
                residual = collectResidual(tData, tNode, isClassBased);
            }
        }
    }
    if (residual !== undefined) {
        isClassBased ? (tNode.residualClasses = residual) : (tNode.residualStyles = residual);
    }
    return stylingKey;
}
/**
 * Retrieve the `TStylingKey` for the template styling instruction.
 *
 * This is needed since `hostBinding` styling instructions are inserted after the template
 * instruction. While the template instruction needs to update the residual in `TNode` the
 * `hostBinding` instructions need to update the `TStylingKey` of the template instruction because
 * the template instruction is downstream from the `hostBindings` instructions.
 *
 * @param tData `TData` where the linked list is stored.
 * @param tNode `TNode` for which the styling is being computed.
 * @param isClassBased `true` if `class` (`false` if `style`)
 * @return `TStylingKey` if found or `undefined` if not found.
 */
function getTemplateHeadTStylingKey(tData, tNode, isClassBased) {
    var bindings = isClassBased ? tNode.classBindings : tNode.styleBindings;
    if (getTStylingRangeNext(bindings) === 0) {
        // There does not seem to be a styling instruction in the `template`.
        return undefined;
    }
    return tData[getTStylingRangePrev(bindings)];
}
/**
 * Update the `TStylingKey` of the first template instruction in `TNode`.
 *
 * Logically `hostBindings` styling instructions are of lower priority than that of the template.
 * However, they execute after the template styling instructions. This means that they get inserted
 * in front of the template styling instructions.
 *
 * If we have a template styling instruction and a new `hostBindings` styling instruction is
 * executed it means that it may need to steal static fields from the template instruction. This
 * method allows us to update the first template instruction `TStylingKey` with a new value.
 *
 * Assume:
 * ```
 * <div my-dir style="color: red" [style.color]="tmplExp"></div>
 *
 * @Directive({
 *   host: {
 *     'style': 'width: 100px',
 *     '[style.color]': 'dirExp',
 *   }
 * })
 * class MyDir {}
 * ```
 *
 * when `[style.color]="tmplExp"` executes it creates this data structure.
 * ```
 *  ['', 'color', 'color', 'red', 'width', '100px'],
 * ```
 *
 * The reason for this is that the template instruction does not know if there are styling
 * instructions and must assume that there are none and must collect all of the static styling.
 * (both
 * `color' and 'width`)
 *
 * When `'[style.color]': 'dirExp',` executes we need to insert a new data into the linked list.
 * ```
 *  ['', 'color', 'width', '100px'],  // newly inserted
 *  ['', 'color', 'color', 'red', 'width', '100px'], // this is wrong
 * ```
 *
 * Notice that the template statics is now wrong as it incorrectly contains `width` so we need to
 * update it like so:
 * ```
 *  ['', 'color', 'width', '100px'],
 *  ['', 'color', 'color', 'red'],    // UPDATE
 * ```
 *
 * @param tData `TData` where the linked list is stored.
 * @param tNode `TNode` for which the styling is being computed.
 * @param isClassBased `true` if `class` (`false` if `style`)
 * @param tStylingKey New `TStylingKey` which is replacing the old one.
 */
function setTemplateHeadTStylingKey(tData, tNode, isClassBased, tStylingKey) {
    var bindings = isClassBased ? tNode.classBindings : tNode.styleBindings;
    ngDevMode && assertNotEqual(getTStylingRangeNext(bindings), 0, 'Expecting to have at least one template styling binding.');
    tData[getTStylingRangePrev(bindings)] = tStylingKey;
}
/**
 * Collect all static values after the current `TNode.directiveStylingLast` index.
 *
 * Collect the remaining styling information which has not yet been collected by an existing
 * styling instruction.
 *
 * @param tData `TData` where the `DirectiveDefs` are stored.
 * @param tNode `TNode` which contains the directive range.
 * @param isClassBased `true` if `class` (`false` if `style`)
 */
function collectResidual(tData, tNode, isClassBased) {
    var residual = undefined;
    var directiveEnd = tNode.directiveEnd;
    ngDevMode &&
        assertNotEqual(tNode.directiveStylingLast, -1, 'By the time this function gets called at least one hostBindings-node styling instruction must have executed.');
    // We add `1 + tNode.directiveStart` because we need to skip the current directive (as we are
    // collecting things after the last `hostBindings` directive which had a styling instruction.)
    for (var i = 1 + tNode.directiveStylingLast; i < directiveEnd; i++) {
        var attrs = tData[i].hostAttrs;
        residual = collectStylingFromTAttrs(residual, attrs, isClassBased);
    }
    return collectStylingFromTAttrs(residual, tNode.attrs, isClassBased);
}
/**
 * Collect the static styling information with lower priority than `hostDirectiveDef`.
 *
 * (This is opposite of residual styling.)
 *
 * @param hostDirectiveDef `DirectiveDef` for which we want to collect lower priority static
 *        styling. (Or `null` if template styling)
 * @param tData `TData` where the linked list is stored.
 * @param tNode `TNode` for which the styling is being computed.
 * @param stylingKey Existing `TStylingKey` to update or wrap.
 * @param isClassBased `true` if `class` (`false` if `style`)
 */
function collectStylingFromDirectives(hostDirectiveDef, tData, tNode, stylingKey, isClassBased) {
    // We need to loop because there can be directives which have `hostAttrs` but don't have
    // `hostBindings` so this loop catches up to the current directive..
    var currentDirective = null;
    var directiveEnd = tNode.directiveEnd;
    var directiveStylingLast = tNode.directiveStylingLast;
    if (directiveStylingLast === -1) {
        directiveStylingLast = tNode.directiveStart;
    }
    else {
        directiveStylingLast++;
    }
    while (directiveStylingLast < directiveEnd) {
        currentDirective = tData[directiveStylingLast];
        ngDevMode && assertDefined(currentDirective, 'expected to be defined');
        stylingKey = collectStylingFromTAttrs(stylingKey, currentDirective.hostAttrs, isClassBased);
        if (currentDirective === hostDirectiveDef)
            break;
        directiveStylingLast++;
    }
    if (hostDirectiveDef !== null) {
        // we only advance the styling cursor if we are collecting data from host bindings.
        // Template executes before host bindings and so if we would update the index,
        // host bindings would not get their statics.
        tNode.directiveStylingLast = directiveStylingLast;
    }
    return stylingKey;
}
/**
 * Convert `TAttrs` into `TStylingStatic`.
 *
 * @param stylingKey existing `TStylingKey` to update or wrap.
 * @param attrs `TAttributes` to process.
 * @param isClassBased `true` if `class` (`false` if `style`)
 */
function collectStylingFromTAttrs(stylingKey, attrs, isClassBased) {
    var desiredMarker = isClassBased ? 1 /* Classes */ : 2 /* Styles */;
    var currentMarker = -1 /* ImplicitAttributes */;
    if (attrs !== null) {
        for (var i = 0; i < attrs.length; i++) {
            var item = attrs[i];
            if (typeof item === 'number') {
                currentMarker = item;
            }
            else {
                if (currentMarker === desiredMarker) {
                    if (!Array.isArray(stylingKey)) {
                        stylingKey = stylingKey === undefined ? [] : ['', stylingKey];
                    }
                    keyValueArraySet(stylingKey, item, isClassBased ? true : attrs[++i]);
                }
            }
        }
    }
    return stylingKey === undefined ? null : stylingKey;
}
/**
 * Retrieve the current `DirectiveDef` which is active when `hostBindings` style instruction is
 * being executed (or `null` if we are in `template`.)
 *
 * @param tData Current `TData` where the `DirectiveDef` will be looked up at.
 */
export function getHostDirectiveDef(tData) {
    var currentDirectiveIndex = getCurrentDirectiveIndex();
    return currentDirectiveIndex === -1 ? null : tData[currentDirectiveIndex];
}
/**
 * Convert user input to `KeyValueArray`.
 *
 * This function takes user input which could be `string`, Object literal, or iterable and converts
 * it into a consistent representation. The output of this is `KeyValueArray` (which is an array
 * where
 * even indexes contain keys and odd indexes contain values for those keys).
 *
 * The advantage of converting to `KeyValueArray` is that we can perform diff in an input
 * independent
 * way.
 * (ie we can compare `foo bar` to `['bar', 'baz'] and determine a set of changes which need to be
 * applied)
 *
 * The fact that `KeyValueArray` is sorted is very important because it allows us to compute the
 * difference in linear fashion without the need to allocate any additional data.
 *
 * For example if we kept this as a `Map` we would have to iterate over previous `Map` to determine
 * which values need to be deleted, over the new `Map` to determine additions, and we would have to
 * keep additional `Map` to keep track of duplicates or items which have not yet been visited.
 *
 * @param keyValueArraySet (See `keyValueArraySet` in "util/array_utils") Gets passed in as a
 * function so that
 *        `style` can pass in version which does sanitization. This is done for tree shaking
 *        purposes.
 * @param stringParser The parser is passed in so that it will be tree shakable. See
 *        `styleStringParser` and `classStringParser`
 * @param value The value to parse/convert to `KeyValueArray`
 */
export function toStylingKeyValueArray(keyValueArraySet, stringParser, value) {
    if (value == null /*|| value === undefined */ || value === '')
        return EMPTY_ARRAY;
    var styleKeyValueArray = [];
    if (Array.isArray(value)) {
        for (var i = 0; i < value.length; i++) {
            keyValueArraySet(styleKeyValueArray, value[i], true);
        }
    }
    else if (typeof value === 'object') {
        for (var key in value) {
            if (value.hasOwnProperty(key)) {
                keyValueArraySet(styleKeyValueArray, key, value[key]);
            }
        }
    }
    else if (typeof value === 'string') {
        stringParser(styleKeyValueArray, value);
    }
    else {
        ngDevMode && throwError('Unsupported styling type ' + typeof value + ': ' + value);
    }
    return styleKeyValueArray;
}
/**
 * Set a `value` for a `key` taking style sanitization into account.
 *
 * See: `keyValueArraySet` for details
 *
 * @param keyValueArray KeyValueArray to add to.
 * @param key Style key to add. (This key will be checked if it needs sanitization)
 * @param value The value to set (If key needs sanitization it will be sanitized)
 */
export function styleKeyValueArraySet(keyValueArray, key, value) {
    if (stylePropNeedsSanitization(key)) {
        value = ɵɵsanitizeStyle(value);
    }
    keyValueArraySet(keyValueArray, key, value);
}
/**
 * Update map based styling.
 *
 * Map based styling could be anything which contains more than one binding. For example `string`,
 * or object literal. Dealing with all of these types would complicate the logic so
 * instead this function expects that the complex input is first converted into normalized
 * `KeyValueArray`. The advantage of normalization is that we get the values sorted, which makes it
 * very cheap to compute deltas between the previous and current value.
 *
 * @param tView Associated `TView.data` contains the linked list of binding priorities.
 * @param tNode `TNode` where the binding is located.
 * @param lView `LView` contains the values associated with other styling binding at this `TNode`.
 * @param renderer Renderer to use if any updates.
 * @param oldKeyValueArray Previous value represented as `KeyValueArray`
 * @param newKeyValueArray Current value represented as `KeyValueArray`
 * @param isClassBased `true` if `class` (`false` if `style`)
 * @param bindingIndex Binding index of the binding.
 */
function updateStylingMap(tView, tNode, lView, renderer, oldKeyValueArray, newKeyValueArray, isClassBased, bindingIndex) {
    if (oldKeyValueArray === NO_CHANGE) {
        // On first execution the oldKeyValueArray is NO_CHANGE => treat it as empty KeyValueArray.
        oldKeyValueArray = EMPTY_ARRAY;
    }
    var oldIndex = 0;
    var newIndex = 0;
    var oldKey = 0 < oldKeyValueArray.length ? oldKeyValueArray[0] : null;
    var newKey = 0 < newKeyValueArray.length ? newKeyValueArray[0] : null;
    while (oldKey !== null || newKey !== null) {
        ngDevMode && assertLessThan(oldIndex, 999, 'Are we stuck in infinite loop?');
        ngDevMode && assertLessThan(newIndex, 999, 'Are we stuck in infinite loop?');
        var oldValue = oldIndex < oldKeyValueArray.length ? oldKeyValueArray[oldIndex + 1] : undefined;
        var newValue = newIndex < newKeyValueArray.length ? newKeyValueArray[newIndex + 1] : undefined;
        var setKey = null;
        var setValue = undefined;
        if (oldKey === newKey) {
            // UPDATE: Keys are equal => new value is overwriting old value.
            oldIndex += 2;
            newIndex += 2;
            if (oldValue !== newValue) {
                setKey = newKey;
                setValue = newValue;
            }
        }
        else if (newKey === null || oldKey !== null && oldKey < newKey) {
            // DELETE: oldKey key is missing or we did not find the oldKey in the newValue
            // (because the keyValueArray is sorted and `newKey` is found later alphabetically).
            // `"background" < "color"` so we need to delete `"background"` because it is not found in the
            // new array.
            oldIndex += 2;
            setKey = oldKey;
        }
        else {
            // CREATE: newKey's is earlier alphabetically than oldKey's (or no oldKey) => we have new key.
            // `"color" > "background"` so we need to add `color` because it is in new array but not in
            // old array.
            ngDevMode && assertDefined(newKey, 'Expecting to have a valid key');
            newIndex += 2;
            setKey = newKey;
            setValue = newValue;
        }
        if (setKey !== null) {
            updateStyling(tView, tNode, lView, renderer, setKey, setValue, isClassBased, bindingIndex);
        }
        oldKey = oldIndex < oldKeyValueArray.length ? oldKeyValueArray[oldIndex] : null;
        newKey = newIndex < newKeyValueArray.length ? newKeyValueArray[newIndex] : null;
    }
}
/**
 * Update a simple (property name) styling.
 *
 * This function takes `prop` and updates the DOM to that value. The function takes the binding
 * value as well as binding priority into consideration to determine which value should be written
 * to DOM. (For example it may be determined that there is a higher priority overwrite which blocks
 * the DOM write, or if the value goes to `undefined` a lower priority overwrite may be consulted.)
 *
 * @param tView Associated `TView.data` contains the linked list of binding priorities.
 * @param tNode `TNode` where the binding is located.
 * @param lView `LView` contains the values associated with other styling binding at this `TNode`.
 * @param renderer Renderer to use if any updates.
 * @param prop Either style property name or a class name.
 * @param value Either style value for `prop` or `true`/`false` if `prop` is class.
 * @param isClassBased `true` if `class` (`false` if `style`)
 * @param bindingIndex Binding index of the binding.
 */
function updateStyling(tView, tNode, lView, renderer, prop, value, isClassBased, bindingIndex) {
    if (tNode.type !== 3 /* Element */) {
        // It is possible to have styling on non-elements (such as ng-container).
        // This is rare, but it does happen. In such a case, just ignore the binding.
        return;
    }
    var tData = tView.data;
    var tRange = tData[bindingIndex + 1];
    var higherPriorityValue = getTStylingRangeNextDuplicate(tRange) ?
        findStylingValue(tData, tNode, lView, prop, getTStylingRangeNext(tRange), isClassBased) :
        undefined;
    if (!isStylingValuePresent(higherPriorityValue)) {
        // We don't have a next duplicate, or we did not find a duplicate value.
        if (!isStylingValuePresent(value)) {
            // We should delete current value or restore to lower priority value.
            if (getTStylingRangePrevDuplicate(tRange)) {
                // We have a possible prev duplicate, let's retrieve it.
                value = findStylingValue(tData, null, lView, prop, bindingIndex, isClassBased);
            }
        }
        var rNode = getNativeByIndex(getSelectedIndex(), lView);
        applyStyling(renderer, isClassBased, rNode, prop, value);
    }
}
/**
 * Search for styling value with higher priority which is overwriting current value, or a
 * value of lower priority to which we should fall back if the value is `undefined`.
 *
 * When value is being applied at a location, related values need to be consulted.
 * - If there is a higher priority binding, we should be using that one instead.
 *   For example `<div  [style]="{color:exp1}" [style.color]="exp2">` change to `exp1`
 *   requires that we check `exp2` to see if it is set to value other than `undefined`.
 * - If there is a lower priority binding and we are changing to `undefined`
 *   For example `<div  [style]="{color:exp1}" [style.color]="exp2">` change to `exp2` to
 *   `undefined` requires that we check `exp1` (and static values) and use that as new value.
 *
 * NOTE: The styling stores two values.
 * 1. The raw value which came from the application is stored at `index + 0` location. (This value
 *    is used for dirty checking).
 * 2. The normalized value (converted to `KeyValueArray` if map and sanitized) is stored at `index +
 * 1`.
 *    The advantage of storing the sanitized value is that once the value is written we don't need
 *    to worry about sanitizing it later or keeping track of the sanitizer.
 *
 * @param tData `TData` used for traversing the priority.
 * @param tNode `TNode` to use for resolving static styling. Also controls search direction.
 *   - `TNode` search next and quit as soon as `isStylingValuePresent(value)` is true.
 *      If no value found consult `tNode.residualStyle`/`tNode.residualClass` for default value.
 *   - `null` search prev and go all the way to end. Return last value where
 *     `isStylingValuePresent(value)` is true.
 * @param lView `LView` used for retrieving the actual values.
 * @param prop Property which we are interested in.
 * @param index Starting index in the linked list of styling bindings where the search should start.
 * @param isClassBased `true` if `class` (`false` if `style`)
 */
function findStylingValue(tData, tNode, lView, prop, index, isClassBased) {
    // `TNode` to use for resolving static styling. Also controls search direction.
    //   - `TNode` search next and quit as soon as `isStylingValuePresent(value)` is true.
    //      If no value found consult `tNode.residualStyle`/`tNode.residualClass` for default value.
    //   - `null` search prev and go all the way to end. Return last value where
    //     `isStylingValuePresent(value)` is true.
    var isPrevDirection = tNode === null;
    var value = undefined;
    while (index > 0) {
        var rawKey = tData[index];
        var containsStatics = Array.isArray(rawKey);
        // Unwrap the key if we contain static values.
        var key = containsStatics ? rawKey[1] : rawKey;
        var isStylingMap = key === null;
        var valueAtLViewIndex = lView[index + 1];
        if (valueAtLViewIndex === NO_CHANGE) {
            // In firstUpdatePass the styling instructions create a linked list of styling.
            // On subsequent passes it is possible for a styling instruction to try to read a binding
            // which
            // has not yet executed. In that case we will find `NO_CHANGE` and we should assume that
            // we have `undefined` (or empty array in case of styling-map instruction) instead. This
            // allows the resolution to apply the value (which may later be overwritten when the
            // binding actually executes.)
            valueAtLViewIndex = isStylingMap ? EMPTY_ARRAY : undefined;
        }
        var currentValue = isStylingMap ? keyValueArrayGet(valueAtLViewIndex, prop) :
            key === prop ? valueAtLViewIndex : undefined;
        if (containsStatics && !isStylingValuePresent(currentValue)) {
            currentValue = keyValueArrayGet(rawKey, prop);
        }
        if (isStylingValuePresent(currentValue)) {
            value = currentValue;
            if (isPrevDirection) {
                return value;
            }
        }
        var tRange = tData[index + 1];
        index = isPrevDirection ? getTStylingRangePrev(tRange) : getTStylingRangeNext(tRange);
    }
    if (tNode !== null) {
        // in case where we are going in next direction AND we did not find anything, we need to
        // consult residual styling
        var residual = isClassBased ? tNode.residualClasses : tNode.residualStyles;
        if (residual != null /** OR residual !=== undefined */) {
            value = keyValueArrayGet(residual, prop);
        }
    }
    return value;
}
/**
 * Determines if the binding value should be used (or if the value is 'undefined' and hence priority
 * resolution should be used.)
 *
 * @param value Binding style value.
 */
function isStylingValuePresent(value) {
    // Currently only `undefined` value is considered non-binding. That is `undefined` says I don't
    // have an opinion as to what this binding should be and you should consult other bindings by
    // priority to determine the valid value.
    // This is extracted into a single function so that we have a single place to control this.
    return value !== undefined;
}
/**
 * Sanitizes or adds suffix to the value.
 *
 * If value is `null`/`undefined` no suffix is added
 * @param value
 * @param suffixOrSanitizer
 */
function normalizeAndApplySuffixOrSanitizer(value, suffixOrSanitizer) {
    if (value == null /** || value === undefined */) {
        // do nothing
    }
    else if (typeof suffixOrSanitizer === 'function') {
        // sanitize the value.
        value = suffixOrSanitizer(value);
    }
    else if (typeof suffixOrSanitizer === 'string') {
        value = value + suffixOrSanitizer;
    }
    else if (typeof value === 'object') {
        value = stringify(unwrapSafeValue(value));
    }
    return value;
}
/**
 * Tests if the `TNode` has input shadow.
 *
 * An input shadow is when a directive steals (shadows) the input by using `@Input('style')` or
 * `@Input('class')` as input.
 *
 * @param tNode `TNode` which we would like to see if it has shadow.
 * @param isClassBased `true` if `class` (`false` if `style`)
 */
export function hasStylingInputShadow(tNode, isClassBased) {
    return (tNode.flags & (isClassBased ? 16 /* hasClassInput */ : 32 /* hasStyleInput */)) !== 0;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaW5zdHJ1Y3Rpb25zL3N0eWxpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztFQU1FO0FBRUYsT0FBTyxFQUFZLGVBQWUsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBQ3JFLE9BQU8sRUFBQywwQkFBMEIsRUFBRSxlQUFlLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUU1RixPQUFPLEVBQWdCLGdCQUFnQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDekYsT0FBTyxFQUFDLGFBQWEsRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUN6RyxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDN0MsT0FBTyxFQUFDLHNCQUFzQixFQUFFLFNBQVMsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ3ZFLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUNoRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBSzNDLE9BQU8sRUFBNkIsb0JBQW9CLEVBQUUsNkJBQTZCLEVBQUUsb0JBQW9CLEVBQUUsNkJBQTZCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMzSyxPQUFPLEVBQUMsYUFBYSxFQUFTLFFBQVEsRUFBZSxNQUFNLG9CQUFvQixDQUFDO0FBQ2hGLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUNsRCxPQUFPLEVBQUMsd0JBQXdCLEVBQUUsd0JBQXdCLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxxQkFBcUIsRUFBRSx3QkFBd0IsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUNuSyxP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RztBQUNILFNBQVMsa0NBQWtDLENBQ3ZDLEtBQVUsRUFBRSxpQkFBMEQ7SUFFeEUsSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLDZCQUE2QixFQUFFO1FBQy9DLGFBQWE7S0FDZDtTQUFNLElBQUksT0FBTyxpQkFBaUIsS0FBSyxVQUFVLEVBQUU7UUFDbEQsc0JBQXNCO1FBQ3RCLEtBQUssR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNsQztTQUFNLElBQUksT0FBTyxpQkFBaUIsS0FBSyxRQUFRLEVBQUU7UUFDaEQsS0FBSyxHQUFHLEtBQUssR0FBRyxpQkFBaUIsQ0FBQztLQUNuQztTQUFNLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1FBQ3BDLEtBQUssR0FBRyxTQUFTLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDM0M7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUM7QUFHRDs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sVUFBVSxxQkFBcUIsQ0FBQyxLQUFZLEVBQUUsWUFBcUI7SUFDdkUsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyx3QkFBMEIsQ0FBQyx1QkFBeUIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3BHLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiogQGxpY2Vuc2VcbiogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4qXG4qIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4qIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiovXG5cbmltcG9ydCB7U2FmZVZhbHVlLCB1bndyYXBTYWZlVmFsdWV9IGZyb20gJy4uLy4uL3Nhbml0aXphdGlvbi9ieXBhc3MnO1xuaW1wb3J0IHtzdHlsZVByb3BOZWVkc1Nhbml0aXphdGlvbiwgybXJtXNhbml0aXplU3R5bGV9IGZyb20gJy4uLy4uL3Nhbml0aXphdGlvbi9zYW5pdGl6YXRpb24nO1xuaW1wb3J0IHtTdHlsZVNhbml0aXplRm59IGZyb20gJy4uLy4uL3Nhbml0aXphdGlvbi9zdHlsZV9zYW5pdGl6ZXInO1xuaW1wb3J0IHtLZXlWYWx1ZUFycmF5LCBrZXlWYWx1ZUFycmF5R2V0LCBrZXlWYWx1ZUFycmF5U2V0fSBmcm9tICcuLi8uLi91dGlsL2FycmF5X3V0aWxzJztcbmltcG9ydCB7YXNzZXJ0RGVmaW5lZCwgYXNzZXJ0RXF1YWwsIGFzc2VydExlc3NUaGFuLCBhc3NlcnROb3RFcXVhbCwgdGhyb3dFcnJvcn0gZnJvbSAnLi4vLi4vdXRpbC9hc3NlcnQnO1xuaW1wb3J0IHtFTVBUWV9BUlJBWX0gZnJvbSAnLi4vLi4vdXRpbC9lbXB0eSc7XG5pbXBvcnQge2NvbmNhdFN0cmluZ3NXaXRoU3BhY2UsIHN0cmluZ2lmeX0gZnJvbSAnLi4vLi4vdXRpbC9zdHJpbmdpZnknO1xuaW1wb3J0IHthc3NlcnRGaXJzdFVwZGF0ZVBhc3N9IGZyb20gJy4uL2Fzc2VydCc7XG5pbXBvcnQge2JpbmRpbmdVcGRhdGVkfSBmcm9tICcuLi9iaW5kaW5ncyc7XG5pbXBvcnQge0RpcmVjdGl2ZURlZn0gZnJvbSAnLi4vaW50ZXJmYWNlcy9kZWZpbml0aW9uJztcbmltcG9ydCB7QXR0cmlidXRlTWFya2VyLCBUQXR0cmlidXRlcywgVE5vZGUsIFROb2RlRmxhZ3MsIFROb2RlVHlwZX0gZnJvbSAnLi4vaW50ZXJmYWNlcy9ub2RlJztcbmltcG9ydCB7UkVsZW1lbnQsIFJlbmRlcmVyM30gZnJvbSAnLi4vaW50ZXJmYWNlcy9yZW5kZXJlcic7XG5pbXBvcnQge1Nhbml0aXplckZufSBmcm9tICcuLi9pbnRlcmZhY2VzL3Nhbml0aXphdGlvbic7XG5pbXBvcnQge1RTdHlsaW5nS2V5LCBUU3R5bGluZ1JhbmdlLCBnZXRUU3R5bGluZ1JhbmdlTmV4dCwgZ2V0VFN0eWxpbmdSYW5nZU5leHREdXBsaWNhdGUsIGdldFRTdHlsaW5nUmFuZ2VQcmV2LCBnZXRUU3R5bGluZ1JhbmdlUHJldkR1cGxpY2F0ZX0gZnJvbSAnLi4vaW50ZXJmYWNlcy9zdHlsaW5nJztcbmltcG9ydCB7SEVBREVSX09GRlNFVCwgTFZpZXcsIFJFTkRFUkVSLCBURGF0YSwgVFZpZXd9IGZyb20gJy4uL2ludGVyZmFjZXMvdmlldyc7XG5pbXBvcnQge2FwcGx5U3R5bGluZ30gZnJvbSAnLi4vbm9kZV9tYW5pcHVsYXRpb24nO1xuaW1wb3J0IHtnZXRDdXJyZW50RGlyZWN0aXZlSW5kZXgsIGdldEN1cnJlbnRTdHlsZVNhbml0aXplciwgZ2V0TFZpZXcsIGdldFNlbGVjdGVkSW5kZXgsIGdldFRWaWV3LCBpbmNyZW1lbnRCaW5kaW5nSW5kZXgsIHNldEN1cnJlbnRTdHlsZVNhbml0aXplcn0gZnJvbSAnLi4vc3RhdGUnO1xuaW1wb3J0IHtpbnNlcnRUU3R5bGluZ0JpbmRpbmd9IGZyb20gJy4uL3N0eWxpbmcvc3R5bGVfYmluZGluZ19saXN0JztcbmltcG9ydCB7Z2V0TGFzdFBhcnNlZEtleSwgZ2V0TGFzdFBhcnNlZFZhbHVlLCBwYXJzZUNsYXNzTmFtZSwgcGFyc2VDbGFzc05hbWVOZXh0LCBwYXJzZVN0eWxlLCBwYXJzZVN0eWxlTmV4dH0gZnJvbSAnLi4vc3R5bGluZy9zdHlsaW5nX3BhcnNlcic7XG5pbXBvcnQge05PX0NIQU5HRX0gZnJvbSAnLi4vdG9rZW5zJztcbmltcG9ydCB7Z2V0TmF0aXZlQnlJbmRleH0gZnJvbSAnLi4vdXRpbC92aWV3X3V0aWxzJztcbmltcG9ydCB7c2V0RGlyZWN0aXZlSW5wdXRzV2hpY2hTaGFkb3dzU3R5bGluZ30gZnJvbSAnLi9wcm9wZXJ0eSc7XG5cblxuLyoqXG4gKiBTZXRzIHRoZSBjdXJyZW50IHN0eWxlIHNhbml0aXplciBmdW5jdGlvbiB3aGljaCB3aWxsIHRoZW4gYmUgdXNlZFxuICogd2l0aGluIGFsbCBmb2xsb3ctdXAgcHJvcCBhbmQgbWFwLWJhc2VkIHN0eWxlIGJpbmRpbmcgaW5zdHJ1Y3Rpb25zXG4gKiBmb3IgdGhlIGdpdmVuIGVsZW1lbnQuXG4gKlxuICogTm90ZSB0aGF0IG9uY2Ugc3R5bGluZyBoYXMgYmVlbiBhcHBsaWVkIHRvIHRoZSBlbGVtZW50IChpLmUuIG9uY2VcbiAqIGBhZHZhbmNlKG4pYCBpcyBleGVjdXRlZCBvciB0aGUgaG9zdEJpbmRpbmdzL3RlbXBsYXRlIGZ1bmN0aW9uIGV4aXRzKVxuICogdGhlbiB0aGUgYWN0aXZlIGBzYW5pdGl6ZXJGbmAgd2lsbCBiZSBzZXQgdG8gYG51bGxgLiBUaGlzIG1lYW5zIHRoYXRcbiAqIG9uY2Ugc3R5bGluZyBpcyBhcHBsaWVkIHRvIGFub3RoZXIgZWxlbWVudCB0aGVuIGEgYW5vdGhlciBjYWxsIHRvXG4gKiBgc3R5bGVTYW5pdGl6ZXJgIHdpbGwgbmVlZCB0byBiZSBtYWRlLlxuICpcbiAqIEBwYXJhbSBzYW5pdGl6ZXJGbiBUaGUgc2FuaXRpemF0aW9uIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSB1c2VkIHRvXG4gKiAgICAgICBwcm9jZXNzIHN0eWxlIHByb3AvdmFsdWUgZW50cmllcy5cbiAqXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtXN0eWxlU2FuaXRpemVyKHNhbml0aXplcjogU3R5bGVTYW5pdGl6ZUZuIHwgbnVsbCk6IHZvaWQge1xuICBzZXRDdXJyZW50U3R5bGVTYW5pdGl6ZXIoc2FuaXRpemVyKTtcbn1cblxuLyoqXG4gKiBVcGRhdGUgYSBzdHlsZSBiaW5kaW5nIG9uIGFuIGVsZW1lbnQgd2l0aCB0aGUgcHJvdmlkZWQgdmFsdWUuXG4gKlxuICogSWYgdGhlIHN0eWxlIHZhbHVlIGlzIGZhbHN5IHRoZW4gaXQgd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlIGVsZW1lbnRcbiAqIChvciBhc3NpZ25lZCBhIGRpZmZlcmVudCB2YWx1ZSBkZXBlbmRpbmcgaWYgdGhlcmUgYXJlIGFueSBzdHlsZXMgcGxhY2VkXG4gKiBvbiB0aGUgZWxlbWVudCB3aXRoIGBzdHlsZU1hcGAgb3IgYW55IHN0YXRpYyBzdHlsZXMgdGhhdCBhcmVcbiAqIHByZXNlbnQgZnJvbSB3aGVuIHRoZSBlbGVtZW50IHdhcyBjcmVhdGVkIHdpdGggYHN0eWxpbmdgKS5cbiAqXG4gKiBOb3RlIHRoYXQgdGhlIHN0eWxpbmcgZWxlbWVudCBpcyB1cGRhdGVkIGFzIHBhcnQgb2YgYHN0eWxpbmdBcHBseWAuXG4gKlxuICogQHBhcmFtIHByb3AgQSB2YWxpZCBDU1MgcHJvcGVydHkuXG4gKiBAcGFyYW0gdmFsdWUgTmV3IHZhbHVlIHRvIHdyaXRlIChgbnVsbGAgb3IgYW4gZW1wdHkgc3RyaW5nIHRvIHJlbW92ZSkuXG4gKiBAcGFyYW0gc3VmZml4IE9wdGlvbmFsIHN1ZmZpeC4gVXNlZCB3aXRoIHNjYWxhciB2YWx1ZXMgdG8gYWRkIHVuaXQgc3VjaCBhcyBgcHhgLlxuICogICAgICAgIE5vdGUgdGhhdCB3aGVuIGEgc3VmZml4IGlzIHByb3ZpZGVkIHRoZW4gdGhlIHVuZGVybHlpbmcgc2FuaXRpemVyIHdpbGxcbiAqICAgICAgICBiZSBpZ25vcmVkLlxuICpcbiAqIE5vdGUgdGhhdCB0aGlzIHdpbGwgYXBwbHkgdGhlIHByb3ZpZGVkIHN0eWxlIHZhbHVlIHRvIHRoZSBob3N0IGVsZW1lbnQgaWYgdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWRcbiAqIHdpdGhpbiBhIGhvc3QgYmluZGluZyBmdW5jdGlvbi5cbiAqXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtXN0eWxlUHJvcChcbiAgICBwcm9wOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBTYWZlVmFsdWUgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgIHN1ZmZpeD86IHN0cmluZyB8IG51bGwpOiB0eXBlb2YgybXJtXN0eWxlUHJvcCB7XG4gIGNoZWNrU3R5bGluZ1Byb3BlcnR5KHByb3AsIHZhbHVlLCBzdWZmaXgsIGZhbHNlKTtcbiAgcmV0dXJuIMm1ybVzdHlsZVByb3A7XG59XG5cbi8qKlxuICogVXBkYXRlIGEgY2xhc3MgYmluZGluZyBvbiBhbiBlbGVtZW50IHdpdGggdGhlIHByb3ZpZGVkIHZhbHVlLlxuICpcbiAqIFRoaXMgaW5zdHJ1Y3Rpb24gaXMgbWVhbnQgdG8gaGFuZGxlIHRoZSBgW2NsYXNzLmZvb109XCJleHBcImAgY2FzZSBhbmQsXG4gKiB0aGVyZWZvcmUsIHRoZSBjbGFzcyBiaW5kaW5nIGl0c2VsZiBtdXN0IGFscmVhZHkgYmUgYWxsb2NhdGVkIHVzaW5nXG4gKiBgc3R5bGluZ2Agd2l0aGluIHRoZSBjcmVhdGlvbiBibG9jay5cbiAqXG4gKiBAcGFyYW0gcHJvcCBBIHZhbGlkIENTUyBjbGFzcyAob25seSBvbmUpLlxuICogQHBhcmFtIHZhbHVlIEEgdHJ1ZS9mYWxzZSB2YWx1ZSB3aGljaCB3aWxsIHR1cm4gdGhlIGNsYXNzIG9uIG9yIG9mZi5cbiAqXG4gKiBOb3RlIHRoYXQgdGhpcyB3aWxsIGFwcGx5IHRoZSBwcm92aWRlZCBjbGFzcyB2YWx1ZSB0byB0aGUgaG9zdCBlbGVtZW50IGlmIHRoaXMgZnVuY3Rpb25cbiAqIGlzIGNhbGxlZCB3aXRoaW4gYSBob3N0IGJpbmRpbmcgZnVuY3Rpb24uXG4gKlxuICogQGNvZGVHZW5BcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIMm1ybVjbGFzc1Byb3AoXG4gICAgY2xhc3NOYW1lOiBzdHJpbmcsIHZhbHVlOiBib29sZWFuIHwgdW5kZWZpbmVkIHwgbnVsbCk6IHR5cGVvZiDJtcm1Y2xhc3NQcm9wIHtcbiAgY2hlY2tTdHlsaW5nUHJvcGVydHkoY2xhc3NOYW1lLCB2YWx1ZSwgbnVsbCwgdHJ1ZSk7XG4gIHJldHVybiDJtcm1Y2xhc3NQcm9wO1xufVxuXG5cbi8qKlxuICogVXBkYXRlIHN0eWxlIGJpbmRpbmdzIHVzaW5nIGFuIG9iamVjdCBsaXRlcmFsIG9uIGFuIGVsZW1lbnQuXG4gKlxuICogVGhpcyBpbnN0cnVjdGlvbiBpcyBtZWFudCB0byBhcHBseSBzdHlsaW5nIHZpYSB0aGUgYFtzdHlsZV09XCJleHBcImAgdGVtcGxhdGUgYmluZGluZ3MuXG4gKiBXaGVuIHN0eWxlcyBhcmUgYXBwbGllZCB0byB0aGUgZWxlbWVudCB0aGV5IHdpbGwgdGhlbiBiZSB1cGRhdGVkIHdpdGggcmVzcGVjdCB0b1xuICogYW55IHN0eWxlcy9jbGFzc2VzIHNldCB2aWEgYHN0eWxlUHJvcGAuIElmIGFueSBzdHlsZXMgYXJlIHNldCB0byBmYWxzeVxuICogdGhlbiB0aGV5IHdpbGwgYmUgcmVtb3ZlZCBmcm9tIHRoZSBlbGVtZW50LlxuICpcbiAqIE5vdGUgdGhhdCB0aGUgc3R5bGluZyBpbnN0cnVjdGlvbiB3aWxsIG5vdCBiZSBhcHBsaWVkIHVudGlsIGBzdHlsaW5nQXBwbHlgIGlzIGNhbGxlZC5cbiAqXG4gKiBAcGFyYW0gc3R5bGVzIEEga2V5L3ZhbHVlIHN0eWxlIG1hcCBvZiB0aGUgc3R5bGVzIHRoYXQgd2lsbCBiZSBhcHBsaWVkIHRvIHRoZSBnaXZlbiBlbGVtZW50LlxuICogICAgICAgIEFueSBtaXNzaW5nIHN0eWxlcyAodGhhdCBoYXZlIGFscmVhZHkgYmVlbiBhcHBsaWVkIHRvIHRoZSBlbGVtZW50IGJlZm9yZWhhbmQpIHdpbGwgYmVcbiAqICAgICAgICByZW1vdmVkICh1bnNldCkgZnJvbSB0aGUgZWxlbWVudCdzIHN0eWxpbmcuXG4gKlxuICogTm90ZSB0aGF0IHRoaXMgd2lsbCBhcHBseSB0aGUgcHJvdmlkZWQgc3R5bGVNYXAgdmFsdWUgdG8gdGhlIGhvc3QgZWxlbWVudCBpZiB0aGlzIGZ1bmN0aW9uXG4gKiBpcyBjYWxsZWQgd2l0aGluIGEgaG9zdCBiaW5kaW5nLlxuICpcbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1c3R5bGVNYXAoc3R5bGVzOiB7W3N0eWxlTmFtZTogc3RyaW5nXTogYW55fSB8IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGwpOiB2b2lkIHtcbiAgY2hlY2tTdHlsaW5nTWFwKHN0eWxlS2V5VmFsdWVBcnJheVNldCwgc3R5bGVTdHJpbmdQYXJzZXIsIHN0eWxlcywgZmFsc2UpO1xufVxuXG5cbi8qKlxuICogUGFyc2UgdGV4dCBhcyBzdHlsZSBhbmQgYWRkIHZhbHVlcyB0byBLZXlWYWx1ZUFycmF5LlxuICpcbiAqIFRoaXMgY29kZSBpcyBwdWxsZWQgb3V0IHRvIGEgc2VwYXJhdGUgZnVuY3Rpb24gc28gdGhhdCBpdCBjYW4gYmUgdHJlZSBzaGFrZW4gYXdheSBpZiBpdCBpcyBub3RcbiAqIG5lZWRlZC4gSXQgaXMgb25seSByZWZlcmVuY2VkIGZyb20gYMm1ybVzdHlsZU1hcGAuXG4gKlxuICogQHBhcmFtIGtleVZhbHVlQXJyYXkgS2V5VmFsdWVBcnJheSB0byBhZGQgcGFyc2VkIHZhbHVlcyB0by5cbiAqIEBwYXJhbSB0ZXh0IHRleHQgdG8gcGFyc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHlsZVN0cmluZ1BhcnNlcihrZXlWYWx1ZUFycmF5OiBLZXlWYWx1ZUFycmF5PGFueT4sIHRleHQ6IHN0cmluZyk6IHZvaWQge1xuICBmb3IgKGxldCBpID0gcGFyc2VTdHlsZSh0ZXh0KTsgaSA+PSAwOyBpID0gcGFyc2VTdHlsZU5leHQodGV4dCwgaSkpIHtcbiAgICBzdHlsZUtleVZhbHVlQXJyYXlTZXQoa2V5VmFsdWVBcnJheSwgZ2V0TGFzdFBhcnNlZEtleSh0ZXh0KSwgZ2V0TGFzdFBhcnNlZFZhbHVlKHRleHQpKTtcbiAgfVxufVxuXG5cbi8qKlxuICogVXBkYXRlIGNsYXNzIGJpbmRpbmdzIHVzaW5nIGFuIG9iamVjdCBsaXRlcmFsIG9yIGNsYXNzLXN0cmluZyBvbiBhbiBlbGVtZW50LlxuICpcbiAqIFRoaXMgaW5zdHJ1Y3Rpb24gaXMgbWVhbnQgdG8gYXBwbHkgc3R5bGluZyB2aWEgdGhlIGBbY2xhc3NdPVwiZXhwXCJgIHRlbXBsYXRlIGJpbmRpbmdzLlxuICogV2hlbiBjbGFzc2VzIGFyZSBhcHBsaWVkIHRvIHRoZSBlbGVtZW50IHRoZXkgd2lsbCB0aGVuIGJlIHVwZGF0ZWQgd2l0aFxuICogcmVzcGVjdCB0byBhbnkgc3R5bGVzL2NsYXNzZXMgc2V0IHZpYSBgY2xhc3NQcm9wYC4gSWYgYW55XG4gKiBjbGFzc2VzIGFyZSBzZXQgdG8gZmFsc3kgdGhlbiB0aGV5IHdpbGwgYmUgcmVtb3ZlZCBmcm9tIHRoZSBlbGVtZW50LlxuICpcbiAqIE5vdGUgdGhhdCB0aGUgc3R5bGluZyBpbnN0cnVjdGlvbiB3aWxsIG5vdCBiZSBhcHBsaWVkIHVudGlsIGBzdHlsaW5nQXBwbHlgIGlzIGNhbGxlZC5cbiAqIE5vdGUgdGhhdCB0aGlzIHdpbGwgdGhlIHByb3ZpZGVkIGNsYXNzTWFwIHZhbHVlIHRvIHRoZSBob3N0IGVsZW1lbnQgaWYgdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWRcbiAqIHdpdGhpbiBhIGhvc3QgYmluZGluZy5cbiAqXG4gKiBAcGFyYW0gY2xhc3NlcyBBIGtleS92YWx1ZSBtYXAgb3Igc3RyaW5nIG9mIENTUyBjbGFzc2VzIHRoYXQgd2lsbCBiZSBhZGRlZCB0byB0aGVcbiAqICAgICAgICBnaXZlbiBlbGVtZW50LiBBbnkgbWlzc2luZyBjbGFzc2VzICh0aGF0IGhhdmUgYWxyZWFkeSBiZWVuIGFwcGxpZWQgdG8gdGhlIGVsZW1lbnRcbiAqICAgICAgICBiZWZvcmVoYW5kKSB3aWxsIGJlIHJlbW92ZWQgKHVuc2V0KSBmcm9tIHRoZSBlbGVtZW50J3MgbGlzdCBvZiBDU1MgY2xhc3Nlcy5cbiAqXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtWNsYXNzTWFwKFxuICAgIGNsYXNzZXM6IHtbY2xhc3NOYW1lOiBzdHJpbmddOiBib29sZWFuIHwgdW5kZWZpbmVkIHwgbnVsbH0gfCBzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsKTogdm9pZCB7XG4gIGNoZWNrU3R5bGluZ01hcChrZXlWYWx1ZUFycmF5U2V0LCBjbGFzc1N0cmluZ1BhcnNlciwgY2xhc3NlcywgdHJ1ZSk7XG59XG5cbi8qKlxuICogUGFyc2UgdGV4dCBhcyBjbGFzcyBhbmQgYWRkIHZhbHVlcyB0byBLZXlWYWx1ZUFycmF5LlxuICpcbiAqIFRoaXMgY29kZSBpcyBwdWxsZWQgb3V0IHRvIGEgc2VwYXJhdGUgZnVuY3Rpb24gc28gdGhhdCBpdCBjYW4gYmUgdHJlZSBzaGFrZW4gYXdheSBpZiBpdCBpcyBub3RcbiAqIG5lZWRlZC4gSXQgaXMgb25seSByZWZlcmVuY2VkIGZyb20gYMm1ybVjbGFzc01hcGAuXG4gKlxuICogQHBhcmFtIGtleVZhbHVlQXJyYXkgS2V5VmFsdWVBcnJheSB0byBhZGQgcGFyc2VkIHZhbHVlcyB0by5cbiAqIEBwYXJhbSB0ZXh0IHRleHQgdG8gcGFyc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGFzc1N0cmluZ1BhcnNlcihrZXlWYWx1ZUFycmF5OiBLZXlWYWx1ZUFycmF5PGFueT4sIHRleHQ6IHN0cmluZyk6IHZvaWQge1xuICBmb3IgKGxldCBpID0gcGFyc2VDbGFzc05hbWUodGV4dCk7IGkgPj0gMDsgaSA9IHBhcnNlQ2xhc3NOYW1lTmV4dCh0ZXh0LCBpKSkge1xuICAgIGtleVZhbHVlQXJyYXlTZXQoa2V5VmFsdWVBcnJheSwgZ2V0TGFzdFBhcnNlZEtleSh0ZXh0KSwgdHJ1ZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb21tb24gY29kZSBiZXR3ZWVuIGDJtcm1Y2xhc3NQcm9wYCBhbmQgYMm1ybVzdHlsZVByb3BgLlxuICpcbiAqIEBwYXJhbSBwcm9wIHByb3BlcnR5IG5hbWUuXG4gKiBAcGFyYW0gdmFsdWUgYmluZGluZyB2YWx1ZS5cbiAqIEBwYXJhbSBzdWZmaXhPclNhbml0aXplciBzdWZmaXggb3Igc2FuaXRpemF0aW9uIGZ1bmN0aW9uXG4gKiBAcGFyYW0gaXNDbGFzc0Jhc2VkIGB0cnVlYCBpZiBgY2xhc3NgIGNoYW5nZSAoYGZhbHNlYCBpZiBgc3R5bGVgKVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tTdHlsaW5nUHJvcGVydHkoXG4gICAgcHJvcDogc3RyaW5nLCB2YWx1ZTogYW55IHwgTk9fQ0hBTkdFLFxuICAgIHN1ZmZpeE9yU2FuaXRpemVyOiBTYW5pdGl6ZXJGbiB8IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGwsIGlzQ2xhc3NCYXNlZDogYm9vbGVhbik6IHZvaWQge1xuICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG4gIGNvbnN0IHRWaWV3ID0gZ2V0VFZpZXcoKTtcbiAgLy8gU3R5bGluZyBpbnN0cnVjdGlvbnMgdXNlIDIgc2xvdHMgcGVyIGJpbmRpbmcuXG4gIC8vIDEuIG9uZSBmb3IgdGhlIHZhbHVlIC8gVFN0eWxpbmdLZXlcbiAgLy8gMi4gb25lIGZvciB0aGUgaW50ZXJtaXR0ZW50LXZhbHVlIC8gVFN0eWxpbmdSYW5nZVxuICBjb25zdCBiaW5kaW5nSW5kZXggPSBpbmNyZW1lbnRCaW5kaW5nSW5kZXgoMik7XG4gIGlmICh0Vmlldy5maXJzdFVwZGF0ZVBhc3MpIHtcbiAgICBzdHlsaW5nRmlyc3RVcGRhdGVQYXNzKHRWaWV3LCBwcm9wLCBiaW5kaW5nSW5kZXgsIGlzQ2xhc3NCYXNlZCk7XG4gIH1cbiAgaWYgKHZhbHVlICE9PSBOT19DSEFOR0UgJiYgYmluZGluZ1VwZGF0ZWQobFZpZXcsIGJpbmRpbmdJbmRleCwgdmFsdWUpKSB7XG4gICAgLy8gVGhpcyBpcyBhIHdvcmsgYXJvdW5kLiBPbmNlIFBSIzM0NDgwIGxhbmRzIHRoZSBzYW5pdGl6ZXIgaXMgcGFzc2VkIGV4cGxpY2l0bHkgYW5kIHRoaXMgbGluZVxuICAgIC8vIGNhbiBiZSByZW1vdmVkLlxuICAgIGxldCBzdHlsZVNhbml0aXplcjogU3R5bGVTYW5pdGl6ZUZufG51bGw7XG4gICAgaWYgKHN1ZmZpeE9yU2FuaXRpemVyID09IG51bGwpIHtcbiAgICAgIGlmIChzdHlsZVNhbml0aXplciA9IGdldEN1cnJlbnRTdHlsZVNhbml0aXplcigpKSB7XG4gICAgICAgIHN1ZmZpeE9yU2FuaXRpemVyID0gc3R5bGVTYW5pdGl6ZXIgYXMgYW55O1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCB0Tm9kZSA9IHRWaWV3LmRhdGFbZ2V0U2VsZWN0ZWRJbmRleCgpICsgSEVBREVSX09GRlNFVF0gYXMgVE5vZGU7XG4gICAgdXBkYXRlU3R5bGluZyhcbiAgICAgICAgdFZpZXcsIHROb2RlLCBsVmlldywgbFZpZXdbUkVOREVSRVJdLCBwcm9wLFxuICAgICAgICBsVmlld1tiaW5kaW5nSW5kZXggKyAxXSA9IG5vcm1hbGl6ZUFuZEFwcGx5U3VmZml4T3JTYW5pdGl6ZXIodmFsdWUsIHN1ZmZpeE9yU2FuaXRpemVyKSxcbiAgICAgICAgaXNDbGFzc0Jhc2VkLCBiaW5kaW5nSW5kZXgpO1xuICB9XG59XG5cbi8qKlxuICogQ29tbW9uIGNvZGUgYmV0d2VlbiBgybXJtWNsYXNzTWFwYCBhbmQgYMm1ybVzdHlsZU1hcGAuXG4gKlxuICogQHBhcmFtIGtleVZhbHVlQXJyYXlTZXQgKFNlZSBga2V5VmFsdWVBcnJheVNldGAgaW4gXCJ1dGlsL2FycmF5X3V0aWxzXCIpIEdldHMgcGFzc2VkIGluIGFzIGFcbiAqIGZ1bmN0aW9uIHNvIHRoYXRcbiAqICAgICAgICBgc3R5bGVgIGNhbiBwYXNzIGluIHZlcnNpb24gd2hpY2ggZG9lcyBzYW5pdGl6YXRpb24uIFRoaXMgaXMgZG9uZSBmb3IgdHJlZSBzaGFraW5nXG4gKiAgICAgICAgcHVycG9zZXMuXG4gKiBAcGFyYW0gc3RyaW5nUGFyc2VyIFBhcnNlciB1c2VkIHRvIHBhcnNlIGB2YWx1ZWAgaWYgYHN0cmluZ2AuIChQYXNzZWQgaW4gYXMgYHN0eWxlYCBhbmQgYGNsYXNzYFxuICogICAgICAgIGhhdmUgZGlmZmVyZW50IHBhcnNlcnMuKVxuICogQHBhcmFtIHZhbHVlIGJvdW5kIHZhbHVlIGZyb20gYXBwbGljYXRpb25cbiAqIEBwYXJhbSBpc0NsYXNzQmFzZWQgYHRydWVgIGlmIGBjbGFzc2AgY2hhbmdlIChgZmFsc2VgIGlmIGBzdHlsZWApXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja1N0eWxpbmdNYXAoXG4gICAga2V5VmFsdWVBcnJheVNldDogKGtleVZhbHVlQXJyYXk6IEtleVZhbHVlQXJyYXk8YW55Piwga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpID0+IHZvaWQsXG4gICAgc3RyaW5nUGFyc2VyOiAoc3R5bGVLZXlWYWx1ZUFycmF5OiBLZXlWYWx1ZUFycmF5PGFueT4sIHRleHQ6IHN0cmluZykgPT4gdm9pZCxcbiAgICB2YWx1ZTogYW55fE5PX0NIQU5HRSwgaXNDbGFzc0Jhc2VkOiBib29sZWFuKTogdm9pZCB7XG4gIGNvbnN0IHRWaWV3ID0gZ2V0VFZpZXcoKTtcbiAgY29uc3QgYmluZGluZ0luZGV4ID0gaW5jcmVtZW50QmluZGluZ0luZGV4KDIpO1xuICBpZiAodFZpZXcuZmlyc3RVcGRhdGVQYXNzKSB7XG4gICAgc3R5bGluZ0ZpcnN0VXBkYXRlUGFzcyh0VmlldywgbnVsbCwgYmluZGluZ0luZGV4LCBpc0NsYXNzQmFzZWQpO1xuICB9XG4gIGNvbnN0IGxWaWV3ID0gZ2V0TFZpZXcoKTtcbiAgaWYgKHZhbHVlICE9PSBOT19DSEFOR0UgJiYgYmluZGluZ1VwZGF0ZWQobFZpZXcsIGJpbmRpbmdJbmRleCwgdmFsdWUpKSB7XG4gICAgLy8gYGdldFNlbGVjdGVkSW5kZXgoKWAgc2hvdWxkIGJlIGhlcmUgKHJhdGhlciB0aGFuIGluIGluc3RydWN0aW9uKSBzbyB0aGF0IGl0IGlzIGd1YXJkZWQgYnkgdGhlXG4gICAgLy8gaWYgc28gYXMgbm90IHRvIHJlYWQgdW5uZWNlc3NhcmlseS5cbiAgICBjb25zdCB0Tm9kZSA9IHRWaWV3LmRhdGFbZ2V0U2VsZWN0ZWRJbmRleCgpICsgSEVBREVSX09GRlNFVF0gYXMgVE5vZGU7XG4gICAgaWYgKGhhc1N0eWxpbmdJbnB1dFNoYWRvdyh0Tm9kZSwgaXNDbGFzc0Jhc2VkKSAmJiAhaXNJbkhvc3RCaW5kaW5ncyh0VmlldywgYmluZGluZ0luZGV4KSkge1xuICAgICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgICAvLyB2ZXJpZnkgdGhhdCBpZiB3ZSBhcmUgc2hhZG93aW5nIHRoZW4gYFREYXRhYCBpcyBhcHByb3ByaWF0ZWx5IG1hcmtlZCBzbyB0aGF0IHdlIHNraXBcbiAgICAgICAgLy8gcHJvY2Vzc2luZyB0aGlzIGJpbmRpbmcgaW4gc3R5bGluZyByZXNvbHV0aW9uLlxuICAgICAgICBjb25zdCB0U3R5bGluZ0tleSA9IHRWaWV3LmRhdGFbYmluZGluZ0luZGV4XTtcbiAgICAgICAgYXNzZXJ0RXF1YWwoXG4gICAgICAgICAgICBBcnJheS5pc0FycmF5KHRTdHlsaW5nS2V5KSA/IHRTdHlsaW5nS2V5WzFdIDogdFN0eWxpbmdLZXksIGZhbHNlLFxuICAgICAgICAgICAgJ1N0eWxpbmcgbGlua2VkIGxpc3Qgc2hhZG93IGlucHV0IHNob3VsZCBiZSBtYXJrZWQgYXMgXFwnZmFsc2VcXCcnKTtcbiAgICAgIH1cbiAgICAgIC8vIFZFIGRvZXMgbm90IGNvbmNhdGVuYXRlIHRoZSBzdGF0aWMgcG9ydGlvbiBsaWtlIHdlIGFyZSBkb2luZyBoZXJlLlxuICAgICAgLy8gSW5zdGVhZCBWRSBqdXN0IGlnbm9yZXMgdGhlIHN0YXRpYyBjb21wbGV0ZWx5IGlmIGR5bmFtaWMgYmluZGluZyBpcyBwcmVzZW50LlxuICAgICAgLy8gQmVjYXVzZSBvZiBsb2NhbGl0eSB3ZSBoYXZlIGFscmVhZHkgc2V0IHRoZSBzdGF0aWMgcG9ydGlvbiBiZWNhdXNlIHdlIGRvbid0IGtub3cgaWYgdGhlcmVcbiAgICAgIC8vIGlzIGEgZHluYW1pYyBwb3J0aW9uIHVudGlsIGxhdGVyLiBJZiB3ZSB3b3VsZCBpZ25vcmUgdGhlIHN0YXRpYyBwb3J0aW9uIGl0IHdvdWxkIGxvb2sgbGlrZVxuICAgICAgLy8gdGhlIGJpbmRpbmcgaGFzIHJlbW92ZWQgaXQuIFRoaXMgd291bGQgY29uZnVzZSBgW25nU3R5bGVdYC9gW25nQ2xhc3NdYCB0byBkbyB0aGUgd3JvbmdcbiAgICAgIC8vIHRoaW5nIGFzIGl0IHdvdWxkIHRoaW5rIHRoYXQgdGhlIHN0YXRpYyBwb3J0aW9uIHdhcyByZW1vdmVkLiBGb3IgdGhpcyByZWFzb24gd2VcbiAgICAgIC8vIGNvbmNhdGVuYXRlIGl0IHNvIHRoYXQgYFtuZ1N0eWxlXWAvYFtuZ0NsYXNzXWAgIGNhbiBjb250aW51ZSB0byB3b3JrIG9uIGNoYW5nZWQuXG4gICAgICBsZXQgc3RhdGljUHJlZml4ID0gaXNDbGFzc0Jhc2VkID8gdE5vZGUuY2xhc3NlcyA6IHROb2RlLnN0eWxlcztcbiAgICAgIG5nRGV2TW9kZSAmJiBpc0NsYXNzQmFzZWQgPT09IGZhbHNlICYmIHN0YXRpY1ByZWZpeCAhPT0gbnVsbCAmJlxuICAgICAgICAgIGFzc2VydEVxdWFsKFxuICAgICAgICAgICAgICBzdGF0aWNQcmVmaXguZW5kc1dpdGgoJzsnKSwgdHJ1ZSwgJ0V4cGVjdGluZyBzdGF0aWMgcG9ydGlvbiB0byBlbmQgd2l0aCBcXCc7XFwnJyk7XG4gICAgICBpZiAoc3RhdGljUHJlZml4ICE9PSBudWxsKSB7XG4gICAgICAgIC8vIFdlIHdhbnQgdG8gbWFrZSBzdXJlIHRoYXQgZmFsc3kgdmFsdWVzIG9mIGB2YWx1ZWAgYmVjb21lIGVtcHR5IHN0cmluZ3MuXG4gICAgICAgIHZhbHVlID0gY29uY2F0U3RyaW5nc1dpdGhTcGFjZShzdGF0aWNQcmVmaXgsIHZhbHVlID8gdmFsdWUgOiAnJyk7XG4gICAgICB9XG4gICAgICAvLyBHaXZlbiBgPGRpdiBbc3R5bGVdIG15LWRpcj5gIHN1Y2ggdGhhdCBgbXktZGlyYCBoYXMgYEBJbnB1dCgnc3R5bGUnKWAuXG4gICAgICAvLyBUaGlzIHRha2VzIG92ZXIgdGhlIGBbc3R5bGVdYCBiaW5kaW5nLiAoU2FtZSBmb3IgYFtjbGFzc11gKVxuICAgICAgc2V0RGlyZWN0aXZlSW5wdXRzV2hpY2hTaGFkb3dzU3R5bGluZyh0VmlldywgdE5vZGUsIGxWaWV3LCB2YWx1ZSwgaXNDbGFzc0Jhc2VkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdXBkYXRlU3R5bGluZ01hcChcbiAgICAgICAgICB0VmlldywgdE5vZGUsIGxWaWV3LCBsVmlld1tSRU5ERVJFUl0sIGxWaWV3W2JpbmRpbmdJbmRleCArIDFdLFxuICAgICAgICAgIGxWaWV3W2JpbmRpbmdJbmRleCArIDFdID0gdG9TdHlsaW5nS2V5VmFsdWVBcnJheShrZXlWYWx1ZUFycmF5U2V0LCBzdHJpbmdQYXJzZXIsIHZhbHVlKSxcbiAgICAgICAgICBpc0NsYXNzQmFzZWQsIGJpbmRpbmdJbmRleCk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGVuIHRoZSBiaW5kaW5nIGlzIGluIGBob3N0QmluZGluZ3NgIHNlY3Rpb25cbiAqXG4gKiBAcGFyYW0gdFZpZXcgQ3VycmVudCBgVFZpZXdgXG4gKiBAcGFyYW0gYmluZGluZ0luZGV4IGluZGV4IG9mIGJpbmRpbmcgd2hpY2ggd2Ugd291bGQgbGlrZSBpZiBpdCBpcyBpbiBgaG9zdEJpbmRpbmdzYFxuICovXG5mdW5jdGlvbiBpc0luSG9zdEJpbmRpbmdzKHRWaWV3OiBUVmlldywgYmluZGluZ0luZGV4OiBudW1iZXIpOiBib29sZWFuIHtcbiAgLy8gQWxsIGhvc3QgYmluZGluZ3MgYXJlIHBsYWNlZCBhZnRlciB0aGUgZXhwYW5kbyBzZWN0aW9uLlxuICByZXR1cm4gYmluZGluZ0luZGV4ID49IHRWaWV3LmV4cGFuZG9TdGFydEluZGV4O1xufVxuXG4vKipcbiogQ29sbGVjdHMgdGhlIG5lY2Vzc2FyeSBpbmZvcm1hdGlvbiB0byBpbnNlcnQgdGhlIGJpbmRpbmcgaW50byBhIGxpbmtlZCBsaXN0IG9mIHN0eWxlIGJpbmRpbmdzXG4qIHVzaW5nIGBpbnNlcnRUU3R5bGluZ0JpbmRpbmdgLlxuKlxuKiBAcGFyYW0gdFZpZXcgYFRWaWV3YCB3aGVyZSB0aGUgYmluZGluZyBsaW5rZWQgbGlzdCB3aWxsIGJlIHN0b3JlZC5cbiogQHBhcmFtIHRTdHlsaW5nS2V5IFByb3BlcnR5L2tleSBvZiB0aGUgYmluZGluZy5cbiogQHBhcmFtIGJpbmRpbmdJbmRleCBJbmRleCBvZiBiaW5kaW5nIGFzc29jaWF0ZWQgd2l0aCB0aGUgYHByb3BgXG4qIEBwYXJhbSBpc0NsYXNzQmFzZWQgYHRydWVgIGlmIGBjbGFzc2AgY2hhbmdlIChgZmFsc2VgIGlmIGBzdHlsZWApXG4qL1xuZnVuY3Rpb24gc3R5bGluZ0ZpcnN0VXBkYXRlUGFzcyhcbiAgICB0VmlldzogVFZpZXcsIHRTdHlsaW5nS2V5OiBUU3R5bGluZ0tleSwgYmluZGluZ0luZGV4OiBudW1iZXIsIGlzQ2xhc3NCYXNlZDogYm9vbGVhbik6IHZvaWQge1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0Rmlyc3RVcGRhdGVQYXNzKHRWaWV3KTtcbiAgY29uc3QgdERhdGEgPSB0Vmlldy5kYXRhO1xuICBpZiAodERhdGFbYmluZGluZ0luZGV4ICsgMV0gPT09IG51bGwpIHtcbiAgICAvLyBUaGUgYWJvdmUgY2hlY2sgaXMgbmVjZXNzYXJ5IGJlY2F1c2Ugd2UgZG9uJ3QgY2xlYXIgZmlyc3QgdXBkYXRlIHBhc3MgdW50aWwgZmlyc3Qgc3VjY2Vzc2Z1bFxuICAgIC8vIChubyBleGNlcHRpb24pIHRlbXBsYXRlIGV4ZWN1dGlvbi4gVGhpcyBwcmV2ZW50cyB0aGUgc3R5bGluZyBpbnN0cnVjdGlvbiBmcm9tIGRvdWJsZSBhZGRpbmdcbiAgICAvLyBpdHNlbGYgdG8gdGhlIGxpc3QuXG4gICAgLy8gYGdldFNlbGVjdGVkSW5kZXgoKWAgc2hvdWxkIGJlIGhlcmUgKHJhdGhlciB0aGFuIGluIGluc3RydWN0aW9uKSBzbyB0aGF0IGl0IGlzIGd1YXJkZWQgYnkgdGhlXG4gICAgLy8gaWYgc28gYXMgbm90IHRvIHJlYWQgdW5uZWNlc3NhcmlseS5cbiAgICBjb25zdCB0Tm9kZSA9IHREYXRhW2dldFNlbGVjdGVkSW5kZXgoKSArIEhFQURFUl9PRkZTRVRdIGFzIFROb2RlO1xuICAgIGNvbnN0IGlzSG9zdEJpbmRpbmdzID0gaXNJbkhvc3RCaW5kaW5ncyh0VmlldywgYmluZGluZ0luZGV4KTtcbiAgICBpZiAoaGFzU3R5bGluZ0lucHV0U2hhZG93KHROb2RlLCBpc0NsYXNzQmFzZWQpICYmIHRTdHlsaW5nS2V5ID09PSBudWxsICYmICFpc0hvc3RCaW5kaW5ncykge1xuICAgICAgLy8gYHRTdHlsaW5nS2V5ID09PSBudWxsYCBpbXBsaWVzIHRoYXQgd2UgYXJlIGVpdGhlciBgW3N0eWxlXWAgb3IgYFtjbGFzc11gIGJpbmRpbmcuXG4gICAgICAvLyBJZiB0aGVyZSBpcyBhIGRpcmVjdGl2ZSB3aGljaCB1c2VzIGBASW5wdXQoJ3N0eWxlJylgIG9yIGBASW5wdXQoJ2NsYXNzJylgIHRoYW5cbiAgICAgIC8vIHdlIG5lZWQgdG8gbmV1dHJhbGl6ZSB0aGlzIGJpbmRpbmcgc2luY2UgdGhhdCBkaXJlY3RpdmUgaXMgc2hhZG93aW5nIGl0LlxuICAgICAgLy8gV2UgdHVybiB0aGlzIGludG8gYSBub29wIGJ5IHNldHRpbmcgdGhlIGtleSB0byBgZmFsc2VgXG4gICAgICB0U3R5bGluZ0tleSA9IGZhbHNlO1xuICAgIH1cbiAgICB0U3R5bGluZ0tleSA9IHdyYXBJblN0YXRpY1N0eWxpbmdLZXkodERhdGEsIHROb2RlLCB0U3R5bGluZ0tleSwgaXNDbGFzc0Jhc2VkKTtcbiAgICBpbnNlcnRUU3R5bGluZ0JpbmRpbmcodERhdGEsIHROb2RlLCB0U3R5bGluZ0tleSwgYmluZGluZ0luZGV4LCBpc0hvc3RCaW5kaW5ncywgaXNDbGFzc0Jhc2VkKTtcbiAgfVxufVxuXG4vKipcbiAqIEFkZHMgc3RhdGljIHN0eWxpbmcgaW5mb3JtYXRpb24gdG8gdGhlIGJpbmRpbmcgaWYgYXBwbGljYWJsZS5cbiAqXG4gKiBUaGUgbGlua2VkIGxpc3Qgb2Ygc3R5bGVzIG5vdCBvbmx5IHN0b3JlcyB0aGUgbGlzdCBhbmQga2V5cywgYnV0IGFsc28gc3RvcmVzIHN0YXRpYyBzdHlsaW5nXG4gKiBpbmZvcm1hdGlvbiBvbiBzb21lIG9mIHRoZSBrZXlzLiBUaGlzIGZ1bmN0aW9uIGRldGVybWluZXMgaWYgdGhlIGtleSBzaG91bGQgY29udGFpbiB0aGUgc3R5bGluZ1xuICogaW5mb3JtYXRpb24gYW5kIGNvbXB1dGVzIGl0LlxuICpcbiAqIFNlZSBgVFN0eWxpbmdTdGF0aWNgIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogQHBhcmFtIHREYXRhIGBURGF0YWAgd2hlcmUgdGhlIGxpbmtlZCBsaXN0IGlzIHN0b3JlZC5cbiAqIEBwYXJhbSB0Tm9kZSBgVE5vZGVgIGZvciB3aGljaCB0aGUgc3R5bGluZyBpcyBiZWluZyBjb21wdXRlZC5cbiAqIEBwYXJhbSBzdHlsaW5nS2V5IGBUU3R5bGluZ0tleVByaW1pdGl2ZWAgd2hpY2ggbWF5IG5lZWQgdG8gYmUgd3JhcHBlZCBpbnRvIGBUU3R5bGluZ0tleWBcbiAqIEBwYXJhbSBpc0NsYXNzQmFzZWQgYHRydWVgIGlmIGBjbGFzc2AgKGBmYWxzZWAgaWYgYHN0eWxlYClcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdyYXBJblN0YXRpY1N0eWxpbmdLZXkoXG4gICAgdERhdGE6IFREYXRhLCB0Tm9kZTogVE5vZGUsIHN0eWxpbmdLZXk6IFRTdHlsaW5nS2V5LCBpc0NsYXNzQmFzZWQ6IGJvb2xlYW4pOiBUU3R5bGluZ0tleSB7XG4gIGNvbnN0IGhvc3REaXJlY3RpdmVEZWYgPSBnZXRIb3N0RGlyZWN0aXZlRGVmKHREYXRhKTtcbiAgbGV0IHJlc2lkdWFsID0gaXNDbGFzc0Jhc2VkID8gdE5vZGUucmVzaWR1YWxDbGFzc2VzIDogdE5vZGUucmVzaWR1YWxTdHlsZXM7XG4gIGlmIChob3N0RGlyZWN0aXZlRGVmID09PSBudWxsKSB7XG4gICAgLy8gV2UgYXJlIGluIHRlbXBsYXRlIG5vZGUuXG4gICAgLy8gSWYgdGVtcGxhdGUgbm9kZSBhbHJlYWR5IGhhZCBzdHlsaW5nIGluc3RydWN0aW9uIHRoZW4gaXQgaGFzIGFscmVhZHkgY29sbGVjdGVkIHRoZSBzdGF0aWNcbiAgICAvLyBzdHlsaW5nIGFuZCB0aGVyZSBpcyBubyBuZWVkIHRvIGNvbGxlY3QgdGhlbSBhZ2Fpbi4gV2Uga25vdyB0aGF0IHdlIGFyZSB0aGUgZmlyc3Qgc3R5bGluZ1xuICAgIC8vIGluc3RydWN0aW9uIGJlY2F1c2UgdGhlIGBUTm9kZS4qQmluZGluZ3NgIHBvaW50cyB0byAwIChub3RoaW5nIGhhcyBiZWVuIGluc2VydGVkIHlldCkuXG4gICAgY29uc3QgaXNGaXJzdFN0eWxpbmdJbnN0cnVjdGlvbkluVGVtcGxhdGUgPVxuICAgICAgICAoaXNDbGFzc0Jhc2VkID8gdE5vZGUuY2xhc3NCaW5kaW5ncyA6IHROb2RlLnN0eWxlQmluZGluZ3MpIGFzIGFueSBhcyBudW1iZXIgPT09IDA7XG4gICAgaWYgKGlzRmlyc3RTdHlsaW5nSW5zdHJ1Y3Rpb25JblRlbXBsYXRlKSB7XG4gICAgICAvLyBJdCB3b3VsZCBiZSBuaWNlIHRvIGJlIGFibGUgdG8gZ2V0IHRoZSBzdGF0aWNzIGZyb20gYG1lcmdlQXR0cnNgLCBob3dldmVyLCBhdCB0aGlzIHBvaW50XG4gICAgICAvLyB0aGV5IGFyZSBhbHJlYWR5IG1lcmdlZCBhbmQgaXQgd291bGQgbm90IGJlIHBvc3NpYmxlIHRvIGZpZ3VyZSB3aGljaCBwcm9wZXJ0eSBiZWxvbmdzIHdoZXJlXG4gICAgICAvLyBpbiB0aGUgcHJpb3JpdHkuXG4gICAgICBzdHlsaW5nS2V5ID0gY29sbGVjdFN0eWxpbmdGcm9tRGlyZWN0aXZlcyhudWxsLCB0RGF0YSwgdE5vZGUsIHN0eWxpbmdLZXksIGlzQ2xhc3NCYXNlZCk7XG4gICAgICBzdHlsaW5nS2V5ID0gY29sbGVjdFN0eWxpbmdGcm9tVEF0dHJzKHN0eWxpbmdLZXksIHROb2RlLmF0dHJzLCBpc0NsYXNzQmFzZWQpO1xuICAgICAgLy8gV2Uga25vdyB0aGF0IGlmIHdlIGhhdmUgc3R5bGluZyBiaW5kaW5nIGluIHRlbXBsYXRlIHdlIGNhbid0IGhhdmUgcmVzaWR1YWwuXG4gICAgICByZXNpZHVhbCA9IG51bGw7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIFdlIGFyZSBpbiBob3N0IGJpbmRpbmcgbm9kZSBhbmQgdGhlcmUgd2FzIG5vIGJpbmRpbmcgaW5zdHJ1Y3Rpb24gaW4gdGVtcGxhdGUgbm9kZS5cbiAgICAvLyBUaGlzIG1lYW5zIHRoYXQgd2UgbmVlZCB0byBjb21wdXRlIHRoZSByZXNpZHVhbC5cbiAgICBjb25zdCBkaXJlY3RpdmVTdHlsaW5nTGFzdCA9IHROb2RlLmRpcmVjdGl2ZVN0eWxpbmdMYXN0O1xuICAgIGNvbnN0IGlzRmlyc3RTdHlsaW5nSW5zdHJ1Y3Rpb25Jbkhvc3RCaW5kaW5nID1cbiAgICAgICAgZGlyZWN0aXZlU3R5bGluZ0xhc3QgPT09IC0xIHx8IHREYXRhW2RpcmVjdGl2ZVN0eWxpbmdMYXN0XSAhPT0gaG9zdERpcmVjdGl2ZURlZjtcbiAgICBpZiAoaXNGaXJzdFN0eWxpbmdJbnN0cnVjdGlvbkluSG9zdEJpbmRpbmcpIHtcbiAgICAgIHN0eWxpbmdLZXkgPVxuICAgICAgICAgIGNvbGxlY3RTdHlsaW5nRnJvbURpcmVjdGl2ZXMoaG9zdERpcmVjdGl2ZURlZiwgdERhdGEsIHROb2RlLCBzdHlsaW5nS2V5LCBpc0NsYXNzQmFzZWQpO1xuICAgICAgaWYgKHJlc2lkdWFsID09PSBudWxsKSB7XG4gICAgICAgIC8vIC0gSWYgYG51bGxgIHRoYW4gZWl0aGVyOlxuICAgICAgICAvLyAgICAtIFRlbXBsYXRlIHN0eWxpbmcgaW5zdHJ1Y3Rpb24gYWxyZWFkeSByYW4gYW5kIGl0IGhhcyBjb25zdW1lZCB0aGUgc3RhdGljXG4gICAgICAgIC8vICAgICAgc3R5bGluZyBpbnRvIGl0cyBgVFN0eWxpbmdLZXlgIGFuZCBzbyB0aGVyZSBpcyBubyBuZWVkIHRvIHVwZGF0ZSByZXNpZHVhbC4gSW5zdGVhZFxuICAgICAgICAvLyAgICAgIHdlIG5lZWQgdG8gdXBkYXRlIHRoZSBgVFN0eWxpbmdLZXlgIGFzc29jaWF0ZWQgd2l0aCB0aGUgZmlyc3QgdGVtcGxhdGUgbm9kZVxuICAgICAgICAvLyAgICAgIGluc3RydWN0aW9uLiBPUlxuICAgICAgICAvLyAgICAtIFNvbWUgb3RoZXIgc3R5bGluZyBpbnN0cnVjdGlvbiByYW4gYW5kIGRldGVybWluZWQgdGhhdCB0aGVyZSBhcmUgbm8gcmVzaWR1YWxzXG4gICAgICAgIGxldCB0ZW1wbGF0ZVN0eWxpbmdLZXkgPSBnZXRUZW1wbGF0ZUhlYWRUU3R5bGluZ0tleSh0RGF0YSwgdE5vZGUsIGlzQ2xhc3NCYXNlZCk7XG4gICAgICAgIGlmICh0ZW1wbGF0ZVN0eWxpbmdLZXkgIT09IHVuZGVmaW5lZCAmJiBBcnJheS5pc0FycmF5KHRlbXBsYXRlU3R5bGluZ0tleSkpIHtcbiAgICAgICAgICAvLyBPbmx5IHJlY29tcHV0ZSBpZiBgdGVtcGxhdGVTdHlsaW5nS2V5YCBoYWQgc3RhdGljIHZhbHVlcy4gKElmIG5vIHN0YXRpYyB2YWx1ZSBmb3VuZFxuICAgICAgICAgIC8vIHRoZW4gdGhlcmUgaXMgbm90aGluZyB0byBkbyBzaW5jZSB0aGlzIG9wZXJhdGlvbiBjYW4gb25seSBwcm9kdWNlIGxlc3Mgc3RhdGljIGtleXMsIG5vdFxuICAgICAgICAgIC8vIG1vcmUuKVxuICAgICAgICAgIHRlbXBsYXRlU3R5bGluZ0tleSA9IGNvbGxlY3RTdHlsaW5nRnJvbURpcmVjdGl2ZXMoXG4gICAgICAgICAgICAgIG51bGwsIHREYXRhLCB0Tm9kZSwgdGVtcGxhdGVTdHlsaW5nS2V5WzFdIC8qIHVud3JhcCBwcmV2aW91cyBzdGF0aWNzICovLFxuICAgICAgICAgICAgICBpc0NsYXNzQmFzZWQpO1xuICAgICAgICAgIHRlbXBsYXRlU3R5bGluZ0tleSA9XG4gICAgICAgICAgICAgIGNvbGxlY3RTdHlsaW5nRnJvbVRBdHRycyh0ZW1wbGF0ZVN0eWxpbmdLZXksIHROb2RlLmF0dHJzLCBpc0NsYXNzQmFzZWQpO1xuICAgICAgICAgIHNldFRlbXBsYXRlSGVhZFRTdHlsaW5nS2V5KHREYXRhLCB0Tm9kZSwgaXNDbGFzc0Jhc2VkLCB0ZW1wbGF0ZVN0eWxpbmdLZXkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBXZSBvbmx5IG5lZWQgdG8gcmVjb21wdXRlIHJlc2lkdWFsIGlmIGl0IGlzIG5vdCBgbnVsbGAuXG4gICAgICAgIC8vIC0gSWYgZXhpc3RpbmcgcmVzaWR1YWwgKGltcGxpZXMgdGhlcmUgd2FzIG5vIHRlbXBsYXRlIHN0eWxpbmcpLiBUaGlzIG1lYW5zIHRoYXQgc29tZSBvZlxuICAgICAgICAvLyAgIHRoZSBzdGF0aWNzIG1heSBoYXZlIG1vdmVkIGZyb20gdGhlIHJlc2lkdWFsIHRvIHRoZSBgc3R5bGluZ0tleWAgYW5kIHNvIHdlIGhhdmUgdG9cbiAgICAgICAgLy8gICByZWNvbXB1dGUuXG4gICAgICAgIC8vIC0gSWYgYHVuZGVmaW5lZGAgdGhpcyBpcyB0aGUgZmlyc3QgdGltZSB3ZSBhcmUgcnVubmluZy5cbiAgICAgICAgcmVzaWR1YWwgPSBjb2xsZWN0UmVzaWR1YWwodERhdGEsIHROb2RlLCBpc0NsYXNzQmFzZWQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAocmVzaWR1YWwgIT09IHVuZGVmaW5lZCkge1xuICAgIGlzQ2xhc3NCYXNlZCA/ICh0Tm9kZS5yZXNpZHVhbENsYXNzZXMgPSByZXNpZHVhbCkgOiAodE5vZGUucmVzaWR1YWxTdHlsZXMgPSByZXNpZHVhbCk7XG4gIH1cbiAgcmV0dXJuIHN0eWxpbmdLZXk7XG59XG5cbi8qKlxuICogUmV0cmlldmUgdGhlIGBUU3R5bGluZ0tleWAgZm9yIHRoZSB0ZW1wbGF0ZSBzdHlsaW5nIGluc3RydWN0aW9uLlxuICpcbiAqIFRoaXMgaXMgbmVlZGVkIHNpbmNlIGBob3N0QmluZGluZ2Agc3R5bGluZyBpbnN0cnVjdGlvbnMgYXJlIGluc2VydGVkIGFmdGVyIHRoZSB0ZW1wbGF0ZVxuICogaW5zdHJ1Y3Rpb24uIFdoaWxlIHRoZSB0ZW1wbGF0ZSBpbnN0cnVjdGlvbiBuZWVkcyB0byB1cGRhdGUgdGhlIHJlc2lkdWFsIGluIGBUTm9kZWAgdGhlXG4gKiBgaG9zdEJpbmRpbmdgIGluc3RydWN0aW9ucyBuZWVkIHRvIHVwZGF0ZSB0aGUgYFRTdHlsaW5nS2V5YCBvZiB0aGUgdGVtcGxhdGUgaW5zdHJ1Y3Rpb24gYmVjYXVzZVxuICogdGhlIHRlbXBsYXRlIGluc3RydWN0aW9uIGlzIGRvd25zdHJlYW0gZnJvbSB0aGUgYGhvc3RCaW5kaW5nc2AgaW5zdHJ1Y3Rpb25zLlxuICpcbiAqIEBwYXJhbSB0RGF0YSBgVERhdGFgIHdoZXJlIHRoZSBsaW5rZWQgbGlzdCBpcyBzdG9yZWQuXG4gKiBAcGFyYW0gdE5vZGUgYFROb2RlYCBmb3Igd2hpY2ggdGhlIHN0eWxpbmcgaXMgYmVpbmcgY29tcHV0ZWQuXG4gKiBAcGFyYW0gaXNDbGFzc0Jhc2VkIGB0cnVlYCBpZiBgY2xhc3NgIChgZmFsc2VgIGlmIGBzdHlsZWApXG4gKiBAcmV0dXJuIGBUU3R5bGluZ0tleWAgaWYgZm91bmQgb3IgYHVuZGVmaW5lZGAgaWYgbm90IGZvdW5kLlxuICovXG5mdW5jdGlvbiBnZXRUZW1wbGF0ZUhlYWRUU3R5bGluZ0tleSh0RGF0YTogVERhdGEsIHROb2RlOiBUTm9kZSwgaXNDbGFzc0Jhc2VkOiBib29sZWFuKTogVFN0eWxpbmdLZXl8XG4gICAgdW5kZWZpbmVkIHtcbiAgY29uc3QgYmluZGluZ3MgPSBpc0NsYXNzQmFzZWQgPyB0Tm9kZS5jbGFzc0JpbmRpbmdzIDogdE5vZGUuc3R5bGVCaW5kaW5ncztcbiAgaWYgKGdldFRTdHlsaW5nUmFuZ2VOZXh0KGJpbmRpbmdzKSA9PT0gMCkge1xuICAgIC8vIFRoZXJlIGRvZXMgbm90IHNlZW0gdG8gYmUgYSBzdHlsaW5nIGluc3RydWN0aW9uIGluIHRoZSBgdGVtcGxhdGVgLlxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIHREYXRhW2dldFRTdHlsaW5nUmFuZ2VQcmV2KGJpbmRpbmdzKV0gYXMgVFN0eWxpbmdLZXk7XG59XG5cbi8qKlxuICogVXBkYXRlIHRoZSBgVFN0eWxpbmdLZXlgIG9mIHRoZSBmaXJzdCB0ZW1wbGF0ZSBpbnN0cnVjdGlvbiBpbiBgVE5vZGVgLlxuICpcbiAqIExvZ2ljYWxseSBgaG9zdEJpbmRpbmdzYCBzdHlsaW5nIGluc3RydWN0aW9ucyBhcmUgb2YgbG93ZXIgcHJpb3JpdHkgdGhhbiB0aGF0IG9mIHRoZSB0ZW1wbGF0ZS5cbiAqIEhvd2V2ZXIsIHRoZXkgZXhlY3V0ZSBhZnRlciB0aGUgdGVtcGxhdGUgc3R5bGluZyBpbnN0cnVjdGlvbnMuIFRoaXMgbWVhbnMgdGhhdCB0aGV5IGdldCBpbnNlcnRlZFxuICogaW4gZnJvbnQgb2YgdGhlIHRlbXBsYXRlIHN0eWxpbmcgaW5zdHJ1Y3Rpb25zLlxuICpcbiAqIElmIHdlIGhhdmUgYSB0ZW1wbGF0ZSBzdHlsaW5nIGluc3RydWN0aW9uIGFuZCBhIG5ldyBgaG9zdEJpbmRpbmdzYCBzdHlsaW5nIGluc3RydWN0aW9uIGlzXG4gKiBleGVjdXRlZCBpdCBtZWFucyB0aGF0IGl0IG1heSBuZWVkIHRvIHN0ZWFsIHN0YXRpYyBmaWVsZHMgZnJvbSB0aGUgdGVtcGxhdGUgaW5zdHJ1Y3Rpb24uIFRoaXNcbiAqIG1ldGhvZCBhbGxvd3MgdXMgdG8gdXBkYXRlIHRoZSBmaXJzdCB0ZW1wbGF0ZSBpbnN0cnVjdGlvbiBgVFN0eWxpbmdLZXlgIHdpdGggYSBuZXcgdmFsdWUuXG4gKlxuICogQXNzdW1lOlxuICogYGBgXG4gKiA8ZGl2IG15LWRpciBzdHlsZT1cImNvbG9yOiByZWRcIiBbc3R5bGUuY29sb3JdPVwidG1wbEV4cFwiPjwvZGl2PlxuICpcbiAqIEBEaXJlY3RpdmUoe1xuICogICBob3N0OiB7XG4gKiAgICAgJ3N0eWxlJzogJ3dpZHRoOiAxMDBweCcsXG4gKiAgICAgJ1tzdHlsZS5jb2xvcl0nOiAnZGlyRXhwJyxcbiAqICAgfVxuICogfSlcbiAqIGNsYXNzIE15RGlyIHt9XG4gKiBgYGBcbiAqXG4gKiB3aGVuIGBbc3R5bGUuY29sb3JdPVwidG1wbEV4cFwiYCBleGVjdXRlcyBpdCBjcmVhdGVzIHRoaXMgZGF0YSBzdHJ1Y3R1cmUuXG4gKiBgYGBcbiAqICBbJycsICdjb2xvcicsICdjb2xvcicsICdyZWQnLCAnd2lkdGgnLCAnMTAwcHgnXSxcbiAqIGBgYFxuICpcbiAqIFRoZSByZWFzb24gZm9yIHRoaXMgaXMgdGhhdCB0aGUgdGVtcGxhdGUgaW5zdHJ1Y3Rpb24gZG9lcyBub3Qga25vdyBpZiB0aGVyZSBhcmUgc3R5bGluZ1xuICogaW5zdHJ1Y3Rpb25zIGFuZCBtdXN0IGFzc3VtZSB0aGF0IHRoZXJlIGFyZSBub25lIGFuZCBtdXN0IGNvbGxlY3QgYWxsIG9mIHRoZSBzdGF0aWMgc3R5bGluZy5cbiAqIChib3RoXG4gKiBgY29sb3InIGFuZCAnd2lkdGhgKVxuICpcbiAqIFdoZW4gYCdbc3R5bGUuY29sb3JdJzogJ2RpckV4cCcsYCBleGVjdXRlcyB3ZSBuZWVkIHRvIGluc2VydCBhIG5ldyBkYXRhIGludG8gdGhlIGxpbmtlZCBsaXN0LlxuICogYGBgXG4gKiAgWycnLCAnY29sb3InLCAnd2lkdGgnLCAnMTAwcHgnXSwgIC8vIG5ld2x5IGluc2VydGVkXG4gKiAgWycnLCAnY29sb3InLCAnY29sb3InLCAncmVkJywgJ3dpZHRoJywgJzEwMHB4J10sIC8vIHRoaXMgaXMgd3JvbmdcbiAqIGBgYFxuICpcbiAqIE5vdGljZSB0aGF0IHRoZSB0ZW1wbGF0ZSBzdGF0aWNzIGlzIG5vdyB3cm9uZyBhcyBpdCBpbmNvcnJlY3RseSBjb250YWlucyBgd2lkdGhgIHNvIHdlIG5lZWQgdG9cbiAqIHVwZGF0ZSBpdCBsaWtlIHNvOlxuICogYGBgXG4gKiAgWycnLCAnY29sb3InLCAnd2lkdGgnLCAnMTAwcHgnXSxcbiAqICBbJycsICdjb2xvcicsICdjb2xvcicsICdyZWQnXSwgICAgLy8gVVBEQVRFXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gdERhdGEgYFREYXRhYCB3aGVyZSB0aGUgbGlua2VkIGxpc3QgaXMgc3RvcmVkLlxuICogQHBhcmFtIHROb2RlIGBUTm9kZWAgZm9yIHdoaWNoIHRoZSBzdHlsaW5nIGlzIGJlaW5nIGNvbXB1dGVkLlxuICogQHBhcmFtIGlzQ2xhc3NCYXNlZCBgdHJ1ZWAgaWYgYGNsYXNzYCAoYGZhbHNlYCBpZiBgc3R5bGVgKVxuICogQHBhcmFtIHRTdHlsaW5nS2V5IE5ldyBgVFN0eWxpbmdLZXlgIHdoaWNoIGlzIHJlcGxhY2luZyB0aGUgb2xkIG9uZS5cbiAqL1xuZnVuY3Rpb24gc2V0VGVtcGxhdGVIZWFkVFN0eWxpbmdLZXkoXG4gICAgdERhdGE6IFREYXRhLCB0Tm9kZTogVE5vZGUsIGlzQ2xhc3NCYXNlZDogYm9vbGVhbiwgdFN0eWxpbmdLZXk6IFRTdHlsaW5nS2V5KTogdm9pZCB7XG4gIGNvbnN0IGJpbmRpbmdzID0gaXNDbGFzc0Jhc2VkID8gdE5vZGUuY2xhc3NCaW5kaW5ncyA6IHROb2RlLnN0eWxlQmluZGluZ3M7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnROb3RFcXVhbChcbiAgICAgICAgICAgICAgICAgICBnZXRUU3R5bGluZ1JhbmdlTmV4dChiaW5kaW5ncyksIDAsXG4gICAgICAgICAgICAgICAgICAgJ0V4cGVjdGluZyB0byBoYXZlIGF0IGxlYXN0IG9uZSB0ZW1wbGF0ZSBzdHlsaW5nIGJpbmRpbmcuJyk7XG4gIHREYXRhW2dldFRTdHlsaW5nUmFuZ2VQcmV2KGJpbmRpbmdzKV0gPSB0U3R5bGluZ0tleTtcbn1cblxuLyoqXG4gKiBDb2xsZWN0IGFsbCBzdGF0aWMgdmFsdWVzIGFmdGVyIHRoZSBjdXJyZW50IGBUTm9kZS5kaXJlY3RpdmVTdHlsaW5nTGFzdGAgaW5kZXguXG4gKlxuICogQ29sbGVjdCB0aGUgcmVtYWluaW5nIHN0eWxpbmcgaW5mb3JtYXRpb24gd2hpY2ggaGFzIG5vdCB5ZXQgYmVlbiBjb2xsZWN0ZWQgYnkgYW4gZXhpc3RpbmdcbiAqIHN0eWxpbmcgaW5zdHJ1Y3Rpb24uXG4gKlxuICogQHBhcmFtIHREYXRhIGBURGF0YWAgd2hlcmUgdGhlIGBEaXJlY3RpdmVEZWZzYCBhcmUgc3RvcmVkLlxuICogQHBhcmFtIHROb2RlIGBUTm9kZWAgd2hpY2ggY29udGFpbnMgdGhlIGRpcmVjdGl2ZSByYW5nZS5cbiAqIEBwYXJhbSBpc0NsYXNzQmFzZWQgYHRydWVgIGlmIGBjbGFzc2AgKGBmYWxzZWAgaWYgYHN0eWxlYClcbiAqL1xuZnVuY3Rpb24gY29sbGVjdFJlc2lkdWFsKHREYXRhOiBURGF0YSwgdE5vZGU6IFROb2RlLCBpc0NsYXNzQmFzZWQ6IGJvb2xlYW4pOiBLZXlWYWx1ZUFycmF5PGFueT58XG4gICAgbnVsbCB7XG4gIGxldCByZXNpZHVhbDogS2V5VmFsdWVBcnJheTxhbnk+fG51bGx8dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICBjb25zdCBkaXJlY3RpdmVFbmQgPSB0Tm9kZS5kaXJlY3RpdmVFbmQ7XG4gIG5nRGV2TW9kZSAmJlxuICAgICAgYXNzZXJ0Tm90RXF1YWwoXG4gICAgICAgICAgdE5vZGUuZGlyZWN0aXZlU3R5bGluZ0xhc3QsIC0xLFxuICAgICAgICAgICdCeSB0aGUgdGltZSB0aGlzIGZ1bmN0aW9uIGdldHMgY2FsbGVkIGF0IGxlYXN0IG9uZSBob3N0QmluZGluZ3Mtbm9kZSBzdHlsaW5nIGluc3RydWN0aW9uIG11c3QgaGF2ZSBleGVjdXRlZC4nKTtcbiAgLy8gV2UgYWRkIGAxICsgdE5vZGUuZGlyZWN0aXZlU3RhcnRgIGJlY2F1c2Ugd2UgbmVlZCB0byBza2lwIHRoZSBjdXJyZW50IGRpcmVjdGl2ZSAoYXMgd2UgYXJlXG4gIC8vIGNvbGxlY3RpbmcgdGhpbmdzIGFmdGVyIHRoZSBsYXN0IGBob3N0QmluZGluZ3NgIGRpcmVjdGl2ZSB3aGljaCBoYWQgYSBzdHlsaW5nIGluc3RydWN0aW9uLilcbiAgZm9yIChsZXQgaSA9IDEgKyB0Tm9kZS5kaXJlY3RpdmVTdHlsaW5nTGFzdDsgaSA8IGRpcmVjdGl2ZUVuZDsgaSsrKSB7XG4gICAgY29uc3QgYXR0cnMgPSAodERhdGFbaV0gYXMgRGlyZWN0aXZlRGVmPGFueT4pLmhvc3RBdHRycztcbiAgICByZXNpZHVhbCA9IGNvbGxlY3RTdHlsaW5nRnJvbVRBdHRycyhyZXNpZHVhbCwgYXR0cnMsIGlzQ2xhc3NCYXNlZCkgYXMgS2V5VmFsdWVBcnJheTxhbnk+fCBudWxsO1xuICB9XG4gIHJldHVybiBjb2xsZWN0U3R5bGluZ0Zyb21UQXR0cnMocmVzaWR1YWwsIHROb2RlLmF0dHJzLCBpc0NsYXNzQmFzZWQpIGFzIEtleVZhbHVlQXJyYXk8YW55PnwgbnVsbDtcbn1cblxuLyoqXG4gKiBDb2xsZWN0IHRoZSBzdGF0aWMgc3R5bGluZyBpbmZvcm1hdGlvbiB3aXRoIGxvd2VyIHByaW9yaXR5IHRoYW4gYGhvc3REaXJlY3RpdmVEZWZgLlxuICpcbiAqIChUaGlzIGlzIG9wcG9zaXRlIG9mIHJlc2lkdWFsIHN0eWxpbmcuKVxuICpcbiAqIEBwYXJhbSBob3N0RGlyZWN0aXZlRGVmIGBEaXJlY3RpdmVEZWZgIGZvciB3aGljaCB3ZSB3YW50IHRvIGNvbGxlY3QgbG93ZXIgcHJpb3JpdHkgc3RhdGljXG4gKiAgICAgICAgc3R5bGluZy4gKE9yIGBudWxsYCBpZiB0ZW1wbGF0ZSBzdHlsaW5nKVxuICogQHBhcmFtIHREYXRhIGBURGF0YWAgd2hlcmUgdGhlIGxpbmtlZCBsaXN0IGlzIHN0b3JlZC5cbiAqIEBwYXJhbSB0Tm9kZSBgVE5vZGVgIGZvciB3aGljaCB0aGUgc3R5bGluZyBpcyBiZWluZyBjb21wdXRlZC5cbiAqIEBwYXJhbSBzdHlsaW5nS2V5IEV4aXN0aW5nIGBUU3R5bGluZ0tleWAgdG8gdXBkYXRlIG9yIHdyYXAuXG4gKiBAcGFyYW0gaXNDbGFzc0Jhc2VkIGB0cnVlYCBpZiBgY2xhc3NgIChgZmFsc2VgIGlmIGBzdHlsZWApXG4gKi9cbmZ1bmN0aW9uIGNvbGxlY3RTdHlsaW5nRnJvbURpcmVjdGl2ZXMoXG4gICAgaG9zdERpcmVjdGl2ZURlZjogRGlyZWN0aXZlRGVmPGFueT58IG51bGwsIHREYXRhOiBURGF0YSwgdE5vZGU6IFROb2RlLCBzdHlsaW5nS2V5OiBUU3R5bGluZ0tleSxcbiAgICBpc0NsYXNzQmFzZWQ6IGJvb2xlYW4pOiBUU3R5bGluZ0tleSB7XG4gIC8vIFdlIG5lZWQgdG8gbG9vcCBiZWNhdXNlIHRoZXJlIGNhbiBiZSBkaXJlY3RpdmVzIHdoaWNoIGhhdmUgYGhvc3RBdHRyc2AgYnV0IGRvbid0IGhhdmVcbiAgLy8gYGhvc3RCaW5kaW5nc2Agc28gdGhpcyBsb29wIGNhdGNoZXMgdXAgdG8gdGhlIGN1cnJlbnQgZGlyZWN0aXZlLi5cbiAgbGV0IGN1cnJlbnREaXJlY3RpdmU6IERpcmVjdGl2ZURlZjxhbnk+fG51bGwgPSBudWxsO1xuICBjb25zdCBkaXJlY3RpdmVFbmQgPSB0Tm9kZS5kaXJlY3RpdmVFbmQ7XG4gIGxldCBkaXJlY3RpdmVTdHlsaW5nTGFzdCA9IHROb2RlLmRpcmVjdGl2ZVN0eWxpbmdMYXN0O1xuICBpZiAoZGlyZWN0aXZlU3R5bGluZ0xhc3QgPT09IC0xKSB7XG4gICAgZGlyZWN0aXZlU3R5bGluZ0xhc3QgPSB0Tm9kZS5kaXJlY3RpdmVTdGFydDtcbiAgfSBlbHNlIHtcbiAgICBkaXJlY3RpdmVTdHlsaW5nTGFzdCsrO1xuICB9XG4gIHdoaWxlIChkaXJlY3RpdmVTdHlsaW5nTGFzdCA8IGRpcmVjdGl2ZUVuZCkge1xuICAgIGN1cnJlbnREaXJlY3RpdmUgPSB0RGF0YVtkaXJlY3RpdmVTdHlsaW5nTGFzdF0gYXMgRGlyZWN0aXZlRGVmPGFueT47XG4gICAgbmdEZXZNb2RlICYmIGFzc2VydERlZmluZWQoY3VycmVudERpcmVjdGl2ZSwgJ2V4cGVjdGVkIHRvIGJlIGRlZmluZWQnKTtcbiAgICBzdHlsaW5nS2V5ID0gY29sbGVjdFN0eWxpbmdGcm9tVEF0dHJzKHN0eWxpbmdLZXksIGN1cnJlbnREaXJlY3RpdmUuaG9zdEF0dHJzLCBpc0NsYXNzQmFzZWQpO1xuICAgIGlmIChjdXJyZW50RGlyZWN0aXZlID09PSBob3N0RGlyZWN0aXZlRGVmKSBicmVhaztcbiAgICBkaXJlY3RpdmVTdHlsaW5nTGFzdCsrO1xuICB9XG4gIGlmIChob3N0RGlyZWN0aXZlRGVmICE9PSBudWxsKSB7XG4gICAgLy8gd2Ugb25seSBhZHZhbmNlIHRoZSBzdHlsaW5nIGN1cnNvciBpZiB3ZSBhcmUgY29sbGVjdGluZyBkYXRhIGZyb20gaG9zdCBiaW5kaW5ncy5cbiAgICAvLyBUZW1wbGF0ZSBleGVjdXRlcyBiZWZvcmUgaG9zdCBiaW5kaW5ncyBhbmQgc28gaWYgd2Ugd291bGQgdXBkYXRlIHRoZSBpbmRleCxcbiAgICAvLyBob3N0IGJpbmRpbmdzIHdvdWxkIG5vdCBnZXQgdGhlaXIgc3RhdGljcy5cbiAgICB0Tm9kZS5kaXJlY3RpdmVTdHlsaW5nTGFzdCA9IGRpcmVjdGl2ZVN0eWxpbmdMYXN0O1xuICB9XG4gIHJldHVybiBzdHlsaW5nS2V5O1xufVxuXG4vKipcbiAqIENvbnZlcnQgYFRBdHRyc2AgaW50byBgVFN0eWxpbmdTdGF0aWNgLlxuICpcbiAqIEBwYXJhbSBzdHlsaW5nS2V5IGV4aXN0aW5nIGBUU3R5bGluZ0tleWAgdG8gdXBkYXRlIG9yIHdyYXAuXG4gKiBAcGFyYW0gYXR0cnMgYFRBdHRyaWJ1dGVzYCB0byBwcm9jZXNzLlxuICogQHBhcmFtIGlzQ2xhc3NCYXNlZCBgdHJ1ZWAgaWYgYGNsYXNzYCAoYGZhbHNlYCBpZiBgc3R5bGVgKVxuICovXG5mdW5jdGlvbiBjb2xsZWN0U3R5bGluZ0Zyb21UQXR0cnMoXG4gICAgc3R5bGluZ0tleTogVFN0eWxpbmdLZXkgfCB1bmRlZmluZWQsIGF0dHJzOiBUQXR0cmlidXRlcyB8IG51bGwsXG4gICAgaXNDbGFzc0Jhc2VkOiBib29sZWFuKTogVFN0eWxpbmdLZXkge1xuICBjb25zdCBkZXNpcmVkTWFya2VyID0gaXNDbGFzc0Jhc2VkID8gQXR0cmlidXRlTWFya2VyLkNsYXNzZXMgOiBBdHRyaWJ1dGVNYXJrZXIuU3R5bGVzO1xuICBsZXQgY3VycmVudE1hcmtlciA9IEF0dHJpYnV0ZU1hcmtlci5JbXBsaWNpdEF0dHJpYnV0ZXM7XG4gIGlmIChhdHRycyAhPT0gbnVsbCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXR0cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGl0ZW0gPSBhdHRyc1tpXSBhcyBudW1iZXIgfCBzdHJpbmc7XG4gICAgICBpZiAodHlwZW9mIGl0ZW0gPT09ICdudW1iZXInKSB7XG4gICAgICAgIGN1cnJlbnRNYXJrZXIgPSBpdGVtO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGN1cnJlbnRNYXJrZXIgPT09IGRlc2lyZWRNYXJrZXIpIHtcbiAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoc3R5bGluZ0tleSkpIHtcbiAgICAgICAgICAgIHN0eWxpbmdLZXkgPSBzdHlsaW5nS2V5ID09PSB1bmRlZmluZWQgPyBbXSA6IFsnJywgc3R5bGluZ0tleV0gYXMgYW55O1xuICAgICAgICAgIH1cbiAgICAgICAgICBrZXlWYWx1ZUFycmF5U2V0KFxuICAgICAgICAgICAgICBzdHlsaW5nS2V5IGFzIEtleVZhbHVlQXJyYXk8YW55PiwgaXRlbSwgaXNDbGFzc0Jhc2VkID8gdHJ1ZSA6IGF0dHJzWysraV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHlsaW5nS2V5ID09PSB1bmRlZmluZWQgPyBudWxsIDogc3R5bGluZ0tleTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZSB0aGUgY3VycmVudCBgRGlyZWN0aXZlRGVmYCB3aGljaCBpcyBhY3RpdmUgd2hlbiBgaG9zdEJpbmRpbmdzYCBzdHlsZSBpbnN0cnVjdGlvbiBpc1xuICogYmVpbmcgZXhlY3V0ZWQgKG9yIGBudWxsYCBpZiB3ZSBhcmUgaW4gYHRlbXBsYXRlYC4pXG4gKlxuICogQHBhcmFtIHREYXRhIEN1cnJlbnQgYFREYXRhYCB3aGVyZSB0aGUgYERpcmVjdGl2ZURlZmAgd2lsbCBiZSBsb29rZWQgdXAgYXQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRIb3N0RGlyZWN0aXZlRGVmKHREYXRhOiBURGF0YSk6IERpcmVjdGl2ZURlZjxhbnk+fG51bGwge1xuICBjb25zdCBjdXJyZW50RGlyZWN0aXZlSW5kZXggPSBnZXRDdXJyZW50RGlyZWN0aXZlSW5kZXgoKTtcbiAgcmV0dXJuIGN1cnJlbnREaXJlY3RpdmVJbmRleCA9PT0gLTEgPyBudWxsIDogdERhdGFbY3VycmVudERpcmVjdGl2ZUluZGV4XSBhcyBEaXJlY3RpdmVEZWY8YW55Pjtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IHVzZXIgaW5wdXQgdG8gYEtleVZhbHVlQXJyYXlgLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gdGFrZXMgdXNlciBpbnB1dCB3aGljaCBjb3VsZCBiZSBgc3RyaW5nYCwgT2JqZWN0IGxpdGVyYWwsIG9yIGl0ZXJhYmxlIGFuZCBjb252ZXJ0c1xuICogaXQgaW50byBhIGNvbnNpc3RlbnQgcmVwcmVzZW50YXRpb24uIFRoZSBvdXRwdXQgb2YgdGhpcyBpcyBgS2V5VmFsdWVBcnJheWAgKHdoaWNoIGlzIGFuIGFycmF5XG4gKiB3aGVyZVxuICogZXZlbiBpbmRleGVzIGNvbnRhaW4ga2V5cyBhbmQgb2RkIGluZGV4ZXMgY29udGFpbiB2YWx1ZXMgZm9yIHRob3NlIGtleXMpLlxuICpcbiAqIFRoZSBhZHZhbnRhZ2Ugb2YgY29udmVydGluZyB0byBgS2V5VmFsdWVBcnJheWAgaXMgdGhhdCB3ZSBjYW4gcGVyZm9ybSBkaWZmIGluIGFuIGlucHV0XG4gKiBpbmRlcGVuZGVudFxuICogd2F5LlxuICogKGllIHdlIGNhbiBjb21wYXJlIGBmb28gYmFyYCB0byBgWydiYXInLCAnYmF6J10gYW5kIGRldGVybWluZSBhIHNldCBvZiBjaGFuZ2VzIHdoaWNoIG5lZWQgdG8gYmVcbiAqIGFwcGxpZWQpXG4gKlxuICogVGhlIGZhY3QgdGhhdCBgS2V5VmFsdWVBcnJheWAgaXMgc29ydGVkIGlzIHZlcnkgaW1wb3J0YW50IGJlY2F1c2UgaXQgYWxsb3dzIHVzIHRvIGNvbXB1dGUgdGhlXG4gKiBkaWZmZXJlbmNlIGluIGxpbmVhciBmYXNoaW9uIHdpdGhvdXQgdGhlIG5lZWQgdG8gYWxsb2NhdGUgYW55IGFkZGl0aW9uYWwgZGF0YS5cbiAqXG4gKiBGb3IgZXhhbXBsZSBpZiB3ZSBrZXB0IHRoaXMgYXMgYSBgTWFwYCB3ZSB3b3VsZCBoYXZlIHRvIGl0ZXJhdGUgb3ZlciBwcmV2aW91cyBgTWFwYCB0byBkZXRlcm1pbmVcbiAqIHdoaWNoIHZhbHVlcyBuZWVkIHRvIGJlIGRlbGV0ZWQsIG92ZXIgdGhlIG5ldyBgTWFwYCB0byBkZXRlcm1pbmUgYWRkaXRpb25zLCBhbmQgd2Ugd291bGQgaGF2ZSB0b1xuICoga2VlcCBhZGRpdGlvbmFsIGBNYXBgIHRvIGtlZXAgdHJhY2sgb2YgZHVwbGljYXRlcyBvciBpdGVtcyB3aGljaCBoYXZlIG5vdCB5ZXQgYmVlbiB2aXNpdGVkLlxuICpcbiAqIEBwYXJhbSBrZXlWYWx1ZUFycmF5U2V0IChTZWUgYGtleVZhbHVlQXJyYXlTZXRgIGluIFwidXRpbC9hcnJheV91dGlsc1wiKSBHZXRzIHBhc3NlZCBpbiBhcyBhXG4gKiBmdW5jdGlvbiBzbyB0aGF0XG4gKiAgICAgICAgYHN0eWxlYCBjYW4gcGFzcyBpbiB2ZXJzaW9uIHdoaWNoIGRvZXMgc2FuaXRpemF0aW9uLiBUaGlzIGlzIGRvbmUgZm9yIHRyZWUgc2hha2luZ1xuICogICAgICAgIHB1cnBvc2VzLlxuICogQHBhcmFtIHN0cmluZ1BhcnNlciBUaGUgcGFyc2VyIGlzIHBhc3NlZCBpbiBzbyB0aGF0IGl0IHdpbGwgYmUgdHJlZSBzaGFrYWJsZS4gU2VlXG4gKiAgICAgICAgYHN0eWxlU3RyaW5nUGFyc2VyYCBhbmQgYGNsYXNzU3RyaW5nUGFyc2VyYFxuICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBwYXJzZS9jb252ZXJ0IHRvIGBLZXlWYWx1ZUFycmF5YFxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9TdHlsaW5nS2V5VmFsdWVBcnJheShcbiAgICBrZXlWYWx1ZUFycmF5U2V0OiAoa2V5VmFsdWVBcnJheTogS2V5VmFsdWVBcnJheTxhbnk+LCBrZXk6IHN0cmluZywgdmFsdWU6IGFueSkgPT4gdm9pZCxcbiAgICBzdHJpbmdQYXJzZXI6IChzdHlsZUtleVZhbHVlQXJyYXk6IEtleVZhbHVlQXJyYXk8YW55PiwgdGV4dDogc3RyaW5nKSA9PiB2b2lkLFxuICAgIHZhbHVlOiBzdHJpbmd8c3RyaW5nW118e1trZXk6IHN0cmluZ106IGFueX18bnVsbHx1bmRlZmluZWQpOiBLZXlWYWx1ZUFycmF5PGFueT4ge1xuICBpZiAodmFsdWUgPT0gbnVsbCAvKnx8IHZhbHVlID09PSB1bmRlZmluZWQgKi8gfHwgdmFsdWUgPT09ICcnKSByZXR1cm4gRU1QVFlfQVJSQVkgYXMgYW55O1xuICBjb25zdCBzdHlsZUtleVZhbHVlQXJyYXk6IEtleVZhbHVlQXJyYXk8YW55PiA9IFtdIGFzIGFueTtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZS5sZW5ndGg7IGkrKykge1xuICAgICAga2V5VmFsdWVBcnJheVNldChzdHlsZUtleVZhbHVlQXJyYXksIHZhbHVlW2ldLCB0cnVlKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgIGZvciAoY29uc3Qga2V5IGluIHZhbHVlKSB7XG4gICAgICBpZiAodmFsdWUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBrZXlWYWx1ZUFycmF5U2V0KHN0eWxlS2V5VmFsdWVBcnJheSwga2V5LCB2YWx1ZVtrZXldKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHN0cmluZ1BhcnNlcihzdHlsZUtleVZhbHVlQXJyYXksIHZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICBuZ0Rldk1vZGUgJiYgdGhyb3dFcnJvcignVW5zdXBwb3J0ZWQgc3R5bGluZyB0eXBlICcgKyB0eXBlb2YgdmFsdWUgKyAnOiAnICsgdmFsdWUpO1xuICB9XG4gIHJldHVybiBzdHlsZUtleVZhbHVlQXJyYXk7XG59XG5cbi8qKlxuICogU2V0IGEgYHZhbHVlYCBmb3IgYSBga2V5YCB0YWtpbmcgc3R5bGUgc2FuaXRpemF0aW9uIGludG8gYWNjb3VudC5cbiAqXG4gKiBTZWU6IGBrZXlWYWx1ZUFycmF5U2V0YCBmb3IgZGV0YWlsc1xuICpcbiAqIEBwYXJhbSBrZXlWYWx1ZUFycmF5IEtleVZhbHVlQXJyYXkgdG8gYWRkIHRvLlxuICogQHBhcmFtIGtleSBTdHlsZSBrZXkgdG8gYWRkLiAoVGhpcyBrZXkgd2lsbCBiZSBjaGVja2VkIGlmIGl0IG5lZWRzIHNhbml0aXphdGlvbilcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0IChJZiBrZXkgbmVlZHMgc2FuaXRpemF0aW9uIGl0IHdpbGwgYmUgc2FuaXRpemVkKVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3R5bGVLZXlWYWx1ZUFycmF5U2V0KGtleVZhbHVlQXJyYXk6IEtleVZhbHVlQXJyYXk8YW55Piwga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgaWYgKHN0eWxlUHJvcE5lZWRzU2FuaXRpemF0aW9uKGtleSkpIHtcbiAgICB2YWx1ZSA9IMm1ybVzYW5pdGl6ZVN0eWxlKHZhbHVlKTtcbiAgfVxuICBrZXlWYWx1ZUFycmF5U2V0KGtleVZhbHVlQXJyYXksIGtleSwgdmFsdWUpO1xufVxuXG4vKipcbiAqIFVwZGF0ZSBtYXAgYmFzZWQgc3R5bGluZy5cbiAqXG4gKiBNYXAgYmFzZWQgc3R5bGluZyBjb3VsZCBiZSBhbnl0aGluZyB3aGljaCBjb250YWlucyBtb3JlIHRoYW4gb25lIGJpbmRpbmcuIEZvciBleGFtcGxlIGBzdHJpbmdgLFxuICogb3Igb2JqZWN0IGxpdGVyYWwuIERlYWxpbmcgd2l0aCBhbGwgb2YgdGhlc2UgdHlwZXMgd291bGQgY29tcGxpY2F0ZSB0aGUgbG9naWMgc29cbiAqIGluc3RlYWQgdGhpcyBmdW5jdGlvbiBleHBlY3RzIHRoYXQgdGhlIGNvbXBsZXggaW5wdXQgaXMgZmlyc3QgY29udmVydGVkIGludG8gbm9ybWFsaXplZFxuICogYEtleVZhbHVlQXJyYXlgLiBUaGUgYWR2YW50YWdlIG9mIG5vcm1hbGl6YXRpb24gaXMgdGhhdCB3ZSBnZXQgdGhlIHZhbHVlcyBzb3J0ZWQsIHdoaWNoIG1ha2VzIGl0XG4gKiB2ZXJ5IGNoZWFwIHRvIGNvbXB1dGUgZGVsdGFzIGJldHdlZW4gdGhlIHByZXZpb3VzIGFuZCBjdXJyZW50IHZhbHVlLlxuICpcbiAqIEBwYXJhbSB0VmlldyBBc3NvY2lhdGVkIGBUVmlldy5kYXRhYCBjb250YWlucyB0aGUgbGlua2VkIGxpc3Qgb2YgYmluZGluZyBwcmlvcml0aWVzLlxuICogQHBhcmFtIHROb2RlIGBUTm9kZWAgd2hlcmUgdGhlIGJpbmRpbmcgaXMgbG9jYXRlZC5cbiAqIEBwYXJhbSBsVmlldyBgTFZpZXdgIGNvbnRhaW5zIHRoZSB2YWx1ZXMgYXNzb2NpYXRlZCB3aXRoIG90aGVyIHN0eWxpbmcgYmluZGluZyBhdCB0aGlzIGBUTm9kZWAuXG4gKiBAcGFyYW0gcmVuZGVyZXIgUmVuZGVyZXIgdG8gdXNlIGlmIGFueSB1cGRhdGVzLlxuICogQHBhcmFtIG9sZEtleVZhbHVlQXJyYXkgUHJldmlvdXMgdmFsdWUgcmVwcmVzZW50ZWQgYXMgYEtleVZhbHVlQXJyYXlgXG4gKiBAcGFyYW0gbmV3S2V5VmFsdWVBcnJheSBDdXJyZW50IHZhbHVlIHJlcHJlc2VudGVkIGFzIGBLZXlWYWx1ZUFycmF5YFxuICogQHBhcmFtIGlzQ2xhc3NCYXNlZCBgdHJ1ZWAgaWYgYGNsYXNzYCAoYGZhbHNlYCBpZiBgc3R5bGVgKVxuICogQHBhcmFtIGJpbmRpbmdJbmRleCBCaW5kaW5nIGluZGV4IG9mIHRoZSBiaW5kaW5nLlxuICovXG5mdW5jdGlvbiB1cGRhdGVTdHlsaW5nTWFwKFxuICAgIHRWaWV3OiBUVmlldywgdE5vZGU6IFROb2RlLCBsVmlldzogTFZpZXcsIHJlbmRlcmVyOiBSZW5kZXJlcjMsXG4gICAgb2xkS2V5VmFsdWVBcnJheTogS2V5VmFsdWVBcnJheTxhbnk+LCBuZXdLZXlWYWx1ZUFycmF5OiBLZXlWYWx1ZUFycmF5PGFueT4sXG4gICAgaXNDbGFzc0Jhc2VkOiBib29sZWFuLCBiaW5kaW5nSW5kZXg6IG51bWJlcikge1xuICBpZiAob2xkS2V5VmFsdWVBcnJheSBhcyBLZXlWYWx1ZUFycmF5PGFueT58IE5PX0NIQU5HRSA9PT0gTk9fQ0hBTkdFKSB7XG4gICAgLy8gT24gZmlyc3QgZXhlY3V0aW9uIHRoZSBvbGRLZXlWYWx1ZUFycmF5IGlzIE5PX0NIQU5HRSA9PiB0cmVhdCBpdCBhcyBlbXB0eSBLZXlWYWx1ZUFycmF5LlxuICAgIG9sZEtleVZhbHVlQXJyYXkgPSBFTVBUWV9BUlJBWSBhcyBhbnk7XG4gIH1cbiAgbGV0IG9sZEluZGV4ID0gMDtcbiAgbGV0IG5ld0luZGV4ID0gMDtcbiAgbGV0IG9sZEtleTogc3RyaW5nfG51bGwgPSAwIDwgb2xkS2V5VmFsdWVBcnJheS5sZW5ndGggPyBvbGRLZXlWYWx1ZUFycmF5WzBdIDogbnVsbDtcbiAgbGV0IG5ld0tleTogc3RyaW5nfG51bGwgPSAwIDwgbmV3S2V5VmFsdWVBcnJheS5sZW5ndGggPyBuZXdLZXlWYWx1ZUFycmF5WzBdIDogbnVsbDtcbiAgd2hpbGUgKG9sZEtleSAhPT0gbnVsbCB8fCBuZXdLZXkgIT09IG51bGwpIHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0TGVzc1RoYW4ob2xkSW5kZXgsIDk5OSwgJ0FyZSB3ZSBzdHVjayBpbiBpbmZpbml0ZSBsb29wPycpO1xuICAgIG5nRGV2TW9kZSAmJiBhc3NlcnRMZXNzVGhhbihuZXdJbmRleCwgOTk5LCAnQXJlIHdlIHN0dWNrIGluIGluZmluaXRlIGxvb3A/Jyk7XG4gICAgY29uc3Qgb2xkVmFsdWUgPVxuICAgICAgICBvbGRJbmRleCA8IG9sZEtleVZhbHVlQXJyYXkubGVuZ3RoID8gb2xkS2V5VmFsdWVBcnJheVtvbGRJbmRleCArIDFdIDogdW5kZWZpbmVkO1xuICAgIGNvbnN0IG5ld1ZhbHVlID1cbiAgICAgICAgbmV3SW5kZXggPCBuZXdLZXlWYWx1ZUFycmF5Lmxlbmd0aCA/IG5ld0tleVZhbHVlQXJyYXlbbmV3SW5kZXggKyAxXSA6IHVuZGVmaW5lZDtcbiAgICBsZXQgc2V0S2V5OiBzdHJpbmd8bnVsbCA9IG51bGw7XG4gICAgbGV0IHNldFZhbHVlOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgaWYgKG9sZEtleSA9PT0gbmV3S2V5KSB7XG4gICAgICAvLyBVUERBVEU6IEtleXMgYXJlIGVxdWFsID0+IG5ldyB2YWx1ZSBpcyBvdmVyd3JpdGluZyBvbGQgdmFsdWUuXG4gICAgICBvbGRJbmRleCArPSAyO1xuICAgICAgbmV3SW5kZXggKz0gMjtcbiAgICAgIGlmIChvbGRWYWx1ZSAhPT0gbmV3VmFsdWUpIHtcbiAgICAgICAgc2V0S2V5ID0gbmV3S2V5O1xuICAgICAgICBzZXRWYWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobmV3S2V5ID09PSBudWxsIHx8IG9sZEtleSAhPT0gbnVsbCAmJiBvbGRLZXkgPCBuZXdLZXkgISkge1xuICAgICAgLy8gREVMRVRFOiBvbGRLZXkga2V5IGlzIG1pc3Npbmcgb3Igd2UgZGlkIG5vdCBmaW5kIHRoZSBvbGRLZXkgaW4gdGhlIG5ld1ZhbHVlXG4gICAgICAvLyAoYmVjYXVzZSB0aGUga2V5VmFsdWVBcnJheSBpcyBzb3J0ZWQgYW5kIGBuZXdLZXlgIGlzIGZvdW5kIGxhdGVyIGFscGhhYmV0aWNhbGx5KS5cbiAgICAgIC8vIGBcImJhY2tncm91bmRcIiA8IFwiY29sb3JcImAgc28gd2UgbmVlZCB0byBkZWxldGUgYFwiYmFja2dyb3VuZFwiYCBiZWNhdXNlIGl0IGlzIG5vdCBmb3VuZCBpbiB0aGVcbiAgICAgIC8vIG5ldyBhcnJheS5cbiAgICAgIG9sZEluZGV4ICs9IDI7XG4gICAgICBzZXRLZXkgPSBvbGRLZXk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIENSRUFURTogbmV3S2V5J3MgaXMgZWFybGllciBhbHBoYWJldGljYWxseSB0aGFuIG9sZEtleSdzIChvciBubyBvbGRLZXkpID0+IHdlIGhhdmUgbmV3IGtleS5cbiAgICAgIC8vIGBcImNvbG9yXCIgPiBcImJhY2tncm91bmRcImAgc28gd2UgbmVlZCB0byBhZGQgYGNvbG9yYCBiZWNhdXNlIGl0IGlzIGluIG5ldyBhcnJheSBidXQgbm90IGluXG4gICAgICAvLyBvbGQgYXJyYXkuXG4gICAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZChuZXdLZXksICdFeHBlY3RpbmcgdG8gaGF2ZSBhIHZhbGlkIGtleScpO1xuICAgICAgbmV3SW5kZXggKz0gMjtcbiAgICAgIHNldEtleSA9IG5ld0tleTtcbiAgICAgIHNldFZhbHVlID0gbmV3VmFsdWU7XG4gICAgfVxuICAgIGlmIChzZXRLZXkgIT09IG51bGwpIHtcbiAgICAgIHVwZGF0ZVN0eWxpbmcodFZpZXcsIHROb2RlLCBsVmlldywgcmVuZGVyZXIsIHNldEtleSwgc2V0VmFsdWUsIGlzQ2xhc3NCYXNlZCwgYmluZGluZ0luZGV4KTtcbiAgICB9XG4gICAgb2xkS2V5ID0gb2xkSW5kZXggPCBvbGRLZXlWYWx1ZUFycmF5Lmxlbmd0aCA/IG9sZEtleVZhbHVlQXJyYXlbb2xkSW5kZXhdIDogbnVsbDtcbiAgICBuZXdLZXkgPSBuZXdJbmRleCA8IG5ld0tleVZhbHVlQXJyYXkubGVuZ3RoID8gbmV3S2V5VmFsdWVBcnJheVtuZXdJbmRleF0gOiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogVXBkYXRlIGEgc2ltcGxlIChwcm9wZXJ0eSBuYW1lKSBzdHlsaW5nLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gdGFrZXMgYHByb3BgIGFuZCB1cGRhdGVzIHRoZSBET00gdG8gdGhhdCB2YWx1ZS4gVGhlIGZ1bmN0aW9uIHRha2VzIHRoZSBiaW5kaW5nXG4gKiB2YWx1ZSBhcyB3ZWxsIGFzIGJpbmRpbmcgcHJpb3JpdHkgaW50byBjb25zaWRlcmF0aW9uIHRvIGRldGVybWluZSB3aGljaCB2YWx1ZSBzaG91bGQgYmUgd3JpdHRlblxuICogdG8gRE9NLiAoRm9yIGV4YW1wbGUgaXQgbWF5IGJlIGRldGVybWluZWQgdGhhdCB0aGVyZSBpcyBhIGhpZ2hlciBwcmlvcml0eSBvdmVyd3JpdGUgd2hpY2ggYmxvY2tzXG4gKiB0aGUgRE9NIHdyaXRlLCBvciBpZiB0aGUgdmFsdWUgZ29lcyB0byBgdW5kZWZpbmVkYCBhIGxvd2VyIHByaW9yaXR5IG92ZXJ3cml0ZSBtYXkgYmUgY29uc3VsdGVkLilcbiAqXG4gKiBAcGFyYW0gdFZpZXcgQXNzb2NpYXRlZCBgVFZpZXcuZGF0YWAgY29udGFpbnMgdGhlIGxpbmtlZCBsaXN0IG9mIGJpbmRpbmcgcHJpb3JpdGllcy5cbiAqIEBwYXJhbSB0Tm9kZSBgVE5vZGVgIHdoZXJlIHRoZSBiaW5kaW5nIGlzIGxvY2F0ZWQuXG4gKiBAcGFyYW0gbFZpZXcgYExWaWV3YCBjb250YWlucyB0aGUgdmFsdWVzIGFzc29jaWF0ZWQgd2l0aCBvdGhlciBzdHlsaW5nIGJpbmRpbmcgYXQgdGhpcyBgVE5vZGVgLlxuICogQHBhcmFtIHJlbmRlcmVyIFJlbmRlcmVyIHRvIHVzZSBpZiBhbnkgdXBkYXRlcy5cbiAqIEBwYXJhbSBwcm9wIEVpdGhlciBzdHlsZSBwcm9wZXJ0eSBuYW1lIG9yIGEgY2xhc3MgbmFtZS5cbiAqIEBwYXJhbSB2YWx1ZSBFaXRoZXIgc3R5bGUgdmFsdWUgZm9yIGBwcm9wYCBvciBgdHJ1ZWAvYGZhbHNlYCBpZiBgcHJvcGAgaXMgY2xhc3MuXG4gKiBAcGFyYW0gaXNDbGFzc0Jhc2VkIGB0cnVlYCBpZiBgY2xhc3NgIChgZmFsc2VgIGlmIGBzdHlsZWApXG4gKiBAcGFyYW0gYmluZGluZ0luZGV4IEJpbmRpbmcgaW5kZXggb2YgdGhlIGJpbmRpbmcuXG4gKi9cbmZ1bmN0aW9uIHVwZGF0ZVN0eWxpbmcoXG4gICAgdFZpZXc6IFRWaWV3LCB0Tm9kZTogVE5vZGUsIGxWaWV3OiBMVmlldywgcmVuZGVyZXI6IFJlbmRlcmVyMywgcHJvcDogc3RyaW5nLFxuICAgIHZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsIHwgYm9vbGVhbiwgaXNDbGFzc0Jhc2VkOiBib29sZWFuLCBiaW5kaW5nSW5kZXg6IG51bWJlcikge1xuICBpZiAodE5vZGUudHlwZSAhPT0gVE5vZGVUeXBlLkVsZW1lbnQpIHtcbiAgICAvLyBJdCBpcyBwb3NzaWJsZSB0byBoYXZlIHN0eWxpbmcgb24gbm9uLWVsZW1lbnRzIChzdWNoIGFzIG5nLWNvbnRhaW5lcikuXG4gICAgLy8gVGhpcyBpcyByYXJlLCBidXQgaXQgZG9lcyBoYXBwZW4uIEluIHN1Y2ggYSBjYXNlLCBqdXN0IGlnbm9yZSB0aGUgYmluZGluZy5cbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgdERhdGEgPSB0Vmlldy5kYXRhO1xuICBjb25zdCB0UmFuZ2UgPSB0RGF0YVtiaW5kaW5nSW5kZXggKyAxXSBhcyBUU3R5bGluZ1JhbmdlO1xuICBjb25zdCBoaWdoZXJQcmlvcml0eVZhbHVlID0gZ2V0VFN0eWxpbmdSYW5nZU5leHREdXBsaWNhdGUodFJhbmdlKSA/XG4gICAgICBmaW5kU3R5bGluZ1ZhbHVlKHREYXRhLCB0Tm9kZSwgbFZpZXcsIHByb3AsIGdldFRTdHlsaW5nUmFuZ2VOZXh0KHRSYW5nZSksIGlzQ2xhc3NCYXNlZCkgOlxuICAgICAgdW5kZWZpbmVkO1xuICBpZiAoIWlzU3R5bGluZ1ZhbHVlUHJlc2VudChoaWdoZXJQcmlvcml0eVZhbHVlKSkge1xuICAgIC8vIFdlIGRvbid0IGhhdmUgYSBuZXh0IGR1cGxpY2F0ZSwgb3Igd2UgZGlkIG5vdCBmaW5kIGEgZHVwbGljYXRlIHZhbHVlLlxuICAgIGlmICghaXNTdHlsaW5nVmFsdWVQcmVzZW50KHZhbHVlKSkge1xuICAgICAgLy8gV2Ugc2hvdWxkIGRlbGV0ZSBjdXJyZW50IHZhbHVlIG9yIHJlc3RvcmUgdG8gbG93ZXIgcHJpb3JpdHkgdmFsdWUuXG4gICAgICBpZiAoZ2V0VFN0eWxpbmdSYW5nZVByZXZEdXBsaWNhdGUodFJhbmdlKSkge1xuICAgICAgICAvLyBXZSBoYXZlIGEgcG9zc2libGUgcHJldiBkdXBsaWNhdGUsIGxldCdzIHJldHJpZXZlIGl0LlxuICAgICAgICB2YWx1ZSA9IGZpbmRTdHlsaW5nVmFsdWUodERhdGEsIG51bGwsIGxWaWV3LCBwcm9wLCBiaW5kaW5nSW5kZXgsIGlzQ2xhc3NCYXNlZCk7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJOb2RlID0gZ2V0TmF0aXZlQnlJbmRleChnZXRTZWxlY3RlZEluZGV4KCksIGxWaWV3KSBhcyBSRWxlbWVudDtcbiAgICBhcHBseVN0eWxpbmcocmVuZGVyZXIsIGlzQ2xhc3NCYXNlZCwgck5vZGUsIHByb3AsIHZhbHVlKTtcbiAgfVxufVxuXG4vKipcbiAqIFNlYXJjaCBmb3Igc3R5bGluZyB2YWx1ZSB3aXRoIGhpZ2hlciBwcmlvcml0eSB3aGljaCBpcyBvdmVyd3JpdGluZyBjdXJyZW50IHZhbHVlLCBvciBhXG4gKiB2YWx1ZSBvZiBsb3dlciBwcmlvcml0eSB0byB3aGljaCB3ZSBzaG91bGQgZmFsbCBiYWNrIGlmIHRoZSB2YWx1ZSBpcyBgdW5kZWZpbmVkYC5cbiAqXG4gKiBXaGVuIHZhbHVlIGlzIGJlaW5nIGFwcGxpZWQgYXQgYSBsb2NhdGlvbiwgcmVsYXRlZCB2YWx1ZXMgbmVlZCB0byBiZSBjb25zdWx0ZWQuXG4gKiAtIElmIHRoZXJlIGlzIGEgaGlnaGVyIHByaW9yaXR5IGJpbmRpbmcsIHdlIHNob3VsZCBiZSB1c2luZyB0aGF0IG9uZSBpbnN0ZWFkLlxuICogICBGb3IgZXhhbXBsZSBgPGRpdiAgW3N0eWxlXT1cIntjb2xvcjpleHAxfVwiIFtzdHlsZS5jb2xvcl09XCJleHAyXCI+YCBjaGFuZ2UgdG8gYGV4cDFgXG4gKiAgIHJlcXVpcmVzIHRoYXQgd2UgY2hlY2sgYGV4cDJgIHRvIHNlZSBpZiBpdCBpcyBzZXQgdG8gdmFsdWUgb3RoZXIgdGhhbiBgdW5kZWZpbmVkYC5cbiAqIC0gSWYgdGhlcmUgaXMgYSBsb3dlciBwcmlvcml0eSBiaW5kaW5nIGFuZCB3ZSBhcmUgY2hhbmdpbmcgdG8gYHVuZGVmaW5lZGBcbiAqICAgRm9yIGV4YW1wbGUgYDxkaXYgIFtzdHlsZV09XCJ7Y29sb3I6ZXhwMX1cIiBbc3R5bGUuY29sb3JdPVwiZXhwMlwiPmAgY2hhbmdlIHRvIGBleHAyYCB0b1xuICogICBgdW5kZWZpbmVkYCByZXF1aXJlcyB0aGF0IHdlIGNoZWNrIGBleHAxYCAoYW5kIHN0YXRpYyB2YWx1ZXMpIGFuZCB1c2UgdGhhdCBhcyBuZXcgdmFsdWUuXG4gKlxuICogTk9URTogVGhlIHN0eWxpbmcgc3RvcmVzIHR3byB2YWx1ZXMuXG4gKiAxLiBUaGUgcmF3IHZhbHVlIHdoaWNoIGNhbWUgZnJvbSB0aGUgYXBwbGljYXRpb24gaXMgc3RvcmVkIGF0IGBpbmRleCArIDBgIGxvY2F0aW9uLiAoVGhpcyB2YWx1ZVxuICogICAgaXMgdXNlZCBmb3IgZGlydHkgY2hlY2tpbmcpLlxuICogMi4gVGhlIG5vcm1hbGl6ZWQgdmFsdWUgKGNvbnZlcnRlZCB0byBgS2V5VmFsdWVBcnJheWAgaWYgbWFwIGFuZCBzYW5pdGl6ZWQpIGlzIHN0b3JlZCBhdCBgaW5kZXggK1xuICogMWAuXG4gKiAgICBUaGUgYWR2YW50YWdlIG9mIHN0b3JpbmcgdGhlIHNhbml0aXplZCB2YWx1ZSBpcyB0aGF0IG9uY2UgdGhlIHZhbHVlIGlzIHdyaXR0ZW4gd2UgZG9uJ3QgbmVlZFxuICogICAgdG8gd29ycnkgYWJvdXQgc2FuaXRpemluZyBpdCBsYXRlciBvciBrZWVwaW5nIHRyYWNrIG9mIHRoZSBzYW5pdGl6ZXIuXG4gKlxuICogQHBhcmFtIHREYXRhIGBURGF0YWAgdXNlZCBmb3IgdHJhdmVyc2luZyB0aGUgcHJpb3JpdHkuXG4gKiBAcGFyYW0gdE5vZGUgYFROb2RlYCB0byB1c2UgZm9yIHJlc29sdmluZyBzdGF0aWMgc3R5bGluZy4gQWxzbyBjb250cm9scyBzZWFyY2ggZGlyZWN0aW9uLlxuICogICAtIGBUTm9kZWAgc2VhcmNoIG5leHQgYW5kIHF1aXQgYXMgc29vbiBhcyBgaXNTdHlsaW5nVmFsdWVQcmVzZW50KHZhbHVlKWAgaXMgdHJ1ZS5cbiAqICAgICAgSWYgbm8gdmFsdWUgZm91bmQgY29uc3VsdCBgdE5vZGUucmVzaWR1YWxTdHlsZWAvYHROb2RlLnJlc2lkdWFsQ2xhc3NgIGZvciBkZWZhdWx0IHZhbHVlLlxuICogICAtIGBudWxsYCBzZWFyY2ggcHJldiBhbmQgZ28gYWxsIHRoZSB3YXkgdG8gZW5kLiBSZXR1cm4gbGFzdCB2YWx1ZSB3aGVyZVxuICogICAgIGBpc1N0eWxpbmdWYWx1ZVByZXNlbnQodmFsdWUpYCBpcyB0cnVlLlxuICogQHBhcmFtIGxWaWV3IGBMVmlld2AgdXNlZCBmb3IgcmV0cmlldmluZyB0aGUgYWN0dWFsIHZhbHVlcy5cbiAqIEBwYXJhbSBwcm9wIFByb3BlcnR5IHdoaWNoIHdlIGFyZSBpbnRlcmVzdGVkIGluLlxuICogQHBhcmFtIGluZGV4IFN0YXJ0aW5nIGluZGV4IGluIHRoZSBsaW5rZWQgbGlzdCBvZiBzdHlsaW5nIGJpbmRpbmdzIHdoZXJlIHRoZSBzZWFyY2ggc2hvdWxkIHN0YXJ0LlxuICogQHBhcmFtIGlzQ2xhc3NCYXNlZCBgdHJ1ZWAgaWYgYGNsYXNzYCAoYGZhbHNlYCBpZiBgc3R5bGVgKVxuICovXG5mdW5jdGlvbiBmaW5kU3R5bGluZ1ZhbHVlKFxuICAgIHREYXRhOiBURGF0YSwgdE5vZGU6IFROb2RlIHwgbnVsbCwgbFZpZXc6IExWaWV3LCBwcm9wOiBzdHJpbmcsIGluZGV4OiBudW1iZXIsXG4gICAgaXNDbGFzc0Jhc2VkOiBib29sZWFuKTogYW55IHtcbiAgLy8gYFROb2RlYCB0byB1c2UgZm9yIHJlc29sdmluZyBzdGF0aWMgc3R5bGluZy4gQWxzbyBjb250cm9scyBzZWFyY2ggZGlyZWN0aW9uLlxuICAvLyAgIC0gYFROb2RlYCBzZWFyY2ggbmV4dCBhbmQgcXVpdCBhcyBzb29uIGFzIGBpc1N0eWxpbmdWYWx1ZVByZXNlbnQodmFsdWUpYCBpcyB0cnVlLlxuICAvLyAgICAgIElmIG5vIHZhbHVlIGZvdW5kIGNvbnN1bHQgYHROb2RlLnJlc2lkdWFsU3R5bGVgL2B0Tm9kZS5yZXNpZHVhbENsYXNzYCBmb3IgZGVmYXVsdCB2YWx1ZS5cbiAgLy8gICAtIGBudWxsYCBzZWFyY2ggcHJldiBhbmQgZ28gYWxsIHRoZSB3YXkgdG8gZW5kLiBSZXR1cm4gbGFzdCB2YWx1ZSB3aGVyZVxuICAvLyAgICAgYGlzU3R5bGluZ1ZhbHVlUHJlc2VudCh2YWx1ZSlgIGlzIHRydWUuXG4gIGNvbnN0IGlzUHJldkRpcmVjdGlvbiA9IHROb2RlID09PSBudWxsO1xuICBsZXQgdmFsdWU6IGFueSA9IHVuZGVmaW5lZDtcbiAgd2hpbGUgKGluZGV4ID4gMCkge1xuICAgIGNvbnN0IHJhd0tleSA9IHREYXRhW2luZGV4XSBhcyBUU3R5bGluZ0tleTtcbiAgICBjb25zdCBjb250YWluc1N0YXRpY3MgPSBBcnJheS5pc0FycmF5KHJhd0tleSk7XG4gICAgLy8gVW53cmFwIHRoZSBrZXkgaWYgd2UgY29udGFpbiBzdGF0aWMgdmFsdWVzLlxuICAgIGNvbnN0IGtleSA9IGNvbnRhaW5zU3RhdGljcyA/IChyYXdLZXkgYXMgc3RyaW5nW10pWzFdIDogcmF3S2V5O1xuICAgIGNvbnN0IGlzU3R5bGluZ01hcCA9IGtleSA9PT0gbnVsbDtcbiAgICBsZXQgdmFsdWVBdExWaWV3SW5kZXggPSBsVmlld1tpbmRleCArIDFdO1xuICAgIGlmICh2YWx1ZUF0TFZpZXdJbmRleCA9PT0gTk9fQ0hBTkdFKSB7XG4gICAgICAvLyBJbiBmaXJzdFVwZGF0ZVBhc3MgdGhlIHN0eWxpbmcgaW5zdHJ1Y3Rpb25zIGNyZWF0ZSBhIGxpbmtlZCBsaXN0IG9mIHN0eWxpbmcuXG4gICAgICAvLyBPbiBzdWJzZXF1ZW50IHBhc3NlcyBpdCBpcyBwb3NzaWJsZSBmb3IgYSBzdHlsaW5nIGluc3RydWN0aW9uIHRvIHRyeSB0byByZWFkIGEgYmluZGluZ1xuICAgICAgLy8gd2hpY2hcbiAgICAgIC8vIGhhcyBub3QgeWV0IGV4ZWN1dGVkLiBJbiB0aGF0IGNhc2Ugd2Ugd2lsbCBmaW5kIGBOT19DSEFOR0VgIGFuZCB3ZSBzaG91bGQgYXNzdW1lIHRoYXRcbiAgICAgIC8vIHdlIGhhdmUgYHVuZGVmaW5lZGAgKG9yIGVtcHR5IGFycmF5IGluIGNhc2Ugb2Ygc3R5bGluZy1tYXAgaW5zdHJ1Y3Rpb24pIGluc3RlYWQuIFRoaXNcbiAgICAgIC8vIGFsbG93cyB0aGUgcmVzb2x1dGlvbiB0byBhcHBseSB0aGUgdmFsdWUgKHdoaWNoIG1heSBsYXRlciBiZSBvdmVyd3JpdHRlbiB3aGVuIHRoZVxuICAgICAgLy8gYmluZGluZyBhY3R1YWxseSBleGVjdXRlcy4pXG4gICAgICB2YWx1ZUF0TFZpZXdJbmRleCA9IGlzU3R5bGluZ01hcCA/IEVNUFRZX0FSUkFZIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICBsZXQgY3VycmVudFZhbHVlID0gaXNTdHlsaW5nTWFwID8ga2V5VmFsdWVBcnJheUdldCh2YWx1ZUF0TFZpZXdJbmRleCwgcHJvcCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXkgPT09IHByb3AgPyB2YWx1ZUF0TFZpZXdJbmRleCA6IHVuZGVmaW5lZDtcbiAgICBpZiAoY29udGFpbnNTdGF0aWNzICYmICFpc1N0eWxpbmdWYWx1ZVByZXNlbnQoY3VycmVudFZhbHVlKSkge1xuICAgICAgY3VycmVudFZhbHVlID0ga2V5VmFsdWVBcnJheUdldChyYXdLZXkgYXMgS2V5VmFsdWVBcnJheTxhbnk+LCBwcm9wKTtcbiAgICB9XG4gICAgaWYgKGlzU3R5bGluZ1ZhbHVlUHJlc2VudChjdXJyZW50VmFsdWUpKSB7XG4gICAgICB2YWx1ZSA9IGN1cnJlbnRWYWx1ZTtcbiAgICAgIGlmIChpc1ByZXZEaXJlY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCB0UmFuZ2UgPSB0RGF0YVtpbmRleCArIDFdIGFzIFRTdHlsaW5nUmFuZ2U7XG4gICAgaW5kZXggPSBpc1ByZXZEaXJlY3Rpb24gPyBnZXRUU3R5bGluZ1JhbmdlUHJldih0UmFuZ2UpIDogZ2V0VFN0eWxpbmdSYW5nZU5leHQodFJhbmdlKTtcbiAgfVxuICBpZiAodE5vZGUgIT09IG51bGwpIHtcbiAgICAvLyBpbiBjYXNlIHdoZXJlIHdlIGFyZSBnb2luZyBpbiBuZXh0IGRpcmVjdGlvbiBBTkQgd2UgZGlkIG5vdCBmaW5kIGFueXRoaW5nLCB3ZSBuZWVkIHRvXG4gICAgLy8gY29uc3VsdCByZXNpZHVhbCBzdHlsaW5nXG4gICAgbGV0IHJlc2lkdWFsID0gaXNDbGFzc0Jhc2VkID8gdE5vZGUucmVzaWR1YWxDbGFzc2VzIDogdE5vZGUucmVzaWR1YWxTdHlsZXM7XG4gICAgaWYgKHJlc2lkdWFsICE9IG51bGwgLyoqIE9SIHJlc2lkdWFsICE9PT0gdW5kZWZpbmVkICovKSB7XG4gICAgICB2YWx1ZSA9IGtleVZhbHVlQXJyYXlHZXQocmVzaWR1YWwgISwgcHJvcCk7XG4gICAgfVxuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIHRoZSBiaW5kaW5nIHZhbHVlIHNob3VsZCBiZSB1c2VkIChvciBpZiB0aGUgdmFsdWUgaXMgJ3VuZGVmaW5lZCcgYW5kIGhlbmNlIHByaW9yaXR5XG4gKiByZXNvbHV0aW9uIHNob3VsZCBiZSB1c2VkLilcbiAqXG4gKiBAcGFyYW0gdmFsdWUgQmluZGluZyBzdHlsZSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gaXNTdHlsaW5nVmFsdWVQcmVzZW50KHZhbHVlOiBhbnkpOiBib29sZWFuIHtcbiAgLy8gQ3VycmVudGx5IG9ubHkgYHVuZGVmaW5lZGAgdmFsdWUgaXMgY29uc2lkZXJlZCBub24tYmluZGluZy4gVGhhdCBpcyBgdW5kZWZpbmVkYCBzYXlzIEkgZG9uJ3RcbiAgLy8gaGF2ZSBhbiBvcGluaW9uIGFzIHRvIHdoYXQgdGhpcyBiaW5kaW5nIHNob3VsZCBiZSBhbmQgeW91IHNob3VsZCBjb25zdWx0IG90aGVyIGJpbmRpbmdzIGJ5XG4gIC8vIHByaW9yaXR5IHRvIGRldGVybWluZSB0aGUgdmFsaWQgdmFsdWUuXG4gIC8vIFRoaXMgaXMgZXh0cmFjdGVkIGludG8gYSBzaW5nbGUgZnVuY3Rpb24gc28gdGhhdCB3ZSBoYXZlIGEgc2luZ2xlIHBsYWNlIHRvIGNvbnRyb2wgdGhpcy5cbiAgcmV0dXJuIHZhbHVlICE9PSB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogU2FuaXRpemVzIG9yIGFkZHMgc3VmZml4IHRvIHRoZSB2YWx1ZS5cbiAqXG4gKiBJZiB2YWx1ZSBpcyBgbnVsbGAvYHVuZGVmaW5lZGAgbm8gc3VmZml4IGlzIGFkZGVkXG4gKiBAcGFyYW0gdmFsdWVcbiAqIEBwYXJhbSBzdWZmaXhPclNhbml0aXplclxuICovXG5mdW5jdGlvbiBub3JtYWxpemVBbmRBcHBseVN1ZmZpeE9yU2FuaXRpemVyKFxuICAgIHZhbHVlOiBhbnksIHN1ZmZpeE9yU2FuaXRpemVyOiBTYW5pdGl6ZXJGbiB8IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGwpOiBzdHJpbmd8bnVsbHx1bmRlZmluZWR8XG4gICAgYm9vbGVhbiB7XG4gIGlmICh2YWx1ZSA9PSBudWxsIC8qKiB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkICovKSB7XG4gICAgLy8gZG8gbm90aGluZ1xuICB9IGVsc2UgaWYgKHR5cGVvZiBzdWZmaXhPclNhbml0aXplciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIC8vIHNhbml0aXplIHRoZSB2YWx1ZS5cbiAgICB2YWx1ZSA9IHN1ZmZpeE9yU2FuaXRpemVyKHZhbHVlKTtcbiAgfSBlbHNlIGlmICh0eXBlb2Ygc3VmZml4T3JTYW5pdGl6ZXIgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsdWUgPSB2YWx1ZSArIHN1ZmZpeE9yU2FuaXRpemVyO1xuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICB2YWx1ZSA9IHN0cmluZ2lmeSh1bndyYXBTYWZlVmFsdWUodmFsdWUpKTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cblxuLyoqXG4gKiBUZXN0cyBpZiB0aGUgYFROb2RlYCBoYXMgaW5wdXQgc2hhZG93LlxuICpcbiAqIEFuIGlucHV0IHNoYWRvdyBpcyB3aGVuIGEgZGlyZWN0aXZlIHN0ZWFscyAoc2hhZG93cykgdGhlIGlucHV0IGJ5IHVzaW5nIGBASW5wdXQoJ3N0eWxlJylgIG9yXG4gKiBgQElucHV0KCdjbGFzcycpYCBhcyBpbnB1dC5cbiAqXG4gKiBAcGFyYW0gdE5vZGUgYFROb2RlYCB3aGljaCB3ZSB3b3VsZCBsaWtlIHRvIHNlZSBpZiBpdCBoYXMgc2hhZG93LlxuICogQHBhcmFtIGlzQ2xhc3NCYXNlZCBgdHJ1ZWAgaWYgYGNsYXNzYCAoYGZhbHNlYCBpZiBgc3R5bGVgKVxuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzU3R5bGluZ0lucHV0U2hhZG93KHROb2RlOiBUTm9kZSwgaXNDbGFzc0Jhc2VkOiBib29sZWFuKSB7XG4gIHJldHVybiAodE5vZGUuZmxhZ3MgJiAoaXNDbGFzc0Jhc2VkID8gVE5vZGVGbGFncy5oYXNDbGFzc0lucHV0IDogVE5vZGVGbGFncy5oYXNTdHlsZUlucHV0KSkgIT09IDA7XG59XG4iXX0=