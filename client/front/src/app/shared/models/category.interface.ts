
export interface CategoryInterface {
  _id: string;
  name: string;
  slug: string;
  parentID: string | null; // Can be null for top-level categories
  isDeleted: boolean;
  isActive: boolean;
  createdAt: string; // Or Date
  updatedAt: string; // Or Date
}
