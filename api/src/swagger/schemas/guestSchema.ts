/**
 * @openapi
 * components:
 *   schemas:
 *     Guest:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: ObjectId
 *           description: Unique identifier for the guest
 *           example: "605c72f2f1e4b8b1d6d9c1a2"
 *         role:
 *           type: string
 *           description: Role of the user, default is 'guest'
 *           example: "guest"
 *         cart:
 *           $ref: '#/components/schemas/Cart'
 *           description: Embedded cart document for the guest
 *         orders:
 *           type: array
 *           items:
 *             type: string
 *             format: ObjectId
 *           description: Array of order IDs associated with the guest
 *           example: ["605c72f2f1e4b8b1d6d9c1a4", "605c72f2f1e4b8b1d6d9c1a5"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp indicating when the guest account was created
 *           example: "2023-03-21T10:23:45.123Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp indicating when the guest account was last updated
 *           example: "2023-03-21T10:23:45.123Z"
 */
