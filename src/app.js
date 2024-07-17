const express = require('express');
const { create } = require('express-handlebars');
const handlebars = require('handlebars');
const layouts = require('handlebars-layouts');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./db');
const Product = require('./models/Product');
const createProductsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/cart.router');

const app = express();
const port = 8080;
const server = http.createServer(app);
const io = socketIo(server);

// Conectar a MongoDB
connectDB();

// Configurar Handlebars y registrar los helpers
handlebars.registerHelper(layouts(handlebars));
const hbs = create({
  extname: '.handlebars',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/products', createProductsRouter(io));
app.use('/api/carts', cartsRouter);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

// Ruta para home.handlebars
app.get('/home', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'asc' } = req.query;
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { price: sort === 'asc' ? 1 : -1 },
    };
    const products = await Product.paginate({}, options);
    res.render('home', {
      products: products.docs,
      totalPages: products.totalPages,
      prevPage: products.hasPrevPage ? products.page - 1 : null,
      nextPage: products.hasNextPage ? products.page + 1 : null,
      page: products.page,
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
    });
  } catch (error) {
    res.status(500).send('Error fetching products');
  }
});

// Ruta para realTimeProducts.handlebars
app.get('/realtimeproducts', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('realTimeProducts', { products });
  } catch (error) {
    res.status(500).send('Error fetching products');
  }
});

// Configurar socket.io
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

module.exports = { app, io };
