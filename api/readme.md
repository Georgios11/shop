# Todos for Server - Start from the bottom, then move to testing

## Modify deleteCategory controller

```javascript
export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  await findWithId(id, 'category');

  const deletedCategory = await Category.findByIdAndDelete(id);

  await Product.deleteMany({ 'category.name': deletedCategory.name });

  const categories = await Category.find();
  await setCacheKey('categories', categories);
  const products = await Product.find();
  await setCacheKey('products', products);

  return successResponse(res, StatusCodes.OK, 'Category deleted', {
    deletedCategory,
    categories,
    products,
  });
};
```

## Modify updateProduct controller response to return products

```javascript
const products = await Product.find();
await setCacheKey('products', products);
return successResponse(
  res,
  StatusCodes.OK,
  `Product with id ${productId} updated`,
  { updatedProduct, products }
);
```

## Modify removeCartItem

```javascript
export const removeCartItem = async (req, res) => {
  const currentUser = await getCacheKey('currentUser');
  const { id } = req.params;
  let product = await findWithId(id, 'product');

  if (!currentUser.cart)
    throw new BadRequestError('Your do not have an active cart');

  let userCart = currentUser.cart.items;
  const productExists = userCart.find((item) => item.productId === id);

  if (!productExists)
    throw new BadRequestError(
      `Product with id ${id} does not exist in your cart`
    );

  // Case 1: Single item type in cart with quantity 1
  if (userCart.length === 1 && productExists.quantity === 1) {
    currentUser.cart = null;
    product.itemsInStock++;

    await setCacheKey('currentUser', currentUser);
    product = await Product.findByIdAndUpdate(
      id,
      { itemsInStock: product.itemsInStock },
      { new: true }
    );
    const products = await Product.find();
    await setCacheKey('products', products);
    await updateCachePut('users', currentUser);

    return successResponse(
      res,
      StatusCodes.OK,
      `Product with id ${id} removed from your cart. Your cart has been deactivated`,
      { currentUser, product, products }
    );
  }

  // Case 2: Single item type in cart with quantity > 1
  if (userCart.length === 1 && productExists.quantity > 1) {
    userCart[0].quantity--;
    product.itemsInStock++;

    product = await Product.findByIdAndUpdate(
      id,
      { itemsInStock: product.itemsInStock },
      { new: true }
    );
    const products = await Product.find();
    await setCacheKey('products', products);

    currentUser.cart.items = userCart;
    currentUser.cart.totalPrice = calculateTotalPrice(userCart);

    await setCacheKey('currentUser', currentUser);
    await updateCachePut('users', currentUser);

    return successResponse(res, StatusCodes.OK, 'Item removed from your cart', {
      currentUser,
      product,
      products,
    });
  }

  // Case 3: Multiple item types in cart, removing last quantity of one type
  if (userCart.length > 1 && productExists.quantity === 1) {
    userCart = userCart.filter((item) => item.productId !== id);
    product.itemsInStock++;

    product = await Product.findByIdAndUpdate(
      id,
      { itemsInStock: product.itemsInStock },
      { new: true }
    );
    const products = await Product.find();
    await setCacheKey('products', products);

    currentUser.cart.items = userCart;
    currentUser.cart.totalPrice = calculateTotalPrice(userCart);

    await setCacheKey('currentUser', currentUser);
    await updateCachePut('users', currentUser);

    return successResponse(
      res,
      StatusCodes.OK,
      'Product removed from your cart',
      { currentUser, product, products }
    );
  }

  // Case 4: Multiple item types in cart, reducing quantity of one type
  if (userCart.length > 1 && productExists.quantity > 1) {
    currentUser.cart.items = userCart.map((item) =>
      item.productId === id ? { ...item, quantity: item.quantity - 1 } : item
    );
    product.itemsInStock++;

    product = await Product.findByIdAndUpdate(
      id,
      { itemsInStock: product.itemsInStock },
      { new: true }
    );
    const products = await Product.find();
    await setCacheKey('products', products);

    currentUser.cart.totalPrice = calculateTotalPrice(currentUser.cart.items);

    await setCacheKey('currentUser', currentUser);
    await updateCachePut('users', currentUser);

    return successResponse(
      res,
      StatusCodes.OK,
      'Product removed from your cart',
      { currentUser, product, products }
    );
  }
};
```

## Modify cartUtils addItem

```javascript
export const addItem = async (currentUser, productId) => {
  const product = await findWithId(productId, 'product');
  checkStock(product, currentUser);

  let cartItems;

  // Initialize cart if it doesn't exist
  if (!currentUser.cart) {
    currentUser.cart = {
      user: currentUser._id,
      items: [],
      totalPrice: 0.0,
      status: CART_STATUS.ACTIVE,
    };
    cartItems = currentUser.cart.items;
  } else {
    cartItems = currentUser.cart.items;
  }

  // Check if the cart already has items
  if (cartItems?.length > 0) {
    const productExistsInCart = cartItems.find(
      (item) => item.productId === productId
    );

    if (productExistsInCart) {
      // If product exists, update its quantity
      productExistsInCart.quantity += 1;
      product.itemsInStock--;

      // Update both cache and database
      await Promise.all([
        updateCachePut('products', product),
        Product.findByIdAndUpdate(productId, {
          itemsInStock: product.itemsInStock,
        }),
      ]);
    } else {
      // If product does not exist, add it to the cart
      cartItems.push({
        productId,
        productName: product.name,
        quantity: 1,
        image: product.image,
        price: Number(product.price),
      });
      product.itemsInStock--;

      // Update both cache and database
      await Promise.all([
        updateCachePut('products', product),
        Product.findByIdAndUpdate(productId, {
          itemsInStock: product.itemsInStock,
        }),
      ]);
    }
  } else {
    // If cart is empty, add the product to the cart
    cartItems.push({
      productId,
      productName: product.name,
      quantity: 1,
      price: Number(product.price),
      image: product.image,
    });
    product.itemsInStock--;

    // Update both cache and database
    await Promise.all([
      updateCachePut('products', product),
      Product.findByIdAndUpdate(productId, {
        itemsInStock: product.itemsInStock,
      }),
    ]);
  }

  // Update the current user's cart
  currentUser.cart.items = cartItems;
  currentUser.cart.totalPrice = calculateTotalPrice(cartItems).toFixed(2);

  await Promise.all([
    setCacheKey('currentUser', currentUser),
    updateCachePut('users', currentUser),
  ]);

  const products = await Product.find();
  await setCacheKey('products', products);

  return { product, products };
};
```

