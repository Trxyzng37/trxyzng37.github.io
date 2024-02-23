import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PassCodeRequest } from 'src/app/shared/pojo/passcode-request';
import { DateTimeService } from 'src/app/shared/services/date-time/date-time.service';
import { PostService } from 'src/app/shared/services/post/post.service';
import { ServerUrlService } from 'src/app/shared/services/server-url/server-url.service';
import { ResendEmailPasscodeResponse } from '../../pojo/resend-email-passcode-response';
import { PasscodeResponse } from 'src/app/shared/pojo/passcode-response';
import { ResendEmailPasscodeRequest } from '../../pojo/resend-email-passcode-request';
import { StorageService } from 'src/app/shared/storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class ConfirmEmailService {

  constructor (
    private serverurl: ServerUrlService, 
    private postService: PostService,
    private dateTimeService: DateTimeService,
    private storageService: StorageService
  ) { }

  private endpoint: string = "/check-confirm-email-passcode";
  private fullUrl: string = this.serverurl.getUrl() + this.endpoint;

  public checkConfirmEmailPasscode(passcode: number): Observable<PasscodeResponse> {
    const email: string = this.storageService.getItem("confirm_email");
    if (email === "")
      alert("Empty email for confirm email");
    const pascode: number = passcode;
    const sendAt: Date = this.dateTimeService.getCurrentDateTime();
    const passcodeData: PassCodeRequest = new PassCodeRequest(email, pascode, sendAt);
    const body: string = JSON.stringify(passcodeData);
    const header: HttpHeaders = new HttpHeaders();
    return this.postService.post(this.endpoint, header, body, false);
  }

  public reSendPasscode(email: string): Observable<ResendEmailPasscodeResponse> {
    const endpoint: string = "/resend-confirm-email-passcode";
    const resendEmailPasscodeRequest: ResendEmailPasscodeRequest = new ResendEmailPasscodeRequest(email);
    const requestBody: string = JSON.stringify(resendEmailPasscodeRequest);
    const header: HttpHeaders = new HttpHeaders();
    return this.postService.post(endpoint, header, requestBody, false);
  }
}
