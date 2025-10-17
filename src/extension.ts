"use strict";
import * as vscode from "vscode";
const fs = require("fs");
import * as path from "path";
import { CodeManager } from "./codeManager";

function mkdirRecursive(dirPath: string) {
    if (fs.existsSync(dirPath)) return;
    mkdirRecursive(path.dirname(dirPath));
    fs.mkdirSync(dirPath);
}

function copyFolderSync(src: string, dest: string) {
    if (!fs.existsSync(src)) return;

    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        mkdirRecursive(dest);
        const entries = fs.readdirSync(src);
        for (const entry of entries) {
            const srcPath = path.join(src, entry);
            const destPath = path.join(dest, entry);
            copyFolderSync(srcPath, destPath);
        }
    } else if (stats.isFile()) {
        fs.copyFileSync(src, dest);
    }
}

export function activate(context: vscode.ExtensionContext) {

    const outputChannel = vscode.window.createOutputChannel("JRX");
    outputChannel.show()

    const srcDir = vscode.Uri.joinPath(context.extensionUri, "assets", "codes").fsPath;
    const destDir = path.join(context.globalStorageUri.fsPath, "codes");

    try {
         if (fs.existsSync(srcDir)) {
            copyFolderSync(srcDir, destDir);
        } else {
            mkdirRecursive(destDir);
        }
    } catch (err) {
        outputChannel.appendLine("Error closing operations for VS Code: " + (err as Error).message);
    }

    const codeManager = new CodeManager();

    vscode.window.onDidCloseTerminal(() => {
        codeManager.onDidCloseTerminal();
    });

    const run = vscode.commands.registerCommand("jrx.run", (fileUri: vscode.Uri) => {
        codeManager.run(null, fileUri);
    });

    const runCustomCommand = vscode.commands.registerCommand("jrx.runCustomCommand", () => {
        codeManager.runCustomCommand();
    });

    const runByLanguage = vscode.commands.registerCommand("jrx.runByLanguage", () => {
        codeManager.runByLanguage();
    });

    const stop = vscode.commands.registerCommand("jrx.stop", () => {
        codeManager.stop();
    });

    context.subscriptions.push(run);
    context.subscriptions.push(runCustomCommand);
    context.subscriptions.push(runByLanguage);
    context.subscriptions.push(stop);
    context.subscriptions.push(codeManager);
}

export function deactivate() {
}
