"use strict";
exports.__esModule = true;
exports.deactivate = exports.activate = void 0;
var vscode = require("vscode");
var activate = function (context) {
    var timeout = null;
    var activeEditor = vscode.window.activeTextEditor;
    var decorationTypes = {};
    var updateDecorations = function () {
        var config = vscode.workspace.getConfiguration("highlight-icemode");
        var word = "";
        if (activeEditor && activeEditor.document) {
            word = (activeEditor.document.getText(activeEditor.selection) || "").trim().replace(/[\W_]/g, "\\$&");
        }
        var update = function (editor) {
            if (!editor || !editor.document) {
                return;
            }
            try {
                var mathes_1 = {};
                var match = void 0;
                var opts = config.ignoreCase ? "gi" : "g";
                if (word && /^\w+$/.test(word)) {
                    word = "\\b" + word + "\\b";
                }
                var pattern = new RegExp(word, opts);
                if (word) {
                    var borderWidth = config.borderWidth;
                    var borderRadius = config.borderRadius;
                    var borderColor = config.borderColor;
                    var backgroundColor = config.backgroundColor;
                    var text = editor.document.getText();
                    // eslint-disable-next-line no-cond-assign
                    while ((match = pattern.exec(text))) {
                        var startPos = editor.document.positionAt(match.index);
                        var endPos = editor.document.positionAt(match.index + match[0].length);
                        var range = {
                            range: new vscode.Range(startPos, endPos)
                        };
                        var matchedValue = match[0];
                        if (mathes_1[matchedValue]) {
                            mathes_1[matchedValue].push(range);
                        }
                        else {
                            mathes_1[matchedValue] = [range];
                        }
                        if (!decorationTypes[matchedValue]) {
                            decorationTypes[matchedValue] = vscode.window.createTextEditorDecorationType({
                                borderStyle: "solid",
                                borderWidth: borderWidth,
                                borderRadius: borderRadius,
                                borderColor: borderColor,
                                backgroundColor: backgroundColor
                            });
                        }
                    }
                }
                Object.keys(decorationTypes).forEach(function (v) {
                    var range = mathes_1[v] ? mathes_1[v] : [];
                    if (config.ignoreSelection) {
                        range = range.filter(function (o) {
                            return !(o.range.start.line === activeEditor.selection.start.line &&
                                o.range.end.line === activeEditor.selection.end.line &&
                                o.range.start.character === activeEditor.selection.start.character &&
                                o.range.end.character === activeEditor.selection.end.character);
                        });
                    }
                    var decorationType = decorationTypes[v];
                    editor.setDecorations(decorationType, range);
                });
            }
            catch (err) {
                vscode.window.setStatusBarMessage("highlight-icemode got some error. but it's ok! dont' be afraid !", 3000);
                console.log(err.message);
            }
        };
        //开始高亮
        if (config.highlightAllEditors) {
            vscode.window.visibleTextEditors.forEach(function (editor) {
                update(editor);
            });
        }
        else {
            update(activeEditor);
        }
    };
    var triggerUpdateDecorations = function () {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(updateDecorations, 50);
    };
    vscode.window.onDidChangeTextEditorSelection(function () {
        triggerUpdateDecorations();
    }, null, context.subscriptions);
    vscode.window.onDidChangeActiveTextEditor(function (editor) {
        activeEditor = editor;
        if (editor) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);
    vscode.workspace.onDidChangeTextDocument(function (event) {
        if (activeEditor && event.document === activeEditor.document) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);
};
exports.activate = activate;
var deactivate = function () { };
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map