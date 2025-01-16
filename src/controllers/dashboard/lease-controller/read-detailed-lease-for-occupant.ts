import ApartmentModel from "../../../entities/apartment/model";
import ChiefOccupantModel from "../../../entities/chief-occupant/model";
import DependentModel from "../../../entities/dependant/model";
import LeaseModel from "../../../entities/lease/model";
import ParkingModel from "../../../entities/parking/model";
import RentModel from "../../../entities/rent/model";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import { IReturnObj } from "../../../interfaces/return-obj";

export const DetailedLeaseForOccupant = async (
  chiefOccupantId: string
): Promise<IReturnObj> => {
  try {
    const lease = await LeaseModel.findOne({ chiefOccupantId }).lean();
    if (!lease) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["Lease not found"],
      };
    }

    const rentSlots = await RentModel.find({ leaseId: lease._id }).lean();
    if (!rentSlots) {
      return {
        statusCode: ENUMHttpStatusCode.BAD_REQUEST,
        message: ["Rent slots not found"],
      };
    }

    const [involvedApartment, involvedOccupant, dependants] =
      (await Promise.all([
        ApartmentModel.findById(lease.apartmentId)
          .populate("buildingId")
          .lean(),
        ChiefOccupantModel.findById(chiefOccupantId)
          .populate("apartmentId")
          .lean(),
        DependentModel.find({
          chiefOccupantId: chiefOccupantId,
        }).lean(),
      ])) as any;

    const parkingSlots = await ParkingModel.find({ leaseId: lease._id })
      .select("slotNumber")
      .lean();

    const perExtraParkingSlotCharge =
      involvedApartment.buildingId.chargePerExtraParkingSlotInUSD;

    let parkingSlotCharges = 0;

    if (parkingSlots.length > 1) {
      const additionalParkingSlotCount = parkingSlots.length - 1;

      parkingSlotCharges =
        additionalParkingSlotCount * Number(perExtraParkingSlotCharge);
    }

    return {
      statusCode: ENUMHttpStatusCode.OK,
      message: [],
      data: {
        lease: lease,
        rentSlots: rentSlots,
        apartment: involvedApartment,
        chiefOccupant: involvedOccupant,
        dependants,
        parkingSlotCharges,
        parkingSlotNumbers: parkingSlots.map((slot) => slot.slotNumber),
      },
    };
  } catch (error) {
    console.log('error', error);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
