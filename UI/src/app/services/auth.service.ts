import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Globals } from '../globals';
import { environment } from '../../environments/environment';

export class UserProfile {
  constructor() {}

  public email: string = '';
  public userId: string = '';
  public role: string = '';
  public featuresToLearn: string[] = [];
  public mlAnalysisCount: number = 0;
  public humanReviewCount: number = 0;
}

@Injectable()
export class AuthenticationService {
  constructor(
    public globals: Globals,
    private http: HttpClient,
    private cookie: CookieService
  ) {}

  register(email: string, password: string, confirmCode: string) {
    return this.http.post(
      environment.apiUrl + '/api/Register',
      { email, password, confirmCode },
      { responseType: 'text' }
    );
  }

  signIn(email: string, password: string) {
    return this.http.post(
      environment.apiUrl + '/api/Auth',
      { email, password },
      { responseType: 'text' }
    );
  }

  getGoogleToken(code: string) {
    return this.http
      .get(
        environment.apiUrl +
          '/api/GetGoogleToken?code=' +
          code +
          '&redirect_url=' +
          environment.selfUrl +
          '/GoogleCallback',
        { responseType: 'text' }
      )
      .pipe(
        map((token: string) => {
          return token;
        })
      );
  }

  getUserProfile(jwt: String) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + jwt,
      }),
    };

    return this.http
      .post(environment.apiUrl + '/api/GetUserProfile', {}, httpOptions)
      .pipe(
        map((r) => {
          let profile = r as UserProfile;
          this.globals.email = profile.email;
          this.globals.userId = profile.userId;
          this.globals.role = profile.role;
          this.globals.userProfile = profile;
          return r;
        })
      );
  }

  createHttpOptions(): any {
    let jwt = this.cookie.get('ApiJwt');
    if (jwt) {
      return {
        headers: new HttpHeaders({ Authorization: 'Bearer ' + jwt }),
      };
    } else {
      throw new Error('JWT token not found in cookies');
    }
  }

  setFeaturesToLearn(features: string[]) {
    let httpOptions = this.createHttpOptions();
    return this.http.post(
      environment.apiUrl + '/api/SetFeaturesToLearn',
      features.join(','),
      httpOptions
    );
  }

  checkCode(email: string, code: string) {
    return this.http.post(
      environment.apiUrl + '/api/CheckCode',
      { email, code },
      { responseType: 'text' }
    );
  }

  changePassword(email: string, password: string, code: string) {
    return this.http.post(
      environment.apiUrl + '/api/ResetPassword',
      { email, password, code },
      { responseType: 'text' }
    );
  }

  sendCode(email: string) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    return this.http.post(
      environment.apiUrl + '/api/SendCode',
      { email },
      httpOptions
    );
  }
}
