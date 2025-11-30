import { TestBed } from '@angular/core/testing';

import { DesplegablesService } from './desplegables.service';

describe('DesplegablesService', () => {
  let service: DesplegablesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DesplegablesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
