import { Injectable } from '@angular/core';
import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

@Injectable({
    providedIn: 'root' 
})
export class AlertService {
// Opciones base reutilizables
private baseOptions: SweetAlertOptions = {
    showConfirmButton: false,
    timer: 1500
};

// Alerts básicos
success(title = 'Operación exitosa', options?: SweetAlertOptions) {
    const merged = { ...this.baseOptions, icon: 'success', title, ...(options || {}) } as unknown as SweetAlertOptions;
    return Swal.fire(merged);
}

error(title = 'Ocurrió un error', options?: SweetAlertOptions) {
    const merged = { ...this.baseOptions, icon: 'error', title, ...(options || {}) } as unknown as SweetAlertOptions;
    return Swal.fire(merged);
}

info(title = 'Información', options?: SweetAlertOptions) {
    const merged = { ...this.baseOptions, icon: 'info', title, ...(options || {}) } as unknown as SweetAlertOptions;
    return Swal.fire(merged);
}

// Confirmación con botones
confirm(options?: SweetAlertOptions): Promise<SweetAlertResult<any>> {
    const defaults: SweetAlertOptions = {
        icon: 'question',
        title: '¿Estás seguro?',
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar'
    };
    const merged = { ...defaults, ...(options || {}) } as unknown as SweetAlertOptions;
    return Swal.fire(merged);
}

// Variante toast (arriba a la derecha)
toastSuccess(title = 'Listo', options?: SweetAlertOptions) {
    const defaults: SweetAlertOptions = {
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        icon: 'success',
        title
    };
    const merged = { ...defaults, ...(options || {}) } as unknown as SweetAlertOptions;
    return Swal.fire(merged);
}
}
