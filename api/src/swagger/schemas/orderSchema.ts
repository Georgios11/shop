/**
 * @openapi
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: ObjectId
 *           description: Unique identifier for the order
 *           example: "605c72f2f1e4b8b1d6d9c1a2"
 *         user:
 *           type: string
 *           format: ObjectId
 *           description: The ID of the user who placed the order, referencing either a User or Guest model
 *           example: "605c72f2f1e4b8b1d6d9c1a3"
 *         userModel:
 *           type: string
 *           enum: ["User", "Guest"]
 *           description: Specifies whether the user is a registered User or a Guest
 *           example: "User"
 *         userType:
 *           type: string
 *           description: Type of user associated with the order
 *           example: "user"
 *         orderItems:
 *           type: array
 *           description: List of items in the order
 *           items:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *                 description: Name of the ordered product
 *                 example: "Smartphone X"
 *               quantity:
 *                 type: integer
 *                 description: Quantity of the product ordered
 *                 example: 2
 *               image:
 *                 type: string
 *                 description: URL of the product image
 *                 example: "https://example.com/images/product.jpg"
 *               price:
 *                 type: number
 *                 format: float
 *                 description: Price of a single unit of the product
 *                 example: 999.99
 *               productId:
 *                 type: string
 *                 format: ObjectId
 *                 description: ID of the product ordered
 *                 example: "605c72f2f1e4b8b1d6d9c1a4"
 *         totalPrice:
 *           type: number
 *           format: float
 *           description: Total price of the order
 *           example: 1999.98
 *         status:
 *           type: string
 *           enum: ["processing", "completed", "shipped", "delivered", "canceled"]
 *           description: Current status of the order
 *           example: "processing"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the order was created
 *           example: "2023-03-21T10:23:45.123Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the order was last updated
 *           example: "2023-03-21T10:23:45.123Z"
 *     # Uncomment these fields if needed
 *     # paymentMethod:
 *     #   type: string
 *     #   description: Method of payment for the order
 *     #   example: "Credit Card"
 *     # paymentResult:
 *     #   type: object
 *     #   description: Details of the payment result
 *     #   properties:
 *     #     id:
 *     #       type: string
 *     #       description: Payment transaction ID
 *     #       example: "pay_123456789"
 *     #     status:
 *     #       type: string
 *     #       description: Status of the payment
 *     #       example: "Completed"
 *     #     update_time:
 *     #       type: string
 *     #       description: Time of the last payment update
 *     #       example: "2023-03-21T10:23:45.123Z"
 *     #     email_address:
 *     #       type: string
 *     #       description: Email address associated with the payment
 *     #       example: "customer@example.com"
 *     # taxPrice:
 *     #   type: number
 *     #   format: float
 *     #   description: Tax amount for the order
 *     #   example: 19.99
 *     # shippingPrice:
 *     #   type: number
 *     #   format: float
 *     #   description: Shipping fee for the order
 *     #   example: 9.99
 */
