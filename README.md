# 中文拼音输入法插件

基于补全项提供中文拼音输入支持，无需切换到中文输入法即可输入汉字。

本插件配合[中文代码快速补全](https://marketplace.visualstudio.com/items?itemName=CodeInChinese.ChineseInputAssistant)插件食用更佳


## 特性

在英文状态下也可以正常打字
![总体演示](./images/大体演示.gif)

输入数字可以选词
![](./images/选词.gif)


## 食用说明
如果你正在使用“中文代码快速补全”插件，请在其设置中将`补全项是否包含vscode提供的补全项`关闭，以避免补全项重复出现的问题。


## 已知问题
- 词库小
- 没有自学习
- 没有输入预测
- 不支持翻页
- 目前的简单算法在句子长度大（多余10个字）的时候，效率低下，会有显著卡顿