/**
 * @openapi
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *           format: ObjectId
 *           description: ID of the product in the cart
 *           example: "605c72f2f1e4b8b1d6d9c1a2"
 *         productName:
 *           type: string
 *           description: Name of the product
 *           example: "Laptop"
 *         quantity:
 *           type: integer
 *           description: Quantity of the product in the cart
 *           example: 2
 *         price:
 *           type: number
 *           format: float
 *           description: Price of a single unit of the product
 *           example: 999.99
 *         image:
 *           type: string
 *           description: URL of the product image
 *           example: "https://example.com/images/product.jpg"
 */
