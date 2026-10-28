(() => {
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_PATTERN = /^0\d{9}$/;
  const FIELD_IDS = ['fullname', 'email', 'phone', 'organization', 'attendee-type', 'attendance-mode'];

  /**
   * Lấy giá trị đã trim của một trường theo id.
   * @param {string} fieldId
   * @returns {string}
   */
  function getValue(fieldId) {
    const input = document.getElementById(fieldId);
    return input ? input.value.trim() : '';
  }

  /**
   * Lấy giá trị của nhóm radio đang được chọn.
   * @param {string} name - thuộc tính name của nhóm radio
   * @returns {string}
   */
  function getRadioValue(name) {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : '';
  }

  /**
   * Trả về các phần tử cần gắn trạng thái lỗi.
   * @param {string} fieldId
   * @returns {Array<HTMLElement>}
   */
  function getFieldElements(fieldId) {
    if (fieldId === 'attendance-mode') {
      return Array.from(document.querySelectorAll('input[name="attendanceMode"]'));
    }

    const input = document.getElementById(fieldId);
    return input ? [input] : [];
  }

  /**
   * Hiển thị lỗi cho một trường.
   * @param {string} fieldId - id của input/select hoặc khóa của nhóm radio
   * @param {string} message - thông báo lỗi
   */
  function showError(fieldId, message) {
    getFieldElements(fieldId).forEach((input) => input.classList.add('is-invalid'));

    const errorEl = document.getElementById(`error-${fieldId}`);
    if (errorEl) errorEl.textContent = message;
  }

  /**
   * Xóa trạng thái lỗi của một trường.
   * @param {string} fieldId
   */
  function clearError(fieldId) {
    getFieldElements(fieldId).forEach((input) => input.classList.remove('is-invalid'));

    const errorEl = document.getElementById(`error-${fieldId}`);
    if (errorEl) errorEl.textContent = '';
  }

  /**
   * Xóa toàn bộ lỗi đang hiển thị trên form.
   */
  function clearFormErrors() {
    FIELD_IDS.forEach(clearError);
  }

  /**
   * Đưa con trỏ tới trường không hợp lệ đầu tiên.
   * @param {string} fieldId
   */
  function focusInvalidField(fieldId) {
    if (fieldId === 'attendance-mode') {
      const firstRadio = document.getElementById('mode-offline');
      if (firstRadio) firstRadio.focus();
      return;
    }

    const input = document.getElementById(fieldId);
    if (input) input.focus();
  }

  /**
   * Kiểm tra toàn bộ dữ liệu của form đăng ký.
   * Dữ liệu đã nhập được giữ nguyên, chỉ hiển thị lỗi tương ứng.
   * @returns {boolean}
   */
  function validateForm() {
    clearFormErrors();

    let isValid = true;
    let firstInvalidId = '';

    const fullname = getValue('fullname');
    if (fullname.length < 2) {
      showError('fullname', 'Vui lòng nhập họ tên ít nhất 2 ký tự.');
      firstInvalidId = firstInvalidId || 'fullname';
      isValid = false;
    }

    const email = getValue('email');
    if (!email) {
      showError('email', 'Vui lòng nhập email.');
      firstInvalidId = firstInvalidId || 'email';
      isValid = false;
    } else if (!EMAIL_PATTERN.test(email)) {
      showError('email', 'Email không hợp lệ (ví dụ: ten@donvi.edu.vn).');
      firstInvalidId = firstInvalidId || 'email';
      isValid = false;
    }

    const phone = getValue('phone');
    if (!phone) {
      showError('phone', 'Vui lòng nhập số điện thoại.');
      firstInvalidId = firstInvalidId || 'phone';
      isValid = false;
    } else if (!PHONE_PATTERN.test(phone)) {
      showError('phone', 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.');
      firstInvalidId = firstInvalidId || 'phone';
      isValid = false;
    }

    const organization = getValue('organization');
    if (!organization) {
      showError('organization', 'Vui lòng nhập đơn vị công tác.');
      firstInvalidId = firstInvalidId || 'organization';
      isValid = false;
    }

    const attendeeType = getValue('attendee-type');
    if (!attendeeType) {
      showError('attendee-type', 'Vui lòng chọn đối tượng tham dự.');
      firstInvalidId = firstInvalidId || 'attendee-type';
      isValid = false;
    }

    const attendanceMode = getRadioValue('attendanceMode');
    if (!attendanceMode) {
      showError('attendance-mode', 'Vui lòng chọn hình thức tham dự.');
      firstInvalidId = firstInvalidId || 'attendance-mode';
      isValid = false;
    }

    if (!isValid) focusInvalidField(firstInvalidId);

    return isValid;
  }

  /**
   * Thu thập dữ liệu đã chuẩn hóa từ form đăng ký.
   * @returns {{fullname: string, email: string, phone: string, organization: string,
   *   attendeeType: string, attendanceMode: string}}
   */
  function getFormData() {
    return {
      fullname: getValue('fullname'),
      email: getValue('email').toLowerCase(),
      phone: getValue('phone'),
      organization: getValue('organization'),
      attendeeType: getValue('attendee-type'),
      attendanceMode: getRadioValue('attendanceMode')
    };
  }

  window.FormValidation = {
    validateForm,
    getFormData,
    showError,
    clearError,
    clearFormErrors
  };
})();
