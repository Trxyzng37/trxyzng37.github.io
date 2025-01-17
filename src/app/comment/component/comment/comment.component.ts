import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { VotePostService } from 'src/app/post-link/post-link/service/vote-post/vote-post.service';
import { DateTimeService } from 'src/app/shared/services/date-time/date-time.service';
import { StorageService } from 'src/app/shared/storage/storage.service';
import { CommentInfo } from 'src/app/view-detail-post/view-detail-post/pojo/comment';
import { CreateCommentResponse } from 'src/app/view-detail-post/view-detail-post/pojo/create-comment-response';
import { CreateCommentService } from 'src/app/view-detail-post/view-detail-post/service/create-comment/create-comment.service';
import tinymce from 'tinymce';
import { VoteCommentService } from '../../service/vote-comment/vote-comment.service';
import { VoteCommentResponse } from '../../pojo/vote-comment-response';
import { GetCommentStatusService } from '../../service/get-comment-status/get-comment-status.service';
import { CommentStatusResponse } from '../../pojo/comment-status-response';
import { EditCommentService } from '../../service/edit-comment/edit-comment.service';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { DeleteCommentService } from '../../service/delete-comment/delete-comment.service';
import { DeleteCommentResponse } from '../../pojo/delete-comment-response';
import { PresentationService } from 'src/app/shared/services/presentation/presentation.service';
import { VoteImgService } from 'src/app/shared/services/vote-img/vote-img.service';
import { VoteInfo } from 'src/app/shared/pojo/vote-info';
import { Router } from '@angular/router';
import { EditorSettingService } from 'src/app/shared/services/editor-setting/editor-setting.service';
import { ShareDataService } from 'src/app/shared/services/share_data/share-data.service';
import { EditorObj } from 'src/app/shared/services/share_data/editor';
import { ClearFormatService } from 'src/app/shared/services/clear-format/clear-format.service';
import { CommentCallback } from 'src/app/view-detail-post/view-detail-post/pojo/comment-callback';
import { delay } from 'rxjs';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.scss'
})
export class CommentComponent {

  public constructor(
    public sanitizer: DomSanitizer,
    private voteCommentService: VoteCommentService,
    private storageService: StorageService,
    private dateTimeService: DateTimeService,
    private createCommentService: CreateCommentService,
    private getCommentStatusService: GetCommentStatusService,
    private editCommentService: EditCommentService,
    private deleteCommentService: DeleteCommentService,
    public presentationService: PresentationService,
    public voteImgService: VoteImgService,
    private route: Router,
    public editorSettingService: EditorSettingService,
    private shareDataService: ShareDataService,
    private formatService: ClearFormatService
  ) { }


  @Input() commentData: CommentInfo = new CommentInfo(0, 0, 0, '', '', 0, '', 0, '', 0, false);
  @Input() isCommunityOwner: boolean = false;
  @Input() isPostDeleted: boolean = false;
  // @Input() editor_arr: EditorObj[] = [];
  @Input() index: number = 0;
  @Output() commentModified = new EventEmitter<CommentCallback>();

  public isCommentShow: boolean = true;
  public isDeleted: boolean = false;
  public isReplyAllowed: boolean = false;
  public isEditAllowed: boolean = false;
  public isDeleteAllowed: boolean = false;
  public isEditorShow: boolean = false;
  public isOptionShow: boolean = false;
  public isUserComment: boolean = false;
  public isUserPage: boolean = false;
  public isSendComment: boolean = false;
  public isEditComment: boolean = false;
  public isDeleteComment: boolean = false;

  public replyCommentData: string = "";
  public editCommentData: string = "";


  public voteType: string = 'none'; //none upvote downvote
  public previousVote: number = 0;
  public shownDate: string = "";
  public margin: string = "0px";
  public previousContent = "";
  public uid: number = 0;


  public upvote = "../../../../../assets/icon/upvote.png";
  public upvote_fill = "../../../../../assets/icon/upvote-comment-fill.png";
  public downvote = "../../../../../assets/icon/downvote.png";
  public downvote_fill = "../../../../../assets/icon/downvote-comment-fill.png";

