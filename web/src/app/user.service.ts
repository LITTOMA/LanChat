import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Admin } from '../admin';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private accessKey = '';

  constructor(
    private http: HttpClient
  ) { }

  getAccessKey() {
    return this.accessKey;
  }

  setAccessKey(accessKey: string) {
    this.accessKey = accessKey;
  }

  checkAccessKey() {
    return this.http.get<Admin>(`/api/admin?k=${this.accessKey}`);
  }
}
