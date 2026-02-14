
export enum Category {
  Logo = 'Logo Design',
  Banner = 'Banner Design',
  Poster = 'Poster Design',
  Flyer = 'Flyer Design',
  SocialMedia = 'Social Media Design',
  YouTube = 'YouTube Thumbnail',
  Ramadan = 'Ramadan Calendar',
  BusinessCard = 'Business Card',
  Others = 'Others'
}

export enum OrderStatus {
  New = 'New',
  InProgress = 'In Progress',
  Completed = 'Completed'
}

export type SubCategoryMap = {
  [key in Category]: string[];
};

export interface Project {
  id: string;
  title: string;
  category: Category;
  subCategory?: string;
  imageUrl: string;
  description: string;
}

export interface OrderData {
  id: string;
  createdAt: number;
  status: OrderStatus;
  read: boolean;
  
  // Step 1: Client Info
  name: string;
  email: string;
  whatsapp: string;
  companyName: string;
  
  // Step 2: Project Info
  category: Category;
  subCategory: string;
  projectTitle: string;
  details: string;
  deadline: string;
  budgetRange: string;

  // Step 3: Design Details
  preferredSize: string;
  colorPreference: string;
  textContent: string;
  referenceFile?: string; // Base64 or URL
  
  // Step 4: Final Actions
  agreedToTerms: boolean;
}
