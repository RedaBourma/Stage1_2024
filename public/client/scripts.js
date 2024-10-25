let products = [];
let cart = [];

document.getElementById("categorySelect").addEventListener("change", (e) => {
  fetchProducts(e.target.value);
});

async function fetchProducts(category = "") {
  const url = category
    ? `http://localhost:5502/api/products/category/${category}`
    : "http://localhost:5502/api/products";
  const response = await fetch(url);
  products = await response.json();
  displayProducts();
}

function displayProducts() {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";
  products.forEach((product) => {
    const productCard = `
      <div class="col-md-4 col-sm-6 mb-4">
        <div class="card shadow-sm h-100">
          <img src="${
            product.image_url
          }" class="card-img-top product-image" alt="${product.nom}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${product.nom}</h5>
            <p class="card-text text-muted mb-2">${
              product.description || "Aucun description disponible"
            }</p>
            <p class="card-text font-weight-bold">Prix: ${product.prix.toFixed(
              2
            )} Dh</p>
            <p class="card-text">Référence: ${product.reference}</p>
            <p class="card-text">Quantité disponible: ${product.quantite}</p>
            ${
              product.quantite > 0
                ? `<div class="d-flex align-items-center mt-auto">
                    <label for="quantity-${product.id}" class="me-2">Quantité:</label>
                    <input type="number" id="quantity-${product.id}" min="1" max="${product.quantite}" value="1" class="form-control form-control-sm me-2" style="width: 70px;"/>
                    <button class="btn btn-primary btn-sm" onclick="addToCart(${product.id})">Ajouter au Panier</button>
                </div>`
                : `<p class="text-danger">Rupture de stock</p>`
            }
          </div>
        </div>
      </div>
    `;
    productList.innerHTML += productCard;
  });
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);

  const quantityInput = document.getElementById(`quantity-${productId}`);
  const quantity = parseInt(quantityInput.value);

  if (quantity > 0 && quantity <= product.quantite) {
    const cartItem = cart.find((item) => item.id === productId);

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        nom: product.nom,
        prix: product.prix,
        quantity: quantity,
      });
    }

    displayCart();
    alert(`${product.nom} a été ajouté au panier (${quantity} unité(s)).`);
  } else {
    alert("Quantité invalide ou insuffisante en stock.");
  }
}

// Display cart
function displayCart() {
  const cartItems = document.getElementById("cartItems");
  cartItems.innerHTML = "";
  let total = 0;
  cart.forEach((item) => {
    const itemTotal = item.prix * item.quantity;
    total += itemTotal;
    cartItems.innerHTML += `
      <div class="mb-3">
        <h6>${item.nom}</h6>
        <p>Quantité: ${item.quantity} | Prix: ${item.prix} Dh | Total: ${itemTotal} Dh</p>
        <button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.id})">Retirer</button>
      </div>
    `;
  });
  cartItems.innerHTML += `<h5>Total: $${total.toFixed(2)}</h5>`;
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  displayCart();
}

async function checkout() {
  if (cart.length === 0) {
    alert(
      "Votre panier est vide. Ajoutez des produits avant de passer à la caisse."
    );
    return;
  }

  const confirmed = confirm(
    "Êtes-vous sûr de vouloir valider votre commande ?"
  );
  if (confirmed) {
    try {
      const utilisateurId = localStorage.getItem("userId");

      console.log(utilisateurId);
      const response = await fetch("http://localhost:5502/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utilisateurId: utilisateurId,
          cart: cart,
        }),
      });

      if (response.ok) {
        alert("Commande validée avec succès !");
        cart = [];
        fetchProducts();
        displayCart();
      } else {
        const errorData = await response.json();
        alert(`Erreur: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Erreur de réseau ou serveur:", error);
      alert("Une erreur s'est produite lors de la validation de la commande.");
    }
  }
}


document.getElementById("categorySelect").addEventListener("change", (e) => {
  fetchProducts(e.target.value);
});

document.getElementById("viewCart").addEventListener("click", () => {
  displayCart();
  new bootstrap.Modal(document.getElementById("cartModal")).show();
});

document.getElementById("checkoutBtn").addEventListener("click", checkout);

fetchProducts();
