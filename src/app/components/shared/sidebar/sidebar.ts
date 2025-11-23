import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  @Input() navItems: NavItem[] = [
    { label: 'Home', route: '/', icon: 'fas fa-home' },
    { label: 'Explore', route: '/explore', icon: 'fas fa-compass' },
    { label: 'Favorites', route: '/favorites', icon: 'fas fa-heart' },
    { label: 'History', route: '/history', icon: 'fas fa-history' }
  ];
}
