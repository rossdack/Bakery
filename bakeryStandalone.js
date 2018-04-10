/**
 * Standalone solution for bakery challenge
 */

// reading this file synchronously as it is a known size
const products = require('./products');
const orderFileName = 'datafile';

const MAGENTA = '\x1b[35m';
const WHITE = '\x1b[37m';
const BLUE = '\x1b[34m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';

let fs = require('fs');
let readStream = fs.createReadStream(orderFileName);
let data = '';

// read file as a stream - file could potentially be huge
readStream.on('data', function (input) {
    data = (input.toString().split(/\r\n|\n/).filter(line => {
        return line && line.trim();
    }))
}).on('end', function () {

    data.forEach(function (lineItem) {
        let items = lineItem.split(" ");
        let orderQuantity = items[0];
        let orderProduct = items[1];

        let stockItem = products.find((x) => {
            return x.itemCode === orderProduct;
        });

        if (stockItem) {

            let packageDenominations = new Array();
            stockItem.packs.forEach(function (x) {
                packageDenominations.push(x.packSize);
            });

            console.log(RED, 'Item', stockItem.name, 'found in stock');
            console.log('', 'This comes in pack sizes of ' + packageDenominations + ' and the order is for ' + orderQuantity + ' items' + WHITE);

            // sort package by largest first to meet test requirements (assuming these were defined as integers)
            calculatePackages(stockItem.packs.sort(sortPacks), orderQuantity);
            console.log();

        } else {
            console.log('Could not find %s in stock', orderProduct);
        }

    });
});

/**
 * Sort packages in descending order by pack size
 * @param a
 * @param b
 */
function sortPacks(a, b) {
    if (a.packSize > b.packSize) {
        return b;
    } else {
        return (b.packSize < a.packSize) ? -1 : 1;
    }
}

/**
 * Calculate packages required for order
 * @param packages
 * @param quantity
 */
function calculatePackages(packages, quantity) {
    let totalPrice = 0.0;
    let lineItemComplete = false;

    packages.forEach(function (currentPackage, idx) {
        let val = Math.floor(quantity / currentPackage.packSize);
        let remainder = quantity % currentPackage.packSize;

        if (lineItemComplete) return;

        if (remainder === 0) {
            let linePrice = val * currentPackage.price;
            totalPrice += linePrice;
            console.log(MAGENTA, val + ' x ' + currentPackage.packSize, 'Pack @', currentPackage.price);

            lineItemComplete = true;
        } else {
            // check package remainder size
            // is there an exact match for the remainder?
            let furtherPackages = packages.slice(idx + 1);

            // if we take the current package, could the rest of the order be fulfilled using the next package?
            furtherPackages.forEach(function (fPackage) {

                if (!lineItemComplete) {
                    let childVal = remainder / fPackage.packSize;

                    if (childVal % 1 !== 0) {
                        return;
                    } else {
                        console.log(BLUE, val, 'x ' + currentPackage.packSize + ' Pack @', currentPackage.price + WHITE);
                        console.log(GREEN, childVal, 'x', fPackage.packSize, 'Pack @', fPackage.price);

                        // This package is OK, so also add the parent
                        totalPrice += val * currentPackage.price;
                        totalPrice += childVal * fPackage.price;

                        lineItemComplete = true;
                    }

                }
            });

            return;
        }

    });

    console.log(YELLOW, 'Total Price:', totalPrice.toFixed(2), WHITE);
}
