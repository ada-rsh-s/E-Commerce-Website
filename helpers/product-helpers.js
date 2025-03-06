var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcryptjs");
const { response } = require("express");
const { placeOrder } = require("./user-helper");
var objectId = require("mongodb").ObjectId;
module.exports = {
  doAdminLogin: (adminData) => {
    return new Promise(async (resolve, reject) => {
      let admin = await db
        .get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne({ email: adminData.email });
      if (admin) {
        bcrypt.compare(adminData.pass, admin.pass).then((status) => {
          if (status) {
            response.admin = admin;
            response.status = true;
            resolve(response);
          } else {
            resolve({ status: false });
          }
        });
      } else {
        resolve({ status: false });
      }
    });
  },
  register: (admin) => {
    return new Promise(async (resolve, reject) => {
      admin.pass = await bcrypt.hash(admin.pass, 10);
      db.get()
        .collection(collection.ADMIN_COLLECTION)
        .insertOne(admin)
        .then((admin) => {
          resolve(admin);
        });
    });
  },
  adminCheck: () => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne({ Status: "inserted" })
        .then((response) => {
          resolve(response);
        });
    });
  },
  addProduct: (product, callback) => {
    product.Price = parseInt(product.Price);
    db.get()
      .collection("product")
      .insertOne(product)
      .then((data) => {
        callback(data.insertedId);
      });
  },
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray();
      resolve(products);
    });
  },
  deleteProduct: (prodId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .deleteOne({ _id: new objectId(prodId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  getProductDetails: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: new objectId(proId) })
        .then((product) => {
          resolve(product);
        });
    });
  },
  updateProduct: (proId, proDetails) => {
    proDetails.Price = parseInt(proDetails.Price);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: new objectId(proId) },
          {
            $set: {
              Name: proDetails.Name,
              Description: proDetails.Description,
              Price: proDetails.Price,
              Category: proDetails.Category,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  getOrders: () => {
    return new Promise((resolve, reject) => {
      let orders = db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find(placeOrder.orderObject)
        .toArray();
      resolve(orders);
    });
  },
  userData: () => {
    return new Promise(async (resolve, reject) => {
      let users = db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray();
      resolve(users);
    });
  },
  shippedStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: new objectId(orderId) },
          {
            $set: {
              status: "Shipped",
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  OrdersAdmin: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orderItems = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id: new objectId(orderId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      resolve(orderItems);
    });
  },
};
