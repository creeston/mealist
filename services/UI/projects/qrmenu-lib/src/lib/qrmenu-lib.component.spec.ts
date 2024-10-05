import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrmenuLibComponent } from './qrmenu-lib.component';

describe('QrmenuLibComponent', () => {
  let component: QrmenuLibComponent;
  let fixture: ComponentFixture<QrmenuLibComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrmenuLibComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QrmenuLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
