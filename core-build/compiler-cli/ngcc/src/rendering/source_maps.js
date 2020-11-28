(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/rendering/source_maps", ["require", "exports", "convert-source-map", "source-map", "@angular/compiler-cli/src/ngtsc/file_system"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var convert_source_map_1 = require("convert-source-map");
    var source_map_1 = require("source-map");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    /**
     * Get the map from the source (note whether it is inline or external)
     */
    function extractSourceMap(fs, logger, file) {
        var inline = convert_source_map_1.commentRegex.test(file.text);
        var external = convert_source_map_1.mapFileCommentRegex.exec(file.text);
        if (inline) {
            var inlineSourceMap = convert_source_map_1.fromSource(file.text);
            return {
                source: convert_source_map_1.removeComments(file.text).replace(/\n\n$/, '\n'),
                map: inlineSourceMap,
                isInline: true,
            };
        }
        else if (external) {
            var externalSourceMap = null;
            try {
                var fileName = external[1] || external[2];
                var filePath = file_system_1.resolve(file_system_1.dirname(file_system_1.absoluteFromSourceFile(file)), fileName);
                var mappingFile = fs.readFile(filePath);
                externalSourceMap = convert_source_map_1.fromJSON(mappingFile);
            }
            catch (e) {
                if (e.code === 'ENOENT') {
                    logger.warn("The external map file specified in the source code comment \"" + e.path + "\" was not found on the file system.");
                    var mapPath = file_system_1.absoluteFrom(file.fileName + '.map');
                    if (file_system_1.basename(e.path) !== file_system_1.basename(mapPath) && fs.exists(mapPath) &&
                        fs.stat(mapPath).isFile()) {
                        logger.warn("Guessing the map file name from the source file name: \"" + file_system_1.basename(mapPath) + "\"");
                        try {
                            externalSourceMap = convert_source_map_1.fromObject(JSON.parse(fs.readFile(mapPath)));
                        }
                        catch (e) {
                            logger.error(e);
                        }
                    }
                }
            }
            return {
                source: convert_source_map_1.removeMapFileComments(file.text).replace(/\n\n$/, '\n'),
                map: externalSourceMap,
                isInline: false,
            };
        }
        else {
            return { source: file.text, map: null, isInline: false };
        }
    }
    exports.extractSourceMap = extractSourceMap;
    /**
     * Merge the input and output source-maps, replacing the source-map comment in the output file
     * with an appropriate source-map comment pointing to the merged source-map.
     */
    function renderSourceAndMap(sourceFile, input, output) {
        var outputPath = file_system_1.absoluteFromSourceFile(sourceFile);
        var outputMapPath = file_system_1.absoluteFrom(outputPath + ".map");
        var relativeSourcePath = file_system_1.basename(outputPath);
        var relativeMapPath = relativeSourcePath + ".map";
        var outputMap = output.generateMap({
            source: outputPath,
            includeContent: true,
        });
        // we must set this after generation as magic string does "manipulation" on the path
        outputMap.file = relativeSourcePath;
        var mergedMap = mergeSourceMaps(input.map && input.map.toObject(), JSON.parse(outputMap.toString()));
        var result = [];
        if (input.isInline) {
            result.push({ path: outputPath, contents: output.toString() + "\n" + mergedMap.toComment() });
        }
        else {
            result.push({
                path: outputPath,
                contents: output.toString() + "\n" + convert_source_map_1.generateMapFileComment(relativeMapPath)
            });
            result.push({ path: outputMapPath, contents: mergedMap.toJSON() });
        }
        return result;
    }
    exports.renderSourceAndMap = renderSourceAndMap;
    /**
     * Merge the two specified source-maps into a single source-map that hides the intermediate
     * source-map.
     * E.g. Consider these mappings:
     *
     * ```
     * OLD_SRC -> OLD_MAP -> INTERMEDIATE_SRC -> NEW_MAP -> NEW_SRC
     * ```
     *
     * this will be replaced with:
     *
     * ```
     * OLD_SRC -> MERGED_MAP -> NEW_SRC
     * ```
     */
    function mergeSourceMaps(oldMap, newMap) {
        if (!oldMap) {
            return convert_source_map_1.fromObject(newMap);
        }
        var oldMapConsumer = new source_map_1.SourceMapConsumer(oldMap);
        var newMapConsumer = new source_map_1.SourceMapConsumer(newMap);
        try {
            var mergedMapGenerator = source_map_1.SourceMapGenerator.fromSourceMap(newMapConsumer);
            mergedMapGenerator.applySourceMap(oldMapConsumer);
            var merged = convert_source_map_1.fromJSON(mergedMapGenerator.toString());
            return merged;
        }
        catch (e) {
            return convert_source_map_1.fromObject(newMap);
        }
    }
    exports.mergeSourceMaps = mergeSourceMaps;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlX21hcHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvcmVuZGVyaW5nL3NvdXJjZV9tYXBzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gseURBQTBMO0lBRTFMLHlDQUErRTtJQUUvRSwyRUFBNEg7SUFVNUg7O09BRUc7SUFDSCxTQUFnQixnQkFBZ0IsQ0FDNUIsRUFBYyxFQUFFLE1BQWMsRUFBRSxJQUFtQjtRQUNyRCxJQUFNLE1BQU0sR0FBRyxpQ0FBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUMsSUFBTSxRQUFRLEdBQUcsd0NBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVyRCxJQUFJLE1BQU0sRUFBRTtZQUNWLElBQU0sZUFBZSxHQUFHLCtCQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlDLE9BQU87Z0JBQ0wsTUFBTSxFQUFFLG1DQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDO2dCQUN4RCxHQUFHLEVBQUUsZUFBZTtnQkFDcEIsUUFBUSxFQUFFLElBQUk7YUFDZixDQUFDO1NBQ0g7YUFBTSxJQUFJLFFBQVEsRUFBRTtZQUNuQixJQUFJLGlCQUFpQixHQUE0QixJQUFJLENBQUM7WUFDdEQsSUFBSTtnQkFDRixJQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1QyxJQUFNLFFBQVEsR0FBRyxxQkFBTyxDQUFDLHFCQUFPLENBQUMsb0NBQXNCLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDMUUsSUFBTSxX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QU0sQ0FBQyxRQUFRLEVBQUUsVUFBSywyQ0FBc0IsQ0FBQyxlQUFlLENBQUc7YUFDN0UsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxNQUFNLEVBQUUsRUFBQyxDQUFDLENBQUM7U0FDbEU7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBL0JELGdEQStCQztJQUdEOzs7Ozs7Ozs7Ozs7OztPQWNHO0lBQ0gsU0FBZ0IsZUFBZSxDQUMzQixNQUEyQixFQUFFLE1BQW9CO1FBQ25ELElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDWCxPQUFPLCtCQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDM0I7UUFDRCxJQUFNLGNBQWMsR0FBRyxJQUFJLDhCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JELElBQU0sY0FBYyxHQUFHLElBQUksOEJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckQsSUFBSTtZQUNGLElBQU0sa0JBQWtCLEdBQUcsK0JBQWtCLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzVFLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNsRCxJQUFNLE1BQU0sR0FBRyw2QkFBUSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDdkQsT0FBTyxNQUFNLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsT0FBTywrQkFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzNCO0lBQ0gsQ0FBQztJQWZELDBDQWVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtTb3VyY2VNYXBDb252ZXJ0ZXIsIGNvbW1lbnRSZWdleCwgZnJvbUpTT04sIGZyb21PYmplY3QsIGZyb21Tb3VyY2UsIGdlbmVyYXRlTWFwRmlsZUNvbW1lbnQsIG1hcEZpbGVDb21tZW50UmVnZXgsIHJlbW92ZUNvbW1lbnRzLCByZW1vdmVNYXBGaWxlQ29tbWVudHN9IGZyb20gJ2NvbnZlcnQtc291cmNlLW1hcCc7XG5pbXBvcnQgTWFnaWNTdHJpbmcgZnJvbSAnbWFnaWMtc3RyaW5nJztcbmltcG9ydCB7UmF3U291cmNlTWFwLCBTb3VyY2VNYXBDb25zdW1lciwgU291cmNlTWFwR2VuZXJhdG9yfSBmcm9tICdzb3VyY2UtbWFwJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtyZXNvbHZlLCBGaWxlU3lzdGVtLCBhYnNvbHV0ZUZyb21Tb3VyY2VGaWxlLCBkaXJuYW1lLCBiYXNlbmFtZSwgYWJzb2x1dGVGcm9tfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtMb2dnZXJ9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyJztcbmltcG9ydCB7RmlsZVRvV3JpdGV9IGZyb20gJy4vdXRpbHMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNvdXJjZU1hcEluZm8ge1xuICBzb3VyY2U6IHN0cmluZztcbiAgbWFwOiBTb3VyY2VNYXBDb252ZXJ0ZXJ8bnVsbDtcbiAgaXNJbmxpbmU6IGJvb2xlYW47XG59XG5cbi8qKlxuICogR2V0IHRoZSBtYXAgZnJvbSB0aGUgc291cmNlIChub3RlIHdoZXRoZXIgaXQgaXMgaW5saW5lIG9yIGV4dGVybmFsKVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdFNvdXJjZU1hcChcbiAgICBmczogRmlsZVN5c3RlbSwgbG9nZ2VyOiBMb2dnZXIsIGZpbGU6IHRzLlNvdXJjZUZpbGUpOiBTb3VyY2VNYXBJbmZvIHtcbiAgY29uc3QgaW5saW5lID0gY29tbWVudFJlZ2V4LnRlc3QoZmlsZS50ZXh0KTtcbiAgY29uc3QgZXh0ZXJuYWwgPSBtYXBGaWxlQ29tbWVudFJlZ2V4LmV4ZWMoZmlsZS50ZXh0KTtcblxuICBpZiAoaW5saW5lKSB7XG4gICAgY29uc3QgaW5saW5lU291cmNlTWFwID0gZnJvbVNvdXJjZShmaWxlLnRleHQpO1xuICAgIHJldHVybiB7XG4gICAgICBzb3VyY2U6IHJlbW92ZUNvbW1lbnRzKGZpbGUudGV4dCkucmVwbGFjZSgvXFxuXFxuJC8sICdcXG4nKSxcbiAgICAgIG1hcDogaW5saW5lU291cmNlTWFwLFxuICAgICAgaXNJbmxpbmU6IHRydWUsXG4gICAgfTtcbiAgfSBlbHNlIGlmIChleHRlcm5hbCkge1xuICAgIGxldCBleHRlcm5hbFNvdXJjZU1hcDogU291cmNlTWFwQ29udmVydGVyfG51bGwgPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBmaWxlTmFtZSA9IGV4dGVybmFsWzFdIHx8IGV4dGVybmFsWzJdO1xuICAgICAgY29uc3QgZmlsZVBhdGggPSByZXNvbHZlKGRpcm5hbWUoYWJzb2x1dGVGcm9tU291cmNlRmlsZShmaWxlKSksIGZpbGVOYW1lKTtcbiAgICAgIGNvbnN0IG1hcHBpbmdGaWxlID0gZnMucmVhZEZpbGUoZmlsZVBhdGgpO1xuICAgICAgZXh0ZXJuYWxTb3VyY2VNYXAgPSBmcm9tSlNPTihtYXBwaW5nRmlsZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUuY29kZSA9PT0gJ0VOT0VOVCcpIHtcbiAgICAgICAgbG9nZ2VyLndhcm4oXG4gICAgICAgICAgICBgVGhlIGV4dGVybmFsIG1hcCBmaWxlIHNwZWNpZmllZCBpbiB0aGUgc291cmNlIGNvZGUgY29tbWVudCBcIiR7ZS5wYXRofVwiIHdhcyBub3QgZm91bmQgb24gdGhlIGZpbGUgc3lzdGVtLmApO1xuICAgICAgICBjb25zdCBtYXBQYXRoID0gYWJzb2x1dGVGcm9tKGZpbGUuZmlsZU5hbWUgKyAnLm1hcCcpO1xuICAgICAgICBpZiAoYmFzZW5hbWUoZS5wYXRoKSAhPT0gYmFzZW5hbWUobWFwUGF0aCkgJiYgZnMuZXhpc3RzKG1hcFBhdGgpICYmXG4gICAgICAgICAgICBmcy5zdGF0KG1hcFBhdGgpLmlzRmlsZSgpKSB7XG4gICAgICAgICAgbG9nZ2VyLndhcm4oXG4gICAgICAgICAgICAgIGBHdWVzc2luZyB0aGUgbWFwIGZpbGUgbmFtZSBmcm9tIHRoZSBzb3VyY2UgZmlsZSBuYW1lOiBcIiR7YmFzZW5hbWUobWFwUGF0aCl9XCJgKTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgZXh0ZXJuYWxTb3VyY2VNYXAgPSBmcm9tT2JqZWN0KEpTT04ucGFyc2UoZnMucmVhZEZpbGUobWFwUGF0aCkpKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBzb3VyY2U6IHJlbW92ZU1hcEZpbGVDb21tZW50cyhmaWxlLnRleHQpLnJlcGxhY2UoL1xcblxcbiQvLCAnXFxuJyksXG4gICAgICBtYXA6IGV4dGVybmFsU291cmNlTWFwLFxuICAgICAgaXNJbmxpbmU6IGZhbHNlLFxuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHtzb3VyY2U6IGZpbGUudGV4dCwgbWFwOiBudWxsLCBpc0lubGluZTogZmFsc2V9O1xuICB9XG59XG5cbi8qKlxuICogTWVyZ2UgdGhlIGlucHV0IGFuZCBvdXRwdXQgc291cmNlLW1hcHMsIHJlcGxhY2luZyB0aGUgc291cmNlLW1hcCBjb21tZW50IGluIHRoZSBvdXRwdXQgZmlsZVxuICogd2l0aCBhbiBhcHByb3ByaWF0ZSBzb3VyY2UtbWFwIGNvbW1lbnQgcG9pbnRpbmcgdG8gdGhlIG1lcmdlZCBzb3VyY2UtbWFwLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyU291cmNlQW5kTWFwKFxuICAgIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIGlucHV0OiBTb3VyY2VNYXBJbmZvLCBvdXRwdXQ6IE1hZ2ljU3RyaW5nKTogRmlsZVRvV3JpdGVbXSB7XG4gIGNvbnN0IG91dHB1dFBhdGggPSBhYnNvbHV0ZUZyb21Tb3VyY2VGaWxlKHNvdXJjZUZpbGUpO1xuICBjb25zdCBvdXRwdXRNYXBQYXRoID0gYWJzb2x1dGVGcm9tKGAke291dHB1dFBhdGh9Lm1hcGApO1xuICBjb25zdCByZWxhdGl2ZVNvdXJjZVBhdGggPSBiYXNlbmFtZShvdXRwdXRQYXRoKTtcbiAgY29uc3QgcmVsYXRpdmVNYXBQYXRoID0gYCR7cmVsYXRpdmVTb3VyY2VQYXRofS5tYXBgO1xuXG4gIGNvbnN0IG91dHB1dE1hcCA9IG91dHB1dC5nZW5lcmF0ZU1hcCh7XG4gICAgc291cmNlOiBvdXRwdXRQYXRoLFxuICAgIGluY2x1ZGVDb250ZW50OiB0cnVlLFxuICAgIC8vIGhpcmVzOiB0cnVlIC8vIFRPRE86IFRoaXMgcmVzdWx0cyBpbiBhY2N1cmF0ZSBidXQgaHVnZSBzb3VyY2VtYXBzLiBJbnN0ZWFkIHdlIHNob3VsZCBmaXhcbiAgICAvLyB0aGUgbWVyZ2UgYWxnb3JpdGhtLlxuICB9KTtcblxuICAvLyB3ZSBtdXN0IHNldCB0aGlzIGFmdGVyIGdlbmVyYXRpb24gYXMgbWFnaWMgc3RyaW5nIGRvZXMgXCJtYW5pcHVsYXRpb25cIiBvbiB0aGUgcGF0aFxuICBvdXRwdXRNYXAuZmlsZSA9IHJlbGF0aXZlU291cmNlUGF0aDtcblxuICBjb25zdCBtZXJnZWRNYXAgPVxuICAgICAgbWVyZ2VTb3VyY2VNYXBzKGlucHV0Lm1hcCAmJiBpbnB1dC5tYXAudG9PYmplY3QoKSwgSlNPTi5wYXJzZShvdXRwdXRNYXAudG9TdHJpbmcoKSkpO1xuXG4gIGNvbnN0IHJlc3VsdDogRmlsZVRvV3JpdGVbXSA9IFtdO1xuICBpZiAoaW5wdXQuaXNJbmxpbmUpIHtcbiAgICByZXN1bHQucHVzaCh7cGF0aDogb3V0cHV0UGF0aCwgY29udGVudHM6IGAke291dHB1dC50b1N0cmluZygpfVxcbiR7bWVyZ2VkTWFwLnRvQ29tbWVudCgpfWB9KTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQucHVzaCh7XG4gICAgICBwYXRoOiBvdXRwdXRQYXRoLFxuICAgICAgY29udGVudHM6IGAke291dHB1dC50b1N0cmluZygpfVxcbiR7Z2VuZXJhdGVNYXBGaWxlQ29tbWVudChyZWxhdGl2ZU1hcFBhdGgpfWBcbiAgICB9KTtcbiAgICByZXN1bHQucHVzaCh7cGF0aDogb3V0cHV0TWFwUGF0aCwgY29udGVudHM6IG1lcmdlZE1hcC50b0pTT04oKX0pO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cblxuLyoqXG4gKiBNZXJnZSB0aGUgdHdvIHNwZWNpZmllZCBzb3VyY2UtbWFwcyBpbnRvIGEgc2luZ2xlIHNvdXJjZS1tYXAgdGhhdCBoaWRlcyB0aGUgaW50ZXJtZWRpYXRlXG4gKiBzb3VyY2UtbWFwLlxuICogRS5nLiBDb25zaWRlciB0aGVzZSBtYXBwaW5nczpcbiAqXG4gKiBgYGBcbiAqIE9MRF9TUkMgLT4gT0xEX01BUCAtPiBJTlRFUk1FRElBVEVfU1JDIC0+IE5FV19NQVAgLT4gTkVXX1NSQ1xuICogYGBgXG4gKlxuICogdGhpcyB3aWxsIGJlIHJlcGxhY2VkIHdpdGg6XG4gKlxuICogYGBgXG4gKiBPTERfU1JDIC0+IE1FUkdFRF9NQVAgLT4gTkVXX1NSQ1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVNvdXJjZU1hcHMoXG4gICAgb2xkTWFwOiBSYXdTb3VyY2VNYXAgfCBudWxsLCBuZXdNYXA6IFJhd1NvdXJjZU1hcCk6IFNvdXJjZU1hcENvbnZlcnRlciB7XG4gIGlmICghb2xkTWFwKSB7XG4gICAgcmV0dXJuIGZyb21PYmplY3QobmV3TWFwKTtcbiAgfVxuICBjb25zdCBvbGRNYXBDb25zdW1lciA9IG5ldyBTb3VyY2VNYXBDb25zdW1lcihvbGRNYXApO1xuICBjb25zdCBuZXdNYXBDb25zdW1lciA9IG5ldyBTb3VyY2VNYXBDb25zdW1lcihuZXdNYXApO1xuICB0cnkge1xuICAgIGNvbnN0IG1lcmdlZE1hcEdlbmVyYXRvciA9IFNvdXJjZU1hcEdlbmVyYXRvci5mcm9tU291cmNlTWFwKG5ld01hcENvbnN1bWVyKTtcbiAgICBtZXJnZWRNYXBHZW5lcmF0b3IuYXBwbHlTb3VyY2VNYXAob2xkTWFwQ29uc3VtZXIpO1xuICAgIGNvbnN0IG1lcmdlZCA9IGZyb21KU09OKG1lcmdlZE1hcEdlbmVyYXRvci50b1N0cmluZygpKTtcbiAgICByZXR1cm4gbWVyZ2VkO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZyb21PYmplY3QobmV3TWFwKTtcbiAgfVxufVxuIl19