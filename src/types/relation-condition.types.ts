export interface RelationCondition {
  id: string;
  clientId: string;
  permissionId: string;
  conditionKey: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateRelationConditionInput {
  clientId: string;
  permissionId: string;
  conditionKey: string;
  description?: string;
}

export interface RelationConditionFilter {
  clientId?: string;
  permissionId?: string;
  isActive?: boolean;
}
