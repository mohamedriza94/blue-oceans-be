import ApartmentModel from "../../../entities/apartment/model";
import BuildingModel from "../../../entities/building/model";
import ChiefOccupantModel from "../../../entities/chief-occupant/model";
import ExtensionRequestModel from "../../../entities/extension-request/model";
import { ENUMLeaseStatus } from "../../../entities/lease/enum";
import LeaseModel from "../../../entities/lease/model";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import { IReturnObj } from "../../../interfaces/return-obj";

export const GetDashboardData = async (): Promise<IReturnObj> => {
  try {
    const buildingsCount = await BuildingModel.countDocuments();

    // ------------------------------------------------------------

    const occupiedApartmentsCount = await ApartmentModel.countDocuments({
      status: "Occupied",
    });
    const availableApartmentsCount = await ApartmentModel.countDocuments({
      status: "Available",
    });
    const maintenanceApartmentsCount = await ApartmentModel.countDocuments({
      status: "Maintenance",
    });
    const totalApartmentsCount =
      occupiedApartmentsCount +
      availableApartmentsCount +
      maintenanceApartmentsCount;

    // ------------------------------------------------------------

    const activeChiefOccupantsCount = await ChiefOccupantModel.countDocuments({
      status: "Active",
    });
    const inactiveChiefOccupantsCount = await ChiefOccupantModel.countDocuments(
      { status: "Inactive" }
    );
    const totalChiefOccupantsCount =
      activeChiefOccupantsCount + inactiveChiefOccupantsCount;

    // ------------------------------------------------------------

    const activeLeaseCount = await LeaseModel.countDocuments({
      status: ENUMLeaseStatus.Active,
    });
    const expiredLeaseCount = await LeaseModel.countDocuments({
      status: ENUMLeaseStatus.Expired,
    });
    const terminatedLeaseCount = await LeaseModel.countDocuments({
      status: ENUMLeaseStatus.Terminated,
    });
    const totalLeaseCount =
      activeLeaseCount + expiredLeaseCount + terminatedLeaseCount;

    // ------------------------------------------------------------

    const pendingErCount = await ExtensionRequestModel.countDocuments({
      status: "Pending",
    });
    const approvedErCount = await ExtensionRequestModel.countDocuments({
      status: "Approved",
    });
    const rejectedErCount = await ExtensionRequestModel.countDocuments({
      status: "Rejected",
    });
    const totalErCount = pendingErCount + approvedErCount + rejectedErCount;

    // ------------------------------------------------------------

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: ["Dashboard data retrieved successfully"],
      data: {
        buildings: {
          total: buildingsCount,
        },
        apartments: {
          total: totalApartmentsCount,
          occupied: occupiedApartmentsCount,
          available: availableApartmentsCount,
          maintenance: maintenanceApartmentsCount,
        },
        chiefOccupants: {
          total: totalChiefOccupantsCount,
          active: activeChiefOccupantsCount,
          inactive: inactiveChiefOccupantsCount,
        },
        leases: {
          total: totalLeaseCount,
          active: activeLeaseCount,
          expired: expiredLeaseCount,
          terminated: terminatedLeaseCount,
        },
        extensionRequests: {
          total: totalErCount,
          pending: pendingErCount,
          approved: approvedErCount,
          rejected: rejectedErCount,
        },
      },
    };
  } catch (error) {
    console.log("GetDashboardData", error);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
