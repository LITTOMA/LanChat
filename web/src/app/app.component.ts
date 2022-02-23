import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { UserService } from './user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  title = 'LanChat';

  // constructor
  constructor(
    private http: HttpClient,
    private userService: UserService
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
}