  public prev_content = "";
  public editor: EditorObj = new EditorObj("", "");
  public editor_arr: EditorObj[] = [];
  public count = 0;

  ngOnChanges() {
    // console.info("editor length: "+this.editor_arr.length);
    // this.editor_arr.forEach(e => {
    //   console.log("E:"+e.editor_id);
    // })
  }

  ngOnInit() {
    this.timer();
    this.shareDataService.editor$.subscribe((e)=>{
      let exist: boolean = false;
      // this.editor_arr = this.editor_arr.filter(obj => obj.comment_id !== this.commentData._id.toString());
      for(let i=0; i<this.editor_arr.length;i++) {
        if(this.editor_arr[i].comment_id == e.comment_id)
          exist = true;
        if(this.editor_arr[i].comment_id == e.comment_id && this.editor_arr[i].editor_id != e.editor_id) {
          console.log("found at position: "+i);
          console.log("before editor_id: "+this.editor_arr[i].editor_id);
          this.editor_arr[i].editor_id = e.editor_id;
          console.log("after editor_id: "+this.editor_arr[i].editor_id);
        }
      }
      if(!exist) {
        console.log("comment id not exist")
        this.editor_arr.push(e);
        console.log("push editor_id: "+e.editor_id);

      }
    });
    this.voteImgService.selectDownVoteImg();
    this.voteImgService.selectUpVoteImg();
    this.isDeleted = this.commentData.deleted;
    this.isUserPage = window.location.href.includes("/user/");
    this.uid = this.storageService.getItem("uid") === "" ? 0 : Number(this.storageService.getItem("uid"));
    this.isUserComment = this.commentData.uid == this.uid ? true : false;
    this.isEditAllowed = this.commentData.uid == this.uid ? true : false;
    this.isDeleteAllowed = this.commentData.uid == this.uid ? true : false;
    //does not allow reply if deeper than 6
    this.isReplyAllowed = (this.commentData.level <= 6) && (this.commentData.uid != this.uid) ? true : false;
    this.shownDate = this.dateTimeService.getTimeByCompareCreatedAtAndCurrentDate(this.commentData.created_at);
    // this.margin = this.commentData.level*30 + "px";
    this.isCommentShow = this.commentData.level > 0 ? false : true;
    this.commentData.content = this.commentData.content.replace("<img src=", "<img class='img_comment' src=");
    this.commentData.content = this.commentData.content.replace(/<ol/g, '<ol class="ol" ');
    this.commentData.content = this.commentData.content.replace(/<ul/g, '<ul class="ul" ');
    this.commentData.content = this.commentData.content.replace(/<li/g, '<li style="color: var(--icon) !important;" ');
    this.commentData.content = this.commentData.content.replace(/<p>/g, '<p class="p_comment">');
    this.commentData.content = this.commentData.content.replace(/<pre/g, '<pre class="pre_code" ');
    this.commentData.content = this.commentData.content.replace(/<div/g, '<div class="div" ');
    this.commentData.content = this.commentData.content.replace(/<a/g, '<a class="a link" ');
    this.commentData.content = this.commentData.content.replace(/<figure/g, '<figure class="figure" ');
    this.commentData.content = this.commentData.content.replace(/<figcaption/g, '<figcaption class="figcaption_comment" ');
    this.commentData.content = this.commentData.content.replace(/<blockquote/g, '<blockquote class="blockquote" ');
    this.commentData.content = this.commentData.content.replace(/<p class="p_comment">&nbsp;<\/p>/g, "");
    this.previousContent = this.commentData.content;
    this.editCommentData = this.commentData.content;
    this.getCommentStatusService.getCommentStatus(this.commentData._id, this.uid).subscribe({
      next: (response: CommentStatusResponse) => {
        this.voteType = response.vote_type;
      },
      error: (e: HttpErrorResponse) => {
        console.log("HttpServletResponse: " + e.error.message + "\n" + "ResponseEntity: " + e.error);
        console.log("Error check comment status");
      }
    })
    // document.getElementById("editor")?.setAttribute("id", this.commentData._id.toString());
  }

  timer() {
    setTimeout(() => {
      const e = document.getElementById("data" + this.commentData._id.toString()) == null ? null : document.getElementById("data"+this.commentData._id.toString());
      if (e == null)
        this.timer();
      else {
        e.innerHTML = this.commentData.content;
      }
    }, 100);
  }