## Modify deleteUserAccount controller to return all users

```javascript
const users = await User.find();
await setCacheKey('users', users);
return successResponse(res, StatusCodes.OK, 'User account deleted', {
  deletedAccount,
  users,
});
```

## Modify deleteProduct controller to return products and categories

```javascript
const products = await Product.find();
await setCacheKey('products', products);
const categories = await Category.find();
await setCacheKey('categories', categories);
return successResponse(res, StatusCodes.OK, `Product with id ${id} deleted`, {
  products,
  categories,
});
```

## Modify changeUserStatus controller to return all users

```javascript
		const users = await User.find();
		await setCacheKey("users", users);
		return successResponse(
			res,
			StatusCodes.OK,
			`User with id ${id} promoted to admin`,
			{ updatedUser, users },
		);
	}
	if (user.role === "admin") {
		const updatedUser = await User.findByIdAndUpdate(
			id,
			{ role: "user" },
			{ new: true },
		);
		const users = await User.find();
		await setCacheKey("users", users);
		return successResponse(
			res,
			StatusCodes.OK,
			`Admin with id ${id} demoted to simple user`,
			{ updatedUser, users },
		);
	}
```

## Modify banUser controller to return users

```javascript
return successResponse(
  res,
  StatusCodes.OK,
  `User with id ${id} has been banned`,
  { bannedUser, users }
);
```

## Modify unbanUser controller to return users

```javascript
const users = await User.find();
await setCacheKey('users', users);
return successResponse(
  res,
  StatusCodes.OK,
  `User with id ${id} has been unbanned`,
  { unbannedUser, users }
);
```

## Modify cartUtils and addItemToCart controller to return products

```javascript
await updateCachePut('users', currentUser);
const products = await Product.find();
await setCacheKey('products', products);
return { product, products };
```

```javascript
const { product, products } = await addItem(currentUser, productId);

// Send a success response with product and cart details
return successResponse(res, StatusCodes.OK, 'Product added to cart', {
  product,
  currentUser,
  products,
});
```

## Modify updateUserUtils updateUser controller to return all users

## Modify Email data and activation response to include all users

```javascript
const emailData = {
  email: req.body.email,
  subject: 'Account Activation Email',
  html: `
            <h2>Hello ${req.body.name}</h2>
            <p>Please click here to <a href="${dev.app.clientUrl}/activate/${token}">activate your account</a></p>
        `,
};
```

    const existingUser = await User.findOne({ email: decoded.email });
    	if (existingUser)
    		throw new BadRequestError(`Acount ${decoded.email} already exists`);

    	// Create new user
    	const newUser = await User.create(decoded);
    	if (!newUser) throw new BadRequestError("Account not created");

    	// Update cache
    	const users = await User.find().sort({ createdAt: -1 });
    	await setCacheKey("users", users);

    	return successResponse(
    		res,
    		StatusCodes.OK,
    		`Account ${decoded.email} verified , please login`,
    		{users},
    	);

```javascript

```

## Modify productUtils - userController

productUtils -> addProductToFavorites, removeProductFromFavorites
userController -> favoriteProduct, removeFavorite
to return all products so in useAddFavorite onSuccess setQueryData...products

## Modify createProduct controller to unshift new product

```javascript
await createProductUtils(productData);

// Get all products sorted by newest first
const products = await Product.find()
  .sort({ createdAt: -1 }) // -1 for descending order (newest first)
  .exec();

await setCacheKey('products', products);
```

## Modify validateUpdateUserInput in validationMiddleware

```javascript
export const validateUpdateUserInput = withValidationErrors([
  body('oldPassword')
    .if(body('newPassword').exists({ checkFalsy: true }))
    .notEmpty()
    .withMessage('Old password is required when setting new password'),
  body('newPassword')
    .if(body('newPassword').exists({ checkFalsy: true }))
    .trim()
    .isLength({ min: 6, max: 15 })
    .withMessage('New password must be between 6-15 chars long'),
  body('image').custom((value, { req }) => {
    if (!req.file) return true; // Skip if no file
    if (req.file.size > 2000000) {
      throw new BadRequestError('Image file is larger than 2 MB');
    }
    return true;
  }),
  body('phone')
    .if(body('phone').exists({ checkFalsy: true }))
    .trim()
    .custom((value) => {
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(value)) {
        throw new Error('Invalid phone number');
      }
      return true;
    })
    .withMessage('Invalid phone number'),
]);
```

## Modify updateUser controller and updateUserUtils

- updateUserUtils

