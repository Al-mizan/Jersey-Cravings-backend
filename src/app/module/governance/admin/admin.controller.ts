import { Request, Response } from 'express';
import status from 'http-status';
import { catchAsync } from '../../../shared/catchAsync';
import { sendResponse } from '../../../shared/sendResponse';
import { AdminService } from './admin.service';
import { IRequestUser } from '../../../interface/requestUser.interface';

const getAllAdmins = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminService.getAllAdmins(req.query);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: 'Admins retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
});

const getAdminById = catchAsync(async (req: Request, res: Response) => {
    const {id} = req.params;
    const result = await AdminService.getAdminById(id as string);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: 'Admin retrieved successfully',
        data: result,
    });
});

const updateAdmin = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');
    const {id} = req.params;

    const result = await AdminService.updateAdmin(id as string, req.body, user, ipAddress, userAgent);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: 'Admin updated successfully',
        data: result,
    });
});

const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');
    const {id} = req.params;

    const result = await AdminService.deleteAdmin(id as string, user, ipAddress, userAgent);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: 'Admin deleted successfully',
        data: result,
    });
});

const changeUserStatus = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');

    const result = await AdminService.changeUserStatus(req.body, user, ipAddress, userAgent);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: 'User status changed successfully',
        data: result,
    });
});

const changeUserRole = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');

    const result = await AdminService.changeUserRole(req.body, user, ipAddress, userAgent);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: 'User role changed successfully',
        data: result,
    });
});

export const AdminController = {
    getAllAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin,
    changeUserStatus,
    changeUserRole,
};