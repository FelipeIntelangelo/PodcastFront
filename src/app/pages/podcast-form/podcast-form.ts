import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Podcast } from '../../models/podcast/podcast';
import { Category } from '../../models/enums/category.enum';
import { FormError } from '../../components/shared/form-error/form-error';
import { CloudinaryUploadComponent } from '../../components/shared/cloudinary-upload/cloudinary-upload';

@Component({
  selector: 'app-podcast-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormError, CloudinaryUploadComponent],
  templateUrl: './podcast-form.html',
  styleUrls: ['./podcast-form.css']
})
export class PodcastFormComponent implements OnInit, OnChanges {
  @Input() podcast: Podcast | null = null;
  @Input() isSubmitting = false;
  @Input() errorMessage: string | null = null;
  @Output() formSubmit = new EventEmitter<any>();

  podcastForm!: FormGroup;
  categoryKeys: string[] = [];
  @ViewChild('imageUp') imageUp?: CloudinaryUploadComponent;

  customErrors = {
    title: {
      required: 'El título es obligatorio.',
      minlength: 'El título debe tener al menos 3 caracteres.',
      maxlength: 'El título no puede tener más de 100 caracteres.'
    },
    description: {
      required: 'La descripción es obligatoria.',
      minlength: 'La descripción debe tener al menos 10 caracteres.'
    },
    categories: {
      required: 'Debe seleccionar al menos una categoría.'
    }
  };

  constructor(private fb: FormBuilder) {
    this.categoryKeys = Object.keys(Category);
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['podcast'] && this.podcastForm) {
      this.updateForm();
    }
  }

  private initForm(): void {
    this.podcastForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      imageUrl: [''],
      categories: this.buildCategories()
    });
  }

  private updateForm(): void {
    if (this.podcast) {
      this.podcastForm.patchValue({
        title: this.podcast.title,
        description: this.podcast.description,
        imageUrl: this.podcast.imageUrl
      });
      this.updateCategories();
    }
  }

  private buildCategories(): FormArray {
    const categories = this.categoryKeys.map(category => 
      this.fb.control(this.podcast?.categories.includes(category as Category) || false)
    );
    return this.fb.array(categories, Validators.required);
  }

  private updateCategories(): void {
    this.categories.controls.forEach((control, i) => {
      const category = this.categoryKeys[i] as Category;
      control.setValue(this.podcast?.categories.includes(category) || false);
    });
  }

  get categories(): FormArray {
    return this.podcastForm.get('categories') as FormArray;
  }

  onImageUploaded(url: string): void {
    this.podcastForm.patchValue({ imageUrl: url });
  }

  onUploadError(error: string): void {
    console.error('Upload error:', error);
    // Aquí podrías mostrar un mensaje al usuario
  }

  async onSubmit(): Promise<void> {
    if (this.podcastForm.valid) {
      const selectedCategories = this.podcastForm.value.categories
        .map((checked: boolean, i: number) => checked ? this.categoryKeys[i] : null)
        .filter((value: string | null) => value !== null);

      if (selectedCategories.length === 0) {
        this.categories.setErrors({ required: true });
        return;
      }

      // Subida diferida de imagen si el usuario seleccionó un archivo
      try {
        if (this.imageUp && this.imageUp.hasFileSelected()) {
          const imgUrl = await this.imageUp.performUpload();
          this.podcastForm.patchValue({ imageUrl: imgUrl });
        }
      } catch (e) {
        return; // el uploader ya mostró el error
      }

      const formValue = {
        ...this.podcastForm.value,
        categories: selectedCategories
      };
      this.formSubmit.emit(formValue);
    } else {
      this.podcastForm.markAllAsTouched();
    }
  }
}