  showComment(event: Event) {
    this.isCommentShow = !this.isCommentShow;
    this.isEditorShow = false;
  }

  voteComment(event: Event, type: string) {
    event.stopPropagation();
    this.uid = this.storageService.getItem("uid") === "" ? 0 : Number.parseInt(this.storageService.getItem("uid"));
    if (this.uid === 0) {
      Swal.fire({
        title: "You need to sign-in to do this action",
        icon: "error",
        showConfirmButton: true,
        confirmButtonText: "OK",
        footer: '<a href="signin" style="color:red;font-size: 18px"><b>Click here to go to sign-in page<b/></a>'
      })
    }
    else {
      if (this.voteType === 'none' && type === 'upvote') {
        this.previousVote = this.commentData.vote;
        this.commentData.vote += 1;
        this.voteType = 'upvote';
      }
      else if (this.voteType === 'none' && type === 'downvote') {
        this.previousVote = this.commentData.vote;
        this.commentData.vote -= 1;
        this.voteType = 'downvote';
      }
      else if (this.voteType === 'upvote' && type === 'upvote') {
        this.previousVote = this.commentData.vote;
        this.commentData.vote -= 1;
        this.voteType = 'none';
      }
      else if (this.voteType === 'upvote' && type === 'downvote') {
        this.previousVote = this.commentData.vote;
        this.commentData.vote -= 2;
        this.voteType = 'downvote';
      }
      else if (this.voteType === 'downvote' && type === 'upvote') {
        this.previousVote = this.commentData.vote;
        this.commentData.vote += 2;
        this.voteType = 'upvote';
      }
      else if (this.voteType === 'downvote' && type === 'downvote') {
        this.previousVote = this.commentData.vote;
        this.commentData.vote += 1;
        this.voteType = 'none';
      }
      this.sendVoteCommentToServer(this.commentData.post_id, this.commentData._id, this.commentData.vote, this.voteType);
    }
  }

  sendVoteCommentToServer(post_id: number, comment_id: number, cur_vote: number, cur_vote_type: string) {
    this.voteCommentService.updateVoteComment(post_id, comment_id, cur_vote, cur_vote_type).subscribe({
      next: (response: VoteCommentResponse) => {
        console.log("Vote comment: " + response.vote_updated);
        this.commentData.vote = cur_vote;
        this.voteType = cur_vote_type;
      },
      error: (e: HttpErrorResponse) => {
        console.log("HttpServletResponse: " + e.error.message + "\n" + "ResponseEntity: " + e.error);
        // this.commentData.vote = this.previousVote;
        // this.voteType = 'none';
        console.log("Error vote post");
        console.log("vote when error: " + this.commentData.vote);
      }
    })
  }

  createReplyEditor() {
    this.uid = this.storageService.getItem("uid") === "" ? 0 : Number(this.storageService.getItem("uid"));
    if (this.uid === 0) {
      Swal.fire({
        title: "You need to sign-in to do this action",
        icon: "error",
        showConfirmButton: true,
        confirmButtonText: "OK",
        footer: '<a href="signin" style="color:red;font-size: 18px"><b>Click here to go to sign-in page<b/></a>'
      })
    }
    else {
      this.isEditorShow = true;
      if (this.count < 2) {
        setTimeout(()=>{
          const editorObj = this.editor_arr.find(obj => obj.comment_id === this.commentData._id.toString());
          if(editorObj) {
            this.editor = editorObj;
            tinymce.EditorManager.get(editorObj.editor_id)!.setContent("");
          }
        },500);
      }
      this.count++;
    }
  }

