const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const multer = require('multer');
const path = require('path');
// const mongoConnect = require('./utils/database').mongoConnect;
const User = require('./models/user');
// const sequelize = require('./utils/database');
// const Product = require('./models/product');
// const User = require('./models/user');
// const Cart = require('./models/cart');
// const CartItem = require('./models/cart-item');
// const Order = require('./models/order');
// const OrderItem = require('./models/order-item');

const cors = require("cors");

const corsOptions = {
    origin: 'http://127.0.0.1:5000',
    credentials: true
}

const app = express();
const store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/node-complete',
    collection: 'sessions'
});

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

app.use(cookieParser());

app.use(cors(corsOptions));

app.use(session({ secret: 'my secret key', resave: false, saveUninitialized: false, store: store }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(multer({ storage: fileStorage }).single('image'));

app.use(express.static('public'));

app.use(express.static(path.join(__dirname, '..', 'Angular-App')));

app.use(express.static(path.join(__dirname, 'images')));

const adminRoutes = require('./routes/admin');

const shopRoutes = require('./routes/shop');

const authRoutes = require('./routes/auth');

// app.use((req, res, next) => {
//     User.findById('616138aee1620e92b773856f')
//         .then((user) => {
//             req.session.user = user;
//             next();
//         })
//         .catch((err) => {
//             console.log(err)
//         });
//     //     User.findByPk(1)
//     //         .then((user) => {
//     //             req.session.user = user;
//     //             next();
//     //         })
//     //         .catch((err) => {
//     //             console.log(err)
//     //         });
// });

app.use('/admin', adminRoutes);

app.use('/shop', shopRoutes);

app.use('/auth', authRoutes);

// Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
// User.hasMany(Product);
// User.hasOne(Cart);
// Cart.belongsTo(User);
// Cart.belongsToMany(Product, { through: CartItem });
// Product.belongsToMany(Cart, { through: CartItem });
// Order.belongsTo(User);
// User.hasMany(Order);
// Order.belongsToMany(Product, { through: OrderItem });

// sequelize
//     //.sync({ force: true })
//     .sync()
//     .then((result) => {
//         return User.findByPk(1);
//     })
//     .then((user) => {
//         if (!user) {
//             return User.create({ name: 'Max', email: 'test@test.com' })
//         }
//         return user;
//     })
//     .then((user) => {
//         return user.createCart();
//     })
//     .then((cart) => {
//         app.listen(5000)
//     })
//     .catch((err) => {
//         console.log(err)
//     });

mongoose
    .connect('mongodb://localhost:27017/node-complete')
    .then(() => {
        app.listen(5000);
    }).catch(err => {
        console.log(err);
    })
// mongoConnect(() => {
//     app.listen(5000)
// })