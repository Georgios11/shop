/**
 * @openapi
 * components:
 *   schemas:
 *     Cart:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *           format: ObjectId
 *           nullable: true
 *           description: ID of the user who owns the cart
 *           example: "605c72f2f1e4b8b1d6d9c1a2"
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *           description: Array of items in the cart
 *         totalPrice:
 *           type: number
 *           description: Total price of items in the cart
 *           example: 1999.98
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: Status of the cart
 *           example: "active"
 *         userType:
 *           type: string
 *           enum: [user, guest]
 *           description: Type of user associated with the cart
 *           example: "user"
 */
