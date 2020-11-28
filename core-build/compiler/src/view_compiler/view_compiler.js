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
        define("@angular/compiler/src/view_compiler/view_compiler", ["require", "exports", "tslib", "@angular/compiler/src/compile_metadata", "@angular/compiler/src/compiler_util/expression_converter", "@angular/compiler/src/core", "@angular/compiler/src/identifiers", "@angular/compiler/src/lifecycle_reflector", "@angular/compiler/src/ml_parser/tags", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/output/value_util", "@angular/compiler/src/template_parser/template_ast", "@angular/compiler/src/view_compiler/provider_compiler"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compile_metadata_1 = require("@angular/compiler/src/compile_metadata");
    var expression_converter_1 = require("@angular/compiler/src/compiler_util/expression_converter");
    var core_1 = require("@angular/compiler/src/core");
    var identifiers_1 = require("@angular/compiler/src/identifiers");
    var lifecycle_reflector_1 = require("@angular/compiler/src/lifecycle_reflector");
    var tags_1 = require("@angular/compiler/src/ml_parser/tags");
    var o = require("@angular/compiler/src/output/output_ast");
    var value_util_1 = require("@angular/compiler/src/output/value_util");
    var template_ast_1 = require("@angular/compiler/src/template_parser/template_ast");
    var provider_compiler_1 = require("@angular/compiler/src/view_compiler/provider_compiler");
    var CLASS_ATTR = 'class';
    var STYLE_ATTR = 'style';
    var IMPLICIT_TEMPLATE_VAR = '\$implicit';
    var ViewCompileResult = /** @class */ (function () {
        function ViewCompileResult(viewClassVar, rendererTypeVar) {
            this.viewClassVar = viewClassVar;
            this.rendererTypeVar = rendererTypeVar;
        }
        return ViewCompileResult;
    }());
    exports.ViewCompileResult = ViewCompileResult;
    var ViewCompiler = /** @class */ (function () {
        function ViewCompiler(_reflector) {
            this._reflector = _reflector;
        }
        ViewCompiler.prototype.compileComponent = function (outputCtx, component, template, styles, usedPipes) {
            var _a;
            var _this = this;
            var embeddedViewCount = 0;
            var renderComponentVarName = undefined;
            if (!component.isHost) {
                var template_1 = component.template;
                var customRenderData = [];
                if (template_1.animations && template_1.animations.length) {
                    customRenderData.push(new o.LiteralMapEntry('animation', value_util_1.convertValueToOutputAst(outputCtx, template_1.animations), true));
                }
                var renderComponentVar = o.variable(compile_metadata_1.rendererTypeName(component.type.reference));
                renderComponentVarName = renderComponentVar.name;
                outputCtx.statements.push(renderComponentVar
                    .set(o.importExpr(identifiers_1.Identifiers.createRendererType2).callFn([new o.LiteralMapExpr([
                        new o.LiteralMapEntry('encapsulation', o.literal(template_1.encapsulation), false),
                        new o.LiteralMapEntry('styles', styles, false),
                        new o.LiteralMapEntry('data', new o.LiteralMapExpr(customRenderData), false)
                    ])]))
                    .toDeclStmt(o.importType(identifiers_1.Identifiers.RendererType2), [o.StmtModifier.Final, o.StmtModifier.Exported]));
            }
            var viewBuilderFactory = function (parent) {
                var embeddedViewIndex = embeddedViewCount++;
                return new ViewBuilder(_this._reflector, outputCtx, parent, component, embeddedViewIndex, usedPipes, viewBuilderFactory);
            };
            var visitor = viewBuilderFactory(null);
            visitor.visitAll([], template);
            (_a = outputCtx.statements).push.apply(_a, tslib_1.__spread(visitor.build()));
            return new ViewCompileResult(visitor.viewName, renderComponentVarName);
        };
        return ViewCompiler;
    }());
    exports.ViewCompiler = ViewCompiler;
    var LOG_VAR = o.variable('_l');
    var VIEW_VAR = o.variable('_v');
    var CHECK_VAR = o.variable('_ck');
    var COMP_VAR = o.variable('_co');
    var EVENT_NAME_VAR = o.variable('en');
    var ALLOW_DEFAULT_VAR = o.variable("ad");
    var ViewBuilder = /** @class */ (function () {
        function ViewBuilder(reflector, outputCtx, parent, component, embeddedViewIndex, usedPipes, viewBuilderFactory) {
            this.reflector = reflector;
            this.outputCtx = outputCtx;
            this.parent = parent;
            this.component = component;
            this.embeddedViewIndex = embeddedViewIndex;
            this.usedPipes = usedPipes;
            this.viewBuilderFactory = viewBuilderFactory;
            this.nodes = [];
            this.purePipeNodeIndices = Object.create(null);
            // Need Object.create so that we don't have builtin values...
            this.refNodeIndices = Object.create(null);
            this.variables = [];
            this.children = [];
            // TODO(tbosch): The old view compiler used to use an `any` type
            // for the context in any embedded view. We keep this behaivor for now
            // to be able to introduce the new view compiler without too many errors.
            this.compType = this.embeddedViewIndex > 0 ?
                o.DYNAMIC_TYPE :
                o.expressionType(outputCtx.importExpr(this.component.type.reference));
            this.viewName = compile_metadata_1.viewClassName(this.component.type.reference, this.embeddedViewIndex);
        }
        ViewBuilder.prototype.visitAll = function (variables, astNodes) {
            var _this = this;
            this.variables = variables;
            // create the pipes for the pure pipes immediately, so that we know their indices.
            if (!this.parent) {
                this.usedPipes.forEach(function (pipe) {
                    if (pipe.pure) {
                        _this.purePipeNodeIndices[pipe.name] = _this._createPipe(null, pipe);
                    }
                });
            }
            if (!this.parent) {
                this.component.viewQueries.forEach(function (query, queryIndex) {
                    // Note: queries start with id 1 so we can use the number in a Bloom filter!
                    var queryId = queryIndex + 1;
                    var bindingType = query.first ? 0 /* First */ : 1 /* All */;
                    var flags = 134217728 /* TypeViewQuery */ | calcStaticDynamicQueryFlags(query);
                    _this.nodes.push(function () { return ({
                        sourceSpan: null,
                        nodeFlags: flags,
                        nodeDef: o.importExpr(identifiers_1.Identifiers.queryDef).callFn([
                            o.literal(flags), o.literal(queryId),
                            new o.LiteralMapExpr([new o.LiteralMapEntry(query.propertyName, o.literal(bindingType), false)])
                        ])
                    }); });
                });
            }
            template_ast_1.templateVisitAll(this, astNodes);
            if (this.parent && (astNodes.length === 0 || needsAdditionalRootNode(astNodes))) {
                // if the view is an embedded view, then we need to add an additional root node in some cases
                this.nodes.push(function () { return ({
                    sourceSpan: null,
                    nodeFlags: 1 /* TypeElement */,
                    nodeDef: o.importExpr(identifiers_1.Identifiers.anchorDef).callFn([
                        o.literal(0 /* None */), o.NULL_EXPR, o.NULL_EXPR, o.literal(0)
                    ])
                }); });
            }
        };
        ViewBuilder.prototype.build = function (targetStatements) {
            if (targetStatements === void 0) { targetStatements = []; }
            this.children.forEach(function (child) { return child.build(targetStatements); });
            var _a = this._createNodeExpressions(), updateRendererStmts = _a.updateRendererStmts, updateDirectivesStmts = _a.updateDirectivesStmts, nodeDefExprs = _a.nodeDefExprs;
            var updateRendererFn = this._createUpdateFn(updateRendererStmts);
            var updateDirectivesFn = this._createUpdateFn(updateDirectivesStmts);
            var viewFlags = 0 /* None */;
            if (!this.parent && this.component.changeDetection === core_1.ChangeDetectionStrategy.OnPush) {
                console.log('OP', 2 /* OnPush */);
                viewFlags |= 2 /* OnPush */;
            }
            if (!this.parent && this.component.changeDetection === core_1.ChangeDetectionStrategy.Reactivity) {
                console.log('Reactivity', 4 /* Reactivity */);
                viewFlags |= 4 /* Reactivity */;
                viewFlags |= 2 /* OnPush */;
            }
            var viewFactory = new o.DeclareFunctionStmt(this.viewName, [new o.FnParam(LOG_VAR.name)], [new o.ReturnStatement(o.importExpr(identifiers_1.Identifiers.viewDef).callFn([
                    o.literal(viewFlags),
                    o.literalArr(nodeDefExprs),
                    updateDirectivesFn,
                    updateRendererFn,
                ]))], o.importType(identifiers_1.Identifiers.ViewDefinition), this.embeddedViewIndex === 0 ? [o.StmtModifier.Exported] : []);
            targetStatements.push(viewFactory);
            return targetStatements;
        };
        ViewBuilder.prototype._createUpdateFn = function (updateStmts) {
            var updateFn;
            if (updateStmts.length > 0) {
                var preStmts = [];
                if (!this.component.isHost && o.findReadVarNames(updateStmts).has(COMP_VAR.name)) {
                    preStmts.push(COMP_VAR.set(VIEW_VAR.prop('component')).toDeclStmt(this.compType));
                }
                updateFn = o.fn([
                    new o.FnParam(CHECK_VAR.name, o.INFERRED_TYPE),
                    new o.FnParam(VIEW_VAR.name, o.INFERRED_TYPE)
                ], tslib_1.__spread(preStmts, updateStmts), o.INFERRED_TYPE);
            }
            else {
                updateFn = o.NULL_EXPR;
            }
            return updateFn;
        };
        ViewBuilder.prototype.visitNgContent = function (ast, context) {
            // ngContentDef(ngContentIndex: number, index: number): NodeDef;
            this.nodes.push(function () { return ({
                sourceSpan: ast.sourceSpan,
                nodeFlags: 8 /* TypeNgContent */,
                nodeDef: o.importExpr(identifiers_1.Identifiers.ngContentDef).callFn([
                    o.literal(ast.ngContentIndex), o.literal(ast.index)
                ])
            }); });
        };
        ViewBuilder.prototype.visitText = function (ast, context) {
            // Static text nodes have no check function
            var checkIndex = -1;
            this.nodes.push(function () { return ({
                sourceSpan: ast.sourceSpan,
                nodeFlags: 2 /* TypeText */,
                nodeDef: o.importExpr(identifiers_1.Identifiers.textDef).callFn([
                    o.literal(checkIndex),
                    o.literal(ast.ngContentIndex),
                    o.literalArr([o.literal(ast.value)]),
                ])
            }); });
        };
        ViewBuilder.prototype.visitBoundText = function (ast, context) {
            var _this = this;
            var nodeIndex = this.nodes.length;
            // reserve the space in the nodeDefs array
            this.nodes.push(null);
            var astWithSource = ast.value;
            var inter = astWithSource.ast;
            var updateRendererExpressions = inter.expressions.map(function (expr, bindingIndex) { return _this._preprocessUpdateExpression({ nodeIndex: nodeIndex, bindingIndex: bindingIndex, sourceSpan: ast.sourceSpan, context: COMP_VAR, value: expr }); });
            // Check index is the same as the node index during compilation
            // They might only differ at runtime
            var checkIndex = nodeIndex;
            this.nodes[nodeIndex] = function () { return ({
                sourceSpan: ast.sourceSpan,
                nodeFlags: 2 /* TypeText */,
                nodeDef: o.importExpr(identifiers_1.Identifiers.textDef).callFn([
                    o.literal(checkIndex),
                    o.literal(ast.ngContentIndex),
                    o.literalArr(inter.strings.map(function (s) { return o.literal(s); })),
                ]),
                updateRenderer: updateRendererExpressions
            }); };
        };
        ViewBuilder.prototype.visitEmbeddedTemplate = function (ast, context) {
            var _this = this;
            var nodeIndex = this.nodes.length;
            // reserve the space in the nodeDefs array
            this.nodes.push(null);
            var _a = this._visitElementOrTemplate(nodeIndex, ast), flags = _a.flags, queryMatchesExpr = _a.queryMatchesExpr, hostEvents = _a.hostEvents;
            var childVisitor = this.viewBuilderFactory(this);
            this.children.push(childVisitor);
            childVisitor.visitAll(ast.variables, ast.children);
            var childCount = this.nodes.length - nodeIndex - 1;
            // anchorDef(
            //   flags: NodeFlags, matchedQueries: [string, QueryValueType][], ngContentIndex: number,
            //   childCount: number, handleEventFn?: ElementHandleEventFn, templateFactory?:
            //   ViewDefinitionFactory): NodeDef;
            this.nodes[nodeIndex] = function () { return ({
                sourceSpan: ast.sourceSpan,
                nodeFlags: 1 /* TypeElement */ | flags,
                nodeDef: o.importExpr(identifiers_1.Identifiers.anchorDef).callFn([
                    o.literal(flags),
                    queryMatchesExpr,
                    o.literal(ast.ngContentIndex),
                    o.literal(childCount),
                    _this._createElementHandleEventFn(nodeIndex, hostEvents),
                    o.variable(childVisitor.viewName),
                ])
            }); };
        };
        ViewBuilder.prototype.visitElement = function (ast, context) {
            var _this = this;
            var nodeIndex = this.nodes.length;
            // reserve the space in the nodeDefs array so we can add children
            this.nodes.push(null);
            // Using a null element name creates an anchor.
            var elName = tags_1.isNgContainer(ast.name) ? null : ast.name;
            var _a = this._visitElementOrTemplate(nodeIndex, ast), flags = _a.flags, usedEvents = _a.usedEvents, queryMatchesExpr = _a.queryMatchesExpr, dirHostBindings = _a.hostBindings, hostEvents = _a.hostEvents;
            var inputDefs = [];
            var updateRendererExpressions = [];
            var outputDefs = [];
            if (elName) {
                var hostBindings = ast.inputs
                    .map(function (inputAst) { return ({
                    context: COMP_VAR,
                    inputAst: inputAst,
                    dirAst: null,
                }); })
                    .concat(dirHostBindings);
                if (hostBindings.length) {
                    updateRendererExpressions =
                        hostBindings.map(function (hostBinding, bindingIndex) { return _this._preprocessUpdateExpression({
                            context: hostBinding.context,
                            nodeIndex: nodeIndex,
                            bindingIndex: bindingIndex,
                            sourceSpan: hostBinding.inputAst.sourceSpan,
                            value: hostBinding.inputAst.value
                        }); });
                    inputDefs = hostBindings.map(function (hostBinding) { return elementBindingDef(hostBinding.inputAst, hostBinding.dirAst); });
                }
                outputDefs = usedEvents.map(function (_a) {
                    var _b = tslib_1.__read(_a, 2), target = _b[0], eventName = _b[1];
                    return o.literalArr([o.literal(target), o.literal(eventName)]);
                });
            }
            template_ast_1.templateVisitAll(this, ast.children);
            var childCount = this.nodes.length - nodeIndex - 1;
            var compAst = ast.directives.find(function (dirAst) { return dirAst.directive.isComponent; });
            var compRendererType = o.NULL_EXPR;
            var compView = o.NULL_EXPR;
            if (compAst) {
                compView = this.outputCtx.importExpr(compAst.directive.componentViewType);
                compRendererType = this.outputCtx.importExpr(compAst.directive.rendererType);
            }
            // Check index is the same as the node index during compilation
            // They might only differ at runtime
            var checkIndex = nodeIndex;
            this.nodes[nodeIndex] = function () { return ({
                sourceSpan: ast.sourceSpan,
                nodeFlags: 1 /* TypeElement */ | flags,
                nodeDef: o.importExpr(identifiers_1.Identifiers.elementDef).callFn([
                    o.literal(checkIndex),
                    o.literal(flags),
                    queryMatchesExpr,
                    o.literal(ast.ngContentIndex),
                    o.literal(childCount),
                    o.literal(elName),
                    elName ? fixedAttrsDef(ast) : o.NULL_EXPR,
                    inputDefs.length ? o.literalArr(inputDefs) : o.NULL_EXPR,
                    outputDefs.length ? o.literalArr(outputDefs) : o.NULL_EXPR,
                    _this._createElementHandleEventFn(nodeIndex, hostEvents),
                    compView,
                    compRendererType,
                ]),
                updateRenderer: updateRendererExpressions
            }); };
        };
        ViewBuilder.prototype._visitElementOrTemplate = function (nodeIndex, ast) {
            var _this = this;
            var flags = 0 /* None */;
            if (ast.hasViewContainer) {
                flags |= 16777216 /* EmbeddedViews */;
            }
            var usedEvents = new Map();
            ast.outputs.forEach(function (event) {
                var _a = elementEventNameAndTarget(event, null), name = _a.name, target = _a.target;
                usedEvents.set(elementEventFullName(target, name), [target, name]);
            });
            ast.directives.forEach(function (dirAst) {
                dirAst.hostEvents.forEach(function (event) {
                    var _a = elementEventNameAndTarget(event, dirAst), name = _a.name, target = _a.target;
                    usedEvents.set(elementEventFullName(target, name), [target, name]);
                });
            });
            var hostBindings = [];
            var hostEvents = [];
            this._visitComponentFactoryResolverProvider(ast.directives);
            ast.providers.forEach(function (providerAst) {
                var dirAst = undefined;
                ast.directives.forEach(function (localDirAst) {
                    if (localDirAst.directive.type.reference === compile_metadata_1.tokenReference(providerAst.token)) {
                        dirAst = localDirAst;
                    }
                });
                if (dirAst) {
                    var _a = _this._visitDirective(providerAst, dirAst, ast.references, ast.queryMatches, usedEvents), dirHostBindings = _a.hostBindings, dirHostEvents = _a.hostEvents;
                    hostBindings.push.apply(hostBindings, tslib_1.__spread(dirHostBindings));
                    hostEvents.push.apply(hostEvents, tslib_1.__spread(dirHostEvents));
                }
                else {
                    _this._visitProvider(providerAst, ast.queryMatches);
                }
            });
            var queryMatchExprs = [];
            ast.queryMatches.forEach(function (match) {
                var valueType = undefined;
                if (compile_metadata_1.tokenReference(match.value) ===
                    _this.reflector.resolveExternalReference(identifiers_1.Identifiers.ElementRef)) {
                    valueType = 0 /* ElementRef */;
                }
                else if (compile_metadata_1.tokenReference(match.value) ===
                    _this.reflector.resolveExternalReference(identifiers_1.Identifiers.ViewContainerRef)) {
                    valueType = 3 /* ViewContainerRef */;
                }
                else if (compile_metadata_1.tokenReference(match.value) ===
                    _this.reflector.resolveExternalReference(identifiers_1.Identifiers.TemplateRef)) {
                    valueType = 2 /* TemplateRef */;
                }
                if (valueType != null) {
                    queryMatchExprs.push(o.literalArr([o.literal(match.queryId), o.literal(valueType)]));
                }
            });
            ast.references.forEach(function (ref) {
                var valueType = undefined;
                if (!ref.value) {
                    valueType = 1 /* RenderElement */;
                }
                else if (compile_metadata_1.tokenReference(ref.value) ===
                    _this.reflector.resolveExternalReference(identifiers_1.Identifiers.TemplateRef)) {
                    valueType = 2 /* TemplateRef */;
                }
                if (valueType != null) {
                    _this.refNodeIndices[ref.name] = nodeIndex;
                    queryMatchExprs.push(o.literalArr([o.literal(ref.name), o.literal(valueType)]));
                }
            });
            ast.outputs.forEach(function (outputAst) {
                hostEvents.push({ context: COMP_VAR, eventAst: outputAst, dirAst: null });
            });
            return {
                flags: flags,
                usedEvents: Array.from(usedEvents.values()),
                queryMatchesExpr: queryMatchExprs.length ? o.literalArr(queryMatchExprs) : o.NULL_EXPR,
                hostBindings: hostBindings,
                hostEvents: hostEvents
            };
        };
        ViewBuilder.prototype._visitDirective = function (providerAst, dirAst, refs, queryMatches, usedEvents) {
            var _this = this;
            var nodeIndex = this.nodes.length;
            // reserve the space in the nodeDefs array so we can add children
            this.nodes.push(null);
            dirAst.directive.queries.forEach(function (query, queryIndex) {
                var queryId = dirAst.contentQueryStartId + queryIndex;
                var flags = 67108864 /* TypeContentQuery */ | calcStaticDynamicQueryFlags(query);
                var bindingType = query.first ? 0 /* First */ : 1 /* All */;
                _this.nodes.push(function () { return ({
                    sourceSpan: dirAst.sourceSpan,
                    nodeFlags: flags,
                    nodeDef: o.importExpr(identifiers_1.Identifiers.queryDef).callFn([
                        o.literal(flags), o.literal(queryId),
                        new o.LiteralMapExpr([new o.LiteralMapEntry(query.propertyName, o.literal(bindingType), false)])
                    ]),
                }); });
            });
            // Note: the operation below might also create new nodeDefs,
            // but we don't want them to be a child of a directive,
            // as they might be a provider/pipe on their own.
            // I.e. we only allow queries as children of directives nodes.
            var childCount = this.nodes.length - nodeIndex - 1;
            var _a = this._visitProviderOrDirective(providerAst, queryMatches), flags = _a.flags, queryMatchExprs = _a.queryMatchExprs, providerExpr = _a.providerExpr, depsExpr = _a.depsExpr;
            refs.forEach(function (ref) {
                if (ref.value && compile_metadata_1.tokenReference(ref.value) === compile_metadata_1.tokenReference(providerAst.token)) {
                    _this.refNodeIndices[ref.name] = nodeIndex;
                    queryMatchExprs.push(o.literalArr([o.literal(ref.name), o.literal(4 /* Provider */)]));
                }
            });
            if (dirAst.directive.isComponent) {
                flags |= 32768 /* Component */;
            }
            var inputDefs = dirAst.inputs.map(function (inputAst, inputIndex) {
                var mapValue = o.literalArr([o.literal(inputIndex), o.literal(inputAst.directiveName)]);
                // Note: it's important to not quote the key so that we can capture renames by minifiers!
                return new o.LiteralMapEntry(inputAst.directiveName, mapValue, false);
            });
            var outputDefs = [];
            var dirMeta = dirAst.directive;
            Object.keys(dirMeta.outputs).forEach(function (propName) {
                var eventName = dirMeta.outputs[propName];
                if (usedEvents.has(eventName)) {
                    // Note: it's important to not quote the key so that we can capture renames by minifiers!
                    outputDefs.push(new o.LiteralMapEntry(propName, o.literal(eventName), false));
                }
            });
            var updateDirectiveExpressions = [];
            if (dirAst.inputs.length || (flags & (262144 /* DoCheck */ | 65536 /* OnInit */)) > 0) {
                updateDirectiveExpressions =
                    dirAst.inputs.map(function (input, bindingIndex) { return _this._preprocessUpdateExpression({
                        nodeIndex: nodeIndex,
                        bindingIndex: bindingIndex,
                        sourceSpan: input.sourceSpan,
                        context: COMP_VAR,
                        value: input.value
                    }); });
            }
            var dirContextExpr = o.importExpr(identifiers_1.Identifiers.nodeValue).callFn([VIEW_VAR, o.literal(nodeIndex)]);
            var hostBindings = dirAst.hostProperties.map(function (inputAst) { return ({
                context: dirContextExpr,
                dirAst: dirAst,
                inputAst: inputAst,
            }); });
            var hostEvents = dirAst.hostEvents.map(function (hostEventAst) { return ({
                context: dirContextExpr,
                eventAst: hostEventAst, dirAst: dirAst,
            }); });
            // Check index is the same as the node index during compilation
            // They might only differ at runtime
            var checkIndex = nodeIndex;
            this.nodes[nodeIndex] = function () { return ({
                sourceSpan: dirAst.sourceSpan,
                nodeFlags: 16384 /* TypeDirective */ | flags,
                nodeDef: o.importExpr(identifiers_1.Identifiers.directiveDef).callFn([
                    o.literal(checkIndex),
                    o.literal(flags),
                    queryMatchExprs.length ? o.literalArr(queryMatchExprs) : o.NULL_EXPR,
                    o.literal(childCount),
                    providerExpr,
                    depsExpr,
                    inputDefs.length ? new o.LiteralMapExpr(inputDefs) : o.NULL_EXPR,
                    outputDefs.length ? new o.LiteralMapExpr(outputDefs) : o.NULL_EXPR,
                ]),
                updateDirectives: updateDirectiveExpressions,
                directive: dirAst.directive.type,
            }); };
            return { hostBindings: hostBindings, hostEvents: hostEvents };
        };
        ViewBuilder.prototype._visitProvider = function (providerAst, queryMatches) {
            this._addProviderNode(this._visitProviderOrDirective(providerAst, queryMatches));
        };
        ViewBuilder.prototype._visitComponentFactoryResolverProvider = function (directives) {
            var componentDirMeta = directives.find(function (dirAst) { return dirAst.directive.isComponent; });
            if (componentDirMeta && componentDirMeta.directive.entryComponents.length) {
                var _a = provider_compiler_1.componentFactoryResolverProviderDef(this.reflector, this.outputCtx, 8192 /* PrivateProvider */, componentDirMeta.directive.entryComponents), providerExpr = _a.providerExpr, depsExpr = _a.depsExpr, flags = _a.flags, tokenExpr = _a.tokenExpr;
                this._addProviderNode({
                    providerExpr: providerExpr,
                    depsExpr: depsExpr,
                    flags: flags,
                    tokenExpr: tokenExpr,
                    queryMatchExprs: [],
                    sourceSpan: componentDirMeta.sourceSpan
                });
            }
        };
        ViewBuilder.prototype._addProviderNode = function (data) {
            // providerDef(
            //   flags: NodeFlags, matchedQueries: [string, QueryValueType][], token:any,
            //   value: any, deps: ([DepFlags, any] | any)[]): NodeDef;
            this.nodes.push(function () { return ({
                sourceSpan: data.sourceSpan,
                nodeFlags: data.flags,
                nodeDef: o.importExpr(identifiers_1.Identifiers.providerDef).callFn([
                    o.literal(data.flags),
                    data.queryMatchExprs.length ? o.literalArr(data.queryMatchExprs) : o.NULL_EXPR,
                    data.tokenExpr, data.providerExpr, data.depsExpr
                ])
            }); });
        };
        ViewBuilder.prototype._visitProviderOrDirective = function (providerAst, queryMatches) {
            var flags = 0 /* None */;
            var queryMatchExprs = [];
            queryMatches.forEach(function (match) {
                if (compile_metadata_1.tokenReference(match.value) === compile_metadata_1.tokenReference(providerAst.token)) {
                    queryMatchExprs.push(o.literalArr([o.literal(match.queryId), o.literal(4 /* Provider */)]));
                }
            });
            var _a = provider_compiler_1.providerDef(this.outputCtx, providerAst), providerExpr = _a.providerExpr, depsExpr = _a.depsExpr, providerFlags = _a.flags, tokenExpr = _a.tokenExpr;
            return {
                flags: flags | providerFlags,
                queryMatchExprs: queryMatchExprs,
                providerExpr: providerExpr,
                depsExpr: depsExpr,
                tokenExpr: tokenExpr,
                sourceSpan: providerAst.sourceSpan
            };
        };
        ViewBuilder.prototype.getLocal = function (name) {
            if (name == expression_converter_1.EventHandlerVars.event.name) {
                return expression_converter_1.EventHandlerVars.event;
            }
            var currViewExpr = VIEW_VAR;
            for (var currBuilder = this; currBuilder; currBuilder = currBuilder.parent,
                currViewExpr = currViewExpr.prop('parent').cast(o.DYNAMIC_TYPE)) {
                // check references
                var refNodeIndex = currBuilder.refNodeIndices[name];
                if (refNodeIndex != null) {
                    return o.importExpr(identifiers_1.Identifiers.nodeValue).callFn([currViewExpr, o.literal(refNodeIndex)]);
                }
                // check variables
                var varAst = currBuilder.variables.find(function (varAst) { return varAst.name === name; });
                if (varAst) {
                    var varValue = varAst.value || IMPLICIT_TEMPLATE_VAR;
                    return currViewExpr.prop('context').prop(varValue);
                }
            }
            return null;
        };
        ViewBuilder.prototype.notifyImplicitReceiverUse = function () {
            // Not needed in View Engine as View Engine walks through the generated
            // expressions to figure out if the implicit receiver is used and needs
            // to be generated as part of the pre-update statements.
        };
        ViewBuilder.prototype._createLiteralArrayConverter = function (sourceSpan, argCount) {
            if (argCount === 0) {
                var valueExpr_1 = o.importExpr(identifiers_1.Identifiers.EMPTY_ARRAY);
                return function () { return valueExpr_1; };
            }
            var checkIndex = this.nodes.length;
            this.nodes.push(function () { return ({
                sourceSpan: sourceSpan,
                nodeFlags: 32 /* TypePureArray */,
                nodeDef: o.importExpr(identifiers_1.Identifiers.pureArrayDef).callFn([
                    o.literal(checkIndex),
                    o.literal(argCount),
                ])
            }); });
            return function (args) { return callCheckStmt(checkIndex, args); };
        };
        ViewBuilder.prototype._createLiteralMapConverter = function (sourceSpan, keys) {
            if (keys.length === 0) {
                var valueExpr_2 = o.importExpr(identifiers_1.Identifiers.EMPTY_MAP);
                return function () { return valueExpr_2; };
            }
            var map = o.literalMap(keys.map(function (e, i) { return (tslib_1.__assign(tslib_1.__assign({}, e), { value: o.literal(i) })); }));
            var checkIndex = this.nodes.length;
            this.nodes.push(function () { return ({
                sourceSpan: sourceSpan,
                nodeFlags: 64 /* TypePureObject */,
                nodeDef: o.importExpr(identifiers_1.Identifiers.pureObjectDef).callFn([
                    o.literal(checkIndex),
                    map,
                ])
            }); });
            return function (args) { return callCheckStmt(checkIndex, args); };
        };
        ViewBuilder.prototype._createPipeConverter = function (expression, name, argCount) {
            var pipe = this.usedPipes.find(function (pipeSummary) { return pipeSummary.name === name; });
            if (pipe.pure) {
                var checkIndex_1 = this.nodes.length;
                this.nodes.push(function () { return ({
                    sourceSpan: expression.sourceSpan,
                    nodeFlags: 128 /* TypePurePipe */,
                    nodeDef: o.importExpr(identifiers_1.Identifiers.purePipeDef).callFn([
                        o.literal(checkIndex_1),
                        o.literal(argCount),
                    ])
                }); });
                // find underlying pipe in the component view
                var compViewExpr = VIEW_VAR;
                var compBuilder = this;
                while (compBuilder.parent) {
                    compBuilder = compBuilder.parent;
                    compViewExpr = compViewExpr.prop('parent').cast(o.DYNAMIC_TYPE);
                }
                var pipeNodeIndex = compBuilder.purePipeNodeIndices[name];
                var pipeValueExpr_1 = o.importExpr(identifiers_1.Identifiers.nodeValue).callFn([compViewExpr, o.literal(pipeNodeIndex)]);
                return function (args) { return callUnwrapValue(expression.nodeIndex, expression.bindingIndex, callCheckStmt(checkIndex_1, [pipeValueExpr_1].concat(args))); };
            }
            else {
                var nodeIndex = this._createPipe(expression.sourceSpan, pipe);
                var nodeValueExpr_1 = o.importExpr(identifiers_1.Identifiers.nodeValue).callFn([VIEW_VAR, o.literal(nodeIndex)]);
                return function (args) { return callUnwrapValue(expression.nodeIndex, expression.bindingIndex, nodeValueExpr_1.callMethod('transform', args)); };
            }
        };
        ViewBuilder.prototype._createPipe = function (sourceSpan, pipe) {
            var _this = this;
            var nodeIndex = this.nodes.length;
            var flags = 0 /* None */;
            pipe.type.lifecycleHooks.forEach(function (lifecycleHook) {
                // for pipes, we only support ngOnDestroy
                if (lifecycleHook === lifecycle_reflector_1.LifecycleHooks.OnDestroy) {
                    flags |= provider_compiler_1.lifecycleHookToNodeFlag(lifecycleHook);
                }
            });
            var depExprs = pipe.type.diDeps.map(function (diDep) { return provider_compiler_1.depDef(_this.outputCtx, diDep); });
            // function pipeDef(
            //   flags: NodeFlags, ctor: any, deps: ([DepFlags, any] | any)[]): NodeDef
            this.nodes.push(function () { return ({
                sourceSpan: sourceSpan,
                nodeFlags: 16 /* TypePipe */,
                nodeDef: o.importExpr(identifiers_1.Identifiers.pipeDef).callFn([
                    o.literal(flags), _this.outputCtx.importExpr(pipe.type.reference), o.literalArr(depExprs)
                ])
            }); });
            return nodeIndex;
        };
        /**
         * For the AST in `UpdateExpression.value`:
         * - create nodes for pipes, literal arrays and, literal maps,
         * - update the AST to replace pipes, literal arrays and, literal maps with calls to check fn.
         *
         * WARNING: This might create new nodeDefs (for pipes and literal arrays and literal maps)!
         */
        ViewBuilder.prototype._preprocessUpdateExpression = function (expression) {
            var _this = this;
            return {
                nodeIndex: expression.nodeIndex,
                bindingIndex: expression.bindingIndex,
                sourceSpan: expression.sourceSpan,
                context: expression.context,
                value: expression_converter_1.convertPropertyBindingBuiltins({
                    createLiteralArrayConverter: function (argCount) { return _this._createLiteralArrayConverter(expression.sourceSpan, argCount); },
                    createLiteralMapConverter: function (keys) {
                        return _this._createLiteralMapConverter(expression.sourceSpan, keys);
                    },
                    createPipeConverter: function (name, argCount) {
                        return _this._createPipeConverter(expression, name, argCount);
                    }
                }, expression.value)
            };
        };
        ViewBuilder.prototype._createNodeExpressions = function () {
            var self = this;
            var updateBindingCount = 0;
            var updateRendererStmts = [];
            var updateDirectivesStmts = [];
            var nodeDefExprs = this.nodes.map(function (factory, nodeIndex) {
                var _a = factory(), nodeDef = _a.nodeDef, nodeFlags = _a.nodeFlags, updateDirectives = _a.updateDirectives, updateRenderer = _a.updateRenderer, sourceSpan = _a.sourceSpan;
                if (updateRenderer) {
                    updateRendererStmts.push.apply(updateRendererStmts, tslib_1.__spread(createUpdateStatements(nodeIndex, sourceSpan, updateRenderer, false)));
                }
                if (updateDirectives) {
                    updateDirectivesStmts.push.apply(updateDirectivesStmts, tslib_1.__spread(createUpdateStatements(nodeIndex, sourceSpan, updateDirectives, (nodeFlags & (262144 /* DoCheck */ | 65536 /* OnInit */)) > 0)));
                }
                // We use a comma expression to call the log function before
                // the nodeDef function, but still use the result of the nodeDef function
                // as the value.
                // Note: We only add the logger to elements / text nodes,
                // so we don't generate too much code.
                var logWithNodeDef = nodeFlags & 3 /* CatRenderNode */ ?
                    new o.CommaExpr([LOG_VAR.callFn([]).callFn([]), nodeDef]) :
                    nodeDef;
                return o.applySourceSpanToExpressionIfNeeded(logWithNodeDef, sourceSpan);
            });
            return { updateRendererStmts: updateRendererStmts, updateDirectivesStmts: updateDirectivesStmts, nodeDefExprs: nodeDefExprs };
            function createUpdateStatements(nodeIndex, sourceSpan, expressions, allowEmptyExprs) {
                var updateStmts = [];
                var exprs = expressions.map(function (_a) {
                    var sourceSpan = _a.sourceSpan, context = _a.context, value = _a.value;
                    var bindingId = "" + updateBindingCount++;
                    var nameResolver = context === COMP_VAR ? self : null;
                    var _b = expression_converter_1.convertPropertyBinding(nameResolver, context, value, bindingId, expression_converter_1.BindingForm.General), stmts = _b.stmts, currValExpr = _b.currValExpr;
                    updateStmts.push.apply(updateStmts, tslib_1.__spread(stmts.map(function (stmt) { return o.applySourceSpanToStatementIfNeeded(stmt, sourceSpan); })));
                    return o.applySourceSpanToExpressionIfNeeded(currValExpr, sourceSpan);
                });
                if (expressions.length || allowEmptyExprs) {
                    updateStmts.push(o.applySourceSpanToStatementIfNeeded(callCheckStmt(nodeIndex, exprs).toStmt(), sourceSpan));
                }
                return updateStmts;
            }
        };
        ViewBuilder.prototype._createElementHandleEventFn = function (nodeIndex, handlers) {
            var _this = this;
            var handleEventStmts = [];
            var handleEventBindingCount = 0;
            handlers.forEach(function (_a) {
                var context = _a.context, eventAst = _a.eventAst, dirAst = _a.dirAst;
                var bindingId = "" + handleEventBindingCount++;
                var nameResolver = context === COMP_VAR ? _this : null;
                var _b = expression_converter_1.convertActionBinding(nameResolver, context, eventAst.handler, bindingId), stmts = _b.stmts, allowDefault = _b.allowDefault;
                var trueStmts = stmts;
                if (allowDefault) {
                    trueStmts.push(ALLOW_DEFAULT_VAR.set(allowDefault.and(ALLOW_DEFAULT_VAR)).toStmt());
                }
                var _c = elementEventNameAndTarget(eventAst, dirAst), eventTarget = _c.target, eventName = _c.name;
                var fullEventName = elementEventFullName(eventTarget, eventName);
                handleEventStmts.push(o.applySourceSpanToStatementIfNeeded(new o.IfStmt(o.literal(fullEventName).identical(EVENT_NAME_VAR), trueStmts), eventAst.sourceSpan));
            });
            var handleEventFn;
            if (handleEventStmts.length > 0) {
                var preStmts = [ALLOW_DEFAULT_VAR.set(o.literal(true)).toDeclStmt(o.BOOL_TYPE)];
                if (!this.component.isHost && o.findReadVarNames(handleEventStmts).has(COMP_VAR.name)) {
                    preStmts.push(COMP_VAR.set(VIEW_VAR.prop('component')).toDeclStmt(this.compType));
                }
                handleEventFn = o.fn([
                    new o.FnParam(VIEW_VAR.name, o.INFERRED_TYPE),
                    new o.FnParam(EVENT_NAME_VAR.name, o.INFERRED_TYPE),
                    new o.FnParam(expression_converter_1.EventHandlerVars.event.name, o.INFERRED_TYPE)
                ], tslib_1.__spread(preStmts, handleEventStmts, [new o.ReturnStatement(ALLOW_DEFAULT_VAR)]), o.INFERRED_TYPE);
            }
            else {
                handleEventFn = o.NULL_EXPR;
            }
            return handleEventFn;
        };
        ViewBuilder.prototype.visitDirective = function (ast, context) { };
        ViewBuilder.prototype.visitDirectiveProperty = function (ast, context) { };
        ViewBuilder.prototype.visitReference = function (ast, context) { };
        ViewBuilder.prototype.visitVariable = function (ast, context) { };
        ViewBuilder.prototype.visitEvent = function (ast, context) { };
        ViewBuilder.prototype.visitElementProperty = function (ast, context) { };
        ViewBuilder.prototype.visitAttr = function (ast, context) { };
        return ViewBuilder;
    }());
    function needsAdditionalRootNode(astNodes) {
        var lastAstNode = astNodes[astNodes.length - 1];
        if (lastAstNode instanceof template_ast_1.EmbeddedTemplateAst) {
            return lastAstNode.hasViewContainer;
        }
        if (lastAstNode instanceof template_ast_1.ElementAst) {
            if (tags_1.isNgContainer(lastAstNode.name) && lastAstNode.children.length) {
                return needsAdditionalRootNode(lastAstNode.children);
            }
            return lastAstNode.hasViewContainer;
        }
        return lastAstNode instanceof template_ast_1.NgContentAst;
    }
    function elementBindingDef(inputAst, dirAst) {
        var inputType = inputAst.type;
        switch (inputType) {
            case 1 /* Attribute */:
                return o.literalArr([
                    o.literal(1 /* TypeElementAttribute */), o.literal(inputAst.name),
                    o.literal(inputAst.securityContext)
                ]);
            case 0 /* Property */:
                return o.literalArr([
                    o.literal(8 /* TypeProperty */), o.literal(inputAst.name),
                    o.literal(inputAst.securityContext)
                ]);
            case 4 /* Animation */:
                var bindingType = 8 /* TypeProperty */ |
                    (dirAst && dirAst.directive.isComponent ? 32 /* SyntheticHostProperty */ :
                        16 /* SyntheticProperty */);
                return o.literalArr([
                    o.literal(bindingType), o.literal('@' + inputAst.name), o.literal(inputAst.securityContext)
                ]);
            case 2 /* Class */:
                return o.literalArr([o.literal(2 /* TypeElementClass */), o.literal(inputAst.name), o.NULL_EXPR]);
            case 3 /* Style */:
                return o.literalArr([
                    o.literal(4 /* TypeElementStyle */), o.literal(inputAst.name), o.literal(inputAst.unit)
                ]);
            default:
                // This default case is not needed by TypeScript compiler, as the switch is exhaustive.
                // However Closure Compiler does not understand that and reports an error in typed mode.
                // The `throw new Error` below works around the problem, and the unexpected: never variable
                // makes sure tsc still checks this code is unreachable.
                var unexpected = inputType;
                throw new Error("unexpected " + unexpected);
        }
    }
    function fixedAttrsDef(elementAst) {
        var mapResult = Object.create(null);
        elementAst.attrs.forEach(function (attrAst) { mapResult[attrAst.name] = attrAst.value; });
        elementAst.directives.forEach(function (dirAst) {
            Object.keys(dirAst.directive.hostAttributes).forEach(function (name) {
                var value = dirAst.directive.hostAttributes[name];
                var prevValue = mapResult[name];
                mapResult[name] = prevValue != null ? mergeAttributeValue(name, prevValue, value) : value;
            });
        });
        // Note: We need to sort to get a defined output order
        // for tests and for caching generated artifacts...
        return o.literalArr(Object.keys(mapResult).sort().map(function (attrName) { return o.literalArr([o.literal(attrName), o.literal(mapResult[attrName])]); }));
    }
    function mergeAttributeValue(attrName, attrValue1, attrValue2) {
        if (attrName == CLASS_ATTR || attrName == STYLE_ATTR) {
            return attrValue1 + " " + attrValue2;
        }
        else {
            return attrValue2;
        }
    }
    function callCheckStmt(nodeIndex, exprs) {
        if (exprs.length > 10) {
            return CHECK_VAR.callFn([VIEW_VAR, o.literal(nodeIndex), o.literal(1 /* Dynamic */), o.literalArr(exprs)]);
        }
        else {
            return CHECK_VAR.callFn(tslib_1.__spread([VIEW_VAR, o.literal(nodeIndex), o.literal(0 /* Inline */)], exprs));
        }
    }
    function callUnwrapValue(nodeIndex, bindingIdx, expr) {
        return o.importExpr(identifiers_1.Identifiers.unwrapValue).callFn([
            VIEW_VAR, o.literal(nodeIndex), o.literal(bindingIdx), expr
        ]);
    }
    function elementEventNameAndTarget(eventAst, dirAst) {
        if (eventAst.isAnimation) {
            return {
                name: "@" + eventAst.name + "." + eventAst.phase,
                target: dirAst && dirAst.directive.isComponent ? 'component' : null
            };
        }
        else {
            return eventAst;
        }
    }
    function calcStaticDynamicQueryFlags(query) {
        var flags = 0 /* None */;
        // Note: We only make queries static that query for a single item and the user specifically
        // set the to be static. This is because of backwards compatibility with the old view compiler...
        if (query.first && query.static) {
            flags |= 268435456 /* StaticQuery */;
        }
        else {
            flags |= 536870912 /* DynamicQuery */;
        }
        return flags;
    }
    function elementEventFullName(target, name) {
        return target ? target + ":" + name : name;
    }
    exports.elementEventFullName = elementEventFullName;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy92aWV3X2NvbXBpbGVyL3ZpZXdfY29tcGlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsMkVBQXdKO0lBRXhKLGlHQUFtTTtJQUNuTSxtREFBb0k7SUFFcEksaUVBQTJDO0lBQzNDLGlGQUFzRDtJQUN0RCw2REFBZ0Q7SUFDaEQsMkRBQTBDO0lBQzFDLHNFQUE2RDtJQUU3RCxtRkFBMlU7SUFHM1UsMkZBQXNIO0lBRXRILElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQztJQUMzQixJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUM7SUFDM0IsSUFBTSxxQkFBcUIsR0FBRyxZQUFZLENBQUM7SUFFM0M7UUFDRSwyQkFBbUIsWUFBb0IsRUFBUyxlQUF1QjtZQUFwRCxpQkFBWSxHQUFaLFlBQVksQ0FBUTtZQUFTLG9CQUFlLEdBQWYsZUFBZSxDQUFRO1FBQUcsQ0FBQztRQUM3RSx3QkFBQztJQUFELENBQUMsQUFGRCxJQUVDO0lBRlksOENBQWlCO0lBSTlCO1FBQ0Usc0JBQW9CLFVBQTRCO1lBQTVCLGVBQVUsR0FBVixVQUFVLENBQWtCO1FBQUcsQ0FBQztRQUVwRCx1Q0FBZ0IsR0FBaEIsVUFDSSxTQUF3QixFQUFFLFNBQW1DLEVBQUUsUUFBdUIsRUFDdEYsTUFBb0IsRUFBRSxTQUErQjs7WUFGekQsaUJBeUNDO1lBdENDLElBQUksaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO1lBRTFCLElBQUksc0JBQXNCLEdBQVcsU0FBVyxDQUFDO1lBQ2pELElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO2dCQUNyQixJQUFNLFVBQVEsR0FBRyxTQUFTLENBQUMsUUFBVSxDQUFDO2dCQUN0QyxJQUFNLGdCQUFnQixHQUF3QixFQUFFLENBQUM7Z0JBQ2pELElBQUks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U0FBUywyQkFBMkIsQ0FBQyxLQUEyQjtRQUM5RCxJQUFJLEtBQUssZUFBaUIsQ0FBQztRQUMzQiwyRkFBMkY7UUFDM0YsaUdBQWlHO1FBQ2pHLElBQUksS0FBSyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQy9CLEtBQUssK0JBQXlCLENBQUM7U0FDaEM7YUFBTTtZQUNMLEtBQUssZ0NBQTBCLENBQUM7U0FDakM7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxTQUFnQixvQkFBb0IsQ0FBQyxNQUFxQixFQUFFLElBQVk7UUFDdEUsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFJLE1BQU0sU0FBSSxJQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUM3QyxDQUFDO0lBRkQsb0RBRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCBDb21waWxlUGlwZVN1bW1hcnksIENvbXBpbGVRdWVyeU1ldGFkYXRhLCByZW5kZXJlclR5cGVOYW1lLCB0b2tlblJlZmVyZW5jZSwgdmlld0NsYXNzTmFtZX0gZnJvbSAnLi4vY29tcGlsZV9tZXRhZGF0YSc7XG5pbXBvcnQge0NvbXBpbGVSZWZsZWN0b3J9IGZyb20gJy4uL2NvbXBpbGVfcmVmbGVjdG9yJztcbmltcG9ydCB7QmluZGluZ0Zvcm0sIEJ1aWx0aW5Db252ZXJ0ZXIsIEV2ZW50SGFuZGxlclZhcnMsIExvY2FsUmVzb2x2ZXIsIGNvbnZlcnRBY3Rpb25CaW5kaW5nLCBjb252ZXJ0UHJvcGVydHlCaW5kaW5nLCBjb252ZXJ0UHJvcGVydHlCaW5kaW5nQnVpbHRpbnN9IGZyb20gJy4uL2NvbXBpbGVyX3V0aWwvZXhwcmVzc2lvbl9jb252ZXJ0ZXInO1xuaW1wb3J0IHtBcmd1bWVudFR5cGUsIEJpbmRpbmdGbGFncywgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIE5vZGVGbGFncywgUXVlcnlCaW5kaW5nVHlwZSwgUXVlcnlWYWx1ZVR5cGUsIFZpZXdGbGFnc30gZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQge0FTVCwgQVNUV2l0aFNvdXJjZSwgSW50ZXJwb2xhdGlvbn0gZnJvbSAnLi4vZXhwcmVzc2lvbl9wYXJzZXIvYXN0JztcbmltcG9ydCB7SWRlbnRpZmllcnN9IGZyb20gJy4uL2lkZW50aWZpZXJzJztcbmltcG9ydCB7TGlmZWN5Y2xlSG9va3N9IGZyb20gJy4uL2xpZmVjeWNsZV9yZWZsZWN0b3InO1xuaW1wb3J0IHtpc05nQ29udGFpbmVyfSBmcm9tICcuLi9tbF9wYXJzZXIvdGFncyc7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7Y29udmVydFZhbHVlVG9PdXRwdXRBc3R9IGZyb20gJy4uL291dHB1dC92YWx1ZV91dGlsJztcbmltcG9ydCB7UGFyc2VTb3VyY2VTcGFufSBmcm9tICcuLi9wYXJzZV91dGlsJztcbmltcG9ydCB7QXR0ckFzdCwgQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdCwgQm91bmRFbGVtZW50UHJvcGVydHlBc3QsIEJvdW5kRXZlbnRBc3QsIEJvdW5kVGV4dEFzdCwgRGlyZWN0aXZlQXN0LCBFbGVtZW50QXN0LCBFbWJlZGRlZFRlbXBsYXRlQXN0LCBOZ0NvbnRlbnRBc3QsIFByb3BlcnR5QmluZGluZ1R5cGUsIFByb3ZpZGVyQXN0LCBRdWVyeU1hdGNoLCBSZWZlcmVuY2VBc3QsIFRlbXBsYXRlQXN0LCBUZW1wbGF0ZUFzdFZpc2l0b3IsIFRleHRBc3QsIFZhcmlhYmxlQXN0LCB0ZW1wbGF0ZVZpc2l0QWxsfSBmcm9tICcuLi90ZW1wbGF0ZV9wYXJzZXIvdGVtcGxhdGVfYXN0JztcbmltcG9ydCB7T3V0cHV0Q29udGV4dH0gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCB7Y29tcG9uZW50RmFjdG9yeVJlc29sdmVyUHJvdmlkZXJEZWYsIGRlcERlZiwgbGlmZWN5Y2xlSG9va1RvTm9kZUZsYWcsIHByb3ZpZGVyRGVmfSBmcm9tICcuL3Byb3ZpZGVyX2NvbXBpbGVyJztcblxuY29uc3QgQ0xBU1NfQVRUUiA9ICdjbGFzcyc7XG5jb25zdCBTVFlMRV9BVFRSID0gJ3N0eWxlJztcbmNvbnN0IElNUExJQ0lUX1RFTVBMQVRFX1ZBUiA9ICdcXCRpbXBsaWNpdCc7XG5cbmV4cG9ydCBjbGFzcyBWaWV3Q29tcGlsZVJlc3VsdCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2aWV3Q2xhc3NWYXI6IHN0cmluZywgcHVibGljIHJlbmRlcmVyVHlwZVZhcjogc3RyaW5nKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgVmlld0NvbXBpbGVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcmVmbGVjdG9yOiBDb21waWxlUmVmbGVjdG9yKSB7fVxuXG4gIGNvbXBpbGVDb21wb25lbnQoXG4gICAgICBvdXRwdXRDdHg6IE91dHB1dENvbnRleHQsIGNvbXBvbmVudDogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCB0ZW1wbGF0ZTogVGVtcGxhdGVBc3RbXSxcbiAgICAgIHN0eWxlczogby5FeHByZXNzaW9uLCB1c2VkUGlwZXM6IENvbXBpbGVQaXBlU3VtbWFyeVtdKTogVmlld0NvbXBpbGVSZXN1bHQge1xuICAgIGxldCBlbWJlZGRlZFZpZXdDb3VudCA9IDA7XG5cbiAgICBsZXQgcmVuZGVyQ29tcG9uZW50VmFyTmFtZTogc3RyaW5nID0gdW5kZWZpbmVkICE7XG4gICAgaWYgKCFjb21wb25lbnQuaXNIb3N0KSB7XG4gICAgICBjb25zdCB0ZW1wbGF0ZSA9IGNvbXBvbmVudC50ZW1wbGF0ZSAhO1xuICAgICAgY29uc3QgY3VzdG9tUmVuZGVyRGF0YTogby5MaXRlcmFsTWFwRW50cnlbXSA9IFtdO1xuICAgICAgaWYgKHRlbXBsYXRlLmFuaW1hdGlvbnMgJiYgdGVtcGxhdGUuYW5pbWF0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgY3VzdG9tUmVuZGVyRGF0YS5wdXNoKG5ldyBvLkxpdGVyYWxNYXBFbnRyeShcbiAgICAgICAgICAgICdhbmltYXRpb24nLCBjb252ZXJ0VmFsdWVUb091dHB1dEFzdChvdXRwdXRDdHgsIHRlbXBsYXRlLmFuaW1hdGlvbnMpLCB0cnVlKSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlbmRlckNvbXBvbmVudFZhciA9IG8udmFyaWFibGUocmVuZGVyZXJUeXBlTmFtZShjb21wb25lbnQudHlwZS5yZWZlcmVuY2UpKTtcbiAgICAgIHJlbmRlckNvbXBvbmVudFZhck5hbWUgPSByZW5kZXJDb21wb25lbnRWYXIubmFtZSAhO1xuICAgICAgb3V0cHV0Q3R4LnN0YXRlbWVudHMucHVzaChcbiAgICAgICAgICByZW5kZXJDb21wb25lbnRWYXJcbiAgICAgICAgICAgICAgLnNldChvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuY3JlYXRlUmVuZGVyZXJUeXBlMikuY2FsbEZuKFtuZXcgby5MaXRlcmFsTWFwRXhwcihbXG4gICAgICAgICAgICAgICAgbmV3IG8uTGl0ZXJhbE1hcEVudHJ5KCdlbmNhcHN1bGF0aW9uJywgby5saXRlcmFsKHRlbXBsYXRlLmVuY2Fwc3VsYXRpb24pLCBmYWxzZSksXG4gICAgICAgICAgICAgICAgbmV3IG8uTGl0ZXJhbE1hcEVudHJ5KCdzdHlsZXMnLCBzdHlsZXMsIGZhbHNlKSxcbiAgICAgICAgICAgICAgICBuZXcgby5MaXRlcmFsTWFwRW50cnkoJ2RhdGEnLCBuZXcgby5MaXRlcmFsTWFwRXhwcihjdXN0b21SZW5kZXJEYXRhKSwgZmFsc2UpXG4gICAgICAgICAgICAgIF0pXSkpXG4gICAgICAgICAgICAgIC50b0RlY2xTdG10KFxuICAgICAgICAgICAgICAgICAgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLlJlbmRlcmVyVHlwZTIpLFxuICAgICAgICAgICAgICAgICAgW28uU3RtdE1vZGlmaWVyLkZpbmFsLCBvLlN0bXRNb2RpZmllci5FeHBvcnRlZF0pKTtcbiAgICB9XG5cbiAgICBjb25zdCB2aWV3QnVpbGRlckZhY3RvcnkgPSAocGFyZW50OiBWaWV3QnVpbGRlciB8IG51bGwpOiBWaWV3QnVpbGRlciA9PiB7XG4gICAgICBjb25zdCBlbWJlZGRlZFZpZXdJbmRleCA9IGVtYmVkZGVkVmlld0NvdW50Kys7XG4gICAgICByZXR1cm4gbmV3IFZpZXdCdWlsZGVyKFxuICAgICAgICAgIHRoaXMuX3JlZmxlY3Rvciwgb3V0cHV0Q3R4LCBwYXJlbnQsIGNvbXBvbmVudCwgZW1iZWRkZWRWaWV3SW5kZXgsIHVzZWRQaXBlcyxcbiAgICAgICAgICB2aWV3QnVpbGRlckZhY3RvcnkpO1xuICAgIH07XG5cbiAgICBjb25zdCB2aXNpdG9yID0gdmlld0J1aWxkZXJGYWN0b3J5KG51bGwpO1xuICAgIHZpc2l0b3IudmlzaXRBbGwoW10sIHRlbXBsYXRlKTtcblxuICAgIG91dHB1dEN0eC5zdGF0ZW1lbnRzLnB1c2goLi4udmlzaXRvci5idWlsZCgpKTtcblxuICAgIHJldHVybiBuZXcgVmlld0NvbXBpbGVSZXN1bHQodmlzaXRvci52aWV3TmFtZSwgcmVuZGVyQ29tcG9uZW50VmFyTmFtZSk7XG4gIH1cbn1cblxuaW50ZXJmYWNlIFZpZXdCdWlsZGVyRmFjdG9yeSB7XG4gIChwYXJlbnQ6IFZpZXdCdWlsZGVyKTogVmlld0J1aWxkZXI7XG59XG5cbmludGVyZmFjZSBVcGRhdGVFeHByZXNzaW9uIHtcbiAgY29udGV4dDogby5FeHByZXNzaW9uO1xuICBub2RlSW5kZXg6IG51bWJlcjtcbiAgYmluZGluZ0luZGV4OiBudW1iZXI7XG4gIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbjtcbiAgdmFsdWU6IEFTVDtcbn1cblxuY29uc3QgTE9HX1ZBUiA9IG8udmFyaWFibGUoJ19sJyk7XG5jb25zdCBWSUVXX1ZBUiA9IG8udmFyaWFibGUoJ192Jyk7XG5jb25zdCBDSEVDS19WQVIgPSBvLnZhcmlhYmxlKCdfY2snKTtcbmNvbnN0IENPTVBfVkFSID0gby52YXJpYWJsZSgnX2NvJyk7XG5jb25zdCBFVkVOVF9OQU1FX1ZBUiA9IG8udmFyaWFibGUoJ2VuJyk7XG5jb25zdCBBTExPV19ERUZBVUxUX1ZBUiA9IG8udmFyaWFibGUoYGFkYCk7XG5cbmNsYXNzIFZpZXdCdWlsZGVyIGltcGxlbWVudHMgVGVtcGxhdGVBc3RWaXNpdG9yLCBMb2NhbFJlc29sdmVyIHtcbiAgcHJpdmF0ZSBjb21wVHlwZTogby5UeXBlO1xuICBwcml2YXRlIG5vZGVzOiAoKCkgPT4ge1xuICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiB8IG51bGwsXG4gICAgbm9kZURlZjogby5FeHByZXNzaW9uLFxuICAgIG5vZGVGbGFnczogTm9kZUZsYWdzLCB1cGRhdGVEaXJlY3RpdmVzPzogVXBkYXRlRXhwcmVzc2lvbltdLCB1cGRhdGVSZW5kZXJlcj86IFVwZGF0ZUV4cHJlc3Npb25bXVxuICB9KVtdID0gW107XG4gIHByaXZhdGUgcHVyZVBpcGVOb2RlSW5kaWNlczoge1twaXBlTmFtZTogc3RyaW5nXTogbnVtYmVyfSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIC8vIE5lZWQgT2JqZWN0LmNyZWF0ZSBzbyB0aGF0IHdlIGRvbid0IGhhdmUgYnVpbHRpbiB2YWx1ZXMuLi5cbiAgcHJpdmF0ZSByZWZOb2RlSW5kaWNlczoge1tyZWZOYW1lOiBzdHJpbmddOiBudW1iZXJ9ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgcHJpdmF0ZSB2YXJpYWJsZXM6IFZhcmlhYmxlQXN0W10gPSBbXTtcbiAgcHJpdmF0ZSBjaGlsZHJlbjogVmlld0J1aWxkZXJbXSA9IFtdO1xuXG4gIHB1YmxpYyByZWFkb25seSB2aWV3TmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSByZWZsZWN0b3I6IENvbXBpbGVSZWZsZWN0b3IsIHByaXZhdGUgb3V0cHV0Q3R4OiBPdXRwdXRDb250ZXh0LFxuICAgICAgcHJpdmF0ZSBwYXJlbnQ6IFZpZXdCdWlsZGVyfG51bGwsIHByaXZhdGUgY29tcG9uZW50OiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsXG4gICAgICBwcml2YXRlIGVtYmVkZGVkVmlld0luZGV4OiBudW1iZXIsIHByaXZhdGUgdXNlZFBpcGVzOiBDb21waWxlUGlwZVN1bW1hcnlbXSxcbiAgICAgIHByaXZhdGUgdmlld0J1aWxkZXJGYWN0b3J5OiBWaWV3QnVpbGRlckZhY3RvcnkpIHtcbiAgICAvLyBUT0RPKHRib3NjaCk6IFRoZSBvbGQgdmlldyBjb21waWxlciB1c2VkIHRvIHVzZSBhbiBgYW55YCB0eXBlXG4gICAgLy8gZm9yIHRoZSBjb250ZXh0IGluIGFueSBlbWJlZGRlZCB2aWV3LiBXZSBrZWVwIHRoaXMgYmVoYWl2b3IgZm9yIG5vd1xuICAgIC8vIHRvIGJlIGFibGUgdG8gaW50cm9kdWNlIHRoZSBuZXcgdmlldyBjb21waWxlciB3aXRob3V0IHRvbyBtYW55IGVycm9ycy5cbiAgICB0aGlzLmNvbXBUeXBlID0gdGhpcy5lbWJlZGRlZFZpZXdJbmRleCA+IDAgP1xuICAgICAgICBvLkRZTkFNSUNfVFlQRSA6XG4gICAgICAgIG8uZXhwcmVzc2lvblR5cGUob3V0cHV0Q3R4LmltcG9ydEV4cHIodGhpcy5jb21wb25lbnQudHlwZS5yZWZlcmVuY2UpKSAhO1xuICAgIHRoaXMudmlld05hbWUgPSB2aWV3Q2xhc3NOYW1lKHRoaXMuY29tcG9uZW50LnR5cGUucmVmZXJlbmNlLCB0aGlzLmVtYmVkZGVkVmlld0luZGV4KTtcbiAgfVxuXG4gIHZpc2l0QWxsKHZhcmlhYmxlczogVmFyaWFibGVBc3RbXSwgYXN0Tm9kZXM6IFRlbXBsYXRlQXN0W10pIHtcbiAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICAvLyBjcmVhdGUgdGhlIHBpcGVzIGZvciB0aGUgcHVyZSBwaXBlcyBpbW1lZGlhdGVseSwgc28gdGhhdCB3ZSBrbm93IHRoZWlyIGluZGljZXMuXG4gICAgaWYgKCF0aGlzLnBhcmVudCkge1xuICAgICAgdGhpcy51c2VkUGlwZXMuZm9yRWFjaCgocGlwZSkgPT4ge1xuICAgICAgICBpZiAocGlwZS5wdXJlKSB7XG4gICAgICAgICAgdGhpcy5wdXJlUGlwZU5vZGVJbmRpY2VzW3BpcGUubmFtZV0gPSB0aGlzLl9jcmVhdGVQaXBlKG51bGwsIHBpcGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMucGFyZW50KSB7XG4gICAgICB0aGlzLmNvbXBvbmVudC52aWV3UXVlcmllcy5mb3JFYWNoKChxdWVyeSwgcXVlcnlJbmRleCkgPT4ge1xuICAgICAgICAvLyBOb3RlOiBxdWVyaWVzIHN0YXJ0IHdpdGggaWQgMSBzbyB3ZSBjYW4gdXNlIHRoZSBudW1iZXIgaW4gYSBCbG9vbSBmaWx0ZXIhXG4gICAgICAgIGNvbnN0IHF1ZXJ5SWQgPSBxdWVyeUluZGV4ICsgMTtcbiAgICAgICAgY29uc3QgYmluZGluZ1R5cGUgPSBxdWVyeS5maXJzdCA/IFF1ZXJ5QmluZGluZ1R5cGUuRmlyc3QgOiBRdWVyeUJpbmRpbmdUeXBlLkFsbDtcbiAgICAgICAgY29uc3QgZmxhZ3MgPSBOb2RlRmxhZ3MuVHlwZVZpZXdRdWVyeSB8IGNhbGNTdGF0aWNEeW5hbWljUXVlcnlGbGFncyhxdWVyeSk7XG4gICAgICAgIHRoaXMubm9kZXMucHVzaCgoKSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VTcGFuOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlRmxhZ3M6IGZsYWdzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlRGVmOiBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMucXVlcnlEZWYpLmNhbGxGbihbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgby5saXRlcmFsKGZsYWdzKSwgby5saXRlcmFsKHF1ZXJ5SWQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBvLkxpdGVyYWxNYXBFeHByKFtuZXcgby5MaXRlcmFsTWFwRW50cnkoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5LnByb3BlcnR5TmFtZSwgby5saXRlcmFsKGJpbmRpbmdUeXBlKSwgZmFsc2UpXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICB0ZW1wbGF0ZVZpc2l0QWxsKHRoaXMsIGFzdE5vZGVzKTtcbiAgICBpZiAodGhpcy5wYXJlbnQgJiYgKGFzdE5vZGVzLmxlbmd0aCA9PT0gMCB8fCBuZWVkc0FkZGl0aW9uYWxSb290Tm9kZShhc3ROb2RlcykpKSB7XG4gICAgICAvLyBpZiB0aGUgdmlldyBpcyBhbiBlbWJlZGRlZCB2aWV3LCB0aGVuIHdlIG5lZWQgdG8gYWRkIGFuIGFkZGl0aW9uYWwgcm9vdCBub2RlIGluIHNvbWUgY2FzZXNcbiAgICAgIHRoaXMubm9kZXMucHVzaCgoKSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlU3BhbjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVGbGFnczogTm9kZUZsYWdzLlR5cGVFbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZURlZjogby5pbXBvcnRFeHByKElkZW50aWZpZXJzLmFuY2hvckRlZikuY2FsbEZuKFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgby5saXRlcmFsKE5vZGVGbGFncy5Ob25lKSwgby5OVUxMX0VYUFIsIG8uTlVMTF9FWFBSLCBvLmxpdGVyYWwoMClcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgIH1cbiAgfVxuXG4gIGJ1aWxkKHRhcmdldFN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10gPSBbXSk6IG8uU3RhdGVtZW50W10ge1xuICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IGNoaWxkLmJ1aWxkKHRhcmdldFN0YXRlbWVudHMpKTtcblxuICAgIGNvbnN0IHt1cGRhdGVSZW5kZXJlclN0bXRzLCB1cGRhdGVEaXJlY3RpdmVzU3RtdHMsIG5vZGVEZWZFeHByc30gPVxuICAgICAgICB0aGlzLl9jcmVhdGVOb2RlRXhwcmVzc2lvbnMoKTtcblxuICAgIGNvbnN0IHVwZGF0ZVJlbmRlcmVyRm4gPSB0aGlzLl9jcmVhdGVVcGRhdGVGbih1cGRhdGVSZW5kZXJlclN0bXRzKTtcbiAgICBjb25zdCB1cGRhdGVEaXJlY3RpdmVzRm4gPSB0aGlzLl9jcmVhdGVVcGRhdGVGbih1cGRhdGVEaXJlY3RpdmVzU3RtdHMpO1xuXG5cbiAgICBsZXQgdmlld0ZsYWdzID0gVmlld0ZsYWdzLk5vbmU7XG4gICAgaWYgKCF0aGlzLnBhcmVudCAmJiB0aGlzLmNvbXBvbmVudC5jaGFuZ2VEZXRlY3Rpb24gPT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCkge1xuICAgICAgY29uc29sZS5sb2coJ09QJywgVmlld0ZsYWdzLk9uUHVzaCk7XG4gICAgICB2aWV3RmxhZ3MgfD0gVmlld0ZsYWdzLk9uUHVzaDtcbiAgICB9XG4gICAgaWYgKCF0aGlzLnBhcmVudCAmJiB0aGlzLmNvbXBvbmVudC5jaGFuZ2VEZXRlY3Rpb24gPT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LlJlYWN0aXZpdHkpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdSZWFjdGl2aXR5JywgVmlld0ZsYWdzLlJlYWN0aXZpdHkpO1xuICAgICAgdmlld0ZsYWdzIHw9IFZpZXdGbGFncy5SZWFjdGl2aXR5O1xuICAgICAgdmlld0ZsYWdzIHw9IFZpZXdGbGFncy5PblB1c2g7XG4gICAgfVxuICAgIGNvbnN0IHZpZXdGYWN0b3J5ID0gbmV3IG8uRGVjbGFyZUZ1bmN0aW9uU3RtdChcbiAgICAgICAgdGhpcy52aWV3TmFtZSwgW25ldyBvLkZuUGFyYW0oTE9HX1ZBUi5uYW1lICEpXSxcbiAgICAgICAgW25ldyBvLlJldHVyblN0YXRlbWVudChvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMudmlld0RlZikuY2FsbEZuKFtcbiAgICAgICAgICBvLmxpdGVyYWwodmlld0ZsYWdzKSxcbiAgICAgICAgICBvLmxpdGVyYWxBcnIobm9kZURlZkV4cHJzKSxcbiAgICAgICAgICB1cGRhdGVEaXJlY3RpdmVzRm4sXG4gICAgICAgICAgdXBkYXRlUmVuZGVyZXJGbixcbiAgICAgICAgXSkpXSxcbiAgICAgICAgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLlZpZXdEZWZpbml0aW9uKSxcbiAgICAgICAgdGhpcy5lbWJlZGRlZFZpZXdJbmRleCA9PT0gMCA/IFtvLlN0bXRNb2RpZmllci5FeHBvcnRlZF0gOiBbXSk7XG5cbiAgICB0YXJnZXRTdGF0ZW1lbnRzLnB1c2godmlld0ZhY3RvcnkpO1xuICAgIHJldHVybiB0YXJnZXRTdGF0ZW1lbnRzO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlVXBkYXRlRm4odXBkYXRlU3RtdHM6IG8uU3RhdGVtZW50W10pOiBvLkV4cHJlc3Npb24ge1xuICAgIGxldCB1cGRhdGVGbjogby5FeHByZXNzaW9uO1xuICAgIGlmICh1cGRhdGVTdG10cy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBwcmVTdG10czogby5TdGF0ZW1lbnRbXSA9IFtdO1xuICAgICAgaWYgKCF0aGlzLmNvbXBvbmVudC5pc0hvc3QgJiYgby5maW5kUmVhZFZhck5hbWVzKHVwZGF0ZVN0bXRzKS5oYXMoQ09NUF9WQVIubmFtZSAhKSkge1xuICAgICAgICBwcmVTdG10cy5wdXNoKENPTVBfVkFSLnNldChWSUVXX1ZBUi5wcm9wKCdjb21wb25lbnQnKSkudG9EZWNsU3RtdCh0aGlzLmNvbXBUeXBlKSk7XG4gICAgICB9XG4gICAgICB1cGRhdGVGbiA9IG8uZm4oXG4gICAgICAgICAgW1xuICAgICAgICAgICAgbmV3IG8uRm5QYXJhbShDSEVDS19WQVIubmFtZSAhLCBvLklORkVSUkVEX1RZUEUpLFxuICAgICAgICAgICAgbmV3IG8uRm5QYXJhbShWSUVXX1ZBUi5uYW1lICEsIG8uSU5GRVJSRURfVFlQRSlcbiAgICAgICAgICBdLFxuICAgICAgICAgIFsuLi5wcmVTdG10cywgLi4udXBkYXRlU3RtdHNdLCBvLklORkVSUkVEX1RZUEUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB1cGRhdGVGbiA9IG8uTlVMTF9FWFBSO1xuICAgIH1cbiAgICByZXR1cm4gdXBkYXRlRm47XG4gIH1cblxuICB2aXNpdE5nQ29udGVudChhc3Q6IE5nQ29udGVudEFzdCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICAvLyBuZ0NvbnRlbnREZWYobmdDb250ZW50SW5kZXg6IG51bWJlciwgaW5kZXg6IG51bWJlcik6IE5vZGVEZWY7XG4gICAgdGhpcy5ub2Rlcy5wdXNoKCgpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgc291cmNlU3BhbjogYXN0LnNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgbm9kZUZsYWdzOiBOb2RlRmxhZ3MuVHlwZU5nQ29udGVudCxcbiAgICAgICAgICAgICAgICAgICAgICBub2RlRGVmOiBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMubmdDb250ZW50RGVmKS5jYWxsRm4oW1xuICAgICAgICAgICAgICAgICAgICAgICAgby5saXRlcmFsKGFzdC5uZ0NvbnRlbnRJbmRleCksIG8ubGl0ZXJhbChhc3QuaW5kZXgpXG4gICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICB9XG5cbiAgdmlzaXRUZXh0KGFzdDogVGV4dEFzdCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICAvLyBTdGF0aWMgdGV4dCBub2RlcyBoYXZlIG5vIGNoZWNrIGZ1bmN0aW9uXG4gICAgY29uc3QgY2hlY2tJbmRleCA9IC0xO1xuICAgIHRoaXMubm9kZXMucHVzaCgoKSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZVNwYW46IGFzdC5zb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgIG5vZGVGbGFnczogTm9kZUZsYWdzLlR5cGVUZXh0LFxuICAgICAgICAgICAgICAgICAgICAgIG5vZGVEZWY6IG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy50ZXh0RGVmKS5jYWxsRm4oW1xuICAgICAgICAgICAgICAgICAgICAgICAgby5saXRlcmFsKGNoZWNrSW5kZXgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgby5saXRlcmFsKGFzdC5uZ0NvbnRlbnRJbmRleCksXG4gICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWxBcnIoW28ubGl0ZXJhbChhc3QudmFsdWUpXSksXG4gICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICB9XG5cbiAgdmlzaXRCb3VuZFRleHQoYXN0OiBCb3VuZFRleHRBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgY29uc3Qgbm9kZUluZGV4ID0gdGhpcy5ub2Rlcy5sZW5ndGg7XG4gICAgLy8gcmVzZXJ2ZSB0aGUgc3BhY2UgaW4gdGhlIG5vZGVEZWZzIGFycmF5XG4gICAgdGhpcy5ub2Rlcy5wdXNoKG51bGwgISk7XG5cbiAgICBjb25zdCBhc3RXaXRoU291cmNlID0gPEFTVFdpdGhTb3VyY2U+YXN0LnZhbHVlO1xuICAgIGNvbnN0IGludGVyID0gPEludGVycG9sYXRpb24+YXN0V2l0aFNvdXJjZS5hc3Q7XG5cbiAgICBjb25zdCB1cGRhdGVSZW5kZXJlckV4cHJlc3Npb25zID0gaW50ZXIuZXhwcmVzc2lvbnMubWFwKFxuICAgICAgICAoZXhwciwgYmluZGluZ0luZGV4KSA9PiB0aGlzLl9wcmVwcm9jZXNzVXBkYXRlRXhwcmVzc2lvbihcbiAgICAgICAgICAgIHtub2RlSW5kZXgsIGJpbmRpbmdJbmRleCwgc291cmNlU3BhbjogYXN0LnNvdXJjZVNwYW4sIGNvbnRleHQ6IENPTVBfVkFSLCB2YWx1ZTogZXhwcn0pKTtcblxuICAgIC8vIENoZWNrIGluZGV4IGlzIHRoZSBzYW1lIGFzIHRoZSBub2RlIGluZGV4IGR1cmluZyBjb21waWxhdGlvblxuICAgIC8vIFRoZXkgbWlnaHQgb25seSBkaWZmZXIgYXQgcnVudGltZVxuICAgIGNvbnN0IGNoZWNrSW5kZXggPSBub2RlSW5kZXg7XG5cbiAgICB0aGlzLm5vZGVzW25vZGVJbmRleF0gPSAoKSA9PiAoe1xuICAgICAgc291cmNlU3BhbjogYXN0LnNvdXJjZVNwYW4sXG4gICAgICBub2RlRmxhZ3M6IE5vZGVGbGFncy5UeXBlVGV4dCxcbiAgICAgIG5vZGVEZWY6IG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy50ZXh0RGVmKS5jYWxsRm4oW1xuICAgICAgICBvLmxpdGVyYWwoY2hlY2tJbmRleCksXG4gICAgICAgIG8ubGl0ZXJhbChhc3QubmdDb250ZW50SW5kZXgpLFxuICAgICAgICBvLmxpdGVyYWxBcnIoaW50ZXIuc3RyaW5ncy5tYXAocyA9PiBvLmxpdGVyYWwocykpKSxcbiAgICAgIF0pLFxuICAgICAgdXBkYXRlUmVuZGVyZXI6IHVwZGF0ZVJlbmRlcmVyRXhwcmVzc2lvbnNcbiAgICB9KTtcbiAgfVxuXG4gIHZpc2l0RW1iZWRkZWRUZW1wbGF0ZShhc3Q6IEVtYmVkZGVkVGVtcGxhdGVBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgY29uc3Qgbm9kZUluZGV4ID0gdGhpcy5ub2Rlcy5sZW5ndGg7XG4gICAgLy8gcmVzZXJ2ZSB0aGUgc3BhY2UgaW4gdGhlIG5vZGVEZWZzIGFycmF5XG4gICAgdGhpcy5ub2Rlcy5wdXNoKG51bGwgISk7XG5cbiAgICBjb25zdCB7ZmxhZ3MsIHF1ZXJ5TWF0Y2hlc0V4cHIsIGhvc3RFdmVudHN9ID0gdGhpcy5fdmlzaXRFbGVtZW50T3JUZW1wbGF0ZShub2RlSW5kZXgsIGFzdCk7XG5cbiAgICBjb25zdCBjaGlsZFZpc2l0b3IgPSB0aGlzLnZpZXdCdWlsZGVyRmFjdG9yeSh0aGlzKTtcbiAgICB0aGlzLmNoaWxkcmVuLnB1c2goY2hpbGRWaXNpdG9yKTtcbiAgICBjaGlsZFZpc2l0b3IudmlzaXRBbGwoYXN0LnZhcmlhYmxlcywgYXN0LmNoaWxkcmVuKTtcblxuICAgIGNvbnN0IGNoaWxkQ291bnQgPSB0aGlzLm5vZGVzLmxlbmd0aCAtIG5vZGVJbmRleCAtIDE7XG5cbiAgICAvLyBhbmNob3JEZWYoXG4gICAgLy8gICBmbGFnczogTm9kZUZsYWdzLCBtYXRjaGVkUXVlcmllczogW3N0cmluZywgUXVlcnlWYWx1ZVR5cGVdW10sIG5nQ29udGVudEluZGV4OiBudW1iZXIsXG4gICAgLy8gICBjaGlsZENvdW50OiBudW1iZXIsIGhhbmRsZUV2ZW50Rm4/OiBFbGVtZW50SGFuZGxlRXZlbnRGbiwgdGVtcGxhdGVGYWN0b3J5PzpcbiAgICAvLyAgIFZpZXdEZWZpbml0aW9uRmFjdG9yeSk6IE5vZGVEZWY7XG4gICAgdGhpcy5ub2Rlc1tub2RlSW5kZXhdID0gKCkgPT4gKHtcbiAgICAgIHNvdXJjZVNwYW46IGFzdC5zb3VyY2VTcGFuLFxuICAgICAgbm9kZUZsYWdzOiBOb2RlRmxhZ3MuVHlwZUVsZW1lbnQgfCBmbGFncyxcbiAgICAgIG5vZGVEZWY6IG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5hbmNob3JEZWYpLmNhbGxGbihbXG4gICAgICAgIG8ubGl0ZXJhbChmbGFncyksXG4gICAgICAgIHF1ZXJ5TWF0Y2hlc0V4cHIsXG4gICAgICAgIG8ubGl0ZXJhbChhc3QubmdDb250ZW50SW5kZXgpLFxuICAgICAgICBvLmxpdGVyYWwoY2hpbGRDb3VudCksXG4gICAgICAgIHRoaXMuX2NyZWF0ZUVsZW1lbnRIYW5kbGVFdmVudEZuKG5vZGVJbmRleCwgaG9zdEV2ZW50cyksXG4gICAgICAgIG8udmFyaWFibGUoY2hpbGRWaXNpdG9yLnZpZXdOYW1lKSxcbiAgICAgIF0pXG4gICAgfSk7XG4gIH1cblxuICB2aXNpdEVsZW1lbnQoYXN0OiBFbGVtZW50QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGNvbnN0IG5vZGVJbmRleCA9IHRoaXMubm9kZXMubGVuZ3RoO1xuICAgIC8vIHJlc2VydmUgdGhlIHNwYWNlIGluIHRoZSBub2RlRGVmcyBhcnJheSBzbyB3ZSBjYW4gYWRkIGNoaWxkcmVuXG4gICAgdGhpcy5ub2Rlcy5wdXNoKG51bGwgISk7XG5cbiAgICAvLyBVc2luZyBhIG51bGwgZWxlbWVudCBuYW1lIGNyZWF0ZXMgYW4gYW5jaG9yLlxuICAgIGNvbnN0IGVsTmFtZTogc3RyaW5nfG51bGwgPSBpc05nQ29udGFpbmVyKGFzdC5uYW1lKSA/IG51bGwgOiBhc3QubmFtZTtcblxuICAgIGNvbnN0IHtmbGFncywgdXNlZEV2ZW50cywgcXVlcnlNYXRjaGVzRXhwciwgaG9zdEJpbmRpbmdzOiBkaXJIb3N0QmluZGluZ3MsIGhvc3RFdmVudHN9ID1cbiAgICAgICAgdGhpcy5fdmlzaXRFbGVtZW50T3JUZW1wbGF0ZShub2RlSW5kZXgsIGFzdCk7XG5cbiAgICBsZXQgaW5wdXREZWZzOiBvLkV4cHJlc3Npb25bXSA9IFtdO1xuICAgIGxldCB1cGRhdGVSZW5kZXJlckV4cHJlc3Npb25zOiBVcGRhdGVFeHByZXNzaW9uW10gPSBbXTtcbiAgICBsZXQgb3V0cHV0RGVmczogby5FeHByZXNzaW9uW10gPSBbXTtcbiAgICBpZiAoZWxOYW1lKSB7XG4gICAgICBjb25zdCBob3N0QmluZGluZ3M6IGFueVtdID0gYXN0LmlucHV0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKChpbnB1dEFzdCkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IENPTVBfVkFSIGFzIG8uRXhwcmVzc2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0QXN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyQXN0OiBudWxsIGFzIGFueSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNvbmNhdChkaXJIb3N0QmluZGluZ3MpO1xuICAgICAgaWYgKGhvc3RCaW5kaW5ncy5sZW5ndGgpIHtcbiAgICAgICAgdXBkYXRlUmVuZGVyZXJFeHByZXNzaW9ucyA9XG4gICAgICAgICAgICBob3N0QmluZGluZ3MubWFwKChob3N0QmluZGluZywgYmluZGluZ0luZGV4KSA9PiB0aGlzLl9wcmVwcm9jZXNzVXBkYXRlRXhwcmVzc2lvbih7XG4gICAgICAgICAgICAgIGNvbnRleHQ6IGhvc3RCaW5kaW5nLmNvbnRleHQsXG4gICAgICAgICAgICAgIG5vZGVJbmRleCxcbiAgICAgICAgICAgICAgYmluZGluZ0luZGV4LFxuICAgICAgICAgICAgICBzb3VyY2VTcGFuOiBob3N0QmluZGluZy5pbnB1dEFzdC5zb3VyY2VTcGFuLFxuICAgICAgICAgICAgICB2YWx1ZTogaG9zdEJpbmRpbmcuaW5wdXRBc3QudmFsdWVcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgaW5wdXREZWZzID0gaG9zdEJpbmRpbmdzLm1hcChcbiAgICAgICAgICAgIGhvc3RCaW5kaW5nID0+IGVsZW1lbnRCaW5kaW5nRGVmKGhvc3RCaW5kaW5nLmlucHV0QXN0LCBob3N0QmluZGluZy5kaXJBc3QpKTtcbiAgICAgIH1cbiAgICAgIG91dHB1dERlZnMgPSB1c2VkRXZlbnRzLm1hcChcbiAgICAgICAgICAoW3RhcmdldCwgZXZlbnROYW1lXSkgPT4gby5saXRlcmFsQXJyKFtvLmxpdGVyYWwodGFyZ2V0KSwgby5saXRlcmFsKGV2ZW50TmFtZSldKSk7XG4gICAgfVxuXG4gICAgdGVtcGxhdGVWaXNpdEFsbCh0aGlzLCBhc3QuY2hpbGRyZW4pO1xuXG4gICAgY29uc3QgY2hpbGRDb3VudCA9IHRoaXMubm9kZXMubGVuZ3RoIC0gbm9kZUluZGV4IC0gMTtcblxuICAgIGNvbnN0IGNvbXBBc3QgPSBhc3QuZGlyZWN0aXZlcy5maW5kKGRpckFzdCA9PiBkaXJBc3QuZGlyZWN0aXZlLmlzQ29tcG9uZW50KTtcbiAgICBsZXQgY29tcFJlbmRlcmVyVHlwZSA9IG8uTlVMTF9FWFBSIGFzIG8uRXhwcmVzc2lvbjtcbiAgICBsZXQgY29tcFZpZXcgPSBvLk5VTExfRVhQUiBhcyBvLkV4cHJlc3Npb247XG4gICAgaWYgKGNvbXBBc3QpIHtcbiAgICAgIGNvbXBWaWV3ID0gdGhpcy5vdXRwdXRDdHguaW1wb3J0RXhwcihjb21wQXN0LmRpcmVjdGl2ZS5jb21wb25lbnRWaWV3VHlwZSk7XG4gICAgICBjb21wUmVuZGVyZXJUeXBlID0gdGhpcy5vdXRwdXRDdHguaW1wb3J0RXhwcihjb21wQXN0LmRpcmVjdGl2ZS5yZW5kZXJlclR5cGUpO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGluZGV4IGlzIHRoZSBzYW1lIGFzIHRoZSBub2RlIGluZGV4IGR1cmluZyBjb21waWxhdGlvblxuICAgIC8vIFRoZXkgbWlnaHQgb25seSBkaWZmZXIgYXQgcnVudGltZVxuICAgIGNvbnN0IGNoZWNrSW5kZXggPSBub2RlSW5kZXg7XG5cbiAgICB0aGlzLm5vZGVzW25vZGVJbmRleF0gPSAoKSA9PiAoe1xuICAgICAgc291cmNlU3BhbjogYXN0LnNvdXJjZVNwYW4sXG4gICAgICBub2RlRmxhZ3M6IE5vZGVGbGFncy5UeXBlRWxlbWVudCB8IGZsYWdzLFxuICAgICAgbm9kZURlZjogby5pbXBvcnRFeHByKElkZW50aWZpZXJzLmVsZW1lbnREZWYpLmNhbGxGbihbXG4gICAgICAgIG8ubGl0ZXJhbChjaGVja0luZGV4KSxcbiAgICAgICAgby5saXRlcmFsKGZsYWdzKSxcbiAgICAgICAgcXVlcnlNYXRjaGVzRXhwcixcbiAgICAgICAgby5saXRlcmFsKGFzdC5uZ0NvbnRlbnRJbmRleCksXG4gICAgICAgIG8ubGl0ZXJhbChjaGlsZENvdW50KSxcbiAgICAgICAgby5saXRlcmFsKGVsTmFtZSksXG4gICAgICAgIGVsTmFtZSA/IGZpeGVkQXR0cnNEZWYoYXN0KSA6IG8uTlVMTF9FWFBSLFxuICAgICAgICBpbnB1dERlZnMubGVuZ3RoID8gby5saXRlcmFsQXJyKGlucHV0RGVmcykgOiBvLk5VTExfRVhQUixcbiAgICAgICAgb3V0cHV0RGVmcy5sZW5ndGggPyBvLmxpdGVyYWxBcnIob3V0cHV0RGVmcykgOiBvLk5VTExfRVhQUixcbiAgICAgICAgdGhpcy5fY3JlYXRlRWxlbWVudEhhbmRsZUV2ZW50Rm4obm9kZUluZGV4LCBob3N0RXZlbnRzKSxcbiAgICAgICAgY29tcFZpZXcsXG4gICAgICAgIGNvbXBSZW5kZXJlclR5cGUsXG4gICAgICBdKSxcbiAgICAgIHVwZGF0ZVJlbmRlcmVyOiB1cGRhdGVSZW5kZXJlckV4cHJlc3Npb25zXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF92aXNpdEVsZW1lbnRPclRlbXBsYXRlKG5vZGVJbmRleDogbnVtYmVyLCBhc3Q6IHtcbiAgICBoYXNWaWV3Q29udGFpbmVyOiBib29sZWFuLFxuICAgIG91dHB1dHM6IEJvdW5kRXZlbnRBc3RbXSxcbiAgICBkaXJlY3RpdmVzOiBEaXJlY3RpdmVBc3RbXSxcbiAgICBwcm92aWRlcnM6IFByb3ZpZGVyQXN0W10sXG4gICAgcmVmZXJlbmNlczogUmVmZXJlbmNlQXN0W10sXG4gICAgcXVlcnlNYXRjaGVzOiBRdWVyeU1hdGNoW11cbiAgfSk6IHtcbiAgICBmbGFnczogTm9kZUZsYWdzLFxuICAgIHVzZWRFdmVudHM6IFtzdHJpbmcgfCBudWxsLCBzdHJpbmddW10sXG4gICAgcXVlcnlNYXRjaGVzRXhwcjogby5FeHByZXNzaW9uLFxuICAgIGhvc3RCaW5kaW5nczpcbiAgICAgICAge2NvbnRleHQ6IG8uRXhwcmVzc2lvbiwgaW5wdXRBc3Q6IEJvdW5kRWxlbWVudFByb3BlcnR5QXN0LCBkaXJBc3Q6IERpcmVjdGl2ZUFzdH1bXSxcbiAgICBob3N0RXZlbnRzOiB7Y29udGV4dDogby5FeHByZXNzaW9uLCBldmVudEFzdDogQm91bmRFdmVudEFzdCwgZGlyQXN0OiBEaXJlY3RpdmVBc3R9W10sXG4gIH0ge1xuICAgIGxldCBmbGFncyA9IE5vZGVGbGFncy5Ob25lO1xuICAgIGlmIChhc3QuaGFzVmlld0NvbnRhaW5lcikge1xuICAgICAgZmxhZ3MgfD0gTm9kZUZsYWdzLkVtYmVkZGVkVmlld3M7XG4gICAgfVxuICAgIGNvbnN0IHVzZWRFdmVudHMgPSBuZXcgTWFwPHN0cmluZywgW3N0cmluZyB8IG51bGwsIHN0cmluZ10+KCk7XG4gICAgYXN0Lm91dHB1dHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IHtuYW1lLCB0YXJnZXR9ID0gZWxlbWVudEV2ZW50TmFtZUFuZFRhcmdldChldmVudCwgbnVsbCk7XG4gICAgICB1c2VkRXZlbnRzLnNldChlbGVtZW50RXZlbnRGdWxsTmFtZSh0YXJnZXQsIG5hbWUpLCBbdGFyZ2V0LCBuYW1lXSk7XG4gICAgfSk7XG4gICAgYXN0LmRpcmVjdGl2ZXMuZm9yRWFjaCgoZGlyQXN0KSA9PiB7XG4gICAgICBkaXJBc3QuaG9zdEV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgICBjb25zdCB7bmFtZSwgdGFyZ2V0fSA9IGVsZW1lbnRFdmVudE5hbWVBbmRUYXJnZXQoZXZlbnQsIGRpckFzdCk7XG4gICAgICAgIHVzZWRFdmVudHMuc2V0KGVsZW1lbnRFdmVudEZ1bGxOYW1lKHRhcmdldCwgbmFtZSksIFt0YXJnZXQsIG5hbWVdKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGNvbnN0IGhvc3RCaW5kaW5nczpcbiAgICAgICAge2NvbnRleHQ6IG8uRXhwcmVzc2lvbiwgaW5wdXRBc3Q6IEJvdW5kRWxlbWVudFByb3BlcnR5QXN0LCBkaXJBc3Q6IERpcmVjdGl2ZUFzdH1bXSA9IFtdO1xuICAgIGNvbnN0IGhvc3RFdmVudHM6IHtjb250ZXh0OiBvLkV4cHJlc3Npb24sIGV2ZW50QXN0OiBCb3VuZEV2ZW50QXN0LCBkaXJBc3Q6IERpcmVjdGl2ZUFzdH1bXSA9IFtdO1xuICAgIHRoaXMuX3Zpc2l0Q29tcG9uZW50RmFjdG9yeVJlc29sdmVyUHJvdmlkZXIoYXN0LmRpcmVjdGl2ZXMpO1xuXG4gICAgYXN0LnByb3ZpZGVycy5mb3JFYWNoKHByb3ZpZGVyQXN0ID0+IHtcbiAgICAgIGxldCBkaXJBc3Q6IERpcmVjdGl2ZUFzdCA9IHVuZGVmaW5lZCAhO1xuICAgICAgYXN0LmRpcmVjdGl2ZXMuZm9yRWFjaChsb2NhbERpckFzdCA9PiB7XG4gICAgICAgIGlmIChsb2NhbERpckFzdC5kaXJlY3RpdmUudHlwZS5yZWZlcmVuY2UgPT09IHRva2VuUmVmZXJlbmNlKHByb3ZpZGVyQXN0LnRva2VuKSkge1xuICAgICAgICAgIGRpckFzdCA9IGxvY2FsRGlyQXN0O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmIChkaXJBc3QpIHtcbiAgICAgICAgY29uc3Qge2hvc3RCaW5kaW5nczogZGlySG9zdEJpbmRpbmdzLCBob3N0RXZlbnRzOiBkaXJIb3N0RXZlbnRzfSA9XG4gICAgICAgICAgICB0aGlzLl92aXNpdERpcmVjdGl2ZShwcm92aWRlckFzdCwgZGlyQXN0LCBhc3QucmVmZXJlbmNlcywgYXN0LnF1ZXJ5TWF0Y2hlcywgdXNlZEV2ZW50cyk7XG4gICAgICAgIGhvc3RCaW5kaW5ncy5wdXNoKC4uLmRpckhvc3RCaW5kaW5ncyk7XG4gICAgICAgIGhvc3RFdmVudHMucHVzaCguLi5kaXJIb3N0RXZlbnRzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3Zpc2l0UHJvdmlkZXIocHJvdmlkZXJBc3QsIGFzdC5xdWVyeU1hdGNoZXMpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbGV0IHF1ZXJ5TWF0Y2hFeHByczogby5FeHByZXNzaW9uW10gPSBbXTtcbiAgICBhc3QucXVlcnlNYXRjaGVzLmZvckVhY2goKG1hdGNoKSA9PiB7XG4gICAgICBsZXQgdmFsdWVUeXBlOiBRdWVyeVZhbHVlVHlwZSA9IHVuZGVmaW5lZCAhO1xuICAgICAgaWYgKHRva2VuUmVmZXJlbmNlKG1hdGNoLnZhbHVlKSA9PT1cbiAgICAgICAgICB0aGlzLnJlZmxlY3Rvci5yZXNvbHZlRXh0ZXJuYWxSZWZlcmVuY2UoSWRlbnRpZmllcnMuRWxlbWVudFJlZikpIHtcbiAgICAgICAgdmFsdWVUeXBlID0gUXVlcnlWYWx1ZVR5cGUuRWxlbWVudFJlZjtcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgdG9rZW5SZWZlcmVuY2UobWF0Y2gudmFsdWUpID09PVxuICAgICAgICAgIHRoaXMucmVmbGVjdG9yLnJlc29sdmVFeHRlcm5hbFJlZmVyZW5jZShJZGVudGlmaWVycy5WaWV3Q29udGFpbmVyUmVmKSkge1xuICAgICAgICB2YWx1ZVR5cGUgPSBRdWVyeVZhbHVlVHlwZS5WaWV3Q29udGFpbmVyUmVmO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICB0b2tlblJlZmVyZW5jZShtYXRjaC52YWx1ZSkgPT09XG4gICAgICAgICAgdGhpcy5yZWZsZWN0b3IucmVzb2x2ZUV4dGVybmFsUmVmZXJlbmNlKElkZW50aWZpZXJzLlRlbXBsYXRlUmVmKSkge1xuICAgICAgICB2YWx1ZVR5cGUgPSBRdWVyeVZhbHVlVHlwZS5UZW1wbGF0ZVJlZjtcbiAgICAgIH1cbiAgICAgIGlmICh2YWx1ZVR5cGUgIT0gbnVsbCkge1xuICAgICAgICBxdWVyeU1hdGNoRXhwcnMucHVzaChvLmxpdGVyYWxBcnIoW28ubGl0ZXJhbChtYXRjaC5xdWVyeUlkKSwgby5saXRlcmFsKHZhbHVlVHlwZSldKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgYXN0LnJlZmVyZW5jZXMuZm9yRWFjaCgocmVmKSA9PiB7XG4gICAgICBsZXQgdmFsdWVUeXBlOiBRdWVyeVZhbHVlVHlwZSA9IHVuZGVmaW5lZCAhO1xuICAgICAgaWYgKCFyZWYudmFsdWUpIHtcbiAgICAgICAgdmFsdWVUeXBlID0gUXVlcnlWYWx1ZVR5cGUuUmVuZGVyRWxlbWVudDtcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgdG9rZW5SZWZlcmVuY2UocmVmLnZhbHVlKSA9PT1cbiAgICAgICAgICB0aGlzLnJlZmxlY3Rvci5yZXNvbHZlRXh0ZXJuYWxSZWZlcmVuY2UoSWRlbnRpZmllcnMuVGVtcGxhdGVSZWYpKSB7XG4gICAgICAgIHZhbHVlVHlwZSA9IFF1ZXJ5VmFsdWVUeXBlLlRlbXBsYXRlUmVmO1xuICAgICAgfVxuICAgICAgaWYgKHZhbHVlVHlwZSAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMucmVmTm9kZUluZGljZXNbcmVmLm5hbWVdID0gbm9kZUluZGV4O1xuICAgICAgICBxdWVyeU1hdGNoRXhwcnMucHVzaChvLmxpdGVyYWxBcnIoW28ubGl0ZXJhbChyZWYubmFtZSksIG8ubGl0ZXJhbCh2YWx1ZVR5cGUpXSkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGFzdC5vdXRwdXRzLmZvckVhY2goKG91dHB1dEFzdCkgPT4ge1xuICAgICAgaG9zdEV2ZW50cy5wdXNoKHtjb250ZXh0OiBDT01QX1ZBUiwgZXZlbnRBc3Q6IG91dHB1dEFzdCwgZGlyQXN0OiBudWxsICF9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICBmbGFncyxcbiAgICAgIHVzZWRFdmVudHM6IEFycmF5LmZyb20odXNlZEV2ZW50cy52YWx1ZXMoKSksXG4gICAgICBxdWVyeU1hdGNoZXNFeHByOiBxdWVyeU1hdGNoRXhwcnMubGVuZ3RoID8gby5saXRlcmFsQXJyKHF1ZXJ5TWF0Y2hFeHBycykgOiBvLk5VTExfRVhQUixcbiAgICAgIGhvc3RCaW5kaW5ncyxcbiAgICAgIGhvc3RFdmVudHM6IGhvc3RFdmVudHNcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBfdmlzaXREaXJlY3RpdmUoXG4gICAgICBwcm92aWRlckFzdDogUHJvdmlkZXJBc3QsIGRpckFzdDogRGlyZWN0aXZlQXN0LCByZWZzOiBSZWZlcmVuY2VBc3RbXSxcbiAgICAgIHF1ZXJ5TWF0Y2hlczogUXVlcnlNYXRjaFtdLCB1c2VkRXZlbnRzOiBNYXA8c3RyaW5nLCBhbnk+KToge1xuICAgIGhvc3RCaW5kaW5nczpcbiAgICAgICAge2NvbnRleHQ6IG8uRXhwcmVzc2lvbiwgaW5wdXRBc3Q6IEJvdW5kRWxlbWVudFByb3BlcnR5QXN0LCBkaXJBc3Q6IERpcmVjdGl2ZUFzdH1bXSxcbiAgICBob3N0RXZlbnRzOiB7Y29udGV4dDogby5FeHByZXNzaW9uLCBldmVudEFzdDogQm91bmRFdmVudEFzdCwgZGlyQXN0OiBEaXJlY3RpdmVBc3R9W11cbiAgfSB7XG4gICAgY29uc3Qgbm9kZUluZGV4ID0gdGhpcy5ub2Rlcy5sZW5ndGg7XG4gICAgLy8gcmVzZXJ2ZSB0aGUgc3BhY2UgaW4gdGhlIG5vZGVEZWZzIGFycmF5IHNvIHdlIGNhbiBhZGQgY2hpbGRyZW5cbiAgICB0aGlzLm5vZGVzLnB1c2gobnVsbCAhKTtcblxuICAgIGRpckFzdC5kaXJlY3RpdmUucXVlcmllcy5mb3JFYWNoKChxdWVyeSwgcXVlcnlJbmRleCkgPT4ge1xuICAgICAgY29uc3QgcXVlcnlJZCA9IGRpckFzdC5jb250ZW50UXVlcnlTdGFydElkICsgcXVlcnlJbmRleDtcbiAgICAgIGNvbnN0IGZsYWdzID0gTm9kZUZsYWdzLlR5cGVDb250ZW50UXVlcnkgfCBjYWxjU3RhdGljRHluYW1pY1F1ZXJ5RmxhZ3MocXVlcnkpO1xuICAgICAgY29uc3QgYmluZGluZ1R5cGUgPSBxdWVyeS5maXJzdCA/IFF1ZXJ5QmluZGluZ1R5cGUuRmlyc3QgOiBRdWVyeUJpbmRpbmdUeXBlLkFsbDtcbiAgICAgIHRoaXMubm9kZXMucHVzaCgoKSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlU3BhbjogZGlyQXN0LnNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlRmxhZ3M6IGZsYWdzLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZURlZjogby5pbXBvcnRFeHByKElkZW50aWZpZXJzLnF1ZXJ5RGVmKS5jYWxsRm4oW1xuICAgICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWwoZmxhZ3MpLCBvLmxpdGVyYWwocXVlcnlJZCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBvLkxpdGVyYWxNYXBFeHByKFtuZXcgby5MaXRlcmFsTWFwRW50cnkoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVyeS5wcm9wZXJ0eU5hbWUsIG8ubGl0ZXJhbChiaW5kaW5nVHlwZSksIGZhbHNlKV0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgfSk7XG5cbiAgICAvLyBOb3RlOiB0aGUgb3BlcmF0aW9uIGJlbG93IG1pZ2h0IGFsc28gY3JlYXRlIG5ldyBub2RlRGVmcyxcbiAgICAvLyBidXQgd2UgZG9uJ3Qgd2FudCB0aGVtIHRvIGJlIGEgY2hpbGQgb2YgYSBkaXJlY3RpdmUsXG4gICAgLy8gYXMgdGhleSBtaWdodCBiZSBhIHByb3ZpZGVyL3BpcGUgb24gdGhlaXIgb3duLlxuICAgIC8vIEkuZS4gd2Ugb25seSBhbGxvdyBxdWVyaWVzIGFzIGNoaWxkcmVuIG9mIGRpcmVjdGl2ZXMgbm9kZXMuXG4gICAgY29uc3QgY2hpbGRDb3VudCA9IHRoaXMubm9kZXMubGVuZ3RoIC0gbm9kZUluZGV4IC0gMTtcblxuICAgIGxldCB7ZmxhZ3MsIHF1ZXJ5TWF0Y2hFeHBycywgcHJvdmlkZXJFeHByLCBkZXBzRXhwcn0gPVxuICAgICAgICB0aGlzLl92aXNpdFByb3ZpZGVyT3JEaXJlY3RpdmUocHJvdmlkZXJBc3QsIHF1ZXJ5TWF0Y2hlcyk7XG5cbiAgICByZWZzLmZvckVhY2goKHJlZikgPT4ge1xuICAgICAgaWYgKHJlZi52YWx1ZSAmJiB0b2tlblJlZmVyZW5jZShyZWYudmFsdWUpID09PSB0b2tlblJlZmVyZW5jZShwcm92aWRlckFzdC50b2tlbikpIHtcbiAgICAgICAgdGhpcy5yZWZOb2RlSW5kaWNlc1tyZWYubmFtZV0gPSBub2RlSW5kZXg7XG4gICAgICAgIHF1ZXJ5TWF0Y2hFeHBycy5wdXNoKFxuICAgICAgICAgICAgby5saXRlcmFsQXJyKFtvLmxpdGVyYWwocmVmLm5hbWUpLCBvLmxpdGVyYWwoUXVlcnlWYWx1ZVR5cGUuUHJvdmlkZXIpXSkpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKGRpckFzdC5kaXJlY3RpdmUuaXNDb21wb25lbnQpIHtcbiAgICAgIGZsYWdzIHw9IE5vZGVGbGFncy5Db21wb25lbnQ7XG4gICAgfVxuXG4gICAgY29uc3QgaW5wdXREZWZzID0gZGlyQXN0LmlucHV0cy5tYXAoKGlucHV0QXN0LCBpbnB1dEluZGV4KSA9PiB7XG4gICAgICBjb25zdCBtYXBWYWx1ZSA9IG8ubGl0ZXJhbEFycihbby5saXRlcmFsKGlucHV0SW5kZXgpLCBvLmxpdGVyYWwoaW5wdXRBc3QuZGlyZWN0aXZlTmFtZSldKTtcbiAgICAgIC8vIE5vdGU6IGl0J3MgaW1wb3J0YW50IHRvIG5vdCBxdW90ZSB0aGUga2V5IHNvIHRoYXQgd2UgY2FuIGNhcHR1cmUgcmVuYW1lcyBieSBtaW5pZmllcnMhXG4gICAgICByZXR1cm4gbmV3IG8uTGl0ZXJhbE1hcEVudHJ5KGlucHV0QXN0LmRpcmVjdGl2ZU5hbWUsIG1hcFZhbHVlLCBmYWxzZSk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBvdXRwdXREZWZzOiBvLkxpdGVyYWxNYXBFbnRyeVtdID0gW107XG4gICAgY29uc3QgZGlyTWV0YSA9IGRpckFzdC5kaXJlY3RpdmU7XG4gICAgT2JqZWN0LmtleXMoZGlyTWV0YS5vdXRwdXRzKS5mb3JFYWNoKChwcm9wTmFtZSkgPT4ge1xuICAgICAgY29uc3QgZXZlbnROYW1lID0gZGlyTWV0YS5vdXRwdXRzW3Byb3BOYW1lXTtcbiAgICAgIGlmICh1c2VkRXZlbnRzLmhhcyhldmVudE5hbWUpKSB7XG4gICAgICAgIC8vIE5vdGU6IGl0J3MgaW1wb3J0YW50IHRvIG5vdCBxdW90ZSB0aGUga2V5IHNvIHRoYXQgd2UgY2FuIGNhcHR1cmUgcmVuYW1lcyBieSBtaW5pZmllcnMhXG4gICAgICAgIG91dHB1dERlZnMucHVzaChuZXcgby5MaXRlcmFsTWFwRW50cnkocHJvcE5hbWUsIG8ubGl0ZXJhbChldmVudE5hbWUpLCBmYWxzZSkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGxldCB1cGRhdGVEaXJlY3RpdmVFeHByZXNzaW9uczogVXBkYXRlRXhwcmVzc2lvbltdID0gW107XG4gICAgaWYgKGRpckFzdC5pbnB1dHMubGVuZ3RoIHx8IChmbGFncyAmIChOb2RlRmxhZ3MuRG9DaGVjayB8IE5vZGVGbGFncy5PbkluaXQpKSA+IDApIHtcbiAgICAgIHVwZGF0ZURpcmVjdGl2ZUV4cHJlc3Npb25zID1cbiAgICAgICAgICBkaXJBc3QuaW5wdXRzLm1hcCgoaW5wdXQsIGJpbmRpbmdJbmRleCkgPT4gdGhpcy5fcHJlcHJvY2Vzc1VwZGF0ZUV4cHJlc3Npb24oe1xuICAgICAgICAgICAgbm9kZUluZGV4LFxuICAgICAgICAgICAgYmluZGluZ0luZGV4LFxuICAgICAgICAgICAgc291cmNlU3BhbjogaW5wdXQuc291cmNlU3BhbixcbiAgICAgICAgICAgIGNvbnRleHQ6IENPTVBfVkFSLFxuICAgICAgICAgICAgdmFsdWU6IGlucHV0LnZhbHVlXG4gICAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIGNvbnN0IGRpckNvbnRleHRFeHByID1cbiAgICAgICAgby5pbXBvcnRFeHByKElkZW50aWZpZXJzLm5vZGVWYWx1ZSkuY2FsbEZuKFtWSUVXX1ZBUiwgby5saXRlcmFsKG5vZGVJbmRleCldKTtcbiAgICBjb25zdCBob3N0QmluZGluZ3MgPSBkaXJBc3QuaG9zdFByb3BlcnRpZXMubWFwKChpbnB1dEFzdCkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogZGlyQ29udGV4dEV4cHIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpckFzdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRBc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgY29uc3QgaG9zdEV2ZW50cyA9IGRpckFzdC5ob3N0RXZlbnRzLm1hcCgoaG9zdEV2ZW50QXN0KSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBkaXJDb250ZXh0RXhwcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRBc3Q6IGhvc3RFdmVudEFzdCwgZGlyQXN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgLy8gQ2hlY2sgaW5kZXggaXMgdGhlIHNhbWUgYXMgdGhlIG5vZGUgaW5kZXggZHVyaW5nIGNvbXBpbGF0aW9uXG4gICAgLy8gVGhleSBtaWdodCBvbmx5IGRpZmZlciBhdCBydW50aW1lXG4gICAgY29uc3QgY2hlY2tJbmRleCA9IG5vZGVJbmRleDtcblxuICAgIHRoaXMubm9kZXNbbm9kZUluZGV4XSA9ICgpID0+ICh7XG4gICAgICBzb3VyY2VTcGFuOiBkaXJBc3Quc291cmNlU3BhbixcbiAgICAgIG5vZGVGbGFnczogTm9kZUZsYWdzLlR5cGVEaXJlY3RpdmUgfCBmbGFncyxcbiAgICAgIG5vZGVEZWY6IG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5kaXJlY3RpdmVEZWYpLmNhbGxGbihbXG4gICAgICAgIG8ubGl0ZXJhbChjaGVja0luZGV4KSxcbiAgICAgICAgby5saXRlcmFsKGZsYWdzKSxcbiAgICAgICAgcXVlcnlNYXRjaEV4cHJzLmxlbmd0aCA/IG8ubGl0ZXJhbEFycihxdWVyeU1hdGNoRXhwcnMpIDogby5OVUxMX0VYUFIsXG4gICAgICAgIG8ubGl0ZXJhbChjaGlsZENvdW50KSxcbiAgICAgICAgcHJvdmlkZXJFeHByLFxuICAgICAgICBkZXBzRXhwcixcbiAgICAgICAgaW5wdXREZWZzLmxlbmd0aCA/IG5ldyBvLkxpdGVyYWxNYXBFeHByKGlucHV0RGVmcykgOiBvLk5VTExfRVhQUixcbiAgICAgICAgb3V0cHV0RGVmcy5sZW5ndGggPyBuZXcgby5MaXRlcmFsTWFwRXhwcihvdXRwdXREZWZzKSA6IG8uTlVMTF9FWFBSLFxuICAgICAgXSksXG4gICAgICB1cGRhdGVEaXJlY3RpdmVzOiB1cGRhdGVEaXJlY3RpdmVFeHByZXNzaW9ucyxcbiAgICAgIGRpcmVjdGl2ZTogZGlyQXN0LmRpcmVjdGl2ZS50eXBlLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtob3N0QmluZGluZ3MsIGhvc3RFdmVudHN9O1xuICB9XG5cbiAgcHJpdmF0ZSBfdmlzaXRQcm92aWRlcihwcm92aWRlckFzdDogUHJvdmlkZXJBc3QsIHF1ZXJ5TWF0Y2hlczogUXVlcnlNYXRjaFtdKTogdm9pZCB7XG4gICAgdGhpcy5fYWRkUHJvdmlkZXJOb2RlKHRoaXMuX3Zpc2l0UHJvdmlkZXJPckRpcmVjdGl2ZShwcm92aWRlckFzdCwgcXVlcnlNYXRjaGVzKSk7XG4gIH1cblxuICBwcml2YXRlIF92aXNpdENvbXBvbmVudEZhY3RvcnlSZXNvbHZlclByb3ZpZGVyKGRpcmVjdGl2ZXM6IERpcmVjdGl2ZUFzdFtdKSB7XG4gICAgY29uc3QgY29tcG9uZW50RGlyTWV0YSA9IGRpcmVjdGl2ZXMuZmluZChkaXJBc3QgPT4gZGlyQXN0LmRpcmVjdGl2ZS5pc0NvbXBvbmVudCk7XG4gICAgaWYgKGNvbXBvbmVudERpck1ldGEgJiYgY29tcG9uZW50RGlyTWV0YS5kaXJlY3RpdmUuZW50cnlDb21wb25lbnRzLmxlbmd0aCkge1xuICAgICAgY29uc3Qge3Byb3ZpZGVyRXhwciwgZGVwc0V4cHIsIGZsYWdzLCB0b2tlbkV4cHJ9ID0gY29tcG9uZW50RmFjdG9yeVJlc29sdmVyUHJvdmlkZXJEZWYoXG4gICAgICAgICAgdGhpcy5yZWZsZWN0b3IsIHRoaXMub3V0cHV0Q3R4LCBOb2RlRmxhZ3MuUHJpdmF0ZVByb3ZpZGVyLFxuICAgICAgICAgIGNvbXBvbmVudERpck1ldGEuZGlyZWN0aXZlLmVudHJ5Q29tcG9uZW50cyk7XG4gICAgICB0aGlzLl9hZGRQcm92aWRlck5vZGUoe1xuICAgICAgICBwcm92aWRlckV4cHIsXG4gICAgICAgIGRlcHNFeHByLFxuICAgICAgICBmbGFncyxcbiAgICAgICAgdG9rZW5FeHByLFxuICAgICAgICBxdWVyeU1hdGNoRXhwcnM6IFtdLFxuICAgICAgICBzb3VyY2VTcGFuOiBjb21wb25lbnREaXJNZXRhLnNvdXJjZVNwYW5cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FkZFByb3ZpZGVyTm9kZShkYXRhOiB7XG4gICAgZmxhZ3M6IE5vZGVGbGFncyxcbiAgICBxdWVyeU1hdGNoRXhwcnM6IG8uRXhwcmVzc2lvbltdLFxuICAgIHByb3ZpZGVyRXhwcjogby5FeHByZXNzaW9uLFxuICAgIGRlcHNFeHByOiBvLkV4cHJlc3Npb24sXG4gICAgdG9rZW5FeHByOiBvLkV4cHJlc3Npb24sXG4gICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuXG4gIH0pIHtcbiAgICAvLyBwcm92aWRlckRlZihcbiAgICAvLyAgIGZsYWdzOiBOb2RlRmxhZ3MsIG1hdGNoZWRRdWVyaWVzOiBbc3RyaW5nLCBRdWVyeVZhbHVlVHlwZV1bXSwgdG9rZW46YW55LFxuICAgIC8vICAgdmFsdWU6IGFueSwgZGVwczogKFtEZXBGbGFncywgYW55XSB8IGFueSlbXSk6IE5vZGVEZWY7XG4gICAgdGhpcy5ub2Rlcy5wdXNoKFxuICAgICAgICAoKSA9PiAoe1xuICAgICAgICAgIHNvdXJjZVNwYW46IGRhdGEuc291cmNlU3BhbixcbiAgICAgICAgICBub2RlRmxhZ3M6IGRhdGEuZmxhZ3MsXG4gICAgICAgICAgbm9kZURlZjogby5pbXBvcnRFeHByKElkZW50aWZpZXJzLnByb3ZpZGVyRGVmKS5jYWxsRm4oW1xuICAgICAgICAgICAgby5saXRlcmFsKGRhdGEuZmxhZ3MpLFxuICAgICAgICAgICAgZGF0YS5xdWVyeU1hdGNoRXhwcnMubGVuZ3RoID8gby5saXRlcmFsQXJyKGRhdGEucXVlcnlNYXRjaEV4cHJzKSA6IG8uTlVMTF9FWFBSLFxuICAgICAgICAgICAgZGF0YS50b2tlbkV4cHIsIGRhdGEucHJvdmlkZXJFeHByLCBkYXRhLmRlcHNFeHByXG4gICAgICAgICAgXSlcbiAgICAgICAgfSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdmlzaXRQcm92aWRlck9yRGlyZWN0aXZlKHByb3ZpZGVyQXN0OiBQcm92aWRlckFzdCwgcXVlcnlNYXRjaGVzOiBRdWVyeU1hdGNoW10pOiB7XG4gICAgZmxhZ3M6IE5vZGVGbGFncyxcbiAgICB0b2tlbkV4cHI6IG8uRXhwcmVzc2lvbixcbiAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgcXVlcnlNYXRjaEV4cHJzOiBvLkV4cHJlc3Npb25bXSxcbiAgICBwcm92aWRlckV4cHI6IG8uRXhwcmVzc2lvbixcbiAgICBkZXBzRXhwcjogby5FeHByZXNzaW9uXG4gIH0ge1xuICAgIGxldCBmbGFncyA9IE5vZGVGbGFncy5Ob25lO1xuICAgIGxldCBxdWVyeU1hdGNoRXhwcnM6IG8uRXhwcmVzc2lvbltdID0gW107XG5cbiAgICBxdWVyeU1hdGNoZXMuZm9yRWFjaCgobWF0Y2gpID0+IHtcbiAgICAgIGlmICh0b2tlblJlZmVyZW5jZShtYXRjaC52YWx1ZSkgPT09IHRva2VuUmVmZXJlbmNlKHByb3ZpZGVyQXN0LnRva2VuKSkge1xuICAgICAgICBxdWVyeU1hdGNoRXhwcnMucHVzaChcbiAgICAgICAgICAgIG8ubGl0ZXJhbEFycihbby5saXRlcmFsKG1hdGNoLnF1ZXJ5SWQpLCBvLmxpdGVyYWwoUXVlcnlWYWx1ZVR5cGUuUHJvdmlkZXIpXSkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGNvbnN0IHtwcm92aWRlckV4cHIsIGRlcHNFeHByLCBmbGFnczogcHJvdmlkZXJGbGFncywgdG9rZW5FeHByfSA9XG4gICAgICAgIHByb3ZpZGVyRGVmKHRoaXMub3V0cHV0Q3R4LCBwcm92aWRlckFzdCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZsYWdzOiBmbGFncyB8IHByb3ZpZGVyRmxhZ3MsXG4gICAgICBxdWVyeU1hdGNoRXhwcnMsXG4gICAgICBwcm92aWRlckV4cHIsXG4gICAgICBkZXBzRXhwcixcbiAgICAgIHRva2VuRXhwcixcbiAgICAgIHNvdXJjZVNwYW46IHByb3ZpZGVyQXN0LnNvdXJjZVNwYW5cbiAgICB9O1xuICB9XG5cbiAgZ2V0TG9jYWwobmFtZTogc3RyaW5nKTogby5FeHByZXNzaW9ufG51bGwge1xuICAgIGlmIChuYW1lID09IEV2ZW50SGFuZGxlclZhcnMuZXZlbnQubmFtZSkge1xuICAgICAgcmV0dXJuIEV2ZW50SGFuZGxlclZhcnMuZXZlbnQ7XG4gICAgfVxuICAgIGxldCBjdXJyVmlld0V4cHI6IG8uRXhwcmVzc2lvbiA9IFZJRVdfVkFSO1xuICAgIGZvciAobGV0IGN1cnJCdWlsZGVyOiBWaWV3QnVpbGRlcnxudWxsID0gdGhpczsgY3VyckJ1aWxkZXI7IGN1cnJCdWlsZGVyID0gY3VyckJ1aWxkZXIucGFyZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyVmlld0V4cHIgPSBjdXJyVmlld0V4cHIucHJvcCgncGFyZW50JykuY2FzdChvLkRZTkFNSUNfVFlQRSkpIHtcbiAgICAgIC8vIGNoZWNrIHJlZmVyZW5jZXNcbiAgICAgIGNvbnN0IHJlZk5vZGVJbmRleCA9IGN1cnJCdWlsZGVyLnJlZk5vZGVJbmRpY2VzW25hbWVdO1xuICAgICAgaWYgKHJlZk5vZGVJbmRleCAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMubm9kZVZhbHVlKS5jYWxsRm4oW2N1cnJWaWV3RXhwciwgby5saXRlcmFsKHJlZk5vZGVJbmRleCldKTtcbiAgICAgIH1cblxuICAgICAgLy8gY2hlY2sgdmFyaWFibGVzXG4gICAgICBjb25zdCB2YXJBc3QgPSBjdXJyQnVpbGRlci52YXJpYWJsZXMuZmluZCgodmFyQXN0KSA9PiB2YXJBc3QubmFtZSA9PT0gbmFtZSk7XG4gICAgICBpZiAodmFyQXN0KSB7XG4gICAgICAgIGNvbnN0IHZhclZhbHVlID0gdmFyQXN0LnZhbHVlIHx8IElNUExJQ0lUX1RFTVBMQVRFX1ZBUjtcbiAgICAgICAgcmV0dXJuIGN1cnJWaWV3RXhwci5wcm9wKCdjb250ZXh0JykucHJvcCh2YXJWYWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgbm90aWZ5SW1wbGljaXRSZWNlaXZlclVzZSgpOiB2b2lkIHtcbiAgICAvLyBOb3QgbmVlZGVkIGluIFZpZXcgRW5naW5lIGFzIFZpZXcgRW5naW5lIHdhbGtzIHRocm91Z2ggdGhlIGdlbmVyYXRlZFxuICAgIC8vIGV4cHJlc3Npb25zIHRvIGZpZ3VyZSBvdXQgaWYgdGhlIGltcGxpY2l0IHJlY2VpdmVyIGlzIHVzZWQgYW5kIG5lZWRzXG4gICAgLy8gdG8gYmUgZ2VuZXJhdGVkIGFzIHBhcnQgb2YgdGhlIHByZS11cGRhdGUgc3RhdGVtZW50cy5cbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZUxpdGVyYWxBcnJheUNvbnZlcnRlcihzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIGFyZ0NvdW50OiBudW1iZXIpOlxuICAgICAgQnVpbHRpbkNvbnZlcnRlciB7XG4gICAgaWYgKGFyZ0NvdW50ID09PSAwKSB7XG4gICAgICBjb25zdCB2YWx1ZUV4cHIgPSBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuRU1QVFlfQVJSQVkpO1xuICAgICAgcmV0dXJuICgpID0+IHZhbHVlRXhwcjtcbiAgICB9XG5cbiAgICBjb25zdCBjaGVja0luZGV4ID0gdGhpcy5ub2Rlcy5sZW5ndGg7XG5cbiAgICB0aGlzLm5vZGVzLnB1c2goKCkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgIG5vZGVGbGFnczogTm9kZUZsYWdzLlR5cGVQdXJlQXJyYXksXG4gICAgICAgICAgICAgICAgICAgICAgbm9kZURlZjogby5pbXBvcnRFeHByKElkZW50aWZpZXJzLnB1cmVBcnJheURlZikuY2FsbEZuKFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbChjaGVja0luZGV4KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbChhcmdDb3VudCksXG4gICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgcmV0dXJuIChhcmdzOiBvLkV4cHJlc3Npb25bXSkgPT4gY2FsbENoZWNrU3RtdChjaGVja0luZGV4LCBhcmdzKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZUxpdGVyYWxNYXBDb252ZXJ0ZXIoXG4gICAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIGtleXM6IHtrZXk6IHN0cmluZywgcXVvdGVkOiBib29sZWFufVtdKTogQnVpbHRpbkNvbnZlcnRlciB7XG4gICAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBjb25zdCB2YWx1ZUV4cHIgPSBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuRU1QVFlfTUFQKTtcbiAgICAgIHJldHVybiAoKSA9PiB2YWx1ZUV4cHI7XG4gICAgfVxuXG4gICAgY29uc3QgbWFwID0gby5saXRlcmFsTWFwKGtleXMubWFwKChlLCBpKSA9PiAoey4uLmUsIHZhbHVlOiBvLmxpdGVyYWwoaSl9KSkpO1xuICAgIGNvbnN0IGNoZWNrSW5kZXggPSB0aGlzLm5vZGVzLmxlbmd0aDtcbiAgICB0aGlzLm5vZGVzLnB1c2goKCkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgIG5vZGVGbGFnczogTm9kZUZsYWdzLlR5cGVQdXJlT2JqZWN0LFxuICAgICAgICAgICAgICAgICAgICAgIG5vZGVEZWY6IG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5wdXJlT2JqZWN0RGVmKS5jYWxsRm4oW1xuICAgICAgICAgICAgICAgICAgICAgICAgby5saXRlcmFsKGNoZWNrSW5kZXgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLFxuICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcblxuICAgIHJldHVybiAoYXJnczogby5FeHByZXNzaW9uW10pID0+IGNhbGxDaGVja1N0bXQoY2hlY2tJbmRleCwgYXJncyk7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVQaXBlQ29udmVydGVyKGV4cHJlc3Npb246IFVwZGF0ZUV4cHJlc3Npb24sIG5hbWU6IHN0cmluZywgYXJnQ291bnQ6IG51bWJlcik6XG4gICAgICBCdWlsdGluQ29udmVydGVyIHtcbiAgICBjb25zdCBwaXBlID0gdGhpcy51c2VkUGlwZXMuZmluZCgocGlwZVN1bW1hcnkpID0+IHBpcGVTdW1tYXJ5Lm5hbWUgPT09IG5hbWUpICE7XG4gICAgaWYgKHBpcGUucHVyZSkge1xuICAgICAgY29uc3QgY2hlY2tJbmRleCA9IHRoaXMubm9kZXMubGVuZ3RoO1xuICAgICAgdGhpcy5ub2Rlcy5wdXNoKCgpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VTcGFuOiBleHByZXNzaW9uLnNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlRmxhZ3M6IE5vZGVGbGFncy5UeXBlUHVyZVBpcGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlRGVmOiBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMucHVyZVBpcGVEZWYpLmNhbGxGbihbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbChjaGVja0luZGV4KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgby5saXRlcmFsKGFyZ0NvdW50KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAvLyBmaW5kIHVuZGVybHlpbmcgcGlwZSBpbiB0aGUgY29tcG9uZW50IHZpZXdcbiAgICAgIGxldCBjb21wVmlld0V4cHI6IG8uRXhwcmVzc2lvbiA9IFZJRVdfVkFSO1xuICAgICAgbGV0IGNvbXBCdWlsZGVyOiBWaWV3QnVpbGRlciA9IHRoaXM7XG4gICAgICB3aGlsZSAoY29tcEJ1aWxkZXIucGFyZW50KSB7XG4gICAgICAgIGNvbXBCdWlsZGVyID0gY29tcEJ1aWxkZXIucGFyZW50O1xuICAgICAgICBjb21wVmlld0V4cHIgPSBjb21wVmlld0V4cHIucHJvcCgncGFyZW50JykuY2FzdChvLkRZTkFNSUNfVFlQRSk7XG4gICAgICB9XG4gICAgICBjb25zdCBwaXBlTm9kZUluZGV4ID0gY29tcEJ1aWxkZXIucHVyZVBpcGVOb2RlSW5kaWNlc1tuYW1lXTtcbiAgICAgIGNvbnN0IHBpcGVWYWx1ZUV4cHI6IG8uRXhwcmVzc2lvbiA9XG4gICAgICAgICAgby5pbXBvcnRFeHByKElkZW50aWZpZXJzLm5vZGVWYWx1ZSkuY2FsbEZuKFtjb21wVmlld0V4cHIsIG8ubGl0ZXJhbChwaXBlTm9kZUluZGV4KV0pO1xuXG4gICAgICByZXR1cm4gKGFyZ3M6IG8uRXhwcmVzc2lvbltdKSA9PiBjYWxsVW53cmFwVmFsdWUoXG4gICAgICAgICAgICAgICAgIGV4cHJlc3Npb24ubm9kZUluZGV4LCBleHByZXNzaW9uLmJpbmRpbmdJbmRleCxcbiAgICAgICAgICAgICAgICAgY2FsbENoZWNrU3RtdChjaGVja0luZGV4LCBbcGlwZVZhbHVlRXhwcl0uY29uY2F0KGFyZ3MpKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IG5vZGVJbmRleCA9IHRoaXMuX2NyZWF0ZVBpcGUoZXhwcmVzc2lvbi5zb3VyY2VTcGFuLCBwaXBlKTtcbiAgICAgIGNvbnN0IG5vZGVWYWx1ZUV4cHIgPVxuICAgICAgICAgIG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5ub2RlVmFsdWUpLmNhbGxGbihbVklFV19WQVIsIG8ubGl0ZXJhbChub2RlSW5kZXgpXSk7XG5cbiAgICAgIHJldHVybiAoYXJnczogby5FeHByZXNzaW9uW10pID0+IGNhbGxVbndyYXBWYWx1ZShcbiAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbi5ub2RlSW5kZXgsIGV4cHJlc3Npb24uYmluZGluZ0luZGV4LFxuICAgICAgICAgICAgICAgICBub2RlVmFsdWVFeHByLmNhbGxNZXRob2QoJ3RyYW5zZm9ybScsIGFyZ3MpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVQaXBlKHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsLCBwaXBlOiBDb21waWxlUGlwZVN1bW1hcnkpOiBudW1iZXIge1xuICAgIGNvbnN0IG5vZGVJbmRleCA9IHRoaXMubm9kZXMubGVuZ3RoO1xuICAgIGxldCBmbGFncyA9IE5vZGVGbGFncy5Ob25lO1xuICAgIHBpcGUudHlwZS5saWZlY3ljbGVIb29rcy5mb3JFYWNoKChsaWZlY3ljbGVIb29rKSA9PiB7XG4gICAgICAvLyBmb3IgcGlwZXMsIHdlIG9ubHkgc3VwcG9ydCBuZ09uRGVzdHJveVxuICAgICAgaWYgKGxpZmVjeWNsZUhvb2sgPT09IExpZmVjeWNsZUhvb2tzLk9uRGVzdHJveSkge1xuICAgICAgICBmbGFncyB8PSBsaWZlY3ljbGVIb29rVG9Ob2RlRmxhZyhsaWZlY3ljbGVIb29rKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IGRlcEV4cHJzID0gcGlwZS50eXBlLmRpRGVwcy5tYXAoKGRpRGVwKSA9PiBkZXBEZWYodGhpcy5vdXRwdXRDdHgsIGRpRGVwKSk7XG4gICAgLy8gZnVuY3Rpb24gcGlwZURlZihcbiAgICAvLyAgIGZsYWdzOiBOb2RlRmxhZ3MsIGN0b3I6IGFueSwgZGVwczogKFtEZXBGbGFncywgYW55XSB8IGFueSlbXSk6IE5vZGVEZWZcbiAgICB0aGlzLm5vZGVzLnB1c2goXG4gICAgICAgICgpID0+ICh7XG4gICAgICAgICAgc291cmNlU3BhbixcbiAgICAgICAgICBub2RlRmxhZ3M6IE5vZGVGbGFncy5UeXBlUGlwZSxcbiAgICAgICAgICBub2RlRGVmOiBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMucGlwZURlZikuY2FsbEZuKFtcbiAgICAgICAgICAgIG8ubGl0ZXJhbChmbGFncyksIHRoaXMub3V0cHV0Q3R4LmltcG9ydEV4cHIocGlwZS50eXBlLnJlZmVyZW5jZSksIG8ubGl0ZXJhbEFycihkZXBFeHBycylcbiAgICAgICAgICBdKVxuICAgICAgICB9KSk7XG4gICAgcmV0dXJuIG5vZGVJbmRleDtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgdGhlIEFTVCBpbiBgVXBkYXRlRXhwcmVzc2lvbi52YWx1ZWA6XG4gICAqIC0gY3JlYXRlIG5vZGVzIGZvciBwaXBlcywgbGl0ZXJhbCBhcnJheXMgYW5kLCBsaXRlcmFsIG1hcHMsXG4gICAqIC0gdXBkYXRlIHRoZSBBU1QgdG8gcmVwbGFjZSBwaXBlcywgbGl0ZXJhbCBhcnJheXMgYW5kLCBsaXRlcmFsIG1hcHMgd2l0aCBjYWxscyB0byBjaGVjayBmbi5cbiAgICpcbiAgICogV0FSTklORzogVGhpcyBtaWdodCBjcmVhdGUgbmV3IG5vZGVEZWZzIChmb3IgcGlwZXMgYW5kIGxpdGVyYWwgYXJyYXlzIGFuZCBsaXRlcmFsIG1hcHMpIVxuICAgKi9cbiAgcHJpdmF0ZSBfcHJlcHJvY2Vzc1VwZGF0ZUV4cHJlc3Npb24oZXhwcmVzc2lvbjogVXBkYXRlRXhwcmVzc2lvbik6IFVwZGF0ZUV4cHJlc3Npb24ge1xuICAgIHJldHVybiB7XG4gICAgICBub2RlSW5kZXg6IGV4cHJlc3Npb24ubm9kZUluZGV4LFxuICAgICAgYmluZGluZ0luZGV4OiBleHByZXNzaW9uLmJpbmRpbmdJbmRleCxcbiAgICAgIHNvdXJjZVNwYW46IGV4cHJlc3Npb24uc291cmNlU3BhbixcbiAgICAgIGNvbnRleHQ6IGV4cHJlc3Npb24uY29udGV4dCxcbiAgICAgIHZhbHVlOiBjb252ZXJ0UHJvcGVydHlCaW5kaW5nQnVpbHRpbnMoXG4gICAgICAgICAge1xuICAgICAgICAgICAgY3JlYXRlTGl0ZXJhbEFycmF5Q29udmVydGVyOiAoYXJnQ291bnQ6IG51bWJlcikgPT4gdGhpcy5fY3JlYXRlTGl0ZXJhbEFycmF5Q29udmVydGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbi5zb3VyY2VTcGFuLCBhcmdDb3VudCksXG4gICAgICAgICAgICBjcmVhdGVMaXRlcmFsTWFwQ29udmVydGVyOlxuICAgICAgICAgICAgICAgIChrZXlzOiB7a2V5OiBzdHJpbmcsIHF1b3RlZDogYm9vbGVhbn1bXSkgPT5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3JlYXRlTGl0ZXJhbE1hcENvbnZlcnRlcihleHByZXNzaW9uLnNvdXJjZVNwYW4sIGtleXMpLFxuICAgICAgICAgICAgY3JlYXRlUGlwZUNvbnZlcnRlcjogKG5hbWU6IHN0cmluZywgYXJnQ291bnQ6IG51bWJlcikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jcmVhdGVQaXBlQ29udmVydGVyKGV4cHJlc3Npb24sIG5hbWUsIGFyZ0NvdW50KVxuICAgICAgICAgIH0sXG4gICAgICAgICAgZXhwcmVzc2lvbi52YWx1ZSlcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlTm9kZUV4cHJlc3Npb25zKCk6IHtcbiAgICB1cGRhdGVSZW5kZXJlclN0bXRzOiBvLlN0YXRlbWVudFtdLFxuICAgIHVwZGF0ZURpcmVjdGl2ZXNTdG10czogby5TdGF0ZW1lbnRbXSxcbiAgICBub2RlRGVmRXhwcnM6IG8uRXhwcmVzc2lvbltdXG4gIH0ge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGxldCB1cGRhdGVCaW5kaW5nQ291bnQgPSAwO1xuICAgIGNvbnN0IHVwZGF0ZVJlbmRlcmVyU3RtdHM6IG8uU3RhdGVtZW50W10gPSBbXTtcbiAgICBjb25zdCB1cGRhdGVEaXJlY3RpdmVzU3RtdHM6IG8uU3RhdGVtZW50W10gPSBbXTtcbiAgICBjb25zdCBub2RlRGVmRXhwcnMgPSB0aGlzLm5vZGVzLm1hcCgoZmFjdG9yeSwgbm9kZUluZGV4KSA9PiB7XG4gICAgICBjb25zdCB7bm9kZURlZiwgbm9kZUZsYWdzLCB1cGRhdGVEaXJlY3RpdmVzLCB1cGRhdGVSZW5kZXJlciwgc291cmNlU3Bhbn0gPSBmYWN0b3J5KCk7XG4gICAgICBpZiAodXBkYXRlUmVuZGVyZXIpIHtcbiAgICAgICAgdXBkYXRlUmVuZGVyZXJTdG10cy5wdXNoKFxuICAgICAgICAgICAgLi4uY3JlYXRlVXBkYXRlU3RhdGVtZW50cyhub2RlSW5kZXgsIHNvdXJjZVNwYW4sIHVwZGF0ZVJlbmRlcmVyLCBmYWxzZSkpO1xuICAgICAgfVxuICAgICAgaWYgKHVwZGF0ZURpcmVjdGl2ZXMpIHtcbiAgICAgICAgdXBkYXRlRGlyZWN0aXZlc1N0bXRzLnB1c2goLi4uY3JlYXRlVXBkYXRlU3RhdGVtZW50cyhcbiAgICAgICAgICAgIG5vZGVJbmRleCwgc291cmNlU3BhbiwgdXBkYXRlRGlyZWN0aXZlcyxcbiAgICAgICAgICAgIChub2RlRmxhZ3MgJiAoTm9kZUZsYWdzLkRvQ2hlY2sgfCBOb2RlRmxhZ3MuT25Jbml0KSkgPiAwKSk7XG4gICAgICB9XG4gICAgICAvLyBXZSB1c2UgYSBjb21tYSBleHByZXNzaW9uIHRvIGNhbGwgdGhlIGxvZyBmdW5jdGlvbiBiZWZvcmVcbiAgICAgIC8vIHRoZSBub2RlRGVmIGZ1bmN0aW9uLCBidXQgc3RpbGwgdXNlIHRoZSByZXN1bHQgb2YgdGhlIG5vZGVEZWYgZnVuY3Rpb25cbiAgICAgIC8vIGFzIHRoZSB2YWx1ZS5cbiAgICAgIC8vIE5vdGU6IFdlIG9ubHkgYWRkIHRoZSBsb2dnZXIgdG8gZWxlbWVudHMgLyB0ZXh0IG5vZGVzLFxuICAgICAgLy8gc28gd2UgZG9uJ3QgZ2VuZXJhdGUgdG9vIG11Y2ggY29kZS5cbiAgICAgIGNvbnN0IGxvZ1dpdGhOb2RlRGVmID0gbm9kZUZsYWdzICYgTm9kZUZsYWdzLkNhdFJlbmRlck5vZGUgP1xuICAgICAgICAgIG5ldyBvLkNvbW1hRXhwcihbTE9HX1ZBUi5jYWxsRm4oW10pLmNhbGxGbihbXSksIG5vZGVEZWZdKSA6XG4gICAgICAgICAgbm9kZURlZjtcbiAgICAgIHJldHVybiBvLmFwcGx5U291cmNlU3BhblRvRXhwcmVzc2lvbklmTmVlZGVkKGxvZ1dpdGhOb2RlRGVmLCBzb3VyY2VTcGFuKTtcbiAgICB9KTtcbiAgICByZXR1cm4ge3VwZGF0ZVJlbmRlcmVyU3RtdHMsIHVwZGF0ZURpcmVjdGl2ZXNTdG10cywgbm9kZURlZkV4cHJzfTtcblxuICAgIGZ1bmN0aW9uIGNyZWF0ZVVwZGF0ZVN0YXRlbWVudHMoXG4gICAgICAgIG5vZGVJbmRleDogbnVtYmVyLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4gfCBudWxsLCBleHByZXNzaW9uczogVXBkYXRlRXhwcmVzc2lvbltdLFxuICAgICAgICBhbGxvd0VtcHR5RXhwcnM6IGJvb2xlYW4pOiBvLlN0YXRlbWVudFtdIHtcbiAgICAgIGNvbnN0IHVwZGF0ZVN0bXRzOiBvLlN0YXRlbWVudFtdID0gW107XG4gICAgICBjb25zdCBleHBycyA9IGV4cHJlc3Npb25zLm1hcCgoe3NvdXJjZVNwYW4sIGNvbnRleHQsIHZhbHVlfSkgPT4ge1xuICAgICAgICBjb25zdCBiaW5kaW5nSWQgPSBgJHt1cGRhdGVCaW5kaW5nQ291bnQrK31gO1xuICAgICAgICBjb25zdCBuYW1lUmVzb2x2ZXIgPSBjb250ZXh0ID09PSBDT01QX1ZBUiA/IHNlbGYgOiBudWxsO1xuICAgICAgICBjb25zdCB7c3RtdHMsIGN1cnJWYWxFeHByfSA9XG4gICAgICAgICAgICBjb252ZXJ0UHJvcGVydHlCaW5kaW5nKG5hbWVSZXNvbHZlciwgY29udGV4dCwgdmFsdWUsIGJpbmRpbmdJZCwgQmluZGluZ0Zvcm0uR2VuZXJhbCk7XG4gICAgICAgIHVwZGF0ZVN0bXRzLnB1c2goLi4uc3RtdHMubWFwKFxuICAgICAgICAgICAgKHN0bXQ6IG8uU3RhdGVtZW50KSA9PiBvLmFwcGx5U291cmNlU3BhblRvU3RhdGVtZW50SWZOZWVkZWQoc3RtdCwgc291cmNlU3BhbikpKTtcbiAgICAgICAgcmV0dXJuIG8uYXBwbHlTb3VyY2VTcGFuVG9FeHByZXNzaW9uSWZOZWVkZWQoY3VyclZhbEV4cHIsIHNvdXJjZVNwYW4pO1xuICAgICAgfSk7XG4gICAgICBpZiAoZXhwcmVzc2lvbnMubGVuZ3RoIHx8IGFsbG93RW1wdHlFeHBycykge1xuICAgICAgICB1cGRhdGVTdG10cy5wdXNoKG8uYXBwbHlTb3VyY2VTcGFuVG9TdGF0ZW1lbnRJZk5lZWRlZChcbiAgICAgICAgICAgIGNhbGxDaGVja1N0bXQobm9kZUluZGV4LCBleHBycykudG9TdG10KCksIHNvdXJjZVNwYW4pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB1cGRhdGVTdG10cztcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVFbGVtZW50SGFuZGxlRXZlbnRGbihcbiAgICAgIG5vZGVJbmRleDogbnVtYmVyLFxuICAgICAgaGFuZGxlcnM6IHtjb250ZXh0OiBvLkV4cHJlc3Npb24sIGV2ZW50QXN0OiBCb3VuZEV2ZW50QXN0LCBkaXJBc3Q6IERpcmVjdGl2ZUFzdH1bXSkge1xuICAgIGNvbnN0IGhhbmRsZUV2ZW50U3RtdHM6IG8uU3RhdGVtZW50W10gPSBbXTtcbiAgICBsZXQgaGFuZGxlRXZlbnRCaW5kaW5nQ291bnQgPSAwO1xuICAgIGhhbmRsZXJzLmZvckVhY2goKHtjb250ZXh0LCBldmVudEFzdCwgZGlyQXN0fSkgPT4ge1xuICAgICAgY29uc3QgYmluZGluZ0lkID0gYCR7aGFuZGxlRXZlbnRCaW5kaW5nQ291bnQrK31gO1xuICAgICAgY29uc3QgbmFtZVJlc29sdmVyID0gY29udGV4dCA9PT0gQ09NUF9WQVIgPyB0aGlzIDogbnVsbDtcbiAgICAgIGNvbnN0IHtzdG10cywgYWxsb3dEZWZhdWx0fSA9XG4gICAgICAgICAgY29udmVydEFjdGlvbkJpbmRpbmcobmFtZVJlc29sdmVyLCBjb250ZXh0LCBldmVudEFzdC5oYW5kbGVyLCBiaW5kaW5nSWQpO1xuICAgICAgY29uc3QgdHJ1ZVN0bXRzID0gc3RtdHM7XG4gICAgICBpZiAoYWxsb3dEZWZhdWx0KSB7XG4gICAgICAgIHRydWVTdG10cy5wdXNoKEFMTE9XX0RFRkFVTFRfVkFSLnNldChhbGxvd0RlZmF1bHQuYW5kKEFMTE9XX0RFRkFVTFRfVkFSKSkudG9TdG10KCkpO1xuICAgICAgfVxuICAgICAgY29uc3Qge3RhcmdldDogZXZlbnRUYXJnZXQsIG5hbWU6IGV2ZW50TmFtZX0gPSBlbGVtZW50RXZlbnROYW1lQW5kVGFyZ2V0KGV2ZW50QXN0LCBkaXJBc3QpO1xuICAgICAgY29uc3QgZnVsbEV2ZW50TmFtZSA9IGVsZW1lbnRFdmVudEZ1bGxOYW1lKGV2ZW50VGFyZ2V0LCBldmVudE5hbWUpO1xuICAgICAgaGFuZGxlRXZlbnRTdG10cy5wdXNoKG8uYXBwbHlTb3VyY2VTcGFuVG9TdGF0ZW1lbnRJZk5lZWRlZChcbiAgICAgICAgICBuZXcgby5JZlN0bXQoby5saXRlcmFsKGZ1bGxFdmVudE5hbWUpLmlkZW50aWNhbChFVkVOVF9OQU1FX1ZBUiksIHRydWVTdG10cyksXG4gICAgICAgICAgZXZlbnRBc3Quc291cmNlU3BhbikpO1xuICAgIH0pO1xuICAgIGxldCBoYW5kbGVFdmVudEZuOiBvLkV4cHJlc3Npb247XG4gICAgaWYgKGhhbmRsZUV2ZW50U3RtdHMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgcHJlU3RtdHM6IG8uU3RhdGVtZW50W10gPVxuICAgICAgICAgIFtBTExPV19ERUZBVUxUX1ZBUi5zZXQoby5saXRlcmFsKHRydWUpKS50b0RlY2xTdG10KG8uQk9PTF9UWVBFKV07XG4gICAgICBpZiAoIXRoaXMuY29tcG9uZW50LmlzSG9zdCAmJiBvLmZpbmRSZWFkVmFyTmFtZXMoaGFuZGxlRXZlbnRTdG10cykuaGFzKENPTVBfVkFSLm5hbWUgISkpIHtcbiAgICAgICAgcHJlU3RtdHMucHVzaChDT01QX1ZBUi5zZXQoVklFV19WQVIucHJvcCgnY29tcG9uZW50JykpLnRvRGVjbFN0bXQodGhpcy5jb21wVHlwZSkpO1xuICAgICAgfVxuICAgICAgaGFuZGxlRXZlbnRGbiA9IG8uZm4oXG4gICAgICAgICAgW1xuICAgICAgICAgICAgbmV3IG8uRm5QYXJhbShWSUVXX1ZBUi5uYW1lICEsIG8uSU5GRVJSRURfVFlQRSksXG4gICAgICAgICAgICBuZXcgby5GblBhcmFtKEVWRU5UX05BTUVfVkFSLm5hbWUgISwgby5JTkZFUlJFRF9UWVBFKSxcbiAgICAgICAgICAgIG5ldyBvLkZuUGFyYW0oRXZlbnRIYW5kbGVyVmFycy5ldmVudC5uYW1lICEsIG8uSU5GRVJSRURfVFlQRSlcbiAgICAgICAgICBdLFxuICAgICAgICAgIFsuLi5wcmVTdG10cywgLi4uaGFuZGxlRXZlbnRTdG10cywgbmV3IG8uUmV0dXJuU3RhdGVtZW50KEFMTE9XX0RFRkFVTFRfVkFSKV0sXG4gICAgICAgICAgby5JTkZFUlJFRF9UWVBFKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaGFuZGxlRXZlbnRGbiA9IG8uTlVMTF9FWFBSO1xuICAgIH1cbiAgICByZXR1cm4gaGFuZGxlRXZlbnRGbjtcbiAgfVxuXG4gIHZpc2l0RGlyZWN0aXZlKGFzdDogRGlyZWN0aXZlQXN0LCBjb250ZXh0OiB7dXNlZEV2ZW50czogU2V0PHN0cmluZz59KTogYW55IHt9XG4gIHZpc2l0RGlyZWN0aXZlUHJvcGVydHkoYXN0OiBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge31cbiAgdmlzaXRSZWZlcmVuY2UoYXN0OiBSZWZlcmVuY2VBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7fVxuICB2aXNpdFZhcmlhYmxlKGFzdDogVmFyaWFibGVBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7fVxuICB2aXNpdEV2ZW50KGFzdDogQm91bmRFdmVudEFzdCwgY29udGV4dDogYW55KTogYW55IHt9XG4gIHZpc2l0RWxlbWVudFByb3BlcnR5KGFzdDogQm91bmRFbGVtZW50UHJvcGVydHlBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7fVxuICB2aXNpdEF0dHIoYXN0OiBBdHRyQXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge31cbn1cblxuZnVuY3Rpb24gbmVlZHNBZGRpdGlvbmFsUm9vdE5vZGUoYXN0Tm9kZXM6IFRlbXBsYXRlQXN0W10pOiBib29sZWFuIHtcbiAgY29uc3QgbGFzdEFzdE5vZGUgPSBhc3ROb2Rlc1thc3ROb2Rlcy5sZW5ndGggLSAxXTtcbiAgaWYgKGxhc3RBc3ROb2RlIGluc3RhbmNlb2YgRW1iZWRkZWRUZW1wbGF0ZUFzdCkge1xuICAgIHJldHVybiBsYXN0QXN0Tm9kZS5oYXNWaWV3Q29udGFpbmVyO1xuICB9XG5cbiAgaWYgKGxhc3RBc3ROb2RlIGluc3RhbmNlb2YgRWxlbWVudEFzdCkge1xuICAgIGlmIChpc05nQ29udGFpbmVyKGxhc3RBc3ROb2RlLm5hbWUpICYmIGxhc3RBc3ROb2RlLmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIG5lZWRzQWRkaXRpb25hbFJvb3ROb2RlKGxhc3RBc3ROb2RlLmNoaWxkcmVuKTtcbiAgICB9XG4gICAgcmV0dXJuIGxhc3RBc3ROb2RlLmhhc1ZpZXdDb250YWluZXI7XG4gIH1cblxuICByZXR1cm4gbGFzdEFzdE5vZGUgaW5zdGFuY2VvZiBOZ0NvbnRlbnRBc3Q7XG59XG5cblxuZnVuY3Rpb24gZWxlbWVudEJpbmRpbmdEZWYoaW5wdXRBc3Q6IEJvdW5kRWxlbWVudFByb3BlcnR5QXN0LCBkaXJBc3Q6IERpcmVjdGl2ZUFzdCk6IG8uRXhwcmVzc2lvbiB7XG4gIGNvbnN0IGlucHV0VHlwZSA9IGlucHV0QXN0LnR5cGU7XG4gIHN3aXRjaCAoaW5wdXRUeXBlKSB7XG4gICAgY2FzZSBQcm9wZXJ0eUJpbmRpbmdUeXBlLkF0dHJpYnV0ZTpcbiAgICAgIHJldHVybiBvLmxpdGVyYWxBcnIoW1xuICAgICAgICBvLmxpdGVyYWwoQmluZGluZ0ZsYWdzLlR5cGVFbGVtZW50QXR0cmlidXRlKSwgby5saXRlcmFsKGlucHV0QXN0Lm5hbWUpLFxuICAgICAgICBvLmxpdGVyYWwoaW5wdXRBc3Quc2VjdXJpdHlDb250ZXh0KVxuICAgICAgXSk7XG4gICAgY2FzZSBQcm9wZXJ0eUJpbmRpbmdUeXBlLlByb3BlcnR5OlxuICAgICAgcmV0dXJuIG8ubGl0ZXJhbEFycihbXG4gICAgICAgIG8ubGl0ZXJhbChCaW5kaW5nRmxhZ3MuVHlwZVByb3BlcnR5KSwgby5saXRlcmFsKGlucHV0QXN0Lm5hbWUpLFxuICAgICAgICBvLmxpdGVyYWwoaW5wdXRBc3Quc2VjdXJpdHlDb250ZXh0KVxuICAgICAgXSk7XG4gICAgY2FzZSBQcm9wZXJ0eUJpbmRpbmdUeXBlLkFuaW1hdGlvbjpcbiAgICAgIGNvbnN0IGJpbmRpbmdUeXBlID0gQmluZGluZ0ZsYWdzLlR5cGVQcm9wZXJ0eSB8XG4gICAgICAgICAgKGRpckFzdCAmJiBkaXJBc3QuZGlyZWN0aXZlLmlzQ29tcG9uZW50ID8gQmluZGluZ0ZsYWdzLlN5bnRoZXRpY0hvc3RQcm9wZXJ0eSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmluZGluZ0ZsYWdzLlN5bnRoZXRpY1Byb3BlcnR5KTtcbiAgICAgIHJldHVybiBvLmxpdGVyYWxBcnIoW1xuICAgICAgICBvLmxpdGVyYWwoYmluZGluZ1R5cGUpLCBvLmxpdGVyYWwoJ0AnICsgaW5wdXRBc3QubmFtZSksIG8ubGl0ZXJhbChpbnB1dEFzdC5zZWN1cml0eUNvbnRleHQpXG4gICAgICBdKTtcbiAgICBjYXNlIFByb3BlcnR5QmluZGluZ1R5cGUuQ2xhc3M6XG4gICAgICByZXR1cm4gby5saXRlcmFsQXJyKFxuICAgICAgICAgIFtvLmxpdGVyYWwoQmluZGluZ0ZsYWdzLlR5cGVFbGVtZW50Q2xhc3MpLCBvLmxpdGVyYWwoaW5wdXRBc3QubmFtZSksIG8uTlVMTF9FWFBSXSk7XG4gICAgY2FzZSBQcm9wZXJ0eUJpbmRpbmdUeXBlLlN0eWxlOlxuICAgICAgcmV0dXJuIG8ubGl0ZXJhbEFycihbXG4gICAgICAgIG8ubGl0ZXJhbChCaW5kaW5nRmxhZ3MuVHlwZUVsZW1lbnRTdHlsZSksIG8ubGl0ZXJhbChpbnB1dEFzdC5uYW1lKSwgby5saXRlcmFsKGlucHV0QXN0LnVuaXQpXG4gICAgICBdKTtcbiAgICBkZWZhdWx0OlxuICAgICAgLy8gVGhpcyBkZWZhdWx0IGNhc2UgaXMgbm90IG5lZWRlZCBieSBUeXBlU2NyaXB0IGNvbXBpbGVyLCBhcyB0aGUgc3dpdGNoIGlzIGV4aGF1c3RpdmUuXG4gICAgICAvLyBIb3dldmVyIENsb3N1cmUgQ29tcGlsZXIgZG9lcyBub3QgdW5kZXJzdGFuZCB0aGF0IGFuZCByZXBvcnRzIGFuIGVycm9yIGluIHR5cGVkIG1vZGUuXG4gICAgICAvLyBUaGUgYHRocm93IG5ldyBFcnJvcmAgYmVsb3cgd29ya3MgYXJvdW5kIHRoZSBwcm9ibGVtLCBhbmQgdGhlIHVuZXhwZWN0ZWQ6IG5ldmVyIHZhcmlhYmxlXG4gICAgICAvLyBtYWtlcyBzdXJlIHRzYyBzdGlsbCBjaGVja3MgdGhpcyBjb2RlIGlzIHVucmVhY2hhYmxlLlxuICAgICAgY29uc3QgdW5leHBlY3RlZDogbmV2ZXIgPSBpbnB1dFR5cGU7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuZXhwZWN0ZWQgJHt1bmV4cGVjdGVkfWApO1xuICB9XG59XG5cblxuZnVuY3Rpb24gZml4ZWRBdHRyc0RlZihlbGVtZW50QXN0OiBFbGVtZW50QXN0KTogby5FeHByZXNzaW9uIHtcbiAgY29uc3QgbWFwUmVzdWx0OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIGVsZW1lbnRBc3QuYXR0cnMuZm9yRWFjaChhdHRyQXN0ID0+IHsgbWFwUmVzdWx0W2F0dHJBc3QubmFtZV0gPSBhdHRyQXN0LnZhbHVlOyB9KTtcbiAgZWxlbWVudEFzdC5kaXJlY3RpdmVzLmZvckVhY2goZGlyQXN0ID0+IHtcbiAgICBPYmplY3Qua2V5cyhkaXJBc3QuZGlyZWN0aXZlLmhvc3RBdHRyaWJ1dGVzKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBkaXJBc3QuZGlyZWN0aXZlLmhvc3RBdHRyaWJ1dGVzW25hbWVdO1xuICAgICAgY29uc3QgcHJldlZhbHVlID0gbWFwUmVzdWx0W25hbWVdO1xuICAgICAgbWFwUmVzdWx0W25hbWVdID0gcHJldlZhbHVlICE9IG51bGwgPyBtZXJnZUF0dHJpYnV0ZVZhbHVlKG5hbWUsIHByZXZWYWx1ZSwgdmFsdWUpIDogdmFsdWU7XG4gICAgfSk7XG4gIH0pO1xuICAvLyBOb3RlOiBXZSBuZWVkIHRvIHNvcnQgdG8gZ2V0IGEgZGVmaW5lZCBvdXRwdXQgb3JkZXJcbiAgLy8gZm9yIHRlc3RzIGFuZCBmb3IgY2FjaGluZyBnZW5lcmF0ZWQgYXJ0aWZhY3RzLi4uXG4gIHJldHVybiBvLmxpdGVyYWxBcnIoT2JqZWN0LmtleXMobWFwUmVzdWx0KS5zb3J0KCkubWFwKFxuICAgICAgKGF0dHJOYW1lKSA9PiBvLmxpdGVyYWxBcnIoW28ubGl0ZXJhbChhdHRyTmFtZSksIG8ubGl0ZXJhbChtYXBSZXN1bHRbYXR0ck5hbWVdKV0pKSk7XG59XG5cbmZ1bmN0aW9uIG1lcmdlQXR0cmlidXRlVmFsdWUoYXR0ck5hbWU6IHN0cmluZywgYXR0clZhbHVlMTogc3RyaW5nLCBhdHRyVmFsdWUyOiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoYXR0ck5hbWUgPT0gQ0xBU1NfQVRUUiB8fCBhdHRyTmFtZSA9PSBTVFlMRV9BVFRSKSB7XG4gICAgcmV0dXJuIGAke2F0dHJWYWx1ZTF9ICR7YXR0clZhbHVlMn1gO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBhdHRyVmFsdWUyO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNhbGxDaGVja1N0bXQobm9kZUluZGV4OiBudW1iZXIsIGV4cHJzOiBvLkV4cHJlc3Npb25bXSk6IG8uRXhwcmVzc2lvbiB7XG4gIGlmIChleHBycy5sZW5ndGggPiAxMCkge1xuICAgIHJldHVybiBDSEVDS19WQVIuY2FsbEZuKFxuICAgICAgICBbVklFV19WQVIsIG8ubGl0ZXJhbChub2RlSW5kZXgpLCBvLmxpdGVyYWwoQXJndW1lbnRUeXBlLkR5bmFtaWMpLCBvLmxpdGVyYWxBcnIoZXhwcnMpXSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIENIRUNLX1ZBUi5jYWxsRm4oXG4gICAgICAgIFtWSUVXX1ZBUiwgby5saXRlcmFsKG5vZGVJbmRleCksIG8ubGl0ZXJhbChBcmd1bWVudFR5cGUuSW5saW5lKSwgLi4uZXhwcnNdKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjYWxsVW53cmFwVmFsdWUobm9kZUluZGV4OiBudW1iZXIsIGJpbmRpbmdJZHg6IG51bWJlciwgZXhwcjogby5FeHByZXNzaW9uKTogby5FeHByZXNzaW9uIHtcbiAgcmV0dXJuIG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy51bndyYXBWYWx1ZSkuY2FsbEZuKFtcbiAgICBWSUVXX1ZBUiwgby5saXRlcmFsKG5vZGVJbmRleCksIG8ubGl0ZXJhbChiaW5kaW5nSWR4KSwgZXhwclxuICBdKTtcbn1cblxuZnVuY3Rpb24gZWxlbWVudEV2ZW50TmFtZUFuZFRhcmdldChcbiAgICBldmVudEFzdDogQm91bmRFdmVudEFzdCwgZGlyQXN0OiBEaXJlY3RpdmVBc3QgfCBudWxsKToge25hbWU6IHN0cmluZywgdGFyZ2V0OiBzdHJpbmcgfCBudWxsfSB7XG4gIGlmIChldmVudEFzdC5pc0FuaW1hdGlvbikge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiBgQCR7ZXZlbnRBc3QubmFtZX0uJHtldmVudEFzdC5waGFzZX1gLFxuICAgICAgdGFyZ2V0OiBkaXJBc3QgJiYgZGlyQXN0LmRpcmVjdGl2ZS5pc0NvbXBvbmVudCA/ICdjb21wb25lbnQnIDogbnVsbFxuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGV2ZW50QXN0O1xuICB9XG59XG5cbmZ1bmN0aW9uIGNhbGNTdGF0aWNEeW5hbWljUXVlcnlGbGFncyhxdWVyeTogQ29tcGlsZVF1ZXJ5TWV0YWRhdGEpIHtcbiAgbGV0IGZsYWdzID0gTm9kZUZsYWdzLk5vbmU7XG4gIC8vIE5vdGU6IFdlIG9ubHkgbWFrZSBxdWVyaWVzIHN0YXRpYyB0aGF0IHF1ZXJ5IGZvciBhIHNpbmdsZSBpdGVtIGFuZCB0aGUgdXNlciBzcGVjaWZpY2FsbHlcbiAgLy8gc2V0IHRoZSB0byBiZSBzdGF0aWMuIFRoaXMgaXMgYmVjYXVzZSBvZiBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSB3aXRoIHRoZSBvbGQgdmlldyBjb21waWxlci4uLlxuICBpZiAocXVlcnkuZmlyc3QgJiYgcXVlcnkuc3RhdGljKSB7XG4gICAgZmxhZ3MgfD0gTm9kZUZsYWdzLlN0YXRpY1F1ZXJ5O1xuICB9IGVsc2Uge1xuICAgIGZsYWdzIHw9IE5vZGVGbGFncy5EeW5hbWljUXVlcnk7XG4gIH1cbiAgcmV0dXJuIGZsYWdzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZWxlbWVudEV2ZW50RnVsbE5hbWUodGFyZ2V0OiBzdHJpbmcgfCBudWxsLCBuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gdGFyZ2V0ID8gYCR7dGFyZ2V0fToke25hbWV9YCA6IG5hbWU7XG59XG4iXX0=