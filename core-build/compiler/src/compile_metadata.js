/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/src/compile_metadata", ["require", "exports", "@angular/compiler/src/aot/static_symbol", "@angular/compiler/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var static_symbol_1 = require("@angular/compiler/src/aot/static_symbol");
    var util_1 = require("@angular/compiler/src/util");
    // group 0: "[prop] or (event) or @trigger"
    // group 1: "prop" from "[prop]"
    // group 2: "event" from "(event)"
    // group 3: "@trigger" from "@trigger"
    var HOST_REG_EXP = /^(?:(?:\[([^\]]+)\])|(?:\(([^\)]+)\)))|(\@[-\w]+)$/;
    function sanitizeIdentifier(name) {
        return name.replace(/\W/g, '_');
    }
    exports.sanitizeIdentifier = sanitizeIdentifier;
    var _anonymousTypeIndex = 0;
    function identifierName(compileIdentifier) {
        if (!compileIdentifier || !compileIdentifier.reference) {
            return null;
        }
        var ref = compileIdentifier.reference;
        if (ref instanceof static_symbol_1.StaticSymbol) {
            return ref.name;
        }
        if (ref['__anonymousType']) {
            return ref['__anonymousType'];
        }
        var identifier = util_1.stringify(ref);
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
    exports.identifierName = identifierName;
    function identifierModuleUrl(compileIdentifier) {
        var ref = compileIdentifier.reference;
        if (ref instanceof static_symbol_1.StaticSymbol) {
            return ref.filePath;
        }
        // Runtime type
        return "./" + util_1.stringify(ref);
    }
    exports.identifierModuleUrl = identifierModuleUrl;
    function viewClassName(compType, embeddedTemplateIndex) {
        return "View_" + identifierName({ reference: compType }) + "_" + embeddedTemplateIndex;
    }
    exports.viewClassName = viewClassName;
    function rendererTypeName(compType) {
        return "RenderType_" + identifierName({ reference: compType });
    }
    exports.rendererTypeName = rendererTypeName;
    function hostViewClassName(compType) {
        return "HostView_" + identifierName({ reference: compType });
    }
    exports.hostViewClassName = hostViewClassName;
    function componentFactoryName(compType) {
        return identifierName({ reference: compType }) + "NgFactory";
    }
    exports.componentFactoryName = componentFactoryName;
    var CompileSummaryKind;
    (function (CompileSummaryKind) {
        CompileSummaryKind[CompileSummaryKind["Pipe"] = 0] = "Pipe";
        CompileSummaryKind[CompileSummaryKind["Directive"] = 1] = "Directive";
        CompileSummaryKind[CompileSummaryKind["NgModule"] = 2] = "NgModule";
        CompileSummaryKind[CompileSummaryKind["Injectable"] = 3] = "Injectable";
    })(CompileSummaryKind = exports.CompileSummaryKind || (exports.CompileSummaryKind = {}));
    function tokenName(token) {
        return token.value != null ? sanitizeIdentifier(token.value) : identifierName(token.identifier);
    }
    exports.tokenName = tokenName;
    function tokenReference(token) {
        if (token.identifier != null) {
            return token.identifier.reference;
        }
        else {
            return token.value;
        }
    }
    exports.tokenReference = tokenReference;
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
    exports.CompileStylesheetMetadata = CompileStylesheetMetadata;
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
    exports.CompileTemplateMetadata = CompileTemplateMetadata;
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
                    var parts = util_1.splitAtColon(bindConfig, [bindConfig, bindConfig]);
                    inputsMap[parts[0]] = parts[1];
                });
            }
            var outputsMap = {};
            if (outputs != null) {
                outputs.forEach(function (bindConfig) {
                    // canonical syntax: `dirProp: elProp`
                    // if there is no `:`, use dirProp = elProp
                    var parts = util_1.splitAtColon(bindConfig, [bindConfig, bindConfig]);
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
    exports.CompileDirectiveMetadata = CompileDirectiveMetadata;
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
    exports.CompilePipeMetadata = CompilePipeMetadata;
    var CompileShallowModuleMetadata = /** @class */ (function () {
        function CompileShallowModuleMetadata() {
        }
        return CompileShallowModuleMetadata;
    }());
    exports.CompileShallowModuleMetadata = CompileShallowModuleMetadata;
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
    exports.CompileNgModuleMetadata = CompileNgModuleMetadata;
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
    exports.TransitiveCompileNgModuleMetadata = TransitiveCompileNgModuleMetadata;
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
    exports.ProviderMeta = ProviderMeta;
    function flatten(list) {
        return list.reduce(function (flat, item) {
            var flatItem = Array.isArray(item) ? flatten(item) : item;
            return flat.concat(flatItem);
        }, []);
    }
    exports.flatten = flatten;
    function jitSourceUrl(url) {
        // Note: We need 3 "/" so that ng shows up as a separate domain
        // in the chrome dev tools.
        return url.replace(/(\w+:\/\/[\w:-]+)?(\/+)?/, 'ng:///');
    }
    function templateSourceUrl(ngModuleType, compMeta, templateMeta) {
        var url;
        if (templateMeta.isInline) {
            if (compMeta.type.reference instanceof static_symbol_1.StaticSymbol) {
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
        return compMeta.type.reference instanceof static_symbol_1.StaticSymbol ? url : jitSourceUrl(url);
    }
    exports.templateSourceUrl = templateSourceUrl;
    function sharedStylesheetJitUrl(meta, id) {
        var pathParts = meta.moduleUrl.split(/\/\\/g);
        var baseName = pathParts[pathParts.length - 1];
        return jitSourceUrl("css/" + id + baseName + ".ngstyle.js");
    }
    exports.sharedStylesheetJitUrl = sharedStylesheetJitUrl;
    function ngModuleJitUrl(moduleMeta) {
        return jitSourceUrl(identifierName(moduleMeta.type) + "/module.ngfactory.js");
    }
    exports.ngModuleJitUrl = ngModuleJitUrl;
    function templateJitUrl(ngModuleType, compMeta) {
        return jitSourceUrl(identifierName(ngModuleType) + "/" + identifierName(compMeta.type) + ".ngfactory.js");
    }
    exports.templateJitUrl = templateJitUrl;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZV9tZXRhZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9jb21waWxlX21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBRUgseUVBQWlEO0lBSWpELG1EQUErQztJQUUvQywyQ0FBMkM7SUFDM0MsZ0NBQWdDO0lBQ2hDLGtDQUFrQztJQUNsQyxzQ0FBc0M7SUFDdEMsSUFBTSxZQUFZLEdBQUcsb0RBQW9ELENBQUM7SUFFMUUsU0FBZ0Isa0JBQWtCLENBQUMsSUFBWTtRQUM3QyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFGRCxnREFFQztJQUVELElBQUksbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO0lBRTVCLFNBQWdCLGNBQWMsQ0FBQyxpQkFBK0Q7UUFFNUYsSUFBSSxDQUFDLGlCQUFpQixJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxFQUFFO1lBQ3RELE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxJQUFNLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxTQUFTLENBQUM7UUFDeEMsSUFBSSxHQUFHLFlBQVksNEJBQVksRUFBRTtZQUMvQixPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUM7U0FDakI7UUFDRCxJQUFJLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO1lBQzFCLE9BQU8sR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7U0FDL0I7UUFDRCxJQUFJLFVBQVUsR0FBRyxnQkFBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDaEMsNkJBQTZCO1lBQzdCLFVBQVUsR0FBRyxlQUFhLG1CQUFtQixFQUFJLENBQUM7WUFDbEQsR0FBRyxDQUFD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RCxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxZQUFZLDRCQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25GLENBQUM7SUFoQkQsOENBZ0JDO0lBRUQsU0FBZ0Isc0JBQXNCLENBQUMsSUFBK0IsRUFBRSxFQUFVO1FBQ2hGLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFXLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2xELElBQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2pELE9BQU8sWUFBWSxDQUFDLFNBQU8sRUFBRSxHQUFHLFFBQVEsZ0JBQWEsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFKRCx3REFJQztJQUVELFNBQWdCLGNBQWMsQ0FBQyxVQUFtQztRQUNoRSxPQUFPLFlBQVksQ0FBSSxjQUFjLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyx5QkFBc0IsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7SUFGRCx3Q0FFQztJQUVELFNBQWdCLGNBQWMsQ0FDMUIsWUFBdUMsRUFBRSxRQUFrQztRQUM3RSxPQUFPLFlBQVksQ0FDWixjQUFjLENBQUMsWUFBWSxDQUFDLFNBQUksY0FBYyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsa0JBQWUsQ0FBQyxDQUFDO0lBQ3ZGLENBQUM7SUFKRCx3Q0FJQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtTdGF0aWNTeW1ib2x9IGZyb20gJy4vYW90L3N0YXRpY19zeW1ib2wnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgU2NoZW1hTWV0YWRhdGEsIFR5cGUsIFZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICcuL2NvcmUnO1xuaW1wb3J0IHtMaWZlY3ljbGVIb29rc30gZnJvbSAnLi9saWZlY3ljbGVfcmVmbGVjdG9yJztcbmltcG9ydCB7UGFyc2VUcmVlUmVzdWx0IGFzIEh0bWxQYXJzZVRyZWVSZXN1bHR9IGZyb20gJy4vbWxfcGFyc2VyL3BhcnNlcic7XG5pbXBvcnQge3NwbGl0QXRDb2xvbiwgc3RyaW5naWZ5fSBmcm9tICcuL3V0aWwnO1xuXG4vLyBncm91cCAwOiBcIltwcm9wXSBvciAoZXZlbnQpIG9yIEB0cmlnZ2VyXCJcbi8vIGdyb3VwIDE6IFwicHJvcFwiIGZyb20gXCJbcHJvcF1cIlxuLy8gZ3JvdXAgMjogXCJldmVudFwiIGZyb20gXCIoZXZlbnQpXCJcbi8vIGdyb3VwIDM6IFwiQHRyaWdnZXJcIiBmcm9tIFwiQHRyaWdnZXJcIlxuY29uc3QgSE9TVF9SRUdfRVhQID0gL14oPzooPzpcXFsoW15cXF1dKylcXF0pfCg/OlxcKChbXlxcKV0rKVxcKSkpfChcXEBbLVxcd10rKSQvO1xuXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVJZGVudGlmaWVyKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBuYW1lLnJlcGxhY2UoL1xcVy9nLCAnXycpO1xufVxuXG5sZXQgX2Fub255bW91c1R5cGVJbmRleCA9IDA7XG5cbmV4cG9ydCBmdW5jdGlvbiBpZGVudGlmaWVyTmFtZShjb21waWxlSWRlbnRpZmllcjogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB8IG51bGwgfCB1bmRlZmluZWQpOlxuICAgIHN0cmluZ3xudWxsIHtcbiAgaWYgKCFjb21waWxlSWRlbnRpZmllciB8fCAhY29tcGlsZUlkZW50aWZpZXIucmVmZXJlbmNlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgcmVmID0gY29tcGlsZUlkZW50aWZpZXIucmVmZXJlbmNlO1xuICBpZiAocmVmIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sKSB7XG4gICAgcmV0dXJuIHJlZi5uYW1lO1xuICB9XG4gIGlmIChyZWZbJ19fYW5vbnltb3VzVHlwZSddKSB7XG4gICAgcmV0dXJuIHJlZlsnX19hbm9ueW1vdXNUeXBlJ107XG4gIH1cbiAgbGV0IGlkZW50aWZpZXIgPSBzdHJpbmdpZnkocmVmKTtcbiAgaWYgKGlkZW50aWZpZXIuaW5kZXhPZignKCcpID49IDApIHtcbiAgICAvLyBjYXNlOiBhbm9ueW1vdXMgZnVuY3Rpb25zIVxuICAgIGlkZW50aWZpZXIgPSBgYW5vbnltb3VzXyR7X2Fub255bW91c1R5cGVJbmRleCsrfWA7XG4gICAgcmVmWydfX2Fub255bW91c1R5cGUnXSA9IGlkZW50aWZpZXI7XG4gIH0gZWxzZSB7XG4gICAgaWRlbnRpZmllciA9IHNhbml0aXplSWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgfVxuICByZXR1cm4gaWRlbnRpZmllcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlkZW50aWZpZXJNb2R1bGVVcmwoY29tcGlsZUlkZW50aWZpZXI6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEpOiBzdHJpbmcge1xuICBjb25zdCByZWYgPSBjb21waWxlSWRlbnRpZmllci5yZWZlcmVuY2U7XG4gIGlmIChyZWYgaW5zdGFuY2VvZiBTdGF0aWNTeW1ib2wpIHtcbiAgICByZXR1cm4gcmVmLmZpbGVQYXRoO1xuICB9XG4gIC8vIFJ1bnRpbWUgdHlwZVxuICByZXR1cm4gYC4vJHtzdHJpbmdpZnkocmVmKX1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmlld0NsYXNzTmFtZShjb21wVHlwZTogYW55LCBlbWJlZGRlZFRlbXBsYXRlSW5kZXg6IG51bWJlcik6IHN0cmluZyB7XG4gIHJldHVybiBgVmlld18ke2lkZW50aWZpZXJOYW1lKHtyZWZlcmVuY2U6IGNvbXBUeXBlfSl9XyR7ZW1iZWRkZWRUZW1wbGF0ZUluZGV4fWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJlclR5cGVOYW1lKGNvbXBUeXBlOiBhbnkpOiBzdHJpbmcge1xuICByZXR1cm4gYFJlbmRlclR5cGVfJHtpZGVudGlmaWVyTmFtZSh7cmVmZXJlbmNlOiBjb21wVHlwZX0pfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBob3N0Vmlld0NsYXNzTmFtZShjb21wVHlwZTogYW55KTogc3RyaW5nIHtcbiAgcmV0dXJuIGBIb3N0Vmlld18ke2lkZW50aWZpZXJOYW1lKHtyZWZlcmVuY2U6IGNvbXBUeXBlfSl9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvbmVudEZhY3RvcnlOYW1lKGNvbXBUeXBlOiBhbnkpOiBzdHJpbmcge1xuICByZXR1cm4gYCR7aWRlbnRpZmllck5hbWUoe3JlZmVyZW5jZTogY29tcFR5cGV9KX1OZ0ZhY3RvcnlgO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFByb3h5Q2xhc3MgeyBzZXREZWxlZ2F0ZShkZWxlZ2F0ZTogYW55KTogdm9pZDsgfVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgeyByZWZlcmVuY2U6IGFueTsgfVxuXG5leHBvcnQgZW51bSBDb21waWxlU3VtbWFyeUtpbmQge1xuICBQaXBlLFxuICBEaXJlY3RpdmUsXG4gIE5nTW9kdWxlLFxuICBJbmplY3RhYmxlXG59XG5cbi8qKlxuICogQSBDb21waWxlU3VtbWFyeSBpcyB0aGUgZGF0YSBuZWVkZWQgdG8gdXNlIGEgZGlyZWN0aXZlIC8gcGlwZSAvIG1vZHVsZVxuICogaW4gb3RoZXIgbW9kdWxlcyAvIGNvbXBvbmVudHMuIEhvd2V2ZXIsIHRoaXMgZGF0YSBpcyBub3QgZW5vdWdoIHRvIGNvbXBpbGVcbiAqIHRoZSBkaXJlY3RpdmUgLyBtb2R1bGUgaXRzZWxmLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbXBpbGVUeXBlU3VtbWFyeSB7XG4gIHN1bW1hcnlLaW5kOiBDb21waWxlU3VtbWFyeUtpbmR8bnVsbDtcbiAgdHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEge1xuICBpc0F0dHJpYnV0ZT86IGJvb2xlYW47XG4gIGlzU2VsZj86IGJvb2xlYW47XG4gIGlzSG9zdD86IGJvb2xlYW47XG4gIGlzU2tpcFNlbGY/OiBib29sZWFuO1xuICBpc09wdGlvbmFsPzogYm9vbGVhbjtcbiAgaXNWYWx1ZT86IGJvb2xlYW47XG4gIHRva2VuPzogQ29tcGlsZVRva2VuTWV0YWRhdGE7XG4gIHZhbHVlPzogYW55O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBpbGVQcm92aWRlck1ldGFkYXRhIHtcbiAgdG9rZW46IENvbXBpbGVUb2tlbk1ldGFkYXRhO1xuICB1c2VDbGFzcz86IENvbXBpbGVUeXBlTWV0YWRhdGE7XG4gIHVzZVZhbHVlPzogYW55O1xuICB1c2VFeGlzdGluZz86IENvbXBpbGVUb2tlbk1ldGFkYXRhO1xuICB1c2VGYWN0b3J5PzogQ29tcGlsZUZhY3RvcnlNZXRhZGF0YTtcbiAgZGVwcz86IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YVtdO1xuICBtdWx0aT86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGlsZUZhY3RvcnlNZXRhZGF0YSBleHRlbmRzIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEge1xuICBkaURlcHM6IENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YVtdO1xuICByZWZlcmVuY2U6IGFueTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRva2VuTmFtZSh0b2tlbjogQ29tcGlsZVRva2VuTWV0YWRhdGEpIHtcbiAgcmV0dXJuIHRva2VuLnZhbHVlICE9IG51bGwgPyBzYW5pdGl6ZUlkZW50aWZpZXIodG9rZW4udmFsdWUpIDogaWRlbnRpZmllck5hbWUodG9rZW4uaWRlbnRpZmllcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b2tlblJlZmVyZW5jZSh0b2tlbjogQ29tcGlsZVRva2VuTWV0YWRhdGEpIHtcbiAgaWYgKHRva2VuLmlkZW50aWZpZXIgIT0gbnVsbCkge1xuICAgIHJldHVybiB0b2tlbi5pZGVudGlmaWVyLnJlZmVyZW5jZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdG9rZW4udmFsdWU7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21waWxlVG9rZW5NZXRhZGF0YSB7XG4gIHZhbHVlPzogYW55O1xuICBpZGVudGlmaWVyPzogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YXxDb21waWxlVHlwZU1ldGFkYXRhO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBpbGVJbmplY3RhYmxlTWV0YWRhdGEge1xuICBzeW1ib2w6IFN0YXRpY1N5bWJvbDtcbiAgdHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YTtcblxuICBwcm92aWRlZEluPzogU3RhdGljU3ltYm9sO1xuXG4gIHVzZVZhbHVlPzogYW55O1xuICB1c2VDbGFzcz86IFN0YXRpY1N5bWJvbDtcbiAgdXNlRXhpc3Rpbmc/OiBTdGF0aWNTeW1ib2w7XG4gIHVzZUZhY3Rvcnk/OiBTdGF0aWNTeW1ib2w7XG4gIGRlcHM/OiBhbnlbXTtcbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZWdhcmRpbmcgY29tcGlsYXRpb24gb2YgYSB0eXBlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbXBpbGVUeXBlTWV0YWRhdGEgZXh0ZW5kcyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhIHtcbiAgZGlEZXBzOiBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXTtcbiAgbGlmZWN5Y2xlSG9va3M6IExpZmVjeWNsZUhvb2tzW107XG4gIHJlZmVyZW5jZTogYW55O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBpbGVRdWVyeU1ldGFkYXRhIHtcbiAgc2VsZWN0b3JzOiBBcnJheTxDb21waWxlVG9rZW5NZXRhZGF0YT47XG4gIGRlc2NlbmRhbnRzOiBib29sZWFuO1xuICBmaXJzdDogYm9vbGVhbjtcbiAgcHJvcGVydHlOYW1lOiBzdHJpbmc7XG4gIHJlYWQ6IENvbXBpbGVUb2tlbk1ldGFkYXRhO1xuICBzdGF0aWM/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIE1ldGFkYXRhIGFib3V0IGEgc3R5bGVzaGVldFxuICovXG5leHBvcnQgY2xhc3MgQ29tcGlsZVN0eWxlc2hlZXRNZXRhZGF0YSB7XG4gIG1vZHVsZVVybDogc3RyaW5nfG51bGw7XG4gIHN0eWxlczogc3RyaW5nW107XG4gIHN0eWxlVXJsczogc3RyaW5nW107XG4gIGNvbnN0cnVjdG9yKFxuICAgICAge21vZHVsZVVybCwgc3R5bGVzLFxuICAgICAgIHN0eWxlVXJsc306IHttb2R1bGVVcmw/OiBzdHJpbmcsIHN0eWxlcz86IHN0cmluZ1tdLCBzdHlsZVVybHM/OiBzdHJpbmdbXX0gPSB7fSkge1xuICAgIHRoaXMubW9kdWxlVXJsID0gbW9kdWxlVXJsIHx8IG51bGw7XG4gICAgdGhpcy5zdHlsZXMgPSBfbm9ybWFsaXplQXJyYXkoc3R5bGVzKTtcbiAgICB0aGlzLnN0eWxlVXJscyA9IF9ub3JtYWxpemVBcnJheShzdHlsZVVybHMpO1xuICB9XG59XG5cbi8qKlxuICogU3VtbWFyeSBNZXRhZGF0YSByZWdhcmRpbmcgY29tcGlsYXRpb24gb2YgYSB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21waWxlVGVtcGxhdGVTdW1tYXJ5IHtcbiAgbmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXTtcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb258bnVsbDtcbiAgc3R5bGVzOiBzdHJpbmdbXTtcbiAgYW5pbWF0aW9uczogYW55W118bnVsbDtcbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZWdhcmRpbmcgY29tcGlsYXRpb24gb2YgYSB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhIHtcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb258bnVsbDtcbiAgdGVtcGxhdGU6IHN0cmluZ3xudWxsO1xuICB0ZW1wbGF0ZVVybDogc3RyaW5nfG51bGw7XG4gIGh0bWxBc3Q6IEh0bWxQYXJzZVRyZWVSZXN1bHR8bnVsbDtcbiAgaXNJbmxpbmU6IGJvb2xlYW47XG4gIHN0eWxlczogc3RyaW5nW107XG4gIHN0eWxlVXJsczogc3RyaW5nW107XG4gIGV4dGVybmFsU3R5bGVzaGVldHM6IENvbXBpbGVTdHlsZXNoZWV0TWV0YWRhdGFbXTtcbiAgYW5pbWF0aW9uczogYW55W107XG4gIG5nQ29udGVudFNlbGVjdG9yczogc3RyaW5nW107XG4gIGludGVycG9sYXRpb246IFtzdHJpbmcsIHN0cmluZ118bnVsbDtcbiAgcHJlc2VydmVXaGl0ZXNwYWNlczogYm9vbGVhbjtcbiAgY29uc3RydWN0b3Ioe2VuY2Fwc3VsYXRpb24sIHRlbXBsYXRlLCB0ZW1wbGF0ZVVybCwgaHRtbEFzdCwgc3R5bGVzLCBzdHlsZVVybHMsXG4gICAgICAgICAgICAgICBleHRlcm5hbFN0eWxlc2hlZXRzLCBhbmltYXRpb25zLCBuZ0NvbnRlbnRTZWxlY3RvcnMsIGludGVycG9sYXRpb24sIGlzSW5saW5lLFxuICAgICAgICAgICAgICAgcHJlc2VydmVXaGl0ZXNwYWNlc306IHtcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbiB8IG51bGwsXG4gICAgdGVtcGxhdGU6IHN0cmluZ3xudWxsLFxuICAgIHRlbXBsYXRlVXJsOiBzdHJpbmd8bnVsbCxcbiAgICBodG1sQXN0OiBIdG1sUGFyc2VUcmVlUmVzdWx0fG51bGwsXG4gICAgc3R5bGVzOiBzdHJpbmdbXSxcbiAgICBzdHlsZVVybHM6IHN0cmluZ1tdLFxuICAgIGV4dGVybmFsU3R5bGVzaGVldHM6IENvbXBpbGVTdHlsZXNoZWV0TWV0YWRhdGFbXSxcbiAgICBuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdLFxuICAgIGFuaW1hdGlvbnM6IGFueVtdLFxuICAgIGludGVycG9sYXRpb246IFtzdHJpbmcsIHN0cmluZ118bnVsbCxcbiAgICBpc0lubGluZTogYm9vbGVhbixcbiAgICBwcmVzZXJ2ZVdoaXRlc3BhY2VzOiBib29sZWFuXG4gIH0pIHtcbiAgICB0aGlzLmVuY2Fwc3VsYXRpb24gPSBlbmNhcHN1bGF0aW9uO1xuICAgIHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICB0aGlzLnRlbXBsYXRlVXJsID0gdGVtcGxhdGVVcmw7XG4gICAgdGhpcy5odG1sQXN0ID0gaHRtbEFzdDtcbiAgICB0aGlzLnN0eWxlcyA9IF9ub3JtYWxpemVBcnJheShzdHlsZXMpO1xuICAgIHRoaXMuc3R5bGVVcmxzID0gX25vcm1hbGl6ZUFycmF5KHN0eWxlVXJscyk7XG4gICAgdGhpcy5leHRlcm5hbFN0eWxlc2hlZXRzID0gX25vcm1hbGl6ZUFycmF5KGV4dGVybmFsU3R5bGVzaGVldHMpO1xuICAgIHRoaXMuYW5pbWF0aW9ucyA9IGFuaW1hdGlvbnMgPyBmbGF0dGVuKGFuaW1hdGlvbnMpIDogW107XG4gICAgdGhpcy5uZ0NvbnRlbnRTZWxlY3RvcnMgPSBuZ0NvbnRlbnRTZWxlY3RvcnMgfHwgW107XG4gICAgaWYgKGludGVycG9sYXRpb24gJiYgaW50ZXJwb2xhdGlvbi5sZW5ndGggIT0gMikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGAnaW50ZXJwb2xhdGlvbicgc2hvdWxkIGhhdmUgYSBzdGFydCBhbmQgYW4gZW5kIHN5bWJvbC5gKTtcbiAgICB9XG4gICAgdGhpcy5pbnRlcnBvbGF0aW9uID0gaW50ZXJwb2xhdGlvbjtcbiAgICB0aGlzLmlzSW5saW5lID0gaXNJbmxpbmU7XG4gICAgdGhpcy5wcmVzZXJ2ZVdoaXRlc3BhY2VzID0gcHJlc2VydmVXaGl0ZXNwYWNlcztcbiAgfVxuXG4gIHRvU3VtbWFyeSgpOiBDb21waWxlVGVtcGxhdGVTdW1tYXJ5IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdDb250ZW50U2VsZWN0b3JzOiB0aGlzLm5nQ29udGVudFNlbGVjdG9ycyxcbiAgICAgIGVuY2Fwc3VsYXRpb246IHRoaXMuZW5jYXBzdWxhdGlvbixcbiAgICAgIHN0eWxlczogdGhpcy5zdHlsZXMsXG4gICAgICBhbmltYXRpb25zOiB0aGlzLmFuaW1hdGlvbnNcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGlsZUVudHJ5Q29tcG9uZW50TWV0YWRhdGEge1xuICBjb21wb25lbnRUeXBlOiBhbnk7XG4gIGNvbXBvbmVudEZhY3Rvcnk6IFN0YXRpY1N5bWJvbHxvYmplY3Q7XG59XG5cbi8vIE5vdGU6IFRoaXMgc2hvdWxkIG9ubHkgdXNlIGludGVyZmFjZXMgYXMgbmVzdGVkIGRhdGEgdHlwZXNcbi8vIGFzIHdlIG5lZWQgdG8gYmUgYWJsZSB0byBzZXJpYWxpemUgdGhpcyBmcm9tL3RvIEpTT04hXG5leHBvcnQgaW50ZXJmYWNlIENvbXBpbGVEaXJlY3RpdmVTdW1tYXJ5IGV4dGVuZHMgQ29tcGlsZVR5cGVTdW1tYXJ5IHtcbiAgdHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YTtcbiAgaXNDb21wb25lbnQ6IGJvb2xlYW47XG4gIHNlbGVjdG9yOiBzdHJpbmd8bnVsbDtcbiAgZXhwb3J0QXM6IHN0cmluZ3xudWxsO1xuICBpbnB1dHM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBvdXRwdXRzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgaG9zdExpc3RlbmVyczoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIGhvc3RQcm9wZXJ0aWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgaG9zdEF0dHJpYnV0ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBwcm92aWRlcnM6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhW107XG4gIHZpZXdQcm92aWRlcnM6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhW107XG4gIHF1ZXJpZXM6IENvbXBpbGVRdWVyeU1ldGFkYXRhW107XG4gIGd1YXJkczoge1trZXk6IHN0cmluZ106IGFueX07XG4gIHZpZXdRdWVyaWVzOiBDb21waWxlUXVlcnlNZXRhZGF0YVtdO1xuICBlbnRyeUNvbXBvbmVudHM6IENvbXBpbGVFbnRyeUNvbXBvbmVudE1ldGFkYXRhW107XG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3l8bnVsbDtcbiAgcmVhY3RpdmVQcm9wZXJ0aWVzOiBzdHJpbmdbXXxudWxsO1xuICB0ZW1wbGF0ZTogQ29tcGlsZVRlbXBsYXRlU3VtbWFyeXxudWxsO1xuICBjb21wb25lbnRWaWV3VHlwZTogU3RhdGljU3ltYm9sfFByb3h5Q2xhc3N8bnVsbDtcbiAgcmVuZGVyZXJUeXBlOiBTdGF0aWNTeW1ib2x8b2JqZWN0fG51bGw7XG4gIGNvbXBvbmVudEZhY3Rvcnk6IFN0YXRpY1N5bWJvbHxvYmplY3R8bnVsbDtcbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZWdhcmRpbmcgY29tcGlsYXRpb24gb2YgYSBkaXJlY3RpdmUuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEge1xuICBzdGF0aWMgY3JlYXRlKHtpc0hvc3QsIHR5cGUsIGlzQ29tcG9uZW50LCBzZWxlY3RvciwgZXhwb3J0QXMsIGNoYW5nZURldGVjdGlvbiwgcmVhY3RpdmVQcm9wZXJ0aWVzLCBpbnB1dHMsIG91dHB1dHMsXG4gICAgICAgICAgICAgICAgIGhvc3QsIHByb3ZpZGVycywgdmlld1Byb3ZpZGVycywgcXVlcmllcywgZ3VhcmRzLCB2aWV3UXVlcmllcywgZW50cnlDb21wb25lbnRzLFxuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZSwgY29tcG9uZW50Vmlld1R5cGUsIHJlbmRlcmVyVHlwZSwgY29tcG9uZW50RmFjdG9yeX06IHtcbiAgICBpc0hvc3Q6IGJvb2xlYW4sXG4gICAgdHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YSxcbiAgICBpc0NvbXBvbmVudDogYm9vbGVhbixcbiAgICBzZWxlY3Rvcjogc3RyaW5nfG51bGwsXG4gICAgZXhwb3J0QXM6IHN0cmluZ3xudWxsLFxuICAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3l8bnVsbCxcbiAgICByZWFjdGl2ZVByb3BlcnRpZXM6IHN0cmluZ1tdO1xuICAgIGlucHV0czogc3RyaW5nW10sXG4gICAgb3V0cHV0czogc3RyaW5nW10sXG4gICAgaG9zdDoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgcHJvdmlkZXJzOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YVtdLFxuICAgIHZpZXdQcm92aWRlcnM6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhW10sXG4gICAgcXVlcmllczogQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXSxcbiAgICBndWFyZHM6IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuICAgIHZpZXdRdWVyaWVzOiBDb21waWxlUXVlcnlNZXRhZGF0YVtdLFxuICAgIGVudHJ5Q29tcG9uZW50czogQ29tcGlsZUVudHJ5Q29tcG9uZW50TWV0YWRhdGFbXSxcbiAgICB0ZW1wbGF0ZTogQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEsXG4gICAgY29tcG9uZW50Vmlld1R5cGU6IFN0YXRpY1N5bWJvbHxQcm94eUNsYXNzfG51bGwsXG4gICAgcmVuZGVyZXJUeXBlOiBTdGF0aWNTeW1ib2x8b2JqZWN0fG51bGwsXG4gICAgY29tcG9uZW50RmFjdG9yeTogU3RhdGljU3ltYm9sfG9iamVjdHxudWxsLFxuICB9KTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgICBjb25zdCBob3N0TGlzdGVuZXJzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIGNvbnN0IGhvc3RQcm9wZXJ0aWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIGNvbnN0IGhvc3RBdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIGlmIChob3N0ICE9IG51bGwpIHtcbiAgICAgIE9iamVjdC5rZXlzKGhvc3QpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBob3N0W2tleV07XG4gICAgICAgIGNvbnN0IG1hdGNoZXMgPSBrZXkubWF0Y2goSE9TVF9SRUdfRVhQKTtcbiAgICAgICAgaWYgKG1hdGNoZXMgPT09IG51bGwpIHtcbiAgICAgICAgICBob3N0QXR0cmlidXRlc1trZXldID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAobWF0Y2hlc1sxXSAhPSBudWxsKSB7XG4gICAgICAgICAgaG9zdFByb3BlcnRpZXNbbWF0Y2hlc1sxXV0gPSB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChtYXRjaGVzWzJdICE9IG51bGwpIHtcbiAgICAgICAgICBob3N0TGlzdGVuZXJzW21hdGNoZXNbMl1dID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBjb25zdCBpbnB1dHNNYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgaWYgKGlucHV0cyAhPSBudWxsKSB7XG4gICAgICBpbnB1dHMuZm9yRWFjaCgoYmluZENvbmZpZzogc3RyaW5nKSA9PiB7XG4gICAgICAgIC8vIGNhbm9uaWNhbCBzeW50YXg6IGBkaXJQcm9wOiBlbFByb3BgXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIG5vIGA6YCwgdXNlIGRpclByb3AgPSBlbFByb3BcbiAgICAgICAgY29uc3QgcGFydHMgPSBzcGxpdEF0Q29sb24oYmluZENvbmZpZywgW2JpbmRDb25maWcsIGJpbmRDb25maWddKTtcbiAgICAgICAgaW5wdXRzTWFwW3BhcnRzWzBdXSA9IHBhcnRzWzFdO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGNvbnN0IG91dHB1dHNNYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgaWYgKG91dHB1dHMgIT0gbnVsbCkge1xuICAgICAgb3V0cHV0cy5mb3JFYWNoKChiaW5kQ29uZmlnOiBzdHJpbmcpID0+IHtcbiAgICAgICAgLy8gY2Fub25pY2FsIHN5bnRheDogYGRpclByb3A6IGVsUHJvcGBcbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgbm8gYDpgLCB1c2UgZGlyUHJvcCA9IGVsUHJvcFxuICAgICAgICBjb25zdCBwYXJ0cyA9IHNwbGl0QXRDb2xvbihiaW5kQ29uZmlnLCBbYmluZENvbmZpZywgYmluZENvbmZpZ10pO1xuICAgICAgICBvdXRwdXRzTWFwW3BhcnRzWzBdXSA9IHBhcnRzWzFdO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEoe1xuICAgICAgaXNIb3N0LFxuICAgICAgdHlwZSxcbiAgICAgIGlzQ29tcG9uZW50OiAhIWlzQ29tcG9uZW50LCBzZWxlY3RvciwgZXhwb3J0QXMsIGNoYW5nZURldGVjdGlvbiwgcmVhY3RpdmVQcm9wZXJ0aWVzLFxuICAgICAgaW5wdXRzOiBpbnB1dHNNYXAsXG4gICAgICBvdXRwdXRzOiBvdXRwdXRzTWFwLFxuICAgICAgaG9zdExpc3RlbmVycyxcbiAgICAgIGhvc3RQcm9wZXJ0aWVzLFxuICAgICAgaG9zdEF0dHJpYnV0ZXMsXG4gICAgICBwcm92aWRlcnMsXG4gICAgICB2aWV3UHJvdmlkZXJzLFxuICAgICAgcXVlcmllcyxcbiAgICAgIGd1YXJkcyxcbiAgICAgIHZpZXdRdWVyaWVzLFxuICAgICAgZW50cnlDb21wb25lbnRzLFxuICAgICAgdGVtcGxhdGUsXG4gICAgICBjb21wb25lbnRWaWV3VHlwZSxcbiAgICAgIHJlbmRlcmVyVHlwZSxcbiAgICAgIGNvbXBvbmVudEZhY3RvcnksXG4gICAgfSk7XG4gIH1cbiAgaXNIb3N0OiBib29sZWFuO1xuICB0eXBlOiBDb21waWxlVHlwZU1ldGFkYXRhO1xuICBpc0NvbXBvbmVudDogYm9vbGVhbjtcbiAgc2VsZWN0b3I6IHN0cmluZ3xudWxsO1xuICBleHBvcnRBczogc3RyaW5nfG51bGw7XG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3l8bnVsbDtcbiAgcmVhY3RpdmVQcm9wZXJ0aWVzOiBzdHJpbmdbXXxudWxsO1xuICBpbnB1dHM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBvdXRwdXRzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgaG9zdExpc3RlbmVyczoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIGhvc3RQcm9wZXJ0aWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgaG9zdEF0dHJpYnV0ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBwcm92aWRlcnM6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhW107XG4gIHZpZXdQcm92aWRlcnM6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhW107XG4gIHF1ZXJpZXM6IENvbXBpbGVRdWVyeU1ldGFkYXRhW107XG4gIGd1YXJkczoge1trZXk6IHN0cmluZ106IGFueX07XG4gIHZpZXdRdWVyaWVzOiBDb21waWxlUXVlcnlNZXRhZGF0YVtdO1xuICBlbnRyeUNvbXBvbmVudHM6IENvbXBpbGVFbnRyeUNvbXBvbmVudE1ldGFkYXRhW107XG5cbiAgdGVtcGxhdGU6IENvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhfG51bGw7XG5cbiAgY29tcG9uZW50Vmlld1R5cGU6IFN0YXRpY1N5bWJvbHxQcm94eUNsYXNzfG51bGw7XG4gIHJlbmRlcmVyVHlwZTogU3RhdGljU3ltYm9sfG9iamVjdHxudWxsO1xuICBjb21wb25lbnRGYWN0b3J5OiBTdGF0aWNTeW1ib2x8b2JqZWN0fG51bGw7XG5cbiAgY29uc3RydWN0b3Ioe2lzSG9zdCxcbiAgICAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICAgICBpc0NvbXBvbmVudCxcbiAgICAgICAgICAgICAgIHNlbGVjdG9yLFxuICAgICAgICAgICAgICAgZXhwb3J0QXMsXG4gICAgICAgICAgICAgICBjaGFuZ2VEZXRlY3Rpb24sXG4gICAgICAgICAgICAgICByZWFjdGl2ZVByb3BlcnRpZXMsXG4gICAgICAgICAgICAgICBpbnB1dHMsXG4gICAgICAgICAgICAgICBvdXRwdXRzLFxuICAgICAgICAgICAgICAgaG9zdExpc3RlbmVycyxcbiAgICAgICAgICAgICAgIGhvc3RQcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgaG9zdEF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgICBwcm92aWRlcnMsXG4gICAgICAgICAgICAgICB2aWV3UHJvdmlkZXJzLFxuICAgICAgICAgICAgICAgcXVlcmllcyxcbiAgICAgICAgICAgICAgIGd1YXJkcyxcbiAgICAgICAgICAgICAgIHZpZXdRdWVyaWVzLFxuICAgICAgICAgICAgICAgZW50cnlDb21wb25lbnRzLFxuICAgICAgICAgICAgICAgdGVtcGxhdGUsXG4gICAgICAgICAgICAgICBjb21wb25lbnRWaWV3VHlwZSxcbiAgICAgICAgICAgICAgIHJlbmRlcmVyVHlwZSxcbiAgICAgICAgICAgICAgIGNvbXBvbmVudEZhY3Rvcnl9OiB7XG4gICAgaXNIb3N0OiBib29sZWFuLFxuICAgIHR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGEsXG4gICAgaXNDb21wb25lbnQ6IGJvb2xlYW4sXG4gICAgc2VsZWN0b3I6IHN0cmluZ3xudWxsLFxuICAgIGV4cG9ydEFzOiBzdHJpbmd8bnVsbCxcbiAgICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5fG51bGwsXG4gICAgcmVhY3RpdmVQcm9wZXJ0aWVzOiBzdHJpbmdbXXxudWxsO1xuICAgIGlucHV0czoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgb3V0cHV0czoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgaG9zdExpc3RlbmVyczoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgaG9zdFByb3BlcnRpZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIGhvc3RBdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBwcm92aWRlcnM6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhW10sXG4gICAgdmlld1Byb3ZpZGVyczogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGFbXSxcbiAgICBxdWVyaWVzOiBDb21waWxlUXVlcnlNZXRhZGF0YVtdLFxuICAgIGd1YXJkczoge1trZXk6IHN0cmluZ106IGFueX0sXG4gICAgdmlld1F1ZXJpZXM6IENvbXBpbGVRdWVyeU1ldGFkYXRhW10sXG4gICAgZW50cnlDb21wb25lbnRzOiBDb21waWxlRW50cnlDb21wb25lbnRNZXRhZGF0YVtdLFxuICAgIHRlbXBsYXRlOiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YXxudWxsLFxuICAgIGNvbXBvbmVudFZpZXdUeXBlOiBTdGF0aWNTeW1ib2x8UHJveHlDbGFzc3xudWxsLFxuICAgIHJlbmRlcmVyVHlwZTogU3RhdGljU3ltYm9sfG9iamVjdHxudWxsLFxuICAgIGNvbXBvbmVudEZhY3Rvcnk6IFN0YXRpY1N5bWJvbHxvYmplY3R8bnVsbCxcbiAgfSkge1xuICAgIHRoaXMuaXNIb3N0ID0gISFpc0hvc3Q7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLmlzQ29tcG9uZW50ID0gaXNDb21wb25lbnQ7XG4gICAgdGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgIHRoaXMuZXhwb3J0QXMgPSBleHBvcnRBcztcbiAgICB0aGlzLmNoYW5nZURldGVjdGlvbiA9IGNoYW5nZURldGVjdGlvbjtcbiAgICB0aGlzLnJlYWN0aXZlUHJvcGVydGllcyA9IHJlYWN0aXZlUHJvcGVydGllcztcbiAgICB0aGlzLmlucHV0cyA9IGlucHV0cztcbiAgICB0aGlzLm91dHB1dHMgPSBvdXRwdXRzO1xuICAgIHRoaXMuaG9zdExpc3RlbmVycyA9IGhvc3RMaXN0ZW5lcnM7XG4gICAgdGhpcy5ob3N0UHJvcGVydGllcyA9IGhvc3RQcm9wZXJ0aWVzO1xuICAgIHRoaXMuaG9zdEF0dHJpYnV0ZXMgPSBob3N0QXR0cmlidXRlcztcbiAgICB0aGlzLnByb3ZpZGVycyA9IF9ub3JtYWxpemVBcnJheShwcm92aWRlcnMpO1xuICAgIHRoaXMudmlld1Byb3ZpZGVycyA9IF9ub3JtYWxpemVBcnJheSh2aWV3UHJvdmlkZXJzKTtcbiAgICB0aGlzLnF1ZXJpZXMgPSBfbm9ybWFsaXplQXJyYXkocXVlcmllcyk7XG4gICAgdGhpcy5ndWFyZHMgPSBndWFyZHM7XG4gICAgdGhpcy52aWV3UXVlcmllcyA9IF9ub3JtYWxpemVBcnJheSh2aWV3UXVlcmllcyk7XG4gICAgdGhpcy5lbnRyeUNvbXBvbmVudHMgPSBfbm9ybWFsaXplQXJyYXkoZW50cnlDb21wb25lbnRzKTtcbiAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7XG5cbiAgICB0aGlzLmNvbXBvbmVudFZpZXdUeXBlID0gY29tcG9uZW50Vmlld1R5cGU7XG4gICAgdGhpcy5yZW5kZXJlclR5cGUgPSByZW5kZXJlclR5cGU7XG4gICAgdGhpcy5jb21wb25lbnRGYWN0b3J5ID0gY29tcG9uZW50RmFjdG9yeTtcbiAgfVxuXG4gIHRvU3VtbWFyeSgpOiBDb21waWxlRGlyZWN0aXZlU3VtbWFyeSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN1bW1hcnlLaW5kOiBDb21waWxlU3VtbWFyeUtpbmQuRGlyZWN0aXZlLFxuICAgICAgdHlwZTogdGhpcy50eXBlLFxuICAgICAgaXNDb21wb25lbnQ6IHRoaXMuaXNDb21wb25lbnQsXG4gICAgICBzZWxlY3RvcjogdGhpcy5zZWxlY3RvcixcbiAgICAgIGV4cG9ydEFzOiB0aGlzLmV4cG9ydEFzLFxuICAgICAgaW5wdXRzOiB0aGlzLmlucHV0cyxcbiAgICAgIG91dHB1dHM6IHRoaXMub3V0cHV0cyxcbiAgICAgIGhvc3RMaXN0ZW5lcnM6IHRoaXMuaG9zdExpc3RlbmVycyxcbiAgICAgIGhvc3RQcm9wZXJ0aWVzOiB0aGlzLmhvc3RQcm9wZXJ0aWVzLFxuICAgICAgaG9zdEF0dHJpYnV0ZXM6IHRoaXMuaG9zdEF0dHJpYnV0ZXMsXG4gICAgICBwcm92aWRlcnM6IHRoaXMucHJvdmlkZXJzLFxuICAgICAgdmlld1Byb3ZpZGVyczogdGhpcy52aWV3UHJvdmlkZXJzLFxuICAgICAgcXVlcmllczogdGhpcy5xdWVyaWVzLFxuICAgICAgZ3VhcmRzOiB0aGlzLmd1YXJkcyxcbiAgICAgIHZpZXdRdWVyaWVzOiB0aGlzLnZpZXdRdWVyaWVzLFxuICAgICAgZW50cnlDb21wb25lbnRzOiB0aGlzLmVudHJ5Q29tcG9uZW50cyxcbiAgICAgIGNoYW5nZURldGVjdGlvbjogdGhpcy5jaGFuZ2VEZXRlY3Rpb24sXG4gICAgICByZWFjdGl2ZVByb3BlcnRpZXM6IHRoaXMucmVhY3RpdmVQcm9wZXJ0aWVzLFxuICAgICAgdGVtcGxhdGU6IHRoaXMudGVtcGxhdGUgJiYgdGhpcy50ZW1wbGF0ZS50b1N1bW1hcnkoKSxcbiAgICAgIGNvbXBvbmVudFZpZXdUeXBlOiB0aGlzLmNvbXBvbmVudFZpZXdUeXBlLFxuICAgICAgcmVuZGVyZXJUeXBlOiB0aGlzLnJlbmRlcmVyVHlwZSxcbiAgICAgIGNvbXBvbmVudEZhY3Rvcnk6IHRoaXMuY29tcG9uZW50RmFjdG9yeVxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21waWxlUGlwZVN1bW1hcnkgZXh0ZW5kcyBDb21waWxlVHlwZVN1bW1hcnkge1xuICB0eXBlOiBDb21waWxlVHlwZU1ldGFkYXRhO1xuICBuYW1lOiBzdHJpbmc7XG4gIHB1cmU6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBDb21waWxlUGlwZU1ldGFkYXRhIHtcbiAgdHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YTtcbiAgbmFtZTogc3RyaW5nO1xuICBwdXJlOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHt0eXBlLCBuYW1lLCBwdXJlfToge1xuICAgIHR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGEsXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHB1cmU6IGJvb2xlYW4sXG4gIH0pIHtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5wdXJlID0gISFwdXJlO1xuICB9XG5cbiAgdG9TdW1tYXJ5KCk6IENvbXBpbGVQaXBlU3VtbWFyeSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN1bW1hcnlLaW5kOiBDb21waWxlU3VtbWFyeUtpbmQuUGlwZSxcbiAgICAgIHR5cGU6IHRoaXMudHlwZSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgIHB1cmU6IHRoaXMucHVyZVxuICAgIH07XG4gIH1cbn1cblxuLy8gTm90ZTogVGhpcyBzaG91bGQgb25seSB1c2UgaW50ZXJmYWNlcyBhcyBuZXN0ZWQgZGF0YSB0eXBlc1xuLy8gYXMgd2UgbmVlZCB0byBiZSBhYmxlIHRvIHNlcmlhbGl6ZSB0aGlzIGZyb20vdG8gSlNPTiFcbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGlsZU5nTW9kdWxlU3VtbWFyeSBleHRlbmRzIENvbXBpbGVUeXBlU3VtbWFyeSB7XG4gIHR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGE7XG5cbiAgLy8gTm90ZTogVGhpcyBpcyB0cmFuc2l0aXZlIG92ZXIgdGhlIGV4cG9ydGVkIG1vZHVsZXMuXG4gIGV4cG9ydGVkRGlyZWN0aXZlczogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdO1xuICAvLyBOb3RlOiBUaGlzIGlzIHRyYW5zaXRpdmUgb3ZlciB0aGUgZXhwb3J0ZWQgbW9kdWxlcy5cbiAgZXhwb3J0ZWRQaXBlczogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdO1xuXG4gIC8vIE5vdGU6IFRoaXMgaXMgdHJhbnNpdGl2ZS5cbiAgZW50cnlDb21wb25lbnRzOiBDb21waWxlRW50cnlDb21wb25lbnRNZXRhZGF0YVtdO1xuICAvLyBOb3RlOiBUaGlzIGlzIHRyYW5zaXRpdmUuXG4gIHByb3ZpZGVyczoge3Byb3ZpZGVyOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YSwgbW9kdWxlOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhfVtdO1xuICAvLyBOb3RlOiBUaGlzIGlzIHRyYW5zaXRpdmUuXG4gIG1vZHVsZXM6IENvbXBpbGVUeXBlTWV0YWRhdGFbXTtcbn1cblxuZXhwb3J0IGNsYXNzIENvbXBpbGVTaGFsbG93TW9kdWxlTWV0YWRhdGEge1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgdHlwZSAhOiBDb21waWxlVHlwZU1ldGFkYXRhO1xuXG4gIHJhd0V4cG9ydHM6IGFueTtcbiAgcmF3SW1wb3J0czogYW55O1xuICByYXdQcm92aWRlcnM6IGFueTtcbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZWdhcmRpbmcgY29tcGlsYXRpb24gb2YgYSBtb2R1bGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21waWxlTmdNb2R1bGVNZXRhZGF0YSB7XG4gIHR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGE7XG4gIGRlY2xhcmVkRGlyZWN0aXZlczogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdO1xuICBleHBvcnRlZERpcmVjdGl2ZXM6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXTtcbiAgZGVjbGFyZWRQaXBlczogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdO1xuXG4gIGV4cG9ydGVkUGlwZXM6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXTtcbiAgZW50cnlDb21wb25lbnRzOiBDb21waWxlRW50cnlDb21wb25lbnRNZXRhZGF0YVtdO1xuICBib290c3RyYXBDb21wb25lbnRzOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhW107XG4gIHByb3ZpZGVyczogQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGFbXTtcblxuICBpbXBvcnRlZE1vZHVsZXM6IENvbXBpbGVOZ01vZHVsZVN1bW1hcnlbXTtcbiAgZXhwb3J0ZWRNb2R1bGVzOiBDb21waWxlTmdNb2R1bGVTdW1tYXJ5W107XG4gIHNjaGVtYXM6IFNjaGVtYU1ldGFkYXRhW107XG4gIGlkOiBzdHJpbmd8bnVsbDtcblxuICB0cmFuc2l0aXZlTW9kdWxlOiBUcmFuc2l0aXZlQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGE7XG5cbiAgY29uc3RydWN0b3Ioe3R5cGUsIHByb3ZpZGVycywgZGVjbGFyZWREaXJlY3RpdmVzLCBleHBvcnRlZERpcmVjdGl2ZXMsIGRlY2xhcmVkUGlwZXMsXG4gICAgICAgICAgICAgICBleHBvcnRlZFBpcGVzLCBlbnRyeUNvbXBvbmVudHMsIGJvb3RzdHJhcENvbXBvbmVudHMsIGltcG9ydGVkTW9kdWxlcyxcbiAgICAgICAgICAgICAgIGV4cG9ydGVkTW9kdWxlcywgc2NoZW1hcywgdHJhbnNpdGl2ZU1vZHVsZSwgaWR9OiB7XG4gICAgdHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YSxcbiAgICBwcm92aWRlcnM6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhW10sXG4gICAgZGVjbGFyZWREaXJlY3RpdmVzOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhW10sXG4gICAgZXhwb3J0ZWREaXJlY3RpdmVzOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhW10sXG4gICAgZGVjbGFyZWRQaXBlczogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdLFxuICAgIGV4cG9ydGVkUGlwZXM6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXSxcbiAgICBlbnRyeUNvbXBvbmVudHM6IENvbXBpbGVFbnRyeUNvbXBvbmVudE1ldGFkYXRhW10sXG4gICAgYm9vdHN0cmFwQ29tcG9uZW50czogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdLFxuICAgIGltcG9ydGVkTW9kdWxlczogQ29tcGlsZU5nTW9kdWxlU3VtbWFyeVtdLFxuICAgIGV4cG9ydGVkTW9kdWxlczogQ29tcGlsZU5nTW9kdWxlU3VtbWFyeVtdLFxuICAgIHRyYW5zaXRpdmVNb2R1bGU6IFRyYW5zaXRpdmVDb21waWxlTmdNb2R1bGVNZXRhZGF0YSxcbiAgICBzY2hlbWFzOiBTY2hlbWFNZXRhZGF0YVtdLFxuICAgIGlkOiBzdHJpbmd8bnVsbFxuICB9KSB7XG4gICAgdGhpcy50eXBlID0gdHlwZSB8fCBudWxsO1xuICAgIHRoaXMuZGVjbGFyZWREaXJlY3RpdmVzID0gX25vcm1hbGl6ZUFycmF5KGRlY2xhcmVkRGlyZWN0aXZlcyk7XG4gICAgdGhpcy5leHBvcnRlZERpcmVjdGl2ZXMgPSBfbm9ybWFsaXplQXJyYXkoZXhwb3J0ZWREaXJlY3RpdmVzKTtcbiAgICB0aGlzLmRlY2xhcmVkUGlwZXMgPSBfbm9ybWFsaXplQXJyYXkoZGVjbGFyZWRQaXBlcyk7XG4gICAgdGhpcy5leHBvcnRlZFBpcGVzID0gX25vcm1hbGl6ZUFycmF5KGV4cG9ydGVkUGlwZXMpO1xuICAgIHRoaXMucHJvdmlkZXJzID0gX25vcm1hbGl6ZUFycmF5KHByb3ZpZGVycyk7XG4gICAgdGhpcy5lbnRyeUNvbXBvbmVudHMgPSBfbm9ybWFsaXplQXJyYXkoZW50cnlDb21wb25lbnRzKTtcbiAgICB0aGlzLmJvb3RzdHJhcENvbXBvbmVudHMgPSBfbm9ybWFsaXplQXJyYXkoYm9vdHN0cmFwQ29tcG9uZW50cyk7XG4gICAgdGhpcy5pbXBvcnRlZE1vZHVsZXMgPSBfbm9ybWFsaXplQXJyYXkoaW1wb3J0ZWRNb2R1bGVzKTtcbiAgICB0aGlzLmV4cG9ydGVkTW9kdWxlcyA9IF9ub3JtYWxpemVBcnJheShleHBvcnRlZE1vZHVsZXMpO1xuICAgIHRoaXMuc2NoZW1hcyA9IF9ub3JtYWxpemVBcnJheShzY2hlbWFzKTtcbiAgICB0aGlzLmlkID0gaWQgfHwgbnVsbDtcbiAgICB0aGlzLnRyYW5zaXRpdmVNb2R1bGUgPSB0cmFuc2l0aXZlTW9kdWxlIHx8IG51bGw7XG4gIH1cblxuICB0b1N1bW1hcnkoKTogQ29tcGlsZU5nTW9kdWxlU3VtbWFyeSB7XG4gICAgY29uc3QgbW9kdWxlID0gdGhpcy50cmFuc2l0aXZlTW9kdWxlICE7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN1bW1hcnlLaW5kOiBDb21waWxlU3VtbWFyeUtpbmQuTmdNb2R1bGUsXG4gICAgICB0eXBlOiB0aGlzLnR5cGUsXG4gICAgICBlbnRyeUNvbXBvbmVudHM6IG1vZHVsZS5lbnRyeUNvbXBvbmVudHMsXG4gICAgICBwcm92aWRlcnM6IG1vZHVsZS5wcm92aWRlcnMsXG4gICAgICBtb2R1bGVzOiBtb2R1bGUubW9kdWxlcyxcbiAgICAgIGV4cG9ydGVkRGlyZWN0aXZlczogbW9kdWxlLmV4cG9ydGVkRGlyZWN0aXZlcyxcbiAgICAgIGV4cG9ydGVkUGlwZXM6IG1vZHVsZS5leHBvcnRlZFBpcGVzXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVHJhbnNpdGl2ZUNvbXBpbGVOZ01vZHVsZU1ldGFkYXRhIHtcbiAgZGlyZWN0aXZlc1NldCA9IG5ldyBTZXQ8YW55PigpO1xuICBkaXJlY3RpdmVzOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhW10gPSBbXTtcbiAgZXhwb3J0ZWREaXJlY3RpdmVzU2V0ID0gbmV3IFNldDxhbnk+KCk7XG4gIGV4cG9ydGVkRGlyZWN0aXZlczogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdID0gW107XG4gIHBpcGVzU2V0ID0gbmV3IFNldDxhbnk+KCk7XG4gIHBpcGVzOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhW10gPSBbXTtcbiAgZXhwb3J0ZWRQaXBlc1NldCA9IG5ldyBTZXQ8YW55PigpO1xuICBleHBvcnRlZFBpcGVzOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhW10gPSBbXTtcbiAgbW9kdWxlc1NldCA9IG5ldyBTZXQ8YW55PigpO1xuICBtb2R1bGVzOiBDb21waWxlVHlwZU1ldGFkYXRhW10gPSBbXTtcbiAgZW50cnlDb21wb25lbnRzU2V0ID0gbmV3IFNldDxhbnk+KCk7XG4gIGVudHJ5Q29tcG9uZW50czogQ29tcGlsZUVudHJ5Q29tcG9uZW50TWV0YWRhdGFbXSA9IFtdO1xuXG4gIHByb3ZpZGVyczoge3Byb3ZpZGVyOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YSwgbW9kdWxlOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhfVtdID0gW107XG5cbiAgYWRkUHJvdmlkZXIocHJvdmlkZXI6IENvbXBpbGVQcm92aWRlck1ldGFkYXRhLCBtb2R1bGU6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEpIHtcbiAgICB0aGlzLnByb3ZpZGVycy5wdXNoKHtwcm92aWRlcjogcHJvdmlkZXIsIG1vZHVsZTogbW9kdWxlfSk7XG4gIH1cblxuICBhZGREaXJlY3RpdmUoaWQ6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEpIHtcbiAgICBpZiAoIXRoaXMuZGlyZWN0aXZlc1NldC5oYXMoaWQucmVmZXJlbmNlKSkge1xuICAgICAgdGhpcy5kaXJlY3RpdmVzU2V0LmFkZChpZC5yZWZlcmVuY2UpO1xuICAgICAgdGhpcy5kaXJlY3RpdmVzLnB1c2goaWQpO1xuICAgIH1cbiAgfVxuICBhZGRFeHBvcnRlZERpcmVjdGl2ZShpZDogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSkge1xuICAgIGlmICghdGhpcy5leHBvcnRlZERpcmVjdGl2ZXNTZXQuaGFzKGlkLnJlZmVyZW5jZSkpIHtcbiAgICAgIHRoaXMuZXhwb3J0ZWREaXJlY3RpdmVzU2V0LmFkZChpZC5yZWZlcmVuY2UpO1xuICAgICAgdGhpcy5leHBvcnRlZERpcmVjdGl2ZXMucHVzaChpZCk7XG4gICAgfVxuICB9XG4gIGFkZFBpcGUoaWQ6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEpIHtcbiAgICBpZiAoIXRoaXMucGlwZXNTZXQuaGFzKGlkLnJlZmVyZW5jZSkpIHtcbiAgICAgIHRoaXMucGlwZXNTZXQuYWRkKGlkLnJlZmVyZW5jZSk7XG4gICAgICB0aGlzLnBpcGVzLnB1c2goaWQpO1xuICAgIH1cbiAgfVxuICBhZGRFeHBvcnRlZFBpcGUoaWQ6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEpIHtcbiAgICBpZiAoIXRoaXMuZXhwb3J0ZWRQaXBlc1NldC5oYXMoaWQucmVmZXJlbmNlKSkge1xuICAgICAgdGhpcy5leHBvcnRlZFBpcGVzU2V0LmFkZChpZC5yZWZlcmVuY2UpO1xuICAgICAgdGhpcy5leHBvcnRlZFBpcGVzLnB1c2goaWQpO1xuICAgIH1cbiAgfVxuICBhZGRNb2R1bGUoaWQ6IENvbXBpbGVUeXBlTWV0YWRhdGEpIHtcbiAgICBpZiAoIXRoaXMubW9kdWxlc1NldC5oYXMoaWQucmVmZXJlbmNlKSkge1xuICAgICAgdGhpcy5tb2R1bGVzU2V0LmFkZChpZC5yZWZlcmVuY2UpO1xuICAgICAgdGhpcy5tb2R1bGVzLnB1c2goaWQpO1xuICAgIH1cbiAgfVxuICBhZGRFbnRyeUNvbXBvbmVudChlYzogQ29tcGlsZUVudHJ5Q29tcG9uZW50TWV0YWRhdGEpIHtcbiAgICBpZiAoIXRoaXMuZW50cnlDb21wb25lbnRzU2V0LmhhcyhlYy5jb21wb25lbnRUeXBlKSkge1xuICAgICAgdGhpcy5lbnRyeUNvbXBvbmVudHNTZXQuYWRkKGVjLmNvbXBvbmVudFR5cGUpO1xuICAgICAgdGhpcy5lbnRyeUNvbXBvbmVudHMucHVzaChlYyk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIF9ub3JtYWxpemVBcnJheShvYmo6IGFueVtdIHwgdW5kZWZpbmVkIHwgbnVsbCk6IGFueVtdIHtcbiAgcmV0dXJuIG9iaiB8fCBbXTtcbn1cblxuZXhwb3J0IGNsYXNzIFByb3ZpZGVyTWV0YSB7XG4gIHRva2VuOiBhbnk7XG4gIHVzZUNsYXNzOiBUeXBlfG51bGw7XG4gIHVzZVZhbHVlOiBhbnk7XG4gIHVzZUV4aXN0aW5nOiBhbnk7XG4gIHVzZUZhY3Rvcnk6IEZ1bmN0aW9ufG51bGw7XG4gIGRlcGVuZGVuY2llczogT2JqZWN0W118bnVsbDtcbiAgbXVsdGk6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IodG9rZW46IGFueSwge3VzZUNsYXNzLCB1c2VWYWx1ZSwgdXNlRXhpc3RpbmcsIHVzZUZhY3RvcnksIGRlcHMsIG11bHRpfToge1xuICAgIHVzZUNsYXNzPzogVHlwZSxcbiAgICB1c2VWYWx1ZT86IGFueSxcbiAgICB1c2VFeGlzdGluZz86IGFueSxcbiAgICB1c2VGYWN0b3J5PzogRnVuY3Rpb258bnVsbCxcbiAgICBkZXBzPzogT2JqZWN0W118bnVsbCxcbiAgICBtdWx0aT86IGJvb2xlYW5cbiAgfSkge1xuICAgIHRoaXMudG9rZW4gPSB0b2tlbjtcbiAgICB0aGlzLnVzZUNsYXNzID0gdXNlQ2xhc3MgfHwgbnVsbDtcbiAgICB0aGlzLnVzZVZhbHVlID0gdXNlVmFsdWU7XG4gICAgdGhpcy51c2VFeGlzdGluZyA9IHVzZUV4aXN0aW5nO1xuICAgIHRoaXMudXNlRmFjdG9yeSA9IHVzZUZhY3RvcnkgfHwgbnVsbDtcbiAgICB0aGlzLmRlcGVuZGVuY2llcyA9IGRlcHMgfHwgbnVsbDtcbiAgICB0aGlzLm11bHRpID0gISFtdWx0aTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmxhdHRlbjxUPihsaXN0OiBBcnJheTxUfFRbXT4pOiBUW10ge1xuICByZXR1cm4gbGlzdC5yZWR1Y2UoKGZsYXQ6IGFueVtdLCBpdGVtOiBUIHwgVFtdKTogVFtdID0+IHtcbiAgICBjb25zdCBmbGF0SXRlbSA9IEFycmF5LmlzQXJyYXkoaXRlbSkgPyBmbGF0dGVuKGl0ZW0pIDogaXRlbTtcbiAgICByZXR1cm4gKDxUW10+ZmxhdCkuY29uY2F0KGZsYXRJdGVtKTtcbiAgfSwgW10pO1xufVxuXG5mdW5jdGlvbiBqaXRTb3VyY2VVcmwodXJsOiBzdHJpbmcpIHtcbiAgLy8gTm90ZTogV2UgbmVlZCAzIFwiL1wiIHNvIHRoYXQgbmcgc2hvd3MgdXAgYXMgYSBzZXBhcmF0ZSBkb21haW5cbiAgLy8gaW4gdGhlIGNocm9tZSBkZXYgdG9vbHMuXG4gIHJldHVybiB1cmwucmVwbGFjZSgvKFxcdys6XFwvXFwvW1xcdzotXSspPyhcXC8rKT8vLCAnbmc6Ly8vJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0ZW1wbGF0ZVNvdXJjZVVybChcbiAgICBuZ01vZHVsZVR5cGU6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEsIGNvbXBNZXRhOiB7dHlwZTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YX0sXG4gICAgdGVtcGxhdGVNZXRhOiB7aXNJbmxpbmU6IGJvb2xlYW4sIHRlbXBsYXRlVXJsOiBzdHJpbmcgfCBudWxsfSkge1xuICBsZXQgdXJsOiBzdHJpbmc7XG4gIGlmICh0ZW1wbGF0ZU1ldGEuaXNJbmxpbmUpIHtcbiAgICBpZiAoY29tcE1ldGEudHlwZS5yZWZlcmVuY2UgaW5zdGFuY2VvZiBTdGF0aWNTeW1ib2wpIHtcbiAgICAgIC8vIE5vdGU6IGEgLnRzIGZpbGUgbWlnaHQgY29udGFpbiBtdWx0aXBsZSBjb21wb25lbnRzIHdpdGggaW5saW5lIHRlbXBsYXRlcyxcbiAgICAgIC8vIHNvIHdlIG5lZWQgdG8gZ2l2ZSB0aGVtIHVuaXF1ZSB1cmxzLCBhcyB0aGVzZSB3aWxsIGJlIHVzZWQgZm9yIHNvdXJjZW1hcHMuXG4gICAgICB1cmwgPSBgJHtjb21wTWV0YS50eXBlLnJlZmVyZW5jZS5maWxlUGF0aH0uJHtjb21wTWV0YS50eXBlLnJlZmVyZW5jZS5uYW1lfS5odG1sYDtcbiAgICB9IGVsc2Uge1xuICAgICAgdXJsID0gYCR7aWRlbnRpZmllck5hbWUobmdNb2R1bGVUeXBlKX0vJHtpZGVudGlmaWVyTmFtZShjb21wTWV0YS50eXBlKX0uaHRtbGA7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHVybCA9IHRlbXBsYXRlTWV0YS50ZW1wbGF0ZVVybCAhO1xuICB9XG4gIHJldHVybiBjb21wTWV0YS50eXBlLnJlZmVyZW5jZSBpbnN0YW5jZW9mIFN0YXRpY1N5bWJvbCA/IHVybCA6IGppdFNvdXJjZVVybCh1cmwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hhcmVkU3R5bGVzaGVldEppdFVybChtZXRhOiBDb21waWxlU3R5bGVzaGVldE1ldGFkYXRhLCBpZDogbnVtYmVyKSB7XG4gIGNvbnN0IHBhdGhQYXJ0cyA9IG1ldGEubW9kdWxlVXJsICEuc3BsaXQoL1xcL1xcXFwvZyk7XG4gIGNvbnN0IGJhc2VOYW1lID0gcGF0aFBhcnRzW3BhdGhQYXJ0cy5sZW5ndGggLSAxXTtcbiAgcmV0dXJuIGppdFNvdXJjZVVybChgY3NzLyR7aWR9JHtiYXNlTmFtZX0ubmdzdHlsZS5qc2ApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbmdNb2R1bGVKaXRVcmwobW9kdWxlTWV0YTogQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGEpOiBzdHJpbmcge1xuICByZXR1cm4gaml0U291cmNlVXJsKGAke2lkZW50aWZpZXJOYW1lKG1vZHVsZU1ldGEudHlwZSl9L21vZHVsZS5uZ2ZhY3RvcnkuanNgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRlbXBsYXRlSml0VXJsKFxuICAgIG5nTW9kdWxlVHlwZTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSwgY29tcE1ldGE6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSk6IHN0cmluZyB7XG4gIHJldHVybiBqaXRTb3VyY2VVcmwoXG4gICAgICBgJHtpZGVudGlmaWVyTmFtZShuZ01vZHVsZVR5cGUpfS8ke2lkZW50aWZpZXJOYW1lKGNvbXBNZXRhLnR5cGUpfS5uZ2ZhY3RvcnkuanNgKTtcbn1cbiJdfQ==