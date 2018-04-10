class OrderPack {
    constructor(quantity, packSize, unitPrice) {
        this.quantity = quantity;
        this.packSize = packSize;
        this.unitPrice = unitPrice;
    }

    getQuantity() {
        return this.quantity;
    }

    getPackSize() {
        return this.packSize;
    }

    getUnitPrice() {
        return this.unitPrice;
    }
}

module.exports = OrderPack;