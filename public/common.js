const CART_KEY = 'craveCornerCart';
function readCart() { try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; } }
function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartCounts(); }
function updateCartCounts() {
  const count = readCart().reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
}
function money(value) { return '₹' + Number(value).toFixed(2); }
function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
document.addEventListener('DOMContentLoaded', updateCartCounts);
