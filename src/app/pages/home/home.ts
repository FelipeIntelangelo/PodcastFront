import { Component } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  SuccessAlert(){
    Swal.fire({
      title: "Registration Successful!",
      icon: "success",
      draggable: true,
      showConfirmButton: false,
      theme: 'dark',
      timer: 1500
    });
  }
}
