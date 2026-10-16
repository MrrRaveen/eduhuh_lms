export const toast = (msg, type = 'success') => {
  const el = document.createElement('div');
  el.className = `fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-lg text-white font-medium animate-slide-in ${
    type === 'error' ? 'bg-red-500' : type === 'info' ? 'bg-blue-500' : 'bg-emerald-500'
  }`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
};