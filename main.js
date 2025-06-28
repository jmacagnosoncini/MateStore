const header = document.querySelector(".header");
const productsContainer = document.querySelector(".container-productos");
const paginationContainer = document.querySelector(".pagination-container");
const categoriesContainer = document.querySelector(".categories");
const categoryList = document.querySelectorAll(".category");

//LOCAS STORAGE

const saveCartToLocalStorage = () => {
  localStorage.setItem("cart", JSON.stringify(cart));
};

const loadCartFromLocalStorage = () => {
  const storedCart = localStorage.getItem("cart");
  if (storedCart) {
    cart = JSON.parse(storedCart);
  }
};

const updateCartAfterChange = () => {
  renderCart();
  showCartTotal();
  updateCartBubble();
  updateCartState();
  saveCartToLocalStorage();
};

// RENDERIZACION DE PRODUCTOS

const createProductTemplate = (product) => {
  const { id, name, cardImg, precio } = product;
  return `
    <div class="card-product" data-base-price="${precio}">
        <div class="container-img-name">
            <img src="${cardImg}" alt="${name}">
            <div class="product-price-name">
                <h3 class="product-name">${name}</h3>
            </div>
        </div>
        <div class="btn-agregar">
            <div class="contador">
                <button class="btn-restar"> - </button>
                <p class="product-quantity">1</p>
                <button class="btn-sumar"> + </button>
            </div>
            <p class="price">USD <span>${precio}</span></p>
            <button class="btn-agregar-carrito" data-id="${id}" data-name="${name}" data-img="${cardImg}">
                Añadir al carrito 🛒
            </button>
        </div>
    </div>`;
};

const renderProducts = (productsList) => {
  productsContainer.innerHTML = "";
  productsContainer.innerHTML += productsList
    .map(createProductTemplate)
    .join("");
};

const isLastIndexOf = () => {
  return appState.currentProductsIndex === appState.productsLimit - 1;
};

// FILTER

const applyFilter = ({ target }) => {
  if (!isInactiveFilter(target)) {
    return;
  }
  changeFilterState(target);
  productsContainer.innerHTML = "";
  if (appState.activeFilter) {
    renderFilterProducts();
  } else {
    renderProducts(appState.products[appState.currentProductsIndex]);
  }
  updatePagination();
};

const changeBtnActiveState = (selectedCategory) => {
  const categories = [...categoryList];
  categories.forEach((categoryBtn) => {
    if (categoryBtn.dataset.category !== selectedCategory) {
      categoryBtn.classList.remove("active");
      return;
    }
    categoryBtn.classList.add("active");
  });
};

const changeFilterState = (btn) => {
  appState.activeFilter = btn.dataset.category;
  changeBtnActiveState(appState.activeFilter);
  updatePaginationVisibility();
  appState.currentProductsIndex = 0;
};

const isInactiveFilter = (element) => {
  return (
    element.classList.contains("category") &&
    !element.classList.contains("active")
  );
};

const renderFilterProducts = () => {
  const filteredProducts = productos.filter((product) => {
    return product.category === appState.activeFilter;
  });
  const filteredProductsPaginated = filteredProducts.slice(
    appState.currentProductsIndex * 6,
    (appState.currentProductsIndex + 1) * 6
  );
  renderProducts(filteredProductsPaginated);
};

//PAGINATION

const updatePaginationVisibility = () => {
  if (appState.activeFilter) {
    paginationContainer.style.display = "none";
  } else {
    paginationContainer.style.display = "flex";
  }
};

const updatePaginationButtonVisibility = () => {
  const backwardBtn = document.querySelector(".backward");
  const forwardBtn = document.querySelector(".forward");

  if (appState.currentProductsIndex === 0) {
    backwardBtn.style.visibility = "hidden";
  } else {
    backwardBtn.style.visibility = "visible";
  }

  if (isLastIndexOf()) {
    forwardBtn.style.visibility = "hidden";
  } else {
    forwardBtn.style.visibility = "visible";
  }
};

