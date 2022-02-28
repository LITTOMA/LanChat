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
    // refresh chat list every 3 seconds
    setInterval(() => {
      this.refreshChatList();
    }
    , 3000);
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

  refreshChatList() {
    this.chatService.getChats().subscribe(
      (chats: Chat[]) => {
        this.chats = chats;
      }
    );
  }
}
