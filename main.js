'use strict';

const productsContainer = document.querySelector('.container-productos');
const paginationContainer = document.querySelector('.pagination-container');
const categoriesContainer = document.querySelector('.categories');
const productsCart = document.querySelector('.cart-container');
const cartElement = document.querySelector('.cart');
const cartLabel = document.querySelector('.cart-label');
const menuButton = document.querySelector('.menu-burger');
const navbarList = document.querySelector('.navbar-list');
const backdrop = document.querySelector('.cart-backdrop');
const buyBtn = document.querySelector('.btn-buy');
const deleteBtn = document.querySelector('.btn-delete');
const statusElement = document.querySelector('.add-modal');
const MAX_QUANTITY = 10;
const PAGE_SIZE = 6;
const money = (value) => `USD ${value.toFixed(2)}`;
let cart = [];
let activeFilter = null;
let page = 0;
let statusTimer;
let previousFocus;

function announce(message) {
  clearTimeout(statusTimer);
  statusElement.textContent = message;
  statusElement.classList.add('active-modal');
  statusTimer = setTimeout(() => statusElement.classList.remove('active-modal'), 3500);
}

// Only catalog IDs and bounded quantities are restored, never stored prices or HTML.
function normalizeCart(value) {
  if (!Array.isArray(value)) return [];
  const items = new Map();
  for (const entry of value) {
    const product = productos.find((item) => String(item.id) === String(entry?.id));
    const quantity = Number(entry?.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1) continue;
    const current = items.get(product.id)?.quantity || 0;
    items.set(product.id, { ...product, quantity: Math.min(MAX_QUANTITY, current + quantity) });
  }
  return [...items.values()];
}

function loadCart() {
  try { cart = normalizeCart(JSON.parse(localStorage.getItem('cart') || '[]')); }
  catch { cart = []; }
}

function quantityControl(quantity, name, cartControl = false) {
  return `<div class="${cartControl ? 'item-handler' : 'contador'}" role="group" aria-label="Cantidad de ${name}">
    <button type="button" class="${cartControl ? 'quantity-handler down' : 'btn-restar'}" aria-label="Disminuir cantidad de ${name}" ${quantity <= 1 ? 'disabled' : ''}>−</button>
    <span class="${cartControl ? 'item-quantity' : 'product-quantity'}">${quantity}</span>
    <button type="button" class="${cartControl ? 'quantity-handler up' : 'btn-sumar'}" aria-label="Aumentar cantidad de ${name}" ${quantity >= MAX_QUANTITY ? 'disabled' : ''}>+</button>
  </div>`;
}

function createProductTemplate(product) {
  return `<article class="card-product" data-id="${product.id}" data-base-price="${product.precio}">
    <div class="container-img-name"><img src="${product.cardImg}" alt="${product.name}" loading="lazy" width="240" height="180"><h3 class="product-name">${product.name}</h3></div>
    <div class="btn-agregar"><p class="price">USD <span>${product.precio.toFixed(2)}</span></p>
      ${quantityControl(1, product.name)}
      <button type="button" class="btn-agregar-carrito" aria-label="Añadir ${product.name} al carrito">Añadir al carrito 🛒</button>
    </div></article>`;
}

function renderProducts() {
  const filtered = activeFilter ? productos.filter((p) => p.category === activeFilter) : productos;
  const pages = Math.ceil(filtered.length / PAGE_SIZE);
  productsContainer.innerHTML = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map(createProductTemplate).join('');
  paginationContainer.hidden = pages <= 1;
  paginationContainer.innerHTML = `<button type="button" class="pagination-btn" data-page="${page - 1}" aria-label="Página anterior" ${page === 0 ? 'disabled' : ''}>←</button>` +
    Array.from({ length: pages }, (_, i) => `<button type="button" class="pagination-btn ${i === page ? 'active-page' : ''}" data-page="${i}" aria-label="Página ${i + 1}" ${i === page ? 'aria-current="page"' : ''}>${i + 1}</button>`).join('') +
    `<button type="button" class="pagination-btn" data-page="${page + 1}" aria-label="Página siguiente" ${page === pages - 1 ? 'disabled' : ''}>→</button>`;
}

function createCartRow(product) {
  const row = document.createElement('article');
  row.className = 'cart-item';
  row.dataset.id = product.id;
  row.innerHTML = `<img src="${product.cardImg}" alt="${product.name}" width="64" height="72">
    <div class="item-info"><h3 class="item-title">${product.name}</h3><p class="item-unit-price">${money(product.precio)} / unidad</p>
    <div class="item-controls">${quantityControl(product.quantity, product.name, true)}<button type="button" class="remove-item" aria-label="Eliminar ${product.name}">Eliminar</button></div>
    <p class="item-subtotal">Subtotal <strong class="item-price"></strong></p></div>`;
  return row;
}

