export interface UserDto {
  organizationUserId: number;
  organizationId: string;
  identityUserId: string;
  email: string | null;
  isActive: boolean;
  isApproved: boolean;
  identityIsActive: boolean;
  isEmailVerified: boolean;
  createdBy: string;
  createdUtc: string;
  modifiedBy: string | null;
  modifiedUtc: string | null;
  approvedBy: string | null;
  approvedUtc: string | null;
}

export interface UserSearchResult {
  items: UserDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface UserSearchParameters {
  identityUserId?: string;
  isActive?: boolean;
  isApproved?: boolean;
  pageNumber?: number;
  pageSize?: number;
}
