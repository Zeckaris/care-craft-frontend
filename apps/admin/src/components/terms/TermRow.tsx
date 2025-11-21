import { Button, Space, Tag, Popconfirm, message } from "antd";
import { EditOutlined, DeleteOutlined, CrownOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { IAcademicTerm } from "@/hooks/useAcademicTerms";

interface TermRowProps {
  term: IAcademicTerm;
  isCurrentTerm: boolean;
  onEdit: (term: IAcademicTerm) => void;
  onDelete: (id: string) => void;
  onSetCurrent: (id: string) => Promise<void>;
  loadingSetCurrent?: boolean;
}

export const TermRow = ({
  term,
  isCurrentTerm,
  onEdit,
  onDelete,
  onSetCurrent,
  loadingSetCurrent = false,
}: TermRowProps) => {
  return (
    <div
      style={{
        padding: "12px 16px",
        borderBottom: "1px solid #f0f0f0",
        backgroundColor: isCurrentTerm ? "#f6fff6" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Space size="middle">
        <div>
          <strong>{term.name}</strong>
          {isCurrentTerm && (
            <Tag
              icon={<CrownOutlined />}
              color="green"
              style={{ marginLeft: 8 }}
            >
              CURRENT
            </Tag>
          )}
        </div>
        <span style={{ color: "#8c8c8c", fontSize: "13px" }}>
          {dayjs(term.startDate).format("DD MMM YYYY")} –{" "}
          {dayjs(term.endDate).format("DD MMM YYYY")}
        </span>
      </Space>

      <Space>
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => onEdit(term)}
        >
          Edit
        </Button>

        {!isCurrentTerm && (
          <Button
            size="small"
            type="primary"
            loading={loadingSetCurrent}
            onClick={() => onSetCurrent(term._id)}
          >
            Set as Current
          </Button>
        )}

        <Popconfirm
          title="Delete term?"
          description={`${term.name} will be permanently deleted.`}
          okText="Delete"
          okType="danger"
          onConfirm={() => onDelete(term._id)}
          disabled={isCurrentTerm}
        >
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            disabled={isCurrentTerm}
          >
            Delete
          </Button>
        </Popconfirm>
      </Space>
    </div>
  );
};
