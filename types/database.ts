export interface User {
  email: string;
  displayName: string;
  role: 'user' | 'editor' | 'admin';
  profilePicture?: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Article {
  id?: string;
  title: string;
  content: string;
  authorId: string;
  categoryId: string;
  language: string;
  status: 'pending' | 'approved' | 'rejected';
  editorStatus: 'pending' | 'approved' | 'rejected';
  adminStatus: 'pending' | 'approved' | 'rejected';
  approvedEditorIdUid?: string;
  approvedAdminUid?: string;
  createdAt: Date;
  updatedAt: Date;
  audioUrl?: string | null;
  imageUrl?: string | null;
  plagiarismStatus: 'checked' | 'unchecked';
  editorComments?: string;
  isPublished: boolean;
}

export interface EditorReview {
  articleId: string;
  editorId: string;
  status: 'approved' | 'rejected' | 'request edit';
  comments: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminAction {
  articleId: string;
  adminId: string;
  action: 'publish' | 'reject' | string;
  comments: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AudioFile {
  articleId: string;
  audioUrl: string;
  generatedAt: Date;
}

export interface Comment {
  articleId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Like {
  articleId: string;
  userId: string;
  createdAt: Date;
}

export interface Share {
  articleId: string;
  userId: string;
  createdAt: Date;
}

export interface DatabaseSchema {
  users: {
    [userId: string]: User;
  };
  categories: {
    [categoryId: string]: Category;
  };
  articles: {
    [articleId: string]: Article;
  };
  editorReviews: {
    [reviewId: string]: EditorReview;
  };
  adminActions: {
    [actionId: string]: AdminAction;
  };
  audioFiles: {
    [audioId: string]: AudioFile;
  };
  comments: {
    [commentId: string]: Comment;
  };
  likes: {
    [likeId: string]: Like;
  };
  shares: {
    [shareId: string]: Share;
  };
} 