import ApartmentModel from "../../../entities/apartment/model";
import BuildingModel from "../../../entities/building/model";
import ExtensionRequestModel from "../../../entities/extension-request/model";
import { ENUMLeaseStatus } from "../../../entities/lease/enum";
import LeaseModel from "../../../entities/lease/model";
import ParkingModel from "../../../entities/parking/model";
import { ENUMRentPaymentStatus } from "../../../entities/rent/enum";
import RentModel from "../../../entities/rent/model";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import { IReturnObj } from "../../../interfaces/return-obj";

export const GetCoStats = async (
  chiefOccupantId: string
): Promise<IReturnObj> => {
  try {
    const currentLease = await LeaseModel.findOne({
      chiefOccupantId,
      status: ENUMLeaseStatus.Active,
    }).lean();

    // ------------------------------------------------------------

    const currentApartment = await ApartmentModel.findById(
      currentLease?.apartmentId
    ).lean();

    // ------------------------------------------------------------

    const currentBuilding = await BuildingModel.findById(
      currentApartment?.buildingId
    ).lean();

    // ------------------------------------------------------------

    const rentOverdues = await RentModel.find({
      leaseId: currentLease?._id,
      paymentStatus: ENUMRentPaymentStatus.Overdue,
    }).lean();

    // ------------------------------------------------------------

    const currentDate = new Date();

    const upcomingRentPayment = await RentModel.findOne({
      leaseId: currentLease?._id,
      dueDate: { $gte: currentDate },
      paymentStatus: ENUMRentPaymentStatus.Pending,
    })
      .sort({ dueDate: 1 })
      .exec();

    // ------------------------------------------------------------

    const pendingExtensionRequest = await ExtensionRequestModel.findOne({
      leaseId: currentLease?._id,
      status: "Pending",
    });

    // ------------------------------------------------------------

    const parkingSlots = await ParkingModel.find({
      leaseId: currentLease?._id,
    }).lean();

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [],
      data: {
        currentLease,
        currentApartment,
        currentBuilding,
        rentOverdues,
        upcomingRentPayment,
        pendingExtensionRequest,
        parkingSlots,
      },
    };
  } catch (error) {
    console.log("error", error);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: [],
    };
  }
};
