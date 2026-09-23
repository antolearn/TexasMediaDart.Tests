export interface CurrentOrganization {
  organizationId: string;
  name: string;
  isActive: boolean;
  organizationUserId: number;
  identityUserId: string;
  userIsActive: boolean;
  userIsApproved: boolean;
  createdBy: string;
  createdUtc: string;
  modifiedBy: string | null;
  modifiedUtc: string | null;
}
export interface UpdateOrganizationRequest {
  name: string;
  isActive: boolean;
}

export interface UserModulePermission {
  organizationId: string;
  organizationUserId: number;
  moduleId: number;
  moduleCode: string;
  moduleName: string;
  description: string | null;
  route: string | null;
  iconKey: string | null;
  menuGroup: string | null;
  displayOrder: number;
  showInMenu: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canRead: boolean;
}
export interface OrganizationUser {
  organizationUserId: number;
  organizationId: string;
  identityUserId: string;
  isActive: boolean;
  isApproved: boolean;
  createdBy: string;
  createdUtc: string;
  modifiedBy: string | null;
  modifiedUtc: string | null;
  approvedBy: string | null;
  approvedUtc: string | null;
}

export interface OrganizationUserSearchResult {
  items: OrganizationUser[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface OrganizationUserSearchParameters {
  identityUserId?: string;
  isActive?: boolean;
  isApproved?: boolean;
  pageNumber?: number;
  pageSize?: number;
}
export interface Role {
  roleId: string;
  organizationId: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  isActive: boolean;
  isDeleted: boolean;
  isApproved: boolean;
  createdBy: string;
  createdUtc: string;
  modifiedBy: string | null;
  modifiedUtc: string | null;
  approvedBy: string | null;
  approvedUtc: string | null;
}

export interface RoleSearchResult {
  items: Role[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface RoleSearchParameters {
  search?: string;
  isActive?: boolean;
  pageNumber?: number;
  pageSize?: number;
}
export interface CreateRoleRequest {
  name: string;
  description?: string | null;
}
export interface UpdateRoleRequest {
  name: string;
  description?: string | null;
  isActive: boolean;
}
export interface RolePermission {
  roleId: string;
  moduleId: number;
  moduleCode: string;
  moduleName: string;

  supportsCreate: boolean;
  supportsRead: boolean;
  supportsUpdate: boolean;
  supportsDelete: boolean;
  supportsApprove: boolean;

  allowedCanCreate: boolean;
  allowedCanUpdate: boolean;
  allowedCanDelete: boolean;
  allowedCanRead: boolean;
  allowedCanApprove: boolean;

  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canRead: boolean;
  canApprove: boolean;

  createdBy: string | null;
  createdUtc: string | null;
  modifiedBy: string | null;
  modifiedUtc: string | null;
}
export interface RolePermissionInput {
  moduleId: number;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canRead: boolean;
  canApprove: boolean;
}

export interface UpdateRolePermissionsRequest {
  permissions: RolePermissionInput[];
}
