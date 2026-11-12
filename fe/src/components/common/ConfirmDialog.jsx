import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

// Dialog xác nhận thao tác dùng chung: icon cảnh báo, nút Hủy / Xác nhận,
// hỗ trợ loading chống bấm trùng, variant danger cho thao tác nguy hiểm.
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Xác nhận thao tác',
  message = 'Bạn có chắc chắn muốn thực hiện thao tác này?',
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  danger = false,
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onConfirm?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={loading ? undefined : onClose} title={null} maxWidth="max-w-sm">
      <div className="flex flex-col items-center pt-2 text-center">
        <span
          className={`grid h-14 w-14 place-items-center rounded-full ${
            danger ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'
          }`}
        >
          <AlertTriangle size={26} />
        </span>
        <h3 className="mt-4 font-display text-xl font-bold text-ink">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{message}</p>
        <div className="mt-6 flex w-full gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={danger ? 'danger' : 'primary'}
            className="flex-1"
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
