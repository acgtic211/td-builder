import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TdSearchComponent } from './td-search.component';

describe('TdSearchComponent', () => {
  let component: TdSearchComponent;
  let fixture: ComponentFixture<TdSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TdSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TdSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
