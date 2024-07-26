import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/users'; // Adjust this URL to match your server

  constructor(private http: HttpClient) { }

  createUser(userData: any): Observable<any> {
    console.log("userData", userData);
    return this.http.post(this.apiUrl, userData);
  }

  getUsers(){
    return this.http.get(this.apiUrl);
  }

  getUser(userId: number){
    return this.http.get(this.apiUrl + `/${userId}`)
  }

  deleteUser(userId: number){
    return this.http.delete(this.apiUrl + `/${userId}`);
  }

  updateUser(updatedData: User){
    return this.http.put(this.apiUrl + `/${updatedData.id}`, updatedData);
  }
}