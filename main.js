// ==================== CART FUNCTIONALITY ====================
let cart = JSON.parse(localStorage.getItem('vintagecycle-cart')) || [];

// Core cart functions
const CartManager = {
   saveCart() {
    localStorage.setItem('vintagecycle-cart', JSON.stringify(cart));
  },

  updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
    });
  },

 addToCart(product) {
    let quantity = parseInt(product.quantity);
    if (isNaN(quantity) || quantity < 1) quantity = 1;
    
    const existingItem = cart.find(item =>
        item.id === product.id &&
        item.size === product.size && 
        item.color === product.color
    );

    if (existingItem) {
        const newTotal = existingItem.quantity + quantity;
        existingItem.quantity = newTotal;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image || 'default-product.png',
            size: product.size,
            color: product.color,
            condition: product.condition,
            quantity: quantity
        });
    }

    this.saveCart();
    this.updateCartCount();
    this.showCartFeedback(`${product.name} added to cart! (${quantity})`);
},

 removeFromCart(productId, size) {
    cart = cart.filter(item => !(item.id === productId && item.size === size));
    this.saveCart();
    this.updateCartCount();
    if (document.querySelector('.cart-page')) this.renderCart();
},

 updateCartItemQuantity(productId, size, newQuantity) {
    const item = cart.find(item => item.id === productId && item.size === size);
    if (item) {
        item.quantity = newQuantity;
        if (item.quantity <= 0) {
            this.removeFromCart(productId, size);
        } else {
            this.saveCart();
            this.renderCart();
        }
    }
},

  showCartFeedback(message) {
    const existingFeedback = document.querySelector('.cart-feedback');
    if (existingFeedback) existingFeedback.remove();

    const feedback = document.createElement('div');
    feedback.className = 'cart-feedback';
    feedback.textContent = message;
    feedback.style.position = 'fixed';
    feedback.style.bottom = '20px';
    feedback.style.right = '20px';
    feedback.style.backgroundColor = 'var(--primary)';
    feedback.style.color = 'white';
    feedback.style.padding = '10px 20px';
    feedback.style.borderRadius = '4px';
    feedback.style.zIndex = '1000';
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.style.opacity = '0';
      feedback.style.transition = 'opacity 0.5s';
      setTimeout(() => feedback.remove(), 500);
    }, 2000);
  },

  renderCart() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartEmpty = document.querySelector('.cart-empty');
    const cartSubtotal = document.querySelector('.cart-subtotal');
    const cartTotal = document.querySelector('.cart-total');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
      if (cartEmpty) cartEmpty.style.display = 'block';
      if (cartItemsContainer) cartItemsContainer.innerHTML = '';
      if (cartSubtotal) cartSubtotal.textContent = '$0.00';
      if (cartTotal) cartTotal.textContent = '$0.00';
      return;
    }
    
    if (cartEmpty) cartEmpty.style.display = 'none';
    
    let subtotal = 0;
      cartItemsContainer.innerHTML = cart.map(item => {
        const price = parseFloat(item.price.replace(/[^0-9.-]+/g,""));
        const itemTotal = price * item.quantity;
        subtotal += itemTotal;
        
        return `
            <div class="cart-item">
                <img src="images/${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>${item.price}</p>
                    ${item.size ? `<p>Size: ${item.size}</p>` : ''}
                    ${item.color ? `<p>Color: ${item.color}</p>` : ''}
                    ${item.condition ? `<p>Condition: ${item.condition}</p>` : ''}
                    <div class="quantity-selector">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                    <button class="remove-item" data-id="${item.id}">Remove</button>
                </div>
            </div>
        `;
    }).join('');
    
    if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (cartTotal) cartTotal.textContent = `$${subtotal.toFixed(2)}`;
    
    // Add event listeners for cart interactions
   document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
    btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const item = cart.find(item => item.id === id);
        if (item) CartManager.updateCartItemQuantity(id, item.size, item.quantity - 1);
    });
});

document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
    btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const item = cart.find(item => item.id === id);
        if (item) CartManager.updateCartItemQuantity(id, item.size, item.quantity + 1);
    });
});
    
    document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = cart.find(item => item.id === btn.dataset.id);
        if (item) {
            CartManager.removeFromCart(btn.dataset.id, item.size);
        }
    });
});
  }
};

