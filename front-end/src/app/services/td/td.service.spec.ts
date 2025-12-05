import { TestBed } from '@angular/core/testing';

import { TdService } from './td.service';

describe('TdService', () => {
  let service: TdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
