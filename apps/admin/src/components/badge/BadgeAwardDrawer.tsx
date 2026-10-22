import { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd';
import { GiftOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd';
import type { StudentBadge } from '@carecraft/types';
import {
  GIFT_CLAIM_NOTICE,
  awardHasGift,
  getGiftLabel,
  getGiftStatusLabel,
} from '@carecraft/badges';
import { ReadOnlyField } from '@/components/common/ReadOnlyField';
import { formatDate, formatDateTime } from '@/utils/dateFormat';
import { resolveGiftImage } from '@/utils/gift';
import {
  getBadgeLevelLabel,
  getStudentBadgeSourceMeta,
} from '@/utils/badges';

const { Text } = Typography;
const { TextArea } = Input;

interface BadgeAwardDrawerProps {
  open: boolean;
  onClose: () => void;
  award: StudentBadge | null;
  mode: 'view' | 'create' | 'edit';
  form: FormInstance;
  onSubmit: () => void;
  loading?: boolean;
  studentOptions: { value: string; label: string }[];
  badgeOptions: { value: string; label: string }[];
  giftActionLoading?: boolean;
  onMarkGiftGiven?: (note?: string) => Promise<void>;
  onUndoGift?: () => Promise<void>;
}

function fullName(user?: { firstName?: string; lastName?: string } | null) {
  if (!user) return '';
  return [user.firstName, user.lastName].filter(Boolean).join(' ');
}

export const BadgeAwardDrawer = ({
  open,
  onClose,
  award,
  mode,
  form,
  onSubmit,
  loading = false,
  studentOptions,
  badgeOptions,
  giftActionLoading = false,
  onMarkGiftGiven,
  onUndoGift,
}: BadgeAwardDrawerProps) => {
  const isView = mode === 'view';
  const isCreate = mode === 'create';
  const isEdit = mode === 'edit';

  const [giftNoteOpen, setGiftNoteOpen] = useState(false);
  const [giftNote, setGiftNote] = useState('');

  useEffect(() => {
    if (!open) {
      setGiftNoteOpen(false);
      setGiftNote('');
    }
  }, [open]);

  const studentName = award?.studentId
    ? `${award.studentId.firstName} ${award.studentId.lastName}`
    : '-';
  const badgeName = award?.badgeId?.name ?? '-';
  const termName =
    award?.academicTermId && typeof award.academicTermId !== 'string'
      ? award.academicTermId.name
      : '-';
  const awardedByName =
    award?.awardedBy && award.awardedBy.firstName
      ? `${award.awardedBy.firstName} ${award.awardedBy.lastName}`
      : 'System';
  const sourceMeta = getStudentBadgeSourceMeta(award?.source);

  const hasGift = awardHasGift(award);
  const giftStatus = award?.giftStatus ?? 'none';
  const giftStatusLabel = getGiftStatusLabel(giftStatus);
  const giftLiveName =
    award?.giftId && typeof award.giftId === 'object'
      ? award.giftId.name
      : undefined;
  const giftLabel = getGiftLabel(
    award?.giftName || giftLiveName,
    award?.giftQuantity ?? null,
  );
  const giftImage =
    award?.giftId && typeof award.giftId === 'object'
      ? resolveGiftImage(award.giftId.image)
      : undefined;
  const claimPassed = award?.giftClaimBy
    ? new Date(award.giftClaimBy).getTime() < Date.now()
    : false;

  const renderReadOnlyAward = () => (
    <Space direction="vertical" style={{ width: '100%' }}>
      <ReadOnlyField label="Student" value={studentName} />
      <ReadOnlyField
        label="Badge"
        value={
          award?.badgeId
            ? `${badgeName} (${getBadgeLevelLabel(award.badgeId.level)})`
            : '-'
        }
      />
      <ReadOnlyField
        label="How to Earn"
        value={award?.badgeId?.howToEarn}
      />
      <ReadOnlyField label="Term" value={termName} />
      <ReadOnlyField label="School Year" value={award?.schoolYear} />
      <ReadOnlyField label="Source" value={sourceMeta.label} />
      <ReadOnlyField label="Awarded By" value={awardedByName} />
      <ReadOnlyField label="Note" value={award?.note} />
      <ReadOnlyField
        label="Awarded On"
        value={formatDateTime(award?.createdAt)}
      />
    </Space>
  );

  const handleMarkGiven = async () => {
    if (!onMarkGiftGiven) return;
    try {
      await onMarkGiftGiven(giftNote.trim() || undefined);
      setGiftNoteOpen(false);
      setGiftNote('');
    } catch {
      return;
    }
  };

  const handleUndo = () => {
    if (!onUndoGift) return;
    Modal.confirm({
      title: 'Undo gift status?',
      content:
        'This clears the given date, who gave it and the gift note. The gift returns to Pending.',
      okText: 'Undo',
      cancelText: 'Cancel',
      onOk: async () => {
        await onUndoGift();
      },
    });
  };

  const giftSection = hasGift ? (
    <div
      style={{
        marginTop: 16,
        border: '1px solid #f0f0f0',
        borderRadius: 8,
        padding: 16,
      }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <Space align="start">
            <Avatar
              shape="square"
              size={56}
              icon={<GiftOutlined />}
              src={giftImage}
              style={{ backgroundColor: '#f56a00' }}
            />
            <Space direction="vertical" size={2}>
              <Text strong>Gift</Text>
              <Text>{giftLabel}</Text>
              {giftStatusLabel && (
                <Tag color={giftStatus === 'given' ? 'green' : 'gold'}>
                  {giftStatusLabel}
                </Tag>
              )}
            </Space>
          </Space>

          {giftStatus === 'pending' && onMarkGiftGiven && (
            <Button
              type="primary"
              onClick={() => setGiftNoteOpen(true)}
              loading={giftActionLoading}
            >
              Mark as given
            </Button>
          )}
          {giftStatus === 'given' && onUndoGift && (
            <Button
              danger
              onClick={handleUndo}
              loading={giftActionLoading}
            >
              Undo
            </Button>
          )}
        </div>

        {giftStatus === 'pending' && (
          <div>
            <Text type="secondary">
              {GIFT_CLAIM_NOTICE}
              {award?.giftClaimBy
                ? `, by ${formatDate(award.giftClaimBy)}.`
                : '.'}
            </Text>
            {claimPassed && (
              <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                The claim window has passed, but you can still mark this gift
                as given.
              </Text>
            )}
          </div>
        )}

        {giftStatus === 'given' && (
          <Space direction="vertical" size={2}>
            <Text type="secondary">
              Given by {fullName(award?.giftGivenBy) || 'Unknown user'}
              {award?.giftGivenAt
                ? ` on ${formatDateTime(award.giftGivenAt)}`
                : ''}
            </Text>
            {award?.giftNote && <Text>Note: {award.giftNote}</Text>}
          </Space>
        )}
      </Space>
    </div>
  ) : null;

  return (
    <>
      <Drawer
        title={
          isView
            ? 'Badge Award Details'
            : isCreate
              ? 'Award Badge'
              : 'Edit Badge Award'
        }
        width={640}
        onClose={onClose}
        open={open}
        destroyOnClose
        extra={
          !isView && (
            <Space>
              <Button onClick={onClose}>Cancel</Button>
              <Button type="primary" onClick={onSubmit} loading={loading}>
                {isCreate ? 'Award Badge' : 'Update Note'}
              </Button>
            </Space>
          )
        }
      >
        {isView ? (
          <>
            <Form layout="vertical" disabled>
              {renderReadOnlyAward()}
            </Form>
            {giftSection}
          </>
        ) : isEdit ? (
          <Form form={form} layout="vertical">
            <ReadOnlyField label="Student" value={studentName} />
            <ReadOnlyField
              label="Badge"
              value={
                award?.badgeId
                  ? `${badgeName} (${getBadgeLevelLabel(award.badgeId.level)})`
                  : '-'
              }
            />
            <ReadOnlyField
              label="How to Earn"
              value={award?.badgeId?.howToEarn}
            />
            <ReadOnlyField label="Term" value={termName} />
            <ReadOnlyField label="School Year" value={award?.schoolYear} />
            <Form.Item name="note" label="Note">
              <TextArea
                placeholder="Optional note about this award..."
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
            </Form.Item>
          </Form>
        ) : (
          <Form form={form} layout="vertical">
            <Form.Item
              name="studentId"
              label="Student"
              rules={[{ required: true, message: 'Select a student' }]}
            >
              <Select
                placeholder="Select a student"
                options={studentOptions}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
            <Form.Item
              name="badgeId"
              label="Badge"
              rules={[{ required: true, message: 'Select a badge' }]}
            >
              <Select
                placeholder="Select a badge"
                options={badgeOptions}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
            <Form.Item name="note" label="Note">
              <TextArea
                placeholder="Optional note about this award..."
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
            </Form.Item>
            <Text type="secondary">
              Eligibility is checked by the backend when you award the badge.
            </Text>
          </Form>
        )}
      </Drawer>

      <Modal
        title="Mark gift as given"
        open={giftNoteOpen}
        onOk={() => void handleMarkGiven()}
        onCancel={() => {
          setGiftNoteOpen(false);
          setGiftNote('');
        }}
        okText="Mark as given"
        cancelText="Cancel"
        confirmLoading={giftActionLoading}
        destroyOnClose
      >
        <p>
          Mark {giftLabel} as given
          {award?.studentId
            ? ` to ${award.studentId.firstName} ${award.studentId.lastName}`
            : ''}
          ?
        </p>
        <TextArea
          value={giftNote}
          onChange={(event) => setGiftNote(event.target.value)}
          placeholder="Optional note about this gift"
          maxLength={300}
          showCount
          autoSize={{ minRows: 3, maxRows: 6 }}
        />
      </Modal>
    </>
  );
};
