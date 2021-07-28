// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode"
import { DEFAULT_TYPES, DEFAULT_MESSAGES } from "./constant"
const execa = require("execa")
let channel: vscode.OutputChannel
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "git-commit" is now active!')

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "git-commit.commit",
    async () => {
      // 第一步 选择要操作的文件夹
      // 第二步 弹窗出现提交表单，正确填写
      // 第三步 执行git命令
      channel = vscode.window.createOutputChannel("commit")
      try {
        const folderPath = await selectFolderPath()
        if (folderPath) {
          // 当前编辑区有文件夹
          const cm = new NormCommitMessage()
          await cm.getType()
          await cm.getScope()
          await cm.getSubject()
          await cm.getBody()
          await cm.getFooter()

          const gitMessage = await cm.message()
          cm.commit(folderPath, gitMessage)
        } else {
          vscode.window.showErrorMessage("当前窗口暂无文件")
        }
      } catch (e) {
        vscode.window.showErrorMessage(e.message, {
          modal: true,
        })
      }
    }
  )

  // 工作区中会有多个文件夹项目
  async function selectFolderPath() {
    let currentFolder = ""
    if (!vscode.workspace.workspaceFolders) {
      return undefined
    } else if (vscode.workspace.workspaceFolders.length > 1) {
      // 用户手动选择操作的文件夹
      let repositories: any = {}
      vscode.workspace.workspaceFolders.forEach(
        (folder: vscode.WorkspaceFolder) => {
          repositories[folder.name] = {
            label: folder.name,
            description: folder.uri.fsPath,
          }
        }
      )

      const pickOptions: vscode.QuickPickOptions = {
        placeHolder: "请选择一个文件夹",
        ignoreFocusOut: true,
        matchOnDescription: true,
        matchOnDetail: true,
      }
      const pick = await vscode.window.showQuickPick<vscode.QuickPickItem>(
        Object.values(repositories),
        pickOptions
      )

      if (pick) {
        currentFolder = repositories[pick.label].description
      }
    } else {
      currentFolder = vscode.workspace.workspaceFolders[0].uri.fsPath
    }
    return currentFolder
  }
  // 规范提交信息
  class NormCommitMessage {
    private type?: string
    private scope: string | undefined
    private subject?: string
    private body: string | undefined
    private footer: string | undefined

    public async getType(): Promise<void> {
      const typePicks = DEFAULT_TYPES.map((type) => ({
        label: type.value,
        description: type.name,
      }))
      const res = await vscode.window.showQuickPick(typePicks, {
        placeHolder: DEFAULT_MESSAGES["type"].placeHolder,
      })
      if (res) {
        this.type = res.label
      }
    }

    public async getScope(): Promise<void> {
      const { placeHolder, prompt } = DEFAULT_MESSAGES["scope"]
      const save = (input: string) => (this.scope = input)
      const validateFun = (input: string) => {
        if (!input) {
          return "请输入内容"
        } else if (input.length > 10) {
          return "输入字符数应小于等于10"
        } else {
          return ""
        }
      }
      await this.askInput(placeHolder, prompt, save, validateFun)
    }

    public async getSubject(): Promise<void> {
      const { placeHolder, prompt } = DEFAULT_MESSAGES["subject"]
      const save = (input: string) => (this.subject = input)
      const validateFun = (input: string) => {
        if (!input) {
          return "请输入内容"
        } else if (input.length > 50) {
          return "输入字符数应小于等于50"
        } else {
          return ""
        }
      }
      await this.askInput(placeHolder, prompt, save, validateFun)
    }

    public async getBody(): Promise<void> {
      const { placeHolder, prompt } = DEFAULT_MESSAGES["body"]
      const save = (input: string) =>
        (this.body = input
          .split("|")
          .map((val) => val.trim())
          .join("\n"))
      await this.askInput(placeHolder, prompt, save)
    }
    public async getFooter(): Promise<void> {
      const { placeHolder, prompt } = DEFAULT_MESSAGES["footer"]
      const save = (input: string) => (this.footer = input)
      const validateFun = (input: string) => {
        if (input && input.length > 70) {
          return "输入字符数应小于等于70"
        } else {
          return ""
        }
      }
      await this.askInput(placeHolder, prompt, save, validateFun)
    }

    public message(): Promise<string> {
      return new Promise((resolve, reject) => {
        if (this.type && this.scope && this.subject) {
          resolve(
            this.type +
              (this.scope ? `(${this.scope})` : "") +
              `: ${this.subject}` +
              (this.body ? `\n\n${this.body}` : "") +
              (this.footer ? `\n\n${this.footer}` : "")
          )
        } else {
          reject(new TypeError("请正确填写信息"))
        }
      })
    }

    public async commit(path: string, message: string): Promise<void> {
      try {
        await execa("git", ["commit", "-m", `"${message}"`], {
          cwd: path,
          preferLocal: false,
          shell: true,
        })
      } catch (e) {
        vscode.window.showErrorMessage(e.message)
        channel.appendLine(e.message)
        channel.appendLine(e.stack)
      }
    }

    private async askInput(
      placeHolder: string,
      prompt: string,
      saveFun: (val: string) => void,
      validateFun?: (input: string) => string
    ) {
      const inputOptions: vscode.InputBoxOptions = {
        placeHolder,
        prompt,
      }
      if (validateFun) {
        inputOptions.validateInput = validateFun
      }
      const res = await vscode.window.showInputBox(inputOptions)
      if (res) {
        saveFun(res)
      }
    }
  }

  context.subscriptions.push(disposable)
}

// this method is called when your extension is deactivated
export function deactivate() {}