// ==================== PRODUCT GRID FUNCTIONALITY ====================
const ProductGrid = {
  setupAddToCartButtons() {
    document.querySelectorAll('.product-card .add-to-cart').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const productCard = button.closest('.product-card');
        
        // Get product details
        const productName = productCard.querySelector('h3').textContent;
        const priceElement = productCard.querySelector('.price');
        const price = priceElement ? priceElement.textContent : '$0.00';
        const conditionElement = productCard.querySelector('.condition');
        const condition = conditionElement ? conditionElement.textContent : '';
        
        // Get image
        const imgElement = productCard.querySelector('img');
        const image = imgElement ? imgElement.getAttribute('src').split('/').pop() : 'default-product.png';
        
        // Create product ID
        const productId = productName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        CartManager.addToCart({
          id: productId,
          name: productName,
          price: price,
          image: image,
          condition: condition,
          quantity: 1
        });
      });
    });
  }
};

// ==================== PRODUCT DETAIL PAGE ====================
const ProductDetail = {
  init() {
    // Load product data based on URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');

    if (productId) {
      this.loadProductData(productId);
    } else {
      console.error('No product ID found in URL');
      // Optionally redirect or show an error message
    }

    // Main add to cart button
    const addToCartBtn = document.querySelector('.product-detail .add-to-cart');
    if (addToCartBtn) {
      // Remove previous listener if it exists to prevent duplicates
      addToCartBtn.removeEventListener('click', this.handleAddToCartBound);
      // Store bound function to maintain 'this' context and allow removal
      this.handleAddToCartBound = this.handleAddToCart.bind(this);
      addToCartBtn.addEventListener('click', this.handleAddToCartBound);
    }

    // Size options - Re-attach listeners after content might have changed
    document.querySelectorAll('.size-options .size-option').forEach(option => {
      option.addEventListener('click', () => {
        document.querySelectorAll('.size-options .size-option').forEach(opt => {
          opt.classList.remove('active');
        });
        option.classList.add('active');
      });
    });

    // Color options - Re-attach listeners after content might have changed
    document.querySelectorAll('.color-options .color-option').forEach(option => {
      option.addEventListener('click', () => {
        document.querySelectorAll('.color-options .color-option').forEach(opt => {
          opt.classList.remove('active');
        });
        option.classList.add('active');
      });
    });

    this.setupQuantitySelector(); // Call a dedicated function for quantity
  },

  setupQuantitySelector() {
    const quantityInput = document.querySelector('.quantity-input');
    if (quantityInput) {
      const minusBtn = document.querySelector('.quantity-btn.minus');
      const plusBtn = document.querySelector('.quantity-btn.plus');

      // Clear existing listeners to prevent duplicates
      if (minusBtn) {
          minusBtn.removeEventListener('click', this.handleMinusQuantity);
          this.handleMinusQuantity = (e) => {
              e.preventDefault();
              let value = parseInt(quantityInput.value);
              if (value > 1) {
                  quantityInput.value = value - 1;
              }
          };
          minusBtn.addEventListener('click', this.handleMinusQuantity);
      }

      if (plusBtn) {
          plusBtn.removeEventListener('click', this.handlePlusQuantity);
          this.handlePlusQuantity = (e) => {
              e.preventDefault();
              let value = parseInt(quantityInput.value);
              // Removed the 'if (value < 10)' condition here
              quantityInput.value = value + 1;
          };
          plusBtn.addEventListener('click', this.handlePlusQuantity);
      }

      // Add input validation
      quantityInput.removeEventListener('change', this.handleQuantityChange);
      this.handleQuantityChange = (e) => {
        let value = parseInt(quantityInput.value);
        if (isNaN(value) || value < 1) {
          quantityInput.value = 1;
        } 
      };
      quantityInput.addEventListener('change', this.handleQuantityChange);
    }
  },

  loadProductData(productId) {
    // Product database
    const products = {
      // ===== CLOTHING =====
      'manu-jersey-1993-94': {
        name: 'Manu Jersey Home 1993-94',
        price: '$15.99',
        condition: 'New',
        description: 'Vintage Manchester United home jersey from the 1993-94 season. Classic red with white details, featuring the iconic Sharp sponsor.',
        images: [
          'images/manujersy-removebg-preview.png',
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Red'],
        material: '100% Polyester',
        year: '1993-94'
      },
      'real-madrid-away-2006-07': {
        name: 'Real Madrid Away 2006-07',
        price: '$15.99',
        condition: 'Excellent',
        description: 'Rare Real Madrid away jersey from the 2006-07 season. Black with white details, featuring the Siemens sponsor.',
        images: [
          'images/Real-Madrid-Away-2006-07-Retro-Jersey--removebg-preview.png',
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black'],
        material: '100% Polyester',
        year: '2006-07'
      },
      'real-madrid-away-2007-08': {
        name: 'Real Madrid Away 2007-08',
        price: '$15.99',
        condition: 'Good',
        description: 'Real Madrid away jersey from the 2007-08 season. Purple with gold details, featuring the Bwin sponsor.',
        images: [
          'images/realjersy-removebg-preview.png',
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Purple'],
        material: '100% Polyester',
        year: '2007-08'
      },
       'barca-home-ucl-final-2008-09': {
        name: 'Barcelona Home 2008-09 UCL Final',
        price: '$15.99',
        condition: 'Good',
        description: 'Barcelona Home 2008-09 UCL Final Jersey. Blue with red details, featuring the Unicef sponsor.',
        images: [
          'images/Barca08-09-removebg-preview.png',
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Blue', 'Red'],
        material: '100% Polyester',
        year: '2007-08'
      },
      'barcelona-125th-anniversary': {
        name: 'Barcelona 125th Anniversary Jersey',
        price: '$19.99',
        condition: 'New',
        description: 'Celebrate FC Barcelona\'s rich history with this special 125th anniversary jersey. Vintage-inspired design with gold accents.',
        images: [
          'images/barca125-removebg-preview.png',
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Blue', 'Maroon'],
        material: '100% Polyester (Breathable mesh fabric)',
        year: '2024 (Retro design)'
      },
      'ac-milan-home-2006-07': {
        name: 'AC Milan Home 2006-07',
        price: '$15.99',
        condition: 'Very Good',
        description: 'AC Milan home jersey from their Champions League winning 2006-07 season. Classic red and black stripes with Opel sponsor.',
        images: [
          'images/acmilan0607.png',
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Red', 'Black'],
        material: '100% Polyester',
        year: '2006-07'
      },
      'ac-milan-away-2006-07': {
        name: 'AC Milan Away 2006-07',
        price: '$15.99',
        condition: 'New',
        description: 'AC Milan away jersey from the 2006-07 season. White with red and black details, featuring the Opel sponsor.',
        images: [
          'images/acmilan0607away-removebg-preview (1).png',
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['White'],
        material: '100% Polyester',
        year: '2006-07'
      },
      'inter-milan-1997-98': {
        name: 'Inter Milan Home 1997-98',
        price: '$15.99',
        condition: 'Very Good',
        description: 'Classic Inter Milan home jersey from the 1997-98 season. Blue and black stripes with Pirelli sponsor.',
        images: [
          'images/inter9798-removebg-preview.png',
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Blue', 'Black'],
        material: '100% Polyester',
        year: '1997-98'
      },
      'manu-home-2002-03': {
        name: 'Manu Home 2002-03 Long Sleeve',
        price: '$15.99',
        condition: 'Very Good',
        description: 'Manchester United home long sleeve jersey from the 2002-03 season. Red with white details, featuring the Vodafone sponsor.',
        images: [
          'images/manu0203.png',
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Red'],
        material: '100% Polyester',
        year: '2002-03'
      },
      'manu-home-2011-12': {
        name: 'Manu Home 2011-12',
        price: '$15.99',
        condition: 'Good',
        description: 'Manchester United home jersey from the 2011-12 season. Red with white and black details, featuring the Aon sponsor.',
        images: [
          'images/manu1112-removebg-preview.png',
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Red'],
        material: '100% Polyester',
        year: '2011-12'
      },
      'liverpool-home-1996-97': {
        name: 'Liverpool Home 1996-97',
        price: '$15.99',
        condition: 'Excellent',
        description: 'Vintage Liverpool home jersey from the 1996-97 season. Red with white details, featuring the Carlsberg sponsor.',
        images: [
          'images/liverpool-1996-1997-retro-jersey-scaled-removebg-preview.png',
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Red'],
        material: '100% Polyester',
        year: '1996-97'
      },
      'liverpool-away-1993-95': {
        name: 'Liverpool Away 1993-95',
        price: '$15.99',
        condition: 'Excellent',
        description: 'Rare Liverpool away jersey from the 1993-95 seasons. White with green details, featuring the Carlsberg sponsor.',
        images: [
          'images/liverpool9395away-removebg-preview.png',
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['White', 'Green'],
        material: '100% Polyester',
        year: '1993-95'
      },

      // ===== SHOES =====
      'nike-panda-dunk-low': {
        name: 'Nike Panda Dunk Low',
        price: '$19.99',
        condition: 'Very Good',
        description: 'Classic Nike Panda Dunk Low shoes in black and white colorway. Timeless design that pairs with any outfit.',
        images: [
          'images/pandadunk-removebg-preview.png',
        ],
        sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
        colors: ['Black', 'White'],
        material: 'Leather and rubber',
        year: '2023'
      },
      'air-jordan-1-travis-scott': {
        name: 'Air Jordan 1 High x Travis Scott',
        price: '$29.99',
        condition: 'Like New',
        description: 'Highly sought-after Travis Scott collaboration. Brown suede with white leather and signature reverse swoosh.',
        images: [
          'images/air-jordan-1-high-travis-scott-release-date.png',
        ],
        sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
        colors: ['Brown', 'White'],
        material: 'Suede and leather',
        year: '2019'
      },
      'nike-dunk-low-olive': {
        name: 'Nike Dunk Low Olive',
        price: '$24.99',
        condition: 'Excellent',
        description: 'Nike Dunk Low in olive green and white colorway. Premium materials and classic silhouette.',
        images: [
          'images/nikedunklowolive-removebg-preview.png',
        ],
        sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
        colors: ['Olive', 'White'],
        material: 'Leather and rubber',
        year: '2022'
      },
      'nike-air-force-1': {
        name: 'Nike Air Force 1',
        price: '$19.99',
        condition: 'New',
        description: 'Classic white Nike Air Force 1 sneakers. The most iconic basketball shoe turned streetwear staple.',
        images: [
          'images/airfoce1-removebg-preview.png',
        ],
        sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
        colors: ['White'],
        material: 'Leather and rubber',
        year: '2023'
      },
      'adidas-ultraboost-light': {
        name: 'Adidas Ultraboost Light',
        price: '$24.99',
        condition: 'New',
        description: 'Adidas Ultraboost Light running shoes with responsive cushioning. Perfect for both running and casual wear.',
        images: [
          'images/ultraboostlight.png',
        ],
        sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
        colors: ['White'],
        material: 'Primeknit and Boost foam',
        year: '2023'
      },
      'adidas-ultrarun-5': {
        name: 'Adidas Ultrarun 5',
        price: '$25.49',
        condition: 'New',
        description: 'Adidas Ultrarun 5 running shoes with lightweight cushioning. Breathable mesh upper for all-day comfort.',
        images: [
          'images/Ultrarun_5_Running_Shoes_White_IE8791_01_standard.png',
        ],
        sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
        colors: ['Mixed Color'],
        material: 'Mesh and rubber',
        year: '2023'
      },
      'air-jordan-1-black-phantom': {
        name: 'Air Jordan 1 Low x Travis Scott Black Phantom',
        price: '$29.99',
        condition: 'Like New',
        description: 'Travis Scott Black Phantom collaboration. All-black colorway with signature reverse swoosh and hidden details.',
        images: [
          'images/blackphantom.png',
        ],
        sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
        colors: ['Black'],
        material: 'Leather and suede',
        year: '2022'
      },
      'new-balance-530-grey': {
        name: 'New Balance 530',
        price: '$24.99',
        condition: 'New',
        description: 'New Balance 530 sneakers in grey colorway. Retro running silhouette with modern comfort.',
        images: [
          'images/newbalance530grey.png',
        ],
        sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
        colors: ['Grey'],
        material: 'Mesh and suede',
        year: '2023'
      },
      'adidas-runfalcon-5': {
        name: 'Adidas Runfalcon 5',
        price: '$24.99',
        condition: 'New',
        description: 'Adidas Runfalcon 5 running shoes with responsive cushioning. Lightweight and comfortable for daily wear.',
        images: [
          'images/Runfalcon_5_Running_Shoes_Black_IE8826_01_standard.png',
        ],
        sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
        colors: ['Mixed Color'],
        material: 'Mesh and rubber',
        year: '2023'
      },
      'air-jordan-reverse-mocha': {
        name: 'Air Jordan Reverse Mocha',
        price: '$29.99',
        condition: 'Like New',
        description: 'Travis Scott Reverse Mocha collaboration. Brown and white colorway with signature reverse swoosh.',
        images: [
          'images/reversemocha.png',
        ],
        sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
        colors: ['Brown', 'White'],
        material: 'Suede and leather',
        year: '2022'
      },
      'new-balance-550-green': {
        name: 'New Balance 550 Green',
        price: '$18.75',
        condition: 'Very Good',
        description: 'New Balance 550 basketball-inspired sneakers in green colorway. Classic design with premium materials.',
        images: [
          'images/newbalance550green.png',
        ],
        sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
        colors: ['Green'],
        material: 'Leather and rubber',
        year: '2022'
      },
      'new-balance-530-white': {
        name: 'New Balance White Silver Navy',
        price: '$24.99',
        condition: 'New',
        description: 'New Balance 530 in white, silver and navy colorway. Retro runner with modern comfort technology.',
        images: [
          'images/newbalance530white.png',
        ],
        sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
        colors: ['White'],
        material: 'Mesh and suede',
        year: '2023'
      },

      // ===== ACCESSORIES =====
      'new-york-cap-washed': {
        name: 'New York Cap Washed',
        price: '$9.99',
        condition: 'Very Good',
        description: 'Vintage washed New York cap with distressed look. Adjustable strap for perfect fit.',
        images: [
          'images/newyorkcapwash.png',
        ],
        sizes: ['One Size'],
        colors: ['Washed Grey'],
        material: '100% Cotton',
        year: '1990s'
      },
      'british-hat': {
        name: 'British Hat',
        price: '$11.99',
        condition: 'Excellent',
        description: 'Classic British-style hat in brown. Perfect for adding a sophisticated touch to any outfit.',
        images: [
          'images/britishhat.png',
        ],
        sizes: ['One Size'],
        colors: ['Brown'],
        material: 'Wool blend',
        year: 'Vintage'
      },
      'new-chapter-trucker-cap': {
        name: 'New Chapter Trucker Cap',
        price: '$9.99',
        condition: 'Good',
        description: 'Vintage-inspired trucker cap with "New Chapter" embroidery. Mesh back for breathability.',
        images: [
          'images/Newchaptertruckerhat.png',
        ],
        sizes: ['One Size'],
        colors: ['Brown', 'Olive'],
        material: 'Cotton and mesh',
        year: 'Vintage'
      },
      'brown-belt': {
        name: 'Belt',
        price: '$7.99',
        condition: 'Good',
        description: 'Classic brown leather belt with simple buckle. Versatile accessory for pants or jeans.',
        images: [
          'images/belt.png',
        ],
        sizes: ['S', 'M', 'L'],
        colors: ['Brown'],
        material: 'Genuine leather',
        year: 'Vintage'
      },
      'colorado-90s-cap': {
        name: '90s Colorado Vintage Cap',
        price: '$19.99',
        condition: 'Excellent',
        description: 'Rare 90s Colorado vintage cap in cream and black colorway. Features embroidered team logo.',
        images: [
          'images/Colorado90svintage.png',
        ],
        sizes: ['One Size'],
        colors: ['Cream', 'Black'],
        material: 'Cotton',
        year: '1990s'
      },
      'black-belt': {
        name: 'Belt',
        price: '$11.99',
        condition: 'Very Good',
        description: 'Classic black leather belt with simple buckle. Essential wardrobe accessory.',
        images: [
          'images/blackbelt.png',
        ],
        sizes: ['S', 'M', 'L'],
        colors: ['Black'],
        material: 'Genuine leather',
        year: 'Vintage'
      },
      'black-watch': {
        name: 'Watch',
        price: '$9.99',
        condition: 'Good',
        description: 'Vintage-style black watch with leather strap. Minimalist design with analog display.',
        images: [
          'images/watch1.png',
        ],
        sizes: ['One Size'],
        colors: ['Black'],
        material: 'Stainless steel and leather',
        year: 'Vintage'
      },
      'black-bucket-hat': {
        name: 'Bucket Hat',
        price: '$8.99',
        condition: 'Very Good',
        description: 'Classic black bucket hat. Provides sun protection while adding style to your look.',
        images: [
          'images/buckethat.png',
        ],
        sizes: ['One Size'],
        colors: ['Black'],
        material: 'Cotton',
        year: 'Vintage'
      },
      'zim-military-watch': {
        name: 'Zim Military Watch',
        price: '$19.99',
        condition: 'Excellent',
        description: 'Vintage Zim military watch with brown strap. Features luminous hands and military time markings.',
        images: [
          'images/watch2.png',
        ],
        sizes: ['One Size'],
        colors: ['Brown'],
        material: 'Stainless steel and leather',
        year: '1960s'
      },
      'cross-necklace': {
        name: 'Cross Necklace',
        price: '$4.99',
        condition: 'New',
        description: 'Simple silver cross necklace on chain. Classic religious jewelry piece.',
        images: [
          'images/crossnecklace.png',
        ],
        sizes: ['One Size'],
        colors: ['Silver'],
        material: 'Stainless steel',
        year: 'New'
      },
      'multi-strand-bracelet': {
        name: 'Multi Strand Bracelet',
        price: '$3.99',
        condition: 'New',
        description: 'Black multi-strand bracelet with silver accents. Adjustable for perfect fit.',
        images: [
          'images/multistrandbracelet.png',
        ],
        sizes: ['One Size'],
        colors: ['Black'],
        material: 'Fabric and metal',
        year: 'New'
      },
      'bead-necklace': {
        name: 'Bead Necklace',
        price: '$4.99',
        condition: 'New',
        description: 'Black bead necklace with silver accents. Adjustable length for versatile styling.',
        images: [
          'images/BeadNecklace.png',
        ],
        sizes: ['One Size'],
        colors: ['Black'],
        material: 'Beads and metal',
        year: 'New'
      }
    };

    const product = products[productId];
    if (!product) {
      console.error(`Product not found: ${productId}`);
      return;
    }

    // Safely update the page with product data
    try {
      const nameElement = document.querySelector('.product-info h1');
      const priceElement = document.querySelector('.price');
      const conditionElement = document.querySelector('.condition');
      const descriptionElement = document.querySelector('.product-description p');
      
      if (nameElement) nameElement.textContent = product.name;
      if (priceElement) priceElement.textContent = product.price;
      if (conditionElement) conditionElement.textContent = product.condition;
      if (descriptionElement) descriptionElement.textContent = product.description;
      
      // Update main image
      const mainImage = document.getElementById('main-product-image');
      if (mainImage && product.images.length > 0) {
        mainImage.src = product.images[0];
        mainImage.alt = product.name;
      }

      // Update size options
      const sizeOptions = document.querySelector('.size-options');
      if (sizeOptions) {
        sizeOptions.innerHTML = product.sizes.map((size, index) => `
          <button class="size-option ${index === 0 ? 'active' : ''}">${size}</button>
        `).join('');
      }

      // Update color options
   // In ProductDetail.loadProductData
const colorOptions = document.querySelector('.color-options');
if (colorOptions) {
    // Remove any existing color text element
    const existingColorText = colorOptions.parentNode.querySelector('.color-text');
    if (existingColorText) existingColorText.remove();
    
    // Create new color text display
    const colorText = document.createElement('p');
    colorText.className = 'color-text';
    colorText.textContent = product.colors.join(' and ');
    
    // Insert after the color options
    colorOptions.parentNode.insertBefore(colorText, colorOptions.nextSibling);
    
    // Hide the color buttons if you don't want them
    colorOptions.style.display = 'none';
}

      // Update specs
      const specGroups = document.querySelectorAll('.spec-group');
      if (specGroups.length >= 3) {
        const conditionElement = specGroups[2].querySelector('p');
        if (conditionElement) conditionElement.textContent = product.condition;
      }
      if (specGroups.length >= 4) {
        const materialElement = specGroups[3].querySelector('p');
        if (materialElement) materialElement.textContent = product.material;
      }
      if (specGroups.length >= 5) {
        const yearElement = specGroups[4].querySelector('p');
        if (yearElement) yearElement.textContent = product.year;
      }

      this.initEventListeners(); // Reinitialize event listeners
    } catch (error) {
      console.error('Error loading product data:', error);
    }
  },

  initEventListeners() {
    // Reinitialize only those listeners that depend on dynamically loaded content.
    this.setupQuantitySelector();

    // Re-attach listeners for size and color options
    document.querySelectorAll('.size-options .size-option').forEach(option => {
      option.addEventListener('click', () => {
        document.querySelectorAll('.size-options .size-option').forEach(opt => {
          opt.classList.remove('active');
        });
        option.classList.add('active');
      });
    });

    document.querySelectorAll('.color-options .color-option').forEach(option => {
      option.addEventListener('click', () => {
        document.querySelectorAll('.color-options .color-option').forEach(opt => {
          opt.classList.remove('active');
        });
        option.classList.add('active');
      });
    });
  },

  handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const productContainer = document.querySelector('.product-detail-content');
    if (!productContainer) return;
    
    // Get product details
    const productName = productContainer.querySelector('h1')?.textContent;
    const price = productContainer.querySelector('.price')?.textContent;
    const condition = productContainer.querySelector('.condition')?.textContent || '';
    
    // Get selected options
    const sizeOption = productContainer.querySelector('.size-options .active');
    const size = sizeOption?.textContent;
    
     const colorTextElement = document.querySelector('.color-text');
    const colorText = colorTextElement ? colorTextElement.textContent : '';
    
    // Get quantity - IMPORTANT FIX
    const quantityInput = document.querySelector('.quantity-input');
    let quantity = 1;
    if (quantityInput) {
      quantity = parseInt(quantityInput.value) || 1; 
    }
    
    const imageElement = document.getElementById('main-product-image');
    const image = imageElement ? imageElement.getAttribute('src').split('/').pop() : 
             'default-product.png';
    
    // Create product ID
    const productId = productName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    if (!productName || !price) {
      console.error('Missing required product details');
      return;
    }
    
    CartManager.addToCart({
        id: productId,
        name: productName,
        price: price,
        image: image,
        size: size,
        color: colorText,
        condition: condition,
        quantity: quantity 
    });
  }
};

// ==================== GENERAL PAGE FUNCTIONALITY ====================
const App = {
  init() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenuBtn && navLinks) {
      mobileMenuBtn.addEventListener('click', () => {
        const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
        mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
        navLinks.classList.toggle('show');
      });
    }

    // Initialize cart
    CartManager.updateCartCount();

    // Cart button
    document.querySelector('.cart-icon .nav-btn')?.addEventListener('click', (e) => {
      if (!window.location.pathname.includes('cart.html')) {
        window.location.href = 'cart.html';
      }
      e.preventDefault();
    });

    // Search functionality
    document.querySelector('.nav-btn[aria-label="Search"]')?.addEventListener('click', () => {
      const searchTerm = prompt('Enter search term:');
      if (searchTerm) alert(`Searching for: ${searchTerm}`);
    });

    // Quick View buttons
    document.querySelectorAll('.quick-view').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const productCard = button.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        const price = productCard.querySelector('.price').textContent;
        alert(`Quick view: ${productName}\nPrice: ${price}`);
      });
    });

    // Setup add to cart buttons for all product cards
    ProductGrid.setupAddToCartButtons();

    // Newsletter form
    document.querySelector('.newsletter-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = e.target.querySelector('input[type="email"]').value;
      alert(`Thanks for subscribing with ${email}!`);
      e.target.reset();
    });

    // Initialize product detail page if needed
    if (document.querySelector('.product-detail')) {
      ProductDetail.init();
    }

    // Initialize cart page if needed
    if (document.querySelector('.cart-page')) {
      CartManager.renderCart();

      document.querySelector('.checkout-btn')?.addEventListener('click', () => {
          if (cart.length === 0) {
              alert('Your cart is empty!');
              return;
          }
          
          // Calculate subtotal
          const subtotal = cart.reduce((total, item) => {
              const price = parseFloat(item.price.replace(/[^0-9.-]+/g,""));
              return total + (price * item.quantity);
          }, 0);
          
          // Save the cart and subtotal to localStorage before navigating
          localStorage.setItem('vintagecycle-cart', JSON.stringify(cart));
          localStorage.setItem('checkout-subtotal', subtotal.toFixed(2));
          
          // Navigate to QR code payment page
          window.location.href = 'Qrcode.html';
      });
    }
  }
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => App.init());
