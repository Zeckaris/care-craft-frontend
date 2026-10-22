import { Button, Space, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { IAcademicTerm } from "@carecraft/types";
import { toSchoolDate } from "@/utils/schoolDate";
import { isAcademicCurrentHighlight } from "@/utils/academic";
import { AcademicStatusTag } from "@/components/calendar/AcademicStatusTag";

interface TermRowProps {
  term: IAcademicTerm;
  onEdit: (term: IAcademicTerm) => void;
  onDelete: (id: string) => void;
}

export const TermRow = ({ term, onEdit, onDelete }: TermRowProps) => {
  const formatDate = (date: string) => {
    const schoolDate = toSchoolDate(date);
    return schoolDate ? dayjs(schoolDate).format("DD MMM YYYY") : "-";
  };

  return (
    <div
      style={{
        padding: "12px 16px",
        borderBottom: "1px solid #f0f0f0",
        backgroundColor: isAcademicCurrentHighlight(term.status)
          ? "#f6fff6"
          : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Space size="middle">
        <div>
          <strong>{term.name}</strong>
        </div>
        <AcademicStatusTag
          status={term.status}
          isCurrent={term.isCurrent}
        />
        <span style={{ color: "#8c8c8c", fontSize: "13px" }}>
          {formatDate(term.startDate)} – {formatDate(term.endDate)}
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

        <Popconfirm
          title="Delete term?"
          description={`${term.name} will be permanently deleted.`}
          okText="Delete"
          okType="danger"
          onConfirm={() => onDelete(term._id)}
        >
          <Button size="small" danger icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Popconfirm>
      </Space>
    </div>
  );
};
