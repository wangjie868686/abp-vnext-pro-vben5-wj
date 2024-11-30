<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { ref } from 'vue';
import { ElMessage, ElTabs, ElTabPane, ElDivider, ElCheckbox, ElCol, ElForm, ElInput, ElRow } from 'element-plus';
import { postFeaturesList, postFeaturesUpdate, type FeatureGroupDto, } from '#/api-client';
import { $t } from '#/locales';
const activeKey = ref();
const data = ref();
const tabList = ref<FeatureGroupDto[]>([]);
const [Modal, modalApi] = useVbenModal({
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      try {
        modalApi.setState({loading: true});
        data.value = modalApi.getData<Record<string, any>>();
        const { data: resp } = await postFeaturesList({
          body: {
            providerName: "T",
            providerKey: data.value?.id
          }
        });
        const result = processData(resp) || [];
        tabList.value = result.groups;
        activeKey.value = tabList.value[0]?.name;
      } finally {
        modalApi.setState({loading: false});
      }
    }
  },
  onConfirm: async () => {
    // 找到当前激活的tab，然后获取features作为参数进行更新
    const tab = tabList.value.find((item) => item.name === activeKey.value);
    if (!tab) return;
    const features = tab.features!.map((e) => {
      let value = e.value;
      if (e.valueType!.name === 'ToggleStringValueType') {
        value = String(e.convertvalue);
      }
      return {
        name: e.name,
        value,
      }
    });

    await postFeaturesUpdate({
      body: {
        providerName: 'T',
        providerKey: data.value?.id,
        updateFeaturesDto: {
          features,
        },
      },
    });
    ElMessage.success({
      type:'success',
      message: $t('common.editSuccess'),
    });
  }
});

/**
 * 后端返回的数据格式不是boolean类型，需要转换一下
 * @param data
 */
 function processData(data: any) {
  data.groups.forEach((group: any) => {
    group.features.forEach((feature: any) => {
      if (feature.value === 'true') {
        feature.convertvalue = true;
      } else if (feature.value === 'false') {
        feature.convertvalue = false;
      }
    });
  });
  return data;
}
</script>
<template>
  <Modal title="功能管理" fullscreen>
    <ElTabs v-model="activeKey" tab-position="left">
      <ElTabPane v-for="tabItem in tabList" :name="tabItem.name!" :label="tabItem.displayName!">
        <div>{{tabItem.displayName}}</div>
        <ElDivider style="margin: 10px 0;"></ElDivider>
        <Form :label-col="{ span: 6 }" :model="tabItem" style="max-width: 800px">
          <ElRow>
            <ElCol :span="24">
              <ElForm.FormItem v-for="formItem in tabItem.features" :key="formItem.name!" :label="formItem.displayName"
                class="mb-4">
                <ElInput v-if="formItem.valueType!.name === 'FreeTextStringValueType'" v-model="formItem.value!" />
                <ElCheckbox v-else-if="formItem.valueType!.name === 'ToggleStringValueType'" v-model="formItem.convertvalue" />
              </ElForm.FormItem>
            </ElCol>
          </ElRow>
        </Form>
      </ElTabPane>
    </ElTabs>
  </Modal>
</template>
