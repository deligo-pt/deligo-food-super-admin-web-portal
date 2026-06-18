import { TMeta } from ".";

export interface TSystemPermission {
    _id: string;
    name: string;
    action: string;
    module: string;
    displayName?: string;
    description?: string;
    isSystemDefined: boolean;
    isActive: boolean;
};

export interface IPermissionResponse {
    success: boolean;
    data: TSystemPermission[];
    meta: TMeta;
    message: string;
}