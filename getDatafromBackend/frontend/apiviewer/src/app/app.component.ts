import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HttpClientModule,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'apiviewer';
  apiResponse : any = [];
  constructor (private http : HttpClient) {
    http.get('/api/v1/jokes').subscribe((response) => {
      console.log(response);
      this.apiResponse = response;
  })

  }
}