```javascript
async function updateUserUtils(image, userData, user) {
  if (image) {
    //upload user image to cloudinary
    const response = await cloudinary.uploader.upload(image.path, {
      width: 300,
      crop: 'scale',
    });

    //delete image from local machine before saving updates to database
    await fs.unlink(image.path);
    userData.image = response.secure_url;
    userData.imagePublicId = response.public_id;
  }
  const { oldPassword, newPassword, confirmNewPassword } = userData;
  let isPasswordMatched;
  if (oldPassword) {
    isPasswordMatched = await comparePassword(oldPassword, user.password);

    if (!isPasswordMatched)
      throw new UnauthenticatedError('Incorrect old password ');

    if (isNewPasswordGood)
      throw new BadRequestError(
        'New password cannot be the same as old password'
      );

    if (newPassword !== confirmNewPassword)
      throw new BadRequestError('Please confirm new password');

    const hashedPassword = await encryptPassword(newPassword);

    userData.password = hashedPassword;

    delete userData.oldPassword;
    delete userData.newPassword;
    delete userData.confirmNewPassword;
  }
  //old instance BEFORE UPDATE
  const updatedUser = await User.findByIdAndUpdate(user._id, userData, {
    new: true,
  }).select('-password');
  // Use object destructuring to create a new object without the password

  //remove OLD IMAGE from cloudinary IF THERE IS ONE
  if (image && user.imagePublicId)
    await cloudinary.uploader.destroy(user.imagePublicId);
  const users = await User.find();
  await setCacheKey('users', users);
  await setCacheKey('currentUser', updatedUser);
  return { isPasswordMatched, updatedUser };
}
```

- updateUser controller

```javascript
export const updateUser = async (req, res) => {
  const id = req.user.userId;

  // Extract updated user data from request body
  const updatedUserData = { ...req.body };
  const image = req.file;

  // Find the user by ID
  let user = await findWithId(id, 'user');

  // Update user information using utility function
  const { isPasswordMatched, updatedUser } = await updateUserUtils(
    image,
    updatedUserData,
    user
  );
  if (isPasswordMatched) {
    res.cookie(req.user.userId, 'logout', {
      httpOnly: true,
      expires: new Date(Date.now()),
    });

    // Delete the user from the request object
    delete req.user;
    await redisClient.del('currentUser');
    return successResponse(
      res,
      StatusCodes.OK,
      'Since you have changed your password, you will be logged out'
    );
  }
  // Send success response indicating the user has been updated
  return successResponse(res, StatusCodes.OK, `Profile updated successfully`, {
    updatedUser,
  });
};
```

## Modify productUtils and favoriteProduct controller

- productUtils -> addProductToFavorites

```javascript
const products = await Product.find();
await setCacheKey('products', products);
const users = await User.find();
await setCacheKey('users', users);
return { updatedProduct, updatedUser };
```

- userController -> favoriteProduct
  Remove

```javascript
await updateCachePut('users', updatedUser);
await updateCachePut('products', updatedProduct);
```

## Major Refactor -> Remove Guest functionality

- Refactor controllers
- Move controllers
- Remove guestOrUserRouter
- Refactor utils (addItem, removeItem, updateCache)
- Delete Guest model

## Modify addItemToCart controller to include current user

```javascript
return successResponse(res, StatusCodes.OK, 'Product added to cart', {
  product,
  currentUser,
});
```

## Modify removeCartItem controller to include current user

## Modify email in forgetPassword request

- we are using open router

```javascript
const emailData = {
  email,
  subject: 'Reset Password',
  html: `
            <h2>Hello ${user.name}</h2>
            <p>Please click here to <a href="${dev.app.clientUrl}/reset-password/${token}" target="_blank">reset your password</a></p>
        `,
};
```

```javascript
// Update the user's password and get all users
const [updatedUser, allUsers] = await Promise.all([
  User.findOneAndUpdate(
    { email },
    { $set: { password: hashedPassword } },
    { new: true, runValidators: true }
  ),
  User.find(),
]);

if (!updatedUser) throw new BadRequestError('Password update failed');

// Update the cache with the new user information
await setCacheKey('users', allUsers);
```

## Update adminController -> cannot delete admin account

```javascript
if (user.role === 'admin')
  throw new UnauthorizedError(
    'You cannot delete an administrator account. Please contact your manager'
  );
```

## Remove backend pagination

## Fix the token in verification email

```javascript
const emailData = {
  email,
  subject: 'Account Activation Email',
  html: `
            <h2>Hello ${req.body.name}</h2>
            <p>Please click here to <a href="${dev.app.clientUrl}/activate/${token}" target="_blank">activate your account</a></p>
        `,
};
```

## Update Products and Users data

- products.js

