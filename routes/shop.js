const express = require('express');
const path = require('path');
const fs = require('fs');
const Order = require('../models/order');
const PDFDocument = require('pdfkit');

const productController = require('../controllers/products')

const router = express.Router();

router.get('/get-products', productController.getProducts);

router.get('/products/:productId', productController.getProduct);

router.post('/cart', productController.addCart);

router.get('/get-cart', productController.getCart);

router.post('/delete-cart', productController.deleteCart);

router.post('/create-order', productController.postOrder);

router.get('/get-order', productController.getOrders);

router.get('/order/:orderId', (req, res, next) => {
    const orderId = req.params.orderId;
    Order
        .findById(orderId)
        .then(order => {
            if (!order) {
                return new Error('No order found.');
            }
            if (order.user.userId.toString() !== req.session.user._id.toString()) {
                return new Error('UnAuthorized User.');
            }
            const invoiceName = `invoice-${orderId}.pdf`;
            const invoicePath = path.join('data', 'invoices', invoiceName);
            const pdfDoc = new PDFDocument();
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${invoiceName}"`);
            pdfDoc.pipe(res);
            pdfDoc.fontSize(22).text('Invoice');
            pdfDoc.text('=======================');
            pdfDoc.text('');
            let totalPrice = 0;
            order.products.forEach(prod => {
                totalPrice += prod.quantity * prod.product.price;
                pdfDoc.fontSize(14).text(`${prod.product.title} - ${prod.quantity} X $${prod.product.price}`);
            });
            pdfDoc.text('');
            pdfDoc.text('=======================');
            pdfDoc.fontSize(20).text(`Total Price: $${totalPrice}.`);
            pdfDoc.end();
            // fs.readFile(invoicePath, (err, data) => {
            //     if (!err) {
            //         res.setHeader('Content-Type', 'application/pdf');
            //         res.setHeader('Content-Disposition', `attachment; filename="${invoiceName}"`);
            //         res.send(data);
            //     }
            // })
        })
        .catch(err => console.log(err));
});

router.get('/images/:imageName', (req, res, next) => {
    res.sendFile(path.resolve(path.resolve(__dirname, `../images/${req.params.imageName}`)));
});

module.exports = router;