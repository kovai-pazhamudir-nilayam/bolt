import { UploadOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Upload } from "antd";

const TEMPLATES = [
  {
    label: "Simple Page",
    value: "SimpleTemplate",
  },
  {
    label: "Task Manager Upload Page",
    value: "TaskManagerUploadTemplate",
  },
  {
    label: "Task Manager Upload with Bulk and Manual Page",
    value: "TaskManagerUploadBulkAndManualTemplate",
  },
];

const PageManagerModal = ({
  form,
  isParentCreation,
  selectedParentPath,
  handleCancel,
  loading,
  onFinish,
}) => {
  return (
    <Modal
      title={
        isParentCreation
          ? "Create New Parent Page"
          : `Create Child Page under "${selectedParentPath}"`
      }
      open={true}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          Create Page
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="pageName"
          label="Page Name"
          rules={[{ required: true, message: "Please enter a page name" }]}
        >
          <Input placeholder="e.g., User Management" />
        </Form.Item>
        {!isParentCreation && (
          <Form.Item name="parentPath" label="Parent Page">
            <Input disabled />
          </Form.Item>
        )}
        <Form.Item
          name="template"
          label="Page Template"
          rules={[{ required: true, message: "Please select a template" }]}
        >
          <Select placeholder="Select a template" options={TEMPLATES} />
        </Form.Item>

        {[
          "TaskManagerUploadTemplate",
          "TaskManagerUploadBulkAndManualTemplate",
        ].includes(Form.useWatch("template", form)) && (
          <>
            <Form.Item
              name="task_config_id"
              label="Task Config id"
              rules={[{ required: true, message: "Please enter task field" }]}
            >
              <Input placeholder="Enter upload field" />
            </Form.Item>
            <Form.Item
              name="task_type"
              label="Task Type"
              rules={[
                { required: true, message: "Please enter task  type field" },
              ]}
            >
              <Input placeholder="Enter upload field" />
            </Form.Item>
            <Form.Item
              name="csvFile"
              label="CSV File"
              valuePropName="fileList"
              getValueFromEvent={(e) =>
                Array.isArray(e) ? e : e && e.fileList
              }
              rules={[{ required: true, message: "Please upload a CSV file" }]}
            >
              <Upload
                beforeUpload={() => false} // prevent automatic upload
                accept=".csv"
                multiple={false}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Click to Upload CSV</Button>
              </Upload>
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default PageManagerModal;