```javascript
import slugify from 'slugify';

const products = [
  {
    name: 'Airpods Wireless Bluetooth Headphones',
    image: 'https://images.unsplash.com/photo-1610438235354-a6ae5528385c',
    description:
      'Airpods Wireless Bluetooth Headphones offer seamless connectivity with Bluetooth technology. Enjoy immersive sound quality with AAC audio. Perfect for calls and music, they feature a built-in microphone for convenience. Lightweight and portable, these headphones are ideal for work, travel, or workouts, delivering premium sound and comfort wherever you go.',
    brand: 'Apple',
    category: { name: 'Electronics', id: null },
    price: 89.99,
    itemsInStock: 0,
    rating: 4.5,
    numReviews: 12,
  },
  {
    name: 'iPhone 12 Pro 256GB',
    image:
      'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&q=80&w=400',
    description:
      'The iPhone 12 Pro features a transformative triple-camera system for stunning photography. Its durable build ensures long-lasting use, while the powerful processor delivers exceptional performance. With a sleek design and advanced features, this smartphone is perfect for professionals and tech enthusiasts seeking cutting-edge innovation and superior functionality in one device.',
    brand: 'Apple',
    category: { name: 'Electronics', id: null },
    price: 999.99,
    itemsInStock: 7,
    rating: 4.8,
    numReviews: 15,
  },
  {
    name: 'Samsung Galaxy S21 Ultra',
    image:
      'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?auto=format&q=80&w=400',
    description:
      'The Samsung Galaxy S21 Ultra boasts a best-in-class camera system for professional-grade photos and videos. Its stunning display ensures vibrant visuals, while the long-lasting battery keeps you powered all day. With 5G connectivity, this smartphone offers superfast speeds, making it perfect for multitasking, streaming, gaming, and staying connected anytime.',
    brand: 'Samsung',
    category: { name: 'Electronics', id: null },
    price: 1199.99,
    itemsInStock: 5,
    rating: 4.7,
    numReviews: 22,
  },
  {
    name: 'Sony WH-1000XM4 Wireless Noise-Canceling Headphones',
    image:
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&q=80&w=400',
    description:
      'Sony WH-1000XM4 headphones deliver industry-leading noise cancellation with advanced Dual Noise Sensor technology. Enjoy next-level audio quality with Edge-AI technology co-developed with Sony Music Studios Tokyo. These wireless headphones are perfect for music lovers and professionals seeking immersive sound, comfort, and exceptional performance during commutes, work sessions, or relaxation.',
    brand: 'Sony',
    category: { name: 'Electronics', id: null },
    price: 349.99,
    itemsInStock: 8,
    rating: 4.6,
    numReviews: 30,
  },
  {
    name: 'Apple MacBook Pro 13-inch',
    image:
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&q=80&w=400',
    description:
      'The Apple MacBook Pro features the revolutionary M1 chip for unparalleled performance. Its sleek design houses an advanced CPU that delivers faster workflows and smooth multitasking. Ideal for professionals and creatives, this laptop combines power, portability, and cutting-edge technology to handle demanding tasks effortlessly while offering an exceptional user experience.',
    brand: 'Apple',
    category: { name: 'Electronics', id: null },
    price: 1299.99,
    itemsInStock: 6,
    rating: 4.9,
    numReviews: 40,
  },
  {
    name: 'Dell XPS 13',
    image:
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&q=80&w=400',
    description:
      'The Dell XPS 13 offers a stunning InfinityEdge display for immersive visuals. Powered by the latest Intel Core processors, it delivers exceptional performance in a lightweight design. Perfect for productivity on the go, this ultra-thin laptop combines style and functionality to meet the needs of professionals and students alike.',
    brand: 'Dell',
    category: { name: 'Electronics', id: null },
    price: 999.99,
    itemsInStock: 10,
    rating: 4.7,
    numReviews: 35,
  },
  {
    name: 'HP Envy 13',
    image:
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&q=80&w=400',
    description:
      'The HP Envy 13 combines sleek design with powerful performance to enhance productivity anywhere. Its bright display ensures clear visuals, while long battery life keeps you going throughout the day. Ideal for professionals and students, this stylish laptop is perfect for multitasking, entertainment, or working on creative projects effortlessly.',
    brand: 'HP',
    category: { name: 'Electronics', id: null },
    price: 849.99,
    itemsInStock: 9,
    rating: 4.5,
    numReviews: 18,
  },
  {
    name: 'Amazon Echo Dot 4th Gen',
    image:
      'https://images.unsplash.com/photo-1512446816042-444d641267d4?auto=format&q=80&w=400',
    description:
      "The Amazon Echo Dot 4th Gen is a compact smart speaker with Alexa built-in. Its sleek design delivers crisp vocals and balanced bass for rich sound quality. Perfect for controlling smart home devices, playing music, or setting reminders, it's a versatile addition to any modern, connected living space.",
    brand: 'Amazon',
    category: { name: 'Electronics', id: null },
    price: 49.99,
    itemsInStock: 20,
    rating: 4.4,
    numReviews: 25,
  },
  {
    name: 'Fitbit Charge 4',
    image:
      'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&q=80&w=400',
    description:
      "The Fitbit Charge 4 is a fitness tracker with built-in GPS for precise pace and distance tracking during workouts. Active Zone Minutes help you reach fitness goals, while heart rate monitoring keeps you informed. Lightweight and durable, it's perfect for running, hiking, or everyday health tracking with ease.",
    brand: 'Fitbit',
    category: { name: 'Electronics', id: null },
    price: 149.99,
    itemsInStock: 15,
    rating: 4.3,
    numReviews: 50,
  },
  {
    name: 'GoPro HERO9 Black',
    image:
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&q=80&w=400',
    description:
      "The GoPro HERO9 Black captures stunning 5K video and detailed 20MP photos. With a new front display and rear touch screen, framing shots is easier than ever. Rugged and waterproof, it's perfect for adventurers seeking professional-quality footage and intuitive controls in a compact, portable action camera for any environment.",
    brand: 'GoPro',
    category: { name: 'Electronics', id: null },
    price: 399.99,
    itemsInStock: 12,
    rating: 4.6,
    numReviews: 60,
  },
  {
    name: 'Reebok Club C 85',
    image:
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&q=80&w=400',
    description:
      "The Reebok Club C 85 combines timeless style with premium comfort, making it a versatile choice for any occasion. Its durable leather upper and cushioned sole provide all-day support. Perfect for casual outings or athletic wear, this classic sneaker is a must-have addition to anyone's footwear collection.",
    brand: 'Reebok',
    category: { name: 'Footwear', id: null },
    price: 75.0,
    itemsInStock: 25,
    rating: 4.5,
    numReviews: 30,
  },
  {
    name: 'Nike Air Max 270',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&q=80&w=400',
    description:
      'The Nike Air Max 270 delivers unmatched comfort and style with its signature large Air unit for maximum cushioning. Designed for all-day wear, it features a breathable mesh upper and sleek design. Perfect for casual outings or light workouts, this sneaker combines innovation with iconic Nike aesthetics.',
    brand: 'Nike',
    category: { name: 'Footwear', id: null },
    price: 150.0,
    itemsInStock: 20,
    rating: 4.7,
    numReviews: 45,
  },
  {
    name: 'Adidas Ultraboost 21',
    image:
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&q=80&w=400',
    description:
      'The Adidas Ultraboost 21 offers exceptional energy return and unparalleled comfort, making it ideal for long runs or everyday wear. Its Primeknit upper ensures a snug fit, while the Boost midsole provides responsive cushioning. Sleek and stylish, this shoe is perfect for athletes and casual users alike.',
    brand: 'Adidas',
    category: { name: 'Footwear', id: null },
    price: 180.0,
    itemsInStock: 15,
    rating: 4.8,
    numReviews: 50,
  },
  {
    name: 'Puma Suede Classic',
    image:
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&q=80&w=400',
    description:
      'The Puma Suede Classic is a true icon in the sneaker world, combining vintage style with modern comfort. Its soft suede upper and cushioned sole make it perfect for everyday wear. Whether dressing up or down, this timeless sneaker adds effortless style to any outfit.',
    brand: 'Puma',
    category: { name: 'Footwear', id: null },
    price: 65.0,
    itemsInStock: 30,
    rating: 4.6,
    numReviews: 25,
  },
  {
    name: 'New Balance 990v5',
    image:
      'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&q=80&w=400',
    description:
      'The New Balance 990v5 blends performance and style effortlessly, crafted in the USA with premium materials. Its supportive midsole and breathable upper ensure all-day comfort, making it perfect for athletes or casual wearers seeking durability and sophistication in one shoe. A go-to choice for trendsetters everywhere.',
    brand: 'New Balance',
    category: { name: 'Footwear', id: null },
    price: 175.0,
    itemsInStock: 18,
    rating: 4.7,
    numReviews: 40,
  },
  {
    name: 'Converse Chuck Taylor All Star',
    image:
      'https://images.unsplash.com/photo-1494496195158-c3becb4f2475?auto=format&q=80&w=400',
    description:
      "The Converse Chuck Taylor All Star is an enduring classic known for its versatile design and iconic status. Featuring a durable canvas upper and flexible rubber sole, it's perfect for casual wear or creative expression. This timeless sneaker remains a staple in fashion and culture worldwide.",
    brand: 'Converse',
    category: { name: 'Footwear', id: null },
    price: 55.0,
    itemsInStock: 40,
    rating: 4.5,
    numReviews: 60,
  },
  {
    name: 'Vans Old Skool',
    image:
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&q=80&w=400',
    description:
      'The Vans Old Skool brings retro vibes with its durable construction and timeless design. Featuring a sturdy canvas and suede upper, padded collar, and signature waffle outsole, it is perfect for skateboarding or casual wear. This iconic sneaker effortlessly combines functionality with classic streetwear style.',
    brand: 'Vans',
    category: { name: 'Footwear', id: null },
    price: 60.0,
    itemsInStock: 35,
    rating: 4.6,
    numReviews: 55,
  },
  {
    name: 'Asics Gel-Kayano 27',
    image:
      'https://images.unsplash.com/photo-1606890658317-7d14490b76fd?auto=format&q=80&w=400',
    description:
      'The Asics Gel-Kayano 27 is engineered for stability and comfort, making it ideal for runners seeking support during long runs. Featuring advanced cushioning and a responsive midsole, it ensures a smooth stride. Perfect for overpronators, this shoe combines durability, performance, and style to help you achieve your fitness goals.',
    brand: 'Asics',
    category: { name: 'Footwear', id: null },
    price: 160.0,
    itemsInStock: 12,
    rating: 4.7,
    numReviews: 35,
  },
  {
    name: 'Brooks Ghost 13',
    image:
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&q=80&w=400',
    description:
      'The Brooks Ghost 13 delivers a smooth and balanced ride with its plush cushioning and responsive design. Perfect for neutral runners, it features a breathable mesh upper and durable outsole for long-lasting comfort. Whether training or racing, this shoe offers reliable performance and support for all your running needs.',
    brand: 'Brooks',
    category: { name: 'Footwear', id: null },
    price: 130.0,
    itemsInStock: 22,
    rating: 4.6,
    numReviews: 42,
  },
  {
    name: 'Saucony Triumph 18',
    image:
      'https://images.unsplash.com/photo-1604163546180-039a1781c0d2?auto=format&q=80&w=400',
    description:
      'The Saucony Triumph 18 provides luxurious cushioning and a responsive ride, making it an excellent choice for long-distance runs. Its lightweight design and breathable upper ensure maximum comfort, while the durable outsole offers reliable traction. Perfect for runners seeking premium performance and comfort in every stride, mile after mile.',
    brand: 'Saucony',
    category: { name: 'Footwear', id: null },
    price: 150.0,
    itemsInStock: 17,
    rating: 4.8,
    numReviews: 38,
  },
  {
    name: 'Smart Robot Vacuum Cleaner',
    image:
      'https://images.unsplash.com/photo-1552975084-6e027cd345c2?auto=format&q=80&w=400',
    description:
      'This intelligent robot vacuum features advanced mapping technology and powerful suction for effortless cleaning. With WiFi connectivity and app control, you can schedule cleaning sessions from anywhere. Perfect for busy households seeking automated cleaning solutions with smart home integration.',
    brand: 'iRobot',
    category: { name: 'Household', id: null },
    price: 299.99,
    itemsInStock: 15,
    rating: 4.6,
    numReviews: 45,
  },
  {
    name: 'Air Purifier with HEPA Filter',
    image:
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&q=80&w=400',
    description:
      'Advanced air purifier with true HEPA filtration, removing 99.97% of airborne particles. Features air quality monitoring, quiet operation, and coverage for large rooms. Ideal for allergies, pets, and maintaining clean indoor air quality.',
    brand: 'Dyson',
    category: { name: 'Household', id: null },
    price: 249.99,
    itemsInStock: 20,
    rating: 4.7,
    numReviews: 38,
  },
  {
    name: 'Smart Coffee Maker',
    image:
      'https://images.unsplash.com/photo-1520970014086-2208d157c9e2?auto=format&q=80&w=400',
    description:
      'Programmable coffee maker with WiFi connectivity and voice control compatibility. Features customizable brewing strength, temperature control, and scheduling options. Perfect for coffee enthusiasts who want their morning brew ready when they wake up.',
    brand: 'Philips',
    category: { name: 'Household', id: null },
    price: 159.99,
    itemsInStock: 25,
    rating: 4.5,
    numReviews: 32,
  },
  {
    name: 'Cordless Stick Vacuum',
    image:
      'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&q=80&w=400',
    description:
      'Powerful cordless vacuum with up to 60 minutes runtime. Features multiple attachments, LED lights, and efficient filtration system. Perfect for quick cleanups and whole-house cleaning with hassle-free maneuverability.',
    brand: 'Shark',
    category: { name: 'Household', id: null },
    price: 199.99,
    itemsInStock: 18,
    rating: 4.6,
    numReviews: 55,
  },
  {
    name: 'Smart Food Processor',
    image:
      'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&q=80&w=400',
    description:
      'Versatile food processor with multiple attachments for chopping, slicing, and dicing. Features touch controls, multiple speed settings, and dishwasher-safe parts. Essential for meal prep and cooking enthusiasts.',
    brand: 'Cuisinart',
    category: { name: 'Household', id: null },
    price: 179.99,
    itemsInStock: 22,
    rating: 4.8,
    numReviews: 42,
  },
  {
    name: 'Smart Thermostat',
    image:
      'https://images.unsplash.com/photo-1567769541715-8c71fe49fd43?auto=format&q=80&w=400',
    description:
      'Energy-efficient smart thermostat with learning capabilities and remote control. Features automatic scheduling, energy usage reports, and integration with smart home systems. Perfect for optimizing home comfort and reducing energy costs.',
    brand: 'Nest',
    category: { name: 'Household', id: null },
    price: 249.99,
    itemsInStock: 30,
    rating: 4.7,
    numReviews: 65,
  },
  {
    name: 'Stand Mixer',
    image:
      'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&q=80&w=400',
    description:
      'Professional-grade stand mixer with powerful motor and multiple attachments. Features 10 speed settings, 5-quart capacity, and tilt-head design. Essential for baking enthusiasts and home chefs.',
    brand: 'KitchenAid',
    category: { name: 'Household', id: null },
    price: 379.99,
    itemsInStock: 12,
    rating: 4.9,
    numReviews: 78,
  },
  {
    name: 'Smart Microwave Oven',
    image:
      'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&q=80&w=400',
    description:
      'Advanced microwave with smart sensors and voice control compatibility. Features multiple cooking presets, defrost options, and child lock safety. Perfect for modern kitchens seeking convenience and efficiency.',
    brand: 'Samsung',
    category: { name: 'Household', id: null },
    price: 199.99,
    itemsInStock: 16,
    rating: 4.5,
    numReviews: 34,
  },
  {
    name: 'Air Fryer XL',
    image:
      'https://images.unsplash.com/photo-1600628421055-4d30de868b8f?auto=format&q=80&w=400',
    description:
      'Large capacity air fryer with digital controls and multiple cooking functions. Features non-stick basket, dishwasher-safe parts, and rapid air technology. Perfect for healthy cooking with minimal oil.',
    brand: 'Ninja',
    category: { name: 'Household', id: null },
    price: 149.99,
    itemsInStock: 28,
    rating: 4.7,
    numReviews: 89,
  },
  {
    name: 'Smart Dishwasher',
    image:
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&q=80&w=400',
    description:
      'Energy-efficient dishwasher with WiFi connectivity and quiet operation. Features multiple wash cycles, sanitize option, and flexible loading options. Perfect for modern kitchens seeking powerful cleaning performance.',
    brand: 'Bosch',
    category: { name: 'Household', id: null },
    price: 849.99,
    itemsInStock: 8,
    rating: 4.8,
    numReviews: 46,
  },
];
const initialProducts = products.map((product) => {
  return {
    ...product,
    slug: slugify(product.name, { lower: true }),
  };
});

export default initialProducts;
```

