const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cart: {
        items: [{
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }]
    }
});

userSchema.methods.addToCart = function (product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItem = [...this.cart.items];
    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItem[cartProductIndex].quantity = newQuantity;
    }
    else {
        updatedCartItem.push({ productId: product._id, quantity: newQuantity });
    }
    const updatedCart = { items: updatedCartItem };
    this.cart = updatedCart;
    return this.save();
};

userSchema.methods.removeFromCart = function (productId) {
    const updatedCartItem = this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItem;
    return this.save();
};

userSchema.methods.clearCart = function () {
    this.cart = { items: [] };
    return this.save();
};

module.exports = mongoose.model('User', userSchema);

// const mongodb = require('mongodb');
// const getDb = require('../utils/database').getDb;

// class User {
//     constructor(username, email, cart, id) {
//         this.username = username;
//         this.email = email;
//         this.cart = cart;
//         this._id = id;
//     };

//     save() {
//         const db = getDb();
//         return dbOp = db.collection('users').insertOne(this);
//     };

//     addToCart(product) {
//         const cartProductIndex = this.cart.items.findIndex(cp => {
//             return cp.productId.toString() === product._id.toString();
//         });
//         let newQuantity = 1;
//         const updatedCartItem = [...this.cart.items];
//         if (cartProductIndex >= 0) {
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItem[cartProductIndex].quantity = newQuantity;
//         }
//         else {
//             updatedCartItem.push({ productId: new mongodb.ObjectId(product._id), quantity: newQuantity });
//         }
//         const updatedCart = { items: updatedCartItem };
//         const db = getDb();
//         return db.collection('users').updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: updatedCart } });
//     };

//     getCart() {
//         const db = getDb();
//         const productIds = this.cart.items.map((item) => {
//             return item.productId;
//         })
//         return db.collection('products')
//             .find({ _id: { $in: productIds } })
//             .toArray()
//             .then(products => {
//                 return products.map(p => {
//                     return {
//                         ...p, quantity: this.cart.items.find(i => {
//                             return i.productId.toString() === p._id.toString();
//                         }).quantity
//                     }
//                 })
//             })
//             .catch(err => {
//                 console.log(err);
//             });
//     };

//     deleteItemFromCart(productId) {
//         const updatedCartItem = this.cart.items.filter(item => {
//             return item.productId.toString() !== productId.toString();
//         });
//         const db = getDb();
//         return db.collection('users').updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: { items: updatedCartItem } } });
//     };

//     addOrder() {
//         const db = getDb();
//         return this.getCart().then(products => {
//             const orders = {
//                 items: products,
//                 user: {
//                     _id: new mongodb.ObjectId(this._id),
//                     username: this.username
//                 }
//             };
//             return db.collection('orders')
//                 .insertOne(orders);
//         }).then(() => {
//             this.cart = { items: [] };
//             return db.collection('users')
//                 .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: { items: [] } } });
//         }).catch(err => console.log(err));
//     };

//     getOrders() {
//         const db = getDb();
//         return db.collection('orders')
//             .find({ 'user._id': new mongodb.ObjectId(this._id) })
//             .toArray();
//     }

//     static findById(userId) {
//         const db = getDb();
//         return db.collection('users')
//             .findOne({ _id: new mongodb.ObjectId(userId) })
//             .then(user => {
//                 console.log(user);
//                 return user;
//             })
//             .catch(err => {
//                 console.log(err);
//             });
//     };
// };

// const Sequelize = require('sequelize');
// const sequelize = require('../utils/database');

// const User = sequelize.define('user', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     },
//     name: Sequelize.STRING,
//     email: Sequelize.STRING
// });

// module.exports = User;