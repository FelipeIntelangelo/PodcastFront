import { Component, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AlertService } from '../../services/ui/alert.service';

interface CarouselState {
  hasBeenClicked: boolean;
  atStart: boolean;
  atEnd: boolean;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements AfterViewInit {
  @ViewChild('novedadesWrapper') novedadesWrapper!: ElementRef<HTMLElement>;
  // Add other @ViewChild decorators for other carousels here

  carousels: { [key: string]: CarouselState } = {
    novedades: { hasBeenClicked: false, atStart: true, atEnd: false },
    // masEscuchados: { hasBeenClicked: false, atStart: true, atEnd: false },
  };

  constructor(private alertService: AlertService) {}

  ngAfterViewInit() {
    // Check initial state after view is initialized
    this.handleScroll('novedades', this.novedadesWrapper.nativeElement);
  }

  @HostListener('window:resize')
  onResize() {
    // Re-check scroll state on window resize
    this.handleScroll('novedades', this.novedadesWrapper.nativeElement);
  }

  handleScroll(carouselKey: string, element: HTMLElement): void {
    if (!element) return;
    const carousel = this.carousels[carouselKey];
    if (!carousel) return;

    // A small tolerance for floating point inaccuracies
    const tolerance = 5;
    carousel.atStart = element.scrollLeft <= tolerance;
    carousel.atEnd = element.scrollLeft + element.clientWidth >= element.scrollWidth - tolerance;
  }

  onArrowClick(carouselKey: string): void {
    this.carousels[carouselKey].hasBeenClicked = true;
    this.goNext(carouselKey);
  }

  goNext(carouselKey: string): void {
    const element = this.getWrapperElement(carouselKey);
    if (element) {
      // Scroll by 80% of the viewport width for a smoother multi-item scroll
      const scrollAmount = element.clientWidth * 0.8;
      element.scrollLeft += scrollAmount;
    }
  }

  goBack(carouselKey: string): void {
    const element = this.getWrapperElement(carouselKey);
    if (element) {
      const scrollAmount = element.clientWidth * 0.8;
      element.scrollLeft -= scrollAmount;
    }
  }

  private getWrapperElement(key: string): HTMLElement | null {
    if (key === 'novedades' && this.novedadesWrapper) {
      return this.novedadesWrapper.nativeElement;
    }
    // Add other carousels here, e.g.:
    // if (key === 'masEscuchados' && this.masEscuchadosWrapper) {
    //   return this.masEscuchadosWrapper.nativeElement;
    // }
    return null;
  }
}