- users.js

```javascript
import bcrypt from 'bcryptjs';

const password = bcrypt.hashSync('121212', 10);

const initialUsers = [
  {
    name: 'Admin',
    email: 'admin@email.com',
    password: password,
    phone: '0000000000',
    role: 'admin',
    image:
      'https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/male/45.png',
  },
  {
    name: 'User',
    email: 'user@email.com',
    password: password,
    phone: '0000000000',
    role: 'user',
    is_banned: 'true',
    image:
      'https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/female/45.png',
  },
];

for (let i = 1; i < 10; i++) {
  initialUsers.push({
    name: `User ${i + 1}`,
    email: `user${i + 1}@email.com`,
    password: password,
    phone: `00000000${String(i + 1).padStart(2, '0')}`,
    role: 'user',
    image:
      i % 2 === 0
        ? 'https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/female/45.png'
        : 'https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/male/45.png',
  });
}

export default initialUsers;
```

## Fix seed controller , add uploadToCloudinary utils

- server/src/utils/cloudinaryUtils.js

```javascript
import cloudinary from './cloudinary.js';
/**
 * Uploads an image to Cloudinary
 * @param {string} imageUrl - URL or file path of the image to upload
 * @param {string} [folder='products'] - Cloudinary folder to store the image
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const uploadImageToCloudinary = async (
  imageUrl,
  folder = 'products'
) => {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder,
    });
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};
```

