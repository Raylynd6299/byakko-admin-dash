export interface Client {
  id: string;
  name: string;
  webhookUrl?: string;
  hmacSecret?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientInput {
  name: string;
  webhookUrl?: string;
  hmacSecret?: string;
}

export interface UpdateClientInput {
  webhookUrl?: string;
  hmacSecret?: string;
  isActive?: boolean;
}

export interface CreateClientResponse {
  client: Client;
  apiKey: string;
}
