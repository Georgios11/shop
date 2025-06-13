import slugify from 'slugify';
import { IInitialProduct } from '../types/product';

const products: IInitialProduct[] = [
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
