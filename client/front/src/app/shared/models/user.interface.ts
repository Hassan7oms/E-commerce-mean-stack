
export interface IAddress {
  _id?: string; // Mongoose adds _id to sub-documents
  label?: string;
  street?: string;
  city?: string;
  country?: string;
  zip?: string;
  area?: string;
  building?: string;
  apartment?: string;
  isDefault?: boolean;
}

export interface UserInterface {
  _id: string;
  name: {
    first: string;
    last: string;
  };
  email: string;
  password?: string; // Often excluded from frontend models after login
  role: 'customer' | 'admin';
  addresses: IAddress[];
  isDeleted: boolean;
  createdAt: string; // Or Date
  updatedAt: string; // Or Date
}