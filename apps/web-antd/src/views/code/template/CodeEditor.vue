<!-- <script>
import { onMounted, ref, watch } from 'vue';

import CodeMirror from 'codemirror';

import 'codemirror/mode/javascript/javascript';

// 引入必要的样式和语言包
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material-darker.css';

export default {
  name: 'CodeEditor',
  props: {
    value: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit }) {
    const editor = ref(null);
    let cmInstance = null;
    debugger;
    onMounted(() => {
      cmInstance = CodeMirror(editor.value, {
        value: props.value,
        mode: 'javascript', // 设置语言模式
        theme: 'material-darker', // 设置主题
        lineNumbers: true, // 显示行号
        // 其他配置项...
      });

      // 监听编辑器的变化并更新父组件的值
      cmInstance.on('change', () => {
        const newValue = cmInstance.getValue();
        emit('input', newValue); // 使用 input 事件更新 v-model
      });
    });

    // 当 props.value 改变时同步到 CodeMirror 实例
    watch(
      () => props.value,
      (newValue) => {
        if (cmInstance && newValue !== cmInstance.getValue()) {
          cmInstance.setValue(newValue);
        }
      },
    );

    return {
      editor,
    };
  },
};
</script>

<template>
  <div ref="editor" class="code-editor"></div>
</template>

<style scoped>
/* 添加一些样式以确保编辑器正确显示 */
.code-editor {
  height: 300px;
}
</style> -->
