import { TestBed } from '@angular/core/testing';

import { QrmenuLibService } from './qrmenu-lib.service';

describe('QrmenuLibService', () => {
  let service: QrmenuLibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QrmenuLibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
