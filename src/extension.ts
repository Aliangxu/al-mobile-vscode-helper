'use strict';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { App, AlmobileDocsContentProvider, AlmobileCompletionItemProvider } from './app';

import { CommandManager } from "./command_manager";
import { CommandRunner } from "./command_runner";
import { VariableManager } from "./variable_manager";
import * as os from "os";

import COMPONENTS from './config/components.js';

let statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
);

const components = [];
// Object.keys(COMPONENTS).forEach(item => {
// 	components.push({
// 		...COMPONENTS[item],
// 		path: item,
// 	});
// });
COMPONENTS.forEach(comm => {
    comm.list.forEach((item) => {
        components.push({
            ...item,
            category: comm.category,
            type: comm.category,
        });
    });
});
console.log("%c components", "color:blue", components);

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "al-mobile-vscode-helper" is now active!');

    //run cmd
    const outputChannel: vscode.OutputChannel = vscode.window.createOutputChannel(
        "Mobile Runner"
    );
    const variableManager = new VariableManager();
    const commandRunner = new CommandRunner(variableManager);
    const commandManager = new CommandManager(commandRunner);

    // Initial command registration
    commandManager.registerCustomCommands();

    const onDidChangeConfiguration = vscode.workspace.onDidChangeConfiguration(
        () => {
            outputChannel.appendLine("Configuration changed... Refreshing...");
            commandManager.registerCustomCommands();
            outputChannel.appendLine("Refresh done!");
            updateStatusBarItem(context);
        }
    );

    let terminalPath = new TerminalPath();

    const runCommand = vscode.commands.registerCommand("al-mobile-helper.run",(fileUri) => {
        commandRunner.runCommand(terminalPath.getFilePath(fileUri), fileUri?true:false);
    });

    setupStatusBar();
    updateStatusBarItem(context);


    let app = new App();
    app.setConfig();
    let docs = new AlmobileDocsContentProvider();
    let completionItemProvider = new AlmobileCompletionItemProvider();
    let registration = vscode.workspace.registerTextDocumentContentProvider('al-mobile-helper', docs);

    let completion = vscode.languages.registerCompletionItemProvider([{
        language: 'vue', scheme: 'file'
    }, {
        language: 'html', scheme: 'file'
    }], completionItemProvider, '', ' ', ':', '<', '"', "'", '/', '@', '(');
    let vueLanguageConfig = vscode.languages.setLanguageConfiguration('vue', { wordPattern: app.WORD_REG });

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('al-mobile-helper.search', () => {
        // if (context.workspaceState.get('al-mobile-helper.loading', false)) {
        //     vscode.window.showInformationMessage('Document is initializing, please wait a minute depend on your network.');
        //     return;
        // }
        switch (vscode.window.activeTextEditor.document.languageId) {
            case 'vue':
            case 'html':
                break;
            default:
                return;
        }

        const selection = app.getSeletedText();
        let items = components.map(item => {
            return {
                label: item.tag || `n22-${item.icon}`,
                detail: item.name.toLocaleLowerCase() + " " + item.text,
                path: item.path,
                category: item.category,
                description: item.type,
            };
        });

        if (items.length < 1) {
            vscode.window.showInformationMessage('Initializing。。。, please try again.');
            return;
        }

        let find = items.filter(item => item.label === selection);

        if (find.length) {
            app.openDocs(find[0], find[0].label);
            return;
        }

        // cant set default value for this method? angry.
        vscode.window.showQuickPick(items).then(selected => {
            selected && app.openDocs(selected, selected.label);
        });
    });

    context.subscriptions.push(
        app,
        disposable,
        registration,
        completion,
        vueLanguageConfig,
        onDidChangeConfiguration,
        runCommand,
        statusBarItem
    );

}

/**
 * 处理底部运行菜单
 */
export function setupStatusBar() {
    statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );
    statusBarItem.command = "al-mobile-helper.run";
    statusBarItem.text = " $(terminal)运行";
    statusBarItem.tooltip = "点击运行mobile程序";
}
export function updateStatusBarItem(context: vscode.ExtensionContext): void {
    const statusBar = vscode.workspace
        .getConfiguration()
        .get<Boolean>("al-mobile-helper.statusBar");

    if (statusBar) {
        statusBarItem.show();
    } else {
        statusBarItem.hide();
    }
}

/**
 * TerminalPath
 */
class TerminalPath {
    public getFilePath(fileUri?: vscode.Uri): string {
        let filePath: string = "";
        if (!fileUri || typeof fileUri.fsPath !== "string") {
            let activeEditor = vscode.window.activeTextEditor;
            if (activeEditor && !activeEditor.document.isUntitled) {
                filePath = activeEditor.document.fileName;
            }
        } else {
            filePath = fileUri.fsPath;
        }

        filePath = this.getFilePathForBashOnWindows(filePath);
        // console.log("%c path","color:#00CD00", path)
        return filePath;
    }

    private getFilePathForBashOnWindows(filePath: string): string {
        if (os.platform() === "win32") {
            let windowsShell = vscode.workspace
                .getConfiguration("terminal")
                .get<string>("integrated.shell.windows");
            if (
                windowsShell &&
                windowsShell.toLowerCase().indexOf("bash") > -1 &&
                windowsShell.toLowerCase().indexOf("windows") > -1
            ) {
                filePath = filePath
                    .replace(/([A-Za-z]):\\/, this.replacer)
                    .replace(/\\/g, "/");
            }
        }
        return filePath;
    }

    private replacer(match: string, p1: string): string {
        return `/mnt/${p1.toLowerCase()}/`;
    }
}

// this method is called when your extension is deactivated
export function deactivate() { }
