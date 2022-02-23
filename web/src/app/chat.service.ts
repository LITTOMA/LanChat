import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    
  }

  deleteChat(chat: Chat) {
    this.http.delete(`/api/chats/${chat.id}?k=${this.userService.getAccessKey()}`).subscribe();
  }
}
