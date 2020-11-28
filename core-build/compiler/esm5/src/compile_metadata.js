/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { StaticSymbol } from './aot/static_symbol';
import { splitAtColon, stringify } from './util';
// group 0: "[prop] or (event) or @trigger"
// group 1: "prop" from "[prop]"
// group 2: "event" from "(event)"
// group 3: "@trigger" from "@trigger"
var HOST_REG_EXP = /^(?:(?:\[([^\]]+)\])|(?:\(([^\)]+)\)))|(\@[-\w]+)$/;
export function sanitizeIdentifier(name) {
    return name.replace(/\W/g, '_');
}
var _anonymousTypeIndex = 0;
export function identifierName(compileIdentifier) {
    if (!compileIdentifier || !compileIdentifier.reference) {
        return null;
    }
    var ref = compileIdentifier.reference;
    if (ref instanceof StaticSymbol) {
        return ref.name;
    }
    if (ref['__anonymousType']) {
        return ref['__anonymousType'];
    }
    var identifier = stringify(ref);
    if (identifier.indexOf('(') >= 0) {
        // case: anonymous functions!
        identifier = "anonymous_" + _anonymousTypeIndex++;
        ref['__anonymousType'] = identifier;
    }
    else {
        identifier = sanitizeIdentifier(identifier);
    }
    return identifier;
}
export function identifierModuleUrl(compileIdentifier) {
    var ref = compileIdentifier.reference;
    if (ref instanceof StaticSymbol) {
        return ref.filePath;
    }
    // Runtime type
    return "./" + stringify(ref);
}
export function viewClassName(compType, embeddedTemplateIndex) {
    return "View_" + identifierName({ reference: compType }) + "_" + embeddedTemplateIndex;
}
export function rendererTypeName(compType) {
    return "RenderType_" + identifierName({ reference: compType });
}
export function hostViewClassName(compType) {
    return "HostView_" + identifierName({ reference: compType });
}
export function componentFactoryName(compType) {
    return identifierName({ reference: compType }) + "NgFactory";
}
export var CompileSummaryKind;
(function (CompileSummaryKind) {
    CompileSummaryKind[CompileSummaryKind["Pipe"] = 0] = "Pipe";
    CompileSummaryKind[CompileSummaryKind["Directive"] = 1] = "Directive";
    CompileSummaryKind[CompileSummaryKind["NgModule"] = 2] = "NgModule";
    CompileSummaryKind[CompileSummaryKind["Injectable"] = 3] = "Injectable";
})(CompileSummaryKind || (CompileSummaryKind = {}));
export function tokenName(token) {
    return token.value != null ? sanitizeIdentifier(token.value) : identifierName(token.identifier);
}
export function tokenReference(token) {
    if (token.identifier != null) {
        return token.identifier.reference;
    }
    else {
        return token.value;
    }
}
/**
 * Metadata about a stylesheet
 */
var CompileStylesheetMetadata = /** @class */ (function () {
    function CompileStylesheetMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, moduleUrl = _b.moduleUrl, styles = _b.styles, styleUrls = _b.styleUrls;
        this.moduleUrl = moduleUrl || null;
        this.styles = _normalizeArray(styles);
        this.styleUrls = _normalizeArray(styleUrls);
    }
    return CompileStylesheetMetadata;
}());
export { CompileStylesheetMetadata };
/**
 * Metadata regarding compilation of a template.
 */
var CompileTemplateMetadata = /** @class */ (function () {
    function CompileTemplateMetadata(_a) {
        var encapsulation = _a.encapsulation, template = _a.template, templateUrl = _a.templateUrl, htmlAst = _a.htmlAst, styles = _a.styles, styleUrls = _a.styleUrls, externalStylesheets = _a.externalStylesheets, animations = _a.animations, ngContentSelectors = _a.ngContentSelectors, interpolation = _a.interpolation, isInline = _a.isInline, preserveWhitespaces = _a.preserveWhitespaces;
        this.encapsulation = encapsulation;
        this.template = template;
        this.templateUrl = templateUrl;
        this.htmlAst = htmlAst;
        this.styles = _normalizeArray(styles);
        this.styleUrls = _normalizeArray(styleUrls);
        this.externalStylesheets = _normalizeArray(externalStylesheets);
        this.animations = animations ? flatten(animations) : [];
        this.ngContentSelectors = ngContentSelectors || [];
        if (interpolation && interpolation.length != 2) {
            throw new Error("'interpolation' should have a start and an end symbol.");
        }
        this.interpolation = interpolation;
        this.isInline = isInline;
        this.preserveWhitespaces = preserveWhitespaces;
    }
    CompileTemplateMetadata.prototype.toSummary = function () {
        return {
            ngContentSelectors: this.ngContentSelectors,
            encapsulation: this.encapsulation,
            styles: this.styles,
            animations: this.animations
        };
    };
    return CompileTemplateMetadata;
}());
export { CompileTemplateMetadata };
/**
 * Metadata regarding compilation of a directive.
 */
var CompileDirectiveMetadata = /** @class */ (function () {
    function CompileDirectiveMetadata(_a) {
        var isHost = _a.isHost, type = _a.type, isComponent = _a.isComponent, selector = _a.selector, exportAs = _a.exportAs, changeDetection = _a.changeDetection, reactiveProperties = _a.reactiveProperties, inputs = _a.inputs, outputs = _a.outputs, hostListeners = _a.hostListeners, hostProperties = _a.hostProperties, hostAttributes = _a.hostAttributes, providers = _a.providers, viewProviders = _a.viewProviders, queries = _a.queries, guards = _a.guards, viewQueries = _a.viewQueries, entryComponents = _a.entryComponents, template = _a.template, componentViewType = _a.componentViewType, rendererType = _a.rendererType, componentFactory = _a.componentFactory;
        this.isHost = !!isHost;
        this.type = type;
        this.isComponent = isComponent;
        this.selector = selector;
        this.exportAs = exportAs;
        this.changeDetection = changeDetection;
        this.reactiveProperties = reactiveProperties;
        this.inputs = inputs;
        this.outputs = outputs;
        this.hostListeners = hostListeners;
        this.hostProperties = hostProperties;
        this.hostAttributes = hostAttributes;
        this.providers = _normalizeArray(providers);
        this.viewProviders = _normalizeArray(viewProviders);
        this.queries = _normalizeArray(queries);
        this.guards = guards;
        this.viewQueries = _normalizeArray(viewQueries);
        this.entryComponents = _normalizeArray(entryComponents);
        this.template = template;
        this.componentViewType = componentViewType;
        this.rendererType = rendererType;
        this.componentFactory = componentFactory;
    }
    CompileDirectiveMetadata.create = function (_a) {
        var isHost = _a.isHost, type = _a.type, isComponent = _a.isComponent, selector = _a.selector, exportAs = _a.exportAs, changeDetection = _a.changeDetection, reactiveProperties = _a.reactiveProperties, inputs = _a.inputs, outputs = _a.outputs, host = _a.host, providers = _a.providers, viewProviders = _a.viewProviders, queries = _a.queries, guards = _a.guards, viewQueries = _a.viewQueries, entryComponents = _a.entryComponents, template = _a.template, componentViewType = _a.componentViewType, rendererType = _a.rendererType, componentFactory = _a.componentFactory;
        var hostListeners = {};
        var hostProperties = {};
        var hostAttributes = {};
        if (host != null) {
            Object.keys(host).forEach(function (key) {
                var value = host[key];
                var matches = key.match(HOST_REG_EXP);
                if (matches === null) {
                    hostAttributes[key] = value;
                }
                else if (matches[1] != null) {
                    hostProperties[matches[1]] = value;
                }
                else if (matches[2] != null) {
                    hostListeners[matches[2]] = value;
                }
            });
        }
        var inputsMap = {};
        if (inputs != null) {
            inputs.forEach(function (bindConfig) {
                // canonical syntax: `dirProp: elProp`
                // if there is no `:`, use dirProp = elProp
                var parts = splitAtColon(bindConfig, [bindConfig, bindConfig]);
                inputsMap[parts[0]] = parts[1];
            });
        }
        var outputsMap = {};
        if (outputs != null) {
            outputs.forEach(function (bindConfig) {
                // canonical syntax: `dirProp: elProp`
                // if there is no `:`, use dirProp = elProp
                var parts = splitAtColon(bindConfig, [bindConfig, bindConfig]);
                outputsMap[parts[0]] = parts[1];
            });
        }
        return new CompileDirectiveMetadata({
            isHost: isHost,
            type: type,
            isComponent: !!isComponent, selector: selector, exportAs: exportAs, changeDetection: changeDetection, reactiveProperties: reactiveProperties,
            inputs: inputsMap,
            outputs: outputsMap,
            hostListeners: hostListeners,
            hostProperties: hostProperties,
            hostAttributes: hostAttributes,
            providers: providers,
            viewProviders: viewProviders,
            queries: queries,
            guards: guards,
            viewQueries: viewQueries,
            entryComponents: entryComponents,
            template: template,
            componentViewType: componentViewType,
            rendererType: rendererType,
            componentFactory: componentFactory,
        });
    };
    CompileDirectiveMetadata.prototype.toSummary = function () {
        return {
            summaryKind: CompileSummaryKind.Directive,
            type: this.type,
            isComponent: this.isComponent,
            selector: this.selector,
            exportAs: this.exportAs,
            inputs: this.inputs,
            outputs: this.outputs,
            hostListeners: this.hostListeners,
            hostProperties: this.hostProperties,
            hostAttributes: this.hostAttributes,
            providers: this.providers,
            viewProviders: this.viewProviders,
            queries: this.queries,
            guards: this.guards,
            viewQueries: this.viewQueries,
            entryComponents: this.entryComponents,
            changeDetection: this.changeDetection,
            reactiveProperties: this.reactiveProperties,
            template: this.template && this.template.toSummary(),
            componentViewType: this.componentViewType,
            rendererType: this.rendererType,
            componentFactory: this.componentFactory
        };
    };
    return CompileDirectiveMetadata;
}());
export { CompileDirectiveMetadata };
var CompilePipeMetadata = /** @class */ (function () {
    function CompilePipeMetadata(_a) {
        var type = _a.type, name = _a.name, pure = _a.pure;
        this.type = type;
        this.name = name;
        this.pure = !!pure;
    }
    CompilePipeMetadata.prototype.toSummary = function () {
        return {
            summaryKind: CompileSummaryKind.Pipe,
            type: this.type,
            name: this.name,
            pure: this.pure
        };
    };
    return CompilePipeMetadata;
}());
export { CompilePipeMetadata };
var CompileShallowModuleMetadata = /** @class */ (function () {
    function CompileShallowModuleMetadata() {
    }
    return CompileShallowModuleMetadata;
}());
export { CompileShallowModuleMetadata };
/**
 * Metadata regarding compilation of a module.
 */
