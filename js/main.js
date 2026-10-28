(() => {
  const STORAGE_ERROR_MESSAGE = 'Không thể lưu đăng ký. Vui lòng kiểm tra dung lượng trình duyệt và thử lại.';

  let pendingDeleteEmail = '';

  function getElement(id) {
    return document.getElementById(id);
  }

  /**
   * Định dạng thời điểm đăng ký theo kiểu Việt Nam.
   * @param {string} isoString
   * @returns {string}
   */
  function formatRegisteredAt(isoString) {
    if (!isoString) return '';

    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(date);
  }

  /**
   * Tạo một ô bảng chứa văn bản thuần.
   * @param {string} value
   * @returns {HTMLTableCellElement}
   */
  function createCell(value) {
    const cell = document.createElement('td');
    cell.textContent = value || '';
    return cell;
  }

  /**
   * Tạo nhãn hiển thị hình thức tham dự.
   * @param {string} mode
   * @returns {HTMLSpanElement}
   */
  function createModeBadge(mode) {
    const isOffline = mode === 'Trực tiếp';
    const badge = document.createElement('span');
    badge.className = `mode-badge ${isOffline ? 'mode-offline' : 'mode-online'}`;

    const icon = document.createElement('i');
    icon.className = isOffline ? 'bi bi-building' : 'bi bi-camera-video';

    badge.append(icon, document.createTextNode(` ${mode || 'Chưa xác định'}`));
    return badge;
  }

  /**
   * Tạo nút xóa cho một bản ghi đăng ký.
   * @param {Object} registration
   * @returns {HTMLButtonElement}
   */
  function createDeleteButton(registration) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-sm btn-outline-danger';
    button.dataset.email = registration.email || '';
    button.setAttribute('aria-label', `Xóa đăng ký của ${registration.fullname || 'đại biểu'}`);

    const icon = document.createElement('i');
    icon.className = 'bi bi-trash3';
    button.append(icon);

    return button;
  }

  /**
   * Cập nhật số liệu thống kê và số lượng đăng ký.
   * @param {Array<Object>} registrations
   */
  function updateStats(registrations) {
    const total = registrations.length;
    const offline = registrations.filter((item) => item.attendanceMode === 'Trực tiếp').length;
    const online = registrations.filter((item) => item.attendanceMode === 'Trực tuyến').length;

    const statTotal = getElement('stat-total');
    const statOffline = getElement('stat-offline');
    const statOnline = getElement('stat-online');
    const countBadge = getElement('registration-count');

    if (statTotal) statTotal.textContent = String(total);
    if (statOffline) statOffline.textContent = String(offline);
    if (statOnline) statOnline.textContent = String(online);
    if (countBadge) countBadge.textContent = String(total);
  }

  /**
   * Hiển thị danh sách đăng ký và trạng thái rỗng.
   * @param {Array<Object>} [data] - danh sách cần hiển thị, mặc định đọc từ localStorage
   */
  function renderRegistrations(data) {
    const registrationsBody = getElement('registrations-body');
    if (!registrationsBody) return;

    const registrations = data || ConferenceStorage.getRegistrations();
    registrationsBody.replaceChildren();

    registrations.forEach((registration) => {
      const row = document.createElement('tr');

      const nameCell = document.createElement('td');
      const name = document.createElement('span');
      name.className = 'reg-name';
      name.textContent = registration.fullname || '';
      nameCell.append(name);

      const registeredAt = formatRegisteredAt(registration.registeredAt);
      if (registeredAt) {
        const time = document.createElement('span');
        time.className = 'reg-time';
        time.textContent = registeredAt;
        nameCell.append(time);
      }

      const modeCell = document.createElement('td');
      modeCell.append(createModeBadge(registration.attendanceMode));

      const actionCell = document.createElement('td');
      actionCell.className = 'text-end';
      actionCell.append(createDeleteButton(registration));

      row.append(
        nameCell,
        createCell(registration.email),
        createCell(registration.phone),
        createCell(registration.organization),
        createCell(registration.attendeeType),
        modeCell,
        actionCell
      );

      registrationsBody.append(row);
    });

    const hasData = registrations.length > 0;
    const tableWrap = getElement('registrations-table-wrap');
    const emptyState = getElement('registrations-empty');

    if (tableWrap) tableWrap.classList.toggle('d-none', !hasData);
    if (emptyState) emptyState.classList.toggle('d-none', hasData);

    updateStats(registrations);
  }

  /**
   * Hiển thị thông báo đăng ký thành công kèm thông tin vừa gửi.
   * @param {Object} registration
   */
  function showSuccessResult(registration) {
    const resultBox = getElement('result');
    if (!resultBox) return;

    resultBox.replaceChildren();

    const heading = document.createElement('h4');
    heading.className = 'alert-heading h5';

    const headingIcon = document.createElement('i');
    headingIcon.className = 'bi bi-check-circle-fill me-2';
    heading.append(headingIcon, document.createTextNode('Đăng ký thành công!'));

    const list = document.createElement('ul');
    list.className = 'mb-2';

    const rows = [
      ['Họ tên', registration.fullname],
      ['Email', registration.email],
      ['Đơn vị', registration.organization],
      ['Hình thức', registration.attendanceMode]
    ];

    rows.forEach(([label, value]) => {
      const item = document.createElement('li');
      item.textContent = `${label}: ${value}`;
      list.append(item);
    });

    const note = document.createElement('p');
    note.className = 'mb-0 small';
    note.textContent = 'Thông tin đăng ký đã được lưu trên trình duyệt của bạn.';

    resultBox.append(heading, list, note);
    resultBox.classList.remove('d-none');
  }

  function hideResult() {
    const resultBox = getElement('result');
    if (resultBox) resultBox.classList.add('d-none');
  }

  /**
   * Hiển thị toast thông báo.
   * @param {string} message
   * @param {'success'|'danger'} [variant]
   */
  function showToast(message, variant) {
    const toast = getElement('app-toast');
    const toastMessage = getElement('toast-message');
    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.classList.remove('text-bg-success', 'text-bg-danger');
    toast.classList.add(variant === 'danger' ? 'text-bg-danger' : 'text-bg-success');

    bootstrap.Toast.getOrCreateInstance(toast).show();
  }

  /**
   * Xử lý gửi form đăng ký.
   * @param {SubmitEvent} event
   */
  function handleSubmit(event) {
    event.preventDefault();
    hideResult();

    if (!FormValidation.validateForm()) return;

    const registration = {
      ...FormValidation.getFormData(),
      registeredAt: new Date().toISOString()
    };

    const registrations = ConferenceStorage.getRegistrations();

    if (ConferenceStorage.isDuplicateEmail(registration.email, registrations)) {
      FormValidation.showError('email', 'Email này đã được đăng ký. Vui lòng dùng email khác.');

      const emailInput = getElement('email');
      if (emailInput) emailInput.focus();
      return;
    }

    registrations.push(registration);

    if (!ConferenceStorage.saveRegistrations(registrations)) {
      showToast(STORAGE_ERROR_MESSAGE, 'danger');
      return;
    }

    const form = getElement('registration-form');
    if (form) form.reset();

    FormValidation.clearFormErrors();
    renderRegistrations(registrations);
    showSuccessResult(registration);
  }

  /**
   * Mở modal xác nhận xóa khi người dùng bấm nút xóa trong bảng.
   * @param {MouseEvent} event
   */
  function handleTableClick(event) {
    const button = event.target.closest('button[data-email]');
    if (!button) return;

    pendingDeleteEmail = button.dataset.email || '';

    const registration = ConferenceStorage.getRegistrations().find(
      (item) => (item.email || '').toLowerCase() === pendingDeleteEmail.toLowerCase()
    );

    const deleteName = getElement('delete-name');
    if (deleteName) deleteName.textContent = registration ? registration.fullname : pendingDeleteEmail;

    const deleteModal = getElement('delete-modal');
    if (deleteModal) bootstrap.Modal.getOrCreateInstance(deleteModal).show();
  }

  /**
   * Xác nhận xóa đăng ký đang chờ xử lý.
   */
  function handleConfirmDelete() {
    if (!pendingDeleteEmail) return;

    const remaining = ConferenceStorage.removeRegistrationByEmail(pendingDeleteEmail);
    pendingDeleteEmail = '';

    renderRegistrations(remaining);
    hideResult();

    const deleteModal = getElement('delete-modal');
    if (deleteModal) bootstrap.Modal.getOrCreateInstance(deleteModal).hide();

    showToast('Đã xóa đăng ký thành công.');
  }

  /**
   * Xóa lỗi của trường đang được nhập lại để người dùng thấy phản hồi tức thì.
   * @param {Event} event
   */
  function handleFormInput(event) {
    const target = event.target;
    if (!target) return;

    if (target.name === 'attendanceMode') {
      FormValidation.clearError('attendance-mode');
    } else if (target.id) {
      FormValidation.clearError(target.id);
    }

    hideResult();
  }

  /**
   * Hiện/ẩn nút trở về đầu trang theo vị trí cuộn.
   */
  function toggleBackToTop() {
    const backToTop = getElement('back-to-top');
    if (!backToTop) return;

    backToTop.classList.toggle('is-visible', window.scrollY > 600);
  }

  function handleBackToTop() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }

  function init() {
    const form = getElement('registration-form');
    if (form) {
      form.addEventListener('submit', handleSubmit);
      form.addEventListener('input', handleFormInput);
      form.addEventListener('change', handleFormInput);
    }

    const registrationsBody = getElement('registrations-body');
    if (registrationsBody) registrationsBody.addEventListener('click', handleTableClick);

    const confirmDelete = getElement('confirm-delete');
    if (confirmDelete) confirmDelete.addEventListener('click', handleConfirmDelete);

    const backToTop = getElement('back-to-top');
    if (backToTop) backToTop.addEventListener('click', handleBackToTop);

    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    toggleBackToTop();
    renderRegistrations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
