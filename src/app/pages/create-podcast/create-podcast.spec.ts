import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePodcast } from './create-podcast';

describe('CreatePodcast', () => {
  let component: CreatePodcast;
  let fixture: ComponentFixture<CreatePodcast>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePodcast]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePodcast);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
