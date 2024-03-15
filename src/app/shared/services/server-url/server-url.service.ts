import { Injectable } from '@angular/core';
import { Constant } from '../../../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class ServerUrlService {
  private url: string;
  
  constructor() { 
    this.url = `${Constant.PROTOCOL}://${Constant.IP_ADDRESS}:${Constant.PORT}`;
  }

  getUrl(): string {
    return this.url;
  }

  createFullUrl(endpoint: string): string {
    return this.url + endpoint;
  }
}
