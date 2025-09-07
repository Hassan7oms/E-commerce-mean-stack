import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewsManagement } from './reviews-management';

describe('ReviewsManagement', () => {
  let component: ReviewsManagement;
  let fixture: ComponentFixture<ReviewsManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewsManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewsManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
