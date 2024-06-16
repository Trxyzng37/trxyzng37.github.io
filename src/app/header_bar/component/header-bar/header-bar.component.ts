import { Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from 'src/app/shared/storage/storage.service';
import { Communities } from '../../../shared/pojo/pojo/communities';
import { CommunityService } from '../../../shared/services/search-communites/community.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UserProfile } from '../../../shared/pojo/pojo/user-profile';
import { SearchUserProfileService } from '../../../shared/services/search-user-profile/search-user-profile.service';
import { Router } from '@angular/router';
import { PresentationService } from 'src/app/shared/services/presentation/presentation.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header-bar',
  templateUrl: './header-bar.component.html',
  styleUrl: './header-bar.component.scss'

})
export class HeaderBarComponent {
  public constructor(
    private storageService: StorageService,
    private searchCommunitiesService: CommunityService,
    private searchUserProfileService: SearchUserProfileService,
    private userProfileService: SearchUserProfileService,
    private router: Router,
    public presentationService: PresentationService 
  ) {}

  @Output() openNavigationEvent = new EventEmitter<Object>;

  public isSignIn: boolean = false;
  public isProfileMenuOpen: boolean = false;
  public communities_result: Communities[] = [];
  public user_profile_result: UserProfile[] = [];
  public userInfo: UserProfile = new UserProfile(0,'','','',0,0,'');
  public background_mode: string = "Dark mode"; 
  public isSearch: boolean = false;

  ngOnInit() {
    this.isSignIn = (this.storageService.getItem("uid") != "" && this.storageService.getItem("uid") != "0") ? true:false;
    const uid = this.storageService.getItem("uid") == "" ? 0 : Number.parseInt(this.storageService.getItem("uid")); 
    this.userProfileService.getUserProfileByUid(uid).subscribe({
      next: (response: UserProfile) => {
        this.userInfo = response;
      }
    })
    if (window.innerWidth < 900) {
      this.isOpen = false;
      this.openNavigationEvent.emit({
        data: this.isOpen
      });
    }
    let isSearchPage = window.location.href.includes("/search/");
    if(isSearchPage) {
      let regex = '/search/([^*]+)';
      const a = window.location.href.match(regex);
      if(a != null) {
        let search_value = a[1];
        const search_box = <HTMLInputElement>document.getElementById("search_box");
        search_box.value = search_value;
        this.onChange(search_value);
      }
    }
  }

  onClick() {
    this.isSignIn = !this.isSignIn;
    console.log(this.storageService.getItem("isSignIn"))
  }

  onChange(value: string) {
    if (value !== " " && value !== "") {
      this.searchCommunitiesService.searchCommunities(value).subscribe({
        next: (response: Communities[]) => {
          console.log(response)
          this.communities_result = response.slice(0,4);
          const search = <HTMLInputElement>document.getElementById("search_box");
          this.isSearch = search.value.length > 0;
        },
        error: (e: HttpErrorResponse) => {
          console.log("HttpServletResponse: " + e.error.message + "\n" + "ResponseEntity: " + e.error);
        }
      })
      this.searchUserProfileService.searchUserProfile(value).subscribe({
        next: (response: UserProfile[]) => {
          console.log(response)
          this.user_profile_result = response.slice(0,4);
          const search = <HTMLInputElement>document.getElementById("search_box");
          this.isSearch = search.value.length > 0;
        },
        error: (e: HttpErrorResponse) => {
          console.log("HttpServletResponse: " + e.error.message + "\n" + "ResponseEntity: " + e.error);
        }
      })
    }
    else {
      this.communities_result = [];
      this.user_profile_result = [];
      const search = <HTMLInputElement>document.getElementById("search_box");
      this.isSearch = search.value.length > 0;
    }
  }

  openProfileMenu(event: Event) {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    console.log("profile meneu open")
    event.stopPropagation();
  }

  @HostListener('document:click', ['$event'])
  closeProfileMenu(event: Event) {
      this.isProfileMenuOpen = false;
      console.log("profile meneu close")
      const cellText = document.getSelection();
      if (cellText?.type === 'Range') 
        event.stopPropagation();
    
  }

  logOut() {
    Swal.fire({
      'text': 'Are you sure you want to log out ?',
      icon: 'warning',
      showCancelButton: true,
      showConfirmButton: true,
      focusCancel: false,
      focusConfirm: false,
    }).then((result)=>{
      if(result.isConfirmed) {
        this.router.navigate(["/signin"])
        this.storageService.removeItem("uid");
        this.storageService.removeItem("username");
      }
      else {
        this.isProfileMenuOpen = false;
      }
    })

  }

  navigateToUserProfile() {
    window.location.href = "/user/" + this.userInfo.username;
  }

  createPost() {
    window.location.href = "/create-post";
  }

  isOpen = false;
  opeNavigation() {
    this.isOpen = !this.isOpen;
    this.openNavigationEvent.emit({
      data: this.isOpen
    });
  }

  useDarkMode() {
    const mode = this.storageService.getItem("mode") == "1" ? 1 : 0;
    if(mode == 0) {
      document.body.style.setProperty("--primary_background_color", "#222831");
      document.body.style.setProperty("--neutral", "#31363F");
      document.body.style.setProperty("--secondary_color", "#ffffff");
      let el = document.querySelectorAll<HTMLElement>('*');
      for(var i=0;i<el.length;i++){
        el[i].style.color = '#ffffff';
      }
      this.background_mode = "Light mode";
      this.storageService.setItem('mode', "1");
    }
    else {
      document.body.style.setProperty("--primary_background_color", "#ffffff");
      document.body.style.setProperty("--neutral", "#efefef");
      document.body.style.setProperty("--secondary_color", "#000000");
      let el = document.querySelectorAll<HTMLElement>('*');
      for(var i=0;i<el.length;i++){
        el[i].style.color = '#000000';
      }
      this.background_mode = "Dark mode";
      this.storageService.setItem('mode', "0");
    }
    this.isProfileMenuOpen = false;
  }
}
