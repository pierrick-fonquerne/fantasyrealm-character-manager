import { apiClient } from './api';

interface DeleteAccountRequest {
  password: string;
}

const accountService = {
  deleteAccount: async (data: DeleteAccountRequest, token: string): Promise<void> => {
    await apiClient.deleteAuthenticatedWithBody('/account', data, token);
  },
};

export { accountService };
export type { DeleteAccountRequest };
