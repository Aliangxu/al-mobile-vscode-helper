# al-mobile-vscode-helper 插件开发说明

## Feature

* Document

* Autocomplete

	support vue, html language

* Snippets


## Document

### Usage

1 - Move cursor to al-mobile tag or select it

2 - Press default hot key `shift + cmd + a`(windows: `shift + win + a`) or 
    Press ⇧⌘p to bring up the Command Palette and then input `al-mobile-helper.search`

3 - Show document view If complete matching,
    or you should select tag you want to search

4 - Enter and trigger document browser

5 - Press default hot key `shift + cmd + k`(windows: `shift + win + k`) to run

![document](https://vue-mobile.gitee.io/static/image/al-mobile-vscode-helper.gif)

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
                        "default": ""
                }
            }
    }
},
"main": "./out/extension.js",
```

### ./src/extension.ts

这个文件是插件的入口，一般包括两个函数 `activate` 和 `deactivate`。其中 `activate` 函数是插件激活时也就是在注册的 **Activation Event** 发生的时候就会执行。deactivate` 中放的是插件关闭时执行的代码。

在 `activate()` 函数中通过 `return` 返回的数据或函数可以作为接口供其他插件使用。
