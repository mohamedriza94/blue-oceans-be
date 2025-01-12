import AdminModel from "../../../entities/admin/model";
import { IReturnObj } from "../../../interfaces/return-obj";
import { ENUMHttpStatusCode } from "../../../enums/http-status-codes";
import { hashPassword } from "../../../services/bcrypt/functions";

export const CreateAdmin = async (): Promise<IReturnObj> => {
  try {
    // Hard-coded admin data for seeding
    const adminData = {
      email: "admin@blueoceans.com",
      password: "Test1234",
      fullName: "Jake Paul",
    };

    // Hash the password before saving
    const hashedPassword = await hashPassword(adminData.password);

    const newAdmin = new AdminModel({
      ...adminData,
      password: hashedPassword,
    });

    await newAdmin.save();

    return {
      statusCode: ENUMHttpStatusCode.CREATED,
      message: ["Admin created successfully"],
      data: {
        email: adminData.email,
        fullName: adminData.fullName,
      },
    };
  } catch (e) {
    console.error("Create Admin Error:", e);
    return {
      statusCode: ENUMHttpStatusCode.INTERNAL_SERVER_ERROR,
      message: ["Internal Server Error"],
    };
  }
};