// Reconcile by ID: quantity changes preserve nodes, focus, panel state and scroll.
function syncCart() {
  const scrollTop = productsCart.scrollTop;
  const focused = document.activeElement;
  const focusedRow = focused?.closest('.cart-item');
  const focusedIndex = focusedRow ? [...productsCart.querySelectorAll('.cart-item')].indexOf(focusedRow) : -1;
  productsCart.querySelector('.empty-msg')?.remove();
  for (const row of productsCart.querySelectorAll('.cart-item')) {
    if (!cart.some((p) => String(p.id) === row.dataset.id)) row.remove();
  }
  for (const product of cart) {
    let row = productsCart.querySelector(`[data-id="${product.id}"]`);
    if (!row) { row = createCartRow(product); productsCart.append(row); }
    row.querySelector('.item-quantity').textContent = product.quantity;
    row.querySelector('.item-price').textContent = money(product.precio * product.quantity);
    row.querySelector('.down').disabled = product.quantity === 1;
    row.querySelector('.up').disabled = product.quantity === MAX_QUANTITY;
  }
  if (!cart.length) productsCart.innerHTML = '<p class="empty-msg"><span aria-hidden="true">🧉</span>No hay productos en el carrito</p>';
  productsCart.scrollTop = scrollTop;
  const count = cart.reduce((sum, p) => sum + p.quantity, 0);
  document.querySelector('.cart-bubble').textContent = count;
  cartLabel.setAttribute('aria-label', `Abrir carrito, ${count} productos`);
  document.querySelector('.total').textContent = money(cart.reduce((sum, p) => sum + p.precio * p.quantity, 0));
  buyBtn.disabled = deleteBtn.disabled = !cart.length;
  if (!cartElement.hidden && (focusedIndex >= 0 || focused === deleteBtn) && (!focused.isConnected || focused.disabled)) {
    const rows = [...productsCart.querySelectorAll('.cart-item')];
    (rows[Math.min(Math.max(0, focusedIndex), rows.length - 1)]?.querySelector('.up:not(:disabled), .down:not(:disabled), .remove-item') || document.querySelector('.cart-close')).focus();
  }
}

function commitCart() {
  syncCart();
  try { localStorage.setItem('cart', JSON.stringify(cart)); }
  catch { announce('No pudimos guardar el carrito en este navegador. Podés seguir comprando en esta sesión.'); }
}

function setMenu(open, restoreFocus = false) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  navbarList.classList.toggle('menu-open', open);
  if (open) { if (!cartElement.hidden) setCart(false, false); navbarList.querySelector('a').focus(); }
  else if (restoreFocus) menuButton.focus();
}

function setCart(open, restoreFocus = true) {
  if (open === !cartElement.hidden) return;
  if (open) {
    previousFocus = document.activeElement;
    setMenu(false);
  }
  cartElement.hidden = backdrop.hidden = !open;
  cartLabel.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('cart-is-open', open);
  document.querySelector('main').inert = open;
  document.querySelector('footer').inert = open;
  document.querySelector('.header').inert = open;
  if (open) document.querySelector('.cart-close').focus();
  else if (restoreFocus) (previousFocus?.isConnected ? previousFocus : cartLabel).focus();
}

productsContainer.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  const card = button?.closest('.card-product');
  if (!card) return;
  const product = productos.find((p) => String(p.id) === card.dataset.id);
  const quantityElement = card.querySelector('.product-quantity');
  let quantity = Number(quantityElement.textContent);
  if (button.matches('.btn-sumar, .btn-restar')) {
    quantity = Math.min(MAX_QUANTITY, Math.max(1, quantity + (button.matches('.btn-sumar') ? 1 : -1)));
    quantityElement.textContent = quantity;
    card.querySelector('.price span').textContent = (product.precio * quantity).toFixed(2);
    card.querySelector('.btn-restar').disabled = quantity === 1;
    card.querySelector('.btn-sumar').disabled = quantity === MAX_QUANTITY;
  } else if (button.matches('.btn-agregar-carrito')) {
    const existing = cart.find((p) => p.id === product.id);
    if ((existing?.quantity || 0) + quantity > MAX_QUANTITY) { announce('Sólo podés comprar hasta 10 productos iguales.'); return; }
    if (existing) existing.quantity += quantity;
    else cart.push({ ...product, quantity });
    commitCart();
    announce('¡Producto agregado al carrito exitosamente!');
  }
});

productsCart.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  const row = button?.closest('.cart-item');
  if (!row) return;
  const product = cart.find((p) => String(p.id) === row.dataset.id);
  if (button.matches('.remove-item')) cart = cart.filter((p) => p.id !== product.id);
  else product.quantity = Math.min(MAX_QUANTITY, Math.max(1, product.quantity + (button.matches('.up') ? 1 : -1)));
  commitCart();
});

deleteBtn.addEventListener('click', () => { cart = []; commitCart(); announce('Carrito vacío.'); });
// The original project has no checkout or payment integration.
buyBtn.addEventListener('click', () => announce('Esta tienda es una demo de portfolio. El pago todavía no está disponible.'));
cartLabel.addEventListener('click', () => setCart(true));
document.querySelector('.cart-close').addEventListener('click', () => setCart(false));
backdrop.addEventListener('click', () => setCart(false));
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
navbarList.addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('click', (event) => {
  if (!event.target.closest('.navbar')) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (!cartElement.hidden) setCart(false);
    else if (menuButton.getAttribute('aria-expanded') === 'true') setMenu(false, true);
  }
  if (event.key !== 'Tab' || cartElement.hidden) return;
  const controls = [...cartElement.querySelectorAll('button:not(:disabled), a[href]')];
  const first = controls[0]; const last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
categoriesContainer.addEventListener('click', (event) => {
  const button = event.target.closest('.category');
  if (!button) return;
  activeFilter = button.dataset.category || null;
  page = 0;
  for (const category of categoriesContainer.querySelectorAll('button')) {
    category.classList.toggle('active', category === button);
    category.setAttribute('aria-pressed', String(category === button));
  }
  renderProducts();
});
paginationContainer.addEventListener('click', (event) => {
  const button = event.target.closest('[data-page]');
  if (!button) return;
  page = Number(button.dataset.page);
  renderProducts();
  paginationContainer.querySelector('[aria-current]')?.focus({ preventScroll: true });
});
window.matchMedia('(min-width: 769px)').addEventListener('change', () => setMenu(false));
window.addEventListener('storage', (event) => { if (event.key === 'cart' || event.key === null) { loadCart(); syncCart(); } });
loadCart();
syncCart();
renderProducts();
for (const button of categoriesContainer.querySelectorAll('button')) button.setAttribute('aria-pressed', String(button.classList.contains('active')));
