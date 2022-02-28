import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ChatService } from './chat.service';
import { UserService } from './user.service';
import { Chat } from '../chat';
import { ChatListComponent } from './chat-list/chat-list.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  title = 'LanChat';
  chatContent: string = '';

  @ViewChild('chatList', { static: true })
  chatList!: ChatListComponent;

  // constructor
  constructor(
    private http: HttpClient,
    private chatService: ChatService,
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    // get access key from current page query string
    var accessKey = '';
    const query = window.location.search.substring(1);
    const queries = query.split('&');
    for (const q of queries) {
      const kv = q.split('=');
      if (kv[0] === 'k') {
        accessKey = kv[1];
        break;
      }
    }

    // set access key
    this.setupAccessKey(accessKey, false);
  }

  setupAccessKey(accessKey: string, redirect: boolean) {
    this.userService.setAccessKey(accessKey);
    this.userService.checkAccessKey().subscribe(
      (admin: any) => {
        // success

        // redirect with access key
        if (redirect) {
          window.location.href = `/?k=${accessKey}`;
        }
      },
      (error: any) => {
        // error
        var input = prompt('Please enter your access key:');
        if (input) {
          this.setupAccessKey(input, true);
        }
      }
    );
  }

  openFile() {

  }

  postChat() {
    var chat = {} as Chat;
    chat.message = this.chatContent;
    chat.type = 'text/plain';
    this.chatService.addChat(chat).subscribe(
      (chat: Chat) => {
        this.chatContent = '';
        this.chatList.refreshChatList();
      }
    );
  }
}
