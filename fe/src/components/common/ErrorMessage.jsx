export default function ErrorMessage({ message = 'Có lỗi xảy ra, vui lòng thử lại.' }) { return <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{message}</p>; }
