import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Chat } from '../../chat';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.less']
})
export class ChatListComponent implements OnInit {
  chats!: Chat[];

  @ViewChild('chatViewport', { static: true })
  chatViewport!: CdkVirtualScrollViewport;

  constructor(
    private chatService: ChatService
  ) { }

  ngOnInit(): void {
    this.chats = [];
    setInterval(() => {
      this.refreshChatList();
    }, 3000);
  }

  copy(s: string) {
    // copy chat.message to clipboard
    const textarea = document.createElement('textarea');
    textarea.value = s;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }

  delete(chat: Chat) {
    this.chatService.deleteChat(chat).subscribe(
      () => {
        // success
        this.refreshChatList();
      },
      (error: any) => {
        // error
      }
    );
  }

  download(chat: Chat) {
    this.chatService.getFile(chat);
  }

  refreshChatList() {
    this.chatService.getChats().subscribe(
      (chats: Chat[]) => {
        if (!this.chats) {
          this.chats = chats;
        } else {
          var tempChats = this.chats.filter(chat => chat.progress !== 100);
          this.chats = tempChats.concat(chats);
        }
        console.log(this.chats);
      }
    );
  }

  addTemporyChat(chat: Chat) {
    this.chats.unshift(chat);
    this.chats = this.chats.slice();
  }
}
