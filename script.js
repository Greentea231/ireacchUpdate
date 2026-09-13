// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (btn && nav) {
    const setOpen = (open, returnFocus = false) => {
      nav.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      if (returnFocus) btn.focus();
    };

    setOpen(false);

    btn.addEventListener('click', () => {
      setOpen(!nav.classList.contains('open'));
    });

    nav.addEventListener('click', event => {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('open')) {
        event.preventDefault();
        setOpen(false, true);
      }
    });
  }
});