- seedController.js

```javascript
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import initialUsers from '../data/users.js';
import initialProducts from '../data/products.js';
import successResponse from '../utils/responseUtils.js';
import { StatusCodes } from 'http-status-codes';
import Category from '../models/categoryModel.js';
import slugify from 'slugify';
import redisClient from '../utils/redisClient.js';
import Guest from '../models/guestModel.js';
import Order from '../models/orderModel.js';
import { setCacheKey } from '../utils/set-getRedisKeys.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadImageToCloudinary } from '../utils/cloudinaryUtils.js';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const deleteExistingData = async () => {
  try {
    // Delete documents from MongoDB

    await Promise.all([
      Category.deleteMany(),
      User.deleteMany(),

      Product.deleteMany(),
      Guest.deleteMany(),
      Order.deleteMany(),
      redisClient.flushAll(),
    ]);
  } catch (error) {
    console.error('Error deleting existing data:', error);
    throw error; // Optionally rethrow the error for upper layers to handle
  }
};

/**
 * Inserts initial users into the database.
 * @returns {Array} - Inserted users.
 */
const insertUsers = async () => {
  return await User.insertMany(initialUsers);
};

/**
 * Inserts initial products into the database and associates them with a user that inserted them into the db (adimn).
 * @param {ObjectId} createdBy - ID of the user who created the products (initialUsers[0] has admin privileges)
 * @returns {Array} - Inserted products.
 */
const insertProducts = async (createdBy) => {
  try {
    const uploadPromises = initialProducts.map(async (product) => {
      try {
        // Use the utility function instead of direct cloudinary upload
        const result = await uploadImageToCloudinary(product.image);

        return {
          ...product,
          createdBy,
          image: result.secure_url,
        };
      } catch (error) {
        console.error(
          `Failed to upload image for ${product.name}:`,
          error.message,
          '\nImage URL:',
          product.image
        );
        // If upload fails, use the original image URL
        return {
          ...product,
          createdBy,
          image: product.image,
        };
      }
    });

    const productsWithCloudinaryUrls = await Promise.all(uploadPromises);
    return await Product.insertMany(productsWithCloudinaryUrls);
  } catch (error) {
    console.error('Error in insertProducts:', error.message);
    throw new Error('Failed to process products: ' + error.message);
  }
};

/**
 * Generates unique categories from products, maps products to categories, and inserts categories into the database.
 * @param {Array} products - List of inserted products.
 * @param {ObjectId} createdBy - ID of the user who created the categories.
 * @returns {Array} - Inserted categories.
 */
const generateAndInsertCategories = async (products, createdBy) => {
  const categoriesMap = new Map();

  products.forEach((product) => {
    const {
      category: { name: categoryName },
      _id: productId,
    } = product;

    const slug = slugify(categoryName, { lower: true });
    if (!categoriesMap.has(categoryName)) {
      categoriesMap.set(categoryName, {
        name: categoryName,
        createdBy,
        products: [],
        slug,
      });
    }
    categoriesMap.get(categoryName).products.push(productId);
  });

  const createdCategories = Array.from(categoriesMap.values());
  const categories = await Category.insertMany(createdCategories);
  return categories;
};

/**
 * Maps categories to products by adding a category ID to each product.
 * @param {Array} products - List of inserted products.
 * @param {Array} categories - List of inserted categories.
 * @returns {Array} - Updated products with category IDs.
 */
const mapCategoriesToProducts = async (products, categories) => {
  const categoryMap = new Map();
  categories.forEach((category) => {
    category.products.forEach((productId) => {
      categoryMap.set(productId.toString(), category._id);
    });
  });

  const updatedProducts = products.map((product) => {
    const categoryId = categoryMap.get(product._id.toString());
    return {
      ...product._doc, // Spread the document fields
      category: { id: categoryId, name: product.category.name },
    };
  });

  await Promise.all(
    updatedProducts.map((product) =>
      Product.updateOne({ _id: product._id }, { category: product.category })
    )
  );

  return updatedProducts;
};

export const seedData = async (req, res) => {
  // Delete existing data, except admin who made seed request

  // early return for testing purposes
  // return successResponse(res, StatusCodes.OK, "Hydration");
  await deleteExistingData();

  // Insert users and create products with user associations

  const users = await insertUsers();
  const admin = await User.findOne({ email: 'admin@email.com' });

  await setCacheKey('users', users);

  //get admin id

  const products = await insertProducts(admin._id);

  //initialize guest  cache
  const guests = await Guest.find();
  await setCacheKey('guests', guests);

  //initialize order cache
  const orders = await Order.find();
  await setCacheKey('orders', orders);
  // Generate and insert categories
  const categories = await generateAndInsertCategories(products, admin._id);

  await setCacheKey('categories', categories);
  const finalProducts = await mapCategoriesToProducts(products, categories);
  await setCacheKey('products', finalProducts);

  // Log out the user if they are logged in
  if (req.user) {
    // Clear all cookies
    Object.keys(req.cookies).forEach((cookieName) => {
      res.cookie(cookieName, '', {
        httpOnly: true,
        expires: new Date(0), // Set expiration date to the past
      });
    });
    delete req.user;
  }
  return successResponse(res, StatusCodes.OK, 'Database hydrated');
};
```

