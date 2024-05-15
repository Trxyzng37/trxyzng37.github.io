import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from 'src/app/shared/storage/storage.service';
import { CreateCommunityService } from 'src/app/create-community/service/create-community/create-community.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateCommunityResponse } from 'src/app/create-community/pojo/create-community-response';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommunityService } from 'src/app/shared/services/search-communites/community.service';
import { Communities } from 'src/app/shared/pojo/pojo/communities';
import { EditCommunityService } from '../service/edit-community.service';
import { EditCommunityResponse } from '../pojo/edit-community-response';

@Component({
  selector: 'app-edit-community',
  templateUrl: './edit-community.component.html',
  styleUrl: './edit-community.component.scss'
})
export class EditCommunityComponent {
  
  public constructor(
    private storageService: StorageService,
    private editCommunityService: EditCommunityService,
    private communityService: CommunityService,
    private route: Router
  ) {}


  public communityInfo!: Communities;
  public name_status: string = 'INVALID'; 
  public characterCount: number = 0;
  public description: string = "";
  public avatar_url: string = "";
  public banner_url: string = "";
  public allowSubmit: boolean = false;
  public isNameTaken: boolean = false;
  public community_id: number = 0;

  ngOnInit() {
    let found = window.location.href.match('community/([[0-9]+)');
    if(found != null) {
      this.community_id = Number.parseInt(found[1]);
      this.communityService.getCommunityInfoById(this.community_id.toString()).subscribe({
        next: (response: Communities) => {
          this.communityInfo = response;
          this.description = response.description;
          this.avatar_url = response.avatar;
          this.banner_url = response.banner;
          this.characterCount = this.description.length;
        }
    })
    }

  }

  AllowSubmit() {
    this.allowSubmit = this.description.length >= 0 && 
                       this.avatar_url.length != 0 && 
                       this.banner_url.length != 0;
    console.log(this.allowSubmit)
  }

  onInputDescription(event: any) {
    const textareaEle: any = event.target;
    textareaEle.value = textareaEle.value.replace(/(\r\n|\n|\r)/gm, "");
    textareaEle.style.height = 'auto';
    textareaEle.style.height = `${textareaEle.scrollHeight}px`;
    this.characterCount = textareaEle.value.length;
    if (textareaEle.value === "") {
      textareaEle.style.height = '48px';
      this.characterCount = 0;
    }
    this.description = textareaEle.value;
    this.AllowSubmit();
  }

  upLoadImg(event: any) {
    const files: FileList = event.target.files;
    const file = files[0];
    this.onImageUpload(file);
  }

  onImageUpload(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener("loadend", () => {
      const data = reader.result as string;
      this.avatar_url = data;
      this.AllowSubmit();
    })
  }

  upLoadBanner(event: any) {
    const files: FileList = event.target.files;
    const file = files[0];
    this.onBannerUpload(file);
  }

  onBannerUpload(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener("loadend", () => {
      const data = reader.result as string;
      this.banner_url = data;
      this.AllowSubmit();
    })
  }

  cancel() {
    Swal.fire({
      title: "Are you sure you want to cancel? All the content will be lost",
      showCancelButton: true,
      confirmButtonText: "OK",
      denyButtonText: "Continue edit"
    }).then((result) => {
      if (result.isConfirmed) {
        window.history.back();
      }
    });
  }

  submit() {
    const uid = this.storageService.getItem("uid") === "" ? 0 :  Number.parseInt(this.storageService.getItem("uid"));
    this.editCommunityService.editCommunity(this.community_id, uid, this.description, this.avatar_url, this.banner_url).subscribe({
      next: (response: EditCommunityResponse) => {
        this.isNameTaken = false;
        Swal.fire('Edit community successfully', '', 'success').then((result) => {
          if (result.isConfirmed)
            this.route.navigate(["/r/"+this.community_id]);
        })
      },
      error: (e: HttpErrorResponse) => {
        if(e.error.error_code == 1) {
          this.isNameTaken = true;
        }
      }
    })
  }
}

