import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
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
    this.chatService.getChats().subscribe(
      (chats: Chat[]) => {
        this.chats = chats;
      }
    );
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
    this.chatService.deleteChat(chat);
    this.chatService.getChats().subscribe(
      (chats: Chat[]) => {
        this.chats = chats;
      }
    );
  }
}
