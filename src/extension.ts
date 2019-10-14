import * as vscode from 'vscode'

const activate = (context) => {
    let timeout = null;
    let activeEditor = vscode.window.activeTextEditor;
    let decorationTypes = {};

    vscode.window.onDidChangeTextEditorSelection(() => {
        triggerUpdateDecorations();
    }, null, context.subscriptions);

    vscode.window.onDidChangeActiveTextEditor((editor) => {
        activeEditor = editor;
        if (editor) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument((event) => {
        if (activeEditor && event.document === activeEditor.document) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);

    const triggerUpdateDecorations = () => {
        timeout && clearTimeout(timeout);
        timeout = setTimeout(updateDecorations, 50);
    }

    const updateDecorations = () => {
        let config = vscode.workspace.getConfiguration('highlight-icemode');
        let word = ""
        if (activeEditor && activeEditor.document) {
            word = (activeEditor.document.getText(activeEditor.selection) || "").trim().replace(/[\W_]/g, "\\$&");
        }
        const update = (editor) => {
            if (!editor || !editor.document) {
                return;
            }
            try {
                let mathes = {}, match;
                let opts = 'gi';
                if (word && /^\w+$/.test(word)) {
                    word = `\\b${word}\\b`;
                }
                let pattern = new RegExp(word, opts);
                if (word) {
                    let borderWidth = config.borderWidth;
                    let borderRadius = config.borderRadius;
                    let borderColor = config.borderColor;
                    let backgroundColor = config.backgroundColor;
                    let text = editor.document.getText();
                    while (match = pattern.exec(text)) {
                        let startPos = editor.document.positionAt(match.index);
                        let endPos = editor.document.positionAt(match.index + match[0].length);
                        let range = {
                            range: new vscode.Range(startPos, endPos)
                        };
                        let matchedValue = match[0];
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
                    let range = mathes[v] ? mathes[v] : [];
                    let decorationType = decorationTypes[v];
                    editor.setDecorations(decorationType, range);
                })
            } catch (err) {
                vscode.window.setStatusBarMessage("highlight-icemode got some error. but it's ok! dont' be afraid !", 3000);
                console.log(err.message);
            }
        }
        //开始高亮
        if (config.highlightAllEditors) {
            vscode.window.visibleTextEditors.forEach(editor => {
                update(editor)
            })
        } else {
            update(activeEditor)
        }
    }
}

const deactivate = () => {
}

export {
    activate,
    deactivate
}