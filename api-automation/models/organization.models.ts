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
