import { apiClient } from './api';

interface ContactRequest {
  email: string;
  pseudo: string;
  message: string;
}

interface ContactResponse {
  message: string;
}

const contactService = {
  sendMessage: async (data: ContactRequest): Promise<ContactResponse> => {
    return apiClient.post<ContactRequest, ContactResponse>('/contact', data);
  },
};

export { contactService };
export type { ContactRequest, ContactResponse };
