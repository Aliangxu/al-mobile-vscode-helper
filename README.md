# al-mobile-vscode-helper README

This is the README for your extension "al-mobile-vscode-helper". After writing up a brief description, we recommend including the following sections.

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: enable/disable this extension
* `myExtension.thing`: set to `blah` to do something

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

-----------------------------------------------------------------------------------------------------------

## Working with Markdown

**Note:** You can author your README using Visual Studio Code.  Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux)
* Toggle preview (`Shift+CMD+V` on macOS or `Shift+Ctrl+V` on Windows and Linux)
* Press `Ctrl+Space` (Windows, Linux) or `Cmd+Space` (macOS) to see a list of Markdown snippets

### For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**



# al-mobile-vscode-helper 插件开发说明
=====================================

package.json
------------

从生命周期上来看，插件编写有三大个部分：

*   **Activation Event**：设置插件激活的时机。位于 `package.json` 中。
*   **Contribution Point**：设置在 `VSCode` 中哪些地方添加新功能，也就是这个插件增强了哪些功能。位于 `package.json` 中。
*   **Register**：在 extension.ts 中给要写的功能用 `vscode.commands.register...` 给 `Activation Event` 或 `Contribution Point` 中配置的事件绑定方法或者设置监听器。位于入口文件（默认是 `extension.ts`）的 `activate()` 函数中。

### package 中和插件有关的主要内容是如下几个项目，其中 main 是插件代码的入口文件。
```
"activationEvents": [
    "onLanguage:html",
    "onLanguage:vue",
    "onCommand:al-mobile-helper.search"
],
"contributes": {
    "commands": [
            {
                    "command": "al-mobile-helper.search",
                    "title": "al-mobile-helper.search"
            }
    ],
    "keybindings": [
            {
                    "command": "al-mobile-helper.search",
                    "key": "shift+cmd+i",
                    "when": "editorTextFocus"
            }
    ],
    "snippets": [
            {
                    "language": "javascript",
                    "path": "./snippets/al-mobile.json"
            }
    ],
    "configuration": {
            "type": "object",
            "title": "Al Helper Configuration",
            "properties": {
                    "al-mobile-helper.indent-size": {
                            "type": "number",
                            "default": 2,
                            "description": "Indentation size of snippets"
                    },
                    "al-mobile-helper.quotes": {
                            "type": "string",
                            "default": "double"
                    },
                    "al-mobile-helper.link-url": {
                        "type": "string",
                        "default": "https://vue-mobile.gitee.io/al-mobile"
                }
            }
    }
},
"main": "./out/extension.js",
```

### ./src/extension.ts

这个文件是插件的入口，一般包括两个函数 `activate` 和 `deactivate`。其中 `activate` 函数是插件激活时也就是在注册的 **Activation Event** 发生的时候就会执行。deactivate` 中放的是插件关闭时执行的代码。

在 `activate()` 函数中通过 `return` 返回的数据或函数可以作为接口供其他插件使用。