  // img_count = 0;
  // public editorSettings = {
  //   selector: "editor",
  //   base_url: '/tinymce',
  //   suffix: '.min',
  //   plugins: 'link lists codesample image autoresize',
  //   toolbar: "bold italic underline strikethrough subscript superscript removeformat numlist bullist link blockquote codesample image",
  //   toolbar_mode: 'wrap',
  //   placeholder: 'Enter your comment',
  //   automatic_uploads: true,
  //   file_picker_types: 'image',
  //   images_file_types: 'jpg,svg,webp,png,jpeg',
  //   images_reuse_filename: true,
  //   image_dimensions: false,
  //   // image_caption: true,
  //   image_description: false,
  //   statusbar: true,
  //   elementpath: false,
  //   branding: false,
  //   resize: true,
  //   width: '100%',
  //   min_height: 100,
  //   // max_height:1000,
  //   autoresize_min_height: 100,
  //   // autoresize_max_height: 300,
  //   // height: '100px', 
  //   menubar: false,
  //   draggable_modal: false,
  //   object_resizing: false,
  //   inline_boundaries: false,
  //   contenteditable: false,
  //   paste_data_images: false,
  //   paste_block_drop: false,
  //   cleanup: false,
  //   color_default_foreground: '#E03E2D',
  //   color_default_background: '#000000',
  //   color_map_background: [
  //     '000000', 'Black'
  //   ],
  //   textcolor_map: ['#E03E2D', 'Red'],
  //   custom_colors: false,
  //   content_css: 'tinymce-5',
  //   content_style:
  //     'html body { overflow: auto !important; }' +
  //     'p { margin: 0; } ' +
  //     'img { display: block; out-line: 0; max-width: 200px; max-height: 200px}' +
  //     'body {line-height: normal}' +
  //     'pre[class*=language-] {font-family: Consolas}',
  //   init_instance_callback: (editor: any) => {
  //     const backgroundColor = 'var(--neutral)';
  //     const textColor = 'var(--secondary_color)';
  //     // editor.getBody().style.backgroundColor = '#efefef';
  //     const container = editor.getContainer();
  //     let tox_tiny = container.parentElement.childNodes;
  //     let tox_tinymce = tox_tiny[2];
  //     tox_tinymce.style.border = "1px solid var(--secondary_color)";
  //     container.querySelector('.tox-editor-header').style.backgroundColor = backgroundColor;
  //     container.querySelector('.tox-editor-container').style.backgroundColor = backgroundColor;
  //     container.querySelector('.tox-toolbar').style.backgroundColor = backgroundColor;
  //     container.querySelector('.tox-toolbar').style.color = textColor;
  //     container.querySelector('.tox-statusbar').style.backgroundColor = backgroundColor;
  //     container.querySelector('.tox-statusbar').style.height = '50px';
  //     let resize_icon = container.querySelector('.tox-statusbar').querySelector('.tox-statusbar__resize-handle').querySelector('svg');
  //     resize_icon.style.fill = 'var(--secondary_color)';
  //   },
  //   file_picker_callback: (cb: any, value: any, meta: any) => {
  //     if (this.img_count == 0) {
  //       const input = document.createElement('input');
  //       input.setAttribute('type', 'file');
  //       input.setAttribute('accept', 'image/*');
  //       input.addEventListener('change', (e: any) => {
  //         const file = e.target.files[0];
  //         const reader = new FileReader();
  //         reader.addEventListener('load', () => {
  //           const id = file.name;
  //           const blobCache = tinymce.activeEditor!.editorUpload.blobCache;
  //           const base64 = (<string>reader.result).split(',')[1];
  //           const blobInfo = blobCache.create(id, file, base64);
  //           blobCache.add(blobInfo);
  //           cb(blobInfo.blobUri(), { title: file.name });
  //         });
  //         reader.readAsDataURL(file);
  //       })
  //       input.click();
  //       this.img_count++;
  //     }
  //     else {
  //       Swal.fire("Only 1 image is allow in a comment", '', 'warning');
  //     }
  //   },
  // }

  onContentChanged(event: any) {
    console.log("count: "+this.count);
    this.count++;
    const editorObj: EditorObj|undefined = this.getEditorObj();
    if(this.editor && this.count > 2) {
      if (this.isEditAllowed) {
        this.editCommentData = tinymce.EditorManager.get(this.editor.editor_id)!.getContent({ format: 'html' });
        if(this.formatService.hasInlineStyle(this.editCommentData)) {
          this.editCommentData = this.formatService.removeInlineStyle(this.editCommentData);
          tinymce.EditorManager.get(this.editor.editor_id)!.setContent(this.editCommentData);
        }
        console.log(this.editCommentData)
      }
      if (this.isReplyAllowed) {
        console.log("editor: "+editorObj?.editor_id);
        this.replyCommentData = tinymce.EditorManager.get(this.editor.editor_id)!.getContent({ format: 'html' });
        if(this.formatService.hasInlineStyle(this.replyCommentData)) {
          this.replyCommentData = this.formatService.removeInlineStyle(this.replyCommentData);
          tinymce.EditorManager.get(this.editor.editor_id)!.setContent(this.replyCommentData);
        }
      }
    }
  }

