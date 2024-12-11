import type { LoadingProps } from './typing';

import { createVNode, defineComponent, h, reactive, render } from 'vue';

import Loading from './Loading.vue';

// 创建一个加载组件的函数
export function createLoading(
  props?: Partial<LoadingProps>,
  target?: HTMLElement,
  wait = false,
) {
  let vm: any = null;
  const data = reactive({
    tip: '',
    loading: true,
    ...props,
  });

  // 定义加载组件的包装
  const LoadingWrap = defineComponent({
    render() {
      return h(Loading, { ...data });
    },
  });

  vm = createVNode(LoadingWrap);

  let container: any = null;
  // 根据wait参数决定何时渲染Loading组件
  if (wait) {
    setTimeout(() => {
      render(vm, (container = document.createElement('div')));
    }, 0);
  } else {
    render(vm, (container = document.createElement('div')));
  }

  // 关闭加载组件的函数
  function close() {
    if (vm?.el && vm.el.parentNode) {
      vm.el.remove();
    }
  }

  // 打开加载组件并将其附加到目标元素上的函数
  function open(target: HTMLElement = document.body) {
    if (!vm || !vm.el) {
      return;
    }
    target.append(vm.el as HTMLElement);
  }

  // 销毁加载组件的函数
  function destroy() {
    container && render(null, container);
    container = vm = null;
  }

  // 如果提供了目标元素，则打开加载组件
  if (target) {
    open(target);
  }
  
  // 返回加载组件的实例及控制方法
  return {
    vm,
    close,
    open,
    destroy,
    setTip: (tip: string) => {
      data.tip = tip;
    },
    setLoading: (loading: boolean) => {
      data.loading = loading;
    },
    get loading() {
      return data.loading;
    },
    get $el() {
      return vm?.el as HTMLElement;
    },
  };
}
