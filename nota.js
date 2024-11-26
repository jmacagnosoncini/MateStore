// RENDERIZACION CART

const productsCart = document.querySelector(".cart-container");
const totalElement = document.getElementById('total');
const cartBubble = document.querySelector(".cart-bubble");
const buyBtn = document.querySelector(".btn-buy");
const deleteBtn = document.querySelector(".btn-delete");


const createCartProductTemplate = (cartProduct) => {
    const { id, name, precio, cardImg, quantity } = cartProduct;
    return `
    <div class="cart-item">
      <img src="${cardImg}" alt="${name}" />
      <div class="item-info">
        <h3 class="item-title">${name}</h3>
        <p class="item-bid">Precio</p>
        <span class="item-price">${precio} USD</span>
      </div>
      <div class="item-handler">
        <span class="quantity-handler down" data-id=${id}>-</span>
        <span class="item-quantity">${quantity}</span>
        <span class="quantity-handler up" data-id=${id}>+</span>
      </div>
    </div>`
}


const renderCart = () =>{
    if(!cart.length){
        productsCart.innerHTML = `<p class="empty-msh">No hay productos en el carrito</p>`;
        return;
    }
    productsCart.innerHTML = cart.map(createCartProductTemplate).join("")
};

const showCartTotal = () => {
    const totalElement = document.getElementById('total'); // Busca el elemento por ID
    if (totalElement) {
        const total = cart.reduce((acc, product) => {
            const price = parseFloat(product.precio);
            return !isNaN(price) ? acc + price * product.quantity : acc;
        }, 0);
        totalElement.textContent = `USD ${total.toFixed(2)}`; // Actualiza el contenido
    } else {
        console.error('Elemento con ID "total" no encontrado');
    }
};

const getCartTotal = () =>{
    return cart.reduce((acc, cur) => acc + Number(cur.precio) * cur.quantity, 0)
}

const renderCartBubble = () =>{
    cartBubble.textContent = cart.reduce((acc, cur) => acc + cur.quantity, 0)
}

const disableBtn = (btn) =>{
    if(!cart.length){
        btn.classList.add("disabled")
    }else{
        btn.classList.remove("disabled")
    }
};

// AGREGAR PRODUCTOS AL CARRO
const successModal = document.querySelector(".add-modal")

const updateCartState = () =>{
    //agregar savecart
    renderCart();
    showCartTotal();
    disableBtn(buyBtn);
    disableBtn(deleteBtn);
    renderCartBubble();
}

const addProduct = (e) => {
    if (!e.target.classList.contains("btn-agregar-carrito")) {
        return;
    }
    console.log(e.target.dataset); 
    const product = createProductData(e.target.dataset);
    if (isExistingCartProduct(product)) {
        addUnitToProduct(product);
        showModalSuccess("Agregado al carrito con éxito ✅");
    } else {
        createCartProduct(product);
        showModalSuccess("Agregado al carrito con éxito ✅");
    }
    updateCartState();
};

const showModalSuccess = (msg) => {
    successModal.classList.add("active-modal");
    successModal.textContent = msg;
    setTimeout(()=> {
        successModal.classList.remove("active-modal")
    }, 1500)
}

const addUnitToProduct = (product) => {
    cart = cart.map((cartProduct) => {
        return cartProduct.id === product.id ? {...cartProduct, quantity: cartProduct.quantity + 1} : cartProduct;
    });
};

const createCartProduct = (product) =>{
    cart = [...cart, {...product, quantity: 1}]
}

const isExistingCartProduct = (product) => {
    return cart.find((item)=> item.id === product.id)
}

const createProductData = (product) => {
    const {id, name, precio, cardImg} = product;
    return { 
        id: parseInt(id), 
        name, 
        precio: parseFloat(precio), 
        cardImg,
    };
};