const generatePagination = () => {
  const totalPages = appState.productsLimit;
  paginationContainer.innerHTML = "";
  const prevButton = document.createElement("button");
  prevButton.classList.add("pagination-btn", "backward");
  prevButton.textContent = "👈";
  prevButton.disabled = appState.currentProductsIndex === 0;
  prevButton.addEventListener("click", () => {
    if (appState.currentProductsIndex > 0) {
      appState.currentProductsIndex--;
      updatePage();
    }
  });
  paginationContainer.appendChild(prevButton);

  for (let i = 0; i < totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.classList.add("pagination-btn");
    pageButton.textContent = i + 1;
    pageButton.addEventListener("click", () => {
      appState.currentProductsIndex = i;
      updatePage();
    });
    if (i === appState.currentProductsIndex) {
      pageButton.classList.add("active-page");
    }
    paginationContainer.appendChild(pageButton);
  }

  const nextButton = document.createElement("button");
  nextButton.classList.add("pagination-btn", "forward");
  nextButton.textContent = "👉";
  nextButton.disabled = isLastIndexOf();
  nextButton.addEventListener("click", () => {
    if (!isLastIndexOf()) {
      appState.currentProductsIndex++;
      updatePage();
    }
  });
  paginationContainer.appendChild(nextButton);
};

const updatePagination = () => {
  const filteredProducts = appState.activeFilter
    ? productos.filter((product) => product.category === appState.activeFilter)
    : productos;
  appState.productsLimit = Math.ceil(filteredProducts.length / 6);
  renderProducts(
    filteredProducts.slice(
      appState.currentProductsIndex * 6,
      (appState.currentProductsIndex + 1) * 6
    )
  );
  generatePagination();
  updatePaginationButtonVisibility();
};

const updatePage = () => {
  updatePagination();
};

//COUNTER + PRICE UPDATE

productsContainer.addEventListener("click", (event) => {
  if (
    event.target.classList.contains("btn-sumar") ||
    event.target.classList.contains("btn-restar")
  ) {
    const cardProduct = event.target.closest(".card-product");
    const productQuantity = cardProduct.querySelector(".product-quantity");
    const priceElement = cardProduct.querySelector(".price span");
    const basePrice = parseFloat(cardProduct.dataset.basePrice); // Usa el precio base
    let quantity = parseInt(productQuantity.textContent);

    if (event.target.classList.contains("btn-sumar")) {
      if (quantity < 10) {
        quantity++;
      } else {
        alert("Sólo podés comprar hasta 10 productos iguales");
        return;
      }
    }

    if (event.target.classList.contains("btn-restar")) {
      if (quantity > 1) {
        quantity--;
      } else {
        return;
      }
    }

    productQuantity.textContent = quantity;
    priceElement.textContent = (basePrice * quantity).toFixed(2);
  }
});

// CART
const cartLabel = document.querySelector(".cart-label");
const cartElement = document.querySelector(".cart");
const menuToggle = document.getElementById("menu-toggle");
const navbarList = document.querySelector(".navbar-list");
let cart = [];

const toggleCart = () => {
  cartElement.classList.toggle("open-cart");

  if (cartElement.classList.contains("open-cart")) {
    menuToggle.checked = false;
  }
};

const closeOnScroll = () => {
  if (!cartElement.classList.contains("open-cart")) {
    return;
  }
  cartElement.classList.remove("open-cart");
};

menuToggle.addEventListener("change", () => {
  if (menuToggle.checked) {
    cartElement.classList.remove("open-cart");
  }
});

cartLabel.addEventListener("click", toggleCart);

document.addEventListener("click", (e) => {
  const clickedInsideCart = cartElement.contains(e.target);
  const clickedOnCartLabel = cartLabel.contains(e.target);
  const clickedInsideMenu =
    navbarList.contains(e.target) || menuToggle.contains(e.target);

  if (!clickedInsideCart && !clickedOnCartLabel) {
    cartElement.classList.remove("open-cart");
  }

  if (!clickedInsideMenu) {
    menuToggle.checked = false;
  }
});

// RENDERIZACION CART

const productsCart = document.querySelector(".cart-container");
const totalElement = document.querySelector(".total");
const cartBubble = document.querySelector(".cart-bubble");
const buyBtn = document.querySelector(".btn-buy");
const deleteBtn = document.querySelector(".btn-delete");
const successModal = document.querySelector(".add-modal");

// Función para actualizar la burbuja del carrito
const updateCartBubble = () => {
  const totalQuantity = cart.reduce(
    (acc, product) => acc + product.quantity,
    0
  );
  cartBubble.textContent = totalQuantity > 0 ? totalQuantity : "";
};

