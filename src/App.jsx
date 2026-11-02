import React, { useEffect, useMemo, useState } from "react";
import foodieHunter from "../images/foodie hunter.png";

const foodImages = import.meta.glob("../images/*/*.{jpg,jpeg,png}", {
  eager: true,
  query: "?url",
  import: "default",
});

const categories = [
  { id: "biryani", folder: "biryani", name: "Biryani" },
  { id: "chicken", folder: "chicken", name: "Chicken Delicious" },
  { id: "paneer", folder: "paneer", name: "Paneer Mania" },
  { id: "vegetable", folder: "vegetable", name: "Pure Veg Dishes" },
  { id: "chinese", folder: "chinese", name: "Chinese Corner" },
  { id: "south-indian", folder: "south indian", name: "South Indian" },
];

const foodItems = Object.entries(foodImages).map(([path, image]) => {
  const [, folder, filename] = path.match(/^\.\.\/images\/([^/]+)\/([^/]+)$/);
  const name = filename
    .replace(/\.[^.]+$/, "")
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return {
    id: path,
    image,
    name,
    category: categories.find((category) => category.folder === folder),
    price: 10,
  };
});

const emptyProfile = {
  name: "Guest",
  email: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
  country: "",
};

const pageTitles = {
  home: "Explore the menu",
  about: "About Foodie Hunter",
  services: "Our services",
  orders: "Your orders",
  wishlist: "Your wishlist",
  cart: "Your cart",
  checkout: "Checkout",
  contact: "Contact us",
  profile: "Your profile",
};

function getProfileInitials(name) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "G"
  );
}

function Icon({ name, children, className = "" }) {
  return (
    <i className={`fa ${name} ${className}`.trim()}>
      {children ? ` ${children}` : ""}
    </i>
  );
}

function SearchControl({ searchTerm, onSearchChange }) {
  return (
    <label className="search-control">
      <Icon name="fa-search" />
      <input
        aria-label="Search dishes"
        type="search"
        placeholder="Search dishes..."
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </label>
  );
}

function ProfileForm({ profile, storageError, onSave }) {
  const [formProfile, setFormProfile] = useState(profile);
  const [saved, setSaved] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setFormProfile((currentProfile) => ({
      ...currentProfile,
      [name]: value,
    }));
    setSaved(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const savedSuccessfully = onSave({
      ...formProfile,
      name: formProfile.name.trim(),
      email: formProfile.email.trim(),
      phone: formProfile.phone.trim(),
      address: formProfile.address.trim(),
      city: formProfile.city.trim(),
      postalCode: formProfile.postalCode.trim(),
      country: formProfile.country.trim(),
    });
    setSaved(savedSuccessfully);
  }

  return (
    <section className="content-panel profile-page">
      <div className="page-heading">
        <div className="profile-avatar">{getProfileInitials(formProfile.name)}</div>
        <div>
          <h2>{formProfile.name || "Your Profile"}</h2>
          <p>Manage your contact and delivery details.</p>
        </div>
      </div>
      <form className="profile-form" onSubmit={handleSubmit}>
        {storageError && (
          <p className="profile-error form-wide" role="alert">
            {storageError}
          </p>
        )}
        <label className="profile-field">
          Full name
          <input
            required
            name="name"
            autoComplete="name"
            value={formProfile.name}
            onChange={updateField}
          />
        </label>
        <label className="profile-field">
          Email
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            value={formProfile.email}
            onChange={updateField}
          />
        </label>
        <label className="profile-field">
          Phone number
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            value={formProfile.phone}
            onChange={updateField}
          />
        </label>
        <label className="profile-field form-wide">
          Street address
          <input
            name="address"
            autoComplete="street-address"
            value={formProfile.address}
            onChange={updateField}
          />
        </label>
        <label className="profile-field">
          City
          <input
            name="city"
            autoComplete="address-level2"
            value={formProfile.city}
            onChange={updateField}
          />
        </label>
        <label className="profile-field">
          Postal code
          <input
            name="postalCode"
            autoComplete="postal-code"
            value={formProfile.postalCode}
            onChange={updateField}
          />
        </label>
        <label className="profile-field">
          Country
          <input
            name="country"
            autoComplete="country-name"
            value={formProfile.country}
            onChange={updateField}
          />
        </label>
        <div className="profile-form-actions form-wide">
          {saved && <span role="status">Profile saved.</span>}
          <button className="primary-button" type="submit">
            Save profile
          </button>
        </div>
      </form>
    </section>
  );
}

