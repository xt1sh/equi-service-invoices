import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private $isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  isLoading: Observable<boolean> = this.$isLoading.asObservable();

  constructor() { }

  changeLoading(state: boolean) {
    this.$isLoading.next(state);
  }

}