## Modify openController - registerUser controller to accept image

```javascript
const image = req?.file;
console.log(image);
if (image) {
  //upload user image to cloudinary
  const response = await cloudinary.uploader.upload(image.path, {
    width: 300,
    crop: 'scale',
  });
  //delete image from local machine before saving updates to database
  await fs.unlink(image.path);
  req.body.image = response.secure_url;
  req.body.imagePublicId = response.public_id;
}
```

### Use upload middleware to registerUser

```javascript
openRouter.post(
  '/register',
  uploadUser.single('image'),
  validateRegistrationInput,
  registerUser
);
```

## Check if must modify adminController to update redis

- In changeUserStatus, banUser , unbanUser

```javascript
		const updatedUser = await User.findByIdAndUpdate(
			id,
			{ role: "admin" },
			{ new: true },
		);
		const users = await User.find();
		await setCacheKey("users", users);
		return successResponse(
			res,
			StatusCodes.OK,
			`User with id ${id} promoted to admin`,
			{ updatedUser },
		);
	}
	if (user.role === "admin") {
		const updatedUser = await User.findByIdAndUpdate(
			id,
			{ role: "user" },
			{ new: true },
		);
		const users = await User.find();
		await setCacheKey("users", users);
		return successResponse(
			res,
			StatusCodes.OK,
			`Admin with id ${id} demoted to simple user`,
			{ updatedUser },
		);
	}
};
```

