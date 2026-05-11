import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { AuthService } from '../../services/auth/auth.service';
import { Preferences } from '@capacitor/preferences';
import { DomSanitizer, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';

export interface Post {
  id: string;
  authorName: string;
  authorAvatar: string;
  time: string;
  content: string;
  media?: { type: 'image' | 'video', url: string }[];
  likes: number;
  comments: number;
  likedByMe?: boolean;
  commentsList?: { id: string; authorName: string; authorAvatar: string; text: string; time: string; isEditing?: boolean; editedText?: string; }[];
  showComments?: boolean;
  newCommentText?: string;
  isExpandedMedia?: boolean;
  isEditingPost?: boolean;
  editedContent?: string;
  editedMedia?: { type: 'image' | 'video', url: string }[];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  private authService = inject(AuthService);
  private actionSheetCtrl = inject(ActionSheetController);
  private sanitizer = inject(DomSanitizer);

  @ViewChild('imageInput', { static: false }) imageInput!: ElementRef;
  @ViewChild('videoInput', { static: false }) videoInput!: ElementRef;

  posts: Post[] = [];

  currentUser: any;
  // TODO: Replace with a URL returned from the user profile API once the backend is ready.
  userAvatar: string = 'assets/avatars/avatar-1.png';

  newPostContent: string = '';
  newPostMedia: { type: 'image' | 'video', url: string }[] = [];

  notifications: any[] = [];

  get unreadNotifications() {
    return this.notifications.filter(n => !n.read).length;
  }

  markNotificationsRead() {
    this.notifications.forEach(n => n.read = true);
  }

  getSafeUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  getSafeResourceUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  async ngOnInit() {
    this.currentUser = await this.authService.getUserData();
    if (!this.currentUser) {
      // TODO: Redirect to login page once real session validation is in place.
      this.currentUser = { name: 'Guest' };
    }
    // Load locally-stored profile image (persists across sessions)
    const { value: profileImage } = await Preferences.get({ key: 'profileImage' });
    if (profileImage) this.userAvatar = profileImage;
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      // TODO: Replace with real API call to refresh the post feed.
      // this.posts = await this.apiService.getFeedPosts();
      event.target.complete();
    }, 1500);
  }

  triggerImageInput() {
    this.imageInput.nativeElement.click();
  }

  triggerVideoInput() {
    this.videoInput.nativeElement.click();
  }

  onMediaSelected(event: Event, type: 'image' | 'video') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result && typeof reader.result === 'string') {
            this.newPostMedia.push({ type, url: reader.result });
          }
        };
        reader.readAsDataURL(file);
      });
    }
    input.value = '';
  }

  removeMedia(index: number) {
    this.newPostMedia.splice(index, 1);
  }

  clearMedia() {
    this.newPostMedia = [];
  }

  createPost() {
    if (!this.newPostContent.trim() && this.newPostMedia.length === 0) {
      return;
    }

    const newPost: Post = {
      id: Date.now().toString(),
      authorName: this.currentUser.name,
      authorAvatar: this.userAvatar,
      time: 'Just now',
      content: this.newPostContent,
      likes: 0,
      comments: 0,
      isExpandedMedia: false
    };

    if (this.newPostMedia.length > 0) {
      newPost.media = [...this.newPostMedia];
    }

    this.posts.unshift(newPost);
    this.newPostContent = '';
    this.clearMedia();
  }

  toggleLike(post: Post) {
    if (post.likedByMe) {
      post.likes--;
      post.likedByMe = false;
    } else {
      post.likes++;
      post.likedByMe = true;
    }
  }

  openComments(post: Post) {
    post.showComments = !post.showComments;
  }

  addComment(post: Post) {
    if (!post.newCommentText || !post.newCommentText.trim()) return;

    if (!post.commentsList) {
      post.commentsList = [];
    }

    post.commentsList.push({
      id: Date.now().toString(),
      authorName: this.currentUser.name,
      authorAvatar: this.userAvatar,
      text: post.newCommentText,
      time: 'Just now'
    });

    post.comments++;
    post.newCommentText = '';
  }

  sharePost(post: Post) {
    // TODO: Implement share functionality when backend is connected.
    console.log('Share post:', post.id);
  }

  async openPostOptions(post: Post) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'More Options',
      buttons: [
        {
          text: 'Edit Post',
          icon: 'create-outline',
          handler: () => { this.startEditPost(post); }
        },
        {
          text: 'Save',
          icon: 'save-outline',
          handler: () => { console.log('TODO: Save post', post.id); }
        },
        {
          text: 'Bookmark',
          icon: 'bookmark-outline',
          handler: () => { console.log('TODO: Bookmark post', post.id); }
        },
        {
          text: 'Pin',
          icon: 'pin-outline',
          handler: () => { console.log('TODO: Pin post', post.id); }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  startEditComment(comment: any) {
    comment.isEditing = true;
    comment.editedText = comment.text;
  }

  saveEditComment(comment: any) {
    if (!comment.editedText || !comment.editedText.trim()) return;
    comment.text = comment.editedText.trim();
    comment.isEditing = false;
  }

  cancelEditComment(comment: any) {
    comment.isEditing = false;
  }

  startEditPost(post: Post) {
    post.isEditingPost = true;
    post.editedContent = post.content;
    post.editedMedia = post.media ? [...post.media] : [];
  }

  saveEditPost(post: Post) {
    if (!post.editedContent && (!post.editedMedia || post.editedMedia.length === 0)) return;
    post.content = (post.editedContent || '').trim();
    post.media = post.editedMedia ? [...post.editedMedia] : [];
    post.isEditingPost = false;
  }

  cancelEditPost(post: Post) {
    post.isEditingPost = false;
    post.editedMedia = undefined;
  }

  removeEditMedia(post: Post, index: number) {
    if (post.editedMedia) {
      post.editedMedia.splice(index, 1);
    }
  }

  addMediaToEdit(event: Event, post: Post, type: 'image' | 'video') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result && typeof reader.result === 'string') {
            if (!post.editedMedia) post.editedMedia = [];
            post.editedMedia.push({ type, url: reader.result });
          }
        };
        reader.readAsDataURL(file);
      });
    }
    input.value = '';
  }
}
