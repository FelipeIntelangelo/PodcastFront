import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AlertService } from '../../services/ui/alert.service';

interface CarouselState {
  currentIndex: number;
  hasBeenClicked: boolean;
  itemsPerView: number;
  totalItems: number;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})

export class Home {
  carousels: { [key: string]: CarouselState } = {
    novedades: { currentIndex: 0, hasBeenClicked: false, itemsPerView: 4, totalItems: 16 },
    masEscuchados: { currentIndex: 0, hasBeenClicked: false, itemsPerView: 4, totalItems: 16 },
    mejorCalificados: { currentIndex: 0, hasBeenClicked: false, itemsPerView: 4, totalItems: 16 },
    misFavoritos: { currentIndex: 0, hasBeenClicked: false, itemsPerView: 4, totalItems: 16 }
  };

  constructor(private alertService : AlertService){}

  alertaTrue(){
    this.alertService.warningAlert();
  }

  onArrowClick(carouselKey: string): void {
    this.carousels[carouselKey].hasBeenClicked = true;
    this.goNext(carouselKey);
  }

  goNext(carouselKey: string): void {
    const carousel = this.carousels[carouselKey];
    if (carousel.currentIndex + carousel.itemsPerView < carousel.totalItems) {
      carousel.currentIndex++;
    }
  }

  goBack(carouselKey: string): void {
    const carousel = this.carousels[carouselKey];
    if (carousel.currentIndex > 0) {
      carousel.currentIndex--;
    }
  }

  isAtEnd(carouselKey: string): boolean {
    const carousel = this.carousels[carouselKey];
    return carousel.currentIndex + carousel.itemsPerView >= carousel.totalItems;
  }

  getCarouselTranslate(carouselKey: string): string {
    const carousel = this.carousels[carouselKey];
    const cardWidth = 100 / carousel.itemsPerView;
    return `translateX(-${carousel.currentIndex * cardWidth}%)`;
  }

}
