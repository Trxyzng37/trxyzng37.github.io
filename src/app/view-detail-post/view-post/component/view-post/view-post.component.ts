
  import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
  import { Router } from '@angular/router';
  import { GalleryItem } from 'ng-gallery';
  import { GetPostResponse } from 'src/app/post-link-list/pojo/get-post-response';
  import { StorageService } from 'src/app/shared/storage/storage.service';
  import { HttpErrorResponse } from '@angular/common/http';
  import { VotePostService } from '../../../../post-link/post-link/service/vote-post/vote-post.service';
  import { CheckVotePostService } from '../../../../post-link/post-link/service/check-vote-post/check-vote-post.service';
  import { CheckVotePostResponse } from '../../../../post-link/post-link/service/check-vote-post/pojo/check-vote-post-response';
  import { VotePostResponse } from '../../../../post-link/post-link/service/vote-post/pojo/vote-post-response';
  import { DateTimeService } from 'src/app/shared/services/date-time/date-time.service';
  
  @Component({
    selector: 'app-post',
    templateUrl: './view-post.component.html',
    styleUrl: './view-post.component.scss'
  })
  export class PostComponent {
    constructor (
      private router: Router,
      private votePostServie: VotePostService,
      private storageService: StorageService,
      private dateTimeService: DateTimeService,
      private checkVotePostService: CheckVotePostService
    ) {}
  
    @Input() post_id: number = 0;
    @Input() type: string = "";
    @Input() communityName: string = "";
    @Input() userName: string = "";
    @Input() title: string = "";
    @Input() content: string = "";
    @Input() created_at: string = "";
    @Input() vote: number = 1;
    @Input() communityIcon: string = "";
    @Input() index: number = 0;
    @Input() arr_length: number = 0;
  
    @Output() event = new EventEmitter<GetPostResponse>();
      
    public images!: GalleryItem[];
    public voteType: string = 'none'; //none upvote downvote
    public previousVote: number = this.vote;
    public shownDate: string = "";
  
    ngOnInit() {
      this.shownDate = this.dateTimeService.getTimeByCompareCreatedAtAndCurrentDate(this.created_at);
      const username: string = this.storageService.getItem("username");
      this.checkVotePostService.checkVotePost(this.post_id, username).subscribe({
        next: (response: CheckVotePostResponse) => {
          this.voteType  = response.vote_type;
        },
        error: (e: HttpErrorResponse) => {
          console.log("HttpServletResponse: " + e.error.message + "\n" + "ResponseEntity: " + e.error);
        }
      })
    }  
  
    preventClick(event: Event) {
      event.stopPropagation();
    }
  
    public isOptionMenuOpen: boolean = false;
  
    openOptionMenu(event: Event) {
      this.isOptionMenuOpen = !this.isOptionMenuOpen;
      console.log("Option menu open")
      event.stopPropagation();
    }
  
    @HostListener('document:click', ['$event'])
    closeProfileMenu(event: Event) {
        this.isOptionMenuOpen = false;
        console.log("profile meneu close")
    }
  
    votePost(event: Event, type: string) {
      event.stopPropagation();
      if (this.voteType === 'none' && type === 'upvote') {
        this.previousVote = this.vote;
        this.vote += 1;
        this.voteType = 'upvote';
      }
      else if (this.voteType === 'none' && type === 'downvote') {
        this.previousVote = this.vote;
        this.vote -= 1;
        this.voteType = 'downvote';
      }
      else if (this.voteType === 'upvote' && type === 'upvote') {
        this.previousVote = this.vote;
        this.vote -= 1;
        this.voteType = 'none';
      }
      else if (this.voteType === 'upvote' && type === 'downvote') {
        this.previousVote = this.vote;
        this.vote -= 2;
        this.voteType = 'downvote';
      }
      else if (this.voteType === 'downvote' && type === 'upvote') {
        this.previousVote = this.vote;
        this.vote += 2;
        this.voteType = 'upvote';
      }
      else if (this.voteType === 'downvote' && type === 'downvote') {
        this.previousVote = this.vote;
        this.vote += 1;
        this.voteType = 'none';
      }
      console.log(this.post_id + ": " + this.vote);
      this.sendVotePostToServer();
    }
  
    sendVotePostToServer() {
      const username: string = this.storageService.getItem("username");
      this.votePostServie.votePost(this.post_id, this.vote, username, this.voteType).subscribe({
        next: (response: VotePostResponse) => {
          console.log("Vote post_id: "+response.post_id);
        },
        error: (e: HttpErrorResponse) => {
          console.log("HttpServletResponse: " + e.error.message + "\n" + "ResponseEntity: " + e.error);
          this.vote = this.previousVote;
          this.voteType = 'none';
          console.log("Error vote post");
          console.log("vote when error: "+this.vote);
        }
      })
    }
  
  }
  
