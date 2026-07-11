import { DropModel } from "../../models/index.js";

export const createNewMerchDropService = async (merchDropData) => {
  const { name, price, totalStock, startsAt, imageUrl } = merchDropData;

  const drop = await DropModel.create({
    name,
    price: price,
    totalStock: totalStock,
    availableStock: totalStock,
    startsAt: startsAt ? new Date(startsAt) : new Date(),
    imageUrl: imageUrl || null,
  });

  return drop;
};

// GET /api/drops — list all drops with top-3 recent purchasers
export const getDropsService = async () => {
  const drops = await DropModel.findAll({ order: [["created_at", "DESC"]] });

  return drops;
};
