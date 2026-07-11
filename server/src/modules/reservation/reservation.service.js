import httpStatus from "http-status";
import ApiError from "../../errors/ApiError.js";
import {
  DropModel,
  PurchaseModel,
  ReservationModel,
  UserModel,
} from "../../models/index.js";
import sequelize from "../../sequelize/index.js";

export const getAllReservationService = async (status) => {
  console.log("status: ", status);
  const reservations = await ReservationModel.findAll({
        where: status ? { status } : {},
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: ["id", "firstName", "lastName", "email"],
      },
      {
        model: DropModel,
        as: "drop",
        attributes: ["id", "name", "price", "imageUrl"],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  console.log("reservations: ", reservations);

  return reservations;
};

export const deleteReservationService = async (userId, reservationId) => {
  const transaction = await sequelize.transaction();
  try {
    const reservation = await ReservationModel.findOne({
      where: { id: reservationId, userId, status: "pending" },
      transaction: transaction,
    });

    if (!reservation) {
      throw new ApiError(httpStatus.NOT_FOUND, "Reservation not found");
    }

    reservation.status = "cancelled";
    await reservation.save({ transaction: transaction });

    // Restore the stock unit
    await sequelize.query(
      `UPDATE drops SET available_stock = available_stock + 1 WHERE id = :dropId`,
      {
        replacements: { dropId: reservation.dropId },
        transaction: transaction,
      },
    );

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

export const purchaseReservationService = async (userId, reservationId) => {
  const transaction = await sequelize.transaction();
  try {
    const reservation = await ReservationModel.findOne({
      where: { id: reservationId, userId, status: "pending" },
      transaction: transaction,
    });

    if (!reservation) {
      throw new ApiError(httpStatus.NOT_FOUND, "Reservation not found");
    }

    if (new Date(reservation.expires_at) < new Date()) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Reservation expired");
    }

    const drop = await DropModel.findByPk(reservation.dropId, {
      transaction: transaction,
    });

    reservation.status = "completed";
    await reservation.save({ transaction: transaction });

    const purchase = await PurchaseModel.create(
      {
        userId,
        dropId: reservation.dropId,
        reservationId: reservationId,
        amountPaid: drop.price,
      },
      { transaction: transaction },
    );

    await transaction.commit();

    return {
      purchaseId: purchase.id,
      dropId: purchase.dropId,
      amountPaid: purchase.amountPaid,
      created_at: purchase.created_at,
    };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};
