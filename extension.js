
var vscode = require('vscode');

function activate(context) {
    var timeout = null;
    var activeEditor = vscode.window.activeTextEditor;
    var decorationTypes = {};


    vscode.window.onDidChangeTextEditorSelection(function (event) {
        //var aaa = activeEditor.document.getText(activeEditor.selection);
        //console.log("1onDidChangeTextEditorSelection:" + aaa);
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


    //vscode.window.showInformationMessage(test);

    function triggerUpdateDecorations() {
        timeout && clearTimeout(timeout);
        timeout = setTimeout(updateDecorations, 50);
    }

    function updateDecorations() {
        if (!activeEditor || !activeEditor.document) {
            return;
        }
        try {
            var text = activeEditor.document.getText();
            var word = activeEditor.document.getText(activeEditor.selection);
            word = word.replace(/[\W_]/g, "\\$&");  //在特殊字元前面加上 “\\” thanks harlen
            //console.log("1word:"+word);
            var mathes = {}, match;
            var opts = 'gi';
            if (/^\w+$/.test(word)) {
                word = `\\b${word}\\b`;
            }
            var pattern = new RegExp(word, opts);
            if (word != "") {
                var config = vscode.workspace.getConfiguration('highlight-icemode');
                var borderWidth = config.borderWidth;
                var borderRadius = config.borderRadius;
                var borderColor = config.borderColor;
                var backgroundColor = config.backgroundColor;
                while (match = pattern.exec(text)) {
                    var startPos = activeEditor.document.positionAt(match.index);
                    var endPos = activeEditor.document.positionAt(match.index + match[0].length);
                    var range = {
                        range: new vscode.Range(startPos, endPos)
                    };
                    var matchedValue = match[0];
                    if (mathes[matchedValue]) {
                        mathes[matchedValue].push(range);
                    } else {
                        mathes[matchedValue] = [range];
                    }

                    if (!decorationTypes[matchedValue]) {

                        decorationTypes[matchedValue] = vscode.window.createTextEditorDecorationType({
                            borderStyle: 'solid',
                            borderWidth: borderWidth,
                            borderRadius: borderRadius,
                            borderColor: borderColor,
                            backgroundColor: backgroundColor
                        });
                    }
                }
            }
            Object.keys(decorationTypes).forEach((v) => {
                var range = mathes[v] ? mathes[v] : [];
                var decorationType = decorationTypes[v];
                activeEditor.setDecorations(decorationType, range);
            })
        } catch (err) {
            vscode.window.setStatusBarMessage("highlight-icemode got some error. but it's ok! dont' be afraid !", 3000);
            console.log(err.message);
        }

    }
}
exports.activate = activate;


function deactivate() {
}
exports.deactivate = deactivate;