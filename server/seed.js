import "dotenv/config";
import bcrypt from "bcryptjs";
import { DropModel, UserModel } from "./src/models/index.js";
import sequelize from "./src/sequelize/index.js";

const now = () => new Date();
const inMin = (m) => new Date(Date.now() + m * 60 * 1000);

const DROPS = [
  // — Live now —
  {
    name: "Air Jordan 1 Retro OG Chicago",
    price: 299.99,
    totalStock: 10,
    availableStock: 10,
    startsAt: now(),
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop",
  },
  {
    name: "Nike Air Max 90 Infrared",
    price: 149.99,
    totalStock: 20,
    availableStock: 20,
    startsAt: now(),
    imageUrl:
      "https://images.unsplash.com/photo-1520316587275-5e4f06f355e4?w=600&auto=format&fit=crop",
  },
  {
    name: "New Balance 550 White Green",
    price: 119.99,
    totalStock: 15,
    availableStock: 15,
    startsAt: now(),
    imageUrl:
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop",
  },

  // — Drops in 5 minutes —
  {
    name: "Nike SB Dunk Low Pro",
    price: 199.99,
    totalStock: 5,
    availableStock: 5,
    startsAt: inMin(5),
    imageUrl:
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&auto=format&fit=crop",
  },
  {
    name: "Adidas Yeezy Boost 350 V2 Zebra",
    price: 449.99,
    totalStock: 3,
    availableStock: 3,
    startsAt: inMin(5),
    imageUrl:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop",
  },

  // — Drops in 10 minutes —
  {
    name: "Air Jordan 4 Retro Military Blue",
    price: 375.0,
    totalStock: 8,
    availableStock: 8,
    startsAt: inMin(10),
    imageUrl:
      "https://images.unsplash.com/photo-1584735175315-9d5df23be620?w=600&auto=format&fit=crop",
  },
  {
    name: "Nike Dunk High Panda",
    price: 179.99,
    totalStock: 12,
    availableStock: 12,
    startsAt: inMin(10),
    imageUrl:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop",
  },

  // — Drops in 15 minutes —
  {
    name: "Converse Chuck 70 Hi Parchment",
    price: 95.0,
    totalStock: 25,
    availableStock: 25,
    startsAt: inMin(15),
    imageUrl:
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=600&auto=format&fit=crop",
  },
  {
    name: "Reebok Club C 85 Vintage",
    price: 89.99,
    totalStock: 30,
    availableStock: 30,
    startsAt: inMin(15),
    imageUrl:
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&auto=format&fit=crop",
  },
];

async function seed() {
  await sequelize.authenticate();
  console.log("Connected to database");
  await sequelize.sync({ alter: true });
  console.log("Tables ready");

  const hash = await bcrypt.hash("password123", 10);

  await UserModel.findOrCreate({
    where: { email: "alice@example.com" },
    defaults: { firstName: "alice", lastName: "E.", passwordHash: hash, role: "admin" },
  });
  await UserModel.findOrCreate({
    where: { email: "bob@example.com" },
    defaults: { firstName: "bob", lastName: "D.", passwordHash: hash, role: "user" },
  });
  await UserModel.findOrCreate({
    where: { email: "carol@example.com" },
    defaults: { firstName: "carol", lastName: 'john', passwordHash: hash, role: "user" },
  });

  console.log(
    "Users: alice=admin, bob=user, carol=user (password: password123)",
  );

  for (const data of DROPS) {
    const [drop, created] = await DropModel.findOrCreate({
      where: { name: data.name },
      defaults: data,
    });
    // Always refresh startsAt; backfill imageUrl only if missing
    if (!created) {
      await drop.update({
        startsAt: data.startsAt,
        ...(drop.imageUrl ? {} : { imageUrl: data.imageUrl }),
      });
    }
  }

  console.log(`Drops seeded: ${DROPS.length} items`);
  console.log(
    "  • Live now:       Air Jordan 1, Nike Air Max 90, New Balance 550",
  );
  console.log("  • In  5 min:      Nike SB Dunk, Yeezy 350");
  console.log("  • In 10 min:      Air Jordan 4, Nike Dunk High");
  console.log("  • In 15 min:      Converse Chuck 70, Reebok Club C 85");
  await sequelize.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
