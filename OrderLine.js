const OrderPack = require('./OrderPack');
/**
 * A plain object holding orderline data
 */
class OrderLine {
    constructor() {
        this.totalPrice = 0;
        this.packages = [];
    }

    addItemPack(quantity, packSize, unitPrice) {
        this.totalPrice += (unitPrice * quantity);
        this.packages.push(new OrderPack(quantity, packSize, unitPrice));
    }

    getItemPacks() {
        return this.packages;
    }

    getTotalPrice() {
        // prices are only ever * or +
        return this.totalPrice;
    }

}

module.exports = OrderLine;