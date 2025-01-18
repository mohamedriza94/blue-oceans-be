import ApartmentModel from "../../../entities/apartment/model";
import BuildingModel from "../../../entities/building/model";
import ChiefOccupantModel from "../../../entities/chief-occupant/model";
import ExtensionRequestModel from "../../../entities/extension-request/model";
import { ENUMLeaseStatus } from "../../../entities/lease/enum";
import { ILease } from "../../../entities/lease/i";
import LeaseModel from "../../../entities/lease/model";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import { IReturnObj } from "../../../interfaces/return-obj";
import { format, parseISO, getMonth, startOfYear, endOfYear } from "date-fns";

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

export const LoadLeasesForChart = async (year: number): Promise<IReturnObj> => {
  try {
    // Ensure proper filtering by using UTC date ranges
    const startOfYearUTC = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
    const endOfYearUTC = new Date(Date.UTC(year, 11, 31, 23, 59, 59));

    const leases = await LeaseModel.find({
      startDate: {
        $gte: startOfYearUTC,
        $lte: endOfYearUTC,
      },
    });

    const monthsData = Array.from({ length: 12 }, (_, i) => ({
      month: format(new Date(2020, i, 1), 'MMMM'), // Use a fixed year for month names
      leases: 0,
    }));

    // Aggregate leases by month
    leases.forEach((lease) => {
      try {
        const startDate = parseISO(lease.startDate.toISOString()); // Ensure consistent parsing
        const monthIndex = getMonth(startDate); // Get the correct month index (0-11)
        monthsData[monthIndex].leases += 1;
      } catch (innerError) {
        console.error('Error processing lease:', { lease, innerError });
      }
    });

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [],
      data: monthsData,
    };
  } catch (error) {
    console.error('lease-chart error:', error);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ['Internal Server Error'],
    };
  }
};
