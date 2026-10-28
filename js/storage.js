(() => {
  const STORAGE_KEY = 'conference_registrations';

  /**
   * Đọc danh sách đăng ký từ localStorage.
   * Trả về mảng rỗng nếu chưa có dữ liệu hoặc dữ liệu không hợp lệ.
   * @returns {Array<Object>}
   */
  function getRegistrations() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Không thể đọc dữ liệu đăng ký từ localStorage:', error);
      return [];
    }
  }

  /**
   * Ghi danh sách đăng ký vào localStorage.
   * @param {Array<Object>} registrations
   * @returns {boolean} true nếu ghi thành công
   */
  function saveRegistrations(registrations) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
      return true;
    } catch (error) {
      console.error('Không thể lưu danh sách đăng ký:', error);
      return false;
    }
  }

  /**
   * Kiểm tra email đã tồn tại trong danh sách đăng ký chưa.
   * So sánh sau khi trim và chuyển về chữ thường.
   * @param {string} email
   * @param {Array<Object>} [registrations] - danh sách cần kiểm tra, mặc định đọc từ localStorage
   * @returns {boolean}
   */
  function isDuplicateEmail(email, registrations) {
    const normalized = email.trim().toLowerCase();
    const source = registrations || getRegistrations();

    return source.some((item) => (item.email || '').trim().toLowerCase() === normalized);
  }

  /**
   * Xóa một đăng ký theo email.
   * @param {string} email
   * @returns {Array<Object>} danh sách còn lại sau khi xóa
   */
  function removeRegistrationByEmail(email) {
    const normalized = email.trim().toLowerCase();
    const remaining = getRegistrations().filter((item) => (item.email || '').trim().toLowerCase() !== normalized);

    saveRegistrations(remaining);
    return remaining;
  }

  window.ConferenceStorage = {
    getRegistrations,
    saveRegistrations,
    isDuplicateEmail,
    removeRegistrationByEmail
  };
})();
