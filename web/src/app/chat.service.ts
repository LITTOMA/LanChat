import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { Chat } from '../chat';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) { }

  getChats() {
    return this.http.get<Chat[]>(`/api/chats?k=${this.userService.getAccessKey()}`);
  }

  addChat(chat: Chat) {
    return this.http.post<Chat>(`/api/chats?k=${this.userService.getAccessKey()}`, chat);
  }

  deleteChat(chat: Chat) {
    return this.http.delete(`/api/chats/${chat.id}?k=${this.userService.getAccessKey()}`);
  }

  uploadFile(chat: Chat, file: File) {
    var formData: FormData = new FormData();
    formData.append('file', file);
    var req = new HttpRequest('POST', `/api/files/${chat.id}?k=${this.userService.getAccessKey()}`, formData, {
      reportProgress: true,
      responseType: 'json'
    })
    return this.http.request<Chat>(req);
  }

  getFile(chat: Chat) {
    var a = document.createElement('a');
    a.href = `/api/files/${chat.id}?k=${this.userService.getAccessKey()}`;
    a.download = chat.message;
    a.click();
  }
}
