const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// GET all carts
router.get('/', async (req, res) => {
  try {
    const carts = await Cart.find().populate('products.product');
    res.json(carts);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Otros endpoints existentes...

// POST new cart
router.post('/', async (req, res) => {
  try {
    const newCart = new Cart({ products: [] });
    await newCart.save();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET cart by ID
router.get('/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate('products.product');
    if (cart) {
      res.json(cart);
    } else {
      res.status(404).send('Cart not found');
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST add product to cart
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    const product = await Product.findById(req.params.pid);
    if (cart && product) {
      const productInCart = cart.products.find(p => p.product.equals(product._id));
      if (productInCart) {
        productInCart.quantity += 1;
      } else {
        cart.products.push({ product: product._id, quantity: 1 });
      }
      await cart.save();
      res.status(201).json(cart);
    } else {
      res.status(404).send('Cart or Product not found');
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// DELETE product from cart
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (cart) {
      cart.products = cart.products.filter(p => !p.product.equals(req.params.pid));
      await cart.save();
      res.status(204).send();
    } else {
      res.status(404).send('Cart not found');
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PUT update cart with an array of products
router.put('/:cid', async (req, res) => {
  try {
    const cart = await Cart.findByIdAndUpdate(req.params.cid, { products: req.body.products }, { new: true }).populate('products.product');
    if (cart) {
      res.json(cart);
    } else {
      res.status(404).send('Cart not found');
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PUT update product quantity in cart
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (cart) {
      const productInCart = cart.products.find(p => p.product.equals(req.params.pid));
      if (productInCart) {
        productInCart.quantity = req.body.quantity;
        await cart.save();
        res.json(cart);
      } else {
        res.status(404).send('Product not found in cart');
      }
    } else {
      res.status(404).send('Cart not found');
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// DELETE all products from cart
router.delete('/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (cart) {
      cart.products = [];
      await cart.save();
      res.status(204).send();
    } else {
      res.status(404).send('Cart not found');
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
