export interface Media {
  type: 'image' | 'video';
  url: string;
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  time: string;
  isEditing?: boolean;
  editedText?: string;
}

export interface Post {
  id: string;
  authorName: string;
  authorAvatar: string;
  time: string;
  content: string;
  media?: Media[];
  likes: number;
  comments: number;
  likedByMe?: boolean;
  commentsList?: Comment[];
  showComments?: boolean;
  newCommentText?: string;
  isExpandedMedia?: boolean;
  isEditingPost?: boolean;
  editedContent?: string;
  editedMedia?: Media[];
}
