<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  InputNumber,
  message as Message,
  Row,
  Spin,
  TabPane,
  Tabs,
} from 'ant-design-vue';

import { postSettingsAll, postSettingsUpdate } from '#/api-client';

defineOptions({
  name: 'AbpSetting',
});
const activeName = ref(0);
const allSetting = ref();
const loading = ref(false);
/**
 * 后端返回的数据格式不是boolean类型，需要转换一下
 * @param data
 */
function processData(data: any) {
  data.forEach((group: any) => {
    group.settingItemOutput.forEach((setting: any) => {
      if (setting.type === 'CheckBox') {
        switch (setting.value) {
          case 'false': {
            setting.convertvalue = false;

            break;
          }
          case 'true': {
            setting.convertvalue = true;

            break;
          }
          case 'undefined': {
            setting.convertvalue = undefined;

            break;
          }
        }
      }
    });
  });
  return data;
}
onMounted(async () => {
  try {
    loading.value = true;
    const resp = await postSettingsAll();
    if (resp.status === 200 || resp.status === 204) {
      const data = processData(resp.data);
      allSetting.value = data || [];
    }
  } finally {
    loading.value = false;
  }
});

const save = async (settingValue: Record<string, any>) => {
  const prefix = 'setting_';
  const params: Record<string, any> = {};
  settingValue.forEach((item: any) => {
    if (item.type === 'CheckBox') {
      params[prefix + item.name] = String(item.convertvalue);
    } else {
      params[prefix + item.name] = String(item.value);
    }
  });

  const resp = await postSettingsUpdate({ body: { values: params } });
  if (resp.status === 200 || resp.status === 204) {
    Message.success('保存成功');
  }
};
</script>

<template>
  <Page auto-content-height class="pb-5" title="设置管理">
    <Spin :spinning="loading" tip="加载中...">
      <div class="bg-card px-8">
        <Tabs v-model:active-key="activeName" tab-position="left">
          <TabPane
            v-for="(paneItem, index) in allSetting"
            :key="index"
            :tab="paneItem.groupDisplayName"
          >
            <Form
              :label-col="{ span: 6 }"
              :model="paneItem.settingItemOutput"
              style="max-width: 600px"
            >
              <Row>
                <Col :span="24">
                  <Form.Item
                    v-for="formItem in paneItem.settingItemOutput"
                    :key="formItem.name"
                    :label="formItem.displayName"
                    class="mb-3"
                  >
                    <Input
                      v-if="formItem.type === 'Text'"
                      v-model:value="formItem.value"
                    />
                    <InputNumber
                      v-else-if="formItem.type === 'Number'"
                      v-model:value="formItem.value"
                      :max="999999999"
                      :min="1"
                    />
                    <Checkbox
                      v-else-if="formItem.type === 'CheckBox'"
                      v-model:checked="formItem.convertvalue"
                    >
                      {{ formItem.description }}
                    </Checkbox>
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col :offset="6">
                  <Button
                    type="primary"
                    @click="save(paneItem.settingItemOutput)"
                  >
                    保存
                  </Button>
                </Col>
              </Row>
            </Form>
          </TabPane>
        </Tabs>
      </div>
    </Spin>
  </Page>
</template>
