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

    // Toast específico para sesión expirada
    sessionExpiredAlert(){
        Swal.fire({
            title: "Tu sesión expiró",
            icon: "warning",
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000
        });
    }

    // Confirmación para eliminar podcast
    confirmDeletePodcast(): Promise<boolean> {
        return Swal.fire({
            title: "¿Estás seguro?",
            text: "No podrás revertir esta acción",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#9D65D7",
            cancelButtonColor: "#dc3545",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            return result.isConfirmed;
        });
    }

    // Alert de eliminación exitosa
    deletePodcastSuccess(){
        Swal.fire({
            title: "¡Eliminado!",
            text: "El podcast ha sido eliminado exitosamente",
            icon: "success",
            showConfirmButton: false,
            timer: 2000
        });
    }

    // Alert de error al eliminar
    deletePodcastError(){
        Swal.fire({
            title: "Error al eliminar",
            text: "No se pudo eliminar el podcast",
            icon: "error",
            showConfirmButton: false,
            timer: 2000
        });
    }
}
