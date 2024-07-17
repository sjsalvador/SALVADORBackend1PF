const express = require('express');
const Product = require('../models/Product');

const createProductsRouter = (io) => {
  const router = express.Router();

  // GET all products with filters, pagination, and sorting
  router.get('/', async (req, res) => {
    try {
      const { limit, page, sort, query } = req.query;
      let options = {};
      let filter = {};

      if (limit && page) {
        options = {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {},
        };
      }

      if (query) {
        const booleanValue = query.toLowerCase() === 'true' || query.toLowerCase() === 'false';
        filter = booleanValue ? { status: query.toLowerCase() === 'true' } : { category: query };
      }

      let products;
      if (limit && page) {
        products = await Product.paginate(filter, options);
        res.json({
          status: 'success',
          payload: products.docs,
          totalPages: products.totalPages,
          prevPage: products.hasPrevPage ? products.page - 1 : null,
          nextPage: products.hasNextPage ? products.page + 1 : null,
          page: products.page,
          hasPrevPage: products.hasPrevPage,
          hasNextPage: products.hasNextPage,
          prevLink: products.hasPrevPage ? `/api/products?limit=${limit}&page=${products.page - 1}` : null,
          nextLink: products.hasNextPage ? `/api/products?limit=${limit}&page=${products.page + 1}` : null,
        });
      } else {
        products = await Product.find(filter).sort(sort ? { price: sort === 'asc' ? 1 : -1 } : {});
        res.json({
          status: 'success',
          payload: products,
        });
      }
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  });

  return router;
};

module.exports = createProductsRouter;
