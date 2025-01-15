import { isValidObjectId, startSession } from "mongoose";
import RentModel from "../../../entities/rent/model";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import { IReturnObj } from "../../../interfaces/return-obj";
import { IRent } from "../../../entities/rent/i";
import { ENUMRentPaymentStatus } from "../../../entities/rent/enum";
import { differenceInDays, formatISO, isAfter, format } from "date-fns";
import ChiefOccupantModel from "../../../entities/chief-occupant/model";
import LeaseModel from "../../../entities/lease/model";
import { sendTransactionalEmail } from "../../../configurations/email-api/brevo";
import { TEmailOptions } from "../../../configurations/email-api/types";

type TPayRent = {
  rentId: string;
  remarks?: string;
};

export const PayRent = async ({
  rentId,
  remarks,
}: TPayRent): Promise<IReturnObj> => {
  const session = await startSession();

  try {
    session.startTransaction();

    // START : VALIDATE PARAMS
    if (!isValidObjectId(rentId)) {
      return {
        statusCode: ENUMHttpStatusCode.UNPROCESSABLE_ENTITY,
        message: ["Identifier is missing or invalid"],
      };
    }
    // END : VALIDATE PARAMS

    // ----------------------------------------------------------------

    // START : CHECK RENT
    const rent = await RentModel.findById(rentId).session(session).lean();

    if (!rent) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["Rent not available"],
      };
    }

    if (rent.paymentStatus === ENUMRentPaymentStatus.Paid) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["This rent has already been paid"],
      };
    }
    // END : CHECK RENT

    // ----------------------------------------------------------------

    // START : CHECK OVERDUE AND CALCULATE PENALTY
    const dueDate: IRent["dueDate"] = rent.dueDate;
    const paymentAmount: IRent["amount"] = rent.amount;

    const currentDate = new Date();
    const isOverdue = isAfter(currentDate, new Date(dueDate));
    const overdueDays = isOverdue
      ? differenceInDays(currentDate, new Date(dueDate))
      : 0;

    let penalty = 0;
    let penaltyPercentage = "0%";

    if (overdueDays > 30) {
      penalty = paymentAmount * 0.6; // 60% penalty
      penaltyPercentage = "60%";
    } else if (overdueDays > 20) {
      penalty = paymentAmount * 0.3; // 30% penalty
      penaltyPercentage = "30%";
    } else if (overdueDays > 10) {
      penalty = paymentAmount * 0.1; // 10% penalty
      penaltyPercentage = "10%";
    }

    const totalPayment = paymentAmount + penalty;
    // END : CHECK OVERDUE AND CALCULATE PENALTY

    // ----------------------------------------------------------------

    // START : UPDATE RENT PAYMENT STATUS
    await RentModel.findByIdAndUpdate(
      rentId,
      {
        paymentStatus: ENUMRentPaymentStatus.Paid,
        penaltyAmount: penalty,
        totalPaidAmount: totalPayment,
        paymentDate: formatISO(currentDate),
        remarks: remarks ?? "",
      },
      { session }
    );
    // END : UPDATE RENT PAYMENT STATUS

    // ----------------------------------------------------------------

    // START : SEND MAIL RECEIPT
    const lease = await LeaseModel.findById(rent.leaseId)
      .select("chiefOccupantId")
      .session(session)
      .lean();

    const chiefOccupant = await ChiefOccupantModel.findById(
      lease?.chiefOccupantId
    )
      .session(session)
      .lean();

    const firstName = chiefOccupant?.fullName?.split(" ")[0];
    const emailOptions: TEmailOptions = {
      to: [{ email: chiefOccupant?.email ?? "", name: firstName }],
      subject: "Rent Payment Receipt",
      templateType: "brevo",
      templateData: {
        id: "15",
        params: {
          firstName: firstName,
          fullName: chiefOccupant?.fullName,
          email: chiefOccupant?.email,
          rentAmount: `$${paymentAmount.toFixed(2)}`,
          penaltyAmount: `$${penalty.toFixed(2)}`,
          penaltyPercentage: penaltyPercentage,
          totalPaidAmount: `$${totalPayment.toFixed(2)}`,
          overdueDays: overdueDays.toString(),
          dueDate: format(new Date(dueDate), "dd MMMM yyyy"),
          paymentDate: format(new Date(currentDate), "dd MMMM yyyy"),
          leaseId: `#${rent.leaseId.toString()}`,
          rentId: rentId,
        },
      },
    };
    await sendTransactionalEmail(emailOptions);
    // END : SEND MAIL RECEIPT

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: ["Rent payment successful"],
      data: {
        rentId,
        totalPaidAmount: totalPayment,
        penaltyAmount: penalty,
        overdueDays,
      },
    };
  } catch (error) {
    // Abort the transaction if there's an error
    await session.abortTransaction();
    session.endSession();

    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
