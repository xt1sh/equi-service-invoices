import { NotificationService } from './../../services/notification.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent implements OnInit {

  isLoading: boolean;

  constructor(private notificationService: NotificationService) { }

  ngOnInit() {
    this.notificationService.isLoading.subscribe(load => this.isLoading = load);
  }

}
