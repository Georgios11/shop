/**
 * @openapi
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the category
 *           example: "605c72f2f1e4b8b1d6d9c1a2"
 *         name:
 *           type: string
 *           description: Name of the category (minimum 4 characters, unique, and lowercase)
 *           example: "electronics"
 *         slug:
 *           type: string
 *           description: URL-friendly slug generated from the category name (unique, lowercase)
 *           example: "electronics"
 *         is_discounted:
 *           type: boolean
 *           description: Indicates if the category is discounted
 *           example: false
 *         createdBy:
 *           type: string
 *           format: ObjectId
 *           description: ID of the user who created this category
 *           example: "605c72f2f1e4b8b1d6d9c1a3"
 *         products:
 *           type: array
 *           items:
 *             type: string
 *             format: ObjectId
 *           description: Array of product IDs associated with this category
 *           example: ["605c72f2f1e4b8b1d6d9c1a4", "605c72f2f1e4b8b1d6d9c1a5"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp indicating when the category was created
 *           example: "2023-03-21T10:23:45.123Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp indicating when the category was last updated
 *           example: "2023-03-21T10:23:45.123Z"
 */
