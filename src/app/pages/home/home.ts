import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { AlertService } from '../../services/ui/alert.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css'
})

export class Home {
  constructor(private alertService : AlertService){}

  alertaTrue(){
    this.alertService.warningAlert();
  }

}
