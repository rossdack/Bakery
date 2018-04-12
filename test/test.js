var assert = require('assert');
const PackageService = require('../PackageService');
const OrderPack = require('../OrderPack');

const validProductScroll = JSON.parse('[{"packSize":3,"price":6.99},{"packSize":5,"price":8.99}]');
const validProductMuffin = JSON.parse('[{"packSize":2,"price":9.95},{"packSize":5,"price":16.95},{"packSize":8,"price":24.95}]');
const validProductCroissant = JSON.parse('[{"packSize":3,"price":5.95},{"packSize":5,"price":9.95},{"packSize":9,"price":16.99}]');
const invalidProduct = JSON.parse('[{"packSize":"rrrr","price":5.95},{"packSize":5,"price":"zzzz"},{"packSize":9,"price":16.99}]');

packageServiceInstance = new PackageService();


describe('PackageService', function() {

    describe('Invalid data', function() {
        it('should return no results', function () {
            assert.equal(packageServiceInstance.calculatePackages(invalidProduct, 0).getTotalPrice(), 0, 'Expected 0 price');
            assert.equal(packageServiceInstance.calculatePackages(invalidProduct, 0).getItemPacks().length, 0, 'Expected no packs');
        });
    });

    describe('No data', function() {
        it('should return no results', function () {
            assert.equal(packageServiceInstance.calculatePackages([], 0).getTotalPrice(), 0, 'Expected 0 price');
            assert.equal(packageServiceInstance.calculatePackages([], 0).getItemPacks().length, 0, 'Expected no packs');
        });
    });

    describe('Valid data', function() {

        describe('Zero/empty', function() {
            it('should return no/empty results', function () {
                assert.equal(packageServiceInstance.calculatePackages(validProductScroll, 0).getTotalPrice(), 0, 'Expected 0 price');
                assert.equal(packageServiceInstance.calculatePackages(validProductScroll, 0).getItemPacks(), 0, 'Expected no packs');
            });
        });

        describe('Challenge criteria', function() {
            it('should return valid results', function() {
                assert.equal(packageServiceInstance.calculatePackages(validProductScroll, 10).getItemPacks().length, 1, 'Expected 1 pack');
                assert.deepEqual(packageServiceInstance.calculatePackages(validProductScroll, 10).getItemPacks(), [new OrderPack(2, 5, 8.99)]);
                assert.deepEqual(packageServiceInstance.calculatePackages(validProductScroll, 10).getTotalPrice(), 17.98, 'Expected price of 17.98');

                assert.equal(packageServiceInstance.calculatePackages(validProductMuffin, 14).getItemPacks().length, 2, 'Expected 2 packs');
                assert.deepEqual(packageServiceInstance.calculatePackages(validProductMuffin, 14).getItemPacks(), [new OrderPack(1, 8, 24.95), new OrderPack(3, 2, 9.95)]);
                assert.equal(packageServiceInstance.calculatePackages(validProductMuffin, 14).getTotalPrice(), 54.80, 'Expected price of 54.80');

                assert.equal(packageServiceInstance.calculatePackages(validProductCroissant, 13).getItemPacks().length, 2, 'Expected 2 packs');
                assert.deepEqual(packageServiceInstance.calculatePackages(validProductCroissant, 13).getItemPacks(), [new OrderPack(2, 5, 9.95), new OrderPack(1, 3, 5.95)]);
                assert.deepEqual(packageServiceInstance.calculatePackages(validProductCroissant, 13).getTotalPrice().toFixed(2), 25.85, 'Expected price of 25.85'); // NB JS Precision issue
            });
        });

        describe('Addition tests', function() {
            it('should return valid results - many packs', function() {
                // 20 * 5
                assert.deepEqual(packageServiceInstance.calculatePackages(validProductScroll, 100).getItemPacks(), [new OrderPack(20, 5, 8.99)]);
                // 20 * 8.99
                assert.deepEqual(packageServiceInstance.calculatePackages(validProductScroll, 100).getTotalPrice(), 179.80, 'Expected price of 179.80');

                // 33 * 3
                let orderLine =  packageServiceInstance.calculatePackages(validProductScroll, 99);
                assert.equal(orderLine.getItemPacks().length, 1, 'Expected 1 pack');
                assert.equal(orderLine.getItemPacks()[0].quantity, 33, 'Expected Quantity 33');
                assert.equal(orderLine.getItemPacks()[0].unitPrice, 6.99, 'Expected Price 6.99');
                assert.equal(orderLine.getItemPacks()[0].packSize, 3, 'Expected pack size 3');
                assert.deepEqual(orderLine.getTotalPrice().toFixed(2), 230.67, 'Expected price of 179.80');
            });

            it('should fail gracefully', function(){
                // not a known package size
                assert.deepEqual(packageServiceInstance.calculatePackages(validProductScroll, 1).getTotalPrice(), 0, 'Expected price of 0 as individual items are not supported');

                // not a positive integer
                assert.deepEqual(packageServiceInstance.calculatePackages(validProductScroll, -1).getTotalPrice(), 0, 'Expected price of 0 as negative numbers are not supported');

                // not an integer
                assert.deepEqual(packageServiceInstance.calculatePackages(validProductScroll, 'hello').getTotalPrice(), 0, 'Expected price of 0 as item was not an integer');

                // control char
                assert.deepEqual(packageServiceInstance.calculatePackages(validProductScroll, '\n').getTotalPrice(), 0, 'Expected price of 0 aas item was not an integer');
            })
        });
    });

});
