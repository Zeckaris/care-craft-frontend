import { useState } from "react";
import {
  Drawer,
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Alert,
  Modal,
  Form,
  Select,
  Popconfirm,
  Tooltip,
  Spin,
  message,
  Empty,
} from "antd";
import {
  CloseOutlined,
  UserAddOutlined,
  PlusOutlined,
  SwapOutlined,
  DeleteOutlined,
  UserOutlined,
  BookOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import type { ISection, ITeachingAssignment } from "@carecraft/types";
import { useTeachingAssignments } from "@/hooks/useTeachingAssignments";
import { useTeacherPicker } from "@/hooks/useTeacherPicker";
import { useGradeSubjects } from "@/hooks/useGradeSubjects";

const { Title, Text } = Typography;

interface SectionAssignmentsDrawerProps {
  open: boolean;
  onClose: () => void;
  section: ISection | null;
}

export function SectionAssignmentsDrawer({
  open,
  onClose,
  section,
}: SectionAssignmentsDrawerProps) {
  if (!section) return null;

  return (
    <SectionAssignmentsDrawerContent
      open={open}
      onClose={onClose}
      section={section}
    />
  );
}

function SectionAssignmentsDrawerContent({
  open,
  onClose,
  section,
}: {
  open: boolean;
  onClose: () => void;
  section: ISection;
}) {
  const {
    assignments,
    isLoading,
    isCreating,
    isReassigning,
    isDeleting,
    create,
    reassign,
    remove,
  } = useTeachingAssignments({ sectionId: section._id });

  const { teachers, isLoading: teachersLoading } = useTeacherPicker();
  const {
    gsas,
    isLoading: subjectsLoading,
    isError: subjectsError,
  } = useGradeSubjects(section.gradeId?.level);

  // Modal states
  const [modalMode, setModalMode] = useState<
    "homeroom" | "subject" | "reassign" | null
  >(null);
  const [targetAssignment, setTargetAssignment] =
    useState<ITeachingAssignment | null>(null);

  const [form] = Form.useForm();

  const homeroom = assignments.find((a) => a.role === "homeroom");
  const subjectAssignments = assignments.filter((a) => a.role === "subject");

  // Open modals
  const handleOpenHomeroomModal = () => {
    form.resetFields();
    setTargetAssignment(null);
    setModalMode("homeroom");
  };

  const handleOpenSubjectModal = () => {
    form.resetFields();
    setTargetAssignment(null);
    setModalMode("subject");
  };

  const handleOpenReassignModal = (assignment: ITeachingAssignment) => {
    form.resetFields();
    setTargetAssignment(assignment);
    form.setFieldValue("teacherId", assignment.teacherId._id);
    setModalMode("reassign");
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setTargetAssignment(null);
    form.resetFields();
  };

  // Submit modal
  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (modalMode === "homeroom") {
        await create({
          sectionId: section._id,
          teacherId: values.teacherId,
          role: "homeroom",
        });
        message.success("Homeroom teacher assigned successfully");
      } else if (modalMode === "subject") {
        await create({
          sectionId: section._id,
          teacherId: values.teacherId,
          role: "subject",
          subjectId: values.subjectId,
        });
        message.success("Subject teacher assigned successfully");
      } else if (modalMode === "reassign" && targetAssignment) {
        await reassign(targetAssignment._id, values.teacherId);
        message.success("Teacher reassigned successfully");
      }

      handleCloseModal();
    } catch (err: any) {
      if (err?.errorFields) return; // Antd validation error
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save assignment";
      message.error(msg);
    }
  };

  // Delete assignment
  const handleRemove = async (assignmentId: string, roleDescription: string) => {
    try {
      await remove(assignmentId);
      message.success(`${roleDescription} removed successfully`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to remove assignment";
      message.error(msg);
    }
  };

  const noSubjects = !subjectsLoading && gsas.length === 0;

  return (
    <>
      <Drawer
        title={
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Title level={4} style={{ margin: 0 }}>
                Teacher Assignments
              </Title>
              <CloseOutlined
                onClick={onClose}
                style={{ cursor: "pointer", fontSize: 16 }}
              />
            </div>
            <div style={{ marginTop: 4 }}>
              <Space size="small">
                <Text strong>{section.name}</Text>
                <span>•</span>
                <Text type="secondary">{section.gradeId?.level ?? "Grade"}</Text>
                <span>•</span>
                <Text type="secondary">{section.schoolYear}</Text>
                <Tag color={section.isActive ? "green" : "red"}>
                  {section.isActive ? "Active" : "Inactive"}
                </Tag>
              </Space>
            </div>
          </div>
        }
        placement="right"
        width={560}
        open={open}
        onClose={onClose}
        closeIcon={null}
        footer={
          <div style={{ textAlign: "right" }}>
            <Button onClick={onClose}>Close</Button>
          </div>
        }
      >
        {!section.isActive && (
          <Alert
            type="warning"
            showIcon
            message="Section is Inactive"
            description="You cannot create or modify teacher assignments while this section is inactive. Activate the section to make changes."
            style={{ marginBottom: 16 }}
          />
        )}

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin tip="Loading assignments..." />
          </div>
        ) : (
          <div>
            {/* ── 1. Homeroom Teacher Section ── */}
            <Card
              size="small"
              title={
                <Space>
                  <UserOutlined style={{ color: "#1677ff" }} />
                  <span>Homeroom Teacher</span>
                </Space>
              }
              extra={
                !homeroom && (
                  <Button
                    type="primary"
                    size="small"
                    icon={<UserAddOutlined />}
                    disabled={!section.isActive}
                    onClick={handleOpenHomeroomModal}
                  >
                    Assign Homeroom
                  </Button>
                )
              }
              style={{ marginBottom: 20 }}
            >
              {homeroom ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "4px 0",
                  }}
                >
                  <div>
                    <Text strong style={{ fontSize: 15 }}>
                      {homeroom.teacherId.firstName}{" "}
                      {homeroom.teacherId.lastName}
                    </Text>
                    <br />
                    <Text type="secondary">{homeroom.teacherId.email}</Text>
                  </div>
                  <Space>
                    <Tooltip title="Change teacher">
                      <Button
                        size="small"
                        icon={<SwapOutlined />}
                        disabled={!section.isActive}
                        onClick={() => handleOpenReassignModal(homeroom)}
                      >
                        Change
                      </Button>
                    </Tooltip>
                    <Popconfirm
                      title="Remove Homeroom Teacher"
                      description="Are you sure you want to remove the homeroom teacher assignment?"
                      onConfirm={() =>
                        handleRemove(homeroom._id, "Homeroom teacher assignment")
                      }
                      okText="Remove"
                      okButtonProps={{ danger: true, loading: isDeleting }}
                      disabled={!section.isActive}
                    >
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        disabled={!section.isActive}
                        loading={isDeleting}
                      />
                    </Popconfirm>
                  </Space>
                </div>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <Text type="secondary">
                      No homeroom teacher assigned yet
                    </Text>
                  }
                  style={{ margin: "12px 0" }}
                />
              )}
            </Card>

            {/* ── 2. Subject Teachers Section ── */}
            <Card
              size="small"
              title={
                <Space>
                  <BookOutlined style={{ color: "#52c41a" }} />
                  <span>Subject Teachers</span>
                </Space>
              }
              extra={
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  disabled={!section.isActive}
                  onClick={handleOpenSubjectModal}
                >
                  Assign Subject Teacher
                </Button>
              }
            >
              {subjectAssignments.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <Text type="secondary">
                      No subject teachers assigned yet
                    </Text>
                  }
                  style={{ margin: "16px 0" }}
                />
              ) : (
                <Table
                  size="small"
                  rowKey="_id"
                  pagination={false}
                  dataSource={subjectAssignments}
                  columns={[
                    {
                      title: "Subject",
                      key: "subject",
                      render: (_, record: ITeachingAssignment) => (
                        <Text strong>
                          {record.subjectId?.name ?? "—"}
                        </Text>
                      ),
                    },
                    {
                      title: "Teacher",
                      key: "teacher",
                      render: (_, record: ITeachingAssignment) => (
                        <div>
                          <Text>
                            {record.teacherId.firstName}{" "}
                            {record.teacherId.lastName}
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.teacherId.email}
                          </Text>
                        </div>
                      ),
                    },
                    {
                      title: "Actions",
                      key: "actions",
                      width: 100,
                      align: "right",
                      render: (_, record: ITeachingAssignment) => (
                        <Space size="small">
                          <Tooltip title="Change teacher">
                            <Button
                              size="small"
                              icon={<SwapOutlined />}
                              disabled={!section.isActive}
                              onClick={() => handleOpenReassignModal(record)}
                            />
                          </Tooltip>
                          <Popconfirm
                            title="Remove Subject Teacher"
                            description={`Remove ${
                              record.teacherId.firstName
                            } from ${record.subjectId?.name ?? "this subject"}?`}
                            onConfirm={() =>
                              handleRemove(
                                record._id,
                                `Assignment for ${
                                  record.subjectId?.name ?? "subject"
                                }`
                              )
                            }
                            okText="Remove"
                            okButtonProps={{ danger: true, loading: isDeleting }}
                            disabled={!section.isActive}
                          >
                            <Button
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              disabled={!section.isActive}
                              loading={isDeleting}
                            />
                          </Popconfirm>
                        </Space>
                      ),
                    },
                  ]}
                />
              )}
            </Card>
          </div>
        )}
      </Drawer>

      {/* ── Sub-modal: Assign Homeroom, Assign Subject, or Reassign ── */}
      <Modal
        title={
          modalMode === "homeroom"
            ? "Assign Homeroom Teacher"
            : modalMode === "subject"
            ? "Assign Subject Teacher"
            : `Change Teacher — ${
                targetAssignment?.role === "homeroom"
                  ? "Homeroom"
                  : targetAssignment?.subjectId?.name ?? "Subject"
              }`
        }
        open={modalMode !== null}
        onCancel={handleCloseModal}
        onOk={handleModalSubmit}
        okText={modalMode === "reassign" ? "Save Changes" : "Assign"}
        confirmLoading={isCreating || isReassigning}
        okButtonProps={{
          disabled: modalMode === "subject" && noSubjects,
        }}
      >
        <div style={{ marginTop: 12 }}>
          {/* If reassigning, display current teacher information */}
          {modalMode === "reassign" && targetAssignment && (
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">Current Assigned Teacher: </Text>
              <Text strong>
                {targetAssignment.teacherId.firstName}{" "}
                {targetAssignment.teacherId.lastName} ({targetAssignment.teacherId.email})
              </Text>
            </div>
          )}

          {/* If assigning subject and grade has no linked subjects */}
          {modalMode === "subject" && subjectsLoading && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <Spin tip="Checking subjects for this grade..." />
            </div>
          )}

          {modalMode === "subject" && subjectsError && (
            <Alert
              type="error"
              message="Failed to load subjects for this grade."
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {modalMode === "subject" && noSubjects && (
            <Alert
              type="warning"
              showIcon
              message="No subjects linked to this grade"
              description={
                <span>
                  Before assigning a subject teacher, at least one subject must
                  be linked to this grade via the{" "}
                  <Link to="/app/gsa" onClick={onClose}>
                    <LinkOutlined /> Grade–Subject–Assessment Setup
                  </Link>{" "}
                  page.
                </span>
              }
              style={{ marginBottom: 16 }}
            />
          )}

          <Form form={form} layout="vertical">
            {/* Subject picker — only when creating subject assignment */}
            {modalMode === "subject" && !subjectsLoading && gsas.length > 0 && (
              <Form.Item
                name="subjectId"
                label="Subject"
                rules={[{ required: true, message: "Please select a subject" }]}
              >
                <Select
                  placeholder="Select subject"
                  showSearch
                  optionFilterProp="children"
                >
                  {gsas.map((gsa) => (
                    <Select.Option
                      key={gsa.subjectId._id}
                      value={gsa.subjectId._id}
                    >
                      {gsa.subjectId.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {/* Teacher picker */}
            {!(modalMode === "subject" && noSubjects) && (
              <Form.Item
                name="teacherId"
                label={
                  modalMode === "reassign" ? "Select New Teacher" : "Teacher"
                }
                rules={[{ required: true, message: "Please select a teacher" }]}
              >
                <Select
                  placeholder="Select teacher"
                  loading={teachersLoading}
                  showSearch
                  optionFilterProp="children"
                >
                  {teachers.map((t) => (
                    <Select.Option key={t._id} value={t._id}>
                      {t.firstName} {t.lastName}{" "}
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        ({t.email})
                      </Text>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          </Form>
        </div>
      </Modal>
    </>
  );
}