// Renderizar los productos en el carrito
const renderCart = () => {
  if (!cart.length) {
    productsCart.innerHTML = `<p class="empty-msh">No hay productos en el carrito</p>`;
    return;
  }
  productsCart.innerHTML = cart
    .map(
      (product) => `
        <div class="cart-item">
            <img src="${product.cardImg}" alt="${product.name}" />
            <div class="item-info">
                <h3 class="item-title">${product.name}</h3>
                <p class="item-bid">Precio total</p>
                <span class="item-price">${(
                  product.precio * product.quantity
                ).toFixed(2)} USD</span>
            </div>
            <div class="item-handler">
                <span class="quantity-handler down" data-id=${
                  product.id
                }>-</span>
                <span class="item-quantity">${product.quantity}</span>
                <span class="quantity-handler up" data-id=${product.id}>+</span>
            </div>
        </div>
    `
    )
    .join("");
};

const showCartTotal = () => {
  const total = cart.reduce(
    (acc, product) => acc + product.precio * product.quantity,
    0
  );
  totalElement.textContent = `USD ${total.toFixed(2)}`;
  updateCartState();
};

const addToCart = (event) => {
  if (event.target.classList.contains("btn-agregar-carrito")) {
    const button = event.target;
    const productId = button.dataset.id;
    const productName = button.dataset.name;
    const productImg = button.dataset.img;
    const cardProduct = button.closest(".card-product");
    const quantityElement = cardProduct.querySelector(".product-quantity");
    const quantity = parseInt(quantityElement.textContent);
    const basePrice = parseFloat(cardProduct.dataset.basePrice);

    const existingProduct = cart.find((product) => product.id === productId);

    if (existingProduct) {
      if (existingProduct.quantity + quantity <= 10) {
        existingProduct.quantity += quantity;
      } else {
        alert("Sólo puedes añadir hasta 10 productos iguales al carrito.");
        return;
      }
    } else {
      cart.push({
        id: productId,
        name: productName,
        cardImg: productImg,
        precio: basePrice,
        quantity: quantity,
      });
    }

    updateCartAfterChange();
    showModalSuccess("¡Producto agregado al carrito exitosamente!");
  }
};

productsCart.addEventListener("click", (event) => {
  if (event.target.classList.contains("quantity-handler")) {
    const id = event.target.dataset.id;
    const product = cart.find((item) => item.id == id);

    if (event.target.classList.contains("up")) {
      if (product.quantity < 10) {
        product.quantity++;
      } else {
        alert("Solo puedes comprar hasta 10 productos iguales");
        return;
      }
    }

    if (event.target.classList.contains("down")) {
      if (product.quantity > 1) {
        product.quantity--;
      } else {
        removeProductFromCart(product);
        return;
      }
    }

    updateCartAfterChange();
  }
});

const removeProductFromCart = (existingProduct) => {
  cart = cart.filter((product) => product.id !== existingProduct.id);
  updateCartAfterChange();
};

const disableBtn = (btn) => {
  if (!cart.length) {
    btn.classList.add("disabled");
  } else {
    btn.classList.remove("disabled");
  }
};

const scrollToLastItem = () => {
  productsCart.scrollTop = productsCart.scrollHeight;
};

const showModalSuccess = (msg) => {
  successModal.classList.add("active-modal");
  successModal.textContent = msg;
  console.log("Mostrando modal con éxito");
  setTimeout(() => {
    successModal.classList.remove("active-modal");
  }, 2000);
};

const updateCartState = () => {
  disableBtn(buyBtn);
  disableBtn(deleteBtn);
};

// INIT

const init = () => {
  loadCartFromLocalStorage();
  renderProducts(appState.products[appState.currentProductsIndex]);
  generatePagination();
  updatePaginationButtonVisibility();
  categoriesContainer.addEventListener("click", applyFilter);
  cartLabel.addEventListener("click", toggleCart);
  window.addEventListener("scroll", closeOnScroll);
  renderCart();
  document.addEventListener("DOMContentLoaded", showCartTotal);
  showCartTotal();
  productsContainer.addEventListener("click", addToCart);
  disableBtn(buyBtn);
  disableBtn(deleteBtn);

  let lastScrollTop = 0;
  if (header) {
    window.addEventListener("scroll", function () {
      let currentScroll = window.scrollY || document.documentElement.scrollTop;
      if (currentScroll > lastScrollTop && currentScroll > 70) {
        header.classList.add("navbar-hidden");
      } else {
        header.classList.remove("navbar-hidden");
      }
      lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    });
  }
};

document.addEventListener("DOMContentLoaded", init);
