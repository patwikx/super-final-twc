// services/blogService.ts
import apiClient from '@/lib/axios';
import { BlogPost } from '@prisma/client';

// Define a type for the data needed to create a new BlogPost.
export type CreateBlogPostData = Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>;

// Define a type for the data needed to update a BlogPost.
export type UpdateBlogPostData = Partial<CreateBlogPostData>;

/**
 * Fetches all blog posts from the API.
 */
export const getBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const response = await apiClient.get<BlogPost[]>('/blog');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    throw new Error('Could not fetch blog posts. Please try again later.');
  }
};

/**
 * Fetches a single blog post by its ID from the API.
 */
export const getBlogPostById = async (id: string): Promise<BlogPost> => {
  try {
    const response = await apiClient.get<BlogPost>(`/blog/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch blog post with id ${id}:`, error);
    throw new Error('Could not fetch blog post. Please try again later.');
  }
};

/**
 * Creates a new blog post.
 */
export const createBlogPost = async (data: CreateBlogPostData): Promise<BlogPost> => {
  try {
    const response = await apiClient.post<BlogPost>('/blog', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create blog post:', error);
    throw new Error('Could not create blog post. Please try again later.');
  }
};

/**
 * Updates an existing blog post.
 */
export const updateBlogPost = async (id: string, data: UpdateBlogPostData): Promise<BlogPost> => {
    try {
        const response = await apiClient.patch<BlogPost>(`/blog/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Failed to update blog post with id ${id}:`, error);
        throw new Error('Could not update blog post. Please try again later.');
    }
};

/**
 * Deletes a blog post by its ID.
 */
export const deleteBlogPost = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/blog/${id}`);
    } catch (error) {
        console.error(`Failed to delete blog post with id ${id}:`, error);
        throw new Error('Could not delete blog post. Please try again later.');
    }
};
