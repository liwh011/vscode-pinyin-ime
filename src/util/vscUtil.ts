import * as vscode from "vscode";
import * as R from "ramda";

export const 获得当前输入词 = function () {
  // 我们需要的是文本被编辑后的情况 而不是编辑前的情况
  // 在某些地方调用 会意外的 获得文本被编辑前的情况
  // 所以加个定时器 确保函数在文本修改后执行
  // 这样函数就变成了异步的 于是加了Promise
  return new Promise((res, rej) => {
    setTimeout(() => {
      var editor = vscode.window.activeTextEditor;
      if (!editor) {
        return res(null);
      }

      var position = editor.selections[0].anchor;
      var document = editor.document;
      var range = document.getWordRangeAtPosition(position);

      if (range === null) {
        return res(null);
      }

      var 当前输入词 = document.getText(range);
      return res(当前输入词);
    }, 0);
  });
};

export const 获得当前文件后缀名 = function ({ document }: any) {
  return R.last(document.fileName.split("."));
};

export const 获得文档内容 = function (
  document: vscode.TextDocument,
  position: vscode.Position
) {
  var 总行数 = document.lineCount;
  var 当前行 = position.line;
  var 文档内容 = "";
  for (var i = 0; i < 总行数; i++) {
    if (i !== 当前行) {
      文档内容 += document.lineAt(i).text + "\n";
    }
  }
  return 文档内容;
};

export const 获得当前输入字段 = function (): Promise<string | null> {
  // 我们需要的是文本被编辑后而非编辑前的情况。
  // 为避免意外获得文本被编辑前的情况，加个定时器，确保函数在文本修改后执行。
  // 这样函数就变成了异步的，于是加了Promise。
  return new Promise((res, rej) => {
    setTimeout(() => {
      var 编辑器 = vscode.window.activeTextEditor;
      if (!编辑器) {
        return res(null);
      }
      var 光标位置 = 编辑器.selections[0].anchor;
      var 文件 = 编辑器.document;
      var 范围 = 文件.getWordRangeAtPosition(光标位置);

      if (范围 === null) {
        return res(null);
      }

      var 当前输入字段 = 文件.getText(范围);
      return res(当前输入字段);
    }, 0);
  });
};
