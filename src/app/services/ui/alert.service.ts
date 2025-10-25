import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
    providedIn: 'root' 
})

export class AlertService {

    successAlert(){
        Swal.fire({
            title: "Registration Successful!",
            icon: "success",
            draggable: true,
            showConfirmButton: false,
            theme: 'dark',
            timer: 1500
        });
    }

    errorAlert(){
        Swal.fire({
            title: "Registration Failed!",
            icon: "error",
            draggable: true,
            showConfirmButton: false,
            theme: 'dark',
            timer: 1500
        });
    }

    questionAlert(){
        Swal.fire({
            title: "The Internet?",
            text: "That thing is still around?",
            icon: "question",
            showConfirmButton: false,
            theme: 'dark',
            timer: 1500
        });
    }

    warningAlert(){
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            theme: 'dark',
            showCancelButton: true,
            confirmButtonColor: "#3d6e37ff",
            cancelButtonColor: "rgba(187, 49, 49, 1)",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                    Swal.fire({
                    title: "Deleted!",
                    text: "Your file has been deleted.",
                    icon: "success"
                });
            }
        });
    }
}
