import ApiError from "../../errors/ApiError.js";
import httpStatus from "http-status";
import { DropModel } from "../../models/index.js";
import { ReservationModel } from "../../models/Reservation.js";
import sequelize from "../../sequelize/index.js";

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

// list all drops with top-3 recent purchasers
export const getDropsService = async () => {
  const drops = await DropModel.findAll({ order: [["created_at", "DESC"]] });

  return drops;
};

// atomic reservation
export const reservationService = async (userId, dropId) => {
  const EXPIRY_SECONDS = 60;

  const transaction = await sequelize.transaction();
  try {
    // Reject if user already has a pending reservation for this drop
    const existing = await ReservationModel.findOne({
      where: { userId, dropId, status: "pending" },
      transaction: transaction,
    });
    if (existing) {
      throw new ApiError(httpStatus.CONFLICT, "Already reserved");
    }

    // Atomic decrement — PostgreSQL serializes concurrent row updates;
    // only the first transaction that finds available_stock > 0 succeeds.
    const [rows] = await sequelize.query(
      `UPDATE drops
       SET    available_stock = available_stock - 1
       WHERE  id            = :dropId
         AND  available_stock > 0
         AND  starts_at    <= NOW()
       RETURNING id, available_stock`,
      { replacements: { dropId }, transaction: transaction },
    );

    if (!rows || rows.length === 0) {
      // await transaction.rollback();
      const drop = await DropModel.findByPk(dropId);

      if (!drop) {
        throw new ApiError(httpStatus.NOT_FOUND, "Drop not found");
      }

      if (new Date(drop.startsAt) > new Date()) {
        throw new ApiError(httpStatus.CONFLICT, "Drop not started yet");
      }
      throw new ApiError(httpStatus.CONFLICT, "Sold out");
    }

    const updatedDrop = rows[0];

    const reservation = await ReservationModel.create(
      {
        userId,
        dropId,
        status: "pending",
        expiresAt: new Date(Date.now() + EXPIRY_SECONDS * 1000),
      },
      { transaction: transaction },
    );

    await transaction.commit();

    return {
      reservationId: reservation.id,
      dropId: reservation.dropId,
      expiresAt: reservation.expiresAt,
      availableStock: parseInt(updatedDrop.available_stock),
    };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};
