<script setup lang="ts">
import { postSettingsAll, postSettingsUpdate } from '#/api-client';
import { Page } from '@vben/common-ui';
import { Tabs, TabPane, Spin, Form, Row, Col, Input, InputNumber, Checkbox, message as Message, Button} from 'ant-design-vue';
import { ref, onMounted } from 'vue';

defineOptions({
  name: 'AbpSetting',
})
const activeName = ref('Setting.Group.System')
const allSetting = ref()
const loading = ref(false);

onMounted(async () => {
  try {
    loading.value = true;
    const resp = await postSettingsAll()
    if (resp.status === 200 || resp.status === 204) {
      allSetting.value = resp.data || [];
    }
  } finally {
    loading.value = false;
  }
})


const save = async (settingValue: Record<string, any>) => {
  const prefix = 'setting_';
  const params: Record<string, any> = {};
  settingValue.forEach((item: any) => {
    if(item.type==="CheckBox"){
      params[prefix+item.name] = String(item.checkBoxValue)
    }else{
      params[prefix+item.name] = String(item.value)
    }

  })

  const resp = await postSettingsUpdate({ body: {values: params } })
  if (resp.status === 200 || resp.status === 204) {
    Message.success('保存成功')
  }
}

</script>


<template>
  <Page class="pb-5" auto-content-height title="设置管理" >
    <Spin :spinning="loading" tip="加载中...">
    <div  class="px-8 bg-card">
      <Tabs v-model:activeKey="activeName">
        <TabPane v-for="paneItem in allSetting" :key="paneItem.group" :tab="paneItem.groupDisplayName">
          <Form :model="paneItem.settingItemOutput" :labelCol="{span: 6}" style="max-width: 600px;">
            <Row>
              <Col :span="24">
                <Form.Item v-for="formItem in paneItem.settingItemOutput" :key="formItem.name" :label="formItem.displayName" class="mb-3">
                  <Input v-if="formItem.type === 'Text'" v-model:value="formItem.value" />
                  <InputNumber v-else-if="formItem.type === 'Number'" v-model:value="formItem.value" :min="1" :max="999999999" />
                  <Checkbox v-else-if="formItem.type === 'CheckBox'" v-model:checked="formItem.checkBoxValue">{{ formItem.description }}</Checkbox>
                </Form.Item>
            </Col>
            </Row>
            <Row>
              <Col :offset="6">
                <Button type="primary" @click="save(paneItem.settingItemOutput)">保存</Button>
              </Col>
            </Row>
          </Form>
        </TabPane>
      </Tabs>

    </div>
    </Spin>
  </Page>
</template>
