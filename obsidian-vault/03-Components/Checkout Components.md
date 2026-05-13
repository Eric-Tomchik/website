# Checkout Components

> Files: `src/components/checkout/`

---

## CheckoutContext (`CheckoutContext.tsx`)
React context providing shopping cart state across the app.

### State
- `items[]` — cart items with book ID, title, format, quantity, price
- `isOpen` — drawer visibility
- `total` — calculated cart total

### Methods
- `addItem()` — add book to cart
- `removeItem()` — remove from cart
- `updateQuantity()` — change quantity
- `clearCart()` — empty cart
- `toggleDrawer()` — show/hide drawer

## CheckoutDrawer (`CheckoutDrawer.tsx`)
Slide-out panel showing cart contents.

### Features
- Slides in from right side
- Item list with quantities and prices
- Remove/update item controls
- Discount code input + validate button
- Order summary with subtotal, discount, total
- "Checkout with Stripe" button → creates session
- "Pay with PayPal" button → PayPal checkout
- Empty state: "Your cart is empty" + browse books link

---

## Related
- [[Checkout API]]
- [[Stripe Integration]]
- [[PayPal Integration]]
