import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Communities } from 'src/app/shared/pojo/pojo/communities';
import { UserInfoService } from 'src/app/shared/services/user-info/user-info.service';
import { UserProfile } from 'src/app/shared/pojo/pojo/user-profile';
import { CommunityService } from 'src/app/shared/services/search-communites/community.service';
import { StorageService } from 'src/app/shared/storage/storage.service';
import { JoinCommunityResponse } from 'src/app/shared/services/search-communites/pojo/join-community-response';
import { GetPostService } from 'src/app/view-detail-post/view-detail-post/service/get-post/get-post.service';
import { GetPostResponse } from 'src/app/post-link-list/pojo/get-post-response';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'community-info',
  templateUrl: './community-info.component.html',
  styleUrl: './community-info.component.scss'
})
export class CommunityInfoComponent {

  constructor (
    private userInfoService: UserInfoService,
    private communityService: CommunityService,
    private storageService: StorageService
  ) {}

  @Input() community_info: Communities = new Communities(0, "", 0, "", "", 0, "", "");

  public userInfo: UserProfile = new UserProfile(0, "", "", "", 0, "");
  public isJoinCommunity: boolean = false;
  public isCommunityPage: boolean = false;
  public joinText: string = this.isJoinCommunity ? 'Leave' : 'Join';

  ngOnInit() {
    this.isCommunityPage = window.location.href.includes("/r/");
  }

  ngOnChanges() {
    this.userInfoService.getUserInfo(this.community_info.uid).subscribe({
      next: (response: UserProfile) => {
        this.userInfo = response;
      }
    })
    const uid = this.storageService.getItem("uid") == "" ? 0 : Number.parseInt(this.storageService.getItem("uid"));
    this.communityService.checkJoinCommunityStatus(uid, this.community_info.id).subscribe({
      next: (response: JoinCommunityResponse) => {
        this.isJoinCommunity = response.join_community == 0 ? false : true;
        this.joinText = this.isJoinCommunity ? 'Leave' : 'Join';
      }
    })
  }

  joinCommunity(event: Event) {
    event.stopPropagation();
    const uid: number = this.storageService.getItem("uid") == "" ? 0 :  Number.parseInt(this.storageService.getItem("uid"));
    this.communityService.joinCommunity(uid, this.community_info.id, this.isJoinCommunity == false ? 1 : 0).subscribe({
      next: (response: JoinCommunityResponse) => {
        this.isJoinCommunity = response.join_community == 0 ? false : true;
        this.joinText = this.isJoinCommunity ? 'Leave' : 'Join';
      },
      error: (e: HttpErrorResponse) => {
        console.log("error join community");
      }
    })
  }
}