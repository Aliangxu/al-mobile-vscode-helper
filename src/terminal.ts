import * as vscode from 'vscode';

export class Terminal {
    private termName: string;
    private term?: vscode.Terminal;
    private terminalOptions: vscode.TerminalOptions = {};
    constructor(termName: string) {
        this.termName = termName;
    }

    public getTerminal(options: vscode.TerminalOptions) {
        if (!this.term || this.terminalOptions.cwd != options.cwd) {
            options.name = this.termName;
            this.terminalOptions = options;

            this.term = vscode.window.createTerminal(options);
            this.term.show(true);

            // if user closes the terminal, delete our reference:
            vscode.window.onDidCloseTerminal(event => {
                if (this.term && event.name === this.termName) {
                    this.term = undefined;
                }
            });
        }

        return this.term;
    }
}
