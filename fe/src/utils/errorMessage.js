export function getErrorMessage(error, fallback = 'Có lỗi xảy ra, vui lòng thử lại.') {
  return error?.response?.data?.message || error?.message || fallback;
}
