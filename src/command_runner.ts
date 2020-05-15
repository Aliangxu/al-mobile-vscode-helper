import {
	workspace,
	window,
	OutputChannel,
	TerminalOptions,
	Uri,
	WorkspaceFolder,
} from "vscode";
import {
	IConfiguration,
	ICommandConfiguration,
	IFormConfiguration,
} from "./configuration";
import { VariableManager } from "./variable_manager";
import { Terminal } from "./terminal";
import * as fs from "fs";
import * as path from "path";

//获取当前根目录path
let GPath: string = "";
console.log("%c workspace.rootPath", "color:#00CD00", workspace.rootPath);
if (workspace.rootPath) {
	let rootPathList = workspace.rootPath.split("/");
	GPath = rootPathList.reduce((retval, val, index) => {
		return val && index !== rootPathList.length - 1
			? `${retval}/${val}`
			: retval;
	});
}

export class CommandRunner {
	private outputChannel: OutputChannel;
	private variableManager: VariableManager;

	public constructor(variableManager: VariableManager) {
		this.variableManager = variableManager;

		this.outputChannel = window.createOutputChannel("Mobbile Runner");
	}

	public executeCommand(command: ICommandConfiguration, fileUri: string) {
		const executeCommandInShell = () => {
			let builtCommand = command.command;
			let currentTerminal;
			let options: TerminalOptions;

			if (!builtCommand) {
				window.showErrorMessage(
					"The executed command does not define a command to execute. Nothing will be executed."
				);
				return;
			}

			builtCommand = this.variableManager.resolveVariables(
				builtCommand,
				variables
			);

			if (!builtCommand) {
				window.showErrorMessage(
					"The executed command produced an empty command string. Nothing will be executed."
				);
				return;
			}

			const useCustomShell = workspace
				.getConfiguration()
				.get<Boolean>("al-mobile-helper.customShell.enabled");

			if (useCustomShell) {
				options = {
					cwd: command.working_directory
						? this.variableManager.resolveVariables(
							command.working_directory,
							variables
						)
						: undefined,
					shellPath: workspace
						.getConfiguration()
						.get<string>("al-mobile-helper.customShell.path"),
				};
			} else {
				const cwdPath = path.dirname(fileUri) === GPath?fileUri:path.dirname(fileUri);
				options = {
					// cwd: command.working_directory ? this.variableManager.resolveVariables(command.working_directory, variables) : undefined,
					cwd: cwdPath,
				};
			}
			//创建终端对象并运行命令
			let terminal = new Terminal(`${command.module} Runner`);
			currentTerminal = terminal.getTerminal(options);
			currentTerminal.sendText(`${builtCommand}`);
			this.outputChannel.appendLine(
				"Executing command: " +
				builtCommand +
				" with options " +
				JSON.stringify(options)
			);
		};

		const variables: {
			[id: string]: string;
		} = this.variableManager.getVariables();
		const form = command.form || [];
		if (form && form.length > 0) {
			let currentStep = 0;
			const firstStep = form[currentStep];

			const askQuestion = (step: IFormConfiguration) => {
				if (step.options) {
					return window.showQuickPick(step.options, {
						placeHolder: step.question,
						ignoreFocusOut: true,
					});
				} else {
					return window.showInputBox({
						prompt: step.question,
						value: step.default,
						password: step.password,
						ignoreFocusOut: true,
					});
				}
			};

			const instantiateQuestion = (step: IFormConfiguration): any => {
				console.log("Displaying question", step.question);
				return askQuestion(step).then((value?: string) => {
					console.log(step.question);
					console.log(value);
					if (!value) {
						return;
					}

					variables[step.variable] = value;
					++currentStep;

					if (!form[currentStep]) {
						executeCommandInShell();
						return;
					}

					return instantiateQuestion(form[currentStep]);
				});
			};

			return instantiateQuestion(firstStep);
		} else {
			executeCommandInShell();
		}
	}

	/**
	 * get folder of modules
	 */
	public getModuleList(fileUri: string) {
		const modules = fs.readdirSync(fileUri);
		console.log(modules);
		return modules;
	}

	public runCommand(fileUri: string, rightClick: boolean) {
		const configuration = workspace.getConfiguration().get<IConfiguration>("al-mobile-helper.definitions");

		if (!configuration) {
			return;
		}

		//get root folder of modules
		let workspaceFolder: WorkspaceFolder | undefined;
		workspaceFolder = workspace.getWorkspaceFolder(Uri.parse(fileUri));
		console.log(workspaceFolder);
		let gpath: string = "";
		let modules: Array<any>;
		let moduleslist: Array<any>;
		if (workspaceFolder) {
			gpath = workspaceFolder.uri.path;
		} else {
			if (fileUri.indexOf("/") > -1) {
				gpath = fileUri.split("modules")[0];
			} else {
				GPath && (gpath = GPath);
			}
		}
		console.log("%c gpath", "color:#00CD00", gpath);
		let configurationCommands: Array<ICommandConfiguration> = [];
		const commands: { [id: string]: ICommandConfiguration } = {};
		const items: Array<string> = [];
		if (fs.existsSync(`${gpath}/modules`)) {
			modules = this.getModuleList(`${gpath}/modules`);
			moduleslist = modules.reduce(
				(acc: any, val) => (
					val.indexOf(".") < 0 && val !== "common" && acc.push(val), acc
				),
				[]
			);
			console.log(moduleslist);
			moduleslist.forEach(mo => {
				let mols: ICommandConfiguration = {
					command: `npm run dev -m-${mo}`,
					description:  `运行${mo}模块`,
					module: mo,
					identifier: "runmobile",
					working_directory: "$tmp",
				};
				configurationCommands.push(mols);
			});
		} else if (!configuration.commands) {
			let mols: ICommandConfiguration = {
				identifier: "runpc",
				description: "运行pc",
				module: "oms",
				command: "npm run dev",
				working_directory: "$tmp",
			  };
			configurationCommands.push(mols);
		}else{
			console.log("没有modules模块～读取自定义配置命令设置");
			configurationCommands = configuration.commands;
		}

		for (const command of configurationCommands) {
			if (!command.description) {
				continue;
			}
			commands[command.description] = command;
			items.push(command.description);
		}

		window.showQuickPick(items, {
			placeHolder: "选择要运行的命令?",
			ignoreFocusOut: true,
		}).then((value?: string) => {
			if (!value) {
				return;
			}
			const command = commands[value];
			this.executeCommand(command, fileUri);
		});
	}
}
