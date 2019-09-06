import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
import {Subject, throwError} from 'rxjs';
import {User} from './auth.model';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
}

@Injectable({providedIn: 'root'})

export class AuthService {
 constructor( private http: HttpClient) {}
 // "auth != null"
 user = new Subject<User>();

 signup( email: string, password: string) {
   return this.http.post<AuthResponseData>(
     'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key= AIzaSyBKsxIOvxjTJSTYKdwdY2W_k-2gPAoXuno ',
     {
       email,
       password,
       returnSecureToken: true
     }
   ).pipe(
     catchError(this.handleError),
/*     tap( resData => {
       this.handleAuthentification(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
     })*/
   );
 }

 login( email: string, password: string) {
   return this.http.post<AuthResponseData>(
     'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key= AIzaSyBKsxIOvxjTJSTYKdwdY2W_k-2gPAoXuno',
     {
       email,
       password,
       returnSecureToken: true
     }
   ).pipe(
     catchError(this.handleError)
   );
 }

 private handleAuthentification(
   email: string,
   id: string,
   token: string,
   expiresIn: number
 ) {
   const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
   const user = new User(email, id, token, expirationDate);
   this.user.next(user);
 }

 private handleError(errorRes: HttpErrorResponse) {
   let errorMessage = 'An unknown error has occurred';
   if (!errorRes.error || !errorRes.error.error) {
     return throwError(errorMessage);
   }
   switch (errorRes.error.error.message) {
     case 'EMAIL_EXISTS':
       errorMessage = 'This email exists already';
       break;
     case 'EMAIL_NOT_FOUND':
       errorMessage = 'This email was not found';
       break;
     case 'INVALID_PASSWORD':
       errorMessage = 'Invalid password';
       break;
   }
   return throwError(errorMessage);
 }
}