function DishCard({ item, onAdd, onBuyNow, isWishlisted, onToggleWishlist }) {
  return (
    <article className="food-card">
      <img src={item.image} alt={item.name} loading="lazy" />
      <div className="food-card-body">
        <div className="food-card-title-row">
          <h3>{item.name}</h3>
          <button
            className={`icon-button wishlist-toggle ${isWishlisted ? "is-wishlisted" : ""}`}
            type="button"
            aria-label={isWishlisted ? `Remove ${item.name} from wishlist` : `Add ${item.name} to wishlist`}
            onClick={() => onToggleWishlist(item.id)}
          >
            <Icon name={isWishlisted ? "fa-heart" : "fa-heart-o"} />
          </button>
        </div>
        <p className="dish-price">${item.price.toFixed(2)}</p>
        <div className="food-card-actions">
          <button className="secondary-button" type="button" onClick={() => onAdd(item)}>
            <Icon name="fa-cart-plus">Add to cart</Icon>
          </button>
          <button className="primary-button" type="button" onClick={() => onBuyNow(item)}>
            Buy now
          </button>
        </div>
      </div>
    </article>
  );
}

function FoodCatalog({
  items,
  selectedCategory,
  searchTerm,
  wishlist,
  onAdd,
  onBuyNow,
  onToggleWishlist,
  emptyTitle = "No dishes found",
  emptyText = "Try a different search or select another category.",
  onEmptyAction,
}) {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visibleCategories = categories.filter(
    (category) => !selectedCategory || category.id === selectedCategory,
  );
  const matchingItems = items.filter((item) => {
    const matchesSearch =
      !normalizedSearch ||
      item.name.toLowerCase().includes(normalizedSearch) ||
      item.category.name.toLowerCase().includes(normalizedSearch);
    const matchesCategory =
      !selectedCategory || item.category.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="catalog">
      {visibleCategories
        .map((category) => ({
          category,
          items: matchingItems.filter((item) => item.category.id === category.id),
        }))
        .filter(({ items: categoryItems }) => categoryItems.length > 0)
        .map(({ category, items: categoryItems }) => (
          <section className="food-category" key={category.id}>
            <div className="section-heading">
              <h2>{category.name}</h2>
              <span>{categoryItems.length} dishes</span>
            </div>
            <div className="food-card-grid">
              {categoryItems.map((item) => (
                <DishCard
                  item={item}
                  key={item.id}
                  onAdd={onAdd}
                  onBuyNow={onBuyNow}
                  isWishlisted={wishlist.includes(item.id)}
                  onToggleWishlist={onToggleWishlist}
                />
              ))}
            </div>
          </section>
        ))}
      {matchingItems.length === 0 && (
        <div className="empty-state" role="status">
          <Icon name={wishlist.length && !normalizedSearch ? "fa-heart-o" : "fa-search"} />
          <h2>{emptyTitle}</h2>
          <p>{emptyText}</p>
          {onEmptyAction && (
            <button className="primary-button" type="button" onClick={onEmptyAction}>
              Explore menu
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CartPage({ cart, onQuantityChange, onRemove, onGoCheckout }) {
  const total = cart.reduce((sum, line) => sum + line.item.price * line.quantity, 0);

  return (
    <section className="content-panel">
      <div className="section-heading">
        <h2>Cart items</h2>
        <span>{cart.reduce((sum, line) => sum + line.quantity, 0)} items</span>
      </div>
      {cart.length === 0 ? (
        <div className="empty-state">
          <Icon name="fa-shopping-basket" />
          <h2>Your cart is empty</h2>
          <p>Browse the menu and add something tasty.</p>
        </div>
      ) : (
        <>
          <div className="cart-lines">
            {cart.map(({ item, quantity }) => (
              <article className="cart-line" key={item.id}>
                <img src={item.image} alt="" />
                <div className="cart-line-info">
                  <h3>{item.name}</h3>
                  <p>${item.price.toFixed(2)} each</p>
                </div>
                <div className="quantity-control" aria-label={`Quantity for ${item.name}`}>
                  <button type="button" aria-label="Decrease quantity" onClick={() => onQuantityChange(item.id, quantity - 1)}>
                    −
                  </button>
                  <span>{quantity}</span>
                  <button type="button" aria-label="Increase quantity" onClick={() => onQuantityChange(item.id, quantity + 1)}>
                    +
                  </button>
                </div>
                <strong>${(item.price * quantity).toFixed(2)}</strong>
                <button className="remove-button" type="button" onClick={() => onRemove(item.id)}>
                  Remove
                </button>
              </article>
            ))}
          </div>
          <div className="cart-total">
            <span>Subtotal</span>
            <strong>${total.toFixed(2)}</strong>
          </div>
          <button className="primary-button checkout-cta" type="button" onClick={onGoCheckout}>
            Continue to checkout
          </button>
        </>
      )}
    </section>
  );
}

function CheckoutPage({ cart, orderType, onOrderTypeChange, profile, onPlaceOrder, onViewCart }) {
  const total = cart.reduce((sum, line) => sum + line.item.price * line.quantity, 0);
  const hasDeliveryAddress = [profile.address, profile.city, profile.postalCode, profile.country]
    .filter(Boolean)
    .join(", ");

  if (cart.length === 0) {
    return (
      <section className="content-panel empty-state">
        <Icon name="fa-shopping-basket" />
        <h2>Nothing to check out yet</h2>
        <p>Add dishes to your cart before checking out.</p>
        <button className="primary-button" type="button" onClick={onViewCart}>
          View cart
        </button>
      </section>
    );
  }

  return (
    <section className="content-panel checkout-page">
      <h2>Choose how you’d like to enjoy your meal</h2>
      <div className="order-type-options">
        <label className={`order-type-option ${orderType === "takeaway" ? "selected" : ""}`}>
          <input
            type="radio"
            name="orderType"
            value="takeaway"
            checked={orderType === "takeaway"}
            onChange={() => onOrderTypeChange("takeaway")}
          />
          <Icon name="fa-shopping-bag" />
          <span>
            <strong>Takeaway</strong>
            <small>Pick up your order from the restaurant.</small>
          </span>
        </label>
        <label className={`order-type-option ${orderType === "dine-in" ? "selected" : ""}`}>
          <input
            type="radio"
            name="orderType"
            value="dine-in"
            checked={orderType === "dine-in"}
            onChange={() => onOrderTypeChange("dine-in")}
          />
          <Icon name="fa-cutlery" />
          <span>
            <strong>Dine in</strong>
            <small>Enjoy your meal at the restaurant.</small>
          </span>
        </label>
      </div>
      <div className="checkout-review">
        <h3>Order summary</h3>
        {cart.map(({ item, quantity }) => (
          <p key={item.id}>
            <span>{item.name} × {quantity}</span>
            <strong>${(item.price * quantity).toFixed(2)}</strong>
          </p>
        ))}
        <div className="cart-total">
          <span>Total</span>
          <strong>${total.toFixed(2)}</strong>
        </div>
      </div>
      <div className="fulfillment-note">
        <Icon name={orderType === "takeaway" ? "fa-shopping-bag" : "fa-map-marker"} />
        {orderType === "takeaway"
          ? "Pickup details will be arranged with the restaurant."
          : "Dine-in seating is subject to restaurant availability."}
      </div>
      {orderType === "takeaway" && !hasDeliveryAddress && (
        <p className="subtle-note">
          You can add your contact details under Profile before placing the order.
        </p>
      )}
      <button className="primary-button checkout-cta" type="button" onClick={onPlaceOrder}>
        Place order
      </button>
    </section>
  );
}

function OrdersPage({ orders, onBrowse }) {
  return (
    <section className="content-panel">
      <div className="section-heading">
        <h2>Your orders</h2>
        <span>{orders.length} orders</span>
      </div>
      {orders.length === 0 ? (
        <div className="empty-state">
          <Icon name="fa-file-text-o" />
          <h2>No orders yet</h2>
          <p>Your completed orders will be listed here.</p>
          <button className="primary-button" type="button" onClick={onBrowse}>
            Explore menu
          </button>
        </div>
      ) : (
        <div className="order-list">
          {[...orders].reverse().map((order) => (
            <article className="order-card" key={order.id}>
              <div>
                <h3>Order {order.id}</h3>
                <p>{new Date(order.createdAt).toLocaleString()}</p>
                <p>{order.type === "dine-in" ? "Dine in" : "Takeaway"}</p>
                <p>{order.items.map(({ item, quantity }) => `${item.name} × ${quantity}`).join(", ")}</p>
              </div>
              <strong>${order.total.toFixed(2)}</strong>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function InformationPage({ page, onGoMenu, onContactSubmit, contactSent }) {
  if (page === "wishlist") {
    return null;
  }

  if (page === "about") {
    return (
      <section className="content-panel information-page">
        <span className="eyebrow">Good food, made easy</span>
        <h2>Welcome to Foodie Hunter</h2>
        <p>Explore a menu of biryani, chicken, paneer, vegetable, Chinese, and South Indian favorites. Choose your dishes, add them to your cart, and select takeaway or dine-in at checkout.</p>
        <button className="primary-button" type="button" onClick={onGoMenu}>Explore the menu</button>
      </section>
    );
  }

  if (page === "services") {
    return (
      <section className="content-panel information-page">
        <span className="eyebrow">How it works</span>
        <h2>Choose your way to enjoy</h2>
        <div className="service-grid">
          <article><Icon name="fa-shopping-bag" /><h3>Takeaway</h3><p>Order ahead and pick up your meal.</p></article>
          <article><Icon name="fa-cutlery" /><h3>Dine in</h3><p>Choose dine-in when you check out.</p></article>
          <article><Icon name="fa-heart-o" /><h3>Save favorites</h3><p>Keep dishes in your wishlist for later.</p></article>
        </div>
        <button className="primary-button" type="button" onClick={onGoMenu}>Browse dishes</button>
      </section>
    );
  }

  return (
    <section className="content-panel information-page">
      <span className="eyebrow">We’re here to help</span>
      <h2>Contact us</h2>
      {contactSent ? (
        <p className="success-message" role="status">Thanks! Your message has been recorded in this demo.</p>
      ) : (
        <form className="contact-form" onSubmit={onContactSubmit}>
          <label>Your name<input name="name" required /></label>
          <label>Email<input name="email" type="email" required /></label>
          <label>Message<textarea name="message" rows="4" required /></label>
          <button className="primary-button" type="submit">Send message</button>
        </form>
      )}
    </section>
  );
}

function App() {
  const [page, setPage] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [profile, setProfile] = useState(emptyProfile);
  const [profileError, setProfileError] = useState("");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderType, setOrderType] = useState("takeaway");
  const [notice, setNotice] = useState("");
  const [contactSent, setContactSent] = useState(false);

  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const wishlistItems = useMemo(
    () => foodItems.filter((item) => wishlist.includes(item.id)),
    [wishlist],
  );

  useEffect(() => {
    try {
      const savedProfile = window.localStorage.getItem("food-website-profile");
      if (!savedProfile) return;
      const parsedProfile = JSON.parse(savedProfile);
      if (!parsedProfile || typeof parsedProfile !== "object") {
        throw new Error("Saved profile data has an invalid shape.");
      }

      const restoredProfile = { ...emptyProfile };
      for (const field of Object.keys(emptyProfile)) {
        if (typeof parsedProfile[field] === "string") {
          restoredProfile[field] = parsedProfile[field];
        }
      }
      setProfile(restoredProfile);
    } catch (error) {
      console.error("Unable to load the saved profile.", error);
      setProfileError("Could not load the saved profile from this browser.");
    }
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timeoutId = window.setTimeout(() => setNotice(""), 2600);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  function navigate(nextPage, categoryId = "") {
    setPage(nextPage);
    setSelectedCategory(categoryId);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function navigateFromDropdown(event, nextPage, categoryId = "") {
    const dropdown = event.currentTarget.closest("details");
    if (dropdown) dropdown.open = false;
    navigate(nextPage, categoryId);
  }

  function addToCart(item) {
    setCart((currentCart) => {
      const existingLine = currentCart.find((line) => line.item.id === item.id);
      if (existingLine) {
        return currentCart.map((line) =>
          line.item.id === item.id
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        );
      }
      return [...currentCart, { item, quantity: 1 }];
    });
    setNotice(`${item.name} added to your cart.`);
  }

  function buyNow(item) {
    setCart((currentCart) => {
      const existingLine = currentCart.find((line) => line.item.id === item.id);
      return existingLine
        ? currentCart.map((line) =>
            line.item.id === item.id
              ? { ...line, quantity: line.quantity + 1 }
              : line,
          )
        : [...currentCart, { item, quantity: 1 }];
    });
    setOrderType("takeaway");
    navigate("checkout");
  }

  function changeQuantity(itemId, quantity) {
    setCart((currentCart) =>
      quantity < 1
        ? currentCart.filter((line) => line.item.id !== itemId)
        : currentCart.map((line) =>
            line.item.id === itemId ? { ...line, quantity } : line,
          ),
    );
  }

  function toggleWishlist(itemId) {
    setWishlist((currentWishlist) =>
      currentWishlist.includes(itemId)
        ? currentWishlist.filter((id) => id !== itemId)
        : [...currentWishlist, itemId],
    );
  }

  function saveProfile(updatedProfile) {
    try {
      window.localStorage.setItem(
        "food-website-profile",
        JSON.stringify(updatedProfile),
      );
    } catch (error) {
      console.error("Unable to save the profile.", error);
      setProfileError(
        "Could not save your profile. Check browser storage settings and try again.",
      );
      return false;
    }
    setProfileError("");
    setProfile(updatedProfile);
    setNotice("Profile saved.");
    return true;
  }

  function placeOrder() {
    const total = cart.reduce(
      (sum, line) => sum + line.item.price * line.quantity,
      0,
    );
    const order = {
      id: `FH-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      type: orderType,
      items: cart,
      total,
    };
    setOrders((currentOrders) => [...currentOrders, order]);
    setCart([]);
    navigate("orders");
    setNotice("Order placed successfully.");
  }

  function handleContactSubmit(event) {
    event.preventDefault();
    setContactSent(true);
  }

  const selectedCategoryName = categories.find(
    (category) => category.id === selectedCategory,
  )?.name;
  const title =
    selectedCategoryName ||
    (page === "wishlist" ? pageTitles.wishlist : pageTitles[page] || pageTitles.home);

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <button
          className="brand"
          type="button"
          onClick={() => navigate("home")}
          aria-label="Foodie Hunter home"
        >
          <img src={foodieHunter} alt="Foodie Hunter" />
        </button>

        <details className="sidebar-dropdown">
          <summary>
            <span className="sidebar-summary-leading">
              <span className="sidebar-avatar">{getProfileInitials(profile.name)}</span>
              <span className="sidebar-summary-text">
                <strong>{profile.name}</strong>
                <small>Profile & account</small>
              </span>
            </span>
            <Icon name="fa-angle-down" />
          </summary>
          <div className="dropdown-content profile-dropdown-content">
            <p>{profile.email || "Add your email address"}</p>
            {profile.phone && <p>{profile.phone}</p>}
            <button type="button" onClick={(event) => navigateFromDropdown(event, "profile")}>View / edit profile</button>
          </div>
        </details>

        <nav className="sidebar-navigation" aria-label="Main navigation">
          <button className={page === "home" && !selectedCategory ? "nav-link active" : "nav-link"} type="button" onClick={() => navigate("home")}>
            <Icon name="fa-home">Home</Icon>
          </button>
          <details className="sidebar-dropdown">
            <summary>
              <span className="sidebar-summary-leading">
                <Icon name="fa-compass" />
                <span className="sidebar-summary-text">
                  <strong>Go For Hunt</strong>
                  <small>Browse food categories</small>
                </span>
              </span>
              <Icon name="fa-angle-down" />
            </summary>
            <div className="dropdown-content category-dropdown-content">
              {categories.map((category) => (
                <button
                  className={selectedCategory === category.id ? "dropdown-active" : ""}
                  type="button"
                  key={category.id}
                  onClick={(event) => navigateFromDropdown(event, "home", category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </details>
          <button className={page === "services" ? "nav-link active" : "nav-link"} type="button" onClick={() => navigate("services")}>
            <Icon name="fa-cutlery">Services</Icon>
          </button>
          <button className={page === "orders" ? "nav-link active" : "nav-link"} type="button" onClick={() => navigate("orders")}>
            <Icon name="fa-file-text-o">Your Orders</Icon>
          </button>
          <button className={page === "wishlist" ? "nav-link active" : "nav-link"} type="button" onClick={() => navigate("wishlist")}>
            <Icon name="fa-heart-o">Wishlists ({wishlist.length})</Icon>
          </button>
          <button className={page === "cart" ? "nav-link active" : "nav-link"} type="button" onClick={() => navigate("cart")}>
            <Icon name="fa-shopping-cart">Cart ({cartCount})</Icon>
          </button>
          <button className={page === "about" ? "nav-link active" : "nav-link"} type="button" onClick={() => navigate("about")}>
            <Icon name="fa-info-circle">About</Icon>
          </button>
          <button className={page === "contact" ? "nav-link active" : "nav-link"} type="button" onClick={() => navigate("contact")}>
            <Icon name="fa-envelope">Contact</Icon>
          </button>
          <details className="sidebar-dropdown checkout-dropdown">
            <summary>
              <span className="sidebar-summary-leading">
                <Icon name="fa-credit-card" />
                <span className="sidebar-summary-text">
                  <strong>Checkout</strong>
                  <small>{cartCount} items · ${cart.reduce((sum, line) => sum + line.item.price * line.quantity, 0).toFixed(2)}</small>
                </span>
              </span>
              <Icon name="fa-angle-down" />
            </summary>
            <div className="dropdown-content">
              <button type="button" onClick={(event) => navigateFromDropdown(event, "cart")}>Review cart</button>
              <button type="button" onClick={(event) => { setOrderType("takeaway"); navigateFromDropdown(event, "checkout"); }}>Takeaway checkout</button>
              <button type="button" onClick={(event) => { setOrderType("dine-in"); navigateFromDropdown(event, "checkout"); }}>Dine-in checkout</button>
            </div>
          </details>
        </nav>

        <div className="sidebar-footer">
          <span>Fresh choices, happy moments.</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div>
            <p className="eyebrow">Good food is just a few clicks away</p>
            <h1>{title}</h1>
          </div>
          <div className="top-bar-actions">
            <SearchControl searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            <button className="cart-shortcut" type="button" onClick={() => navigate("cart")}>
              <Icon name="fa-shopping-cart" />
              <span>Cart</span>
              <b>{cartCount}</b>
            </button>
          </div>
        </header>

        {notice && <div className="toast-message" role="status">{notice}</div>}

        {page === "home" && (
          <FoodCatalog
            items={foodItems}
            selectedCategory={selectedCategory}
            searchTerm={searchTerm}
            wishlist={wishlist}
            onAdd={addToCart}
            onBuyNow={buyNow}
            onToggleWishlist={toggleWishlist}
          />
        )}
        {page === "profile" && (
          <ProfileForm
            profile={profile}
            storageError={profileError}
            onSave={saveProfile}
          />
        )}
        {page === "cart" && (
          <CartPage
            cart={cart}
            onQuantityChange={changeQuantity}
            onRemove={(id) => setCart((currentCart) => currentCart.filter((line) => line.item.id !== id))}
            onGoCheckout={() => navigate("checkout")}
          />
        )}
        {page === "checkout" && (
          <CheckoutPage
            cart={cart}
            orderType={orderType}
            onOrderTypeChange={setOrderType}
            profile={profile}
            onPlaceOrder={placeOrder}
            onViewCart={() => navigate("cart")}
          />
        )}
        {page === "orders" && <OrdersPage orders={orders} onBrowse={() => navigate("home")} />}
        {page === "wishlist" && (
          <FoodCatalog
            items={wishlistItems}
            selectedCategory=""
            searchTerm={searchTerm}
            wishlist={wishlist}
            onAdd={addToCart}
            onBuyNow={buyNow}
            onToggleWishlist={toggleWishlist}
            emptyTitle={searchTerm.trim() ? "No matching favorites" : "Your wishlist is empty"}
            emptyText={searchTerm.trim() ? "Try another search." : "Save dishes with the heart button and they’ll appear here."}
            onEmptyAction={() => navigate("home")}
          />
        )}
        {["about", "services", "contact"].includes(page) && (
          <InformationPage
            page={page}
            onGoMenu={() => navigate("home")}
            onContactSubmit={handleContactSubmit}
            contactSent={contactSent}
          />
        )}
      </main>
    </div>
  );
}

export default App;
