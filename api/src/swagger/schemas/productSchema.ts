/**
 * @openapi
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "605c72f2f1e4b8b1d6d9c1a2"
 *         name:
 *           type: string
 *           description: "The name of the product"
 *           example: "Smartphone X"
 *         createdBy:
 *           type: string
 *           format: ObjectId
 *           description: "The ID of the user who created the product"
 *           example: "605c72f2f1e4b8b1d6d9c1a3"
 *         slug:
 *           type: string
 *           description: "URL-friendly version of the product name"
 *           example: "smartphone-x"
 *         description:
 *           type: string
 *           description: "Detailed description of the product"
 *           example: "A high-quality smartphone with a fast processor and excellent camera."
 *         image:
 *           type: string
 *           description: "URL of the product's main image"
 *           example: "https://example.com/images/product.jpg"
 *         imagePublicId:
 *           type: string
 *           description: "Public ID for the product's image on cloud storage"
 *           example: "product_image_12345"
 *         brand:
 *           type: string
 *           description: "The brand of the product"
 *           example: "TechBrand"
 *         category:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: "Name of the category the product belongs to"
 *               example: "electronics"
 *             id:
 *               type: string
 *               format: ObjectId
 *               description: "ID of the category the product belongs to"
 *               example: "605c72f2f1e4b8b1d6d9c1a4"
 *         price:
 *           type: number
 *           description: "Price of the product"
 *           example: 499.99
 *         itemsInStock:
 *           type: integer
 *           description: "Number of items in stock"
 *           example: 100
 *         favoritedBy:
 *           type: array
 *           items:
 *             type: string
 *             format: ObjectId
 *           description: "Array of user IDs who have favorited this product"
 *           example: ["605c72f2f1e4b8b1d6d9c1a5", "605c72f2f1e4b8b1d6d9c1a6"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: "Timestamp of when the product was created"
 *           example: "2023-03-21T10:23:45.123Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: "Timestamp of when the product was last updated"
 *           example: "2023-03-21T10:23:45.123Z"
 */
