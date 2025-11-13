import {
  Button,
  Upload,
  message,
  Modal,
  Table,
  Space,
  Typography,
  Alert,
} from "antd";
import { UploadOutlined, FileExcelOutlined } from "@ant-design/icons";
import { useState } from "react";
import type { RcFile } from "antd/es/upload/interface";
import { useStudents } from "@/hooks/useStudents";
import dayjs from "dayjs";

const { Text } = Typography;

interface ImportStudentsButtonProps {
  gradeId?: string;
  onSuccess?: () => void;
}

export const ImportStudentsButton = ({
  gradeId,
  onSuccess,
}: ImportStudentsButtonProps) => {
  const { batchCreate, isBatchCreating, refetch } = useStudents({
    gradeId, // ← same as before
    pagination: undefined, // ← we don't need pagination here
    search: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");
  const [confirmModal, setConfirmModal] = useState(false);
  const [currentFile, setCurrentFile] = useState<RcFile | null>(null);

  const parseExcelPreview = async (file: RcFile): Promise<any[]> => {
    const XLSX = await import("xlsx");
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
          resolve(json);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileChange = async (file: RcFile) => {
    setLoading(true);
    try {
      const rows = await parseExcelPreview(file);
      if (rows.length === 0) {
        message.error("Empty Excel file");
        return;
      }

      setFileName(file.name);
      setPreviewData(rows as any[]);
      setCurrentFile(file);
      setConfirmModal(true);
    } catch (err) {
      message.error("Invalid Excel file. Please check format.");
    } finally {
      setLoading(false);
    }
    return false;
  };

  const confirmImport = async () => {
    if (!currentFile) return;

    try {
      await batchCreate(currentFile);

      message.success(`Successfully imported ${previewData.length} students!`);
      refetch();
      onSuccess?.();
      setConfirmModal(false);
      setPreviewData([]);
      setCurrentFile(null);
    } catch (err: any) {
      message.error(err.message || "Import failed");
    }
  };

  return (
    <>
      <Upload
        accept=".xlsx,.xls"
        beforeUpload={(file) => {
          handleFileChange(file);
          return false;
        }}
        showUploadList={false}
      >
        <Button icon={<FileExcelOutlined />} loading={loading}>
          Import Excel
        </Button>
      </Upload>

      {/* PREVIEW + CONFIRM MODAL */}
      <Modal
        title={
          <Space>
            <FileExcelOutlined style={{ color: "#52c41a" }} />
            Import Students from {fileName}
          </Space>
        }
        open={confirmModal}
        width={900}
        onCancel={() => {
          setConfirmModal(false);
          setPreviewData([]);
          setCurrentFile(null);
        }}
        okText={`Create ${previewData.length} Students`}
        cancelText="Cancel"
        okButtonProps={{ loading: isBatchCreating, type: "primary" }}
        onOk={confirmImport}
        confirmLoading={isBatchCreating}
      >
        <Alert
          style={{ marginBottom: 16 }}
          message={
            <Text strong>{previewData.length} students will be created</Text>
          }
          type="success"
          showIcon
        />

        <Table
          size="small"
          pagination={{ pageSize: 8 }}
          scroll={{ y: 300 }}
          dataSource={previewData}
          rowKey={(record, index) => index!.toString()}
          columns={[
            {
              title: "First Name",
              dataIndex: "firstName",
              render: (t) => <Text strong>{t || "-"}</Text>,
            },
            { title: "Middle", dataIndex: "middleName", width: 80 },
            { title: "Last Name", dataIndex: "lastName" },
            { title: "Gender", dataIndex: "gender", width: 80 },
            {
              title: "DOB",
              dataIndex: "dateOfBirth",
              width: 120,
              render: (d) => (d ? dayjs(d).format("MMM D, YYYY") : "-"),
            },
          ]}
        />
      </Modal>
    </>
  );
};
