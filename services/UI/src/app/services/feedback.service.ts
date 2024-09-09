import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Globals } from '../globals';
import { environment } from '../../environments/environment';

@Injectable()
export class FeedbackService {
  jwt: string | null = null;
  constructor(public globals: Globals, private http: HttpClient) {}

  sendFeedback(text: string, email: string) {
    return this.http.post(
      environment.apiUrl + '/api/SendFeedback/',
      { text, email },
      this.createHttpOptions()
    );
  }

  createHttpOptions(): any {
    return {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
  }
}
