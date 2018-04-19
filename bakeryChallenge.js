// reading this file synchronously as it is a known size
const products = require('./products');
const PackageService = require('./PackageService');
const defaultOrderFileName = './datafile';

let fs = require('fs');

/**
 * A solution for the bakery challenge, expanded to allow testing
 */
class Bakery {

    constructor() {
        this.packageService = new PackageService();
    }

    readOrderFile() {
        var self = this;

        // could use Yargs module for this
        let args = process.argv.slice(2);
        let fileSpecified = args[0];

        let orderFileName = fileSpecified || defaultOrderFileName;

        fs.stat(orderFileName, function (err, stat) {
            if (err == null) {

                let orderContent = fs.readFileSync(orderFileName);
                orderContent = orderContent ? orderContent.toString() : '';

                // Remove any empty lines
                let orderLines = orderContent.split(/\r\n|\n/).filter(line => {
                    return line && line.trim();
                });

                self.processOrderFile(orderLines);
            } else if (err.code == 'ENOENT') {
                console.log('Cannot find file \'%s\'', orderFileName);

            } else {
                console.log('Unknown error: ', err.code);
            }
        });
    }

    processOrderFile(orders) {
        let self = this;
        let grandTotalItems = 0;
        let grandTotalPrice = 0.0;
        const deliveryPricePerItem = 1.25;

        orders.forEach(function (lineItem) {
            var that = this;
            let items = lineItem.split(" ");
            let orderQuantity = items[0];
            let orderProduct = items[1];

            let itemInStock = products.find((item) => {
                return item.itemCode === orderProduct;
            });

            if (itemInStock) {

                let packageDenominations = new Array();
                itemInStock.packs.forEach(function (thePack) {
                    packageDenominations.push(thePack.packSize);
                });

                // sort package by largest first to meet test requirements (assuming these were defined as integers)
                let orderLine = that.packageService.calculatePackages(itemInStock.packs, orderQuantity);

                grandTotalItems += orderLine.getQuantity();
                grandTotalPrice += orderLine.getTotalPrice();

                console.log(orderQuantity, orderProduct, '$' + orderLine.getTotalPrice().toFixed(2));

                let packs = orderLine.getItemPacks();
                packs.forEach(function (pack) {
                    console.log('       ', pack.getQuantity(), 'x', pack.getPackSize(), '$' + pack.getUnitPrice());
                });

                console.log();

            } else {
                console.log('Could not find %s in stock', orderProduct);
            }

        }, self);

        if (grandTotalItems === 0) {
            console.log('Sorry, the order could not be fulfilled due to a mis-match between order quantity and pack' +
                ' size')
        } else {

            console.log('Total number of individual items in order:', grandTotalItems);
            console.log('Total price of items: $', grandTotalPrice);

            if (grandTotalItems < 10) {
                console.log('Free shipping discount applies:');
            } else {
                let shippingPrice = deliveryPricePerItem * grandTotalItems;
                console.log('+ Shipping Price: $', shippingPrice);
                console.log('Grand Total: $', shippingPrice + grandTotalPrice);
            }
        }
    }

}

var aBakery = new Bakery();
aBakery.readOrderFile();