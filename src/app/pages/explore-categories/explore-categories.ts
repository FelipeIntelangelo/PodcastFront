import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Category } from '../../models/enums/category.enum';

@Component({
  selector: 'app-explore-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './explore-categories.html',
  styleUrls: ['./explore-categories.css']
})
export class ExploreCategories {
  categories = Object.values(Category) as string[];

  constructor(private router: Router) {}

  goToCategory(cat: string): void {
    this.router.navigate(['/explore', cat]);
  }
}
