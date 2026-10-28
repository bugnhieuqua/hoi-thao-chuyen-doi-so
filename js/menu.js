(() => {
  /**
   * Đóng menu mobile sau khi người dùng chọn một mục điều hướng.
   * Bootstrap chỉ xử lý việc mở/đóng bằng nút hamburger, không tự đóng khi chọn link.
   */
  function closeMenuOnNavigation() {
    const menu = document.getElementById('mainMenu');
    if (!menu) return;

    const menuLinks = menu.querySelectorAll('a');
    menuLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (menu.classList.contains('show')) {
          bootstrap.Collapse.getOrCreateInstance(menu).hide();
        }
      });
    });
  }

  /**
   * Thêm nền đậm và bóng cho navbar khi người dùng cuộn trang.
   */
  function updateNavbarOnScroll() {
    const navbar = document.querySelector('.site-header .navbar');
    if (!navbar) return;

    const toggleScrolled = () => {
      navbar.classList.toggle('navbar-scrolled', window.scrollY > 24);
    };

    toggleScrolled();
    window.addEventListener('scroll', toggleScrolled, { passive: true });
  }

  function init() {
    closeMenuOnNavigation();
    updateNavbarOnScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
