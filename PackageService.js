// PackageService
// Calculate the appropriate number of packages the fulfil an order for a given product.
const OrderLine = require('./OrderLine');

class PackageService {

    /**
     * Calculate packages required for order
     *
     * @param packages - permissible packages for given product
     * @param quantity - number of individual items for given product
     * @returns {OrderLine}
     */
     calculatePackages(packages, quantity) {
        packages = packages.sort(_sortPacks);

        let totalPrice = 0;
        let lineItemComplete = false;
        let orderLineObject = new OrderLine();

        if (packages && quantity !== 0) {
            packages.forEach(function (currentPackage, idx) {
                let val = Math.floor(quantity / currentPackage.packSize);
                let remainder = quantity % currentPackage.packSize;

                if (lineItemComplete) return;

                if (remainder === 0) {
                    let linePrice = val * currentPackage.price;
                    totalPrice += linePrice;

                    orderLineObject.addItemPack(val, currentPackage.packSize, currentPackage.price);

                    lineItemComplete = true;
                } else {
                    // Check package remainder size.
                    // Is there an exact match for the remainder?
                    let furtherPackages = packages.slice(idx + 1);

                    // if we take the current package, could the rest of the order be fulfilled using the next package?
                    furtherPackages.forEach(function (fPackage) {

                        if (!lineItemComplete) {
                            let childVal = remainder / fPackage.packSize;

                            if (childVal % 1 === 0) {
                                // Add the 'parent' package as the child package sums to the required item quantity
                                orderLineObject.addItemPack(val, currentPackage.packSize, currentPackage.price);
                                orderLineObject.addItemPack(childVal, fPackage.packSize, fPackage.price);
                                lineItemComplete = true;
                            }

                        }
                    });

                }
            });
        }

        return orderLineObject;
    }

}

/**
 * Sort packages in descending order by pack size
 * @param a
 * @param b
 */
function _sortPacks(a, b) {
    if (a.packSize > b.packSize) {
        return b;
    } else {
        return (b.packSize < a.packSize) ? -1 : 1;
    }
}

module.exports = PackageService;