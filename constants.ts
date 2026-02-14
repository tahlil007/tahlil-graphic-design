
import { Category, Project, SubCategoryMap } from './types';

export const SUB_CATEGORIES: SubCategoryMap = {
  [Category.Logo]: ['Minimalist Logo', 'Text-Based Logo', 'Iconic / Symbol Logo', 'Mascot Logo'],
  [Category.Banner]: ['Web Banner', 'Event Banner', 'Print Banner'],
  [Category.Poster]: ['Event Poster', 'Movie Poster', 'Product Poster', 'Typography Poster'],
  [Category.Flyer]: ['Business Flyer', 'Party Flyer', 'Corporate Flyer'],
  [Category.SocialMedia]: ['Instagram Post', 'Facebook Post', 'LinkedIn Post', 'Twitter Post', 'Carousel'],
  [Category.YouTube]: ['Gaming Thumbnail', 'Vlog Thumbnail', 'Tutorial Thumbnail', 'Review Thumbnail'],
  [Category.Ramadan]: ['Printable Calendar', 'Digital Calendar', 'Custom Theme'],
  [Category.BusinessCard]: ['Standard Business Card', 'Minimalist Style', 'Creative / Unique Shape'],
  [Category.Others]: ['Invitation Card', 'T-Shirt Design', 'Custom Graphics']
};

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Minimalist Tech Logo',
    category: Category.Logo,
    subCategory: 'Minimalist Logo',
    imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800',
    description: 'A modern vector logo for a software startup.'
  },
  {
    id: '2',
    title: 'Luxury Real Estate Logo',
    category: Category.Logo,
    subCategory: 'Iconic / Symbol Logo',
    imageUrl: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&q=80&w=800',
    description: 'Gold-themed branding for a premium agency.'
  },
  {
    id: '3',
    title: 'Summer Event Banner',
    category: Category.Banner,
    subCategory: 'Event Banner',
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800',
    description: 'Large scale outdoor event banner.'
  },
  {
    id: '4',
    title: 'Social Media Branding',
    category: Category.SocialMedia,
    subCategory: 'Instagram Post',
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800',
    description: 'Instagram profile brand identity.'
  },
  {
    id: '5',
    title: 'Minimalist Business Cards',
    category: Category.BusinessCard,
    subCategory: 'Minimalist Style',
    imageUrl: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6?auto=format&fit=crop&q=80&w=800',
    description: 'Premium business card design for consultants.'
  }
];
