const productos = [
    {
        id: 1,
        name: "Yerba Mate Playadito 1kg",
        precio: 15,
        category: "yerba",
        cardImg: "./img-productos/playadito-1kg.webp",
    },
    {
        id: 2,
        name: "Yerba Mate Playadito 500g",
        precio: 8.50,
        category: "yerba",
        cardImg: "./img-productos/playadito-500.webp",
    },
    {
        id: 3,
        name: "Yerba Mate Nobleza Gaucha 500g",
        precio: 9.25,
        category: "yerba",
        cardImg: "./img-productos/nobleza-gaucha.webp",
    },
    {
        id: 4,
        name: "Alfajores Havanna (12 unidades)",
        precio: 30,
        category: "alfajores",
        cardImg: "./img-productos/havanna-12u.webp",
    },
    {
        id: 5,
        name: "Alfajores Havanna (6 unidades)",
        precio: 18,
        category: "alfajores",
        cardImg: "./img-productos/havanna-6u.webp",
    },
    {
        id: 6,
        name: "Alfajores Cachafaz (12 unidades)",
        precio: 19.5,
        category: "alfajores",
        cardImg: "./img-productos/cachafaz12u.webp",
    },
    {
        id: 7,
        name: "Fernet Branca (1L)",
        precio: 35,
        category: "bebidas",
        cardImg: "./img-productos/fernet-1l.jpeg",
    },
    {
        id: 8,
        name: "Fernet Branca (750ml)",
        precio: 30,
        category: "bebidas",
        cardImg: "./img-productos/branca-750.png",
    },
    {
        id: 9,
        name: "Galletitas Chocolinas",
        precio: 6,
        category: "galletas",
        cardImg: "./img-productos/chocolinas.jpg",
    },
    {
        id: 10,
        name: "Bizcochos salados Don Satur",
        precio: 5,
        category: "galletas",
        cardImg: "./img-productos/donsator.jpg",
    },
    {
        id: 11,
        name: "Mantecol clásico (3 unidades)",
        precio: 10,
        category: "candy",
        cardImg: "./img-productos/mantecol-3U.jpg",
    },
    {
        id: 12,
        name: "Caramelos Palitos de la Selva (330gr)",
        precio: 12,
        category: "candy",
        cardImg: "./img-productos/palitos-de-la-selva.webp",
    },
    {
        id: 13,
        name: "Caramelos Masticables Sugus Surtido (700gr)",
        precio: 16.25,
        category: "candy",
        cardImg: "./img-productos/sugus.jpg",
    },
    {
        id: 14,
        name: "Caramelos Flynn Paff (caja 500gr)",
        precio: 14,
        category: "candy",
        cardImg: "./img-productos/flynn-paff.jpg",
    },
    {
        id: 15,
        name: "Amargo Obrero (950ml)",
        precio: 17,
        category: "bebidas",
        cardImg: "./img-productos/amargo-obrero.jpg",
    },
];

const divideProductsInParts = (size) => {
    let productsList = [];
    for (let i = 0; i < productos.length; i += size) {
      productsList.push(productos.slice(i, i + size));
    }

    return productsList
}

// explicacion: size es igual a 6. en el bucle comienza desde seguro, luego, continua siempre que i sea menor a la cantidad de productos.lenght, y despues a la i se le suma el valor de size, es decir, 6
//esto tiene como resultado que a la lista se productos se le push (empujen) productos en forma de slices

const appState = {
    products: divideProductsInParts(6),
    productsLimit: divideProductsInParts(6).length,
    currentProductsIndex: 0,
    activeFilter: null
}


