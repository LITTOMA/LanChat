import { NgModule, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from '../material.module';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChatListComponent } from './chat-list/chat-list.component';
import { UserService } from './user.service';


@NgModule({
  declarations: [
    AppComponent,
    ChatListComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    MaterialModule,
    RouterModule.forRoot([
      { path: '', component: ChatListComponent }
    ])
  ],
  providers: [UserService],
  bootstrap: [AppComponent]
})
export class AppModule implements OnInit {
  ngOnInit(): void {
    
  }
}
