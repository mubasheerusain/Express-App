const Product = require('../models/product');
const User = require('../models/user');
const Cart = require('../models/cart');
const adminData = require('../routes/admin');
const Order = require('../models/order');
const fileHelper = require('../utils/file');

const ITEMS_PER_PAGE = 2;

exports.addProducts = (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    const imageUrl = `${image.filename}`;
    const price = req.body.price;
    const description = req.body.description;
    const product = new Product({ title: title, price: price, imageUrl: imageUrl, description: description, userId: req.session.user });
    product.save().then(() => res.send("Added Product")).catch(err => console.log(err));
};

// exports.addProducts = (req, res, next) => {
//     const title = req.body.title;
//     const price = req.body.price;
//     const description = req.body.description;
//     const imageUrl = req.body.image;
//     req.session.user.createProduct({
//         title: title,
//         imageUrl: imageUrl,
//         price: price,
//         description: description
//     }).then(() => res.send("Added Product")).catch(err => console.log(err));
// };

exports.getProducts = (req, res, next) => {
    const page = +req.query.page;
    let totalProducts = 0;
    Product
        .find()
        .count()
        .then((numProducts) => {
            totalProducts = numProducts;
            return Product.find()
                .populate('userId')
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        })
        .then((products) => {
            res.send({ products: products, currentPage: page, hasNextPage: ITEMS_PER_PAGE * page < totalProducts, hasPreviousPage: page > 1, nextPage: page + 1, previousPage: page - 1, lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE) });
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;
    //Product.findAll({ where: { id: productId } })
    //    .then((products) => res.send(products[0]))
    //    .catch(err => console.log(err));
    Product.findById(productId)
        .then((product) => {
            res.send(product)
        }).catch(err => console.log(err));
};

exports.addCart = (req, res, next) => {
    req.session.user = new User().init(req.session.user);
    const productId = req.body.productId;
    Product.findById(productId).then(product => {
        return req.session.user.addToCart(product);
    }).then(result => {
        res.send("Added Product");
    }).catch(err => console.log(err));
    // let fetchedCart;
    // let newQuantity = 1;
    // req.session.user
    //     .getCart()
    //     .then((cart) => {
    //         fetchedCart = cart;
    //         return cart.getProducts({ where: { id: productId } });
    //     })
    //     .then((products) => {
    //         let product;
    //         if (products.length > 0) {
    //             product = products[0];
    //         }
    //         if (product) {
    //             const oldQuantity = product.cartItem.quantity;
    //             newQuantity = oldQuantity + 1;
    //             return product;
    //         }
    //         return Product.findByPk(productId)
    //     })
    //     .then((product) => {
    //         return fetchedCart.addProduct(product, { through: { quantity: newQuantity } });
    //     })
    //     .then(() => {
    //         res.send("Added Product");
    //     })
    //     .catch((err) => {
    //         console.log(err)
    //     });
};

exports.editProduct = (req, res, next) => {
    const id = req.body.id;
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    console.log(image)
    Product.findById(id)
        .then(product => {
            product.title = title;
            if (image) {
                fileHelper.deleteFile(product.imageUrl.split('http://127.0.0.1:5000/').join(''));
                product.imageUrl = image.path;
            }
            product.price = price;
            product.description = description;
            return product.save();
        })
        .then(() => {
            res.send("Updated Product");
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.deleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId)
        .then(product => {
            if (!product) {
                return new Error('Product not Found.');
            }
            fileHelper.deleteFile(product.imageUrl.split('http://127.0.0.1:5000/').join(''));
            return Product.findByIdAndRemove(productId);
        })
        .then(() => res.send("Deleted Product"))
        .catch((err) => {
            console.log(err);
        });
};

exports.getCart = (req, res, next) => {
    console.log(req.session)
    req.session.user = new User().init(req.session.user);
    req.session.user
        .populate('cart.items.productId')
        .then((user) => {
            res.send(user.cart.items);
        })
        .catch((err) => {
            console.log(err);
        });
    // req.session.user
    //     .getCart()
    //     .then((cart) => {
    //         cart.getProducts()
    //             .then((products) => {
    //                 res.send(products)
    //             })
    //             .catch((err) => console.log(err));
    //     })
    //     .catch((err) => {
    //         console.log(err);
    //     });
};

exports.deleteCart = (req, res, next) => {
    req.session.user = new User().init(req.session.user);
    productId = req.body.productId;
    req.session.user.removeFromCart(productId)
        .then(() => {
            res.send("Deleted the product in Cart.");
        })
        .catch((err) => {
            console.log("From here ", err)
        });
    // req.session.user.getCart()
    //     .then((cart) => {
    //         return cart.getProducts({ where: { id: productId } });
    //     })
    //     .then((products) => {
    //         product = products[0];
    //         return product.cartItem.destroy();
    //     })
    //     .then((result) => {
    //         res.send("Deleted the product in Cart.");
    //     })
    //     .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
    req.session.user = new User().init(req.session.user);
    req.session.user
        .populate('cart.items.productId')
        .then((user) => {
            const products = user.cart.items.map(i => {
                return { quantity: i.quantity, product: { ...i.productId._doc } }
            });
            const order = new Order({
                user: {
                    email: req.session.user.email,
                    userId: req.session.user
                },
                products: products
            });
            return order.save();
        })
        .then(() => {
            return req.session.user.clearCart();
        })
        .then(() => res.send('order added.'))
        .catch((err) => {
            console.log(err);
        });
    //let fetchedCart;
    // req.session.user.getCart()
    //     .then((cart) => {
    //         fetchedCart = cart;
    //         return cart.getProducts();
    //     })
    //     .then((products) => {
    //         return req.session.user.createOrder()
    //             .then((order) => {
    //                 return order.addProducts(products.map((product) => {
    //                     product.orderItem = { quantity: product.cartItem.quantity };
    //                     return product;
    //                 }))
    //             })
    //             .catch((err) => console.log(err));
    //     })
    //     .then((result) => {
    //         fetchedCart.setProducts(null);
    //     })
    //     .then(() => res.send('order added.'))
    //     .catch((err) => {
    //         console.log(err)
    //     });
};

exports.getOrders = (req, res, next) => {
    Order.find({ 'user.userId': req.session.user._id })
        .then(orders => res.send(orders))
        .catch((err) => console.log(err));
    // req.session.user.getOrders({ include: ['products'] })
    //     .then(orders => res.send(orders))
    //     .catch((err) => console.log(err));
};