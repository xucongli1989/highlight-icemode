import * as vscode from "vscode"

interface ConfigType {
    borderWidth: string
    borderRadius: string
    borderColor: string
    backgroundColor: string
    highlightAllEditors: boolean
    ignoreCase: boolean
    ignoreSelection: boolean
}

const activate = (context) => {
    let timeout = null
    let activeEditor = vscode.window.activeTextEditor
    const decorationTypes = {}

    const updateDecorations = () => {
        const config: ConfigType = vscode.workspace.getConfiguration("highlight-icemode") as any
        let word = ""
        if (activeEditor && activeEditor.document) {
            word = (activeEditor.document.getText(activeEditor.selection) || "").trim().replace(/[\W_]/g, "\\$&")
        }
        const update = (editor: vscode.TextEditor) => {
            if (!editor || !editor.document) {
                return
            }
            try {
                const mathes = {}
                let match
                const opts = config.ignoreCase ? "gi" : "g"
                if (word && /^\w+$/.test(word)) {
                    word = `\\b${word}\\b`
                }
                const pattern = new RegExp(word, opts)
                if (word) {
                    const borderWidth = config.borderWidth
                    const borderRadius = config.borderRadius
                    const borderColor = config.borderColor
                    const backgroundColor = config.backgroundColor
                    const text = editor.document.getText()
                    // eslint-disable-next-line no-cond-assign
                    while ((match = pattern.exec(text))) {
                        const startPos = editor.document.positionAt(match.index)
                        const endPos = editor.document.positionAt(match.index + match[0].length)
                        const range = {
                            range: new vscode.Range(startPos, endPos)
                        }
                        const matchedValue = match[0]
                        if (mathes[matchedValue]) {
                            mathes[matchedValue].push(range)
                        } else {
                            mathes[matchedValue] = [range]
                        }
                        if (!decorationTypes[matchedValue]) {
                            decorationTypes[matchedValue] = vscode.window.createTextEditorDecorationType({
                                borderStyle: "solid",
                                borderWidth,
                                borderRadius,
                                borderColor,
                                backgroundColor
                            })
                        }
                    }
                }
                Object.keys(decorationTypes).forEach((v) => {
                    let range = mathes[v] ? mathes[v] : []
                    if (config.ignoreSelection) {
                        range = range.filter((o) => {
                            return !(
                                o.range.start.line === activeEditor.selection.start.line &&
                                o.range.end.line === activeEditor.selection.end.line &&
                                o.range.start.character === activeEditor.selection.start.character &&
                                o.range.end.character === activeEditor.selection.end.character
                            )
                        })
                    }
                    const decorationType = decorationTypes[v]
                    editor.setDecorations(decorationType, range)
                })
            } catch (err) {
                vscode.window.setStatusBarMessage("highlight-icemode got some error. but it's ok! dont' be afraid !", 3000)
                console.log(err.message)
            }
        }
        //开始高亮
        if (config.highlightAllEditors) {
            vscode.window.visibleTextEditors.forEach((editor) => {
                update(editor)
            })
        } else {
            update(activeEditor)
        }
    }

    const triggerUpdateDecorations = () => {
        if (timeout) {
            clearTimeout(timeout)
        }
        timeout = setTimeout(updateDecorations, 50)
    }

    vscode.window.onDidChangeTextEditorSelection(
        () => {
            triggerUpdateDecorations()
        },
        null,
        context.subscriptions
    )

    vscode.window.onDidChangeActiveTextEditor(
        (editor) => {
            activeEditor = editor
            if (editor) {
                triggerUpdateDecorations()
            }
        },
        null,
        context.subscriptions
    )

    vscode.workspace.onDidChangeTextDocument(
        (event) => {
            if (activeEditor && event.document === activeEditor.document) {
                triggerUpdateDecorations()
            }
        },
        null,
        context.subscriptions
    )
}

const deactivate = () => {}

export { activate, deactivate }
