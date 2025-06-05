/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "605c72f2f1e4b8b1d6d9c1a2"
 *         name:
 *           type: string
 *           description: Name of the user
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: Email of the user
 *           example: "johndoe@example.com"
 *         password:
 *           type: string
 *           description: User's password
 *           example: "hashedpassword123"
 *         role:
 *           type: string
 *           enum: ["user", "admin"]
 *           description: Role of the user
 *           example: "user"
 *         favorites:
 *           type: array
 *           items:
 *             type: string
 *             format: ObjectId
 *           description: Array of favorite product IDs
 *         orders:
 *           type: array
 *           items:
 *             type: string
 *             format: ObjectId
 *           description: Array of order IDs associated with the user
 *         cart:
 *           $ref: '#/components/schemas/Cart'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-03-21T10:23:45.123Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-03-21T10:23:45.123Z"
 *         phone:
 *           type: string
 *           example: "+1234567890"
 *         is_banned:
 *           type: boolean
 *           description: Whether the user is banned
 *           example: false
 *         image:
 *           type: string
 *           description: Profile image URL
 *           example: "https://example.com/images/user.jpg"
 *         imagePublicId:
 *           type: string
 *           description: Public ID for the user's image on cloud storage
 *           example: "user_image_12345"
 */