  cancelComment() {
    Swal.fire({
      titleText: "Do you want to clear this comment",
      icon: "warning",
      heightAuto: true,
      showCancelButton: true,
      showConfirmButton: true,
      focusCancel: false,
      focusConfirm: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.replyCommentData = "";
        this.editCommentData = this.commentData.content;
        tinymce.EditorManager.get(this.editor.editor_id)!.setContent("");
        this.isEditorShow = !this.isEditorShow;
        // this.isCommentShow = false;
        this.count = 0;
      }
      if (result.isDismissed) {
      }
    })
  }

  replyComment() {
    this.uid = this.storageService.getItem("uid") === "" ? 0 : Number(this.storageService.getItem("uid"));
    if (this.uid == 0) {
      Swal.fire({
        title: "You need to sign-in to do this action",
        icon: "error",
        showConfirmButton: true,
        confirmButtonText: "OK",
        footer: '<a href="signin" style="color:red;font-size: 18px"><b>Click here to go to sign-in page<b/></a>'
      })
    }
    else {
      this.isSendComment = true;
      this.replyCommentData = this.formatService.formatForCreatePost(this.replyCommentData);
      this.replyCommentData = this.formatService.removeInlineStyle(this.replyCommentData);
      this.createCommentService.createComment(this.commentData.post_id, this.commentData._id, this.replyCommentData, this.commentData.level + 1).subscribe({
        next: (response: CreateCommentResponse) => {
          this.commentModified.emit(new CommentCallback(response.comment_id, "reply_comment"));
          this.isSendComment = false;
          this.isEditorShow = false;
          this.isCommentShow = true;
          // tinymce.EditorManager.get(this.editor.editor_id)!.setContent("");
        },
        error: (e: HttpErrorResponse) => {
          this.isSendComment = false;
          console.log("HttpServletResponse: " + e.error.message + "\n" + "ResponseEntity: " + e.error);
          Swal.fire({
            titleText: "Error create comment. Please try again",
            icon: "error",
            heightAuto: true,
            showConfirmButton: true,
            focusCancel: false,
            focusConfirm: false
          })
        }
      })
    }
  }

  getEditorObj(): EditorObj|undefined {
    const editorObj = this.editor_arr.find(obj => obj.comment_id === this.commentData._id.toString());
    if(editorObj)
      return editorObj;
    return undefined;
  }

  createEditEditor() {
    this.isEditorShow = true;
    if (this.count < 2) {
      setTimeout(()=>{
        const editorObj = this.editor_arr.find(obj => obj.comment_id === this.commentData._id.toString());
        if(editorObj) {
          this.editor = editorObj;
          tinymce.EditorManager.get(editorObj.editor_id)!.setContent(this.editCommentData);
        }
      },500);
    }
    this.count++;
  }

  sendEditComment() {
    this.uid = this.storageService.getItem("uid") === "" ? 0 : Number(this.storageService.getItem("uid"));
    if (this.uid == 0) {
      Swal.fire({
        title: "You need to sign-in to do this action",
        icon: "error",
        showConfirmButton: true,
        confirmButtonText: "OK",
        footer: '<a href="signin" style="color:red;font-size: 18px"><b>Click here to go to sign-in page<b/></a>'
      })
    }
    else {
      if (this.commentData.content != this.editCommentData && this.editCommentData != "") {
        this.isEditComment = true;
        this.editCommentData = this.formatService.formatForCreatePost(this.editCommentData);
        this.editCommentData = this.formatService.removeInlineStyle(this.editCommentData);
        this.editCommentService.editComment(this.commentData.post_id, this.commentData._id, this.editCommentData).subscribe({
          next: (response: CommentInfo) => {
            this.isEditComment = false;
            this.isEditorShow = false;
            this.commentData.content = response.content;
            this.editCommentData = response.content;
            this.previousContent = response.content;
            tinymce.EditorManager.get(this.editor.editor_id)!.setContent(this.editCommentData);
            this.commentModified.emit(new CommentCallback(this.commentData._id, "edit_comment"));
            this.timer();
          },
          error: (e: HttpErrorResponse) => {
            this.isEditComment = false;
            console.log("HttpServletResponse: " + e.error.message + "\n" + "ResponseEntity: " + e.error);
            if (this.uid == 0) {
              Swal.fire({
                titleText: "Error edit comment. Please try again",
                icon: "error",
                heightAuto: true,
                showConfirmButton: true,
                focusCancel: false,
                focusConfirm: false
              })
            }
          }
        })
      }
      else {
        Swal.fire({
          titleText: "Please edit your comment",
          icon: "info",
          heightAuto: true,
          showConfirmButton: true,
          focusCancel: false,
          focusConfirm: false
        })
      }
    }
  }

  deleteComment() {
    this.uid = this.storageService.getItem("uid") === "" ? 0 : Number(this.storageService.getItem("uid"));
    if (this.uid == 0) {
      Swal.fire({
        title: "You need to sign-in to do this action",
        icon: "error",
        showConfirmButton: true,
        confirmButtonText: "OK",
        footer: '<a href="signin" style="color:red;font-size: 18px"><b>Click here to go to sign-in page<b/></a>'
      })
    }
    else {
      this.isDeleteComment = true;
      this.deleteCommentService.deleteComment(this.commentData.post_id, this.commentData._id).subscribe({
        next: (response: DeleteCommentResponse) => {
          this.commentData.content = '<em style="font-weight: 300;">Comment deleted</em>';
          this.commentData.deleted = true;
          this.isDeleted = true;
          this.isDeleteComment = false;
          this.isDeleteAllowed = false;
          this.isEditAllowed = false;
          this.isReplyAllowed = false;
          this.timer();
          this.commentModified.emit(new CommentCallback(this.commentData._id, "delete_comment"));
        },
        error: (e: HttpErrorResponse) => {
          this.isDeleteComment = false;
          console.log("HttpServletResponse: " + e.error.message + "\n" + "ResponseEntity: " + e.error);
          if (this.uid == 0) {
            Swal.fire({
              titleText: "Error delete comment. Please try again",
              icon: "error",
              heightAuto: true,
              showConfirmButton: true,
              focusCancel: false,
              focusConfirm: false
            })
          }
        }
      })
    }
  }

  deleteCommentByCommunityOwner() {
    this.uid = this.storageService.getItem("uid") === "" ? 0 : Number(this.storageService.getItem("uid"));
    if (this.uid == 0) {
      Swal.fire({
        title: "You need to sign-in to do this action",
        icon: "error",
        showConfirmButton: true,
        confirmButtonText: "Ok",
        footer: '<a href="signin" style="color:red;font-size: 18px"><b>Click here to go to sign-in page<b/></a>'
      })
    }
    else {
      this.isDeleteComment = true;
      this.deleteCommentService.deleteComment(this.commentData.post_id, this.commentData._id).subscribe({
        next: (response: DeleteCommentResponse) => {
          this.isDeleted = true;
          this.isDeleteComment = false;
          this.isDeleteAllowed = false;
          this.isEditAllowed = false;
          this.isReplyAllowed = false;
          this.commentModified.emit(new CommentCallback(this.commentData._id, "delete_community_owner"));
        },
        error: (e: HttpErrorResponse) => {
          this.isDeleteComment = false;
          console.log("HttpServletResponse: " + e.error.message + "\n" + "ResponseEntity: " + e.error);
          if (this.uid == 0) {
            Swal.fire({
              titleText: "Error delete comment. Please try again",
              icon: "error",
              heightAuto: true,
              showConfirmButton: true,
              focusCancel: false,
              focusConfirm: false
            })
          }
        }
      })
    }
  }

  goToUserPage(event: Event) {
    this.route.navigate(["/user/" + this.commentData.username + "/posts"]);
  }
}
