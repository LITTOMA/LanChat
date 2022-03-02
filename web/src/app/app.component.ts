import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ChatService } from './chat.service';
import { UserService } from './user.service';
import { Chat } from '../chat';
import { ChatListComponent } from './chat-list/chat-list.component';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  title = 'LanChat';
  chatContent: string = '';
  qrdata: string = '';
  qrCodeVisible: boolean = false;

  @ViewChild('chatList', { static: true })
  chatList!: ChatListComponent;

  // constructor
  constructor(
    private http: HttpClient,
    private chatService: ChatService,
    private userService: UserService,
    private qrDialog: MatDialog,
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
        console.log(admin);
        console.log(redirect);

        // redirect with access key
        if (redirect) {
          window.location.href = `/?k=${accessKey}`;
        }
        else {
          if (admin.joinUrl) {
            // show qrcode button
            this.qrCodeVisible = true;

            // set qrcode as url to current page
            this.qrdata = admin.joinUrl;
          } else {
            // hide qrcode button
            this.qrCodeVisible = false;
          }
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

  onKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'Enter') {
      this.chatContent += '\n';
    }
    else if (event.key === 'Enter') {
      event.preventDefault();
      this.postChat();
    }
  }

  openFile() {

  }

  showQrCode() {
    this.qrDialog.open(QrCodeDialog, {
      data: {
        qrdata: this.qrdata
      }
    });
  }

  postChat() {
    // ignore empty message
    if (this.chatContent === '') {
      return;
    }

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

@Component({
  selector: 'app-qr-code-dialog',
  template: `
    <h1 mat-dialog-title>Scan QR Code To Join</h1>
    <div mat-dialog-content>
      <qrcode [qrdata]="qrdata" [width]="200"></qrcode>
      <a href="{{qrdata}}" target="_blank">Join</a>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class QrCodeDialog {
  qrdata: string;
  level: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    console.log(data);
    this.qrdata = data.qrdata;
    this.level = data.level;
  }
}
