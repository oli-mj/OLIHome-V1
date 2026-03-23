import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { AuthService } from '../../services/auth/auth.service';
import { Preferences } from '@capacitor/preferences';

export interface Post {
  id: string;
  authorName: string;
  authorAvatar: string;
  time: string;
  content: string;
  image?: string;
  video?: string;
  likes: number;
  comments: number;
  likedByMe?: boolean;
  commentsList?: { id: string; authorName: string; authorAvatar: string; text: string; time: string; isEditing?: boolean; editedText?: string; }[];
  showComments?: boolean;
  newCommentText?: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  @ViewChild('imageInput', { static: false }) imageInput!: ElementRef;
  @ViewChild('videoInput', { static: false }) videoInput!: ElementRef;

  posts: Post[] = [];

  currentUser: any;
  userAvatar: string = 'https://i.pravatar.cc/150?u=user1';

  newPostContent: string = '';
  newPostImage: string | ArrayBuffer | null = null;
  newPostVideo: string | ArrayBuffer | null = null;

  constructor(private authService: AuthService, private actionSheetCtrl: ActionSheetController) { }

  async ngOnInit() {
    this.currentUser = await this.authService.getUserData();
    if (!this.currentUser) {
       this.currentUser = { name: 'User 01' }; // Fallback
    }
    const { value: profileImage } = await Preferences.get({ key: 'profileImage' });
    if(profileImage) this.userAvatar = profileImage;
  }

  handleRefresh(event: any) {
    // Simulate a network delay for the UX
    setTimeout(() => {
      // Future data fetching API call goes here:
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
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'image') {
          this.newPostImage = reader.result;
          this.newPostVideo = null;
        } else {
          this.newPostVideo = reader.result;
          this.newPostImage = null;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  clearMedia() {
    this.newPostImage = null;
    this.newPostVideo = null;
  }

  createPost() {
    if (!this.newPostContent.trim() && !this.newPostImage && !this.newPostVideo) {
      return;
    }

    const newPost: Post = {
      id: Date.now().toString(),
      authorName: this.currentUser.name,
      authorAvatar: this.userAvatar,
      time: 'Just now',
      content: this.newPostContent,
      likes: 0,
      comments: 0
    };

    if (this.newPostImage && typeof this.newPostImage === 'string') {
      newPost.image = this.newPostImage;
    }

    if (this.newPostVideo && typeof this.newPostVideo === 'string') {
      newPost.video = this.newPostVideo; 
    }

    // Insert new post at top of feed
    this.posts.unshift(newPost);

    // Reset fields
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
    console.log('Sharing post:', post.id);
  }

  async openPostOptions(post: Post) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'More Options',
      buttons: [
        {
          text: 'Save',
          icon: 'save-outline',
          handler: () => {
            console.log('Save clicked for post:', post.id);
          }
        },
        {
          text: 'Bookmark',
          icon: 'bookmark-outline',
          handler: () => {
            console.log('Bookmark clicked for post:', post.id);
          }
        },
        {
          text: 'Pin',
          icon: 'pin-outline',
          handler: () => {
            console.log('Pin clicked for post:', post.id);
          }
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
}
