import { App, Button, Form, Input } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import styles from './rest-antd-form-item.module.less';

const GRID_CLASS =
  'grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5';

export default function FormLayout() {
  const { message } = App.useApp();
  return (
    <div>
      <Form
        onFinish={() => {
          message.success('提交成功');
        }}
      >
        <div className={`${GRID_CLASS} ${styles['form-grid-layout']}`}>
          <Form.Item name="name" label="Name">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Password">
            <Input.Password />
          </Form.Item>
          <Form.Item name="confirmPassword" label="Confirm Password">
            <Input.Password />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input />
          </Form.Item>
          <Form.Item name="city" label="City">
            <Input />
          </Form.Item>
          <Form.Item name="state" label="State">
            <Input />
          </Form.Item>
          <Form.Item name="zip" label="Zip">
            <Input />
          </Form.Item>
          {/* col-start-[-2] col-end-[-1] */}
          <Form.Item className={`-col-start-2 -col-end-1 flex justify-end`}>
            <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
              Submit
            </Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
}
