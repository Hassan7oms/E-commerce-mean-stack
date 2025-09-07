import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WomenPage } from './women-page';

describe('WomenPage', () => {
  let component: WomenPage;
  let fixture: ComponentFixture<WomenPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WomenPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WomenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
