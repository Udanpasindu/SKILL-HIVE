(function() {
  if (typeof window !== 'undefined' && window.window === window) {
    window.global = window;
  }
})();
