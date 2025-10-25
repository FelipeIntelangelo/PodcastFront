import Swal from 'sweetalert2';

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