## Modify registerUser controller to handle image upload to cloudinary

```javascript
import cloudinary from '../utils/cloudinary.js';
import { promises as fs } from 'fs';

const image = req?.file;
console.log(image);
if (image) {
  //upload user image to cloudinary
  const response = await cloudinary.uploader.upload(image.path, {
    width: 300,
    crop: 'scale',
  });

  //delete image from local machine before saving updates to database
  await fs.unlink(image.path);
  req.body.image = response.secure_url;
  req.body.imagePublicId = response.public_id;
}
```

## Add upload middleware to register route

```javascript
openRouter.post(
  '/register',
  uploadUser.single('image'),
  validateRegistrationInput,
  registerUser
);
```

## Update deleteProduct controller to update categories after deleting

```javascript
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const product = await findWithId(id, 'product');

  await Product.findByIdAndDelete(id);
  await Category.findOneAndUpdate(
    { name: product.category.name }, // Filter by category name
    {
      $pull: { products: id }, // Remove the product ID from the array
    },
    { new: true } // Return the updated document
  );
  const categories = await Category.find();
  await updateCacheDelete('products', id);
  await setCacheKey('categories', categories);
  return successResponse(
    res,
    StatusCodes.OK,
    `Product with id ${id} deleted`,
    { product },
    { new: true }
  );
};
```

## Modify registerUser and verifyEmail controller AND ROUTE to verify directly from email link

- route

```javascript
openRouter.get('/verify-email/:token', verifyEmail);
```

```javascript
const baseUrl =
  process.env.NODE_ENV === 'production'
    ? `https://${process.env.SERVER_URL}`
    : `http://localhost:${dev.app.serverPort}`;

export const registerUser = async (req, res) => {
  // Remove confirmPassword from the request body
  delete req.body.confirmPassword;

  // Encrypt the user's password
  req.body.password = await encryptPassword(req.body.password);
  const image = req?.file;
  console.log(image);
  if (image) {
    //upload user image to cloudinary
    const response = await cloudinary.uploader.upload(image.path, {
      width: 300,
      crop: 'scale',
    });

    //delete image from local machine before saving updates to database
    await fs.unlink(image.path);
    req.body.image = response.secure_url;
    req.body.imagePublicId = response.public_id;
  }
  // Generate a JWT token with the user's details
  const token = createJWT(req.body);

  // Modify email data to send direct verification link
  const emailData = {
    email: req.body.email,
    subject: 'Account Activation Email',
    html: `
            <h2>Hello ${req.body.name}</h2>
            <p>Please click here to <a href="${baseUrl}/api/v1/open/verify-email/${token}">activate your account</a></p>
        `,
  };

  // Send activation email
  sendEmailWithNodeMailer(emailData);

  // Send success response with a message and the generated token
  return successResponse(
    res,
    StatusCodes.CREATED,
    `An email has been sent to ${req.body.email}. Please verify your email account`,
    token
  );
};

export const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = verifyJWT(token);

    // Check if user already exists
    const existingUser = await User.findOne({ email: decoded.email });
    if (existingUser) {
      return res.redirect(`${dev.app.clientUrl}/login?message=alreadyVerified`);
    }

    // Create new user
    const newUser = await User.create(decoded);
    if (!newUser) throw new BadRequestError('Account not created');

    // Update cache
    await updateCachePost('users', newUser);

    // Redirect with success message
    res.redirect(`${dev.app.clientUrl}/login?verified=success`);
  } catch (error) {
    // Handle specific error cases
    if (error.name === 'TokenExpiredError') {
      return res.redirect(`${dev.app.clientUrl}/register?error=tokenExpired`);
    }
    res.redirect(`${dev.app.clientUrl}/register?error=verificationFailed`);
  }
};
```
