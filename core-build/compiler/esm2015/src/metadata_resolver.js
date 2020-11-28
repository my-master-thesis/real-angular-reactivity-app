/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { StaticSymbol } from './aot/static_symbol';
import { ngfactoryFilePath } from './aot/util';
import { assertArrayOfStrings, assertInterpolationSymbols } from './assertions';
import * as cpl from './compile_metadata';
import { ChangeDetectionStrategy, Type, ViewEncapsulation, createAttribute, createComponent, createHost, createInject, createInjectable, createInjectionToken, createNgModule, createOptional, createSelf, createSkipSelf } from './core';
import { findLast } from './directive_resolver';
import { Identifiers } from './identifiers';
import { getAllLifecycleHooks } from './lifecycle_reflector';
import { CssSelector } from './selector';
import { SyncAsync, ValueTransformer, isPromise, noUndefined, resolveForwardRef, stringify, syntaxError, visitValue } from './util';
export const ERROR_COMPONENT_TYPE = 'ngComponentType';
// Design notes:
// - don't lazily create metadata:
//   For some metadata, we need to do async work sometimes,
//   so the user has to kick off this loading.
//   But we want to report errors even when the async work is
//   not required to check that the user would have been able
//   to wait correctly.
export class CompileMetadataResolver {
    constructor(_config, _htmlParser, _ngModuleResolver, _directiveResolver, _pipeResolver, _summaryResolver, _schemaRegistry, _directiveNormalizer, _console, _staticSymbolCache, _reflector, _errorCollector) {
        this._config = _config;
        this._htmlParser = _htmlParser;
        this._ngModuleResolver = _ngModuleResolver;
        this._directiveResolver = _directiveResolver;
        this._pipeResolver = _pipeResolver;
        this._summaryResolver = _summaryResolver;
        this._schemaRegistry = _schemaRegistry;
        this._directiveNormalizer = _directiveNormalizer;
        this._console = _console;
        this._staticSymbolCache = _staticSymbolCache;
        this._reflector = _reflector;
        this._errorCollector = _errorCollector;
        this._nonNormalizedDirectiveCache = new Map();
        this._directiveCache = new Map();
        this._summaryCache = new Map();
        this._pipeCache = new Map();
        this._ngModuleCache = new Map();
        this._ngModuleOfTypes = new Map();
        this._shallowModuleCache = new Map();
    }
    getReflector() { return this._reflector; }
    clearCacheFor(type) {
        const dirMeta = this._directiveCache.get(type);
        this._directiveCache.delete(type);
        this._nonNormalizedDirectiveCache.delete(type);
        this._summaryCache.delete(type);
        this._pipeCache.delete(type);
        this._ngModuleOfTypes.delete(type);
        // Clear all of the NgModule as they contain transitive information!
        this._ngModuleCache.clear();
        if (dirMeta) {
            this._directiveNormalizer.clearCacheFor(dirMeta);
        }
    }
    clearCache() {
        this._directiveCache.clear();
        this._nonNormalizedDirectiveCache.clear();
        this._summaryCache.clear();
        this._pipeCache.clear();
        this._ngModuleCache.clear();
        this._ngModuleOfTypes.clear();
        this._directiveNormalizer.clearCache();
    }
    _createProxyClass(baseType, name) {
        let delegate = null;
        const proxyClass = function () {
            if (!delegate) {
                throw new Error(`Illegal state: Class ${name} for type ${stringify(baseType)} is not compiled yet!`);
            }
            return delegate.apply(this, arguments);
        };
        proxyClass.setDelegate = (d) => {
            delegate = d;
            proxyClass.prototype = d.prototype;
        };
        // Make stringify work correctly
        proxyClass.overriddenName = name;
        return proxyClass;
    }
    getGeneratedClass(dirType, name) {
        if (dirType instanceof StaticSymbol) {
            return this._staticSymbolCache.get(ngfactoryFilePath(dirType.filePath), name);
        }
        else {
            return this._createProxyClass(dirType, name);
        }
    }
    getComponentViewClass(dirType) {
        return this.getGeneratedClass(dirType, cpl.viewClassName(dirType, 0));
    }
    getHostComponentViewClass(dirType) {
        return this.getGeneratedClass(dirType, cpl.hostViewClassName(dirType));
    }
    getHostComponentType(dirType) {
        const name = `${cpl.identifierName({ reference: dirType })}_Host`;
        if (dirType instanceof StaticSymbol) {
            return this._staticSymbolCache.get(dirType.filePath, name);
        }
        return this._createProxyClass(dirType, name);
    }
    getRendererType(dirType) {
        if (dirType instanceof StaticSymbol) {
            return this._staticSymbolCache.get(ngfactoryFilePath(dirType.filePath), cpl.rendererTypeName(dirType));
        }
        else {
            // returning an object as proxy,
            // that we fill later during runtime compilation.
            return {};
        }
    }
    getComponentFactory(selector, dirType, inputs, outputs) {
        if (dirType instanceof StaticSymbol) {
            return this._staticSymbolCache.get(ngfactoryFilePath(dirType.filePath), cpl.componentFactoryName(dirType));
        }
        else {
            const hostView = this.getHostComponentViewClass(dirType);
            // Note: ngContentSelectors will be filled later once the template is
            // loaded.
            const createComponentFactory = this._reflector.resolveExternalReference(Identifiers.createComponentFactory);
            return createComponentFactory(selector, dirType, hostView, inputs, outputs, []);
        }
    }
    initComponentFactory(factory, ngContentSelectors) {
        if (!(factory instanceof StaticSymbol)) {
            factory.ngContentSelectors.push(...ngContentSelectors);
        }
    }
    _loadSummary(type, kind) {
        let typeSummary = this._summaryCache.get(type);
        if (!typeSummary) {
            const summary = this._summaryResolver.resolveSummary(type);
            typeSummary = summary ? summary.type : null;
            this._summaryCache.set(type, typeSummary || null);
        }
        return typeSummary && typeSummary.summaryKind === kind ? typeSummary : null;
    }
    getHostComponentMetadata(compMeta, hostViewType) {
        const hostType = this.getHostComponentType(compMeta.type.reference);
        if (!hostViewType) {
            hostViewType = this.getHostComponentViewClass(hostType);
        }
        // Note: ! is ok here as this method should only be called with normalized directive
        // metadata, which always fills in the selector.
        const template = CssSelector.parse(compMeta.selector)[0].getMatchingElementTemplate();
        const templateUrl = '';
        const htmlAst = this._htmlParser.parse(template, templateUrl);
        return cpl.CompileDirectiveMetadata.create({
            isHost: true,
            type: { reference: hostType, diDeps: [], lifecycleHooks: [] },
            template: new cpl.CompileTemplateMetadata({
                encapsulation: ViewEncapsulation.None,
                template,
                templateUrl,
                htmlAst,
                styles: [],
                styleUrls: [],
                ngContentSelectors: [],
                animations: [],
                isInline: true,
                externalStylesheets: [],
                interpolation: null,
                preserveWhitespaces: false,
            }),
            exportAs: null,
            changeDetection: ChangeDetectionStrategy.Default,
            reactiveProperties: [],
            inputs: [],
            outputs: [],
            host: {},
            isComponent: true,
            selector: '*',
            providers: [],
            viewProviders: [],
            queries: [],
            guards: {},
            viewQueries: [],
            componentViewType: hostViewType,
            rendererType: { id: '__Host__', encapsulation: ViewEncapsulation.None, styles: [], data: {} },
            entryComponents: [],
            componentFactory: null
        });
    }
    loadDirectiveMetadata(ngModuleType, directiveType, isSync) {
        if (this._directiveCache.has(directiveType)) {
            return null;
        }
        directiveType = resolveForwardRef(directiveType);
        const { annotation, metadata } = this.getNonNormalizedDirectiveMetadata(directiveType);
        const createDirectiveMetadata = (templateMetadata) => {
            const normalizedDirMeta = new cpl.CompileDirectiveMetadata({
                isHost: false,
                type: metadata.type,
                isComponent: metadata.isComponent,
                selector: metadata.selector,
                exportAs: metadata.exportAs,
                changeDetection: metadata.changeDetection,
                reactiveProperties: metadata.reactiveProperties,
                inputs: metadata.inputs,
                outputs: metadata.outputs,
                hostListeners: metadata.hostListeners,
                hostProperties: metadata.hostProperties,
                hostAttributes: metadata.hostAttributes,
                providers: metadata.providers,
                viewProviders: metadata.viewProviders,
                queries: metadata.queries,
                guards: metadata.guards,
                viewQueries: metadata.viewQueries,
                entryComponents: metadata.entryComponents,
                componentViewType: metadata.componentViewType,
                rendererType: metadata.rendererType,
                componentFactory: metadata.componentFactory,
                template: templateMetadata
            });
            if (templateMetadata) {
                this.initComponentFactory(metadata.componentFactory, templateMetadata.ngContentSelectors);
            }
            this._directiveCache.set(directiveType, normalizedDirMeta);
            this._summaryCache.set(directiveType, normalizedDirMeta.toSummary());
            return null;
        };
        if (metadata.isComponent) {
            const template = metadata.template;
            const templateMeta = this._directiveNormalizer.normalizeTemplate({
                ngModuleType,
                componentType: directiveType,
                moduleUrl: this._reflector.componentModuleUrl(directiveType, annotation),
                encapsulation: template.encapsulation,
                template: template.template,
                templateUrl: template.templateUrl,
                styles: template.styles,
                styleUrls: template.styleUrls,
                animations: template.animations,
                interpolation: template.interpolation,
                preserveWhitespaces: template.preserveWhitespaces
            });
            if (isPromise(templateMeta) && isSync) {
                this._reportError(componentStillLoadingError(directiveType), directiveType);
                return null;
            }
            return SyncAsync.then(templateMeta, createDirectiveMetadata);
        }
        else {
            // directive
            createDirectiveMetadata(null);
            return null;
        }
    }
    getNonNormalizedDirectiveMetadata(directiveType) {
        directiveType = resolveForwardRef(directiveType);
        if (!directiveType) {
            return null;
        }
        let cacheEntry = this._nonNormalizedDirectiveCache.get(directiveType);
        if (cacheEntry) {
            return cacheEntry;
        }
        const dirMeta = this._directiveResolver.resolve(directiveType, false);
        if (!dirMeta) {
            return null;
        }
        let nonNormalizedTemplateMetadata = undefined;
        if (createComponent.isTypeOf(dirMeta)) {
            // component
            const compMeta = dirMeta;
            assertArrayOfStrings('styles', compMeta.styles);
            assertArrayOfStrings('styleUrls', compMeta.styleUrls);
            assertInterpolationSymbols('interpolation', compMeta.interpolation);
            const animations = compMeta.animations;
            nonNormalizedTemplateMetadata = new cpl.CompileTemplateMetadata({
                encapsulation: noUndefined(compMeta.encapsulation),
                template: noUndefined(compMeta.template),
                templateUrl: noUndefined(compMeta.templateUrl),
                htmlAst: null,
                styles: compMeta.styles || [],
                styleUrls: compMeta.styleUrls || [],
                animations: animations || [],
                interpolation: noUndefined(compMeta.interpolation),
                isInline: !!compMeta.template,
                externalStylesheets: [],
                ngContentSelectors: [],
                preserveWhitespaces: noUndefined(dirMeta.preserveWhitespaces),
            });
        }
        let changeDetectionStrategy = null;
        let reactiveProperties = [];
        let viewProviders = [];
        let entryComponentMetadata = [];
        let selector = dirMeta.selector;
        if (createComponent.isTypeOf(dirMeta)) {
            // Component
            const compMeta = dirMeta;
            changeDetectionStrategy = compMeta.changeDetection;
            if (compMeta.reactiveProperties) {
                reactiveProperties = compMeta.reactiveProperties;
            }
            if (compMeta.viewProviders) {
                viewProviders = this._getProvidersMetadata(compMeta.viewProviders, entryComponentMetadata, `viewProviders for "${stringifyType(directiveType)}"`, [], directiveType);
            }
            if (compMeta.entryComponents) {
                entryComponentMetadata = flattenAndDedupeArray(compMeta.entryComponents)
                    .map((type) => this._getEntryComponentMetadata(type))
                    .concat(entryComponentMetadata);
            }
            if (!selector) {
                selector = this._schemaRegistry.getDefaultComponentElementName();
            }
        }
        else {
            // Directive
            if (!selector) {
                selector = null;
            }
        }
        let providers = [];
        if (dirMeta.providers != null) {
            providers = this._getProvidersMetadata(dirMeta.providers, entryComponentMetadata, `providers for "${stringifyType(directiveType)}"`, [], directiveType);
        }
        let queries = [];
        let viewQueries = [];
        if (dirMeta.queries != null) {
            queries = this._getQueriesMetadata(dirMeta.queries, false, directiveType);
            viewQueries = this._getQueriesMetadata(dirMeta.queries, true, directiveType);
        }
        const metadata = cpl.CompileDirectiveMetadata.create({
            isHost: false,
            selector: selector,
            exportAs: noUndefined(dirMeta.exportAs),
            isComponent: !!nonNormalizedTemplateMetadata,
            type: this._getTypeMetadata(directiveType),
            template: nonNormalizedTemplateMetadata,
            changeDetection: changeDetectionStrategy,
            reactiveProperties: reactiveProperties,
            inputs: dirMeta.inputs || [],
            outputs: dirMeta.outputs || [],
            host: dirMeta.host || {},
            providers: providers || [],
            viewProviders: viewProviders || [],
            queries: queries || [],
            guards: dirMeta.guards || {},
            viewQueries: viewQueries || [],
            entryComponents: entryComponentMetadata,
            componentViewType: nonNormalizedTemplateMetadata ? this.getComponentViewClass(directiveType) :
                null,
            rendererType: nonNormalizedTemplateMetadata ? this.getRendererType(directiveType) : null,
            componentFactory: null
        });
        if (nonNormalizedTemplateMetadata) {
            metadata.componentFactory =
                this.getComponentFactory(selector, directiveType, metadata.inputs, metadata.outputs);
        }
        cacheEntry = { metadata, annotation: dirMeta };
        this._nonNormalizedDirectiveCache.set(directiveType, cacheEntry);
        return cacheEntry;
    }
    /**
     * Gets the metadata for the given directive.
     * This assumes `loadNgModuleDirectiveAndPipeMetadata` has been called first.
     */
    getDirectiveMetadata(directiveType) {
        const dirMeta = this._directiveCache.get(directiveType);
        if (!dirMeta) {
            this._reportError(syntaxError(`Illegal state: getDirectiveMetadata can only be called after loadNgModuleDirectiveAndPipeMetadata for a module that declares it. Directive ${stringifyType(directiveType)}.`), directiveType);
        }
        return dirMeta;
    }
    getDirectiveSummary(dirType) {
        const dirSummary = this._loadSummary(dirType, cpl.CompileSummaryKind.Directive);
        if (!dirSummary) {
            this._reportError(syntaxError(`Illegal state: Could not load the summary for directive ${stringifyType(dirType)}.`), dirType);
        }
        return dirSummary;
    }
    isDirective(type) {
        return !!this._loadSummary(type, cpl.CompileSummaryKind.Directive) ||
            this._directiveResolver.isDirective(type);
    }
    isAbstractDirective(type) {
        const summary = this._loadSummary(type, cpl.CompileSummaryKind.Directive);
        if (summary && !summary.isComponent) {
            return !summary.selector;
        }
        const meta = this._directiveResolver.resolve(type, false);
        if (meta && !createComponent.isTypeOf(meta)) {
            return !meta.selector;
        }
        return false;
    }
    isPipe(type) {
        return !!this._loadSummary(type, cpl.CompileSummaryKind.Pipe) ||
            this._pipeResolver.isPipe(type);
    }
    isNgModule(type) {
        return !!this._loadSummary(type, cpl.CompileSummaryKind.NgModule) ||
            this._ngModuleResolver.isNgModule(type);
    }
    getNgModuleSummary(moduleType, alreadyCollecting = null) {
        let moduleSummary = this._loadSummary(moduleType, cpl.CompileSummaryKind.NgModule);
        if (!moduleSummary) {
            const moduleMeta = this.getNgModuleMetadata(moduleType, false, alreadyCollecting);
            moduleSummary = moduleMeta ? moduleMeta.toSummary() : null;
            if (moduleSummary) {
                this._summaryCache.set(moduleType, moduleSummary);
            }
        }
        return moduleSummary;
    }
    /**
     * Loads the declared directives and pipes of an NgModule.
     */
    loadNgModuleDirectiveAndPipeMetadata(moduleType, isSync, throwIfNotFound = true) {
        const ngModule = this.getNgModuleMetadata(moduleType, throwIfNotFound);
        const loading = [];
        if (ngModule) {
            ngModule.declaredDirectives.forEach((id) => {
                const promise = this.loadDirectiveMetadata(moduleType, id.reference, isSync);
                if (promise) {
                    loading.push(promise);
                }
            });
            ngModule.declaredPipes.forEach((id) => this._loadPipeMetadata(id.reference));
        }
        return Promise.all(loading);
    }
    getShallowModuleMetadata(moduleType) {
        let compileMeta = this._shallowModuleCache.get(moduleType);
        if (compileMeta) {
            return compileMeta;
        }
        const ngModuleMeta = findLast(this._reflector.shallowAnnotations(moduleType), createNgModule.isTypeOf);
        compileMeta = {
            type: this._getTypeMetadata(moduleType),
            rawExports: ngModuleMeta.exports,
            rawImports: ngModuleMeta.imports,
            rawProviders: ngModuleMeta.providers,
        };
        this._shallowModuleCache.set(moduleType, compileMeta);
        return compileMeta;
    }
    getNgModuleMetadata(moduleType, throwIfNotFound = true, alreadyCollecting = null) {
        moduleType = resolveForwardRef(moduleType);
        let compileMeta = this._ngModuleCache.get(moduleType);
        if (compileMeta) {
            return compileMeta;
        }
        const meta = this._ngModuleResolver.resolve(moduleType, throwIfNotFound);
        if (!meta) {
            return null;
        }
        const declaredDirectives = [];
        const exportedNonModuleIdentifiers = [];
        const declaredPipes = [];
        const importedModules = [];
        const exportedModules = [];
        const providers = [];
        const entryComponents = [];
        const bootstrapComponents = [];
        const schemas = [];
        if (meta.imports) {
            flattenAndDedupeArray(meta.imports).forEach((importedType) => {
                let importedModuleType = undefined;
                if (isValidType(importedType)) {
                    importedModuleType = importedType;
                }
                else if (importedType && importedType.ngModule) {
                    const moduleWithProviders = importedType;
                    importedModuleType = moduleWithProviders.ngModule;
                    if (moduleWithProviders.providers) {
                        providers.push(...this._getProvidersMetadata(moduleWithProviders.providers, entryComponents, `provider for the NgModule '${stringifyType(importedModuleType)}'`, [], importedType));
                    }
                }
                if (importedModuleType) {
                    if (this._checkSelfImport(moduleType, importedModuleType))
                        return;
                    if (!alreadyCollecting)
                        alreadyCollecting = new Set();
                    if (alreadyCollecting.has(importedModuleType)) {
                        this._reportError(syntaxError(`${this._getTypeDescriptor(importedModuleType)} '${stringifyType(importedType)}' is imported recursively by the module '${stringifyType(moduleType)}'.`), moduleType);
                        return;
                    }
                    alreadyCollecting.add(importedModuleType);
                    const importedModuleSummary = this.getNgModuleSummary(importedModuleType, alreadyCollecting);
                    alreadyCollecting.delete(importedModuleType);
                    if (!importedModuleSummary) {
                        this._reportError(syntaxError(`Unexpected ${this._getTypeDescriptor(importedType)} '${stringifyType(importedType)}' imported by the module '${stringifyType(moduleType)}'. Please add a @NgModule annotation.`), moduleType);
                        return;
                    }
                    importedModules.push(importedModuleSummary);
                }
                else {
                    this._reportError(syntaxError(`Unexpected value '${stringifyType(importedType)}' imported by the module '${stringifyType(moduleType)}'`), moduleType);
                    return;
                }
            });
        }
        if (meta.exports) {
            flattenAndDedupeArray(meta.exports).forEach((exportedType) => {
                if (!isValidType(exportedType)) {
                    this._reportError(syntaxError(`Unexpected value '${stringifyType(exportedType)}' exported by the module '${stringifyType(moduleType)}'`), moduleType);
                    return;
                }
                if (!alreadyCollecting)
                    alreadyCollecting = new Set();
                if (alreadyCollecting.has(exportedType)) {
                    this._reportError(syntaxError(`${this._getTypeDescriptor(exportedType)} '${stringify(exportedType)}' is exported recursively by the module '${stringifyType(moduleType)}'`), moduleType);
                    return;
                }
                alreadyCollecting.add(exportedType);
                const exportedModuleSummary = this.getNgModuleSummary(exportedType, alreadyCollecting);
                alreadyCollecting.delete(exportedType);
                if (exportedModuleSummary) {
                    exportedModules.push(exportedModuleSummary);
                }
                else {
                    exportedNonModuleIdentifiers.push(this._getIdentifierMetadata(exportedType));
                }
            });
        }
        // Note: This will be modified later, so we rely on
        // getting a new instance every time!
        const transitiveModule = this._getTransitiveNgModuleMetadata(importedModules, exportedModules);
        if (meta.declarations) {
            flattenAndDedupeArray(meta.declarations).forEach((declaredType) => {
                if (!isValidType(declaredType)) {
                    this._reportError(syntaxError(`Unexpected value '${stringifyType(declaredType)}' declared by the module '${stringifyType(moduleType)}'`), moduleType);
                    return;
                }
                const declaredIdentifier = this._getIdentifierMetadata(declaredType);
                if (this.isDirective(declaredType)) {
                    if (this.isAbstractDirective(declaredType)) {
                        this._reportError(syntaxError(`Directive ${stringifyType(declaredType)} has no selector, please add it!`), declaredType);
                    }
                    transitiveModule.addDirective(declaredIdentifier);
                    declaredDirectives.push(declaredIdentifier);
                    this._addTypeToModule(declaredType, moduleType);
                }
                else if (this.isPipe(declaredType)) {
                    transitiveModule.addPipe(declaredIdentifier);
                    transitiveModule.pipes.push(declaredIdentifier);
                    declaredPipes.push(declaredIdentifier);
                    this._addTypeToModule(declaredType, moduleType);
                }
                else {
                    this._reportError(syntaxError(`Unexpected ${this._getTypeDescriptor(declaredType)} '${stringifyType(declaredType)}' declared by the module '${stringifyType(moduleType)}'. Please add a @Pipe/@Directive/@Component annotation.`), moduleType);
                    return;
                }
            });
        }
        const exportedDirectives = [];
        const exportedPipes = [];
        exportedNonModuleIdentifiers.forEach((exportedId) => {
            if (transitiveModule.directivesSet.has(exportedId.reference)) {
                exportedDirectives.push(exportedId);
                transitiveModule.addExportedDirective(exportedId);
            }
            else if (transitiveModule.pipesSet.has(exportedId.reference)) {
                exportedPipes.push(exportedId);
                transitiveModule.addExportedPipe(exportedId);
            }
            else {
                this._reportError(syntaxError(`Can't export ${this._getTypeDescriptor(exportedId.reference)} ${stringifyType(exportedId.reference)} from ${stringifyType(moduleType)} as it was neither declared nor imported!`), moduleType);
                return;
            }
        });
        // The providers of the module have to go last
        // so that they overwrite any other provider we already added.
        if (meta.providers) {
            providers.push(...this._getProvidersMetadata(meta.providers, entryComponents, `provider for the NgModule '${stringifyType(moduleType)}'`, [], moduleType));
        }
        if (meta.entryComponents) {
            entryComponents.push(...flattenAndDedupeArray(meta.entryComponents)
                .map(type => this._getEntryComponentMetadata(type)));
        }
        if (meta.bootstrap) {
            flattenAndDedupeArray(meta.bootstrap).forEach(type => {
                if (!isValidType(type)) {
                    this._reportError(syntaxError(`Unexpected value '${stringifyType(type)}' used in the bootstrap property of module '${stringifyType(moduleType)}'`), moduleType);
                    return;
                }
                bootstrapComponents.push(this._getIdentifierMetadata(type));
            });
        }
        entryComponents.push(...bootstrapComponents.map(type => this._getEntryComponentMetadata(type.reference)));
        if (meta.schemas) {
            schemas.push(...flattenAndDedupeArray(meta.schemas));
        }
        compileMeta = new cpl.CompileNgModuleMetadata({
            type: this._getTypeMetadata(moduleType),
            providers,
            entryComponents,
            bootstrapComponents,
            schemas,
            declaredDirectives,
            exportedDirectives,
            declaredPipes,
            exportedPipes,
            importedModules,
            exportedModules,
            transitiveModule,
            id: meta.id || null,
        });
        entryComponents.forEach((id) => transitiveModule.addEntryComponent(id));
        providers.forEach((provider) => transitiveModule.addProvider(provider, compileMeta.type));
        transitiveModule.addModule(compileMeta.type);
        this._ngModuleCache.set(moduleType, compileMeta);
        return compileMeta;
    }
    _checkSelfImport(moduleType, importedModuleType) {
        if (moduleType === importedModuleType) {
            this._reportError(syntaxError(`'${stringifyType(moduleType)}' module can't import itself`), moduleType);
            return true;
        }
        return false;
    }
    _getTypeDescriptor(type) {
        if (isValidType(type)) {
            if (this.isDirective(type)) {
                return 'directive';
            }
            if (this.isPipe(type)) {
                return 'pipe';
            }
            if (this.isNgModule(type)) {
                return 'module';
            }
        }
        if (type.provide) {
            return 'provider';
        }
        return 'value';
    }
    _addTypeToModule(type, moduleType) {
        const oldModule = this._ngModuleOfTypes.get(type);
        if (oldModule && oldModule !== moduleType) {
            this._reportError(syntaxError(`Type ${stringifyType(type)} is part of the declarations of 2 modules: ${stringifyType(oldModule)} and ${stringifyType(moduleType)}! ` +
                `Please consider moving ${stringifyType(type)} to a higher module that imports ${stringifyType(oldModule)} and ${stringifyType(moduleType)}. ` +
                `You can also create a new NgModule that exports and includes ${stringifyType(type)} then import that NgModule in ${stringifyType(oldModule)} and ${stringifyType(moduleType)}.`), moduleType);
            return;
        }
        this._ngModuleOfTypes.set(type, moduleType);
    }
    _getTransitiveNgModuleMetadata(importedModules, exportedModules) {
        // collect `providers` / `entryComponents` from all imported and all exported modules
        const result = new cpl.TransitiveCompileNgModuleMetadata();
        const modulesByToken = new Map();
        importedModules.concat(exportedModules).forEach((modSummary) => {
            modSummary.modules.forEach((mod) => result.addModule(mod));
            modSummary.entryComponents.forEach((comp) => result.addEntryComponent(comp));
            const addedTokens = new Set();
            modSummary.providers.forEach((entry) => {
                const tokenRef = cpl.tokenReference(entry.provider.token);
                let prevModules = modulesByToken.get(tokenRef);
                if (!prevModules) {
                    prevModules = new Set();
                    modulesByToken.set(tokenRef, prevModules);
                }
                const moduleRef = entry.module.reference;
                // Note: the providers of one module may still contain multiple providers
                // per token (e.g. for multi providers), and we need to preserve these.
                if (addedTokens.has(tokenRef) || !prevModules.has(moduleRef)) {
                    prevModules.add(moduleRef);
                    addedTokens.add(tokenRef);
                    result.addProvider(entry.provider, entry.module);
                }
            });
        });
        exportedModules.forEach((modSummary) => {
            modSummary.exportedDirectives.forEach((id) => result.addExportedDirective(id));
            modSummary.exportedPipes.forEach((id) => result.addExportedPipe(id));
        });
        importedModules.forEach((modSummary) => {
            modSummary.exportedDirectives.forEach((id) => result.addDirective(id));
            modSummary.exportedPipes.forEach((id) => result.addPipe(id));
        });
        return result;
    }
    _getIdentifierMetadata(type) {
        type = resolveForwardRef(type);
        return { reference: type };
    }
    isInjectable(type) {
        const annotations = this._reflector.tryAnnotations(type);
        return annotations.some(ann => createInjectable.isTypeOf(ann));
    }
    getInjectableSummary(type) {
        return {
            summaryKind: cpl.CompileSummaryKind.Injectable,
            type: this._getTypeMetadata(type, null, false)
        };
    }
    getInjectableMetadata(type, dependencies = null, throwOnUnknownDeps = true) {
        const typeSummary = this._loadSummary(type, cpl.CompileSummaryKind.Injectable);
        const typeMetadata = typeSummary ?
            typeSummary.type :
            this._getTypeMetadata(type, dependencies, throwOnUnknownDeps);
        const annotations = this._reflector.annotations(type).filter(ann => createInjectable.isTypeOf(ann));
        if (annotations.length === 0) {
            return null;
        }
        const meta = annotations[annotations.length - 1];
        return {
            symbol: type,
            type: typeMetadata,
            providedIn: meta.providedIn,
            useValue: meta.useValue,
            useClass: meta.useClass,
            useExisting: meta.useExisting,
            useFactory: meta.useFactory,
            deps: meta.deps,
        };
    }
    _getTypeMetadata(type, dependencies = null, throwOnUnknownDeps = true) {
        const identifier = this._getIdentifierMetadata(type);
        return {
            reference: identifier.reference,
            diDeps: this._getDependenciesMetadata(identifier.reference, dependencies, throwOnUnknownDeps),
            lifecycleHooks: getAllLifecycleHooks(this._reflector, identifier.reference),
        };
    }
    _getFactoryMetadata(factory, dependencies = null) {
        factory = resolveForwardRef(factory);
        return { reference: factory, diDeps: this._getDependenciesMetadata(factory, dependencies) };
    }
    /**
     * Gets the metadata for the given pipe.
     * This assumes `loadNgModuleDirectiveAndPipeMetadata` has been called first.
     */
    getPipeMetadata(pipeType) {
        const pipeMeta = this._pipeCache.get(pipeType);
        if (!pipeMeta) {
            this._reportError(syntaxError(`Illegal state: getPipeMetadata can only be called after loadNgModuleDirectiveAndPipeMetadata for a module that declares it. Pipe ${stringifyType(pipeType)}.`), pipeType);
        }
        return pipeMeta || null;
    }
    getPipeSummary(pipeType) {
        const pipeSummary = this._loadSummary(pipeType, cpl.CompileSummaryKind.Pipe);
        if (!pipeSummary) {
            this._reportError(syntaxError(`Illegal state: Could not load the summary for pipe ${stringifyType(pipeType)}.`), pipeType);
        }
        return pipeSummary;
    }
    getOrLoadPipeMetadata(pipeType) {
        let pipeMeta = this._pipeCache.get(pipeType);
        if (!pipeMeta) {
            pipeMeta = this._loadPipeMetadata(pipeType);
        }
        return pipeMeta;
    }
    _loadPipeMetadata(pipeType) {
        pipeType = resolveForwardRef(pipeType);
        const pipeAnnotation = this._pipeResolver.resolve(pipeType);
        const pipeMeta = new cpl.CompilePipeMetadata({
            type: this._getTypeMetadata(pipeType),
            name: pipeAnnotation.name,
            pure: !!pipeAnnotation.pure
        });
        this._pipeCache.set(pipeType, pipeMeta);
        this._summaryCache.set(pipeType, pipeMeta.toSummary());
        return pipeMeta;
    }
    _getDependenciesMetadata(typeOrFunc, dependencies, throwOnUnknownDeps = true) {
        let hasUnknownDeps = false;
        const params = dependencies || this._reflector.parameters(typeOrFunc) || [];
        const dependenciesMetadata = params.map((param) => {
            let isAttribute = false;
            let isHost = false;
            let isSelf = false;
            let isSkipSelf = false;
            let isOptional = false;
            let token = null;
            if (Array.isArray(param)) {
                param.forEach((paramEntry) => {
                    if (createHost.isTypeOf(paramEntry)) {
                        isHost = true;
                    }
                    else if (createSelf.isTypeOf(paramEntry)) {
                        isSelf = true;
                    }
                    else if (createSkipSelf.isTypeOf(paramEntry)) {
                        isSkipSelf = true;
                    }
                    else if (createOptional.isTypeOf(paramEntry)) {
                        isOptional = true;
                    }
                    else if (createAttribute.isTypeOf(paramEntry)) {
                        isAttribute = true;
                        token = paramEntry.attributeName;
                    }
                    else if (createInject.isTypeOf(paramEntry)) {
                        token = paramEntry.token;
                    }
                    else if (createInjectionToken.isTypeOf(paramEntry) ||
                        paramEntry instanceof StaticSymbol) {
                        token = paramEntry;
                    }
                    else if (isValidType(paramEntry) && token == null) {
                        token = paramEntry;
                    }
                });
            }
            else {
                token = param;
            }
            if (token == null) {
                hasUnknownDeps = true;
                return {};
            }
            return {
                isAttribute,
                isHost,
                isSelf,
                isSkipSelf,
                isOptional,
                token: this._getTokenMetadata(token)
            };
        });
        if (hasUnknownDeps) {
            const depsTokens = dependenciesMetadata.map((dep) => dep.token ? stringifyType(dep.token) : '?').join(', ');
            const message = `Can't resolve all parameters for ${stringifyType(typeOrFunc)}: (${depsTokens}).`;
            if (throwOnUnknownDeps || this._config.strictInjectionParameters) {
                this._reportError(syntaxError(message), typeOrFunc);
            }
            else {
                this._console.warn(`Warning: ${message} This will become an error in Angular v6.x`);
            }
        }
        return dependenciesMetadata;
    }
    _getTokenMetadata(token) {
        token = resolveForwardRef(token);
        let compileToken;
        if (typeof token === 'string') {
            compileToken = { value: token };
        }
        else {
            compileToken = { identifier: { reference: token } };
        }
        return compileToken;
    }
    _getProvidersMetadata(providers, targetEntryComponents, debugInfo, compileProviders = [], type) {
        providers.forEach((provider, providerIdx) => {
            if (Array.isArray(provider)) {
                this._getProvidersMetadata(provider, targetEntryComponents, debugInfo, compileProviders);
            }
            else {
                provider = resolveForwardRef(provider);
                let providerMeta = undefined;
                if (provider && typeof provider === 'object' && provider.hasOwnProperty('provide')) {
                    this._validateProvider(provider);
                    providerMeta = new cpl.ProviderMeta(provider.provide, provider);
                }
                else if (isValidType(provider)) {
                    providerMeta = new cpl.ProviderMeta(provider, { useClass: provider });
                }
                else if (provider === void 0) {
                    this._reportError(syntaxError(`Encountered undefined provider! Usually this means you have a circular dependencies. This might be caused by using 'barrel' index.ts files.`));
                    return;
                }
                else {
                    const providersInfo = providers
                        .reduce((soFar, seenProvider, seenProviderIdx) => {
                        if (seenProviderIdx < providerIdx) {
                            soFar.push(`${stringifyType(seenProvider)}`);
                        }
                        else if (seenProviderIdx == providerIdx) {
                            soFar.push(`?${stringifyType(seenProvider)}?`);
                        }
                        else if (seenProviderIdx == providerIdx + 1) {
                            soFar.push('...');
                        }
                        return soFar;
                    }, [])
                        .join(', ');
                    this._reportError(syntaxError(`Invalid ${debugInfo ? debugInfo : 'provider'} - only instances of Provider and Type are allowed, got: [${providersInfo}]`), type);
                    return;
                }
                if (providerMeta.token ===
                    this._reflector.resolveExternalReference(Identifiers.ANALYZE_FOR_ENTRY_COMPONENTS)) {
                    targetEntryComponents.push(...this._getEntryComponentsFromProvider(providerMeta, type));
                }
                else {
                    compileProviders.push(this.getProviderMetadata(providerMeta));
                }
            }
        });
        return compileProviders;
    }
    _validateProvider(provider) {
        if (provider.hasOwnProperty('useClass') && provider.useClass == null) {
            this._reportError(syntaxError(`Invalid provider for ${stringifyType(provider.provide)}. useClass cannot be ${provider.useClass}.
           Usually it happens when:
           1. There's a circular dependency (might be caused by using index.ts (barrel) files).
           2. Class was used before it was declared. Use forwardRef in this case.`));
        }
    }
    _getEntryComponentsFromProvider(provider, type) {
        const components = [];
        const collectedIdentifiers = [];
        if (provider.useFactory || provider.useExisting || provider.useClass) {
            this._reportError(syntaxError(`The ANALYZE_FOR_ENTRY_COMPONENTS token only supports useValue!`), type);
            return [];
        }
        if (!provider.multi) {
            this._reportError(syntaxError(`The ANALYZE_FOR_ENTRY_COMPONENTS token only supports 'multi = true'!`), type);
            return [];
        }
        extractIdentifiers(provider.useValue, collectedIdentifiers);
        collectedIdentifiers.forEach((identifier) => {
            const entry = this._getEntryComponentMetadata(identifier.reference, false);
            if (entry) {
                components.push(entry);
            }
        });
        return components;
    }
    _getEntryComponentMetadata(dirType, throwIfNotFound = true) {
        const dirMeta = this.getNonNormalizedDirectiveMetadata(dirType);
        if (dirMeta && dirMeta.metadata.isComponent) {
            return { componentType: dirType, componentFactory: dirMeta.metadata.componentFactory };
        }
        const dirSummary = this._loadSummary(dirType, cpl.CompileSummaryKind.Directive);
        if (dirSummary && dirSummary.isComponent) {
            return { componentType: dirType, componentFactory: dirSummary.componentFactory };
        }
        if (throwIfNotFound) {
            throw syntaxError(`${dirType.name} cannot be used as an entry component.`);
        }
        return null;
    }
    _getInjectableTypeMetadata(type, dependencies = null) {
        const typeSummary = this._loadSummary(type, cpl.CompileSummaryKind.Injectable);
        if (typeSummary) {
            return typeSummary.type;
        }
        return this._getTypeMetadata(type, dependencies);
    }
    getProviderMetadata(provider) {
        let compileDeps = undefined;
        let compileTypeMetadata = null;
        let compileFactoryMetadata = null;
        let token = this._getTokenMetadata(provider.token);
        if (provider.useClass) {
            compileTypeMetadata =
                this._getInjectableTypeMetadata(provider.useClass, provider.dependencies);
            compileDeps = compileTypeMetadata.diDeps;
            if (provider.token === provider.useClass) {
                // use the compileTypeMetadata as it contains information about lifecycleHooks...
                token = { identifier: compileTypeMetadata };
            }
        }
        else if (provider.useFactory) {
            compileFactoryMetadata = this._getFactoryMetadata(provider.useFactory, provider.dependencies);
            compileDeps = compileFactoryMetadata.diDeps;
        }
        return {
            token: token,
            useClass: compileTypeMetadata,
            useValue: provider.useValue,
            useFactory: compileFactoryMetadata,
            useExisting: provider.useExisting ? this._getTokenMetadata(provider.useExisting) : undefined,
            deps: compileDeps,
            multi: provider.multi
        };
    }
    _getQueriesMetadata(queries, isViewQuery, directiveType) {
        const res = [];
        Object.keys(queries).forEach((propertyName) => {
            const query = queries[propertyName];
            if (query.isViewQuery === isViewQuery) {
                res.push(this._getQueryMetadata(query, propertyName, directiveType));
            }
        });
        return res;
    }
    _queryVarBindings(selector) { return selector.split(/\s*,\s*/); }
    _getQueryMetadata(q, propertyName, typeOrFunc) {
        let selectors;
        if (typeof q.selector === 'string') {
            selectors =
                this._queryVarBindings(q.selector).map(varName => this._getTokenMetadata(varName));
        }
        else {
            if (!q.selector) {
                this._reportError(syntaxError(`Can't construct a query for the property "${propertyName}" of "${stringifyType(typeOrFunc)}" since the query selector wasn't defined.`), typeOrFunc);
                selectors = [];
            }
            else {
                selectors = [this._getTokenMetadata(q.selector)];
            }
        }
        return {
            selectors,
            first: q.first,
            descendants: q.descendants, propertyName,
            read: q.read ? this._getTokenMetadata(q.read) : null,
            static: q.static
        };
    }
    _reportError(error, type, otherType) {
        if (this._errorCollector) {
            this._errorCollector(error, type);
            if (otherType) {
                this._errorCollector(error, otherType);
            }
        }
        else {
            throw error;
        }
    }
}
function flattenArray(tree, out = []) {
    if (tree) {
        for (let i = 0; i < tree.length; i++) {
            const item = resolveForwardRef(tree[i]);
            if (Array.isArray(item)) {
                flattenArray(item, out);
            }
            else {
                out.push(item);
            }
        }
    }
    return out;
}
function dedupeArray(array) {
    if (array) {
        return Array.from(new Set(array));
    }
    return [];
}
function flattenAndDedupeArray(tree) {
    return dedupeArray(flattenArray(tree));
}
function isValidType(value) {
    return (value instanceof StaticSymbol) || (value instanceof Type);
}
function extractIdentifiers(value, targetIdentifiers) {
    visitValue(value, new _CompileValueConverter(), targetIdentifiers);
}
class _CompileValueConverter extends ValueTransformer {
    visitOther(value, targetIdentifiers) {
        targetIdentifiers.push({ reference: value });
    }
}
function stringifyType(type) {
    if (type instanceof StaticSymbol) {
        return `${type.name} in ${type.filePath}`;
    }
    else {
        return stringify(type);
    }
}
/**
 * Indicates that a component is still being loaded in a synchronous compile.
 */