var CompileNgModuleMetadata = /** @class */ (function () {
    function CompileNgModuleMetadata(_a) {
        var type = _a.type, providers = _a.providers, declaredDirectives = _a.declaredDirectives, exportedDirectives = _a.exportedDirectives, declaredPipes = _a.declaredPipes, exportedPipes = _a.exportedPipes, entryComponents = _a.entryComponents, bootstrapComponents = _a.bootstrapComponents, importedModules = _a.importedModules, exportedModules = _a.exportedModules, schemas = _a.schemas, transitiveModule = _a.transitiveModule, id = _a.id;
        this.type = type || null;
        this.declaredDirectives = _normalizeArray(declaredDirectives);
        this.exportedDirectives = _normalizeArray(exportedDirectives);
        this.declaredPipes = _normalizeArray(declaredPipes);
        this.exportedPipes = _normalizeArray(exportedPipes);
        this.providers = _normalizeArray(providers);
        this.entryComponents = _normalizeArray(entryComponents);
        this.bootstrapComponents = _normalizeArray(bootstrapComponents);
        this.importedModules = _normalizeArray(importedModules);
        this.exportedModules = _normalizeArray(exportedModules);
        this.schemas = _normalizeArray(schemas);
        this.id = id || null;
        this.transitiveModule = transitiveModule || null;
    }
    CompileNgModuleMetadata.prototype.toSummary = function () {
        var module = this.transitiveModule;
        return {
            summaryKind: CompileSummaryKind.NgModule,
            type: this.type,
            entryComponents: module.entryComponents,
            providers: module.providers,
            modules: module.modules,
            exportedDirectives: module.exportedDirectives,
            exportedPipes: module.exportedPipes
        };
    };
    return CompileNgModuleMetadata;
}());
export { CompileNgModuleMetadata };
var TransitiveCompileNgModuleMetadata = /** @class */ (function () {
    function TransitiveCompileNgModuleMetadata() {
        this.directivesSet = new Set();
        this.directives = [];
        this.exportedDirectivesSet = new Set();
        this.exportedDirectives = [];
        this.pipesSet = new Set();
        this.pipes = [];
        this.exportedPipesSet = new Set();
        this.exportedPipes = [];
        this.modulesSet = new Set();
        this.modules = [];
        this.entryComponentsSet = new Set();
        this.entryComponents = [];
        this.providers = [];
    }
    TransitiveCompileNgModuleMetadata.prototype.addProvider = function (provider, module) {
        this.providers.push({ provider: provider, module: module });
    };
    TransitiveCompileNgModuleMetadata.prototype.addDirective = function (id) {
        if (!this.directivesSet.has(id.reference)) {
            this.directivesSet.add(id.reference);
            this.directives.push(id);
        }
    };
    TransitiveCompileNgModuleMetadata.prototype.addExportedDirective = function (id) {
        if (!this.exportedDirectivesSet.has(id.reference)) {
            this.exportedDirectivesSet.add(id.reference);
            this.exportedDirectives.push(id);
        }
    };
    TransitiveCompileNgModuleMetadata.prototype.addPipe = function (id) {
        if (!this.pipesSet.has(id.reference)) {
            this.pipesSet.add(id.reference);
            this.pipes.push(id);
        }
    };
    TransitiveCompileNgModuleMetadata.prototype.addExportedPipe = function (id) {
        if (!this.exportedPipesSet.has(id.reference)) {
            this.exportedPipesSet.add(id.reference);
            this.exportedPipes.push(id);
        }
    };
    TransitiveCompileNgModuleMetadata.prototype.addModule = function (id) {
        if (!this.modulesSet.has(id.reference)) {
            this.modulesSet.add(id.reference);
            this.modules.push(id);
        }
    };
    TransitiveCompileNgModuleMetadata.prototype.addEntryComponent = function (ec) {
        if (!this.entryComponentsSet.has(ec.componentType)) {
            this.entryComponentsSet.add(ec.componentType);
            this.entryComponents.push(ec);
        }
    };
    return TransitiveCompileNgModuleMetadata;
}());
export { TransitiveCompileNgModuleMetadata };
function _normalizeArray(obj) {
    return obj || [];
}
var ProviderMeta = /** @class */ (function () {
    function ProviderMeta(token, _a) {
        var useClass = _a.useClass, useValue = _a.useValue, useExisting = _a.useExisting, useFactory = _a.useFactory, deps = _a.deps, multi = _a.multi;
        this.token = token;
        this.useClass = useClass || null;
        this.useValue = useValue;
        this.useExisting = useExisting;
        this.useFactory = useFactory || null;
        this.dependencies = deps || null;
        this.multi = !!multi;
    }
    return ProviderMeta;
}());
export { ProviderMeta };
export function flatten(list) {
    return list.reduce(function (flat, item) {
        var flatItem = Array.isArray(item) ? flatten(item) : item;
        return flat.concat(flatItem);
    }, []);
}
function jitSourceUrl(url) {
    // Note: We need 3 "/" so that ng shows up as a separate domain
    // in the chrome dev tools.
    return url.replace(/(\w+:\/\/[\w:-]+)?(\/+)?/, 'ng:///');
}
export function templateSourceUrl(ngModuleType, compMeta, templateMeta) {
    var url;
    if (templateMeta.isInline) {
        if (compMeta.type.reference instanceof StaticSymbol) {
            // Note: a .ts file might contain multiple components with inline templates,
            // so we need to give them unique urls, as these will be used for sourcemaps.
            url = compMeta.type.reference.filePath + "." + compMeta.type.reference.name + ".html";
        }
        else {
            url = identifierName(ngModuleType) + "/" + identifierName(compMeta.type) + ".html";
        }
    }
    else {
        url = templateMeta.templateUrl;
    }
    return compMeta.type.reference instanceof StaticSymbol ? url : jitSourceUrl(url);
}
export function sharedStylesheetJitUrl(meta, id) {
    var pathParts = meta.moduleUrl.split(/\/\\/g);
    var baseName = pathParts[pathParts.length - 1];
    return jitSourceUrl("css/" + id + baseName + ".ngstyle.js");
}
export function ngModuleJitUrl(moduleMeta) {
    return jitSourceUrl(identifierName(moduleMeta.type) + "/module.ngfactory.js");
}
export function templateJitUrl(ngModuleType, compMeta) {
    return jitSourceUrl(identifierName(ngModuleType) + "/" + identifierName(compMeta.type) + ".ngfactory.js");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZV9tZXRhZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9jb21waWxlX21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUlqRCxPQUFPLEVBQUMsWUFBWSxFQUFFLFNBQVMsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUUvQywyQ0FBMkM7QUFDM0MsZ0NBQWdDO0FBQ2hDLGtDQUFrQztBQUNsQyxzQ0FBc0M7QUFDdEMsSUFBTSxZQUFZLEdBQUcsb0RBQW9ELENBQUM7QUFFMUUsTUFBTSxVQUFVLGtCQUFrQixDQUFDLElBQVk7SUFDN0MsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNsQyxDQUFDO0FBRUQsSUFBSSxtQkFBbUIsR0FBRyxDQUFDLENBQUM7QUFFNUIsTUFBTSxVQUFVLGNBQWMsQ0FBQyxpQkFBK0Q7SUFFNUYsSUFBSSxDQUFDLGlCQUFpQixJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxFQUFFO1FBQ3RELE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFDRCxJQUFNLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxTQUFTLENBQUM7SUFDeEMsSUFBSSxHQUFHLFlBQVksWUFBWSxFQUFFO1FBQy9CLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQztLQUNqQjtJQUNELElBQUksR0FBRyxDQUFDLGlCQUFpQixDQUFDLEVBQUU7UUFDMUIsT0FBTyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUMvQjtJQUNELElBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNoQyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ2hD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QUMsT0FBTyxDQUFDLENBQUM7SUFDbEQsSUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDakQsT0FBTyxZQUFZLENBQUMsU0FBTyxFQUFFLEdBQUcsUUFBUSxnQkFBYSxDQUFDLENBQUM7QUFDekQsQ0FBQztBQUVELE1BQU0sVUFBVSxjQUFjLENBQUMsVUFBbUM7SUFDaEUsT0FBTyxZQUFZLENBQUksY0FBYyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMseUJBQXNCLENBQUMsQ0FBQztBQUNoRixDQUFDO0FBRUQsTUFBTSxVQUFVLGNBQWMsQ0FDMUIsWUFBdUMsRUFBRSxRQUFrQztJQUM3RSxPQUFPLFlBQVksQ0FDWixjQUFjLENBQUMsWUFBWSxDQUFDLFNBQUksY0FBYyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsa0JBQWUsQ0FBQyxDQUFDO0FBQ3ZGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U3RhdGljU3ltYm9sfSBmcm9tICcuL2FvdC9zdGF0aWNfc3ltYm9sJztcbmltcG9ydCB7Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIFNjaGVtYU1ldGFkYXRhLCBUeXBlLCBWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnLi9jb3JlJztcbmltcG9ydCB7TGlmZWN5Y2xlSG9va3N9IGZyb20gJy4vbGlmZWN5Y2xlX3JlZmxlY3Rvcic7XG5pbXBvcnQge1BhcnNlVHJlZVJlc3VsdCBhcyBIdG1sUGFyc2VUcmVlUmVzdWx0fSBmcm9tICcuL21sX3BhcnNlci9wYXJzZXInO1xuaW1wb3J0IHtzcGxpdEF0Q29sb24sIHN0cmluZ2lmeX0gZnJvbSAnLi91dGlsJztcblxuLy8gZ3JvdXAgMDogXCJbcHJvcF0gb3IgKGV2ZW50KSBvciBAdHJpZ2dlclwiXG4vLyBncm91cCAxOiBcInByb3BcIiBmcm9tIFwiW3Byb3BdXCJcbi8vIGdyb3VwIDI6IFwiZXZlbnRcIiBmcm9tIFwiKGV2ZW50KVwiXG4vLyBncm91cCAzOiBcIkB0cmlnZ2VyXCIgZnJvbSBcIkB0cmlnZ2VyXCJcbmNvbnN0IEhPU1RfUkVHX0VYUCA9IC9eKD86KD86XFxbKFteXFxdXSspXFxdKXwoPzpcXCgoW15cXCldKylcXCkpKXwoXFxAWy1cXHddKykkLztcblxuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplSWRlbnRpZmllcihuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gbmFtZS5yZXBsYWNlKC9cXFcvZywgJ18nKTtcbn1cblxubGV0IF9hbm9ueW1vdXNUeXBlSW5kZXggPSAwO1xuXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpZmllck5hbWUoY29tcGlsZUlkZW50aWZpZXI6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgfCBudWxsIHwgdW5kZWZpbmVkKTpcbiAgICBzdHJpbmd8bnVsbCB7XG4gIGlmICghY29tcGlsZUlkZW50aWZpZXIgfHwgIWNvbXBpbGVJZGVudGlmaWVyLnJlZmVyZW5jZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IHJlZiA9IGNvbXBpbGVJZGVudGlmaWVyLnJlZmVyZW5jZTtcbiAgaWYgKHJlZiBpbnN0YW5jZW9mIFN0YXRpY1N5bWJvbCkge1xuICAgIHJldHVybiByZWYubmFtZTtcbiAgfVxuICBpZiAocmVmWydfX2Fub255bW91c1R5cGUnXSkge1xuICAgIHJldHVybiByZWZbJ19fYW5vbnltb3VzVHlwZSddO1xuICB9XG4gIGxldCBpZGVudGlmaWVyID0gc3RyaW5naWZ5KHJlZik7XG4gIGlmIChpZGVudGlmaWVyLmluZGV4T2YoJygnKSA+PSAwKSB7XG4gICAgLy8gY2FzZTogYW5vbnltb3VzIGZ1bmN0aW9ucyFcbiAgICBpZGVudGlmaWVyID0gYGFub255bW91c18ke19hbm9ueW1vdXNUeXBlSW5kZXgrK31gO1xuICAgIHJlZlsnX19hbm9ueW1vdXNUeXBlJ10gPSBpZGVudGlmaWVyO1xuICB9IGVsc2Uge1xuICAgIGlkZW50aWZpZXIgPSBzYW5pdGl6ZUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gIH1cbiAgcmV0dXJuIGlkZW50aWZpZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpZGVudGlmaWVyTW9kdWxlVXJsKGNvbXBpbGVJZGVudGlmaWVyOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKTogc3RyaW5nIHtcbiAgY29uc3QgcmVmID0gY29tcGlsZUlkZW50aWZpZXIucmVmZXJlbmNlO1xuICBpZiAocmVmIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sKSB7XG4gICAgcmV0dXJuIHJlZi5maWxlUGF0aDtcbiAgfVxuICAvLyBSdW50aW1lIHR5cGVcbiAgcmV0dXJuIGAuLyR7c3RyaW5naWZ5KHJlZil9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZpZXdDbGFzc05hbWUoY29tcFR5cGU6IGFueSwgZW1iZWRkZWRUZW1wbGF0ZUluZGV4OiBudW1iZXIpOiBzdHJpbmcge1xuICByZXR1cm4gYFZpZXdfJHtpZGVudGlmaWVyTmFtZSh7cmVmZXJlbmNlOiBjb21wVHlwZX0pfV8ke2VtYmVkZGVkVGVtcGxhdGVJbmRleH1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyZXJUeXBlTmFtZShjb21wVHlwZTogYW55KTogc3RyaW5nIHtcbiAgcmV0dXJuIGBSZW5kZXJUeXBlXyR7aWRlbnRpZmllck5hbWUoe3JlZmVyZW5jZTogY29tcFR5cGV9KX1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaG9zdFZpZXdDbGFzc05hbWUoY29tcFR5cGU6IGFueSk6IHN0cmluZyB7XG4gIHJldHVybiBgSG9zdFZpZXdfJHtpZGVudGlmaWVyTmFtZSh7cmVmZXJlbmNlOiBjb21wVHlwZX0pfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wb25lbnRGYWN0b3J5TmFtZShjb21wVHlwZTogYW55KTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke2lkZW50aWZpZXJOYW1lKHtyZWZlcmVuY2U6IGNvbXBUeXBlfSl9TmdGYWN0b3J5YDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQcm94eUNsYXNzIHsgc2V0RGVsZWdhdGUoZGVsZWdhdGU6IGFueSk6IHZvaWQ7IH1cblxuZXhwb3J0IGludGVyZmFjZSBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHsgcmVmZXJlbmNlOiBhbnk7IH1cblxuZXhwb3J0IGVudW0gQ29tcGlsZVN1bW1hcnlLaW5kIHtcbiAgUGlwZSxcbiAgRGlyZWN0aXZlLFxuICBOZ01vZHVsZSxcbiAgSW5qZWN0YWJsZVxufVxuXG4vKipcbiAqIEEgQ29tcGlsZVN1bW1hcnkgaXMgdGhlIGRhdGEgbmVlZGVkIHRvIHVzZSBhIGRpcmVjdGl2ZSAvIHBpcGUgLyBtb2R1bGVcbiAqIGluIG90aGVyIG1vZHVsZXMgLyBjb21wb25lbnRzLiBIb3dldmVyLCB0aGlzIGRhdGEgaXMgbm90IGVub3VnaCB0byBjb21waWxlXG4gKiB0aGUgZGlyZWN0aXZlIC8gbW9kdWxlIGl0c2VsZi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21waWxlVHlwZVN1bW1hcnkge1xuICBzdW1tYXJ5S2luZDogQ29tcGlsZVN1bW1hcnlLaW5kfG51bGw7XG4gIHR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGE7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhIHtcbiAgaXNBdHRyaWJ1dGU/OiBib29sZWFuO1xuICBpc1NlbGY/OiBib29sZWFuO1xuICBpc0hvc3Q/OiBib29sZWFuO1xuICBpc1NraXBTZWxmPzogYm9vbGVhbjtcbiAgaXNPcHRpb25hbD86IGJvb2xlYW47XG4gIGlzVmFsdWU/OiBib29sZWFuO1xuICB0b2tlbj86IENvbXBpbGVUb2tlbk1ldGFkYXRhO1xuICB2YWx1ZT86IGFueTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21waWxlUHJvdmlkZXJNZXRhZGF0YSB7XG4gIHRva2VuOiBDb21waWxlVG9rZW5NZXRhZGF0YTtcbiAgdXNlQ2xhc3M/OiBDb21waWxlVHlwZU1ldGFkYXRhO1xuICB1c2VWYWx1ZT86IGFueTtcbiAgdXNlRXhpc3Rpbmc/OiBDb21waWxlVG9rZW5NZXRhZGF0YTtcbiAgdXNlRmFjdG9yeT86IENvbXBpbGVGYWN0b3J5TWV0YWRhdGE7XG4gIGRlcHM/OiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXTtcbiAgbXVsdGk/OiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBpbGVGYWN0b3J5TWV0YWRhdGEgZXh0ZW5kcyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHtcbiAgZGlEZXBzOiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXTtcbiAgcmVmZXJlbmNlOiBhbnk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b2tlbk5hbWUodG9rZW46IENvbXBpbGVUb2tlbk1ldGFkYXRhKSB7XG4gIHJldHVybiB0b2tlbi52YWx1ZSAhPSBudWxsID8gc2FuaXRpemVJZGVudGlmaWVyKHRva2VuLnZhbHVlKSA6IGlkZW50aWZpZXJOYW1lKHRva2VuLmlkZW50aWZpZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9rZW5SZWZlcmVuY2UodG9rZW46IENvbXBpbGVUb2tlbk1ldGFkYXRhKSB7XG4gIGlmICh0b2tlbi5pZGVudGlmaWVyICE9IG51bGwpIHtcbiAgICByZXR1cm4gdG9rZW4uaWRlbnRpZmllci5yZWZlcmVuY2U7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRva2VuLnZhbHVlO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGlsZVRva2VuTWV0YWRhdGEge1xuICB2YWx1ZT86IGFueTtcbiAgaWRlbnRpZmllcj86IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGF8Q29tcGlsZVR5cGVNZXRhZGF0YTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21waWxlSW5qZWN0YWJsZU1ldGFkYXRhIHtcbiAgc3ltYm9sOiBTdGF0aWNTeW1ib2w7XG4gIHR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGE7XG5cbiAgcHJvdmlkZWRJbj86IFN0YXRpY1N5bWJvbDtcblxuICB1c2VWYWx1ZT86IGFueTtcbiAgdXNlQ2xhc3M/OiBTdGF0aWNTeW1ib2w7XG4gIHVzZUV4aXN0aW5nPzogU3RhdGljU3ltYm9sO1xuICB1c2VGYWN0b3J5PzogU3RhdGljU3ltYm9sO1xuICBkZXBzPzogYW55W107XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVnYXJkaW5nIGNvbXBpbGF0aW9uIG9mIGEgdHlwZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21waWxlVHlwZU1ldGFkYXRhIGV4dGVuZHMgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7XG4gIGRpRGVwczogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW107XG4gIGxpZmVjeWNsZUhvb2tzOiBMaWZlY3ljbGVIb29rc1tdO1xuICByZWZlcmVuY2U6IGFueTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21waWxlUXVlcnlNZXRhZGF0YSB7XG4gIHNlbGVjdG9yczogQXJyYXk8Q29tcGlsZVRva2VuTWV0YWRhdGE+O1xuICBkZXNjZW5kYW50czogYm9vbGVhbjtcbiAgZmlyc3Q6IGJvb2xlYW47XG4gIHByb3BlcnR5TmFtZTogc3RyaW5nO1xuICByZWFkOiBDb21waWxlVG9rZW5NZXRhZGF0YTtcbiAgc3RhdGljPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBNZXRhZGF0YSBhYm91dCBhIHN0eWxlc2hlZXRcbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBpbGVTdHlsZXNoZWV0TWV0YWRhdGEge1xuICBtb2R1bGVVcmw6IHN0cmluZ3xudWxsO1xuICBzdHlsZXM6IHN0cmluZ1tdO1xuICBzdHlsZVVybHM6IHN0cmluZ1tdO1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHttb2R1bGVVcmwsIHN0eWxlcyxcbiAgICAgICBzdHlsZVVybHN9OiB7bW9kdWxlVXJsPzogc3RyaW5nLCBzdHlsZXM/OiBzdHJpbmdbXSwgc3R5bGVVcmxzPzogc3RyaW5nW119ID0ge30pIHtcbiAgICB0aGlzLm1vZHVsZVVybCA9IG1vZHVsZVVybCB8fCBudWxsO1xuICAgIHRoaXMuc3R5bGVzID0gX25vcm1hbGl6ZUFycmF5KHN0eWxlcyk7XG4gICAgdGhpcy5zdHlsZVVybHMgPSBfbm9ybWFsaXplQXJyYXkoc3R5bGVVcmxzKTtcbiAgfVxufVxuXG4vKipcbiAqIFN1bW1hcnkgTWV0YWRhdGEgcmVnYXJkaW5nIGNvbXBpbGF0aW9uIG9mIGEgdGVtcGxhdGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGlsZVRlbXBsYXRlU3VtbWFyeSB7XG4gIG5nQ29udGVudFNlbGVjdG9yczogc3RyaW5nW107XG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9ufG51bGw7XG4gIHN0eWxlczogc3RyaW5nW107XG4gIGFuaW1hdGlvbnM6IGFueVtdfG51bGw7XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVnYXJkaW5nIGNvbXBpbGF0aW9uIG9mIGEgdGVtcGxhdGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21waWxlVGVtcGxhdGVNZXRhZGF0YSB7XG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9ufG51bGw7XG4gIHRlbXBsYXRlOiBzdHJpbmd8bnVsbDtcbiAgdGVtcGxhdGVVcmw6IHN0cmluZ3xudWxsO1xuICBodG1sQXN0OiBIdG1sUGFyc2VUcmVlUmVzdWx0fG51bGw7XG4gIGlzSW5saW5lOiBib29sZWFuO1xuICBzdHlsZXM6IHN0cmluZ1tdO1xuICBzdHlsZVVybHM6IHN0cmluZ1tdO1xuICBleHRlcm5hbFN0eWxlc2hlZXRzOiBDb21waWxlU3R5bGVzaGVldE1ldGFkYXRhW107XG4gIGFuaW1hdGlvbnM6IGFueVtdO1xuICBuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdO1xuICBpbnRlcnBvbGF0aW9uOiBbc3RyaW5nLCBzdHJpbmddfG51bGw7XG4gIHByZXNlcnZlV2hpdGVzcGFjZXM6IGJvb2xlYW47XG4gIGNvbnN0cnVjdG9yKHtlbmNhcHN1bGF0aW9uLCB0ZW1wbGF0ZSwgdGVtcGxhdGVVcmwsIGh0bWxBc3QsIHN0eWxlcywgc3R5bGVVcmxzLFxuICAgICAgICAgICAgICAgZXh0ZXJuYWxTdHlsZXNoZWV0cywgYW5pbWF0aW9ucywgbmdDb250ZW50U2VsZWN0b3JzLCBpbnRlcnBvbGF0aW9uLCBpc0lubGluZSxcbiAgICAgICAgICAgICAgIHByZXNlcnZlV2hpdGVzcGFjZXN9OiB7XG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24gfCBudWxsLFxuICAgIHRlbXBsYXRlOiBzdHJpbmd8bnVsbCxcbiAgICB0ZW1wbGF0ZVVybDogc3RyaW5nfG51bGwsXG4gICAgaHRtbEFzdDogSHRtbFBhcnNlVHJlZVJlc3VsdHxudWxsLFxuICAgIHN0eWxlczogc3RyaW5nW10sXG4gICAgc3R5bGVVcmxzOiBzdHJpbmdbXSxcbiAgICBleHRlcm5hbFN0eWxlc2hlZXRzOiBDb21waWxlU3R5bGVzaGVldE1ldGFkYXRhW10sXG4gICAgbmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXSxcbiAgICBhbmltYXRpb25zOiBhbnlbXSxcbiAgICBpbnRlcnBvbGF0aW9uOiBbc3RyaW5nLCBzdHJpbmddfG51bGwsXG4gICAgaXNJbmxpbmU6IGJvb2xlYW4sXG4gICAgcHJlc2VydmVXaGl0ZXNwYWNlczogYm9vbGVhblxuICB9KSB7XG4gICAgdGhpcy5lbmNhcHN1bGF0aW9uID0gZW5jYXBzdWxhdGlvbjtcbiAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gICAgdGhpcy50ZW1wbGF0ZVVybCA9IHRlbXBsYXRlVXJsO1xuICAgIHRoaXMuaHRtbEFzdCA9IGh0bWxBc3Q7XG4gICAgdGhpcy5zdHlsZXMgPSBfbm9ybWFsaXplQXJyYXkoc3R5bGVzKTtcbiAgICB0aGlzLnN0eWxlVXJscyA9IF9ub3JtYWxpemVBcnJheShzdHlsZVVybHMpO1xuICAgIHRoaXMuZXh0ZXJuYWxTdHlsZXNoZWV0cyA9IF9ub3JtYWxpemVBcnJheShleHRlcm5hbFN0eWxlc2hlZXRzKTtcbiAgICB0aGlzLmFuaW1hdGlvbnMgPSBhbmltYXRpb25zID8gZmxhdHRlbihhbmltYXRpb25zKSA6IFtdO1xuICAgIHRoaXMubmdDb250ZW50U2VsZWN0b3JzID0gbmdDb250ZW50U2VsZWN0b3JzIHx8IFtdO1xuICAgIGlmIChpbnRlcnBvbGF0aW9uICYmIGludGVycG9sYXRpb24ubGVuZ3RoICE9IDIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgJ2ludGVycG9sYXRpb24nIHNob3VsZCBoYXZlIGEgc3RhcnQgYW5kIGFuIGVuZCBzeW1ib2wuYCk7XG4gICAgfVxuICAgIHRoaXMuaW50ZXJwb2xhdGlvbiA9IGludGVycG9sYXRpb247XG4gICAgdGhpcy5pc0lubGluZSA9IGlzSW5saW5lO1xuICAgIHRoaXMucHJlc2VydmVXaGl0ZXNwYWNlcyA9IHByZXNlcnZlV2hpdGVzcGFjZXM7XG4gIH1cblxuICB0b1N1bW1hcnkoKTogQ29tcGlsZVRlbXBsYXRlU3VtbWFyeSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nQ29udGVudFNlbGVjdG9yczogdGhpcy5uZ0NvbnRlbnRTZWxlY3RvcnMsXG4gICAgICBlbmNhcHN1bGF0aW9uOiB0aGlzLmVuY2Fwc3VsYXRpb24sXG4gICAgICBzdHlsZXM6IHRoaXMuc3R5bGVzLFxuICAgICAgYW5pbWF0aW9uczogdGhpcy5hbmltYXRpb25zXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBpbGVFbnRyeUNvbXBvbmVudE1ldGFkYXRhIHtcbiAgY29tcG9uZW50VHlwZTogYW55O1xuICBjb21wb25lbnRGYWN0b3J5OiBTdGF0aWNTeW1ib2x8b2JqZWN0O1xufVxuXG4vLyBOb3RlOiBUaGlzIHNob3VsZCBvbmx5IHVzZSBpbnRlcmZhY2VzIGFzIG5lc3RlZCBkYXRhIHR5cGVzXG4vLyBhcyB3ZSBuZWVkIHRvIGJlIGFibGUgdG8gc2VyaWFsaXplIHRoaXMgZnJvbS90byBKU09OIVxuZXhwb3J0IGludGVyZmFjZSBDb21waWxlRGlyZWN0aXZlU3VtbWFyeSBleHRlbmRzIENvbXBpbGVUeXBlU3VtbWFyeSB7XG4gIHR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGE7XG4gIGlzQ29tcG9uZW50OiBib29sZWFuO1xuICBzZWxlY3Rvcjogc3RyaW5nfG51bGw7XG4gIGV4cG9ydEFzOiBzdHJpbmd8bnVsbDtcbiAgaW5wdXRzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgb3V0cHV0czoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIGhvc3RMaXN0ZW5lcnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBob3N0UHJvcGVydGllczoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIGhvc3RBdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgcHJvdmlkZXJzOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YVtdO1xuICB2aWV3UHJvdmlkZXJzOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YVtdO1xuICBxdWVyaWVzOiBDb21waWxlUXVlcnlNZXRhZGF0YVtdO1xuICBndWFyZHM6IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuICB2aWV3UXVlcmllczogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXTtcbiAgZW50cnlDb21wb25lbnRzOiBDb21waWxlRW50cnlDb21wb25lbnRNZXRhZGF0YVtdO1xuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5fG51bGw7XG4gIHJlYWN0aXZlUHJvcGVydGllczogc3RyaW5nW118bnVsbDtcbiAgdGVtcGxhdGU6IENvbXBpbGVUZW1wbGF0ZVN1bW1hcnl8bnVsbDtcbiAgY29tcG9uZW50Vmlld1R5cGU6IFN0YXRpY1N5bWJvbHxQcm94eUNsYXNzfG51bGw7XG4gIHJlbmRlcmVyVHlwZTogU3RhdGljU3ltYm9sfG9iamVjdHxudWxsO1xuICBjb21wb25lbnRGYWN0b3J5OiBTdGF0aWNTeW1ib2x8b2JqZWN0fG51bGw7XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVnYXJkaW5nIGNvbXBpbGF0aW9uIG9mIGEgZGlyZWN0aXZlLlxuICovXG5leHBvcnQgY2xhc3MgQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgc3RhdGljIGNyZWF0ZSh7aXNIb3N0LCB0eXBlLCBpc0NvbXBvbmVudCwgc2VsZWN0b3IsIGV4cG9ydEFzLCBjaGFuZ2VEZXRlY3Rpb24sIHJlYWN0aXZlUHJvcGVydGllcywgaW5wdXRzLCBvdXRwdXRzLFxuICAgICAgICAgICAgICAgICBob3N0LCBwcm92aWRlcnMsIHZpZXdQcm92aWRlcnMsIHF1ZXJpZXMsIGd1YXJkcywgdmlld1F1ZXJpZXMsIGVudHJ5Q29tcG9uZW50cyxcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGUsIGNvbXBvbmVudFZpZXdUeXBlLCByZW5kZXJlclR5cGUsIGNvbXBvbmVudEZhY3Rvcnl9OiB7XG4gICAgaXNIb3N0OiBib29sZWFuLFxuICAgIHR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGEsXG4gICAgaXNDb21wb25lbnQ6IGJvb2xlYW4sXG4gICAgc2VsZWN0b3I6IHN0cmluZ3xudWxsLFxuICAgIGV4cG9ydEFzOiBzdHJpbmd8bnVsbCxcbiAgICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5fG51bGwsXG4gICAgcmVhY3RpdmVQcm9wZXJ0aWVzOiBzdHJpbmdbXTtcbiAgICBpbnB1dHM6IHN0cmluZ1tdLFxuICAgIG91dHB1dHM6IHN0cmluZ1tdLFxuICAgIGhvc3Q6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIHByb3ZpZGVyczogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGFbXSxcbiAgICB2aWV3UHJvdmlkZXJzOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YVtdLFxuICAgIHF1ZXJpZXM6IENvbXBpbGVRdWVyeU1ldGFkYXRhW10sXG4gICAgZ3VhcmRzOiB7W2tleTogc3RyaW5nXTogYW55fTtcbiAgICB2aWV3UXVlcmllczogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXSxcbiAgICBlbnRyeUNvbXBvbmVudHM6IENvbXBpbGVFbnRyeUNvbXBvbmVudE1ldGFkYXRhW10sXG4gICAgdGVtcGxhdGU6IENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhLFxuICAgIGNvbXBvbmVudFZpZXdUeXBlOiBTdGF0aWNTeW1ib2x8UHJveHlDbGFzc3xudWxsLFxuICAgIHJlbmRlcmVyVHlwZTogU3RhdGljU3ltYm9sfG9iamVjdHxudWxsLFxuICAgIGNvbXBvbmVudEZhY3Rvcnk6IFN0YXRpY1N5bWJvbHxvYmplY3R8bnVsbCxcbiAgfSk6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSB7XG4gICAgY29uc3QgaG9zdExpc3RlbmVyczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICBjb25zdCBob3N0UHJvcGVydGllczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICBjb25zdCBob3N0QXR0cmlidXRlczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICBpZiAoaG9zdCAhPSBudWxsKSB7XG4gICAgICBPYmplY3Qua2V5cyhob3N0KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gaG9zdFtrZXldO1xuICAgICAgICBjb25zdCBtYXRjaGVzID0ga2V5Lm1hdGNoKEhPU1RfUkVHX0VYUCk7XG4gICAgICAgIGlmIChtYXRjaGVzID09PSBudWxsKSB7XG4gICAgICAgICAgaG9zdEF0dHJpYnV0ZXNba2V5XSA9IHZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKG1hdGNoZXNbMV0gIT0gbnVsbCkge1xuICAgICAgICAgIGhvc3RQcm9wZXJ0aWVzW21hdGNoZXNbMV1dID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAobWF0Y2hlc1syXSAhPSBudWxsKSB7XG4gICAgICAgICAgaG9zdExpc3RlbmVyc1ttYXRjaGVzWzJdXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgY29uc3QgaW5wdXRzTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIGlmIChpbnB1dHMgIT0gbnVsbCkge1xuICAgICAgaW5wdXRzLmZvckVhY2goKGJpbmRDb25maWc6IHN0cmluZykgPT4ge1xuICAgICAgICAvLyBjYW5vbmljYWwgc3ludGF4OiBgZGlyUHJvcDogZWxQcm9wYFxuICAgICAgICAvLyBpZiB0aGVyZSBpcyBubyBgOmAsIHVzZSBkaXJQcm9wID0gZWxQcm9wXG4gICAgICAgIGNvbnN0IHBhcnRzID0gc3BsaXRBdENvbG9uKGJpbmRDb25maWcsIFtiaW5kQ29uZmlnLCBiaW5kQ29uZmlnXSk7XG4gICAgICAgIGlucHV0c01hcFtwYXJ0c1swXV0gPSBwYXJ0c1sxXTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBjb25zdCBvdXRwdXRzTWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIGlmIChvdXRwdXRzICE9IG51bGwpIHtcbiAgICAgIG91dHB1dHMuZm9yRWFjaCgoYmluZENvbmZpZzogc3RyaW5nKSA9PiB7XG4gICAgICAgIC8vIGNhbm9uaWNhbCBzeW50YXg6IGBkaXJQcm9wOiBlbFByb3BgXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIG5vIGA6YCwgdXNlIGRpclByb3AgPSBlbFByb3BcbiAgICAgICAgY29uc3QgcGFydHMgPSBzcGxpdEF0Q29sb24oYmluZENvbmZpZywgW2JpbmRDb25maWcsIGJpbmRDb25maWddKTtcbiAgICAgICAgb3V0cHV0c01hcFtwYXJ0c1swXV0gPSBwYXJ0c1sxXTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhKHtcbiAgICAgIGlzSG9zdCxcbiAgICAgIHR5cGUsXG4gICAgICBpc0NvbXBvbmVudDogISFpc0NvbXBvbmVudCwgc2VsZWN0b3IsIGV4cG9ydEFzLCBjaGFuZ2VEZXRlY3Rpb24sIHJlYWN0aXZlUHJvcGVydGllcyxcbiAgICAgIGlucHV0czogaW5wdXRzTWFwLFxuICAgICAgb3V0cHV0czogb3V0cHV0c01hcCxcbiAgICAgIGhvc3RMaXN0ZW5lcnMsXG4gICAgICBob3N0UHJvcGVydGllcyxcbiAgICAgIGhvc3RBdHRyaWJ1dGVzLFxuICAgICAgcHJvdmlkZXJzLFxuICAgICAgdmlld1Byb3ZpZGVycyxcbiAgICAgIHF1ZXJpZXMsXG4gICAgICBndWFyZHMsXG4gICAgICB2aWV3UXVlcmllcyxcbiAgICAgIGVudHJ5Q29tcG9uZW50cyxcbiAgICAgIHRlbXBsYXRlLFxuICAgICAgY29tcG9uZW50Vmlld1R5cGUsXG4gICAgICByZW5kZXJlclR5cGUsXG4gICAgICBjb21wb25lbnRGYWN0b3J5LFxuICAgIH0pO1xuICB9XG4gIGlzSG9zdDogYm9vbGVhbjtcbiAgdHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YTtcbiAgaXNDb21wb25lbnQ6IGJvb2xlYW47XG4gIHNlbGVjdG9yOiBzdHJpbmd8bnVsbDtcbiAgZXhwb3J0QXM6IHN0cmluZ3xudWxsO1xuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5fG51bGw7XG4gIHJlYWN0aXZlUHJvcGVydGllczogc3RyaW5nW118bnVsbDtcbiAgaW5wdXRzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgb3V0cHV0czoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIGhvc3RMaXN0ZW5lcnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBob3N0UHJvcGVydGllczoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIGhvc3RBdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgcHJvdmlkZXJzOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YVtdO1xuICB2aWV3UHJvdmlkZXJzOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YVtdO1xuICBxdWVyaWVzOiBDb21waWxlUXVlcnlNZXRhZGF0YVtdO1xuICBndWFyZHM6IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuICB2aWV3UXVlcmllczogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXTtcbiAgZW50cnlDb21wb25lbnRzOiBDb21waWxlRW50cnlDb21wb25lbnRNZXRhZGF0YVtdO1xuXG4gIHRlbXBsYXRlOiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YXxudWxsO1xuXG4gIGNvbXBvbmVudFZpZXdUeXBlOiBTdGF0aWNTeW1ib2x8UHJveHlDbGFzc3xudWxsO1xuICByZW5kZXJlclR5cGU6IFN0YXRpY1N5bWJvbHxvYmplY3R8bnVsbDtcbiAgY29tcG9uZW50RmFjdG9yeTogU3RhdGljU3ltYm9sfG9iamVjdHxudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHtpc0hvc3QsXG4gICAgICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgICAgaXNDb21wb25lbnQsXG4gICAgICAgICAgICAgICBzZWxlY3RvcixcbiAgICAgICAgICAgICAgIGV4cG9ydEFzLFxuICAgICAgICAgICAgICAgY2hhbmdlRGV0ZWN0aW9uLFxuICAgICAgICAgICAgICAgcmVhY3RpdmVQcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgaW5wdXRzLFxuICAgICAgICAgICAgICAgb3V0cHV0cyxcbiAgICAgICAgICAgICAgIGhvc3RMaXN0ZW5lcnMsXG4gICAgICAgICAgICAgICBob3N0UHJvcGVydGllcyxcbiAgICAgICAgICAgICAgIGhvc3RBdHRyaWJ1dGVzLFxuICAgICAgICAgICAgICAgcHJvdmlkZXJzLFxuICAgICAgICAgICAgICAgdmlld1Byb3ZpZGVycyxcbiAgICAgICAgICAgICAgIHF1ZXJpZXMsXG4gICAgICAgICAgICAgICBndWFyZHMsXG4gICAgICAgICAgICAgICB2aWV3UXVlcmllcyxcbiAgICAgICAgICAgICAgIGVudHJ5Q29tcG9uZW50cyxcbiAgICAgICAgICAgICAgIHRlbXBsYXRlLFxuICAgICAgICAgICAgICAgY29tcG9uZW50Vmlld1R5cGUsXG4gICAgICAgICAgICAgICByZW5kZXJlclR5cGUsXG4gICAgICAgICAgICAgICBjb21wb25lbnRGYWN0b3J5fToge1xuICAgIGlzSG9zdDogYm9vbGVhbixcbiAgICB0eXBlOiBDb21waWxlVHlwZU1ldGFkYXRhLFxuICAgIGlzQ29tcG9uZW50OiBib29sZWFuLFxuICAgIHNlbGVjdG9yOiBzdHJpbmd8bnVsbCxcbiAgICBleHBvcnRBczogc3RyaW5nfG51bGwsXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneXxudWxsLFxuICAgIHJlYWN0aXZlUHJvcGVydGllczogc3RyaW5nW118bnVsbDtcbiAgICBpbnB1dHM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIG91dHB1dHM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIGhvc3RMaXN0ZW5lcnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIGhvc3RQcm9wZXJ0aWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBob3N0QXR0cmlidXRlczoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgcHJvdmlkZXJzOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YVtdLFxuICAgIHZpZXdQcm92aWRlcnM6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhW10sXG4gICAgcXVlcmllczogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXSxcbiAgICBndWFyZHM6IHtba2V5OiBzdHJpbmddOiBhbnl9LFxuICAgIHZpZXdRdWVyaWVzOiBDb21waWxlUXVlcnlNZXRhZGF0YVtdLFxuICAgIGVudHJ5Q29tcG9uZW50czogQ29tcGlsZUVudHJ5Q29tcG9uZW50TWV0YWRhdGFbXSxcbiAgICB0ZW1wbGF0ZTogQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGF8bnVsbCxcbiAgICBjb21wb25lbnRWaWV3VHlwZTogU3RhdGljU3ltYm9sfFByb3h5Q2xhc3N8bnVsbCxcbiAgICByZW5kZXJlclR5cGU6IFN0YXRpY1N5bWJvbHxvYmplY3R8bnVsbCxcbiAgICBjb21wb25lbnRGYWN0b3J5OiBTdGF0aWNTeW1ib2x8b2JqZWN0fG51bGwsXG4gIH0pIHtcbiAgICB0aGlzLmlzSG9zdCA9ICEhaXNIb3N0O1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5pc0NvbXBvbmVudCA9IGlzQ29tcG9uZW50O1xuICAgIHRoaXMuc2VsZWN0b3IgPSBzZWxlY3RvcjtcbiAgICB0aGlzLmV4cG9ydEFzID0gZXhwb3J0QXM7XG4gICAgdGhpcy5jaGFuZ2VEZXRlY3Rpb24gPSBjaGFuZ2VEZXRlY3Rpb247XG4gICAgdGhpcy5yZWFjdGl2ZVByb3BlcnRpZXMgPSByZWFjdGl2ZVByb3BlcnRpZXM7XG4gICAgdGhpcy5pbnB1dHMgPSBpbnB1dHM7XG4gICAgdGhpcy5vdXRwdXRzID0gb3V0cHV0cztcbiAgICB0aGlzLmhvc3RMaXN0ZW5lcnMgPSBob3N0TGlzdGVuZXJzO1xuICAgIHRoaXMuaG9zdFByb3BlcnRpZXMgPSBob3N0UHJvcGVydGllcztcbiAgICB0aGlzLmhvc3RBdHRyaWJ1dGVzID0gaG9zdEF0dHJpYnV0ZXM7XG4gICAgdGhpcy5wcm92aWRlcnMgPSBfbm9ybWFsaXplQXJyYXkocHJvdmlkZXJzKTtcbiAgICB0aGlzLnZpZXdQcm92aWRlcnMgPSBfbm9ybWFsaXplQXJyYXkodmlld1Byb3ZpZGVycyk7XG4gICAgdGhpcy5xdWVyaWVzID0gX25vcm1hbGl6ZUFycmF5KHF1ZXJpZXMpO1xuICAgIHRoaXMuZ3VhcmRzID0gZ3VhcmRzO1xuICAgIHRoaXMudmlld1F1ZXJpZXMgPSBfbm9ybWFsaXplQXJyYXkodmlld1F1ZXJpZXMpO1xuICAgIHRoaXMuZW50cnlDb21wb25lbnRzID0gX25vcm1hbGl6ZUFycmF5KGVudHJ5Q29tcG9uZW50cyk7XG4gICAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuXG4gICAgdGhpcy5jb21wb25lbnRWaWV3VHlwZSA9IGNvbXBvbmVudFZpZXdUeXBlO1xuICAgIHRoaXMucmVuZGVyZXJUeXBlID0gcmVuZGVyZXJUeXBlO1xuICAgIHRoaXMuY29tcG9uZW50RmFjdG9yeSA9IGNvbXBvbmVudEZhY3Rvcnk7XG4gIH1cblxuICB0b1N1bW1hcnkoKTogQ29tcGlsZURpcmVjdGl2ZVN1bW1hcnkge1xuICAgIHJldHVybiB7XG4gICAgICBzdW1tYXJ5S2luZDogQ29tcGlsZVN1bW1hcnlLaW5kLkRpcmVjdGl2ZSxcbiAgICAgIHR5cGU6IHRoaXMudHlwZSxcbiAgICAgIGlzQ29tcG9uZW50OiB0aGlzLmlzQ29tcG9uZW50LFxuICAgICAgc2VsZWN0b3I6IHRoaXMuc2VsZWN0b3IsXG4gICAgICBleHBvcnRBczogdGhpcy5leHBvcnRBcyxcbiAgICAgIGlucHV0czogdGhpcy5pbnB1dHMsXG4gICAgICBvdXRwdXRzOiB0aGlzLm91dHB1dHMsXG4gICAgICBob3N0TGlzdGVuZXJzOiB0aGlzLmhvc3RMaXN0ZW5lcnMsXG4gICAgICBob3N0UHJvcGVydGllczogdGhpcy5ob3N0UHJvcGVydGllcyxcbiAgICAgIGhvc3RBdHRyaWJ1dGVzOiB0aGlzLmhvc3RBdHRyaWJ1dGVzLFxuICAgICAgcHJvdmlkZXJzOiB0aGlzLnByb3ZpZGVycyxcbiAgICAgIHZpZXdQcm92aWRlcnM6IHRoaXMudmlld1Byb3ZpZGVycyxcbiAgICAgIHF1ZXJpZXM6IHRoaXMucXVlcmllcyxcbiAgICAgIGd1YXJkczogdGhpcy5ndWFyZHMsXG4gICAgICB2aWV3UXVlcmllczogdGhpcy52aWV3UXVlcmllcyxcbiAgICAgIGVudHJ5Q29tcG9uZW50czogdGhpcy5lbnRyeUNvbXBvbmVudHMsXG4gICAgICBjaGFuZ2VEZXRlY3Rpb246IHRoaXMuY2hhbmdlRGV0ZWN0aW9uLFxuICAgICAgcmVhY3RpdmVQcm9wZXJ0aWVzOiB0aGlzLnJlYWN0aXZlUHJvcGVydGllcyxcbiAgICAgIHRlbXBsYXRlOiB0aGlzLnRlbXBsYXRlICYmIHRoaXMudGVtcGxhdGUudG9TdW1tYXJ5KCksXG4gICAgICBjb21wb25lbnRWaWV3VHlwZTogdGhpcy5jb21wb25lbnRWaWV3VHlwZSxcbiAgICAgIHJlbmRlcmVyVHlwZTogdGhpcy5yZW5kZXJlclR5cGUsXG4gICAgICBjb21wb25lbnRGYWN0b3J5OiB0aGlzLmNvbXBvbmVudEZhY3RvcnlcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGlsZVBpcGVTdW1tYXJ5IGV4dGVuZHMgQ29tcGlsZVR5cGVTdW1tYXJ5IHtcbiAgdHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YTtcbiAgbmFtZTogc3RyaW5nO1xuICBwdXJlOiBib29sZWFuO1xufVxuXG5leHBvcnQgY2xhc3MgQ29tcGlsZVBpcGVNZXRhZGF0YSB7XG4gIHR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGE7XG4gIG5hbWU6IHN0cmluZztcbiAgcHVyZTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcih7dHlwZSwgbmFtZSwgcHVyZX06IHtcbiAgICB0eXBlOiBDb21waWxlVHlwZU1ldGFkYXRhLFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBwdXJlOiBib29sZWFuLFxuICB9KSB7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMucHVyZSA9ICEhcHVyZTtcbiAgfVxuXG4gIHRvU3VtbWFyeSgpOiBDb21waWxlUGlwZVN1bW1hcnkge1xuICAgIHJldHVybiB7XG4gICAgICBzdW1tYXJ5S2luZDogQ29tcGlsZVN1bW1hcnlLaW5kLlBpcGUsXG4gICAgICB0eXBlOiB0aGlzLnR5cGUsXG4gICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICBwdXJlOiB0aGlzLnB1cmVcbiAgICB9O1xuICB9XG59XG5cbi8vIE5vdGU6IFRoaXMgc2hvdWxkIG9ubHkgdXNlIGludGVyZmFjZXMgYXMgbmVzdGVkIGRhdGEgdHlwZXNcbi8vIGFzIHdlIG5lZWQgdG8gYmUgYWJsZSB0byBzZXJpYWxpemUgdGhpcyBmcm9tL3RvIEpTT04hXG5leHBvcnQgaW50ZXJmYWNlIENvbXBpbGVOZ01vZHVsZVN1bW1hcnkgZXh0ZW5kcyBDb21waWxlVHlwZVN1bW1hcnkge1xuICB0eXBlOiBDb21waWxlVHlwZU1ldGFkYXRhO1xuXG4gIC8vIE5vdGU6IFRoaXMgaXMgdHJhbnNpdGl2ZSBvdmVyIHRoZSBleHBvcnRlZCBtb2R1bGVzLlxuICBleHBvcnRlZERpcmVjdGl2ZXM6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXTtcbiAgLy8gTm90ZTogVGhpcyBpcyB0cmFuc2l0aXZlIG92ZXIgdGhlIGV4cG9ydGVkIG1vZHVsZXMuXG4gIGV4cG9ydGVkUGlwZXM6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXTtcblxuICAvLyBOb3RlOiBUaGlzIGlzIHRyYW5zaXRpdmUuXG4gIGVudHJ5Q29tcG9uZW50czogQ29tcGlsZUVudHJ5Q29tcG9uZW50TWV0YWRhdGFbXTtcbiAgLy8gTm90ZTogVGhpcyBpcyB0cmFuc2l0aXZlLlxuICBwcm92aWRlcnM6IHtwcm92aWRlcjogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEsIG1vZHVsZTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YX1bXTtcbiAgLy8gTm90ZTogVGhpcyBpcyB0cmFuc2l0aXZlLlxuICBtb2R1bGVzOiBDb21waWxlVHlwZU1ldGFkYXRhW107XG59XG5cbmV4cG9ydCBjbGFzcyBDb21waWxlU2hhbGxvd01vZHVsZU1ldGFkYXRhIHtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHR5cGUgITogQ29tcGlsZVR5cGVNZXRhZGF0YTtcblxuICByYXdFeHBvcnRzOiBhbnk7XG4gIHJhd0ltcG9ydHM6IGFueTtcbiAgcmF3UHJvdmlkZXJzOiBhbnk7XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVnYXJkaW5nIGNvbXBpbGF0aW9uIG9mIGEgbW9kdWxlLlxuICovXG5leHBvcnQgY2xhc3MgQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGEge1xuICB0eXBlOiBDb21waWxlVHlwZU1ldGFkYXRhO1xuICBkZWNsYXJlZERpcmVjdGl2ZXM6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXTtcbiAgZXhwb3J0ZWREaXJlY3RpdmVzOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhW107XG4gIGRlY2xhcmVkUGlwZXM6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXTtcblxuICBleHBvcnRlZFBpcGVzOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhW107XG4gIGVudHJ5Q29tcG9uZW50czogQ29tcGlsZUVudHJ5Q29tcG9uZW50TWV0YWRhdGFbXTtcbiAgYm9vdHN0cmFwQ29tcG9uZW50czogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdO1xuICBwcm92aWRlcnM6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhW107XG5cbiAgaW1wb3J0ZWRNb2R1bGVzOiBDb21waWxlTmdNb2R1bGVTdW1tYXJ5W107XG4gIGV4cG9ydGVkTW9kdWxlczogQ29tcGlsZU5nTW9kdWxlU3VtbWFyeVtdO1xuICBzY2hlbWFzOiBTY2hlbWFNZXRhZGF0YVtdO1xuICBpZDogc3RyaW5nfG51bGw7XG5cbiAgdHJhbnNpdGl2ZU1vZHVsZTogVHJhbnNpdGl2ZUNvbXBpbGVOZ01vZHVsZU1ldGFkYXRhO1xuXG4gIGNvbnN0cnVjdG9yKHt0eXBlLCBwcm92aWRlcnMsIGRlY2xhcmVkRGlyZWN0aXZlcywgZXhwb3J0ZWREaXJlY3RpdmVzLCBkZWNsYXJlZFBpcGVzLFxuICAgICAgICAgICAgICAgZXhwb3J0ZWRQaXBlcywgZW50cnlDb21wb25lbnRzLCBib290c3RyYXBDb21wb25lbnRzLCBpbXBvcnRlZE1vZHVsZXMsXG4gICAgICAgICAgICAgICBleHBvcnRlZE1vZHVsZXMsIHNjaGVtYXMsIHRyYW5zaXRpdmVNb2R1bGUsIGlkfToge1xuICAgIHR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGEsXG4gICAgcHJvdmlkZXJzOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YVtdLFxuICAgIGRlY2xhcmVkRGlyZWN0aXZlczogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdLFxuICAgIGV4cG9ydGVkRGlyZWN0aXZlczogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdLFxuICAgIGRlY2xhcmVkUGlwZXM6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXSxcbiAgICBleHBvcnRlZFBpcGVzOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhW10sXG4gICAgZW50cnlDb21wb25lbnRzOiBDb21waWxlRW50cnlDb21wb25lbnRNZXRhZGF0YVtdLFxuICAgIGJvb3RzdHJhcENvbXBvbmVudHM6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXSxcbiAgICBpbXBvcnRlZE1vZHVsZXM6IENvbXBpbGVOZ01vZHVsZVN1bW1hcnlbXSxcbiAgICBleHBvcnRlZE1vZHVsZXM6IENvbXBpbGVOZ01vZHVsZVN1bW1hcnlbXSxcbiAgICB0cmFuc2l0aXZlTW9kdWxlOiBUcmFuc2l0aXZlQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGEsXG4gICAgc2NoZW1hczogU2NoZW1hTWV0YWRhdGFbXSxcbiAgICBpZDogc3RyaW5nfG51bGxcbiAgfSkge1xuICAgIHRoaXMudHlwZSA9IHR5cGUgfHwgbnVsbDtcbiAgICB0aGlzLmRlY2xhcmVkRGlyZWN0aXZlcyA9IF9ub3JtYWxpemVBcnJheShkZWNsYXJlZERpcmVjdGl2ZXMpO1xuICAgIHRoaXMuZXhwb3J0ZWREaXJlY3RpdmVzID0gX25vcm1hbGl6ZUFycmF5KGV4cG9ydGVkRGlyZWN0aXZlcyk7XG4gICAgdGhpcy5kZWNsYXJlZFBpcGVzID0gX25vcm1hbGl6ZUFycmF5KGRlY2xhcmVkUGlwZXMpO1xuICAgIHRoaXMuZXhwb3J0ZWRQaXBlcyA9IF9ub3JtYWxpemVBcnJheShleHBvcnRlZFBpcGVzKTtcbiAgICB0aGlzLnByb3ZpZGVycyA9IF9ub3JtYWxpemVBcnJheShwcm92aWRlcnMpO1xuICAgIHRoaXMuZW50cnlDb21wb25lbnRzID0gX25vcm1hbGl6ZUFycmF5KGVudHJ5Q29tcG9uZW50cyk7XG4gICAgdGhpcy5ib290c3RyYXBDb21wb25lbnRzID0gX25vcm1hbGl6ZUFycmF5KGJvb3RzdHJhcENvbXBvbmVudHMpO1xuICAgIHRoaXMuaW1wb3J0ZWRNb2R1bGVzID0gX25vcm1hbGl6ZUFycmF5KGltcG9ydGVkTW9kdWxlcyk7XG4gICAgdGhpcy5leHBvcnRlZE1vZHVsZXMgPSBfbm9ybWFsaXplQXJyYXkoZXhwb3J0ZWRNb2R1bGVzKTtcbiAgICB0aGlzLnNjaGVtYXMgPSBfbm9ybWFsaXplQXJyYXkoc2NoZW1hcyk7XG4gICAgdGhpcy5pZCA9IGlkIHx8IG51bGw7XG4gICAgdGhpcy50cmFuc2l0aXZlTW9kdWxlID0gdHJhbnNpdGl2ZU1vZHVsZSB8fCBudWxsO1xuICB9XG5cbiAgdG9TdW1tYXJ5KCk6IENvbXBpbGVOZ01vZHVsZVN1bW1hcnkge1xuICAgIGNvbnN0IG1vZHVsZSA9IHRoaXMudHJhbnNpdGl2ZU1vZHVsZSAhO1xuICAgIHJldHVybiB7XG4gICAgICBzdW1tYXJ5S2luZDogQ29tcGlsZVN1bW1hcnlLaW5kLk5nTW9kdWxlLFxuICAgICAgdHlwZTogdGhpcy50eXBlLFxuICAgICAgZW50cnlDb21wb25lbnRzOiBtb2R1bGUuZW50cnlDb21wb25lbnRzLFxuICAgICAgcHJvdmlkZXJzOiBtb2R1bGUucHJvdmlkZXJzLFxuICAgICAgbW9kdWxlczogbW9kdWxlLm1vZHVsZXMsXG4gICAgICBleHBvcnRlZERpcmVjdGl2ZXM6IG1vZHVsZS5leHBvcnRlZERpcmVjdGl2ZXMsXG4gICAgICBleHBvcnRlZFBpcGVzOiBtb2R1bGUuZXhwb3J0ZWRQaXBlc1xuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRyYW5zaXRpdmVDb21waWxlTmdNb2R1bGVNZXRhZGF0YSB7XG4gIGRpcmVjdGl2ZXNTZXQgPSBuZXcgU2V0PGFueT4oKTtcbiAgZGlyZWN0aXZlczogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdID0gW107XG4gIGV4cG9ydGVkRGlyZWN0aXZlc1NldCA9IG5ldyBTZXQ8YW55PigpO1xuICBleHBvcnRlZERpcmVjdGl2ZXM6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXSA9IFtdO1xuICBwaXBlc1NldCA9IG5ldyBTZXQ8YW55PigpO1xuICBwaXBlczogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdID0gW107XG4gIGV4cG9ydGVkUGlwZXNTZXQgPSBuZXcgU2V0PGFueT4oKTtcbiAgZXhwb3J0ZWRQaXBlczogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdID0gW107XG4gIG1vZHVsZXNTZXQgPSBuZXcgU2V0PGFueT4oKTtcbiAgbW9kdWxlczogQ29tcGlsZVR5cGVNZXRhZGF0YVtdID0gW107XG4gIGVudHJ5Q29tcG9uZW50c1NldCA9IG5ldyBTZXQ8YW55PigpO1xuICBlbnRyeUNvbXBvbmVudHM6IENvbXBpbGVFbnRyeUNvbXBvbmVudE1ldGFkYXRhW10gPSBbXTtcblxuICBwcm92aWRlcnM6IHtwcm92aWRlcjogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEsIG1vZHVsZTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YX1bXSA9IFtdO1xuXG4gIGFkZFByb3ZpZGVyKHByb3ZpZGVyOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YSwgbW9kdWxlOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKSB7XG4gICAgdGhpcy5wcm92aWRlcnMucHVzaCh7cHJvdmlkZXI6IHByb3ZpZGVyLCBtb2R1bGU6IG1vZHVsZX0pO1xuICB9XG5cbiAgYWRkRGlyZWN0aXZlKGlkOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKSB7XG4gICAgaWYgKCF0aGlzLmRpcmVjdGl2ZXNTZXQuaGFzKGlkLnJlZmVyZW5jZSkpIHtcbiAgICAgIHRoaXMuZGlyZWN0aXZlc1NldC5hZGQoaWQucmVmZXJlbmNlKTtcbiAgICAgIHRoaXMuZGlyZWN0aXZlcy5wdXNoKGlkKTtcbiAgICB9XG4gIH1cbiAgYWRkRXhwb3J0ZWREaXJlY3RpdmUoaWQ6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEpIHtcbiAgICBpZiAoIXRoaXMuZXhwb3J0ZWREaXJlY3RpdmVzU2V0LmhhcyhpZC5yZWZlcmVuY2UpKSB7XG4gICAgICB0aGlzLmV4cG9ydGVkRGlyZWN0aXZlc1NldC5hZGQoaWQucmVmZXJlbmNlKTtcbiAgICAgIHRoaXMuZXhwb3J0ZWREaXJlY3RpdmVzLnB1c2goaWQpO1xuICAgIH1cbiAgfVxuICBhZGRQaXBlKGlkOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKSB7XG4gICAgaWYgKCF0aGlzLnBpcGVzU2V0LmhhcyhpZC5yZWZlcmVuY2UpKSB7XG4gICAgICB0aGlzLnBpcGVzU2V0LmFkZChpZC5yZWZlcmVuY2UpO1xuICAgICAgdGhpcy5waXBlcy5wdXNoKGlkKTtcbiAgICB9XG4gIH1cbiAgYWRkRXhwb3J0ZWRQaXBlKGlkOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKSB7XG4gICAgaWYgKCF0aGlzLmV4cG9ydGVkUGlwZXNTZXQuaGFzKGlkLnJlZmVyZW5jZSkpIHtcbiAgICAgIHRoaXMuZXhwb3J0ZWRQaXBlc1NldC5hZGQoaWQucmVmZXJlbmNlKTtcbiAgICAgIHRoaXMuZXhwb3J0ZWRQaXBlcy5wdXNoKGlkKTtcbiAgICB9XG4gIH1cbiAgYWRkTW9kdWxlKGlkOiBDb21waWxlVHlwZU1ldGFkYXRhKSB7XG4gICAgaWYgKCF0aGlzLm1vZHVsZXNTZXQuaGFzKGlkLnJlZmVyZW5jZSkpIHtcbiAgICAgIHRoaXMubW9kdWxlc1NldC5hZGQoaWQucmVmZXJlbmNlKTtcbiAgICAgIHRoaXMubW9kdWxlcy5wdXNoKGlkKTtcbiAgICB9XG4gIH1cbiAgYWRkRW50cnlDb21wb25lbnQoZWM6IENvbXBpbGVFbnRyeUNvbXBvbmVudE1ldGFkYXRhKSB7XG4gICAgaWYgKCF0aGlzLmVudHJ5Q29tcG9uZW50c1NldC5oYXMoZWMuY29tcG9uZW50VHlwZSkpIHtcbiAgICAgIHRoaXMuZW50cnlDb21wb25lbnRzU2V0LmFkZChlYy5jb21wb25lbnRUeXBlKTtcbiAgICAgIHRoaXMuZW50cnlDb21wb25lbnRzLnB1c2goZWMpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBfbm9ybWFsaXplQXJyYXkob2JqOiBhbnlbXSB8IHVuZGVmaW5lZCB8IG51bGwpOiBhbnlbXSB7XG4gIHJldHVybiBvYmogfHwgW107XG59XG5cbmV4cG9ydCBjbGFzcyBQcm92aWRlck1ldGEge1xuICB0b2tlbjogYW55O1xuICB1c2VDbGFzczogVHlwZXxudWxsO1xuICB1c2VWYWx1ZTogYW55O1xuICB1c2VFeGlzdGluZzogYW55O1xuICB1c2VGYWN0b3J5OiBGdW5jdGlvbnxudWxsO1xuICBkZXBlbmRlbmNpZXM6IE9iamVjdFtdfG51bGw7XG4gIG11bHRpOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHRva2VuOiBhbnksIHt1c2VDbGFzcywgdXNlVmFsdWUsIHVzZUV4aXN0aW5nLCB1c2VGYWN0b3J5LCBkZXBzLCBtdWx0aX06IHtcbiAgICB1c2VDbGFzcz86IFR5cGUsXG4gICAgdXNlVmFsdWU/OiBhbnksXG4gICAgdXNlRXhpc3Rpbmc/OiBhbnksXG4gICAgdXNlRmFjdG9yeT86IEZ1bmN0aW9ufG51bGwsXG4gICAgZGVwcz86IE9iamVjdFtdfG51bGwsXG4gICAgbXVsdGk/OiBib29sZWFuXG4gIH0pIHtcbiAgICB0aGlzLnRva2VuID0gdG9rZW47XG4gICAgdGhpcy51c2VDbGFzcyA9IHVzZUNsYXNzIHx8IG51bGw7XG4gICAgdGhpcy51c2VWYWx1ZSA9IHVzZVZhbHVlO1xuICAgIHRoaXMudXNlRXhpc3RpbmcgPSB1c2VFeGlzdGluZztcbiAgICB0aGlzLnVzZUZhY3RvcnkgPSB1c2VGYWN0b3J5IHx8IG51bGw7XG4gICAgdGhpcy5kZXBlbmRlbmNpZXMgPSBkZXBzIHx8IG51bGw7XG4gICAgdGhpcy5tdWx0aSA9ICEhbXVsdGk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZsYXR0ZW48VD4obGlzdDogQXJyYXk8VHxUW10+KTogVFtdIHtcbiAgcmV0dXJuIGxpc3QucmVkdWNlKChmbGF0OiBhbnlbXSwgaXRlbTogVCB8IFRbXSk6IFRbXSA9PiB7XG4gICAgY29uc3QgZmxhdEl0ZW0gPSBBcnJheS5pc0FycmF5KGl0ZW0pID8gZmxhdHRlbihpdGVtKSA6IGl0ZW07XG4gICAgcmV0dXJuICg8VFtdPmZsYXQpLmNvbmNhdChmbGF0SXRlbSk7XG4gIH0sIFtdKTtcbn1cblxuZnVuY3Rpb24gaml0U291cmNlVXJsKHVybDogc3RyaW5nKSB7XG4gIC8vIE5vdGU6IFdlIG5lZWQgMyBcIi9cIiBzbyB0aGF0IG5nIHNob3dzIHVwIGFzIGEgc2VwYXJhdGUgZG9tYWluXG4gIC8vIGluIHRoZSBjaHJvbWUgZGV2IHRvb2xzLlxuICByZXR1cm4gdXJsLnJlcGxhY2UoLyhcXHcrOlxcL1xcL1tcXHc6LV0rKT8oXFwvKyk/LywgJ25nOi8vLycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGVtcGxhdGVTb3VyY2VVcmwoXG4gICAgbmdNb2R1bGVUeXBlOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLCBjb21wTWV0YToge3R5cGU6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGF9LFxuICAgIHRlbXBsYXRlTWV0YToge2lzSW5saW5lOiBib29sZWFuLCB0ZW1wbGF0ZVVybDogc3RyaW5nIHwgbnVsbH0pIHtcbiAgbGV0IHVybDogc3RyaW5nO1xuICBpZiAodGVtcGxhdGVNZXRhLmlzSW5saW5lKSB7XG4gICAgaWYgKGNvbXBNZXRhLnR5cGUucmVmZXJlbmNlIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sKSB7XG4gICAgICAvLyBOb3RlOiBhIC50cyBmaWxlIG1pZ2h0IGNvbnRhaW4gbXVsdGlwbGUgY29tcG9uZW50cyB3aXRoIGlubGluZSB0ZW1wbGF0ZXMsXG4gICAgICAvLyBzbyB3ZSBuZWVkIHRvIGdpdmUgdGhlbSB1bmlxdWUgdXJscywgYXMgdGhlc2Ugd2lsbCBiZSB1c2VkIGZvciBzb3VyY2VtYXBzLlxuICAgICAgdXJsID0gYCR7Y29tcE1ldGEudHlwZS5yZWZlcmVuY2UuZmlsZVBhdGh9LiR7Y29tcE1ldGEudHlwZS5yZWZlcmVuY2UubmFtZX0uaHRtbGA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVybCA9IGAke2lkZW50aWZpZXJOYW1lKG5nTW9kdWxlVHlwZSl9LyR7aWRlbnRpZmllck5hbWUoY29tcE1ldGEudHlwZSl9Lmh0bWxgO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB1cmwgPSB0ZW1wbGF0ZU1ldGEudGVtcGxhdGVVcmwgITtcbiAgfVxuICByZXR1cm4gY29tcE1ldGEudHlwZS5yZWZlcmVuY2UgaW5zdGFuY2VvZiBTdGF0aWNTeW1ib2wgPyB1cmwgOiBqaXRTb3VyY2VVcmwodXJsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNoYXJlZFN0eWxlc2hlZXRKaXRVcmwobWV0YTogQ29tcGlsZVN0eWxlc2hlZXRNZXRhZGF0YSwgaWQ6IG51bWJlcikge1xuICBjb25zdCBwYXRoUGFydHMgPSBtZXRhLm1vZHVsZVVybCAhLnNwbGl0KC9cXC9cXFxcL2cpO1xuICBjb25zdCBiYXNlTmFtZSA9IHBhdGhQYXJ0c1twYXRoUGFydHMubGVuZ3RoIC0gMV07XG4gIHJldHVybiBqaXRTb3VyY2VVcmwoYGNzcy8ke2lkfSR7YmFzZU5hbWV9Lm5nc3R5bGUuanNgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5nTW9kdWxlSml0VXJsKG1vZHVsZU1ldGE6IENvbXBpbGVOZ01vZHVsZU1ldGFkYXRhKTogc3RyaW5nIHtcbiAgcmV0dXJuIGppdFNvdXJjZVVybChgJHtpZGVudGlmaWVyTmFtZShtb2R1bGVNZXRhLnR5cGUpfS9tb2R1bGUubmdmYWN0b3J5LmpzYCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0ZW1wbGF0ZUppdFVybChcbiAgICBuZ01vZHVsZVR5cGU6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEsIGNvbXBNZXRhOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEpOiBzdHJpbmcge1xuICByZXR1cm4gaml0U291cmNlVXJsKFxuICAgICAgYCR7aWRlbnRpZmllck5hbWUobmdNb2R1bGVUeXBlKX0vJHtpZGVudGlmaWVyTmFtZShjb21wTWV0YS50eXBlKX0ubmdmYWN0b3J5LmpzYCk7XG59XG4iXX0=