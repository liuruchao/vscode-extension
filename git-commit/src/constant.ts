export const DEFAULT_TYPES = [
  {
    value: `✨Feat`,
    name: "添加功能",
  },
  {
    value: "🐛Fix",
    name: "修复Bug",
  },
  {
    value: "📝Docs",
    name: "填写注释或文档",
  },
  {
    value: "💄Style",
    name: "不影响代码功能",
  },
  {
    value: "🎨Refactor",
    name: "项目重构或代码修改",
  },
  {
    value: "⚡Perf",
    name: "优化相关，如提升性能、体验",
  },
  {
    value: "✅Test",
    name: "增加单元测试",
  },
  {
    value: "🔧Config",
    name: "配置文件的修改，如（webpack）",
  },
  {
    value: "✏️Merge",
    name: "合并代码",
  },
  {
    value: "⬆️Upgrade",
    name: "升级依赖包",
  },
  {
    value: "⬇️DownGrade",
    name: "降级或删除依赖包",
  },
]

export const DEFAULT_MESSAGES = {
  type: {
    placeHolder: "请选择本次改动的类型",
  },
  scope: {
    placeHolder: "请输入提交信息（必填，限字符数10）",
    prompt: "<Scope>修改范围，本次修改涉及的范围",
  },
  subject: {
    placeHolder: "请输入提交信息（必填，限字符数50）",
    prompt: "<Subject>本次改动提交的简短描述",
  },
  body: {
    placeHolder: "请输入提交信息，使用'|'符号代替换行（非必填）",
    prompt: "<Body>本次改动提交的详细描述",
  },
  footer: {
    placeHolder: "请输入提交信息（非必填）",
    prompt: "<Footer>本次改动提交的补充说明",
  },
}
