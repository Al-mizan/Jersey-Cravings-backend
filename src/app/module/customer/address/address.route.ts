import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import { checkAuth } from "../../../middleware/checkAuth";
import { validateRequest } from "../../../middleware/validateRequest";
import { AddressController } from "./address.controller";
import { AddressValidation } from "./address.validation";

const router = Router();

router.get("/my", checkAuth(Role.CUSTOMER), AddressController.getMyAddresses);
router.post(
    "/my",
    checkAuth(Role.CUSTOMER),
    validateRequest(AddressValidation.createAddressZodSchema),
    AddressController.createAddress,
);
router.patch(
    "/my/:addressId",
    checkAuth(Role.CUSTOMER),
    validateRequest(AddressValidation.updateAddressZodSchema),
    AddressController.updateAddress,
);
router.delete(
    "/my/:addressId",
    checkAuth(Role.CUSTOMER),
    AddressController.deleteAddress,
);

router.get(
    "/customer/:customerId",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    AddressController.getCustomerAddressesForAdmin,
);

export const AddressRoutes = router;