function componentStillLoadingError(compType) {
    const error = Error(`Can't compile synchronously as ${stringify(compType)} is still being loaded!`);
    error[ERROR_COMPONENT_TYPE] = compType;
    return error;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGFfcmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvbWV0YWRhdGFfcmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBb0IsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRSxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDN0MsT0FBTyxFQUFDLG9CQUFvQixFQUFFLDBCQUEwQixFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzlFLE9BQU8sS0FBSyxHQUFHLE1BQU0sb0JBQW9CLENBQUM7QUFHMUMsT0FBTyxFQUFDLHVCQUF1QixFQUEwRixJQUFJLEVBQUUsaUJBQWlCLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUVoVSxPQUFPLEVBQW9CLFFBQVEsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ2pFLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDMUMsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFLM0QsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUV2QyxPQUFPLEVBQVUsU0FBUyxFQUFFLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFJM0ksTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQUcsaUJBQWlCLENBQUM7QUFFdEQsZ0JBQWdCO0FBQ2hCLGtDQUFrQztBQUNsQywyREFBMkQ7QUFDM0QsOENBQThDO0FBQzlDLDZEQUE2RDtBQUM3RCw2REFBNkQ7QUFDN0QsdUJBQXVCO0FBQ3ZCLE1BQU0sT0FBTyx1QkFBdUI7SUFVbEMsWUFDWSxPQUF1QixFQUFVLFdBQXVCLEVBQ3hELGlCQUFtQyxFQUFVLGtCQUFxQyxFQUNsRixhQUEyQixFQUFVLGdCQUFzQyxFQUMzRSxlQUFzQyxFQUN0QyxvQkFBeUMsRUFBVSxRQUFpQixFQUNwRSxrQkFBcUMsRUFBVSxVQUE0QixFQUMzRSxlQUFnQztRQU5oQyxZQUFPLEdBQVAsT0FBTyxDQUFnQjtRQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFZO1FBQ3hELHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7UUFBVSx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW1CO1FBQ2xGLGtCQUFhLEdBQWIsYUFBYSxDQUFjO1FBQVUscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFzQjtRQUMzRSxvQkFBZSxHQUFmLGVBQWUsQ0FBdUI7UUFDdEMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFxQjtRQUFVLGFBQVEsR0FBUixRQUFRLENBQVM7UUFDcEUsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFtQjtRQUFVLGVBQVUsR0FBVixVQUFVLENBQWtCO1FBQzNFLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtRQWhCcEMsaUNBQTRCLEdBQ2hDLElBQUksR0FBRyxFQUF5RSxDQUFDO1FBQzdFLG9CQUFlLEdBQUcsSUFBSSxHQUFHLEVBQXNDLENBQUM7UUFDaEUsa0JBQWEsR0FBRyxJQUFJLEdBQUcsRUFBcUMsQ0FBQztRQUM3RCxlQUFVLEdBQUcsSUFBSSxHQUFHLEVBQWlDLENBQUM7UUFDdEQsbUJBQWMsR0FBRyxJQUFJLEdBQUcsRUFBcUMsQ0FBQztRQUM5RCxxQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBYyxDQUFDO1FBQ3pDLHdCQUFtQixHQUFHLElBQUksR0FBRyxFQUEwQyxDQUFDO0lBU2pDLENBQUM7SUFFaEQsWUFBWSxLQUF1QixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBRTVELGFBQWEsQ0FBQyxJQUFVO1FBQ3RCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9DLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQyxvRUFBb0U7UUFDcEUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM1QixJQUFJLE9BQU8sRUFBRTtZQUNYLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDbEQ7SUFDSCxDQUFDO0lBRUQsVUFBVTtRQUNSLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLDRCQUE0QixDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzFDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzVCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsb0JBQW9CLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDekMsQ0FBQztJQUVPLGlCQUFpQixDQUFDLFFBQWEsRUFBRSxJQUFZO1FBQ25ELElBQUksUUFBUSxHQUFRLElBQUksQ0FBQztRQUN6QixNQUFNLFVBQVUsR0FBd0I7WUFDdEMsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDYixNQUFNLElBQUksS0FBSyxDQUNYLHdCQUF3QixJQUFJLGFBQWEsU0FBUyxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO2FBQzFGO1lBQ0QsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN6QyxDQUFDLENBQUM7UUFDRixVQUFVLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDN0IsUUFBUSxHQUFHLENBQUMsQ0FBQztZQUNQLFVBQVcsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUM1QyxDQUFDLENBQUM7UUFDRixnQ0FBZ0M7UUFDMUIsVUFBVyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7UUFDeEMsT0FBTyxVQUFVLENBQUM7SUFDcEIsQ0FBQztJQUVPLGlCQUFpQixDQUFDLE9BQVksRUFBRSxJQUFZO1FBQ2xELElBQUksT0FBTyxZQUFZLFlBQVksRUFBRTtZQUNuQyxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQy9FO2FBQU07WUFDTCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDOUM7SUFDSCxDQUFDO0lBRU8scUJBQXFCLENBQUMsT0FBWTtRQUN4QyxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4RSxDQUFDO0lBRUQseUJBQXlCLENBQUMsT0FBWTtRQUNwQyxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUVELG9CQUFvQixDQUFDLE9BQVk7UUFDL0IsTUFBTSxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsY0FBYyxDQUFDLEVBQUMsU0FBUyxFQUFFLE9BQU8sRUFBQyxDQUFDLE9BQU8sQ0FBQztRQUNoRSxJQUFJLE9BQU8sWUFBWSxZQUFZLEVBQUU7WUFDbkMsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDNUQ7UUFFRCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVPLGVBQWUsQ0FBQyxPQUFZO1FBQ2xDLElBQUksT0FBTyxZQUFZLFlBQVksRUFBRTtZQUNuQyxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQzlCLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUN6RTthQUFNO1lBQ0wsZ0NBQWdDO1lBQ2hDLGlEQUFpRDtZQUNqRCxPQUFZLEVBQUUsQ0FBQztTQUNoQjtJQUNILENBQUM7SUFFTyxtQkFBbUIsQ0FDdkIsUUFBZ0IsRUFBRSxPQUFZLEVBQUUsTUFBb0MsRUFDcEUsT0FBZ0M7UUFDbEMsSUFBSSxPQUFPLFlBQVksWUFBWSxFQUFFO1lBQ25DLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FDOUIsaUJBQWlCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQzdFO2FBQU07WUFDTCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDekQscUVBQXFFO1lBQ3JFLFVBQVU7WUFDVixNQUFNLHNCQUFzQixHQUN4QixJQUFJLENBQUMsVUFBVSxDQUFDLHdCQUF3QixDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQ2pGLE9BQU8sc0JBQXNCLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBTyxRQUFRLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztTQUN0RjtJQUNILENBQUM7SUFFTyxvQkFBb0IsQ0FBQyxPQUE0QixFQUFFLGtCQUE0QjtRQUNyRixJQUFJLENBQUMsQ0FBQyxPQUFPLFlBQVksWUFBWSxDQUFDLEVBQUU7WUFDckMsT0FBZSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLGtCQUFrQixDQUFDLENBQUM7U0FDakU7SUFDSCxDQUFDO0lBRU8sWUFBWSxDQUFDLElBQVMsRUFBRSxJQUE0QjtRQUMxRCxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2hCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0QsV0FBVyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzVDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxXQUFXLElBQUksSUFBSSxDQUFDLENBQUM7U0FDbkQ7UUFDRCxPQUFPLFdBQVcsSUFBSSxXQUFXLENBQUMsV0FBVyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDOUUsQ0FBQztJQUVELHdCQUF3QixDQUNwQixRQUFzQyxFQUN0QyxZQUEwQztRQUM1QyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNwRSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ2pCLFlBQVksR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDekQ7UUFDRCxvRkFBb0Y7UUFDcEYsZ0RBQWdEO1FBQ2hELE1BQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLDBCQUEwQixFQUFFLENBQUM7UUFDeEYsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUM5RCxPQUFPLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUM7WUFDekMsTUFBTSxFQUFFLElBQUk7WUFDWixJQUFJLEVBQUUsRUFBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsY0FBYyxFQUFFLEVBQUUsRUFBQztZQUMzRCxRQUFRLEVBQUUsSUFBSSxHQUFHLENBQUMsdUJBQXVCLENBQUM7Z0JBQ3hDLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO2dCQUNyQyxRQUFRO2dCQUNSLFdBQVc7Z0JBQ1gsT0FBTztnQkFDUCxNQUFNLEVBQUUsRUFBRTtnQkFDVixTQUFTLEVBQUUsRUFBRTtnQkFDYixrQkFBa0IsRUFBRSxFQUFFO2dCQUN0QixVQUFVLEVBQUUsRUFBRTtnQkFDZCxRQUFRLEVBQUUsSUFBSTtnQkFDZCxtQkFBbUIsRUFBRSxFQUFFO2dCQUN2QixhQUFhLEVBQUUsSUFBSTtnQkFDbkIsbUJBQW1CLEVBQUUsS0FBSzthQUMzQixDQUFDO1lBQ0YsUUFBUSxFQUFFLElBQUk7WUFDZCxlQUFlLEVBQUUsdUJBQXVCLENBQUMsT0FBTztZQUNoRCxrQkFBa0IsRUFBRSxFQUFFO1lBQ3RCLE1BQU0sRUFBRSxFQUFFO1lBQ1YsT0FBTyxFQUFFLEVBQUU7WUFDWCxJQUFJLEVBQUUsRUFBRTtZQUNSLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLFFBQVEsRUFBRSxHQUFHO1lBQ2IsU0FBUyxFQUFFLEVBQUU7WUFDYixhQUFhLEVBQUUsRUFBRTtZQUNqQixPQUFPLEVBQUUsRUFBRTtZQUNYLE1BQU0sRUFBRSxFQUFFO1lBQ1YsV0FBVyxFQUFFLEVBQUU7WUFDZixpQkFBaUIsRUFBRSxZQUFZO1lBQy9CLFlBQVksRUFDUixFQUFDLEVBQUUsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQVc7WUFDM0YsZUFBZSxFQUFFLEVBQUU7WUFDbkIsZ0JBQWdCLEVBQUUsSUFBSTtTQUN2QixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQscUJBQXFCLENBQUMsWUFBaUIsRUFBRSxhQUFrQixFQUFFLE1BQWU7UUFDMUUsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsRUFBRTtZQUMzQyxPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsYUFBYSxHQUFHLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sRUFBQyxVQUFVLEVBQUUsUUFBUSxFQUFDLEdBQUcsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLGFBQWEsQ0FBRyxDQUFDO1FBRXZGLE1BQU0sdUJBQXVCLEdBQUcsQ0FBQyxnQkFBb0QsRUFBRSxFQUFFO1lBQ3ZGLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxHQUFHLENBQUMsd0JBQXdCLENBQUM7Z0JBQ3pELE1BQU0sRUFBRSxLQUFLO2dCQUNiLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSTtnQkFDbkIsV0FBVyxFQUFFLFFBQVEsQ0FBQyxXQUFXO2dCQUNqQyxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVE7Z0JBQzNCLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUTtnQkFDM0IsZUFBZSxFQUFFLFFBQVEsQ0FBQyxlQUFlO2dCQUN6QyxrQkFBa0IsRUFBRSxRQUFRLENBQUMsa0JBQWtCO2dCQUMvQyxNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU07Z0JBQ3ZCLE9BQU8sRUFBRSxRQUFRLENBQUMsT0FBTztnQkFDekIsYUFBYSxFQUFFLFFBQVEsQ0FBQyxhQUFhO2dCQUNyQyxjQUFjLEVBQUUsUUFBUSxDQUFDLGNBQWM7Z0JBQ3ZDLGNBQWMsRUFBRSxRQUFRLENBQUMsY0FBYztnQkFDdkMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxTQUFTO2dCQUM3QixhQUFhLEVBQUUsUUFBUSxDQUFDLGFBQWE7Z0JBQ3JDLE9BQU8sRUFBRSxRQUFRLENBQUMsT0FBTztnQkFDekIsTUFBTSxFQUFFLFFBQVEsQ0FBQyxNQUFNO2dCQUN2QixXQUFXLEVBQUUsUUFBUSxDQUFDLFdBQVc7Z0JBQ2pDLGVBQWUsRUFBRSxRQUFRLENBQUMsZUFBZTtnQkFDekMsaUJBQWlCLEVBQUUsUUFBUSxDQUFDLGlCQUFpQjtnQkFDN0MsWUFBWSxFQUFFLFFBQVEsQ0FBQyxZQUFZO2dCQUNuQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsZ0JBQWdCO2dCQUMzQyxRQUFRLEVBQUUsZ0JBQWdCO2FBQzNCLENBQUMsQ0FBQztZQUNILElBQUksZ0JBQWdCLEVBQUU7Z0JBQ3BCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsZ0JBQWtCLEVBQUUsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsQ0FBQzthQUM3RjtZQUNELElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQzNELElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBQ3JFLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQyxDQUFDO1FBRUYsSUFBSSxRQUFRLENBQUMsV0FBVyxFQUFFO1lBQ3hCLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFVLENBQUM7WUFDckMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGlCQUFpQixDQUFDO2dCQUMvRCxZQUFZO2dCQUNaLGFBQWEsRUFBRSxhQUFhO2dCQUM1QixTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLEVBQUUsVUFBVSxDQUFDO2dCQUN4RSxhQUFhLEVBQUUsUUFBUSxDQUFDLGFBQWE7Z0JBQ3JDLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUTtnQkFDM0IsV0FBVyxFQUFFLFFBQVEsQ0FBQyxXQUFXO2dCQUNqQyxNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU07Z0JBQ3ZCLFNBQVMsRUFBRSxRQUFRLENBQUMsU0FBUztnQkFDN0IsVUFBVSxFQUFFLFFBQVEsQ0FBQyxVQUFVO2dCQUMvQixhQUFhLEVBQUUsUUFBUSxDQUFDLGFBQWE7Z0JBQ3JDLG1CQUFtQixFQUFFLFFBQVEsQ0FBQyxtQkFBbUI7YUFDbEQsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxTQUFTLENBQUMsWUFBWSxDQUFDLElBQUksTUFBTSxFQUFFO2dCQUNyQyxJQUFJLENBQUMsWUFBWSxDQUFDLDBCQUEwQixDQUFDLGFBQWEsQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUM1RSxPQUFPLElBQUksQ0FBQzthQUNiO1lBQ0QsT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO1NBQzlEO2FBQU07WUFDTCxZQUFZO1lBQ1osdUJBQXVCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDOUIsT0FBTyxJQUFJLENBQUM7U0FDYjtJQUNILENBQUM7SUFFRCxpQ0FBaUMsQ0FBQyxhQUFrQjtRQUVsRCxhQUFhLEdBQUcsaUJBQWlCLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUNsQixPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN0RSxJQUFJLFVBQVUsRUFBRTtZQUNkLE9BQU8sVUFBVSxDQUFDO1NBQ25CO1FBQ0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdEUsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNaLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxJQUFJLDZCQUE2QixHQUFnQyxTQUFXLENBQUM7UUFFN0UsSUFBSSxlQUFlLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ3JDLFlBQVk7WUFDWixNQUFNLFFBQVEsR0FBRyxPQUFvQixDQUFDO1lBQ3RDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDaEQsb0JBQW9CLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN0RCwwQkFBMEIsQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRXBFLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUM7WUFFdkMsNkJBQTZCLEdBQUcsSUFBSSxHQUFHLENBQUMsdUJBQXVCLENBQUM7Z0JBQzlELGFBQWEsRUFBRSxXQUFXLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQztnQkFDbEQsUUFBUSxFQUFFLFdBQVcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO2dCQUN4QyxXQUFXLEVBQUUsV0FBVyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUM7Z0JBQzlDLE9BQU8sRUFBRSxJQUFJO2dCQUNiLE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTSxJQUFJLEVBQUU7Z0JBQzdCLFNBQVMsRUFBRSxRQUFRLENBQUMsU0FBUyxJQUFJLEVBQUU7Z0JBQ25DLFVBQVUsRUFBRSxVQUFVLElBQUksRUFBRTtnQkFDNUIsYUFBYSxFQUFFLFdBQVcsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDO2dCQUNsRCxRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRO2dCQUM3QixtQkFBbUIsRUFBRSxFQUFFO2dCQUN2QixrQkFBa0IsRUFBRSxFQUFFO2dCQUN0QixtQkFBbUIsRUFBRSxXQUFXLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDO2FBQzlELENBQUMsQ0FBQztTQUNKO1FBRUQsSUFBSSx1QkFBdUIsR0FBNEIsSUFBTSxDQUFDO1FBQzlELElBQUksa0JBQWtCLEdBQWEsRUFBRSxDQUFDO1FBQ3RDLElBQUksYUFBYSxHQUFrQyxFQUFFLENBQUM7UUFDdEQsSUFBSSxzQkFBc0IsR0FBd0MsRUFBRSxDQUFDO1FBQ3JFLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7UUFFaEMsSUFBSSxlQUFlLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ3JDLFlBQVk7WUFDWixNQUFNLFFBQVEsR0FBRyxPQUFvQixDQUFDO1lBQ3RDLHVCQUF1QixHQUFHLFFBQVEsQ0FBQyxlQUFpQixDQUFDO1lBQ3JELElBQUksUUFBUSxDQUFDLGtCQUFrQixFQUFFO2dCQUMvQixrQkFBa0IsR0FBRyxRQUFRLENBQUMsa0JBQWtCLENBQUM7YUFDbEQ7WUFDRCxJQUFJLFFBQVEsQ0FBQyxhQUFhLEVBQUU7Z0JBQzFCLGFBQWEsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQ3RDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsc0JBQXNCLEVBQzlDLHNCQUFzQixhQUFhLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7YUFDL0U7WUFDRCxJQUFJLFFBQVEsQ0FBQyxlQUFlLEVBQUU7Z0JBQzVCLHNCQUFzQixHQUFHLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUM7cUJBQzFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBRyxDQUFDO3FCQUN0RCxNQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQzthQUM5RDtZQUNELElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2IsUUFBUSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsOEJBQThCLEVBQUUsQ0FBQzthQUNsRTtTQUNGO2FBQU07WUFDTCxZQUFZO1lBQ1osSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDYixRQUFRLEdBQUcsSUFBTSxDQUFDO2FBQ25CO1NBQ0Y7UUFFRCxJQUFJLFNBQVMsR0FBa0MsRUFBRSxDQUFDO1FBQ2xELElBQUksT0FBTyxDQUFDLFNBQVMsSUFBSSxJQUFJLEVBQUU7WUFDN0IsU0FBUyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FDbEMsT0FBTyxDQUFDLFNBQVMsRUFBRSxzQkFBc0IsRUFDekMsa0JBQWtCLGFBQWEsQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztTQUMzRTtRQUNELElBQUksT0FBTyxHQUErQixFQUFFLENBQUM7UUFDN0MsSUFBSSxXQUFXLEdBQStCLEVBQUUsQ0FBQztRQUNqRCxJQUFJLE9BQU8sQ0FBQyxPQUFPLElBQUksSUFBSSxFQUFFO1lBQzNCLE9BQU8sR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDMUUsV0FBVyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxhQUFhLENBQUMsQ0FBQztTQUM5RTtRQUVELE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUM7WUFDbkQsTUFBTSxFQUFFLEtBQUs7WUFDYixRQUFRLEVBQUUsUUFBUTtZQUNsQixRQUFRLEVBQUUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7WUFDdkMsV0FBVyxFQUFFLENBQUMsQ0FBQyw2QkFBNkI7WUFDNUMsSUFBSSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUM7WUFDMUMsUUFBUSxFQUFFLDZCQUE2QjtZQUN2QyxlQUFlLEVBQUUsdUJBQXVCO1lBQ3hDLGtCQUFrQixFQUFFLGtCQUFrQjtZQUN0QyxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sSUFBSSxFQUFFO1lBQzVCLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTyxJQUFJLEVBQUU7WUFDOUIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLElBQUksRUFBRTtZQUN4QixTQUFTLEVBQUUsU0FBUyxJQUFJLEVBQUU7WUFDMUIsYUFBYSxFQUFFLGFBQWEsSUFBSSxFQUFFO1lBQ2xDLE9BQU8sRUFBRSxPQUFPLElBQUksRUFBRTtZQUN0QixNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sSUFBSSxFQUFFO1lBQzVCLFdBQVcsRUFBRSxXQUFXLElBQUksRUFBRTtZQUM5QixlQUFlLEVBQUUsc0JBQXNCO1lBQ3ZDLGlCQUFpQixFQUFFLDZCQUE2QixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztnQkFDM0MsSUFBSTtZQUN2RCxZQUFZLEVBQUUsNkJBQTZCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7WUFDeEYsZ0JBQWdCLEVBQUUsSUFBSTtTQUN2QixDQUFDLENBQUM7UUFDSCxJQUFJLDZCQUE2QixFQUFFO1lBQ2pDLFFBQVEsQ0FBQyxnQkFBZ0I7Z0JBQ3JCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsYUFBYSxFQUFFLFFBQVEsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzFGO1FBQ0QsVUFBVSxHQUFHLEVBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsNEJBQTRCLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNqRSxPQUFPLFVBQVUsQ0FBQztJQUNwQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsb0JBQW9CLENBQUMsYUFBa0I7UUFDckMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFHLENBQUM7UUFDMUQsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNaLElBQUksQ0FBQyxZQUFZLENBQ2IsV0FBVyxDQUNQLDhJQUE4SSxhQUFhLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxFQUNsTCxhQUFhLENBQUMsQ0FBQztTQUNwQjtRQUNELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxPQUFZO1FBQzlCLE1BQU0sVUFBVSxHQUNpQixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDOUYsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNmLElBQUksQ0FBQyxZQUFZLENBQ2IsV0FBVyxDQUNQLDJEQUEyRCxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUN6RixPQUFPLENBQUMsQ0FBQztTQUNkO1FBQ0QsT0FBTyxVQUFVLENBQUM7SUFDcEIsQ0FBQztJQUVELFdBQVcsQ0FBQyxJQUFTO1FBQ25CLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUM7WUFDOUQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQsbUJBQW1CLENBQUMsSUFBUztRQUMzQixNQUFNLE9BQU8sR0FDVCxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFnQyxDQUFDO1FBQzdGLElBQUksT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRTtZQUNuQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztTQUMxQjtRQUVELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzFELElBQUksSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMzQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztTQUN2QjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELE1BQU0sQ0FBQyxJQUFTO1FBQ2QsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQztZQUN6RCxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRUQsVUFBVSxDQUFDLElBQVM7UUFDbEIsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQztZQUM3RCxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRCxrQkFBa0IsQ0FBQyxVQUFlLEVBQUUsb0JBQW1DLElBQUk7UUFFekUsSUFBSSxhQUFhLEdBQ2UsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9GLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDbEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUNsRixhQUFhLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUMzRCxJQUFJLGFBQWEsRUFBRTtnQkFDakIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQyxDQUFDO2FBQ25EO1NBQ0Y7UUFDRCxPQUFPLGFBQWEsQ0FBQztJQUN2QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxvQ0FBb0MsQ0FBQyxVQUFlLEVBQUUsTUFBZSxFQUFFLGVBQWUsR0FBRyxJQUFJO1FBRTNGLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDdkUsTUFBTSxPQUFPLEdBQW1CLEVBQUUsQ0FBQztRQUNuQyxJQUFJLFFBQVEsRUFBRTtZQUNaLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRTtnQkFDekMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUM3RSxJQUFJLE9BQU8sRUFBRTtvQkFDWCxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUN2QjtZQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0gsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztTQUM5RTtRQUNELE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRUQsd0JBQXdCLENBQUMsVUFBZTtRQUN0QyxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzNELElBQUksV0FBVyxFQUFFO1lBQ2YsT0FBTyxXQUFXLENBQUM7U0FDcEI7UUFFRCxNQUFNLFlBQVksR0FDZCxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsRUFBRSxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFdEYsV0FBVyxHQUFHO1lBQ1osSUFBSSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUM7WUFDdkMsVUFBVSxFQUFFLFlBQVksQ0FBQyxPQUFPO1lBQ2hDLFVBQVUsRUFBRSxZQUFZLENBQUMsT0FBTztZQUNoQyxZQUFZLEVBQUUsWUFBWSxDQUFDLFNBQVM7U0FDckMsQ0FBQztRQUVGLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3RELE9BQU8sV0FBVyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxtQkFBbUIsQ0FDZixVQUFlLEVBQUUsZUFBZSxHQUFHLElBQUksRUFDdkMsb0JBQW1DLElBQUk7UUFDekMsVUFBVSxHQUFHLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzNDLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3RELElBQUksV0FBVyxFQUFFO1lBQ2YsT0FBTyxXQUFXLENBQUM7U0FDcEI7UUFDRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUN6RSxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1QsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELE1BQU0sa0JBQWtCLEdBQW9DLEVBQUUsQ0FBQztRQUMvRCxNQUFNLDRCQUE0QixHQUFvQyxFQUFFLENBQUM7UUFDekUsTUFBTSxhQUFhLEdBQW9DLEVBQUUsQ0FBQztRQUMxRCxNQUFNLGVBQWUsR0FBaUMsRUFBRSxDQUFDO1FBQ3pELE1BQU0sZUFBZSxHQUFpQyxFQUFFLENBQUM7UUFDekQsTUFBTSxTQUFTLEdBQWtDLEVBQUUsQ0FBQztRQUNwRCxNQUFNLGVBQWUsR0FBd0MsRUFBRSxDQUFDO1FBQ2hFLE1BQU0sbUJBQW1CLEdBQW9DLEVBQUUsQ0FBQztRQUNoRSxNQUFNLE9BQU8sR0FBcUIsRUFBRSxDQUFDO1FBRXJDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNoQixxQkFBcUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsWUFBWSxFQUFFLEVBQUU7Z0JBQzNELElBQUksa0JBQWtCLEdBQVMsU0FBVyxDQUFDO2dCQUMzQyxJQUFJLFdBQVcsQ0FBQyxZQUFZLENBQUMsRUFBRTtvQkFDN0Isa0JBQWtCLEdBQUcsWUFBWSxDQUFDO2lCQUNuQztxQkFBTSxJQUFJLFlBQVksSUFBSSxZQUFZLENBQUMsUUFBUSxFQUFFO29CQUNoRCxNQUFNLG1CQUFtQixHQUF3QixZQUFZLENBQUM7b0JBQzlELGtCQUFrQixHQUFHLG1CQUFtQixDQUFDLFFBQVEsQ0FBQztvQkFDbEQsSUFBSSxtQkFBbUIsQ0FBQyxTQUFTLEVBQUU7d0JBQ2pDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQ3hDLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxlQUFlLEVBQzlDLDhCQUE4QixhQUFhLENBQUMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFDdEUsWUFBWSxDQUFDLENBQUMsQ0FBQztxQkFDcEI7aUJBQ0Y7Z0JBRUQsSUFBSSxrQkFBa0IsRUFBRTtvQkFDdEIsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLGtCQUFrQixDQUFDO3dCQUFFLE9BQU87b0JBQ2xFLElBQUksQ0FBQyxpQkFBaUI7d0JBQUUsaUJBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztvQkFDdEQsSUFBSSxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsRUFBRTt3QkFDN0MsSUFBSSxDQUFDLFlBQVksQ0FDYixXQUFXLENBQ1AsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsa0JBQWtCLENBQUMsS0FBSyxhQUFhLENBQUMsWUFBWSxDQUFDLDRDQUE0QyxhQUFhLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUM1SixVQUFVLENBQUMsQ0FBQzt3QkFDaEIsT0FBTztxQkFDUjtvQkFDRCxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztvQkFDMUMsTUFBTSxxQkFBcUIsR0FDdkIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGtCQUFrQixFQUFFLGlCQUFpQixDQUFDLENBQUM7b0JBQ25FLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO29CQUM3QyxJQUFJLENBQUMscUJBQXFCLEVBQUU7d0JBQzFCLElBQUksQ0FBQyxZQUFZLENBQ2IsV0FBVyxDQUNQLGNBQWMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxLQUFLLGFBQWEsQ0FBQyxZQUFZLENBQUMsNkJBQTZCLGFBQWEsQ0FBQyxVQUFVLENBQUMsdUNBQXVDLENBQUMsRUFDckwsVUFBVSxDQUFDLENBQUM7d0JBQ2hCLE9BQU87cUJBQ1I7b0JBQ0QsZUFBZSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2lCQUM3QztxQkFBTTtvQkFDTCxJQUFJLENBQUMsWUFBWSxDQUNiLFdBQVcsQ0FDUCxxQkFBcUIsYUFBYSxDQUFDLFlBQVksQ0FBQyw2QkFBNkIsYUFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFDOUcsVUFBVSxDQUFDLENBQUM7b0JBQ2hCLE9BQU87aUJBQ1I7WUFDSCxDQUFDLENBQUMsQ0FBQztTQUNKO1FBRUQsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2hCLHFCQUFxQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxZQUFZLEVBQUUsRUFBRTtnQkFDM0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsRUFBRTtvQkFDOUIsSUFBSSxDQUFDLFlBQVksQ0FDYixXQUFXLENBQ1AscUJBQXFCLGFBQWEsQ0FBQyxZQUFZLENBQUMsNkJBQTZCLGFBQWEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQzlHLFVBQVUsQ0FBQyxDQUFDO29CQUNoQixPQUFPO2lCQUNSO2dCQUNELElBQUksQ0FBQyxpQkFBaUI7b0JBQUUsaUJBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDdEQsSUFBSSxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUU7b0JBQ3ZDLElBQUksQ0FBQyxZQUFZLENBQ2IsV0FBVyxDQUNQLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxLQUFLLFNBQVMsQ0FBQyxZQUFZLENBQUMsNENBQTRDLGFBQWEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQ2pKLFVBQVUsQ0FBQyxDQUFDO29CQUNoQixPQUFPO2lCQUNSO2dCQUNELGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDcEMsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxFQUFFLGlCQUFpQixDQUFDLENBQUM7Z0JBQ3ZGLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDdkMsSUFBSSxxQkFBcUIsRUFBRTtvQkFDekIsZUFBZSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2lCQUM3QztxQkFBTTtvQkFDTCw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7aUJBQzlFO1lBQ0gsQ0FBQyxDQUFDLENBQUM7U0FDSjtRQUVELG1EQUFtRDtRQUNuRCxxQ0FBcUM7UUFDckMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsOEJBQThCLENBQUMsZUFBZSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQy9GLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNyQixxQkFBcUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsWUFBWSxFQUFFLEVBQUU7Z0JBQ2hFLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLEVBQUU7b0JBQzlCLElBQUksQ0FBQyxZQUFZLENBQ2IsV0FBVyxDQUNQLHFCQUFxQixhQUFhLENBQUMsWUFBWSxDQUFDLDZCQUE2QixhQUFhLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUM5RyxVQUFVLENBQUMsQ0FBQztvQkFDaEIsT0FBTztpQkFDUjtnQkFDRCxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDckUsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxFQUFFO29CQUNsQyxJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsRUFBRTt3QkFDMUMsSUFBSSxDQUFDLFlBQVksQ0FDYixXQUFXLENBQ1AsYUFBYSxhQUFhLENBQUMsWUFBWSxDQUFDLGtDQUFrQyxDQUFDLEVBQy9FLFlBQVksQ0FBQyxDQUFDO3FCQUNuQjtvQkFDRCxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsQ0FBQztvQkFDbEQsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7b0JBQzVDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7aUJBQ2pEO3FCQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRTtvQkFDcEMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7b0JBQzdDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztvQkFDaEQsYUFBYSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO29CQUN2QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2lCQUNqRDtxQkFBTTtvQkFDTCxJQUFJLENBQUMsWUFBWSxDQUNiLFdBQVcsQ0FDUCxjQUFjLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsS0FBSyxhQUFhLENBQUMsWUFBWSxDQUFDLDZCQUE2QixhQUFhLENBQUMsVUFBVSxDQUFDLHlEQUF5RCxDQUFDLEVBQ3ZNLFVBQVUsQ0FBQyxDQUFDO29CQUNoQixPQUFPO2lCQUNSO1lBQ0gsQ0FBQyxDQUFDLENBQUM7U0FDSjtRQUVELE1BQU0sa0JBQWtCLEdBQW9DLEVBQUUsQ0FBQztRQUMvRCxNQUFNLGFBQWEsR0FBb0MsRUFBRSxDQUFDO1FBQzFELDRCQUE0QixDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQ2xELElBQUksZ0JBQWdCLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQzVELGtCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDcEMsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDbkQ7aUJBQU0sSUFBSSxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDOUQsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDL0IsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQzlDO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxZQUFZLENBQ2IsV0FBVyxDQUNQLGdCQUFnQixJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsYUFBYSxDQUFDLFVBQVUsQ0FBQywyQ0FBMkMsQ0FBQyxFQUN0TCxVQUFVLENBQUMsQ0FBQztnQkFDaEIsT0FBTzthQUNSO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCw4Q0FBOEM7UUFDOUMsOERBQThEO1FBQzlELElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNsQixTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUN4QyxJQUFJLENBQUMsU0FBUyxFQUFFLGVBQWUsRUFDL0IsOEJBQThCLGFBQWEsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1NBQ2xGO1FBRUQsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3hCLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDO2lCQUN6QyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ2pGO1FBRUQsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2xCLHFCQUFxQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ25ELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ3RCLElBQUksQ0FBQyxZQUFZLENBQ2IsV0FBVyxDQUNQLHFCQUFxQixhQUFhLENBQUMsSUFBSSxDQUFDLCtDQUErQyxhQUFhLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUN4SCxVQUFVLENBQUMsQ0FBQztvQkFDaEIsT0FBTztpQkFDUjtnQkFDRCxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDOUQsQ0FBQyxDQUFDLENBQUM7U0FDSjtRQUVELGVBQWUsQ0FBQyxJQUFJLENBQ2hCLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUcsQ0FBQyxDQUFDLENBQUM7UUFFM0YsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUN0RDtRQUVELFdBQVcsR0FBRyxJQUFJLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQztZQUM1QyxJQUFJLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQztZQUN2QyxTQUFTO1lBQ1QsZUFBZTtZQUNmLG1CQUFtQjtZQUNuQixPQUFPO1lBQ1Asa0JBQWtCO1lBQ2xCLGtCQUFrQjtZQUNsQixhQUFhO1lBQ2IsYUFBYTtZQUNiLGVBQWU7WUFDZixlQUFlO1lBQ2YsZ0JBQWdCO1lBQ2hCLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxJQUFJLElBQUk7U0FDcEIsQ0FBQyxDQUFDO1FBRUgsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN4RSxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLFdBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzVGLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ2pELE9BQU8sV0FBVyxDQUFDO0lBQ3JCLENBQUM7SUFFTyxnQkFBZ0IsQ0FBQyxVQUFnQixFQUFFLGtCQUF3QjtRQUNqRSxJQUFJLFVBQVUsS0FBSyxrQkFBa0IsRUFBRTtZQUNyQyxJQUFJLENBQUMsWUFBWSxDQUNiLFdBQVcsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxVQUFVLENBQUMsOEJBQThCLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUMxRixPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRU8sa0JBQWtCLENBQUMsSUFBVTtRQUNuQyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNyQixJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzFCLE9BQU8sV0FBVyxDQUFDO2FBQ3BCO1lBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNyQixPQUFPLE1BQU0sQ0FBQzthQUNmO1lBRUQsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN6QixPQUFPLFFBQVEsQ0FBQzthQUNqQjtTQUNGO1FBRUQsSUFBSyxJQUFZLENBQUMsT0FBTyxFQUFFO1lBQ3pCLE9BQU8sVUFBVSxDQUFDO1NBQ25CO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQUdPLGdCQUFnQixDQUFDLElBQVUsRUFBRSxVQUFnQjtRQUNuRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xELElBQUksU0FBUyxJQUFJLFNBQVMsS0FBSyxVQUFVLEVBQUU7WUFDekMsSUFBSSxDQUFDLFlBQVksQ0FDYixXQUFXLENBQ1AsUUFBUSxhQUFhLENBQUMsSUFBSSxDQUFDLDhDQUE4QyxhQUFhLENBQUMsU0FBUyxDQUFDLFFBQVEsYUFBYSxDQUFDLFVBQVUsQ0FBQyxJQUFJO2dCQUN0SSwwQkFBMEIsYUFBYSxDQUFDLElBQUksQ0FBQyxvQ0FBb0MsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUFRLGFBQWEsQ0FBQyxVQUFVLENBQUMsSUFBSTtnQkFDOUksZ0VBQWdFLGFBQWEsQ0FBQyxJQUFJLENBQUMsaUNBQWlDLGFBQWEsQ0FBQyxTQUFTLENBQUMsUUFBUSxhQUFhLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUNyTCxVQUFVLENBQUMsQ0FBQztZQUNoQixPQUFPO1NBQ1I7UUFDRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRU8sOEJBQThCLENBQ2xDLGVBQTZDLEVBQzdDLGVBQTZDO1FBQy9DLHFGQUFxRjtRQUNyRixNQUFNLE1BQU0sR0FBRyxJQUFJLEdBQUcsQ0FBQyxpQ0FBaUMsRUFBRSxDQUFDO1FBQzNELE1BQU0sY0FBYyxHQUFHLElBQUksR0FBRyxFQUFpQixDQUFDO1FBQ2hELGVBQWUsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDN0QsVUFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMzRCxVQUFVLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDN0UsTUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQU8sQ0FBQztZQUNuQyxVQUFVLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUNyQyxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzFELElBQUksV0FBVyxHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxXQUFXLEVBQUU7b0JBQ2hCLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBTyxDQUFDO29CQUM3QixjQUFjLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQztpQkFDM0M7Z0JBQ0QsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7Z0JBQ3pDLHlFQUF5RTtnQkFDekUsdUVBQXVFO2dCQUN2RSxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO29CQUM1RCxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUMzQixXQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUMxQixNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUNsRDtZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDckMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDL0UsVUFBVSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN2RSxDQUFDLENBQUMsQ0FBQztRQUNILGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRTtZQUNyQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkUsVUFBVSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMvRCxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFTyxzQkFBc0IsQ0FBQyxJQUFVO1FBQ3ZDLElBQUksR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQixPQUFPLEVBQUMsU0FBUyxFQUFFLElBQUksRUFBQyxDQUFDO0lBQzNCLENBQUM7SUFFRCxZQUFZLENBQUMsSUFBUztRQUNwQixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6RCxPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRUQsb0JBQW9CLENBQUMsSUFBUztRQUM1QixPQUFPO1lBQ0wsV0FBVyxFQUFFLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVO1lBQzlDLElBQUksRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUM7U0FDL0MsQ0FBQztJQUNKLENBQUM7SUFFRCxxQkFBcUIsQ0FDakIsSUFBUyxFQUFFLGVBQTJCLElBQUksRUFDMUMscUJBQThCLElBQUk7UUFDcEMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQy9FLE1BQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQyxDQUFDO1lBQzlCLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBRWxFLE1BQU0sV0FBVyxHQUNiLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRXBGLElBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDNUIsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2pELE9BQU87WUFDTCxNQUFNLEVBQUUsSUFBSTtZQUNaLElBQUksRUFBRSxZQUFZO1lBQ2xCLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVTtZQUMzQixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7WUFDdkIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1lBQ3ZCLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztZQUM3QixVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVU7WUFDM0IsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1NBQ2hCLENBQUM7SUFDSixDQUFDO0lBRU8sZ0JBQWdCLENBQUMsSUFBVSxFQUFFLGVBQTJCLElBQUksRUFBRSxrQkFBa0IsR0FBRyxJQUFJO1FBRTdGLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyRCxPQUFPO1lBQ0wsU0FBUyxFQUFFLFVBQVUsQ0FBQyxTQUFTO1lBQy9CLE1BQU0sRUFBRSxJQUFJLENBQUMsd0JBQXdCLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsa0JBQWtCLENBQUM7WUFDN0YsY0FBYyxFQUFFLG9CQUFvQixDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLFNBQVMsQ0FBQztTQUM1RSxDQUFDO0lBQ0osQ0FBQztJQUVPLG1CQUFtQixDQUFDLE9BQWlCLEVBQUUsZUFBMkIsSUFBSTtRQUU1RSxPQUFPLEdBQUcsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckMsT0FBTyxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLEVBQUMsQ0FBQztJQUM1RixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsZUFBZSxDQUFDLFFBQWE7UUFDM0IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNiLElBQUksQ0FBQyxZQUFZLENBQ2IsV0FBVyxDQUNQLG9JQUFvSSxhQUFhLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUNuSyxRQUFRLENBQUMsQ0FBQztTQUNmO1FBQ0QsT0FBTyxRQUFRLElBQUksSUFBSSxDQUFDO0lBQzFCLENBQUM7SUFFRCxjQUFjLENBQUMsUUFBYTtRQUMxQixNQUFNLFdBQVcsR0FDVyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckYsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNoQixJQUFJLENBQUMsWUFBWSxDQUNiLFdBQVcsQ0FDUCxzREFBc0QsYUFBYSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFDckYsUUFBUSxDQUFDLENBQUM7U0FDZjtRQUNELE9BQU8sV0FBVyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxxQkFBcUIsQ0FBQyxRQUFhO1FBQ2pDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDYixRQUFRLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzdDO1FBQ0QsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztJQUVPLGlCQUFpQixDQUFDLFFBQWE7UUFDckMsUUFBUSxHQUFHLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZDLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBRyxDQUFDO1FBRTlELE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxDQUFDLG1CQUFtQixDQUFDO1lBQzNDLElBQUksRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDO1lBQ3JDLElBQUksRUFBRSxjQUFjLENBQUMsSUFBSTtZQUN6QixJQUFJLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxJQUFJO1NBQzVCLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDdkQsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztJQUVPLHdCQUF3QixDQUM1QixVQUF5QixFQUFFLFlBQXdCLEVBQ25ELGtCQUFrQixHQUFHLElBQUk7UUFDM0IsSUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFDO1FBQzNCLE1BQU0sTUFBTSxHQUFHLFlBQVksSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFNUUsTUFBTSxvQkFBb0IsR0FBc0MsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ25GLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQztZQUN4QixJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDbkIsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQ25CLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQztZQUN2QixJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7WUFDdkIsSUFBSSxLQUFLLEdBQVEsSUFBSSxDQUFDO1lBQ3RCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDeEIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQWUsRUFBRSxFQUFFO29CQUNoQyxJQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7d0JBQ25DLE1BQU0sR0FBRyxJQUFJLENBQUM7cUJBQ2Y7eUJBQU0sSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO3dCQUMxQyxNQUFNLEdBQUcsSUFBSSxDQUFDO3FCQUNmO3lCQUFNLElBQUksY0FBYyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRTt3QkFDOUMsVUFBVSxHQUFHLElBQUksQ0FBQztxQkFDbkI7eUJBQU0sSUFBSSxjQUFjLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO3dCQUM5QyxVQUFVLEdBQUcsSUFBSSxDQUFDO3FCQUNuQjt5QkFBTSxJQUFJLGVBQWUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7d0JBQy9DLFdBQVcsR0FBRyxJQUFJLENBQUM7d0JBQ25CLEtBQUssR0FBSSxVQUFrQixDQUFDLGFBQWEsQ0FBQztxQkFDM0M7eUJBQU0sSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO3dCQUM1QyxLQUFLLEdBQUksVUFBa0IsQ0FBQyxLQUFLLENBQUM7cUJBQ25DO3lCQUFNLElBQ0gsb0JBQW9CLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQzt3QkFDeEMsVUFBa0IsWUFBWSxZQUFZLEVBQUU7d0JBQy9DLEtBQUssR0FBRyxVQUFVLENBQUM7cUJBQ3BCO3lCQUFNLElBQUksV0FBVyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEtBQUssSUFBSSxJQUFJLEVBQUU7d0JBQ25ELEtBQUssR0FBRyxVQUFVLENBQUM7cUJBQ3BCO2dCQUNILENBQUMsQ0FBQyxDQUFDO2FBQ0o7aUJBQU07Z0JBQ0wsS0FBSyxHQUFHLEtBQUssQ0FBQzthQUNmO1lBQ0QsSUFBSSxLQUFLLElBQUksSUFBSSxFQUFFO2dCQUNqQixjQUFjLEdBQUcsSUFBSSxDQUFDO2dCQUN0QixPQUFPLEVBQUUsQ0FBQzthQUNYO1lBRUQsT0FBTztnQkFDTCxXQUFXO2dCQUNYLE1BQU07Z0JBQ04sTUFBTTtnQkFDTixVQUFVO2dCQUNWLFVBQVU7Z0JBQ1YsS0FBSyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7YUFDckMsQ0FBQztRQUVKLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxjQUFjLEVBQUU7WUFDbEIsTUFBTSxVQUFVLEdBQ1osb0JBQW9CLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0YsTUFBTSxPQUFPLEdBQ1Qsb0NBQW9DLGFBQWEsQ0FBQyxVQUFVLENBQUMsTUFBTSxVQUFVLElBQUksQ0FBQztZQUN0RixJQUFJLGtCQUFrQixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMseUJBQXlCLEVBQUU7Z0JBQ2hFLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQ3JEO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksT0FBTyw0Q0FBNEMsQ0FBQyxDQUFDO2FBQ3JGO1NBQ0Y7UUFFRCxPQUFPLG9CQUFvQixDQUFDO0lBQzlCLENBQUM7SUFFTyxpQkFBaUIsQ0FBQyxLQUFVO1FBQ2xDLEtBQUssR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqQyxJQUFJLFlBQXNDLENBQUM7UUFDM0MsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7WUFDN0IsWUFBWSxHQUFHLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBQyxDQUFDO1NBQy9CO2FBQU07WUFDTCxZQUFZLEdBQUcsRUFBQyxVQUFVLEVBQUUsRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFDLEVBQUMsQ0FBQztTQUNqRDtRQUNELE9BQU8sWUFBWSxDQUFDO0lBQ3RCLENBQUM7SUFFTyxxQkFBcUIsQ0FDekIsU0FBcUIsRUFBRSxxQkFBMEQsRUFDakYsU0FBa0IsRUFBRSxtQkFBa0QsRUFBRSxFQUN4RSxJQUFVO1FBQ1osU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQWEsRUFBRSxXQUFtQixFQUFFLEVBQUU7WUFDdkQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUMzQixJQUFJLENBQUMscUJBQXFCLENBQUMsUUFBUSxFQUFFLHFCQUFxQixFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO2FBQzFGO2lCQUFNO2dCQUNMLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDdkMsSUFBSSxZQUFZLEdBQXFCLFNBQVcsQ0FBQztnQkFDakQsSUFBSSxRQUFRLElBQUksT0FBTyxRQUFRLEtBQUssUUFBUSxJQUFJLFFBQVEsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLEVBQUU7b0JBQ2xGLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDakMsWUFBWSxHQUFHLElBQUksR0FBRyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2lCQUNqRTtxQkFBTSxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDaEMsWUFBWSxHQUFHLElBQUksR0FBRyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztpQkFDckU7cUJBQU0sSUFBSSxRQUFRLEtBQUssS0FBSyxDQUFDLEVBQUU7b0JBQzlCLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUN6Qiw2SUFBNkksQ0FBQyxDQUFDLENBQUM7b0JBQ3BKLE9BQU87aUJBQ1I7cUJBQU07b0JBQ0wsTUFBTSxhQUFhLEdBQ2YsU0FBUzt5QkFDSixNQUFNLENBQ0gsQ0FBQyxLQUFlLEVBQUUsWUFBaUIsRUFBRSxlQUF1QixFQUFFLEVBQUU7d0JBQzlELElBQUksZUFBZSxHQUFHLFdBQVcsRUFBRTs0QkFDakMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7eUJBQzlDOzZCQUFNLElBQUksZUFBZSxJQUFJLFdBQVcsRUFBRTs0QkFDekMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLGFBQWEsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7eUJBQ2hEOzZCQUFNLElBQUksZUFBZSxJQUFJLFdBQVcsR0FBRyxDQUFDLEVBQUU7NEJBQzdDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7eUJBQ25CO3dCQUNELE9BQU8sS0FBSyxDQUFDO29CQUNmLENBQUMsRUFDRCxFQUFFLENBQUM7eUJBQ04sSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNwQixJQUFJLENBQUMsWUFBWSxDQUNiLFdBQVcsQ0FDUCxXQUFXLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVLDZEQUE2RCxhQUFhLEdBQUcsQ0FBQyxFQUMvSCxJQUFJLENBQUMsQ0FBQztvQkFDVixPQUFPO2lCQUNSO2dCQUNELElBQUksWUFBWSxDQUFDLEtBQUs7b0JBQ2xCLElBQUksQ0FBQyxVQUFVLENBQUMsd0JBQXdCLENBQUMsV0FBVyxDQUFDLDRCQUE0QixDQUFDLEVBQUU7b0JBQ3RGLHFCQUFxQixDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztpQkFDekY7cUJBQU07b0JBQ0wsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO2lCQUMvRDthQUNGO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLGdCQUFnQixDQUFDO0lBQzFCLENBQUM7SUFFTyxpQkFBaUIsQ0FBQyxRQUFhO1FBQ3JDLElBQUksUUFBUSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxRQUFRLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRTtZQUNwRSxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FDekIsd0JBQXdCLGFBQWEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLHdCQUF3QixRQUFRLENBQUMsUUFBUTs7O2tGQUd4QixDQUFDLENBQUMsQ0FBQztTQUNoRjtJQUNILENBQUM7SUFFTywrQkFBK0IsQ0FBQyxRQUEwQixFQUFFLElBQVU7UUFFNUUsTUFBTSxVQUFVLEdBQXdDLEVBQUUsQ0FBQztRQUMzRCxNQUFNLG9CQUFvQixHQUFvQyxFQUFFLENBQUM7UUFFakUsSUFBSSxRQUFRLENBQUMsVUFBVSxJQUFJLFFBQVEsQ0FBQyxXQUFXLElBQUksUUFBUSxDQUFDLFFBQVEsRUFBRTtZQUNwRSxJQUFJLENBQUMsWUFBWSxDQUNiLFdBQVcsQ0FBQyxnRUFBZ0UsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3pGLE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRTtZQUNuQixJQUFJLENBQUMsWUFBWSxDQUNiLFdBQVcsQ0FBQyxzRUFBc0UsQ0FBQyxFQUNuRixJQUFJLENBQUMsQ0FBQztZQUNWLE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFFRCxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLG9CQUFvQixDQUFDLENBQUM7UUFDNUQsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDMUMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDM0UsSUFBSSxLQUFLLEVBQUU7Z0JBQ1QsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUN4QjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxVQUFVLENBQUM7SUFDcEIsQ0FBQztJQUVPLDBCQUEwQixDQUFDLE9BQVksRUFBRSxlQUFlLEdBQUcsSUFBSTtRQUVyRSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsaUNBQWlDLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEUsSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUU7WUFDM0MsT0FBTyxFQUFDLGFBQWEsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxnQkFBa0IsRUFBQyxDQUFDO1NBQ3hGO1FBQ0QsTUFBTSxVQUFVLEdBQ2lCLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM5RixJQUFJLFVBQVUsSUFBSSxVQUFVLENBQUMsV0FBVyxFQUFFO1lBQ3hDLE9BQU8sRUFBQyxhQUFhLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxnQkFBa0IsRUFBQyxDQUFDO1NBQ2xGO1FBQ0QsSUFBSSxlQUFlLEVBQUU7WUFDbkIsTUFBTSxXQUFXLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSx3Q0FBd0MsQ0FBQyxDQUFDO1NBQzVFO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRU8sMEJBQTBCLENBQUMsSUFBVSxFQUFFLGVBQTJCLElBQUk7UUFFNUUsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQy9FLElBQUksV0FBVyxFQUFFO1lBQ2YsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDO1NBQ3pCO1FBQ0QsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxRQUEwQjtRQUM1QyxJQUFJLFdBQVcsR0FBc0MsU0FBVyxDQUFDO1FBQ2pFLElBQUksbUJBQW1CLEdBQTRCLElBQU0sQ0FBQztRQUMxRCxJQUFJLHNCQUFzQixHQUErQixJQUFNLENBQUM7UUFDaEUsSUFBSSxLQUFLLEdBQTZCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFN0UsSUFBSSxRQUFRLENBQUMsUUFBUSxFQUFFO1lBQ3JCLG1CQUFtQjtnQkFDZixJQUFJLENBQUMsMEJBQTBCLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDOUUsV0FBVyxHQUFHLG1CQUFtQixDQUFDLE1BQU0sQ0FBQztZQUN6QyxJQUFJLFFBQVEsQ0FBQyxLQUFLLEtBQUssUUFBUSxDQUFDLFFBQVEsRUFBRTtnQkFDeEMsaUZBQWlGO2dCQUNqRixLQUFLLEdBQUcsRUFBQyxVQUFVLEVBQUUsbUJBQW1CLEVBQUMsQ0FBQzthQUMzQztTQUNGO2FBQU0sSUFBSSxRQUFRLENBQUMsVUFBVSxFQUFFO1lBQzlCLHNCQUFzQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUM5RixXQUFXLEdBQUcsc0JBQXNCLENBQUMsTUFBTSxDQUFDO1NBQzdDO1FBRUQsT0FBTztZQUNMLEtBQUssRUFBRSxLQUFLO1lBQ1osUUFBUSxFQUFFLG1CQUFtQjtZQUM3QixRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVE7WUFDM0IsVUFBVSxFQUFFLHNCQUFzQjtZQUNsQyxXQUFXLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztZQUM1RixJQUFJLEVBQUUsV0FBVztZQUNqQixLQUFLLEVBQUUsUUFBUSxDQUFDLEtBQUs7U0FDdEIsQ0FBQztJQUNKLENBQUM7SUFFTyxtQkFBbUIsQ0FDdkIsT0FBK0IsRUFBRSxXQUFvQixFQUNyRCxhQUFtQjtRQUNyQixNQUFNLEdBQUcsR0FBK0IsRUFBRSxDQUFDO1FBRTNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsWUFBb0IsRUFBRSxFQUFFO1lBQ3BELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNwQyxJQUFJLEtBQUssQ0FBQyxXQUFXLEtBQUssV0FBVyxFQUFFO2dCQUNyQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7YUFDdEU7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUVPLGlCQUFpQixDQUFDLFFBQWEsSUFBYyxPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRWhGLGlCQUFpQixDQUFDLENBQVEsRUFBRSxZQUFvQixFQUFFLFVBQXlCO1FBRWpGLElBQUksU0FBcUMsQ0FBQztRQUMxQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLFFBQVEsS0FBSyxRQUFRLEVBQUU7WUFDbEMsU0FBUztnQkFDTCxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQ3hGO2FBQU07WUFDTCxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRTtnQkFDZixJQUFJLENBQUMsWUFBWSxDQUNiLFdBQVcsQ0FDUCw2Q0FBNkMsWUFBWSxTQUFTLGFBQWEsQ0FBQyxVQUFVLENBQUMsNENBQTRDLENBQUMsRUFDNUksVUFBVSxDQUFDLENBQUM7Z0JBQ2hCLFNBQVMsR0FBRyxFQUFFLENBQUM7YUFDaEI7aUJBQU07Z0JBQ0wsU0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2FBQ2xEO1NBQ0Y7UUFFRCxPQUFPO1lBQ0wsU0FBUztZQUNULEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSztZQUNkLFdBQVcsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLFlBQVk7WUFDeEMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQU07WUFDdEQsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNO1NBQ2pCLENBQUM7SUFDSixDQUFDO0lBRU8sWUFBWSxDQUFDLEtBQVUsRUFBRSxJQUFVLEVBQUUsU0FBZTtRQUMxRCxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDeEIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDbEMsSUFBSSxTQUFTLEVBQUU7Z0JBQ2IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7YUFDeEM7U0FDRjthQUFNO1lBQ0wsTUFBTSxLQUFLLENBQUM7U0FDYjtJQUNILENBQUM7Q0FDRjtBQUVELFNBQVMsWUFBWSxDQUFDLElBQVcsRUFBRSxNQUFrQixFQUFFO0lBQ3JELElBQUksSUFBSSxFQUFFO1FBQ1IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDcEMsTUFBTSxJQUFJLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN2QixZQUFZLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ3pCO2lCQUFNO2dCQUNMLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDaEI7U0FDRjtLQUNGO0lBQ0QsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDO0FBRUQsU0FBUyxXQUFXLENBQUMsS0FBWTtJQUMvQixJQUFJLEtBQUssRUFBRTtRQUNULE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0tBQ25DO0lBQ0QsT0FBTyxFQUFFLENBQUM7QUFDWixDQUFDO0FBRUQsU0FBUyxxQkFBcUIsQ0FBQyxJQUFXO0lBQ3hDLE9BQU8sV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3pDLENBQUM7QUFFRCxTQUFTLFdBQVcsQ0FBQyxLQUFVO0lBQzdCLE9BQU8sQ0FBQyxLQUFLLFlBQVksWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLFlBQVksSUFBSSxDQUFDLENBQUM7QUFDcEUsQ0FBQztBQUVELFNBQVMsa0JBQWtCLENBQUMsS0FBVSxFQUFFLGlCQUFrRDtJQUN4RixVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksc0JBQXNCLEVBQUUsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0FBQ3JFLENBQUM7QUFFRCxNQUFNLHNCQUF1QixTQUFRLGdCQUFnQjtJQUNuRCxVQUFVLENBQUMsS0FBVSxFQUFFLGlCQUFrRDtRQUN2RSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztJQUM3QyxDQUFDO0NBQ0Y7QUFFRCxTQUFTLGFBQWEsQ0FBQyxJQUFTO0lBQzlCLElBQUksSUFBSSxZQUFZLFlBQVksRUFBRTtRQUNoQyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDM0M7U0FBTTtRQUNMLE9BQU8sU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3hCO0FBQ0gsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUywwQkFBMEIsQ0FBQyxRQUFjO0lBQ2hELE1BQU0sS0FBSyxHQUNQLEtBQUssQ0FBQyxrQ0FBa0MsU0FBUyxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQ3pGLEtBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLFFBQVEsQ0FBQztJQUNoRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U3RhdGljU3ltYm9sLCBTdGF0aWNTeW1ib2xDYWNoZX0gZnJvbSAnLi9hb3Qvc3RhdGljX3N5bWJvbCc7XG5pbXBvcnQge25nZmFjdG9yeUZpbGVQYXRofSBmcm9tICcuL2FvdC91dGlsJztcbmltcG9ydCB7YXNzZXJ0QXJyYXlPZlN0cmluZ3MsIGFzc2VydEludGVycG9sYXRpb25TeW1ib2xzfSBmcm9tICcuL2Fzc2VydGlvbnMnO1xuaW1wb3J0ICogYXMgY3BsIGZyb20gJy4vY29tcGlsZV9tZXRhZGF0YSc7XG5pbXBvcnQge0NvbXBpbGVSZWZsZWN0b3J9IGZyb20gJy4vY29tcGlsZV9yZWZsZWN0b3InO1xuaW1wb3J0IHtDb21waWxlckNvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgQ29tcG9uZW50LCBEaXJlY3RpdmUsIEluamVjdGFibGUsIE1vZHVsZVdpdGhQcm92aWRlcnMsIFByb3ZpZGVyLCBRdWVyeSwgU2NoZW1hTWV0YWRhdGEsIFR5cGUsIFZpZXdFbmNhcHN1bGF0aW9uLCBjcmVhdGVBdHRyaWJ1dGUsIGNyZWF0ZUNvbXBvbmVudCwgY3JlYXRlSG9zdCwgY3JlYXRlSW5qZWN0LCBjcmVhdGVJbmplY3RhYmxlLCBjcmVhdGVJbmplY3Rpb25Ub2tlbiwgY3JlYXRlTmdNb2R1bGUsIGNyZWF0ZU9wdGlvbmFsLCBjcmVhdGVTZWxmLCBjcmVhdGVTa2lwU2VsZn0gZnJvbSAnLi9jb3JlJztcbmltcG9ydCB7RGlyZWN0aXZlTm9ybWFsaXplcn0gZnJvbSAnLi9kaXJlY3RpdmVfbm9ybWFsaXplcic7XG5pbXBvcnQge0RpcmVjdGl2ZVJlc29sdmVyLCBmaW5kTGFzdH0gZnJvbSAnLi9kaXJlY3RpdmVfcmVzb2x2ZXInO1xuaW1wb3J0IHtJZGVudGlmaWVyc30gZnJvbSAnLi9pZGVudGlmaWVycyc7XG5pbXBvcnQge2dldEFsbExpZmVjeWNsZUhvb2tzfSBmcm9tICcuL2xpZmVjeWNsZV9yZWZsZWN0b3InO1xuaW1wb3J0IHtIdG1sUGFyc2VyfSBmcm9tICcuL21sX3BhcnNlci9odG1sX3BhcnNlcic7XG5pbXBvcnQge05nTW9kdWxlUmVzb2x2ZXJ9IGZyb20gJy4vbmdfbW9kdWxlX3Jlc29sdmVyJztcbmltcG9ydCB7UGlwZVJlc29sdmVyfSBmcm9tICcuL3BpcGVfcmVzb2x2ZXInO1xuaW1wb3J0IHtFbGVtZW50U2NoZW1hUmVnaXN0cnl9IGZyb20gJy4vc2NoZW1hL2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5JztcbmltcG9ydCB7Q3NzU2VsZWN0b3J9IGZyb20gJy4vc2VsZWN0b3InO1xuaW1wb3J0IHtTdW1tYXJ5UmVzb2x2ZXJ9IGZyb20gJy4vc3VtbWFyeV9yZXNvbHZlcic7XG5pbXBvcnQge0NvbnNvbGUsIFN5bmNBc3luYywgVmFsdWVUcmFuc2Zvcm1lciwgaXNQcm9taXNlLCBub1VuZGVmaW5lZCwgcmVzb2x2ZUZvcndhcmRSZWYsIHN0cmluZ2lmeSwgc3ludGF4RXJyb3IsIHZpc2l0VmFsdWV9IGZyb20gJy4vdXRpbCc7XG5cbmV4cG9ydCB0eXBlIEVycm9yQ29sbGVjdG9yID0gKGVycm9yOiBhbnksIHR5cGU/OiBhbnkpID0+IHZvaWQ7XG5cbmV4cG9ydCBjb25zdCBFUlJPUl9DT01QT05FTlRfVFlQRSA9ICduZ0NvbXBvbmVudFR5cGUnO1xuXG4vLyBEZXNpZ24gbm90ZXM6XG4vLyAtIGRvbid0IGxhemlseSBjcmVhdGUgbWV0YWRhdGE6XG4vLyAgIEZvciBzb21lIG1ldGFkYXRhLCB3ZSBuZWVkIHRvIGRvIGFzeW5jIHdvcmsgc29tZXRpbWVzLFxuLy8gICBzbyB0aGUgdXNlciBoYXMgdG8ga2ljayBvZmYgdGhpcyBsb2FkaW5nLlxuLy8gICBCdXQgd2Ugd2FudCB0byByZXBvcnQgZXJyb3JzIGV2ZW4gd2hlbiB0aGUgYXN5bmMgd29yayBpc1xuLy8gICBub3QgcmVxdWlyZWQgdG8gY2hlY2sgdGhhdCB0aGUgdXNlciB3b3VsZCBoYXZlIGJlZW4gYWJsZVxuLy8gICB0byB3YWl0IGNvcnJlY3RseS5cbmV4cG9ydCBjbGFzcyBDb21waWxlTWV0YWRhdGFSZXNvbHZlciB7XG4gIHByaXZhdGUgX25vbk5vcm1hbGl6ZWREaXJlY3RpdmVDYWNoZSA9XG4gICAgICBuZXcgTWFwPFR5cGUsIHthbm5vdGF0aW9uOiBEaXJlY3RpdmUsIG1ldGFkYXRhOiBjcGwuQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhfT4oKTtcbiAgcHJpdmF0ZSBfZGlyZWN0aXZlQ2FjaGUgPSBuZXcgTWFwPFR5cGUsIGNwbC5Db21waWxlRGlyZWN0aXZlTWV0YWRhdGE+KCk7XG4gIHByaXZhdGUgX3N1bW1hcnlDYWNoZSA9IG5ldyBNYXA8VHlwZSwgY3BsLkNvbXBpbGVUeXBlU3VtbWFyeXxudWxsPigpO1xuICBwcml2YXRlIF9waXBlQ2FjaGUgPSBuZXcgTWFwPFR5cGUsIGNwbC5Db21waWxlUGlwZU1ldGFkYXRhPigpO1xuICBwcml2YXRlIF9uZ01vZHVsZUNhY2hlID0gbmV3IE1hcDxUeXBlLCBjcGwuQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGE+KCk7XG4gIHByaXZhdGUgX25nTW9kdWxlT2ZUeXBlcyA9IG5ldyBNYXA8VHlwZSwgVHlwZT4oKTtcbiAgcHJpdmF0ZSBfc2hhbGxvd01vZHVsZUNhY2hlID0gbmV3IE1hcDxUeXBlLCBjcGwuQ29tcGlsZVNoYWxsb3dNb2R1bGVNZXRhZGF0YT4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX2NvbmZpZzogQ29tcGlsZXJDb25maWcsIHByaXZhdGUgX2h0bWxQYXJzZXI6IEh0bWxQYXJzZXIsXG4gICAgICBwcml2YXRlIF9uZ01vZHVsZVJlc29sdmVyOiBOZ01vZHVsZVJlc29sdmVyLCBwcml2YXRlIF9kaXJlY3RpdmVSZXNvbHZlcjogRGlyZWN0aXZlUmVzb2x2ZXIsXG4gICAgICBwcml2YXRlIF9waXBlUmVzb2x2ZXI6IFBpcGVSZXNvbHZlciwgcHJpdmF0ZSBfc3VtbWFyeVJlc29sdmVyOiBTdW1tYXJ5UmVzb2x2ZXI8YW55PixcbiAgICAgIHByaXZhdGUgX3NjaGVtYVJlZ2lzdHJ5OiBFbGVtZW50U2NoZW1hUmVnaXN0cnksXG4gICAgICBwcml2YXRlIF9kaXJlY3RpdmVOb3JtYWxpemVyOiBEaXJlY3RpdmVOb3JtYWxpemVyLCBwcml2YXRlIF9jb25zb2xlOiBDb25zb2xlLFxuICAgICAgcHJpdmF0ZSBfc3RhdGljU3ltYm9sQ2FjaGU6IFN0YXRpY1N5bWJvbENhY2hlLCBwcml2YXRlIF9yZWZsZWN0b3I6IENvbXBpbGVSZWZsZWN0b3IsXG4gICAgICBwcml2YXRlIF9lcnJvckNvbGxlY3Rvcj86IEVycm9yQ29sbGVjdG9yKSB7fVxuXG4gIGdldFJlZmxlY3RvcigpOiBDb21waWxlUmVmbGVjdG9yIHsgcmV0dXJuIHRoaXMuX3JlZmxlY3RvcjsgfVxuXG4gIGNsZWFyQ2FjaGVGb3IodHlwZTogVHlwZSkge1xuICAgIGNvbnN0IGRpck1ldGEgPSB0aGlzLl9kaXJlY3RpdmVDYWNoZS5nZXQodHlwZSk7XG4gICAgdGhpcy5fZGlyZWN0aXZlQ2FjaGUuZGVsZXRlKHR5cGUpO1xuICAgIHRoaXMuX25vbk5vcm1hbGl6ZWREaXJlY3RpdmVDYWNoZS5kZWxldGUodHlwZSk7XG4gICAgdGhpcy5fc3VtbWFyeUNhY2hlLmRlbGV0ZSh0eXBlKTtcbiAgICB0aGlzLl9waXBlQ2FjaGUuZGVsZXRlKHR5cGUpO1xuICAgIHRoaXMuX25nTW9kdWxlT2ZUeXBlcy5kZWxldGUodHlwZSk7XG4gICAgLy8gQ2xlYXIgYWxsIG9mIHRoZSBOZ01vZHVsZSBhcyB0aGV5IGNvbnRhaW4gdHJhbnNpdGl2ZSBpbmZvcm1hdGlvbiFcbiAgICB0aGlzLl9uZ01vZHVsZUNhY2hlLmNsZWFyKCk7XG4gICAgaWYgKGRpck1ldGEpIHtcbiAgICAgIHRoaXMuX2RpcmVjdGl2ZU5vcm1hbGl6ZXIuY2xlYXJDYWNoZUZvcihkaXJNZXRhKTtcbiAgICB9XG4gIH1cblxuICBjbGVhckNhY2hlKCk6IHZvaWQge1xuICAgIHRoaXMuX2RpcmVjdGl2ZUNhY2hlLmNsZWFyKCk7XG4gICAgdGhpcy5fbm9uTm9ybWFsaXplZERpcmVjdGl2ZUNhY2hlLmNsZWFyKCk7XG4gICAgdGhpcy5fc3VtbWFyeUNhY2hlLmNsZWFyKCk7XG4gICAgdGhpcy5fcGlwZUNhY2hlLmNsZWFyKCk7XG4gICAgdGhpcy5fbmdNb2R1bGVDYWNoZS5jbGVhcigpO1xuICAgIHRoaXMuX25nTW9kdWxlT2ZUeXBlcy5jbGVhcigpO1xuICAgIHRoaXMuX2RpcmVjdGl2ZU5vcm1hbGl6ZXIuY2xlYXJDYWNoZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlUHJveHlDbGFzcyhiYXNlVHlwZTogYW55LCBuYW1lOiBzdHJpbmcpOiBjcGwuUHJveHlDbGFzcyB7XG4gICAgbGV0IGRlbGVnYXRlOiBhbnkgPSBudWxsO1xuICAgIGNvbnN0IHByb3h5Q2xhc3M6IGNwbC5Qcm94eUNsYXNzID0gPGFueT5mdW5jdGlvbih0aGlzOiB1bmtub3duKSB7XG4gICAgICBpZiAoIWRlbGVnYXRlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBJbGxlZ2FsIHN0YXRlOiBDbGFzcyAke25hbWV9IGZvciB0eXBlICR7c3RyaW5naWZ5KGJhc2VUeXBlKX0gaXMgbm90IGNvbXBpbGVkIHlldCFgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkZWxlZ2F0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gICAgcHJveHlDbGFzcy5zZXREZWxlZ2F0ZSA9IChkKSA9PiB7XG4gICAgICBkZWxlZ2F0ZSA9IGQ7XG4gICAgICAoPGFueT5wcm94eUNsYXNzKS5wcm90b3R5cGUgPSBkLnByb3RvdHlwZTtcbiAgICB9O1xuICAgIC8vIE1ha2Ugc3RyaW5naWZ5IHdvcmsgY29ycmVjdGx5XG4gICAgKDxhbnk+cHJveHlDbGFzcykub3ZlcnJpZGRlbk5hbWUgPSBuYW1lO1xuICAgIHJldHVybiBwcm94eUNsYXNzO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRHZW5lcmF0ZWRDbGFzcyhkaXJUeXBlOiBhbnksIG5hbWU6IHN0cmluZyk6IFN0YXRpY1N5bWJvbHxjcGwuUHJveHlDbGFzcyB7XG4gICAgaWYgKGRpclR5cGUgaW5zdGFuY2VvZiBTdGF0aWNTeW1ib2wpIHtcbiAgICAgIHJldHVybiB0aGlzLl9zdGF0aWNTeW1ib2xDYWNoZS5nZXQobmdmYWN0b3J5RmlsZVBhdGgoZGlyVHlwZS5maWxlUGF0aCksIG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fY3JlYXRlUHJveHlDbGFzcyhkaXJUeXBlLCBuYW1lKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldENvbXBvbmVudFZpZXdDbGFzcyhkaXJUeXBlOiBhbnkpOiBTdGF0aWNTeW1ib2x8Y3BsLlByb3h5Q2xhc3Mge1xuICAgIHJldHVybiB0aGlzLmdldEdlbmVyYXRlZENsYXNzKGRpclR5cGUsIGNwbC52aWV3Q2xhc3NOYW1lKGRpclR5cGUsIDApKTtcbiAgfVxuXG4gIGdldEhvc3RDb21wb25lbnRWaWV3Q2xhc3MoZGlyVHlwZTogYW55KTogU3RhdGljU3ltYm9sfGNwbC5Qcm94eUNsYXNzIHtcbiAgICByZXR1cm4gdGhpcy5nZXRHZW5lcmF0ZWRDbGFzcyhkaXJUeXBlLCBjcGwuaG9zdFZpZXdDbGFzc05hbWUoZGlyVHlwZSkpO1xuICB9XG5cbiAgZ2V0SG9zdENvbXBvbmVudFR5cGUoZGlyVHlwZTogYW55KTogU3RhdGljU3ltYm9sfGNwbC5Qcm94eUNsYXNzIHtcbiAgICBjb25zdCBuYW1lID0gYCR7Y3BsLmlkZW50aWZpZXJOYW1lKHtyZWZlcmVuY2U6IGRpclR5cGV9KX1fSG9zdGA7XG4gICAgaWYgKGRpclR5cGUgaW5zdGFuY2VvZiBTdGF0aWNTeW1ib2wpIHtcbiAgICAgIHJldHVybiB0aGlzLl9zdGF0aWNTeW1ib2xDYWNoZS5nZXQoZGlyVHlwZS5maWxlUGF0aCwgbmFtZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2NyZWF0ZVByb3h5Q2xhc3MoZGlyVHlwZSwgbmFtZSk7XG4gIH1cblxuICBwcml2YXRlIGdldFJlbmRlcmVyVHlwZShkaXJUeXBlOiBhbnkpOiBTdGF0aWNTeW1ib2x8b2JqZWN0IHtcbiAgICBpZiAoZGlyVHlwZSBpbnN0YW5jZW9mIFN0YXRpY1N5bWJvbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3N0YXRpY1N5bWJvbENhY2hlLmdldChcbiAgICAgICAgICBuZ2ZhY3RvcnlGaWxlUGF0aChkaXJUeXBlLmZpbGVQYXRoKSwgY3BsLnJlbmRlcmVyVHlwZU5hbWUoZGlyVHlwZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyByZXR1cm5pbmcgYW4gb2JqZWN0IGFzIHByb3h5LFxuICAgICAgLy8gdGhhdCB3ZSBmaWxsIGxhdGVyIGR1cmluZyBydW50aW1lIGNvbXBpbGF0aW9uLlxuICAgICAgcmV0dXJuIDxhbnk+e307XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRDb21wb25lbnRGYWN0b3J5KFxuICAgICAgc2VsZWN0b3I6IHN0cmluZywgZGlyVHlwZTogYW55LCBpbnB1dHM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9fG51bGwsXG4gICAgICBvdXRwdXRzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSk6IFN0YXRpY1N5bWJvbHxvYmplY3Qge1xuICAgIGlmIChkaXJUeXBlIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc3RhdGljU3ltYm9sQ2FjaGUuZ2V0KFxuICAgICAgICAgIG5nZmFjdG9yeUZpbGVQYXRoKGRpclR5cGUuZmlsZVBhdGgpLCBjcGwuY29tcG9uZW50RmFjdG9yeU5hbWUoZGlyVHlwZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBob3N0VmlldyA9IHRoaXMuZ2V0SG9zdENvbXBvbmVudFZpZXdDbGFzcyhkaXJUeXBlKTtcbiAgICAgIC8vIE5vdGU6IG5nQ29udGVudFNlbGVjdG9ycyB3aWxsIGJlIGZpbGxlZCBsYXRlciBvbmNlIHRoZSB0ZW1wbGF0ZSBpc1xuICAgICAgLy8gbG9hZGVkLlxuICAgICAgY29uc3QgY3JlYXRlQ29tcG9uZW50RmFjdG9yeSA9XG4gICAgICAgICAgdGhpcy5fcmVmbGVjdG9yLnJlc29sdmVFeHRlcm5hbFJlZmVyZW5jZShJZGVudGlmaWVycy5jcmVhdGVDb21wb25lbnRGYWN0b3J5KTtcbiAgICAgIHJldHVybiBjcmVhdGVDb21wb25lbnRGYWN0b3J5KHNlbGVjdG9yLCBkaXJUeXBlLCA8YW55Pmhvc3RWaWV3LCBpbnB1dHMsIG91dHB1dHMsIFtdKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGluaXRDb21wb25lbnRGYWN0b3J5KGZhY3Rvcnk6IFN0YXRpY1N5bWJvbHxvYmplY3QsIG5nQ29udGVudFNlbGVjdG9yczogc3RyaW5nW10pIHtcbiAgICBpZiAoIShmYWN0b3J5IGluc3RhbmNlb2YgU3RhdGljU3ltYm9sKSkge1xuICAgICAgKGZhY3RvcnkgYXMgYW55KS5uZ0NvbnRlbnRTZWxlY3RvcnMucHVzaCguLi5uZ0NvbnRlbnRTZWxlY3RvcnMpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2xvYWRTdW1tYXJ5KHR5cGU6IGFueSwga2luZDogY3BsLkNvbXBpbGVTdW1tYXJ5S2luZCk6IGNwbC5Db21waWxlVHlwZVN1bW1hcnl8bnVsbCB7XG4gICAgbGV0IHR5cGVTdW1tYXJ5ID0gdGhpcy5fc3VtbWFyeUNhY2hlLmdldCh0eXBlKTtcbiAgICBpZiAoIXR5cGVTdW1tYXJ5KSB7XG4gICAgICBjb25zdCBzdW1tYXJ5ID0gdGhpcy5fc3VtbWFyeVJlc29sdmVyLnJlc29sdmVTdW1tYXJ5KHR5cGUpO1xuICAgICAgdHlwZVN1bW1hcnkgPSBzdW1tYXJ5ID8gc3VtbWFyeS50eXBlIDogbnVsbDtcbiAgICAgIHRoaXMuX3N1bW1hcnlDYWNoZS5zZXQodHlwZSwgdHlwZVN1bW1hcnkgfHwgbnVsbCk7XG4gICAgfVxuICAgIHJldHVybiB0eXBlU3VtbWFyeSAmJiB0eXBlU3VtbWFyeS5zdW1tYXJ5S2luZCA9PT0ga2luZCA/IHR5cGVTdW1tYXJ5IDogbnVsbDtcbiAgfVxuXG4gIGdldEhvc3RDb21wb25lbnRNZXRhZGF0YShcbiAgICAgIGNvbXBNZXRhOiBjcGwuQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICAgICAgaG9zdFZpZXdUeXBlPzogU3RhdGljU3ltYm9sfGNwbC5Qcm94eUNsYXNzKTogY3BsLkNvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSB7XG4gICAgY29uc3QgaG9zdFR5cGUgPSB0aGlzLmdldEhvc3RDb21wb25lbnRUeXBlKGNvbXBNZXRhLnR5cGUucmVmZXJlbmNlKTtcbiAgICBpZiAoIWhvc3RWaWV3VHlwZSkge1xuICAgICAgaG9zdFZpZXdUeXBlID0gdGhpcy5nZXRIb3N0Q29tcG9uZW50Vmlld0NsYXNzKGhvc3RUeXBlKTtcbiAgICB9XG4gICAgLy8gTm90ZTogISBpcyBvayBoZXJlIGFzIHRoaXMgbWV0aG9kIHNob3VsZCBvbmx5IGJlIGNhbGxlZCB3aXRoIG5vcm1hbGl6ZWQgZGlyZWN0aXZlXG4gICAgLy8gbWV0YWRhdGEsIHdoaWNoIGFsd2F5cyBmaWxscyBpbiB0aGUgc2VsZWN0b3IuXG4gICAgY29uc3QgdGVtcGxhdGUgPSBDc3NTZWxlY3Rvci5wYXJzZShjb21wTWV0YS5zZWxlY3RvciAhKVswXS5nZXRNYXRjaGluZ0VsZW1lbnRUZW1wbGF0ZSgpO1xuICAgIGNvbnN0IHRlbXBsYXRlVXJsID0gJyc7XG4gICAgY29uc3QgaHRtbEFzdCA9IHRoaXMuX2h0bWxQYXJzZXIucGFyc2UodGVtcGxhdGUsIHRlbXBsYXRlVXJsKTtcbiAgICByZXR1cm4gY3BsLkNvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YS5jcmVhdGUoe1xuICAgICAgaXNIb3N0OiB0cnVlLFxuICAgICAgdHlwZToge3JlZmVyZW5jZTogaG9zdFR5cGUsIGRpRGVwczogW10sIGxpZmVjeWNsZUhvb2tzOiBbXX0sXG4gICAgICB0ZW1wbGF0ZTogbmV3IGNwbC5Db21waWxlVGVtcGxhdGVNZXRhZGF0YSh7XG4gICAgICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gICAgICAgIHRlbXBsYXRlLFxuICAgICAgICB0ZW1wbGF0ZVVybCxcbiAgICAgICAgaHRtbEFzdCxcbiAgICAgICAgc3R5bGVzOiBbXSxcbiAgICAgICAgc3R5bGVVcmxzOiBbXSxcbiAgICAgICAgbmdDb250ZW50U2VsZWN0b3JzOiBbXSxcbiAgICAgICAgYW5pbWF0aW9uczogW10sXG4gICAgICAgIGlzSW5saW5lOiB0cnVlLFxuICAgICAgICBleHRlcm5hbFN0eWxlc2hlZXRzOiBbXSxcbiAgICAgICAgaW50ZXJwb2xhdGlvbjogbnVsbCxcbiAgICAgICAgcHJlc2VydmVXaGl0ZXNwYWNlczogZmFsc2UsXG4gICAgICB9KSxcbiAgICAgIGV4cG9ydEFzOiBudWxsLFxuICAgICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0LFxuICAgICAgcmVhY3RpdmVQcm9wZXJ0aWVzOiBbXSxcbiAgICAgIGlucHV0czogW10sXG4gICAgICBvdXRwdXRzOiBbXSxcbiAgICAgIGhvc3Q6IHt9LFxuICAgICAgaXNDb21wb25lbnQ6IHRydWUsXG4gICAgICBzZWxlY3RvcjogJyonLFxuICAgICAgcHJvdmlkZXJzOiBbXSxcbiAgICAgIHZpZXdQcm92aWRlcnM6IFtdLFxuICAgICAgcXVlcmllczogW10sXG4gICAgICBndWFyZHM6IHt9LFxuICAgICAgdmlld1F1ZXJpZXM6IFtdLFxuICAgICAgY29tcG9uZW50Vmlld1R5cGU6IGhvc3RWaWV3VHlwZSxcbiAgICAgIHJlbmRlcmVyVHlwZTpcbiAgICAgICAgICB7aWQ6ICdfX0hvc3RfXycsIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsIHN0eWxlczogW10sIGRhdGE6IHt9fSBhcyBvYmplY3QsXG4gICAgICBlbnRyeUNvbXBvbmVudHM6IFtdLFxuICAgICAgY29tcG9uZW50RmFjdG9yeTogbnVsbFxuICAgIH0pO1xuICB9XG5cbiAgbG9hZERpcmVjdGl2ZU1ldGFkYXRhKG5nTW9kdWxlVHlwZTogYW55LCBkaXJlY3RpdmVUeXBlOiBhbnksIGlzU3luYzogYm9vbGVhbik6IFN5bmNBc3luYzxudWxsPiB7XG4gICAgaWYgKHRoaXMuX2RpcmVjdGl2ZUNhY2hlLmhhcyhkaXJlY3RpdmVUeXBlKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGRpcmVjdGl2ZVR5cGUgPSByZXNvbHZlRm9yd2FyZFJlZihkaXJlY3RpdmVUeXBlKTtcbiAgICBjb25zdCB7YW5ub3RhdGlvbiwgbWV0YWRhdGF9ID0gdGhpcy5nZXROb25Ob3JtYWxpemVkRGlyZWN0aXZlTWV0YWRhdGEoZGlyZWN0aXZlVHlwZSkgITtcblxuICAgIGNvbnN0IGNyZWF0ZURpcmVjdGl2ZU1ldGFkYXRhID0gKHRlbXBsYXRlTWV0YWRhdGE6IGNwbC5Db21waWxlVGVtcGxhdGVNZXRhZGF0YSB8IG51bGwpID0+IHtcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWREaXJNZXRhID0gbmV3IGNwbC5Db21waWxlRGlyZWN0aXZlTWV0YWRhdGEoe1xuICAgICAgICBpc0hvc3Q6IGZhbHNlLFxuICAgICAgICB0eXBlOiBtZXRhZGF0YS50eXBlLFxuICAgICAgICBpc0NvbXBvbmVudDogbWV0YWRhdGEuaXNDb21wb25lbnQsXG4gICAgICAgIHNlbGVjdG9yOiBtZXRhZGF0YS5zZWxlY3RvcixcbiAgICAgICAgZXhwb3J0QXM6IG1ldGFkYXRhLmV4cG9ydEFzLFxuICAgICAgICBjaGFuZ2VEZXRlY3Rpb246IG1ldGFkYXRhLmNoYW5nZURldGVjdGlvbixcbiAgICAgICAgcmVhY3RpdmVQcm9wZXJ0aWVzOiBtZXRhZGF0YS5yZWFjdGl2ZVByb3BlcnRpZXMsXG4gICAgICAgIGlucHV0czogbWV0YWRhdGEuaW5wdXRzLFxuICAgICAgICBvdXRwdXRzOiBtZXRhZGF0YS5vdXRwdXRzLFxuICAgICAgICBob3N0TGlzdGVuZXJzOiBtZXRhZGF0YS5ob3N0TGlzdGVuZXJzLFxuICAgICAgICBob3N0UHJvcGVydGllczogbWV0YWRhdGEuaG9zdFByb3BlcnRpZXMsXG4gICAgICAgIGhvc3RBdHRyaWJ1dGVzOiBtZXRhZGF0YS5ob3N0QXR0cmlidXRlcyxcbiAgICAgICAgcHJvdmlkZXJzOiBtZXRhZGF0YS5wcm92aWRlcnMsXG4gICAgICAgIHZpZXdQcm92aWRlcnM6IG1ldGFkYXRhLnZpZXdQcm92aWRlcnMsXG4gICAgICAgIHF1ZXJpZXM6IG1ldGFkYXRhLnF1ZXJpZXMsXG4gICAgICAgIGd1YXJkczogbWV0YWRhdGEuZ3VhcmRzLFxuICAgICAgICB2aWV3UXVlcmllczogbWV0YWRhdGEudmlld1F1ZXJpZXMsXG4gICAgICAgIGVudHJ5Q29tcG9uZW50czogbWV0YWRhdGEuZW50cnlDb21wb25lbnRzLFxuICAgICAgICBjb21wb25lbnRWaWV3VHlwZTogbWV0YWRhdGEuY29tcG9uZW50Vmlld1R5cGUsXG4gICAgICAgIHJlbmRlcmVyVHlwZTogbWV0YWRhdGEucmVuZGVyZXJUeXBlLFxuICAgICAgICBjb21wb25lbnRGYWN0b3J5OiBtZXRhZGF0YS5jb21wb25lbnRGYWN0b3J5LFxuICAgICAgICB0ZW1wbGF0ZTogdGVtcGxhdGVNZXRhZGF0YVxuICAgICAgfSk7XG4gICAgICBpZiAodGVtcGxhdGVNZXRhZGF0YSkge1xuICAgICAgICB0aGlzLmluaXRDb21wb25lbnRGYWN0b3J5KG1ldGFkYXRhLmNvbXBvbmVudEZhY3RvcnkgISwgdGVtcGxhdGVNZXRhZGF0YS5uZ0NvbnRlbnRTZWxlY3RvcnMpO1xuICAgICAgfVxuICAgICAgdGhpcy5fZGlyZWN0aXZlQ2FjaGUuc2V0KGRpcmVjdGl2ZVR5cGUsIG5vcm1hbGl6ZWREaXJNZXRhKTtcbiAgICAgIHRoaXMuX3N1bW1hcnlDYWNoZS5zZXQoZGlyZWN0aXZlVHlwZSwgbm9ybWFsaXplZERpck1ldGEudG9TdW1tYXJ5KCkpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcblxuICAgIGlmIChtZXRhZGF0YS5pc0NvbXBvbmVudCkge1xuICAgICAgY29uc3QgdGVtcGxhdGUgPSBtZXRhZGF0YS50ZW1wbGF0ZSAhO1xuICAgICAgY29uc3QgdGVtcGxhdGVNZXRhID0gdGhpcy5fZGlyZWN0aXZlTm9ybWFsaXplci5ub3JtYWxpemVUZW1wbGF0ZSh7XG4gICAgICAgIG5nTW9kdWxlVHlwZSxcbiAgICAgICAgY29tcG9uZW50VHlwZTogZGlyZWN0aXZlVHlwZSxcbiAgICAgICAgbW9kdWxlVXJsOiB0aGlzLl9yZWZsZWN0b3IuY29tcG9uZW50TW9kdWxlVXJsKGRpcmVjdGl2ZVR5cGUsIGFubm90YXRpb24pLFxuICAgICAgICBlbmNhcHN1bGF0aW9uOiB0ZW1wbGF0ZS5lbmNhcHN1bGF0aW9uLFxuICAgICAgICB0ZW1wbGF0ZTogdGVtcGxhdGUudGVtcGxhdGUsXG4gICAgICAgIHRlbXBsYXRlVXJsOiB0ZW1wbGF0ZS50ZW1wbGF0ZVVybCxcbiAgICAgICAgc3R5bGVzOiB0ZW1wbGF0ZS5zdHlsZXMsXG4gICAgICAgIHN0eWxlVXJsczogdGVtcGxhdGUuc3R5bGVVcmxzLFxuICAgICAgICBhbmltYXRpb25zOiB0ZW1wbGF0ZS5hbmltYXRpb25zLFxuICAgICAgICBpbnRlcnBvbGF0aW9uOiB0ZW1wbGF0ZS5pbnRlcnBvbGF0aW9uLFxuICAgICAgICBwcmVzZXJ2ZVdoaXRlc3BhY2VzOiB0ZW1wbGF0ZS5wcmVzZXJ2ZVdoaXRlc3BhY2VzXG4gICAgICB9KTtcbiAgICAgIGlmIChpc1Byb21pc2UodGVtcGxhdGVNZXRhKSAmJiBpc1N5bmMpIHtcbiAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoY29tcG9uZW50U3RpbGxMb2FkaW5nRXJyb3IoZGlyZWN0aXZlVHlwZSksIGRpcmVjdGl2ZVR5cGUpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBTeW5jQXN5bmMudGhlbih0ZW1wbGF0ZU1ldGEsIGNyZWF0ZURpcmVjdGl2ZU1ldGFkYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZGlyZWN0aXZlXG4gICAgICBjcmVhdGVEaXJlY3RpdmVNZXRhZGF0YShudWxsKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGdldE5vbk5vcm1hbGl6ZWREaXJlY3RpdmVNZXRhZGF0YShkaXJlY3RpdmVUeXBlOiBhbnkpOlxuICAgICAge2Fubm90YXRpb246IERpcmVjdGl2ZSwgbWV0YWRhdGE6IGNwbC5Db21waWxlRGlyZWN0aXZlTWV0YWRhdGF9fG51bGwge1xuICAgIGRpcmVjdGl2ZVR5cGUgPSByZXNvbHZlRm9yd2FyZFJlZihkaXJlY3RpdmVUeXBlKTtcbiAgICBpZiAoIWRpcmVjdGl2ZVR5cGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBsZXQgY2FjaGVFbnRyeSA9IHRoaXMuX25vbk5vcm1hbGl6ZWREaXJlY3RpdmVDYWNoZS5nZXQoZGlyZWN0aXZlVHlwZSk7XG4gICAgaWYgKGNhY2hlRW50cnkpIHtcbiAgICAgIHJldHVybiBjYWNoZUVudHJ5O1xuICAgIH1cbiAgICBjb25zdCBkaXJNZXRhID0gdGhpcy5fZGlyZWN0aXZlUmVzb2x2ZXIucmVzb2x2ZShkaXJlY3RpdmVUeXBlLCBmYWxzZSk7XG4gICAgaWYgKCFkaXJNZXRhKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgbGV0IG5vbk5vcm1hbGl6ZWRUZW1wbGF0ZU1ldGFkYXRhOiBjcGwuQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEgPSB1bmRlZmluZWQgITtcblxuICAgIGlmIChjcmVhdGVDb21wb25lbnQuaXNUeXBlT2YoZGlyTWV0YSkpIHtcbiAgICAgIC8vIGNvbXBvbmVudFxuICAgICAgY29uc3QgY29tcE1ldGEgPSBkaXJNZXRhIGFzIENvbXBvbmVudDtcbiAgICAgIGFzc2VydEFycmF5T2ZTdHJpbmdzKCdzdHlsZXMnLCBjb21wTWV0YS5zdHlsZXMpO1xuICAgICAgYXNzZXJ0QXJyYXlPZlN0cmluZ3MoJ3N0eWxlVXJscycsIGNvbXBNZXRhLnN0eWxlVXJscyk7XG4gICAgICBhc3NlcnRJbnRlcnBvbGF0aW9uU3ltYm9scygnaW50ZXJwb2xhdGlvbicsIGNvbXBNZXRhLmludGVycG9sYXRpb24pO1xuXG4gICAgICBjb25zdCBhbmltYXRpb25zID0gY29tcE1ldGEuYW5pbWF0aW9ucztcblxuICAgICAgbm9uTm9ybWFsaXplZFRlbXBsYXRlTWV0YWRhdGEgPSBuZXcgY3BsLkNvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhKHtcbiAgICAgICAgZW5jYXBzdWxhdGlvbjogbm9VbmRlZmluZWQoY29tcE1ldGEuZW5jYXBzdWxhdGlvbiksXG4gICAgICAgIHRlbXBsYXRlOiBub1VuZGVmaW5lZChjb21wTWV0YS50ZW1wbGF0ZSksXG4gICAgICAgIHRlbXBsYXRlVXJsOiBub1VuZGVmaW5lZChjb21wTWV0YS50ZW1wbGF0ZVVybCksXG4gICAgICAgIGh0bWxBc3Q6IG51bGwsXG4gICAgICAgIHN0eWxlczogY29tcE1ldGEuc3R5bGVzIHx8IFtdLFxuICAgICAgICBzdHlsZVVybHM6IGNvbXBNZXRhLnN0eWxlVXJscyB8fCBbXSxcbiAgICAgICAgYW5pbWF0aW9uczogYW5pbWF0aW9ucyB8fCBbXSxcbiAgICAgICAgaW50ZXJwb2xhdGlvbjogbm9VbmRlZmluZWQoY29tcE1ldGEuaW50ZXJwb2xhdGlvbiksXG4gICAgICAgIGlzSW5saW5lOiAhIWNvbXBNZXRhLnRlbXBsYXRlLFxuICAgICAgICBleHRlcm5hbFN0eWxlc2hlZXRzOiBbXSxcbiAgICAgICAgbmdDb250ZW50U2VsZWN0b3JzOiBbXSxcbiAgICAgICAgcHJlc2VydmVXaGl0ZXNwYWNlczogbm9VbmRlZmluZWQoZGlyTWV0YS5wcmVzZXJ2ZVdoaXRlc3BhY2VzKSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGxldCBjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneTogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kgPSBudWxsICE7XG4gICAgbGV0IHJlYWN0aXZlUHJvcGVydGllczogc3RyaW5nW10gPSBbXTtcbiAgICBsZXQgdmlld1Byb3ZpZGVyczogY3BsLkNvbXBpbGVQcm92aWRlck1ldGFkYXRhW10gPSBbXTtcbiAgICBsZXQgZW50cnlDb21wb25lbnRNZXRhZGF0YTogY3BsLkNvbXBpbGVFbnRyeUNvbXBvbmVudE1ldGFkYXRhW10gPSBbXTtcbiAgICBsZXQgc2VsZWN0b3IgPSBkaXJNZXRhLnNlbGVjdG9yO1xuXG4gICAgaWYgKGNyZWF0ZUNvbXBvbmVudC5pc1R5cGVPZihkaXJNZXRhKSkge1xuICAgICAgLy8gQ29tcG9uZW50XG4gICAgICBjb25zdCBjb21wTWV0YSA9IGRpck1ldGEgYXMgQ29tcG9uZW50O1xuICAgICAgY2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kgPSBjb21wTWV0YS5jaGFuZ2VEZXRlY3Rpb24gITtcbiAgICAgIGlmIChjb21wTWV0YS5yZWFjdGl2ZVByb3BlcnRpZXMpIHtcbiAgICAgICAgcmVhY3RpdmVQcm9wZXJ0aWVzID0gY29tcE1ldGEucmVhY3RpdmVQcm9wZXJ0aWVzO1xuICAgICAgfVxuICAgICAgaWYgKGNvbXBNZXRhLnZpZXdQcm92aWRlcnMpIHtcbiAgICAgICAgdmlld1Byb3ZpZGVycyA9IHRoaXMuX2dldFByb3ZpZGVyc01ldGFkYXRhKFxuICAgICAgICAgICAgY29tcE1ldGEudmlld1Byb3ZpZGVycywgZW50cnlDb21wb25lbnRNZXRhZGF0YSxcbiAgICAgICAgICAgIGB2aWV3UHJvdmlkZXJzIGZvciBcIiR7c3RyaW5naWZ5VHlwZShkaXJlY3RpdmVUeXBlKX1cImAsIFtdLCBkaXJlY3RpdmVUeXBlKTtcbiAgICAgIH1cbiAgICAgIGlmIChjb21wTWV0YS5lbnRyeUNvbXBvbmVudHMpIHtcbiAgICAgICAgZW50cnlDb21wb25lbnRNZXRhZGF0YSA9IGZsYXR0ZW5BbmREZWR1cGVBcnJheShjb21wTWV0YS5lbnRyeUNvbXBvbmVudHMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCgodHlwZSkgPT4gdGhpcy5fZ2V0RW50cnlDb21wb25lbnRNZXRhZGF0YSh0eXBlKSAhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jb25jYXQoZW50cnlDb21wb25lbnRNZXRhZGF0YSk7XG4gICAgICB9XG4gICAgICBpZiAoIXNlbGVjdG9yKSB7XG4gICAgICAgIHNlbGVjdG9yID0gdGhpcy5fc2NoZW1hUmVnaXN0cnkuZ2V0RGVmYXVsdENvbXBvbmVudEVsZW1lbnROYW1lKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIERpcmVjdGl2ZVxuICAgICAgaWYgKCFzZWxlY3Rvcikge1xuICAgICAgICBzZWxlY3RvciA9IG51bGwgITtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgcHJvdmlkZXJzOiBjcGwuQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGFbXSA9IFtdO1xuICAgIGlmIChkaXJNZXRhLnByb3ZpZGVycyAhPSBudWxsKSB7XG4gICAgICBwcm92aWRlcnMgPSB0aGlzLl9nZXRQcm92aWRlcnNNZXRhZGF0YShcbiAgICAgICAgICBkaXJNZXRhLnByb3ZpZGVycywgZW50cnlDb21wb25lbnRNZXRhZGF0YSxcbiAgICAgICAgICBgcHJvdmlkZXJzIGZvciBcIiR7c3RyaW5naWZ5VHlwZShkaXJlY3RpdmVUeXBlKX1cImAsIFtdLCBkaXJlY3RpdmVUeXBlKTtcbiAgICB9XG4gICAgbGV0IHF1ZXJpZXM6IGNwbC5Db21waWxlUXVlcnlNZXRhZGF0YVtdID0gW107XG4gICAgbGV0IHZpZXdRdWVyaWVzOiBjcGwuQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXSA9IFtdO1xuICAgIGlmIChkaXJNZXRhLnF1ZXJpZXMgIT0gbnVsbCkge1xuICAgICAgcXVlcmllcyA9IHRoaXMuX2dldFF1ZXJpZXNNZXRhZGF0YShkaXJNZXRhLnF1ZXJpZXMsIGZhbHNlLCBkaXJlY3RpdmVUeXBlKTtcbiAgICAgIHZpZXdRdWVyaWVzID0gdGhpcy5fZ2V0UXVlcmllc01ldGFkYXRhKGRpck1ldGEucXVlcmllcywgdHJ1ZSwgZGlyZWN0aXZlVHlwZSk7XG4gICAgfVxuXG4gICAgY29uc3QgbWV0YWRhdGEgPSBjcGwuQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLmNyZWF0ZSh7XG4gICAgICBpc0hvc3Q6IGZhbHNlLFxuICAgICAgc2VsZWN0b3I6IHNlbGVjdG9yLFxuICAgICAgZXhwb3J0QXM6IG5vVW5kZWZpbmVkKGRpck1ldGEuZXhwb3J0QXMpLFxuICAgICAgaXNDb21wb25lbnQ6ICEhbm9uTm9ybWFsaXplZFRlbXBsYXRlTWV0YWRhdGEsXG4gICAgICB0eXBlOiB0aGlzLl9nZXRUeXBlTWV0YWRhdGEoZGlyZWN0aXZlVHlwZSksXG4gICAgICB0ZW1wbGF0ZTogbm9uTm9ybWFsaXplZFRlbXBsYXRlTWV0YWRhdGEsXG4gICAgICBjaGFuZ2VEZXRlY3Rpb246IGNoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICAgICAgcmVhY3RpdmVQcm9wZXJ0aWVzOiByZWFjdGl2ZVByb3BlcnRpZXMsXG4gICAgICBpbnB1dHM6IGRpck1ldGEuaW5wdXRzIHx8IFtdLFxuICAgICAgb3V0cHV0czogZGlyTWV0YS5vdXRwdXRzIHx8IFtdLFxuICAgICAgaG9zdDogZGlyTWV0YS5ob3N0IHx8IHt9LFxuICAgICAgcHJvdmlkZXJzOiBwcm92aWRlcnMgfHwgW10sXG4gICAgICB2aWV3UHJvdmlkZXJzOiB2aWV3UHJvdmlkZXJzIHx8IFtdLFxuICAgICAgcXVlcmllczogcXVlcmllcyB8fCBbXSxcbiAgICAgIGd1YXJkczogZGlyTWV0YS5ndWFyZHMgfHwge30sXG4gICAgICB2aWV3UXVlcmllczogdmlld1F1ZXJpZXMgfHwgW10sXG4gICAgICBlbnRyeUNvbXBvbmVudHM6IGVudHJ5Q29tcG9uZW50TWV0YWRhdGEsXG4gICAgICBjb21wb25lbnRWaWV3VHlwZTogbm9uTm9ybWFsaXplZFRlbXBsYXRlTWV0YWRhdGEgPyB0aGlzLmdldENvbXBvbmVudFZpZXdDbGFzcyhkaXJlY3RpdmVUeXBlKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgcmVuZGVyZXJUeXBlOiBub25Ob3JtYWxpemVkVGVtcGxhdGVNZXRhZGF0YSA/IHRoaXMuZ2V0UmVuZGVyZXJUeXBlKGRpcmVjdGl2ZVR5cGUpIDogbnVsbCxcbiAgICAgIGNvbXBvbmVudEZhY3Rvcnk6IG51bGxcbiAgICB9KTtcbiAgICBpZiAobm9uTm9ybWFsaXplZFRlbXBsYXRlTWV0YWRhdGEpIHtcbiAgICAgIG1ldGFkYXRhLmNvbXBvbmVudEZhY3RvcnkgPVxuICAgICAgICAgIHRoaXMuZ2V0Q29tcG9uZW50RmFjdG9yeShzZWxlY3RvciwgZGlyZWN0aXZlVHlwZSwgbWV0YWRhdGEuaW5wdXRzLCBtZXRhZGF0YS5vdXRwdXRzKTtcbiAgICB9XG4gICAgY2FjaGVFbnRyeSA9IHttZXRhZGF0YSwgYW5ub3RhdGlvbjogZGlyTWV0YX07XG4gICAgdGhpcy5fbm9uTm9ybWFsaXplZERpcmVjdGl2ZUNhY2hlLnNldChkaXJlY3RpdmVUeXBlLCBjYWNoZUVudHJ5KTtcbiAgICByZXR1cm4gY2FjaGVFbnRyeTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBtZXRhZGF0YSBmb3IgdGhlIGdpdmVuIGRpcmVjdGl2ZS5cbiAgICogVGhpcyBhc3N1bWVzIGBsb2FkTmdNb2R1bGVEaXJlY3RpdmVBbmRQaXBlTWV0YWRhdGFgIGhhcyBiZWVuIGNhbGxlZCBmaXJzdC5cbiAgICovXG4gIGdldERpcmVjdGl2ZU1ldGFkYXRhKGRpcmVjdGl2ZVR5cGU6IGFueSk6IGNwbC5Db21waWxlRGlyZWN0aXZlTWV0YWRhdGEge1xuICAgIGNvbnN0IGRpck1ldGEgPSB0aGlzLl9kaXJlY3RpdmVDYWNoZS5nZXQoZGlyZWN0aXZlVHlwZSkgITtcbiAgICBpZiAoIWRpck1ldGEpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgIHN5bnRheEVycm9yKFxuICAgICAgICAgICAgICBgSWxsZWdhbCBzdGF0ZTogZ2V0RGlyZWN0aXZlTWV0YWRhdGEgY2FuIG9ubHkgYmUgY2FsbGVkIGFmdGVyIGxvYWROZ01vZHVsZURpcmVjdGl2ZUFuZFBpcGVNZXRhZGF0YSBmb3IgYSBtb2R1bGUgdGhhdCBkZWNsYXJlcyBpdC4gRGlyZWN0aXZlICR7c3RyaW5naWZ5VHlwZShkaXJlY3RpdmVUeXBlKX0uYCksXG4gICAgICAgICAgZGlyZWN0aXZlVHlwZSk7XG4gICAgfVxuICAgIHJldHVybiBkaXJNZXRhO1xuICB9XG5cbiAgZ2V0RGlyZWN0aXZlU3VtbWFyeShkaXJUeXBlOiBhbnkpOiBjcGwuQ29tcGlsZURpcmVjdGl2ZVN1bW1hcnkge1xuICAgIGNvbnN0IGRpclN1bW1hcnkgPVxuICAgICAgICA8Y3BsLkNvbXBpbGVEaXJlY3RpdmVTdW1tYXJ5PnRoaXMuX2xvYWRTdW1tYXJ5KGRpclR5cGUsIGNwbC5Db21waWxlU3VtbWFyeUtpbmQuRGlyZWN0aXZlKTtcbiAgICBpZiAoIWRpclN1bW1hcnkpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgIHN5bnRheEVycm9yKFxuICAgICAgICAgICAgICBgSWxsZWdhbCBzdGF0ZTogQ291bGQgbm90IGxvYWQgdGhlIHN1bW1hcnkgZm9yIGRpcmVjdGl2ZSAke3N0cmluZ2lmeVR5cGUoZGlyVHlwZSl9LmApLFxuICAgICAgICAgIGRpclR5cGUpO1xuICAgIH1cbiAgICByZXR1cm4gZGlyU3VtbWFyeTtcbiAgfVxuXG4gIGlzRGlyZWN0aXZlKHR5cGU6IGFueSkge1xuICAgIHJldHVybiAhIXRoaXMuX2xvYWRTdW1tYXJ5KHR5cGUsIGNwbC5Db21waWxlU3VtbWFyeUtpbmQuRGlyZWN0aXZlKSB8fFxuICAgICAgICB0aGlzLl9kaXJlY3RpdmVSZXNvbHZlci5pc0RpcmVjdGl2ZSh0eXBlKTtcbiAgfVxuXG4gIGlzQWJzdHJhY3REaXJlY3RpdmUodHlwZTogYW55KTogYm9vbGVhbiB7XG4gICAgY29uc3Qgc3VtbWFyeSA9XG4gICAgICAgIHRoaXMuX2xvYWRTdW1tYXJ5KHR5cGUsIGNwbC5Db21waWxlU3VtbWFyeUtpbmQuRGlyZWN0aXZlKSBhcyBjcGwuQ29tcGlsZURpcmVjdGl2ZVN1bW1hcnk7XG4gICAgaWYgKHN1bW1hcnkgJiYgIXN1bW1hcnkuaXNDb21wb25lbnQpIHtcbiAgICAgIHJldHVybiAhc3VtbWFyeS5zZWxlY3RvcjtcbiAgICB9XG5cbiAgICBjb25zdCBtZXRhID0gdGhpcy5fZGlyZWN0aXZlUmVzb2x2ZXIucmVzb2x2ZSh0eXBlLCBmYWxzZSk7XG4gICAgaWYgKG1ldGEgJiYgIWNyZWF0ZUNvbXBvbmVudC5pc1R5cGVPZihtZXRhKSkge1xuICAgICAgcmV0dXJuICFtZXRhLnNlbGVjdG9yO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlzUGlwZSh0eXBlOiBhbnkpIHtcbiAgICByZXR1cm4gISF0aGlzLl9sb2FkU3VtbWFyeSh0eXBlLCBjcGwuQ29tcGlsZVN1bW1hcnlLaW5kLlBpcGUpIHx8XG4gICAgICAgIHRoaXMuX3BpcGVSZXNvbHZlci5pc1BpcGUodHlwZSk7XG4gIH1cblxuICBpc05nTW9kdWxlKHR5cGU6IGFueSkge1xuICAgIHJldHVybiAhIXRoaXMuX2xvYWRTdW1tYXJ5KHR5cGUsIGNwbC5Db21waWxlU3VtbWFyeUtpbmQuTmdNb2R1bGUpIHx8XG4gICAgICAgIHRoaXMuX25nTW9kdWxlUmVzb2x2ZXIuaXNOZ01vZHVsZSh0eXBlKTtcbiAgfVxuXG4gIGdldE5nTW9kdWxlU3VtbWFyeShtb2R1bGVUeXBlOiBhbnksIGFscmVhZHlDb2xsZWN0aW5nOiBTZXQ8YW55PnxudWxsID0gbnVsbCk6XG4gICAgICBjcGwuQ29tcGlsZU5nTW9kdWxlU3VtbWFyeXxudWxsIHtcbiAgICBsZXQgbW9kdWxlU3VtbWFyeTogY3BsLkNvbXBpbGVOZ01vZHVsZVN1bW1hcnl8bnVsbCA9XG4gICAgICAgIDxjcGwuQ29tcGlsZU5nTW9kdWxlU3VtbWFyeT50aGlzLl9sb2FkU3VtbWFyeShtb2R1bGVUeXBlLCBjcGwuQ29tcGlsZVN1bW1hcnlLaW5kLk5nTW9kdWxlKTtcbiAgICBpZiAoIW1vZHVsZVN1bW1hcnkpIHtcbiAgICAgIGNvbnN0IG1vZHVsZU1ldGEgPSB0aGlzLmdldE5nTW9kdWxlTWV0YWRhdGEobW9kdWxlVHlwZSwgZmFsc2UsIGFscmVhZHlDb2xsZWN0aW5nKTtcbiAgICAgIG1vZHVsZVN1bW1hcnkgPSBtb2R1bGVNZXRhID8gbW9kdWxlTWV0YS50b1N1bW1hcnkoKSA6IG51bGw7XG4gICAgICBpZiAobW9kdWxlU3VtbWFyeSkge1xuICAgICAgICB0aGlzLl9zdW1tYXJ5Q2FjaGUuc2V0KG1vZHVsZVR5cGUsIG1vZHVsZVN1bW1hcnkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbW9kdWxlU3VtbWFyeTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkcyB0aGUgZGVjbGFyZWQgZGlyZWN0aXZlcyBhbmQgcGlwZXMgb2YgYW4gTmdNb2R1bGUuXG4gICAqL1xuICBsb2FkTmdNb2R1bGVEaXJlY3RpdmVBbmRQaXBlTWV0YWRhdGEobW9kdWxlVHlwZTogYW55LCBpc1N5bmM6IGJvb2xlYW4sIHRocm93SWZOb3RGb3VuZCA9IHRydWUpOlxuICAgICAgUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCBuZ01vZHVsZSA9IHRoaXMuZ2V0TmdNb2R1bGVNZXRhZGF0YShtb2R1bGVUeXBlLCB0aHJvd0lmTm90Rm91bmQpO1xuICAgIGNvbnN0IGxvYWRpbmc6IFByb21pc2U8YW55PltdID0gW107XG4gICAgaWYgKG5nTW9kdWxlKSB7XG4gICAgICBuZ01vZHVsZS5kZWNsYXJlZERpcmVjdGl2ZXMuZm9yRWFjaCgoaWQpID0+IHtcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IHRoaXMubG9hZERpcmVjdGl2ZU1ldGFkYXRhKG1vZHVsZVR5cGUsIGlkLnJlZmVyZW5jZSwgaXNTeW5jKTtcbiAgICAgICAgaWYgKHByb21pc2UpIHtcbiAgICAgICAgICBsb2FkaW5nLnB1c2gocHJvbWlzZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgbmdNb2R1bGUuZGVjbGFyZWRQaXBlcy5mb3JFYWNoKChpZCkgPT4gdGhpcy5fbG9hZFBpcGVNZXRhZGF0YShpZC5yZWZlcmVuY2UpKTtcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKGxvYWRpbmcpO1xuICB9XG5cbiAgZ2V0U2hhbGxvd01vZHVsZU1ldGFkYXRhKG1vZHVsZVR5cGU6IGFueSk6IGNwbC5Db21waWxlU2hhbGxvd01vZHVsZU1ldGFkYXRhfG51bGwge1xuICAgIGxldCBjb21waWxlTWV0YSA9IHRoaXMuX3NoYWxsb3dNb2R1bGVDYWNoZS5nZXQobW9kdWxlVHlwZSk7XG4gICAgaWYgKGNvbXBpbGVNZXRhKSB7XG4gICAgICByZXR1cm4gY29tcGlsZU1ldGE7XG4gICAgfVxuXG4gICAgY29uc3QgbmdNb2R1bGVNZXRhID1cbiAgICAgICAgZmluZExhc3QodGhpcy5fcmVmbGVjdG9yLnNoYWxsb3dBbm5vdGF0aW9ucyhtb2R1bGVUeXBlKSwgY3JlYXRlTmdNb2R1bGUuaXNUeXBlT2YpO1xuXG4gICAgY29tcGlsZU1ldGEgPSB7XG4gICAgICB0eXBlOiB0aGlzLl9nZXRUeXBlTWV0YWRhdGEobW9kdWxlVHlwZSksXG4gICAgICByYXdFeHBvcnRzOiBuZ01vZHVsZU1ldGEuZXhwb3J0cyxcbiAgICAgIHJhd0ltcG9ydHM6IG5nTW9kdWxlTWV0YS5pbXBvcnRzLFxuICAgICAgcmF3UHJvdmlkZXJzOiBuZ01vZHVsZU1ldGEucHJvdmlkZXJzLFxuICAgIH07XG5cbiAgICB0aGlzLl9zaGFsbG93TW9kdWxlQ2FjaGUuc2V0KG1vZHVsZVR5cGUsIGNvbXBpbGVNZXRhKTtcbiAgICByZXR1cm4gY29tcGlsZU1ldGE7XG4gIH1cblxuICBnZXROZ01vZHVsZU1ldGFkYXRhKFxuICAgICAgbW9kdWxlVHlwZTogYW55LCB0aHJvd0lmTm90Rm91bmQgPSB0cnVlLFxuICAgICAgYWxyZWFkeUNvbGxlY3Rpbmc6IFNldDxhbnk+fG51bGwgPSBudWxsKTogY3BsLkNvbXBpbGVOZ01vZHVsZU1ldGFkYXRhfG51bGwge1xuICAgIG1vZHVsZVR5cGUgPSByZXNvbHZlRm9yd2FyZFJlZihtb2R1bGVUeXBlKTtcbiAgICBsZXQgY29tcGlsZU1ldGEgPSB0aGlzLl9uZ01vZHVsZUNhY2hlLmdldChtb2R1bGVUeXBlKTtcbiAgICBpZiAoY29tcGlsZU1ldGEpIHtcbiAgICAgIHJldHVybiBjb21waWxlTWV0YTtcbiAgICB9XG4gICAgY29uc3QgbWV0YSA9IHRoaXMuX25nTW9kdWxlUmVzb2x2ZXIucmVzb2x2ZShtb2R1bGVUeXBlLCB0aHJvd0lmTm90Rm91bmQpO1xuICAgIGlmICghbWV0YSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGRlY2xhcmVkRGlyZWN0aXZlczogY3BsLkNvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXSA9IFtdO1xuICAgIGNvbnN0IGV4cG9ydGVkTm9uTW9kdWxlSWRlbnRpZmllcnM6IGNwbC5Db21waWxlSWRlbnRpZmllck1ldGFkYXRhW10gPSBbXTtcbiAgICBjb25zdCBkZWNsYXJlZFBpcGVzOiBjcGwuQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdID0gW107XG4gICAgY29uc3QgaW1wb3J0ZWRNb2R1bGVzOiBjcGwuQ29tcGlsZU5nTW9kdWxlU3VtbWFyeVtdID0gW107XG4gICAgY29uc3QgZXhwb3J0ZWRNb2R1bGVzOiBjcGwuQ29tcGlsZU5nTW9kdWxlU3VtbWFyeVtdID0gW107XG4gICAgY29uc3QgcHJvdmlkZXJzOiBjcGwuQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGFbXSA9IFtdO1xuICAgIGNvbnN0IGVudHJ5Q29tcG9uZW50czogY3BsLkNvbXBpbGVFbnRyeUNvbXBvbmVudE1ldGFkYXRhW10gPSBbXTtcbiAgICBjb25zdCBib290c3RyYXBDb21wb25lbnRzOiBjcGwuQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdID0gW107XG4gICAgY29uc3Qgc2NoZW1hczogU2NoZW1hTWV0YWRhdGFbXSA9IFtdO1xuXG4gICAgaWYgKG1ldGEuaW1wb3J0cykge1xuICAgICAgZmxhdHRlbkFuZERlZHVwZUFycmF5KG1ldGEuaW1wb3J0cykuZm9yRWFjaCgoaW1wb3J0ZWRUeXBlKSA9PiB7XG4gICAgICAgIGxldCBpbXBvcnRlZE1vZHVsZVR5cGU6IFR5cGUgPSB1bmRlZmluZWQgITtcbiAgICAgICAgaWYgKGlzVmFsaWRUeXBlKGltcG9ydGVkVHlwZSkpIHtcbiAgICAgICAgICBpbXBvcnRlZE1vZHVsZVR5cGUgPSBpbXBvcnRlZFR5cGU7XG4gICAgICAgIH0gZWxzZSBpZiAoaW1wb3J0ZWRUeXBlICYmIGltcG9ydGVkVHlwZS5uZ01vZHVsZSkge1xuICAgICAgICAgIGNvbnN0IG1vZHVsZVdpdGhQcm92aWRlcnM6IE1vZHVsZVdpdGhQcm92aWRlcnMgPSBpbXBvcnRlZFR5cGU7XG4gICAgICAgICAgaW1wb3J0ZWRNb2R1bGVUeXBlID0gbW9kdWxlV2l0aFByb3ZpZGVycy5uZ01vZHVsZTtcbiAgICAgICAgICBpZiAobW9kdWxlV2l0aFByb3ZpZGVycy5wcm92aWRlcnMpIHtcbiAgICAgICAgICAgIHByb3ZpZGVycy5wdXNoKC4uLnRoaXMuX2dldFByb3ZpZGVyc01ldGFkYXRhKFxuICAgICAgICAgICAgICAgIG1vZHVsZVdpdGhQcm92aWRlcnMucHJvdmlkZXJzLCBlbnRyeUNvbXBvbmVudHMsXG4gICAgICAgICAgICAgICAgYHByb3ZpZGVyIGZvciB0aGUgTmdNb2R1bGUgJyR7c3RyaW5naWZ5VHlwZShpbXBvcnRlZE1vZHVsZVR5cGUpfSdgLCBbXSxcbiAgICAgICAgICAgICAgICBpbXBvcnRlZFR5cGUpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW1wb3J0ZWRNb2R1bGVUeXBlKSB7XG4gICAgICAgICAgaWYgKHRoaXMuX2NoZWNrU2VsZkltcG9ydChtb2R1bGVUeXBlLCBpbXBvcnRlZE1vZHVsZVR5cGUpKSByZXR1cm47XG4gICAgICAgICAgaWYgKCFhbHJlYWR5Q29sbGVjdGluZykgYWxyZWFkeUNvbGxlY3RpbmcgPSBuZXcgU2V0KCk7XG4gICAgICAgICAgaWYgKGFscmVhZHlDb2xsZWN0aW5nLmhhcyhpbXBvcnRlZE1vZHVsZVR5cGUpKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgICAgICBzeW50YXhFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgYCR7dGhpcy5fZ2V0VHlwZURlc2NyaXB0b3IoaW1wb3J0ZWRNb2R1bGVUeXBlKX0gJyR7c3RyaW5naWZ5VHlwZShpbXBvcnRlZFR5cGUpfScgaXMgaW1wb3J0ZWQgcmVjdXJzaXZlbHkgYnkgdGhlIG1vZHVsZSAnJHtzdHJpbmdpZnlUeXBlKG1vZHVsZVR5cGUpfScuYCksXG4gICAgICAgICAgICAgICAgbW9kdWxlVHlwZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGFscmVhZHlDb2xsZWN0aW5nLmFkZChpbXBvcnRlZE1vZHVsZVR5cGUpO1xuICAgICAgICAgIGNvbnN0IGltcG9ydGVkTW9kdWxlU3VtbWFyeSA9XG4gICAgICAgICAgICAgIHRoaXMuZ2V0TmdNb2R1bGVTdW1tYXJ5KGltcG9ydGVkTW9kdWxlVHlwZSwgYWxyZWFkeUNvbGxlY3RpbmcpO1xuICAgICAgICAgIGFscmVhZHlDb2xsZWN0aW5nLmRlbGV0ZShpbXBvcnRlZE1vZHVsZVR5cGUpO1xuICAgICAgICAgIGlmICghaW1wb3J0ZWRNb2R1bGVTdW1tYXJ5KSB7XG4gICAgICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgICAgICBzeW50YXhFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgYFVuZXhwZWN0ZWQgJHt0aGlzLl9nZXRUeXBlRGVzY3JpcHRvcihpbXBvcnRlZFR5cGUpfSAnJHtzdHJpbmdpZnlUeXBlKGltcG9ydGVkVHlwZSl9JyBpbXBvcnRlZCBieSB0aGUgbW9kdWxlICcke3N0cmluZ2lmeVR5cGUobW9kdWxlVHlwZSl9Jy4gUGxlYXNlIGFkZCBhIEBOZ01vZHVsZSBhbm5vdGF0aW9uLmApLFxuICAgICAgICAgICAgICAgIG1vZHVsZVR5cGUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpbXBvcnRlZE1vZHVsZXMucHVzaChpbXBvcnRlZE1vZHVsZVN1bW1hcnkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgICAgICBzeW50YXhFcnJvcihcbiAgICAgICAgICAgICAgICAgIGBVbmV4cGVjdGVkIHZhbHVlICcke3N0cmluZ2lmeVR5cGUoaW1wb3J0ZWRUeXBlKX0nIGltcG9ydGVkIGJ5IHRoZSBtb2R1bGUgJyR7c3RyaW5naWZ5VHlwZShtb2R1bGVUeXBlKX0nYCksXG4gICAgICAgICAgICAgIG1vZHVsZVR5cGUpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKG1ldGEuZXhwb3J0cykge1xuICAgICAgZmxhdHRlbkFuZERlZHVwZUFycmF5KG1ldGEuZXhwb3J0cykuZm9yRWFjaCgoZXhwb3J0ZWRUeXBlKSA9PiB7XG4gICAgICAgIGlmICghaXNWYWxpZFR5cGUoZXhwb3J0ZWRUeXBlKSkge1xuICAgICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgICAgICBzeW50YXhFcnJvcihcbiAgICAgICAgICAgICAgICAgIGBVbmV4cGVjdGVkIHZhbHVlICcke3N0cmluZ2lmeVR5cGUoZXhwb3J0ZWRUeXBlKX0nIGV4cG9ydGVkIGJ5IHRoZSBtb2R1bGUgJyR7c3RyaW5naWZ5VHlwZShtb2R1bGVUeXBlKX0nYCksXG4gICAgICAgICAgICAgIG1vZHVsZVR5cGUpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWFscmVhZHlDb2xsZWN0aW5nKSBhbHJlYWR5Q29sbGVjdGluZyA9IG5ldyBTZXQoKTtcbiAgICAgICAgaWYgKGFscmVhZHlDb2xsZWN0aW5nLmhhcyhleHBvcnRlZFR5cGUpKSB7XG4gICAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgICAgIHN5bnRheEVycm9yKFxuICAgICAgICAgICAgICAgICAgYCR7dGhpcy5fZ2V0VHlwZURlc2NyaXB0b3IoZXhwb3J0ZWRUeXBlKX0gJyR7c3RyaW5naWZ5KGV4cG9ydGVkVHlwZSl9JyBpcyBleHBvcnRlZCByZWN1cnNpdmVseSBieSB0aGUgbW9kdWxlICcke3N0cmluZ2lmeVR5cGUobW9kdWxlVHlwZSl9J2ApLFxuICAgICAgICAgICAgICBtb2R1bGVUeXBlKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgYWxyZWFkeUNvbGxlY3RpbmcuYWRkKGV4cG9ydGVkVHlwZSk7XG4gICAgICAgIGNvbnN0IGV4cG9ydGVkTW9kdWxlU3VtbWFyeSA9IHRoaXMuZ2V0TmdNb2R1bGVTdW1tYXJ5KGV4cG9ydGVkVHlwZSwgYWxyZWFkeUNvbGxlY3RpbmcpO1xuICAgICAgICBhbHJlYWR5Q29sbGVjdGluZy5kZWxldGUoZXhwb3J0ZWRUeXBlKTtcbiAgICAgICAgaWYgKGV4cG9ydGVkTW9kdWxlU3VtbWFyeSkge1xuICAgICAgICAgIGV4cG9ydGVkTW9kdWxlcy5wdXNoKGV4cG9ydGVkTW9kdWxlU3VtbWFyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZXhwb3J0ZWROb25Nb2R1bGVJZGVudGlmaWVycy5wdXNoKHRoaXMuX2dldElkZW50aWZpZXJNZXRhZGF0YShleHBvcnRlZFR5cGUpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gTm90ZTogVGhpcyB3aWxsIGJlIG1vZGlmaWVkIGxhdGVyLCBzbyB3ZSByZWx5IG9uXG4gICAgLy8gZ2V0dGluZyBhIG5ldyBpbnN0YW5jZSBldmVyeSB0aW1lIVxuICAgIGNvbnN0IHRyYW5zaXRpdmVNb2R1bGUgPSB0aGlzLl9nZXRUcmFuc2l0aXZlTmdNb2R1bGVNZXRhZGF0YShpbXBvcnRlZE1vZHVsZXMsIGV4cG9ydGVkTW9kdWxlcyk7XG4gICAgaWYgKG1ldGEuZGVjbGFyYXRpb25zKSB7XG4gICAgICBmbGF0dGVuQW5kRGVkdXBlQXJyYXkobWV0YS5kZWNsYXJhdGlvbnMpLmZvckVhY2goKGRlY2xhcmVkVHlwZSkgPT4ge1xuICAgICAgICBpZiAoIWlzVmFsaWRUeXBlKGRlY2xhcmVkVHlwZSkpIHtcbiAgICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgICAgc3ludGF4RXJyb3IoXG4gICAgICAgICAgICAgICAgICBgVW5leHBlY3RlZCB2YWx1ZSAnJHtzdHJpbmdpZnlUeXBlKGRlY2xhcmVkVHlwZSl9JyBkZWNsYXJlZCBieSB0aGUgbW9kdWxlICcke3N0cmluZ2lmeVR5cGUobW9kdWxlVHlwZSl9J2ApLFxuICAgICAgICAgICAgICBtb2R1bGVUeXBlKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGVjbGFyZWRJZGVudGlmaWVyID0gdGhpcy5fZ2V0SWRlbnRpZmllck1ldGFkYXRhKGRlY2xhcmVkVHlwZSk7XG4gICAgICAgIGlmICh0aGlzLmlzRGlyZWN0aXZlKGRlY2xhcmVkVHlwZSkpIHtcbiAgICAgICAgICBpZiAodGhpcy5pc0Fic3RyYWN0RGlyZWN0aXZlKGRlY2xhcmVkVHlwZSkpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgICAgICAgIHN5bnRheEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgRGlyZWN0aXZlICR7c3RyaW5naWZ5VHlwZShkZWNsYXJlZFR5cGUpfSBoYXMgbm8gc2VsZWN0b3IsIHBsZWFzZSBhZGQgaXQhYCksXG4gICAgICAgICAgICAgICAgZGVjbGFyZWRUeXBlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdHJhbnNpdGl2ZU1vZHVsZS5hZGREaXJlY3RpdmUoZGVjbGFyZWRJZGVudGlmaWVyKTtcbiAgICAgICAgICBkZWNsYXJlZERpcmVjdGl2ZXMucHVzaChkZWNsYXJlZElkZW50aWZpZXIpO1xuICAgICAgICAgIHRoaXMuX2FkZFR5cGVUb01vZHVsZShkZWNsYXJlZFR5cGUsIG1vZHVsZVR5cGUpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNQaXBlKGRlY2xhcmVkVHlwZSkpIHtcbiAgICAgICAgICB0cmFuc2l0aXZlTW9kdWxlLmFkZFBpcGUoZGVjbGFyZWRJZGVudGlmaWVyKTtcbiAgICAgICAgICB0cmFuc2l0aXZlTW9kdWxlLnBpcGVzLnB1c2goZGVjbGFyZWRJZGVudGlmaWVyKTtcbiAgICAgICAgICBkZWNsYXJlZFBpcGVzLnB1c2goZGVjbGFyZWRJZGVudGlmaWVyKTtcbiAgICAgICAgICB0aGlzLl9hZGRUeXBlVG9Nb2R1bGUoZGVjbGFyZWRUeXBlLCBtb2R1bGVUeXBlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgICAgc3ludGF4RXJyb3IoXG4gICAgICAgICAgICAgICAgICBgVW5leHBlY3RlZCAke3RoaXMuX2dldFR5cGVEZXNjcmlwdG9yKGRlY2xhcmVkVHlwZSl9ICcke3N0cmluZ2lmeVR5cGUoZGVjbGFyZWRUeXBlKX0nIGRlY2xhcmVkIGJ5IHRoZSBtb2R1bGUgJyR7c3RyaW5naWZ5VHlwZShtb2R1bGVUeXBlKX0nLiBQbGVhc2UgYWRkIGEgQFBpcGUvQERpcmVjdGl2ZS9AQ29tcG9uZW50IGFubm90YXRpb24uYCksXG4gICAgICAgICAgICAgIG1vZHVsZVR5cGUpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgZXhwb3J0ZWREaXJlY3RpdmVzOiBjcGwuQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdID0gW107XG4gICAgY29uc3QgZXhwb3J0ZWRQaXBlczogY3BsLkNvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXSA9IFtdO1xuICAgIGV4cG9ydGVkTm9uTW9kdWxlSWRlbnRpZmllcnMuZm9yRWFjaCgoZXhwb3J0ZWRJZCkgPT4ge1xuICAgICAgaWYgKHRyYW5zaXRpdmVNb2R1bGUuZGlyZWN0aXZlc1NldC5oYXMoZXhwb3J0ZWRJZC5yZWZlcmVuY2UpKSB7XG4gICAgICAgIGV4cG9ydGVkRGlyZWN0aXZlcy5wdXNoKGV4cG9ydGVkSWQpO1xuICAgICAgICB0cmFuc2l0aXZlTW9kdWxlLmFkZEV4cG9ydGVkRGlyZWN0aXZlKGV4cG9ydGVkSWQpO1xuICAgICAgfSBlbHNlIGlmICh0cmFuc2l0aXZlTW9kdWxlLnBpcGVzU2V0LmhhcyhleHBvcnRlZElkLnJlZmVyZW5jZSkpIHtcbiAgICAgICAgZXhwb3J0ZWRQaXBlcy5wdXNoKGV4cG9ydGVkSWQpO1xuICAgICAgICB0cmFuc2l0aXZlTW9kdWxlLmFkZEV4cG9ydGVkUGlwZShleHBvcnRlZElkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgICAgc3ludGF4RXJyb3IoXG4gICAgICAgICAgICAgICAgYENhbid0IGV4cG9ydCAke3RoaXMuX2dldFR5cGVEZXNjcmlwdG9yKGV4cG9ydGVkSWQucmVmZXJlbmNlKX0gJHtzdHJpbmdpZnlUeXBlKGV4cG9ydGVkSWQucmVmZXJlbmNlKX0gZnJvbSAke3N0cmluZ2lmeVR5cGUobW9kdWxlVHlwZSl9IGFzIGl0IHdhcyBuZWl0aGVyIGRlY2xhcmVkIG5vciBpbXBvcnRlZCFgKSxcbiAgICAgICAgICAgIG1vZHVsZVR5cGUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBUaGUgcHJvdmlkZXJzIG9mIHRoZSBtb2R1bGUgaGF2ZSB0byBnbyBsYXN0XG4gICAgLy8gc28gdGhhdCB0aGV5IG92ZXJ3cml0ZSBhbnkgb3RoZXIgcHJvdmlkZXIgd2UgYWxyZWFkeSBhZGRlZC5cbiAgICBpZiAobWV0YS5wcm92aWRlcnMpIHtcbiAgICAgIHByb3ZpZGVycy5wdXNoKC4uLnRoaXMuX2dldFByb3ZpZGVyc01ldGFkYXRhKFxuICAgICAgICAgIG1ldGEucHJvdmlkZXJzLCBlbnRyeUNvbXBvbmVudHMsXG4gICAgICAgICAgYHByb3ZpZGVyIGZvciB0aGUgTmdNb2R1bGUgJyR7c3RyaW5naWZ5VHlwZShtb2R1bGVUeXBlKX0nYCwgW10sIG1vZHVsZVR5cGUpKTtcbiAgICB9XG5cbiAgICBpZiAobWV0YS5lbnRyeUNvbXBvbmVudHMpIHtcbiAgICAgIGVudHJ5Q29tcG9uZW50cy5wdXNoKC4uLmZsYXR0ZW5BbmREZWR1cGVBcnJheShtZXRhLmVudHJ5Q29tcG9uZW50cylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKHR5cGUgPT4gdGhpcy5fZ2V0RW50cnlDb21wb25lbnRNZXRhZGF0YSh0eXBlKSAhKSk7XG4gICAgfVxuXG4gICAgaWYgKG1ldGEuYm9vdHN0cmFwKSB7XG4gICAgICBmbGF0dGVuQW5kRGVkdXBlQXJyYXkobWV0YS5ib290c3RyYXApLmZvckVhY2godHlwZSA9PiB7XG4gICAgICAgIGlmICghaXNWYWxpZFR5cGUodHlwZSkpIHtcbiAgICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgICAgc3ludGF4RXJyb3IoXG4gICAgICAgICAgICAgICAgICBgVW5leHBlY3RlZCB2YWx1ZSAnJHtzdHJpbmdpZnlUeXBlKHR5cGUpfScgdXNlZCBpbiB0aGUgYm9vdHN0cmFwIHByb3BlcnR5IG9mIG1vZHVsZSAnJHtzdHJpbmdpZnlUeXBlKG1vZHVsZVR5cGUpfSdgKSxcbiAgICAgICAgICAgICAgbW9kdWxlVHlwZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGJvb3RzdHJhcENvbXBvbmVudHMucHVzaCh0aGlzLl9nZXRJZGVudGlmaWVyTWV0YWRhdGEodHlwZSkpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZW50cnlDb21wb25lbnRzLnB1c2goXG4gICAgICAgIC4uLmJvb3RzdHJhcENvbXBvbmVudHMubWFwKHR5cGUgPT4gdGhpcy5fZ2V0RW50cnlDb21wb25lbnRNZXRhZGF0YSh0eXBlLnJlZmVyZW5jZSkgISkpO1xuXG4gICAgaWYgKG1ldGEuc2NoZW1hcykge1xuICAgICAgc2NoZW1hcy5wdXNoKC4uLmZsYXR0ZW5BbmREZWR1cGVBcnJheShtZXRhLnNjaGVtYXMpKTtcbiAgICB9XG5cbiAgICBjb21waWxlTWV0YSA9IG5ldyBjcGwuQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGEoe1xuICAgICAgdHlwZTogdGhpcy5fZ2V0VHlwZU1ldGFkYXRhKG1vZHVsZVR5cGUpLFxuICAgICAgcHJvdmlkZXJzLFxuICAgICAgZW50cnlDb21wb25lbnRzLFxuICAgICAgYm9vdHN0cmFwQ29tcG9uZW50cyxcbiAgICAgIHNjaGVtYXMsXG4gICAgICBkZWNsYXJlZERpcmVjdGl2ZXMsXG4gICAgICBleHBvcnRlZERpcmVjdGl2ZXMsXG4gICAgICBkZWNsYXJlZFBpcGVzLFxuICAgICAgZXhwb3J0ZWRQaXBlcyxcbiAgICAgIGltcG9ydGVkTW9kdWxlcyxcbiAgICAgIGV4cG9ydGVkTW9kdWxlcyxcbiAgICAgIHRyYW5zaXRpdmVNb2R1bGUsXG4gICAgICBpZDogbWV0YS5pZCB8fCBudWxsLFxuICAgIH0pO1xuXG4gICAgZW50cnlDb21wb25lbnRzLmZvckVhY2goKGlkKSA9PiB0cmFuc2l0aXZlTW9kdWxlLmFkZEVudHJ5Q29tcG9uZW50KGlkKSk7XG4gICAgcHJvdmlkZXJzLmZvckVhY2goKHByb3ZpZGVyKSA9PiB0cmFuc2l0aXZlTW9kdWxlLmFkZFByb3ZpZGVyKHByb3ZpZGVyLCBjb21waWxlTWV0YSAhLnR5cGUpKTtcbiAgICB0cmFuc2l0aXZlTW9kdWxlLmFkZE1vZHVsZShjb21waWxlTWV0YS50eXBlKTtcbiAgICB0aGlzLl9uZ01vZHVsZUNhY2hlLnNldChtb2R1bGVUeXBlLCBjb21waWxlTWV0YSk7XG4gICAgcmV0dXJuIGNvbXBpbGVNZXRhO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2hlY2tTZWxmSW1wb3J0KG1vZHVsZVR5cGU6IFR5cGUsIGltcG9ydGVkTW9kdWxlVHlwZTogVHlwZSk6IGJvb2xlYW4ge1xuICAgIGlmIChtb2R1bGVUeXBlID09PSBpbXBvcnRlZE1vZHVsZVR5cGUpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgIHN5bnRheEVycm9yKGAnJHtzdHJpbmdpZnlUeXBlKG1vZHVsZVR5cGUpfScgbW9kdWxlIGNhbid0IGltcG9ydCBpdHNlbGZgKSwgbW9kdWxlVHlwZSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0VHlwZURlc2NyaXB0b3IodHlwZTogVHlwZSk6IHN0cmluZyB7XG4gICAgaWYgKGlzVmFsaWRUeXBlKHR5cGUpKSB7XG4gICAgICBpZiAodGhpcy5pc0RpcmVjdGl2ZSh0eXBlKSkge1xuICAgICAgICByZXR1cm4gJ2RpcmVjdGl2ZSc7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmlzUGlwZSh0eXBlKSkge1xuICAgICAgICByZXR1cm4gJ3BpcGUnO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5pc05nTW9kdWxlKHR5cGUpKSB7XG4gICAgICAgIHJldHVybiAnbW9kdWxlJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoKHR5cGUgYXMgYW55KS5wcm92aWRlKSB7XG4gICAgICByZXR1cm4gJ3Byb3ZpZGVyJztcbiAgICB9XG5cbiAgICByZXR1cm4gJ3ZhbHVlJztcbiAgfVxuXG5cbiAgcHJpdmF0ZSBfYWRkVHlwZVRvTW9kdWxlKHR5cGU6IFR5cGUsIG1vZHVsZVR5cGU6IFR5cGUpIHtcbiAgICBjb25zdCBvbGRNb2R1bGUgPSB0aGlzLl9uZ01vZHVsZU9mVHlwZXMuZ2V0KHR5cGUpO1xuICAgIGlmIChvbGRNb2R1bGUgJiYgb2xkTW9kdWxlICE9PSBtb2R1bGVUeXBlKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICBzeW50YXhFcnJvcihcbiAgICAgICAgICAgICAgYFR5cGUgJHtzdHJpbmdpZnlUeXBlKHR5cGUpfSBpcyBwYXJ0IG9mIHRoZSBkZWNsYXJhdGlvbnMgb2YgMiBtb2R1bGVzOiAke3N0cmluZ2lmeVR5cGUob2xkTW9kdWxlKX0gYW5kICR7c3RyaW5naWZ5VHlwZShtb2R1bGVUeXBlKX0hIGAgK1xuICAgICAgICAgICAgICBgUGxlYXNlIGNvbnNpZGVyIG1vdmluZyAke3N0cmluZ2lmeVR5cGUodHlwZSl9IHRvIGEgaGlnaGVyIG1vZHVsZSB0aGF0IGltcG9ydHMgJHtzdHJpbmdpZnlUeXBlKG9sZE1vZHVsZSl9IGFuZCAke3N0cmluZ2lmeVR5cGUobW9kdWxlVHlwZSl9LiBgICtcbiAgICAgICAgICAgICAgYFlvdSBjYW4gYWxzbyBjcmVhdGUgYSBuZXcgTmdNb2R1bGUgdGhhdCBleHBvcnRzIGFuZCBpbmNsdWRlcyAke3N0cmluZ2lmeVR5cGUodHlwZSl9IHRoZW4gaW1wb3J0IHRoYXQgTmdNb2R1bGUgaW4gJHtzdHJpbmdpZnlUeXBlKG9sZE1vZHVsZSl9IGFuZCAke3N0cmluZ2lmeVR5cGUobW9kdWxlVHlwZSl9LmApLFxuICAgICAgICAgIG1vZHVsZVR5cGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9uZ01vZHVsZU9mVHlwZXMuc2V0KHR5cGUsIG1vZHVsZVR5cGUpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0VHJhbnNpdGl2ZU5nTW9kdWxlTWV0YWRhdGEoXG4gICAgICBpbXBvcnRlZE1vZHVsZXM6IGNwbC5Db21waWxlTmdNb2R1bGVTdW1tYXJ5W10sXG4gICAgICBleHBvcnRlZE1vZHVsZXM6IGNwbC5Db21waWxlTmdNb2R1bGVTdW1tYXJ5W10pOiBjcGwuVHJhbnNpdGl2ZUNvbXBpbGVOZ01vZHVsZU1ldGFkYXRhIHtcbiAgICAvLyBjb2xsZWN0IGBwcm92aWRlcnNgIC8gYGVudHJ5Q29tcG9uZW50c2AgZnJvbSBhbGwgaW1wb3J0ZWQgYW5kIGFsbCBleHBvcnRlZCBtb2R1bGVzXG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IGNwbC5UcmFuc2l0aXZlQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGEoKTtcbiAgICBjb25zdCBtb2R1bGVzQnlUb2tlbiA9IG5ldyBNYXA8YW55LCBTZXQ8YW55Pj4oKTtcbiAgICBpbXBvcnRlZE1vZHVsZXMuY29uY2F0KGV4cG9ydGVkTW9kdWxlcykuZm9yRWFjaCgobW9kU3VtbWFyeSkgPT4ge1xuICAgICAgbW9kU3VtbWFyeS5tb2R1bGVzLmZvckVhY2goKG1vZCkgPT4gcmVzdWx0LmFkZE1vZHVsZShtb2QpKTtcbiAgICAgIG1vZFN1bW1hcnkuZW50cnlDb21wb25lbnRzLmZvckVhY2goKGNvbXApID0+IHJlc3VsdC5hZGRFbnRyeUNvbXBvbmVudChjb21wKSk7XG4gICAgICBjb25zdCBhZGRlZFRva2VucyA9IG5ldyBTZXQ8YW55PigpO1xuICAgICAgbW9kU3VtbWFyeS5wcm92aWRlcnMuZm9yRWFjaCgoZW50cnkpID0+IHtcbiAgICAgICAgY29uc3QgdG9rZW5SZWYgPSBjcGwudG9rZW5SZWZlcmVuY2UoZW50cnkucHJvdmlkZXIudG9rZW4pO1xuICAgICAgICBsZXQgcHJldk1vZHVsZXMgPSBtb2R1bGVzQnlUb2tlbi5nZXQodG9rZW5SZWYpO1xuICAgICAgICBpZiAoIXByZXZNb2R1bGVzKSB7XG4gICAgICAgICAgcHJldk1vZHVsZXMgPSBuZXcgU2V0PGFueT4oKTtcbiAgICAgICAgICBtb2R1bGVzQnlUb2tlbi5zZXQodG9rZW5SZWYsIHByZXZNb2R1bGVzKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtb2R1bGVSZWYgPSBlbnRyeS5tb2R1bGUucmVmZXJlbmNlO1xuICAgICAgICAvLyBOb3RlOiB0aGUgcHJvdmlkZXJzIG9mIG9uZSBtb2R1bGUgbWF5IHN0aWxsIGNvbnRhaW4gbXVsdGlwbGUgcHJvdmlkZXJzXG4gICAgICAgIC8vIHBlciB0b2tlbiAoZS5nLiBmb3IgbXVsdGkgcHJvdmlkZXJzKSwgYW5kIHdlIG5lZWQgdG8gcHJlc2VydmUgdGhlc2UuXG4gICAgICAgIGlmIChhZGRlZFRva2Vucy5oYXModG9rZW5SZWYpIHx8ICFwcmV2TW9kdWxlcy5oYXMobW9kdWxlUmVmKSkge1xuICAgICAgICAgIHByZXZNb2R1bGVzLmFkZChtb2R1bGVSZWYpO1xuICAgICAgICAgIGFkZGVkVG9rZW5zLmFkZCh0b2tlblJlZik7XG4gICAgICAgICAgcmVzdWx0LmFkZFByb3ZpZGVyKGVudHJ5LnByb3ZpZGVyLCBlbnRyeS5tb2R1bGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBleHBvcnRlZE1vZHVsZXMuZm9yRWFjaCgobW9kU3VtbWFyeSkgPT4ge1xuICAgICAgbW9kU3VtbWFyeS5leHBvcnRlZERpcmVjdGl2ZXMuZm9yRWFjaCgoaWQpID0+IHJlc3VsdC5hZGRFeHBvcnRlZERpcmVjdGl2ZShpZCkpO1xuICAgICAgbW9kU3VtbWFyeS5leHBvcnRlZFBpcGVzLmZvckVhY2goKGlkKSA9PiByZXN1bHQuYWRkRXhwb3J0ZWRQaXBlKGlkKSk7XG4gICAgfSk7XG4gICAgaW1wb3J0ZWRNb2R1bGVzLmZvckVhY2goKG1vZFN1bW1hcnkpID0+IHtcbiAgICAgIG1vZFN1bW1hcnkuZXhwb3J0ZWREaXJlY3RpdmVzLmZvckVhY2goKGlkKSA9PiByZXN1bHQuYWRkRGlyZWN0aXZlKGlkKSk7XG4gICAgICBtb2RTdW1tYXJ5LmV4cG9ydGVkUGlwZXMuZm9yRWFjaCgoaWQpID0+IHJlc3VsdC5hZGRQaXBlKGlkKSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgX2dldElkZW50aWZpZXJNZXRhZGF0YSh0eXBlOiBUeXBlKTogY3BsLkNvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEge1xuICAgIHR5cGUgPSByZXNvbHZlRm9yd2FyZFJlZih0eXBlKTtcbiAgICByZXR1cm4ge3JlZmVyZW5jZTogdHlwZX07XG4gIH1cblxuICBpc0luamVjdGFibGUodHlwZTogYW55KTogYm9vbGVhbiB7XG4gICAgY29uc3QgYW5ub3RhdGlvbnMgPSB0aGlzLl9yZWZsZWN0b3IudHJ5QW5ub3RhdGlvbnModHlwZSk7XG4gICAgcmV0dXJuIGFubm90YXRpb25zLnNvbWUoYW5uID0+IGNyZWF0ZUluamVjdGFibGUuaXNUeXBlT2YoYW5uKSk7XG4gIH1cblxuICBnZXRJbmplY3RhYmxlU3VtbWFyeSh0eXBlOiBhbnkpOiBjcGwuQ29tcGlsZVR5cGVTdW1tYXJ5IHtcbiAgICByZXR1cm4ge1xuICAgICAgc3VtbWFyeUtpbmQ6IGNwbC5Db21waWxlU3VtbWFyeUtpbmQuSW5qZWN0YWJsZSxcbiAgICAgIHR5cGU6IHRoaXMuX2dldFR5cGVNZXRhZGF0YSh0eXBlLCBudWxsLCBmYWxzZSlcbiAgICB9O1xuICB9XG5cbiAgZ2V0SW5qZWN0YWJsZU1ldGFkYXRhKFxuICAgICAgdHlwZTogYW55LCBkZXBlbmRlbmNpZXM6IGFueVtdfG51bGwgPSBudWxsLFxuICAgICAgdGhyb3dPblVua25vd25EZXBzOiBib29sZWFuID0gdHJ1ZSk6IGNwbC5Db21waWxlSW5qZWN0YWJsZU1ldGFkYXRhfG51bGwge1xuICAgIGNvbnN0IHR5cGVTdW1tYXJ5ID0gdGhpcy5fbG9hZFN1bW1hcnkodHlwZSwgY3BsLkNvbXBpbGVTdW1tYXJ5S2luZC5JbmplY3RhYmxlKTtcbiAgICBjb25zdCB0eXBlTWV0YWRhdGEgPSB0eXBlU3VtbWFyeSA/XG4gICAgICAgIHR5cGVTdW1tYXJ5LnR5cGUgOlxuICAgICAgICB0aGlzLl9nZXRUeXBlTWV0YWRhdGEodHlwZSwgZGVwZW5kZW5jaWVzLCB0aHJvd09uVW5rbm93bkRlcHMpO1xuXG4gICAgY29uc3QgYW5ub3RhdGlvbnM6IEluamVjdGFibGVbXSA9XG4gICAgICAgIHRoaXMuX3JlZmxlY3Rvci5hbm5vdGF0aW9ucyh0eXBlKS5maWx0ZXIoYW5uID0+IGNyZWF0ZUluamVjdGFibGUuaXNUeXBlT2YoYW5uKSk7XG5cbiAgICBpZiAoYW5ub3RhdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBtZXRhID0gYW5ub3RhdGlvbnNbYW5ub3RhdGlvbnMubGVuZ3RoIC0gMV07XG4gICAgcmV0dXJuIHtcbiAgICAgIHN5bWJvbDogdHlwZSxcbiAgICAgIHR5cGU6IHR5cGVNZXRhZGF0YSxcbiAgICAgIHByb3ZpZGVkSW46IG1ldGEucHJvdmlkZWRJbixcbiAgICAgIHVzZVZhbHVlOiBtZXRhLnVzZVZhbHVlLFxuICAgICAgdXNlQ2xhc3M6IG1ldGEudXNlQ2xhc3MsXG4gICAgICB1c2VFeGlzdGluZzogbWV0YS51c2VFeGlzdGluZyxcbiAgICAgIHVzZUZhY3Rvcnk6IG1ldGEudXNlRmFjdG9yeSxcbiAgICAgIGRlcHM6IG1ldGEuZGVwcyxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0VHlwZU1ldGFkYXRhKHR5cGU6IFR5cGUsIGRlcGVuZGVuY2llczogYW55W118bnVsbCA9IG51bGwsIHRocm93T25Vbmtub3duRGVwcyA9IHRydWUpOlxuICAgICAgY3BsLkNvbXBpbGVUeXBlTWV0YWRhdGEge1xuICAgIGNvbnN0IGlkZW50aWZpZXIgPSB0aGlzLl9nZXRJZGVudGlmaWVyTWV0YWRhdGEodHlwZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlZmVyZW5jZTogaWRlbnRpZmllci5yZWZlcmVuY2UsXG4gICAgICBkaURlcHM6IHRoaXMuX2dldERlcGVuZGVuY2llc01ldGFkYXRhKGlkZW50aWZpZXIucmVmZXJlbmNlLCBkZXBlbmRlbmNpZXMsIHRocm93T25Vbmtub3duRGVwcyksXG4gICAgICBsaWZlY3ljbGVIb29rczogZ2V0QWxsTGlmZWN5Y2xlSG9va3ModGhpcy5fcmVmbGVjdG9yLCBpZGVudGlmaWVyLnJlZmVyZW5jZSksXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldEZhY3RvcnlNZXRhZGF0YShmYWN0b3J5OiBGdW5jdGlvbiwgZGVwZW5kZW5jaWVzOiBhbnlbXXxudWxsID0gbnVsbCk6XG4gICAgICBjcGwuQ29tcGlsZUZhY3RvcnlNZXRhZGF0YSB7XG4gICAgZmFjdG9yeSA9IHJlc29sdmVGb3J3YXJkUmVmKGZhY3RvcnkpO1xuICAgIHJldHVybiB7cmVmZXJlbmNlOiBmYWN0b3J5LCBkaURlcHM6IHRoaXMuX2dldERlcGVuZGVuY2llc01ldGFkYXRhKGZhY3RvcnksIGRlcGVuZGVuY2llcyl9O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG1ldGFkYXRhIGZvciB0aGUgZ2l2ZW4gcGlwZS5cbiAgICogVGhpcyBhc3N1bWVzIGBsb2FkTmdNb2R1bGVEaXJlY3RpdmVBbmRQaXBlTWV0YWRhdGFgIGhhcyBiZWVuIGNhbGxlZCBmaXJzdC5cbiAgICovXG4gIGdldFBpcGVNZXRhZGF0YShwaXBlVHlwZTogYW55KTogY3BsLkNvbXBpbGVQaXBlTWV0YWRhdGF8bnVsbCB7XG4gICAgY29uc3QgcGlwZU1ldGEgPSB0aGlzLl9waXBlQ2FjaGUuZ2V0KHBpcGVUeXBlKTtcbiAgICBpZiAoIXBpcGVNZXRhKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICBzeW50YXhFcnJvcihcbiAgICAgICAgICAgICAgYElsbGVnYWwgc3RhdGU6IGdldFBpcGVNZXRhZGF0YSBjYW4gb25seSBiZSBjYWxsZWQgYWZ0ZXIgbG9hZE5nTW9kdWxlRGlyZWN0aXZlQW5kUGlwZU1ldGFkYXRhIGZvciBhIG1vZHVsZSB0aGF0IGRlY2xhcmVzIGl0LiBQaXBlICR7c3RyaW5naWZ5VHlwZShwaXBlVHlwZSl9LmApLFxuICAgICAgICAgIHBpcGVUeXBlKTtcbiAgICB9XG4gICAgcmV0dXJuIHBpcGVNZXRhIHx8IG51bGw7XG4gIH1cblxuICBnZXRQaXBlU3VtbWFyeShwaXBlVHlwZTogYW55KTogY3BsLkNvbXBpbGVQaXBlU3VtbWFyeSB7XG4gICAgY29uc3QgcGlwZVN1bW1hcnkgPVxuICAgICAgICA8Y3BsLkNvbXBpbGVQaXBlU3VtbWFyeT50aGlzLl9sb2FkU3VtbWFyeShwaXBlVHlwZSwgY3BsLkNvbXBpbGVTdW1tYXJ5S2luZC5QaXBlKTtcbiAgICBpZiAoIXBpcGVTdW1tYXJ5KSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICBzeW50YXhFcnJvcihcbiAgICAgICAgICAgICAgYElsbGVnYWwgc3RhdGU6IENvdWxkIG5vdCBsb2FkIHRoZSBzdW1tYXJ5IGZvciBwaXBlICR7c3RyaW5naWZ5VHlwZShwaXBlVHlwZSl9LmApLFxuICAgICAgICAgIHBpcGVUeXBlKTtcbiAgICB9XG4gICAgcmV0dXJuIHBpcGVTdW1tYXJ5O1xuICB9XG5cbiAgZ2V0T3JMb2FkUGlwZU1ldGFkYXRhKHBpcGVUeXBlOiBhbnkpOiBjcGwuQ29tcGlsZVBpcGVNZXRhZGF0YSB7XG4gICAgbGV0IHBpcGVNZXRhID0gdGhpcy5fcGlwZUNhY2hlLmdldChwaXBlVHlwZSk7XG4gICAgaWYgKCFwaXBlTWV0YSkge1xuICAgICAgcGlwZU1ldGEgPSB0aGlzLl9sb2FkUGlwZU1ldGFkYXRhKHBpcGVUeXBlKTtcbiAgICB9XG4gICAgcmV0dXJuIHBpcGVNZXRhO1xuICB9XG5cbiAgcHJpdmF0ZSBfbG9hZFBpcGVNZXRhZGF0YShwaXBlVHlwZTogYW55KTogY3BsLkNvbXBpbGVQaXBlTWV0YWRhdGEge1xuICAgIHBpcGVUeXBlID0gcmVzb2x2ZUZvcndhcmRSZWYocGlwZVR5cGUpO1xuICAgIGNvbnN0IHBpcGVBbm5vdGF0aW9uID0gdGhpcy5fcGlwZVJlc29sdmVyLnJlc29sdmUocGlwZVR5cGUpICE7XG5cbiAgICBjb25zdCBwaXBlTWV0YSA9IG5ldyBjcGwuQ29tcGlsZVBpcGVNZXRhZGF0YSh7XG4gICAgICB0eXBlOiB0aGlzLl9nZXRUeXBlTWV0YWRhdGEocGlwZVR5cGUpLFxuICAgICAgbmFtZTogcGlwZUFubm90YXRpb24ubmFtZSxcbiAgICAgIHB1cmU6ICEhcGlwZUFubm90YXRpb24ucHVyZVxuICAgIH0pO1xuICAgIHRoaXMuX3BpcGVDYWNoZS5zZXQocGlwZVR5cGUsIHBpcGVNZXRhKTtcbiAgICB0aGlzLl9zdW1tYXJ5Q2FjaGUuc2V0KHBpcGVUeXBlLCBwaXBlTWV0YS50b1N1bW1hcnkoKSk7XG4gICAgcmV0dXJuIHBpcGVNZXRhO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0RGVwZW5kZW5jaWVzTWV0YWRhdGEoXG4gICAgICB0eXBlT3JGdW5jOiBUeXBlfEZ1bmN0aW9uLCBkZXBlbmRlbmNpZXM6IGFueVtdfG51bGwsXG4gICAgICB0aHJvd09uVW5rbm93bkRlcHMgPSB0cnVlKTogY3BsLkNvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YVtdIHtcbiAgICBsZXQgaGFzVW5rbm93bkRlcHMgPSBmYWxzZTtcbiAgICBjb25zdCBwYXJhbXMgPSBkZXBlbmRlbmNpZXMgfHwgdGhpcy5fcmVmbGVjdG9yLnBhcmFtZXRlcnModHlwZU9yRnVuYykgfHwgW107XG5cbiAgICBjb25zdCBkZXBlbmRlbmNpZXNNZXRhZGF0YTogY3BsLkNvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YVtdID0gcGFyYW1zLm1hcCgocGFyYW0pID0+IHtcbiAgICAgIGxldCBpc0F0dHJpYnV0ZSA9IGZhbHNlO1xuICAgICAgbGV0IGlzSG9zdCA9IGZhbHNlO1xuICAgICAgbGV0IGlzU2VsZiA9IGZhbHNlO1xuICAgICAgbGV0IGlzU2tpcFNlbGYgPSBmYWxzZTtcbiAgICAgIGxldCBpc09wdGlvbmFsID0gZmFsc2U7XG4gICAgICBsZXQgdG9rZW46IGFueSA9IG51bGw7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShwYXJhbSkpIHtcbiAgICAgICAgcGFyYW0uZm9yRWFjaCgocGFyYW1FbnRyeTogYW55KSA9PiB7XG4gICAgICAgICAgaWYgKGNyZWF0ZUhvc3QuaXNUeXBlT2YocGFyYW1FbnRyeSkpIHtcbiAgICAgICAgICAgIGlzSG9zdCA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIGlmIChjcmVhdGVTZWxmLmlzVHlwZU9mKHBhcmFtRW50cnkpKSB7XG4gICAgICAgICAgICBpc1NlbGYgPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY3JlYXRlU2tpcFNlbGYuaXNUeXBlT2YocGFyYW1FbnRyeSkpIHtcbiAgICAgICAgICAgIGlzU2tpcFNlbGYgPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY3JlYXRlT3B0aW9uYWwuaXNUeXBlT2YocGFyYW1FbnRyeSkpIHtcbiAgICAgICAgICAgIGlzT3B0aW9uYWwgPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY3JlYXRlQXR0cmlidXRlLmlzVHlwZU9mKHBhcmFtRW50cnkpKSB7XG4gICAgICAgICAgICBpc0F0dHJpYnV0ZSA9IHRydWU7XG4gICAgICAgICAgICB0b2tlbiA9IChwYXJhbUVudHJ5IGFzIGFueSkuYXR0cmlidXRlTmFtZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGNyZWF0ZUluamVjdC5pc1R5cGVPZihwYXJhbUVudHJ5KSkge1xuICAgICAgICAgICAgdG9rZW4gPSAocGFyYW1FbnRyeSBhcyBhbnkpLnRva2VuO1xuICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgIGNyZWF0ZUluamVjdGlvblRva2VuLmlzVHlwZU9mKHBhcmFtRW50cnkpIHx8XG4gICAgICAgICAgICAgIChwYXJhbUVudHJ5IGFzIGFueSkgaW5zdGFuY2VvZiBTdGF0aWNTeW1ib2wpIHtcbiAgICAgICAgICAgIHRva2VuID0gcGFyYW1FbnRyeTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGlzVmFsaWRUeXBlKHBhcmFtRW50cnkpICYmIHRva2VuID09IG51bGwpIHtcbiAgICAgICAgICAgIHRva2VuID0gcGFyYW1FbnRyeTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdG9rZW4gPSBwYXJhbTtcbiAgICAgIH1cbiAgICAgIGlmICh0b2tlbiA9PSBudWxsKSB7XG4gICAgICAgIGhhc1Vua25vd25EZXBzID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBpc0F0dHJpYnV0ZSxcbiAgICAgICAgaXNIb3N0LFxuICAgICAgICBpc1NlbGYsXG4gICAgICAgIGlzU2tpcFNlbGYsXG4gICAgICAgIGlzT3B0aW9uYWwsXG4gICAgICAgIHRva2VuOiB0aGlzLl9nZXRUb2tlbk1ldGFkYXRhKHRva2VuKVxuICAgICAgfTtcblxuICAgIH0pO1xuXG4gICAgaWYgKGhhc1Vua25vd25EZXBzKSB7XG4gICAgICBjb25zdCBkZXBzVG9rZW5zID1cbiAgICAgICAgICBkZXBlbmRlbmNpZXNNZXRhZGF0YS5tYXAoKGRlcCkgPT4gZGVwLnRva2VuID8gc3RyaW5naWZ5VHlwZShkZXAudG9rZW4pIDogJz8nKS5qb2luKCcsICcpO1xuICAgICAgY29uc3QgbWVzc2FnZSA9XG4gICAgICAgICAgYENhbid0IHJlc29sdmUgYWxsIHBhcmFtZXRlcnMgZm9yICR7c3RyaW5naWZ5VHlwZSh0eXBlT3JGdW5jKX06ICgke2RlcHNUb2tlbnN9KS5gO1xuICAgICAgaWYgKHRocm93T25Vbmtub3duRGVwcyB8fCB0aGlzLl9jb25maWcuc3RyaWN0SW5qZWN0aW9uUGFyYW1ldGVycykge1xuICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihzeW50YXhFcnJvcihtZXNzYWdlKSwgdHlwZU9yRnVuYyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9jb25zb2xlLndhcm4oYFdhcm5pbmc6ICR7bWVzc2FnZX0gVGhpcyB3aWxsIGJlY29tZSBhbiBlcnJvciBpbiBBbmd1bGFyIHY2LnhgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGVwZW5kZW5jaWVzTWV0YWRhdGE7XG4gIH1cblxuICBwcml2YXRlIF9nZXRUb2tlbk1ldGFkYXRhKHRva2VuOiBhbnkpOiBjcGwuQ29tcGlsZVRva2VuTWV0YWRhdGEge1xuICAgIHRva2VuID0gcmVzb2x2ZUZvcndhcmRSZWYodG9rZW4pO1xuICAgIGxldCBjb21waWxlVG9rZW46IGNwbC5Db21waWxlVG9rZW5NZXRhZGF0YTtcbiAgICBpZiAodHlwZW9mIHRva2VuID09PSAnc3RyaW5nJykge1xuICAgICAgY29tcGlsZVRva2VuID0ge3ZhbHVlOiB0b2tlbn07XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbXBpbGVUb2tlbiA9IHtpZGVudGlmaWVyOiB7cmVmZXJlbmNlOiB0b2tlbn19O1xuICAgIH1cbiAgICByZXR1cm4gY29tcGlsZVRva2VuO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0UHJvdmlkZXJzTWV0YWRhdGEoXG4gICAgICBwcm92aWRlcnM6IFByb3ZpZGVyW10sIHRhcmdldEVudHJ5Q29tcG9uZW50czogY3BsLkNvbXBpbGVFbnRyeUNvbXBvbmVudE1ldGFkYXRhW10sXG4gICAgICBkZWJ1Z0luZm8/OiBzdHJpbmcsIGNvbXBpbGVQcm92aWRlcnM6IGNwbC5Db21waWxlUHJvdmlkZXJNZXRhZGF0YVtdID0gW10sXG4gICAgICB0eXBlPzogYW55KTogY3BsLkNvbXBpbGVQcm92aWRlck1ldGFkYXRhW10ge1xuICAgIHByb3ZpZGVycy5mb3JFYWNoKChwcm92aWRlcjogYW55LCBwcm92aWRlcklkeDogbnVtYmVyKSA9PiB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShwcm92aWRlcikpIHtcbiAgICAgICAgdGhpcy5fZ2V0UHJvdmlkZXJzTWV0YWRhdGEocHJvdmlkZXIsIHRhcmdldEVudHJ5Q29tcG9uZW50cywgZGVidWdJbmZvLCBjb21waWxlUHJvdmlkZXJzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb3ZpZGVyID0gcmVzb2x2ZUZvcndhcmRSZWYocHJvdmlkZXIpO1xuICAgICAgICBsZXQgcHJvdmlkZXJNZXRhOiBjcGwuUHJvdmlkZXJNZXRhID0gdW5kZWZpbmVkICE7XG4gICAgICAgIGlmIChwcm92aWRlciAmJiB0eXBlb2YgcHJvdmlkZXIgPT09ICdvYmplY3QnICYmIHByb3ZpZGVyLmhhc093blByb3BlcnR5KCdwcm92aWRlJykpIHtcbiAgICAgICAgICB0aGlzLl92YWxpZGF0ZVByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgICAgICAgICBwcm92aWRlck1ldGEgPSBuZXcgY3BsLlByb3ZpZGVyTWV0YShwcm92aWRlci5wcm92aWRlLCBwcm92aWRlcik7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNWYWxpZFR5cGUocHJvdmlkZXIpKSB7XG4gICAgICAgICAgcHJvdmlkZXJNZXRhID0gbmV3IGNwbC5Qcm92aWRlck1ldGEocHJvdmlkZXIsIHt1c2VDbGFzczogcHJvdmlkZXJ9KTtcbiAgICAgICAgfSBlbHNlIGlmIChwcm92aWRlciA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3Ioc3ludGF4RXJyb3IoXG4gICAgICAgICAgICAgIGBFbmNvdW50ZXJlZCB1bmRlZmluZWQgcHJvdmlkZXIhIFVzdWFsbHkgdGhpcyBtZWFucyB5b3UgaGF2ZSBhIGNpcmN1bGFyIGRlcGVuZGVuY2llcy4gVGhpcyBtaWdodCBiZSBjYXVzZWQgYnkgdXNpbmcgJ2JhcnJlbCcgaW5kZXgudHMgZmlsZXMuYCkpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBwcm92aWRlcnNJbmZvID1cbiAgICAgICAgICAgICAgcHJvdmlkZXJzXG4gICAgICAgICAgICAgICAgICAucmVkdWNlKFxuICAgICAgICAgICAgICAgICAgICAgIChzb0Zhcjogc3RyaW5nW10sIHNlZW5Qcm92aWRlcjogYW55LCBzZWVuUHJvdmlkZXJJZHg6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlZW5Qcm92aWRlcklkeCA8IHByb3ZpZGVySWR4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNvRmFyLnB1c2goYCR7c3RyaW5naWZ5VHlwZShzZWVuUHJvdmlkZXIpfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzZWVuUHJvdmlkZXJJZHggPT0gcHJvdmlkZXJJZHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc29GYXIucHVzaChgPyR7c3RyaW5naWZ5VHlwZShzZWVuUHJvdmlkZXIpfT9gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VlblByb3ZpZGVySWR4ID09IHByb3ZpZGVySWR4ICsgMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBzb0Zhci5wdXNoKCcuLi4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzb0ZhcjtcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIFtdKVxuICAgICAgICAgICAgICAgICAgLmpvaW4oJywgJyk7XG4gICAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgICAgIHN5bnRheEVycm9yKFxuICAgICAgICAgICAgICAgICAgYEludmFsaWQgJHtkZWJ1Z0luZm8gPyBkZWJ1Z0luZm8gOiAncHJvdmlkZXInfSAtIG9ubHkgaW5zdGFuY2VzIG9mIFByb3ZpZGVyIGFuZCBUeXBlIGFyZSBhbGxvd2VkLCBnb3Q6IFske3Byb3ZpZGVyc0luZm99XWApLFxuICAgICAgICAgICAgICB0eXBlKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByb3ZpZGVyTWV0YS50b2tlbiA9PT1cbiAgICAgICAgICAgIHRoaXMuX3JlZmxlY3Rvci5yZXNvbHZlRXh0ZXJuYWxSZWZlcmVuY2UoSWRlbnRpZmllcnMuQU5BTFlaRV9GT1JfRU5UUllfQ09NUE9ORU5UUykpIHtcbiAgICAgICAgICB0YXJnZXRFbnRyeUNvbXBvbmVudHMucHVzaCguLi50aGlzLl9nZXRFbnRyeUNvbXBvbmVudHNGcm9tUHJvdmlkZXIocHJvdmlkZXJNZXRhLCB0eXBlKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29tcGlsZVByb3ZpZGVycy5wdXNoKHRoaXMuZ2V0UHJvdmlkZXJNZXRhZGF0YShwcm92aWRlck1ldGEpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjb21waWxlUHJvdmlkZXJzO1xuICB9XG5cbiAgcHJpdmF0ZSBfdmFsaWRhdGVQcm92aWRlcihwcm92aWRlcjogYW55KTogdm9pZCB7XG4gICAgaWYgKHByb3ZpZGVyLmhhc093blByb3BlcnR5KCd1c2VDbGFzcycpICYmIHByb3ZpZGVyLnVzZUNsYXNzID09IG51bGwpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKHN5bnRheEVycm9yKFxuICAgICAgICAgIGBJbnZhbGlkIHByb3ZpZGVyIGZvciAke3N0cmluZ2lmeVR5cGUocHJvdmlkZXIucHJvdmlkZSl9LiB1c2VDbGFzcyBjYW5ub3QgYmUgJHtwcm92aWRlci51c2VDbGFzc30uXG4gICAgICAgICAgIFVzdWFsbHkgaXQgaGFwcGVucyB3aGVuOlxuICAgICAgICAgICAxLiBUaGVyZSdzIGEgY2lyY3VsYXIgZGVwZW5kZW5jeSAobWlnaHQgYmUgY2F1c2VkIGJ5IHVzaW5nIGluZGV4LnRzIChiYXJyZWwpIGZpbGVzKS5cbiAgICAgICAgICAgMi4gQ2xhc3Mgd2FzIHVzZWQgYmVmb3JlIGl0IHdhcyBkZWNsYXJlZC4gVXNlIGZvcndhcmRSZWYgaW4gdGhpcyBjYXNlLmApKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9nZXRFbnRyeUNvbXBvbmVudHNGcm9tUHJvdmlkZXIocHJvdmlkZXI6IGNwbC5Qcm92aWRlck1ldGEsIHR5cGU/OiBhbnkpOlxuICAgICAgY3BsLkNvbXBpbGVFbnRyeUNvbXBvbmVudE1ldGFkYXRhW10ge1xuICAgIGNvbnN0IGNvbXBvbmVudHM6IGNwbC5Db21waWxlRW50cnlDb21wb25lbnRNZXRhZGF0YVtdID0gW107XG4gICAgY29uc3QgY29sbGVjdGVkSWRlbnRpZmllcnM6IGNwbC5Db21waWxlSWRlbnRpZmllck1ldGFkYXRhW10gPSBbXTtcblxuICAgIGlmIChwcm92aWRlci51c2VGYWN0b3J5IHx8IHByb3ZpZGVyLnVzZUV4aXN0aW5nIHx8IHByb3ZpZGVyLnVzZUNsYXNzKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICBzeW50YXhFcnJvcihgVGhlIEFOQUxZWkVfRk9SX0VOVFJZX0NPTVBPTkVOVFMgdG9rZW4gb25seSBzdXBwb3J0cyB1c2VWYWx1ZSFgKSwgdHlwZSk7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgaWYgKCFwcm92aWRlci5tdWx0aSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgc3ludGF4RXJyb3IoYFRoZSBBTkFMWVpFX0ZPUl9FTlRSWV9DT01QT05FTlRTIHRva2VuIG9ubHkgc3VwcG9ydHMgJ211bHRpID0gdHJ1ZSchYCksXG4gICAgICAgICAgdHlwZSk7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgZXh0cmFjdElkZW50aWZpZXJzKHByb3ZpZGVyLnVzZVZhbHVlLCBjb2xsZWN0ZWRJZGVudGlmaWVycyk7XG4gICAgY29sbGVjdGVkSWRlbnRpZmllcnMuZm9yRWFjaCgoaWRlbnRpZmllcikgPT4ge1xuICAgICAgY29uc3QgZW50cnkgPSB0aGlzLl9nZXRFbnRyeUNvbXBvbmVudE1ldGFkYXRhKGlkZW50aWZpZXIucmVmZXJlbmNlLCBmYWxzZSk7XG4gICAgICBpZiAoZW50cnkpIHtcbiAgICAgICAgY29tcG9uZW50cy5wdXNoKGVudHJ5KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gY29tcG9uZW50cztcbiAgfVxuXG4gIHByaXZhdGUgX2dldEVudHJ5Q29tcG9uZW50TWV0YWRhdGEoZGlyVHlwZTogYW55LCB0aHJvd0lmTm90Rm91bmQgPSB0cnVlKTpcbiAgICAgIGNwbC5Db21waWxlRW50cnlDb21wb25lbnRNZXRhZGF0YXxudWxsIHtcbiAgICBjb25zdCBkaXJNZXRhID0gdGhpcy5nZXROb25Ob3JtYWxpemVkRGlyZWN0aXZlTWV0YWRhdGEoZGlyVHlwZSk7XG4gICAgaWYgKGRpck1ldGEgJiYgZGlyTWV0YS5tZXRhZGF0YS5pc0NvbXBvbmVudCkge1xuICAgICAgcmV0dXJuIHtjb21wb25lbnRUeXBlOiBkaXJUeXBlLCBjb21wb25lbnRGYWN0b3J5OiBkaXJNZXRhLm1ldGFkYXRhLmNvbXBvbmVudEZhY3RvcnkgIX07XG4gICAgfVxuICAgIGNvbnN0IGRpclN1bW1hcnkgPVxuICAgICAgICA8Y3BsLkNvbXBpbGVEaXJlY3RpdmVTdW1tYXJ5PnRoaXMuX2xvYWRTdW1tYXJ5KGRpclR5cGUsIGNwbC5Db21waWxlU3VtbWFyeUtpbmQuRGlyZWN0aXZlKTtcbiAgICBpZiAoZGlyU3VtbWFyeSAmJiBkaXJTdW1tYXJ5LmlzQ29tcG9uZW50KSB7XG4gICAgICByZXR1cm4ge2NvbXBvbmVudFR5cGU6IGRpclR5cGUsIGNvbXBvbmVudEZhY3Rvcnk6IGRpclN1bW1hcnkuY29tcG9uZW50RmFjdG9yeSAhfTtcbiAgICB9XG4gICAgaWYgKHRocm93SWZOb3RGb3VuZCkge1xuICAgICAgdGhyb3cgc3ludGF4RXJyb3IoYCR7ZGlyVHlwZS5uYW1lfSBjYW5ub3QgYmUgdXNlZCBhcyBhbiBlbnRyeSBjb21wb25lbnQuYCk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0SW5qZWN0YWJsZVR5cGVNZXRhZGF0YSh0eXBlOiBUeXBlLCBkZXBlbmRlbmNpZXM6IGFueVtdfG51bGwgPSBudWxsKTpcbiAgICAgIGNwbC5Db21waWxlVHlwZU1ldGFkYXRhIHtcbiAgICBjb25zdCB0eXBlU3VtbWFyeSA9IHRoaXMuX2xvYWRTdW1tYXJ5KHR5cGUsIGNwbC5Db21waWxlU3VtbWFyeUtpbmQuSW5qZWN0YWJsZSk7XG4gICAgaWYgKHR5cGVTdW1tYXJ5KSB7XG4gICAgICByZXR1cm4gdHlwZVN1bW1hcnkudHlwZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2dldFR5cGVNZXRhZGF0YSh0eXBlLCBkZXBlbmRlbmNpZXMpO1xuICB9XG5cbiAgZ2V0UHJvdmlkZXJNZXRhZGF0YShwcm92aWRlcjogY3BsLlByb3ZpZGVyTWV0YSk6IGNwbC5Db21waWxlUHJvdmlkZXJNZXRhZGF0YSB7XG4gICAgbGV0IGNvbXBpbGVEZXBzOiBjcGwuQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW10gPSB1bmRlZmluZWQgITtcbiAgICBsZXQgY29tcGlsZVR5cGVNZXRhZGF0YTogY3BsLkNvbXBpbGVUeXBlTWV0YWRhdGEgPSBudWxsICE7XG4gICAgbGV0IGNvbXBpbGVGYWN0b3J5TWV0YWRhdGE6IGNwbC5Db21waWxlRmFjdG9yeU1ldGFkYXRhID0gbnVsbCAhO1xuICAgIGxldCB0b2tlbjogY3BsLkNvbXBpbGVUb2tlbk1ldGFkYXRhID0gdGhpcy5fZ2V0VG9rZW5NZXRhZGF0YShwcm92aWRlci50b2tlbik7XG5cbiAgICBpZiAocHJvdmlkZXIudXNlQ2xhc3MpIHtcbiAgICAgIGNvbXBpbGVUeXBlTWV0YWRhdGEgPVxuICAgICAgICAgIHRoaXMuX2dldEluamVjdGFibGVUeXBlTWV0YWRhdGEocHJvdmlkZXIudXNlQ2xhc3MsIHByb3ZpZGVyLmRlcGVuZGVuY2llcyk7XG4gICAgICBjb21waWxlRGVwcyA9IGNvbXBpbGVUeXBlTWV0YWRhdGEuZGlEZXBzO1xuICAgICAgaWYgKHByb3ZpZGVyLnRva2VuID09PSBwcm92aWRlci51c2VDbGFzcykge1xuICAgICAgICAvLyB1c2UgdGhlIGNvbXBpbGVUeXBlTWV0YWRhdGEgYXMgaXQgY29udGFpbnMgaW5mb3JtYXRpb24gYWJvdXQgbGlmZWN5Y2xlSG9va3MuLi5cbiAgICAgICAgdG9rZW4gPSB7aWRlbnRpZmllcjogY29tcGlsZVR5cGVNZXRhZGF0YX07XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChwcm92aWRlci51c2VGYWN0b3J5KSB7XG4gICAgICBjb21waWxlRmFjdG9yeU1ldGFkYXRhID0gdGhpcy5fZ2V0RmFjdG9yeU1ldGFkYXRhKHByb3ZpZGVyLnVzZUZhY3RvcnksIHByb3ZpZGVyLmRlcGVuZGVuY2llcyk7XG4gICAgICBjb21waWxlRGVwcyA9IGNvbXBpbGVGYWN0b3J5TWV0YWRhdGEuZGlEZXBzO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0b2tlbjogdG9rZW4sXG4gICAgICB1c2VDbGFzczogY29tcGlsZVR5cGVNZXRhZGF0YSxcbiAgICAgIHVzZVZhbHVlOiBwcm92aWRlci51c2VWYWx1ZSxcbiAgICAgIHVzZUZhY3Rvcnk6IGNvbXBpbGVGYWN0b3J5TWV0YWRhdGEsXG4gICAgICB1c2VFeGlzdGluZzogcHJvdmlkZXIudXNlRXhpc3RpbmcgPyB0aGlzLl9nZXRUb2tlbk1ldGFkYXRhKHByb3ZpZGVyLnVzZUV4aXN0aW5nKSA6IHVuZGVmaW5lZCxcbiAgICAgIGRlcHM6IGNvbXBpbGVEZXBzLFxuICAgICAgbXVsdGk6IHByb3ZpZGVyLm11bHRpXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFF1ZXJpZXNNZXRhZGF0YShcbiAgICAgIHF1ZXJpZXM6IHtba2V5OiBzdHJpbmddOiBRdWVyeX0sIGlzVmlld1F1ZXJ5OiBib29sZWFuLFxuICAgICAgZGlyZWN0aXZlVHlwZTogVHlwZSk6IGNwbC5Db21waWxlUXVlcnlNZXRhZGF0YVtdIHtcbiAgICBjb25zdCByZXM6IGNwbC5Db21waWxlUXVlcnlNZXRhZGF0YVtdID0gW107XG5cbiAgICBPYmplY3Qua2V5cyhxdWVyaWVzKS5mb3JFYWNoKChwcm9wZXJ0eU5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgcXVlcnkgPSBxdWVyaWVzW3Byb3BlcnR5TmFtZV07XG4gICAgICBpZiAocXVlcnkuaXNWaWV3UXVlcnkgPT09IGlzVmlld1F1ZXJ5KSB7XG4gICAgICAgIHJlcy5wdXNoKHRoaXMuX2dldFF1ZXJ5TWV0YWRhdGEocXVlcnksIHByb3BlcnR5TmFtZSwgZGlyZWN0aXZlVHlwZSkpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIHByaXZhdGUgX3F1ZXJ5VmFyQmluZGluZ3Moc2VsZWN0b3I6IGFueSk6IHN0cmluZ1tdIHsgcmV0dXJuIHNlbGVjdG9yLnNwbGl0KC9cXHMqLFxccyovKTsgfVxuXG4gIHByaXZhdGUgX2dldFF1ZXJ5TWV0YWRhdGEocTogUXVlcnksIHByb3BlcnR5TmFtZTogc3RyaW5nLCB0eXBlT3JGdW5jOiBUeXBlfEZ1bmN0aW9uKTpcbiAgICAgIGNwbC5Db21waWxlUXVlcnlNZXRhZGF0YSB7XG4gICAgbGV0IHNlbGVjdG9yczogY3BsLkNvbXBpbGVUb2tlbk1ldGFkYXRhW107XG4gICAgaWYgKHR5cGVvZiBxLnNlbGVjdG9yID09PSAnc3RyaW5nJykge1xuICAgICAgc2VsZWN0b3JzID1cbiAgICAgICAgICB0aGlzLl9xdWVyeVZhckJpbmRpbmdzKHEuc2VsZWN0b3IpLm1hcCh2YXJOYW1lID0+IHRoaXMuX2dldFRva2VuTWV0YWRhdGEodmFyTmFtZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXEuc2VsZWN0b3IpIHtcbiAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgICBzeW50YXhFcnJvcihcbiAgICAgICAgICAgICAgICBgQ2FuJ3QgY29uc3RydWN0IGEgcXVlcnkgZm9yIHRoZSBwcm9wZXJ0eSBcIiR7cHJvcGVydHlOYW1lfVwiIG9mIFwiJHtzdHJpbmdpZnlUeXBlKHR5cGVPckZ1bmMpfVwiIHNpbmNlIHRoZSBxdWVyeSBzZWxlY3RvciB3YXNuJ3QgZGVmaW5lZC5gKSxcbiAgICAgICAgICAgIHR5cGVPckZ1bmMpO1xuICAgICAgICBzZWxlY3RvcnMgPSBbXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGVjdG9ycyA9IFt0aGlzLl9nZXRUb2tlbk1ldGFkYXRhKHEuc2VsZWN0b3IpXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgc2VsZWN0b3JzLFxuICAgICAgZmlyc3Q6IHEuZmlyc3QsXG4gICAgICBkZXNjZW5kYW50czogcS5kZXNjZW5kYW50cywgcHJvcGVydHlOYW1lLFxuICAgICAgcmVhZDogcS5yZWFkID8gdGhpcy5fZ2V0VG9rZW5NZXRhZGF0YShxLnJlYWQpIDogbnVsbCAhLFxuICAgICAgc3RhdGljOiBxLnN0YXRpY1xuICAgIH07XG4gIH1cblxuICBwcml2YXRlIF9yZXBvcnRFcnJvcihlcnJvcjogYW55LCB0eXBlPzogYW55LCBvdGhlclR5cGU/OiBhbnkpIHtcbiAgICBpZiAodGhpcy5fZXJyb3JDb2xsZWN0b3IpIHtcbiAgICAgIHRoaXMuX2Vycm9yQ29sbGVjdG9yKGVycm9yLCB0eXBlKTtcbiAgICAgIGlmIChvdGhlclR5cGUpIHtcbiAgICAgICAgdGhpcy5fZXJyb3JDb2xsZWN0b3IoZXJyb3IsIG90aGVyVHlwZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBmbGF0dGVuQXJyYXkodHJlZTogYW55W10sIG91dDogQXJyYXk8YW55PiA9IFtdKTogQXJyYXk8YW55PiB7XG4gIGlmICh0cmVlKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0cmVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBpdGVtID0gcmVzb2x2ZUZvcndhcmRSZWYodHJlZVtpXSk7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShpdGVtKSkge1xuICAgICAgICBmbGF0dGVuQXJyYXkoaXRlbSwgb3V0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG91dC5wdXNoKGl0ZW0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG5mdW5jdGlvbiBkZWR1cGVBcnJheShhcnJheTogYW55W10pOiBBcnJheTxhbnk+IHtcbiAgaWYgKGFycmF5KSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChhcnJheSkpO1xuICB9XG4gIHJldHVybiBbXTtcbn1cblxuZnVuY3Rpb24gZmxhdHRlbkFuZERlZHVwZUFycmF5KHRyZWU6IGFueVtdKTogQXJyYXk8YW55PiB7XG4gIHJldHVybiBkZWR1cGVBcnJheShmbGF0dGVuQXJyYXkodHJlZSkpO1xufVxuXG5mdW5jdGlvbiBpc1ZhbGlkVHlwZSh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiAodmFsdWUgaW5zdGFuY2VvZiBTdGF0aWNTeW1ib2wpIHx8ICh2YWx1ZSBpbnN0YW5jZW9mIFR5cGUpO1xufVxuXG5mdW5jdGlvbiBleHRyYWN0SWRlbnRpZmllcnModmFsdWU6IGFueSwgdGFyZ2V0SWRlbnRpZmllcnM6IGNwbC5Db21waWxlSWRlbnRpZmllck1ldGFkYXRhW10pIHtcbiAgdmlzaXRWYWx1ZSh2YWx1ZSwgbmV3IF9Db21waWxlVmFsdWVDb252ZXJ0ZXIoKSwgdGFyZ2V0SWRlbnRpZmllcnMpO1xufVxuXG5jbGFzcyBfQ29tcGlsZVZhbHVlQ29udmVydGVyIGV4dGVuZHMgVmFsdWVUcmFuc2Zvcm1lciB7XG4gIHZpc2l0T3RoZXIodmFsdWU6IGFueSwgdGFyZ2V0SWRlbnRpZmllcnM6IGNwbC5Db21waWxlSWRlbnRpZmllck1ldGFkYXRhW10pOiBhbnkge1xuICAgIHRhcmdldElkZW50aWZpZXJzLnB1c2goe3JlZmVyZW5jZTogdmFsdWV9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnlUeXBlKHR5cGU6IGFueSk6IHN0cmluZyB7XG4gIGlmICh0eXBlIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sKSB7XG4gICAgcmV0dXJuIGAke3R5cGUubmFtZX0gaW4gJHt0eXBlLmZpbGVQYXRofWA7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHN0cmluZ2lmeSh0eXBlKTtcbiAgfVxufVxuXG4vKipcbiAqIEluZGljYXRlcyB0aGF0IGEgY29tcG9uZW50IGlzIHN0aWxsIGJlaW5nIGxvYWRlZCBpbiBhIHN5bmNocm9ub3VzIGNvbXBpbGUuXG4gKi9cbmZ1bmN0aW9uIGNvbXBvbmVudFN0aWxsTG9hZGluZ0Vycm9yKGNvbXBUeXBlOiBUeXBlKSB7XG4gIGNvbnN0IGVycm9yID1cbiAgICAgIEVycm9yKGBDYW4ndCBjb21waWxlIHN5bmNocm9ub3VzbHkgYXMgJHtzdHJpbmdpZnkoY29tcFR5cGUpfSBpcyBzdGlsbCBiZWluZyBsb2FkZWQhYCk7XG4gIChlcnJvciBhcyBhbnkpW0VSUk9SX0NPTVBPTkVOVF9UWVBFXSA9IGNvbXBUeXBlO1xuICByZXR1cm4gZXJyb3I7XG59XG4iXX0=